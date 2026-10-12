import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ShieldAlert, 
  Layers, 
  FileText, 
  ExternalLink, 
  UserCheck, 
  Calendar, 
  CreditCard, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle,
  RotateCcw,
  Eye,
  Paperclip
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { FraudCase, AlertStatus, CaseUrgency } from '../../types/fms';
import { formatIDR } from '../../lib/utils';
import { UrgencyBadge, AlertStatusBadge, InvestigationStatusBadge } from '../common/Badge';
import { CreateManualAlertModal } from './CreateManualAlertModal';
import { BatchFollowUpModal } from './BatchFollowUpModal';

interface ManualAlertViewProps {
  domain: 'Fraud' | 'AML';
}

export const ManualAlertView: React.FC<ManualAlertViewProps> = ({ domain }) => {
  const { 
    fraudCases, 
    handleOpenDetail, 
    handleOpenFollowUp,
    getInvestigatorDutyStatus
  } = useFMS();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  // Modal State for Creation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Batch Selection State
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [isBatchFollowUpOpen, setIsBatchFollowUpOpen] = useState(false);

  // Filter manual cases for the current domain
  const manualCases = useMemo(() => {
    return fraudCases.filter(c => {
      // Must match category
      if (c.alertCategory !== domain) return false;
      // Must be manual alert
      if (!c.isManualAlert && c.alertSourceType !== 'Manual') return false;
      return true;
    });
  }, [fraudCases, domain]);

  // Unique sources for filter dropdown
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    manualCases.forEach(c => {
      if (c.source) set.add(c.source);
    });
    return Array.from(set);
  }, [manualCases]);

  // Filtered and Sorted list
  const filteredCases = useMemo(() => {
    return manualCases.filter(item => {
      if (statusFilter !== 'ALL' && item.alertStatus !== statusFilter) return false;
      if (urgencyFilter !== 'ALL' && item.caseUrgency !== urgencyFilter) return false;
      if (sourceFilter !== 'ALL' && item.source !== sourceFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.caseId.toLowerCase().includes(q) ||
          (item.externalCaseId && item.externalCaseId.toLowerCase().includes(q)) ||
          item.customerName.toLowerCase().includes(q) ||
          item.cif.toLowerCase().includes(q) ||
          (item.accountNumber && item.accountNumber.toLowerCase().includes(q)) ||
          (item.source && item.source.toLowerCase().includes(q)) ||
          (item.incidentDescription && item.incidentDescription.toLowerCase().includes(q)) ||
          (item.note && item.note.toLowerCase().includes(q)) ||
          (item.assignee && item.assignee.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [manualCases, statusFilter, urgencyFilter, sourceFilter, searchTerm]);

  // Stats calculation
  const totalCount = manualCases.length;
  const highSeverityCount = manualCases.filter(c => c.caseUrgency === 'High').length;
  const openCount = manualCases.filter(c => c.alertStatus === 'Open').length;
  const pendingCount = manualCases.filter(c => c.alertStatus === 'Pending Approval').length;
  const totalNominal = manualCases.reduce((sum, c) => sum + (c.transaction?.amount || 0), 0);

  // Multi-select handlers
  const handleToggleSelectAll = () => {
    if (selectedCaseIds.length === filteredCases.length) {
      setSelectedCaseIds([]);
    } else {
      setSelectedCaseIds(filteredCases.map(c => c.id || c.caseId));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedCaseIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================= */}
      {/* VIEW HEADER                                               */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              domain === 'Fraud' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Manual Alert — {domain}
                </h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                  domain === 'Fraud' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  Manual Intake
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar &amp; manajemen eskalasi kasus investigasi {domain} yang diinput secara manual dari berbagai sumber eksternal &amp; internal.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Create Manual Alert Button */}
          <button
            id="btn-open-create-manual-alert"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Manual Alert</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* KPI STAT CARDS                                            */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Total Manual Alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Manual Alert
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {totalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Semua kasus manual {domain}
          </div>
        </div>

        {/* High Severity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
            High Severity
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 mt-1">
            {highSeverityCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Prioritas penanganan kritis
          </div>
        </div>

        {/* Open & Pending Approval */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
            Open / Pending
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {openCount + pendingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {openCount} Open, {pendingCount} Pending
          </div>
        </div>

        {/* Total Evidence Amount */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Nilai Transaksi
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1 truncate">
            {formatIDR(totalNominal)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Akumulasi transaksi evidence
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* FILTERS & SEARCH BAR                                      */}
      {/* ========================================================= */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-manual-alerts"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Case ID, External ID, CIF, Nasabah, Rekening, Sumber, Kronologi..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 font-medium text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="Open">Open</option>
                <option value="Draft">Draft</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Close">Close</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 font-medium text-[11px]">Severity:</span>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">Semua Severity</option>
                <option value="High">High</option>
                <option value="Med">Med</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Source Filter */}
            {availableSources.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-slate-500 font-medium text-[11px]">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-none max-w-[160px] truncate"
                >
                  <option value="ALL">Semua Source</option>
                  {availableSources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Reset Filters */}
            {(searchTerm || statusFilter !== 'ALL' || urgencyFilter !== 'ALL' || sourceFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setUrgencyFilter('ALL');
                  setSourceFilter('ALL');
                }}
                className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1 text-[11px]"
                title="Reset Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

          </div>

        </div>

        {/* Batch Actions Bar (when cases are selected) */}
        {selectedCaseIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs animate-in fade-in duration-150">
            <div className="flex items-center space-x-2 text-blue-900 font-medium">
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded font-bold font-mono text-[10px]">
                {selectedCaseIds.length}
              </span>
              <span>Kasus manual terpilih</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsBatchFollowUpOpen(true)}
                className="px-3 py-1.5 bg-[#85712f] hover:bg-[#6f5e26] text-white font-bold rounded text-xs transition flex items-center space-x-1 cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Batch Follow Up ({selectedCaseIds.length})</span>
              </button>
              <button
                onClick={() => setSelectedCaseIds([])}
                className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MAIN DATA TABLE                                           */}
      {/* ========================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white border-b border-slate-800 text-[11px] font-semibold font-mono tracking-wider">
              <tr>
                <th className="p-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedCaseIds.length === filteredCases.length && filteredCases.length > 0}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-slate-400 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-3 text-center w-10">No</th>
                <th className="p-3 whitespace-nowrap">Case ID</th>
                <th className="p-3 whitespace-nowrap">External Case ID</th>
                <th className="p-3 whitespace-nowrap">Detection Date</th>
                <th className="p-3 whitespace-nowrap">Source</th>
                <th className="p-3 whitespace-nowrap">Customer Name &amp; CIF</th>
                <th className="p-3 whitespace-nowrap">Account / Phone</th>
                <th className="p-3 text-center whitespace-nowrap">Severity</th>
                <th className="p-3 text-right whitespace-nowrap">Total Evidence</th>
                <th className="p-3 whitespace-nowrap">Incident Description</th>
                <th className="p-3 text-center whitespace-nowrap">Status</th>
                <th className="p-3 whitespace-nowrap">Assignee</th>
                <th className="p-3 text-center w-24">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-10 text-center text-slate-400 font-sans">
                    <div className="max-w-md mx-auto space-y-2">
                      <ShieldAlert className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-700 text-sm">
                        Belum Ada Manual Alert {domain}
                      </p>
                      <p className="text-xs text-slate-400">
                        Klik tombol <strong>"Create Manual Alert"</strong> untuk menambahkan eskalasi laporan manual baru.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCases.map((item, idx) => {
                  const isChecked = selectedCaseIds.includes(item.id || item.caseId);
                  const evidenceCount = item.transactionEvidenceList?.length || (item.transaction ? 1 : 0);
                  const evidenceAmount = item.transaction?.amount || 0;

                  return (
                    <tr 
                      key={item.id || item.caseId}
                      className={`hover:bg-slate-50 transition ${
                        isChecked ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(item.id || item.caseId)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* No */}
                      <td className="p-3 text-center text-slate-500 font-sans">{idx + 1}</td>

                      {/* Case ID */}
                      <td className="p-3 font-bold text-red-600 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="hover:underline font-mono text-left"
                        >
                          {item.caseId}
                        </button>
                      </td>

                      {/* External Case ID */}
                      <td className="p-3 text-slate-700 whitespace-nowrap">
                        {item.externalCaseId ? (
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-semibold text-slate-800 text-[10px]">
                            {item.externalCaseId}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Detection Date */}
                      <td className="p-3 text-slate-600 whitespace-nowrap font-sans text-[11px]">
                        {item.detectionDate || item.identifiedOn}
                      </td>

                      {/* Source */}
                      <td className="p-3 font-sans whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold">
                          {item.source || 'Manual Intake'}
                        </span>
                      </td>

                      {/* Customer Name & CIF */}
                      <td className="p-3 font-sans">
                        <div className="font-semibold text-slate-900">{item.customerName}</div>
                        <div className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                          <span>{item.cif}</span>
                          {item.customerId && <span className="text-slate-400">({item.customerId})</span>}
                        </div>
                      </td>

                      {/* Account / Phone */}
                      <td className="p-3 font-sans">
                        <div className="font-mono font-semibold text-slate-800">
                          {item.accountNumber || item.transaction?.sourceAccount || '-'}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">{item.phoneNumber}</div>
                      </td>

                      {/* Severity */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <UrgencyBadge urgency={item.caseUrgency} />
                      </td>

                      {/* Total Evidence */}
                      <td className="p-3 text-right whitespace-nowrap font-mono font-bold text-slate-900">
                        <div>{formatIDR(evidenceAmount)}</div>
                        <div className="text-[10px] font-sans font-normal text-slate-400">
                          {evidenceCount} Trx Evidence
                        </div>
                      </td>

                      {/* Incident Description */}
                      <td className="p-3 font-sans max-w-xs">
                        <p className="line-clamp-2 text-slate-700 text-[11px]" title={item.incidentDescription}>
                          {item.incidentDescription || item.ruleName || '-'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <AlertStatusBadge status={item.alertStatus} />
                      </td>

                      {/* Assignee */}
                      <td className="p-3 font-sans text-slate-700 whitespace-nowrap font-medium">
                        <div className="flex items-center space-x-1.5">
                          <span>{item.assignee || 'Unassigned'}</span>
                          {item.assignee && getInvestigatorDutyStatus(item.assignee).isOnDuty ? (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="On Duty Saat Ini">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                              On Duty
                            </span>
                          ) : (
                            item.assignee && (
                              <span className="inline-flex items-center px-1 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-500 border border-slate-200" title="Off Duty">
                                Off Duty
                              </span>
                            )
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Detail Button */}
                          <button
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                            title="Lihat Detail Kasus"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Follow Up Button */}
                          <button
                            onClick={() => handleOpenFollowUp(item)}
                            className="px-2.5 py-1 bg-[#85712f] hover:bg-[#6f5e26] text-white rounded font-sans font-bold text-[10px] transition cursor-pointer shadow-xs"
                            title="Tindak Lanjut Kasus (Follow Up)"
                          >
                            Follow Up
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

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 font-sans">
          <span>
            Menampilkan <strong className="text-slate-800 font-mono">{filteredCases.length}</strong> dari <strong className="text-slate-800 font-mono">{manualCases.length}</strong> Manual Alert ({domain}).
          </span>
          <span className="font-semibold text-slate-700">
            Total Nilai Transaksi: {formatIDR(filteredCases.reduce((sum, c) => sum + (c.transaction?.amount || 0), 0))}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: CREATE MANUAL ALERT                                */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <CreateManualAlertModal
          defaultDomain={domain}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: BATCH FOLLOW UP                                    */}
      {/* ========================================================= */}
      {isBatchFollowUpOpen && (
        <BatchFollowUpModal
          selectedCaseIds={selectedCaseIds}
          onClose={() => {
            setIsBatchFollowUpOpen(false);
            setSelectedCaseIds([]);
          }}
        />
      )}

    </div>
  );
};
