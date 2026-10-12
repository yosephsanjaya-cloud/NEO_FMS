export interface CaseItem {
  id?: string;
  caseId?: string;
  createdAt?: string | Date;
  identifiedOn?: string | Date;
  timestamp?: string | Date;
  date?: string | Date;
  detectionDate?: string;
  aging?: string;
  channel?: 'MB' | 'OB' | 'QRIS' | 'VA' | 'CARD' | 'Card' | string;
  status?: string;
  alertStatus?: string;
  investigationStatus?: string;
  [key: string]: any;
}

export interface SlaConfig {
  MB_hours: number;
  OB_hours: number;
  QRIS_hours: number;
  CARD_hours: number;
  VA_days: number;
}

export const DEFAULT_SLA_CONFIG: SlaConfig = {
  MB_hours: 24,
  OB_hours: 24,
  QRIS_hours: 24,
  CARD_hours: 24,
  VA_days: 7
};

/**
 * Membaca konfigurasi SLA dari sessionStorage atau menggunakan nilai default.
 */
export const getStoredSlaConfig = (): SlaConfig => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = sessionStorage.getItem('fms_sla_config') || sessionStorage.getItem('sla_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        const config = parsed.sla_config || parsed;
        return {
          MB_hours: Number(config.MB_hours ?? 24),
          OB_hours: Number(config.OB_hours ?? 24),
          QRIS_hours: Number(config.QRIS_hours ?? 24),
          CARD_hours: Number(config.CARD_hours ?? 24),
          VA_days: Number(config.VA_days ?? 7)
        };
      }
    }
  } catch (err) {
    console.warn('Error reading SLA config from sessionStorage:', err);
  }
  return DEFAULT_SLA_CONFIG;
};

/**
 * Menyimpan konfigurasi SLA ke sessionStorage dan trigger custom event
 */
export const saveSlaConfigToSession = (config: SlaConfig) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const payload = { sla_config: config };
      sessionStorage.setItem('fms_sla_config', JSON.stringify(payload));
      sessionStorage.setItem('sla_config', JSON.stringify(payload));
      
      // Emit event for real-time reactive updates
      window.dispatchEvent(new CustomEvent('fms_sla_config_updated', { detail: config }));
    }
  } catch (err) {
    console.warn('Error saving SLA config to sessionStorage:', err);
  }
};

/**
 * Helper untuk mendeteksi channel transaksi secara presisi
 */
export const detectCaseChannel = (caseData: any): 'MB' | 'OB' | 'VA' | 'QRIS' | 'CARD' => {
  if (!caseData) return 'MB';
  
  const ch = (caseData.channel || caseData.transaction?.channel || caseData.source || '').toLowerCase();
  const ruleName = (caseData.ruleName || '').toLowerCase();
  const acc = (caseData.sourceVirtualAccount || caseData.sourceVirtualAccountName || caseData.accountNumber || caseData.transaction?.destinationAccount || '').toLowerCase();
  const trxType = (caseData.transaction?.trxType || '').toLowerCase();
  const caseId = (caseData.caseId || caseData.id || '').toLowerCase();

  // 1. Virtual Account
  if (
    ch.includes('virtual account') || 
    ch.includes('va') || 
    caseData.sourceVirtualAccount || 
    caseData.sourceVirtualAccountName || 
    ruleName.includes('virtual account') ||
    ruleName.includes('va ') ||
    acc.includes('va') ||
    trxType.includes('va') ||
    trxType.includes('virtual account')
  ) {
    return 'VA';
  }

  // 2. QRIS
  if (ch.includes('qris') || ruleName.includes('qris') || trxType.includes('qris') || caseId.includes('qris')) {
    return 'QRIS';
  }

  // 3. Card (Debit / Credit Card / ATM / EDC / POS)
  if (
    ch.includes('card') || 
    ch.includes('kartu') || 
    ch.includes('debit') || 
    ch.includes('kredit') || 
    ch.includes('credit') || 
    ch.includes('atm') || 
    ch.includes('edc') ||
    trxType.includes('card') ||
    trxType.includes('debit') ||
    trxType.includes('credit') ||
    trxType.includes('atm') ||
    trxType.includes('pos') ||
    ruleName.includes('card') ||
    ruleName.includes('kartu') ||
    ruleName.includes('debit') ||
    ruleName.includes('credit')
  ) {
    return 'CARD';
  }

  // 4. Online Banking / Internet Banking
  if (
    ch.includes('ob') || 
    ch.includes('ib') || 
    ch.includes('internet') || 
    ch.includes('web') || 
    ch.includes('online banking') || 
    ch.includes('corporate') ||
    trxType.includes('internet') ||
    ruleName.includes('online banking') ||
    ruleName.includes('internet banking') ||
    ruleName.includes('ob ')
  ) {
    return 'OB';
  }

  // 5. Mobile Banking (Default)
  return 'MB';
};

