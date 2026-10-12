import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  RotateCcw, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  User, 
  Building2, 
  Flame, 
  Globe, 
  Layers, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Copy, 
  FileSpreadsheet,
  AlertTriangle,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { AmlMasterBlacklistEntry, AmlEntityType, AmlBlacklistStatus } from '../../types/amlBlacklist';
import { AMLMasterBlacklistModal } from '../../components/aml/AMLMasterBlacklistModal';
import { AMLMasterBlacklistDetailModal } from '../../components/aml/AMLMasterBlacklistDetailModal';
import { cn } from '../../lib/utils';

export const AMLMasterBlacklistPage: React.FC = () => {
  const { 
    amlBlacklistEntries, 
    addAmlBlacklistEntry, 
    updateAmlBlacklistEntry, 
    deleteAmlBlacklistEntry, 
    toggleAmlBlacklistStatus 
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

  // Toolbar & Search Filters
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<'All' | AmlEntityType>('All');
  
  // Advanced Filter state
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'All' | AmlBlacklistStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [nationalityFilter, setNationalityFilter] = useState<string>('All');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingRecord, setEditingRecord] = useState<AmlMasterBlacklistEntry | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [detailRecord, setDetailRecord] = useState<AmlMasterBlacklistEntry | null>(null);

  // Delete Confirmation
  const [deletingRecord, setDeletingRecord] = useState<AmlMasterBlacklistEntry | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI Metrics Calculation
  const kpiStats = useMemo(() => {
    const total = amlBlacklistEntries.length;
    const active = amlBlacklistEntries.filter(e => e.status === 'Active').length;
    const judolCount = amlBlacklistEntries.filter(e => e.categoryTag === 'Judi Online').length;
    const individuCount = amlBlacklistEntries.filter(e => e.type === 'Individu').length;
    const nonIndividuCount = amlBlacklistEntries.filter(e => e.type === 'Non-Individu').length;

    return {
      total,
      active,
      judolCount,
      individuCount,
      nonIndividuCount
    };
  }, [amlBlacklistEntries]);

  // Unique Nationalities for Filter
  const uniqueNationalities = useMemo(() => {
    const nats = new Set<string>();
    amlBlacklistEntries.forEach(e => {
      if (e.kewarganegaraan && e.kewarganegaraan !== '-') {
        nats.add(e.kewarganegaraan);
      }
    });
    return Array.from(nats);
  }, [amlBlacklistEntries]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return amlBlacklistEntries.filter(entry => {
      // Search Keyword (Matches ID, Nama, Referensi, NIK, NPWP, Pekerjaan, Alamat, Info)
      const q = searchKeyword.toLowerCase();
      const matchesSearch = !searchKeyword || (
        entry.id.toLowerCase().includes(q) ||
        entry.nama.toLowerCase().includes(q) ||
        (entry.referensi && entry.referensi.toLowerCase().includes(q)) ||
        (entry.nik && entry.nik.toLowerCase().includes(q)) ||
        (entry.npwp && entry.npwp.toLowerCase().includes(q)) ||
        (entry.pekerjaan && entry.pekerjaan.toLowerCase().includes(q)) ||
        (entry.alamat && entry.alamat.toLowerCase().includes(q)) ||
        (entry.informasiLain && entry.informasiLain.toLowerCase().includes(q))
      );

      // Entity Type Filter
      const matchesType = entityTypeFilter === 'All' || entry.type === entityTypeFilter;

      // Status Filter
      const matchesStatus = statusFilter === 'All' || entry.status === statusFilter;

      // Category Tag Filter
      const matchesCategory = categoryFilter === 'All' || entry.categoryTag === categoryFilter;

      // Nationality Filter
      const matchesNationality = nationalityFilter === 'All' || entry.kewarganegaraan === nationalityFilter;

      return matchesSearch && matchesType && matchesStatus && matchesCategory && matchesNationality;
    });
  }, [amlBlacklistEntries, searchKeyword, entityTypeFilter, statusFilter, categoryFilter, nationalityFilter]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  // Action Handlers
  const handleOpenAddModal = () => {
    setFormMode('add');
    setEditingRecord(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (record: AmlMasterBlacklistEntry) => {
    setFormMode('edit');
    setEditingRecord(record);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (record: AmlMasterBlacklistEntry) => {
    setDetailRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleSaveModal = (data: Omit<AmlMasterBlacklistEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (formMode === 'add') {
      const created = addAmlBlacklistEntry(data);
      showToast(`Record blacklist '${created.nama}' [${created.id}] berhasil ditambahkan ke AML Master Blacklist.`, 'success');
    } else if (formMode === 'edit' && editingRecord) {
      updateAmlBlacklistEntry(editingRecord.id, data);
      showToast(`Record blacklist '${editingRecord.nama}' [${editingRecord.id}] berhasil diperbarui.`, 'success');
    }
    setIsFormModalOpen(false);
    setEditingRecord(null);
  };

  const handleToggleStatus = (record: AmlMasterBlacklistEntry) => {
    toggleAmlBlacklistStatus(record.id);
    const newStatus = record.status === 'Active' ? 'Inactive' : 'Active';
    showToast(`Status record '${record.nama}' diubah menjadi ${newStatus}.`, 'info');
  };

  const handleDeleteConfirm = () => {
    if (!deletingRecord) return;
    deleteAmlBlacklistEntry(deletingRecord.id);
    showToast(`Record '${deletingRecord.nama}' [${deletingRecord.id}] berhasil dihapus dari blacklist.`, 'error');
    setDeletingRecord(null);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setEntityTypeFilter('All');
    setStatusFilter('All');
    setCategoryFilter('All');
    setNationalityFilter('All');
    setCurrentPage(1);
    showToast('Filter telah direset ke default.', 'info');
  };

  // Export to Excel / CSV with UTF-8 BOM
  const handleExportExcel = () => {
    const headers = [
      'No',
      'ID',
      'Type',
      'Referensi',
      'Nama / Entitas',
      'Gelar',
      'Pekerjaan',
      'Tanggal Lahir',
      'Tempat Lahir',
      'Kewarganegaraan',
      'Nomor Passport',
      'NPWP',
      'NIK',
      'Status',
      'Kategori',
      'Alamat',
      'Informasi Lain',
      'Created At',
      'Created By'
    ];

    const rows = filteredRecords.map((entry, index) => [
      index + 1,
      `"${entry.id}"`,
      `"${entry.type}"`,
      `"${(entry.referensi || '').replace(/"/g, '""')}"`,
      `"${(entry.nama || '').replace(/"/g, '""')}"`,
      `"${(entry.gelar || '').replace(/"/g, '""')}"`,
      `"${(entry.pekerjaan || '').replace(/"/g, '""')}"`,
      `"${entry.tanggalLahir || ''}"`,
      `"${(entry.tempatLahir || '').replace(/"/g, '""')}"`,
      `"${(entry.kewarganegaraan || '').replace(/"/g, '""')}"`,
      `"${entry.nomorPassport || ''}"`,
      `="${entry.npwp || ''}"`, // format text for Excel
      `="${entry.nik || ''}"`,  // format text to preserve 16 digit zeros
      `"${entry.status}"`,
      `"${entry.categoryTag || ''}"`,
      `"${(entry.alamat || '').replace(/"/g, '""')}"`,
      `"${(entry.informasiLain || '').replace(/"/g, '""')}"`,
      `"${entry.createdAt || ''}"`,
      `"${entry.createdBy || ''}"`
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    link.setAttribute('href', url);
    link.setAttribute('download', `AML_Master_Blacklist_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Berhasil mengekspor ${filteredRecords.length} record AML Blacklist ke file Excel.`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-top-3 duration-200",
          toastMessage.type === 'success' && "bg-emerald-50 border-emerald-200 text-emerald-800",
          toastMessage.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800",
          toastMessage.type === 'error' && "bg-rose-50 border-rose-200 text-rose-800"
        )}>
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          {toastMessage.type === 'info' && <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />}
          {toastMessage.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                AML Master Blacklist
              </h1>
              <p className="text-xs text-slate-500">
                Pusat data daftar hitam Anti-Money Laundering: Penanganan situs judi online (judol), rekening penampung, entitas terlarang, dan individu berisiko tinggi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {!isL2User && (
            <button
              id="btn-add-aml-blacklist"
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Record</span>
            </button>
          )}

          <button
            id="btn-export-aml-excel"
            onClick={handleExportExcel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Blacklist Records</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{kpiStats.total}</div>
            <span className="text-[11px] text-slate-400">Entitas terdaftar</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Active Enforced</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{kpiStats.active}</div>
            <span className="text-[11px] text-emerald-700 font-medium">Blokir otomatis aktif</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Situs Judi Online (Judol)</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">{kpiStats.judolCount}</div>
            <span className="text-[11px] text-rose-600 font-medium">Slot &amp; platform ilegal</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Individu / Perorangan</span>
            <div className="text-2xl font-bold text-blue-600 mt-1">{kpiStats.individuCount}</div>
            <span className="text-[11px] text-slate-400">
              {kpiStats.nonIndividuCount} Non-Individu
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container: Toolbar & Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Top Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input & Entity Type Filter */}
            <div className="flex flex-1 items-center space-x-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-search-aml-blacklist"
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari Keyword: ID, Nama, Referensi, NIK, NPWP, Pekerjaan, Alamat..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Entity Type Filter (All, Individu, Non-Individu) */}
              <div className="w-48 shrink-0">
                <select
                  id="select-filter-entity-type"
                  value={entityTypeFilter}
                  onChange={(e) => {
                    setEntityTypeFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">Semua Tipe (All)</option>
                  <option value="Individu">Individu (Perorangan)</option>
                  <option value="Non-Individu">Non-Individu (Badan / Judol)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons: Advanced Filter & Reset */}
            <div className="flex items-center space-x-2">
              <button
                id="btn-toggle-advanced-filter"
                onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                className={cn(
                  "px-3 py-2 text-xs font-semibold rounded-lg border flex items-center space-x-1.5 transition-colors",
                  isAdvancedFilterOpen
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Advanced Filter</span>
                {(statusFilter !== 'All' || categoryFilter !== 'All' || nationalityFilter !== 'All') && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block ml-1"></span>
                )}
              </button>

              <button
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center space-x-1 transition-colors"
                title="Reset All Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

          </div>

          {/* Advanced Filter Collapsible Bar */}
          {isAdvancedFilterOpen && (
            <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Filter Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">Semua Status</option>
                  <option value="Active">Active (Terblokir)</option>
                  <option value="Inactive">Inactive (Non-Aktif)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Kategori Indikasi
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">Semua Kategori</option>
                  <option value="Judi Online">Judi Online (Judol)</option>
                  <option value="Money Laundering">Money Laundering</option>
                  <option value="Fraud Syndicate">Fraud Syndicate</option>
                  <option value="Terrorism / DTTOT">Terrorism / DTTOT</option>
                  <option value="Illegal Investment">Illegal Investment</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Kewarganegaraan
                </label>
                <select
                  value={nationalityFilter}
                  onChange={(e) => {
                    setNationalityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">Semua Kewarganegaraan</option>
                  {uniqueNationalities.map(nat => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Result Counter & Active Filter Pills */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center space-x-2">
              <span>Menampilkan <strong className="text-slate-800">{filteredRecords.length}</strong> record</span>
              {(searchKeyword || entityTypeFilter !== 'All' || statusFilter !== 'All' || categoryFilter !== 'All' || nationalityFilter !== 'All') && (
                <span className="text-indigo-600 font-medium">(Filter diterapkan)</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 border border-slate-300 rounded bg-white text-xs text-slate-700 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

        </div>

        {/* Lookup Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1550px]">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 w-40 text-center sticky left-0 bg-slate-100 z-10 shadow-xs">Action</th>
                <th className="py-3 px-3 w-28">ID</th>
                <th className="py-3 px-3 w-28">Type</th>
                <th className="py-3 px-3 w-64">Referensi</th>
                <th className="py-3 px-3 w-48">Nama / Entitas</th>
                <th className="py-3 px-3 w-44">Pekerjaan</th>
                <th className="py-3 px-3 w-32">Tanggal Lahir</th>
                <th className="py-3 px-3 w-32">Tempat Lahir</th>
                <th className="py-3 px-3 w-32">Kewarganegaraan</th>
                <th className="py-3 px-3 w-32">Nomor Passport</th>
                <th className="py-3 px-3 w-44">NPWP</th>
                <th className="py-3 px-3 w-44">NIK</th>
                <th className="py-3 px-3 w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-700 font-sans">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">Tidak ada record blacklist yang cocok</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau reset filter di toolbar atas.</p>
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
                      >
                        Reset Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((entry, index) => {
                  const sequentialNo = (currentPage - 1) * rowsPerPage + index + 1;
                  return (
                    <tr 
                      key={entry.id}
                      className={cn(
                        "hover:bg-indigo-50/30 transition-colors",
                        entry.status === 'Inactive' ? "bg-slate-50/50 opacity-75" : "bg-white"
                      )}
                    >
                      {/* No */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {sequentialNo}
                      </td>

                      {/* Action: Detail (for all), Edit, Delete, Activation Toggle (for maker/admin) */}
                      <td className="py-3 px-3 sticky left-0 bg-white/95 backdrop-blur-xs z-10 border-r border-slate-100">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Detail */}
                          <button
                            onClick={() => handleOpenDetailModal(entry)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                            title="Lihat Detail Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isL2User && (
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => handleOpenEditModal(entry)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setDeletingRecord(entry)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Hapus Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* Activation Toggle */}
                              <button
                                onClick={() => handleToggleStatus(entry)}
                                className={cn(
                                  "p-1.5 rounded-md transition-colors cursor-pointer",
                                  entry.status === 'Active' 
                                    ? "text-emerald-600 hover:bg-emerald-50" 
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                )}
                                title={entry.status === 'Active' ? "Non-aktifkan Record" : "Aktifkan Record"}
                              >
                                {entry.status === 'Active' ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* ID */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1">
                          <span className="font-mono font-semibold text-slate-800 text-[11px]">{entry.id}</span>
                          <button
                            onClick={() => handleCopy(entry.id, entry.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                            title="Copy ID"
                          >
                            {copiedId === entry.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3">
                        <span className={cn(
                          "inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                          entry.type === 'Individu'
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        )}>
                          {entry.type === 'Individu' ? <User className="w-3 h-3 shrink-0" /> : <Building2 className="w-3 h-3 shrink-0" />}
                          <span>{entry.type}</span>
                        </span>
                      </td>

                      {/* Referensi */}
                      <td className="py-3 px-3">
                        <div className="max-w-[240px] truncate text-slate-700 font-medium" title={entry.referensi}>
                          {entry.referensi || '-'}
                        </div>
                      </td>

                      {/* Nama / Entitas */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-900">{entry.nama}</span>
                          {entry.gelar && entry.gelar !== '-' && (
                            <span className="text-[10px] text-slate-400 font-normal">({entry.gelar})</span>
                          )}
                          {entry.categoryTag === 'Judi Online' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 shrink-0">
                              Judol
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pekerjaan */}
                      <td className="py-3 px-3">
                        <span className="text-slate-600">{entry.pekerjaan || '-'}</span>
                      </td>

                      {/* Tanggal Lahir */}
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {entry.tanggalLahir || '-'}
                      </td>

                      {/* Tempat Lahir */}
                      <td className="py-3 px-3 text-slate-600">
                        {entry.tempatLahir || '-'}
                      </td>

                      {/* Kewarganegaraan */}
                      <td className="py-3 px-3">
                        {entry.kewarganegaraan && entry.kewarganegaraan !== '-' ? (
                          <span className="inline-flex items-center space-x-1 text-slate-700">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{entry.kewarganegaraan}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Nomor Passport */}
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                        {entry.nomorPassport || '-'}
                      </td>

                      {/* NPWP */}
                      <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">
                        {entry.npwp || '-'}
                      </td>

                      {/* NIK */}
                      <td className="py-3 px-3 font-mono text-slate-800 text-[11px]">
                        {entry.nik || '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={cn(
                          "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
                          entry.status === 'Active'
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        )}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Halaman <strong className="text-slate-800">{currentPage}</strong> dari <strong className="text-slate-800">{totalPages}</strong> (Total {filteredRecords.length} records)
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-7 h-7 rounded-lg text-xs font-semibold transition-colors",
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Dynamic Add / Edit Modal */}
      <AMLMasterBlacklistModal
        isOpen={isFormModalOpen}
        mode={formMode}
        entryData={editingRecord}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveModal}
      />

      {/* Detail Modal */}
      <AMLMasterBlacklistDetailModal
        isOpen={isDetailModalOpen}
        entry={detailRecord}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailRecord(null);
        }}
        onEdit={(rec) => {
          setIsDetailModalOpen(false);
          handleOpenEditModal(rec);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Blacklist</h3>
                <p className="text-xs text-slate-500">Tindakan ini akan dicatat dalam Audit Trail Changes.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Apakah Anda yakin ingin menghapus record <strong>{deletingRecord.nama}</strong> [ID: <span className="font-mono">{deletingRecord.id}</span>] dari AML Master Blacklist?
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-4 space-y-1 text-slate-700">
              <div><strong>Tipe:</strong> {deletingRecord.type}</div>
              <div><strong>Referensi:</strong> {deletingRecord.referensi}</div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                Ya, Hapus Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
