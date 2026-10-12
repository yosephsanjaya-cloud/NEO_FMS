import React from 'react';
import { 
  X, 
  Columns, 
  Layers, 
  FileCheck, 
  Code, 
  Sliders 
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { RuleBasic } from '../../types/fms';
import { VersionBadge, SyncStatusBadge } from '../common/Badge';

export const ConfigComparisonModal: React.FC<{
  ruleBasic: RuleBasic;
  onClose: () => void;
}> = ({ ruleBasic, onClose }) => {
  const { ruleTemplates } = useFMS();
  const template = ruleTemplates.find(t => t.code === ruleBasic.templateCode);

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-5xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Side-by-Side Configuration Comparison</span>
                <SyncStatusBadge status={ruleBasic.syncStatus} />
              </h3>
              <p className="text-xs text-slate-500">
                Komparasi struktural parameter, query expression, dan versioning antara Template ({template.code}) &amp; Basic ({ruleBasic.code}).
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
          
          {/* Side by side columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Rule Template (Blueprint) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-blue-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-900 text-sm">Rule Template (Induk)</span>
                </div>
                <VersionBadge version={template.version} isMajor={template.version.startsWith('2.')} />
              </div>

              <div className="space-y-2 text-slate-600">
                <div>
                  <span className="text-slate-500">Template Code: </span>
                  <strong className="font-mono text-blue-700">{template.code}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Nama Template: </span>
                  <span className="font-semibold text-slate-900">{template.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Domain: </span>
                  <span className="text-blue-700 font-semibold">{template.domain || 'Fraud'}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                  {template.description}
                </p>
              </div>

              {/* Template Placeholders */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Definisi Variable Placeholders:</span>
                  <span className="text-[10px] text-slate-400 font-mono">{template.parameters.length} Variables</span>
                </div>

                <div className="space-y-1.5">
                  {template.parameters.map(p => (
                    <div key={p.id} className="p-2.5 rounded bg-white border border-slate-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-blue-700 text-[11px]">{p.key}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{p.dataType}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>{p.label}</span>
                        <span className="font-mono font-semibold text-slate-800">Def: {p.defaultValue} {p.unit || ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Query Logic */}
              <div className="space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-blue-600" />
                  <span>Query Logic Blueprint:</span>
                </div>
                <pre className="p-3 rounded bg-slate-900 text-slate-100 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                  {template.queryLogic}
                </pre>
              </div>

            </div>

            {/* Right Column: Rule Basic (Implementation) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-sm">Rule Basic (Turunan)</span>
                </div>
                <VersionBadge version={ruleBasic.version} isMajor={ruleBasic.version.startsWith('2.')} />
              </div>

              <div className="space-y-2 text-slate-600">
                <div>
                  <span className="text-slate-500">Basic Code: </span>
                  <strong className="font-mono text-emerald-700">{ruleBasic.code}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Nama Rule: </span>
                  <span className="font-semibold text-slate-900">{ruleBasic.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Target Template Ver: </span>
                  <span className="font-mono text-blue-700">v{ruleBasic.templateVersion}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                  {ruleBasic.description}
                </p>
              </div>

              {/* Basic Values */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Nilai Threshold Riil Terpasang:</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Object.keys(ruleBasic.parameterValues).length} Parameters
                  </span>
                </div>

                <div className="space-y-1.5">
                  {Object.entries(ruleBasic.parameterValues).map(([key, val]) => {
                    const isMissingInTemplate = !template.parameters.some(p => p.key === key);
                    return (
                      <div 
                        key={key} 
                        className={`p-2.5 rounded bg-white border space-y-1 ${
                          isMissingInTemplate ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-emerald-700 text-[11px]">{key}</span>
                          {isMissingInTemplate && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                              DEPRECATED DI TEMPLATE
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Nilai Operasional:</span>
                          <span className="font-mono font-bold text-slate-900">{String(val)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operational Metadata */}
              <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Konfigurasi Operasional Rule:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Base Score: <strong className="text-slate-900 font-mono">{ruleBasic.baseScore} Pts</strong></div>
                  <div>Urgency: <strong className="text-slate-900">{ruleBasic.caseUrgency}</strong></div>
                  <div>Channel: <strong className="text-slate-900">{ruleBasic.channel}</strong></div>
                  <div>Tipe Txn: <strong className="text-slate-900">{ruleBasic.txnType}</strong></div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
          >
            Tutup Komparasi
          </button>
        </div>

      </div>
    </div>
  );
};
