import React, { useState, useMemo } from 'react';
import { 
  KeyRound, 
  Download, 
  Search, 
  Filter, 
  Clock, 
  User, 
  Shield, 
  Compass, 
  Activity, 
  Globe, 
  ChevronRight,
  Check
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { AuditUserAccess, AccessActionTaken } from '../../types/auditTrail';
import { cn } from '../../lib/utils';

export const AuditTrailAccessPage: React.FC = () => {
  const { auditUserAccesses } = useFMS();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Unique roles
  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(auditUserAccesses.map(a => a.role)));
  }, [auditUserAccesses]);

  // Filtered accesses
  const filteredAccesses = useMemo(() => {
    return auditUserAccesses.filter(item => {
      const matchSearch =
        item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.accessedMenu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.details && item.details.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchAction = selectedAction === 'ALL' || item.actionTaken === selectedAction;
      const matchRole = selectedRole === 'ALL' || item.role === selectedRole;

      return matchSearch && matchAction && matchRole;
    });
  }, [auditUserAccesses, searchTerm, selectedAction, selectedRole]);

  const getActionBadge = (action: AccessActionTaken) => {
    switch (action) {
      case 'View':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Export':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Search':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Create':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Update':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Approve':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Lock':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-semibold';
      case 'Unlock':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExport = () => {
    const csvRows = [
      ['Access ID', 'Timestamp', 'User ID', 'Username', 'Role', 'Accessed Menu/Route', 'Action Taken', 'IP Address', 'Details'],
      ...filteredAccesses.map(a => [
        `"${a.id}"`,
        `"${a.timestamp}"`,
        `"${a.userId}"`,
        `"${a.username}"`,
        `"${a.role}"`,
        `"${a.accessedMenu}"`,
        `"${a.actionTaken}"`,
        `"${a.ipAddress}"`,
        `"${(a.details || '-').replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FMS_Audit_User_Access_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <KeyRound className="w-4 h-4" />
            <span>AUDIT TRAIL & PRIVILEGE</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">USER ACTIVITY & PERMISSIONS</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Audit Trail User Access
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Menu & Action Log
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan rute menu, laporan kasus, tindakan pencarian nasabah, ekspor berkas, dan verifikasi kepatuhan hak akses internal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {exportSuccess && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              Log Akses Diexport
            </span>
          )}
          <button
            id="btn-export-access-audit"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-access-audit"
              type="text"
              placeholder="Search user, menu, or details..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              id="select-filter-access-action"
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Actions (View, Export, Search, etc.)</option>
              <option value="View">View</option>
              <option value="Export">Export</option>
              <option value="Search">Search</option>
              <option value="Create">Create</option>
              <option value="Update">Update</option>
              <option value="Approve">Approve</option>
            </select>
          </div>

          <div>
            <select
              id="select-filter-access-role"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All User Roles ({uniqueRoles.length})</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Access Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">
            User Menu & Function Access Records ({filteredAccesses.length} entries)
          </span>
          <span className="text-xs text-slate-500">
            Compliance Standard: ISO 27001 / OJK POJK-75
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Accessed Menu / Route</th>
                <th className="py-3 px-3 text-center w-28">Action Taken</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAccesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada aktivitas akses pengguna yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredAccesses.map((item, index) => (
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

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">
                        {item.userId}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.username}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{item.role}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.accessedMenu}</span>
                      </div>
                      {item.details && (
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-sm" title={item.details}>
                          {item.details}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={cn("inline-block px-2.5 py-0.5 rounded border text-[11px] font-bold", getActionBadge(item.actionTaken))}>
                        {item.actionTaken}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.ipAddress}</span>
                      </div>
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
