import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Eye, 
  ShieldCheck,
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck, 
  CreditCard, 
  Smartphone, 
  Phone, 
  Layers, 
  Filter, 
  Scale, 
  Sliders, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Upload,
  FileSpreadsheet,
  Clock,
  X
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { ListEntry, ListType, ListCategory, EntitySubTab } from '../../types/fms';
import { ListTypeBadge } from '../common/Badge';
import { BlacklistModal } from './BlacklistModal';
import { BlacklistDetailModal } from './BlacklistDetailModal';
import { BulkUploadListModal } from './BulkUploadListModal';

interface ManagementListViewProps {
  defaultCategory?: ListCategory;
  defaultDomain?: 'Fraud' | 'AML' | 'FRAUD' | 'aml';
}

export const ManagementListView: React.FC<ManagementListViewProps> = ({ defaultCategory, defaultDomain }) => {
  const { 
    listEntries, 
    createListEntry, 
    updateListEntry, 
    deleteListEntry,
    bulkImportListEntries,
    activeListType,
    setActiveListType,
    activeListCategory,
    setActiveListCategory,
    blacklistDomain,
    setBlacklistDomain,
    ruleBasics
  } = useFMS();
  const { user } = useAuth();

  const isSysAdmin = !user || user.username === 'sysadmin' || user.riskDomain === 'FULL ACCESS' || user.group === 'IT DCA Maker Checker';
  const isL2User = !isSysAdmin && (
    user?.username === 'afcl2' || 
    user?.username === 'analystl2' || 
    user?.group === 'AFC L2' || 
    user?.group === 'Analyst L2' || 
    user?.role?.includes('Checker') || 
    user?.role?.includes('Approver')
  );

  React.useEffect(() => {
    if (defaultCategory) {
      setActiveListCategory(defaultCategory);
    }
    if (defaultDomain) {
      setBlacklistDomain(defaultDomain.toUpperCase() as 'FRAUD' | 'AML');
    }
  }, [defaultCategory, defaultDomain, setActiveListCategory, setBlacklistDomain]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ACTIVE');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ListEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<ListEntry | null>(null);
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Active Main Sub-Segmentation: FRAUD vs AML (Synced with context)
  const currentDomain = blacklistDomain || 'FRAUD';

  // Dedicated filter function for status
  const filterByStatus = (entries: ListEntry[], status: 'ALL' | 'ACTIVE' | 'PENDING') => {
    return entries.filter(entry => {
      const isPending = entry.status === 'Pending Approval' || (entry.status as any) === 'PENDING_APPROVAL';
      if (status === 'ACTIVE') {
        return !isPending && (entry.status === 'Active' || entry.status === 'ACTIVE');
      }
      if (status === 'PENDING') {
        return isPending;
      }
      return true; // 'ALL'
    });
  };

  // Base entries for current category/domain/type
  const baseCategoryEntries = useMemo(() => {
    return listEntries.filter(entry => {
      // 1. Filter by List Type (Blacklist, Watchlist, Whitelist)
      if (entry.type !== activeListType) return false;

      // 2. Strict Domain Isolation: FRAUD vs AML
      const entryDomain = entry.domain || entry.listCategory || 'FRAUD';
      if (entryDomain !== currentDomain) return false;

      // 3. Filter by Nested Entity Sub-Tab if not 'All'
      const entryEntity = entry.entityType || entry.category;
      if (activeListCategory && activeListCategory !== 'All' && entryEntity !== activeListCategory) {
        return false;
      }

      return true;
    });
  }, [listEntries, activeListType, currentDomain, activeListCategory]);

  // Dynamic counter calculations that are 100% consistent with displayed data
  const tabCounts = useMemo(() => {
    let pool = baseCategoryEntries;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      pool = pool.filter(entry => {
        const matchesValue = entry.value.toLowerCase().includes(q);
        const matchesHolder = (entry.holderName || '').toLowerCase().includes(q);
        const matchesReason = entry.reason.toLowerCase().includes(q);
        const matchesSource = entry.source.toLowerCase().includes(q);
        const matchesTags = entry.tags.some(t => t.toLowerCase().includes(q));
        const matchesRules = (entry.appliedRuleCodes || []).some(rc => rc.toLowerCase().includes(q));
        return matchesValue || matchesHolder || matchesReason || matchesSource || matchesTags || matchesRules;
      });
    }

    const all = filterByStatus(pool, 'ALL').length;
    const active = filterByStatus(pool, 'ACTIVE').length;
    const pending = filterByStatus(pool, 'PENDING').length;

    return { all, active, pending };
  }, [baseCategoryEntries, searchTerm]);

  // Filter list entries with strict data isolation and status filtering
  const filteredEntries = useMemo(() => {
    const statusFiltered = filterByStatus(baseCategoryEntries, statusFilter);

    if (!searchTerm.trim()) {
      return statusFiltered;
    }

    const q = searchTerm.toLowerCase();
    return statusFiltered.filter(entry => {
      const matchesValue = entry.value.toLowerCase().includes(q);
      const matchesHolder = (entry.holderName || '').toLowerCase().includes(q);
      const matchesReason = entry.reason.toLowerCase().includes(q);
      const matchesSource = entry.source.toLowerCase().includes(q);
      const matchesTags = entry.tags.some(t => t.toLowerCase().includes(q));
      const matchesRules = (entry.appliedRuleCodes || []).some(rc => rc.toLowerCase().includes(q));
      return matchesValue || matchesHolder || matchesReason || matchesSource || matchesTags || matchesRules;
    });
  }, [baseCategoryEntries, statusFilter, searchTerm]);

  // KPI Calculations for Active Category (Active Entities Only)
  // Formula: TOTAL ENTITAS = Total seluruh data entitas berstatus Active pada domain aktif
  const kpiStats = useMemo(() => {
    const domainActiveEntries = listEntries.filter(e => {
      const eDom = e.domain || e.listCategory || 'FRAUD';
      const isApproved = e.status === 'Active' || e.status === 'ACTIVE';
      return e.type === activeListType && eDom === currentDomain && isApproved;
    });

    const cifCount = domainActiveEntries.filter(e => (e.entityType || e.category) === 'CIF').length;
    const accCount = domainActiveEntries.filter(e => (e.entityType || e.category) === 'Source Account Number').length;
    const devCount = domainActiveEntries.filter(e => (e.entityType || e.category) === 'Device ID').length;
    const phoneCount = domainActiveEntries.filter(e => (e.entityType || e.category) === 'Phone Number').length;
    const totalTriggers = domainActiveEntries.reduce((sum, e) => sum + (e.matchCount || 0), 0);

    return {
      total: domainActiveEntries.length,
      cifCount,
      accCount,
      devPhoneCount: devCount + phoneCount,
      totalTriggers
    };
  }, [listEntries, activeListType, currentDomain]);

  // Overall counts for Top Segmented Buttons (Active Only)
  const fraudCount = useMemo(() => {
    return listEntries.filter(e => {
      const eDom = e.domain || e.listCategory || 'FRAUD';
      const isApproved = e.status === 'Active' || e.status === 'ACTIVE';
      return e.type === activeListType && eDom === 'FRAUD' && isApproved;
    }).length;
  }, [listEntries, activeListType]);

  const amlCount = useMemo(() => {
    return listEntries.filter(e => {
      const eDom = e.domain || e.listCategory || 'FRAUD';
      const isApproved = e.status === 'Active' || e.status === 'ACTIVE';
      return e.type === activeListType && eDom === 'AML' && isApproved;
    }).length;
  }, [listEntries, activeListType]);

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (entry: ListEntry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleSaveEntry = (entryData: any) => {
    if (editingEntry) {
      updateListEntry(editingEntry.id, entryData);
      handleShowToast(`Entitas ${editingEntry.value} berhasil diperbarui.`);
    } else {
      const makerName = user ? `${user.fullName} (${user.group || user.role})` : 'Maker Specialist (L1)';
      const result = createListEntry({
        ...entryData,
        addedBy: makerName
      });
      const tktNo = (result as any)?.ticketNo;
      handleShowToast(
        `Pengajuan Entitas Berhasil! Entitas ${entryData.value} disimpan dengan status Pending Approval${tktNo ? ` (Tiket #${tktNo})` : ''} dan menunggu verifikasi L2 Checker sebelum aktif di produksi.`
      );
    }
  };

  const handleCopyValue = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShowToast = (message: string) => {
    setToastNotification({ type: 'success', message });
    setTimeout(() => {
      setToastNotification(null);
    }, 6000);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Toast Notification Alert */}
      {toastNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wide text-emerald-800">
                Bulk Import Berhasil
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                {toastNotification.message}
              </div>
            </div>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1 rounded-lg text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs ${
              currentDomain === 'FRAUD' 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}>
              {currentDomain === 'FRAUD' ? <ShieldAlert className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {currentDomain === 'FRAUD' ? 'Fraud' : 'AML'} {activeListCategory === 'Source Account Number' ? 'Source Account' : activeListCategory === 'All' ? 'Entity' : activeListCategory} Registry
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wide border ${
                  currentDomain === 'FRAUD' 
                    ? 'bg-rose-100 text-rose-800 border-rose-300' 
                    : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                }`}>
                  {activeListType}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen daftar entitas terlarang terpusat dengan pemisahan domain risiko <strong className="text-slate-700 font-semibold">FRAUD</strong> dan <strong className="text-slate-700 font-semibold">AML</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* List Type Selector dropdown / switch */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['Blacklist', 'Watchlist', 'Whitelist'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveListType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeListType === t
                    ? t === 'Blacklist'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : t === 'Watchlist'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Batch Upload List Button (Maker / Admin only) */}
          {!isL2User && (
            <>
              <button
                id="btn-batch-upload-list"
                onClick={() => setImportModalOpen(true)}
                className={`px-3.5 py-2 rounded-xl border font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer ${
                  currentDomain === 'FRAUD'
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}
                title={`Bulk Import data ${activeListType} ${currentDomain}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>+ Batch Upload List</span>
              </button>

              {/* Tambah Entity Manual Button */}
              <button
                id="btn-create-list-entry"
                onClick={handleOpenCreate}
                className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer ${
                  currentDomain === 'FRAUD'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Entity Manual</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. KPI Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Entitas {currentDomain}
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {kpiStats.total}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Semua entitas aktif</div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            currentDomain === 'FRAUD' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              CIF Nasabah
            </div>
            <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
              {kpiStats.cifCount}
            </div>
            <div className="text-[10px] text-purple-500 mt-0.5">Identitas nasabah</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Rekening Sumber
            </div>
            <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
              {kpiStats.accCount}
            </div>
            <div className="text-[10px] text-blue-500 mt-0.5">Rekening penampung</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Device &amp; Telepon
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
              {kpiStats.devPhoneCount}
            </div>
            <div className="text-[10px] text-emerald-500 mt-0.5">Perangkat &amp; VoIP blast</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Status:</span>
          <button
            id="filter-status-all"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({tabCounts.all})
          </button>
          <button
            id="filter-status-active"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aktif Saja ({tabCounts.active})
          </button>
          <button
            id="filter-status-pending"
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approval ({tabCounts.pending})</span>
          </button>
        </div>

        {/* Search & Layout Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64 text-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-blacklist-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Cari entitas ${currentDomain}...`}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition text-xs"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* L1 Maker Pending Status Tracker Info Banner */}
      {statusFilter === 'PENDING' && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <span className="font-bold">Mode Pemantauan Status Pengajuan (L1 Maker):</span> Menampilkan data entitas yang telah diajukan dan sedang menunggu verifikasi Supervisor (L2 Checker). Entitas berstatus <em>Read-Only</em> sampai disetujui.
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 font-mono font-bold text-amber-900 text-[11px] shrink-0">
            {filteredEntries.length} Menunggu L2
          </span>
        </div>
      )}

      {/* 5. Content Rendering: Grid vs Table View */}
      {filteredEntries.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border ${
            currentDomain === 'FRAUD' ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-indigo-50 border-indigo-200 text-indigo-500'
          }`}>
            <Search className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">Tidak ada entitas yang ditemukan</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Belum ada data untuk kategori <strong className="text-slate-700">{activeListCategory}</strong> pada registry <strong className="text-slate-700">{currentDomain} {activeListType}</strong>. Klik tombol "+ Tambah Entity Manual" atau "Import / Upload List" untuk mendaftarkan data baru.
          </p>
          <div className="flex items-center justify-center gap-2.5 mt-4">
            <button
              onClick={() => setImportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Import / Upload List (CSV/Excel)</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-xs inline-flex items-center gap-1.5 transition cursor-pointer ${
                currentDomain === 'FRAUD' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Entity Manual</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* ===== GRID VIEW ===== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map(entry => {
            const isEntryFraud = (entry.domain || entry.listCategory || 'FRAUD') === 'FRAUD';
            const entityType = entry.entityType || entry.category;

            return (
              <div 
                key={entry.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  
                  {/* Top Badges & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide border ${
                        isEntryFraud 
                          ? 'bg-rose-50 text-rose-800 border-rose-200' 
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {isEntryFraud ? '🛡️ FRAUD' : '⚖️ AML'}
                      </span>

                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {entityType}
                      </span>

                      {(entry.status === 'Pending Approval' || (entry.status as any) === 'PENDING_APPROVAL') && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>Pending L2</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setDetailEntry(entry)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                        title="Lihat Detail"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      {!isL2User && (
                        <>
                          {entry.status === 'Pending Approval' || (entry.status as any) === 'PENDING_APPROVAL' ? (
                            <span className="text-[10px] text-amber-700 font-semibold px-2 py-0.5 rounded bg-amber-50 border border-amber-200" title="Data sedang diverifikasi Checker (Read-Only)">
                              Read-Only
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEdit(entry)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                                title="Edit Entitas"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteListEntry(entry.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                                title="Hapus Entitas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Value & Holder Name */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Nilai Identitas:</span>
                      <button
                        onClick={() => handleCopyValue(entry.id, entry.value)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                      >
                        {copiedId === entry.id ? (
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Tersalin
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Copy className="w-3 h-3" /> Salin
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="font-mono font-bold text-sm text-slate-900 select-all bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 mt-1 truncate">
                      {entry.value}
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-1.5 truncate" title={entry.holderName}>
                      {entry.holderName}
                    </div>

                    {/* Whitelist Type Badge & Schedule Info */}
                    {entry.type === 'Whitelist' && entry.whitelistType && (
                      <div className="mt-2 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        {entry.whitelistType === 'PERMANENT' && <span>🟢 Permanent Whitelist</span>}
                        {entry.whitelistType === 'DATE_RANGE' && <span>📅 Temp: {entry.startDate} s.d {entry.endDate}</span>}
                        {entry.whitelistType === 'RECURRING_MONTHLY' && <span>🔄 Payroll: Tgl {entry.recurringDayOfMonth} tiap bulan</span>}
                      </div>
                    )}
                  </div>

                  {/* Reason & Source */}
                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Alasan Registrasi:</div>
                    <div className="mt-0.5 line-clamp-2">{entry.reason}</div>
                    <div className="text-[10px] text-slate-400 mt-1.5 font-medium truncate">
                      Sumber: <strong className="text-slate-600">{entry.source}</strong>
                    </div>
                  </div>

                  {/* Rule Applicability Scope */}
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Cakupan Rule:</div>
                    {entry.applyToAllRules !== false ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        🌐 GLOBAL (All Rules)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(entry.appliedRuleCodes || []).slice(0, 3).map(code => (
                          <span key={code} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {code}
                          </span>
                        ))}
                        {(entry.appliedRuleCodes || []).length > 3 && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            +{(entry.appliedRuleCodes || []).length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Bobot: <strong className="font-mono font-bold text-rose-600">{entry.riskWeight} Pts</strong></span>
                  <span className="font-mono font-semibold text-purple-700">{entry.matchCount || 0}x Hit</span>
                  <span className="font-mono text-slate-400">{(entry.addedAt || entry.createdAt || '').split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

      ) : (

        /* ===== COMPACT TABLE VIEW ===== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Tipe Entitas</th>
                  <th className="px-4 py-3">Nilai Entitas (Value)</th>
                  <th className="px-4 py-3">Nama Pemilik / Alias</th>
                  <th className="px-4 py-3">Alasan &amp; Sumber</th>
                  <th className="px-4 py-3">Cakupan Rule</th>
                  <th className="px-4 py-3 text-center">Hit Count</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map(entry => {
                  const isEntryFraud = (entry.domain || entry.listCategory || 'FRAUD') === 'FRAUD';
                  const entityType = entry.entityType || entry.category;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isEntryFraud ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}>
                          {isEntryFraud ? '🛡️ FRAUD' : '⚖️ AML'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-700">
                        {entityType}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <div className="font-mono font-bold text-slate-900 select-all">{entry.value}</div>
                          {(entry.status === 'Pending Approval' || (entry.status as any) === 'PENDING_APPROVAL') && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              Pending L2
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800 max-w-[200px]" title={entry.holderName}>
                        <div className="truncate">{entry.holderName}</div>
                        {entry.type === 'Whitelist' && entry.whitelistType && (
                          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                            {entry.whitelistType === 'PERMANENT' && '🟢 Permanent'}
                            {entry.whitelistType === 'DATE_RANGE' && `📅 ${entry.startDate} ~ ${entry.endDate}`}
                            {entry.whitelistType === 'RECURRING_MONTHLY' && `🔄 Payroll Tgl ${entry.recurringDayOfMonth}`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-[250px]">
                        <div className="truncate font-medium">{entry.reason}</div>
                        <div className="text-[10px] text-slate-400 truncate">{entry.source}</div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {entry.applyToAllRules !== false ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            GLOBAL (All)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {entry.appliedRuleCodes?.length || 0} Specific Rules
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-purple-700">
                        {entry.matchCount || 0}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => setDetailEntry(entry)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Detail"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          {!isL2User && (
                            <>
                              {entry.status === 'Pending Approval' || (entry.status as any) === 'PENDING_APPROVAL' ? (
                                <span className="text-[10px] text-amber-700 font-semibold px-2 py-0.5 rounded bg-amber-50 border border-amber-200" title="Data sedang diverifikasi Checker (Read-Only)">
                                  Read-Only
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleOpenEdit(entry)}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteListEntry(entry.id)}
                                    className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <BlacklistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEntry}
        editingEntry={editingEntry}
        activeDomain={currentDomain}
        activeEntitySubTab={activeListCategory}
        activeListType={activeListType}
        ruleBasics={ruleBasics}
      />

      {/* Detail Inspection Modal */}
      <BlacklistDetailModal
        isOpen={!!detailEntry}
        onClose={() => setDetailEntry(null)}
        entry={detailEntry}
        onEdit={!isL2User ? (entry) => handleOpenEdit(entry) : undefined}
      />

      {/* Bulk Upload Modal (CSV / Excel) */}
      <BulkUploadListModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        activeDomain={currentDomain}
        activeListType={activeListType}
        activeEntitySubTab={activeListCategory}
        onBulkImport={bulkImportListEntries}
        onSuccessToast={handleShowToast}
      />

    </div>
  );
};
