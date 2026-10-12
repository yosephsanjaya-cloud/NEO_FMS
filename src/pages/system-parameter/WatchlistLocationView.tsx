import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  RefreshCw, 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Globe, 
  Navigation, 
  Compass, 
  ExternalLink, 
  Eye, 
  X, 
  FileSpreadsheet, 
  Layers, 
  ChevronRight, 
  ArrowUpDown, 
  Info,
  ShieldCheck,
  Check,
  Building2,
  Calendar
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { WatchlistLocation, WatchlistLocationStatus, WatchlistLocationApprovalStatus } from '../../types/watchlistLocation';
import { RuleApprovalQueueView } from '../../components/rules/RuleApprovalQueueView';

interface WatchlistLocationViewProps {
  mode?: 'view' | 'approval';
}

// Preset locations for rapid testing / operational presets
const PRESET_LOCATIONS = [
  { name: 'Kabupaten Ogan Ilir, Sumatera Selatan', lat: -3.4289, long: 104.6644, radius: 25 },
  { name: 'Kecamatan Tulung Selapan, OKI, Sumatera Selatan', lat: -3.2847, long: 105.7422, radius: 30 },
  { name: 'Kabupaten Ogan Komering Ilir (OKI), Sumatera Selatan', lat: -3.4116, long: 105.3644, radius: 25 },
  { name: 'Kota Prabumulih, Sumatera Selatan', lat: -3.4286, long: 104.2389, radius: 15 },
  { name: 'Kabupaten Bangka Barat, Kepulauan Bangka Belitung', lat: -1.7824, long: 105.3522, radius: 20 },
  { name: 'Kecamatan Medan Belawan, Kota Medan', lat: 3.7845, long: 98.6833, radius: 15 },
  { name: 'Kecamatan Cilincing, Jakarta Utara', lat: -6.1284, long: 106.9421, radius: 10 },
  { name: 'Kabupaten Pasuruan (Kawasan Pesisir), Jawa Timur', lat: -7.6469, long: 112.9078, radius: 20 },
];

