import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CaseUrgency, AlertStatus, InvestigationStatus, HandlingPriority, SyncStatus, TestingStatus } from '../types/fms';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRupiah(amount: number): string {
  return formatIDR(amount);
}

export function formatCurrencyIDR(amount: number): string {
  return formatIDR(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('id-ID').format(val);
}

export function getUrgencyBadgeClasses(urgency: CaseUrgency): string {
  switch (urgency) {
    case 'High':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'Med':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Low':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getAlertStatusClasses(status: AlertStatus): string {
  switch (status) {
    case 'Open':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Draft':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'Pending Approval':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Close':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getInvestigationStatusClasses(status: InvestigationStatus | string): string {
  switch (status) {
    case 'Closed':
    case 'Done':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Partial Closed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'On Check':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Opened':
    default:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
}

export function getSyncStatusClasses(status: SyncStatus): string {
  switch (status) {
    case 'In Sync':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Out of Sync':
      return 'bg-red-50 text-red-700 border-red-300 font-bold animate-pulse';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getTestingStatusClasses(status: TestingStatus): string {
  switch (status) {
    case 'Passed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Need Testing':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Failed':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function calculateRiskLevelFromScore(score: number): CaseUrgency {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Med';
  return 'Low';
}

export function bumpSemanticVersion(currentVersion: string, bumpType: 'major' | 'minor' | 'patch'): string {
  const parts = currentVersion.split('.');
  let major = parseInt(parts[0] || '1', 10);
  let minor = parseInt(parts[1] || '0', 10);
  let patch = 0;
  
  if (parts.length >= 3) {
    patch = parseInt(parts[2] || '0', 10);
  }

  if (isNaN(major)) major = 1;
  if (isNaN(minor)) minor = 0;
  if (isNaN(patch)) patch = 0;

  if (bumpType === 'major') {
    major++;
    minor = 0;
    patch = 0;
  } else if (bumpType === 'minor') {
    minor++;
    patch = 0;
  } else if (bumpType === 'patch') {
    patch++;
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * Version bumping helper based on legacy business rules:
 * - 1.0 : initial
 * - 1.XX (Minor) : changes to Name, Description, Base Score, Priority, Thresholds
 * - 2.0 (Major) : changes to parameter placeholders in Template or Sync action on Out of Sync
 */
export function bumpVersionMinor(currentVersion: string): string {
  const parts = currentVersion.split('.');
  const major = parts[0] || '1';
  const minor = parseInt(parts[1] || '0', 10);
  const nextMinor = minor + 1;
  const formattedMinor = nextMinor < 10 ? `0${nextMinor}` : `${nextMinor}`;
  return `${major}.${formattedMinor}`;
}

export function bumpVersionMajor(currentVersion: string): string {
  const parts = currentVersion.split('.');
  const major = parseInt(parts[0] || '1', 10);
  return `${major + 1}.0`;
}
