import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  Clock, 
  Layers, 
  X, 
  AlertTriangle,
  ChevronRight,
  Workflow,
  Cpu,
  Repeat,
  Sparkles
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { ProcessItem, ProcessSequenceTask, PeriodType } from '../../types/process';
import { cn } from '../../lib/utils';

export const ListProcessPage: React.FC = () => {
  const { 
    processList, 
    processTasks,
    addProcessItem, 
    updateProcessItem, 
    deleteProcessItem, 
    toggleProcessItemStatus 
  } = useFMS();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [schedulerFilter, setSchedulerFilter] = useState<'ALL' | 'PERIODICAL' | 'MANUAL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcessId, setEditingProcessId] = useState<string | null>(null);

  // Process Form State
  const [formProcessName, setFormProcessName] = useState('');
  const [formProcessDesc, setFormProcessDesc] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Scheduler Config State
  const [formHasScheduler, setFormHasScheduler] = useState(true);
  const [formPeriod, setFormPeriod] = useState<number>(1);
  const [formPeriodType, setFormPeriodType] = useState<PeriodType>('Days');
  const [formStartDate, setFormStartDate] = useState('2026-09-01');
  const [formTime, setFormTime] = useState('23:30');

  // Sequence Task Detail (Sub-Grid)
  const [formSequenceTasks, setFormSequenceTasks] = useState<ProcessSequenceTask[]>([]);
  const [formErrors, setFormErrors] = useState<{ name?: string; sequence?: string }>({});

  // Sub-grid Add/Edit Task Modal/Drawer
  const [isSeqEditorOpen, setIsSeqEditorOpen] = useState(false);
  const [editingSeqId, setEditingSeqId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [seqError, setSeqError] = useState('');

  // Delete modal target
  const [deleteTarget, setDeleteTarget] = useState<ProcessItem | null>(null);

  // Expanded row
  const [expandedProcId, setExpandedProcId] = useState<string | null>(null);

  // Filtered Process items
  const filteredProcesses = useMemo(() => {
    return processList.filter(item => {
      const matchesSearch = 
        item.processName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sequenceTasks.some(st => st.taskName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesScheduler = 
        schedulerFilter === 'ALL' ||
        (schedulerFilter === 'PERIODICAL' && item.hasPeriodicalScheduler) ||
        (schedulerFilter === 'MANUAL' && !item.hasPeriodicalScheduler);

      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      return matchesSearch && matchesScheduler && matchesStatus;
    });
  }, [processList, searchQuery, schedulerFilter, statusFilter]);

  // Compute next schedule string helper
  const computeNextSchedulePreview = (
    hasSched: boolean,
    period: number,
    periodType: PeriodType,
    time: string
  ): string => {
    if (!hasSched) return '-';
    return `2026-09-04 ${time}:00 WIB (Setiap ${period} ${periodType})`;
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingProcessId(null);
    setFormProcessName('');
    setFormProcessDesc('');
    setFormIsActive(true);
    setFormHasScheduler(true);
    setFormPeriod(1);
    setFormPeriodType('Days');
    setFormStartDate('2026-09-04');
    setFormTime('23:30');
    // Pre-populate with first active task if available
    const initialTask = processTasks.find(t => t.isActive) || processTasks[0];
    if (initialTask) {
      setFormSequenceTasks([
        {
          id: `SEQ-${Date.now()}-1`,
          orderNo: 1,
          taskId: initialTask.id,
          taskName: initialTask.taskName,
          taskDetailCount: initialTask.details.length
        }
      ]);
    } else {
      setFormSequenceTasks([]);
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: ProcessItem) => {
    setEditingProcessId(item.id);
    setFormProcessName(item.processName);
    setFormProcessDesc(item.description);
    setFormIsActive(item.isActive);
    setFormHasScheduler(item.hasPeriodicalScheduler);
    setFormPeriod(item.schedulerPeriod || 1);
    setFormPeriodType(item.periodType || 'Days');
    setFormStartDate(item.startDate || '2026-09-01');
    setFormTime(item.executionTime || '23:30');
    setFormSequenceTasks(JSON.parse(JSON.stringify(item.sequenceTasks)));
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Save Process Form
  const handleSaveProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; sequence?: string } = {};

    if (!formProcessName.trim()) {
      errors.name = 'Process Name wajib diisi';
    }
    if (formSequenceTasks.length === 0) {
      errors.sequence = 'Minimal tambahkan 1 Task ke dalam Sequence Process';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const nextScheduleStr = formHasScheduler 
      ? computeNextSchedulePreview(formHasScheduler, formPeriod, formPeriodType, formTime)
      : '-';

    const sanitizedSeq = formSequenceTasks.map((st, idx) => ({
      ...st,
      orderNo: idx + 1
    }));

    if (editingProcessId) {
      updateProcessItem(editingProcessId, {
        processName: formProcessName.trim(),
        description: formProcessDesc.trim(),
        hasPeriodicalScheduler: formHasScheduler,
        schedulerPeriod: formHasScheduler ? formPeriod : undefined,
        periodType: formHasScheduler ? formPeriodType : undefined,
        startDate: formHasScheduler ? formStartDate : undefined,
        executionTime: formHasScheduler ? formTime : undefined,
        nextSchedule: nextScheduleStr,
        isActive: formIsActive,
        sequenceTasks: sanitizedSeq
      });
    } else {
      addProcessItem({
        processName: formProcessName.trim(),
        description: formProcessDesc.trim(),
        hasPeriodicalScheduler: formHasScheduler,
        schedulerPeriod: formHasScheduler ? formPeriod : undefined,
        periodType: formHasScheduler ? formPeriodType : undefined,
        startDate: formHasScheduler ? formStartDate : undefined,
        executionTime: formHasScheduler ? formTime : undefined,
        nextSchedule: nextScheduleStr,
        isActive: formIsActive,
        sequenceTasks: sanitizedSeq
      });
    }

    setIsModalOpen(false);
  };

  // Sequence: Move Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFormSequenceTasks(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((st, idx) => ({ ...st, orderNo: idx + 1 }));
    });
  };

  // Sequence: Move Down
  const handleMoveDown = (index: number) => {
    if (index === formSequenceTasks.length - 1) return;
    setFormSequenceTasks(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((st, idx) => ({ ...st, orderNo: idx + 1 }));
    });
  };

  // Sequence: Delete Row
  const handleDeleteSeqRow = (index: number) => {
    setFormSequenceTasks(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((st, idx) => ({ ...st, orderNo: idx + 1 }));
    });
  };

  // Sequence: Open Add Task Dialog
  const handleOpenAddSeq = () => {
    setEditingSeqId(null);
    const firstTask = processTasks[0];
    setSelectedTaskId(firstTask ? firstTask.id : '');
    setSeqError('');
    setIsSeqEditorOpen(true);
  };

  // Sequence: Open Edit Task Dialog
  const handleOpenEditSeq = (item: ProcessSequenceTask) => {
    setEditingSeqId(item.id);
    setSelectedTaskId(item.taskId);
    setSeqError('');
    setIsSeqEditorOpen(true);
  };

  // Sequence: Save Sequence Task
  const handleSaveSeqTask = () => {
    if (!selectedTaskId) {
      setSeqError('Silakan pilih salah satu Task dari daftar');
      return;
    }

    const taskObj = processTasks.find(t => t.id === selectedTaskId);
    if (!taskObj) {
      setSeqError('Task yang dipilih tidak valid');
      return;
    }

    if (editingSeqId) {
      setFormSequenceTasks(prev => prev.map(st => {
        if (st.id === editingSeqId) {
          return {
            ...st,
            taskId: taskObj.id,
            taskName: taskObj.taskName,
            taskDetailCount: taskObj.details.length
          };
        }
        return st;
      }));
    } else {
      const newSeqItem: ProcessSequenceTask = {
        id: `SEQ-${Date.now()}`,
        orderNo: formSequenceTasks.length + 1,
        taskId: taskObj.id,
        taskName: taskObj.taskName,
        taskDetailCount: taskObj.details.length
      };
      setFormSequenceTasks(prev => [...prev, newSeqItem]);
    }

    setIsSeqEditorOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No', 'Process ID', 'Process Name', 'Scheduler Status', 'Next Schedule', 'Active Status', 'Sequence Count', 'Created By'];
    const rows = filteredProcesses.map((p, idx) => [
      idx + 1,
      p.id,
      `"${p.processName.replace(/"/g, '""')}"`,
      p.hasPeriodicalScheduler ? `Periodical (${p.schedulerPeriod} ${p.periodType})` : 'Manual',
      `"${p.nextSchedule || '-'}"`,
      p.isActive ? 'Active' : 'Inactive',
      p.sequenceTasks.length,
      p.createdBy
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FMS_List_Process_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-100 shadow-xs">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">List Process (EOD & Batch Engine)</h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Process Orchestrator
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar orkestrasi proses end-to-end dengan penjadwalan periodik dan rangkaian urutan Task.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="export-process-csv-btn"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              id="add-new-process-btn"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Process</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Total Processes</span>
            <span className="text-lg font-bold text-slate-800 font-mono">{processList.length}</span>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/60">
            <span className="text-[11px] font-medium text-emerald-700 block">Active Processes</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">
              {processList.filter(p => p.isActive).length}
            </span>
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/60">
            <span className="text-[11px] font-medium text-indigo-700 block">Periodical Schedulers</span>
            <span className="text-lg font-bold text-indigo-700 font-mono">
              {processList.filter(p => p.hasPeriodicalScheduler).length}
            </span>
          </div>
          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100/60">
            <span className="text-[11px] font-medium text-purple-700 block">Total Sequence Steps</span>
            <span className="text-lg font-bold text-purple-700 font-mono">
              {processList.reduce((acc, p) => acc + p.sequenceTasks.length, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-process-input"
              type="text"
              placeholder="Search Process ID, name, sequence tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Scheduler Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Scheduler:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                {(['ALL', 'PERIODICAL', 'MANUAL'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setSchedulerFilter(type)}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-medium transition",
                      schedulerFilter === type
                        ? "bg-white text-indigo-700 font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {type === 'ALL' ? 'All' : type === 'PERIODICAL' ? 'Periodical' : 'Manual'}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-medium transition",
                      statusFilter === status
                        ? "bg-white text-indigo-700 font-bold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-36 text-center">Action</th>
                <th className="py-3.5 px-4 w-32">Process ID</th>
                <th className="py-3.5 px-4 min-w-[240px]">Process Name</th>
                <th className="py-3.5 px-4 min-w-[180px]">Scheduler Status</th>
                <th className="py-3.5 px-4 min-w-[180px]">Next Schedule</th>
                <th className="py-3.5 px-4 w-28 text-center">Active Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProcesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Workflow className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">Tidak ada Process yang cocok</p>
                    <p className="text-xs text-slate-400 mt-1">Sesuaikan filter atau buat konfigurasi Process baru.</p>
                  </td>
                </tr>
              ) : (
                filteredProcesses.map((proc, index) => {
                  const isExpanded = expandedProcId === proc.id;
                  return (
                    <React.Fragment key={proc.id}>
                      <tr 
                        className={cn(
                          "hover:bg-slate-50/70 transition-colors group",
                          !proc.isActive && "bg-slate-50/40 opacity-80"
                        )}
                      >
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Edit Button */}
                            <button
                              id={`edit-proc-${proc.id}-btn`}
                              onClick={() => handleOpenEditModal(proc)}
                              title="Edit Process & Sequence Tasks"
                              className="p-1.5 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              id={`delete-proc-${proc.id}-btn`}
                              onClick={() => setDeleteTarget(proc)}
                              title="Delete Process"
                              className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Activation Toggle Button */}
                            <button
                              id={`toggle-proc-${proc.id}-btn`}
                              onClick={() => toggleProcessItemStatus(proc.id)}
                              title={proc.isActive ? 'Deactivate Process' : 'Activate Process'}
                              className={cn(
                                "p-1.5 rounded-md transition",
                                proc.isActive 
                                  ? "text-emerald-600 hover:bg-emerald-50" 
                                  : "text-slate-400 hover:bg-slate-100"
                              )}
                            >
                              {proc.isActive ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Expand Sequence Detail */}
                            <button
                              id={`expand-proc-${proc.id}-btn`}
                              onClick={() => setExpandedProcId(isExpanded ? null : proc.id)}
                              title="View Sequence Tasks"
                              className={cn(
                                "p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition",
                                isExpanded && "bg-slate-200 text-slate-800"
                              )}
                            >
                              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-90")} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                          {proc.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{proc.processName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {proc.description}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                            <span>{proc.sequenceTasks.length} Sequence Tasks</span>
                            <span>•</span>
                            <span>By {proc.createdBy}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {proc.hasPeriodicalScheduler ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                              <Repeat className="w-3 h-3 text-blue-600 animate-spin-slow" />
                              <span>Periodical ({proc.schedulerPeriod} {proc.periodType} at {proc.executionTime})</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Manual Trigger Only</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                          {proc.nextSchedule || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold",
                              proc.isActive
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", proc.isActive ? "bg-emerald-500" : "bg-slate-400")}></span>
                            {proc.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable row: Sequence Tasks Detail */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/30 border-y border-indigo-100">
                          <td colSpan={7} className="p-4 sm:p-5">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Workflow className="w-4 h-4 text-indigo-600" />
                                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Sequence Task Orchestration ({proc.sequenceTasks.length} Tasks)
                                  </h4>
                                </div>
                                <button
                                  onClick={() => handleOpenEditModal(proc)}
                                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Ubah Susunan Urutan</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {proc.sequenceTasks.map((st, sIndex) => {
                                  const realTask = processTasks.find(t => t.id === st.taskId);
                                  return (
                                    <div 
                                      key={st.id} 
                                      className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-start space-x-2.5"
                                    >
                                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                                        {sIndex + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-slate-900 truncate">
                                          {st.taskName}
                                        </div>
                                        <div className="text-[10px] font-mono text-indigo-600 mt-0.5">
                                          ID: {st.taskId}
                                        </div>
                                        {realTask && (
                                          <div className="text-[10px] text-slate-400 mt-1">
                                            {realTask.details.length} SP/SSIS steps
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Menampilkan {filteredProcesses.length} dari {processList.length} Process</span>
          <span className="text-[11px] font-mono text-slate-400">Process Orchestrator v1.14</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL / FORM ADD & EDIT PROCESS */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Workflow className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingProcessId ? `Edit Process: ${editingProcessId}` : 'Add New Orchestrated Process'}
                  </h3>
                  <p className="text-xs text-indigo-100 mt-0.5">
                    Konfigurasi penjadwalan periodik dan susunan urutan Sequence Task yang dieksekusi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveProcess} className="p-6 space-y-6">
              {/* Process Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Process Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="process-name-input"
                      type="text"
                      placeholder="e.g. Daily EOD Engine Batch Processing"
                      value={formProcessName}
                      onChange={e => {
                        setFormProcessName(e.target.value);
                        if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                      }}
                      className={cn(
                        "w-full px-3.5 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-indigo-500 bg-white transition",
                        formErrors.name ? "border-rose-500 ring-rose-200" : "border-slate-300"
                      )}
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-rose-600 font-medium">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Active Status</label>
                    <div className="pt-1.5">
                      <label className="inline-flex items-center cursor-pointer gap-2.5">
                        <input
                          type="checkbox"
                          checked={formIsActive}
                          onChange={e => setFormIsActive(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="text-xs font-medium text-slate-700">
                          {formIsActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Process Description</label>
                  <textarea
                    id="process-desc-input"
                    rows={2}
                    placeholder="Deskripsikan tujuan alur proses ini, dampaknya terhadap data, dan parameter pendukung..."
                    value={formProcessDesc}
                    onChange={e => setFormProcessDesc(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white transition"
                  />
                </div>
              </div>

              {/* Scheduler Config Form Section */}
              <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Scheduler Config Form
                    </h4>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formHasScheduler}
                      onChange={e => setFormHasScheduler(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-indigo-900">Has Periodical Scheduler</span>
                  </label>
                </div>

                {formHasScheduler ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-indigo-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Scheduler Period</label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={formPeriod}
                        onChange={e => setFormPeriod(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Period Type</label>
                      <select
                        value={formPeriodType}
                        onChange={e => setFormPeriodType(e.target.value as PeriodType)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Days">Days</option>
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                        <option value="Hours">Hours</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Start Date</label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={e => setFormStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Time (HH:mm)</label>
                      <input
                        type="time"
                        value={formTime}
                        onChange={e => setFormTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-4 p-2.5 bg-white rounded-lg border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
                      <span className="text-slate-600">Jadwal Eksekusi Selanjutnya (Preview):</span>
                      <span className="font-bold font-mono text-indigo-700">
                        {computeNextSchedulePreview(true, formPeriod, formPeriodType, formTime)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
                    Proses ini berstatus <span className="font-semibold text-slate-800">Manual Execution Only</span>. Proses tidak akan dieksekusi secara otomatis oleh background scheduler cron engine, melainkan hanya melalui pemicu manual di menu Manual Execution.
                  </div>
                )}
              </div>

              {/* Sequence Task Detail (Sub-Grid) Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Sequence Task Detail (Sub-Grid)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pilih dan susun urutan Task yang telah didefinisikan sebelumnya di Sub-Menu 1 (Task).
                    </p>
                  </div>
                  <button
                    type="button"
                    id="add-seq-task-btn"
                    onClick={handleOpenAddSeq}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task to Sequence</span>
                  </button>
                </div>

                {formErrors.sequence && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formErrors.sequence}</span>
                  </div>
                )}

                {/* Sequence Grid Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-16 text-center">Order No</th>
                        <th className="py-2.5 px-3 w-28">Task ID</th>
                        <th className="py-2.5 px-3 min-w-[240px]">Task Name</th>
                        <th className="py-2.5 px-3 w-32 text-center">Sub-Steps</th>
                        <th className="py-2.5 px-3 w-36 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formSequenceTasks.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            <Workflow className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                            <p className="text-xs font-medium text-slate-600">Belum ada Task dalam antrean urutan</p>
                            <p className="text-[11px] text-slate-400">Klik "Add Task to Sequence" untuk memasukkan Task.</p>
                          </td>
                        </tr>
                      ) : (
                        formSequenceTasks.map((st, index) => {
                          const originalTask = processTasks.find(t => t.id === st.taskId);
                          return (
                            <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 bg-slate-50/50">
                                {index + 1}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                                {st.taskId}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">{st.taskName}</div>
                                {originalTask && (
                                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                    {originalTask.taskDescription}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                                  {originalTask?.details.length || st.taskDetailCount || 0} Steps
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  {/* Up Arrow */}
                                  <button
                                    type="button"
                                    title="Pindahkan ke atas"
                                    disabled={index === 0}
                                    onClick={() => handleMoveUp(index)}
                                    className={cn(
                                      "p-1 rounded-md transition",
                                      index === 0
                                        ? "text-slate-300 cursor-not-allowed"
                                        : "text-indigo-600 hover:bg-indigo-50"
                                    )}
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Down Arrow */}
                                  <button
                                    type="button"
                                    title="Pindahkan ke bawah"
                                    disabled={index === formSequenceTasks.length - 1}
                                    onClick={() => handleMoveDown(index)}
                                    className={cn(
                                      "p-1 rounded-md transition",
                                      index === formSequenceTasks.length - 1
                                        ? "text-slate-300 cursor-not-allowed"
                                        : "text-indigo-600 hover:bg-indigo-50"
                                    )}
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Edit Row */}
                                  <button
                                    type="button"
                                    title="Pilih task lain"
                                    onClick={() => handleOpenEditSeq(st)}
                                    className="p-1 rounded-md text-amber-600 hover:bg-amber-50 transition"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Row */}
                                  <button
                                    type="button"
                                    title="Hapus task dari sequence"
                                    onClick={() => handleDeleteSeqRow(index)}
                                    className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition"
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
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-process-btn"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingProcessId ? 'Update Process' : 'Save New Process'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODAL: SELECT TASK FOR SEQUENCE */}
      {/* ========================================================= */}
      {isSeqEditorOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-5 py-3.5 bg-slate-800 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-indigo-400" />
                <span>Pilih Task untuk Sequence</span>
              </h4>
              <button
                onClick={() => setIsSeqEditorOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {seqError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {seqError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Pilih Task (Master Task dari Sub-Menu 1) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedTaskId}
                  onChange={e => setSelectedTaskId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Pilih Task --</option>
                  {processTasks.map(task => (
                    <option key={task.id} value={task.id}>
                      [{task.id}] {task.taskName} ({task.details.length} Steps) {!task.isActive ? '(Inactive)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTaskId && (() => {
                const previewTask = processTasks.find(t => t.id === selectedTaskId);
                if (!previewTask) return null;
                return (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div>
                      <span className="font-semibold text-slate-800">Deskripsi:</span>
                      <p className="text-slate-600 mt-0.5">{previewTask.taskDescription}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Langkah Detail ({previewTask.details.length}):</span>
                      <ul className="list-disc list-inside mt-1 text-[11px] text-slate-600 space-y-0.5 font-mono">
                        {previewTask.details.map(d => (
                          <li key={d.id}>
                            {d.spOrSsisFileName} ({d.taskDetailType})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSeqEditorOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                id="save-seq-task-btn"
                onClick={handleSaveSeqTask}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                {editingSeqId ? 'Update Sequence' : 'Insert to Sequence'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900">
              Hapus Process?
            </h3>
            <p className="text-xs text-center text-slate-600 mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus process <span className="font-bold text-slate-900 font-mono">[{deleteTarget.id}] {deleteTarget.processName}</span>?
              Semua konfigurasi scheduler dan sequence tasks terkait akan dihapus dari sistem.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                id="confirm-delete-process-btn"
                onClick={() => {
                  deleteProcessItem(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition"
              >
                Ya, Hapus Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
