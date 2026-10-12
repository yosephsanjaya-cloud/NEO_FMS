import React, { useState } from 'react';
import { useFMS } from '../../context/FMSContext';
import {
  Cpu,
  Mail,
  Zap,
  Clock,
  Layers,
  Database,
  ShieldAlert,
  Server,
  Save,
  RefreshCw,
  Table,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  Info,
  Edit2,
  Search,
  Filter,
  Download,
  Check,
  X,
  PlayCircle,
  PauseCircle,
  Sliders,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { 
  UserDefinedParameterConfig, 
  UserDefinedParameterItem 
} from '../../types/systemParameter';

type BottomTab = 'queue-memory' | 'delay-timers' | 'rules-logs';
type ViewMode = 'card' | 'grid';

export const UserDefinedParameterPage: React.FC = () => {
  const { 
    userDefinedParameters, 
    userDefinedParameterItems,
    updateUserDefinedParameters, 
    updateUserDefinedParameterItem,
    resetUserDefinedParameters 
  } = useFMS();

  // View Mode: 'card' (modern grouped) vs 'grid' (dynamic flat table legacy style)
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('queue-memory');

  // Form State cloned from Context
  const [formState, setFormState] = useState<UserDefinedParameterConfig>(userDefinedParameters);

  // Safety Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSavePayload, setPendingSavePayload] = useState<{
    data: Partial<UserDefinedParameterConfig>;
    reason: string;
    summary: string[];
  } | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Grid View Filters & Search
  const [gridSearch, setGridSearch] = useState('');
  const [gridCategoryFilter, setGridCategoryFilter] = useState<string>('ALL');

  // Inline Edit Modal for Grid View
  const [editingGridItem, setEditingGridItem] = useState<UserDefinedParameterItem | null>(null);
  const [editItemValue, setEditItemValue] = useState('');
  const [editItemActive, setEditItemActive] = useState(true);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Prepare Save with Confirmation Modal
  const handleInitiateSave = (customReason?: string) => {
    // Generate human-readable summary of key changes
    const summaryItems: string[] = [];
    if (formState.jobTypeQueue !== userDefinedParameters.jobTypeQueue) {
      summaryItems.push(`Mode Screening Antrean: ${userDefinedParameters.jobTypeQueue} ➔ ${formState.jobTypeQueue}`);
    }
    if (formState.emailToFraud !== userDefinedParameters.emailToFraud) {
      summaryItems.push(`EmailTo Fraud diperbarui: ${formState.emailToFraud}`);
    }
    if (formState.emailToAml !== userDefinedParameters.emailToAml) {
      summaryItems.push(`EmailTo AML diperbarui: ${formState.emailToAml}`);
    }
    if (formState.limitQueueOnThread !== userDefinedParameters.limitQueueOnThread) {
      summaryItems.push(`Limit Queue on Thread: ${userDefinedParameters.limitQueueOnThread} ➔ ${formState.limitQueueOnThread}`);
    }
    if (formState.maximumLimitQueueOnMemory !== userDefinedParameters.maximumLimitQueueOnMemory) {
      summaryItems.push(`Max Limit on Memory: ${userDefinedParameters.maximumLimitQueueOnMemory} ➔ ${formState.maximumLimitQueueOnMemory}`);
    }
    if (formState.onOffEodLog !== userDefinedParameters.onOffEodLog) {
      summaryItems.push(`ON/OFF EOD Log: ${userDefinedParameters.onOffEodLog ? 'ON' : 'OFF'} ➔ ${formState.onOffEodLog ? 'ON' : 'OFF'}`);
    }
    if (summaryItems.length === 0) {
      summaryItems.push('Pembaruan parameter variabel umum & status toggle');
    }

    setPendingSavePayload({
      data: formState,
      reason: customReason || 'Pembaruan User Defined Parameter (UDP) oleh Security Administrator',
      summary: summaryItems
    });
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    if (!pendingSavePayload) return;
    updateUserDefinedParameters(pendingSavePayload.data, pendingSavePayload.reason);
    setShowConfirmModal(false);
    setPendingSavePayload(null);
    showToast('Parameter changes updated successfully! Konfigurasi UDP dan antrean screening telah diterapkan.');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh parameter UDP ke konfigurasi default sistem?')) {
      resetUserDefinedParameters();
      setFormState(userDefinedParameters);
      showToast('Parameter UDP berhasil di-reset ke nilai default awal.', 'info');
    }
  };

  // Grid Item Edit Handlers
  const handleOpenEditGridItem = (item: UserDefinedParameterItem) => {
    setEditingGridItem(item);
    setEditItemValue(item.parameterValue);
    setEditItemActive(item.isActive);
  };

  const handleSaveGridItem = () => {
    if (!editingGridItem) return;
    updateUserDefinedParameterItem(editingGridItem.id, {
      parameterValue: editItemValue,
      isActive: editItemActive
    });
    setEditingGridItem(null);
    showToast(`Parameter ${editingGridItem.parameterKey} updated successfully!`);
  };

  // Export Grid to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Parameter Key', 'Parameter Name', 'Category', 'Data Type', 'Value', 'Status Active', 'Updated Date', 'Updated By'];
    const rows = userDefinedParameterItems.map(item => [
      item.id,
      `"${item.parameterKey}"`,
      `"${item.parameterName}"`,
      `"${item.category}"`,
      item.dataType,
      `"${item.parameterValue}"`,
      item.isActive ? 'Active' : 'Inactive',
      item.updatedDate,
      item.updatedBy
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FMS_UDP_Parameters_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data parameter berhasil diekspor ke file CSV.');
  };

  // Filtered Grid Items
  const filteredGridItems = userDefinedParameterItems.filter(item => {
    const matchSearch = item.parameterKey.toLowerCase().includes(gridSearch.toLowerCase()) ||
      item.parameterName.toLowerCase().includes(gridSearch.toLowerCase()) ||
      item.parameterValue.toLowerCase().includes(gridSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(gridSearch.toLowerCase());
    const matchCategory = gridCategoryFilter === 'ALL' || item.category === gridCategoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="udp-toast-notification"
          className={`fixed top-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toastType === 'success' 
              ? 'bg-emerald-900 text-emerald-50 border-emerald-700' 
              : toastType === 'info'
                ? 'bg-blue-900 text-blue-50 border-blue-700'
                : 'bg-rose-900 text-rose-50 border-rose-700'
          }`}
        >
          {toastType === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastType === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
          {toastType === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-xs text-slate-400 hover:text-white ml-2 underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-100 text-amber-800 border border-amber-200">
              v1.14 • User Defined Parameter (UDP)
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Terakhir diubah: <strong className="text-slate-700">{userDefinedParameters.lastUpdated}</strong> oleh <strong className="text-slate-700">{userDefinedParameters.updatedBy}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-amber-600" />
            User Defined Parameter Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Konfigurasi antrean runtime screening FMS, routing alert email Fraud &amp; AML, batas memori thread, dan timer scheduler.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* View Mode Toggle: Card vs Dynamic Grid */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              id="btn-view-card"
              type="button"
              onClick={() => setViewMode('card')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
            <button
              id="btn-view-grid"
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Dynamic Grid</span>
            </button>
          </div>

          <button
            id="btn-reset-udp-defaults"
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Reset Defaults
          </button>

          <button
            id="btn-save-udp-parameters"
            type="button"
            onClick={() => handleInitiateSave()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save Parameter Changes
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD VIEW (DEFAULT: PRIORITIZED TOP PANELS + TABBED ADVANCED SECTION)     */}
      {/* ========================================================================= */}
      {viewMode === 'card' && (
        <div className="space-y-6">
          {/* --------------------------------------------------------------------- */}
          {/* SECTION A: FREQUENTLY USED PARAMETERS (QUICK ACTIONS) - TOP PANELS    */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Panel 1: Screening & Job Queue Mode Control */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-50 rounded-full pointer-events-none opacity-60"></div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Screening &amp; Job Queue Mode Control
                  </span>

                  {/* Status Active Toggle */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 font-medium">Status:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="toggle-job-queue-active"
                        type="checkbox"
                        checked={formState.jobTypeQueueActive}
                        onChange={(e) => setFormState({ ...formState, jobTypeQueueActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    FMS Scheduler Job Type Queue (Tipe Screening) <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Ubah metode eksekusi antrean screening antarpemrosesan secara instan.
                  </p>

                  {/* Segmented Toggle / Radio Switch */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    {/* Option: Single */}
                    <button
                      id="radio-mode-single"
                      type="button"
                      onClick={() => setFormState({ ...formState, jobTypeQueue: 'Single' })}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition text-xs font-bold cursor-pointer border ${
                        formState.jobTypeQueue === 'Single'
                          ? 'bg-white text-blue-700 border-blue-300 shadow-xs'
                          : 'text-slate-600 border-transparent hover:bg-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <PlayCircle className={`w-4 h-4 ${formState.jobTypeQueue === 'Single' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-sm">Single</span>
                      </div>
                      <span className="text-[11px] font-normal text-slate-500 mt-0.5">Realtime / Single Processing</span>
                      {formState.jobTypeQueue === 'Single' && (
                        <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                          CURRENT MODE ACTIVE
                        </span>
                      )}
                    </button>

                    {/* Option: Batch */}
                    <button
                      id="radio-mode-batch"
                      type="button"
                      onClick={() => setFormState({ ...formState, jobTypeQueue: 'Batch' })}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition text-xs font-bold cursor-pointer border ${
                        formState.jobTypeQueue === 'Batch'
                          ? 'bg-white text-purple-700 border-purple-300 shadow-xs'
                          : 'text-slate-600 border-transparent hover:bg-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <Layers className={`w-4 h-4 ${formState.jobTypeQueue === 'Batch' ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="text-sm">Batch</span>
                      </div>
                      <span className="text-[11px] font-normal text-slate-500 mt-0.5">Batch Processing</span>
                      {formState.jobTypeQueue === 'Batch' && (
                        <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800">
                          CURRENT MODE ACTIVE
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${formState.jobTypeQueueActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                  Mode: <strong className="text-slate-800">{formState.jobTypeQueue}</strong>
                </span>
                <span className="font-mono text-[11px] text-slate-400">Daemon: Online</span>
              </div>
            </div>

            {/* Panel 2: Email Recipient Routing (Fraud & AML) */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Recipient Routing (Fraud &amp; AML Escalation)
                  </span>

                  {/* Status Active Toggle */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 font-medium">Status:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="toggle-email-routing-active"
                        type="checkbox"
                        checked={formState.emailRoutingActive}
                        onChange={(e) => setFormState({ ...formState, emailRoutingActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* EmailTo FMS Error Notification */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      EmailTo FMS Error Notification <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="input-email-to-fms-error"
                      type="text"
                      value={formState.emailToFmsError}
                      onChange={(e) => setFormState({ ...formState, emailToFmsError: e.target.value })}
                      placeholder="e.g. fms-support@banksampoerna.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Pisahkan beberapa email dengan tanda koma (,)</span>
                  </div>

                  {/* EmailCc FMS Error Notification */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      EmailCc FMS Error Notification
                    </label>
                    <input
                      id="input-email-cc-fms-error"
                      type="text"
                      value={formState.emailCcFmsError}
                      onChange={(e) => setFormState({ ...formState, emailCcFmsError: e.target.value })}
                      placeholder="e.g. fms-lead@banksampoerna.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Tembusan error sistem</span>
                  </div>

                  {/* EmailTo AML */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      EmailTo AML (Anti-Money Laundering Team) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="input-email-to-aml"
                      rows={2}
                      value={formState.emailToAml}
                      onChange={(e) => setFormState({ ...formState, emailToAml: e.target.value })}
                      placeholder="aml-monitoring@banksampoerna.com, compliance@banksampoerna.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* EmailTo Fraud */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      EmailTo Fraud (AFC &amp; Investigation Team) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="input-email-to-fraud"
                      rows={2}
                      value={formState.emailToFraud}
                      onChange={(e) => setFormState({ ...formState, emailToFraud: e.target.value })}
                      placeholder="fraud-investigation@banksampoerna.com, afc-alert@banksampoerna.com"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Penerima notifikasi otomatis saat terjadi eskalasi investigasi kasus perbankan.</span>
                <span className="text-emerald-600 font-medium font-mono text-[11px]">SMTP Routing: Ready</span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* SECTION B: TABBED ADVANCED PARAMETERS (QUEUE, DELAY, RULES)           */}
          {/* --------------------------------------------------------------------- */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Tab Headers */}
            <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/80 px-4 pt-3 gap-2">
              {/* Tab 1: Queue & Memory Limits */}
              <button
                id="tab-btn-queue-memory"
                type="button"
                onClick={() => setActiveBottomTab('queue-memory')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg text-xs font-semibold transition border-b-2 cursor-pointer ${
                  activeBottomTab === 'queue-memory'
                    ? 'bg-white text-blue-700 border-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
                }`}
              >
                <Cpu className={`w-4 h-4 ${activeBottomTab === 'queue-memory' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Tab 1: Queue &amp; Memory Limits</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-blue-100 text-blue-800">
                  4 Params
                </span>
              </button>

              {/* Tab 2: Delay & Scheduler Timers */}
              <button
                id="tab-btn-delay-timers"
                type="button"
                onClick={() => setActiveBottomTab('delay-timers')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg text-xs font-semibold transition border-b-2 cursor-pointer ${
                  activeBottomTab === 'delay-timers'
                    ? 'bg-white text-blue-700 border-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
                }`}
              >
                <Clock className={`w-4 h-4 ${activeBottomTab === 'delay-timers' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Tab 2: Delay &amp; Scheduler Timers</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-amber-100 text-amber-800">
                  5 Params
                </span>
              </button>

              {/* Tab 3: System Rules & Logs */}
              <button
                id="tab-btn-rules-logs"
                type="button"
                onClick={() => setActiveBottomTab('rules-logs')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg text-xs font-semibold transition border-b-2 cursor-pointer ${
                  activeBottomTab === 'rules-logs'
                    ? 'bg-white text-blue-700 border-blue-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
                }`}
              >
                <ShieldAlert className={`w-4 h-4 ${activeBottomTab === 'rules-logs' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Tab 3: System Rules &amp; Logs</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-purple-100 text-purple-800">
                  3 Params
                </span>
              </button>
            </div>

            {/* Tab Panes */}
            <div className="p-6">
              {/* TAB 1: Queue & Memory Limits */}
              {activeBottomTab === 'queue-memory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-600" />
                        Queue &amp; Memory Infrastructure Limits
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Konfigurasi kapasitas antrean per worker thread pipeline screening dan ambang buffer memori RAM.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Limit Queue on Thread */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Limit Queue on Thread
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-limit-queue-thread"
                            type="checkbox"
                            checked={formState.limitQueueOnThreadActive}
                            onChange={(e) => setFormState({ ...formState, limitQueueOnThreadActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <input
                        id="input-limit-queue-thread"
                        type="number"
                        min="100"
                        max="50000"
                        step="500"
                        value={formState.limitQueueOnThread}
                        onChange={(e) => setFormState({ ...formState, limitQueueOnThread: parseInt(e.target.value) || 8000 })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Default: 8000 antrean</span>
                    </div>

                    {/* Maximum Limit Queue On Memory */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Maximum Limit Queue On Memory
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-max-limit-memory"
                            type="checkbox"
                            checked={formState.maximumLimitQueueOnMemoryActive}
                            onChange={(e) => setFormState({ ...formState, maximumLimitQueueOnMemoryActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <input
                        id="input-max-limit-memory"
                        type="number"
                        min="1000"
                        max="100000"
                        step="1000"
                        value={formState.maximumLimitQueueOnMemory}
                        onChange={(e) => setFormState({ ...formState, maximumLimitQueueOnMemory: parseInt(e.target.value) || 10000 })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Default: 10000 RAM buffer</span>
                    </div>

                    {/* Max Row Job Single Get Into Queue Memory From DB */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Max Row Job Single Into Queue
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-max-row-single"
                            type="checkbox"
                            checked={formState.maxRowJobSingleGetIntoQueueMemoryActive}
                            onChange={(e) => setFormState({ ...formState, maxRowJobSingleGetIntoQueueMemoryActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <input
                        id="input-max-row-single"
                        type="number"
                        min="500"
                        max="20000"
                        step="500"
                        value={formState.maxRowJobSingleGetIntoQueueMemory}
                        onChange={(e) => setFormState({ ...formState, maxRowJobSingleGetIntoQueueMemory: parseInt(e.target.value) || 5000 })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Single fetch limit (default: 5000)</span>
                    </div>

                    {/* Max Row Job Batch Get Into Queue Memory From DB */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Max Row Job Batch Into Queue
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-max-row-batch"
                            type="checkbox"
                            checked={formState.maxRowJobBatchGetIntoQueueMemoryActive}
                            onChange={(e) => setFormState({ ...formState, maxRowJobBatchGetIntoQueueMemoryActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <input
                        id="input-max-row-batch"
                        type="number"
                        min="50"
                        max="5000"
                        step="50"
                        value={formState.maxRowJobBatchGetIntoQueueMemory}
                        onChange={(e) => setFormState({ ...formState, maxRowJobBatchGetIntoQueueMemory: parseInt(e.target.value) || 500 })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Batch chunk limit (default: 500)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Delay & Scheduler Timers */}
              {activeBottomTab === 'delay-timers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Delay &amp; Scheduler Timers
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Interval penundaan antrean, jeda daemon start/finish, dan durasi pengulangan (retry) transaksi pending.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Delay At Start Queue */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Delay At Start Queue
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-delay-start"
                            type="checkbox"
                            checked={formState.delayAtStartQueueActive}
                            onChange={(e) => setFormState({ ...formState, delayAtStartQueueActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          id="input-delay-start"
                          type="number"
                          min="0"
                          max="60"
                          value={formState.delayAtStartQueue}
                          onChange={(e) => setFormState({ ...formState, delayAtStartQueue: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-xs text-slate-500 shrink-0">Detik</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">Inisialisasi daemon</span>
                    </div>

                    {/* Delay At Finish Queue */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Delay At Finish Queue
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-delay-finish"
                            type="checkbox"
                            checked={formState.delayAtFinishQueueActive}
                            onChange={(e) => setFormState({ ...formState, delayAtFinishQueueActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          id="input-delay-finish"
                          type="number"
                          min="0"
                          max="120"
                          value={formState.delayAtFinishQueue}
                          onChange={(e) => setFormState({ ...formState, delayAtFinishQueue: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-xs text-slate-500 shrink-0">Detik</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">Shutdown timeout</span>
                    </div>

                    {/* Delay Retry Scheduler Job Service (Minute) */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Delay Retry Job (Minute)
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-delay-retry-job"
                            type="checkbox"
                            checked={formState.delayRetrySchedulerJobServiceMinuteActive}
                            onChange={(e) => setFormState({ ...formState, delayRetrySchedulerJobServiceMinuteActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          id="input-delay-retry-job"
                          type="number"
                          min="5"
                          max="720"
                          value={formState.delayRetrySchedulerJobServiceMinute}
                          onChange={(e) => setFormState({ ...formState, delayRetrySchedulerJobServiceMinute: parseInt(e.target.value) || 60 })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-xs text-slate-500 shrink-0">Menit</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">Default: 60 Menit</span>
                    </div>

                    {/* Retry from (Minute) */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Retry from (Minute)
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-retry-from-minute"
                            type="checkbox"
                            checked={formState.retryFromMinuteActive}
                            onChange={(e) => setFormState({ ...formState, retryFromMinuteActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          id="input-retry-from-minute"
                          type="number"
                          min="30"
                          max="1440"
                          value={formState.retryFromMinute}
                          onChange={(e) => setFormState({ ...formState, retryFromMinute: parseInt(e.target.value) || 360 })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-xs text-slate-500 shrink-0">Menit</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">Default: 360 Menit (6 jam)</span>
                    </div>

                    {/* Delay Insert Trigger Scheduler Process in Second */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Delay Insert Trigger
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-delay-insert-trigger"
                            type="checkbox"
                            checked={formState.delayInsertTriggerSchedulerProcessSecondActive}
                            onChange={(e) => setFormState({ ...formState, delayInsertTriggerSchedulerProcessSecondActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <input
                          id="input-delay-insert-trigger"
                          type="number"
                          min="0"
                          max="30"
                          value={formState.delayInsertTriggerSchedulerProcessSecond}
                          onChange={(e) => setFormState({ ...formState, delayInsertTriggerSchedulerProcessSecond: parseInt(e.target.value) || 3 })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-xs text-slate-500 shrink-0">Detik</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">Pencegah lock contention</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: System Rules & Logs */}
              {activeBottomTab === 'rules-logs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-purple-600" />
                        System Rules &amp; Diagnostic Logs
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pemetaan kode aturan blacklist AML, toggle logging End-of-Day (EOD), dan konkurensi batch worker.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rule Blacklist AML */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          Rule Blacklist AML <span className="text-rose-500">*</span>
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-rule-blacklist-aml"
                            type="checkbox"
                            checked={formState.ruleBlacklistAmlActive}
                            onChange={(e) => setFormState({ ...formState, ruleBlacklistAmlActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <input
                        id="input-rule-blacklist-aml"
                        type="text"
                        value={formState.ruleBlacklistAml}
                        onChange={(e) => setFormState({ ...formState, ruleBlacklistAml: e.target.value })}
                        placeholder="e.g. AML4,AML 4 - DTTOT & High Risk Cross Match Alert"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Format: KODE_RULE,DESKRIPSI_RULE</span>
                    </div>

                    {/* ConcurrentJobBatchHandler */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800">
                          ConcurrentJobBatchHandler
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-concurrent-job-handler"
                            type="checkbox"
                            checked={formState.concurrentJobBatchHandlerActive}
                            onChange={(e) => setFormState({ ...formState, concurrentJobBatchHandlerActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <input
                        id="input-concurrent-job-handler"
                        type="number"
                        min="1"
                        max="50"
                        value={formState.concurrentJobBatchHandler}
                        onChange={(e) => setFormState({ ...formState, concurrentJobBatchHandler: parseInt(e.target.value) || 10 })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Default: 10 worker paralel</span>
                    </div>

                    {/* ON/OFF EOD LOG */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 md:col-span-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">
                            ON/OFF EOD LOG (End of Day Diagnostic Logging)
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            formState.onOffEodLog ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {formState.onOffEodLog ? 'LOGGING ON (1)' : 'LOGGING OFF (0)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Aktifkan penulisan rekapitulasi audit dan diagnosa proses End-of-Day secara detail ke dalam berkas log server.
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            id="toggle-on-off-eod-log"
                            type="checkbox"
                            checked={formState.onOffEodLog}
                            onChange={(e) => setFormState({ ...formState, onOffEodLog: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GRID VIEW (DYNAMIC FLAT TABLE - ATOMIC LEGACY VIEW)                       */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          {/* Controls Bar: Search, Category Filter, Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="input-grid-search"
                  type="text"
                  placeholder="Cari Parameter Key, Nama, atau Value..."
                  value={gridSearch}
                  onChange={(e) => setGridSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  id="select-grid-category"
                  value={gridCategoryFilter}
                  onChange={(e) => setGridCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Kategori ({userDefinedParameterItems.length})</option>
                  <option value="Screening & Queue">Screening &amp; Queue</option>
                  <option value="Email Routing">Email Routing</option>
                  <option value="Queue & Memory Limits">Queue &amp; Memory Limits</option>
                  <option value="Delay & Scheduler Timers">Delay &amp; Scheduler Timers</option>
                  <option value="System Rules & Logs">System Rules &amp; Logs</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                id="btn-export-udp-csv"
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Parameter Key</th>
                  <th className="py-2.5 px-3">Nama Parameter</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Nilai Konfigurasi</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredGridItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3 font-mono font-bold text-slate-500">{item.id}</td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{item.parameterKey}</td>
                    <td className="py-2 px-3 text-slate-900 font-medium">{item.parameterName}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-mono text-[10px] text-slate-500 font-semibold">{item.dataType}</span>
                    </td>
                    <td className="py-2 px-3 max-w-xs truncate font-mono text-slate-800 font-bold">
                      {item.parameterValue}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => updateUserDefinedParameterItem(item.id, { isActive: !item.isActive })}
                        className="cursor-pointer inline-flex items-center"
                        title={item.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                      >
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditGridItem(item)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition cursor-pointer"
                        title="Edit Nilai Parameter"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredGridItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      Tidak ada parameter yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SAFETY CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {showConfirmModal && pendingSavePayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-900">
                  Konfirmasi Keselamatan Konfigurasi UDP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Apakah Anda yakin ingin mengubah konfigurasi antrean screening, routing email recipient, dan parameter thread FMS ini?
              </p>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Ringkasan Perubahan:
                </span>
                {pendingSavePayload.summary.map((item, idx) => (
                  <div key={idx} className="text-xs text-slate-800 flex items-start space-x-1.5">
                    <span className="text-blue-500 font-bold">&bull;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Perubahan akan dicatat otomatis ke dalam <strong>Audit Trail Changes</strong> dan langsung disinkronkan ke worker daemon.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button
                id="btn-modal-cancel"
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-modal-confirm-save"
                type="button"
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Ya, Terapkan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GRID ITEM EDIT MODAL                                                      */}
      {/* ========================================================================= */}
      {editingGridItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-950">
                  Edit Parameter: {editingGridItem.parameterKey}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingGridItem(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[11px] text-slate-500 block">Nama Parameter:</span>
                <span className="text-xs font-bold text-slate-800">{editingGridItem.parameterName}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Parameter <span className="text-rose-500">*</span>
                </label>
                {editingGridItem.dataType === 'SELECT' ? (
                  <select
                    value={editItemValue}
                    onChange={(e) => setEditItemValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Single">Single (Realtime / Single Processing)</option>
                    <option value="Batch">Batch (Batch Processing)</option>
                  </select>
                ) : editingGridItem.dataType === 'BOOLEAN' ? (
                  <select
                    value={editItemValue}
                    onChange={(e) => setEditItemValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="1">1 - ON</option>
                    <option value="0">0 - OFF</option>
                  </select>
                ) : (
                  <input
                    type={editingGridItem.dataType === 'NUMBER' ? 'number' : 'text'}
                    value={editItemValue}
                    onChange={(e) => setEditItemValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Status Parameter:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editItemActive}
                    onChange={(e) => setEditItemActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-medium text-slate-700">
                    {editItemActive ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingGridItem(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveGridItem}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Simpan Nilai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
