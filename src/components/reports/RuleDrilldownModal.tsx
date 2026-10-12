import React, { useState, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { 
  X, 
  Search, 
  Download, 
  FileSpreadsheet, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ExternalLink,
  Layers,
  Filter,
  ArrowUpDown,
  Building2,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { UserAnalysisCase } from '../../types/fms';
import { MOCK_USER_ANALYSIS_CASES } from '../../data/mockReportData';
import { formatCurrencyIDR } from '../../lib/utils';

// ============================================================================
// 1. ERROR BOUNDARY WRAPPER
// ============================================================================
interface ErrorBoundaryProps {
  children: ReactNode;
  onClose?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class RuleDrilldownErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("RuleDrilldownModal Error caught by ErrorBoundary:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 p-6 max-w-md w-full text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Gagal Memuat Detail Rule</h3>
              <p className="text-xs text-slate-500 mt-1">
                Terjadi kendala saat memproses data drilldown transaksi kasus. Aplikasi utama tetap berjalan normal.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (this.props.onClose) this.props.onClose();
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Gagal memuat detail rule [Tutup]
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 2. INNER MODAL COMPONENT (DEFENSIVE & PROTECTED)
// ============================================================================
export interface RuleDrilldownModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleCode?: string;
  ruleName?: string;
  cases?: UserAnalysisCase[];
  domain?: string;
  isLoading?: boolean;
}

const RuleDrilldownModalInner: React.FC<RuleDrilldownModalProps> = ({
  isOpen,
  onClose,
  ruleCode = 'ALL',
  ruleName = '',
  cases,
  domain = 'Fraud',
  isLoading = false
}) => {
  // 1. Guard Clause - return early if modal is not open
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');

  // Defensive source list - fallback to default mock if cases is undefined/null
  const safeCases: UserAnalysisCase[] = useMemo(() => {
    if (Array.isArray(cases)) {
      return cases;
    }
    return Array.isArray(MOCK_USER_ANALYSIS_CASES) ? MOCK_USER_ANALYSIS_CASES : [];
  }, [cases]);

  // Filter cases by the selected rule (or matching rule code / name substring) and user filters
  const filteredCases = useMemo(() => {
    let list = Array.isArray(safeCases) ? [...safeCases] : [];
    
    if (ruleCode && ruleCode !== 'ALL') {
      const codeClean = (ruleCode || '').trim().toLowerCase();
      list = list.filter(c => {
        const cRuleCode = (c?.ruleCode || '').toLowerCase();
        const cRuleName = (c?.ruleName || '').toLowerCase();
        return cRuleCode.includes(codeClean) || 
               cRuleName.includes(codeClean) ||
               codeClean.includes(cRuleCode);
      });
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(c => c?.caseStatusName === statusFilter);
    }

    if (resultFilter !== 'ALL') {
      list = list.filter(c => c?.finalResultName === resultFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => 
        (c?.caseId || '').toLowerCase().includes(q) ||
        (c?.customerId || '').toLowerCase().includes(q) ||
        (c?.customerCif || '').toLowerCase().includes(q) ||
        (c?.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c?.sourceAccount || '').toLowerCase().includes(q) ||
        (c?.sourceVirtualAccountNumber || '').toLowerCase().includes(q) ||
        (c?.sourceVirtualAccountName || '').toLowerCase().includes(q) ||
        (c?.finalResultName || '').toLowerCase().includes(q) ||
        (c?.ruleName || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [safeCases, ruleCode, statusFilter, resultFilter, searchTerm]);

  // Defensive Metric counts
  const totalCases = Array.isArray(filteredCases) ? filteredCases.length : 0;
  const confirmedFraudCount = Array.isArray(filteredCases) 
    ? filteredCases.filter(c => c?.finalResultName === 'Confirmed Fraud' || c?.finalResultName === 'Confirmed AML').length 
    : 0;
  const nonFraudCount = Array.isArray(filteredCases)
    ? filteredCases.filter(c => c?.finalResultName === 'Non-Fraud' || c?.finalResultName === 'False Positive').length
    : 0;
  const undefineCount = Array.isArray(filteredCases)
    ? filteredCases.filter(c => c?.finalResultName === 'Undefine' || c?.caseStatusName === 'OPEN').length
    : 0;

  const handleExportCsv = () => {
    const headers = [
      "Case ID",
      "Customer ID",
      "Customer CIF",
      "Source Account",
      "Source Virtual Account Number",
      "Source Virtual Account Name",
      "Identified On",
      "Final Result Name",
      "Rule Name",
      "Case Status Name"
    ];

    const rows = (filteredCases ?? []).map(c => [
      c?.caseId ?? '',
      c?.customerId ?? '',
      c?.customerCif ?? '',
      c?.sourceAccount ?? '',
      c?.sourceVirtualAccountNumber ?? '',
      c?.sourceVirtualAccountName ?? '',
      c?.identifiedOn ?? '',
      c?.finalResultName ?? '',
      c?.ruleName ?? '',
      c?.caseStatusName ?? ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Report_Hasil_Analisa_User_${ruleCode || 'Rule'}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  DRILLDOWN CASE MANAGEMENT
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-200 text-slate-800">
                  {ruleCode || 'SEMUA RULE'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  • Domain {domain}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                Report Hasil Analisa User - {ruleName || ruleCode || 'Semua Kasus Alert'}
              </h2>
              <p className="text-xs text-slate-500">
                Rincian individual case ID, nasabah terindikasi, rekening sumber &amp; Virtual Account (VA) untuk audit investigasi.
              </p>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCsv}
              disabled={isLoading || totalCases === 0}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
              title="Ekspor tabel drilldown ini ke CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
              title="Tutup Pop-up"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOP SUMMARY STATS IN MODAL */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono">
              Total Kasus Terfilter
            </div>
            <div className="text-xl font-black text-blue-900 font-mono mt-0.5">
              {isLoading ? '...' : totalCases.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl border border-red-200">
            <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider font-mono">
              Confirmed True Positive
            </div>
            <div className="text-xl font-black text-red-700 font-mono mt-0.5">
              {isLoading ? '...' : confirmedFraudCount.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-mono">
              Non-Fraud / False Positive
            </div>
            <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
              {isLoading ? '...' : nonFraudCount.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider font-mono">
              Open / Undefine
            </div>
            <div className="text-xl font-black text-amber-800 font-mono mt-0.5">
              {isLoading ? '...' : undefineCount.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* SEARCH & SUB-FILTER TOOLBAR */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari Case ID, CIF, Rekening, VA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-500 font-medium text-[11px] whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Semua Case Status</option>
                <option value="OPEN">OPEN</option>
                <option value="ON_CHECK">ON_CHECK</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-500 font-medium text-[11px] whitespace-nowrap">Hasil:</span>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Semua Hasil</option>
                <option value="Undefine">Undefine</option>
                <option value="Confirmed Fraud">Confirmed Fraud</option>
                <option value="Non-Fraud">Non-Fraud</option>
              </select>
            </div>
          </div>
        </div>

        {/* DETAILED LEGACY TABLE CONTAINER / SKELETON LOADING */}
        <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[300px]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">Memuat data drilldown...</p>
                <p className="text-xs text-slate-500 mt-0.5">Menyiapkan rincian hasil analisa user dan case ID</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/90 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200 sticky top-0 z-10 backdrop-blur-xs">
                <tr>
                  <th className="py-3 px-3 text-center">No</th>
                  <th className="py-3 px-3">Case ID</th>
                  <th className="py-3 px-3">Customer ID</th>
                  <th className="py-3 px-3">Customer CIF</th>
                  <th className="py-3 px-3">Source Account</th>
                  <th className="py-3 px-3">Source VA Number</th>
                  <th className="py-3 px-3">Source VA Name</th>
                  <th className="py-3 px-3 text-center">Identified On</th>
                  <th className="py-3 px-3 text-center">Final Result Name</th>
                  <th className="py-3 px-3">Rule Name</th>
                  <th className="py-3 px-3 text-center">Case Status Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(filteredCases ?? []).map((item, index) => {
                  const isConfirmed = item?.finalResultName === 'Confirmed Fraud' || item?.finalResultName === 'Confirmed AML';
                  const isNonFraud = item?.finalResultName === 'Non-Fraud' || item?.finalResultName === 'False Positive';
                  const isUndefine = item?.finalResultName === 'Undefine';

                  return (
                    <tr key={item?.id || index} className="hover:bg-blue-50/40 transition">
                      <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                        {index + 1}
                      </td>

                      {/* 1. Case ID */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                          {item?.caseId || '-'}
                        </span>
                      </td>

                      {/* 2. Customer ID */}
                      <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                        {item?.customerId || '-'}
                      </td>

                      {/* 3. Customer CIF */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {item?.customerCif || '-'}
                        {item?.customerName && (
                          <div className="text-[10px] font-sans font-normal text-slate-500 truncate max-w-[140px]">
                            {item.customerName}
                          </div>
                        )}
                      </td>

                      {/* 4. Source Account */}
                      <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap">
                        {item?.sourceAccount || '-'}
                      </td>

                      {/* 5. Source Virtual Account Number */}
                      <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap font-medium">
                        {item?.sourceVirtualAccountNumber || '-'}
                      </td>

                      {/* 6. Source Virtual Account Name */}
                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {item?.sourceVirtualAccountName || '-'}
                      </td>

                      {/* 7. Identified On */}
                      <td className="py-3 px-3 text-center font-mono text-slate-600 text-[11px] whitespace-nowrap">
                        {item?.identifiedOn || '-'}
                      </td>

                      {/* 8. Final Result Name */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isConfirmed ? 'bg-red-100 text-red-800 border-red-200' :
                          isNonFraud ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          'bg-amber-100 text-amber-900 border-amber-200'
                        }`}>
                          {item?.finalResultName || 'Undefine'}
                        </span>
                      </td>

                      {/* 9. Rule Name */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 text-xs">{item?.ruleCode || '-'}</span>
                        <div className="text-[10px] text-slate-500 max-w-[200px] truncate" title={item?.ruleName}>
                          {item?.ruleName || '-'}
                        </div>
                      </td>

                      {/* 10. Case Status Name */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          item?.caseStatusName === 'OPEN' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          item?.caseStatusName === 'ON_CHECK' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {item?.caseStatusName || 'OPEN'}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {(!filteredCases || filteredCases.length === 0) && (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500 text-xs">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <div>Tidak ada transaksi / case ID yang ditemukan untuk filter ini.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Menampilkan <strong className="text-slate-900 font-mono">{(filteredCases || []).length}</strong> record rincian case analisa user.
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================================
// 3. EXPORTED COMPONENT WRAPPED WITH ERROR BOUNDARY
// ============================================================================
export const RuleDrilldownModal: React.FC<RuleDrilldownModalProps> = (props) => {
  return (
    <RuleDrilldownErrorBoundary onClose={props.onClose}>
      <RuleDrilldownModalInner {...props} />
    </RuleDrilldownErrorBoundary>
  );
};
