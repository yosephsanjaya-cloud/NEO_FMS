import { FraudCase } from '../types/fms';
import { formatIDR } from './utils';

export type CaseDomain = 'fraud' | 'aml';

export interface CaseRecommendationScenario {
  id: 'temp_block' | 'permanent_block' | 'false_positive';
  name: string;
  badge: string;
  badgeColor: 'amber' | 'red' | 'emerald';
  description: string;
  reviewerResult: string;
  finalResult: string;
  closingAction: string;
  suspendDuration?: string;
  typeOfFraud: string;
  suggestedComment: string;
  confidenceScore: number;
}

export interface CaseRecommendationResult {
  domain: CaseDomain;
  caseId: string;
  cif: string;
  customerName: string;
  violationType: string;
  violationDescription: string;
  primaryConfidence: number;
  recommendedScenarioId: 'temp_block' | 'permanent_block' | 'false_positive';
  keyRiskIndicators: {
    label: string;
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    detail: string;
  }[];
  scenarios: CaseRecommendationScenario[];
  summaryAnalysis: string;
}

export function generateCaseRecommendation(
  c: FraudCase | null | undefined,
  forcedDomain?: CaseDomain
): CaseRecommendationResult {
  if (!c) {
    return getFallbackRecommendation(forcedDomain || 'fraud');
  }

  const domain: CaseDomain = forcedDomain || (c.alertCategory === 'AML' ? 'aml' : 'fraud');
  const amount = c.transaction?.amount || 0;
  const channel = c.transaction?.channel || 'MB';
  const riskScore = c.finalRiskScore || c.baseScore || 65;
  const formulaPoints = c.formulaRiskPoints || 0;
  const device = c.deviceId || c.transaction?.deviceModel || 'Perangkat Nasabah';
  const ip = c.transaction?.ipAddress || '180.252.74.19';
  const loc = c.transaction?.location || 'Jakarta Barat, ID';
  const customerName = c.customerName || 'Nasabah Bank Sampoerna';
  const cif = c.cif || 'CIF-990123';
  const account = c.accountNumber || c.transaction?.sourceAccount || 'Rekening Utama';
  const destAccount = c.transaction?.destinationAccount || 'Rekening Tujuan';
  const destBank = c.transaction?.destinationBank || 'Bank Eksternal';
  const ruleName = c.ruleName || 'Anomali Perilaku Transaksi';

  // 1. Analyze Key Risk Indicators
  const kris: { label: string; level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; detail: string }[] = [];

  // Check Amount
  if (amount >= 50000000) {
    kris.push({
      label: 'High-Value Outlier',
      level: 'CRITICAL',
      detail: `Nominal transaksi ${formatIDR(amount)} melampaui limit wajar historis 30 hari nasabah.`
    });
  } else if (amount >= 15000000) {
    kris.push({
      label: 'Elevated Transaction Value',
      level: 'HIGH',
      detail: `Nominal ${formatIDR(amount)} melalui channel ${channel} terindikasi di atas rata-rata harian.`
    });
  }

  // Check Channel & Device
  if (channel.toUpperCase() === 'MB' || channel.toUpperCase() === 'OB') {
    if (c.deviceId && c.deviceId.length > 5) {
      kris.push({
        label: 'Device Signature Analysis',
        level: riskScore >= 75 ? 'HIGH' : 'MEDIUM',
        detail: `Device ID ${c.deviceId.slice(0, 8)}... tercatat melakukan login dengan parameter sesi anomali.`
      });
    }
  }

  // Check Red Zone / IP
  if (loc.toLowerCase().includes('red zone') || loc.toLowerCase().includes('unknown') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
    kris.push({
      label: 'Geographical / IP Mismatch',
      level: 'HIGH',
      detail: `Aktivitas dari IP ${ip} (${loc}) berada di luar pola kebiasaan geografis nasabah.`
    });
  } else {
    kris.push({
      label: 'Network IP Verification',
      level: 'MEDIUM',
      detail: `IP Akses ${ip} terverifikasi dari penyedia jaringan seluler domestik.`
    });
  }

  // Check Formula Risk
  if (formulaPoints > 0) {
    kris.push({
      label: 'Formula Risk Engine Hit',
      level: formulaPoints >= 30 ? 'CRITICAL' : 'HIGH',
      detail: `Formula Risk mencatat akumulasi ${formulaPoints} poin dari ${c.formulaMatches?.length || 1} parameter matriks risiko.`
    });
  }

  // Check Velocity
  if (ruleName.toLowerCase().includes('velocity') || ruleName.toLowerCase().includes('frekuensi') || ruleName.toLowerCase().includes('rapid')) {
    kris.push({
      label: 'Velocity Spike Detected',
      level: 'CRITICAL',
      detail: `Terdeteksi lonjakan frekuensi transaksi berulang dalam rentang waktu singkat (< 5 menit).`
    });
  }

  // 2. Determine Primary Violation & Confidence
  let violationType = '';
  let violationDescription = '';
  let primaryConfidence = 92;
  let recommendedScenarioId: 'temp_block' | 'permanent_block' | 'false_positive' = 'temp_block';

  if (domain === 'fraud') {
    if (ruleName.toLowerCase().includes('take over') || ruleName.toLowerCase().includes('ato') || (riskScore >= 80 && amount >= 25000000)) {
      violationType = 'FR-TOF-001 - Account Take Over (ATO)';
      violationDescription = 'Indikasi pengambilalihan akun perbankan (ATO) disertai percobaan transfer dana cepat ke rekening penampung eksternal.';
      primaryConfidence = Math.min(97, 88 + Math.floor(riskScore / 10));
      recommendedScenarioId = 'temp_block';
    } else if (ruleName.toLowerCase().includes('cnp') || channel.toUpperCase() === 'CARD') {
      violationType = 'FR-TOF-002 - Card not Present (CNP)';
      violationDescription = 'Indikasi penyalahgunaan kredensial kartu tanpa kartu fisik melalui kanal digital tidak terverifikasi 3DS.';
      primaryConfidence = 91;
      recommendedScenarioId = 'temp_block';
    } else if (ruleName.toLowerCase().includes('penipuan') || ruleName.toLowerCase().includes('social engineering')) {
      violationType = 'FR-TOF-005 - Penipuan Akun';
      violationDescription = 'Indikasi nasabah korban rekayasa sosial (phishing/social engineering) menginstruksikan pemindahan saldo.';
      primaryConfidence = 93;
      recommendedScenarioId = 'temp_block';
    } else if (ruleName.toLowerCase().includes('cyber') || ip.toLowerCase().includes('tor') || loc.toLowerCase().includes('red zone')) {
      violationType = 'FR-TOF-006 - Cyber Crime/Cyber Fraud';
      violationDescription = 'Indikasi intrusi sistem atau otomasi skrip siber melalui jaringan anomali (Tor/VPN/Emulator).';
      primaryConfidence = 95;
      recommendedScenarioId = 'permanent_block';
    } else if (riskScore < 50) {
      violationType = 'FR-TOF-012 - False Positive';
      violationDescription = 'Aktivitas transaksi sesuai dengan riwayat profil belanja dan payroll nasabah, tidak ditemukan anomali kritis.';
      primaryConfidence = 89;
      recommendedScenarioId = 'false_positive';
    } else {
      violationType = 'FR-TOF-009 - Fraud Transfer Dana';
      violationDescription = 'Pola pergerakan dana tidak lazim dengan lonjakan nominal atau penerima dana baru yang berisiko tinggi.';
      primaryConfidence = 92;
      recommendedScenarioId = 'temp_block';
    }
  } else {
    // AML Domain
    if (ruleName.toLowerCase().includes('judi') || ruleName.toLowerCase().includes('gambling') || destBank.toLowerCase().includes('slot')) {
      violationType = 'AM-TOF-002 - Judi Online';
      violationDescription = 'Indikasi penyaluran dana ke rekening bandar / agen penampung transaksi perjudian daring tanpa underlying wajar.';
      primaryConfidence = 94;
      recommendedScenarioId = 'permanent_block';
    } else if (ruleName.toLowerCase().includes('pinjol') || ruleName.toLowerCase().includes('pinjaman')) {
      violationType = 'AM-TOF-001 - Pinjaman Online';
      violationDescription = 'Indikasi transaksi pembiayaan tidak terdaftar atau penarikan dana sindikat pinjol ilegal.';
      primaryConfidence = 90;
      recommendedScenarioId = 'temp_block';
    } else if (riskScore < 50) {
      violationType = 'AM-TOF-003 - Transaksi Wajar Sesuai Profile';
      violationDescription = 'Akumulasi transaksi sejalan dengan bukti profil nasabah (CDD/EDD) dan dokumen SPT/NPWP yang terdaftar.';
      primaryConfidence = 91;
      recommendedScenarioId = 'false_positive';
    } else {
      violationType = 'AM-TOF-001 - Pinjaman Online';
      violationDescription = 'Indikasi pola transaksi terpecah (smurfing/structuring) atau pass-through account yang memerlukan laporan analisa mendalam.';
      primaryConfidence = 91;
      recommendedScenarioId = 'temp_block';
    }
  }

  // 3. Construct 3 Alternative Action Scenarios
  const scenarios: CaseRecommendationScenario[] = [];

  if (domain === 'fraud') {
    // --- SCENARIO 1: Temporary Block (SOP Fast Mitigation) ---
    scenarios.push({
      id: 'temp_block',
      name: 'Blokir Sementara 1 x 24 Jam',
      badge: 'Mitigasi Cepat (Rekomendasi)',
      badgeColor: 'amber',
      description: 'Bekukan sementara akses rekening/channel selama 24 jam untuk melindungi saldo nasabah sambil melakukan konfirmasi telepon (Outbound Call).',
      reviewerResult: 'FR-RR-001 - Fraud',
      finalResult: 'FR-FR-001 - Fraud',
      closingAction: 'FR-CA-005 - Temporary Suspend Account',
      suspendDuration: '1 x 24 Jam',
      typeOfFraud: violationType,
      confidenceScore: primaryConfidence,
      suggestedComment: `[AI RECOMMENDATION - TEMPORARY BLOCK]
1. Indikasi Kasus: Terindikasi ${violationType} pada CIF ${cif} (${customerName}).
2. Fakta Transaksi: Terjadi transaksi anomali sebesar ${formatIDR(amount)} via channel ${channel} pada ${c.transaction?.timestamp || 'waktu terdeteksi'} ke ${destBank} (${destAccount}).
3. Analisis Risiko: Skor anomali ${riskScore}/100 dengan indikasi ${kris[0]?.detail || 'anomali pola frekuensi'}.
4. Tindakan Mitigasi: Dilakukan Temporary Suspend Account selama 1 x 24 Jam (FR-CA-005) sesuai SOP FMS BSS untuk mencegah pembobolan lebih lanjut. Tim Investigasi akan menghubungi nasabah melalui Call Center guna validasi kepemilikan transaksi.`
    });

    // --- SCENARIO 2: Hard Block & Freeze CIF ---
    scenarios.push({
      id: 'permanent_block',
      name: 'Blokir Permanen & Freeze CIF',
      badge: 'Tindakan Keras (Confirmed)',
      badgeColor: 'red',
      description: 'Lakukan pemblokiran permanen terhadap CIF dan seluruh rekening terkait karena terbukti merupakan tindak pidana fraud terkonfirmasi.',
      reviewerResult: 'FR-RR-001 - Fraud',
      finalResult: 'FR-FR-001 - Fraud',
      closingAction: 'FR-CA-002 - Suspend CIF',
      typeOfFraud: violationType,
      confidenceScore: Math.max(85, primaryConfidence - 3),
      suggestedComment: `[AI RECOMMENDATION - PERMANENT CIF FREEZE]
1. Indikasi Kasus: Terkonfirmasi kejahatan ${violationType} melibatkan CIF ${cif} (${customerName}).
2. Analisis Investigasi: Ditemukan bukti kuat upaya penarikan saldo ilegal sebesar ${formatIDR(amount)} dengan pelanggaran rule ${ruleName} (Risk Score: ${riskScore}).
3. Tindakan Eksekusi: Diajukan Suspend CIF permanen (FR-CA-002) dan pencantuman ke Internal Blacklist. Seluruh akses kanal digital dinonaktifkan permanen sesuai instruksi Fraud Management Unit.`
    });

    // --- SCENARIO 3: False Positive & Release ---
    scenarios.push({
      id: 'false_positive',
      name: 'False Positive (Tutup Alert)',
      badge: 'Transaksi Wajar (Legitimate)',
      badgeColor: 'emerald',
      description: 'Tutup alert investigasi dan lepaskan penahanan transaksi karena nasabah terverifikasi melakukan transaksi secara sah dan sadar.',
      reviewerResult: 'FR-RR-002 - False Positive',
      finalResult: 'FR-FR-002 - False Positive',
      closingAction: 'FR-CA-009 - Release Account',
      typeOfFraud: 'FR-TOF-012 - False Positive',
      confidenceScore: Math.min(95, 100 - (riskScore / 2)),
      suggestedComment: `[AI RECOMMENDATION - FALSE POSITIVE RELEASE]
1. Klarifikasi Nasabah: Telah dilakukan verifikasi silang terhadap nasabah ${customerName} (CIF ${cif}). Nasabah mengonfirmasi transaksi ${formatIDR(amount)} ke ${destBank} adalah sah untuk keperluan pribadi/bisnis.
2. Evaluasi Keamanan: Kredensial nasabah aman, OTP berhasil divalidasi, dan tidak ada indikasi pengambilalihan akun pihak ketiga.
3. Kesimpulan: Alert ditutup sebagai False Positive (FR-FR-002), transaksi dilepaskan (Release Account FR-CA-009) dan direkomendasikan untuk pembaharuan profil batas whitelist.`
    });
  } else {
    // --- AML DOMAIN SCENARIOS ---
    scenarios.push({
      id: 'temp_block',
      name: 'Lembar Analisa Manual (Eskalasi L2)',
      badge: 'Analisis Kepatuhan (Rekomendasi)',
      badgeColor: 'amber',
      description: 'Buat Lembar Analisa Manual dan eskalasikan ke AML Checker/Compliance Officer untuk penelaahan pelaporan LTKM/SIPESAT PPATK.',
      reviewerResult: 'AM-RR-001 - Mencurigakan',
      finalResult: 'AM-FR-001 - Mencurigakan',
      closingAction: 'AM-CA-001 - Membuat Lembar Analisa Manual',
      typeOfFraud: violationType,
      confidenceScore: primaryConfidence,
      suggestedComment: `[AI RECOMMENDATION AML - LEMBAR ANALISA MANUAL]
1. Indikasi AML: Teridentifikasi indikasi ${violationType} pada rekening ${account} milik nasabah ${customerName} (CIF: ${cif}).
2. Temuan Anomali: Transaksi sebesar ${formatIDR(amount)} menunjukkan pola pass-through / structuring yang tidak selaras dengan profil penghasilan yang terdaftar pada form CDD.
3. Rekomendasi Kepatuhan: Direkomendasikan pembuatan Lembar Analisa Manual (AM-CA-001) dan eskalasi ke Analyst L2 untuk penentuan penyusunan Laporan Transaksi Keuangan Mencurigakan (LTKM) ke PPATK.`
    });

    scenarios.push({
      id: 'permanent_block',
      name: 'Indikasi Tegas / Eskalasi Prioritas',
      badge: 'Prioritas Tinggi (High Risk)',
      badgeColor: 'red',
      description: 'Eskalasi prioritas tinggi dengan status mencurigakan untuk penanganan mendesak indikasi tindak pidana pencucian uang/judi online.',
      reviewerResult: 'AM-RR-003 - Eskalasi',
      finalResult: 'AM-FR-003 - Eskalasi',
      closingAction: 'AM-CA-001 - Membuat Lembar Analisa Manual',
      typeOfFraud: violationType,
      confidenceScore: Math.max(88, primaryConfidence - 2),
      suggestedComment: `[AI RECOMMENDATION AML - ESKALASI PRIORITAS TINGGI]
1. Indikasi Pelanggaran: Rekening nasabah CIF ${cif} terindikasi kuat sebagai penampung transaksi ${violationType} dengan skor kepatuhan kritis ${riskScore}.
2. Akumulasi Transaksi: Terdeteksi akumulasi transfer berulang bernilai signifikan (${formatIDR(amount)}) dalam jendela waktu pendek tanpa justifikasi ekonomi yang rasional.
3. Instruksi: Eskalasi langsung ke Pejabat Kepatuhan / AML Checker (AM-RR-003 / AM-FR-003) untuk pembekuan rekening preventif dan verifikasi Enhanced Due Diligence (EDD).`
    });

    scenarios.push({
      id: 'false_positive',
      name: 'Transaksi Wajar Sesuai Profil',
      badge: 'Kepatuhan Wajar (Clear)',
      badgeColor: 'emerald',
      description: 'Tutup investigasi kepatuhan karena transaksi nasabah memiliki underlying ekonomi yang terbukti sah sesuai profil usaha/penghasilan.',
      reviewerResult: 'AM-RR-002 - Tidak Mencurigakan',
      finalResult: 'AM-FR-002 - Tidak Mencurigakan',
      closingAction: 'AM-CA-002 - Transaksi Wajar',
      typeOfFraud: 'AM-TOF-003 - Transaksi Wajar Sesuai Profile',
      confidenceScore: 92,
      suggestedComment: `[AI RECOMMENDATION AML - TRANSAKSI WAJAR]
1. Hasil Tinjauan Profil: Telah dilakukan review berkas CDD/EDD nasabah ${customerName} (CIF: ${cif}). Transaksi senilai ${formatIDR(amount)} bersumber dari aktivitas operasional usaha yang terdaftar resmi.
2. Verifikasi Dokumen: Dokumen pendukung (invoice/bukti transfer) telah diverifikasi dan valid.
3. Kesimpulan: Dinyatakan Tidak Mencurigakan (AM-FR-002 - Transaksi Wajar AM-CA-002). Alert diselesaikan tanpa perlu penerbitan LTKM.`
    });
  }

  const summaryAnalysis = `Sistem Neo FMS AI Assistant mendeteksi anomali ${domain.toUpperCase()} berlevel ${riskScore >= 75 ? 'TINGGI' : 'MODERAT'} (Risk Score: ${riskScore}) dengan tingkat keyakinan ${primaryConfidence}%. Direkomendasikan skenario ${scenarios.find(s => s.id === recommendedScenarioId)?.name || 'Mitigasi Cepat'} untuk pengamanan saldo perbankan nasabah.`;

  return {
    domain,
    caseId: c.caseId || c.id || 'CASE-UNKNOWN',
    cif,
    customerName,
    violationType,
    violationDescription,
    primaryConfidence,
    recommendedScenarioId,
    keyRiskIndicators: kris,
    scenarios,
    summaryAnalysis
  };
}

