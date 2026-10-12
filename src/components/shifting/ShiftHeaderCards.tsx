import React from 'react';
import { useFMS } from '../../context/FMSContext';
import { 
  Clock, 
  Users, 
  ArrowRightLeft, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { SHIFT_DEFINITIONS } from '../../data/mockShiftData';

export const ShiftHeaderCards: React.FC = () => {
  const { 
    activeShiftDef, 
    onDutyInvestigators, 
    shiftHandovers, 
    fraudCases, 
    shiftSchedules,
    investigators 
  } = useFMS();

  // Next shift calculation
  const nextShiftDef = React.useMemo(() => {
    if (activeShiftDef.code === 'SHIFT-1') return SHIFT_DEFINITIONS[1];
    if (activeShiftDef.code === 'SHIFT-2') return SHIFT_DEFINITIONS[2];
    return SHIFT_DEFINITIONS[0];
  }, [activeShiftDef]);

  // Pending handovers
  const pendingHandovers = shiftHandovers.filter(h => h.status === 'Pending');
  const pendingCriticalCaseCount = pendingHandovers.reduce((acc, h) => acc + (h.caseIds?.length || 0), 0);

  // Active open cases count
  const openCasesCount = fraudCases.filter(c => c.alertStatus === 'Open' || c.investigationStatus === 'On Check').length;

  return (
    <div id="shift-summary-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Active Shift Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none -mr-4 -mt-4"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Shift Aktif Saat Ini
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {activeShiftDef.name}
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-700 mt-0.5">
            {activeShiftDef.hours}
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Zona Waktu: <strong className="text-slate-700 font-mono">WIB (UTC+7)</strong></span>
            <span className="text-[11px] text-slate-400">Monitoring 24/7</span>
          </div>
        </div>
      </div>

      {/* 2. Investigators On Duty Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full pointer-events-none -mr-4 -mt-4"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Investigator On Duty
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {onDutyInvestigators.length} Personel
          </span>
        </div>
        <div>
          <div className="flex items-center -space-x-2 overflow-hidden py-1">
            {onDutyInvestigators.slice(0, 5).map((inv, idx) => (
              <div 
                key={inv.id} 
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white text-xs font-bold ${inv.avatarBg} shadow-xs`}
                title={`${inv.name} (${inv.role})`}
              >
                {inv.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            ))}
            {onDutyInvestigators.length > 5 && (
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white text-xs font-bold bg-slate-200 text-slate-700">
                +{onDutyInvestigators.length - 5}
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-600 truncate">
            <span className="font-semibold text-slate-800">PIC Utama: </span>
            {onDutyInvestigators.map(i => i.name).slice(0, 2).join(', ')}
            {onDutyInvestigators.length > 2 && ' dkk.'}
          </div>
        </div>
      </div>

      {/* 3. Handover Pending Cases Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full pointer-events-none -mr-4 -mt-4"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
            Handover Pending Cases
          </span>
          {pendingHandovers.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {pendingHandovers.length} Antrean
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
              Clear
            </span>
          )}
        </div>
        <div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{pendingCriticalCaseCount}</span>
            <span className="text-xs text-slate-500">kasus dialihkan dari shift sebelumnya</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {pendingHandovers.length > 0 ? 'Perlu Acknowledge PIC' : 'Semua Handover Selesai'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Active: {openCasesCount}</span>
          </div>
        </div>
      </div>

      {/* 4. Next Shift Group Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full pointer-events-none -mr-4 -mt-4"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Next Shift Group
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Berikutnya
          </span>
        </div>
        <div className="mt-1">
          <div className="text-lg font-bold text-slate-900 tracking-tight">
            {nextShiftDef.name}
          </div>
          <div className="text-xs font-mono font-semibold text-purple-700 mt-0.5">
            {nextShiftDef.hours}
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Estimasi Roster: <strong className="text-slate-700">Ready</strong></span>
            <span className="text-[11px] text-purple-600 font-semibold">Persiapkan Serah Terima</span>
          </div>
        </div>
      </div>

    </div>
  );
};
