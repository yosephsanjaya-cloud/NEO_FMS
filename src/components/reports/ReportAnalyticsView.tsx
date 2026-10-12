import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Building2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  Printer,
  Calendar,
  Layers,
  BarChart3,
  Flame,
  Activity,
  Info,
  ExternalLink,
  ChevronDown,
  Eye
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { 
  ReportDomain, 
  ReportViewTab, 
  DateRangePreset,
  ChartVisualizationType,
  InvestigatorPerformance,
  CustomerRuleSummary,
  RulePerformanceItem,
  RuleHealthStatus
} from '../../types/fms';
import { 
  MOCK_FRAUD_INVESTIGATORS, 
  MOCK_AML_ANALYSTS,
  MOCK_FRAUD_CUSTOMER_SUMMARIES,
  MOCK_AML_CUSTOMER_SUMMARIES,
  MOCK_FRAUD_RULE_PERFORMANCE,
  MOCK_AML_RULE_PERFORMANCE,
  MOCK_USER_ANALYSIS_CASES
} from '../../data/mockReportData';
import { formatCurrencyIDR } from '../../lib/utils';
import { ReportFilterHeader } from './ReportFilterHeader';
import { ReportChartSection } from './ReportChartSection';
import { ExecutiveReportPdfModal } from './ExecutiveReportPdfModal';
import { InvestigatorCaseHistoryModal } from './InvestigatorCaseHistoryModal';
import { RuleDrilldownModal } from './RuleDrilldownModal';
import { CifRuleBreakdownModal } from './CifRuleBreakdownModal';

interface ReportAnalyticsViewProps {
  defaultDomain?: ReportDomain;
}

