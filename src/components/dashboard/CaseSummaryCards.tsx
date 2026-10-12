import React, { useMemo, useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  History, 
  ArrowRight, 
  Layers, 
  Smartphone, 
  Globe, 
  QrCode, 
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { FraudCase } from '../../types/fms';
import { 
  detectCaseChannel, 
  getCaseAgeHours, 
  isCaseOverSla as calculateIsCaseOverSla, 
  getStoredSlaConfig, 
  SlaConfig 
} from '../../utils/slaMetrics';

export type SpecificChannel = 'MB' | 'OB' | 'VA' | 'QRIS' | 'CARD';

export const detectChannel = (c: FraudCase): SpecificChannel => {
  return detectCaseChannel(c);
};

export const isCaseOverSla = (c: FraudCase, customConfig?: Partial<SlaConfig>): boolean => {
  return calculateIsCaseOverSla(c, customConfig);
};

interface CaseSummaryCardsProps {
  domain?: string;
  activeFilter?: string;
  onSelectSeverity?: (filter: any) => void;
}

export const CaseSummaryCards: React.FC<CaseSummaryCardsProps> = ({
  domain,
  activeFilter,
  onSelectSeverity
}) => {
  const { fraudCases, kpiStats, setActiveTab, userRole } = useFMS();
  const { user } = useAuth();

  // Dynamic SLA Config from session storage and real-time event listener
  const [slaConfig, setSlaConfig] = useState<SlaConfig>(getStoredSlaConfig());

  useEffect(() => {
    // Initial read
    setSlaConfig(getStoredSlaConfig());

    // Listen for real-time changes by Sysadmin in Application Parameter
    const handleSlaConfigUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<SlaConfig>;
      if (customEvent.detail) {
        setSlaConfig(customEvent.detail);
      } else {
        setSlaConfig(getStoredSlaConfig());
      }
    };

    window.addEventListener('fms_sla_config_updated', handleSlaConfigUpdated);
    return () => {
      window.removeEventListener('fms_sla_config_updated', handleSlaConfigUpdated);
    };
  }, []);

  // Local state for role override toggle (helpful for testing & demo on sysadmin)
  const [overrideView, setOverrideView] = useState<'AUTO' | 'ANALYST_4_CARD' | 'AFC_6_CARD'>('AUTO');

  // Determine user role with session storage persistence check
  const isAnalystRole = useMemo(() => {
    if (overrideView === 'ANALYST_4_CARD') return true;
    if (overrideView === 'AFC_6_CARD') return false;

    // Check sessionStorage override first
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionRole = sessionStorage.getItem('userRole') || sessionStorage.getItem('fms_user_role');
      if (sessionRole) {
        const lower = sessionRole.toLowerCase();
        if (lower.includes('analyst') || lower === 'aml') return true;
        if (lower.includes('afc') || lower.includes('fraud') || lower.includes('sysadmin') || lower.includes('admin')) return false;
      }
      const sessionUser = sessionStorage.getItem('fms_user');
      if (sessionUser) {
        try {
          const parsed = JSON.parse(sessionUser);
          const grp = (parsed.group || '').toLowerCase();
          const uname = (parsed.username || '').toLowerCase();
          if (grp.includes('analyst') || uname.startsWith('analyst')) return true;
          if (grp.includes('afc') || uname.startsWith('afc') || uname === 'sysadmin') return false;
        } catch {}
      }
    }

    // Check AuthContext user
    if (user) {
      const group = (user.group || '').toLowerCase();
      const username = (user.username || '').toLowerCase();
      const riskDomain = user.riskDomain;

      if (username.startsWith('analyst') || group.includes('analyst')) {
        return true;
      }
      if (riskDomain === 'AML ONLY' && !group.includes('afc') && !username.includes('sysadmin')) {
        return true;
      }
      if (username.startsWith('afc') || username === 'sysadmin' || group.includes('afc') || riskDomain === 'FULL ACCESS') {
        return false;
      }
    }

    // Check FMSContext userRole
    if (userRole) {
      const lower = userRole.toLowerCase();
      if (lower.includes('analyst') || lower === 'aml') return true;
      if (lower.includes('afc') || lower.includes('fraud') || lower.includes('admin')) return false;
    }

    return false;
  }, [user, userRole, overrideView]);

  // Calculations for 6-Card Modern Summary
  const stats = useMemo(() => {
    const activeCases = fraudCases.filter(c => c.alertStatus !== 'Close');
    const closedCases = fraudCases.filter(c => c.alertStatus === 'Close');

    const countByChannel = (casesList: FraudCase[]): Record<SpecificChannel, number> => {
      const counts: Record<SpecificChannel, number> = { MB: 0, OB: 0, VA: 0, QRIS: 0, CARD: 0 };
      for (const c of casesList) {
        const ch = detectCaseChannel(c);
        counts[ch] = (counts[ch] || 0) + 1;
      }
      return counts;
    };

    // Card 1: Total Active Cases
    const totalCaseChannels = countByChannel(activeCases);

    // Card 2: Low Severity
    const lowCases = activeCases.filter(c => c.caseUrgency === 'Low');
    const lowChannels = countByChannel(lowCases);

    // Card 3: Medium Severity
    const medCases = activeCases.filter(c => c.caseUrgency === 'Med');
    const medChannels = countByChannel(medCases);

    // Card 4: High Severity (High & Critical)
    const highCases = activeCases.filter(c => c.caseUrgency === 'High' || c.caseUrgency === 'Critical');
    const highChannels = countByChannel(highCases);

    // Card 5: SLA OVER (Active cases breaching threshold per channel based on dynamic slaConfig)
    const overSlaCases = activeCases.filter(c => calculateIsCaseOverSla(c, slaConfig));
    const overMbCases = activeCases.filter(c => detectCaseChannel(c) === 'MB' && getCaseAgeHours(c) > slaConfig.MB_hours);
    const overObCases = activeCases.filter(c => detectCaseChannel(c) === 'OB' && getCaseAgeHours(c) > slaConfig.OB_hours);
    const overVaCases = activeCases.filter(c => detectCaseChannel(c) === 'VA' && getCaseAgeHours(c) > (slaConfig.VA_days * 24));
    const overQrisCases = activeCases.filter(c => detectCaseChannel(c) === 'QRIS' && getCaseAgeHours(c) > slaConfig.QRIS_hours);
    const overCardCases = activeCases.filter(c => detectCaseChannel(c) === 'CARD' && getCaseAgeHours(c) > slaConfig.CARD_hours);

    const slaOverChannels: Record<SpecificChannel, number> = {
      MB: overMbCases.length,
      OB: overObCases.length,
      VA: overVaCases.length,
      QRIS: overQrisCases.length,
      CARD: overCardCases.length
    };

    // Card 6: Closed Cases
    const closedSystem = closedCases.filter(c => !c.isManualAlert);
    const closedManual = closedCases.filter(c => !!c.isManualAlert);

    return {
      totalActive: activeCases.length,
      totalCaseChannels,

      lowCount: lowCases.length,
      lowChannels,

      medCount: medCases.length,
      medChannels,

      highCount: highCases.length,
      highChannels,

      overSlaTotal: overSlaCases.length,
      slaOverChannels,

      closedTotal: closedCases.length,
      closedSystem: closedSystem.length,
      closedManual: closedManual.length
    };
  }, [fraudCases, slaConfig]);

  const isSysadmin = user?.username === 'sysadmin' || user?.riskDomain === 'FULL ACCESS';

  const handleCardClick = (severityFilter: string, targetTab: any = 'alert-fraud') => {
    if (onSelectSeverity) {
      onSelectSeverity(severityFilter);
    } else {
      setActiveTab(targetTab);
    }
  };

  // =========================================================================
  // VIEW 1: ROLE ANALYST (Analyst L1 & Analyst L2) - 4 CARD LEGACY VIEW
  // =========================================================================
  if (isAnalystRole) {
    return (
      <div className="space-y-2">
        {/* Sysadmin Quick Switcher Banner (Optional indicator) */}
        {isSysadmin && (
          <div className="flex items-center justify-between px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            <span className="font-medium">
              Tampilan Aktif: <strong className="text-blue-700">Analyst Legacy (4 Cards)</strong>
            </span>
            <button
              onClick={() => setOverrideView('AFC_6_CARD')}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Uji Coba Tampilan AFC / Sysadmin (6 Cards)
            </button>
          </div>
        )}

        {/* 4 CARD LEGACY EXISTING */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Total Case */}
          <div 
            id="kpi-card-total-case"
            onClick={() => setActiveTab('alert-aml')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition cursor-pointer relative overflow-hidden group shadow-xs flex flex-col justify-between"
          >
            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 font-mono font-bold">
              Total Case
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="text-3xl font-mono font-bold text-slate-900">
                {kpiStats.totalCases}
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] text-slate-500 font-mono">
              <span>Semua antrean aktif</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* KPI 2: Low Severity */}
          <div 
            id="kpi-card-low-severity"
            onClick={() => setActiveTab('alert-aml')}
            className="bg-white p-5 rounded-xl border border-emerald-200 hover:border-emerald-300 transition cursor-pointer relative overflow-hidden group shadow-xs flex flex-col justify-between"
          >
            <div className="text-[11px] uppercase tracking-wider text-emerald-700 mb-1 font-mono font-bold">
              Low Severity
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="text-3xl font-mono font-bold text-emerald-700">
                {kpiStats.lowUrgency}
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] text-emerald-600 font-mono">
              <span>Low Urgency Case</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* KPI 3: Medium Severity */}
          <div 
            id="kpi-card-med-severity"
            onClick={() => setActiveTab('alert-aml')}
            className="bg-white p-5 rounded-xl border border-amber-200 hover:border-amber-300 transition cursor-pointer relative overflow-hidden group shadow-xs flex flex-col justify-between"
          >
            <div className="text-[11px] uppercase tracking-wider text-amber-800 mb-1 font-mono font-bold">
              Medium Severity
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="text-3xl font-mono font-bold text-amber-800">
                {kpiStats.medUrgency}
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] text-amber-700 font-mono">
              <span>Medium Urgency Case</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* KPI 4: High Severity */}
          <div 
            id="kpi-card-high-severity"
            onClick={() => setActiveTab('alert-aml')}
            className="bg-white p-5 rounded-xl border border-red-200 hover:border-red-300 transition cursor-pointer relative overflow-hidden group shadow-xs flex flex-col justify-between"
          >
            <div className="text-[11px] uppercase tracking-wider text-red-600 mb-1 font-mono font-bold">
              High Severity
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="text-3xl font-mono font-bold text-red-600">
                {kpiStats.highUrgency}
              </div>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-[11px] text-red-600 font-mono">
              <span>High / Critical Urgency</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ROLE AFC & SYSADMIN - 6 CARD MODERN SUMMARY BENTO GRID (WITH 5 CHANNELS & DYNAMIC SLA)
  // =========================================================================
  return (
    <div className="space-y-2">
      {/* Sysadmin Quick Switcher Banner (Optional indicator) */}
      {isSysadmin && (
        <div className="flex items-center justify-between px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-600">
          <span className="font-medium">
            Tampilan Aktif: <strong className="text-indigo-700">AFC &amp; Sysadmin (6 Cards - 5 Channel Breakdown)</strong>
          </span>
          <button
            onClick={() => setOverrideView('ANALYST_4_CARD')}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            Kembali ke Tampilan Analyst (4 Cards)
          </button>
        </div>
      )}

      {/* 6 CARD MODERN SUMMARY BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* CARD 1: TOTAL CASE */}
        <div 
          id="stat-card-total-case"
          onClick={() => handleCardClick('ALL', 'alert-fraud')}
          className={`bg-white p-4 rounded-xl border hover:shadow-sm transition cursor-pointer flex flex-col justify-between group ${
            activeFilter === 'ALL' ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-bold">
                Total Case
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Active Queue
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {stats.totalActive}
            </div>
          </div>

          {/* 5 Channels Breakdown (MB, OB, VA, QRIS, CARD) */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
            <div className="grid grid-cols-3 gap-1 text-[9.5px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150" title="Mobile Banking">
                <span className="text-slate-500 font-medium">MB</span>
                <span className="font-mono font-bold text-slate-800">{stats.totalCaseChannels.MB}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150" title="Online Banking">
                <span className="text-slate-500 font-medium">OB</span>
                <span className="font-mono font-bold text-slate-800">{stats.totalCaseChannels.OB}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150" title="Virtual Account">
                <span className="text-slate-500 font-medium">VA</span>
                <span className="font-mono font-bold text-slate-800">{stats.totalCaseChannels.VA}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9.5px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150" title="QRIS Merchant/CPM">
                <span className="text-slate-500 font-medium">QRIS</span>
                <span className="font-mono font-bold text-slate-800">{stats.totalCaseChannels.QRIS}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150" title="Debit / Credit Card">
                <span className="text-slate-500 font-medium">CARD</span>
                <span className="font-mono font-bold text-slate-800">{stats.totalCaseChannels.CARD}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: LOW SEVERITY */}
        <div 
          id="stat-card-low-severity"
          onClick={() => handleCardClick('Low', 'alert-fraud')}
          className={`bg-white p-4 rounded-xl border hover:shadow-sm transition cursor-pointer flex flex-col justify-between group ${
            activeFilter === 'Low' ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-mono font-bold">
                Low Severity
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Low SLA
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {stats.lowCount}
            </div>
          </div>

          {/* 5 Channels Breakdown */}
          <div className="mt-3 pt-2.5 border-t border-emerald-100 space-y-1">
            <div className="grid grid-cols-3 gap-1 text-[9.5px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-50/50 border border-emerald-150">
                <span className="text-emerald-700 font-medium">MB</span>
                <span className="font-mono font-bold text-emerald-900">{stats.lowChannels.MB}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-50/50 border border-emerald-150">
                <span className="text-emerald-700 font-medium">OB</span>
                <span className="font-mono font-bold text-emerald-900">{stats.lowChannels.OB}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-50/50 border border-emerald-150">
                <span className="text-emerald-700 font-medium">VA</span>
                <span className="font-mono font-bold text-emerald-900">{stats.lowChannels.VA}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9.5px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-50/50 border border-emerald-150">
                <span className="text-emerald-700 font-medium">QRIS</span>
                <span className="font-mono font-bold text-emerald-900">{stats.lowChannels.QRIS}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-emerald-50/50 border border-emerald-150">
                <span className="text-emerald-700 font-medium">CARD</span>
                <span className="font-mono font-bold text-emerald-900">{stats.lowChannels.CARD}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: MEDIUM SEVERITY */}
        <div 
          id="stat-card-med-severity"
          onClick={() => handleCardClick('Med', 'alert-fraud')}
          className={`bg-white p-4 rounded-xl border hover:shadow-sm transition cursor-pointer flex flex-col justify-between group ${
            activeFilter === 'Med' ? 'border-amber-600 ring-2 ring-amber-500/20' : 'border-amber-200 hover:border-amber-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-amber-800 font-mono font-bold">
                Medium Severity
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Med SLA
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {stats.medCount}
            </div>
          </div>

          {/* 5 Channels Breakdown */}
          <div className="mt-3 pt-2.5 border-t border-amber-100 space-y-1">
            <div className="grid grid-cols-3 gap-1 text-[9.5px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-amber-50/50 border border-amber-150">
                <span className="text-amber-800 font-medium">MB</span>
                <span className="font-mono font-bold text-amber-950">{stats.medChannels.MB}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-amber-50/50 border border-amber-150">
                <span className="text-amber-800 font-medium">OB</span>
                <span className="font-mono font-bold text-amber-950">{stats.medChannels.OB}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-amber-50/50 border border-amber-150">
                <span className="text-amber-800 font-medium">VA</span>
                <span className="font-mono font-bold text-amber-950">{stats.medChannels.VA}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9.5px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-amber-50/50 border border-amber-150">
                <span className="text-amber-800 font-medium">QRIS</span>
                <span className="font-mono font-bold text-amber-950">{stats.medChannels.QRIS}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-amber-50/50 border border-amber-150">
                <span className="text-amber-800 font-medium">CARD</span>
                <span className="font-mono font-bold text-amber-950">{stats.medChannels.CARD}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: HIGH SEVERITY */}
        <div 
          id="stat-card-high-severity"
          onClick={() => handleCardClick('High', 'alert-fraud')}
          className={`bg-white p-4 rounded-xl border hover:shadow-sm transition cursor-pointer flex flex-col justify-between group ${
            activeFilter === 'High' ? 'border-red-600 ring-2 ring-red-500/20' : 'border-red-200 hover:border-red-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-red-600 font-mono font-bold">
                High Severity
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                Immediate SLA
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {stats.highCount}
            </div>
          </div>

          {/* 5 Channels Breakdown */}
          <div className="mt-3 pt-2.5 border-t border-red-100 space-y-1">
            <div className="grid grid-cols-3 gap-1 text-[9.5px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-red-50/50 border border-red-150">
                <span className="text-red-700 font-medium">MB</span>
                <span className="font-mono font-bold text-red-950">{stats.highChannels.MB}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-red-50/50 border border-red-150">
                <span className="text-red-700 font-medium">OB</span>
                <span className="font-mono font-bold text-red-950">{stats.highChannels.OB}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-red-50/50 border border-red-150">
                <span className="text-red-700 font-medium">VA</span>
                <span className="font-mono font-bold text-red-950">{stats.highChannels.VA}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9.5px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-red-50/50 border border-red-150">
                <span className="text-red-700 font-medium">QRIS</span>
                <span className="font-mono font-bold text-red-950">{stats.highChannels.QRIS}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-red-50/50 border border-red-150">
                <span className="text-red-700 font-medium">CARD</span>
                <span className="font-mono font-bold text-red-950">{stats.highChannels.CARD}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: SLA OVER (DYNAMIC SLA CONFIG DISPLAY) */}
        <div 
          id="stat-card-sla-over"
          onClick={() => handleCardClick('SLA_OVER', 'alert-fraud')}
          className={`bg-white p-4 rounded-xl border bg-red-50/20 hover:shadow-sm transition cursor-pointer flex flex-col justify-between group ${
            activeFilter === 'SLA_OVER' ? 'border-red-600 ring-2 ring-red-600/30' : 'border-red-300 hover:border-red-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-red-700 font-mono font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-600" />
                <span>SLA Over</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                Breach
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-red-600">
              {stats.overSlaTotal}
            </div>
          </div>

          {/* Sub-breakdown: Dynamic Threshold per Channel */}
          <div className="mt-3 pt-2.5 border-t border-red-150 space-y-1.5">
            <div className="grid grid-cols-3 gap-1 text-[9px]">
              <div 
                className={`flex items-center justify-between px-1.5 py-0.5 rounded border ${
                  stats.slaOverChannels.MB > 0 
                    ? 'bg-red-100/60 text-red-900 border-red-200' 
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}
                title={`MB: Over > ${slaConfig.MB_hours} Jam`}
              >
                <span className="font-medium text-[8.5px]">MB (&gt;{slaConfig.MB_hours}h)</span>
                <span className="font-mono font-bold">{stats.slaOverChannels.MB}</span>
              </div>
              <div 
                className={`flex items-center justify-between px-1.5 py-0.5 rounded border ${
                  stats.slaOverChannels.OB > 0 
                    ? 'bg-red-100/60 text-red-900 border-red-200' 
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}
                title={`OB: Over > ${slaConfig.OB_hours} Jam`}
              >
                <span className="font-medium text-[8.5px]">OB (&gt;{slaConfig.OB_hours}h)</span>
                <span className="font-mono font-bold">{stats.slaOverChannels.OB}</span>
              </div>
              <div 
                className={`flex items-center justify-between px-1.5 py-0.5 rounded border ${
                  stats.slaOverChannels.VA > 0 
                    ? 'bg-red-100/60 text-red-900 border-red-200' 
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}
                title={`VA: Over > ${slaConfig.VA_days} Hari (${slaConfig.VA_days * 24} Jam)`}
              >
                <span className="font-medium text-[8.5px]">VA (&gt;{slaConfig.VA_days}d)</span>
                <span className="font-mono font-bold">{stats.slaOverChannels.VA}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[9px]">
              <div 
                className={`flex items-center justify-between px-1.5 py-0.5 rounded border ${
                  stats.slaOverChannels.QRIS > 0 
                    ? 'bg-red-100/60 text-red-900 border-red-200' 
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}
                title={`QRIS: Over > ${slaConfig.QRIS_hours} Jam`}
              >
                <span className="font-medium text-[8.5px]">QRIS (&gt;{slaConfig.QRIS_hours}h)</span>
                <span className="font-mono font-bold">{stats.slaOverChannels.QRIS}</span>
              </div>
              <div 
                className={`flex items-center justify-between px-1.5 py-0.5 rounded border ${
                  stats.slaOverChannels.CARD > 0 
                    ? 'bg-red-100/60 text-red-900 border-red-200' 
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}
                title={`CARD: Over > ${slaConfig.CARD_hours} Jam`}
              >
                <span className="font-medium text-[8.5px]">CARD (&gt;{slaConfig.CARD_hours}h)</span>
                <span className="font-mono font-bold">{stats.slaOverChannels.CARD}</span>
              </div>
            </div>

            {/* Footer Card 5: Over SLA / Total Active Case format */}
            <div className="pt-1.5 border-t border-red-100/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-500 font-medium text-[9.5px]">Over / Active:</span>
              <span className="font-mono font-bold text-red-700 bg-red-100/80 px-1.5 py-0.2 rounded border border-red-200">
                {stats.overSlaTotal} / {stats.totalActive}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 6: CLOSED CASE (AS-IS) */}
        <div 
          id="stat-card-closed-case"
          onClick={() => handleCardClick('CLOSED', 'investigation-history')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-bold">
                Closed Case
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Archived
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {stats.closedTotal}
            </div>
          </div>

          {/* Sub-breakdown: System Alert vs Manual Alert */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150">
                <span className="text-slate-500 font-medium text-[9.5px]">System Alert</span>
                <span className="font-mono font-bold text-slate-800">{stats.closedSystem}</span>
              </div>
              <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-50 border border-slate-150">
                <span className="text-slate-500 font-medium text-[9.5px]">Manual Alert</span>
                <span className="font-mono font-bold text-slate-800">{stats.closedManual}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
