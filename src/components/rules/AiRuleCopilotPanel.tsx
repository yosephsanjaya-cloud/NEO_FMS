import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Code2, 
  Info, 
  Copy, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert, 
  Database, 
  Zap, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { RuleDomain, VariablePlaceholder, AiCopilotMetadata } from '../../types/fms';
import { synthesizeRule, AiCopilotResult } from '../../lib/ruleCopilotSynthesizer';

interface AiRuleCopilotPanelProps {
  currentDomain: RuleDomain;
  currentCode: string;
  onApplyToTemplate: (generated: {
    name: string;
    domain: RuleDomain;
    description: string;
    queryLogic: string;
    parameters: VariablePlaceholder[];
    aiMetadata: AiCopilotMetadata;
  }) => void;
  onClose?: () => void;
}

const EXAMPLE_PROMPTS = [
  {
    label: '⚡ Velocity Burst (MB)',
    domain: 'Fraud' as RuleDomain,
    text: 'Cari transaksi MB di atas 50 juta dari IP luar negeri yang terjadi lebih dari 3 kali dalam 5 menit'
  },
  {
    label: '🏦 Virtual Account Mule',
    domain: 'Fraud' as RuleDomain,
    text: 'Deteksi indikasi akun mule Virtual Account: dana masuk dan langsung ditransfer keluar dalam rentang 10 menit dengan rasio penarikan di atas 85%'
  },
  {
    label: '🕵️ AML Smurfing & Structuring',
    domain: 'AML' as RuleDomain,
    text: 'Pola smurfing AML: transaksi berturut-turut sedikit di bawah threshold 100 juta dalam 24 jam dengan total akumulasi mencurigakan'
  },
  {
    label: '📍 Impossible Travel (Geo)',
    domain: 'Fraud' as RuleDomain,
    text: 'Geo-anomaly: transaksi berturut-turut dari 2 lokasi berbeda dengan jarak lebih dari 150 km dalam selisih waktu kurang dari 30 menit'
  },
  {
    label: '📱 Multi-Account Device Ring',
    domain: 'Fraud' as RuleDomain,
    text: 'Deteksi sindikat peretasan: 1 device ID fisik digunakan untuk transaksi lebih dari 3 CIF nasabah berbeda dalam 24 jam'
  }
];

