import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Search, 
  Filter, 
  Download, 
  Terminal, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  StopCircle, 
  Layers, 
  Workflow, 
  ListOrdered, 
  Calendar, 
  ChevronRight, 
  Server, 
  Activity,
  ArrowRight,
  Database,
  Eye,
  RotateCw
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { ProcessExecutionLog, ExecutionLogDetailStep } from '../../types/process';
import { cn } from '../../lib/utils';

export const ManualExecutionPage: React.FC = () => {
  const { 
    processExecutions, 
    processList, 
    processTasks, 
    triggerManualExecution, 
    terminateExecution 
  } = useFMS();

  // Trigger Card State
  const [targetType, setTargetType] = useState<'Process' | 'Task'>('Process');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [executionDate, setExecutionDate] = useState<string>('2026-09-04');
  const [remarks, setRemarks] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [triggerError, setTriggerError] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Monitor Log Table Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Running' | 'Success' | 'Failed' | 'Cancelled'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Process' | 'Task'>('ALL');

  // Console / Detail Log Modal State
  const [selectedLog, setSelectedLog] = useState<ProcessExecutionLog | null>(null);

  // Auto-select first target when type changes or initialized
  React.useEffect(() => {
    if (targetType === 'Process') {
      const activeProc = processList.find(p => p.isActive) || processList[0];
      setSelectedTargetId(activeProc ? activeProc.id : '');
    } else {
      const activeTask = processTasks.find(t => t.isActive) || processTasks[0];
      setSelectedTargetId(activeTask ? activeTask.id : '');
    }
  }, [targetType, processList, processTasks]);

  // Filtered Execution Logs
  const filteredLogs = useMemo(() => {
    return processExecutions.filter(log => {
      const matchesSearch = 
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.triggeredBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.remarks.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' || log.status === statusFilter;

      const matchesType = 
        typeFilter === 'ALL' || log.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [processExecutions, searchQuery, statusFilter, typeFilter]);

  // Target object preview
  const currentTargetPreview = useMemo(() => {
    if (targetType === 'Process') {
      return processList.find(p => p.id === selectedTargetId);
    }
    return processTasks.find(t => t.id === selectedTargetId);
  }, [targetType, selectedTargetId, processList, processTasks]);

  // Trigger Execution
  const handleExecuteTrigger = () => {
    if (!selectedTargetId) {
      setTriggerError('Silakan pilih target Process atau Task yang ingin dieksekusi.');
      return;
    }

    setTriggerError('');
    setShowConfirmModal(false);
    setIsExecuting(true);

    const newLog = triggerManualExecution({
      type: targetType,
      targetId: selectedTargetId,
      executionDate,
      remarks: remarks.trim() || `Manual execution on ${executionDate} for ${currentTargetPreview ? ('processName' in currentTargetPreview ? currentTargetPreview.processName : currentTargetPreview.taskName) : selectedTargetId}`
    });

    // Auto open modal console to see live execution
    setSelectedLog(newLog);

    setTimeout(() => {
      setIsExecuting(false);
    }, 1000);
  };

  // Re-run execution from table row
  const handleRerun = (log: ProcessExecutionLog) => {
    const newLog = triggerManualExecution({
      type: log.type,
      targetId: log.targetId,
      executionDate: new Date().toISOString().slice(0, 10),
      remarks: `Re-run triggered from historical execution ${log.id}`
    });
    setSelectedLog(newLog);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No', 'Execution ID', 'Type', 'Target Name', 'Triggered By', 'Start Time', 'End Time', 'Duration', 'Status', 'Completed Steps', 'Remarks'];
    const rows = filteredLogs.map((l, idx) => [
      idx + 1,
      l.id,
      l.type,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.triggeredBy.replace(/"/g, '""')}"`,
      l.startTime,
      l.endTime || '-',
      l.duration || '-',
      l.status,
      `${l.completedSteps}/${l.totalSteps}`,
      `"${l.remarks.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FMS_Process_Executions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sync selectedLog with latest state in processExecutions
  const activeDetailLog = useMemo(() => {
    if (!selectedLog) return null;
    return processExecutions.find(e => e.id === selectedLog.id) || selectedLog;
  }, [selectedLog, processExecutions]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100 shadow-xs">
                <Play className="w-5 h-5 fill-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manual Execution Engine</h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Live Operational Control
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemicu eksekusi ad-hoc untuk orkestrasi Process atau Task spesifik dengan pemantauan log runtime interaktif.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="export-execution-csv-btn"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export History CSV</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Total Executions</span>
            <span className="text-lg font-bold text-slate-800 font-mono">{processExecutions.length}</span>
          </div>
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100/60">
            <span className="text-[11px] font-medium text-amber-700 block">Currently Running</span>
            <span className="text-lg font-bold text-amber-700 font-mono flex items-center gap-1.5">
              {processExecutions.filter(e => e.status === 'Running').length}
              {processExecutions.some(e => e.status === 'Running') && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </span>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/60">
            <span className="text-[11px] font-medium text-emerald-700 block">Successful Executions</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">
              {processExecutions.filter(e => e.status === 'Success').length}
            </span>
          </div>
          <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-100/60">
            <span className="text-[11px] font-medium text-rose-700 block">Failed / Terminated</span>
            <span className="text-lg font-bold text-rose-700 font-mono">
              {processExecutions.filter(e => e.status === 'Failed' || e.status === 'Cancelled').length}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TRIGGER CONTROL PANEL CARD */}
      {/* ========================================================= */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Execution Trigger Card
              </h2>
              <p className="text-xs text-slate-500">
                Tentukan target eksekusi, parameter tanggal batch, dan pemicu eksekusi langsung ke engine database FMS.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-mono text-slate-600 border border-slate-200">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>Target DB: SQL_SRV_FMS_PROD</span>
          </div>
        </div>

        {triggerError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{triggerError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Execution Type Selector */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Execution Target Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                id="target-type-process-btn"
                onClick={() => setTargetType('Process')}
                className={cn(
                  "py-2 px-3 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5",
                  targetType === 'Process'
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Process</span>
              </button>
              <button
                type="button"
                id="target-type-task-btn"
                onClick={() => setTargetType('Task')}
                className={cn(
                  "py-2 px-3 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5",
                  targetType === 'Task'
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Task</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {targetType === 'Process' 
                ? 'Mengeksekusi seluruh rangkaian Sequence Tasks dalam sebuah Process'
                : 'Mengeksekusi sebuah Task tunggal beserta langkah SP/SSIS di dalamnya'}
            </p>
          </div>

          {/* Target Dropdown */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Select {targetType} Target <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-target-id-input"
              value={selectedTargetId}
              onChange={e => setSelectedTargetId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
            >
              <option value="">-- Pilih {targetType} --</option>
              {targetType === 'Process' ? (
                processList.map(proc => (
                  <option key={proc.id} value={proc.id}>
                    [{proc.id}] {proc.processName} ({proc.sequenceTasks.length} Tasks) {!proc.isActive ? '(Inactive)' : ''}
                  </option>
                ))
              ) : (
                processTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    [{task.id}] {task.taskName} ({task.details.length} Steps) {!task.isActive ? '(Inactive)' : ''}
                  </option>
                ))
              )}
            </select>

            {/* Target Details Preview */}
            {currentTargetPreview && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">
                  {'processName' in currentTargetPreview ? currentTargetPreview.processName : currentTargetPreview.taskName}
                </span>
                <span className="mx-1 text-slate-400">•</span>
                <span>
                  {'sequenceTasks' in currentTargetPreview 
                    ? `${currentTargetPreview.sequenceTasks.length} Sequence Tasks` 
                    : `${currentTargetPreview.details.length} SP/SSIS steps`}
                </span>
              </div>
            )}
          </div>

          {/* Execution Parameter Date */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Execution Cut-off / Batch Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="execution-date-input"
                type="date"
                value={executionDate}
                onChange={e => setExecutionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Parameter tanggal batch dipassing ke stored procedure runtime (@ProcessDate).
            </p>
          </div>
        </div>

        {/* Remarks and Action Trigger */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-end justify-between gap-4">
          <div className="w-full md:w-2/3 space-y-1">
            <label className="text-xs font-semibold text-slate-700">Remarks / Operational Reason</label>
            <input
              id="execution-remarks-input"
              type="text"
              placeholder="e.g. Manual re-run EOD settlement per ticket IT-8823, missed trigger due to core banking network lag"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="w-full md:w-auto flex items-center justify-end">
            <button
              id="trigger-execution-btn"
              type="button"
              disabled={isExecuting || !selectedTargetId}
              onClick={() => setShowConfirmModal(true)}
              className={cn(
                "w-full md:w-auto px-6 py-2.5 text-xs font-bold text-white rounded-lg shadow-sm flex items-center justify-center gap-2 transition active:scale-95",
                isExecuting || !selectedTargetId
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
              )}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Initiating Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Now (Run {targetType})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* REAL-TIME MONITOR EXECUTION LOG TABLE */}
      {/* ========================================================= */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden space-y-0">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Execution Logs & History Monitor
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
              {filteredLogs.length} Records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Execution ID, name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 font-medium">Type:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
                {(['ALL', 'Process', 'Task'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      "px-2.5 py-0.5 rounded font-medium transition text-[11px]",
                      typeFilter === t
                        ? "bg-slate-800 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
                {(['ALL', 'Running', 'Success', 'Failed', 'Cancelled'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "px-2 py-0.5 rounded font-medium transition text-[11px]",
                      statusFilter === s
                        ? "bg-slate-800 text-white font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Execution Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-32">Execution ID</th>
                <th className="py-3 px-4 w-24">Type</th>
                <th className="py-3 px-4 min-w-[220px]">Target Name</th>
                <th className="py-3 px-4 min-w-[160px]">Triggered By</th>
                <th className="py-3 px-4 min-w-[140px]">Start Time</th>
                <th className="py-3 px-4 min-w-[140px]">End Time</th>
                <th className="py-3 px-4 w-24">Duration</th>
                <th className="py-3 px-4 w-32 text-center">Status</th>
                <th className="py-3 px-4 w-36 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">Tidak ada riwayat eksekusi</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan form di atas untuk memicu eksekusi pertama Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const isRunning = log.status === 'Running';
                  return (
                    <tr 
                      key={log.id} 
                      className={cn(
                        "hover:bg-slate-50/70 transition-colors",
                        isRunning && "bg-amber-50/30"
                      )}
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {log.id}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold",
                          log.type === 'Process' 
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-200" 
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        )}>
                          {log.type === 'Process' ? <Workflow className="w-3 h-3" /> : <ListOrdered className="w-3 h-3" />}
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{log.name}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{log.remarks}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Cut-off: {log.executionDate} • Steps: {log.completedSteps}/{log.totalSteps}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium text-slate-900">{log.triggeredBy}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Mode: {log.triggerMode}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {log.startTime}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {log.endTime || (isRunning ? 'In progress...' : '-')}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {log.duration || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold",
                            log.status === 'Running' && "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse",
                            log.status === 'Success' && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                            log.status === 'Failed' && "bg-rose-100 text-rose-800 border border-rose-200",
                            log.status === 'Cancelled' && "bg-slate-100 text-slate-700 border border-slate-200"
                          )}
                        >
                          {log.status === 'Running' && <RefreshCw className="w-3 h-3 animate-spin" />}
                          {log.status === 'Success' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {log.status === 'Failed' && <XCircle className="w-3 h-3 text-rose-600" />}
                          {log.status === 'Cancelled' && <StopCircle className="w-3 h-3 text-slate-500" />}
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* View Log Details Button */}
                          <button
                            id={`view-log-${log.id}-btn`}
                            onClick={() => setSelectedLog(log)}
                            title="View Execution Log & Console Output"
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                          </button>

                          {/* Re-run button */}
                          <button
                            id={`rerun-log-${log.id}-btn`}
                            onClick={() => handleRerun(log)}
                            title="Re-run Execution"
                            disabled={isRunning}
                            className={cn(
                              "p-1.5 rounded-md transition",
                              isRunning
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-emerald-600 hover:bg-emerald-50"
                            )}
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Terminate button (only if Running) */}
                          {isRunning && (
                            <button
                              id={`cancel-log-${log.id}-btn`}
                              onClick={() => terminateExecution(log.id)}
                              title="Cancel / Terminate Running Execution"
                              className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition"
                            >
                              <StopCircle className="w-3.5 h-3.5" />
                            </button>
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

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Menampilkan {filteredLogs.length} riwayat eksekusi</span>
          <span className="text-[11px] font-mono text-slate-400">FMS Execution Engine Monitor v1.14</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CONFIRMATION MODAL BEFORE EXECUTION */}
      {/* ========================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 fill-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900">
              Konfirmasi Eksekusi Manual
            </h3>
            <p className="text-xs text-center text-slate-600 mt-1 leading-relaxed">
              Anda akan memicu eksekusi manual untuk <span className="font-bold text-slate-900">{targetType} [{selectedTargetId}]</span> dengan tanggal parameter <span className="font-mono font-bold text-slate-900">{executionDate}</span>.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mt-4 space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Target:</span>
                <span className="font-semibold text-slate-800">{currentTargetPreview ? ('processName' in currentTargetPreview ? currentTargetPreview.processName : currentTargetPreview.taskName) : selectedTargetId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Database:</span>
                <span className="font-mono text-slate-800">SQL_SRV_FMS_PROD</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Operator:</span>
                <span className="font-semibold text-slate-800">yoseph.sanjaya</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                id="confirm-execute-btn"
                onClick={handleExecuteTrigger}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Mulai Eksekusi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONSOLE OUTPUT & EXECUTION LOG DETAILS MODAL */}
      {/* ========================================================= */}
      {activeDetailLog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-mono">
                      Execution Console Log: {activeDetailLog.id}
                    </h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wider",
                      activeDetailLog.status === 'Running' && "bg-amber-500 text-slate-950 animate-pulse",
                      activeDetailLog.status === 'Success' && "bg-emerald-500 text-slate-950",
                      activeDetailLog.status === 'Failed' && "bg-rose-500 text-white",
                      activeDetailLog.status === 'Cancelled' && "bg-slate-600 text-white"
                    )}>
                      {activeDetailLog.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeDetailLog.name} • Cut-off Date: {activeDetailLog.executionDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Status & Progress Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Execution Progress</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeDetailLog.completedSteps} of {activeDetailLog.totalSteps} Steps Complete (
                    {Math.round((activeDetailLog.completedSteps / Math.max(activeDetailLog.totalSteps, 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500 rounded-full",
                      activeDetailLog.status === 'Running' && "bg-amber-500 animate-pulse",
                      activeDetailLog.status === 'Success' && "bg-emerald-500",
                      activeDetailLog.status === 'Failed' && "bg-rose-500",
                      activeDetailLog.status === 'Cancelled' && "bg-slate-500"
                    )}
                    style={{
                      width: `${Math.round((activeDetailLog.completedSteps / Math.max(activeDetailLog.totalSteps, 1)) * 100)}%`
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Start Time</span>
                    <span className="font-mono font-semibold text-slate-800">{activeDetailLog.startTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">End Time</span>
                    <span className="font-mono font-semibold text-slate-800">{activeDetailLog.endTime || 'Running...'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Duration</span>
                    <span className="font-mono font-semibold text-slate-800">{activeDetailLog.duration || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Database Host</span>
                    <span className="font-mono font-semibold text-slate-800">{activeDetailLog.databaseTarget}</span>
                  </div>
                </div>
              </div>

              {/* Steps Sub-Grid Detail */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Executed Steps Breakdown</span>
                </h4>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 w-12 text-center">Step</th>
                        <th className="py-2 px-3">Step Name / Stored Procedure</th>
                        <th className="py-2 px-3 w-28">Type</th>
                        <th className="py-2 px-3 w-24">Rows Affected</th>
                        <th className="py-2 px-3 w-24 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeDetailLog.steps.map(step => (
                        <tr key={step.stepNo} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center font-mono font-bold text-slate-700 bg-slate-50/50">
                            {step.stepNo}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                            {step.stepName}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                              {step.stepType}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {step.rowsAffected ? step.rowsAffected.toLocaleString() : '-'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono",
                              step.status === 'Pending' && "bg-slate-100 text-slate-600",
                              step.status === 'In Progress' && "bg-amber-100 text-amber-800 animate-pulse",
                              step.status === 'Success' && "bg-emerald-100 text-emerald-800",
                              step.status === 'Failed' && "bg-rose-100 text-rose-800"
                            )}>
                              {step.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Console Output Stream Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-600" />
                    <span>Real-time Console Stream Log</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">stdout/stderr pipe</span>
                </div>

                <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-56 space-y-1 border border-slate-800 shadow-inner">
                  {activeDetailLog.logs.map((line, idx) => (
                    <div key={idx} className="leading-relaxed flex items-start space-x-2">
                      <span className="text-slate-600 select-none text-[10px] w-6 text-right shrink-0">{idx + 1}</span>
                      <span className={cn(
                        line.includes('ERROR') || line.includes('Failed') ? 'text-rose-400 font-bold' :
                        line.includes('SUCCESS') ? 'text-emerald-300 font-bold' :
                        'text-slate-300'
                      )}>
                        {line}
                      </span>
                    </div>
                  ))}
                  {activeDetailLog.status === 'Running' && (
                    <div className="flex items-center space-x-2 text-amber-400 pt-1 animate-pulse">
                      <span className="text-slate-600 select-none text-[10px] w-6 text-right shrink-0">•</span>
                      <span>[ENGINE EXECUTING] Processing worker thread... please wait</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div>
                {activeDetailLog.status === 'Running' && (
                  <button
                    type="button"
                    onClick={() => terminateExecution(activeDetailLog.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition flex items-center gap-1.5"
                  >
                    <StopCircle className="w-4 h-4 text-rose-600" />
                    <span>Terminate Execution</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
