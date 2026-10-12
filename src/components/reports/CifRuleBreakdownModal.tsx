import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShieldAlert, 
  Layers, 
  Clock, 
  Activity, 
  Building2, 
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { CustomerRuleSummary } from '../../types/fms';
import { CaseTransactionsModal, CaseTransactionsData } from './CaseTransactionsModal';

export interface CifRuleTriggerEvent {
  id: string;
  no: number;
  timestamp: string;
  ruleCode: string;
  ruleName: string;
  caseId: string;
  channel?: string;
  triggerAmount?: number;
  actionTaken?: 'SUSPEND' | 'HOLD' | 'ALERT' | 'AUTO-BLOCK';
}

interface CifRuleBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRuleSummary | null;
}

// Dedicated mock events generator to guarantee realistic, accurate breakdown logs for any CIF
export const getMockCifTriggerEvents = (customer: CustomerRuleSummary): CifRuleTriggerEvent[] => {
  if (!customer) return [];

  // Special predefined Events for CIF-5549201 (CV Maju Bersama Utama)
  if (customer.cif === 'CIF-5549201') {
    return [
      {
        id: 'evt-1',
        no: 1,
        timestamp: '2026-08-27 10:10:05',
        ruleCode: 'AML-R08',
        ruleName: 'High Frequency Rapid In-Out Transaction',
        caseId: 'CASE-88201948'
      },
      {
        id: 'evt-2',
        no: 2,
        timestamp: '2026-08-27 09:45:12',
        ruleCode: 'AML-R08',
        ruleName: 'High Frequency Rapid In-Out Transaction',
        caseId: 'CASE-88201920'
      },
      {
        id: 'evt-3',
        no: 3,
        timestamp: '2026-08-27 09:12:30',
        ruleCode: 'AML-R02',
        ruleName: 'Dormant Account Sudden High Volume',
        caseId: 'CASE-88201888'
      },
      {
        id: 'evt-4',
        no: 4,
        timestamp: '2026-08-27 08:30:15',
        ruleCode: 'STRUCT-AML-001',
        ruleName: 'Structuring Cash Deposit Below CTR Threshold',
        caseId: 'CASE-88201750'
      },
      {
        id: 'evt-5',
        no: 5,
        timestamp: '2026-08-26 21:05:00',
        ruleCode: 'AML-R08',
        ruleName: 'High Frequency Rapid In-Out Transaction',
        caseId: 'CASE-88201620'
      },
      {
        id: 'evt-6',
        no: 6,
        timestamp: '2026-08-26 18:40:22',
        ruleCode: 'FRAUD-R02',
        ruleName: 'Cross-Border Geolocation Anomaly',
        caseId: 'CASE-88201610'
      },
      {
        id: 'evt-7',
        no: 7,
        timestamp: '2026-08-26 15:20:10',
        ruleCode: 'AML-SANCTION-01',
        ruleName: 'Match External DTTOT High Risk Beneficiary',
        caseId: 'CASE-88201410'
      },
      {
        id: 'evt-8',
        no: 8,
        timestamp: '2026-08-26 12:10:05',
        ruleCode: 'R-TRX-HIGH-VAL-001',
        ruleName: 'High Value Non-Habitual Transfer',
        caseId: 'CASE-88201300'
      },
      {
        id: 'evt-9',
        no: 9,
        timestamp: '2026-08-26 09:15:30',
        ruleCode: 'AML-R02',
        ruleName: 'Dormant Account Sudden High Volume',
        caseId: 'CASE-88201210'
      },
      {
        id: 'evt-10',
        no: 10,
        timestamp: '2026-08-25 17:50:00',
        ruleCode: 'STRUCT-AML-001',
        ruleName: 'Structuring Cash Deposit Below CTR Threshold',
        caseId: 'CASE-88201105'
      },
      {
        id: 'evt-11',
        no: 11,
        timestamp: '2026-08-25 14:30:12',
        ruleCode: 'AML-R08',
        ruleName: 'High Frequency Rapid In-Out Transaction',
        caseId: 'CASE-88200980'
      },
      {
        id: 'evt-12',
        no: 12,
        timestamp: '2026-08-25 11:15:00',
        ruleCode: 'FRAUD-R02',
        ruleName: 'Cross-Border Geolocation Anomaly',
        caseId: 'CASE-88200850'
      },
      {
        id: 'evt-13',
        no: 13,
        timestamp: '2026-08-25 08:20:45',
        ruleCode: 'STRUCT-AML-001',
        ruleName: 'Structuring Cash Deposit Below CTR Threshold',
        caseId: 'CASE-88200720'
      },
      {
        id: 'evt-14',
        no: 14,
        timestamp: '2026-08-24 16:10:20',
        ruleCode: 'AML-SANCTION-01',
        ruleName: 'Match External DTTOT High Risk Beneficiary',
        caseId: 'CASE-88200590'
      },
      {
        id: 'evt-15',
        no: 15,
        timestamp: '2026-08-24 11:45:10',
        ruleCode: 'AML-R02',
        ruleName: 'Dormant Account Sudden High Volume',
        caseId: 'CASE-88200410'
      },
      {
        id: 'evt-16',
        no: 16,
        timestamp: '2026-08-24 09:00:00',
        ruleCode: 'R-TRX-HIGH-VAL-001',
        ruleName: 'High Value Non-Habitual Transfer',
        caseId: 'CASE-88200220'
      }
    ];
  }

  // Generic dynamic fallback generator for other CIFs
  const availableRules = customer.domain === 'AML' ? [
    { code: 'AML-R08', name: 'High Frequency Rapid In-Out Transaction' },
    { code: 'AML-R02', name: 'Dormant Account Sudden High Volume' },
    { code: 'STRUCT-AML-001', name: 'Structuring Cash Deposit Below CTR Threshold' },
    { code: 'AML-SANCTION-01', name: 'Match External DTTOT High Risk Beneficiary' },
    { code: 'R-TRX-HIGH-VAL-001', name: 'High Value Non-Habitual Transfer' },
    { code: 'AML-SMURF-03', name: 'Multi-Account Smurfing Consolidation' }
  ] : [
    { code: 'FRAUD-R02', name: 'Cross-Border Geolocation Anomaly' },
    { code: 'R-TRX-HIGH-VAL-001', name: 'High Value Non-Habitual Transfer' },
    { code: 'R-VEL-CARD-002', name: 'Debit/Credit Card Velocity Spike' },
    { code: 'DEV-MULTI-004', name: 'Multi Account Login Per Same Device ID' },
    { code: 'DORMANT-005', name: 'Sudden High Volume Outflow on Dormant Account' },
    { code: 'PHISH-ALERT-01', name: 'Account Takeover Credential Harvest Pattern' }
  ];

  const count = customer.totalRuleTriggered || 5;
  const events: CifRuleTriggerEvent[] = [];
  const baseDate = new Date(customer.lastAlertDate || '2026-08-27 10:00:00');

  for (let i = 0; i < count; i++) {
    const ruleObj = availableRules[i % availableRules.length];
    const eventTime = new Date(baseDate.getTime() - i * (3 * 3600 * 1000 + 15 * 60 * 1000));
    
    // Format timestamp
    const YYYY = eventTime.getFullYear();
    const MM = String(eventTime.getMonth() + 1).padStart(2, '0');
    const DD = String(eventTime.getDate()).padStart(2, '0');
    const hh = String(eventTime.getHours()).padStart(2, '0');
    const mm = String(eventTime.getMinutes()).padStart(2, '0');
    const ss = String(eventTime.getSeconds()).padStart(2, '0');
    const timestampStr = `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;

    events.push({
      id: `evt-${customer.cif}-${i + 1}`,
      no: i + 1,
      timestamp: timestampStr,
      ruleCode: ruleObj.code,
      ruleName: ruleObj.name,
      caseId: `CASE-${88200000 + (count - i) * 115}`
    });
  }

  return events;
};

export const CifRuleBreakdownModal: React.FC<CifRuleBreakdownModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  const [viewMode, setViewMode] = useState<'chronological' | 'grouped'>('chronological');

  // Secondary Nested Modal State: Case Transactions Drill-down
  const [selectedCaseData, setSelectedCaseData] = useState<CaseTransactionsData | null>(null);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState<boolean>(false);

  // Compute trigger events log
  const triggerEvents = useMemo(() => {
    if (!customer) return [];
    return getMockCifTriggerEvents(customer);
  }, [customer]);

  // Compute unique rules count
  const uniqueRulesCount = useMemo(() => {
    const set = new Set(triggerEvents.map(e => e.ruleCode));
    return set.size;
  }, [triggerEvents]);

  // Grouped by rule code data
  const groupedRules = useMemo(() => {
    const map = new Map<string, {
      ruleCode: string;
      ruleName: string;
      hitCount: number;
      lastTriggered: string;
      caseIds: string[];
    }>();

    triggerEvents.forEach(e => {
      if (!map.has(e.ruleCode)) {
        map.set(e.ruleCode, {
          ruleCode: e.ruleCode,
          ruleName: e.ruleName,
          hitCount: 0,
          lastTriggered: e.timestamp,
          caseIds: []
        });
      }
      const item = map.get(e.ruleCode)!;
      item.hitCount += 1;
      item.caseIds.push(e.caseId);
    });

    return Array.from(map.values()).sort((a, b) => b.hitCount - a.hitCount);
  }, [triggerEvents]);

  // Open Case Transactions Modal
  const handleOpenCaseModal = (evt: CifRuleTriggerEvent) => {
    if (!customer) return;
    setSelectedCaseData({
      caseId: evt.caseId,
      ruleCode: evt.ruleCode,
      ruleName: evt.ruleName,
      timestamp: evt.timestamp,
      cif: customer.cif,
      customerName: customer.customerName,
      caseStatus: 'IN INVESTIGATION'
    });
    setIsCaseModalOpen(true);
  };

  const handleOpenGroupedCaseModal = (grp: { ruleCode: string; ruleName: string; lastTriggered: string; caseIds: string[] }) => {
    if (!customer) return;
    const primaryCaseId = grp.caseIds[0] || 'CASE-88201610';
    setSelectedCaseData({
      caseId: primaryCaseId,
      ruleCode: grp.ruleCode,
      ruleName: grp.ruleName,
      timestamp: grp.lastTriggered,
      cif: customer.cif,
      customerName: customer.customerName,
      caseStatus: 'IN INVESTIGATION'
    });
    setIsCaseModalOpen(true);
  };

  // Handle Export Breakdown CSV
  const handleExportCsv = () => {
    if (!customer) return;

    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const fileName = `FMS_CIF_Breakdown_${customer.cif}`;

    if (viewMode === 'chronological') {
      headers = [
        "No", 
        "Timestamp", 
        "Rule Code", 
        "Rule Name", 
        "Case ID"
      ];
      rows = triggerEvents.map(e => [
        e.no,
        e.timestamp,
        e.ruleCode,
        e.ruleName,
        e.caseId
      ]);
    } else {
      headers = [
        "No", 
        "Rule Code", 
        "Rule Name", 
        "Total Hits / Frequency", 
        "Associated Case IDs",
        "Last Triggered"
      ];
      rows = groupedRules.map((g, idx) => [
        idx + 1,
        g.ruleCode,
        g.ruleName,
        `${g.hitCount}x Terpicu`,
        g.caseIds.join(" | "),
        g.lastTriggered
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}_${viewMode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !customer) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div 
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* MODAL HEADER */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                    CIF Breakdown Analysis
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Domain: {customer.domain}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <span>{customer.customerName}</span>
                  <span className="text-slate-400 font-normal text-sm font-mono">({customer.cif})</span>
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* CUSTOMER SUMMARY PROFILE BANNER */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Nomor Rekening: </span>
                <span className="font-mono font-bold text-slate-900">{customer.accountNumber}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Risk Score: </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                  customer.highestRiskScore >= 80 ? 'bg-red-100 text-red-900 border border-red-300' :
                  customer.highestRiskScore >= 50 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  'bg-blue-100 text-blue-900 border border-blue-300'
                }`}>
                  {customer.highestRiskScore} Pts
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-medium">Status Rekening: </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  customer.currentStatus === 'Hold Account' ? 'bg-red-100 text-red-800 border border-red-200' :
                  customer.currentStatus === 'Suspended' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                  customer.currentStatus === 'Monitoring' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                  'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {customer.currentStatus}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-white shadow-2xs flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{customer.totalRuleTriggered} Total Event Triggers</span>
            </span>
          </div>

          {/* MODAL BODY CONTENT */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">

            {/* STAT SUMMARY BAR (2 MAIN CARDS: TOTAL TRIGGERS & UNIQUE RULES HIT) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Stat 1: Total Triggers */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Total Triggers</div>
                  <div className="text-2xl font-mono font-bold text-slate-900 mt-0.5">
                    {customer.totalRuleTriggered} <span className="text-xs font-normal text-slate-500">Kejadian</span>
                  </div>
                </div>
              </div>

              {/* Stat 2: Unique Rules Hit */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-3.5">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Unique Rules Hit</div>
                  <div className="text-2xl font-mono font-bold text-blue-700 mt-0.5">
                    {uniqueRulesCount} <span className="text-xs font-normal text-slate-500">Rule Unik</span>
                  </div>
                </div>
              </div>

            </div>

            {/* VIEW TOGGLE CONTROL TAB SWITCHER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setViewMode('chronological')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                    viewMode === 'chronological'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>All Triggers Log (Chronological)</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-100 text-blue-800">
                    {triggerEvents.length}
                  </span>
                </button>

                <button
                  onClick={() => setViewMode('grouped')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                    viewMode === 'grouped'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Grouped by Rule Code</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-100 text-purple-800">
                    {groupedRules.length}
                  </span>
                </button>
              </div>

              <div className="text-xs text-slate-500 px-3 py-1 font-mono">
                {viewMode === 'chronological' ? '16 Record Log Individual' : 'Ringkasan Per-Aturan / Rule Code'}
              </div>
            </div>

            {/* MAIN BREAKDOWN TABLE */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              
              {/* VIEW MODE 1: CHRONOLOGICAL LOG STREAM */}
              {viewMode === 'chronological' && (
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-4 text-center w-12">#</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Rule Code</th>
                        <th className="py-3 px-4">Rule Name</th>
                        <th className="py-3 px-4 text-center">Case ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {triggerEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 text-center font-bold text-slate-400">
                            {evt.no}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600 text-[11px] whitespace-nowrap">
                            {evt.timestamp}
                          </td>
                          <td className="py-3 px-4 font-bold text-blue-700 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                              {evt.ruleCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-sans font-medium text-slate-900 text-xs">
                            {evt.ruleName}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleOpenCaseModal(evt)}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 font-bold border border-blue-200 transition cursor-pointer shadow-2xs group"
                              title="Klik untuk lihat transaksi finansial/non-finansial terkait Case ID ini"
                            >
                              <span>{evt.caseId}</span>
                              <ExternalLink className="w-3 h-3 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* VIEW MODE 2: GROUPED BY RULE CODE */}
              {viewMode === 'grouped' && (
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-4 text-center w-12">#</th>
                        <th className="py-3 px-4">Rule Code</th>
                        <th className="py-3 px-4">Rule Name</th>
                        <th className="py-3 px-4 text-center">Frequency</th>
                        <th className="py-3 px-4 text-center">Associated Case ID</th>
                        <th className="py-3 px-4 text-center">Last Triggered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupedRules.map((grp, idx) => (
                        <tr key={grp.ruleCode} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                              {grp.ruleCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 text-xs">
                            {grp.ruleName}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              {grp.hitCount}x Terpicu
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <button
                              onClick={() => handleOpenGroupedCaseModal(grp)}
                              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition cursor-pointer text-xs group"
                              title="Lihat transaksi untuk Case ID terasosiasi"
                            >
                              <span>{grp.caseIds[0]}</span>
                              {grp.caseIds.length > 1 && (
                                <span className="text-[10px] bg-blue-200 text-blue-900 px-1 rounded">
                                  +{grp.caseIds.length - 1}
                                </span>
                              )}
                              <ExternalLink className="w-3 h-3 text-blue-600 group-hover:translate-x-0.5 transition" />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-600 text-[11px]">
                            {grp.lastTriggered}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>

          {/* MODAL FOOTER */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Klik pada **Case ID** di tabel untuk membuka seluruh rincian transaksi finansial/non-finansial.</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Tutup
              </button>

              <button
                onClick={handleExportCsv}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Breakdown (CSV)</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* NESTED SECONDARY MODAL: CASE TRANSACTIONS DRILL-DOWN */}
      <CaseTransactionsModal
        isOpen={isCaseModalOpen}
        onClose={() => {
          setIsCaseModalOpen(false);
          setSelectedCaseData(null);
        }}
        caseData={selectedCaseData}
      />
    </>
  );
};
