import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  FileCheck, 
  AlertCircle,
  Eye,
  User,
  ShieldAlert,
  ArrowRight,
  Shield,
  FileSpreadsheet,
  Plus,
  Check,
  Calendar,
  Tag,
  Hash,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { RuleApprovalTicket, RuleDomain, ListEntry } from '../../types/fms';

interface ListManagementApprovalViewProps {
  entityType?: 'CIF' | 'Source Account Number' | 'Device ID' | 'Phone Number' | string;
  domain?: 'FRAUD' | 'AML' | 'Fraud' | 'ALL' | string;
  title?: string;
}

export const ListManagementApprovalView: React.FC<ListManagementApprovalViewProps> = ({
  entityType = 'CIF',
  domain = 'FRAUD',
  title
}) => {
  const normalizedDomain = (domain || 'FRAUD').toUpperCase() === 'FRAUD' ? 'Fraud' : 'AML';
  const domainUpper = normalizedDomain.toUpperCase();
  
  const { 
    ruleApprovalTickets, 
    approveRuleTicket, 
    rejectRuleTicket,
    userRole
  } = useFMS();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [listTypeFilter, setListTypeFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<RuleApprovalTicket | null>(null);
  const [checkerNotes, setCheckerNotes] = useState<string>('Disetujui dan diverifikasi oleh L2 Checker Supervisor.');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to sessionStorage key 'listManagementApprovals' as requested in Poin 1 & 4
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const listTickets = ruleApprovalTickets.filter(t => 
          ['CIF', 'Source Account Number', 'Device ID', 'Phone Number', 'Batch Upload List'].includes(t.targetType)
        );
        sessionStorage.setItem('listManagementApprovals', JSON.stringify(listTickets));
      }
    } catch (err) {
      console.warn('Error saving listManagementApprovals to sessionStorage:', err);
    }
  }, [ruleApprovalTickets]);

  // Filter tickets for this specific entityType and domain
  const relevantTickets = useMemo(() => {
    return ruleApprovalTickets.filter(t => {
      // Check targetType
      const matchType = t.targetType === entityType || 
        (t.targetType === 'Batch Upload List' && (t.proposedData?.category === entityType || t.proposedData?.entityType === entityType));
      if (!matchType) return false;

      // Check domain
      const ticketDomain = (t.domain || '').toUpperCase();
      if (ticketDomain !== domainUpper && t.domain !== normalizedDomain) return false;

      return true;
    });
  }, [ruleApprovalTickets, entityType, domainUpper, normalizedDomain]);

  // Filtered by search, status, and action filters
  const filteredTickets = useMemo(() => {
    return relevantTickets.filter(ticket => {
      if (statusFilter !== 'ALL' && ticket.status !== statusFilter) return false;
      if (actionFilter !== 'ALL' && ticket.actionType !== actionFilter) return false;
      
      const proposed = ticket.proposedData as ListEntry | undefined;
      if (listTypeFilter !== 'ALL' && proposed?.type && proposed.type !== listTypeFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTicket = ticket.ticketNo.toLowerCase().includes(q);
        const matchesCode = ticket.targetCode.toLowerCase().includes(q);
        const matchesName = ticket.targetName.toLowerCase().includes(q);
        const matchesMaker = ticket.makerName.toLowerCase().includes(q);
        const matchesSummary = ticket.changeSummary.toLowerCase().includes(q);
        const matchesHolder = (proposed?.holderName || '').toLowerCase().includes(q);
        const matchesReason = (proposed?.reason || '').toLowerCase().includes(q);
        const matchesSource = (proposed?.source || '').toLowerCase().includes(q);
        
        return matchesTicket || matchesCode || matchesName || matchesMaker || matchesSummary || matchesHolder || matchesReason || matchesSource;
      }
      return true;
    });
  }, [relevantTickets, statusFilter, actionFilter, listTypeFilter, searchTerm]);

  // Statistics for this specific entity queue
  const pendingCount = useMemo(() => relevantTickets.filter(t => t.status === 'PENDING').length, [relevantTickets]);
  const approvedCount = useMemo(() => relevantTickets.filter(t => t.status === 'APPROVED').length, [relevantTickets]);
  const rejectedCount = useMemo(() => relevantTickets.filter(t => t.status === 'REJECTED').length, [relevantTickets]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleApprove = (ticket: RuleApprovalTicket) => {
    const checkerName = user ? `${user.fullName} (${user.group || user.role})` : 'L2 Checker Supervisor';
    approveRuleTicket(ticket.id, checkerName, checkerNotes);
    showToast(`Tiket ${ticket.ticketNo} berhasil DISETUJUI. Entitas ${ticket.targetCode} kini aktif di produksi.`);
    setSelectedTicket(null);
  };

  const handleReject = (ticket: RuleApprovalTicket) => {
    const rejectorName = user ? `${user.fullName} (${user.group || user.role})` : 'L2 Checker Supervisor';
    const note = rejectReason.trim() || 'Ditolak oleh Checker L2: Data tidak memenuhi kepatuhan risiko.';
    rejectRuleTicket(ticket.id, rejectorName, note);
    showToast(`Tiket ${ticket.ticketNo} berhasil DITOLAK.`);
    setIsRejectModalOpen(false);
    setSelectedTicket(null);
    setRejectReason('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Exact Breadcrumb (Poin 3) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1.5">
            <span className="hover:text-slate-800 transition">List Management</span>
            <span>/</span>
            <span className="hover:text-slate-800 transition">{entityType}</span>
            <span>/</span>
            <span className={`font-bold ${domainUpper === 'FRAUD' ? 'text-rose-600' : 'text-indigo-600'}`}>{domainUpper}</span>
            <span>/</span>
            <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">Approval Queue</span>
          </div>
          
          {/* Exact Title Header (Poin 3) */}
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <span>Antrean Persetujuan List Management - {entityType} ({normalizedDomain})</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-mono font-bold shadow-xs">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Modul pengawasan Checker L2 untuk memverifikasi, meninjau rincian entitas baru/perubahan, dan menyetujui (Approve) atau menolak (Reject) pendaftaran entitas List Management.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Menunggu Persetujuan</span>
            <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">{pendingCount}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Tiket status PENDING</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Disetujui (Approved)</span>
            <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{approvedCount}</span>
            <span className="text-[10px] text-emerald-600 mt-0.5 block">Aktif di produksi</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Ditolak (Rejected)</span>
            <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">{rejectedCount}</span>
            <span className="text-[10px] text-rose-500 mt-0.5 block">Dibatalkan Checker</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Pengajuan {entityType}</span>
            <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">{relevantTickets.length}</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Seluruh riwayat tiket</span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            domainUpper === 'FRAUD' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
          }`}>
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">Status:</span>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved ({approvedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected ({rejectedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({relevantTickets.length})
          </button>
        </div>

        {/* Search & List Type Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={listTypeFilter}
            onChange={e => setListTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua List Type</option>
            <option value="Blacklist">Blacklist</option>
            <option value="Watchlist">Watchlist</option>
            <option value="Whitelist">Whitelist</option>
          </select>

          <div className="relative w-full md:w-64 text-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={`Cari tiket, nilai ${entityType}, maker...`}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Approval Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
              <FileCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak Ada Antrean Tiket Approval</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Saat ini tidak ada tiket pengajuan List Management untuk <strong>{entityType} ({normalizedDomain})</strong> yang cocok dengan filter yang dipilih.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="px-4 py-3.5">No. Tiket & Tanggal</th>
                  <th className="px-4 py-3.5">Tipe List & Entitas</th>
                  <th className="px-4 py-3.5">Nilai & Pemilik</th>
                  <th className="px-4 py-3.5">Pengusul (Maker)</th>
                  <th className="px-4 py-3.5">Alasan / Catatan Pengajuan</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map(ticket => {
                  const proposed = ticket.proposedData as ListEntry | undefined;
                  const listType = proposed?.type || 'Blacklist';
                  
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition group">
                      
                      {/* Ticket No & Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ticket.ticketNo}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{ticket.createdAt}</span>
                        </div>
                      </td>

                      {/* List Type & Entity */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            listType === 'Blacklist' 
                              ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                              : listType === 'Watchlist'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {listType}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200">
                            {entityType}
                          </span>
                        </div>
                        {proposed?.riskWeight !== undefined && (
                          <div className="text-[10px] text-slate-500 mt-1 font-medium">
                            Risk Weight: <strong className="text-slate-800">{proposed.riskWeight}/100</strong>
                          </div>
                        )}
                      </td>

                      {/* Value & Holder */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-slate-900 text-xs select-all">
                          {ticket.targetCode}
                        </div>
                        {proposed?.holderName && (
                          <div className="text-[11px] text-slate-600 font-medium truncate max-w-[200px] mt-0.5" title={proposed.holderName}>
                            {proposed.holderName}
                          </div>
                        )}
                      </td>

                      {/* Maker Info */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ticket.makerName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {ticket.makerRole}
                        </div>
                      </td>

                      {/* Reason / Change Summary */}
                      <td className="px-4 py-3.5 max-w-[260px]">
                        <div className="line-clamp-2 text-slate-600 text-xs" title={ticket.makerNotes || ticket.changeSummary}>
                          {ticket.makerNotes || ticket.changeSummary}
                        </div>
                        {proposed?.source && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                            Sumber: <span className="font-medium text-slate-600">{proposed.source}</span>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {ticket.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>PENDING</span>
                          </span>
                        )}
                        {ticket.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>APPROVED</span>
                          </span>
                        )}
                        {ticket.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>REJECTED</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {ticket.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setCheckerNotes('Disetujui dan diverifikasi oleh L2 Checker Supervisor.');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition shadow-xs flex items-center gap-1 cursor-pointer"
                              title="Review & Approve/Reject"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                            <button
                              onClick={() => handleApprove(ticket)}
                              className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 transition cursor-pointer"
                              title="Quick Approve"
                            >
                              <Check className="w-4 h-4 text-emerald-600" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* REVIEW & DETAIL MODAL (SIDE-BY-SIDE / DETAIL BREAKDOWN) */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 rounded-t-3xl">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <span>List Management Review</span>
                  <span>•</span>
                  <span>{selectedTicket.ticketNo}</span>
                  <span>•</span>
                  <span className={`font-bold ${domainUpper === 'FRAUD' ? 'text-rose-600' : 'text-indigo-600'}`}>{domainUpper}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Verifikasi Pendaftaran {entityType}: {selectedTicket.targetCode}</span>
                </h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Ticket Meta Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">No. Tiket</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">{selectedTicket.ticketNo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Tipe Aksi</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">{selectedTicket.actionType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Pengusul (Maker)</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedTicket.makerName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Tanggal Submit</span>
                  <span className="font-medium text-slate-600 mt-0.5 block">{selectedTicket.createdAt}</span>
                </div>
              </div>

              {/* Entity Proposed Data Details */}
              {selectedTicket.proposedData && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Rincian Entitas yang Diajukan</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Tipe List</span>
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold mt-1 ${
                          selectedTicket.proposedData.type === 'Blacklist'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : selectedTicket.proposedData.type === 'Watchlist'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {selectedTicket.proposedData.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Kategori Entitas</span>
                        <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{entityType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Nilai Entitas ({entityType})</span>
                        <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block select-all">{selectedTicket.targetCode}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Nama Pemilik / Alias</span>
                        <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{selectedTicket.proposedData.holderName || '-'}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Bobot Risiko (Risk Weight)</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono font-bold text-sm text-slate-900">{selectedTicket.proposedData.riskWeight || 0}/100</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            (selectedTicket.proposedData.riskWeight || 0) >= 80 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {(selectedTicket.proposedData.riskWeight || 0) >= 80 ? 'High Risk' : 'Medium Risk'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Sumber Data / Laporan</span>
                        <span className="font-medium text-slate-700 text-xs mt-0.5 block">{selectedTicket.proposedData.source || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Masa Berlaku (Expiry Date)</span>
                        <span className="font-medium text-slate-700 text-xs mt-0.5 block">{selectedTicket.proposedData.expiryDate || 'Permanent (No Expiry)'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase block">Cakupan Rule</span>
                        <span className="font-medium text-slate-700 text-xs mt-0.5 block">
                          {selectedTicket.proposedData.applyToAllRules ? 'Semua Rule (Global Match)' : 'Rule Spesifik'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reason Box */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                    <span className="text-[11px] font-bold text-amber-900 block mb-1">Alasan Penambahan / Catatan Maker:</span>
                    <p className="text-xs text-amber-950 leading-relaxed">
                      {selectedTicket.makerNotes || selectedTicket.proposedData.reason || 'Tidak ada catatan tambahan dari maker.'}
                    </p>
                  </div>
                </div>
              )}

              {/* L2 Checker Decision Notes (If Pending) */}
              {selectedTicket.status === 'PENDING' ? (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Catatan Verifikasi Checker (L2 Supervisor):</span>
                  </label>
                  <textarea
                    rows={2}
                    value={checkerNotes}
                    onChange={e => setCheckerNotes(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Masukkan catatan persetujuan untuk audit trail..."
                  />
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase block">Hasil Verifikasi Checker</span>
                  <div className="font-semibold text-slate-800 text-xs">
                    Oleh: {selectedTicket.checkerName || 'Checker Supervisor'} • {selectedTicket.reviewedAt || selectedTicket.createdAt}
                  </div>
                  {selectedTicket.checkerNotes && (
                    <div className="text-slate-600 text-xs mt-1 italic">
                      "{selectedTicket.checkerNotes}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-3xl">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
              >
                Tutup
              </button>

              {selectedTicket.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Tolak Pengajuan</span>
                  </button>

                  <button
                    onClick={() => handleApprove(selectedTicket)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui (Approve)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REJECT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isRejectModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">Konfirmasi Penolakan Tiket</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menolak pengajuan <strong>{selectedTicket.ticketNo}</strong> untuk entitas <strong>{selectedTicket.targetCode}</strong>?
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700">Alasan Penolakan (Wajib):</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Contoh: Dokumen pendukung belum lengkap atau data identitas terindikasi false positive."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleReject(selectedTicket)}
                disabled={!rejectReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-xs cursor-pointer"
              >
                Ya, Tolak Tiket
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
