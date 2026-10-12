import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { synthesizeRule } from './src/lib/ruleCopilotSynthesizer.js';
import { generateCaseRecommendation } from './src/lib/caseRecommendationEngine.js';

dotenv.config();

const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of GoogleGenAI with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/copilot/case-recommendation', async (req: Request, res: Response) => {
  try {
    const { caseData, domain, customContext } = req.body;
    
    // Fast intelligent baseline
    const baseRec = generateCaseRecommendation(caseData, domain);

    // If GEMINI_API_KEY is available, enrich with LLM insights
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && caseData) {
      try {
        const promptText = `Anda adalah Senior Fraud & AML Case Investigator di Bank Sahabat Sampoerna (BSS) untuk Neo FMS v1.22.
Tugas Anda adalah menelaah kasus transaksi berikut dan memberikan rekomendasi keputusan investigasi, durasi blokir, dan draf komentar naratif reviewer.

Kasus:
- Domain: ${domain || caseData.alertCategory}
- Case ID: ${caseData.caseId || caseData.id}
- CIF: ${caseData.cif} (${caseData.customerName})
- Nominal Transaksi: Rp ${caseData.transaction?.amount || 0}
- Channel: ${caseData.transaction?.channel}
- Bank/Rek Tujuan: ${caseData.transaction?.destinationBank} (${caseData.transaction?.destinationAccount})
- Skor Risiko: ${caseData.finalRiskScore || caseData.baseScore}
- Rule Terpicu: ${caseData.ruleName}
- Catatan Tambahan: ${customContext || 'Tidak ada'}

Hasilkan analisis ringkas dan narasi formal perbankan dalam format JSON:
{
  "summaryAnalysis": "1-2 kalimat ringkasan analisis cerdas",
  "recommendedScenarioId": "temp_block" | "permanent_block" | "false_positive",
  "primaryConfidence": 94,
  "suggestedReviewerComment": "Draf komentar formal lengkap mencakup fakta, anomali, dan SOP"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: promptText }]
            }
          ],
          config: {
            responseMimeType: 'application/json',
          }
        });

        const outputText = response.text || '';
        const parsed = JSON.parse(outputText);
        if (parsed.suggestedReviewerComment) {
          const recScenario = baseRec.scenarios.find(s => s.id === (parsed.recommendedScenarioId || baseRec.recommendedScenarioId)) || baseRec.scenarios[0];
          recScenario.suggestedComment = parsed.suggestedReviewerComment;
          if (parsed.summaryAnalysis) baseRec.summaryAnalysis = parsed.summaryAnalysis;
          if (parsed.primaryConfidence) baseRec.primaryConfidence = Number(parsed.primaryConfidence);
        }
        return res.json({ success: true, data: baseRec, source: 'gemini-3.8-flash' });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed for case recommendation, using deterministic engine:', geminiError?.message || geminiError);
      }
    }

    return res.json({ success: true, data: baseRec, source: 'fms-case-recommendation-engine' });
  } catch (err: any) {
    console.error('Error in case recommendation endpoint:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.post('/api/copilot/generate-rule', async (req: Request, res: Response) => {
  try {
    const { prompt, domain, currentCode } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // If GEMINI_API_KEY is configured, call Gemini 3.8 Flash model
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const systemInstruction = `Anda adalah AI Lead Fraud & AML Rule Architect untuk Neo FMS v1.22 di Bank Sahabat Sampoerna (BSS).
Tugas Anda adalah menerima deskripsi skenario kejahatan/anomali perbankan dalam bahasa alami dan menghasilkan blueprint Rule Template yang presisi, efisien, dan siap pakai.

Database Schema (Tabel 'transactions'):
- trx_id (VARCHAR): ID unik transaksi
- cif (VARCHAR): Customer Identification File
- source_account (VARCHAR): Nomor rekening asal
- source_account_name (VARCHAR): Nama pemilik rekening asal
- destination_account (VARCHAR): Nomor rekening tujuan
- beneficiary_name (VARCHAR): Nama penerima
- destination_bank (VARCHAR): Bank tujuan
- amount (NUMERIC): Nominal transaksi dalam Rupiah (IDR)
- currency (VARCHAR): Mata uang ('IDR')
- channel (VARCHAR): Saluran transaksi ('MB', 'OB', 'VA', 'QRIS', 'CARD')
- ip_address (VARCHAR): Alamat IP nasabah
- location_lat, location_lon (NUMERIC): Koordinat geolokasi transaksi
- device_id (VARCHAR): ID perangkat / IMEI / UUID
- timestamp (TIMESTAMP): Waktu transaksi
- status (VARCHAR): Status transaksi ('SUCCESS', 'PENDING', 'FAILED', 'BLOCKED')
- trx_type (VARCHAR): Jenis transaksi ('TRANSFER', 'PAYMENT', 'TOPUP', 'WITHDRAWAL')

Aturan Pembuatan Template:
1. Syntax Query: Gunakan dialek PostgreSQL / SQL standar perbankan yang valid.
2. Parameter Placeholders: Seluruh nilai ambang batas dinamis WAJIB dibungkus dengan format {{NAMA_VARIABEL}} (misal: {{THRESHOLD_AMOUNT}}, {{TIME_WINDOW_MINUTES}}, {{MAX_FREQUENCY}}, {{GEO_RADIUS_KM}}, dll).
3. Ekstraksi Placeholders: Ekstrak setiap placeholder menjadi objek VariablePlaceholder lengkap dengan key, label (Bahasa Indonesia), dataType ('Number'|'String'|'Boolean'|'Enum'), defaultValue, unit, dan description.
4. Syntax Audit & Performance: Lakukan analisa potensi bottleneck (misal: index requirement, window function, full table scan) dan berikan saran optimasi indeks.
5. Technical Summary: Buat ringkasan teknis komprehensif dalam Bahasa Indonesia formal untuk review L2 Checker.
6. Guardrail: Hasil ini adalah Draft Unverified untuk L1 Maker dan wajib divalidasi manual.

Format Response WAJIB JSON murni persis seperti ini:
{
  "name": "Nama Template Rule yang Profesional",
  "domain": "Fraud" atau "AML",
  "category": "Kategori kejahatan",
  "queryLogic": "SQL query lengkap dengan tag {{PLACEHOLDER}}",
  "parameters": [
    {
      "id": "param-1",
      "key": "{{KEY_NAME}}",
      "label": "Label Indonesia",
      "dataType": "Number",
      "defaultValue": 50000000,
      "unit": "IDR",
      "description": "Penjelasan fungsi parameter"
    }
  ],
  "technicalSummary": "Penjelasan teknis lengkap alur kuari dan indikasi kejahatan dalam Bahasa Indonesia untuk L2 Checker",
  "syntaxAudit": {
    "status": "OPTIMAL",
    "efficiencyScore": 94,
    "bottleneckRisks": ["Potensi bottleneck 1"],
    "optimizationTips": ["Rekomendasi indeks 1"]
  }
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemInstruction },
                { text: `Deskripsi Skenario dari Pengguna:\n"${prompt}"\nTarget Domain: ${domain || 'Auto-detect'}\nTemplate Code: ${currentCode || 'TPL-NEW'}\n\nHasilkan blueprint Rule Template dalam format JSON:` }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json',
          }
        });

        const textOutput = response.text || '';
        const parsed = JSON.parse(textOutput);
        return res.json({ success: true, data: parsed, source: 'gemini-3.8-flash' });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to rule synthesizer:', geminiError?.message || geminiError);
      }
    }

    // Built-in intelligent rule synthesis fallback
    const fallbackData = synthesizeRule(prompt, domain);
    return res.json({ success: true, data: fallbackData, source: 'fms-rule-synthesizer' });
  } catch (err: any) {
    console.error('Error generating rule:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Vite Middleware mounting
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(currentDir, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(currentDir, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Neo FMS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
