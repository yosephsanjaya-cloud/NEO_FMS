import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Info,
  Building,
  CreditCard,
  Zap
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { FraudCase } from '../../types/fms';
import { formatIDR } from '../../lib/utils';
import { CaseSelectionCriteria } from './SmartBatchSelector';

interface BatchCloseModalProps {
  selectedCaseIds: string[];
  selectionCriteria?: CaseSelectionCriteria;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BatchCloseModal: React.FC<BatchCloseModalProps> = ({
  selectedCaseIds,
  selectionCriteria,
  onClose,
  onSuccess
}) => {
  const { 
    fraudCases, 
    handleBatchFollowUpSubmit 
  } = useFMS();

  // Selected case objects
  const selectedCases: FraudCase[] = fraudCases.filter(
    c => selectedCaseIds.includes(c.id) || selectedCaseIds.includes(c.caseId)
  );

  // Form states for Close Case
  const [closingReason, setClosingReason] = useState<string>('FALSE_POSITIVE');
  const [closingAction, setClosingAction] = useState<string>('NO_ACTION_TAKEN');
  const [reviewerComment, setReviewerComment] = useState<string>('Kasus ditutup secara massal setelah verifikasi nasabah & analisis transaksi menunjukkan indikasi False Positive / No Loss confirmed.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalNominal = selectedCases.reduce((sum, c) => sum + (c.transaction?.amount || 0), 0);

  const getCriteriaBadge = () => {
    if (!selectionCriteria || selectionCriteria.mode === 'MANUAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Manual Select ({selectedCases.length} Cases)
        </span>
      );
    }
    if (selectionCriteria.mode === 'RULE_BASIC') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900/80 text-indigo-200 border border-indigo-700 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          Via Same Rule: <strong className="text-white font-mono">{selectionCriteria.value}</strong> ({selectedCases.length} Cases)
        </span>
      );
    }
    if (selectionCriteria.mode === 'ACCOUNT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/80 text-blue-200 border border-blue-700 text-xs font-semibold">
          <CreditCard className="w-3.5 h-3.5 text-blue-400" />
          Via Same Account: <strong className="text-white font-mono">{selectionCriteria.value}</strong> ({selectedCases.length} Cases)
        </span>
      );
    }
    if (selectionCriteria.mode === 'CIF') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/80 text-purple-200 border border-purple-700 text-xs font-semibold">
          <Building className="w-3.5 h-3.5 text-purple-400" />
          Via Same CIF: <strong className="text-white font-mono">{selectionCriteria.value}</strong> ({selectedCases.length} Cases)
        </span>
      );
    }
    return null;
  };

  const handleExecuteBatchClose = () => {
    if (!reviewerComment.trim()) {
      setError('Catatan penutupan massal wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Mapping reason to reviewerResult and closingAction
      let mappedFinalResult = 'NOT_FRAUD';
      let mappedReviewerResult = 'FALSE_POSITIVE';
      if (closingReason === 'NO_LOSS_CONFIRMED') {
        mappedFinalResult = 'FRAUD_NO_LOSS';
        mappedReviewerResult = 'TRUE_POSITIVE';
      } else if (closingReason === 'DUPLICATE_ALERT') {
        mappedFinalResult = 'NOT_FRAUD';
        mappedReviewerResult = 'DUPLICATE_CASE';
      } else if (closingReason === 'CUSTOMER_CONFIRMED_GENUINE') {
        mappedFinalResult = 'NOT_FRAUD';
        mappedReviewerResult = 'CUSTOMER_CONFIRMED';
      }

      handleBatchFollowUpSubmit(
        selectedCases.map(c => c.id),
        {
          alertStatus: 'Close',
          reviewer: 'Budi Santoso (Fraud Investigator L1 (Maker))',
          investigator: 'Budi Santoso (Fraud Investigator L1 (Maker))',
          finalResult: mappedFinalResult,
          reviewerResult: mappedReviewerResult,
          closingAction: closingAction,
          typeOfFraud: closingReason === 'NO_LOSS_CONFIRMED' ? 'ATTEMPTED_FRAUD' : 'NONE',
          reviewerComment: `[BATCH CLOSE CASE - ${closingReason}] ${reviewerComment}`
        }
      );

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat memproses penutupan massal.');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="modal-batch-close-case"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white border border-slate-300 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold font-mono text-white tracking-wide">
                  BATCH CLOSE CASE (MASS RESOLUTION)
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  STATUS: CLOSE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Penutupan dan resolusi otomatis terhadap <strong className="text-white font-mono">{selectedCases.length} Kasus</strong> secara bersamaan.
              </p>
            </div>
          </div>

          <button
            id="btn-close-batch-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Criteria Target Summary */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Batch Target:</span>
            {getCriteriaBadge()}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total Transaksi:</span>
              <strong className="text-slate-800 font-mono font-bold">{selectedCases.length} Cases</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total Nominal:</span>
              <strong className="text-red-600 font-mono font-bold">{formatIDR(totalNominal)}</strong>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          
          {/* Safety Notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Konfirmasi Penutupan Massal (Batch Resolution)</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Tindakan ini akan langsung mengubah <strong>Alert Status</strong> menjadi <strong className="underline decoration-emerald-500">Close</strong> dan <strong>Investigation Status</strong> menjadi <strong>Done</strong> untuk seluruh {selectedCases.length} kasus di bawah ini.
              </p>
            </div>
          </div>

          {/* List of Targeted Cases (Compact Preview) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Daftar Kasus Terpilih ({selectedCases.length} Cases):</span>
              <span className="text-[11px] text-slate-400 font-normal">Maks. 10 Kasus per batch</span>
            </label>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
              {selectedCases.map((c, idx) => (
                <div key={c.id} className="p-2.5 text-xs flex items-center justify-between hover:bg-white transition">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{c.caseId}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-700">{c.customerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        CIF: {c.cif} | Rek: {c.accountNumber || c.transaction?.sourceAccount || '-'} | Rule: {c.ruleBasicCode}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">
                      {formatIDR(c.transaction?.amount || 0)}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      c.caseUrgency === 'High' ? 'bg-red-100 text-red-700' :
                      c.caseUrgency === 'Med' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.caseUrgency} Urgency ({c.finalRiskScore})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Closing Reason / Resolution */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Closing Reason / Resolution</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                id="select-batch-closing-reason"
                value={closingReason}
                onChange={(e) => setClosingReason(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="FALSE_POSITIVE">FALSE_POSITIVE (Bukan Fraud / Aktivitas Valid Nasabah)</option>
                <option value="NO_LOSS_CONFIRMED">NO_LOSS_CONFIRMED (Percobaan Fraud Berhasil Dicegah)</option>
                <option value="DUPLICATE_ALERT">DUPLICATE_ALERT (Duplikasi Alert / Sudah Tertangani)</option>
                <option value="CUSTOMER_CONFIRMED_GENUINE">CUSTOMER_CONFIRMED_GENUINE (Konfirmasi Nasabah Sah)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Alasan resolusi investigasi fraud untuk seluruh kasus.
              </p>
            </div>

            {/* Closing Action Taken */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Closing Action / Rekomendasi</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                id="select-batch-closing-action"
                value={closingAction}
                onChange={(e) => setClosingAction(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="NO_ACTION_TAKEN">NO ACTION TAKEN (Tidak Ada Tindakan Lanjutan)</option>
                <option value="UNBLOCK_ACCOUNT">UNBLOCK ACCOUNT / DEVICE (Buka Blokir)</option>
                <option value="MAINTAIN_MONITORING">MAINTAIN WATCHLIST MONITORING (Tetap Pantau)</option>
                <option value="UPDATE_WHITELIST">UPDATE TO WHITELIST (Masukkan Whitelist)</option>
                <option value="NOTIFY_CUSTOMER_SERVICE">NOTIFY CUSTOMER SERVICE (Edukasi Nasabah)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Aksi sistem lanjutan setelah status kasus ditutup.
              </p>
            </div>

          </div>

          {/* Catatan Penutupan Massal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>Catatan Penutupan Massal (Mandatory Notes)</span>
                <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Minimal 10 karakter</span>
            </label>
            <textarea
              id="input-batch-close-notes"
              rows={3}
              value={reviewerComment}
              onChange={(e) => setReviewerComment(e.target.value)}
              placeholder="Berikan justifikasi penutupan massal untuk kasus-kasus ini..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Eksekutor: <strong className="text-slate-800">Budi Santoso (Fraud Investigator L1)</strong>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Batal
            </button>

            <button
              id="btn-confirm-batch-close"
              type="button"
              disabled={isSubmitting}
              onClick={handleExecuteBatchClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : `Tutup ${selectedCases.length} Kasus Sekarang`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