export const WatchlistLocationView: React.FC<WatchlistLocationViewProps> = ({ mode = 'view' }) => {
  const { user } = useAuth();
  const { 
    watchlistLocations, 
    createWatchlistLocation, 
    updateWatchlistLocation, 
    deleteWatchlistLocation, 
    toggleWatchlistLocationStatus,
    resetWatchlistLocations,
    getPendingRuleApprovalCount,
    setActiveTab
  } = useFMS();

  // =========================================================================
  // RBAC & ISOLATION CHECK
  // Menu ini HANYA boleh diakses oleh pengguna Sysadmin dan domain Fraud (AFC L1 & AFC L2)
  // Sembunyikan/blokir akses menu ini secara total untuk AML (Analyst L1 & Analyst L2)
  // =========================================================================
  const isSysAdmin = !user || user.username === 'sysadmin' || user.riskDomain === 'FULL ACCESS' || user.group === 'IT DCA Maker Checker' || user.group === 'Administrator';
  const isAmlOnlyUser = user?.riskDomain === 'AML ONLY' || user?.username === 'analystl1' || user?.username === 'analystl2' || user?.group === 'Analyst L1' || user?.group === 'Analyst L2';
  const isFraudUser = user?.riskDomain === 'FRAUD ONLY' || user?.username === 'afcl1' || user?.username === 'afcl2' || user?.group === 'AFC L1' || user?.group === 'AFC L2' || user?.role?.toLowerCase().includes('fraud');
  
  const hasAccess = (isSysAdmin || isFraudUser) && !isAmlOnlyUser;

  // Checker & Maker roles determination
  const isFraudMaker = user?.username === 'afcl1' || user?.group === 'AFC L1';
  const isFraudChecker = isSysAdmin || user?.username === 'afcl2' || user?.group === 'AFC L2' || user?.role?.includes('Checker');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<keyof WatchlistLocation>('createdDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Target item for edit/delete/detail
  const [selectedLocation, setSelectedLocation] = useState<WatchlistLocation | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radiusKm: '25',
    status: 'Active' as WatchlistLocationStatus,
    reason: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Toast feedback state
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast(message ? { type, message } : null);
    if (message) {
      setTimeout(() => setToast(null), 4500);
    }
  };

  const pendingApprovalsCount = useMemo(() => {
    return getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Watchlist Location') : 0;
  }, [getPendingRuleApprovalCount]);

  // =========================================================================
  // ACCESS DENIED VIEW FOR AML USERS
  // =========================================================================
  if (!hasAccess) {
    return (
      <div className="p-8 max-w-4xl mx-auto my-12" id="watchlist-location-access-denied">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akses Ditolak (403 Forbidden)</h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Modul <strong>System Parameter - Watchlist Location</strong> hanya dapat diakses oleh personil 
            <strong> Anti-Fraud Operations (AFC L1 & AFC L2)</strong> dan <strong>Sysadmin</strong>. 
            Peran AML (Analyst) tidak memiliki izin otorisasi untuk mengakses parameter geospasial fraud ini.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              <Building2 className="w-3.5 h-3.5" /> Domain Akun Anda: {user?.riskDomain || 'AML ONLY'} ({user?.group || user?.role || 'AML Analyst'})
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // APPROVAL MODE: RENDER MAKER-CHECKER QUEUE DIRECTLY
  // =========================================================================
  if (mode === 'approval') {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6" id="watchlist-location-approval-page">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-orange-100 text-orange-700 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Antrean Persetujuan Watchlist Location</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200 font-mono">
                  {pendingApprovalsCount} Menunggu
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ruang verifikasi L2 Checker / Supervisor untuk persetujuan penambahan, perubahan, dan penghapusan lokasi watchlist fraud.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('system-parameter-watchlist-location-view')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Kembali ke Daftar Lokasi</span>
          </button>
        </div>

        <RuleApprovalQueueView 
          targetType="Watchlist Location"
          domain="Fraud"
          title="Antrean Approval Watchlist Location"
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: TABULAR DATA & MANAGEMENT
  // =========================================================================

  // Metrics Calculation
  const totalCount = watchlistLocations.length;
  const activeCount = watchlistLocations.filter(l => l.status === 'Active').length;
  const inactiveCount = watchlistLocations.filter(l => l.status === 'Inactive').length;
  const pendingCount = watchlistLocations.filter(l => l.approvalStatus.startsWith('Pending')).length;

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    return watchlistLocations
      .filter(item => {
        // Search filter
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch = !query || 
          item.id.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          String(item.latitude).includes(query) ||
          String(item.longitude).includes(query) ||
          (item.notes && item.notes.toLowerCase().includes(query));

        // Operational Status filter
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

        // Approval Status filter
        let matchesApproval = true;
        if (approvalFilter === 'ACTIVE') {
          matchesApproval = item.approvalStatus === 'Active';
        } else if (approvalFilter === 'PENDING') {
          matchesApproval = item.approvalStatus.startsWith('Pending');
        } else if (approvalFilter !== 'ALL') {
          matchesApproval = item.approvalStatus === approvalFilter;
        }

        return matchesSearch && matchesStatus && matchesApproval;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [watchlistLocations, searchTerm, statusFilter, approvalFilter, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleSort = (field: keyof WatchlistLocation) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errs.name = 'Nama lokasi wajib diisi (minimal 3 karakter)';
    }

    const lat = parseFloat(formData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errs.latitude = 'Latitude tidak valid. Rentang angka antara -90.0 hingga +90.0';
    }

    const long = parseFloat(formData.longitude);
    if (isNaN(long) || long < -180 || long > 180) {
      errs.longitude = 'Longitude tidak valid. Rentang angka antara -180.0 hingga +180.0';
    }

    if (!formData.reason.trim()) {
      errs.reason = 'Justifikasi pengajuan (alasan Maker) wajib diisi untuk kepatuhan Maker-Checker';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Modal open handlers
  const openAddModal = () => {
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      radiusKm: '25',
      status: 'Active',
      reason: 'Pengajuan penambahan lokasi watchlist baru untuk mitigasi tindak pidana fraud berulang.',
      notes: ''
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: WatchlistLocation) => {
    setSelectedLocation(item);
    setFormData({
      name: item.name,
      latitude: String(item.latitude),
      longitude: String(item.longitude),
      radiusKm: String(item.radiusKm || 25),
      status: item.status,
      reason: `Pembaruan data koordinat/parameter lokasi ${item.id}`,
      notes: item.notes || ''
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (item: WatchlistLocation) => {
    setSelectedLocation(item);
    setFormData(prev => ({
      ...prev,
      reason: `Pengajuan penghapusan lokasi watchlist ${item.id} (${item.name}) karena tidak lagi terdeteksi kluster fraud aktif.`
    }));
    setIsDeleteModalOpen(true);
  };

  const openToggleModal = (item: WatchlistLocation) => {
    setSelectedLocation(item);
    const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    setFormData(prev => ({
      ...prev,
      reason: `Pengubahan status operasional lokasi ${item.id} menjadi ${nextStatus}.`
    }));
    setIsToggleModalOpen(true);
  };

  const openDetailModal = (item: WatchlistLocation) => {
    setSelectedLocation(item);
    setIsDetailModalOpen(true);
  };

  // Submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const lat = parseFloat(formData.latitude);
    const long = parseFloat(formData.longitude);
    const rad = parseInt(formData.radiusKm, 10) || 25;

    const newRec = createWatchlistLocation(
      {
        name: formData.name.trim(),
        latitude: lat,
        longitude: long,
        radiusKm: rad,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
        createdBy: user?.username || 'afcl1'
      },
      formData.reason,
      true // Submit as Maker ticket
    );

    setIsAddModalOpen(false);
    showToast(`Pengajuan lokasi baru "${newRec.name}" berhasil dibuat (Tiket #${newRec.ticketId || 'WLOC-NEW'}). Menunggu persetujuan Checker L2.`, 'success');
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation || !validateForm()) return;

    const lat = parseFloat(formData.latitude);
    const long = parseFloat(formData.longitude);
    const rad = parseInt(formData.radiusKm, 10) || 25;

    updateWatchlistLocation(
      selectedLocation.id,
      {
        name: formData.name.trim(),
        latitude: lat,
        longitude: long,
        radiusKm: rad,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
        lastUpdatedBy: user?.username || 'afcl1'
      },
      formData.reason,
      true
    );

    setIsEditModalOpen(false);
    showToast(`Usulan pembaruan ${selectedLocation.id} telah diajukan ke antrean Checker L2.`, 'info');
  };

  // Submit Delete
  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    deleteWatchlistLocation(
      selectedLocation.id,
      formData.reason || 'Pengajuan penghapusan lokasi watchlist oleh Maker',
      true
    );

    setIsDeleteModalOpen(false);
    showToast(`Pengajuan penghapusan ${selectedLocation.id} berhasil dikirim ke antrean persetujuan Checker.`, 'info');
  };

  // Submit Toggle Status
  const handleToggleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    toggleWatchlistLocationStatus(
      selectedLocation.id,
      formData.reason || 'Pengubahan status operasional lokasi watchlist',
      true
    );

    setIsToggleModalOpen(false);
    showToast(`Pengajuan perubahan status ${selectedLocation.id} dikirim ke Checker L2.`, 'info');
  };

  // Quick Preset Selector
  const applyPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setFormData(prev => ({
      ...prev,
      name: preset.name,
      latitude: String(preset.lat),
      longitude: String(preset.long),
      radiusKm: String(preset.radius)
    }));
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Lokasi', 'Latitude', 'Longitude', 'Radius (KM)', 'Status Operasional', 'Status Approval', 'Created Date', 'Last Update Date'];
    const rows = filteredData.map(d => [
      `"${d.id}"`,
      `"${d.name.replace(/"/g, '""')}"`,
      d.latitude,
      d.longitude,
      d.radiusKm || 25,
      d.status,
      d.approvalStatus,
      `"${d.createdDate}"`,
      `"${d.lastUpdateDate}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `neo_fms_watchlist_locations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data Watchlist Location berhasil diekspor ke CSV.', 'success');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" id="watchlist-location-module">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700 shadow-emerald-950/20' 
            : toast.type === 'error'
            ? 'bg-rose-900 text-rose-100 border-rose-700 shadow-rose-950/20'
            : 'bg-blue-900 text-blue-100 border-blue-700 shadow-blue-950/20'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Sub-Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 shadow-2xs">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">Watchlist Location</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200">
                System Parameter
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Neo FMS v1.22
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola daftar koordinat geografis wilayah berisiko tinggi (fraud hot spot) dengan pengawasan Maker-Checker ganda.
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
          {/* Quick tab to Approval Queue */}
          <button
            id="btn-goto-watchlist-approval"
            onClick={() => setActiveTab('system-parameter-watchlist-location-approval')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 transition shadow-xs"
            title="Buka antrean approval Maker-Checker untuk Checker L2"
          >
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <span>Antrean Approval</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[10px] font-bold font-mono">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          {/* Add New Location (Maker Action) */}
          <button
            id="btn-add-watchlist-location"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs shadow-blue-600/20 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lokasi Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Watchlist</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalCount}</div>
          <p className="text-[11px] text-slate-400">Titik koordinat terdaftar</p>
        </div>

        {/* Card 2: Active */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Operasional Aktif</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{activeCount}</div>
          <p className="text-[11px] text-emerald-600">Dipantau oleh Rule Engine</p>
        </div>

        {/* Card 3: Inactive */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Non-Aktif</span>
            <Power className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-600">{inactiveCount}</div>
          <p className="text-[11px] text-slate-400">Pemantauan dinonaktifkan</p>
        </div>

        {/* Card 4: Pending Maker-Checker */}
        <div 
          onClick={() => setActiveTab('system-parameter-watchlist-location-approval')}
          className="p-4 rounded-xl bg-white border border-orange-200 shadow-2xs space-y-1 cursor-pointer hover:border-orange-300 hover:shadow-xs transition group"
        >
          <div className="flex items-center justify-between text-orange-600 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Menunggu Approval</span>
            <Clock className="w-4 h-4 text-orange-600 group-hover:rotate-45 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-700">{pendingCount}</div>
          <p className="text-[11px] text-orange-600 flex items-center justify-between">
            <span>Perlu tindakan Checker L2</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-watchlist-location-input"
              type="text"
              placeholder="Cari ID lokasi (WLOC-xxx), nama wilayah, atau koordinat..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Operasional */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-600">Status:</span>
              <select
                id="filter-watchlist-status-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Active">Active (Aktif)</option>
                <option value="Inactive">Inactive (Non-Aktif)</option>
              </select>
            </div>

            {/* Approval Status */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-600">Approval:</span>
              <select
                id="filter-watchlist-approval-select"
                value={approvalFilter}
                onChange={(e) => {
                  setApprovalFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="ALL">Semua Approval</option>
                <option value="ACTIVE">Disetujui (Active)</option>
                <option value="PENDING">Menunggu Approval</option>
                <option value="Pending Approval - New">Pending - New</option>
                <option value="Pending Approval - Edit">Pending - Edit</option>
                <option value="Pending Approval - Delete">Pending - Delete</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              id="btn-export-watchlist-csv"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
              title="Ekspor data ke file CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>

            {/* Reset Data Mock */}
            <button
              onClick={() => {
                if (window.confirm('Reset daftar Watchlist Location ke data bawaan demo?')) {
                  resetWatchlistLocations();
                  showToast('Data Watchlist Location telah direset ke initial state.', 'info');
                }
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              title="Reset ke data awal"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Tabular View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse" id="table-watchlist-locations">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3.5 w-10 text-center">#</th>
                <th 
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition min-w-[220px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Lokasi</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('latitude')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Latitude</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('longitude')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Longitude</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Radius</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Status Approval</th>
                <th 
                  onClick={() => handleSort('createdDate')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Created Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('lastUpdateDate')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Update</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Compass className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700 text-sm">Tidak ada data lokasi ditemukan</p>
                      <p className="text-xs text-slate-400">
                        Coba sesuaikan kata kunci pencarian atau bersihkan filter status.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((loc, idx) => {
                  const isPending = loc.approvalStatus.startsWith('Pending');
                  const rowIndex = (currentPage - 1) * itemsPerPage + idx + 1;

                  return (
                    <tr 
                      key={loc.id} 
                      className={`hover:bg-blue-50/40 transition group ${
                        isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 text-center text-[11px] font-mono text-slate-400">
                        {rowIndex}
                      </td>

                      {/* ID */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        <button
                          onClick={() => openDetailModal(loc)}
                          className="hover:underline flex items-center gap-1 text-blue-700"
                        >
                          <span>{loc.id}</span>
                        </button>
                      </td>

                      {/* Nama Lokasi */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span>{loc.name}</span>
                            {loc.notes && (
                              <p className="text-[11px] text-slate-400 font-normal italic truncate max-w-xs" title={loc.notes}>
                                {loc.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Latitude */}
                      <td className="py-3 px-3 text-right font-mono text-slate-800 whitespace-nowrap">
                        {loc.latitude.toFixed(4)}°
                      </td>

                      {/* Longitude */}
                      <td className="py-3 px-3 text-right font-mono text-slate-800 whitespace-nowrap">
                        {loc.longitude.toFixed(4)}°
                      </td>

                      {/* Radius */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-slate-600">
                        {loc.radiusKm ? `${loc.radiusKm} km` : '-'}
                      </td>

                      {/* Status Operasional */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => openToggleModal(loc)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                            loc.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title={`Klik untuk mengajukan ubah status ke ${loc.status === 'Active' ? 'Inactive' : 'Active'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            loc.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                          <span>{loc.status}</span>
                        </button>
                      </td>

                      {/* Status Approval */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {loc.approvalStatus === 'Active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : loc.approvalStatus === 'Pending Approval - New' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending New</span>
                          </span>
                        ) : loc.approvalStatus === 'Pending Approval - Edit' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-300">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>Pending Edit</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                            <Clock className="w-3 h-3 text-rose-600" />
                            <span>Pending Delete</span>
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        <div>{loc.createdDate.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-400">{loc.createdDate.split(' ')[1]}</div>
                      </td>

                      {/* Last Update Date */}
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        <div>{loc.lastUpdateDate.split(' ')[0]}</div>
                        <div className="text-[10px] text-slate-400">{loc.lastUpdateDate.split(' ')[1]}</div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Detail / View on Map */}
                          <button
                            onClick={() => openDetailModal(loc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Lihat Detail & Peta Koordinat"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit (Maker) */}
                          <button
                            onClick={() => openEditModal(loc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Ajukan Pembaruan Data Lokasi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Status (Maker) */}
                          <button
                            onClick={() => openToggleModal(loc)}
                            className={`p-1.5 rounded-lg transition ${
                              loc.status === 'Active' 
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50' 
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={loc.status === 'Active' ? 'Non-aktifkan Lokasi' : 'Aktifkan Lokasi'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete (Maker) */}
                          <button
                            onClick={() => openDeleteModal(loc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Ajukan Penghapusan Lokasi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Menampilkan</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-2 py-1 font-semibold text-slate-800 focus:outline-hidden"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>dari <strong>{filteredData.length}</strong> total data</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
            >
              Sebelumnya
            </button>
            <div className="px-3 py-1 font-mono font-semibold text-slate-700">
              Halaman {currentPage} dari {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD WATCHLIST LOCATION                                           */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Tambah Lokasi Watchlist Baru</h3>
                  <p className="text-xs text-slate-500">Mekanisme Maker-Checker: Usulan akan masuk ke antrean approval Checker L2.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Preset Wilayah Berisiko (Hotspot Demo):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_LOCATIONS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition text-slate-700"
                    >
                      {preset.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID & Nama Lokasi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ID Lokasi <span className="text-slate-400">(Auto)</span>
                  </label>
                  <input
                    type="text"
                    value="Auto-generated (WLOC-xxx)"
                    disabled
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nama Lokasi / Wilayah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kabupaten Ogan Ilir, Sumatera Selatan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                    } focus:outline-hidden focus:ring-2 focus:ring-blue-500/20`}
                  />
                  {formErrors.name && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.name}</p>
                  )}
                </div>
              </div>

              {/* Koordinat: Latitude & Longitude & Radius */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Latitude (Desimal) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="-3.4289"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-lg border ${
                      formErrors.latitude ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                    } focus:outline-hidden focus:ring-2 focus:ring-blue-500/20`}
                  />
                  {formErrors.latitude && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.latitude}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Longitude (Desimal) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="104.6644"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-lg border ${
                      formErrors.longitude ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                    } focus:outline-hidden focus:ring-2 focus:ring-blue-500/20`}
                  />
                  {formErrors.longitude && (
                    <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.longitude}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Radius Pemantauan
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={formData.radiusKm}
                      onChange={(e) => setFormData({ ...formData, radiusKm: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                    />
                    <span className="text-xs font-medium text-slate-500">KM</span>
                  </div>
                </div>
              </div>

              {/* Status & Catatan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Status Operasional Awal
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as WatchlistLocationStatus })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 bg-white"
                  >
                    <option value="Active">Active (Aktif Memfilter Transaksi)</option>
                    <option value="Inactive">Inactive (Non-Aktif Sementara)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Catatan Intelijen / Tipe Fraud
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Titik hotspot social engineering & APK perbankan"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Justifikasi Maker-Checker */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Justifikasi Pengajuan (Maker Notes) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan alasan dan referensi penambahan lokasi ini untuk ditinjau oleh Checker..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    formErrors.reason ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-blue-500'
                  } focus:outline-hidden focus:ring-2 focus:ring-blue-500/20`}
                />
                {formErrors.reason && (
                  <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.reason}</p>
                )}
              </div>

              {/* Live Coordinates Simulation Box */}
              {formData.latitude && formData.longitude && !isNaN(parseFloat(formData.latitude)) && !isNaN(parseFloat(formData.longitude)) && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-900">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>Titik Geospasial Terdeteksi:</span>
                    <span className="font-mono font-bold">{formData.latitude}°, {formData.longitude}°</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900 flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>Cek Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
                >
                  Ajukan ke Checker L2
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT WATCHLIST LOCATION                                          */}
      {/* ========================================================================= */}
      {isEditModalOpen && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Ubah Watchlist Location ({selectedLocation.id})</h3>
                  <p className="text-xs text-slate-500">Mekanisme Maker-Checker: Perubahan memerlukan persetujuan L2 Checker.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">ID Lokasi</label>
                  <input
                    type="text"
                    value={selectedLocation.id}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-mono font-bold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nama Lokasi / Wilayah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 text-xs rounded-lg border ${
                      formErrors.name ? 'border-rose-400' : 'border-slate-200 focus:border-blue-500'
                    } focus:outline-hidden`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Latitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Longitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Radius (KM)</label>
                  <input
                    type="number"
                    value={formData.radiusKm}
                    onChange={(e) => setFormData({ ...formData, radiusKm: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Status Operasional</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan Intelijen</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Justifikasi Perubahan (Maker Notes) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  Kirim Usulan ke Checker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {isDeleteModalOpen && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Watchlist Location?</h3>
                <p className="text-xs text-slate-500">Tindakan ini memerlukan persetujuan L2 Checker.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedLocation.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-semibold text-slate-800">{selectedLocation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Koordinat:</span>
                <span className="font-mono text-slate-700">{selectedLocation.latitude}, {selectedLocation.longitude}</span>
              </div>
            </div>

            <form onSubmit={handleDeleteSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Alasan Penghapusan (Wajib)
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                >
                  Ajukan Penghapusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TOGGLE STATUS CONFIRMATION                                       */}
      {/* ========================================================================= */}
      {isToggleModalOpen && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3 text-blue-600">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Power className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Ubah Status Operasional ke {selectedLocation.status === 'Active' ? 'Inactive' : 'Active'}?
                </h3>
                <p className="text-xs text-slate-500">Permintaan ini akan diteruskan ke antrean L2 Checker.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-semibold text-slate-800">{selectedLocation.name} ({selectedLocation.id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Saat Ini:</span>
                <span className="font-bold text-slate-800">{selectedLocation.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Baru (Usulan):</span>
                <span className={`font-bold ${selectedLocation.status === 'Active' ? 'text-slate-600' : 'text-emerald-600'}`}>
                  {selectedLocation.status === 'Active' ? 'Inactive' : 'Active'}
                </span>
              </div>
            </div>

            <form onSubmit={handleToggleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Justifikasi Pengubahan Status
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsToggleModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  Kirim Usulan Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DETAIL / GEOGRAPHIC CARD MODAL                                   */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedLocation.name}</h3>
                  <span className="font-mono text-xs text-blue-700 font-bold">{selectedLocation.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Simulated Map Visualizer Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white space-y-3 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span className="text-[11px] font-mono tracking-wider uppercase text-cyan-300">Geospatial Pinpoint</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedLocation.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-500/20 text-slate-300'
                  }`}>
                    {selectedLocation.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1 font-mono">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <span className="text-[10px] text-slate-300 block uppercase">Latitude</span>
                    <span className="text-base font-bold text-white">{selectedLocation.latitude.toFixed(6)}°</span>
                  </div>
                  <div className="p-2 bg-white/10 rounded-lg">
                    <span className="text-[10px] text-slate-300 block uppercase">Longitude</span>
                    <span className="text-base font-bold text-white">{selectedLocation.longitude.toFixed(6)}°</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
                  <span>Radius Pemantauan: <strong>{selectedLocation.radiusKm || 25} KM</strong></span>
                  <a
                    href={`https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-300 hover:text-white font-semibold transition"
                  >
                    <span>Buka Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Metadata Details */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Status Persetujuan (Approval):</span>
                  <span className="font-semibold text-slate-800">{selectedLocation.approvalStatus}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Dibuat Oleh:</span>
                  <span className="font-mono text-slate-800">{selectedLocation.createdBy || 'afcl1'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Waktu Dibuat:</span>
                  <span className="font-mono text-slate-800">{selectedLocation.createdDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Pembaruan Terakhir:</span>
                  <span className="font-mono text-slate-800">{selectedLocation.lastUpdateDate}</span>
                </div>
              </div>

              {selectedLocation.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold text-[11px] block mb-0.5">Catatan Intelijen / Alasan:</span>
                  <p className="text-[11px]">{selectedLocation.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistLocationView;
