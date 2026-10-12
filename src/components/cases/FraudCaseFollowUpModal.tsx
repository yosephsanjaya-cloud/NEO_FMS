import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock, 
  User, 
  AlertTriangle, 
  FileText, 
  Send, 
  Save, 
  ArrowLeft, 
  Paperclip, 
  RotateCcw, 
  Activity, 
  CreditCard, 
  Smartphone, 
  Phone, 
  History, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Sliders, 
  ListFilter,
  Layers,
  Sparkles,
  Zap,
  Trash2,
  ExternalLink,
  Upload
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { FraudCase, AlertStatus, FraudCaseAttachment, CifHistoricalTransaction } from '../../types/fms';
import { formatIDR } from '../../lib/utils';
import { UrgencyBadge, AlertStatusBadge, InvestigationStatusBadge } from '../common/Badge';
import { getCifTransactionHistory } from '../../lib/cifHistoryHelper';
import { getRuleTemplateInfo } from '../../lib/workflowHelper';
import { CaseWorkflowMilestonesView } from './CaseWorkflowMilestonesView';
import { AmlCaseTransactionDetailModal } from './AmlCaseTransactionDetailModal';
import { TransactionAlertTable, normalizeTrxStatus } from './TransactionAlertTable';
import { AttachmentDropZone } from './AttachmentDropZone';
import { AiCaseRecommendationCard, AiAppliedData } from './AiCaseRecommendationCard';

interface FraudCaseFollowUpModalProps {
  caseData?: FraudCase | null;
  onClose?: () => void;
}

