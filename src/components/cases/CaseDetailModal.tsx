import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  User, 
  CreditCard, 
  Smartphone, 
  MapPin, 
  Clock, 
  History, 
  Sliders,
  FileText,
  Paperclip,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  Activity
} from 'lucide-react';
import { UrgencyBadge, AlertStatusBadge, InvestigationStatusBadge } from '../common/Badge';
import { formatIDR } from '../../lib/utils';
import { useFMS } from '../../context/FMSContext';
import { getCifTransactionHistory } from '../../lib/cifHistoryHelper';
import { CaseWorkflowMilestonesView } from './CaseWorkflowMilestonesView';
import { TransactionAlertTable } from './TransactionAlertTable';

export const CaseDetailModal: React.FC = () => {
  const { 
    selectedCaseForDetail, 
    setSelectedCaseForDetail, 
    handleOpenFollowUp,
    handleApproveCase,
    handleRejectCase,
    getInvestigatorDutyStatus
  } = useFMS();

  const [showApprovalPrompt, setShowApprovalPrompt] = useState(false);
  const [approverNotes, setApproverNotes] = useState('');
  const [approverName, setApproverName] = useState('Supervisor FMS - Hendra Gunawan');
  const [activeTab, setActiveTab] = useState<'alert' | 'history'>('alert');
  const [selectedTrxDetail, setSelectedTrxDetail] = useState<any | null>(null);

  if (!selectedCaseForDetail) return null;
  const c = selectedCaseForDetail;
  const cifHistory = getCifTransactionHistory(c);

  const trx = c.transaction || {
    trxId: c.caseId,
    amount: 0,
    currency: 'IDR',
    sourceAccount: c.cif,
    destinationAccount: '-',
    destinationBank: '-',
    channel: 'Mobile Banking',
    ipAddress: '-',
    location: '-',
    deviceModel: c.deviceId,
    timestamp: c.identifiedOn,
    trxType: 'Transaction'
  };

  const handleConfirmApproval = () => {
    handleApproveCase(c.caseId, approverName, approverNotes);
    setShowApprovalPrompt(false);
  };

  const handleConfirmReject = () => {
    handleRejectCase(c.caseId, approverName, approverNotes || 'Perlu verifikasi ulang data bukti transaksi.');
    setShowApprovalPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-xl max-w-5xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold font-mono text-white tracking-wide">{c.caseId}</h3>
                <UrgencyBadge urgency={c.caseUrgency} />
                <AlertStatusBadge status={c.alertStatus} />
                <InvestigationStatusBadge status={c.investigationStatus} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Teridentifikasi: {c.identifiedOn} • Rule: <span className="font-mono text-amber-300">{c.ruleBasicCode}</span> ({c.ruleName}) • Aging: <span className="text-amber-300 font-mono font-medium">{c.aging}</span>
              </p>
            </div>
          </div>

          <button
            id="btn-close-detail-modal"
            onClick={() => setSelectedCaseForDetail(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            title="Tutup Detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pending Approval Banner */}
        {c.alertStatus === 'Pending Approval' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">STATUS: PENDING APPROVAL.</span>
                <span className="text-amber-800 ml-1">
                  Hasil follow up telah diajukan. <strong>Perlu 1x lagi Approve untuk menutup case ini secara resmi.</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                id="btn-detail-approve"
                type="button"
                onClick={() => setShowApprovalPrompt(true)}
                className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve &amp; Close Case</span>
              </button>
              <button
                id="btn-detail-reject"
                type="button"
                onClick={() => {
                  if (window.confirm('Kembalikan status case ke OPEN untuk revisi?')) {
                    handleConfirmReject();
                  }
                }}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject / Return</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
          
          {/* Top Score Calculation Breakdown Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Fraud Risk Scoring Engine Breakdown</span>
              </div>
              <div className="text-xs">
                <span className="text-slate-500">Final Risk Score: </span>
                <span className="font-mono font-bold text-sm text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {c.finalRiskScore} Pts ({c.finalRiskLevel})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <div className="text-slate-500 text-[11px]">1. Rule Base Score</div>
                <div className="text-lg font-mono font-bold text-slate-900">{c.baseScore || 65} Pts</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{c.ruleBasicCode}</div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <div className="text-slate-500 text-[11px]">2. Poin Progresif Formula Risk</div>
                <div className="text-lg font-mono font-bold text-amber-700">+{c.formulaRiskPoints || (c.finalRiskScore - (c.baseScore || 65))} Pts</div>
                <div className="text-[10px] text-slate-400">{c.formulaMatches?.length || 1} Formula Matched</div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200">
                <div className="text-blue-700 text-[11px] font-semibold">Total Composite Score</div>
                <div className="text-lg font-mono font-extrabold text-blue-900">{c.finalRiskScore} / 100</div>
                <div className="text-[10px] text-blue-600">Urgency: {c.caseUrgency} Level</div>
              </div>
            </div>

            {/* Matched Formulas */}
            {c.formulaMatches && c.formulaMatches.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-600">Rumus Formula Tambahan Terpicu:</div>
                <div className="space-y-1">
                  {c.formulaMatches.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 font-mono text-[11px]">
                      <span className="text-slate-800 font-sans">{f.name || f.formulaCode} ({f.matchedField}: {f.matchedValue})</span>
                      <span className="text-amber-700 font-bold">+{f.points} Pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Follow Up & Investigation Results Section */}
          <div className="p-4 rounded-xl bg-white border border-[#b5a363] shadow-xs space-y-3">
            <div className="font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#85712f]" />
                <span className="text-slate-900">Hasil Follow Up &amp; Investigasi Kasus</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span>Assignee: <strong className="text-slate-800">{c.assignee || c.reviewer || 'Budi Santoso'}</strong></span>
                {getInvestigatorDutyStatus(c.assignee || c.reviewer || '').isOnDuty ? (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🟢 On Duty
                  </span>
                ) : (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                    🔴 Off Duty
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Reviewer Result:</span>
                  <span className="font-semibold text-blue-800">{c.reviewerResult || (c.disposition ? c.disposition.toUpperCase() : 'NONE')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Final Result:</span>
                  <span className="font-semibold text-purple-800">{c.finalResult || 'NONE'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Closing Action:</span>
                  <span className="font-semibold text-amber-800">{c.closingAction || 'NONE'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Type of Fraud:</span>
                  <span className="font-semibold text-rose-800">{c.typeOfFraud || 'NONE'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-slate-500 font-semibold">Reviewer Comment / Catatan Investigasi:</div>
                <div className="p-3 rounded bg-[#fef7ee] border border-amber-300 text-slate-900 font-sans leading-relaxed text-[11px] min-h-[90px]">
                  {c.reviewerComment || c.resolutionNotes || 'Belum ada catatan review yang dimasukkan.'}
                </div>
              </div>
            </div>

            {/* Approval Info if Approved */}
            {c.approvedBy && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-900 font-semibold">
                    Disetujui oleh: <strong>{c.approvedBy}</strong> ({c.approvedAt})
                  </span>
                </div>
                {c.approverNotes && (
                  <span className="text-emerald-700 italic">&ldquo;{c.approverNotes}&rdquo;</span>
                )}
              </div>
            )}

            {/* Attachments list */}
            {c.attachments && c.attachments.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dokumen Bukti Terlampir ({c.attachments.length}):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {c.attachments.map(att => (
                    <div key={att.id} className="flex items-center space-x-2 p-2 bg-slate-50 border border-slate-200 rounded text-[11px]">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{att.name}</span>
                      <span className="text-[10px] text-slate-400 ml-auto shrink-0">{att.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer & Transaction Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Data */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Informasi Nasabah Terkait</span>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Nasabah:</span>
                  <span className="font-semibold text-slate-900">{c.customerName}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500 font-sans">CIF Nasabah:</span>
                  <span className="text-blue-700 font-bold">{c.cif}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500 font-sans">No. Rekening:</span>
                  <span>{trx.sourceAccount || '-'}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500 font-sans">No. Telepon:</span>
                  <span>{c.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Device ID:</span>
                  <span className="font-mono text-[11px] truncate max-w-[180px]">{c.deviceId}</span>
                </div>
              </div>
            </div>

            {/* Transaction Data */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Detail Transaksi Pemicu</span>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nominal Transaksi:</span>
                  <span className="font-mono font-bold text-red-600 text-sm">{formatIDR(trx.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel / Layanan:</span>
                  <span className="font-semibold text-slate-900">{trx.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rekening Tujuan:</span>
                  <span className="font-mono">{trx.destinationAccount} ({trx.destinationBank})</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500 font-sans">Waktu Transaksi:</span>
                  <span>{trx.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lokasi / IP:</span>
                  <span className="font-mono text-[11px]">{trx.location} ({trx.ipAddress})</span>
                </div>
              </div>
            </div>

          </div>

          {/* Tabbed Transaction Navigation (Alert & History) */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs space-y-0">
            {/* Tab Header Bar */}
            <div className="px-4 py-2 bg-slate-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('alert')}
                  className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
                    activeTab === 'alert'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Transaction Alert (1)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-t-lg font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-amber-500" />
                  <span>Transaction History ({cifHistory.length})</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-300 font-mono hidden sm:block">
                CIF: <strong className="text-white">{c.cif}</strong>
              </div>
            </div>

            {/* Tab Body */}
            <div className="p-4 bg-white space-y-3">
              {activeTab === 'alert' ? (
                /* Tab 1: Transaction Alert Table */
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      Tab 1: Transaction Alert (Kumpulan Transaksi yang Dilanggar)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-mono font-bold border border-rose-200">
                      {(c.transactionEvidenceList && c.transactionEvidenceList.length > 0 ? c.transactionEvidenceList.length : 1)} Transaksi Violations
                    </span>
                  </div>

                  <TransactionAlertTable
                    transactions={c.transactionEvidenceList && c.transactionEvidenceList.length > 0 ? c.transactionEvidenceList : [c.transaction]}
                    cif={c.cif}
                    customerName={c.customerName}
                    onSelectDetail={(selectedTrx) => setSelectedTrxDetail(selectedTrx)}
                    isAlertTab={true}
                  />
                </div>
              ) : (
                /* Tab 2: Transaction History Table */
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <History className="w-4 h-4 text-amber-700" />
                      Tab 2: Transaction History (History Transaksi CIF yang Pernah Dilakukan)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-semibold">
                      {cifHistory.length} Transaksi Recorded
                    </span>
                  </div>

                  <TransactionAlertTable
                    transactions={cifHistory}
                    cif={c.cif}
                    customerName={c.customerName}
                    onSelectDetail={(selectedTrx) => setSelectedTrxDetail(selectedTrx)}
                    isAlertTab={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Workflow Lifecycle Milestones View (Step 1 to Step 6) */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
            <div className="font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Workflow History &amp; Lifecycle (Step 1 - 6)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                Active Progress
              </span>
            </div>
            <CaseWorkflowMilestonesView fraudCase={c} />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#ece7d5] border-t border-[#d3caa8] flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Assignee: <strong className="text-slate-900 font-sans">{c.assignee}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedCaseForDetail(null)}
              className="px-4 py-2 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs cursor-pointer shadow-xs"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                const currentCase = c;
                setSelectedCaseForDetail(null);
                handleOpenFollowUp(currentCase);
              }}
              className="px-4 py-2 rounded bg-[#85712f] hover:bg-[#6f5e26] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Buka Form Follow Up</span>
            </button>
          </div>
        </div>

        {/* Approval Modal Prompt in Detail */}
        {showApprovalPrompt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Konfirmasi Approval &amp; Penutupan Kasus</h4>
                  <p className="text-xs text-slate-500">Case ID: <span className="font-mono font-bold text-slate-800">{c.caseId}</span></p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nama Approver / Supervisor:</label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Catatan Persetujuan (Opsional):</label>
                <textarea
                  rows={2}
                  value={approverNotes}
                  onChange={(e) => setApproverNotes(e.target.value)}
                  placeholder="e.g. Disetujui. Kasus resmi ditutup."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApprovalPrompt(false)}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApproval}
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Ya, Setujui &amp; Tutup Kasus (Close)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
