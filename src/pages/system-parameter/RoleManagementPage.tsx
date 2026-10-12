import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Shield, 
  Users, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  RotateCcw, 
  Check, 
  Copy,
  Lock,
  Key,
  Flame,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { SystemRole } from '../../types/systemParameter';
import { cn } from '../../lib/utils';

export const RoleManagementPage: React.FC = () => {
  const { 
    systemRoles, 
    systemUsers, 
    addSystemRole, 
    updateSystemRole 
  } = useFMS();

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    roleName: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingRoleId(null);
    setFormData({
      roleName: '',
      description: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (role: SystemRole) => {
    setModalMode('edit');
    setEditingRoleId(role.id);
    setFormData({
      roleName: role.roleName,
      description: role.description
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.roleName.trim()) {
      errors.roleName = 'Nama Role wajib diisi';
    }

    if (!formData.description.trim()) {
      errors.description = 'Deskripsi otorisasi role wajib diisi';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalMode === 'add') {
      addSystemRole({
        roleName: formData.roleName.trim(),
        description: formData.description.trim()
      });
      showToast(`Role baru "${formData.roleName}" berhasil ditambahkan.`);
    } else if (modalMode === 'edit' && editingRoleId) {
      updateSystemRole(editingRoleId, {
        roleName: formData.roleName.trim(),
        description: formData.description.trim()
      });
      showToast(`Role "${formData.roleName}" berhasil diperbarui.`);
    }

    setIsModalOpen(false);
  };

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return systemRoles.filter(r => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return r.roleName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    });
  }, [systemRoles, searchQuery]);

  // Role Metadata Helper (Style & Icon)
  const getRoleVisual = (name: string) => {
    switch (name.toUpperCase()) {
      case 'FRAUD':
        return {
          badge: 'bg-red-50 text-red-700 border-red-200',
          domainBadge: 'bg-red-50 text-red-700 border-red-200',
          domain: 'FRAUD ONLY',
          icon: Flame,
          scope: 'DOMAIN FRAUD ONLY: Kasus Alert Transaksi, Rule Config Fraud, Blacklist/Watchlist Fraud'
        };
      case 'AML':
        return {
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          domainBadge: 'bg-amber-50 text-amber-800 border-amber-200',
          domain: 'AML ONLY',
          icon: ShieldCheck,
          scope: 'DOMAIN AML ONLY: AML Master Blacklist, External Watchlist, Agregasi CIF AML, STR/SAR'
        };
      case 'ADMIN':
        return {
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
          domainBadge: 'bg-purple-50 text-purple-700 border-purple-200',
          domain: 'FULL ACCESS',
          icon: Shield,
          scope: 'DOMAIN FULL ACCESS: Master Hak Akses Fraud, AML & Seluruh Parameter Sistem'
        };
      case 'IT':
        return {
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          domainBadge: 'bg-blue-50 text-blue-700 border-blue-200',
          domain: 'FULL ACCESS',
          icon: Terminal,
          scope: 'DOMAIN FULL ACCESS: User Master, Role & Group Matrix, System Config'
        };
      default:
        return {
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          domainBadge: 'bg-slate-50 text-slate-700 border-slate-200',
          domain: 'CUSTOM',
          icon: Key,
          scope: 'Custom RBAC Permission Scope'
        };
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
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider font-mono">
                  System Parameter
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-medium text-slate-500 font-mono">
                  /system-parameter/role
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
                Role Management
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Definisi peran hak akses otorisasi domain (Fraud / Anti Fraud Center, AML / APU PPT, dan IT Administrasi).
          </p>
        </div>

        {/* Header Action: Add Role */}
        <div className="flex items-center gap-2">
          <button
            id="btn-add-role-header"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Role</span>
          </button>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Role Master</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{systemRoles.length}</span>
            <span className="text-[11px] text-slate-400">Roles</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pengguna Terdaftar</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{systemUsers.length}</span>
            <span className="text-[11px] text-emerald-700 font-medium">Mapped Users</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Security Standard</span>
            <Lock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-600">RBAC</span>
            <span className="text-[11px] text-slate-400">Segregation</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Audit Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-600">OJK / BI</span>
            <span className="text-[11px] text-purple-700 font-medium">Compliant</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-role"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama role atau deskripsi hak akses..."
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

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pencarian</span>
          </button>
        )}
      </div>

      {/* 4. MAIN DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Master Role Otorisasi Sistem</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold font-mono">
              {filteredRoles.length} Roles
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Pemisahan Fungsi Hak Akses (Segregation of Duties)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-3 text-center w-20">Action</th>
                <th className="py-3 px-4 w-48">Role Name</th>
                <th className="py-3 px-3.5 w-36">Domain Scope</th>
                <th className="py-3 px-4">Description &amp; Access Matrix</th>
                <th className="py-3 px-3.5 text-center w-28">Assigned Users</th>
                <th className="py-3 px-3.5 w-44">Updated Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Shield className="w-8 h-8 text-slate-300" />
                      <span className="text-sm font-medium">Tidak ada data role yang sesuai</span>
                      <span className="text-xs text-slate-400">Silakan gunakan kata kunci lain</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role, idx) => {
                  const assignedCount = systemUsers.filter(u => u.role.toLowerCase() === role.roleName.toLowerCase()).length;
                  const visual = getRoleVisual(role.roleName);
                  const Icon = visual.icon;

                  return (
                    <tr 
                      key={role.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* 1. No */}
                      <td className="py-3.5 px-3.5 text-center font-mono text-slate-400 font-medium">
                        {idx + 1}
                      </td>

                      {/* 2. Action (Edit) */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          id={`btn-edit-role-${role.id}`}
                          onClick={() => handleOpenEditModal(role)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                          title="Edit Role"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>

                      {/* 3. Role Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border shadow-2xs",
                            visual.badge
                          )}>
                            <Icon className="w-3.5 h-3.5" />
                            {role.roleName}
                          </span>
                          <button
                            onClick={() => handleCopy(role.roleName, `rol-${role.id}`)}
                            className="text-slate-400 hover:text-slate-600 transition"
                            title="Salin Nama Role"
                          >
                            {copiedId === `rol-${role.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 4. Domain Scope */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono border uppercase tracking-wider",
                          visual.domainBadge
                        )}>
                          {visual.domain}
                        </span>
                      </td>

                      {/* 5. Description & Access Matrix */}
                      <td className="py-3.5 px-4 text-slate-700 text-xs">
                        <div className="font-semibold text-slate-900">{role.description}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{visual.scope}</div>
                      </td>

                      {/* Assigned Users Badge */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Users className="w-3 h-3 text-slate-400" />
                          {assignedCount} User
                        </span>
                      </td>

                      {/* 6. Updated Date */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {role.updatedDate}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL FORM: ADD / EDIT ROLE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  {modalMode === 'add' ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {modalMode === 'add' ? 'Tambah Role Baru' : `Edit Role: ${formData.roleName}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {modalMode === 'add' 
                      ? 'Definisikan peran otorisasi baru dalam sistem FMS' 
                      : 'Perbarui nama peran dan deskripsi lingkup wewenang'}
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
              {/* Role Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.roleName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, roleName: e.target.value }));
                    if (formErrors.roleName) setFormErrors(prev => ({ ...prev, roleName: '' }));
                  }}
                  placeholder="e.g. Compliance Auditor / Risk Manager"
                  className={cn(
                    "w-full px-3 py-2 text-xs rounded-lg border font-semibold focus:outline-hidden",
                    formErrors.roleName 
                      ? "border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-500/20" 
                      : "border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  )}
                />
                {formErrors.roleName && (
                  <span className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.roleName}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Nama unik peran (contoh: Fraud, AML, IT).
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Otorisasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    if (formErrors.description) setFormErrors(prev => ({ ...prev, description: '' }));
                  }}
                  placeholder="Tentukan divisi atau lingkup tugas (contoh: Anti Fraud Center, APU PPT, IT)..."
                  className={cn(
                    "w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden leading-relaxed",
                    formErrors.description 
                      ? "border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-500/20" 
                      : "border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  )}
                />
                {formErrors.description && (
                  <span className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.description}
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
                  {modalMode === 'add' ? 'Simpan Role Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
