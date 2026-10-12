import React from 'react';
import { ShieldAlert, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveNavTab } from '../../types/fms';

export const CaseApprovalWidget: React.FC = () => {
  const { fraudCases, setActiveTab } = useFMS();
  const { user } = useAuth();
  
  const isSysAdmin = user?.riskDomain === 'FULL ACCESS' || user?.username === 'sysadmin';
  const isAfc = user?.riskDomain === 'FRAUD ONLY' || user?.username?.includes('afc');
  const isAnalyst = user?.riskDomain === 'AML ONLY' || user?.username?.includes('analyst');

  const showFraud = isSysAdmin || isAfc;
  const showAml = isSysAdmin || isAnalyst;

  // Filter pending cases
  const pendingCases = fraudCases.filter(c => c.alertStatus === 'Pending Approval');
  
  const fraudSystemCasesCount = pendingCases.filter(c => c.alertCategory === 'Fraud' && !c.isManualAlert).length;
  const fraudManualCasesCount = pendingCases.filter(c => c.alertCategory === 'Fraud' && c.isManualAlert).length;
  const fraudCaseTotal = fraudSystemCasesCount + fraudManualCasesCount;
  
  const amlSystemCasesCount = pendingCases.filter(c => c.alertCategory === 'AML' && !c.isManualAlert).length;
  const amlManualCasesCount = pendingCases.filter(c => c.alertCategory === 'AML' && c.isManualAlert).length;
  const amlCaseTotal = amlSystemCasesCount + amlManualCasesCount;

  const handleNavigate = (tab: ActiveNavTab, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveTab(tab);
  };

  if (!showFraud && !showAml) {
    return null;
  }

  return (
    <div className="space-y-5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Case Investigation Approvals</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">
                Role: {user?.role || 'N/A'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Antrean persetujuan kasus investigasi (Manual & System Alerts).
            </p>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${(showFraud && showAml) ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
        {showFraud && (
          <div
            id="stat-card-case-fraud"
            onClick={() => handleNavigate('manual-alert-fraud')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden h-full"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition">Fraud Case Approvals</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">System & Manual Alerts</p>
                  </div>
                </div>
                {fraudCaseTotal > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-600 text-white shadow-2xs">
                    {fraudCaseTotal} Kasus
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>All Clear</span>
                  </span>
                )}
              </div>
              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                <div 
                  onClick={(e) => handleNavigate('alert-fraud', e)}
                  className="flex items-center justify-between text-slate-600 hover:text-red-600 hover:bg-red-50/50 px-2.5 py-1.5 rounded transition"
                >
                  <span className="text-xs font-medium">System Alert (Fraud)</span>
                  <span className={`font-mono text-xs font-bold ${fraudSystemCasesCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {fraudSystemCasesCount} Kasus
                  </span>
                </div>
                <div 
                  onClick={(e) => handleNavigate('manual-alert-fraud', e)}
                  className="flex items-center justify-between text-slate-600 hover:text-red-600 hover:bg-red-50/50 px-2.5 py-1.5 rounded transition"
                >
                  <span className="text-xs font-medium">Manual Alert (Fraud)</span>
                  <span className={`font-mono text-xs font-bold ${fraudManualCasesCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {fraudManualCasesCount} Kasus
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-red-600 font-semibold group-hover:text-red-700">
              <span>Buka Fraud Case Management</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        )}

        {showAml && (
          <div
            id="stat-card-case-aml"
            onClick={() => handleNavigate('case-system-alert-aml')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden h-full"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition">AML Case Approvals</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">System & Manual Alerts</p>
                  </div>
                </div>
                {amlCaseTotal > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-600 text-white shadow-2xs">
                    {amlCaseTotal} Kasus
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>All Clear</span>
                  </span>
                )}
              </div>
              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                <div 
                  onClick={(e) => handleNavigate('case-system-alert-aml', e)}
                  className="flex items-center justify-between text-slate-600 hover:text-purple-600 hover:bg-purple-50/50 px-2.5 py-1.5 rounded transition"
                >
                  <span className="text-xs font-medium">System Alert (AML)</span>
                  <span className={`font-mono text-xs font-bold ${amlSystemCasesCount > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                    {amlSystemCasesCount} Kasus
                  </span>
                </div>
                <div 
                  onClick={(e) => handleNavigate('manual-alert-aml', e)}
                  className="flex items-center justify-between text-slate-600 hover:text-purple-600 hover:bg-purple-50/50 px-2.5 py-1.5 rounded transition"
                >
                  <span className="text-xs font-medium">Manual Alert (AML)</span>
                  <span className={`font-mono text-xs font-bold ${amlManualCasesCount > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                    {amlManualCasesCount} Kasus
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-semibold group-hover:text-purple-700">
              <span>Buka AML Case Management</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
