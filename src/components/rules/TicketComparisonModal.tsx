import React, { useState } from 'react';
import { 
  X, 
  GitCompare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  FileCheck, 
  User, 
  Clock, 
  MessageSquare,
  ShieldAlert,
  Code2,
  SlidersHorizontal,
  Zap,
  Info,
  Sparkles
} from 'lucide-react';
import { RuleApprovalTicket, RuleTemplate, RuleBasic } from '../../types/fms';
import { useFMS } from '../../context/FMSContext';
import { formatIDR } from '../../lib/utils';

interface TicketComparisonModalProps {
  ticket: RuleApprovalTicket;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TicketComparisonModal: React.FC<TicketComparisonModalProps> = ({
  ticket,
  onClose,
  onSuccess
}) => {
  const { approveRuleTicket, rejectRuleTicket } = useFMS();
  const [checkerNotes, setCheckerNotes] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isTemplate = ticket.targetType === 'Template';
  const isBasic = ticket.targetType === 'Basic';

  const prevTpl = isTemplate ? (ticket.previousData as RuleTemplate | null) : null;
  const propTpl = isTemplate ? (ticket.proposedData as RuleTemplate | null) : null;

  const prevBasic = isBasic ? (ticket.previousData as RuleBasic | null) : null;
  const propBasic = isBasic ? (ticket.proposedData as RuleBasic | null) : null;

  const handleApprove = () => {
    approveRuleTicket(
      ticket.id,
      'Hendrawan Kusuma (L2 Checker)',
      checkerNotes.trim() || 'Disetujui. Seluruh parameter dan kriteria kepatuhan telah divalidasi sesuai SOP.'
    );
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Mohon masukkan alasan penolakan tiket.');
      return;
    }
    rejectRuleTicket(
      ticket.id,
      'Hendrawan Kusuma (L2 Checker)',
      rejectReason.trim()
    );
    if (onSuccess) onSuccess();
    onClose();
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">CREATE (Baru)</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">UPDATE (Revisi)</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">DELETE (Hapus)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  {ticket.ticketNo}
                </span>
                {getActionBadge(ticket.actionType)}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  ticket.domain === 'Fraud' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {ticket.domain} Domain
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Tinjauan Persetujuan Rule {ticket.targetType}: {ticket.targetName} ({ticket.targetCode})
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Header / Maker Info */}
        <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-700">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Diajukan oleh: <strong>{ticket.makerName}</strong> ({ticket.makerRole})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{ticket.createdAt}</span>
            </div>
          </div>
          <div className="text-slate-600 font-medium italic">
            Ringkasan: &ldquo;{ticket.changeSummary}&rdquo;
          </div>
        </div>

