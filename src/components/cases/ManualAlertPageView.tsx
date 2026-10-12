import React, { useState } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Plus, 
  Layers 
} from 'lucide-react';
import { ManualAlertView } from './ManualAlertView';
import { useFMS } from '../../context/FMSContext';

interface ManualAlertPageViewProps {
  defaultDomain?: 'Fraud' | 'AML';
}

export const ManualAlertPageView: React.FC<ManualAlertPageViewProps> = ({ defaultDomain = 'Fraud' }) => {
  const { fraudCases } = useFMS();
  const [activeDomain, setActiveDomain] = useState<'Fraud' | 'AML'>(defaultDomain);

  React.useEffect(() => {
    if (defaultDomain) {
      setActiveDomain(defaultDomain);
    }
  }, [defaultDomain]);

  const manualFraudCount = fraudCases.filter(c => c.alertCategory === 'Fraud' && (c.isManualAlert || c.alertSourceType === 'Manual')).length;
  const manualAmlCount = fraudCases.filter(c => c.alertCategory === 'AML' && (c.isManualAlert || c.alertSourceType === 'Manual')).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Case Management</span>
            <span>/</span>
            <span className="text-slate-800 font-bold">Manual Alert</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <span>Manual Alert Ingestion ({defaultDomain})</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
              defaultDomain === 'Fraud' 
                ? 'bg-red-100 text-red-700 border-red-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {defaultDomain === 'Fraud' ? `${manualFraudCount} Tiket Fraud` : `${manualAmlCount} Tiket AML`}
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan kasus {defaultDomain === 'Fraud' ? 'Fraud' : 'AML'} manual dari laporan nasabah (Call Center), temuan audit internal, dan instansi eksternal (Polri/OJK/PPATK).
          </p>
        </div>

        {/* Locked Domain Status Badge */}
        <div className="flex items-center">
          {defaultDomain === 'Fraud' ? (
            <div id="badge-locked-manual-fraud" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>Domain Manual Fraud Ingestion ({manualFraudCount} Active)</span>
            </div>
          ) : (
            <div id="badge-locked-manual-aml" className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span>Domain Manual AML Ingestion ({manualAmlCount} Active)</span>
            </div>
          )}
        </div>
      </div>

      {/* Render Active Domain View */}
      <div className="pt-2">
        <ManualAlertView domain={defaultDomain} />
      </div>
    </div>
  );
};