export const ReportAnalyticsView: React.FC<ReportAnalyticsViewProps> = ({ defaultDomain = 'Fraud' }) => {
  const { ruleBasics } = useFMS();

  // --------------------------------------------------------------------------
  // 1. FILTER CONTROLS STATE (TOP PANEL DROPDOWNS)
  // --------------------------------------------------------------------------
  const [moduleDomain, setModuleDomain] = useState<ReportDomain>(defaultDomain);
  const [reportCategory, setReportCategory] = useState<ReportViewTab>('investigator');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('last7days');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-08-20');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-27');
  const [chartType, setChartType] = useState<ChartVisualizationType>('donut');

  // Sync if defaultDomain prop changes via sidebar
  useEffect(() => {
    setModuleDomain(defaultDomain);
    setIsReportGenerated(false);
    setGeneratedParams(prev => ({
      ...prev,
      domain: defaultDomain
    }));
  }, [defaultDomain]);

  // --------------------------------------------------------------------------
  // 2. GENERATOR EXECUTION STATE & HISTORY
  // --------------------------------------------------------------------------
  const [isReportGenerated, setIsReportGenerated] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Stored state for the generated report snapshot
  const [generatedParams, setGeneratedParams] = useState({
    domain: defaultDomain,
    category: 'investigator' as ReportViewTab,
    datePreset: 'last7days' as DateRangePreset,
    customStartDate: '2026-08-20',
    customEndDate: '2026-08-27',
    chartType: 'donut' as ChartVisualizationType,
    generatedAt: '27 Ags 2026, 09:00 WIB'
  });

  // Search filter query inside the generated table
  const [tableSearch, setTableSearch] = useState<string>('');

  // Modals
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [selectedInvestigator, setSelectedInvestigator] = useState<InvestigatorPerformance | null>(null);
  const [isInvestigatorModalOpen, setIsInvestigatorModalOpen] = useState<boolean>(false);
  const [isRuleDrilldownOpen, setIsRuleDrilldownOpen] = useState<boolean>(false);
  const [selectedDrilldownRuleCode, setSelectedDrilldownRuleCode] = useState<string>('ALL');
  const [selectedDrilldownRuleName, setSelectedDrilldownRuleName] = useState<string>('');

  const [selectedCifCustomer, setSelectedCifCustomer] = useState<CustomerRuleSummary | null>(null);
  const [isCifModalOpen, setIsCifModalOpen] = useState<boolean>(false);

  const handleOpenCifBreakdown = (cust: CustomerRuleSummary) => {
    setSelectedCifCustomer(cust);
    setIsCifModalOpen(true);
  };

  const handleOpenRuleDrilldown = (ruleCode: string, ruleName: string) => {
    setSelectedDrilldownRuleCode(ruleCode);
    setSelectedDrilldownRuleName(ruleName);
    setIsRuleDrilldownOpen(true);
  };

  // Helper date range label
  const getDateLabel = (preset: DateRangePreset, start: string, end: string) => {
    switch (preset) {
      case 'today': return 'Hari Ini (27 Ags 2026)';
      case 'last7days': return '7 Hari Terakhir (21 - 27 Ags 2026)';
      case 'thisMonth': return 'Bulan Ini (Agustus 2026)';
      case 'last3Months': return '3 Bulan Terakhir (Juni - Agustus 2026)';
      case 'custom': return `Custom Range (${start} s/d ${end})`;
      default: return '7 Hari Terakhir';
    }
  };

  const activeDateLabel = useMemo(() => {
    return getDateLabel(generatedParams.datePreset, generatedParams.customStartDate, generatedParams.customEndDate);
  }, [generatedParams]);

  // --------------------------------------------------------------------------
  // 3. EXECUTE / GENERATE REPORT HANDLER
  // --------------------------------------------------------------------------
  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const now = new Date();
      const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const dateFormatted = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      
      setGeneratedParams({
        domain: moduleDomain,
        category: reportCategory,
        datePreset: datePreset,
        customStartDate: customStartDate,
        customEndDate: customEndDate,
        chartType: chartType,
        generatedAt: `${dateFormatted}, ${timeFormatted} WIB`
      });
      setIsReportGenerated(true);
      setIsGenerating(false);
      setTableSearch('');
    }, 280);
  };

  // --------------------------------------------------------------------------
  // 4. RESET REPORT HANDLER
  // --------------------------------------------------------------------------
  const handleResetFilters = () => {
    setModuleDomain(defaultDomain);
    setReportCategory('investigator');
    setDatePreset('last7days');
    setCustomStartDate('2026-08-20');
    setCustomEndDate('2026-08-27');
    setChartType('donut');
    setGeneratedParams({
      domain: defaultDomain,
      category: 'investigator',
      datePreset: 'last7days',
      customStartDate: '2026-08-20',
      customEndDate: '2026-08-27',
      chartType: 'donut',
      generatedAt: 'Default Filter'
    });
    setIsReportGenerated(false);
    setTableSearch('');
  };

  // --------------------------------------------------------------------------
  // 5. DATASETS FILTERING ACCORDING TO GENERATED PARAMETERS
  // --------------------------------------------------------------------------
  const isGeneratedFraud = generatedParams.domain === 'Fraud';

  // 1. Investigators Data
  const rawInvestigators = useMemo(() => {
    return isGeneratedFraud ? MOCK_FRAUD_INVESTIGATORS : MOCK_AML_ANALYSTS;
  }, [isGeneratedFraud]);

  const filteredInvestigators = useMemo(() => {
    if (!tableSearch.trim()) return rawInvestigators;
    const q = tableSearch.toLowerCase();
    return rawInvestigators.filter(inv => 
      inv.name.toLowerCase().includes(q) || 
      inv.role.toLowerCase().includes(q)
    );
  }, [rawInvestigators, tableSearch]);

  // 2. Customers Data
  const rawCustomers = useMemo(() => {
    return isGeneratedFraud ? MOCK_FRAUD_CUSTOMER_SUMMARIES : MOCK_AML_CUSTOMER_SUMMARIES;
  }, [isGeneratedFraud]);

  const filteredCustomers = useMemo(() => {
    if (!tableSearch.trim()) return rawCustomers;
    const q = tableSearch.toLowerCase();
    return rawCustomers.filter(c => 
      c.cif.toLowerCase().includes(q) || 
      c.customerName.toLowerCase().includes(q) ||
      c.accountNumber.toLowerCase().includes(q) ||
      c.currentStatus.toLowerCase().includes(q)
    );
  }, [rawCustomers, tableSearch]);

  // 3. Rules Data
  const rawRules = useMemo(() => {
    return isGeneratedFraud ? MOCK_FRAUD_RULE_PERFORMANCE : MOCK_AML_RULE_PERFORMANCE;
  }, [isGeneratedFraud]);

  const filteredRules = useMemo(() => {
    if (!tableSearch.trim()) return rawRules;
    const q = tableSearch.toLowerCase();
    return rawRules.filter(r => 
      r.ruleCode.toLowerCase().includes(q) || 
      r.ruleName.toLowerCase().includes(q) ||
      r.ruleType.toLowerCase().includes(q) ||
      r.urgency.toLowerCase().includes(q) ||
      r.recommendedAction.toLowerCase().includes(q)
    );
  }, [rawRules, tableSearch]);

  // Number of days in the generated report query period (default: 30)
  const queryPeriodDays = useMemo(() => {
    switch (generatedParams.datePreset) {
      case 'today':
        return 1;
      case 'last7days':
        return 7;
      case 'thisMonth':
        return 30;
      case 'last3Months':
        return 90;
      case 'custom': {
        try {
          const d1 = new Date(generatedParams.customStartDate);
          const d2 = new Date(generatedParams.customEndDate);
          const diffMs = Math.abs(d2.getTime() - d1.getTime());
          const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
          return days > 0 ? days : 30;
        } catch {
          return 30;
        }
      }
      default:
        return 30;
    }
  }, [generatedParams.datePreset, generatedParams.customStartDate, generatedParams.customEndDate]);

  // Statistics for Rule Effectiveness Table
  const ruleStats = useMemo(() => {
    const count = filteredRules.length;
    if (count === 0) {
      return {
        count: 0,
        totalHits: 0,
        totalOpen: 0,
        totalOnCheck: 0,
        totalConfirmed: 0,
        totalFalsePos: 0,
        totalPending: 0,
        totalFpr: 0,
      };
    }

    const totalHits = filteredRules.reduce((sum, r) => sum + (r.totalAlertGenerated || 0), 0);
    const totalOpen = filteredRules.reduce((sum, r) => sum + (r.openCases || 0), 0);
    const totalOnCheck = filteredRules.reduce((sum, r) => sum + (r.inInvestigation || 0), 0);
    const totalConfirmed = filteredRules.reduce((sum, r) => sum + (r.confirmedTruePositive || 0), 0);
    const totalFalsePos = filteredRules.reduce((sum, r) => sum + (r.falsePositiveCount || 0), 0);
    const totalPending = filteredRules.reduce((sum, r) => sum + (r.pendingEscalated || 0), 0);
    const totalFpr = totalHits > 0 ? (totalFalsePos / totalHits) * 100 : 0;

    return {
      count,
      totalHits,
      totalOpen,
      totalOnCheck,
      totalConfirmed,
      totalFalsePos,
      totalPending,
      totalFpr,
    };
  }, [filteredRules]);

  // Statistics and Averages for Investigator Table
  const investigatorStats = useMemo(() => {
    const count = filteredInvestigators.length;
    if (count === 0) {
      return {
        count: 0,
        totalHandled: 0,
        totalConfirmed: 0,
        totalFalsePos: 0,
        totalPending: 0,
        avgSla: 0,
        avgHandled: 0,
        avgConfirmed: 0,
        avgFalsePos: 0,
        avgPending: 0
      };
    }
    const totalHandled = filteredInvestigators.reduce((s, i) => s + (i.totalHandled || 0), 0);
    const totalConfirmed = filteredInvestigators.reduce((s, i) => s + (i.confirmedCount || 0), 0);
    const totalFalsePos = filteredInvestigators.reduce((s, i) => s + (i.falsePositiveCount || 0), 0);
    const totalPending = filteredInvestigators.reduce((s, i) => s + (i.pendingEscalated || 0), 0);
    const avgSla = filteredInvestigators.reduce((s, i) => s + (i.slaRate || 0), 0) / count;
    return {
      count,
      totalHandled,
      totalConfirmed,
      totalFalsePos,
      totalPending,
      avgSla,
      avgHandled: totalHandled / count,
      avgConfirmed: totalConfirmed / count,
      avgFalsePos: totalFalsePos / count,
      avgPending: totalPending / count,
    };
  }, [filteredInvestigators]);

  // Statistics and Averages for Customer Table
  const customerStats = useMemo(() => {
    const count = filteredCustomers.length;
    if (count === 0) {
      return {
        count: 0,
        totalRules: 0,
        totalTxn: 0,
        avgRisk: 0,
        avgRules: 0,
        avgTxn: 0
      };
    }
    const totalRules = filteredCustomers.reduce((s, c) => s + (c.totalRuleTriggered || 0), 0);
    const totalTxn = filteredCustomers.reduce((s, c) => s + (c.totalTxnValueIdr || 0), 0);
    const avgRisk = filteredCustomers.reduce((s, c) => s + (c.highestRiskScore || 0), 0) / count;
    return {
      count,
      totalRules,
      totalTxn,
      avgRisk,
      avgRules: totalRules / count,
      avgTxn: totalTxn / count,
    };
  }, [filteredCustomers]);

  // Health Status Badge helper
  const getHealthBadge = (fpr: number): { label: RuleHealthStatus; badgeClass: string; dotClass: string } => {
    if (fpr < 30) {
      return {
        label: 'OPTIMAL',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold',
        dotClass: 'bg-emerald-500'
      };
    } else if (fpr <= 70) {
      return {
        label: 'NEEDS REVIEW',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
        dotClass: 'bg-amber-500'
      };
    } else {
      return {
        label: 'HIGH NOISE',
        badgeClass: 'bg-red-100 text-red-800 border-red-300 font-extrabold',
        dotClass: 'bg-red-500'
      };
    }
  };

  // --------------------------------------------------------------------------
  // 6. CSV / EXCEL EXPORT ENGINE
  // --------------------------------------------------------------------------
  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileName = `FMS_Report_${generatedParams.domain}_${generatedParams.category}`;

    if (generatedParams.category === 'investigator') {
      headers = [
        "Rank", 
        "Nama Personil", 
        "Jabatan / Role", 
        "Domain", 
        "Total Kasus Ditangani", 
        isGeneratedFraud ? "Confirmed Fraud" : "Confirmed AML", 
        "False Positive", 
        "Pending / Escalated", 
        "Average Handling Time (AHT)", 
        "SLA Status", 
        "SLA Compliance (%)"
      ];
      rows = filteredInvestigators.map(inv => [
        inv.no,
        inv.name,
        inv.role,
        inv.domain,
        inv.totalHandled,
        inv.confirmedCount,
        inv.falsePositiveCount,
        inv.pendingEscalated,
        inv.avgHandlingTime,
        inv.slaStatus,
        `${inv.slaRate}%`
      ]);
      if (filteredInvestigators.length > 0) {
        rows.push([
          "-",
          "TOTAL",
          `TOTAL AKUMULASI (${investigatorStats.count} PERSONIL)`,
          generatedParams.domain,
          investigatorStats.totalHandled,
          investigatorStats.totalConfirmed,
          investigatorStats.totalFalsePos,
          investigatorStats.totalPending,
          "-",
          "-",
          `${investigatorStats.avgSla.toFixed(1)}%`
        ]);
        rows.push([
          "AVG",
          "AVERAGE",
          `RATA-RATA PERSONIL (${investigatorStats.count} PERSONIL)`,
          generatedParams.domain,
          investigatorStats.avgHandled.toFixed(1),
          investigatorStats.avgConfirmed.toFixed(1),
          investigatorStats.avgFalsePos.toFixed(1),
          investigatorStats.avgPending.toFixed(1),
          "-",
          "-",
          `${investigatorStats.avgSla.toFixed(1)}%`
        ]);
      }
    } else if (generatedParams.category === 'customer') {
      headers = [
        "No", 
        "Nomor CIF", 
        "Nama Nasabah", 
        "Nomor Rekening", 
        "Domain", 
        "Total Rule Terpicu", 
        "Highest Risk Score", 
        "Total Nilai Transaksi (IDR)", 
        "Status Rekening", 
        "Tanggal Alert Terakhir"
      ];
      rows = filteredCustomers.map(c => [
        c.no,
        c.cif,
        c.customerName,
        c.accountNumber,
        c.domain,
        c.totalRuleTriggered,
        c.highestRiskScore,
        c.totalTxnValueIdr,
        c.currentStatus,
        c.lastAlertDate
      ]);
      if (filteredCustomers.length > 0) {
        rows.push([
          "-",
          "TOTAL",
          `TOTAL AKUMULASI (${customerStats.count} NASABAH)`,
          "-",
          generatedParams.domain,
          customerStats.totalRules,
          "-",
          customerStats.totalTxn,
          "-",
          "-"
        ]);
        rows.push([
          "AVG",
          "AVERAGE",
          `RATA-RATA NASABAH (${customerStats.count} NASABAH)`,
          "-",
          generatedParams.domain,
          customerStats.avgRules.toFixed(1),
          customerStats.avgRisk.toFixed(1),
          customerStats.avgTxn.toFixed(0),
          "-",
          "-"
        ]);
      }
    } else {
      headers = [
        "No", 
        "Kode Rule", 
        "Nama Rule", 
        "Tipe Rule", 
        "Domain", 
        "Urgency", 
        "Total Hits", 
        `Avg Hits / Day (${queryPeriodDays} hari)`,
        "Open Cases", 
        "In Investigation", 
        isGeneratedFraud ? "Confirmed Fraud" : "Confirmed AML", 
        `Avg Confirmed / Day (${queryPeriodDays} hari)`,
        "False Positive Count", 
        `Avg False Pos / Day (${queryPeriodDays} hari)`,
        "Pending / Escalated", 
        "False Positive Rate (%)", 
        "Accuracy Score (%)", 
        "Rule Health Status", 
        "Rekomendasi Tindakan"
      ];
      rows = filteredRules.map((r, idx) => [
        idx + 1,
        r.ruleCode,
        r.ruleName,
        r.ruleType,
        r.domain,
        r.urgency,
        r.totalAlertGenerated,
        (r.totalAlertGenerated / queryPeriodDays).toFixed(1),
        r.openCases,
        r.inInvestigation,
        r.confirmedTruePositive,
        (r.confirmedTruePositive / queryPeriodDays).toFixed(1),
        r.falsePositiveCount,
        (r.falsePositiveCount / queryPeriodDays).toFixed(1),
        r.pendingEscalated,
        `${r.falsePositiveRate}%`,
        `${r.accuracyScore}%`,
        getHealthBadge(r.falsePositiveRate).label,
        r.recommendedAction
      ]);
      if (filteredRules.length > 0) {
        rows.push([
          "-",
          "TOTAL",
          `TOTAL AKUMULASI (${ruleStats.count} RULE)`,
          "-",
          generatedParams.domain,
          "-",
          ruleStats.totalHits,
          (ruleStats.totalHits / queryPeriodDays).toFixed(1),
          ruleStats.totalOpen,
          ruleStats.totalOnCheck,
          ruleStats.totalConfirmed,
          (ruleStats.totalConfirmed / queryPeriodDays).toFixed(1),
          ruleStats.totalFalsePos,
          (ruleStats.totalFalsePos / queryPeriodDays).toFixed(1),
          ruleStats.totalPending,
          `${ruleStats.totalFpr.toFixed(1)}%`,
          "-",
          getHealthBadge(ruleStats.totalFpr).label,
          "-"
        ]);
      }
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Investigator Case History modal
  const handleOpenInvestigatorHistory = (inv: InvestigatorPerformance) => {
    setSelectedInvestigator(inv);
    setIsInvestigatorModalOpen(true);
  };

  // Dynamic Category Title
  const getCategoryTitle = (cat: ReportViewTab) => {
    switch (cat) {
      case 'investigator': return 'Laporan Performa Personil';
      case 'customer': return 'Laporan Ringkasan Nasabah (CIF)';
      case 'rule': return 'Laporan Analisa Efektivitas Rule';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP PANEL: FILTER CONTROLS (DROPDOWNS & EXECUTION BUTTONS) */}
      {/* -------------------------------------------------------------------- */}
      <ReportFilterHeader
        moduleDomain={moduleDomain}
        setModuleDomain={setModuleDomain}
        reportCategory={reportCategory}
        setReportCategory={setReportCategory}
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        chartType={chartType}
        setChartType={setChartType}
        onGenerate={handleGenerateReport}
        onReset={handleResetFilters}
        isGenerating={isGenerating}
      />

      {/* -------------------------------------------------------------------- */}
      {/* 2. EMPTY STATE PLACEHOLDER (BEFORE GENERATE) */}
      {/* -------------------------------------------------------------------- */}
      {!isReportGenerated && (
        <div id="report-empty-placeholder" className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[380px] animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Laporan Belum Dibuat
          </h3>
          <p className="text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">
            Silakan tentukan Kategori Laporan dan Tipe Visualisasi, lalu klik <span className="font-semibold text-blue-600">'Generate Report'</span> untuk menampilkan data.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200/60">
            <span>Domain: <strong className="text-slate-700">{moduleDomain}</strong></span>
            <span>•</span>
            <span>Kategori: <strong className="text-slate-700">{getCategoryTitle(reportCategory)}</strong></span>
            <span>•</span>
            <span>Visualisasi: <strong className="text-slate-700 uppercase">{chartType}</strong></span>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 3. REPORT OUTPUT RESULTS & VISUALIZATION (AFTER GENERATE) */}
      {/* -------------------------------------------------------------------- */}
      {isReportGenerated && (
        <div className="space-y-6 animate-fadeIn">
        
        {/* A. HEADER RESULT & EXPORT BAR */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase ${
                  isGeneratedFraud ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {generatedParams.domain} System Alert
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  {getCategoryTitle(generatedParams.category)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{activeDateLabel}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Visualisasi: {generatedParams.chartType.toUpperCase()}
                </span>
              </div>

              <h1 className="text-xl font-black text-slate-900 tracking-tight mt-2 flex items-center gap-2">
                <span>{getCategoryTitle(generatedParams.category)} - {generatedParams.domain} System</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>Periode: <strong>{activeDateLabel}</strong></span>
                <span>•</span>
                <span className="font-mono text-slate-600">Digenerate pada: {generatedParams.generatedAt} oleh Administrator</span>
              </p>
            </div>

            {/* Export Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* PDF Modal Trigger */}
              <button
                id="btn-download-pdf"
                onClick={() => setIsPdfModalOpen(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                title="Buka Executive PDF Summary View"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              {/* Excel / CSV Export Trigger */}
              <button
                id="btn-download-excel"
                onClick={handleExportCsv}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                title="Ekspor tabel ini ke file Excel/CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel</span>
              </button>

              {/* Print Button */}
              <button
                id="btn-print-report"
                onClick={() => window.print()}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition border border-slate-200 cursor-pointer"
                title="Print Halaman Laporan"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* B. DYNAMIC CHART SECTION */}
          <ReportChartSection
            moduleDomain={generatedParams.domain}
            reportCategory={generatedParams.category}
            chartType={generatedParams.chartType}
            investigators={filteredInvestigators}
            customers={filteredCustomers}
            rules={filteredRules}
            onRuleClick={handleOpenRuleDrilldown}
          />

          {/* C. DATA TABLE SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Table Header Bar with Search & Counter */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {generatedParams.category === 'investigator' && <Users className="w-4 h-4 text-blue-600" />}
                  {generatedParams.category === 'customer' && <Building2 className="w-4 h-4 text-amber-600" />}
                  {generatedParams.category === 'rule' && <ShieldAlert className="w-4 h-4 text-red-600" />}
                  <span>
                    Detail Data: {getCategoryTitle(generatedParams.category)} ({generatedParams.domain})
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tabel data rincian sesuai parameter query yang digenerate.
                </p>
              </div>

              {/* Search filter in table */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={
                    generatedParams.category === 'investigator' ? 'Cari nama analis atau role...' :
                    generatedParams.category === 'customer' ? 'Cari CIF, nama, rekening, status...' :
                    'Cari kode rule, tipe, urgency...'
                  }
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table Rendering Based on Category */}
            <div className="overflow-x-auto">
              
              {/* TABLE 1: PERFORMA PERSONIL */}
              {generatedParams.category === 'investigator' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4">Nama Personil &amp; Role</th>
                      <th className="py-3 px-3 text-right font-bold text-slate-900">Total Kasus</th>
                      <th className="py-3 px-3 text-right text-emerald-700">{isGeneratedFraud ? 'Confirmed Fraud' : 'Confirmed AML'}</th>
                      <th className="py-3 px-3 text-right text-slate-700">False Positive</th>
                      <th className="py-3 px-3 text-right text-amber-700">Pending/Esc</th>
                      <th className="py-3 px-3 text-center">Avg Handling Time</th>
                      <th className="py-3 px-3 text-center">SLA Status</th>
                      <th className="py-3 px-3 text-center">SLA Adherence</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvestigators.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">
                          <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                            inv.no === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {inv.no}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs">{inv.name}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">{inv.role}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-sm">
                          {inv.totalHandled}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {inv.confirmedCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-slate-600">
                          {inv.falsePositiveCount}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-amber-700">
                          {inv.pendingEscalated}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                          {inv.avgHandlingTime}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.slaStatus === 'Compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.slaStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                          {inv.slaRate}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenInvestigatorHistory(inv)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 mx-auto transition cursor-pointer border border-blue-200"
                            title="Lihat riwayat investigasi personil ini"
                          >
                            <span>Riwayat</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredInvestigators.length === 0 && (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                          Tidak ada personil yang sesuai dengan kata kunci pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filteredInvestigators.length > 0 && (
                    <tfoot className="border-t-2 border-slate-300 divide-y divide-slate-200">
                      {/* TOTAL ROW */}
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <td className="py-3 px-4 text-center font-mono text-slate-400 text-xs">-</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-white tracking-wider">
                              TOTAL
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              TOTAL AKUMULASI ({investigatorStats.count} PERSONIL)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-sm">
                          {investigatorStats.totalHandled.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {investigatorStats.totalConfirmed.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                          {investigatorStats.totalFalsePos.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                          {investigatorStats.totalPending.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">-</td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">-</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                          {investigatorStats.avgSla.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">-</td>
                      </tr>
                      {/* AVERAGE ROW */}
                      <tr className="bg-amber-50/90 font-bold text-slate-800">
                        <td className="py-3 px-4 text-center font-mono text-amber-800 font-bold text-[11px]">AVG</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-amber-600 text-white tracking-wider shadow-xs">
                              AVERAGE
                            </span>
                            <span className="font-bold text-amber-950 text-xs">
                              RATA-RATA PERSONIL ({investigatorStats.count} PERSONIL)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-sm">
                          {investigatorStats.avgHandled.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                          {investigatorStats.avgConfirmed.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                          {investigatorStats.avgFalsePos.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                          {investigatorStats.avgPending.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700 text-xs">~3.2 Jam</td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">-</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                          {investigatorStats.avgSla.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">-</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}

              {/* TABLE 2: RINGKASAN NASABAH (CIF) */}
              {generatedParams.category === 'customer' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-center">No</th>
                      <th className="py-3 px-4">Nomor CIF &amp; Rekening</th>
                      <th className="py-3 px-4">Nama Nasabah</th>
                      <th className="py-3 px-3 text-center">Total Rule Terpicu</th>
                      <th className="py-3 px-3 text-center">Risk Score</th>
                      <th className="py-3 px-4 text-right">Nilai Transaksi (IDR)</th>
                      <th className="py-3 px-3 text-center">Status Rekening</th>
                      <th className="py-3 px-4 text-center">Alert Terakhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-center font-mono text-slate-500 font-medium">
                          {c.no}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <button
                            onClick={() => handleOpenCifBreakdown(c)}
                            className="font-bold text-blue-700 hover:text-blue-900 hover:underline text-xs flex items-center space-x-1 transition cursor-pointer group text-left"
                            title="Klik untuk lihat breakdown detail rule terpicu CIF ini"
                          >
                            <span>{c.cif}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                          </button>
                          <div className="text-slate-500 text-[11px] mt-0.5">{c.accountNumber}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {c.customerName}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                          <button
                            onClick={() => handleOpenCifBreakdown(c)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 font-semibold border border-blue-200 transition cursor-pointer inline-flex items-center space-x-1 shadow-2xs group"
                            title="Klik untuk lihat breakdown detail rule terpicu CIF ini"
                          >
                            <span>{c.totalRuleTriggered} Rules</span>
                            <ArrowUpRight className="w-3 h-3 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                            c.highestRiskScore >= 80 ? 'bg-red-100 text-red-800 font-black' :
                            c.highestRiskScore >= 50 ? 'bg-amber-100 text-amber-900 font-bold' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {c.highestRiskScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrencyIDR(c.totalTxnValueIdr)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.currentStatus === 'Hold Account' ? 'bg-red-100 text-red-800 border border-red-200' :
                            c.currentStatus === 'Suspended' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                            c.currentStatus === 'Monitoring' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {c.currentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600 text-[11px]">
                          {c.lastAlertDate}
                        </td>
                      </tr>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                          Tidak ada data nasabah yang memenuhi kriteria pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filteredCustomers.length > 0 && (
                    <tfoot className="border-t-2 border-slate-300 divide-y divide-slate-200">
                      {/* TOTAL ROW */}
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <td className="py-3 px-4 text-center font-mono text-slate-400 text-xs">-</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-white tracking-wider">
                              TOTAL
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              TOTAL AKUMULASI ({customerStats.count} NASABAH)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">-</td>
                        <td className="py-3 px-3 text-center font-mono font-black text-slate-900">
                          {customerStats.totalRules} Rules
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">-</td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                          {formatCurrencyIDR(customerStats.totalTxn)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">-</td>
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">-</td>
                      </tr>
                      {/* AVERAGE ROW */}
                      <tr className="bg-amber-50/90 font-bold text-slate-800">
                        <td className="py-3 px-4 text-center font-mono text-amber-800 font-bold text-[11px]">AVG</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-amber-600 text-white tracking-wider shadow-xs">
                              AVERAGE
                            </span>
                            <span className="font-bold text-amber-950 text-xs">
                              RATA-RATA NASABAH ({customerStats.count} NASABAH)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">-</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                          {customerStats.avgRules.toFixed(1)} Rules
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-slate-900">
                          {customerStats.avgRisk.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrencyIDR(customerStats.avgTxn)}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">-</td>
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">-</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}

              {/* TABLE 3: ANALISA EFEKTIVITAS RULE */}
              {generatedParams.category === 'rule' && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-center">No</th>
                      <th className="py-3 px-4">Rule Code &amp; Basic Name</th>
                      <th className="py-3 px-3 text-center">Urgency</th>
                      <th className="py-3 px-3 text-right">Total Hits</th>
                      <th className="py-3 px-3 text-right bg-amber-50/80 text-amber-900 border-x border-amber-200/60">
                        <div className="flex flex-col items-end">
                          <span>Avg Hits/Day</span>
                          <span className="text-[9px] lowercase font-normal text-amber-700">({queryPeriodDays}h)</span>
                        </div>
                      </th>
                      <th className="py-3 px-3 text-right text-blue-700">Open</th>
                      <th className="py-3 px-3 text-right text-indigo-700">On Check</th>
                      <th className="py-3 px-3 text-right text-emerald-700">{isGeneratedFraud ? 'Confirmed Fraud' : 'Confirmed AML'}</th>
                      <th className="py-3 px-3 text-right bg-emerald-50/80 text-emerald-900 border-x border-emerald-200/60">
                        <div className="flex flex-col items-end">
                          <span>Avg Conf/Day</span>
                          <span className="text-[9px] lowercase font-normal text-emerald-700">({queryPeriodDays}h)</span>
                        </div>
                      </th>
                      <th className="py-3 px-3 text-right text-slate-700">False Pos</th>
                      <th className="py-3 px-3 text-right bg-amber-50/80 text-amber-900 border-x border-amber-200/60">
                        <div className="flex flex-col items-end">
                          <span>Avg FP/Day</span>
                          <span className="text-[9px] lowercase font-normal text-amber-700">({queryPeriodDays}h)</span>
                        </div>
                      </th>
                      <th className="py-3 px-3 text-right text-amber-700">Pending/Esc</th>
                      <th className="py-3 px-3 text-center">FPR (%)</th>
                      <th className="py-3 px-4 text-center">Rule Health Status</th>
                      <th className="py-3 px-4 text-center">Rekomendasi</th>
                      <th className="py-3 px-4 text-center">Drilldown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRules.map((rule, idx) => {
                      const health = getHealthBadge(rule.falsePositiveRate);
                      const avgHits = (rule.totalAlertGenerated / queryPeriodDays).toFixed(1);
                      const avgConfirmed = (rule.confirmedTruePositive / queryPeriodDays).toFixed(1);
                      const avgFalsePos = (rule.falsePositiveCount / queryPeriodDays).toFixed(1);

                      return (
                        <tr key={rule.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-blue-700 text-xs">{rule.ruleCode}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                {rule.ruleType}
                              </span>
                            </div>
                            <div className="text-slate-800 font-medium text-xs mt-0.5 max-w-xs sm:max-w-md">
                              {rule.ruleName}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              rule.urgency === 'High' ? 'bg-red-100 text-red-800 border border-red-200' :
                              rule.urgency === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {rule.urgency}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-xs">
                            {rule.totalAlertGenerated}
                          </td>
                          {/* INLINE AVG HITS / DAY */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/50 border-x border-amber-100 text-xs">
                            <span className="px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-900 font-semibold">
                              {avgHits}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-blue-700">
                            {rule.openCases}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-700">
                            {rule.inInvestigation}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                            {rule.confirmedTruePositive}
                          </td>
                          {/* INLINE AVG CONFIRMED / DAY */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-900 bg-emerald-50/50 border-x border-emerald-100 text-xs">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-900 font-semibold">
                              {avgConfirmed}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                            {rule.falsePositiveCount}
                          </td>
                          {/* INLINE AVG FALSE POS / DAY */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-amber-900 bg-amber-50/50 border-x border-amber-100 text-xs">
                            <span className="px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-900 font-semibold">
                              {avgFalsePos}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-amber-700">
                            {rule.pendingEscalated}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              rule.falsePositiveRate > 70 ? 'bg-red-100 text-red-800' :
                              rule.falsePositiveRate > 30 ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {rule.falsePositiveRate}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${health.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${health.dotClass} animate-pulse`}></span>
                              <span>{health.label}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              rule.recommendedAction === 'Optimal'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-amber-50 text-amber-900 border border-amber-300'
                            }`}>
                              {rule.recommendedAction}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleOpenRuleDrilldown(rule.ruleCode, rule.ruleName)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center space-x-1 mx-auto cursor-pointer"
                              title="Buka Drilldown Report Hasil Analisa User"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Kasus</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRules.length === 0 && (
                      <tr>
                        <td colSpan={16} className="py-8 text-center text-slate-500 text-xs">
                          Tidak ada data rule yang memenuhi kriteria filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filteredRules.length > 0 && (
                    <tfoot className="border-t-2 border-slate-300">
                      {/* BARIS TOTAL (AKUMULASI) */}
                      <tr className="bg-slate-100 font-bold text-slate-900">
                        <td className="py-3 px-3 text-center font-mono text-slate-400 text-xs">
                          -
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-slate-800 text-white tracking-wider">
                              TOTAL
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              TOTAL AKUMULASI ({ruleStats.count} RULE)
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">
                          -
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900 text-xs">
                          {ruleStats.totalHits.toLocaleString('id-ID')}
                        </td>
                        {/* TOTAL DAILY AVG HITS */}
                        <td className="py-3 px-3 text-right font-mono font-black text-amber-900 bg-amber-100/60 border-x border-amber-200/60 text-xs">
                          {(ruleStats.totalHits / queryPeriodDays).toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 text-xs">
                          {ruleStats.totalOpen.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700 text-xs">
                          {ruleStats.totalOnCheck.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 text-xs">
                          {ruleStats.totalConfirmed.toLocaleString('id-ID')}
                        </td>
                        {/* TOTAL DAILY AVG CONFIRMED */}
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-900 bg-emerald-100/60 border-x border-emerald-200/60 text-xs">
                          {(ruleStats.totalConfirmed / queryPeriodDays).toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-700 text-xs">
                          {ruleStats.totalFalsePos.toLocaleString('id-ID')}
                        </td>
                        {/* TOTAL DAILY AVG FALSE POS */}
                        <td className="py-3 px-3 text-right font-mono font-black text-amber-900 bg-amber-100/60 border-x border-amber-200/60 text-xs">
                          {(ruleStats.totalFalsePos / queryPeriodDays).toFixed(1)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 text-xs">
                          {ruleStats.totalPending.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-xs">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            ruleStats.totalFpr > 70 ? 'bg-red-100 text-red-800' :
                            ruleStats.totalFpr > 30 ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {ruleStats.totalFpr.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getHealthBadge(ruleStats.totalFpr).badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getHealthBadge(ruleStats.totalFpr).dotClass}`}></span>
                            <span>{getHealthBadge(ruleStats.totalFpr).label}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">
                          -
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">
                          -
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}

            </div>

            {/* Table Footer Records Info */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <div>
                Menampilkan{' '}
                <strong className="text-slate-900 font-mono">
                  {generatedParams.category === 'investigator' ? filteredInvestigators.length :
                   generatedParams.category === 'customer' ? filteredCustomers.length :
                   filteredRules.length}
                </strong>{' '}
                baris data terfilter ({generatedParams.domain} Domain)
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-[11px]">Database Live Synchronized</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. MODALS (EXECUTIVE REPORT PDF, CASE HISTORY, & RULE DRILLDOWN) */}
      {/* -------------------------------------------------------------------- */}
      <ExecutiveReportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        domain={generatedParams.domain}
        datePresetLabel={activeDateLabel}
        customStartDate={generatedParams.customStartDate}
        customEndDate={generatedParams.customEndDate}
        selectedRule="ALL"
        selectedStatus="ALL"
        investigators={rawInvestigators}
        customers={rawCustomers}
        rules={rawRules}
      />

      <InvestigatorCaseHistoryModal
        isOpen={isInvestigatorModalOpen}
        onClose={() => {
          setIsInvestigatorModalOpen(false);
          setSelectedInvestigator(null);
        }}
        investigator={selectedInvestigator}
      />

      <RuleDrilldownModal
        isOpen={isRuleDrilldownOpen}
        onClose={() => setIsRuleDrilldownOpen(false)}
        ruleCode={selectedDrilldownRuleCode}
        ruleName={selectedDrilldownRuleName}
        cases={MOCK_USER_ANALYSIS_CASES}
        domain={generatedParams.domain}
      />

      <CifRuleBreakdownModal
        isOpen={isCifModalOpen}
        onClose={() => {
          setIsCifModalOpen(false);
          setSelectedCifCustomer(null);
        }}
        customer={selectedCifCustomer}
      />

    </div>
  );
};
