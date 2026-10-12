import React from 'react';
import { 
  CaseUrgency, 
  AlertStatus, 
  InvestigationStatus, 
  SyncStatus, 
  TestingStatus, 
  HandlingPriority 
} from '../../types/fms';
import { 
  getUrgencyBadgeClasses, 
  getAlertStatusClasses, 
  getInvestigationStatusClasses, 
  getSyncStatusClasses, 
  getTestingStatusClasses,
  cn 
} from '../../lib/utils';

export const UrgencyBadge: React.FC<{ urgency: CaseUrgency; className?: string }> = ({ urgency, className }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border font-mono",
      getUrgencyBadgeClasses(urgency),
      className
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-1.5",
        urgency === 'High' ? 'bg-red-500' : urgency === 'Med' ? 'bg-yellow-500' : 'bg-green-500'
      )} />
      {urgency}
    </span>
  );
};

export const AlertStatusBadge: React.FC<{ status: AlertStatus; className?: string }> = ({ status, className }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border font-mono",
      getAlertStatusClasses(status),
      className
    )}>
      {status}
    </span>
  );
};

export const InvestigationStatusBadge: React.FC<{ status: InvestigationStatus; className?: string }> = ({ status, className }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border font-mono",
      getInvestigationStatusClasses(status),
      className
    )}>
      {status}
    </span>
  );
};

export const SyncStatusBadge: React.FC<{ status: SyncStatus; className?: string }> = ({ status, className }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border font-mono",
      getSyncStatusClasses(status),
      className
    )}>
      {status === 'Out of Sync' ? '⚠️ Out of Sync' : '✓ In Sync'}
    </span>
  );
};

export const TestingStatusBadge: React.FC<{ status: TestingStatus; className?: string }> = ({ status, className }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border font-mono",
      getTestingStatusClasses(status),
      className
    )}>
      {status}
    </span>
  );
};

export const VersionBadge: React.FC<{ version: string; isMajor?: boolean; className?: string }> = ({ version, isMajor, className }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border",
      isMajor || version.startsWith('2.') 
        ? "bg-purple-50 text-purple-700 border-purple-200 font-bold" 
        : "bg-slate-100 text-slate-700 border-slate-200",
      className
    )}>
      v{version}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: HandlingPriority; className?: string }> = ({ priority, className }) => {
  const isP1 = priority.startsWith('P1');
  const isP2 = priority.startsWith('P2');
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border font-mono",
      isP1 ? "bg-red-50 text-red-700 border-red-200 font-bold" :
      isP2 ? "bg-amber-50 text-amber-800 border-amber-200" :
      "bg-slate-100 text-slate-600 border-slate-200",
      className
    )}>
      {priority}
    </span>
  );
};

export const ListTypeBadge: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border font-mono",
      type === 'Blacklist' ? "bg-red-50 text-red-700 border-red-200" :
      type === 'Watchlist' ? "bg-amber-50 text-amber-800 border-amber-200" :
      "bg-emerald-50 text-emerald-700 border-emerald-200",
      className
    )}>
      {type}
    </span>
  );
};

export const DomainBadge: React.FC<{ domain?: 'Fraud' | 'AML'; className?: string }> = ({ domain = 'Fraud', className }) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border font-mono uppercase tracking-wider",
      domain === 'Fraud' 
        ? "bg-rose-50 text-rose-700 border-rose-200" 
        : "bg-blue-50 text-blue-700 border-blue-200",
      className
    )}>
      {domain}
    </span>
  );
};

