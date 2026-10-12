import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle, 
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
  Upload,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { FraudCase, AlertStatus, InvestigationStatus, FraudCaseAttachment, CifHistoricalTransaction } from '../../types/fms';
import { formatIDR } from '../../lib/utils';
import { UrgencyBadge, AlertStatusBadge, InvestigationStatusBadge } from '../common/Badge';
import { getCifTransactionHistory } from '../../lib/cifHistoryHelper';
import { buildAmlCifHistoryGroup } from '../../lib/amlHistoryCifHelper';
import { getRuleTemplateInfo } from '../../lib/workflowHelper';
import { CaseWorkflowMilestonesView } from './CaseWorkflowMilestonesView';
import { AmlCaseTransactionDetailModal } from './AmlCaseTransactionDetailModal';
import { normalizeTrxStatus } from './TransactionAlertTable';
import { AttachmentDropZone } from './AttachmentDropZone';
import { AiCaseRecommendationCard, AiAppliedData } from './AiCaseRecommendationCard';

export interface AmlCaseFollowUpModalProps {
  caseData?: FraudCase | null;
  onClose?: () => void;
}

export const AmlCaseFollowUpModal: React.FC<AmlCaseFollowUpModalProps> = ({ caseData: propsCaseData, onClose: propsOnClose }) => {
  const { user } = useAuth();
  const currentUser = user;

  const { 
    selectedCaseForFollowUp, 
    setSelectedCaseForFollowUp,
    selectedAmlGroupForFollowUp,
    setSelectedAmlGroupForFollowUp,
    handleSaveDraftFollowUp,
    handleSubmitFollowUp,
    handleApproveCase,
    handleRejectCase,
    updateCifStatus,
    addAmlCifHistoryGroup,
    formulaRisks,
    ruleBasics,
    listEntries,
    fraudCases
  } = useFMS();

  // Use prop if provided, else fallback to selected AML group first case or context case
  const c = useMemo(() => {
    if (propsCaseData) return propsCaseData;
    if (selectedAmlGroupForFollowUp && selectedAmlGroupForFollowUp.cases.length > 0) {
      return selectedAmlGroupForFollowUp.cases[0];
    }
    return selectedCaseForFollowUp;
  }, [propsCaseData, selectedAmlGroupForFollowUp, selectedCaseForFollowUp]);

  const handleClose = () => {
    if (propsOnClose) {
      propsOnClose();
    }
    setSelectedCaseForFollowUp(null);
    setSelectedAmlGroupForFollowUp(null);
  };

  // Section Accordion Collapsible States
  const [isAlertInfoOpen, setIsAlertInfoOpen] = useState(true);
  const [isRiskScoreOpen, setIsRiskScoreOpen] = useState(true);
  const [isWorkflowOpen, setIsWorkflowOpen] = useState(true);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(true);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(true);

  // Filter state for CIF Historical Transactions
  const [cifSearchTerm, setCifSearchTerm] = useState('');
  const [cifStatusFilter, setCifStatusFilter] = useState<'ALL' | 'SUCCESS' | 'SUSPICIOUS' | 'BLOCKED' | 'FLAGGED'>('ALL');

  // Maker - Checker Roles & Lifecycle Status Flags
  // Accurately recognizes AML L2 Checker and Sysadmin users based on currentUser.role or currentUser.username
  const isSysadmin = Boolean(
    currentUser?.username === 'sysadmin' || 
    currentUser?.role === 'sysadmin' ||
    currentUser?.role?.toLowerCase().includes('sysadmin') ||
    currentUser?.group?.toLowerCase().includes('sysadmin')
  );

  const isChecker = Boolean(
    isSysadmin || 
    currentUser?.username === 'analystl2' || 
    currentUser?.role === 'analystl2' ||
    currentUser?.role?.toLowerCase().includes('checker') || 
    currentUser?.role?.toLowerCase().includes('approver') || 
    currentUser?.group?.toLowerCase().includes('analyst l2') ||
    currentUser?.approvalLevel?.toLowerCase().includes('aml approver') ||
    currentUser?.approvalLevel?.toLowerCase().includes('senior l2')
  );

  const isMaker = Boolean(
    isSysadmin || 
    currentUser?.username === 'analystl1' || 
    currentUser?.role === 'analystl1' ||
    currentUser?.role?.toLowerCase().includes('maker') || 
    currentUser?.group?.toLowerCase().includes('analyst l1') ||
    currentUser?.role === 'AML'
  );

  const isPendingApproval = c?.alertStatus === 'Pending Approval';
  const isClosed = c?.alertStatus === 'Close';

  // Form input read-only logic:
  // When user is Checker L2 (analystl2/sysadmin) reviewing, or case is in Pending Approval or Close:
  // all form fields (Reviewer Result, Final Result, Closing Action, Type of AML Threat, Comment) are locked in Read-Only / Disabled mode so L2 focuses on reviewing L1 findings.
  const isReadOnly = (isChecker && !isSysadmin) || isPendingApproval || isClosed;

  // Form Fields State
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('Open');
  const [reviewer, setReviewer] = useState('Sysadmin - sysadmin');
  const [reviewerResult, setReviewerResult] = useState<string>('NONE');
  const [reviewerComment, setReviewerComment] = useState<string>('');
  const [finalResult, setFinalResult] = useState<string>('NONE');
  const [closingAction, setClosingAction] = useState<string>('NONE');
  const [typeOfFraud, setTypeOfFraud] = useState<string>('NONE');

  // File Upload state
  const [attachments, setAttachments] = useState<FraudCaseAttachment[]>([]);
  const [selectedFileName, setSelectedFileName] = useState('');

  // Approval Modal Prompt state
  const [showApprovalPrompt, setShowApprovalPrompt] = useState(false);
  const [approverName, setApproverName] = useState('Analis AML Supervisor (analystl2)');
  const [approverNotes, setApproverNotes] = useState('');

  // Rejection Modal Prompt state (Maker-Checker Flow)
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectorName, setRejectorName] = useState('Analis AML Checker (analystl2)');
  const [rejectReason, setRejectReason] = useState('');

  // AML Case Transaction Detail Pop-up Modal State
  const [selectedAmlCaseDetailItem, setSelectedAmlCaseDetailItem] = useState<FraudCase | null>(null);
  const [isAmlDetailModalOpen, setIsAmlDetailModalOpen] = useState(false);

  // Auto-fill user identity
  useEffect(() => {
    if (user) {
      const displayName = user.fullName || user.username;
      const roleDisplay = user.role ? user.role.toUpperCase() : 'CHECKER';
      if (!c?.reviewer || c.reviewer === 'Sysadmin - sysadmin') {
        setReviewer(`${displayName} (${user.username})`);
      }
      setApproverName(`${displayName} (${roleDisplay})`);
      setRejectorName(`${displayName} (${roleDisplay})`);
    }
  }, [user, c]);

  // Drilldown Sub-Modal State for Violated Rules / Triggering Transactions
  const [drilldownCase, setDrilldownCase] = useState<FraudCase | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);

  // Consolidated AML Cases / Rules violated by this CIF
  const cifCases = useMemo<FraudCase[]>(() => {
    if (selectedAmlGroupForFollowUp && selectedAmlGroupForFollowUp.cases.length > 0) {
      return selectedAmlGroupForFollowUp.cases;
    }
    if (!c) return [];
    const matches = (fraudCases || []).filter(fc => fc.cif === c.cif && (fc.alertCategory === 'AML' || !fc.alertCategory));
    return matches.length > 0 ? matches : [c];
  }, [selectedAmlGroupForFollowUp, c, fraudCases]);

  const handleOpenDrilldown = (item: FraudCase) => {
    setDrilldownCase(item);
    setIsDrilldownOpen(true);
  };

  const drilldownTransactions = useMemo(() => {
    if (!drilldownCase) return [];
    const primaryTx = drilldownCase.transaction;
    const ruleCode = drilldownCase.ruleBasicCode || 'B-04';
    const baseAmount = primaryTx?.amount || 50000000;
    const time = drilldownCase.identifiedOn || primaryTx?.timestamp || '2026-08-30 14:20:10';

    return [
      {
        no: 1,
        trxId: `TXN-${ruleCode}-001-${drilldownCase.no || '1'}`,
        trxRef: `REF-${ruleCode}-001-${drilldownCase.no || '1'}`,
        timestamp: time,
        category: 'Outgoing Transfer',
        status: 'SUCCESS',
        sourceName: drilldownCase.customerName || 'John Doe',
        sourceAccount: drilldownCase.cif || '8829103',
        sourceVaName: '-',
        sourceVaNumber: '-',
        destName: 'Jane Smith',
        destAccount: primaryTx?.destinationAccount || '1020088192',
        destVaName: '-',
        destVaNumber: '-',
        channel: primaryTx?.channel || 'M-Banking BI-FAST',
        origin: primaryTx?.deviceModel || 'Mobile Banking App',
        nominal: primaryTx?.amount || baseAmount,
        longitude: '106.816666',
        latitude: '-6.200000',
        note: 'Transfer dana ke rekan bisnis'
      },
      {
        no: 2,
        trxId: `TXN-${ruleCode}-002-${drilldownCase.no || '1'}`,
        trxRef: `REF-${ruleCode}-002-${drilldownCase.no || '1'}`,
        timestamp: time.replace(/:\d\d$/, ':05'),
        category: 'Outgoing Transfer',
        status: 'SUCCESS',
        sourceName: drilldownCase.customerName || 'John Doe',
        sourceAccount: drilldownCase.cif || '8829103',
        sourceVaName: '-',
        sourceVaNumber: '-',
        destName: 'Robert Johnson',
        destAccount: primaryTx?.destinationAccount || '1020088193',
        destVaName: '-',
        destVaNumber: '-',
        channel: primaryTx?.channel || 'M-Banking BI-FAST',
        origin: primaryTx?.deviceModel || 'Mobile Banking App',
        nominal: Math.round(baseAmount * 0.85),
        longitude: '106.816666',
        latitude: '-6.200000',
        note: 'Transfer uang untuk pembayaran tagihan'
      },
      {
        no: 3,
        trxId: `TXN-${ruleCode}-003-${drilldownCase.no || '1'}`,
        trxRef: `REF-${ruleCode}-003-${drilldownCase.no || '1'}`,
        timestamp: time.replace(/:\d\d$/, ':12'),
        category: 'Incoming Transfer',
        status: 'FAILED',
        sourceName: 'Unknown Sender',
        sourceAccount: '1055019201',
        sourceVaName: '-',
        sourceVaNumber: '-',
        destName: drilldownCase.customerName || 'John Doe',
        destAccount: drilldownCase.cif || '8829103',
        destVaName: '-',
        destVaNumber: '-',
        channel: 'SKN/RTGS Transfer',
        origin: 'Core Banking',
        nominal: Math.round(baseAmount * 0.95),
        longitude: '106.816666',
        latitude: '-6.200000',
        note: 'Penerimaan dana dari pihak luar'
      }
    ];
  }, [drilldownCase]);

  // Sync Form State when `c` changes
  useEffect(() => {
    if (c) {
      setAlertStatus(c.alertStatus || 'Open');
      setReviewer(c.reviewer || 'Sysadmin - sysadmin');
      setReviewerResult(c.reviewerResult || 'NONE');
      setReviewerComment(c.reviewerComment || c.resolutionNotes || '');
      setFinalResult(c.finalResult || 'NONE');
      setClosingAction(c.closingAction || 'NONE');
      setTypeOfFraud(c.typeOfFraud || 'NONE');
      setAttachments(c.attachments || []);
    }
  }, [c]);

  // Combined CIF History (Context + Dynamic Fallback Helper)
  const cifTransactionsList = useMemo<CifHistoricalTransaction[]>(() => {
    if (!c) return [];
    return getCifTransactionHistory(c);
  }, [c]);

  // Filtered CIF Transactions
  const filteredCifHistory = useMemo(() => {
    return cifTransactionsList.filter(item => {
      // Hanya tampilkan transaksi yang kena / violated rule (anomali)
      if (item.status === 'SUCCESS' && !item.isCurrentAlertTrigger) return false;

      const matchSearch = 
        item.trxId.toLowerCase().includes(cifSearchTerm.toLowerCase()) ||
        item.channel.toLowerCase().includes(cifSearchTerm.toLowerCase()) ||
        item.trxType.toLowerCase().includes(cifSearchTerm.toLowerCase()) ||
        item.destinationAccount.includes(cifSearchTerm) ||
        item.destinationBank.toLowerCase().includes(cifSearchTerm.toLowerCase());
      
      const matchStatus = cifStatusFilter === 'ALL' || item.status === cifStatusFilter;
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
    const caseIds = cifCases.length > 0 ? cifCases.map(item => item.caseId || item.id) : [c.caseId || c.id];
    caseIds.forEach(id => {
      handleSaveDraftFollowUp(id, {
        reviewer,
        reviewerResult,
        reviewerComment,
        finalResult,
        closingAction,
        typeOfFraud,
        attachments
      });
    });
    handleClose();
  };

  const handleSubmit = () => {
    if (reviewerResult === 'NONE') {
      alert('Harap pilih Reviewer Result terlebih dahulu sebelum melakukan submit kasus.');
      return;
    }
    if (finalResult === 'NONE') {
      alert('Harap pilih Final Result terlebih dahulu sebelum melakukan submit kasus.');
      return;
    }
    if (!reviewerComment || !reviewerComment.trim()) {
      alert('Harap isi Reviewer Comment dengan hasil investigasi atau klarifikasi transaksi sebelum submit.');
      return;
    }

    const caseIds = cifCases.length > 0 ? cifCases.map(item => item.caseId || item.id) : [c.caseId || c.id];
    caseIds.forEach(id => {
      handleSubmitFollowUp(id, {
        reviewer,
        reviewerResult,
        reviewerComment,
        finalResult,
        closingAction,
        typeOfFraud,
        attachments
      });
    });
    handleClose();
  };

  const handleConfirmApproval = () => {
    const caseIds = cifCases.length > 0 ? cifCases.map(item => item.caseId || item.id) : [c.caseId || c.id];
    const targetCif = c?.cif || (selectedAmlGroupForFollowUp ? selectedAmlGroupForFollowUp.cif : '');
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const resolvedPayload = {
      reviewerResult: c?.reviewerResult && c.reviewerResult !== 'NONE' ? c.reviewerResult : (reviewerResult !== 'NONE' ? reviewerResult : 'AM-RR-001 - Mencurigakan'),
      finalResult: c?.finalResult && c.finalResult !== 'NONE' ? c.finalResult : (finalResult !== 'NONE' ? finalResult : 'AM-FR-001 - Mencurigakan / AML Confirmed'),
      closingAction: c?.closingAction && c.closingAction !== 'NONE' ? c.closingAction : (closingAction !== 'NONE' ? closingAction : 'AM-CA-001 - Laporkan STR'),
      typeOfFraud: c?.typeOfFraud && c.typeOfFraud !== 'NONE' ? c.typeOfFraud : (typeOfFraud !== 'NONE' ? typeOfFraud : 'AM-TOF-001 - Structuring (Smurfing)'),
      typeOfAml: c?.typeOfFraud && c.typeOfFraud !== 'NONE' ? c.typeOfFraud : (typeOfFraud !== 'NONE' ? typeOfFraud : 'AM-TOF-001 - Structuring (Smurfing)'),
      reviewerComment: c?.reviewerComment || reviewerComment || 'Hasil penanganan dan investigasi AML L1 disetujui.',
      reviewer: c?.reviewer || reviewer || 'analystl1',
      submittedBy: c?.reviewer || reviewer || 'analystl1',
      approverComment: approverNotes || reviewerComment || 'Approved by AML Checker (L2). Kasus resmi ditutup.',
      approvedBy: approverName || currentUser?.username || 'analystl2',
      closedAt: timestamp
    };

    // 1. Process approval for all child cases with full followUpPayload
    caseIds.forEach(id => {
      handleApproveCase(id, approverName, approverNotes || reviewerComment, resolvedPayload);
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem(`fms_followup_payload_${id}`, JSON.stringify(resolvedPayload));
        }
      } catch {}
    });

    // 2. Real-time Parent CIF Investigation Status synchronization:
    // If all child alerts under this CIF are approved/closed -> 'Closed', otherwise 'Partial Closed'
    const totalChildCount = cifCases.length;
    const isAllChildApproved = caseIds.length >= totalChildCount;
    const targetCifStatus: InvestigationStatus = isAllChildApproved ? 'Closed' : 'Partial Closed';

    if (targetCif) {
      updateCifStatus(targetCif, targetCifStatus);
    }

    // 3. Explicitly persist approval audit record and updated cases array into sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const approvalRecord = {
          caseIds,
          cif: targetCif,
          cifInvestigationStatus: targetCifStatus,
          action: 'APPROVE',
          previousStatus: 'Pending Approval',
          newStatus: 'Close',
          approvedBy: approverName || currentUser?.username || 'analystl2',
          maker: resolvedPayload.submittedBy,
          reviewerResult: resolvedPayload.reviewerResult,
          finalResult: resolvedPayload.finalResult,
          closingAction: resolvedPayload.closingAction,
          typeOfFraud: resolvedPayload.typeOfFraud,
          typeOfAml: resolvedPayload.typeOfAml,
          reviewerComment: resolvedPayload.reviewerComment,
          notes: approverNotes || reviewerComment || 'Approved by AML Checker (L2)',
          timestamp
        };
        sessionStorage.setItem('fms_last_aml_approval', JSON.stringify(approvalRecord));
        const historyRaw = sessionStorage.getItem('fms_approval_history');
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        sessionStorage.setItem('fms_approval_history', JSON.stringify([...history, approvalRecord]));

        // Ensure session cases list in sessionStorage has alertStatus 'Close' and investigationStatus 'Closed'
        const rawCases = sessionStorage.getItem('fms_cases_list') || sessionStorage.getItem('cases_list');
        if (rawCases) {
          const parsed = JSON.parse(rawCases);
          const updated = parsed.map((item: any) => {
            if (caseIds.includes(item.caseId) || caseIds.includes(item.id) || (isAllChildApproved && item.cif === targetCif)) {
              return {
                ...item,
                alertStatus: 'Close',
                investigationStatus: 'Closed',
                reviewerResult: resolvedPayload.reviewerResult,
                finalResult: resolvedPayload.finalResult,
                closingAction: resolvedPayload.closingAction,
                typeOfFraud: resolvedPayload.typeOfFraud,
                reviewerComment: resolvedPayload.reviewerComment,
                approvedBy: approverName || currentUser?.username || 'analystl2',
                approvedAt: timestamp
              };
            }
            return item;
          });
          sessionStorage.setItem('fms_cases_list', JSON.stringify(updated));
          sessionStorage.setItem('cases_list', JSON.stringify(updated));
        }

        // 4. Construct aggregated CIF History Group object and APPEND to amlInvestigationHistory
        if (targetCif) {
          const amlCifGroupObj = buildAmlCifHistoryGroup(targetCif, cifCases, resolvedPayload);
          
          const rawAmlHist = sessionStorage.getItem('amlInvestigationHistory') || sessionStorage.getItem('fms_aml_cif_history');
          const existingAmlHist = rawAmlHist ? JSON.parse(rawAmlHist) : [];
          // APPEND new row without removing previous incident records for this CIF
          const filteredAmlHist = Array.isArray(existingAmlHist) ? existingAmlHist.filter((item: any) => item.id !== amlCifGroupObj.id) : [];
          const updatedAmlHist = [amlCifGroupObj, ...filteredAmlHist];

          sessionStorage.setItem('amlInvestigationHistory', JSON.stringify(updatedAmlHist));
          sessionStorage.setItem('fms_aml_cif_history', JSON.stringify(updatedAmlHist));

          if (addAmlCifHistoryGroup) {
            addAmlCifHistoryGroup(amlCifGroupObj);
          }
        }
      }
    } catch (e) {
      console.warn('Could not write approval to sessionStorage:', e);
    }

    setShowApprovalPrompt(false);
    handleClose();
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Harap masukkan alasan penolakan agar Maker L1 dapat memperbaiki investigasi.');
      return;
    }
    const caseIds = cifCases.length > 0 ? cifCases.map(item => item.caseId || item.id) : [c.caseId || c.id];
    const targetCif = c?.cif || (selectedAmlGroupForFollowUp ? selectedAmlGroupForFollowUp.cif : '');

    caseIds.forEach(id => {
      handleRejectCase(id, rejectorName, rejectReason);
    });

    if (targetCif) {
      updateCifStatus(targetCif, 'On Check');
    }

    // Explicitly persist rejection audit record into sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const timestamp = new Date().toISOString();
        const rejectionRecord = {
          caseIds,
          cif: targetCif,
          action: 'REJECT',
          previousStatus: 'Pending Approval',
          newStatus: 'Rejected',
          rejectedBy: rejectorName || currentUser?.username || 'analystl2',
          reason: rejectReason,
          timestamp
        };
        sessionStorage.setItem('fms_last_aml_rejection', JSON.stringify(rejectionRecord));
        const historyRaw = sessionStorage.getItem('fms_approval_history');
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        sessionStorage.setItem('fms_approval_history', JSON.stringify([...history, rejectionRecord]));
      }
    } catch (e) {
      console.warn('Could not write rejection to sessionStorage:', e);
    }

    setShowRejectPrompt(false);
    handleClose();
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
                  Follow Up AML Case Management
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 text-xs font-mono font-bold border border-amber-400/30">
                  {c.caseId}
                </span>
                {selectedAmlGroupForFollowUp && (
                  <span className="px-2 py-0.5 rounded bg-blue-900/70 text-blue-200 text-xs font-bold border border-blue-400/30">
                    AGGREGATED CIF GROUP ({selectedAmlGroupForFollowUp.cases.length} ALERTS)
                  </span>
                )}
                {c.isManualAlert && (
                  <span className="px-2 py-0.5 rounded bg-purple-900/70 text-purple-200 text-xs font-bold border border-purple-400/30">
                    MANUAL INTAKE ({c.source})
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-100/80 font-medium">
                Pemeriksaan Kasus AML • Aggregated CIF Risk &amp; Structuring / Layering Analysis
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

        {/* ========================================================= */}
        {/* MODAL BODY (ACCORDION SECTIONS)                            */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-sans text-xs">

          {/* Top Banner Infobar when Status is Pending Approval */}
          {isPendingApproval && (
            <div id="banner-pending-approval-aml-top" className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start space-x-3 shadow-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1 flex-1">
                <div className="font-bold text-xs text-amber-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>STATUS KASUS: PENDING APPROVAL (MENUNGGU PERSETUJUAN CHECKER)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 text-[10px] font-mono font-bold">
                    {isChecker ? 'Checker AML (analystl2)' : 'Maker AML (analystl1)'}
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                  {isChecker 
                    ? 'Formulir ini membutuhkan verifikasi & persetujuan Anda sebagai Checker AML.' 
                    : 'Formulir investigasi telah disubmit oleh Anda dan sedang menunggu persetujuan dari Checker AML (analystl2).'
                  }
                </p>
                {isChecker && (
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Seluruh field investigasi dalam kondisi Read-Only / Terkunci. Silakan verifikasi hasil investigasi L1, lalu klik <strong>"Approve"</strong> untuk menyetujui dan menutup kasus, atau <strong>"Reject"</strong> untuk mengembalikannya ke Maker.
                  </p>
                )}
              </div>
            </div>
          )}

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
                <span className="tracking-wide">Informasi Utama Kasus &amp; Parameter AML Deteksi</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isAlertInfoOpen ? 'menutup' : 'membuka'}</span>
                {isAlertInfoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isAlertInfoOpen && (
              <div className="p-4 bg-white space-y-4">
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

                {/* Main Table: Daftar Case / Rule AML yang Dilanggar CIF Ini */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between font-bold text-slate-800">
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      <span>Daftar Case / Rule AML yang Dilanggar CIF Ini ({c.cif})</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono">
                        {cifCases.length} Alert Case / Rule Terdeteksi
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-72 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="p-2.5 border-r border-slate-200 w-12 text-center">No</th>
                          <th className="p-2.5 border-r border-slate-200 font-mono">Alert Case ID</th>
                          <th className="p-2.5 border-r border-slate-200">Rule Code &amp; Rule Name</th>
                          <th className="p-2.5 border-r border-slate-200 text-right">Nominal Exposure (Rp)</th>
                          <th className="p-2.5 border-r border-slate-200 text-center">Status</th>
                          <th className="p-2.5 border-r border-slate-200 text-center">Severity / Priority</th>
                          <th className="p-2.5">Waktu Terdeteksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {cifCases.map((caseItem, idx) => (
                          <tr key={caseItem.id || caseItem.caseId || idx} className="hover:bg-amber-50/50 transition">
                            <td className="p-2.5 border-r border-slate-200 text-center font-mono text-slate-500 font-bold">
                              {idx + 1}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 font-mono font-bold">
                              <button
                                type="button"
                                onClick={() => handleOpenDrilldown(caseItem)}
                                className="text-blue-700 hover:text-blue-950 hover:underline flex items-center gap-1.5 cursor-pointer font-extrabold"
                              >
                                <span>{caseItem.caseId}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              </button>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 font-sans">
                              <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[10px] rounded shrink-0">
                                  {caseItem.ruleBasicCode}
                                </span>
                                <span className="font-semibold text-slate-800">{caseItem.ruleName}</span>
                              </div>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                              {formatIDR(caseItem.transaction?.amount || 0)}
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-center whitespace-nowrap">
                              <div className="flex flex-col items-center gap-1">
                                <AlertStatusBadge status={caseItem.alertStatus} />
                                <InvestigationStatusBadge status={caseItem.investigationStatus} />
                              </div>
                            </td>
                            <td className="p-2.5 border-r border-slate-200 text-center">
                              <UrgencyBadge urgency={caseItem.caseUrgency} />
                            </td>
                            <td className="p-2.5 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                              {caseItem.identifiedOn || caseItem.transaction?.timestamp || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 font-sans flex items-center justify-between">
                    <span>
                      Menampilkan <strong>{cifCases.length}</strong> alert case / rule AML yang terdeteksi melanggar pada CIF: <strong className="text-slate-800 font-mono">{c.cif}</strong> ({c.customerName}).
                    </span>
                    <span className="text-amber-800 font-medium">
                      * Klik Alert Case ID untuk melihat detail transaksi pemicu rule.
                    </span>
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
                <span className="tracking-wide">Evaluasi Formula Risk &amp; Akumulasi Score AML</span>
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
                    <div className="text-[10px] text-blue-600">Bobot Dasar Rule AML</div>
                  </div>

                  {/* Score 2: Formula Risk Points */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Formula Risk Points</span>
                    <div className="text-2xl font-mono font-extrabold text-amber-900">+{c.formulaRiskPoints}</div>
                    <div className="text-[10px] text-amber-700">{c.formulaMatches?.length || 0} Inkremental Matched</div>
                  </div>

                  {/* Score 3: Final Risk Score */}
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center space-y-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Final Calculated AML Risk Score</span>
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
                <span className="tracking-wide">Follow Up Case Management (AML)</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-200">
                <span className="text-[10px] font-normal">Klik untuk {isFollowUpOpen ? 'menutup' : 'membuka'}</span>
                {isFollowUpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isFollowUpOpen && (
              <div className="p-4 sm:p-5 bg-white space-y-4 font-sans">
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
                        Kasus AML ini telah disetujui dan ditutup secara resmi oleh Checker <strong>{c.approvedBy || 'Supervisor AML'}</strong> pada {c.approvedAt || '-'}. Seluruh formulir dalam status <strong>Read-Only</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {isPendingApproval && (
                  <div id="banner-pending-approval-aml-section4" className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start space-x-3">
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
                      <p className="text-[11px] text-amber-900 font-semibold leading-relaxed">
                        {isChecker 
                          ? 'Formulir ini membutuhkan verifikasi & persetujuan Anda sebagai Checker AML.'
                          : 'Formulir investigasi telah disubmit oleh Anda dan sedang menunggu persetujuan dari Checker AML (analystl2).'
                        }
                      </p>
                      {isChecker && (
                        <p className="text-[10.5px] text-amber-800 leading-relaxed">
                          Seluruh field input di bawah disajikan dalam kondisi Read-Only / Disabled untuk verifikasi Checker sebelum menekan tombol Approve atau Reject.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {c.rejectionReason && !isPendingApproval && !isClosed && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 flex-1">
                      <div className="font-bold text-xs text-rose-800 flex items-center justify-between">
                        <span>KASUS DIKEMBALIKAN OLEH CHECKER AML ({c.rejectedBy || 'Checker L2'})</span>
                        <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 text-[10px] font-mono font-bold">
                          Perlu Perbaikan
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-700 leading-relaxed font-sans">
                        Catatan Penolakan: <strong className="font-medium text-rose-900">"{c.rejectionReason}"</strong>
                      </p>
                      <p className="text-[10px] text-rose-600">
                        Silakan lengkapi atau perbaiki data temuan analisis AML di bawah ini, lalu klik tombol <strong>Submit</strong> kembali.
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
                          id="select-alert-status-aml"
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
                          id="input-reviewer-aml"
                          type="text"
                          disabled={isReadOnly}
                          value={reviewer}
                          onChange={(e) => setReviewer(e.target.value)}
                          placeholder="e.g. Sysadmin - sysadmin / Analis AML"
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
                          id="select-reviewer-result-aml"
                          disabled={isReadOnly}
                          value={reviewerResult}
                          onChange={(e) => setReviewerResult(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none pr-8 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white focus:ring-1 focus:ring-amber-500'}`}
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="AM-RR-001 - Mencurigakan">AM-RR-001 - Mencurigakan</option>
                          <option value="AM-RR-002 - Tidak Mencurigakan">AM-RR-002 - Tidak Mencurigakan</option>
                          <option value="AM-RR-003 - Eskalasi">AM-RR-003 - Eskalasi</option>
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
                        id="textarea-reviewer-comment-aml"
                        rows={4}
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                        value={reviewerComment}
                        onChange={(e) => setReviewerComment(e.target.value)}
                        placeholder="Tuliskan analisis pola transaksi AML (Structuring, Layering, Rapid In-Out), hasil klarifikasi profil CDD/EDD nasabah..."
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
                          id="select-final-result-aml"
                          disabled={isReadOnly}
                          value={finalResult}
                          onChange={(e) => setFinalResult(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none pr-8 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white focus:ring-1 focus:ring-amber-500'}`}
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="AM-FR-001 - Mencurigakan">AM-FR-001 - Mencurigakan</option>
                          <option value="AM-FR-002 - Tidak Mencurigakan">AM-FR-002 - Tidak Mencurigakan</option>
                          <option value="AM-FR-003 - Eskalasi">AM-FR-003 - Eskalasi</option>
                          <option value="AM-FR-004 - Need Further Investigation">AM-FR-004 - Need Further Investigation</option>
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
                          id="select-closing-action-aml"
                          disabled={isReadOnly}
                          value={closingAction}
                          onChange={(e) => setClosingAction(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none pr-8 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white focus:ring-1 focus:ring-amber-500'}`}
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="AM-CA-001 - Membuat Lembar Analisa Manual">AM-CA-001 - Membuat Lembar Analisa Manual</option>
                          <option value="AM-CA-002 - Transaksi Wajar">AM-CA-002 - Transaksi Wajar</option>
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

                    {/* Row 3: Type of Fraud / AML Threat */}
                    <div className="flex items-center">
                      <label className="w-36 font-semibold text-slate-700 shrink-0">
                        Type of AML Threat <span className="text-slate-400">:</span>
                      </label>
                      <div className="relative flex-1 flex items-center">
                        <select
                          id="select-type-of-fraud-aml"
                          disabled={isReadOnly}
                          value={typeOfFraud}
                          onChange={(e) => setTypeOfFraud(e.target.value)}
                          className={`w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 font-medium focus:outline-none pr-8 ${isReadOnly ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white focus:ring-1 focus:ring-amber-500'}`}
                        >
                          <option value="NONE">Pilih Result/Action...</option>
                          <option value="AM-TOF-001 - Pinjaman Online">AM-TOF-001 - Pinjaman Online</option>
                          <option value="AM-TOF-002 - Judi Online">AM-TOF-002 - Judi Online</option>
                          <option value="AM-TOF-003 - Transaksi Wajar Sesuai Profile">AM-TOF-003 - Transaksi Wajar Sesuai Profile</option>
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
                      domain="aml"
                      isReadOnly={isReadOnly}
                      onApplyRecommendation={(data: AiAppliedData) => {
                        setReviewerResult(data.reviewerResult);
                        setFinalResult(data.finalResult);
                        setClosingAction(data.closingAction);
                        setTypeOfFraud(data.typeOfFraud);
                        if (data.replaceComment || !reviewerComment.trim()) {
                          setReviewerComment(data.suggestedComment);
                        } else {
                          setReviewerComment(prev => `${prev}\n\n${data.suggestedComment}`);
                        }
                      }}
                    />

                    {/* Panduan Ringkas SOP AML */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px] space-y-1">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Panduan Penyelesaian Kasus AML:</span>
                      </div>
                      <p className="leading-relaxed text-slate-500 text-[10px]">
                        Pastikan seluruh indikasi pencucian uang, akumulasi nilai transaksi antar-rekening, serta dokumen verifikasi EDD nasabah telah ditinjau secara saksama sebelum pengajuan otorisasi.
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
        <div className="px-5 py-3.5 bg-[#ece7d5] border-t border-[#d3caa8] flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
          <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
            <span>Kasus AML: <strong className="text-slate-900 font-mono">{c.caseId}</strong></span>
            <span>•</span>
            <span>Status:</span>
            <AlertStatusBadge status={c.alertStatus || 'Open'} />
            {isPendingApproval && (
              <span className="text-[11px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Menunggu Approval Checker AML</span>
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
                  id="btn-aml-followup-reject"
                  type="button"
                  onClick={() => setShowRejectPrompt(true)}
                  className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject (Tolak)</span>
                </button>

                <button
                  id="btn-aml-followup-approve"
                  type="button"
                  onClick={() => setShowApprovalPrompt(true)}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve (Setujui &amp; Tutup)</span>
                </button>
              </>
            )}

            {/* MAKER ACTIONS (Only available when case is editable - NOT in Pending Approval and NOT Closed) */}
            {!isPendingApproval && !isClosed && (!isReadOnly || isSysadmin) && (
              <>
                <button
                  id="btn-aml-followup-save-draft"
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as Draft</span>
                </button>

                <button
                  id="btn-aml-followup-submit"
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
              id="btn-aml-followup-back"
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
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 font-sans">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Konfirmasi Approval &amp; Penutupan Kasus AML</h4>
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
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 font-sans">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Tolak Approval &amp; Kembalikan Kasus AML</h4>
                  <p className="text-xs text-slate-500">Case ID: <span className="font-mono font-bold text-slate-800">{c.caseId}</span></p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nama Verifikator / Checker AML:</label>
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
                  placeholder="Tuliskan catatan perbaikan investigasi AML atau dokumen EDD yang harus dilengkapi Maker L1..."
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

        {/* Sub-Modal Sekunder: Detail Transaksi Pemicu Rule (Drilldown) */}
        {isDrilldownOpen && drilldownCase && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-amber-900/30 w-full max-w-7xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a120b] via-[#241a10] to-[#1a120b] text-white p-4 flex items-center justify-between border-b border-amber-800/40 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#3a2912] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-300">
                      Detail Transaksi Pemicu Rule: {drilldownCase.caseId} - {drilldownCase.ruleName}
                    </h3>
                    <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                      CIF: <strong className="text-white">{drilldownCase.cif}</strong> | Nasabah: <strong className="text-white">{drilldownCase.customerName}</strong> | Rule Code: <strong className="text-amber-400">{drilldownCase.ruleBasicCode}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrilldownOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Body */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/80 text-xs flex-1">
                
                {/* Info Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Alert Case ID</div>
                    <div className="font-mono font-bold text-amber-900 text-xs">{drilldownCase.caseId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Rule Code &amp; Name</div>
                    <div className="font-bold text-slate-800 text-xs truncate">[{drilldownCase.ruleBasicCode}] {drilldownCase.ruleName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Nominal Exposure</div>
                    <div className="font-mono font-bold text-rose-700 text-xs">{formatIDR(drilldownCase.transaction?.amount || 0)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Severity / Priority</div>
                    <div className="mt-0.5"><UrgencyBadge urgency={drilldownCase.caseUrgency} /></div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto w-full max-w-full border rounded-lg shadow-sm max-h-[400px]">
                  <div className="px-3.5 py-2.5 bg-slate-800 text-white font-bold text-xs flex items-center justify-between sticky left-0 right-0">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-amber-300" />
                      <span>Daftar Transaksi Spesifik Pemicu Case ID Ini</span>
                    </div>
                    <span className="text-[10px] font-mono bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded">
                      {drilldownTransactions.length} Transaksi Violations
                    </span>
                  </div>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                      <tr>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Transaction ID</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Transaction Reference</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Tanggal Transaksi</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Transaction Category</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Transaction Status</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Source Account Name</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Source Account Number</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Source Account VA Name</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Source Account VA Number</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Beneficiary Account Name</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Beneficiary Account Number</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Beneficiary Account VA Name</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Beneficiary Account VA Number</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Channel</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Origin</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Amount (Rp)</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Longitude</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200">Latitude</th>
                        <th className="whitespace-nowrap px-3 py-2 text-xs font-mono">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      {drilldownTransactions.map((tx) => (
                        <tr key={tx.no} className="hover:bg-amber-50/50 transition">
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 font-bold text-blue-900">{tx.trxId}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-600">{tx.trxRef}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-600">{tx.timestamp}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-800">{tx.category}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-center">
                            {(() => {
                              const st = normalizeTrxStatus(tx.status);
                              return (
                                <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] border ${
                                  st === 'BERHASIL' 
                                    ? 'bg-green-100 text-green-800 border-green-300' 
                                    : 'bg-red-100 text-red-800 border-red-300'
                                }`}>
                                  {st}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-800">{tx.sourceName}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-800">{tx.sourceAccount}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-500">{tx.sourceVaName}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-500">{tx.sourceVaNumber}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-800">{tx.destName}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-800">{tx.destAccount}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-500">{tx.destVaName}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-500">{tx.destVaNumber}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-800">{tx.channel}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-800">{tx.origin}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-900 font-bold text-right">{formatIDR(tx.nominal)}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-600">{tx.longitude}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono border-r border-slate-200 text-slate-600">{tx.latitude}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-xs font-mono">
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold font-sans">
                              {tx.note}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Footer */}
              <div className="p-3 bg-white border-t border-slate-200 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrilldownOpen(false)}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center space-x-2 shadow-xs"
                >
                  <span>Tutup / Kembali ke AML Follow-Up</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import { AmlCaseManagementView } from './AmlCaseManagementView';

export interface AmlCaseViewProps {
  caseData?: FraudCase | null;
  onClose?: () => void;
}

export const AmlCaseView: React.FC<AmlCaseViewProps> = (props) => {
  if (props.caseData) {
    return <AmlCaseFollowUpModal {...props} />;
  }
  return <AmlCaseManagementView />;
};

export { AmlCaseManagementView };
export default AmlCaseView;
