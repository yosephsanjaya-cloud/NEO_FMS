import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Power, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Eye, 
  Paperclip, 
  Database, 
  Braces, 
  Zap, 
  Copy, 
  Check, 
  X, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { EmailTemplate } from '../../types/systemParameter';
import { EmailTemplateFormModal } from '../../components/system-parameter/EmailTemplateFormModal';
import { cn } from '../../lib/utils';

export const EmailTemplatePage: React.FC = () => {
  const { 
    emailTemplates, 
    addEmailTemplate, 
    updateEmailTemplate, 
    deleteEmailTemplate, 
    toggleEmailTemplateStatus,
    setActiveTab 
  } = useFMS();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  // Quick Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Delete Confirmation State
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return emailTemplates.filter(template => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        template.id.toLowerCase().includes(q) ||
        template.templateName.toLowerCase().includes(q) ||
        template.emailSubject.toLowerCase().includes(q) ||
        template.emailTo.toLowerCase().includes(q)
      );

      const matchesDuration = durationFilter === 'ALL' || template.monitoringDuration === durationFilter;
      const matchesStatus = statusFilter === 'ALL' || template.status === statusFilter;

      return matchesSearch && matchesDuration && matchesStatus;
    });
  }, [emailTemplates, searchQuery, durationFilter, statusFilter]);

  // Statistics KPIs
  const totalCount = emailTemplates.length;
  const activeCount = emailTemplates.filter(t => t.status === 'Active').length;
  const realtimeCount = emailTemplates.filter(t => t.monitoringDuration === 'Realtime' || t.monitoringDuration === '5 Minutes').length;
  const holidayExcludedCount = emailTemplates.filter(t => t.excludeHoliday).length;

  // Handlers
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (template: EmailTemplate) => {
    setModalMode('edit');
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = (templateData: Omit<EmailTemplate, 'id' | 'createdDate' | 'updatedDate'>) => {
    if (modalMode === 'add') {
      addEmailTemplate(templateData);
    } else if (selectedTemplate) {
      updateEmailTemplate(selectedTemplate.id, templateData);
    }
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      deleteEmailTemplate(templateToDelete.id);
      setTemplateToDelete(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDurationFilter('ALL');
    setStatusFilter('ALL');
  };

  // Render dummy variable substituted body for Preview modal
  const renderPreviewContent = (template: EmailTemplate) => {
    let html = template.emailBody;
    const sampleReplacements: { [key: string]: string } = {
      '$Case_ID$': 'CAS-20260903-09412',
      '$Customer_Name$': 'Yoseph Sanjaya Gunawan',
      '$CIF$': 'CIF-0098231',
      '$Rule_Name$': 'Impossible Travel Detection',
      '$Rule_Code$': 'RB-VEL-01',
      '$Risk_Score$': '92.5',
      '$Risk_Level$': 'HIGH',
      '$Transaction_Amount$': 'Rp 45.000.000',
      '$Tx_Location_1$': 'ATM Thamrin Jakarta',
      '$Tx_Location_2$': 'POS Tunjungan Surabaya',
      '$Time_Diff$': '18 Menit',
      '$Timestamp$': new Date().toLocaleString('id-ID'),
      '$Card_Number$': '4218-76**-****-9821',
      '$Merchant_1$': 'ATM Center GI Jakarta',
      '$Merchant_2$': 'Electronic City Surabaya',
      '$City_1$': 'Jakarta Pusat',
      '$City_2$': 'Surabaya',
      '$Aggregate_Amount$': 'Rp 780.000.000',
      '$Tx_Count$': '14',
      '$Identity_Number$': '3171028391020002'
    };

    Object.keys(sampleReplacements).forEach(tag => {
      const regex = new RegExp(tag.replace(/\$/g, '\\$'), 'g');
      html = html.replace(regex, `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 4px; border-radius: 4px; font-weight: bold;">${sampleReplacements[tag]}</span>`);
    });

    return html;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <span 
              onClick={() => setActiveTab('dashboard')} 
              className="hover:text-blue-600 cursor-pointer font-medium"
            >
              System Parameter
            </span>
            <span>/</span>
            <span className="text-slate-800 font-bold">Email Template</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-600" />
            <span>Email Template Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pusat konfigurasi template notifikasi email otomatis, scheduler pemantauan, sumber tabel SQL, pemetaan variabel replacer, dan post-action FMS.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-add-email-template"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Record</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Templates */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Templates</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-400 font-medium">Record terdaftar</span>
          </div>
        </div>

        {/* Active Schedulers */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Schedulers</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-emerald-600">{activeCount}</span>
            <span className="text-xs text-slate-400 font-medium">dari {totalCount} aktif</span>
          </div>
        </div>

        {/* Realtime / Spike Triggers */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">High-Freq &amp; Realtime</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-purple-700">{realtimeCount}</span>
            <span className="text-xs text-slate-400 font-medium">&le; 5 menit trigger</span>
          </div>
        </div>

        {/* Holiday Excluded */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Exclude Holiday Active</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-amber-700">{holidayExcludedCount}</span>
            <span className="text-xs text-slate-400 font-medium">Libur dilewati</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan Template Name, ID, Subjek, atau Penerima..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
            />
          </div>

          {/* Monitoring Duration Filter */}
          <div className="w-full md:w-56">
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
            >
              <option value="ALL">Semua Monitoring Duration</option>
              <option value="Realtime">Realtime</option>
              <option value="5 Minutes">5 Minutes</option>
              <option value="15 Minutes">15 Minutes</option>
              <option value="Daily 08:00">Daily 08:00</option>
              <option value="Daily 17:00">Daily 17:00</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition shrink-0"
            title="Reset Filter"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">Atomic Lookup Table</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 font-mono">
              {filteredTemplates.length} Records
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Kolom flat grid: No, Action, ID, Template Name, Duration, Start Date/Time, Exclude Holiday, Status
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 text-center w-12 border-r border-slate-200">No</th>
                <th className="py-3 px-3 text-center w-36 border-r border-slate-200">Action</th>
                <th className="py-3 px-3 w-28 border-r border-slate-200">ID</th>
                <th className="py-3 px-4 border-r border-slate-200 min-w-[200px]">Email Template Name</th>
                <th className="py-3 px-3 border-r border-slate-200 w-36">Monitoring Duration</th>
                <th className="py-3 px-3 border-r border-slate-200 w-28 text-center">Start Date</th>
                <th className="py-3 px-3 border-r border-slate-200 w-24 text-center">Start Time</th>
                <th className="py-3 px-3 border-r border-slate-200 w-28 text-center">Exclude Holiday</th>
                <th className="py-3 px-3 text-center w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTemplates.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                  {/* 1. No */}
                  <td className="py-3 px-3 text-center font-mono text-slate-500 border-r border-slate-100">
                    {idx + 1}
                  </td>

                  {/* 2. Action (Edit, Delete, Activation Toggle) */}
                  <td className="py-3 px-3 text-center border-r border-slate-100">
                    <div className="flex items-center justify-center space-x-1">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(item)}
                        title="Preview Konten Email"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Template"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Activation Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleEmailTemplateStatus(item.id)}
                        title={item.status === 'Active' ? 'Nonaktifkan Template' : 'Aktifkan Template'}
                        className={cn(
                          "p-1.5 rounded-lg transition",
                          item.status === 'Active'
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setTemplateToDelete(item)}
                        title="Hapus Template"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* 3. ID */}
                  <td className="py-3 px-3 font-mono font-bold text-blue-700 border-r border-slate-100">
                    {item.id}
                  </td>

                  {/* 4. Email Template Name */}
                  <td className="py-3 px-4 border-r border-slate-100">
                    <div className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {item.templateName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs" title={item.emailSubject}>
                      {item.emailSubject}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Database className="w-2.5 h-2.5 text-blue-500" />
                        {item.tableReferences?.length || 0} Tables
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5">
                        <Braces className="w-2.5 h-2.5 text-purple-500" />
                        {item.replacerMappings?.length || 0} Tags
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5">
                        <Paperclip className="w-2.5 h-2.5 text-amber-500" />
                        {item.attachments?.length || 0} Reports
                      </span>
                    </div>
                  </td>

                  {/* 5. Monitoring Duration */}
                  <td className="py-3 px-3 border-r border-slate-100">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono inline-block border",
                      item.monitoringDuration === 'Realtime' 
                        ? "bg-rose-50 text-rose-700 border-rose-200 font-bold" 
                        : item.monitoringDuration === '5 Minutes'
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    )}>
                      {item.monitoringDuration}
                    </span>
                  </td>

                  {/* 6. Start Date */}
                  <td className="py-3 px-3 text-center font-mono text-slate-700 border-r border-slate-100">
                    {item.startDate}
                  </td>

                  {/* 7. Start Time */}
                  <td className="py-3 px-3 text-center font-mono text-slate-700 border-r border-slate-100">
                    {item.startTime}
                  </td>

                  {/* 8. Exclude Holiday */}
                  <td className="py-3 px-3 text-center border-r border-slate-100">
                    {item.excludeHoliday ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        YA (EXCLUDE)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        TIDAK
                      </span>
                    )}
                  </td>

                  {/* 9. Status Badge */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleEmailTemplateStatus(item.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 transition shadow-2xs",
                        item.status === 'Active'
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                      )}
                    >
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        item.status === 'Active' ? "bg-emerald-600 animate-pulse" : "bg-slate-400"
                      )}></span>
                      <span>{item.status}</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTemplates.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Mail className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Tidak ada template email yang cocok dengan filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Live Dispatch Preview: {previewTemplate.templateName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {previewTemplate.id} &bull; Interval: {previewTemplate.monitoringDuration}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Header Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex">
                  <span className="w-20 font-semibold text-slate-500">To:</span>
                  <span className="font-mono text-slate-800">{previewTemplate.emailTo}</span>
                </div>
                {previewTemplate.emailCc && (
                  <div className="flex">
                    <span className="w-20 font-semibold text-slate-500">CC:</span>
                    <span className="font-mono text-slate-700">{previewTemplate.emailCc}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-20 font-semibold text-slate-500">Subject:</span>
                  <span className="font-bold text-slate-900">{previewTemplate.emailSubject}</span>
                </div>
              </div>

              {/* Rendered HTML Body */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs text-slate-500">
                  <span className="font-semibold">HTML Body Preview (Variabel Tersubstitusi):</span>
                  <span className="text-[11px] text-blue-600 font-mono font-medium">Highlight biru = data dinamis dari SQL query</span>
                </div>
                <div 
                  className="p-4 rounded-xl border border-slate-200 bg-white min-h-[200px] shadow-inner text-slate-800 text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderPreviewContent(previewTemplate) }}
                />
              </div>

              {/* Attachments list if any */}
              {previewTemplate.attachments && previewTemplate.attachments.length > 0 && (
                <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-200 text-xs space-y-1">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                    Lampiran Laporan Otomatis ({previewTemplate.attachments.length}):
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {previewTemplate.attachments.map(att => (
                      <span key={att.id} className="px-2.5 py-1 rounded bg-white border border-purple-200 text-[11px] font-semibold text-purple-800">
                        {att.reportName} ({att.renderAs})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Data disimulasikan dari alert aktif terkini di database FMS.
              </span>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-3 rounded-xl bg-red-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Template</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus email template <strong>{templateToDelete.templateName}</strong> (ID: {templateToDelete.id})? Scheduler otomatis yang menggunakan template ini akan dihentikan.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setTemplateToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                Ya, Hapus Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabbed Add / Edit Modal */}
      <EmailTemplateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTemplate}
        initialData={selectedTemplate}
        mode={modalMode}
      />
    </div>
  );
};
