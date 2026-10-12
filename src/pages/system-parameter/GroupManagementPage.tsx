import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Layers, 
  Users, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Check, 
  Copy 
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { SystemGroup } from '../../types/systemParameter';
import { cn } from '../../lib/utils';

export const GroupManagementPage: React.FC = () => {
  const { 
    systemGroups, 
    systemUsers, 
    addSystemGroup, 
    updateSystemGroup 
  } = useFMS();

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    groupName: '',
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
    setEditingGroupId(null);
    setFormData({
      groupName: '',
      description: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (group: SystemGroup) => {
    setModalMode('edit');
    setEditingGroupId(group.id);
    setFormData({
      groupName: group.groupName,
      description: group.description
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.groupName.trim()) {
      errors.groupName = 'Nama Group wajib diisi';
    }

    if (!formData.description.trim()) {
      errors.description = 'Deskripsi fungsi group wajib diisi';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (modalMode === 'add') {
      addSystemGroup({
        groupName: formData.groupName.trim(),
        description: formData.description.trim()
      });
      showToast(`Group baru "${formData.groupName}" berhasil ditambahkan.`);
    } else if (modalMode === 'edit' && editingGroupId) {
      updateSystemGroup(editingGroupId, {
        groupName: formData.groupName.trim(),
        description: formData.description.trim()
      });
      showToast(`Group "${formData.groupName}" berhasil diperbarui.`);
    }

    setIsModalOpen(false);
  };

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return systemGroups.filter(g => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return g.groupName.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
    });
  }, [systemGroups, searchQuery]);

  // Badge Category Helper
  const getGroupCategoryBadge = (name: string) => {
    if (name.includes('AFC')) {
      return {
        label: 'Fraud Defense',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: ShieldAlert
      };
    } else if (name.includes('Analyst')) {
      return {
        label: 'AML Compliance',
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: ShieldCheck
      };
    } else {
      return {
        label: 'IT & Support',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Cpu
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider font-mono">
                  System Parameter
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-medium text-slate-500 font-mono">
                  /system-parameter/group
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
                Group Management
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi kelompok kerja operasional (Fraud L1/L2, AML Analyst L1/L2, IT Technical Support &amp; Config Administration).
          </p>
        </div>

        {/* Header Action: Add Group */}
        <div className="flex items-center gap-2">
          <button
            id="btn-add-group-header"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Group</span>
          </button>
        </div>
      </div>

      {/* 2. STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Group</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{systemGroups.length}</span>
            <span className="text-[11px] text-slate-400">Kelompok</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Fraud Groups (AFC)</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-red-600">
              {systemGroups.filter(g => g.groupName.includes('AFC')).length}
            </span>
            <span className="text-[11px] text-red-600 font-medium">L1 &amp; L2 Triage</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">AML Groups</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600">
              {systemGroups.filter(g => g.groupName.includes('Analyst')).length}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">L1 &amp; L2 Officer</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">IT Maker Checker</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-purple-600">
              {systemGroups.filter(g => g.groupName.includes('IT')).length}
            </span>
            <span className="text-[11px] text-slate-400">PSS &amp; DCA</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-group"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama group atau deskripsi fungsi..."
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
            <span className="text-xs font-bold text-slate-800">Master Kelompok Kerja (Groups)</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold font-mono">
              {filteredGroups.length} Groups
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Penugasan Workgroup Alert Queue &amp; Multi-Tier Escalation
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">No</th>
                <th className="py-3 px-3 text-center w-20">Action</th>
                <th className="py-3 px-4 w-52">Group Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 w-64">Approval Escalation Path</th>
                <th className="py-3 px-3.5 text-center w-28">Assigned Users</th>
                <th className="py-3 px-3.5 w-44">Updated Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-8 h-8 text-slate-300" />
                      <span className="text-sm font-medium">Tidak ada group yang cocok</span>
                      <span className="text-xs text-slate-400">Coba ubah kata kunci pencarian Anda</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group, idx) => {
                  const assignedCount = systemUsers.filter(u => u.group === group.groupName).length;
                  const catBadge = getGroupCategoryBadge(group.groupName);
                  const Icon = catBadge.icon;

                  const escalation = group.escalationPath || (
                    group.groupName === 'AFC L1' ? 'AFC L2 (Navigasi approval berlanjut ke AFC L2)' :
                    group.groupName === 'AFC L2' ? 'Final Sign-off / Lead Approver' :
                    group.groupName === 'Analyst L1' ? 'Analyst L2 (Navigasi approval berlanjut ke Analyst L2)' :
                    group.groupName === 'Analyst L2' ? 'Final Compliance Sign-off / STR Approver' :
                    group.groupName.includes('PSS') ? 'Dual Control / Peer Checker Sign-off' :
                    'Direct Execution / Super Admin Override'
                  );

                  return (
                    <tr 
                      key={group.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* 1. No */}
                      <td className="py-3.5 px-3.5 text-center font-mono text-slate-400 font-medium">
                        {idx + 1}
                      </td>

                      {/* 2. Action (Edit) */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          id={`btn-edit-group-${group.id}`}
                          onClick={() => handleOpenEditModal(group)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                          title="Edit Group"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>

                      {/* 3. Group Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {group.groupName}
                            </span>
                            <button
                              onClick={() => handleCopy(group.groupName, `grp-${group.id}`)}
                              className="text-slate-400 hover:text-slate-600 transition"
                              title="Salin Nama Group"
                            >
                              {copiedId === `grp-${group.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="mt-1">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border",
                              catBadge.color
                            )}>
                              <Icon className="w-2.5 h-2.5" />
                              {catBadge.label}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Description */}
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed text-xs">
                        {group.description}
                      </td>

                      {/* 5. Approval Escalation Path */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                          <span className="text-[11px] leading-tight text-blue-900 font-medium">{escalation}</span>
                        </div>
                      </td>

                      {/* Assigned Users Badge */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border",
                          assignedCount > 0 
                            ? "bg-slate-100 text-slate-700 border-slate-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}>
                          <Users className="w-3 h-3" />
                          {assignedCount} User
                        </span>
                      </td>

                      {/* 6. Updated Date */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {group.updatedDate}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL FORM: ADD / EDIT GROUP */}
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
                    {modalMode === 'add' ? 'Tambah Group Baru' : `Edit Group: ${formData.groupName}`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {modalMode === 'add' 
                      ? 'Definisikan kelompok kerja baru untuk antrean penugasan alert' 
                      : 'Perbarui nama kelompok dan deskripsi tugas operasional'}
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
              {/* Group Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Group <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.groupName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, groupName: e.target.value }));
                    if (formErrors.groupName) setFormErrors(prev => ({ ...prev, groupName: '' }));
                  }}
                  placeholder="e.g. AFC L3 / AML Special Team"
                  className={cn(
                    "w-full px-3 py-2 text-xs rounded-lg border font-semibold focus:outline-hidden",
                    formErrors.groupName 
                      ? "border-red-400 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-500/20" 
                      : "border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  )}
                />
                {formErrors.groupName && (
                  <span className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {formErrors.groupName}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Nama kelompok kerja yang muncul pada opsi penugasan alert investigator.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Fungsi &amp; Tanggung Jawab <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                    if (formErrors.description) setFormErrors(prev => ({ ...prev, description: '' }));
                  }}
                  placeholder="Jelaskan peran tugas kelompok, level eskalasi kasus, dan lingkup otorisasi..."
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
                  {modalMode === 'add' ? 'Simpan Group Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
