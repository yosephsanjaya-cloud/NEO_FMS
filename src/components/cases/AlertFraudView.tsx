import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  CheckSquare, 
  Square, 
  SlidersHorizontal,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  Paperclip,
  ShieldCheck,
  Zap,
  CreditCard,
  Building,
  CheckCircle2
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { FraudCase, AlertStatus, CaseUrgency } from '../../types/fms';
import { UrgencyBadge, AlertStatusBadge, InvestigationStatusBadge } from '../common/Badge';
import { BatchFollowUpModal } from './BatchFollowUpModal';
import { BatchCloseModal } from './BatchCloseModal';
import { SmartBatchSelector, CaseSelectionCriteria } from './SmartBatchSelector';
import { formatIDR } from '../../lib/utils';

export const AlertFraudView: React.FC = () => {
  const { 
    fraudCases, 
    handleOpenDetail, 
    handleOpenFollowUp, 
    handleOpenBatchFollowUp,
    getInvestigatorDutyStatus
  } = useFMS();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');

  // Checkbox selection for Batch Action
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [selectionCriteria, setSelectionCriteria] = useState<CaseSelectionCriteria | null>(null);
  
  // Modals state
  const [showBatchFollowUpModal, setShowBatchFollowUpModal] = useState(false);
  const [showBatchCloseModal, setShowBatchCloseModal] = useState(false);

  // Trigger opening batch follow-up
  const handleTriggerBatchFollowUp = () => {
    if (selectedCaseIds.length === 0) return;
    // Ubah investigationStatus pada seluruh case yang dipilih menjadi "On Check"
    handleOpenBatchFollowUp(selectedCaseIds);
    setShowBatchFollowUpModal(true);
  };

  // Trigger opening batch close case
  const handleTriggerBatchClose = () => {
    if (selectedCaseIds.length === 0) return;
    setShowBatchCloseModal(true);
  };

  // Filter Fraud Category Cases only (System Alert) - Active Cases Queue Only
  const fraudItems = useMemo(() => {
    return fraudCases.filter(c => 
      c.alertCategory === 'Fraud' && 
      !c.isManualAlert && 
      c.alertStatus !== 'Close' && 
      c.investigationStatus !== 'Closed'
    );
  }, [fraudCases]);

  // Section B.1 Sorting Rules:
  // Urutkan data secara default berdasarkan Case Urgency High terlebih dahulu, kemudian diikuti oleh Final Risk Level & Score tertinggi.
  const filteredAndSortedCases = useMemo(() => {
    return fraudItems
      .filter(item => {
        // Status filter
        if (statusFilter !== 'ALL' && item.alertStatus !== statusFilter) return false;
        // Urgency filter
        if (urgencyFilter !== 'ALL' && item.caseUrgency !== urgencyFilter) return false;
        // Search term filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          return (
            item.caseId.toLowerCase().includes(q) ||
            item.customerName.toLowerCase().includes(q) ||
            item.cif.toLowerCase().includes(q) ||
            item.ruleBasicCode.toLowerCase().includes(q) ||
            item.ruleTemplateCode.toLowerCase().includes(q) ||
            item.deviceId.toLowerCase().includes(q) ||
            item.phoneNumber.toLowerCase().includes(q) ||
            item.assignee.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const urgencyWeight: Record<CaseUrgency, number> = { Critical: 4, High: 3, Med: 2, Low: 1 };
        const diffUrgency = urgencyWeight[b.caseUrgency] - urgencyWeight[a.caseUrgency];
        if (diffUrgency !== 0) return diffUrgency;
        // then by finalRiskScore highest
        return b.finalRiskScore - a.finalRiskScore;
      });
  }, [fraudItems, statusFilter, urgencyFilter, searchTerm]);

  // Smart Selector apply callback
  const handleApplySmartSelection = (caseIds: string[], criteria: CaseSelectionCriteria) => {
    setSelectedCaseIds(caseIds);
    setSelectionCriteria(criteria);
  };

  const handleClearSelection = () => {
    setSelectedCaseIds([]);
    setSelectionCriteria(null);
  };

  // Select all handlers
  const handleSelectAll = () => {
    if (selectedCaseIds.length === filteredAndSortedCases.length) {
      handleClearSelection();
    } else {
      const capped = filteredAndSortedCases.slice(0, 10);
      setSelectedCaseIds(capped.map(c => c.id));
      setSelectionCriteria({
        mode: 'MANUAL',
        count: capped.length,
        totalAvailable: filteredAndSortedCases.length
      });
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedCaseIds(prev => {
      const isAlreadySelected = prev.includes(id);
      const next = isAlreadySelected ? prev.filter(item => item !== id) : (prev.length < 10 ? [...prev, id] : prev);
      
      setSelectionCriteria({
        mode: 'MANUAL',
        count: next.length,
        totalAvailable: filteredAndSortedCases.length
      });
      return next;
    });
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Alert - Fraud Management</h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200">
              {filteredAndSortedCases.length} Alert Terdeteksi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar transaksi melanggar rule fraud. Terurut otomatis dari <strong>Case Urgency High</strong> dan <strong>Risk Score Tertinggi</strong>.
          </p>
        </div>

        {/* Batch Action Trigger Buttons in Header */}
        {selectedCaseIds.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              id="btn-batch-close-trigger"
              onClick={handleTriggerBatchClose}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
              title="Tutup massal kasus yang dipilih (Batch Close)"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Batch Close ({selectedCaseIds.length})</span>
            </button>

            <button
              id="btn-batch-action-trigger"
              onClick={handleTriggerBatchFollowUp}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Follow Up Selected ({selectedCaseIds.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. Smart Batch Selector Toolbar */}
      <SmartBatchSelector
        cases={filteredAndSortedCases}
        selectedCaseIds={selectedCaseIds}
        selectionCriteria={selectionCriteria}
        onApplySelection={handleApplySmartSelection}
        onClearSelection={handleClearSelection}
        maxLimit={10}
      />

      {/* Floating / Top Action Bar when Cases are Selected */}
      {selectedCaseIds.length > 0 && (
        <div 
          id="bar-batch-action-selected"
          className="bg-slate-900 text-white p-3 sm:px-5 sm:py-3.5 rounded-xl border border-slate-700 shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs sm:text-sm text-white">
                  {selectedCaseIds.length} Kasus Dicentang
                </span>
                {selectionCriteria && selectionCriteria.mode !== 'MANUAL' && (
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                    Smart Select: {selectionCriteria.mode === 'RULE_BASIC' ? `Rule ${selectionCriteria.value}` : selectionCriteria.mode === 'ACCOUNT' ? `Rek. ${selectionCriteria.value}` : `CIF ${selectionCriteria.value}`}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                Pilih aksi massal: <strong>Batch Close Case</strong> untuk resolusi instan atau <strong>Follow Up Selected</strong> untuk investigasi mendalam.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              id="btn-clear-selection"
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition cursor-pointer flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batal Pilih</span>
            </button>

            {/* Batch Close Button */}
            <button
              id="btn-batch-close-action"
              onClick={handleTriggerBatchClose}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Batch Close Case ({selectedCaseIds.length})</span>
            </button>

            {/* Batch Follow Up Button */}
            <button
              id="btn-followup-selected"
              onClick={handleTriggerBatchFollowUp}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition cursor-pointer animate-pulse"
            >
              <Layers className="w-4 h-4" />
              <span>Follow Up Selected ({selectedCaseIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Search Bar */}
        <div className="relative min-w-[280px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID Case, CIF, Nama Nasabah, Rule Code, Device ID..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
          />
        </div>

        {/* Right: Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Alert Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-500 text-[11px] font-mono">Alert Status:</span>
            <select
              id="select-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none text-xs font-medium"
            >
              <option value="ALL">Semua Kasus Aktif</option>
              <option value="Open">Open</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-500 text-[11px] font-mono">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none text-xs"
            >
              <option value="ALL">Semua Urgency</option>
              <option value="High">High Urgency</option>
              <option value="Med">Medium Urgency</option>
              <option value="Low">Low Urgency</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Table: Complete Section B.1 19 Columns */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] select-none whitespace-nowrap">
                {/* 1. Checkbox */}
                <th className="p-3 w-10 text-center">
                  <button 
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Pilih Kasus Teratas (Maks. 10 Kasus)"
                  >
                    {selectedCaseIds.length > 0 && selectedCaseIds.length === Math.min(10, filteredAndSortedCases.length) ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                {/* 2. No. */}
                <th className="p-3 text-center">No.</th>
                {/* 3. Detail */}
                <th className="p-3">Detail</th>
                {/* 4. Follow Up */}
                <th className="p-3">Follow Up</th>
                {/* 5. Case ID */}
                <th className="p-3">Case ID</th>
                {/* 6. Identified On */}
                <th className="p-3">Identified On</th>
                {/* 7. Alert Status */}
                <th className="p-3">Alert Status</th>
                {/* 8. Investigation Status */}
                <th className="p-3">Investigation Status</th>
                {/* 9. Assignee */}
                <th className="p-3">Assignee</th>
                {/* 10. Rule Template Code */}
                <th className="p-3">Rule Template Code</th>
                {/* 11. Rule Basic Code */}
                <th className="p-3">Rule Basic Code</th>
                {/* 12. Case Urgency */}
                <th className="p-3">Case Urgency</th>
                {/* 13. Final Risk Level & Score */}
                <th className="p-3">Final Risk Level &amp; Score</th>
                {/* 14. Customer Name */}
                <th className="p-3">Customer Name</th>
                {/* 15. CIF */}
                <th className="p-3">CIF</th>
                {/* 16. Device ID */}
                <th className="p-3">Device ID</th>
                {/* 17. Phone Number */}
                <th className="p-3">Phone Number</th>
                {/* 18. Aging */}
                <th className="p-3">Aging</th>
                {/* 19. Attachment */}
                <th className="p-3 text-center">Attachment</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredAndSortedCases.length === 0 ? (
                <tr>
                  <td colSpan={19} className="p-8 text-center text-slate-400 font-sans">
                    Tidak ada transaksi fraud yang sesuai dengan kriteria filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredAndSortedCases.map((item, index) => {
                  const isSelected = selectedCaseIds.includes(item.id);
                  
                  // Dynamic highlight styling based on smart selector mode
                  let rowHighlightClass = 'hover:bg-slate-50 transition';
                  if (isSelected) {
                    if (selectionCriteria?.mode === 'RULE_BASIC') {
                      rowHighlightClass = 'bg-indigo-50/80 hover:bg-indigo-50 border-l-4 border-indigo-600 transition';
                    } else if (selectionCriteria?.mode === 'ACCOUNT') {
                      rowHighlightClass = 'bg-blue-50/80 hover:bg-blue-50 border-l-4 border-blue-600 transition';
                    } else if (selectionCriteria?.mode === 'CIF') {
                      rowHighlightClass = 'bg-purple-50/80 hover:bg-purple-50 border-l-4 border-purple-600 transition';
                    } else {
                      rowHighlightClass = 'bg-amber-50/70 hover:bg-amber-50 border-l-4 border-amber-500 transition';
                    }
                  }

                  return (
                    <tr 
                      key={item.id}
                      className={rowHighlightClass}
                    >
                      {/* 1. Checkbox */}
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleToggleSelect(item.id)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className={`w-4 h-4 ${
                              selectionCriteria?.mode === 'RULE_BASIC' ? 'text-indigo-600' :
                              selectionCriteria?.mode === 'ACCOUNT' ? 'text-blue-600' :
                              selectionCriteria?.mode === 'CIF' ? 'text-purple-600' : 'text-amber-600'
                            }`} />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* 2. No. */}
                      <td className="p-3 text-slate-400 text-center font-sans">
                        {index + 1}
                      </td>

                      {/* 3. Detail (Button) */}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          id={`btn-detail-${item.caseId}`}
                          onClick={() => handleOpenDetail(item)}
                          className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-sans font-semibold text-[11px] transition shadow-xs cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>

                      {/* 4. Follow Up (Button) */}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          id={`btn-followup-${item.caseId}`}
                          onClick={() => handleOpenFollowUp(item)}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold text-[11px] transition shadow-xs cursor-pointer"
                        >
                          Follow Up
                        </button>
                      </td>

                      {/* 5. Case ID */}
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span>{item.caseId}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                      </td>

                      {/* 6. Identified On */}
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {item.identifiedOn || item.transaction?.timestamp || '-'}
                      </td>

                      {/* 7. Alert Status */}
                      <td className="p-3 whitespace-nowrap">
                        <AlertStatusBadge status={item.alertStatus} />
                      </td>

                      {/* 8. Investigation Status */}
                      <td className="p-3 whitespace-nowrap">
                        <InvestigationStatusBadge status={item.investigationStatus} />
                      </td>

                      {/* 9. Assignee */}
                      <td className="p-3 font-sans text-slate-700 whitespace-nowrap font-medium">
                        <div className="flex items-center space-x-1.5">
                          <span>{item.assignee}</span>
                          {getInvestigatorDutyStatus(item.assignee).isOnDuty ? (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="On Duty Saat Ini">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                              On Duty
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-500 border border-slate-200" title="Off Duty">
                              Off Duty
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 10. Rule Template Code */}
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {item.ruleTemplateCode}
                      </td>

                      {/* 11. Rule Basic Code */}
                      <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded ${isSelected && selectionCriteria?.mode === 'RULE_BASIC' ? 'bg-indigo-100 text-indigo-900 font-bold' : ''}`}>
                          {item.ruleBasicCode}
                        </span>
                      </td>

                      {/* 12. Case Urgency */}
                      <td className="p-3 whitespace-nowrap">
                        <UrgencyBadge urgency={item.caseUrgency} />
                      </td>

                      {/* 13. Final Risk Level & Score */}
                      <td className="p-3 whitespace-nowrap font-semibold">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          String(item.finalRiskLevel).toUpperCase() === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' :
                          String(item.finalRiskLevel).toUpperCase() === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {item.finalRiskLevel} ({item.finalRiskScore})
                        </span>
                      </td>

                      {/* 14. Customer Name */}
                      <td className="p-3 font-sans text-slate-800 whitespace-nowrap font-medium">
                        {item.customerName}
                      </td>

                      {/* 15. CIF */}
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded ${isSelected && selectionCriteria?.mode === 'CIF' ? 'bg-purple-100 text-purple-900 font-bold' : ''}`}>
                          {item.cif}
                        </span>
                      </td>

                      {/* 16. Device ID */}
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {item.deviceId}
                      </td>

                      {/* 17. Phone Number */}
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {item.phoneNumber}
                      </td>

                      {/* 18. Aging */}
                      <td className="p-3 text-slate-600 whitespace-nowrap">
                        {item.aging}
                      </td>

                      {/* 19. Attachment */}
                      <td className="p-3 text-center">
                        {item.attachments && item.attachments.length > 0 ? (
                          <span 
                            title={`${item.attachments.length} Dokumen Terlampir`}
                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-sans font-bold cursor-pointer hover:bg-slate-200"
                          >
                            <Paperclip className="w-3 h-3 mr-1 text-slate-500" />
                            {item.attachments.length}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bottom Quick Action Pill */}
      {selectedCaseIds.length > 0 && (
        <div 
          id="pill-floating-batch-action"
          className="fixed bottom-6 right-8 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-4 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-xs">
              {selectedCaseIds.length} Kasus Dipilih
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700"></div>

          <button
            id="btn-floating-clear-selection"
            onClick={handleClearSelection}
            className="text-slate-400 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            Batal
          </button>

          {/* Floating Batch Close */}
          <button
            id="btn-floating-batch-close"
            onClick={handleTriggerBatchClose}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Batch Close</span>
          </button>

          {/* Floating Batch Follow Up */}
          <button
            id="btn-floating-followup-batch"
            onClick={handleTriggerBatchFollowUp}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2 transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Follow Up ({selectedCaseIds.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Batch Follow Up Modal */}
      {showBatchFollowUpModal && (
        <BatchFollowUpModal
          selectedCaseIds={selectedCaseIds}
          onClose={() => {
            setShowBatchFollowUpModal(false);
          }}
          onSuccess={() => {
            handleClearSelection();
          }}
        />
      )}

      {/* Batch Close Modal */}
      {showBatchCloseModal && (
        <BatchCloseModal
          selectedCaseIds={selectedCaseIds}
          selectionCriteria={selectionCriteria || undefined}
          onClose={() => {
            setShowBatchCloseModal(false);
          }}
          onSuccess={() => {
            handleClearSelection();
          }}
        />
      )}

    </div>
  );
};
