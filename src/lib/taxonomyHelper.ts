import { HistoryClosingStatus } from '../types/fms';

export interface TaxonomyItem {
  code: string;
  label: string;
  fullDisplay: string;
  category: 'ReviewerResult' | 'FinalResult' | 'ClosingAction' | 'TypeOfThreat';
  domain: 'Fraud' | 'AML';
}

export const FRAUD_TAXONOMY: Record<string, string> = {
  // Reviewer Result
  'FR-RR-001': 'Fraud',
  'FR-RR-002': 'False Positive',
  'FR-RR-003': 'Suspicious',

  // Final Result
  'FR-FR-001': 'Mencurigakan / Fraud Confirmed',
  'FR-FR-002': 'False Positive',
  'FR-FR-003': 'Suspicious / Dalam Pengawasan',
  'FR-FR-004': 'Need Further Investigation',

  // Closing Action
  'FR-CA-001': 'Suspend Account',
  'FR-CA-002': 'Suspend CIF',
  'FR-CA-003': 'Suspend Device ID',
  'FR-CA-004': 'Suspend Phone Number',
  'FR-CA-005': 'Temporary Suspend Account',
  'FR-CA-006': 'Temporary Suspend CIF',
  'FR-CA-007': 'Temporary Suspend Device ID',
  'FR-CA-008': 'Temporary Suspend Phone Number',
  'FR-CA-009': 'Release Account',
  'FR-CA-010': 'Release CIF',
  'FR-CA-011': 'Release Device ID',
  'FR-CA-012': 'Release Phone Number',
  'FR-CA-013': 'Watchlist Account',
  'FR-CA-014': 'Watchlist CIF',
  'FR-CA-015': 'Watchlist Device ID',
  'FR-CA-016': 'Watchlist Phone Number',

  // Type of Fraud
  'FR-TOF-001': 'Account Take Over (ATO)',
  'FR-TOF-002': 'Card not Present (CNP)',
  'FR-TOF-003': 'Counterfeit',
  'FR-TOF-004': 'Payment / Top up Fraud',
  'FR-TOF-005': 'Penipuan Akun',
  'FR-TOF-006': 'Cyber Crime/Cyber Fraud',
  'FR-TOF-007': 'Fraud E-commerce',
  'FR-TOF-008': 'Fraud Onboarding',
  'FR-TOF-009': 'Fraud Transfer Dana',
  'FR-TOF-010': 'Percobaan Enumerasi',
  'FR-TOF-011': 'Access from Red Zone',
  'FR-TOF-012': 'False Positive',
  'FR-TOF-013': 'Undefined'
};

export const AML_TAXONOMY: Record<string, string> = {
  // Reviewer Result
  'AM-RR-001': 'Mencurigakan (Suspicious)',
  'AM-RR-002': 'Tidak Mencurigakan (False Positive)',
  'AM-RR-003': 'Eskalasi / Escalate',

  // Final Result
  'AM-FR-001': 'Mencurigakan / AML Confirmed',
  'AM-FR-002': 'Tidak Mencurigakan (False Positive)',
  'AM-FR-003': 'Eskalasi / STR Reported',
  'AM-FR-004': 'Need Further Investigation',

  // Closing Action
  'AM-CA-001': 'Membuat Lembar Analisa Manual',
  'AM-CA-002': 'Transaksi Wajar Sesuai Profil',

  // Type of AML Threat
  'AM-TOF-001': 'Pinjaman Online Ilegal / Fraudulent Lending',
  'AM-TOF-002': 'Judi Online / Illegal Gambling Syndicate',
  'AM-TOF-003': 'Transaksi Wajar Sesuai Profile'
};

/**
 * Parses raw code or string (e.g. "FR-FR-001 - Fraud" or "AM-RR-001") and converts to human readable label
 */
export function formatTaxonomyLabel(rawVal?: string, domain: 'Fraud' | 'AML' = 'Fraud'): string {
  if (!rawVal || rawVal === 'NONE' || rawVal.trim() === '') {
    return '-';
  }

  const trimmed = rawVal.trim();
  const codeMatch = trimmed.match(/^((FR|AM)-(RR|FR|CA|TOF)-\d{3})/i);
  
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase();
    const isAmlCode = code.startsWith('AM-');
    const dict = isAmlCode ? AML_TAXONOMY : FRAUD_TAXONOMY;
    if (dict[code]) {
      return `${code} - ${dict[code]}`;
    }
  }

  // Fallback to existing text if it already has descriptive name
  if (trimmed.includes(' - ')) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Returns just the descriptive title without code prefix
 */
export function getTaxonomyCleanLabel(rawVal?: string, domain: 'Fraud' | 'AML' = 'Fraud'): string {
  if (!rawVal || rawVal === 'NONE' || rawVal.trim() === '') {
    return '-';
  }

  const trimmed = rawVal.trim();
  const codeMatch = trimmed.match(/^((FR|AM)-(RR|FR|CA|TOF)-\d{3})/i);
  
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase();
    const isAmlCode = code.startsWith('AM-');
    const dict = isAmlCode ? AML_TAXONOMY : FRAUD_TAXONOMY;
    if (dict[code]) {
      return dict[code];
    }
  }

  if (trimmed.includes(' - ')) {
    const parts = trimmed.split(' - ');
    return parts.slice(1).join(' - ');
  }

  return trimmed;
}