        {/* Comparison Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1 bg-slate-50/30">
          
          {/* Maker notes box */}
          {ticket.makerNotes && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900">
              <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-950">Catatan &amp; Justifikasi Maker:</span>
                <p className="mt-0.5 leading-relaxed">{ticket.makerNotes}</p>
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: PREVIOUS (Active) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {ticket.actionType === 'CREATE' ? 'Kondisi Saat Ini (Belum Ada)' : `Konfigurasi Aktif (v${ticket.versionFrom || '1.0'})`}
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Previous</span>
              </div>

              {ticket.actionType === 'CREATE' ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Info className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-medium">Rule ini merupakan pengajuan baru (Create New).</p>
                  <p className="text-[11px]">Tidak ada konfigurasi eksisting sebelumnya di database.</p>
                </div>
              ) : isTemplate && prevTpl ? (
                /* Template Previous */
                <div className="space-y-3 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nama Template:</span>
                    <span className="font-semibold text-slate-900">{prevTpl.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Deskripsi:</span>
                    <p className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700 text-[11px]">
                      {prevTpl.description}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Variable Placeholders ({prevTpl.parameters.length}):</span>
                    <div className="space-y-1.5">
                      {prevTpl.parameters.map(p => (
                        <div key={p.id} className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                          <div>
                            <span className="font-mono font-bold text-blue-700">{p.key}</span>
                            <span className="text-slate-500 block text-[10px]">{p.label}</span>
                          </div>
                          <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {String(p.defaultValue)} {p.unit || ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {prevTpl.queryLogic && (
                    <div>
                      <span className="text-slate-500 block text-[11px] mb-1">Query Expression / Logic:</span>
                      <pre className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                        {prevTpl.queryLogic}
                      </pre>
                    </div>
                  )}
                </div>
              ) : isBasic && prevBasic ? (
                /* Basic Previous */
                <div className="space-y-3 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nama Rule Basic:</span>
                    <span className="font-semibold text-slate-900">{prevBasic.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Base Score</span>
                      <span className="font-bold text-slate-900 text-sm">{prevBasic.baseScore} Pts</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Case Urgency</span>
                      <span className="font-bold text-slate-900 text-sm">{prevBasic.caseUrgency}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Parameter Values:</span>
                    <div className="space-y-1.5">
                      {Object.entries(prevBasic.parameterValues || {}).map(([k, v]) => (
                        <div key={k} className="p-2 rounded bg-slate-50 border border-slate-200 flex justify-between items-center">
                          <span className="font-mono font-bold text-slate-700">{k}</span>
                          <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {typeof v === 'number' && v > 1000 ? formatIDR(v) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Auto-Block Config:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px]">
                        <span className={`w-2 h-2 rounded-full ${prevBasic.autoBlock?.sourceAccountNumber ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>Source Account: {prevBasic.autoBlock?.sourceAccountNumber ? 'Aktif' : 'Non-aktif'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px]">
                        <span className={`w-2 h-2 rounded-full ${prevBasic.autoBlock?.deviceId ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>Device ID: {prevBasic.autoBlock?.deviceId ? 'Aktif' : 'Non-aktif'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : ticket.targetType === 'Watchlist Location' && ticket.previousData ? (
                /* Watchlist Location Previous Data */
                <div className="space-y-2.5 text-slate-700 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nama Lokasi</span>
                    <span className="font-semibold text-slate-800">{ticket.previousData.name || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Latitude</span>
                      <span className="font-mono text-slate-700">{ticket.previousData.latitude ?? '-'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Longitude</span>
                      <span className="font-mono text-slate-700">{ticket.previousData.longitude ?? '-'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status Operasional</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                        ticket.previousData.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {ticket.previousData.status || '-'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Radius Pemantauan</span>
                      <span className="font-mono text-slate-700">{ticket.previousData.radiusKm ? `${ticket.previousData.radiusKm} km` : '-'}</span>
                    </div>
                  </div>
                  {ticket.previousData.notes && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Catatan Intelijen</span>
                      <span className="text-slate-600 italic text-[11px]">{ticket.previousData.notes}</span>
                    </div>
                  )}
                </div>
              ) : ticket.previousData ? (
                /* Fallback Previous Data for Formula / List / Generic */
                <div className="space-y-2 text-slate-700">
                  {Object.entries(ticket.previousData).map(([k, v]) => {
                    if (k === 'id' || k === 'createdAt') return null;
                    if (typeof v === 'object' && v !== null) {
                      return (
                        <div key={k}>
                          <span className="text-slate-500 block text-[11px] font-semibold capitalize">{k}:</span>
                          <pre className="p-2 bg-slate-50 rounded border border-slate-200 text-[10px] font-mono whitespace-pre-wrap">
                            {JSON.stringify(v, null, 2)}
                          </pre>
                        </div>
                      );
                    }
                    return (
                      <div key={k} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-500 capitalize">{k}:</span>
                        <span className="font-semibold text-slate-900">{String(v)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* RIGHT COLUMN: PROPOSED (Proposed by Maker) */}
            <div className={`p-4 rounded-xl border shadow-xs space-y-4 ${
              ticket.actionType === 'DELETE' 
                ? 'bg-rose-50/50 border-rose-200' 
                : 'bg-emerald-50/30 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    ticket.actionType === 'DELETE' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}></span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {ticket.actionType === 'DELETE' 
                      ? 'Permintaan Decommission / Hapus' 
                      : `Usulan Perubahan Maker (v${ticket.versionTo || '1.0'})`}
                  </h4>
                </div>
                <span className={`text-[11px] font-mono font-bold ${
                  ticket.actionType === 'DELETE' ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  Proposed
                </span>
              </div>

              {ticket.actionType === 'DELETE' ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3 text-rose-900">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    <span>Konfirmasi Penghapusan Rule</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Maker mengajukan penonaktifan permanen pada rule <strong>{ticket.targetCode}</strong>.
                    Jika disetujui, rule ini akan dihentikan dari pemantauan mesin deteksi real-time.
                  </p>
                </div>
              ) : isTemplate && propTpl ? (
                /* Template Proposed */
                <div className="space-y-3 text-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nama Template:</span>
                    <span className={`font-semibold ${propTpl.name !== prevTpl?.name ? 'text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded' : 'text-slate-900'}`}>
                      {propTpl.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Deskripsi:</span>
                    <p className={`p-2 rounded border text-[11px] ${
                      propTpl.description !== prevTpl?.description ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      {propTpl.description}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Variable Placeholders ({propTpl.parameters.length}):</span>
                    <div className="space-y-1.5">
                      {propTpl.parameters.map(p => {
                        const oldP = prevTpl?.parameters.find(op => op.key === p.key);
                        const isChanged = !oldP || oldP.defaultValue !== p.defaultValue;
                        return (
                          <div 
                            key={p.id} 
                            className={`p-2 rounded border flex justify-between items-center ${
                              isChanged ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div>
                              <span className="font-mono font-bold text-blue-700">{p.key}</span>
                              <span className="text-slate-500 block text-[10px]">{p.label}</span>
                            </div>
                            <div className="text-right">
                              <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${
                                isChanged ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 text-slate-800 border-slate-200'
                              }`}>
                                {String(p.defaultValue)} {p.unit || ''}
                              </span>
                              {isChanged && oldP && (
                                <span className="block text-[9px] text-slate-400 line-through mt-0.5">
                                  Sebelum: {String(oldP.defaultValue)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {propTpl.queryLogic && (
                    <div>
                      <span className="text-slate-500 block text-[11px] mb-1">Query Expression / Logic (Usulan):</span>
                      <pre className={`p-2.5 font-mono text-[10px] rounded-lg overflow-x-auto whitespace-pre-wrap ${
                        propTpl.queryLogic !== prevTpl?.queryLogic ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-slate-900 text-emerald-400'
                      }`}>
                        {propTpl.queryLogic}
                      </pre>
                    </div>
                  )}

                  {/* AI Copilot Review Card for Checker */}
                  {propTpl.aiCopilot?.isAiGenerated && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>AI Copilot Blueprint Audit (L2 Review)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                          Skor Efisiensi: {propTpl.aiCopilot.efficiencyScore || 94}/100
                        </span>
                      </div>
                      {propTpl.aiCopilot.prompt && (
                        <div className="bg-white/80 p-2 rounded border border-indigo-100 text-[11px]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Skenario Asli dari Maker:</span>
                          <span className="text-slate-800 italic">"{propTpl.aiCopilot.prompt}"</span>
                        </div>
                      )}
                      {propTpl.aiCopilot.technicalSummary && (
                        <div className="bg-white/80 p-2 rounded border border-indigo-100 text-[11px]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Alur Logika & Analisa Kasus:</span>
                          <p className="text-slate-700 leading-relaxed">{propTpl.aiCopilot.technicalSummary}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : isBasic && propBasic ? (
                /* Basic Proposed */
                <div className="space-y-3 text-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nama Rule Basic:</span>
                    <span className={`font-semibold ${propBasic.name !== prevBasic?.name ? 'text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded' : 'text-slate-900'}`}>
                      {propBasic.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded border ${
                      propBasic.baseScore !== prevBasic?.baseScore ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'
                    }`}>
                      <span className="text-slate-400 block text-[10px]">Base Score (Usulan)</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-emerald-700 text-sm">{propBasic.baseScore} Pts</span>
                        {prevBasic && propBasic.baseScore !== prevBasic.baseScore && (
                          <span className="text-[10px] text-slate-400 line-through">({prevBasic.baseScore})</span>
                        )}
                      </div>
                    </div>
                    <div className={`p-2 rounded border ${
                      propBasic.caseUrgency !== prevBasic?.caseUrgency ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'
                    }`}>
                      <span className="text-slate-400 block text-[10px]">Case Urgency (Usulan)</span>
                      <span className="font-bold text-emerald-700 text-sm">{propBasic.caseUrgency}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Parameter Values (Usulan):</span>
                    <div className="space-y-1.5">
                      {Object.entries(propBasic.parameterValues || {}).map(([k, v]) => {
                        const oldVal = prevBasic?.parameterValues?.[k];
                        const isValChanged = oldVal !== undefined && oldVal !== v;
                        return (
                          <div 
                            key={k} 
                            className={`p-2 rounded border flex justify-between items-center ${
                              isValChanged ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200' : 'bg-white border-slate-200'
                            }`}
                          >
                            <span className="font-mono font-bold text-slate-700">{k}</span>
                            <div className="text-right">
                              <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${
                                isValChanged ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 text-slate-900 border-slate-200'
                              }`}>
                                {typeof v === 'number' && v > 1000 ? formatIDR(v) : String(v)}
                              </span>
                              {isValChanged && (
                                <span className="block text-[9px] text-slate-400 line-through mt-0.5">
                                  Sebelum: {typeof oldVal === 'number' && oldVal > 1000 ? formatIDR(oldVal) : String(oldVal)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] mb-1">Auto-Block Config (Usulan):</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className={`flex items-center gap-1.5 p-1.5 rounded border text-[11px] ${
                        propBasic.autoBlock?.sourceAccountNumber !== prevBasic?.autoBlock?.sourceAccountNumber
                          ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                          : 'bg-white border-slate-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${propBasic.autoBlock?.sourceAccountNumber ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>Source Account: {propBasic.autoBlock?.sourceAccountNumber ? 'Aktif' : 'Non-aktif'}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 p-1.5 rounded border text-[11px] ${
                        propBasic.autoBlock?.deviceId !== prevBasic?.autoBlock?.deviceId
                          ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                          : 'bg-white border-slate-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${propBasic.autoBlock?.deviceId ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>Device ID: {propBasic.autoBlock?.deviceId ? 'Aktif' : 'Non-aktif'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : ticket.targetType === 'Batch Upload List' || ticket.proposedData?.entries ? (
                /* Batch Upload Preview for Checker */
                <div className="space-y-3 text-slate-800">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Batch Identifier:</span>
                      <span className="font-mono font-bold text-slate-900">{ticket.proposedData.batchId || ticket.targetCode}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Entitas:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {ticket.proposedData.totalEntries || ticket.proposedData.entries?.length || 0} Data
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Nama Berkas:</span>
                    <span className="font-medium text-slate-800 truncate block">{ticket.proposedData.fileName || 'upload.csv'}</span>
                  </div>

                  {/* Table of Proposed Batch Entities */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      Daftar Entitas yang Diajukan ({ticket.proposedData.entries?.length || 0}):
                    </span>
                    <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0">
                          <tr>
                            <th className="px-2.5 py-1.5">CIF</th>
                            <th className="px-2.5 py-1.5">Rekening / Value</th>
                            <th className="px-2.5 py-1.5">Nama Nasabah</th>
                            <th className="px-2.5 py-1.5 text-right">Bobot</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(ticket.proposedData.entries || []).map((e: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="px-2.5 py-1.5 font-mono font-bold text-slate-900">{e.cif || '-'}</td>
                              <td className="px-2.5 py-1.5 font-mono text-slate-700 truncate max-w-[120px]" title={e.value}>
                                {e.value || e.accountNumber}
                              </td>
                              <td className="px-2.5 py-1.5 font-medium text-slate-800 truncate max-w-[140px]" title={e.holderName}>
                                {e.holderName}
                              </td>
                              <td className="px-2.5 py-1.5 text-right font-mono font-bold text-rose-600">
                                {e.riskWeight || 50}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : ticket.targetType === 'Watchlist Location' && ticket.proposedData ? (
                /* Watchlist Location Proposed Data */
                <div className="space-y-2.5 text-slate-800 text-xs">
                  <div className={`p-2.5 rounded-lg border ${
                    ticket.previousData?.name !== ticket.proposedData.name
                      ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nama Lokasi (Usulan)</span>
                    <span className="font-semibold text-slate-900">{ticket.proposedData.name || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2.5 rounded-lg border ${
                      ticket.previousData?.latitude !== ticket.proposedData.latitude
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-slate-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Latitude (Usulan)</span>
                      <span className="font-mono font-bold text-emerald-800">{ticket.proposedData.latitude ?? '-'}</span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${
                      ticket.previousData?.longitude !== ticket.proposedData.longitude
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-slate-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Longitude (Usulan)</span>
                      <span className="font-mono font-bold text-emerald-800">{ticket.proposedData.longitude ?? '-'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2.5 rounded-lg border ${
                      ticket.previousData?.status !== ticket.proposedData.status
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-slate-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status Operasional (Usulan)</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                        ticket.proposedData.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ticket.proposedData.status || '-'}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${
                      ticket.previousData?.radiusKm !== ticket.proposedData.radiusKm
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-slate-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Radius Pemantauan</span>
                      <span className="font-mono font-bold text-emerald-800">{ticket.proposedData.radiusKm ? `${ticket.proposedData.radiusKm} km` : '-'}</span>
                    </div>
                  </div>
                  {ticket.proposedData.notes && (
                    <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block mb-1">Catatan / Justifikasi Usulan</span>
                      <span className="text-slate-700 italic text-[11px]">{ticket.proposedData.notes}</span>
                    </div>
                  )}
                </div>
              ) : ticket.proposedData ? (
                /* Fallback Proposed Data for Formula / List / Generic */
                <div className="space-y-2 text-slate-800">
                  {Object.entries(ticket.proposedData).map(([k, v]) => {
                    if (k === 'id' || k === 'createdAt') return null;
                    const prevVal = ticket.previousData ? (ticket.previousData as any)[k] : undefined;
                    const isValChanged = prevVal !== undefined && JSON.stringify(prevVal) !== JSON.stringify(v);
                    if (typeof v === 'object' && v !== null) {
                      return (
                        <div key={k}>
                          <span className="text-slate-500 block text-[11px] font-semibold capitalize">{k} (Usulan):</span>
                          <pre className={`p-2 rounded border text-[10px] font-mono whitespace-pre-wrap ${
                            isValChanged ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white border-slate-200 text-slate-800'
                          }`}>
                            {JSON.stringify(v, null, 2)}
                          </pre>
                        </div>
                      );
                    }
                    return (
                      <div key={k} className={`flex items-center justify-between p-2 rounded border text-xs ${
                        isValChanged ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-slate-500 capitalize">{k}:</span>
                        <span className={`font-semibold ${isValChanged ? 'text-emerald-800 font-bold' : 'text-slate-900'}`}>
                          {String(v)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

          </div>

          {/* Checker Input & Actions Section */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Persetujuan Supervisor (L2 Checker)</span>
            </h4>

            {isRejecting ? (
              <div className="space-y-2 bg-rose-50 p-3 rounded-lg border border-rose-200">
                <label className="font-bold text-rose-900 block text-xs">
                  Alasan Penolakan Tiket (Wajib diisi):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Tuliskan catatan alasan penolakan untuk Maker..."
                  className="w-full p-2 text-xs bg-white border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-400 outline-none"
                  rows={2}
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsRejecting(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 cursor-pointer"
                  >
                    Batal Tolak
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Konfirmasi Tolak Tiket</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={checkerNotes}
                  onChange={e => setCheckerNotes(e.target.value)}
                  placeholder="Catatan persetujuan Checker (opsional)..."
                  className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Aksi approval akan langsung menerapkan usulan ke konfigurasi mesin aktif.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRejecting(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Tolak Pengajuan</span>
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Setujui &amp; Terapkan (Approve)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
