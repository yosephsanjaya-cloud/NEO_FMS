import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Download, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Landmark, 
  FileText,
  Building2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { ExternalBlacklistEntry, ExternalDataSource, ExternalThreatLevel, ExternalMatchStatus } from '../../types/fms';
import { ExternalBlacklistModal } from './ExternalBlacklistModal';
import { ExternalBlacklistDetailModal } from './ExternalBlacklistDetailModal';
import { ExternalBlacklistImportModal } from './ExternalBlacklistImportModal';

export const ExternalBlacklistView: React.FC = () => {
  const { 
    externalBlacklistEntries, 
    createExternalBlacklistEntry, 
    updateExternalBlacklistEntry, 
    deleteExternalBlacklistEntry,
    bulkImportExternalBlacklist,
    setActiveTab,
    setSelectedCaseForDetail,
    fraudCases
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

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [threatFilter, setThreatFilter] = useState<string>('ALL');
  const [matchFilter, setMatchFilter] = useState<string>('ALL');

  // Modal States
  const [createEditModalOpen, setCreateEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExternalBlacklistEntry | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEntryForDetail, setSelectedEntryForDetail] = useState<ExternalBlacklistEntry | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter logic
  const filteredEntries = useMemo(() => {
    return externalBlacklistEntries.filter(entry => {
      // Source Filter
      if (sourceFilter !== 'ALL' && entry.source !== sourceFilter) return false;
      // Threat Level Filter
      if (threatFilter !== 'ALL' && entry.threatLevel !== threatFilter) return false;
      // Match Status Filter
      if (matchFilter !== 'ALL' && entry.matchStatus !== matchFilter) return false;

      // Search Term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          entry.fullName.toLowerCase().includes(q) ||
          entry.identityNumber.toLowerCase().includes(q) ||
          entry.referenceNumber.toLowerCase().includes(q) ||
          entry.source.toLowerCase().includes(q) ||
          entry.reason.toLowerCase().includes(q) ||
          (entry.accountNumber && entry.accountNumber.toLowerCase().includes(q)) ||
          (entry.matchedCif && entry.matchedCif.toLowerCase().includes(q)) ||
          (entry.matchedCustomerName && entry.matchedCustomerName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [externalBlacklistEntries, searchTerm, sourceFilter, threatFilter, matchFilter]);

  // KPI Calculations
  const totalRecords = externalBlacklistEntries.length;
  const dttotCount = externalBlacklistEntries.filter(e => e.source === 'DTTOT').length;
  const matchedCount = externalBlacklistEntries.filter(e => e.matchStatus === 'Matched With Existing CIF').length;
  const criticalThreatCount = externalBlacklistEntries.filter(e => e.threatLevel === 'CRITICAL').length;

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setCreateEditModalOpen(true);
  };

  const handleOpenEdit = (entry: ExternalBlacklistEntry) => {
    setEditingEntry(entry);
    setCreateEditModalOpen(true);
  };

  const handleOpenDetail = (entry: ExternalBlacklistEntry) => {
    setSelectedEntryForDetail(entry);
    setDetailModalOpen(true);
  };

  const handleSaveModal = (entryData: Omit<ExternalBlacklistEntry, 'id' | 'createdAt' | 'matchStatus' | 'lastCheckedAt'>) => {
    if (editingEntry) {
      updateExternalBlacklistEntry(editingEntry.id, entryData);
    } else {
      createExternalBlacklistEntry(entryData);
    }
  };

  const handleDelete = (id: string) => {
    deleteExternalBlacklistEntry(id);
    setDeleteConfirmId(null);
  };

  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      alert('Tidak ada data untuk diexport.');
      return;
    }

    const headers = [
      'ID',
      'Nama_Lengkap',
      'Tipe_Identitas',
      'Nomor_Identitas',
      'Tempat_Lahir',
      'Tanggal_Lahir',
      'Kewarganegaraan',
      'Nomor_Rekening',
      'Nama_Bank',
      'Nomor_Telepon',
      'Sumber_Data',
      'No_Referensi_SK',
      'Threat_Level',
      'Alasan_Blocking',
      'Status_Match_Bank',
      'Matched_CIF',
      'Tanggal_Diinput',
      'Dibuat_Oleh'
    ];

    const rows = filteredEntries.map(e => [
      `"${e.id}"`,
      `"${e.fullName}"`,
      `"${e.identityType}"`,
      `"${e.identityNumber}"`,
      `"${e.birthPlace || '-'}"`,
      `"${e.birthDate || '-'}"`,
      `"${e.citizenship || 'Indonesia'}"`,
      `"${e.accountNumber || '-'}"`,
      `"${e.bankName || '-'}"`,
      `"${e.phoneNumber || '-'}"`,
      `"${e.source}"`,
      `"${e.referenceNumber}"`,
      `"${e.threatLevel}"`,
      `"${(e.reason || '').replace(/"/g, '""')}"`,
      `"${e.matchStatus}"`,
      `"${e.matchedCif || '-'}"`,
      `"${e.createdAt}"`,
      `"${e.createdBy}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `external_blacklist_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNavigateToMatchedCase = (matchedCif?: string) => {
    if (!matchedCif) return;
    const targetCase = fraudCases.find(c => c.cif === matchedCif);
    if (targetCase) {
      setSelectedCaseForDetail(targetCase);
      setActiveTab(targetCase.alertCategory === 'AML' ? 'alert-aml' : 'alert-fraud');
    }
  };

  const getThreatBadge = (level: ExternalThreatLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MEDIUM':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getSourceBadge = (source: ExternalDataSource) => {
    switch (source) {
      case 'DTTOT':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Regulator (OJK/BI)':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Aparat Penegak Hukum':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Konsorsium Perbankan':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                External Blacklist Registry
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manajemen daftar terlarang dari sumber eksternal (DTTOT, Regulator, Konsorsium Perbankan, & Aparat Hukum)
              </p>
            </div>
          </div>
        </div>

        {!isL2User && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="open-import-external-modal-btn"
              onClick={() => setImportModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>📤 Import Data Massal (CSV/Excel)</span>
            </button>

            <button
              id="open-create-external-modal-btn"
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Data Eksternal</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. KPI Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Data Eksternal</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">
            {totalRecords}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Terintegrasi dengan sistem AML/FMS
          </p>
        </div>

        {/* DTTOT Listed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>DTTOT Listed (Terorisme)</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 font-mono">
            {dttotCount}
          </div>
          <p className="text-[11px] text-red-500 font-semibold mt-1">
            Mandatori Pemblokiran Seketika
          </p>
        </div>

        {/* Matched With Bank CIF */}
        <div className={`p-4 rounded-xl border shadow-xs ${
          matchedCount > 0 
            ? 'bg-red-50/70 border-red-300' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Matched With Bank CIF</span>
            <AlertTriangle className={`w-4 h-4 ${matchedCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className={`mt-2 text-2xl font-bold font-mono ${matchedCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
            {matchedCount} CIF
          </div>
          <p className={`text-[11px] font-semibold mt-1 ${matchedCount > 0 ? 'text-red-700' : 'text-slate-400'}`}>
            {matchedCount > 0 ? '🚨 Perlu Tindakan Mitigasi Segera' : '🟢 Tidak Ada Match Aktif'}
          </p>
        </div>

        {/* Critical Threats */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Critical Threat Level</span>
            <Landmark className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono">
            {criticalThreatCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            High-risk legal basis & sanctions
          </p>
        </div>
      </div>

      {/* 3. Filter & Action Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-external-blacklist-input"
              type="text"
              placeholder="Cari nama, NIK/Passport, No. SK, sumber, atau alasan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters & Export */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap justify-end">
            {/* Filter Sumber */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium whitespace-nowrap">Sumber:</span>
              <select
                id="filter-source-select"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Sumber</option>
                <option value="DTTOT">DTTOT</option>
                <option value="Regulator (OJK/BI)">Regulator (OJK/BI)</option>
                <option value="Konsorsium Perbankan">Konsorsium Perbankan</option>
                <option value="Aparat Penegak Hukum">Aparat Penegak Hukum</option>
                <option value="Internal Inquiry">Internal Inquiry</option>
              </select>
            </div>

            {/* Filter Threat */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium whitespace-nowrap">Threat:</span>
              <select
                id="filter-threat-select"
                value={threatFilter}
                onChange={(e) => setThreatFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Threat</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
              </select>
            </div>

            {/* Filter Match Status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium whitespace-nowrap">Match:</span>
              <select
                id="filter-match-select"
                value={matchFilter}
                onChange={(e) => setMatchFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Status Match</option>
                <option value="Matched With Existing CIF">🔴 Matched with CIF</option>
                <option value="No Match">🟢 No Match</option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4. Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 select-none">
              <tr>
                <th className="py-3 px-3 w-12 text-center">NO</th>
                <th className="py-3 px-4 min-w-[200px]">NAMA LENGKAP</th>
                <th className="py-3 px-4 min-w-[180px]">NO. IDENTITAS (NIK/PASSPORT)</th>
                <th className="py-3 px-4 min-w-[150px]">SUMBER DATA</th>
                <th className="py-3 px-4 min-w-[180px]">NO. REFERENSI / SK</th>
                <th className="py-3 px-3 text-center min-w-[110px]">THREAT LEVEL</th>
                <th className="py-3 px-3 text-center min-w-[130px]">TANGGAL DIINPUT</th>
                <th className="py-3 px-4 min-w-[210px]">STATUS MATCH BANK</th>
                <th className="py-3 px-3 text-center min-w-[120px]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Globe className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada data external blacklist yang sesuai filter.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, index) => {
                  const isMatched = entry.matchStatus === 'Matched With Existing CIF';
                  return (
                    <tr 
                      key={entry.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isMatched ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* 1. NO */}
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {index + 1}
                      </td>

                      {/* 2. NAMA LENGKAP */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 leading-tight">
                          {entry.fullName}
                        </div>
                        {entry.accountNumber && (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                            <span className="text-slate-400">Rek:</span>
                            <span>{entry.accountNumber}</span>
                            {entry.bankName && <span className="text-slate-400">({entry.bankName})</span>}
                          </div>
                        )}
                      </td>

                      {/* 3. NO. IDENTITAS (NIK/PASSPORT) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-semibold text-slate-800">
                            {entry.identityNumber}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                            {entry.identityType}
                          </span>
                        </div>
                        {entry.citizenship && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Warga: {entry.citizenship}
                          </div>
                        )}
                      </td>

                      {/* 4. SUMBER DATA */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getSourceBadge(entry.source)}`}>
                          {entry.source}
                        </span>
                      </td>

                      {/* 5. NO. REFERENSI / SK */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700 text-xs truncate max-w-[200px]" title={entry.referenceNumber}>
                          {entry.referenceNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={entry.reason}>
                          {entry.reason}
                        </div>
                      </td>

                      {/* 6. THREAT LEVEL */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getThreatBadge(entry.threatLevel)}`}>
                          {entry.threatLevel}
                        </span>
                      </td>

                      {/* 7. TANGGAL DIINPUT */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {entry.createdAt.slice(0, 10)}
                        <div className="text-[10px] text-slate-400">{entry.createdAt.slice(11, 19)}</div>
                      </td>

                      {/* 8. STATUS MATCH BANK */}
                      <td className="py-3 px-4">
                        {isMatched ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold text-[11px] border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                              <span>🔴 Matched With Existing CIF</span>
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <button
                                onClick={() => handleNavigateToMatchedCase(entry.matchedCif)}
                                className="font-mono font-bold text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                                title="Buka detail Alert Kasus Terkait"
                              >
                                <span>{entry.matchedCif}</span>
                                <ExternalLink className="w-3 h-3 text-red-500" />
                              </button>
                              <span className="text-slate-400 text-[10px]">({entry.matchedCustomerName})</span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>🟢 No Match</span>
                          </span>
                        )}
                      </td>

                      {/* 9. AKSI */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Detail Button */}
                          <button
                            id={`view-detail-eb-${entry.id}`}
                            onClick={() => handleOpenDetail(entry)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {!isL2User && (
                            <>
                              {/* Edit Button */}
                              <button
                                id={`edit-eb-${entry.id}`}
                                onClick={() => handleOpenEdit(entry)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition cursor-pointer"
                                title="Edit Data"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete Button */}
                              {deleteConfirmId === entry.id ? (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer"
                                  >
                                    Ya
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 bg-slate-200 rounded hover:bg-slate-300 cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  id={`delete-eb-${entry.id}`}
                                  onClick={() => setDeleteConfirmId(entry.id)}
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                                  title="Hapus Data"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Menampilkan <strong className="text-slate-800 font-mono">{filteredEntries.length}</strong> dari <strong className="text-slate-800 font-mono">{totalRecords}</strong> total entitas blacklist eksternal
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>DTTOT / Terorisme</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Regulator (OJK/BI)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Aparat Penegak Hukum</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Konsorsium Perbankan</span>
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExternalBlacklistModal
        isOpen={createEditModalOpen}
        onClose={() => {
          setCreateEditModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveModal}
        initialData={editingEntry}
      />

      <ExternalBlacklistDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedEntryForDetail(null);
        }}
        entry={selectedEntryForDetail}
        onEdit={isL2User ? undefined : (entry) => handleOpenEdit(entry)}
      />

      <ExternalBlacklistImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onBulkImport={bulkImportExternalBlacklist}
      />

    </div>
  );
};
