import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  Filter, 
  Eye, 
  Copy, 
  Check, 
  ArrowUpDown, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Lock,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { AmlCifHistoryGroup } from '../../types/fms';
import { AmlCifHistoryDetailModal } from './AmlCifHistoryDetailModal';
import { aggregateAmlHistoryByCif } from '../../lib/amlHistoryCifHelper';
import { cn } from '../../lib/utils';

interface AmlInvestigationHistoryProps {
  onRefresh?: () => void;
}

export const AmlInvestigationHistory: React.FC<AmlInvestigationHistoryProps> = () => {
  const { amlInvestigationHistory, fraudCases, investigationHistory } = useFMS();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MED' | 'LOW'>('ALL');
  const [dateRangePreset, setDateRangePreset] = useState<'all' | 'today' | 'last7days' | 'last30days'>('all');

  // Modal State
  const [selectedGroup, setSelectedGroup] = useState<AmlCifHistoryGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCif, setCopiedCif] = useState<string | null>(null);

  // Sorting & Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<'completionDate' | 'highestRiskScore' | 'totalRulesResolved'>('completionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Aggregate AML history entries grouped strictly by CIF
  const cifHistoryList = useMemo<AmlCifHistoryGroup[]>(() => {
    // 1. Check if there are aggregated CIF/Batch groups in sessionStorage
    let sessionAmlGroups: AmlCifHistoryGroup[] = [];
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = sessionStorage.getItem('amlBatchesHistory') || sessionStorage.getItem('amlInvestigationHistory');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            sessionAmlGroups = parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Error reading amlBatchesHistory from sessionStorage:', e);
    }

    // 2. Combine with context's amlInvestigationHistory and legacy items
    const rawCombined = [
      ...sessionAmlGroups,
      ...(amlInvestigationHistory || []),
      ...(investigationHistory?.filter(h => h.domain === 'AML') || [])
    ];

    return aggregateAmlHistoryByCif(rawCombined, fraudCases);
  }, [amlInvestigationHistory, fraudCases, investigationHistory]);

  // Persist aggregated list to sessionStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage && cifHistoryList.length > 0) {
        sessionStorage.setItem('amlBatchesHistory', JSON.stringify(cifHistoryList));
        sessionStorage.setItem('amlInvestigationHistory', JSON.stringify(cifHistoryList));
        sessionStorage.setItem('fms_aml_cif_history', JSON.stringify(cifHistoryList));
      }
    } catch {}
  }, [cifHistoryList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return cifHistoryList.filter(item => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesCif = item.cif.toLowerCase().includes(q);
        const matchesBatch = (item.batchId || '').toLowerCase().includes(q);
        const matchesName = item.customerName.toLowerCase().includes(q);
        const matchesAcc = (item.accountNumber || '').toLowerCase().includes(q);
        const matchesRule = item.childRules.some(r => 
          r.ruleCode.toLowerCase().includes(q) || 
          r.ruleName.toLowerCase().includes(q) ||
          r.caseId.toLowerCase().includes(q)
        );
        if (!matchesCif && !matchesBatch && !matchesName && !matchesAcc && !matchesRule) {
          return false;
        }
      }

      // Risk Filter
      if (riskFilter === 'HIGH' && item.highestRiskScore < 80) return false;
      if (riskFilter === 'MED' && (item.highestRiskScore < 50 || item.highestRiskScore >= 80)) return false;
      if (riskFilter === 'LOW' && item.highestRiskScore >= 50) return false;

      // Date Filter
      if (dateRangePreset === 'today') {
        const todayStr = new Date().toISOString().substring(0, 10);
        if (!item.completionDate.startsWith(todayStr)) return false;
      } else if (dateRangePreset === 'last7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        const cutoff = d.toISOString().substring(0, 10);
        if (item.completionDate < cutoff) return false;
      } else if (dateRangePreset === 'last30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        const cutoff = d.toISOString().substring(0, 10);
        if (item.completionDate < cutoff) return false;
      }

      return true;
    });
  }, [cifHistoryList, searchTerm, riskFilter, dateRangePreset]);

  // Sorted List
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredList, sortField, sortOrder]);

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(sortedList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, currentPage, pageSize]);

  const handleOpenDetailModal = (group: AmlCifHistoryGroup) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleCopyCif = (e: React.MouseEvent, cif: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cif);
    setCopiedCif(cif);
    setTimeout(() => setCopiedCif(null), 2000);
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative min-w-[280px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari Nomor CIF, Nama Nasabah, Rule Code, Case ID..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Risk Level Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-500 text-[11px] font-mono">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-800 focus:outline-none text-xs"
            >
              <option value="ALL">Semua Risk Score</option>
              <option value="HIGH">High Risk (80+)</option>
              <option value="MED">Medium Risk (50-79)</option>
              <option value="LOW">Low Risk (&lt;50)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-500 text-[11px] font-mono">Periode:</span>
            <select
              value={dateRangePreset}
              onChange={(e) => {
                setDateRangePreset(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-800 focus:outline-none text-xs"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="last7days">7 Hari Terakhir</option>
              <option value="last30days">30 Hari Terakhir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Aggregated AML History Table (CIF Grouping) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] select-none whitespace-nowrap">
                
                {/* 1. Action */}
                <th className="p-3 text-center w-36">Action</th>

                {/* 2. Batch ID */}
                <th className="p-3">Batch ID</th>

                {/* 3. CIF Number */}
                <th className="p-3">CIF Number</th>

                {/* 3. Customer Name */}
                <th className="p-3">Customer Name</th>

                {/* 4. Total Rules Resolved */}
                <th 
                  onClick={() => {
                    if (sortField === 'totalRulesResolved') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('totalRulesResolved');
                      setSortOrder('desc');
                    }
                  }}
                  className="p-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Total Rules Resolved</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 5. Highest Risk Score */}
                <th 
                  onClick={() => {
                    if (sortField === 'highestRiskScore') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('highestRiskScore');
                      setSortOrder('desc');
                    }
                  }}
                  className="p-3 text-center cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Highest Risk Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 6. Investigation Status */}
                <th className="p-3 text-center">Investigation Status</th>

                {/* 7. Completion Date */}
                <th 
                  onClick={() => {
                    if (sortField === 'completionDate') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('completionDate');
                      setSortOrder('desc');
                    }
                  }}
                  className="p-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Completion Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldCheck className="w-10 h-10 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">Tidak ada arsip riwayat CIF AML yang cocok dengan kriteria.</p>
                      <p className="text-xs text-slate-400">Entitas CIF yang seluruh child rule-nya telah disetujui (Approved) akan tersimpan di sini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedList.map((group) => {
                  return (
                    <tr 
                      key={group.id || group.cif}
                      className="hover:bg-blue-50/40 transition group"
                    >
                      
                      {/* 1. Action: Detail Summary Button */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          id={`btn-aml-detail-summary-${group.id || group.cif}`}
                          onClick={() => handleOpenDetailModal(group)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 mx-auto cursor-pointer border border-blue-200 group-hover:border-blue-500 shadow-2xs"
                          title="Buka Ringkasan Investigasi CIF (Read-Only)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail Summary</span>
                        </button>
                      </td>

                      {/* 2. Batch ID */}
                      <td className="p-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px]">
                          {group.batchId || `BATCH-20260825-${group.cif.replace(/[^0-9]/g, '') || '001'}`}
                        </span>
                      </td>

                      {/* 3. CIF Number */}
                      <td className="p-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span>{group.cif}</span>
                            <button
                              onClick={(e) => handleCopyCif(e, group.cif)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                              title="Salin CIF"
                            >
                              {copiedCif === group.cif ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {group.investigationId && (
                            <span className="text-[10px] text-slate-400 font-mono font-normal tracking-tight">
                              {group.investigationId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Customer Name */}
                      <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{group.customerName}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-medium">
                            {group.customerType || 'Corporate'}
                          </span>
                        </div>
                      </td>

                      {/* 4. Total Rules Resolved */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200 font-mono text-[11px] inline-flex items-center gap-1">
                          <Layers className="w-3 h-3 text-blue-600" />
                          <span>{group.totalRulesResolved} Rules Resolved</span>
                        </span>
                      </td>

                      {/* 5. Highest Risk Score */}
                      <td className="p-3 whitespace-nowrap text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded font-mono font-bold text-xs shadow-2xs border",
                          group.highestRiskScore >= 80 
                            ? "bg-red-50 text-red-700 border-red-200" 
                            : group.highestRiskScore >= 50 
                            ? "bg-amber-50 text-amber-800 border-amber-200" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}>
                          {group.highestRiskScore}
                        </span>
                      </td>

                      {/* 6. Investigation Status: Closed (Green) */}
                      <td className="p-3 whitespace-nowrap text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono inline-block bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                          Closed
                        </span>
                      </td>

                      {/* 7. Completion Date */}
                      <td className="p-3 whitespace-nowrap font-mono text-slate-700 text-[11px]">
                        <div>{group.completionDate}</div>
                        <span className="text-[10px] text-slate-400 font-mono">Approved WIB</span>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Menampilkan <span className="font-bold text-slate-900">{sortedList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> sampai{' '}
            <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, sortedList.length)}</span> dari{' '}
            <span className="font-bold text-slate-900">{sortedList.length}</span> entitas CIF terarsip
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 font-medium transition cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
            <span className="font-mono text-slate-800">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 font-medium transition cursor-pointer flex items-center gap-1"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Summary Modal (CIF Level) */}
      <AmlCifHistoryDetailModal
        group={selectedGroup}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGroup(null);
        }}
      />

    </div>
  );
};

export default AmlInvestigationHistory;
