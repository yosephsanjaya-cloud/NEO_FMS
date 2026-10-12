import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Lock, 
  Unlock, 
  LogOut, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Monitor, 
  Clock, 
  Globe, 
  UserCheck, 
  Info,
  X,
  FileText
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { UserSessionRecord, UserSessionStatus } from '../../types/systemParameter';
import { RuleApprovalQueueView } from '../../components/rules/RuleApprovalQueueView';

interface UserSessionPageProps {
  mode?: 'view' | 'approval';
}

export const UserSessionPage: React.FC<UserSessionPageProps> = ({ mode = 'view' }) => {
  const { 
    userSessions, 
    forceLogoutUser, 
    requestUnlockUser,
    getPendingRuleApprovalCount 
  } = useFMS();

  // If in approval mode, render RuleApprovalQueueView for 'User Session & Lockout'
  if (mode === 'approval') {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-orange-100 text-orange-700 rounded-lg">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">User Session & Lockout Approval</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Antrean persetujuan (Checker) untuk permohonan buka blokir akun dan reset kegagalan login user.
                </p>
              </div>
            </div>
          </div>
        </div>

        <RuleApprovalQueueView 
          targetType="User Session & Lockout" 
          title="Antrean Approval Unlock User Account" 
        />
      </div>
    );
  }

  // View Mode States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Modal states
  const [selectedLogoutUser, setSelectedLogoutUser] = useState<UserSessionRecord | null>(null);
  const [selectedUnlockUser, setSelectedUnlockUser] = useState<UserSessionRecord | null>(null);
  const [unlockReason, setUnlockReason] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Stat Cards Calculations
  const activeOnlineCount = useMemo(() => {
    return userSessions.filter(u => u.status === 'ONLINE').length;
  }, [userSessions]);

  const lockedAccountsCount = useMemo(() => {
    return userSessions.filter(u => u.status === 'LOCKED' || u.failedAttempts >= u.maxAttempts).length;
  }, [userSessions]);

  const pendingUnlockCount = useMemo(() => {
    return getPendingRuleApprovalCount('User Session & Lockout');
  }, [getPendingRuleApprovalCount]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return userSessions.filter(user => {
      // Status filter
      if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          user.userId.toLowerCase().includes(q) ||
          user.username.toLowerCase().includes(q) ||
          user.employeeName.toLowerCase().includes(q) ||
          user.role.toLowerCase().includes(q) ||
          user.lastLoginIp.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [userSessions, statusFilter, searchTerm]);

  // Handlers
  const handleConfirmLogout = () => {
    if (!selectedLogoutUser) return;
    forceLogoutUser(selectedLogoutUser.id);
    showToast(`Session user ${selectedLogoutUser.username} (${selectedLogoutUser.employeeName}) berhasil di-force logout.`, 'info');
    setSelectedLogoutUser(null);
  };

  const handleConfirmUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnlockUser) return;
    if (!unlockReason.trim()) return;

    requestUnlockUser(selectedUnlockUser.id, unlockReason);
    showToast(`Permohonan unlock account untuk ${selectedUnlockUser.username} berhasil dikirim ke Checker Supervisor.`, 'success');
    setSelectedUnlockUser(null);
    setUnlockReason('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-xs gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">User Session & Lockout Monitoring</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemantauan sesi aktif pengguna, percakapan log failed attempts, serta manajemen pembukaan akun terblokir.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Refresh</span>
          </button>
        </div>
      </div>

      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Active Online Users */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Online Users</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-slate-900">{activeOnlineCount}</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                Active Sessions
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Pengguna sedang terhubung ke sistem</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Locked Accounts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Locked Accounts</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-rose-600">{lockedAccountsCount}</span>
              <span className="text-xs text-rose-500 font-semibold">Failed Attempts ≥ 3</span>
            </div>
            <p className="text-[11px] text-slate-400">Akun terkunci akibat salah kredensial</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pending Unlock Requests */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Unlock Requests</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-amber-600">{pendingUnlockCount}</span>
              <span className="text-xs text-amber-600 font-semibold">Menunggu Checker</span>
            </div>
            <p className="text-[11px] text-slate-400">Tiket permohonan buka akun di Maker-Checker</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Unlock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar & Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cari Username, Nama, User ID, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="ONLINE">ONLINE (Aktif)</option>
                <option value="LOCKED">LOCKED (Terkunci)</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Session Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Nama & Username</th>
                <th className="py-3 px-4">Role & Group</th>
                <th className="py-3 px-4">Session Status</th>
                <th className="py-3 px-4 text-center">Failed Attempts</th>
                <th className="py-3 px-4">Last Login IP</th>
                <th className="py-3 px-4">Aktivitas Terakhir</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada sesi pengguna ditemukan</p>
                    <p className="text-[11px] mt-0.5">Coba sesuaikan kata kunci pencarian atau filter status</p>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => {
                  const isLocked = session.status === 'LOCKED' || session.failedAttempts >= session.maxAttempts;
                  const isOnline = session.status === 'ONLINE';

                  return (
                    <tr key={session.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                        {session.userId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{session.employeeName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">@{session.username}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{session.role}</div>
                        <div className="text-[11px] text-slate-500">{session.group}</div>
                      </td>
                      <td className="py-3 px-4">
                        {isOnline && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse mr-1.5"></span>
                            ONLINE
                          </span>
                        )}
                        {isLocked && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <Lock className="w-3 h-3 mr-1" />
                            LOCKED
                          </span>
                        )}
                        {!isOnline && !isLocked && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            OFFLINE
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                          session.failedAttempts >= session.maxAttempts 
                            ? 'bg-rose-500 text-white' 
                            : session.failedAttempts > 0 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {session.failedAttempts} / {session.maxAttempts}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{session.lastLoginIp}</span>
                        </div>
                        {session.deviceInfo && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{session.deviceInfo}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{session.lastActivity}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isOnline && (
                            <button
                              onClick={() => setSelectedLogoutUser(session)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-md transition flex items-center space-x-1 shadow-2xs"
                              title="Paksa Keluar Pengguna"
                            >
                              <LogOut className="w-3 h-3" />
                              <span>Force Logout</span>
                            </button>
                          )}

                          {isLocked && (
                            <button
                              onClick={() => setSelectedUnlockUser(session)}
                              disabled={session.unlockRequested}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center space-x-1 shadow-2xs ${
                                session.unlockRequested
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed opacity-80'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                              title={session.unlockRequested ? "Permohonan Unlock sudah dikirim" : "Kirim Permohonan Unlock Account"}
                            >
                              <Unlock className="w-3 h-3" />
                              <span>{session.unlockRequested ? 'Unlock Pending' : 'Unlock Account'}</span>
                            </button>
                          )}

                          {!isOnline && !isLocked && (
                            <span className="text-slate-400 text-[11px] italic">Tidak Ada Aksi</span>
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
      </div>

      {/* Force Logout Confirmation Modal */}
      {selectedLogoutUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">Konfirmasi Force Logout</h3>
              </div>
              <button onClick={() => setSelectedLogoutUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Apakah Anda yakin ingin mengakhiri sesi aktif untuk pengguna berikut secara paksa?
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 font-mono">
                <div><span className="text-slate-400">User ID:</span> <strong className="text-slate-900">{selectedLogoutUser.userId}</strong></div>
                <div><span className="text-slate-400">Username:</span> <strong className="text-slate-900">@{selectedLogoutUser.username}</strong></div>
                <div><span className="text-slate-400">Nama:</span> <strong className="text-slate-900">{selectedLogoutUser.employeeName}</strong></div>
                <div><span className="text-slate-400">IP:</span> {selectedLogoutUser.lastLoginIp}</div>
              </div>
              <p className="text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px]">
                ⚠️ Pengguna akan secara otomatis dikeluarkan dari sistem pada aktivitas berikutnya dan harus login ulang.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedLogoutUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ya, Force Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Unlock Modal (Maker Ticket Trigger) */}
      {selectedUnlockUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConfirmUnlock} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-emerald-700">
                <Unlock className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">Permohonan Unlock Account (Maker)</h3>
              </div>
              <button type="button" onClick={() => setSelectedUnlockUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Kirim permohonan pembukaan akun terblokir ke <strong>L2 Checker Supervisor</strong> untuk dikaji dan disetujui.
              </p>

              <div className="bg-rose-50/70 p-3.5 rounded-lg border border-rose-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">User ID & Username:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedUnlockUser.userId} (@{selectedUnlockUser.username})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Pengguna:</span>
                  <span className="font-semibold text-slate-900">{selectedUnlockUser.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role & Group:</span>
                  <span className="text-slate-800">{selectedUnlockUser.role} ({selectedUnlockUser.group})</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-rose-200/60">
                  <span className="text-rose-700 font-semibold">Status Lockout:</span>
                  <span className="font-mono font-bold text-rose-700">
                    LOCKED ({selectedUnlockUser.failedAttempts}/{selectedUnlockUser.maxAttempts} Failed Attempts)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan & Catatan Permohonan Unlock <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={unlockReason}
                  onChange={(e) => setUnlockReason(e.target.value)}
                  placeholder="Contoh: User menghubungi Helpdesk via telepon (Ref: HD-98120). Identitas terverifikasi via NIK & OTP. Mohon pembukaan blokir akun."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-[11px] text-blue-800 flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Sesuai kebijakan Maker-Checker, tindakan ini akan membuat <strong>Tiket Approval</strong> baru yang wajib disetujui oleh Checker sebelum akun resmi dibuka kembali.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUnlockUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center space-x-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Kirim Permohonan Tiket</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
