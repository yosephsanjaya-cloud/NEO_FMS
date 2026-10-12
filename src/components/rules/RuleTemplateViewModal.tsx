import React from 'react';
import { 
  X, 
  Layers, 
  Code, 
  History, 
  ShieldCheck, 
  User, 
  Calendar,
  CheckCircle2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { RuleTemplate } from '../../types/fms';
import { VersionBadge, TestingStatusBadge, DomainBadge } from '../common/Badge';

interface Props {
  template: RuleTemplate;
  onClose: () => void;
}

export const RuleTemplateViewModal: React.FC<Props> = ({ template, onClose }) => {
  // Generate simulated history changes based on version
  const getHistoryEntries = (tpl: RuleTemplate) => {
    const entries = [
      {
        version: 'v1.0',
        timestamp: tpl.createdOn || '2026-08-01 09:00:00',
        author: tpl.author || 'Yoseph Sanjaya (FMS Admin)',
        action: 'Initial Rule Template Creation',
        note: `Membuat blueprint template rule baru dengan ${tpl.parameters.length} parameter placeholder.`
      }
    ];

    if (tpl.version === '2.0' || tpl.version.startsWith('2.')) {
      entries.push({
        version: tpl.version,
        timestamp: tpl.updatedAt || '2026-08-25 11:30:00',
        author: 'Hendra Gunawan (FMS Senior Risk)',
        action: 'Major Update & Parameter Placeholder Revision',
        note: 'Menambahkan/memperbarui struktur parameter placeholder. Memicu status Out of Sync pada Rule Basic terkait.'
      });
    } else if (tpl.version !== '1.0') {
      entries.push({
        version: tpl.version,
        timestamp: tpl.updatedAt || '2026-08-15 14:20:00',
        author: tpl.author || 'Yoseph Sanjaya (FMS Admin)',
        action: 'Minor Update (SQL Logic / Description)',
        note: 'Pembaruan logika query SQL / deskripsi template tanpa mengubah struktur parameter placeholder.'
      });
    }

    return entries;
  };

  const historyEntries = getHistoryEntries(template);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Detail Rule Template: {template.code}</h3>
                <VersionBadge version={template.version} />
                <TestingStatusBadge status={template.testingStatus} />
              </div>
              <p className="text-xs text-slate-500">
                {template.name} • Domain: {template.domain || 'Fraud'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-mono block">Status Publikasi</span>
              <span className={`font-bold text-xs mt-0.5 inline-block ${template.status === 'Active' ? 'text-emerald-700' : 'text-slate-600'}`}>
                {template.status}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-mono block">Domain Engine</span>
              <span className="font-bold text-xs text-slate-800 mt-0.5 inline-block">
                {template.domain || 'Fraud'} Detection
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-mono block">Author Pembuat</span>
              <span className="font-semibold text-slate-800 mt-0.5 block truncate" title={template.author}>
                {template.author}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-mono block">Terakhir Diperbarui</span>
              <span className="font-mono text-slate-700 mt-0.5 block text-[11px]">
                {template.updatedAt}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs">Deskripsi Blueprint Aturan:</h4>
            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              {template.description}
            </p>
          </div>

          {/* AI Copilot Intelligence Card (if template was assisted by AI) */}
          {template.aiCopilot?.isAiGenerated && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-purple-50/90 border border-indigo-200 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-indigo-950 text-xs">
                    Disusun dengan Bantuan AI Rule Copilot
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Efisiensi: {template.aiCopilot.efficiencyScore || 94}/100
                </span>
              </div>

              {template.aiCopilot.prompt && (
                <div className="text-[11px] bg-white/80 p-2.5 rounded-lg border border-indigo-100 space-y-0.5">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                    Prompt Kebutuhan dari Maker (Bahasa Alami):
                  </span>
                  <p className="text-slate-800 italic">"{template.aiCopilot.prompt}"</p>
                </div>
              )}

              {template.aiCopilot.technicalSummary && (
                <div className="text-[11px] bg-white/80 p-2.5 rounded-lg border border-indigo-100 space-y-0.5">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                    Ringkasan Teknis AI (Untuk Review L2 Checker):
                  </span>
                  <p className="text-slate-700 leading-relaxed">{template.aiCopilot.technicalSummary}</p>
                </div>
              )}

              {template.aiCopilot.optimizationTips && template.aiCopilot.optimizationTips.length > 0 && (
                <div className="text-[10px] text-indigo-900 bg-indigo-100/60 p-2 rounded-lg space-y-1">
                  <span className="font-bold block">Rekomendasi Indeks DB dari AI:</span>
                  <ul className="list-disc list-inside font-mono text-[10px] text-indigo-800">
                    {template.aiCopilot.optimizationTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Parameters / Placeholders */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Parameter Placeholders ({template.parameters.length}):</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Digunakan sebagai variabel dinamis pada Rule Basic</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {template.parameters.map(p => (
                <div key={p.id} className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-blue-700 text-[11px]">{p.key}</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-sans font-semibold">
                      {p.dataType}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{p.label}</div>
                  <div className="text-[11px] text-slate-500 flex justify-between font-mono pt-1 border-t border-slate-100">
                    <span>Default: <strong className="text-slate-800">{String(p.defaultValue)} {p.unit || ''}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SQL Query Logic */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Code className="w-4 h-4 text-blue-600" />
                <span>Blueprint Query Logic (SQL / CQL Expression):</span>
              </h4>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {template.queryLogic}
            </pre>
          </div>

          {/* History Changes / Audit Trail */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <History className="w-4 h-4 text-amber-600" />
              <span>History Changes &amp; Version Audit Trail:</span>
            </h4>

            <div className="space-y-2">
              {historyEntries.map((h, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-500 font-sans">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {h.version}
                      </span>
                      <span className="font-bold text-slate-900">{h.action}</span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{h.timestamp}</span>
                  </div>
                  <div className="text-slate-700 font-sans text-xs mt-1">
                    {h.note}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    Author: <span className="text-slate-700 font-semibold">{h.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
