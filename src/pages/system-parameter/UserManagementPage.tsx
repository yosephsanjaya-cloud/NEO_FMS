import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  Search, 
  Filter, 
  RotateCcw, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Shield, 
  Users, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  X, 
  KeyRound, 
  Layers, 
  UserCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { SystemUser } from '../../types/systemParameter';
import { cn } from '../../lib/utils';

export const UserManagementPage: React.FC = () => {
  const { 
    systemUsers, 
    systemGroups, 
    systemRoles, 
    addSystemUser, 
    updateSystemUser,
    setActiveTab 
  } = useFMS();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    userId: '',
    username: '',
    fullName: '',
    email: '',
    group: '',
    role: '',
    riskDomain: 'FRAUD ONLY' as 'FRAUD ONLY' | 'AML ONLY' | 'FULL ACCESS',
    status: 'Active' as 'Active' | 'Inactive',
    password: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Quick Notification Handler
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingUserId(null);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      userId: `USR-${randomSuffix}`,
      username: '',
      fullName: '',
      email: '',
      group: systemGroups[0]?.groupName || 'AFC L1',
      role: systemRoles[0]?.roleName || 'Fraud',
      riskDomain: 'FRAUD ONLY',
      status: 'Active',
      password: ''
    });
    setFormErrors({});
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: SystemUser) => {
    setModalMode('edit');
    setEditingUserId(user.id);
    setFormData({
      userId: user.userId,
      username: user.username,
      fullName: user.fullName || '',
      email: user.email,
      group: user.group,
      role: user.role,
      riskDomain: (user.riskDomain as any) || (user.role.toLowerCase().includes('aml') ? 'AML ONLY' : user.role.toLowerCase().includes('fraud') ? 'FRAUD ONLY' : 'FULL ACCESS'),
      status: user.status,
      password: '' // empty means keep existing password
    });
    setFormErrors({});
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Generate random secure password helper
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 12; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: res }));
    setShowPassword(true);
  };

  // Validate and Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username wajib diisi';
    } else if (formData.username.length < 3) {
      errors.username = 'Username minimal 3 karakter';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Format email tidak valid (contoh: user@banksampoerna.com)';
    }

    if (!formData.group) {
      errors.group = 'Pilih grup kerja';
    }

    if (!formData.role) {
      errors.role = 'Pilih role akses';
    }

    if (modalMode === 'add' && !formData.password) {
      errors.password = 'Password awal wajib ditentukan';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalMode === 'add') {
      addSystemUser({
        userId: formData.userId.trim() || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        username: formData.username.trim(),
        fullName: formData.fullName.trim() || formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        group: formData.group,
        role: formData.role,
        riskDomain: formData.riskDomain,
        status: formData.status,
        password: formData.password
      });
      showToast(`User baru "${formData.username}" berhasil didaftarkan.`);
    } else if (modalMode === 'edit' && editingUserId) {
      updateSystemUser(editingUserId, {
        username: formData.username.trim(),
        fullName: formData.fullName.trim() || formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        group: formData.group,
        role: formData.role,
        riskDomain: formData.riskDomain,
        status: formData.status,
        ...(formData.password ? { password: formData.password } : {})
      });
      showToast(`User "${formData.username}" berhasil diperbarui.`);
    }

    setIsModalOpen(false);
  };

  // Quick Toggle Status
  const handleToggleStatus = (user: SystemUser) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    updateSystemUser(user.id, { status: nextStatus });
    showToast(`Status user ${user.username} diubah menjadi ${nextStatus}.`);
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return systemUsers.filter(user => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchUser = user.username.toLowerCase().includes(query);
        const matchName = user.fullName ? user.fullName.toLowerCase().includes(query) : false;
        const matchEmail = user.email.toLowerCase().includes(query);
        const matchId = user.userId.toLowerCase().includes(query);
        if (!matchUser && !matchName && !matchEmail && !matchId) return false;
      }
      if (groupFilter !== 'ALL' && user.group !== groupFilter) return false;
      if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;
      return true;
    });
  }, [systemUsers, searchQuery, groupFilter, roleFilter, statusFilter]);

  // Stats Counters
  const totalUsers = systemUsers.length;
  const activeCount = systemUsers.filter(u => u.status === 'Active').length;
  const inactiveCount = systemUsers.filter(u => u.status === 'Inactive').length;

  // Helper Badge Color for Role
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'fraud':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'aml':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'it':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Helper Badge Color for Risk Domain
  const getDomainBadge = (domain?: string) => {
    switch (domain) {
      case 'FRAUD ONLY':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'AML ONLY':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'FULL ACCESS':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 text-xs animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{notification}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider font-mono">
                  System Parameter
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-medium text-slate-500 font-mono">
                  /system-parameter/user
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
                User Management
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data otorisasi akun pengguna, penugasan kelompok kerja (Group), peran otorisasi (Role), dan reset kredensial.
          </p>
        </div>

        {/* Header Action: Add User */}
        <div className="flex items-center gap-2">
          <button
            id="btn-add-user-header"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add User</span>
          </button>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total User</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{totalUsers}</span>
            <span className="text-[11px] text-slate-400">Users</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">User Aktif</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{activeCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Bisa Login</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">User Nonaktif</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-600">{inactiveCount}</span>
            <span className="text-[11px] text-slate-400">Tersuspend</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Group / Role Master</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-600">
              {systemGroups.length} / {systemRoles.length}
            </span>
            <span className="text-[11px] text-slate-400">Group/Role</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Query */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-user"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Username, Email, atau User ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
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

          {/* Group Filter */}
          <div className="w-full md:w-48">
            <select
              id="select-filter-group"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">Semua Group ({systemGroups.length})</option>
              {systemGroups.map(g => (
                <option key={g.id} value={g.groupName}>{g.groupName}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-40">
            <select
              id="select-filter-role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">Semua Role</option>
              {systemRoles.map(r => (
                <option key={r.id} value={r.roleName}>{r.roleName}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-36">
            <select
              id="select-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || groupFilter !== 'ALL' || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setGroupFilter('ALL');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition shrink-0"
              title="Reset Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Daftar Akun Pengguna</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold font-mono">
              {filteredUsers.length} Users
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Sistem Keamanan Bank Sampoerna • RBAC Multi-Tier
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-3 text-center w-20">Action</th>
                <th className="py-3 px-3.5">User ID</th>
                <th className="py-3 px-3.5">Username</th>
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-3.5">Group</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3.5">Domain Risiko</th>
                <th className="py-3 px-3.5">Email</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3.5">Updated Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <span className="text-sm font-medium">Tidak ada data user yang sesuai</span>
                      <span className="text-xs text-slate-400">Silakan sesuaikan kata kunci pencarian atau filter</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const initials = (user.fullName || user.username)
                    .split(' ')
                    .map(part => part[0]?.toUpperCase())
                    .join('')
                    .slice(0, 2) || 'U';

                  const userDomain = user.riskDomain || (user.role.toLowerCase().includes('aml') ? 'AML ONLY' : user.role.toLowerCase().includes('fraud') ? 'FRAUD ONLY' : 'FULL ACCESS');

                  return (
                    <tr 
                      key={user.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* 1. No */}
                      <td className="py-3 px-3.5 text-center font-mono text-slate-400 font-medium">
                        {idx + 1}
                      </td>

                      {/* 2. Action (Edit) */}
                      <td className="py-3 px-3 text-center">
                        <button
                          id={`btn-edit-user-${user.id}`}
                          onClick={() => handleOpenEditModal(user)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                          title="Edit User & Password"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>

                      {/* 3. User ID */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-900 font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {user.userId}
                          </span>
                          <button
                            onClick={() => handleCopy(user.userId, `id-${user.id}`)}
                            className="text-slate-400 hover:text-slate-600 transition p-0.5"
                            title="Salin User ID"
                          >
                            {copiedId === `id-${user.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 4. Username */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-2xs font-mono">
                            {initials}
                          </div>
                          <span className="font-semibold text-slate-900 font-mono text-xs">
                            {user.username}
                          </span>
                        </div>
                      </td>

                      {/* 5. Nama */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {user.fullName || user.username}
                        </span>
                      </td>

                      {/* 6. Group */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {user.group}
                          </span>
                          {user.escalationPath && (
                            <div className="text-[10px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                              <span className="text-slate-400">Escalation:</span>
                              <span className="text-blue-700">{user.escalationPath}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 7. Role */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border",
                          getRoleBadge(user.role)
                        )}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>

                      {/* 8. Domain Risiko */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-tight border uppercase font-mono",
                          getDomainBadge(userDomain)
                        )}>
                          {userDomain}
                        </span>
                      </td>

                      {/* 9. Email */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px]">{user.email}</span>
                        </div>
                      </td>

                      {/* 10. Status */}
                      <td className="py-3 px-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title="Klik untuk ubah status cepat"
                          className="cursor-pointer"
                        >
                          {user.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              Inactive
                            </span>
                          )}
                        </button>
                      </td>

                      {/* 11. Updated Date */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {user.updatedDate}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL FORM: ADD / EDIT USER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  {modalMode === 'add' ? <UserPlus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {modalMode === 'add' ? 'Tambah Akun Pengguna Baru' : `Edit User: ${formData.username}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {modalMode === 'add' 
                      ? 'Daftarkan pengguna baru ke dalam parameter sistem FMS' 
                      : 'Perbarui detail otorisasi grup, peran, atau reset kredensial'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* User ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={formData.userId}
                  disabled={modalMode === 'edit'}
                  onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                  className={cn(
                    "w-full px-3 py-2 text-xs rounded-lg border font-mono font-bold focus:outline-hidden",
                    modalMode === 'edit'
                      ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                      : "bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  )}
                  placeholder="e.g. USR-00103"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {modalMode === 'edit' ? 'User ID bersifat permanen (read-only)' : 'ID unik pengguna (otomatis digenerate)'}
                </span>
              </div>

              {/* Username & Nama Lengkap Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, username: e.target.value }));
                      if (formErrors.username) setFormErrors(prev => ({ ...prev, username: '' }));
                    }}
                    placeholder="e.g. joko.susanto"
                    className={cn(
                      "w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden",
                      formErrors.username 
                        ? "border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-500/20" 
                        : "border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    )}
                  />
                  {formErrors.username && (
                    <span className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.username}
                    </span>
                  )}
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap (Full Name)
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="e.g. Joko Susanto"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Nama lengkap karyawan / personil
                  </span>
                </div>
              </div>

              {/* Email & Domain Risiko Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Resmi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="nama@banksampoerna.com"
                    className={cn(
                      "w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden",
                      formErrors.email 
                        ? "border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-500/20" 
                        : "border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    )}
                  />
                  {formErrors.email && (
                    <span className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {formErrors.email}
                    </span>
                  )}
                </div>

                {/* Domain Risiko */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Domain Risiko (Scope) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.riskDomain}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskDomain: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="FRAUD ONLY">FRAUD ONLY (Hanya Modul Fraud)</option>
                    <option value="AML ONLY">AML ONLY (Hanya Modul APU PPT / AML)</option>
                    <option value="FULL ACCESS">FULL ACCESS (Fraud, AML & Administrasi)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Penegasan hak akses domain RBAC
                  </span>
                </div>
              </div>

              {/* Group & Role Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Group Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelompok Kerja (Group) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData(prev => ({ ...prev, group: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {systemGroups.map(g => (
                      <option key={g.id} value={g.groupName}>
                        {g.groupName}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Penugasan investigasi & antrean alert
                  </span>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Otorisasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {systemRoles.map(r => (
                      <option key={r.id} value={r.roleName}>
                        {r.roleName} - {r.description}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Hak akses domain (Fraud / AML / IT)
                  </span>
                </div>
              </div>

              {/* Status Active (Toggle / Select) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status Akun
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'Active' }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Active (Dapat Login & Menangani Kasus)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={() => setFormData(prev => ({ ...prev, status: 'Inactive' }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Inactive (Suspended)
                    </span>
                  </label>
                </div>
              </div>

              {/* Reset/Change Password */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    {modalMode === 'add' ? 'Password Awal' : 'Reset / Ganti Password'}
                    {modalMode === 'add' && <span className="text-red-500"> *</span>}
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Generate Password Acak</span>
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, password: e.target.value }));
                      if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
                    }}
                    placeholder={modalMode === 'edit' ? 'Kosongkan jika tidak ingin mengubah password' : 'Min 6 karakter acak'}
                    className={cn(
                      "w-full pl-9 pr-10 py-2 text-xs rounded-lg border font-mono focus:outline-hidden",
                      formErrors.password
                        ? "border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-500/20"
                        : "border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password ? (
                  <span className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.password}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {modalMode === 'edit' 
                      ? 'Biarkan kosong untuk mempertahankan password lama pengguna.' 
                      : 'Kredensial ini akan digunakan pengguna untuk autentikasi pertama kali.'}
                  </span>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition"
                >
                  {modalMode === 'add' ? 'Simpan User Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
