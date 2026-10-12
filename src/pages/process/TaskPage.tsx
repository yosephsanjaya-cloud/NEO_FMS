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
  FileCode, 
  Database, 
  X, 
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  ChevronRight,
  ListOrdered,
  FileCheck
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { ProcessTask, ProcessTaskDetail, TaskDetailType } from '../../types/process';
import { cn } from '../../lib/utils';

export const TaskPage: React.FC = () => {
  const { 
    processTasks, 
    addProcessTask, 
    updateProcessTask, 
    deleteProcessTask, 
    toggleProcessTaskStatus 
  } = useFMS();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State for Add/Edit Task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form State
  const [formTaskName, setFormTaskName] = useState('');
  const [formTaskDesc, setFormTaskDesc] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDetails, setFormDetails] = useState<ProcessTaskDetail[]>([]);
  const [formErrors, setFormErrors] = useState<{ name?: string; details?: string }>({});

  // Sub-grid row editor (inline or mini form)
  const [isDetailEditorOpen, setIsDetailEditorOpen] = useState(false);
  const [editingDetailId, setEditingDetailId] = useState<string | null>(null);
  const [detailType, setDetailType] = useState<TaskDetailType>('Store Procedure');
  const [detailFileName, setDetailFileName] = useState('');
  const [detailUseParam, setDetailUseParam] = useState(false);
  const [detailParamDetails, setDetailParamDetails] = useState('');
  const [detailDesc, setDetailDesc] = useState('');
  const [detailError, setDetailError] = useState('');

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<ProcessTask | null>(null);

  // Expandable row for quick view
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return processTasks.filter(task => {
      const matchesSearch = 
        task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.taskDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.details.some(d => d.spOrSsisFileName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && task.isActive) ||
        (statusFilter === 'INACTIVE' && !task.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [processTasks, searchQuery, statusFilter]);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingTaskId(null);
    setFormTaskName('');
    setFormTaskDesc('');
    setFormIsActive(true);
    setFormDetails([
      {
        id: `TD-${Date.now()}-1`,
        orderNo: 1,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_process_step_initial',
        useParameter: true,
        parameterDetails: '@ProcessDate, @BatchID',
        description: 'Eksekusi batch data preparation'
      }
    ]);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (task: ProcessTask) => {
    setEditingTaskId(task.id);
    setFormTaskName(task.taskName);
    setFormTaskDesc(task.taskDescription);
    setFormIsActive(task.isActive);
    setFormDetails(JSON.parse(JSON.stringify(task.details))); // clone
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Save Task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; details?: string } = {};
    if (!formTaskName.trim()) {
      errors.name = 'Task Name wajib diisi';
    }
    if (formDetails.length === 0) {
      errors.details = 'Minimal tambahkan 1 Task Detail step';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Re-index order numbers cleanly
    const sanitizedDetails = formDetails.map((d, index) => ({
      ...d,
      orderNo: index + 1
    }));

    if (editingTaskId) {
      updateProcessTask(editingTaskId, {
        taskName: formTaskName.trim(),
        taskDescription: formTaskDesc.trim(),
        isActive: formIsActive,
        details: sanitizedDetails
      });
    } else {
      addProcessTask({
        taskName: formTaskName.trim(),
        taskDescription: formTaskDesc.trim(),
        isActive: formIsActive,
        details: sanitizedDetails
      });
    }

    setIsModalOpen(false);
  };

  // Sub-grid: Reorder Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFormDetails(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    });
  };

  // Sub-grid: Reorder Down
  const handleMoveDown = (index: number) => {
    if (index === formDetails.length - 1) return;
    setFormDetails(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    });
  };

  // Sub-grid: Delete Row
  const handleDeleteDetailRow = (index: number) => {
    setFormDetails(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      return filtered.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    });
  };

  // Sub-grid: Open Detail Editor for Add
  const handleOpenAddDetail = () => {
    setEditingDetailId(null);
    setDetailType('Store Procedure');
    setDetailFileName('');
    setDetailUseParam(false);
    setDetailParamDetails('');
    setDetailDesc('');
    setDetailError('');
    setIsDetailEditorOpen(true);
  };

  // Sub-grid: Open Detail Editor for Edit
  const handleOpenEditDetail = (item: ProcessTaskDetail) => {
    setEditingDetailId(item.id);
    setDetailType(item.taskDetailType);
    setDetailFileName(item.spOrSsisFileName);
    setDetailUseParam(item.useParameter);
    setDetailParamDetails(item.parameterDetails || '');
    setDetailDesc(item.description);
    setDetailError('');
    setIsDetailEditorOpen(true);
  };

  // Sub-grid: Save Detail Row
  const handleSaveDetailRow = () => {
    if (!detailFileName.trim()) {
      setDetailError('Store Procedure / SSIS File Name tidak boleh kosong');
      return;
    }

    if (editingDetailId) {
      setFormDetails(prev => prev.map(item => {
        if (item.id === editingDetailId) {
          return {
            ...item,
            taskDetailType: detailType,
            spOrSsisFileName: detailFileName.trim(),
            useParameter: detailUseParam,
            parameterDetails: detailUseParam ? detailParamDetails.trim() : '',
            description: detailDesc.trim()
          };
        }
        return item;
      }));
    } else {
      const newItem: ProcessTaskDetail = {
        id: `TD-${Date.now()}`,
        orderNo: formDetails.length + 1,
        taskDetailType: detailType,
        spOrSsisFileName: detailFileName.trim(),
        useParameter: detailUseParam,
        parameterDetails: detailUseParam ? detailParamDetails.trim() : '',
        description: detailDesc.trim()
      };
      setFormDetails(prev => [...prev, newItem]);
    }

    setIsDetailEditorOpen(false);
    setDetailError('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No', 'ID', 'Task Name', 'Description', 'Active Status', 'Steps Count', 'Created At'];
    const rows = filteredTasks.map((t, idx) => [
      idx + 1,
      t.id,
      `"${t.taskName.replace(/"/g, '""')}"`,
      `"${t.taskDescription.replace(/"/g, '""')}"`,
      t.isActive ? 'Active' : 'Inactive',
      t.details.length,
      t.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FMS_Process_Tasks_${new Date().toISOString().slice(0, 10)}.csv`);
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
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100 shadow-xs">
                <ListOrdered className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Process Task Management</h1>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                    EOD Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Konfigurasi sub-task individual, Stored Procedure, dan SSIS Package untuk orkestrasi batch engine.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="export-tasks-csv-btn"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              id="add-new-task-btn"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Task</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-500 block">Total Tasks</span>
            <span className="text-lg font-bold text-slate-800 font-mono">{processTasks.length}</span>
          </div>
          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/60">
            <span className="text-[11px] font-medium text-emerald-700 block">Active Tasks</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">
              {processTasks.filter(t => t.isActive).length}
            </span>
          </div>
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100/60">
            <span className="text-[11px] font-medium text-amber-700 block">Inactive Tasks</span>
            <span className="text-lg font-bold text-amber-700 font-mono">
              {processTasks.filter(t => !t.isActive).length}
            </span>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/60">
            <span className="text-[11px] font-medium text-blue-700 block">Total SP & SSIS Steps</span>
            <span className="text-lg font-bold text-blue-700 font-mono">
              {processTasks.reduce((acc, t) => acc + t.details.length, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-task-input"
              type="text"
              placeholder="Search Task ID, name, description, SP/SSIS..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(status => (
                <button
                  key={status}
                  id={`filter-task-${status.toLowerCase()}-btn`}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1 rounded-md font-medium transition",
                    statusFilter === status
                      ? "bg-white text-blue-700 font-bold shadow-xs"
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

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-36 text-center">Action</th>
                <th className="py-3.5 px-4 w-28">ID</th>
                <th className="py-3.5 px-4 min-w-[220px]">Task Name</th>
                <th className="py-3.5 px-4 min-w-[300px]">Task Description</th>
                <th className="py-3.5 px-4 w-32 text-center">Active Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ListOrdered className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">Tidak ada Task yang cocok</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau buat Task baru.</p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task, index) => {
                  const isExpanded = expandedTaskId === task.id;
                  return (
                    <React.Fragment key={task.id}>
                      <tr 
                        className={cn(
                          "hover:bg-slate-50/70 transition-colors group",
                          !task.isActive && "bg-slate-50/40 opacity-80"
                        )}
                      >
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Edit Button */}
                            <button
                              id={`edit-task-${task.id}-btn`}
                              onClick={() => handleOpenEditModal(task)}
                              title="Edit Task & Steps"
                              className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              id={`delete-task-${task.id}-btn`}
                              onClick={() => setDeleteTarget(task)}
                              title="Delete Task"
                              className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Activation Toggle Button */}
                            <button
                              id={`toggle-task-${task.id}-btn`}
                              onClick={() => toggleProcessTaskStatus(task.id)}
                              title={task.isActive ? 'Deactivate Task' : 'Activate Task'}
                              className={cn(
                                "p-1.5 rounded-md transition",
                                task.isActive 
                                  ? "text-emerald-600 hover:bg-emerald-50" 
                                  : "text-slate-400 hover:bg-slate-100"
                              )}
                            >
                              {task.isActive ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Expand Steps details */}
                            <button
                              id={`expand-task-${task.id}-btn`}
                              onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                              title="View Steps Detail"
                              className={cn(
                                "p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition",
                                isExpanded && "bg-slate-200 text-slate-800"
                              )}
                            >
                              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-90")} />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {task.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{task.taskName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>{task.details.length} Steps</span>
                            <span>•</span>
                            <span>By {task.createdBy}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                          {task.taskDescription}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold",
                              task.isActive
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", task.isActive ? "bg-emerald-500" : "bg-slate-400")}></span>
                            {task.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable sub-grid view */}
                      {isExpanded && (
                        <tr className="bg-blue-50/30 border-y border-blue-100">
                          <td colSpan={6} className="p-4 sm:p-5">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-blue-600" />
                                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Sub-Grid: Task Detail Sequence ({task.details.length} Steps)
                                  </h4>
                                </div>
                                <button
                                  onClick={() => handleOpenEditModal(task)}
                                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Kelola Sequence / Edit</span>
                                </button>
                              </div>

                              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-100/70 text-slate-600 font-semibold text-[10px] uppercase tracking-wider border-b border-slate-200">
                                    <tr>
                                      <th className="py-2.5 px-3 w-14 text-center">Order</th>
                                      <th className="py-2.5 px-3 w-36">Type</th>
                                      <th className="py-2.5 px-3">File / Procedure Name</th>
                                      <th className="py-2.5 px-3 w-28 text-center">Use Param</th>
                                      <th className="py-2.5 px-3">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {task.details.map((detail) => (
                                      <tr key={detail.id} className="hover:bg-slate-50/60">
                                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">
                                          {detail.orderNo}
                                        </td>
                                        <td className="py-2 px-3">
                                          <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono",
                                            detail.taskDetailType === 'Store Procedure'
                                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                                              : "bg-amber-100 text-amber-800 border border-amber-200"
                                          )}>
                                            {detail.taskDetailType === 'Store Procedure' ? (
                                              <Database className="w-3 h-3" />
                                            ) : (
                                              <FileCode className="w-3 h-3" />
                                            )}
                                            {detail.taskDetailType}
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                                          {detail.spOrSsisFileName}
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                          {detail.useParameter ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold" title={detail.parameterDetails}>
                                              Yes
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                              No
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-slate-600">
                                          <div>{detail.description}</div>
                                          {detail.parameterDetails && (
                                            <div className="text-[10px] font-mono text-blue-600 mt-0.5">
                                              Param: {detail.parameterDetails}
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
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
          <span>Menampilkan {filteredTasks.length} dari {processTasks.length} Task</span>
          <span className="text-[11px] font-mono text-slate-400">Process Engine Module v1.14</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL / FORM ADD & EDIT TASK */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl overflow-hidden my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ListOrdered className="w-5 h-5 text-blue-200" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingTaskId ? `Edit Task: ${editingTaskId}` : 'Add New Process Task'}
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Konfigurasi parameter header task dan urutan sequence Stored Procedure / SSIS file.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveTask} className="p-6 space-y-6">
              {/* Upper Form Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Upper Form: Task Header Information</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Task Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="task-form-name-input"
                      type="text"
                      placeholder="e.g. Transform Customer Individu from STG"
                      value={formTaskName}
                      onChange={e => {
                        setFormTaskName(e.target.value);
                        if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                      }}
                      className={cn(
                        "w-full px-3.5 py-2 text-xs rounded-lg border focus:ring-2 focus:ring-blue-500 bg-white transition",
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
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="text-xs font-medium text-slate-700">
                          {formIsActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Task Description</label>
                  <textarea
                    id="task-form-desc-input"
                    rows={2}
                    placeholder="Tulis deskripsi fungsi task dan batasan eksekusinya..."
                    value={formTaskDesc}
                    onChange={e => setFormTaskDesc(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white transition"
                  />
                </div>
              </div>

              {/* Task Detail Data (Sub-Grid) Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Task Detail Data (Sub-Grid)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Urutan eksekusi Stored Procedure atau SSIS File. Gunakan tombol panah ↑ / ↓ untuk mengatur urutan prioritas.
                    </p>
                  </div>
                  <button
                    type="button"
                    id="add-task-detail-row-btn"
                    onClick={handleOpenAddDetail}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task Detail</span>
                  </button>
                </div>

                {formErrors.details && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formErrors.details}</span>
                  </div>
                )}

                {/* Sub-grid Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-16 text-center">Order No</th>
                        <th className="py-2.5 px-3 w-36">Task Detail Type</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Store Procedure / SSIS File Name</th>
                        <th className="py-2.5 px-3 w-28 text-center">Use Parameter</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Description</th>
                        <th className="py-2.5 px-3 w-36 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formDetails.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            <Layers className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                            <p className="text-xs font-medium text-slate-600">Belum ada langkah Task Detail</p>
                            <p className="text-[11px] text-slate-400">Klik "Add Task Detail" untuk menambahkan langkah pertama.</p>
                          </td>
                        </tr>
                      ) : (
                        formDetails.map((detail, index) => (
                          <tr key={detail.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 bg-slate-50/50">
                              {index + 1}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono",
                                detail.taskDetailType === 'Store Procedure'
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              )}>
                                {detail.taskDetailType === 'Store Procedure' ? (
                                  <Database className="w-3 h-3" />
                                ) : (
                                  <FileCode className="w-3 h-3" />
                                )}
                                {detail.taskDetailType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                              {detail.spOrSsisFileName}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {detail.useParameter ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold" title={detail.parameterDetails}>
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              <div>{detail.description}</div>
                              {detail.parameterDetails && (
                                <div className="text-[10px] font-mono text-blue-600 mt-0.5">
                                  {detail.parameterDetails}
                                </div>
                              )}
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
                                      : "text-blue-600 hover:bg-blue-50"
                                  )}
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>

                                {/* Down Arrow */}
                                <button
                                  type="button"
                                  title="Pindahkan ke bawah"
                                  disabled={index === formDetails.length - 1}
                                  onClick={() => handleMoveDown(index)}
                                  className={cn(
                                    "p-1 rounded-md transition",
                                    index === formDetails.length - 1
                                      ? "text-slate-300 cursor-not-allowed"
                                      : "text-blue-600 hover:bg-blue-50"
                                  )}
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit Row */}
                                <button
                                  type="button"
                                  title="Edit baris detail"
                                  onClick={() => handleOpenEditDetail(detail)}
                                  className="p-1 rounded-md text-amber-600 hover:bg-amber-50 transition"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Row */}
                                <button
                                  type="button"
                                  title="Hapus baris detail"
                                  onClick={() => handleDeleteDetailRow(index)}
                                  className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
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
                  id="save-task-btn"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingTaskId ? 'Update Task' : 'Save New Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-MODAL: ADD / EDIT TASK DETAIL ROW */}
      {/* ========================================================= */}
      {isDetailEditorOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-5 py-3.5 bg-slate-800 text-white flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>{editingDetailId ? 'Edit Task Detail Step' : 'Add Task Detail Step'}</span>
              </h4>
              <button
                onClick={() => setIsDetailEditorOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {detailError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  {detailError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Task Detail Type</label>
                <select
                  value={detailType}
                  onChange={e => setDetailType(e.target.value as TaskDetailType)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Store Procedure">Store Procedure</option>
                  <option value="SSIS File">SSIS File</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Store Procedure / SSIS File Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={detailType === 'Store Procedure' ? 'e.g. sp_transform_customer_individu_stg' : 'e.g. SSIS_STG_Customer_Extract.dtsx'}
                  value={detailFileName}
                  onChange={e => setDetailFileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={detailUseParam}
                    onChange={e => setDetailUseParam(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">Use Parameter</span>
                </label>

                {detailUseParam && (
                  <div className="pl-6 space-y-1">
                    <input
                      type="text"
                      placeholder="e.g. @CutOffDate, @BatchID, @ProcessDate"
                      value={detailParamDetails}
                      onChange={e => setDetailParamDetails(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-white focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-slate-500">Daftar parameter yang dipassing saat runtime dieksekusi.</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Keterangan singkat fungsi langkah ini..."
                  value={detailDesc}
                  onChange={e => setDetailDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDetailEditorOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                id="save-task-detail-btn"
                onClick={handleSaveDetailRow}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {editingDetailId ? 'Update Step' : 'Add Step'}
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
              Hapus Task Process?
            </h3>
            <p className="text-xs text-center text-slate-600 mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus task <span className="font-bold text-slate-900 font-mono">[{deleteTarget.id}] {deleteTarget.taskName}</span>?
              Langkah ini akan dicatat dalam Audit Trail Changes.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                id="confirm-delete-task-btn"
                onClick={() => {
                  deleteProcessTask(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition"
              >
                Ya, Hapus Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
