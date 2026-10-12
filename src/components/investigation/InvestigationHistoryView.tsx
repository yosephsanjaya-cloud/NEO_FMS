import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, 
  Scale, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Printer, 
  Eye, 
  Copy, 
  Check, 
  ArrowUpDown, 
  RefreshCw, 
  FileCheck2, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  UserCheck, 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Lock,
  ExternalLink,
  Layers,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { 
  HistoryDomain, 
  InvestigationHistoryItem, 
  HistoryClosingStatus 
} from '../../types/fms';
import { INITIAL_INVESTIGATION_HISTORY } from '../../data/mockInvestigationHistory';
import { InvestigationHistoryDetailModal } from './InvestigationHistoryDetailModal';
import { AmlInvestigationHistory } from './AmlInvestigationHistory';
import { formatRupiah, cn } from '../../lib/utils';
import { formatTaxonomyLabel, resolveClosingStatus, getHistoryBadgeMeta } from '../../lib/taxonomyHelper';

interface InvestigationHistoryViewProps {
  defaultDomain?: HistoryDomain;
}

export const InvestigationHistoryView: React.FC<InvestigationHistoryViewProps> = ({ defaultDomain = 'Fraud' }) => {
  const { ruleBasics, fraudCases, activeTab, investigationHistory, amlInvestigationHistory } = useFMS();

  // Active Domain: 'Fraud' | 'AML'
  const [activeDomain, setActiveDomain] = useState<HistoryDomain>(() => {
    if (defaultDomain) return defaultDomain;
    return activeTab === 'investigation-history-aml' ? 'AML' : 'Fraud';
  });

  useEffect(() => {
    if (defaultDomain) {
      setActiveDomain(defaultDomain);
    } else if (activeTab === 'investigation-history-aml') {
      setActiveDomain('AML');
    } else if (activeTab === 'investigation-history-fraud' || activeTab === 'investigation-history') {
      setActiveDomain('Fraud');
    }
  }, [defaultDomain, activeTab]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRuleBasic, setSelectedRuleBasic] = useState<string>('ALL');
  const [selectedClosingStatus, setSelectedClosingStatus] = useState<string>('ALL');
  const [dateRangePreset, setDateRangePreset] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedL1, setSelectedL1] = useState<string>('ALL');
  const [selectedL2, setSelectedL2] = useState<string>('ALL');

  // Modal State
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<InvestigationHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<'closedAt' | 'riskScoreSnapshot' | 'lossAmountIdr'>('closedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Merge static history with dynamic closed cases from FMS Context and sessionStorage
  const allHistoryItems = useMemo(() => {
    // Dynamic closed cases from fraudCases (both Fraud and AML)
    const dynamicallyClosedCases: InvestigationHistoryItem[] = fraudCases
      .filter(fc => (fc.alertStatus === 'Close' || fc.investigationStatus === 'Closed'))
      .map((fc, index) => {
        const isAmlDomain = fc.alertCategory === 'AML' || 
                            fc.ruleBasicCode?.toUpperCase().includes('AML') || 
                            (fc.cif && (fc.cif.startsWith('CIF88') || fc.cif.startsWith('CIF-AML')));
        const domain: HistoryDomain = isAmlDomain ? 'AML' : 'Fraud';

        // Check if there is a saved payload in sessionStorage
        let sessionPayload: any = null;
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            const raw = sessionStorage.getItem(`fms_followup_payload_${fc.caseId}`) || sessionStorage.getItem(`fms_followup_payload_${fc.id}`);
            if (raw) sessionPayload = JSON.parse(raw);
          }
        } catch {}

        const resolvedReviewer = sessionPayload?.reviewer || fc.reviewer || fc.assignee || (domain === 'Fraud' ? 'Investigator L1' : 'analystl1');
        const resolvedReviewerResult = (sessionPayload?.reviewerResult && sessionPayload.reviewerResult !== 'NONE')
          ? sessionPayload.reviewerResult
          : (fc.reviewerResult && fc.reviewerResult !== 'NONE' ? fc.reviewerResult : (domain === 'Fraud' ? 'FR-RR-001 - Fraud' : 'AM-RR-001 - Mencurigakan'));
        const resolvedFinalResult = (sessionPayload?.finalResult && sessionPayload.finalResult !== 'NONE')
          ? sessionPayload.finalResult
          : (fc.finalResult && fc.finalResult !== 'NONE' ? fc.finalResult : (domain === 'Fraud' ? 'FR-FR-001 - Fraud' : 'AM-FR-001 - Mencurigakan / AML Confirmed'));
        const resolvedClosingAction = (sessionPayload?.closingAction && sessionPayload.closingAction !== 'NONE')
          ? sessionPayload.closingAction
          : (fc.closingAction && fc.closingAction !== 'NONE' ? fc.closingAction : (domain === 'Fraud' ? 'FR-CA-001 - Suspend Account' : 'AM-CA-001 - Laporkan STR'));
        const resolvedTypeOfThreat = (sessionPayload?.typeOfFraud && sessionPayload.typeOfFraud !== 'NONE')
          ? sessionPayload.typeOfFraud
          : (sessionPayload?.typeOfAml && sessionPayload.typeOfAml !== 'NONE')
          ? sessionPayload.typeOfAml
          : (fc.typeOfFraud && fc.typeOfFraud !== 'NONE' ? fc.typeOfFraud : (domain === 'Fraud' ? 'FR-TOF-001 - Account Take Over (ATO)' : 'AM-TOF-001 - Structuring (Smurfing)'));
        const resolvedReviewerComment = sessionPayload?.reviewerComment || fc.reviewerComment || fc.resolutionNotes || 'Rekomendasi tindak lanjut telah diverifikasi oleh Investigator L1.';
        const resolvedApproverComment = sessionPayload?.approverComment || fc.approverNotes || 'Approval penutupan investigasi kasus telah disetujui L2 Checker.';
        const resolvedApprovedBy = sessionPayload?.approvedBy || fc.approvedBy || (domain === 'Fraud' ? 'afcl2' : 'analystl2');

        const closingStatus = resolveClosingStatus(domain, resolvedFinalResult, resolvedReviewerResult);

        const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const closedAtTimestamp = sessionPayload?.closedAt || fc.approvedAt || nowFormatted;

        return {
          id: `hist-dyn-${fc.id || fc.caseId || index}`,
          caseId: fc.caseId,
          ticketTitle: fc.ruleName || `Penutupan Kasus ${fc.caseId}`,
          domain,
          alertCategory: isAmlDomain ? 'AML' : 'Fraud',
          closedAt: closedAtTimestamp,
          closedDateOnly: closedAtTimestamp.substring(0, 10),
          customerName: fc.customerName,
          customerType: (fc.customerName.includes('PT') || fc.customerName.includes('CV')) ? 'Corporate' : 'Individual',
          cif: fc.cif,
          accountNumber: fc.accountNumber || fc.transaction?.sourceAccount || '10892019283',
          sourceAccount: fc.transaction?.sourceAccount || fc.accountNumber,
          ruleBasicCode: fc.ruleBasicCode,
          ruleBasicName: fc.ruleName,
          ruleTemplateCode: fc.ruleTemplateCode,
          slaLevel: 'P2 - High',
          lossAmountIdr: fc.transaction?.amount || 50000000,
          incidentDescription: fc.incidentDescription || `Kasus ${fc.ruleName} telah diselesaikan dan diapprove supervisor.`,
          reportingUnit: fc.source || 'Automated Engine (FMS)',
          branchOffice: 'KC Sampoerna Jakarta Pusat',
          l1Maker: {
            id: 'USR-INV-0142',
            name: resolvedReviewer,
            unit: domain === 'Fraud' ? 'Fraud Investigation Unit' : 'AML Compliance Unit',
            actionTime: closedAtTimestamp,
            recommendation: `${formatTaxonomyLabel(resolvedFinalResult, domain)} | Reviewer: ${formatTaxonomyLabel(resolvedReviewerResult, domain)}`,
            notes: resolvedReviewerComment
          },
          l2Checker: {
            id: 'USR-SPV-0008',
            name: resolvedApprovedBy,
            unit: domain === 'Fraud' ? 'Fraud Risk Governance & Quality Review' : 'AML Compliance & Regulatory Reporting',
            actionTime: closedAtTimestamp,
            decision: closingStatus,
            notes: resolvedApproverComment
          },
          closingStatus,
          closingAction: resolvedClosingAction,
          typeOfFraud: resolvedTypeOfThreat,
          typeOfAml: isAmlDomain ? resolvedTypeOfThreat : undefined,
          reviewerResult: resolvedReviewerResult,
          finalResult: resolvedFinalResult,
          reviewerComment: resolvedReviewerComment,
          approverComment: resolvedApproverComment,
          approvedBy: resolvedApprovedBy,
          submittedBy: resolvedReviewer,
          riskScoreSnapshot: fc.finalRiskScore || 80,
          riskLevelSnapshot: fc.finalRiskLevel || 'High',
          baseScoreSnapshot: fc.baseScore || 70,
          repeatedOffenderAdjustment: 0,
          formulaAdjustments: (fc.formulaMatches || []).map(fm => ({
            code: fm.formulaCode,
            name: fm.name,
            points: fm.points,
            matchedField: fm.matchedField,
            matchedValue: fm.matchedValue
          })),
          formulaResultTotal: fc.finalRiskScore || 80,
          anomalyTransactions: [
            {
              no: 1,
              trxId: fc.transaction?.trxId || `TRX-${fc.caseId}`,
              timestamp: fc.transaction?.timestamp || nowFormatted,
              channel: fc.transaction?.channel || 'Mobile Banking',
              amount: fc.transaction?.amount || 50000000,
              currency: 'IDR',
              statusFlag: closingStatus.includes('CONFIRMED') ? (domain === 'Fraud' ? 'CONFIRMED FRAUD' : 'CONFIRMED AML') : 'CLEARED',
              sourceAccount: fc.transaction?.sourceAccount || fc.cif,
              destinationAccount: fc.transaction?.destinationAccount || '88201938472',
              destinationBank: fc.transaction?.destinationBank || 'Bank Tujuan',
              trxType: fc.transaction?.trxType || 'Transfer'
            }
          ],
          auditTimeline: [
            {
              id: `aud-dyn-1-${fc.caseId}`,
              timestamp: fc.identifiedOn || '2026-08-25 09:00:00',
              stage: 'Case Created',
              user: 'Neo FMS Engine',
              role: 'System',
              action: 'Alert Generated',
              details: `Triggered by ${fc.ruleBasicCode}`
            },
            {
              id: `aud-dyn-2-${fc.caseId}`,
              timestamp: closedAtTimestamp,
              stage: 'Follow Up Submitted (Maker L1)',
              user: resolvedReviewer,
              role: 'L1 Maker',
              action: 'Follow Up Form Submitted',
              details: `Reviewer: ${resolvedReviewerResult}. Final: ${resolvedFinalResult}. Action: ${resolvedClosingAction}`
            },
            {
              id: `aud-dyn-3-${fc.caseId}`,
              timestamp: closedAtTimestamp,
              stage: 'Approved & Closed by L2 Checker',
              user: resolvedApprovedBy,
              role: 'L2 Reviewer',
              action: 'Approved & Permanently Closed',
              details: `Status: ${closingStatus}. Note: ${resolvedApproverComment}`
            }
          ],
          auditHash: `SHA256:${fc.caseId}${Math.random().toString(36).substring(2)}`
        };
      });

    // Combine dynamically closed cases with context state
    const contextItems = [...(investigationHistory || [])];
    const combined: InvestigationHistoryItem[] = [...dynamicallyClosedCases];

    contextItems.forEach(item => {
      if (!combined.some(c => c.caseId === item.caseId)) {
        combined.push(item);
      }
    });

    INITIAL_INVESTIGATION_HISTORY.forEach(item => {
      if (!combined.some(c => c.caseId === item.caseId)) {
        combined.push(item);
      }
    });

    return combined;
  }, [fraudCases, investigationHistory, amlInvestigationHistory]);

  // Sync to sessionStorage for demo consistency across reloads and user switching
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('fms_investigation_history', JSON.stringify(allHistoryItems));
      }
    } catch (e) {
      console.warn('Could not sync history to sessionStorage:', e);
    }
  }, [allHistoryItems]);

  // Counts for Segmented Tabs
  const fraudHistoryCount = useMemo(() => 
    allHistoryItems.filter(h => h.domain === 'Fraud').length, 
    [allHistoryItems]
  );

  const amlHistoryCount = useMemo(() => 
    allHistoryItems.filter(h => h.domain === 'AML').length, 
    [allHistoryItems]
  );

  // Available unique rule basics in dataset for filter dropdown
  const availableRules = useMemo(() => {
    const rulesMap = new Map<string, string>();
    allHistoryItems.forEach(h => {
      rulesMap.set(h.ruleBasicCode, h.ruleBasicName);
      if (h.violatedRules && h.violatedRules.length > 0) {
        h.violatedRules.forEach(r => {
          rulesMap.set(r.ruleCode, r.ruleName);
        });
      }
    });
    return Array.from(rulesMap.entries()).map(([code, name]) => ({ code, name }));
  }, [allHistoryItems]);

  // Filter items by Domain & Filter criteria
  const filteredItems = useMemo(() => {
    return allHistoryItems.filter(item => {
      // 1. Domain Check
      if (item.domain !== activeDomain) return false;

      // 2. Search Query (Case ID, CIF, Customer Name, Account Number)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCaseId = item.caseId.toLowerCase().includes(q);
        const matchesName = item.customerName.toLowerCase().includes(q);
        const matchesCif = item.cif.toLowerCase().includes(q);
        const matchesAcc = item.accountNumber.toLowerCase().includes(q);
        const matchesRule = item.ruleBasicName.toLowerCase().includes(q) || 
          item.ruleBasicCode.toLowerCase().includes(q) ||
          Boolean(item.violatedRules?.some(r => r.ruleCode.toLowerCase().includes(q) || r.ruleName.toLowerCase().includes(q)));
        if (!matchesCaseId && !matchesName && !matchesCif && !matchesAcc && !matchesRule) {
          return false;
        }
      }

      // 3. Rule Basic Filter
      if (selectedRuleBasic !== 'ALL') {
        const matchesMain = item.ruleBasicCode === selectedRuleBasic;
        const matchesMulti = Boolean(item.violatedRules?.some(r => r.ruleCode === selectedRuleBasic));
        if (!matchesMain && !matchesMulti) {
          return false;
        }
      }

      // 4. Closing Status Filter
      if (selectedClosingStatus !== 'ALL' && item.closingStatus !== selectedClosingStatus) {
        return false;
      }

      // 5. PIC L1 / L2 Filter
      if (selectedL1 !== 'ALL' && !item.l1Maker.name.includes(selectedL1)) {
        return false;
      }
      if (selectedL2 !== 'ALL' && !item.l2Checker.name.includes(selectedL2)) {
        return false;
      }

      // 6. Date Range Preset
      if (dateRangePreset === 'today') {
        const todayStr = '2026-08-25'; // Simulated current date
        if (!item.closedDateOnly.startsWith(todayStr)) return false;
      } else if (dateRangePreset === 'last7days') {
        // e.g. 2026-08-18 to 2026-08-25
        if (item.closedDateOnly < '2026-08-18') return false;
      } else if (dateRangePreset === 'last30days') {
        if (item.closedDateOnly < '2026-07-25') return false;
      } else if (dateRangePreset === 'custom') {
        if (startDate && item.closedDateOnly < startDate) return false;
        if (endDate && item.closedDateOnly > endDate) return false;
      }

      return true;
    });
  }, [
    allHistoryItems,
    activeDomain,
    searchQuery,
    selectedRuleBasic,
    selectedClosingStatus,
    selectedL1,
    selectedL2,
    dateRangePreset,
    startDate,
    endDate
  ]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA - valB) : (valB - valA);
    });
  }, [filteredItems, sortField, sortOrder]);

  // Paginated Items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedItems.length / pageSize) || 1;

  // Domain Statistics
  const stats = useMemo(() => {
    const domainItems = allHistoryItems.filter(h => h.domain === activeDomain);
    const total = domainItems.length;
    const confirmedCount = domainItems.filter(h => 
      h.closingStatus === 'CLOSED - CONFIRMED FRAUD' || h.closingStatus === 'CLOSED - CONFIRMED AML'
    ).length;
    const falsePositiveCount = domainItems.filter(h => h.closingStatus === 'CLOSED - FALSE POSITIVE').length;
    const totalLossAmount = domainItems.reduce((acc, h) => acc + h.lossAmountIdr, 0);
    const confirmedRate = total > 0 ? Math.round((confirmedCount / total) * 100) : 0;
    const fpRate = total > 0 ? Math.round((falsePositiveCount / total) * 100) : 0;

    return {
      total,
      confirmedCount,
      falsePositiveCount,
      totalLossAmount,
      confirmedRate,
      fpRate
    };
  }, [allHistoryItems, activeDomain]);

  const handleOpenDetailModal = (item: InvestigationHistoryItem) => {
    setSelectedHistoryItem(item);
    setIsModalOpen(true);
  };

  const handleCopyCif = (e: React.MouseEvent, cif: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cif);
    setCopiedId(cif);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRuleBasic('ALL');
    setSelectedClosingStatus('ALL');
    setDateRangePreset('all');
    setStartDate('');
    setEndDate('');
    setSelectedL1('ALL');
    setSelectedL2('ALL');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = [
      'Case ID',
      'Domain',
      'Deskripsi & Indikasi Kasus',
      'Tanggal Closed',
      'Nama Nasabah',
      'Customer Type',
      'CIF',
      'Account Number',
      'Rule Basic Code',
      'Rule Basic Name',
      'Risk Score Snapshot',
      'Risk Level',
      'Loss Amount (IDR)',
      'PIC L1 Maker',
      'PIC L2 Checker',
      'Status Closing',
      'Audit Hash'
    ];

    const rows = filteredItems.map(item => [
      `"${item.caseId}"`,
      `"${item.domain}"`,
      `"${(item.incidentDescription || item.ticketTitle).replace(/"/g, '""')}"`,
      `"${item.closedAt}"`,
      `"${item.customerName}"`,
      `"${item.customerType}"`,
      `"${item.cif}"`,
      `"${item.accountNumber}"`,
      `"${item.ruleBasicCode}"`,
      `"${item.ruleBasicName}"`,
      item.riskScoreSnapshot,
      `"${item.riskLevelSnapshot}"`,
      item.lossAmountIdr,
      `"${item.l1Maker.name}"`,
      `"${item.l2Checker.name}"`,
      `"${item.closingStatus}"`,
      `"${item.auditHash}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Investigation_History_${activeDomain}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. HEADER & SUB-SEGMENTED TABS
         ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 text-xs text-blue-600 font-bold uppercase tracking-wider font-mono mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Immutable Audit Archive • Bank Sampoerna Neo FMS</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Investigation History
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Wadah arsip audit penutupan kasus Fraud &amp; AML berstatus <span className="font-semibold text-slate-700">CLOSED</span> lengkap dengan snapshot formula risiko permanen dan verifikasi dual control.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-export-csv-history"
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              id="btn-print-summary-history"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Ringkasan</span>
            </button>
          </div>
        </div>

        {/* Locked Domain Indicator */}
        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {activeDomain === 'Fraud' ? (
              <div id="badge-locked-history-fraud" className="px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center space-x-2 shadow-2xs">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Fraud History Archive ({fraudHistoryCount} Record)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-100 text-red-700 border border-red-300">
                  LOCKED
                </span>
              </div>
            ) : (
              <div id="badge-locked-history-aml" className="px-4 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex items-center space-x-2 shadow-2xs">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>AML History Archive ({amlHistoryCount} Record)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  LOCKED
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Audit State: <strong className="text-slate-700">Sealed &amp; Read-Only</strong></span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. METRIC STAT CARDS
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Closed */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kasus Ditutup</span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">Kasus {activeDomain}</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2 font-mono">
            <span>SLA Closed Ratio:</span>
            <span className="font-bold text-emerald-600">100% On-Time</span>
          </div>
        </div>

        {/* Card 2: Confirmed Violations */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {activeDomain === 'Fraud' ? 'Confirmed Fraud' : 'Confirmed AML'}
            </span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-red-600 font-mono">{stats.confirmedCount}</span>
            <span className="text-xs text-slate-500 font-medium">({stats.confirmedRate}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2 font-mono">
            <span>Tindakan:</span>
            <span className="font-bold text-red-700">Hard Block / LTKM</span>
          </div>
        </div>

        {/* Card 3: False Positive */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">False Positive</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{stats.falsePositiveCount}</span>
            <span className="text-xs text-slate-500 font-medium">({stats.fpRate}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2 font-mono">
            <span>Tindakan:</span>
            <span className="font-bold text-emerald-700">Normalisasi / Release</span>
          </div>
        </div>

        {/* Card 4: Total Value Investigated */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Nilai Finansial</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-black text-slate-900 font-mono">
              {formatRupiah(stats.totalLossAmount)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2 font-mono">
            <span>Nilai Tertinggi:</span>
            <span className="font-bold text-purple-700">Audit Snapshot Terkunci</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. CONTENT DOMAIN CONDITIONAL (AML CIF GROUPING vs FRAUD FLAT TABLE)
         ========================================================================= */}
      {activeDomain === 'AML' ? (
        <AmlInvestigationHistory />
      ) : (
        <>
          {/* =========================================================================
              3. GLOBAL FILTER BAR (SPEC MANDATE 1)
             ========================================================================= */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Global Filter Bar</h3>
          </div>
          {(searchQuery || selectedRuleBasic !== 'ALL' || selectedClosingStatus !== 'ALL' || dateRangePreset !== 'all' || selectedL1 !== 'ALL' || selectedL2 !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 cursor-pointer transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
          {/* Search Bar (by Case ID, CIF, Nama Nasabah/Perusahaan) */}
          <div className="lg:col-span-4 relative">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Search by Case ID, CIF, Nama Nasabah/PT
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="input-search-history"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Ketik Case ID, CIF, nama nasabah..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Date Range Preset */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Rentang Tanggal Penutupan (Closed)
            </label>
            <select
              id="select-date-preset-history"
              value={dateRangePreset}
              onChange={(e) => {
                setDateRangePreset(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">Semua Tanggal Arsip</option>
              <option value="today">Hari Ini</option>
              <option value="last7days">7 Hari Terakhir</option>
              <option value="last30days">30 Hari Terakhir</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Filter Rule Basic Violated */}
          <div className="lg:col-span-3">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Filter Rule Basic Violated
            </label>
            <select
              id="select-rule-history"
              value={selectedRuleBasic}
              onChange={(e) => {
                setSelectedRuleBasic(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">Semua Rule Basic</option>
              {availableRules.map(r => (
                <option key={r.code} value={r.code}>
                  {r.code} - {r.name.length > 30 ? r.name.substring(0, 30) + '...' : r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Closing Status */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Status Closing
            </label>
            <select
              id="select-status-history"
              value={selectedClosingStatus}
              onChange={(e) => {
                setSelectedClosingStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">Semua Status</option>
              {activeDomain === 'Fraud' ? (
                <>
                  <option value="CLOSED - CONFIRMED FRAUD">CONFIRMED FRAUD</option>
                  <option value="CLOSED - FALSE POSITIVE">FALSE POSITIVE</option>
                </>
              ) : (
                <>
                  <option value="CLOSED - CONFIRMED AML">CONFIRMED AML</option>
                  <option value="CLOSED - FALSE POSITIVE">FALSE POSITIVE</option>
                </>
              )}
            </select>
          </div>

          {/* Custom Date Pickers if 'custom' selected */}
          {dateRangePreset === 'custom' && (
            <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          4. TABEL DAFTAR HISTORY (SPEC MANDATE 2)
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">
              Daftar Kasus Terarsip ({filteredItems.length})
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-mono">
              Halaman {currentPage} dari {totalPages}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500">Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                {/* 1. CASE ID / GROUP ID */}
                <th className="px-4 py-3 whitespace-nowrap">
                  Fraud Case ID
                </th>

                {/* 2. Tanggal Closed */}
                <th 
                  onClick={() => {
                    if (sortField === 'closedAt') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('closedAt');
                      setSortOrder('desc');
                    }
                  }}
                  className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-200/70 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Tanggal Closed</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 3. Nama Nasabah / Perusahaan */}
                <th className="px-4 py-3 whitespace-nowrap">
                  Nama Nasabah / Perusahaan
                </th>

                {/* 4. CIF / Account Number */}
                <th className="px-4 py-3 whitespace-nowrap">
                  CIF / Account Number
                </th>

                {/* 5. Rule Basic Violated */}
                <th className="px-4 py-3 whitespace-nowrap">
                  Rule Basic Violated
                </th>

                {/* 6. Risk Score Snapshot */}
                <th 
                  onClick={() => {
                    if (sortField === 'riskScoreSnapshot') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('riskScoreSnapshot');
                      setSortOrder('desc');
                    }
                  }}
                  className="px-4 py-3 text-center whitespace-nowrap cursor-pointer hover:bg-slate-200/70 transition"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Risk Score Snapshot</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 7. Status Closing */}
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  Status Closing
                </th>

                {/* 8. Aksi */}
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-sans">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileCheck2 className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">Tidak ada data arsip kasus yang cocok dengan filter.</p>
                      <p className="text-xs text-slate-400">Coba ubah kriteria pencarian atau klik tombol Reset Filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isConfirmed = item.closingStatus === 'CLOSED - CONFIRMED FRAUD' || item.closingStatus === 'CLOSED - CONFIRMED AML';
                  
                  return (
                    <tr 
                      key={item.id}
                      onClick={() => handleOpenDetailModal(item)}
                      className="hover:bg-blue-50/50 cursor-pointer transition group"
                    >
                      {/* 1. Case ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetailModal(item);
                          }}
                          className="font-mono font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100/90 px-2 py-1 rounded border border-blue-200 inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer group-hover:border-blue-400"
                          title="Klik untuk membuka Audit Snapshot Kasus"
                        >
                          <Lock className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="underline decoration-blue-400 underline-offset-2">{item.caseId}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                        </button>
                        <span className="block text-[10px] text-slate-400 font-mono mt-1 truncate max-w-[140px]">
                          {item.incidentDescription || item.ticketTitle}
                        </span>
                      </td>

                      {/* 2. Tanggal Closed */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono text-slate-800 font-semibold text-xs">
                          {item.closedAt}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Closed WIB
                        </span>
                      </td>

                      {/* 3. Nama Nasabah / Perusahaan */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.customerName}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-medium">
                            {item.customerType}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {formatRupiah(item.lossAmountIdr)}
                        </div>
                      </td>

                      {/* 4. CIF / Account Number */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-700">{item.cif}</span>
                          <button
                            onClick={(e) => handleCopyCif(e, item.cif)}
                            className="text-slate-400 hover:text-blue-600 p-0.5"
                            title="Copy CIF"
                          >
                            {copiedId === item.cif ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                          Acc: {item.accountNumber}
                        </div>
                      </td>

                      {/* 5. Rule Basic Violated */}
                      <td className="px-4 py-3.5 max-w-[240px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-slate-800 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                            {item.ruleBasicCode}
                          </span>
                          {item.violatedRules && item.violatedRules.length > 1 && (
                            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 bg-amber-100 text-amber-800 border border-amber-200 rounded">
                              +{item.violatedRules.length - 1} Rules
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-1" title={item.ruleBasicName}>
                          {item.ruleBasicName}
                        </p>
                      </td>

                      {/* 6. Risk Score Snapshot */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <span className={cn(
                            "px-2.5 py-1 rounded-md font-mono font-bold text-xs shadow-2xs",
                            item.riskScoreSnapshot >= 80 
                              ? "bg-red-100 text-red-800 border border-red-200" 
                              : item.riskScoreSnapshot >= 50 
                              ? "bg-amber-100 text-amber-900 border border-amber-200" 
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          )}>
                            {item.riskScoreSnapshot}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.riskLevelSnapshot}
                        </span>
                      </td>

                      {/* 7. Status Closing */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {(() => {
                          const badgeMeta = getHistoryBadgeMeta(item.closingStatus, item.domain, item.finalResult);
                          return (
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono inline-block shadow-2xs border",
                              badgeMeta.bgClass
                            )}>
                              {badgeMeta.badgeLabel}
                            </span>
                          );
                        })()}
                      </td>

                      {/* 8. Aksi */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          id={`btn-detail-history-${item.caseId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetailModal(item);
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 mx-auto cursor-pointer border border-blue-200 group-hover:border-blue-600 shadow-2xs"
                          title="Klik untuk membuka Ringkasan Investigasi Read-Only"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail / View Summary</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan <span className="font-bold text-slate-900">{filteredItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai{' '}
            <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredItems.length)}</span> dari{' '}
            <span className="font-bold text-slate-900">{filteredItems.length}</span> total kasus terarsip
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <div className="px-2 font-mono font-bold text-slate-700">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium flex items-center space-x-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {/* =========================================================================
          5. DETAIL AUDIT SNAPSHOT MODAL
         ========================================================================= */}
      <InvestigationHistoryDetailModal
        item={selectedHistoryItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHistoryItem(null);
        }}
      />
    </div>
  );
};
