import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Save, 
  Send, 
  ArrowLeft, 
  Paperclip, 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  RotateCcw,
  ShieldCheck,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { FraudCase, AlertStatus, FraudCaseAttachment } from '../../types/fms';
import { formatIDR } from '../../lib/utils';
import { AlertStatusBadge, InvestigationStatusBadge } from '../common/Badge';
import { AttachmentDropZone } from './AttachmentDropZone';
import { AiCaseRecommendationCard, AiAppliedData } from './AiCaseRecommendationCard';

interface BatchFollowUpModalProps {
  selectedCaseIds: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const BatchFollowUpModal: React.FC<BatchFollowUpModalProps> = ({
  selectedCaseIds,
  onClose,
  onSuccess
}) => {
  const { 
    fraudCases, 
    handleBatchFollowUpSubmit, 
    handleBatchFollowUpSaveDraft 
  } = useFMS();

  // Collapsible section toggles matching Single Follow Up Modal
  const [isSelectedCasesOpen, setIsSelectedCasesOpen] = useState(true);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(true);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(true);

  // Selected case objects
  const selectedCases: FraudCase[] = fraudCases.filter(
    c => selectedCaseIds.includes(c.id) || selectedCaseIds.includes(c.caseId)
  );

  // Form Fields State - Identical to Single Follow Up Modal
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('Draft');
  const [reviewer, setReviewer] = useState<string>('Sysadmin - sysadmin');
  const [reviewerResult, setReviewerResult] = useState<string>('NONE');
  const [reviewerComment, setReviewerComment] = useState<string>('');
  const [finalResult, setFinalResult] = useState<string>('NONE');
  const [closingAction, setClosingAction] = useState<string>('NONE');
  const [typeOfFraud, setTypeOfFraud] = useState<string>('NONE');
  const [suspendDuration, setSuspendDuration] = useState<string>('1 x 24 Jam');
  const [customSuspendDuration, setCustomSuspendDuration] = useState<string>('');
  const [watchlistType, setWatchlistType] = useState<'Permanent' | 'Temporary'>('Permanent');
  const [watchlistDuration, setWatchlistDuration] = useState<string>('1 x 24 Jam');
  const [watchlistCustomDuration, setWatchlistCustomDuration] = useState<string>('');

  // Attachment State matching Single Follow Up Modal
  const [attachments, setAttachments] = useState<FraudCaseAttachment[]>([
    {
      id: `att-batch-init-${Date.now()}`,
      name: `Batch_Investigation_Evidence_${selectedCases.length}_Cases.pdf`,
      size: '340 KB',
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
  ]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // File Select Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFileObj(file);
      setSelectedFileName(file.name);
    }
  };

  // Attach File Button
  const handleAttachFile = () => {
    if (!selectedFileName) {
      setNotification({ type: 'error', message: 'Pilih file terlebih dahulu sebelum menekan Attach!' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    const newAtt: FraudCaseAttachment = {
      id: `att-${Date.now()}`,
      name: selectedFileName,
      size: selectedFileObj ? `${(selectedFileObj.size / 1024).toFixed(1)} KB` : '150 KB',
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setAttachments(prev => [...prev, newAtt]);
    setSelectedFileName('');
    setSelectedFileObj(null);
    setNotification({ type: 'success', message: `File "${newAtt.name}" berhasil dilampirkan untuk seluruh kasus batch!` });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Save as Draft
  const handleSaveDraft = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    handleBatchFollowUpSaveDraft(selectedCaseIds, {
      alertStatus: alertStatus === 'Open' ? 'Draft' : alertStatus,
      reviewer,
      reviewerResult,
      reviewerComment,
      finalResult,
      closingAction,
      typeOfFraud,
      attachments
    });

    setNotification({
      type: 'success',
      message: `Draft follow up berhasil disimpan untuk ${selectedCases.length} kasus!`
    });

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 900);
  };

  // Submit -> Changes status to Pending Approval
  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (reviewerResult === 'NONE' && finalResult === 'NONE') {
      if (!window.confirm('Reviewer Result atau Final Result belum dipilih (masih NONE). Lanjutkan submit ke Pending Approval?')) {
        return;
      }
    }

    const finalDuration = suspendDuration === 'Custom' ? customSuspendDuration : suspendDuration;
    const finalWatchlistDuration = watchlistDuration === 'Custom' ? watchlistCustomDuration : watchlistDuration;
    handleBatchFollowUpSubmit(selectedCaseIds, {
      alertStatus: 'Pending Approval',
      reviewer,
      reviewerResult,
      reviewerComment,
      finalResult,
      closingAction,
      typeOfFraud,
      attachments,
      suspendDuration: finalDuration,
      watchlistType,
      watchlistDuration: finalWatchlistDuration
    });

    setNotification({
      type: 'success',
      message: `Tindak lanjut batch untuk ${selectedCases.length} kasus berhasil disubmit ke Pending Approval!`
    });

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 900);
  };

  return (
    <div 
      id="modal-batch-followup" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-300 rounded-xl max-w-6xl w-full shadow-2xl overflow-hidden my-4 flex flex-col max-h-[96vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* ========================================================= */}
        {/* MODAL HEADER - MATCHING SINGLE FOLLOW UP MODAL            */}
        {/* ========================================================= */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold font-mono text-white tracking-wide">
                  BATCH FOLLOW UP CASE MANAGEMENT ({selectedCases.length} CASES)
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
                  BATCH MODE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-900/80 border border-red-700 text-red-200 text-[10px] font-bold font-mono">
                  {selectedCases.length} Kasus Dipilih
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Tindak Lanjut Investigasi Massal oleh <strong className="text-white font-sans">{reviewer}</strong> • Target Status: <span className="font-mono text-amber-300 font-bold">{alertStatus}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-close-batch-followup-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title="Tutup Form Follow Up Batch"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Batch Summary Banner */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center gap-6 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">TOTAL KASUS:</span>
            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded font-bold font-mono">
              {selectedCases.length} KASUS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">TOTAL NOMINAL:</span>
            <span className="font-bold text-red-600 font-mono">
              {formatIDR(selectedCases.reduce((sum, c) => sum + (c.transaction?.amount || 0), 0))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">INVESTIGATOR:</span>
            <span className="font-semibold text-slate-900">{reviewer}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400 font-medium">DOMAIN:</span>
            <span className="px-2 py-0.5 rounded font-black text-[10px] uppercase border bg-rose-50 text-rose-700 border-rose-200">
              FRAUD BATCH INVESTIGATION
            </span>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`px-5 py-2 text-xs flex items-center justify-between border-b ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            notification.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
            'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-800">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL BODY (SCROLLABLE CONTENT)                           */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs flex-1 bg-slate-100/50">
          
          {/* ========================================================= */}
          {/* SECTION 1: DAFTAR KASUS FRAUD TERPILIH (X CASES)         */}
          {/* DENGAN KOLOM KHUSUS ATTACHMENT                            */}
          {/* ========================================================= */}
          <div className="border border-[#b5a363] rounded shadow-xs overflow-hidden bg-white">
            <div 
              onClick={() => setIsSelectedCasesOpen(!isSelectedCasesOpen)}
              className="px-4 py-2.5 bg-[#85712f] hover:bg-[#786629] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition select-none"
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-200" />
                <span className="tracking-wide">Daftar Transaksi &amp; Kasus Terpilih ({selectedCases.length} Kasus)</span>
                <span className="px-2 py-0.2 rounded-full bg-amber-900/60 text-amber-200 text-[10px] font-mono">
                  {selectedCases.length} Records
                </span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isSelectedCasesOpen ? 'menutup' : 'membuka'}</span>
                {isSelectedCasesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isSelectedCasesOpen && (
              <div className="p-4 bg-white space-y-3">
                <div className="overflow-x-auto border border-slate-300 rounded max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#f0ecd8] text-slate-800 border-b border-slate-300 text-[11px] font-semibold font-mono sticky top-0 z-10">
                      <tr>
                        <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                        <th className="p-2 border-r border-slate-300 whitespace-nowrap">Case ID</th>
                        <th className="p-2 border-r border-slate-300 whitespace-nowrap font-sans">Customer Name</th>
                        <th className="p-2 border-r border-slate-300 whitespace-nowrap">CIF / Account No</th>
                        <th className="p-2 border-r border-slate-300 whitespace-nowrap font-sans">Rule Basic</th>
                        <th className="p-2 border-r border-slate-300 text-right whitespace-nowrap">Nominal</th>
                        <th className="p-2 border-r border-slate-300 text-center whitespace-nowrap font-sans bg-amber-100/70 text-amber-900">
                          Attachment
                        </th>
                        <th className="p-2 text-center whitespace-nowrap font-sans">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-[11px]">
                      {selectedCases.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-4 text-center text-slate-400 font-sans">
                            Tidak ada data kasus yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        selectedCases.map((item, idx) => {
                          const caseAttCount = (item.attachments?.length || 0) + attachments.length;
                          return (
                            <tr key={item.id || item.caseId} className="hover:bg-slate-50 transition">
                              <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-mono font-bold text-red-600 whitespace-nowrap">
                                {item.caseId}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-sans font-semibold text-slate-900 whitespace-nowrap">
                                {item.customerName}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-mono text-slate-700 whitespace-nowrap">
                                {item.accountNumber || item.transaction?.sourceAccount || item.cif}
                              </td>
                              <td className="p-2 border-r border-slate-200 font-sans whitespace-nowrap">
                                <div className="font-mono font-bold text-slate-900 text-[10px]">{item.ruleBasicCode}</div>
                                <div className="text-[10px] text-slate-500 truncate max-w-[180px]" title={item.ruleName}>
                                  {item.ruleName}
                                </div>
                              </td>
                              <td className="p-2 border-r border-slate-200 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                {formatIDR(item.transaction?.amount || 0)}
                              </td>
                              {/* Kolom Attachment */}
                              <td className="p-2 border-r border-slate-200 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                                  caseAttCount > 0 
                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                  <Paperclip className="w-3 h-3" />
                                  <span>{caseAttCount} {caseAttCount === 1 ? 'Doc' : 'Docs'}</span>
                                </span>
                              </td>
                              <td className="p-2 text-center whitespace-nowrap">
                                <AlertStatusBadge status={item.alertStatus} />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-sans px-1">
                  <span>
                    Menampilkan <strong className="text-slate-800">{selectedCases.length}</strong> kasus yang ditandai untuk proses follow up massal.
                  </span>
                  <span className="font-mono font-semibold text-slate-700">
                    Total Nominal Kasus: {formatIDR(selectedCases.reduce((sum, c) => sum + (c.transaction?.amount || 0), 0))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: FOLLOW UP CASE MANAGEMENT FORM (2 COLUMNS)     */}
          {/* IDENTICAL TO SINGLE FOLLOW UP MODAL                       */}
          {/* ========================================================= */}
          <div className="border border-[#b5a363] rounded shadow-xs overflow-hidden bg-white">
            <div 
              onClick={() => setIsFollowUpOpen(!isFollowUpOpen)}
              className="px-4 py-2.5 bg-[#85712f] hover:bg-[#786629] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition select-none"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-200" />
                <span className="tracking-wide">Follow Up Case Management (Batch Form)</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isFollowUpOpen ? 'menutup' : 'membuka'}</span>
                {isFollowUpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isFollowUpOpen && (
              <div className="p-4 sm:p-5 bg-white space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* LEFT COLUMN */}
                  <div className="space-y-3.5">
                    
                    {/* Row 1: Alert Status */}
                    <div className="flex items-center">
                      <label className="w-36 font-semibold text-slate-700 shrink-0">
                        Alert Status <span className="text-slate-400">:</span>
                      </label>
                      <div className="relative flex-1 flex items-center">
                        <select
                          id="select-batch-alert-status"
                          value={alertStatus}
                          onChange={(e) => setAlertStatus(e.target.value as AlertStatus)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 pr-8"
                        >
                          <option value="Open">OPEN</option>
                          <option value="Draft">DRAFT</option>
                          <option value="Pending Approval">PENDING APPROVAL</option>
                          <option value="Close">CLOSE</option>
                        </select>
                        {alertStatus && (
                          <button
                            type="button"
                            onClick={() => setAlertStatus('Draft')}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Reset Alert Status"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Reviewer */}
                    <div className="flex items-center">
                      <label className="w-36 font-semibold text-slate-700 shrink-0">
                        Reviewer <span className="text-slate-400">:</span>
                      </label>
                      <div className="flex-1">
                        <input
                          id="input-batch-reviewer"
                          type="text"
                          value={reviewer}
                          onChange={(e) => setReviewer(e.target.value)}
                          placeholder="e.g. Sysadmin - sysadmin / Budi Santoso"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Row 3: Reviewer Result */}
                    <div className="flex items-center">
                      <label className="w-36 font-semibold text-slate-700 shrink-0">
                        Reviewer Result <span className="text-slate-400">:</span>
                      </label>
                      <div className="relative flex-1 flex items-center">
                        <select
                          id="select-batch-reviewer-result"
                          value={reviewerResult}
                          onChange={(e) => setReviewerResult(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 pr-8"
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="FR-RR-001 - Fraud">FR-RR-001 - Fraud</option>
                          <option value="FR-RR-002 - False Positive">FR-RR-002 - False Positive</option>
                          <option value="FR-RR-003 - Suspicous">FR-RR-003 - Suspicous</option>
                        </select>
                        {reviewerResult !== 'NONE' && (
                          <button
                            type="button"
                            onClick={() => setReviewerResult('NONE')}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Reset"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Reviewer Comment (Peach / Soft Cream Background) */}
                    <div className="flex flex-col space-y-1 pt-1">
                      <label className="font-semibold text-slate-700">
                        Reviewer Comment <span className="text-slate-400">:</span>
                      </label>
                      <textarea
                        id="textarea-batch-reviewer-comment"
                        rows={4}
                        value={reviewerComment}
                        onChange={(e) => setReviewerComment(e.target.value)}
                        placeholder="Tuliskan hasil klarifikasi nasabah, kronologi temuan, analisis pola transaksi mencurigakan, atau instruksi mitigasi lanjutan untuk seluruh kasus batch terpilih..."
                        className="w-full p-2.5 bg-[#fef7ee] border border-amber-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner placeholder:text-slate-400 leading-relaxed font-sans"
                      />
                    </div>

                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-3.5">
                    
                    {/* Row 1: Final Result */}
                    <div className="flex items-center">
                      <label className="w-36 font-semibold text-slate-700 shrink-0">
                        Final Result <span className="text-slate-400">:</span>
                      </label>
                      <div className="relative flex-1 flex items-center">
                        <select
                          id="select-batch-final-result"
                          value={finalResult}
                          onChange={(e) => setFinalResult(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 pr-8"
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="FR-FR-001 - Fraud">FR-FR-001 - Fraud</option>
                          <option value="FR-FR-002 - False Positive">FR-FR-002 - False Positive</option>
                          <option value="FR-FR-003 - Suspicous">FR-FR-003 - Suspicous</option>
                          <option value="FR-FR-004 - Need Further Investigation">FR-FR-004 - Need Further Investigation</option>
                        </select>
                        {finalResult !== 'NONE' && (
                          <button
                            type="button"
                            onClick={() => setFinalResult('NONE')}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Reset"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Closing Action */}
                    <div className="flex items-center">
                      <label className="w-36 font-semibold text-slate-700 shrink-0">
                        Closing Action <span className="text-slate-400">:</span>
                      </label>
                      <div className="relative flex-1 flex items-center">
                        <select
                          id="select-batch-closing-action"
                          value={closingAction}
                          onChange={(e) => setClosingAction(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 pr-8"
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="FR-CA-001 - Suspend Account">FR-CA-001 - Suspend Account</option>
                          <option value="FR-CA-002 - Suspend CIF">FR-CA-002 - Suspend CIF</option>
                          <option value="FR-CA-003 - Suspend Device ID">FR-CA-003 - Suspend Device ID</option>
                          <option value="FR-CA-004 - Suspend Phone Number">FR-CA-004 - Suspend Phone Number</option>
                          <option value="FR-CA-005 - Temporary Suspend Account">FR-CA-005 - Temporary Suspend Account</option>
                          <option value="FR-CA-006 - Temporary Suspend CIF">FR-CA-006 - Temporary Suspend CIF</option>
                          <option value="FR-CA-007 - Temporary Suspend Device ID">FR-CA-007 - Temporary Suspend Device ID</option>
                          <option value="FR-CA-008 - Temporary Suspend Phone Number">FR-CA-008 - Temporary Suspend Phone Number</option>
                          <option value="FR-CA-009 - Release Account">FR-CA-009 - Release Account</option>
                          <option value="FR-CA-010 - Release CIF">FR-CA-010 - Release CIF</option>
                          <option value="FR-CA-011 - Release Device ID">FR-CA-011 - Release Device ID</option>
                          <option value="FR-CA-012 - Release Phone Number">FR-CA-012 - Release Phone Number</option>
                          <option value="FR-CA-013 - Watchlist Account">FR-CA-013 - Watchlist Account</option>
                          <option value="FR-CA-014 - Watchlist CIF">FR-CA-014 - Watchlist CIF</option>
                          <option value="FR-CA-015 - Watchlist Device ID">FR-CA-015 - Watchlist Device ID</option>
                          <option value="FR-CA-016 - Watchlist Phone Number">FR-CA-016 - Watchlist Phone Number</option>
                        </select>
                        {closingAction !== 'NONE' && (
                          <button
                            type="button"
                            onClick={() => setClosingAction('NONE')}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Reset"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Conditional Input Field: Suspend Duration */}
                    {(closingAction.startsWith('FR-CA-005') || 
                      closingAction.startsWith('FR-CA-006') || 
                      closingAction.startsWith('FR-CA-007') || 
                      closingAction.startsWith('FR-CA-008') ||
                      closingAction.includes('Temporary Suspend')) && (
                      <div className="flex items-center bg-amber-50/80 p-2.5 rounded border border-amber-300">
                        <label className="w-36 font-bold text-amber-900 shrink-0 text-xs">
                          Durasi Temp Suspend <span className="text-amber-600">*</span>:
                        </label>
                        <div className="flex-1 flex items-center space-x-2">
                          <select
                            value={suspendDuration}
                            onChange={(e) => setSuspendDuration(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-amber-400 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="1 x 24 Jam">1 x 24 Jam</option>
                            <option value="3 Hari">3 Hari</option>
                            <option value="7 Hari">7 Hari</option>
                            <option value="14 Hari">14 Hari</option>
                            <option value="30 Hari">30 Hari</option>
                            <option value="Custom">Custom (Jam/Hari)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {suspendDuration === 'Custom' && (closingAction.startsWith('FR-CA-005') || closingAction.includes('Temporary Suspend')) && (
                      <div className="flex items-center pl-36">
                        <input
                          type="text"
                          value={customSuspendDuration}
                          onChange={(e) => setCustomSuspendDuration(e.target.value)}
                          placeholder="Masukkan durasi custom (misal: 12 Jam atau 5 Hari)"
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded text-xs text-slate-800 font-medium"
                        />
                      </div>
                    )}

                    {/* Conditional Input Field: Watchlist Type & Duration */}
                    {(closingAction.startsWith('FR-CA-013') || 
                      closingAction.startsWith('FR-CA-014') || 
                      closingAction.startsWith('FR-CA-015') || 
                      closingAction.startsWith('FR-CA-016') ||
                      closingAction.includes('Watchlist')) && (
                      <div className="bg-blue-50/80 p-3 rounded border border-blue-300 space-y-2">
                        <div className="flex items-center">
                          <label className="w-36 font-bold text-blue-900 shrink-0 text-xs">
                            Tipe Pemantauan <span className="text-blue-600">*</span>:
                          </label>
                          <div className="flex-1 flex items-center space-x-4">
                            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                              <input
                                type="radio"
                                name="batchWatchlistType"
                                value="Permanent"
                                checked={watchlistType === 'Permanent'}
                                onChange={() => setWatchlistType('Permanent')}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span>Permanen</span>
                            </label>
                            <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 cursor-pointer">
                              <input
                                type="radio"
                                name="batchWatchlistType"
                                value="Temporary"
                                checked={watchlistType === 'Temporary'}
                                onChange={() => setWatchlistType('Temporary')}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span>Sementara</span>
                            </label>
                          </div>
                        </div>

                        {watchlistType === 'Temporary' && (
                          <div className="flex items-center pt-1">
                            <label className="w-36 font-bold text-blue-900 shrink-0 text-xs">
                              Durasi Pemantauan <span className="text-blue-600">*</span>:
                            </label>
                            <div className="flex-1 flex items-center space-x-2">
                              <select
                                value={watchlistDuration}
                                onChange={(e) => setWatchlistDuration(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-blue-400 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="1 x 24 Jam">1 x 24 Jam</option>
                                <option value="3 Hari">3 Hari</option>
                                <option value="7 Hari">7 Hari</option>
                                <option value="14 Hari">14 Hari</option>
                                <option value="30 Hari">30 Hari</option>
                                <option value="Custom">Custom (Jam/Hari)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {watchlistType === 'Temporary' && watchlistDuration === 'Custom' && (
                          <div className="flex items-center pl-36 pt-1">
                            <input
                              type="text"
                              value={watchlistCustomDuration}
                              onChange={(e) => setWatchlistCustomDuration(e.target.value)}
                              placeholder="Masukkan durasi custom (misal: 12 Jam atau 5 Hari)"
                              className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded text-xs text-slate-800 font-medium"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Row 3: Type of Fraud */}
                    <div className="flex items-center">
                      <label className="w-36 font-semibold text-slate-700 shrink-0">
                        Type of Fraud <span className="text-slate-400">:</span>
                      </label>
                      <div className="relative flex-1 flex items-center">
                        <select
                          id="select-batch-type-of-fraud"
                          value={typeOfFraud}
                          onChange={(e) => setTypeOfFraud(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 pr-8"
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="FR-TOF-001 - Account Take Over (ATO)">FR-TOF-001 - Account Take Over (ATO)</option>
                          <option value="FR-TOF-002 - Card not Present (CNP)">FR-TOF-002 - Card not Present (CNP)</option>
                          <option value="FR-TOF-003 - Counterfeit">FR-TOF-003 - Counterfeit</option>
                          <option value="FR-TOF-004 - Payment / Top up Fraud">FR-TOF-004 - Payment / Top up Fraud</option>
                          <option value="FR-TOF-005 - Penipuan Akun">FR-TOF-005 - Penipuan Akun</option>
                          <option value="FR-TOF-006 - Cyber Crime/Cyber Fraud">FR-TOF-006 - Cyber Crime/Cyber Fraud</option>
                          <option value="FR-TOF-007 - Fraud E-commerce">FR-TOF-007 - Fraud E-commerce</option>
                          <option value="FR-TOF-008 - Fraud Onboarding">FR-TOF-008 - Fraud Onboarding</option>
                          <option value="FR-TOF-009 - Fraud Transfer Dana">FR-TOF-009 - Fraud Transfer Dana</option>
                          <option value="FR-TOF-010 - Percobaan Enumerasi">FR-TOF-010 - Percobaan Enumerasi</option>
                          <option value="FR-TOF-011 - Access from Red Zone">FR-TOF-011 - Access from Red Zone</option>
                          <option value="FR-TOF-012 - False Positive">FR-TOF-012 - False Positive</option>
                          <option value="FR-TOF-013 - Undefined">FR-TOF-013 - Undefined</option>
                        </select>
                        {typeOfFraud !== 'NONE' && (
                          <button
                            type="button"
                            onClick={() => setTypeOfFraud('NONE')}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Reset"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Smart Case Recommendation Assistant Widget */}
                    <AiCaseRecommendationCard
                      caseData={selectedCases[0] || null}
                      domain="fraud"
                      onApplyRecommendation={(data: AiAppliedData) => {
                        setReviewerResult(data.reviewerResult);
                        setFinalResult(data.finalResult);
                        setClosingAction(data.closingAction);
                        if (data.suspendDuration) {
                          setSuspendDuration(data.suspendDuration);
                        }
                        setTypeOfFraud(data.typeOfFraud);
                        if (data.replaceComment || !reviewerComment.trim()) {
                          setReviewerComment(data.suggestedComment);
                        } else {
                          setReviewerComment(prev => `${prev}\n\n${data.suggestedComment}`);
                        }
                      }}
                    />

                    {/* Panduan Ringkas SOP Batch */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px] space-y-1">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Panduan Penyelesaian Kasus Massal (Batch):</span>
                      </div>
                      <p className="leading-relaxed text-slate-500 text-[10px]">
                        Keputusan tindak lanjut, status alert, dan dokumen lampiran akan diaplikasikan ke seluruh <strong>{selectedCases.length} kasus</strong> terpilih secara serentak.
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 3: UPLOAD ATTACHMENT                              */}
          {/* MATCHING SINGLE FOLLOW UP MODAL                           */}
          {/* ========================================================= */}
          <div className="border border-[#b5a363] rounded shadow-xs overflow-hidden bg-white">
            <div 
              onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
              className="px-4 py-2.5 bg-[#85712f] hover:bg-[#786629] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition select-none"
            >
              <div className="flex items-center space-x-2">
                <Paperclip className="w-4 h-4 text-amber-200" />
                <span className="tracking-wide">Upload Attachment</span>
                <span className="px-2 py-0.2 rounded-full bg-amber-900/60 text-amber-200 text-[10px] font-mono">
                  {attachments.length} Terlampir
                </span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isAttachmentOpen ? 'menutup' : 'membuka'}</span>
                {isAttachmentOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isAttachmentOpen && (
              <div className="p-4 bg-white">
                <AttachmentDropZone
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                />
              </div>
            )}
          </div>

        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER (MATCHING SINGLE FOLLOW UP MODAL)            */}
        {/* ========================================================= */}
        <div className="px-5 py-3.5 bg-[#ece7d5] border-t border-[#d3caa8] flex items-center justify-between">
          <div className="text-xs text-slate-600">
            Total Kasus Dipilih: <strong className="text-slate-900 font-mono">{selectedCases.length} Kasus</strong> • Target Status: <span className="font-bold text-amber-800">{alertStatus}</span>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Button 1: Save as Draft */}
            <button
              id="btn-batch-save-draft"
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save as Draft</span>
            </button>

            {/* Button 2: Submit -> Changes status to Pending Approval */}
            <button
              id="btn-batch-submit"
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-[#85712f] hover:bg-[#6f5e26] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>

            {/* Button 3: Back */}
            <button
              id="btn-batch-back"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-[#60712f] hover:bg-[#4f5d26] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
