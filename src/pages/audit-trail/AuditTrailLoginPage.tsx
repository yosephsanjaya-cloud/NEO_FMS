import React, { useState, useMemo } from 'react';
import { 
  LogIn, 
  LogOut, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Monitor, 
  Globe, 
  User, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Check
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { AuditUserLogin, LoginStatus, LoginAction } from '../../types/auditTrail';
import { cn } from '../../lib/utils';

export const AuditTrailLoginPage: React.FC = () => {
  const { auditUserLogins } = useFMS();

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Filtered list
  const filteredLogins = useMemo(() => {
    return auditUserLogins.filter(item => {
      const matchSearch =
        item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.deviceBrowser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.failureReason && item.failureReason.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchAction = selectedAction === 'ALL' || item.action === selectedAction;

      return matchSearch && matchStatus && matchAction;
    });
  }, [auditUserLogins, searchTerm, selectedStatus, selectedAction]);

  const totalSuccess = auditUserLogins.filter(l => l.status === 'Success').length;
  const totalFailed = auditUserLogins.filter(l => l.status === 'Failed').length;

  const handleExport = () => {
    const csvRows = [
      ['Log ID', 'Timestamp', 'User ID', 'Username', 'IP Address', 'Device/Browser', 'Status', 'Action', 'Failure Reason'],
      ...filteredLogins.map(l => [
        `"${l.id}"`,
        `"${l.timestamp}"`,
        `"${l.userId}"`,
        `"${l.username}"`,
        `"${l.ipAddress}"`,
        `"${l.deviceBrowser}"`,
        `"${l.status}"`,
        `"${l.action}"`,
        `"${l.failureReason || '-'}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FMS_Audit_User_Login_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <LogIn className="w-4 h-4" />
            <span>AUDIT TRAIL & SECURITY</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">AUTHENTICATION ACTIVITY</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Audit Trail User Login
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Session & Auth Log
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pemantauan histori otentikasi login/logout pengguna FMS, IP Address, perangkat peramban, serta deteksi kegagalan login mencurigakan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {exportSuccess && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              File Berhasil Diexport
            </span>
          )}
          <button
            id="btn-export-login-audit"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Auth Events</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{auditUserLogins.length}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Login & logout attempts</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <LogIn className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Successful Logins</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{totalSuccess}</h3>
            <p className="text-xs text-emerald-500 mt-0.5">Authenticated sessions</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Failed Attempts</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1 font-mono">{totalFailed}</h3>
            <p className="text-xs text-rose-500 mt-0.5">Potential unauthorized access</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-login-audit"
              type="text"
              placeholder="Search user, IP, browser..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              id="select-filter-login-status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status (Success & Failed)</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div>
            <select
              id="select-filter-login-action"
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Actions (Login & Logout)</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">
            User Authentication Logs ({filteredLogins.length} entries)
          </span>
          <span className="text-xs text-slate-500">
            Audit Retention: 365 Days
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Device / Browser</th>
                <th className="py-3 px-3 text-center w-24">Status</th>
                <th className="py-3 px-3 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogins.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada riwayat login yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredLogins.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.timestamp}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {item.userId}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {item.username}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.ipAddress}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.deviceBrowser}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[11px] font-bold",
                        item.status === 'Success' 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      )}>
                        {item.status === 'Success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{item.status}</span>
                      </span>
                      {item.failureReason && (
                        <div className="text-[10px] text-rose-600 mt-0.5 font-medium truncate max-w-xs" title={item.failureReason}>
                          {item.failureReason}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[11px] font-semibold",
                        item.action === 'Login'
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-100 text-slate-700 border-slate-300"
                      )}>
                        {item.action === 'Login' ? <LogIn className="w-3 h-3 text-blue-600" /> : <LogOut className="w-3 h-3 text-slate-500" />}
                        <span>{item.action}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