/**
 * Computes exact HistoryClosingStatus based on Final Result, Reviewer Result, and domain.
 * Ensures that if L1 chose Fraud / Mencurigakan, it will NEVER fall back to False Positive!
 */
export function resolveClosingStatus(
  domain: 'Fraud' | 'AML',
  finalResult?: string,
  reviewerResult?: string
): HistoryClosingStatus {
  const fr = (finalResult || '').toUpperCase();
  const rr = (reviewerResult || '').toUpperCase();

  if (domain === 'Fraud') {
    // Check if False Positive is explicitly chosen
    if (
      fr.includes('FR-FR-002') || 
      fr.includes('FALSE POSITIVE') || 
      rr.includes('FR-RR-002') || 
      (rr.includes('FALSE POSITIVE') && !fr.includes('FR-FR-001') && !fr.includes('FRAUD'))
    ) {
      return 'CLOSED - FALSE POSITIVE';
    }

    // Check if Suspicious
    if (fr.includes('FR-FR-003') || fr.includes('SUSPIC') || rr.includes('FR-RR-003')) {
      return 'CLOSED - SUSPICIOUS / MONITORING';
    }

    // Default or Explicit Fraud
    if (
      fr.includes('FR-FR-001') || 
      fr.includes('FRAUD') || 
      rr.includes('FR-RR-001') || 
      rr.includes('FRAUD')
    ) {
      return 'CLOSED - CONFIRMED FRAUD';
    }

    // If final result is defined and not false positive, treat as confirmed fraud
    if (fr && fr !== 'NONE' && !fr.includes('FALSE')) {
      return 'CLOSED - CONFIRMED FRAUD';
    }

    return 'CLOSED - CONFIRMED FRAUD';
  } else {
    // AML domain
    // Check if False Positive / Tidak Mencurigakan is explicitly chosen
    if (
      fr.includes('AM-FR-002') || 
      fr.includes('TIDAK MENCURIGAKAN') || 
      rr.includes('AM-RR-002') || 
      (rr.includes('TIDAK MENCURIGAKAN') && !fr.includes('AM-FR-001') && !fr.includes('MENCURIGAKAN'))
    ) {
      return 'CLOSED - FALSE POSITIVE';
    }

    // Check if Escalation
    if (fr.includes('AM-FR-003') || fr.includes('ESKALASI') || rr.includes('AM-RR-003') || rr.includes('ESKALASI')) {
      return 'CLOSED - ESCALATED / STR REPORTED';
    }

    // Default or Explicit Mencurigakan
    if (
      fr.includes('AM-FR-001') || 
      fr.includes('MENCURIGAKAN') || 
      rr.includes('AM-RR-001') || 
      rr.includes('MENCURIGAKAN')
    ) {
      return 'CLOSED - CONFIRMED AML';
    }

    if (fr && fr !== 'NONE' && !fr.includes('TIDAK')) {
      return 'CLOSED - CONFIRMED AML';
    }

    return 'CLOSED - CONFIRMED AML';
  }
}

/**
 * Returns badge styling and descriptive label for table rendering
 */
export function getHistoryBadgeMeta(closingStatus: string, domain: 'Fraud' | 'AML', finalResult?: string) {
  const isConfirmedFraud = closingStatus.includes('CONFIRMED FRAUD');
  const isConfirmedAml = closingStatus.includes('CONFIRMED AML');
  const isFalsePositive = closingStatus.includes('FALSE POSITIVE');
  const isEscalated = closingStatus.includes('ESCALATED') || closingStatus.includes('STR');
  const isSuspicious = closingStatus.includes('SUSPICIOUS');

  if (isConfirmedFraud || isConfirmedAml) {
    return {
      bgClass: 'bg-red-50 text-red-700 border border-red-200',
      badgeLabel: closingStatus,
      taxonomyLabel: domain === 'Fraud' ? 'Mencurigakan / Fraud Confirmed' : 'Mencurigakan / AML Confirmed',
      dotColor: 'bg-red-500'
    };
  }

  if (isFalsePositive) {
    return {
      bgClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      badgeLabel: closingStatus,
      taxonomyLabel: domain === 'Fraud' ? 'False Positive / Tidak Terbukti' : 'Tidak Mencurigakan (False Positive)',
      dotColor: 'bg-emerald-500'
    };
  }

  if (isEscalated) {
    return {
      bgClass: 'bg-amber-50 text-amber-700 border border-amber-200',
      badgeLabel: closingStatus,
      taxonomyLabel: 'Eskalasi / STR Dilaporkan ke PPATK',
      dotColor: 'bg-amber-500'
    };
  }

  if (isSuspicious) {
    return {
      bgClass: 'bg-orange-50 text-orange-700 border border-orange-200',
      badgeLabel: closingStatus,
      taxonomyLabel: 'Suspicious / Dalam Pemantauan Khusus',
      dotColor: 'bg-orange-500'
    };
  }

  return {
    bgClass: 'bg-slate-50 text-slate-700 border border-slate-200',
    badgeLabel: closingStatus,
    taxonomyLabel: formatTaxonomyLabel(finalResult, domain),
    dotColor: 'bg-slate-400'
  };
}