export const AiRuleCopilotPanel: React.FC<AiRuleCopilotPanelProps> = ({
  currentDomain,
  currentCode,
  onApplyToTemplate,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [targetDomain, setTargetDomain] = useState<RuleDomain | 'AUTO'>(currentDomain);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [result, setResult] = useState<AiCopilotResult | null>(null);
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [apiSource, setApiSource] = useState<string>('');

  const handleGenerate = async (textToUse?: string) => {
    const inputPrompt = (textToUse || prompt).trim();
    if (!inputPrompt) return;

    setIsGenerating(true);
    setHasApplied(false);
    setGenerationStep('Menganalisis skenario kejahatan perbankan...');

    try {
      // Step simulation for rich user feedback
      setTimeout(() => setGenerationStep('Mengekstraksi variabel & ambang batas dinamis...'), 400);
      setTimeout(() => setGenerationStep('Menyusun sintaks kuari database & audit performa...'), 800);

      // Try calling server-side API endpoint first
      let generatedData: AiCopilotResult | null = null;
      let usedSource = 'Client Synthesizer';

      try {
        const response = await fetch('/api/copilot/generate-rule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: inputPrompt,
            domain: targetDomain === 'AUTO' ? undefined : targetDomain,
            currentCode
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            generatedData = {
              ...resJson.data,
              prompt: inputPrompt,
              generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
              guardrailNotice: 'Draft buatan AI Copilot. Wajib diverifikasi secara manual oleh L1 Maker dan lulus uji Backtesting sebelum diajukan ke L2 Checker.'
            };
            usedSource = resJson.source || 'Server API';
          }
        }
      } catch (networkErr) {
        // Server fetch failed, use local intelligent synthesizer
        console.info('Using client rule synthesizer fallback');
      }

      // If server response wasn't used or failed, use local synthesizer
      if (!generatedData) {
        const domainToPass = targetDomain === 'AUTO' ? undefined : targetDomain;
        generatedData = synthesizeRule(inputPrompt, domainToPass);
        usedSource = 'FMS Rule Synthesizer Engine';
      }

      // Wait a moment for seamless UI feel
      await new Promise(r => setTimeout(r, 600));

      setResult(generatedData);
      setApiSource(usedSource);
    } catch (err) {
      console.error('Error during AI rule generation:', err);
      // Fallback
      const fallback = synthesizeRule(inputPrompt, targetDomain === 'AUTO' ? undefined : targetDomain);
      setResult(fallback);
      setApiSource('FMS Rule Synthesizer Fallback');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleCopyQuery = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.queryLogic);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  const handleApply = () => {
    if (!result) return;

    const aiMetadata: AiCopilotMetadata = {
      isAiGenerated: true,
      prompt: result.prompt,
      generatedAt: result.generatedAt,
      technicalSummary: result.technicalSummary,
      category: result.category,
      efficiencyScore: result.syntaxAudit.efficiencyScore,
      bottleneckRisks: result.syntaxAudit.bottleneckRisks,
      optimizationTips: result.syntaxAudit.optimizationTips,
      suggestedPlaceholders: result.parameters,
      verifiedByMaker: true // Maker is applying it, acknowledging review
    };

    onApplyToTemplate({
      name: result.name,
      domain: result.domain,
      description: result.technicalSummary,
      queryLogic: result.queryLogic,
      parameters: result.parameters,
      aiMetadata
    });

    setHasApplied(true);
  };

  return (
    <div className="bg-gradient-to-b from-indigo-950/10 via-slate-900/5 to-blue-950/10 border-2 border-indigo-200/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 transition-all">
      
      {/* Top Banner / Heading */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                AI Rule Copilot Assistant
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                Neo FMS v1.22
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Ubah deskripsi kasus fraud / AML bahasa alami menjadi sintaks query database dan placeholder otomatis.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
          >
            Tutup Panel
          </button>
        )}
      </div>

      {/* Input Form Area */}
      <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Deskripsikan Indikasi / Skenario Kejahatan:</span>
          </label>
          
          {/* Target Domain Selector */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 mr-1">Target Engine:</span>
            <button
              type="button"
              onClick={() => setTargetDomain('AUTO')}
              className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                targetDomain === 'AUTO' 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Auto Detect
            </button>
            <button
              type="button"
              onClick={() => setTargetDomain('Fraud')}
              className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                targetDomain === 'Fraud' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Fraud
            </button>
            <button
              type="button"
              onClick={() => setTargetDomain('AML')}
              className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                targetDomain === 'AML' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              AML
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="Contoh: Cari transaksi MB di atas 50 juta dari IP luar negeri yang terjadi lebih dari 3 kali dalam 5 menit..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Example Prompt Chips */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Atau pilih contoh skenario tipologi siap pakai:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(ex.text);
                  setTargetDomain(ex.domain);
                  handleGenerate(ex.text);
                }}
                disabled={isGenerating}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 transition cursor-pointer text-left"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>Mendukung ekstraksi otomatis variabel {'{{THRESHOLD}}'}, interval waktu, dan channel.</span>
          </div>

          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-800 text-white font-semibold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50 transition cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate dengan AI Copilot</span>
              </>
            )}
          </button>
        </div>

        {/* Progress status */}
        {isGenerating && generationStep && (
          <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200 flex items-center gap-2 text-indigo-700 text-xs animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span className="font-semibold">{generationStep}</span>
          </div>
        )}
      </div>

      {/* Generated Result Section */}
      {result && !isGenerating && (
        <div className="space-y-4 pt-2">
          
          {/* Dual Control Guardrail Alert */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>Status: Draft (Unverified by Maker L1)</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono text-[9px] uppercase">
                  Maker-Checker Guardrail
                </span>
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Hasil AI Copilot adalah rancangan draf awal untuk Maker L1. AI <strong>tidak memiliki wewenang</strong> untuk mengaktifkan template secara langsung. Maker L1 wajib meninjau query dan menguji di <strong>Rule Backtesting</strong> sebelum diajukan ke L2 Checker.
              </p>
            </div>
          </div>

          {/* Metadata Card: Name, Category, Domain */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Rekomendasi Nama Template
                </span>
                <h5 className="font-bold text-slate-900 text-xs">{result.name}</h5>
              </div>
              
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  result.domain === 'AML'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                }`}>
                  {result.domain} Engine
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {result.category}
                </span>
              </div>
            </div>

            {/* Technical Summary */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Ringkasan Teknis (Penjelasan untuk L2 Checker):
              </span>
              <p className="text-slate-700 text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {result.technicalSummary}
              </p>
            </div>
          </div>

          {/* Query Logic with Copy Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>Sintaks Kueri Hasil AI (SQL Expression):</span>
              </div>
              <button
                type="button"
                onClick={handleCopyQuery}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                {copiedQuery ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
              {result.queryLogic}
            </pre>
          </div>

          {/* Extracted Parameters (Placeholders) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Placeholder Hasil Ekstraksi Otomatis ({result.parameters.length} Variabel):</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Siap diinjeksikan threshold di Rule Basic</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.parameters.map((param, pIdx) => (
                <div key={pIdx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700 text-[11px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {param.key}
                    </span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                      {param.dataType}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800 text-[11px]">{param.label}</div>
                  <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-100 pt-1 font-mono">
                    <span>Default: <strong className="text-slate-700">{String(param.defaultValue)} {param.unit || ''}</strong></span>
                  </div>
                  {param.description && (
                    <div className="text-[9px] text-slate-400 italic">{param.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Syntax Audit & Performance Optimizer Card */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Syntax Audit & Performance Optimizer</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500">Skor Efisiensi:</span>
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {result.syntaxAudit.efficiencyScore}/100 ({result.syntaxAudit.status})
                </span>
              </div>
            </div>

            {/* Bottlenecks */}
            {result.syntaxAudit.bottleneckRisks.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>Potensi Query Bottleneck:</span>
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 bg-amber-50/50 p-2 rounded-lg border border-amber-200/60">
                  {result.syntaxAudit.bottleneckRisks.map((risk, rIdx) => (
                    <li key={rIdx}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tips & Recommendations */}
            {result.syntaxAudit.optimizationTips.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-600" />
                  <span>Rekomendasi Indeks & Optimasi Database:</span>
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 bg-indigo-50/50 p-2 rounded-lg border border-indigo-200/60 font-mono">
                  {result.syntaxAudit.optimizationTips.map((tip, tIdx) => (
                    <li key={tIdx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Footer: Apply to Template */}
          <div className="p-3 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Siap Diinjeksikan ke Editor Maker L1</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Menyematkan query, daftar placeholder, nama, dan ringkasan teknis ke form modal secara instan.
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Reset
              </button>
              
              <button
                type="button"
                onClick={handleApply}
                disabled={hasApplied}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer ${
                  hasApplied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                }`}
              >
                {hasApplied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Sudah Diterapkan ke Editor</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Terapkan ke Template (Apply)</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
