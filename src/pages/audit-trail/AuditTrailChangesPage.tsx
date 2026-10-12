import React, { useState, useMemo } from 'react';
import { 
  History, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  X, 
  Check, 
  User, 
  Clock, 
  Calendar, 
  Layers, 
  ArrowRight, 
  ChevronRight,
  Database,
  ArrowLeftRight,
  ShieldCheck
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { AuditChangeLog, AuditActionType } from '../../types/auditTrail';
import { cn } from '../../lib/utils';

export const AuditTrailChangesPage: React.FC = () => {
  const { auditChangeLogs } = useFMS();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string>('ALL');
  const [selectedActionType, setSelectedActionType] = useState<string>('ALL');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Modal State
  const [selectedChange, setSelectedChange] = useState<AuditChangeLog | null>(null);

  // Unique lists for filters
  const uniqueModules = useMemo(() => {
    return Array.from(new Set(auditChangeLogs.map(c => c.moduleTable)));
  }, [auditChangeLogs]);

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(auditChangeLogs.map(c => c.userId)));
  }, [auditChangeLogs]);

  // Filtered change logs
  const filteredLogs = useMemo(() => {
    return auditChangeLogs.filter(log => {
      const matchSearch = 
        log.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.moduleTable.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchModule = selectedModule === 'ALL' || log.moduleTable === selectedModule;
      const matchUser = selectedUserId === 'ALL' || log.userId === selectedUserId;
      const matchAction = selectedActionType === 'ALL' || log.actionType === selectedActionType;

      return matchSearch && matchModule && matchUser && matchAction;
    });
  }, [auditChangeLogs, searchTerm, selectedModule, selectedUserId, selectedActionType]);

  // Action Type Badge Helper
  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'INSERT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'LOCK':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'UNLOCK':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExport = () => {
    const csvRows = [
      ['Change ID', 'Timestamp', 'User ID', 'User Name', 'Role', 'IP Address', 'Module/Table', 'Record ID', 'Action Type', 'Reason'],
      ...filteredLogs.map(log => [
        `"${log.id}"`,
        `"${log.timestamp}"`,
        `"${log.userId}"`,
        `"${log.userName}"`,
        `"${log.userRole}"`,
        `"${log.ipAddress}"`,
        `"${log.moduleTable}"`,
        `"${log.recordId}"`,
        `"${log.actionType}"`,
        `"${log.reason.replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FMS_Audit_Changes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <History className="w-4 h-4" />
            <span>AUDIT TRAIL & COMPLIANCE</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">DATA MODIFICATION LOG</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Audit Trail Changes
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Master & Parameter Audit
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit histori perubahan konfigurasi sistem, aturan fraud, daftar blacklist, dan parameter pengguna secara terperinci (Before vs After).
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-3">
          {exportSuccess && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Audit Data Berhasil Diexport
            </span>
          )}
          <button
            id="btn-export-audit-changes"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Changes</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{auditChangeLogs.length}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Recorded revisions</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">INSERT Records</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
              {auditChangeLogs.filter(c => c.actionType === 'INSERT').length}
            </h3>
            <p className="text-xs text-emerald-500 mt-0.5">New master records</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">UPDATE Records</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1 font-mono">
              {auditChangeLogs.filter(c => c.actionType === 'UPDATE').length}
            </h3>
            <p className="text-xs text-blue-400 mt-0.5">Modified parameters</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">DELETE Records</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1 font-mono">
              {auditChangeLogs.filter(c => c.actionType === 'DELETE').length}
            </h3>
            <p className="text-xs text-rose-400 mt-0.5">Removed configurations</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-change-logs"
              type="text"
              placeholder="Search record ID, module, user, or reason..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Module/Table */}
          <div>
            <select
              id="select-filter-module"
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Modules / Tables ({uniqueModules.length})</option>
              {uniqueModules.map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>

          {/* Filter User ID */}
          <div>
            <select
              id="select-filter-user-change"
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Users ({uniqueUsers.length})</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Filter Action Type */}
          <div>
            <select
              id="select-filter-action-type"
              value={selectedActionType}
              onChange={e => setSelectedActionType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Action Types</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(searchTerm || selectedModule !== 'ALL' || selectedUserId !== 'ALL' || selectedActionType !== 'ALL') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Active Filters:</span>
            {searchTerm && (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Keyword: "{searchTerm}"
              </span>
            )}
            {selectedModule !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                Table: {selectedModule}
              </span>
            )}
            {selectedUserId !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-mono">
                User: {selectedUserId}
              </span>
            )}
            {selectedActionType !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                Action: {selectedActionType}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedModule('ALL');
                setSelectedUserId('ALL');
                setSelectedActionType('ALL');
              }}
              className="text-blue-600 hover:text-blue-800 underline ml-auto text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Changes Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-800">
              Audit Data Change Logs ({filteredLogs.length} entries)
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Immutable write-only audit trail
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-3 text-center w-28">Action</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Module / Table</th>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-3 text-center w-24">Action Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Tidak ada data audit perubahan yang cocok.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-50 transition-colors group cursor-default"
                  >
                    {/* No */}
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {index + 1}
                    </td>

                    {/* Action (Button "View Details") */}
                    <td className="py-3 px-3 text-center">
                      <button
                        id={`btn-view-changes-${log.id}`}
                        onClick={() => setSelectedChange(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition text-xs font-semibold active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Details</span>
                      </button>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    {/* User ID */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-slate-800">
                        {log.userId}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {log.userName}
                      </div>
                    </td>

                    {/* Module / Table */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800">
                        <Database className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.moduleTable}</span>
                      </div>
                    </td>

                    {/* Record ID */}
                    <td className="py-3 px-4 font-mono text-xs font-bold text-blue-700">
                      {log.recordId}
                    </td>

                    {/* Action Type */}
                    <td className="py-3 px-3 text-center">
                      <span className={cn("px-2.5 py-0.5 rounded border text-[11px]", getActionBadge(log.actionType))}>
                        {log.actionType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {selectedChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Field-Level Audit Comparison
                    </h3>
                    <span className={cn("px-2 py-0.5 rounded text-[11px] font-mono border", getActionBadge(selectedChange.actionType))}>
                      {selectedChange.actionType}
                    </span>
                    <span className="font-mono text-xs text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                      {selectedChange.moduleTable}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Record ID: {selectedChange.recordId} • Change ID: {selectedChange.id}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-change-modal"
                onClick={() => setSelectedChange(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Change Reason & Meta Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Change Execution Reason & Context
                </div>
                <p className="text-sm font-medium text-slate-800">
                  "{selectedChange.reason}"
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-200 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Changed By</span>
                    <span className="font-bold text-slate-800">{selectedChange.userId}</span>
                    <span className="text-slate-500 block text-[10px]">{selectedChange.userName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">User Role</span>
                    <span className="font-semibold text-slate-800">{selectedChange.userRole}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">IP Address</span>
                    <span className="font-semibold text-slate-800">{selectedChange.ipAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Executed At</span>
                    <span className="font-semibold text-slate-800">{selectedChange.timestamp} WIB</span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-600" />
                    Field Differences (Old Value vs New Value)
                  </h4>
                  <span className="text-xs text-slate-400">
                    {selectedChange.changes.length} modified properties
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-4 w-1/4">Field Name</th>
                        <th className="py-2.5 px-4 w-3/8 text-rose-800 bg-rose-50/50">Old Value</th>
                        <th className="py-2.5 px-4 w-3/8 text-emerald-800 bg-emerald-50/50">New Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {selectedChange.changes.map((change, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          {/* Field Name */}
                          <td className="py-3 px-4 font-semibold text-slate-800 bg-slate-50/70 border-r border-slate-200">
                            {change.fieldName}
                          </td>

                          {/* Old Value (Red text) */}
                          <td className="py-3 px-4 text-rose-700 bg-rose-50/30 font-medium border-r border-slate-200">
                            <span className="inline-block px-2 py-0.5 rounded bg-rose-100/70 border border-rose-200 line-through">
                              {change.oldValue}
                            </span>
                          </td>

                          {/* New Value (Green text) */}
                          <td className="py-3 px-4 text-emerald-700 bg-emerald-50/30 font-bold">
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-100/70 border border-emerald-200">
                              {change.newValue}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Digitally signed audit checksum verified</span>
              </div>
              <button
                onClick={() => setSelectedChange(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
              >
                Tutup Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
