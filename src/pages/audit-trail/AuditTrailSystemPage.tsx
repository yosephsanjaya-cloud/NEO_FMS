import React, { useState, useMemo } from 'react';
import { 
  Terminal, 
  Download, 
  Search, 
  Filter, 
  AlertTriangle, 
  Server, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  ShieldAlert, 
  Cpu, 
  Clock, 
  ChevronRight,
  Eye,
  FileCode2,
  Layers
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { AuditSystemLog, SystemExceptionType } from '../../types/auditTrail';
import { cn } from '../../lib/utils';

export const AuditTrailSystemPage: React.FC = () => {
  const { auditSystemLogs } = useFMS();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHost, setSelectedHost] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL');

  // Modal state
  const [selectedLog, setSelectedLog] = useState<AuditSystemLog | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Extract unique hosts and users for filter dropdowns
  const uniqueHosts = useMemo(() => {
    return Array.from(new Set(auditSystemLogs.map(l => l.host)));
  }, [auditSystemLogs]);

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(auditSystemLogs.map(l => l.user)));
  }, [auditSystemLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditSystemLogs.filter(log => {
      const matchSearch = 
        log.errorMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.code.toString().includes(searchTerm) ||
        log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchHost = selectedHost === 'ALL' || log.host === selectedHost;
      const matchType = selectedType === 'ALL' || log.type === selectedType;
      const matchUser = selectedUserId === 'ALL' || log.user === selectedUserId;

      return matchSearch && matchHost && matchType && matchUser;
    });
  }, [auditSystemLogs, searchTerm, selectedHost, selectedType, selectedUserId]);

  // Metrics
  const totalErrors = auditSystemLogs.length;
  const criticalCount = auditSystemLogs.filter(l => l.severity === 'Critical' || l.severity === 'High').length;
  const oomCount = auditSystemLogs.filter(l => l.type === 'OutOfMemory').length;
  const server500Count = auditSystemLogs.filter(l => l.code >= 500).length;

  const handleCopyStackTrace = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadLog = () => {
    const csvRows = [
      ['Log ID', 'Timestamp', 'Host', 'Code', 'Type', 'Severity', 'User', 'URL Path', 'Error Message'],
      ...filteredLogs.map(log => [
        `"${log.id}"`,
        `"${log.dateTime}"`,
        `"${log.host}"`,
        `"${log.code}"`,
        `"${log.type}"`,
        `"${log.severity}"`,
        `"${log.user.replace(/"/g, '""')}"`,
        `"${log.urlPath || '-'}"`,
        `"${log.errorMessage.replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FMS_Audit_System_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const getTypeBadge = (type: SystemExceptionType) => {
    switch (type) {
      case 'OutOfMemory':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'NullReference':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      case 'Http':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
      case 'SqlException':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'TimeoutException':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    }
  };

  const getCodeBadge = (code: number) => {
    if (code >= 500) {
      return 'bg-red-100 text-red-800 border-red-200 font-bold';
    } else if (code >= 400) {
      return 'bg-amber-100 text-amber-800 border-amber-200 font-semibold';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <Terminal className="w-4 h-4" />
            <span>AUDIT TRAIL & LOGGING SUBSYSTEM</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">SYSTEM ERROR LOG</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Audit Trail System
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              ELMAH Replacement
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pemantauan log exception sistem aplikasi, unhandled runtime error, gateway timeout, dan investigasi call stack trace.
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-3">
          {downloadSuccess && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Log Berhasil Diunduh
            </span>
          )}
          <button
            id="btn-download-system-log"
            onClick={handleDownloadLog}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Log</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Error Logs</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{totalErrors}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Recorded runtime exceptions</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Critical / High</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1 font-mono">{criticalCount}</h3>
            <p className="text-xs text-rose-400 mt-0.5">Requires immediate attention</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">5xx Server Failures</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">{server500Count}</h3>
            <p className="text-xs text-amber-500 mt-0.5">HTTP 500 / 502 / 504</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Monitored Hosts</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{uniqueHosts.length}</h3>
            <p className="text-xs text-slate-400 mt-0.5">App, Worker & Gateway nodes</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Server className="w-5 h-5" />
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
              id="input-search-system-logs"
              type="text"
              placeholder="Search error message, code, host, user..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Host */}
          <div>
            <select
              id="select-filter-host"
              value={selectedHost}
              onChange={e => setSelectedHost(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Hosts ({uniqueHosts.length})</option>
              {uniqueHosts.map(host => (
                <option key={host} value={host}>{host}</option>
              ))}
            </select>
          </div>

          {/* Filter Exception Type */}
          <div>
            <select
              id="select-filter-type"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Exception Types</option>
              <option value="Exception">Exception</option>
              <option value="OutOfMemory">OutOfMemory</option>
              <option value="Http">Http</option>
              <option value="NullReference">NullReference</option>
              <option value="SqlException">SqlException</option>
              <option value="TimeoutException">TimeoutException</option>
            </select>
          </div>

          {/* Filter User ID */}
          <div>
            <select
              id="select-filter-user"
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
        </div>

        {/* Active Filter Badges */}
        {(searchTerm || selectedHost !== 'ALL' || selectedType !== 'ALL' || selectedUserId !== 'ALL') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Active Filters:</span>
            {searchTerm && (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Keyword: "{searchTerm}"
              </span>
            )}
            {selectedHost !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Host: {selectedHost}
              </span>
            )}
            {selectedType !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Type: {selectedType}
              </span>
            )}
            {selectedUserId !== 'ALL' && (
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                User: {selectedUserId}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedHost('ALL');
                setSelectedType('ALL');
                setSelectedUserId('ALL');
              }}
              className="text-blue-600 hover:text-blue-800 underline ml-auto text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-800">
              System Exception Log Records ({filteredLogs.length} entries)
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Real-time buffer log: 15-minute rotation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Host</th>
                <th className="py-3 px-3 text-center w-16">Code</th>
                <th className="py-3 px-3 text-center w-28">Type</th>
                <th className="py-3 px-4">Error Message</th>
                <th className="py-3 px-3 text-center w-28">Details</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-medium">Tidak ada log error yang sesuai dengan filter.</p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedHost('ALL');
                          setSelectedType('ALL');
                          setSelectedUserId('ALL');
                        }}
                        className="text-xs text-blue-600 underline font-semibold mt-1"
                      >
                        Bersihkan filter pencarian
                      </button>
                    </div>
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

                    {/* Host */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-700">
                        <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold">{log.host}</span>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3 px-3 text-center">
                      <span className={cn("px-2 py-0.5 rounded font-mono text-xs border", getCodeBadge(log.code))}>
                        {log.code}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 text-center">
                      <span className={cn("inline-block px-2 py-0.5 rounded border text-[11px]", getTypeBadge(log.type))}>
                        {log.type}
                      </span>
                    </td>

                    {/* Error Message */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-mono text-slate-900 text-xs truncate" title={log.errorMessage}>
                        {log.errorMessage}
                      </div>
                      {log.urlPath && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                          <span className="px-1 rounded bg-slate-100 font-bold text-slate-700">{log.httpMethod || 'API'}</span>
                          <span className="truncate">{log.urlPath}</span>
                        </div>
                      )}
                    </td>

                    {/* Details (Stack Trace button) */}
                    <td className="py-3 px-3 text-center">
                      <button
                        id={`btn-view-stacktrace-${log.id}`}
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition text-xs font-semibold"
                      >
                        <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Stack Trace</span>
                      </button>
                    </td>

                    {/* User */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700 text-xs">
                        {log.user}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.dateTime}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stack Trace Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      Diagnostic Stack Trace & Exception Details
                    </h3>
                    <span className={cn("px-2 py-0.5 rounded text-[11px] font-mono border", getCodeBadge(selectedLog.code))}>
                      HTTP {selectedLog.code}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded text-[11px] font-mono border", getTypeBadge(selectedLog.type))}>
                      {selectedLog.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Log ID: {selectedLog.id} • Host: {selectedLog.host} • {selectedLog.dateTime} WIB
                  </p>
                </div>
              </div>
              <button
                id="btn-close-stacktrace-modal"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Error Message Box */}
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Unhandled Exception Message
                </div>
                <p className="text-sm font-mono font-semibold break-all">
                  {selectedLog.errorMessage}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">Server Host</span>
                  <span className="font-semibold text-slate-800">{selectedLog.host}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Triggered By</span>
                  <span className="font-semibold text-slate-800">{selectedLog.user}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Source Location</span>
                  <span className="font-semibold text-slate-800 truncate block" title={selectedLog.source}>
                    {selectedLog.source}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Severity Rating</span>
                  <span className={cn(
                    "font-bold uppercase",
                    selectedLog.severity === 'Critical' ? 'text-red-600' :
                    selectedLog.severity === 'High' ? 'text-rose-600' :
                    selectedLog.severity === 'Medium' ? 'text-amber-600' : 'text-slate-600'
                  )}>
                    {selectedLog.severity}
                  </span>
                </div>
              </div>

              {/* Stack Trace Code Container */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <FileCode2 className="w-4 h-4 text-blue-600" />
                    CLR / Native Call Stack
                  </label>
                  <button
                    id="btn-copy-stack-trace"
                    onClick={() => handleCopyStackTrace(selectedLog.stackTrace)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition active:scale-95"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Stack Trace</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto max-h-72 border border-slate-800 shadow-inner">
                  <pre className="whitespace-pre-wrap">{selectedLog.stackTrace}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Log reference stored in audit archive table <code className="font-mono font-semibold">FMS_AUDIT_SYSTEM_LOG</code>
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
              >
                Tutup Stack Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
