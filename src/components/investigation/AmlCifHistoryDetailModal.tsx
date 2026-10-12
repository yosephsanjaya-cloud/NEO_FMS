import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  FileText, 
  Layers, 
  AlertTriangle, 
  CreditCard, 
  Building2, 
  Printer, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { AmlCifHistoryGroup, AmlChildRuleHistoryItem } from '../../types/fms';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { formatTaxonomyLabel } from '../../lib/taxonomyHelper';
import { formatRupiah, cn } from '../../lib/utils';
import { UrgencyBadge } from '../common/Badge';

interface AmlCifHistoryDetailModalProps {
  group: AmlCifHistoryGroup | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AmlCifHistoryDetailModal: React.FC<AmlCifHistoryDetailModalProps> = ({
  group,
  isOpen,
  onClose
}) => {
  const { updateInvestigationHistoryItem } = useFMS();
  const { user } = useAuth();
  const [copiedCif, setCopiedCif] = useState(false);
  const [expandedRuleIndex, setExpandedRuleIndex] = useState<number | null>(0);

  if (!isOpen || !group) return null;


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !group) return;
    const file = e.target.files[0];
    const newFile = {
      id: Math.random().toString(36).substring(7),
      fileName: file.name,
      fileSize: file.size,
      uploadedBy: user?.username || 'CurrentUser',
      uploadedRole: user?.role || 'user',
      timestamp: new Date().toLocaleString('id-ID')
    };
    const updatedGroup = {
      ...group,
      postClosureAttachments: [...(group.postClosureAttachments || []), newFile]
    };
    updateInvestigationHistoryItem(updatedGroup);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!group) return;
    const updatedGroup = {
      ...group,
      postClosureAttachments: (group.postClosureAttachments || []).filter(f => f.id !== fileId)
    };
    updateInvestigationHistoryItem(updatedGroup);
  };

  const handleCopyCif = () => {
    navigator.clipboard.writeText(group.cif);
    setCopiedCif(true);
    setTimeout(() => setCopiedCif(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Batch ID: {group.batchId || `BATCH-20260825-${group.cif.replace(/[^0-9]/g, '') || '001'}`}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  CIF: {group.cif}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  CLOSED
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Audit Snapshot (Read-Only)
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                {group.customerName}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5 cursor-pointer print:hidden"
              title="Cetak Audit Record"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer print:hidden"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Section 1: Customer Profile & Overview Banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Batch ID</span>
              <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 inline-block px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                {group.batchId || `BATCH-20260825-${group.cif.replace(/[^0-9]/g, '') || '001'}`}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Nomor CIF Nasabah</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-blue-700 text-sm">{group.cif}</span>
                <button
                  onClick={handleCopyCif}
                  className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                  title="Salin CIF"
                >
                  {copiedCif ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Tipe Nasabah</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {group.customerType || 'Corporate'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Total Rules Resolved</span>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-800 border border-blue-200">
                {group.totalRulesResolved} Rules Resolved
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Highest Risk Score</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  "px-2 py-0.5 rounded font-mono font-bold text-xs shadow-2xs border",
                  group.highestRiskScore >= 80 
                    ? "bg-red-50 text-red-700 border-red-200" 
                    : group.highestRiskScore >= 50 
                    ? "bg-amber-50 text-amber-800 border-amber-200" 
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                )}>
                  {group.highestRiskScore} Pts
                </span>
                <span className="text-slate-400 text-[11px]">
                  {group.highestRiskScore >= 80 ? '(High)' : '(Medium)'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Dual Control & Decision Summary (Hasil Penanganan & Action Codes) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Hasil Tindak Lanjut &amp; Catatan Persetujuan Audit
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Approved: {group.completionDate} WIB
              </span>
            </div>

            {/* Action Codes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* Reviewer Result */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Reviewer Result (L1)
                </span>
                <span className="mt-1 font-mono font-bold text-xs text-amber-900 block truncate" title={group.overallReviewerResult}>
                  {formatTaxonomyLabel(group.overallReviewerResult, 'AML')}
                </span>
              </div>

              {/* Final Result */}
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block font-mono">
                  Final Result (Keputusan)
                </span>
                <span className="mt-1 font-mono font-bold text-xs text-red-800 block truncate" title={group.overallFinalResult}>
                  {formatTaxonomyLabel(group.overallFinalResult, 'AML')}
                </span>
              </div>

              {/* Closing Action */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block font-mono">
                  Closing Action Code
                </span>
                <span className="mt-1 font-mono font-bold text-xs text-blue-800 block truncate" title={group.overallClosingAction}>
                  {formatTaxonomyLabel(group.overallClosingAction, 'AML')}
                </span>
              </div>

              {/* Type of AML Threat */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Tipe Ancaman AML
                </span>
                <span className="mt-1 font-mono font-bold text-xs text-slate-800 block truncate" title={group.overallTypeOfAml}>
                  {formatTaxonomyLabel(group.overallTypeOfAml, 'AML')}
                </span>
              </div>
            </div>

            {/* Dual Control Officers Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* L1 Maker */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Investigator L1 (Maker): <span className="text-blue-700 font-mono">{group.l1Maker?.name || 'analystl1'}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {group.l1Maker?.actionTime || group.completionDate}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic bg-white p-2 rounded border border-slate-100 font-sans">
                  "{group.l1Maker?.notes || 'Rekomendasi penutupan kasus AML telah sesuai kriteria dan SOP.'}"
                </p>
              </div>

              {/* L2 Checker */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Approver L2 (Checker): <span className="text-emerald-700 font-mono">{group.l2Checker?.name || 'analystl2'}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {group.l2Checker?.actionTime || group.completionDate}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic bg-white p-2 rounded border border-emerald-100 font-sans">
                  "{group.l2Checker?.notes || 'Approved by AML Checker L2. Investigasi CIF selesai dan resmi ditutup.'}"
                </p>
              </div>
            </div>
          
            {/* Post-Closure Analysis Attachment Zone */}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-sm text-slate-900">Dokumen &amp; Laporan Hasil Analisis Akhir (Post-Closure Evidence)</h4>
                </div>
                <label className="cursor-pointer px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                  <span>+ Upload Laporan Analisis</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-slate-600">Nama Berkas</th>
                      <th className="px-4 py-2 font-semibold text-slate-600">Ukuran File</th>
                      <th className="px-4 py-2 font-semibold text-slate-600">Diupload Oleh</th>
                      <th className="px-4 py-2 font-semibold text-slate-600">Waktu Upload</th>
                      <th className="px-4 py-2 font-semibold text-slate-600 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!group.postClosureAttachments || group.postClosureAttachments.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                          Belum ada dokumen lampiran post-closure.
                        </td>
                      </tr>
                    ) : (
                      group.postClosureAttachments.map(file => (
                        <tr key={file.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-2.5 font-medium text-slate-800 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            {file.fileName}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{(file.fileSize / 1024).toFixed(1)} KB</td>
                          <td className="px-4 py-2.5">
                            <div className="font-semibold text-slate-800">{file.uploadedBy}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{file.uploadedRole}</div>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-500">{file.timestamp}</td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button type="button" className="text-blue-600 hover:text-blue-800 text-[10px] font-bold px-2 py-1 bg-blue-50 rounded border border-blue-100 transition">Preview</button>
                              <button type="button" className="text-slate-600 hover:text-slate-800 text-[10px] font-bold px-2 py-1 bg-slate-50 rounded border border-slate-200 transition">Download</button>
                              <button type="button" onClick={() => handleDeleteFile(file.id)} className="text-red-600 hover:text-red-800 text-[10px] font-bold px-2 py-1 bg-red-50 rounded border border-red-100 transition">Hapus</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
    </div>

          {/* Section 3: Daftar Case / Rule AML yang Dilanggar CIF Ini (Read-Only) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Daftar Case / Rule AML yang Dilanggar CIF Ini ({group.childRules.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Seluruh rule di bawah telah di-approve dan diselesaikan
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {group.childRules.map((rule, idx) => {
                const isExpanded = expandedRuleIndex === idx;
                return (
                  <div key={rule.id || idx} className="p-4 hover:bg-slate-50/60 transition">
                    <div 
                      className="flex items-start justify-between gap-3 cursor-pointer"
                      onClick={() => setExpandedRuleIndex(isExpanded ? null : idx)}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                            {rule.ruleCode}
                          </span>
                          <span className="font-mono text-xs text-slate-500">
                            Case ID: <strong>{rule.caseId}</strong>
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded font-mono text-[10px] font-bold",
                            rule.riskScore >= 80 ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                          )}>
                            Score: {rule.riskScore}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Closed
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {rule.ruleName}
                        </h4>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono mt-1">
                          {rule.amount ? (
                            <span>Nominal Anomali: <strong className="text-slate-800">{formatRupiah(rule.amount)}</strong></span>
                          ) : null}
                          {rule.channel ? (
                            <span>Kanal: <strong className="text-slate-700">{rule.channel}</strong></span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expandable Child Rule Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-100 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                            <span className="text-slate-400 block font-mono text-[10px]">Reviewer Result:</span>
                            <span className="font-semibold text-slate-800 font-mono">
                              {formatTaxonomyLabel(rule.reviewerResult, 'AML')}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                            <span className="text-slate-400 block font-mono text-[10px]">Final Result:</span>
                            <span className="font-semibold text-red-800 font-mono">
                              {formatTaxonomyLabel(rule.finalResult, 'AML')}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                            <span className="text-slate-400 block font-mono text-[10px]">Closing Action:</span>
                            <span className="font-semibold text-blue-800 font-mono">
                              {formatTaxonomyLabel(rule.closingAction, 'AML')}
                            </span>
                          </div>
                        </div>

                        {rule.reviewerComment && (
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                              Catatan Reviewer L1 pada Rule Ini:
                            </span>
                            <p className="text-slate-700 mt-0.5 italic">
                              "{rule.reviewerComment}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Dokumen riwayat investigasi telah terkunci secara permanen (Immutable Audit Log).</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition shadow-2xs cursor-pointer"
          >
            Tutup Ringkasan
          </button>
        </div>

      </div>
    </div>
  );
};