export const FraudCaseFollowUpModal: React.FC<FraudCaseFollowUpModalProps> = ({ caseData: propsCaseData, onClose: propsOnClose }) => {
  const { user } = useAuth();
  const { 
    selectedCaseForFollowUp, 
    setSelectedCaseForFollowUp,
    handleSaveDraftFollowUp,
    handleSubmitFollowUp,
    handleApproveCase,
    handleRejectCase,
    formulaRisks,
    ruleBasics,
    listEntries
  } = useFMS();

  // Role and Maker-Checker states
  const isSysadmin = user?.username === 'sysadmin';
  const isChecker = isSysadmin || user?.username === 'afcl2' || user?.role?.toLowerCase().includes('checker');
  const isMaker = isSysadmin || user?.username === 'afcl1' || user?.role?.toLowerCase().includes('maker') || user?.role?.toLowerCase().includes('officer');

  // Use prop if provided, else fallback to context state
  const c = propsCaseData !== undefined ? propsCaseData : selectedCaseForFollowUp;

  const handleClose = () => {
    if (propsOnClose) {
      propsOnClose();
    }
    setSelectedCaseForFollowUp(null);
  };

  // Section Accordion Collapsible States
  const [isAlertInfoOpen, setIsAlertInfoOpen] = useState(true);
  const [isRiskScoreOpen, setIsRiskScoreOpen] = useState(true);
  const [isFormulaRulesOpen, setIsFormulaRulesOpen] = useState(true);
  const [isCifHistoryOpen, setIsCifHistoryOpen] = useState(true);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(true);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(true);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(true);

  // Filter state for CIF Historical Transactions
  const [cifSearchTerm, setCifSearchTerm] = useState('');
  const [cifStatusFilter, setCifStatusFilter] = useState<'ALL' | 'BERHASIL' | 'GAGAL'>('ALL');

  // Form Fields State
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('Open');
  const [reviewer, setReviewer] = useState('Sysadmin - sysadmin');
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File Upload state
  const [attachments, setAttachments] = useState<FraudCaseAttachment[]>([]);
  const [selectedFileName, setSelectedFileName] = useState('');

  // Case lifecycle states
  const isPendingApproval = c?.alertStatus === 'Pending Approval';
  const isClosed = c?.alertStatus === 'Close';
  const isReadOnly = !isSysadmin && (isPendingApproval || isClosed);

  // Approval Modal Prompt state
  const [showApprovalPrompt, setShowApprovalPrompt] = useState(false);
  const [approverName, setApproverName] = useState('Budi Santoso (Fraud Manager)');
  const [approverNotes, setApproverNotes] = useState('');

  // Rejection Modal Prompt state
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectorName, setRejectorName] = useState('Budi Santoso (Fraud Manager)');
  const [rejectReason, setRejectReason] = useState('');

  // AML Case Transaction Detail Pop-up Modal State
  const [selectedAmlCaseDetailItem, setSelectedAmlCaseDetailItem] = useState<FraudCase | null>(null);
  const [isAmlDetailModalOpen, setIsAmlDetailModalOpen] = useState(false);

  // Tabbed Transaction Navigation State ('alert' | 'history')
  const [activeTransactionTab, setActiveTransactionTab] = useState<'alert' | 'history'>('alert');
  const [selectedTrxDetail, setSelectedTrxDetail] = useState<any | null>(null);

  // Sync Form State when `c` changes
  useEffect(() => {
    if (c) {
      setAlertStatus(c.alertStatus || 'Open');
      
      const defaultReviewer = user ? `${user.fullName} (${user.username})` : 'Sysadmin - sysadmin';
      setReviewer(c.reviewer && c.reviewer !== 'Sysadmin - sysadmin' ? c.reviewer : defaultReviewer);
      setReviewerResult(c.reviewerResult || 'NONE');
      setReviewerComment(c.reviewerComment || c.resolutionNotes || '');
      setFinalResult(c.finalResult || 'NONE');
      setClosingAction(c.closingAction || 'NONE');
      setTypeOfFraud(c.typeOfFraud || 'NONE');
      setAttachments(c.attachments || []);

      if (user) {
        setApproverName(`${user.fullName} (${user.role})`);
        setRejectorName(`${user.fullName} (${user.role})`);
      }
    }
  }, [c, user]);

  // Combined CIF History (Context + Dynamic Fallback Helper)
  const cifTransactionsList = useMemo<CifHistoricalTransaction[]>(() => {
    if (!c) return [];
    return getCifTransactionHistory(c);
  }, [c]);

  // Tab 1: Alert Transactions (Violations list)
  const alertTransactions = useMemo(() => {
    if (!c) return [];
    if (c.transactionEvidenceList && c.transactionEvidenceList.length > 0) {
      return c.transactionEvidenceList.map((e, idx) => ({
        ...e,
        trxId: e.trxId || `TRX-ALERT-${idx + 1}`,
        trxRef: (e as any).trxRef || `REF-${(e.trxId || c.caseId).replace(/[^0-9]/g, '').slice(-8) || '20260825-99410'}`,
        timestamp: e.timestamp || c.transaction?.timestamp || '2026-08-25 10:42:15',
        trxCategory: (e as any).trxCategory || (e.amount === 0 ? 'Inquiry' : (e.trxType || '').toLowerCase().includes('inflow') ? 'Incoming Transfer' : 'Outgoing Transfer'),
        status: (e as any).status || 'FLAGGED',
        sourceAccountName: (e as any).sourceAccountName || c.customerName,
        sourceAccount: e.sourceAccount || c.accountNumber || '5510291001',
        sourceAccountVaName: (e as any).sourceAccountVaName || c.sourceVirtualAccountName || '-',
        sourceAccountVaNumber: (e as any).sourceAccountVaNumber || c.sourceVirtualAccount || '-',
        beneficiaryAccountName: (e as any).beneficiaryAccountName || e.destinationBank || 'Bank Central Asia (BCA)',
        destinationAccount: e.destinationAccount || '88201938472',
        beneficiaryAccountVaName: (e as any).beneficiaryAccountVaName || '-',
        beneficiaryAccountVaNumber: (e as any).beneficiaryAccountVaNumber || '-',
        channel: e.channel || 'BI-FAST',
        origin: (e as any).origin || `${e.location || 'Jakarta Barat, ID'} (IP: ${e.ipAddress || '103.149.12.99'})`,
        amount: e.amount || 150000000,
        longitude: (e as any).longitude || '106.816666',
        latitude: (e as any).latitude || '-6.200000'
      }));
    }
    const triggers = cifTransactionsList.filter(t => t.isCurrentAlertTrigger || t.status === 'FLAGGED' || t.status === 'SUSPICIOUS');
    if (triggers.length > 0) {
      return triggers.map(t => ({
        ...t,
        trxId: t.trxId,
        trxRef: t.trxRef || `REF-${t.trxId.replace(/[^0-9]/g, '').slice(-8) || '20260825-99410'}`,
        timestamp: t.timestamp,
        trxCategory: t.trxCategory || (t.amount === 0 ? 'Inquiry' : t.trxType.toLowerCase().includes('inflow') ? 'Incoming Transfer' : 'Outgoing Transfer'),
        status: t.status,
        sourceAccountName: t.sourceAccountName || c.customerName,
        sourceAccount: t.sourceAccount,
        sourceAccountVaName: t.sourceAccountVaName || c.sourceVirtualAccountName || '-',
        sourceAccountVaNumber: t.sourceAccountVaNumber || c.sourceVirtualAccount || '-',
        beneficiaryAccountName: t.beneficiaryAccountName || t.destinationBank,
        destinationAccount: t.destinationAccount,
        beneficiaryAccountVaName: t.beneficiaryAccountVaName || '-',
        beneficiaryAccountVaNumber: t.beneficiaryAccountVaNumber || '-',
        channel: t.channel,
        origin: t.origin || `${t.location || 'Jakarta, ID'} (IP: ${t.ipAddress || '103.149.12.99'})`,
        amount: t.amount,
        longitude: t.longitude || '106.816666',
        latitude: t.latitude || '-6.200000'
      }));
    }
    return [{
      trxId: c.transaction?.trxId || `TRX-BIF-20260825-99410`,
      trxRef: `REF-${(c.transaction?.trxId || c.caseId).replace(/[^0-9]/g, '').slice(-8) || '20260825-99410'}`,
      timestamp: c.transaction?.timestamp || '2026-08-25 10:42:15',
      trxCategory: 'Outgoing Transfer',
      status: 'FLAGGED',
      sourceAccountName: c.customerName || 'Budi Santoso',
      sourceAccount: c.transaction?.sourceAccount || c.accountNumber || '5510291001',
      sourceAccountVaName: c.sourceVirtualAccountName || '-',
      sourceAccountVaNumber: c.sourceVirtualAccount || '-',
      beneficiaryAccountName: 'PT Nusantara Jaya Mandiri',
      destinationAccount: c.transaction?.destinationAccount || '88201938472',
      beneficiaryAccountVaName: 'VA ShopeePay Corporate',
      beneficiaryAccountVaNumber: '880991823901',
      channel: c.transaction?.channel || 'BI-FAST',
      origin: `${c.transaction?.location || 'Jakarta Barat, ID'} (IP: ${c.transaction?.ipAddress || '103.149.12.99'})`,
      amount: c.transaction?.amount || 150000000,
      longitude: '106.816666',
      latitude: '-6.200000',
      trxType: c.transaction?.trxType || 'BI-FAST Outward Transfer'
    }];
  }, [c, cifTransactionsList]);

  // Tab 2: Filtered CIF Transactions (Historical profile list)
  const filteredCifHistory = useMemo(() => {
    return cifTransactionsList.filter(item => {
      const matchSearch = 
        item.trxId.toLowerCase().includes(cifSearchTerm.toLowerCase()) ||
        item.channel.toLowerCase().includes(cifSearchTerm.toLowerCase()) ||
        item.trxType.toLowerCase().includes(cifSearchTerm.toLowerCase()) ||
        item.destinationAccount.includes(cifSearchTerm) ||
        item.destinationBank.toLowerCase().includes(cifSearchTerm.toLowerCase());
      
      const itemStatus = normalizeTrxStatus(item.status || (item as any).transactionStatus);
      const matchStatus = cifStatusFilter === 'ALL' || itemStatus === cifStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [cifTransactionsList, cifSearchTerm, cifStatusFilter]);

  // Look up Rule Basic & Rule Template info for workflow specs
  const ruleBasicInfo = useMemo(() => {
    if (!c) return null;
    return ruleBasics.find(r => r.code === c.ruleBasicCode) || null;
  }, [c, ruleBasics]);

  const ruleTemplateInfo = useMemo(() => {
    if (!c) return null;
    return getRuleTemplateInfo(c.ruleTemplateCode);
  }, [c]);

  if (!c) return null;

  // File Attachment Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleAttachFile = () => {
    if (!selectedFileName) return;
    const newAtt: FraudCaseAttachment = {
      id: `att-${Date.now()}`,
      name: selectedFileName,
      size: `${(Math.random() * 2 + 0.2).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setAttachments(prev => [...prev, newAtt]);
    setSelectedFileName('');
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Form Submission Handlers
  const handleSaveDraft = () => {
    handleSaveDraftFollowUp(c.caseId || c.id, {
      reviewer,
      reviewerResult,
      reviewerComment,
      finalResult,
      closingAction,
      typeOfFraud,
      attachments
    });
    handleClose();
  };

  const handleSubmit = () => {
    const finalDuration = suspendDuration === 'Custom' ? customSuspendDuration : suspendDuration;
    const finalWatchlistDuration = watchlistDuration === 'Custom' ? watchlistCustomDuration : watchlistDuration;
    const msg = handleSubmitFollowUp(c.caseId || c.id, {
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

    setToastMessage(msg || 'Follow up berhasil disubmit ke Pending Approval.');
    setTimeout(() => {
      handleClose();
    }, 1400);
  };

  const handleConfirmApproval = () => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const resolvedPayload = {
      reviewerResult: c.reviewerResult && c.reviewerResult !== 'NONE' ? c.reviewerResult : (reviewerResult !== 'NONE' ? reviewerResult : 'FR-RR-001 - Fraud'),
      finalResult: c.finalResult && c.finalResult !== 'NONE' ? c.finalResult : (finalResult !== 'NONE' ? finalResult : 'FR-FR-001 - Fraud'),
      closingAction: c.closingAction && c.closingAction !== 'NONE' ? c.closingAction : (closingAction !== 'NONE' ? closingAction : 'FR-CA-001 - Suspend Account'),
      typeOfFraud: c.typeOfFraud && c.typeOfFraud !== 'NONE' ? c.typeOfFraud : (typeOfFraud !== 'NONE' ? typeOfFraud : 'FR-TOF-001 - Account Take Over (ATO)'),
      reviewerComment: c.reviewerComment || reviewerComment || 'Hasil penanganan dan investigasi L1 disetujui.',
      reviewer: c.reviewer || reviewer || 'Maker L1',
      submittedBy: c.reviewer || reviewer || 'Maker L1',
      approverComment: approverNotes || 'Penyelesaian kasus disetujui. Kasus resmi ditutup.',
      approvedBy: approverName || 'afcl2',
      closedAt: timestamp
    };

    handleApproveCase(c.caseId || c.id, approverName, approverNotes || 'Penyelesaian kasus disetujui. Kasus resmi ditutup.', resolvedPayload);
    
    // Explicitly record approval event to sessionStorage for audit consistency
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const approvalRecord = {
          caseId: c.caseId || c.id,
          action: 'APPROVE',
          domain: c.alertCategory || 'Fraud',
          customerName: c.customerName,
          cif: c.cif,
          previousStatus: 'Pending Approval',
          newStatus: 'Close',
          maker: resolvedPayload.submittedBy,
          reviewerResult: resolvedPayload.reviewerResult,
          finalResult: resolvedPayload.finalResult,
          closingAction: resolvedPayload.closingAction,
          typeOfFraud: resolvedPayload.typeOfFraud,
          reviewerComment: resolvedPayload.reviewerComment,
          approvedBy: approverName,
          approverNotes: approverNotes || 'Penyelesaian kasus disetujui. Kasus resmi ditutup.',
          timestamp
        };
        sessionStorage.setItem('fms_last_approval_event', JSON.stringify(approvalRecord));
        const rawHistory = sessionStorage.getItem('fms_approval_history');
        const historyList = rawHistory ? JSON.parse(rawHistory) : [];
        sessionStorage.setItem('fms_approval_history', JSON.stringify([...historyList, approvalRecord]));
      }
    } catch (e) {
      console.warn('Could not record approval event to session storage:', e);
    }

    setShowApprovalPrompt(false);
    setToastMessage(`Kasus ${c.caseId} berhasil disetujui dan ditutup (Close).`);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Mohon masukkan alasan penolakan kasus terlebih dahulu.');
      return;
    }
    handleRejectCase(c.caseId || c.id, rejectorName, rejectReason);
    setShowRejectPrompt(false);
    setToastMessage(`Kasus ${c.caseId} ditolak dan dikembalikan sebagai Rejected.`);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#f5f1e6] rounded-xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#d3caa8] overflow-hidden">
        
        {/* ========================================================= */}
        {/* MODAL HEADER                                               */}
        {/* ========================================================= */}
        <div className="px-5 py-3 bg-[#85712f] text-white flex items-center justify-between border-b border-[#6f5e26] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-900/40 rounded-lg border border-amber-400/30">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  Follow Up Fraud Case Management
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 text-xs font-mono font-bold border border-amber-400/30">
                  {c.caseId}
                </span>
                {c.isManualAlert && (
                  <span className="px-2 py-0.5 rounded bg-purple-900/70 text-purple-200 text-xs font-bold border border-purple-400/30">
                    MANUAL INTAKE ({c.source})
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100/80 font-medium">
                Pemeriksaan Kasus Fraud • Formula Risk Score &amp; Rule Workflow Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClose}
              className="p-1.5 text-amber-100 hover:text-white hover:bg-amber-800/60 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-200" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL BODY (ACCORDION SECTIONS)                            */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-sans text-xs">

          {/* ========================================================= */}
          {/* SECTION 1: ALERT & CASE INFORMATION HEADER               */}
          {/* ========================================================= */}
          <div className="border border-[#b5a363] rounded shadow-xs overflow-hidden bg-white">
            <div 
              onClick={() => setIsAlertInfoOpen(!isAlertInfoOpen)}
              className="px-4 py-2.5 bg-[#85712f] hover:bg-[#786629] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition select-none"
            >
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-200" />
                <span className="tracking-wide">Informasi Utama Kasus &amp; Parameter Deteksi</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isAlertInfoOpen ? 'menutup' : 'membuka'}</span>
                {isAlertInfoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isAlertInfoOpen && (
              <div className="p-4 bg-white space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Item 1 */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">ID &amp; Urutan Kasus</span>
                    <div className="font-mono font-bold text-sm text-slate-900">{c.caseId}</div>
                    <div className="text-[11px] text-slate-500">Case No. #{c.no}</div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Nasabah &amp; CIF</span>
                    <div className="font-bold text-slate-900 truncate">{c.customerName}</div>
                    <div className="font-mono text-[11px] text-blue-700 font-semibold">CIF: {c.cif}</div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Status Kasus Saat Ini</span>
                    <div className="flex items-center space-x-1.5 pt-0.5">
                      <AlertStatusBadge status={c.alertStatus} />
                      <InvestigationStatusBadge status={c.investigationStatus} />
                    </div>
                    <div className="text-[10px] text-slate-500 pt-0.5">Assignee: <strong className="text-slate-700">{c.assignee}</strong></div>
                  </div>

                  {/* Item 4 */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Urgency &amp; Aging</span>
                    <div className="flex items-center space-x-2">
                      <UrgencyBadge urgency={c.caseUrgency} />
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono font-bold text-[10px]">
                        {c.aging}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">Identifikasi: {c.identifiedOn}</div>
                  </div>

                </div>

                {/* Additional Info Box */}
                <div className="p-3 rounded bg-[#fef7ee] border border-amber-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700 font-sans">
                  <div>
                    <span className="text-slate-500 font-semibold text-[10px] block">RULE BASIC TRIGGERED</span>
                    <div className="font-mono font-bold text-amber-900">{c.ruleBasicCode}</div>
                    <div className="text-slate-600 truncate">{c.ruleName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold text-[10px] block">RULE TEMPLATE CODE</span>
                    <div className="font-mono font-bold text-amber-900">{c.ruleTemplateCode}</div>
                    <div className="text-slate-600 truncate">{ruleTemplateInfo?.name || 'Standard Template'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold text-[10px] block">TRANSAKSI UTAMA ALASAN ALERT</span>
                    <div className="font-mono font-bold text-slate-900">
                      {formatIDR(c.transaction.amount)} <span className="text-[10px] text-slate-500">({c.transaction.channel})</span>
                    </div>
                    <div className="text-slate-600 font-mono text-[10px] truncate">
                      Acc: {c.transaction.sourceAccount} &rarr; {c.transaction.destinationAccount}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: FORMULA RISK EVALUATION & SCORE BREAKDOWN      */}
          {/* ========================================================= */}
          <div className="border border-[#b5a363] rounded shadow-xs overflow-hidden bg-white">
            <div 
              onClick={() => setIsRiskScoreOpen(!isRiskScoreOpen)}
              className="px-4 py-2.5 bg-[#85712f] hover:bg-[#786629] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition select-none"
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-200" />
                <span className="tracking-wide">Evaluasi Formula Risk &amp; Akumulasi Score</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isRiskScoreOpen ? 'menutup' : 'membuka'}</span>
                {isRiskScoreOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isRiskScoreOpen && (
              <div className="p-4 bg-white space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  
                  {/* Score 1: Base Score */}
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center space-y-1">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Rule Base Score</span>
                    <div className="text-2xl font-mono font-extrabold text-blue-900">{c.baseScore}</div>
                    <div className="text-[10px] text-blue-600">Bobot Dasar Rule Basic</div>
                  </div>

                  {/* Score 2: Formula Risk Points */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Formula Risk Points</span>
                    <div className="text-2xl font-mono font-extrabold text-amber-900">+{c.formulaRiskPoints}</div>
                    <div className="text-[10px] text-amber-700">{c.formulaMatches?.length || 0} Inkremental Matched</div>
                  </div>

                  {/* Score 3: Final Risk Score */}
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center space-y-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Final Calculated Risk Score</span>
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-3xl font-mono font-black text-rose-900">{c.finalRiskScore}</span>
                      <span className="text-slate-400 text-lg">/ 100</span>
                      <UrgencyBadge urgency={c.finalRiskLevel} />
                    </div>
                    <div className="text-[10px] text-rose-700">Formula: Base Score ({c.baseScore}) + Formula Points (+{c.formulaRiskPoints})</div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 3: MATCHED FORMULA RISK DETAILS                   */}
          {/* ========================================================= */}
          <div className="border border-[#b5a363] rounded shadow-xs overflow-hidden bg-white">
            <div 
              onClick={() => setIsFormulaRulesOpen(!isFormulaRulesOpen)}
              className="px-4 py-2.5 bg-[#85712f] hover:bg-[#786629] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition select-none"
            >
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-200" />
                <span className="tracking-wide">Rincian Formula Risk Indicator Matched</span>
                <span className="px-2 py-0.2 rounded-full bg-amber-900/60 text-amber-200 text-[10px] font-mono">
                  {c.formulaMatches?.length || 0} Terdeteksi
                </span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isFormulaRulesOpen ? 'menutup' : 'membuka'}</span>
                {isFormulaRulesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isFormulaRulesOpen && (
              <div className="p-4 bg-white space-y-3">
                {c.formulaMatches && c.formulaMatches.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                          <th className="p-2.5 border-r border-slate-200 w-12 text-center">No</th>
                          <th className="p-2.5 border-r border-slate-200 font-mono">Formula Code</th>
                          <th className="p-2.5 border-r border-slate-200">Formula Risk Name</th>
                          <th className="p-2.5 border-r border-slate-200">Indikator Kenaikan</th>
                          <th className="p-2.5 text-center w-24">Poin Tambahan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {c.formulaMatches.map((m, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/50 transition">
                            <td className="p-2.5 border-r border-slate-200 text-center font-mono text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-amber-900">{m.formulaCode}</td>
                            <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">{m.name}</td>
                            <td className="p-2.5 border-r border-slate-200 text-slate-700">
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-medium">
                                {m.matchedField}
                              </span>
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold text-emerald-700 bg-emerald-50/50">
                              +{m.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-slate-500 italic">
                    Tidak ada formula risk indikator inkremental yang terpicu untuk transaksi ini. Hanya menggunakan Base Score dasar.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 4: TABBED TRANSACTION NAVIGATION (ALERT & HISTORY) */}
          {/* ========================================================= */}
          <div className="border border-[#b5a363] rounded shadow-xs overflow-hidden bg-white">
            {/* Tab Header Selector */}
            <div className="px-4 py-2 bg-[#85712f] text-white flex flex-wrap items-center justify-between border-b border-[#6f5e26]">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTransactionTab('alert')}
                  className={`px-3.5 py-1.5 rounded-t-lg font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
                    activeTransactionTab === 'alert'
                      ? 'bg-white text-[#85712f] shadow-xs'
                      : 'text-amber-100 hover:bg-[#786629] hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Transaction Alert ({alertTransactions.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTransactionTab('history')}
                  className={`px-3.5 py-1.5 rounded-t-lg font-bold text-xs flex items-center space-x-2 transition cursor-pointer ${
                    activeTransactionTab === 'history'
                      ? 'bg-white text-[#85712f] shadow-xs'
                      : 'text-amber-100 hover:bg-[#786629] hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-amber-500" />
                  <span>Transaction History ({cifTransactionsList.length})</span>
                </button>
              </div>

              <div className="text-[11px] text-amber-100 font-mono hidden sm:flex items-center gap-2">
                <span>CIF: <strong className="text-white">{c.cif}</strong></span>
                <span>•</span>
                <span>Customer: <strong className="text-white">{c.customerName}</strong></span>
              </div>
            </div>

            {/* Tab Body Content */}
            <div className="p-4 bg-white space-y-3">
              {activeTransactionTab === 'alert' ? (
                /* TAB 1: TRANSACTION ALERT (KUMPULAN TRANSAKSI YANG DILANGGAR) */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Tab 1: Transaction Alert (Kumpulan Transaksi yang Dilanggar)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-mono font-bold border border-rose-200">
                      {alertTransactions.length} Transaksi Terdeteksi
                    </span>
                  </div>

                  <TransactionAlertTable
                    transactions={alertTransactions}
                    cif={c.cif}
                    customerName={c.customerName}
                    onSelectDetail={setSelectedTrxDetail}
                    isAlertTab={true}
                  />
                </div>
              ) : (
                /* TAB 2: TRANSACTION HISTORY (HISTORY TRANSAKSI CIF YANG PERNAH DILAKUKAN) */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <History className="w-4 h-4 text-amber-700" />
                      <span>Tab 2: Transaction History (History Transaksi CIF yang Pernah Dilakukan)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-200">
                      {filteredCifHistory.length} Recorded Transactions
                    </span>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="relative flex-1 w-full">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari Trx ID, Channel, Bank Tujuan, Rekening..."
                        value={cifSearchTerm}
                        onChange={(e) => setCifSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <span className="text-[11px] text-slate-500 shrink-0 font-medium">Status Trx:</span>
                      <select
                        value={cifStatusFilter}
                        onChange={(e) => setCifStatusFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="BERHASIL">BERHASIL</option>
                        <option value="GAGAL">GAGAL</option>
                      </select>
                    </div>
                  </div>

                  {/* Table of CIF History with 18 columns */}
                  <TransactionAlertTable
                    transactions={filteredCifHistory}
                    cif={c.cif}
                    customerName={c.customerName}
                    onSelectDetail={setSelectedTrxDetail}
                    isAlertTab={false}
                  />

                  <div className="text-[11px] text-slate-500 font-sans">
                    Menampilkan <strong>{filteredCifHistory.length}</strong> transaksi historis nasabah CIF: <strong className="text-slate-800 font-mono">{c.cif}</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 5: WORKFLOW HISTORY & LIFECYCLE (STEP 1 - 6)       */}
          {/* ========================================================= */}
          <div className="border border-[#b5a363] rounded shadow-xs overflow-hidden bg-white">
            <div 
              onClick={() => setIsWorkflowOpen(!isWorkflowOpen)}
              className="px-4 py-2.5 bg-[#85712f] hover:bg-[#786629] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition select-none"
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-amber-200" />
                <span className="tracking-wide">Workflow History &amp; Lifecycle (Step 1 - 6)</span>
                <span className="px-2 py-0.2 rounded-full bg-amber-900/60 text-amber-200 text-[10px] font-mono">
                  Active Progress
                </span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isWorkflowOpen ? 'menutup' : 'membuka'}</span>
                {isWorkflowOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isWorkflowOpen && (
              <div className="p-4 bg-white space-y-4">
                <CaseWorkflowMilestonesView fraudCase={c} />
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 6: FOLLOW UP CASE MANAGEMENT FORM                 */}
          {/* ========================================================= */}
          <div className="border border-[#b5a363] rounded shadow-xs overflow-hidden bg-white">
            <div 
              onClick={() => setIsFollowUpOpen(!isFollowUpOpen)}
              className="px-4 py-2.5 bg-[#85712f] hover:bg-[#786629] text-white font-bold text-xs flex items-center justify-between cursor-pointer transition select-none"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-200" />
                <span className="tracking-wide">Follow Up Case Management</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isFollowUpOpen ? 'menutup' : 'membuka'}</span>
                {isFollowUpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isFollowUpOpen && (
              <div className="p-4 sm:p-5 bg-white space-y-4">
                {/* Status Informational Banners */}
                {isClosed && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-emerald-800 flex items-center gap-2">
                        <span>STATUS KASUS: CLOSED (SELESAI)</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 text-[10px] font-mono">Disetujui</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        Kasus ini telah disetujui dan ditutup secara resmi oleh Checker <strong>{c.approvedBy || 'Supervisor'}</strong> pada {c.approvedAt || '-'}. Seluruh formulir dalam status <strong>Read-Only</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {isPendingApproval && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-0.5 flex-1">
                      <div className="font-bold text-xs text-amber-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span>STATUS KASUS: PENDING APPROVAL (MENUNGGU PERSETUJUAN CHECKER)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-mono font-bold">
                          Maker-Checker Flow
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {isChecker 
                          ? `Kasus diajukan oleh Maker (${c.reviewer || 'Maker L1'}). Formulir investigasi disajikan dalam mode Read-Only. Silakan periksa kelengkapan analisis di bawah, lalu klik tombol "Approve" untuk menyetujui penutupan kasus atau "Reject" untuk mengembalikannya ke Maker.`
                          : `Formulir telah disubmit oleh Anda dan sedang dalam antrean verifikasi Checker (afcl2). Formulir terkunci dalam mode Read-Only hingga ada keputusan persetujuan.`
                        }
                      </p>
                    </div>
                  </div>
                )}

                {c.rejectionReason && !isPendingApproval && !isClosed && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 flex-1">
                      <div className="font-bold text-xs text-rose-800 flex items-center justify-between">
                        <span>KASUS DIKEMBALIKAN OLEH CHECKER ({c.rejectedBy || 'Checker L2'})</span>
                        <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-mono font-bold">
                          Perlu Perbaikan
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-700 leading-relaxed font-sans">
                        Catatan Penolakan: <strong className="font-medium text-rose-900">"{c.rejectionReason}"</strong>
                      </p>
                      <p className="text-[10px] text-rose-600">
                        Silakan lengkapi atau perbaiki data temuan analisis di bawah ini, lalu klik tombol <strong>Submit</strong> kembali.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* LEFT COLUMN */}
                  <div className="space-y-3.5">
                    
                    {/* Row 1: Alert Status (Read-Only / Disabled - Bound to Case Data) */}
                    <div className="flex items-center">
                      <label className="w-36 font-semibold text-slate-700 shrink-0">
                        Alert Status <span className="text-slate-400">:</span>
                      </label>
                      <div className="relative flex-1 flex items-center">
                        <input
                          id="select-alert-status-fraud"
                          type="text"
                          readOnly
                          disabled
                          value={c.alertStatus || 'Open'}
                          className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs text-slate-700 font-bold cursor-not-allowed select-none"
                        />
                        <div className="absolute right-2 flex items-center space-x-1.5 pointer-events-none">
                          <AlertStatusBadge status={c.alertStatus || 'Open'} />
                          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(Read-Only)</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Reviewer */}
                    <div className="flex items-center">
                      <label className="w-36 font-semibold text-slate-700 shrink-0">
                        Reviewer <span className="text-slate-400">:</span>
                      </label>
                      <div className="flex-1">
                        <input
                          id="input-reviewer-fraud"
                          type="text"
                          disabled={isReadOnly}
                          value={reviewer}
                          onChange={(e) => setReviewer(e.target.value)}
                          placeholder="e.g. Sysadmin - sysadmin / Analis Fraud"
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-slate-50 focus:ring-1 focus:ring-amber-500'}`}
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
                          id="select-reviewer-result-fraud"
                          disabled={isReadOnly}
                          value={reviewerResult}
                          onChange={(e) => setReviewerResult(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none pr-8 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white focus:ring-1 focus:ring-amber-500'}`}
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="FR-RR-001 - Fraud">FR-RR-001 - Fraud</option>
                          <option value="FR-RR-002 - False Positive">FR-RR-002 - False Positive</option>
                          <option value="FR-RR-003 - Suspicous">FR-RR-003 - Suspicous</option>
                        </select>
                        {!isReadOnly && reviewerResult !== 'NONE' && (
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

                    {/* Row 4: Reviewer Comment */}
                    <div className="flex flex-col space-y-1 pt-1">
                      <label className="font-semibold text-slate-700">
                        Reviewer Comment <span className="text-slate-400">:</span>
                      </label>
                      <textarea
                        id="textarea-reviewer-comment-fraud"
                        rows={4}
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                        value={reviewerComment}
                        onChange={(e) => setReviewerComment(e.target.value)}
                        placeholder="Tuliskan hasil klarifikasi nasabah, kronologi temuan, analisis pola transaksi mencurigakan, atau instruksi mitigasi lanjutan..."
                        className={`w-full p-2.5 border rounded text-xs text-slate-900 leading-relaxed font-sans ${isReadOnly ? 'bg-slate-100 border-slate-300 cursor-not-allowed text-slate-600' : 'bg-[#fef7ee] border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner'}`}
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
                          id="select-final-result-fraud"
                          disabled={isReadOnly}
                          value={finalResult}
                          onChange={(e) => setFinalResult(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none pr-8 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white focus:ring-1 focus:ring-amber-500'}`}
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="FR-FR-001 - Fraud">FR-FR-001 - Fraud</option>
                          <option value="FR-FR-002 - False Positive">FR-FR-002 - False Positive</option>
                          <option value="FR-FR-003 - Suspicous">FR-FR-003 - Suspicous</option>
                          <option value="FR-FR-004 - Need Further Investigation">FR-FR-004 - Need Further Investigation</option>
                        </select>
                        {!isReadOnly && finalResult !== 'NONE' && (
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
                          id="select-closing-action-fraud"
                          disabled={isReadOnly}
                          value={closingAction}
                          onChange={(e) => setClosingAction(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none pr-8 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white focus:ring-1 focus:ring-amber-500'}`}
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
                        {!isReadOnly && closingAction !== 'NONE' && (
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
                            disabled={isReadOnly}
                            value={suspendDuration}
                            onChange={(e) => setSuspendDuration(e.target.value)}
                            className={`w-full px-2.5 py-1.5 border border-amber-400 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
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
                          disabled={isReadOnly}
                          readOnly={isReadOnly}
                          value={customSuspendDuration}
                          onChange={(e) => setCustomSuspendDuration(e.target.value)}
                          placeholder="Masukkan durasi custom (misal: 12 Jam atau 5 Hari)"
                          className={`w-full px-2.5 py-1.5 border border-amber-300 rounded text-xs text-slate-800 font-medium ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
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
                                disabled={isReadOnly}
                                name="watchlistType"
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
                                disabled={isReadOnly}
                                name="watchlistType"
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
                                disabled={isReadOnly}
                                value={watchlistDuration}
                                onChange={(e) => setWatchlistDuration(e.target.value)}
                                className={`w-full px-2.5 py-1.5 border border-blue-400 rounded text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
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
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                              value={watchlistCustomDuration}
                              onChange={(e) => setWatchlistCustomDuration(e.target.value)}
                              placeholder="Masukkan durasi custom (misal: 12 Jam atau 5 Hari)"
                              className={`w-full px-2.5 py-1.5 border border-blue-300 rounded text-xs text-slate-800 font-medium ${isReadOnly ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
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
                          id="select-type-of-fraud-fraud"
                          disabled={isReadOnly}
                          value={typeOfFraud}
                          onChange={(e) => setTypeOfFraud(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none pr-8 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white focus:ring-1 focus:ring-amber-500'}`}
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
                        {!isReadOnly && typeOfFraud !== 'NONE' && (
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
                      caseData={c}
                      domain="fraud"
                      isReadOnly={isReadOnly}
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
                        setToastMessage('Rekomendasi AI berhasil diterapkan ke form Follow Up!');
                        setTimeout(() => setToastMessage(null), 3500);
                      }}
                    />

                    {/* Panduan Ringkas SOP */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px] space-y-1">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Panduan Penyelesaian Kasus Fraud:</span>
                      </div>
                      <p className="leading-relaxed text-slate-500 text-[10px]">
                        Pastikan seluruh data hasil wawancara, verifikasi call center, dan analisis anomali formula risk telah dirangkum sebelum menekan tombol <strong>Submit</strong> untuk otorisasi Checker L2.
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* SECTION 7: UPLOAD ATTACHMENT                              */}
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
                  isReadOnly={isReadOnly}
                />
              </div>
            )}
          </div>

        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER                                               */}
        {/* ========================================================= */}
        <div className="px-5 py-3.5 bg-[#ece7d5] border-t border-[#d3caa8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
            <span>Kasus Fraud: <strong className="text-slate-900 font-mono">{c.caseId}</strong></span>
            <span>•</span>
            <span>Status:</span>
            <AlertStatusBadge status={c.alertStatus || 'Open'} />
            {isPendingApproval && (
              <span className="text-[11px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Menunggu Approval Checker</span>
              </span>
            )}
            {isClosed && (
              <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Closed</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2.5 flex-wrap">
            {/* CHECKER ACTIONS (Available when case is Pending Approval for Checker or Sysadmin) */}
            {isPendingApproval && isChecker && (
              <>
                <button
                  id="btn-fraud-followup-reject"
                  type="button"
                  onClick={() => setShowRejectPrompt(true)}
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject (Tolak)</span>
                </button>

                <button
                  id="btn-fraud-followup-approve"
                  type="button"
                  onClick={() => setShowApprovalPrompt(true)}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve (Setujui &amp; Tutup)</span>
                </button>
              </>
            )}

            {/* MAKER ACTIONS (Available when case is editable or for sysadmin) */}
            {(!isReadOnly || isSysadmin) && (
              <>
                <button
                  id="btn-fraud-followup-save-draft"
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as Draft</span>
                </button>

                <button
                  id="btn-fraud-followup-submit"
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded bg-[#85712f] hover:bg-[#6f5e26] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </>
            )}

            {/* BACK BUTTON ALWAYS AVAILABLE */}
            <button
              id="btn-fraud-followup-back"
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded bg-[#60712f] hover:bg-[#4f5d26] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Approval Modal Prompt */}
        {showApprovalPrompt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Konfirmasi Approval &amp; Penutupan Kasus Fraud</h4>
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
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ya, Setujui &amp; Tutup Kasus (Close)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal Prompt */}
        {showRejectPrompt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Tolak Approval &amp; Kembalikan Kasus</h4>
                  <p className="text-xs text-slate-500">Case ID: <span className="font-mono font-bold text-slate-800">{c.caseId}</span></p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nama Verifikator / Checker:</label>
                <input
                  type="text"
                  value={rejectorName}
                  onChange={(e) => setRejectorName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Status Kasus Saat Ini:</label>
                <div className="flex items-center space-x-4 pt-1">
                  <span className="text-[11px] text-rose-800 font-semibold bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                    REJECTED
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Alasan Penolakan <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Tuliskan catatan perbaikan atau data investigasi yang harus dilengkapi Maker L1..."
                  className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-rose-500 placeholder:text-slate-400 font-sans"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectPrompt(false)}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Tolak &amp; Kembalikan</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <AmlCaseTransactionDetailModal
          isOpen={isAmlDetailModalOpen}
          onClose={() => setIsAmlDetailModalOpen(false)}
          caseItem={selectedAmlCaseDetailItem}
        />

        {/* Transaction Detail Pop-up Modal when Action -> Detail is clicked in Tab 1 or 2 */}
        {selectedTrxDetail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Rincian Transaksi Alert</h4>
                    <p className="text-[11px] font-mono text-blue-700 font-bold">{selectedTrxDetail.trxId}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTrxDetail(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-semibold">STATUS TRANSAKSI</span>
                  {(() => {
                    const st = normalizeTrxStatus(selectedTrxDetail.status || selectedTrxDetail.transactionStatus);
                    return (
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        st === 'BERHASIL'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {st}
                      </span>
                    );
                  })()}
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-semibold">NOMINAL TRANSAKSI</span>
                  <span className="font-mono font-bold text-rose-700 text-sm">{formatIDR(selectedTrxDetail.amount || 0)}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-semibold">CHANNEL &amp; LAYANAN</span>
                  <span className="font-semibold text-slate-800">{selectedTrxDetail.channel || 'Mobile Banking'}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-semibold">REKENING ASAL</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTrxDetail.sourceAccount || c.accountNumber || '-'}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 text-[10px] block font-semibold">REKENING TUJUAN</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTrxDetail.destinationAccount || '-'} ({selectedTrxDetail.destinationBank || '-'})</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5 col-span-2">
                  <span className="text-slate-400 text-[10px] block font-semibold">WAKTU &amp; TANGGAL TRANSAKSI</span>
                  <span className="font-mono text-slate-800">{selectedTrxDetail.timestamp || c.identifiedOn} WIB</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-0.5 col-span-2">
                  <span className="text-slate-400 text-[10px] block font-semibold">IP ADDRESS &amp; LOKASI</span>
                  <span className="font-mono text-slate-800">{selectedTrxDetail.ipAddress || '103.149.12.99'} ({selectedTrxDetail.location || 'Jakarta, ID'})</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTrxDetail(null)}
                  className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
