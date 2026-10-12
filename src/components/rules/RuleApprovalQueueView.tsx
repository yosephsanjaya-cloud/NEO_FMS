import React, { useState, useMemo } from 'react';
import { 
  GitCompare, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Layers, 
  FileCheck, 
  AlertCircle,
  Eye,
  User,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Check
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { RuleApprovalTicket, RuleDomain } from '../../types/fms';
import { TicketComparisonModal } from './TicketComparisonModal';

interface RuleApprovalQueueViewProps {
  targetType?: string;
  ruleType?: string;
  domain?: RuleDomain | 'ALL' | string;
  title?: string;
}

export const RuleApprovalQueueView: React.FC<RuleApprovalQueueViewProps> = ({
  targetType,
  ruleType,
  domain,
  title
}) => {
  const actualTargetType = targetType || ruleType || 'Template';
  const { 
    ruleApprovalTickets, 
    approveRuleTicket, 
    rejectRuleTicket 
  } = useFMS();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [selectedTicketForReview, setSelectedTicketForReview] = useState<RuleApprovalTicket | null>(null);

  // Filter tickets for this targetType and domain
  const relevantTickets = useMemo(() => {
    return ruleApprovalTickets.filter(t => {
      if (t.targetType !== actualTargetType) return false;
      if (domain && domain !== 'ALL' && t.domain !== domain) return false;
      return true;
    });
  }, [ruleApprovalTickets, actualTargetType, domain]);


  // Filtered by search & filters
  const filteredTickets = useMemo(() => {
    return relevantTickets.filter(ticket => {
      if (statusFilter !== 'ALL' && ticket.status !== statusFilter) return false;
      if (actionFilter !== 'ALL' && ticket.actionType !== actionFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          ticket.ticketNo.toLowerCase().includes(q) ||
          ticket.targetCode.toLowerCase().includes(q) ||
          ticket.targetName.toLowerCase().includes(q) ||
          ticket.makerName.toLowerCase().includes(q) ||
          ticket.changeSummary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [relevantTickets, statusFilter, actionFilter, searchTerm]);

  // Statistics
  const pendingCount = relevantTickets.filter(t => t.status === 'PENDING').length;
  const approvedCount = relevantTickets.filter(t => t.status === 'APPROVED').length;
  const rejectedCount = relevantTickets.filter(t => t.status === 'REJECTED').length;

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">CREATE</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">UPDATE</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-300">DELETE</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>PENDING</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <span>Rule Engine</span>
            <span>/</span>
            <span>Rule {targetType}</span>
            <span>/</span>
            <span className={domain === 'Fraud' ? 'text-red-600 font-bold' : 'text-amber-700 font-bold'}>{domain}</span>
            <span>/</span>
            <span className="text-slate-800 font-bold">Approval Queue</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <span>Antrean Persetujuan Rule {targetType} ({domain})</span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-mono font-bold shadow-xs">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Modul pengawasan Checker untuk meninjau, membandingkan perubahaan (side-by-side diff), dan menyetujui tiket usulan Maker.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Menunggu Persetujuan</span>
            <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Disetujui (Approved)</span>
            <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{approvedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Ditolak (Rejected)</span>
            <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">{rejectedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari nomor tiket, kode rule, nama rule, atau nama maker..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="PENDING">Status: PENDING</option>
            <option value="ALL">Semua Status</option>
            <option value="APPROVED">Status: APPROVED</option>
            <option value="REJECTED">Status: REJECTED</option>
          </select>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Tiket No</th>
                <th className="py-3.5 px-3">Aksi</th>
                <th className="py-3.5 px-4">Target Rule</th>
                <th className="py-3.5 px-4">Pemohon (Maker)</th>
                <th className="py-3.5 px-4">Ringkasan Perubahan</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Checker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                    <p className="font-semibold text-slate-700">Tidak ada tiket pengajuan dalam antrean ini.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Semua usulan perubahan telah diproses oleh Checker.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition group">
                    
                    {/* Tiket No */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {ticket.ticketNo}
                      <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                        {ticket.createdAt}
                      </span>
                    </td>

                    {/* Action Type */}
                    <td className="py-3.5 px-3">
                      {getActionBadge(ticket.actionType)}
                    </td>

                    {/* Target Rule */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-blue-700 font-mono text-xs">{ticket.targetCode}</div>
                      <div className="text-slate-800 font-medium text-[11px] truncate max-w-xs">{ticket.targetName}</div>
                    </td>

                    {/* Maker */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{ticket.makerName}</div>
                      <div className="text-[10px] text-slate-500">{ticket.makerRole}</div>
                    </td>

                    {/* Change Summary */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                      <p className="text-[11px] line-clamp-2">{ticket.changeSummary}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      {getStatusBadge(ticket.status)}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`btn-review-${ticket.id}`}
                          onClick={() => setSelectedTicketForReview(ticket)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>Review &amp; Diff</span>
                        </button>

                        {ticket.status === 'PENDING' && (
                          <button
                            id={`btn-quick-approve-${ticket.id}`}
                            onClick={() => approveRuleTicket(ticket.id, 'Hendrawan Kusuma (L2 Checker)', 'Disetujui via Quick Action.')}
                            title="Quick Approve"
                            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Modal */}
      {selectedTicketForReview && (
        <TicketComparisonModal
          ticket={selectedTicketForReview}
          onClose={() => setSelectedTicketForReview(null)}
        />
      )}

    </div>
  );
};