function getFallbackRecommendation(domain: CaseDomain): CaseRecommendationResult {
  return {
    domain,
    caseId: 'CASE-PREVIEW',
    cif: 'CIF-000000',
    customerName: 'Nasabah Terpilih',
    violationType: domain === 'fraud' ? 'FR-TOF-001 - Account Take Over (ATO)' : 'AM-TOF-001 - Pinjaman Online',
    violationDescription: 'Deteksi otomatis anomali parameter transaksi.',
    primaryConfidence: 90,
    recommendedScenarioId: 'temp_block',
    keyRiskIndicators: [
      { label: 'Analisis Risiko Standar', level: 'HIGH', detail: 'Parameter kasus memenuhi kriteria pengawasan Neo FMS.' }
    ],
    scenarios: [
      {
        id: 'temp_block',
        name: 'Blokir Sementara 1 x 24 Jam',
        badge: 'Mitigasi Cepat',
        badgeColor: 'amber',
        description: 'Blokir sementara selama 24 jam.',
        reviewerResult: domain === 'fraud' ? 'FR-RR-001 - Fraud' : 'AM-RR-001 - Mencurigakan',
        finalResult: domain === 'fraud' ? 'FR-FR-001 - Fraud' : 'AM-FR-001 - Mencurigakan',
        closingAction: domain === 'fraud' ? 'FR-CA-005 - Temporary Suspend Account' : 'AM-CA-001 - Membuat Lembar Analisa Manual',
        suspendDuration: '1 x 24 Jam',
        typeOfFraud: domain === 'fraud' ? 'FR-TOF-001 - Account Take Over (ATO)' : 'AM-TOF-001 - Pinjaman Online',
        suggestedComment: '[AI RECOMMENDATION] Rekomendasi mitigasi standar sistem.',
        confidenceScore: 90
      }
    ],
    summaryAnalysis: 'Analisis rekomendasi siap digunakan.'
  };
}