/**
 * Menghitung usia kasus dalam satuan Jam
 */
export const getCaseAgeHours = (caseData: any): number => {
  if (!caseData) return 0;

  if (caseData.aging) {
    const dayMatch = caseData.aging.match(/(\d+)\s*d/i);
    const hourMatch = caseData.aging.match(/(\d+)\s*h/i);
    const minMatch = caseData.aging.match(/(\d+)\s*m/i);

    let hours = 0;
    if (dayMatch) hours += parseInt(dayMatch[1], 10) * 24;
    if (hourMatch) hours += parseInt(hourMatch[1], 10);
    if (minMatch && !dayMatch && !hourMatch) hours += parseInt(minMatch[1], 10) / 60;
    
    if (hours > 0) return hours;
  }

  const rawDate = caseData.createdAt || caseData.identifiedOn || caseData.timestamp || caseData.date || caseData.detectionDate || caseData.transaction?.timestamp;
  if (rawDate) {
    const caseTime = new Date(typeof rawDate === 'string' ? rawDate.replace(' ', 'T') : rawDate).getTime();
    if (!isNaN(caseTime)) {
      const now = Date.now();
      const diffHours = (now - caseTime) / (1000 * 60 * 60);
      if (diffHours > 0) return diffHours;
    }
  }

  return 0;
};

/**
 * Menghitung apakah suatu kasus melebihi batas SLA berdasarkan jenis channel:
 * - MB: Over jika > MB_hours (Default 24 Jam)
 * - OB: Over jika > OB_hours (Default 24 Jam)
 * - QRIS: Over jika > QRIS_hours (Default 24 Jam)
 * - CARD: Over jika > CARD_hours (Default 24 Jam)
 * - VA: Over jika > VA_days (Default 7 Hari = 168 Jam)
 */
export const isCaseOverSla = (caseData: CaseItem | any, customConfig?: Partial<SlaConfig>): boolean => {
  if (!caseData) return false;

  const ageHours = getCaseAgeHours(caseData);
  const channel = detectCaseChannel(caseData);
  const config = { ...getStoredSlaConfig(), ...customConfig };

  if (channel === 'VA') {
    return ageHours > (config.VA_days * 24);
  }

  if (channel === 'CARD') {
    return ageHours > config.CARD_hours;
  }

  if (channel === 'QRIS') {
    return ageHours > config.QRIS_hours;
  }

  if (channel === 'OB') {
    return ageHours > config.OB_hours;
  }

  // MB / Default
  return ageHours > config.MB_hours;
};

/**
 * Helper untuk mendapatkan batas jam SLA per channel
 */
export const getChannelSlaLimitHours = (channel: string, customConfig?: Partial<SlaConfig>): number => {
  const ch = channel.toUpperCase();
  const config = { ...getStoredSlaConfig(), ...customConfig };

  if (ch === 'VA') return config.VA_days * 24;
  if (ch === 'CARD') return config.CARD_hours;
  if (ch === 'QRIS') return config.QRIS_hours;
  if (ch === 'OB') return config.OB_hours;
  return config.MB_hours;
};

/**
 * Helper untuk mendapatkan sisa waktu SLA dalam jam
 */
export const getRemainingSlaHours = (caseData: CaseItem | any, customConfig?: Partial<SlaConfig>): number => {
  if (!caseData) return 0;

  const ageHours = getCaseAgeHours(caseData);
  const channel = detectCaseChannel(caseData);
  const limitHours = getChannelSlaLimitHours(channel, customConfig);

  return Math.max(0, limitHours - ageHours);
};
