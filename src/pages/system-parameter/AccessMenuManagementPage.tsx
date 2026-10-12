import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  Search, 
  CheckSquare, 
  Square, 
  MinusSquare, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileCode, 
  Users, 
  Check, 
  AlertCircle, 
  Layers, 
  Unlock, 
  Lock, 
  Eye, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Download,
  Sliders,
  Info
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { FMS_MENU_TREE, getAllMenuItemIds } from '../../data/mockAccessMenu';
import { MenuItemNode, MenuPermissions, PermissionKey } from '../../types/accessMenu';
import { cn } from '../../lib/utils';

export const AccessMenuManagementPage: React.FC = () => {
  const { 
    systemGroups, 
    systemRoles, 
    roleMenuMatrices, 
    saveRoleMenuPermissions, 
    toggleLockRoleMenuMatrix,
    resetRoleMenuPermissions 
  } = useFMS();

  // Roles available for selection
  const availableRoles = useMemo(() => {
    const list = Object.keys(roleMenuMatrices);
    systemGroups.forEach(g => {
      if (!list.includes(g.groupName)) {
        list.push(g.groupName);
      }
    });
    return list;
  }, [roleMenuMatrices, systemGroups]);

  const [selectedRole, setSelectedRole] = useState<string>('AFC L1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    'menu-profile': true,
    'menu-alert': true,
    'menu-rules': true,
    'menu-lists': true,
    'menu-system-param': true,
    'menu-audit-trail': true,
    'menu-reports-shift': true
  });

  // Local working permissions for the currently selected role
  const [currentPermissions, setCurrentPermissions] = useState<Record<string, MenuPermissions>>({});
  const [initialSnapshot, setInitialSnapshot] = useState<Record<string, MenuPermissions>>({});
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Sync working permissions when selected role changes
  useEffect(() => {
    const matrix = roleMenuMatrices[selectedRole];
    const initialPerms = matrix?.permissions ? JSON.parse(JSON.stringify(matrix.permissions)) : {};
    setCurrentPermissions(initialPerms);
    setInitialSnapshot(JSON.parse(JSON.stringify(initialPerms)));
    setSaveSuccess(null);
    setLockedNotice(null);
  }, [selectedRole, roleMenuMatrices]);

  // Check if there are unsaved modifications
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(currentPermissions) !== JSON.stringify(initialSnapshot);
  }, [currentPermissions, initialSnapshot]);

  const activeRoleMetadata = roleMenuMatrices[selectedRole];
  const isRoleLocked = !!activeRoleMetadata?.isLocked;

  // Helper to get permission for a menu id
  const getPermission = useCallback((menuId: string): MenuPermissions => {
    return currentPermissions[menuId] || {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canExport: false
    };
  }, [currentPermissions]);

  // Parent status helper for a permission key
  const getParentState = useCallback((parentNode: MenuItemNode, key: PermissionKey): 'checked' | 'unchecked' | 'indeterminate' => {
    if (!parentNode.children || parentNode.children.length === 0) {
      return getPermission(parentNode.id)[key] ? 'checked' : 'unchecked';
    }

    const childStates = parentNode.children.map(child => !!getPermission(child.id)[key]);
    const allChecked = childStates.every(Boolean);
    const noneChecked = childStates.every(v => !v);

    if (allChecked) return 'checked';
    if (noneChecked) return 'unchecked';
    return 'indeterminate';
  }, [getPermission]);

  // Toggle permission for a single item (and cascade if parent)
  const handleTogglePermission = useCallback((menuNode: MenuItemNode, key: PermissionKey) => {
    if (isRoleLocked) {
      setLockedNotice(`Role "${selectedRole}" dalam status Terkunci (Locked v1.14). Klik "Buka Kunci (Unlock)" di toolbar atas untuk melakukan penyesuaian izin.`);
      setTimeout(() => setLockedNotice(null), 4500);
      return;
    }

    setCurrentPermissions(prev => {
      const next = { ...prev };
      const currentVal = !!next[menuNode.id]?.[key];
      const newVal = !currentVal;

      if (menuNode.isParent && menuNode.children) {
        // Cascade down to parent and all children
        next[menuNode.id] = {
          ...(next[menuNode.id] || { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false }),
          [key]: newVal
        };

        menuNode.children.forEach(child => {
          next[child.id] = {
            ...(next[child.id] || { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false }),
            [key]: newVal
          };
          // If view is turned off, child canView becomes false
          if (key === 'canView' && !newVal) {
            next[child.id].canView = false;
          }
        });
      } else {
        // Child toggled
        next[menuNode.id] = {
          ...(next[menuNode.id] || { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false }),
          [key]: newVal
        };

        // If toggling view to false, other permissions stay or turn off
        // Update parent state
        if (menuNode.parentId) {
          const parent = FMS_MENU_TREE.find(p => p.id === menuNode.parentId);
          if (parent && parent.children) {
            const allChildrenChecked = parent.children.every(c => c.id === menuNode.id ? newVal : !!next[c.id]?.[key]);
            const anyChildrenChecked = parent.children.some(c => c.id === menuNode.id ? newVal : !!next[c.id]?.[key]);

            next[parent.id] = {
              ...(next[parent.id] || { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false }),
              [key]: allChildrenChecked || (anyChildrenChecked && key === 'canView')
            };
          }
        }
      }

      return next;
    });
  }, [isRoleLocked, selectedRole]);

  // Toggle entire row (all 5 permissions for one menu)
  const handleToggleRow = useCallback((menuNode: MenuItemNode) => {
    if (isRoleLocked) {
      setLockedNotice(`Role "${selectedRole}" dalam status Terkunci (Locked v1.14). Klik "Buka Kunci (Unlock)" di toolbar atas.`);
      setTimeout(() => setLockedNotice(null), 4500);
      return;
    }

    setCurrentPermissions(prev => {
      const next = { ...prev };
      const current = next[menuNode.id] || { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false };
      const allActive = current.canView && current.canCreate && current.canEdit && current.canDelete && current.canExport;
      const targetVal = !allActive;

      const updatedPermissions: MenuPermissions = {
        canView: targetVal,
        canCreate: targetVal,
        canEdit: targetVal,
        canDelete: targetVal,
        canExport: targetVal
      };

      next[menuNode.id] = updatedPermissions;

      if (menuNode.isParent && menuNode.children) {
        menuNode.children.forEach(child => {
          next[child.id] = { ...updatedPermissions };
        });
      } else if (menuNode.parentId) {
        const parent = FMS_MENU_TREE.find(p => p.id === menuNode.parentId);
        if (parent && parent.children) {
          const allChildrenFull = parent.children.every(c => {
            const perm = c.id === menuNode.id ? updatedPermissions : next[c.id];
            return perm?.canView && perm?.canCreate && perm?.canEdit && perm?.canDelete && perm?.canExport;
          });
          if (allChildrenFull) {
            next[parent.id] = { ...updatedPermissions };
          }
        }
      }

      return next;
    });
  }, [isRoleLocked, selectedRole]);

  // Header column Select All / Deselect All
  const handleToggleColumn = useCallback((key: PermissionKey) => {
    if (isRoleLocked) {
      setLockedNotice(`Role "${selectedRole}" dalam status Terkunci (Locked v1.14). Silakan buka kunci terlebih dahulu.`);
      setTimeout(() => setLockedNotice(null), 4500);
      return;
    }

    const allIds = getAllMenuItemIds();
    const allChecked = allIds.every(id => !!currentPermissions[id]?.[key]);
    const targetVal = !allChecked;

    setCurrentPermissions(prev => {
      const next = { ...prev };
      allIds.forEach(id => {
        next[id] = {
          ...(next[id] || { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false }),
          [key]: targetVal
        };
      });
      return next;
    });
  }, [isRoleLocked, selectedRole, currentPermissions]);

  // Preset: Full Access
  const handleApplyFullAccess = useCallback(() => {
    if (isRoleLocked) {
      setLockedNotice(`Role "${selectedRole}" dalam status Terkunci (Locked v1.14). Buka kunci untuk menggunakan preset.`);
      setTimeout(() => setLockedNotice(null), 4500);
      return;
    }
    const allIds = getAllMenuItemIds();
    const updated: Record<string, MenuPermissions> = {};
    allIds.forEach(id => {
      updated[id] = { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true };
    });
    setCurrentPermissions(updated);
  }, [isRoleLocked, selectedRole]);

  // Preset: Read Only
  const handleApplyReadOnly = useCallback(() => {
    if (isRoleLocked) {
      setLockedNotice(`Role "${selectedRole}" dalam status Terkunci (Locked v1.14). Buka kunci untuk menggunakan preset.`);
      setTimeout(() => setLockedNotice(null), 4500);
      return;
    }
    const allIds = getAllMenuItemIds();
    const updated: Record<string, MenuPermissions> = {};
    allIds.forEach(id => {
      updated[id] = { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true };
    });
    setCurrentPermissions(updated);
  }, [isRoleLocked, selectedRole]);

  // Preset: Revoke All
  const handleApplyRevokeAll = useCallback(() => {
    if (isRoleLocked) {
      setLockedNotice(`Role "${selectedRole}" dalam status Terkunci (Locked v1.14). Buka kunci untuk menggunakan preset.`);
      setTimeout(() => setLockedNotice(null), 4500);
      return;
    }
    const allIds = getAllMenuItemIds();
    const updated: Record<string, MenuPermissions> = {};
    allIds.forEach(id => {
      updated[id] = { canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false };
    });
    setCurrentPermissions(updated);
  }, [isRoleLocked, selectedRole]);

  // Reset to initial
  const handleResetToInitial = useCallback(() => {
    setCurrentPermissions(JSON.parse(JSON.stringify(initialSnapshot)));
  }, [initialSnapshot]);

  // Save changes (Standard Save)
  const handleSave = () => {
    saveRoleMenuPermissions(selectedRole, currentPermissions, false);
    setInitialSnapshot(JSON.parse(JSON.stringify(currentPermissions)));
    setSaveSuccess(`Hak akses role "${selectedRole}" berhasil disimpan ke sistem parameter v1.14 dan dicatat ke Audit Trail.`);
    setTimeout(() => setSaveSuccess(null), 4000);
  };

  // Save and Lock changes (Enterprise Lock v1.14)
  const handleSaveAndLock = () => {
    saveRoleMenuPermissions(selectedRole, currentPermissions, true);
    setInitialSnapshot(JSON.parse(JSON.stringify(currentPermissions)));
    setSaveSuccess(`Hak akses role "${selectedRole}" berhasil DISIMPAN & DIKUNCI (Locked v1.14) secara permanen sesuai standar audit.`);
    setTimeout(() => setSaveSuccess(null), 4500);
  };

  // Toggle Lock state directly
  const handleToggleLock = () => {
    const nextState = !isRoleLocked;
    toggleLockRoleMenuMatrix(selectedRole, nextState);
    setSaveSuccess(nextState 
      ? `Matriks hak akses role "${selectedRole}" berhasil DIKUNCI (Locked v1.14). Perubahan dilindungi.` 
      : `Kunci matriks role "${selectedRole}" telah DIBUKA (Unlocked). Anda dapat melakukan perubahan.`
    );
    setTimeout(() => setSaveSuccess(null), 4500);
  };

  // Toggle parent collapse
  const toggleParentExpand = (parentId: string) => {
    setExpandedParents(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  // Expand / Collapse all
  const handleToggleExpandAll = () => {
    const allExpanded = Object.values(expandedParents).every(Boolean);
    const nextState: Record<string, boolean> = {};
    FMS_MENU_TREE.forEach(p => {
      nextState[p.id] = !allExpanded;
    });
    setExpandedParents(nextState);
  };

  // Filtered menu tree based on search
  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return FMS_MENU_TREE;
    const term = searchTerm.toLowerCase();

    return FMS_MENU_TREE.map(parent => {
      const parentMatches = parent.name.toLowerCase().includes(term) || parent.code.toLowerCase().includes(term);
      const matchingChildren = parent.children?.filter(child => 
        child.name.toLowerCase().includes(term) || 
        child.code.toLowerCase().includes(term) ||
        (child.path && child.path.toLowerCase().includes(term))
      );

      if (parentMatches) {
        return parent;
      }

      if (matchingChildren && matchingChildren.length > 0) {
        return {
          ...parent,
          children: matchingChildren
        };
      }

      return null;
    }).filter(Boolean) as MenuItemNode[];
  }, [searchTerm]);

  // Overall column header states
  const getHeaderColumnState = useCallback((key: PermissionKey): 'checked' | 'unchecked' | 'indeterminate' => {
    const allIds = getAllMenuItemIds();
    const checkedCount = allIds.filter(id => !!currentPermissions[id]?.[key]).length;
    if (checkedCount === allIds.length) return 'checked';
    if (checkedCount === 0) return 'unchecked';
    return 'indeterminate';
  }, [currentPermissions]);

  // Summary counts
  const totalViewAllowed = useMemo(() => {
    return Object.values(currentPermissions).filter(p => p.canView).length;
  }, [currentPermissions]);

  const totalCreateAllowed = useMemo(() => {
    return Object.values(currentPermissions).filter(p => p.canCreate).length;
  }, [currentPermissions]);

  const totalDeleteAllowed = useMemo(() => {
    return Object.values(currentPermissions).filter(p => p.canDelete).length;
  }, [currentPermissions]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>SYSTEM PARAMETER</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">ROLE-BASED ACCESS CONTROL (RBAC)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>Access Menu Management</span>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              v1.14 • Enterprise RBAC
            </span>
            {isRoleLocked ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Locked (v1.14)</span>
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Draft / Unlocked</span>
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurasi matriks hak akses menu bertingkat (View, Create, Edit, Delete, Export) per Role & Group pengguna FMS v1.14.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg animate-fade-in shadow-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {hasUnsavedChanges && !saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-lg animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Ada Perubahan Belum Disimpan</span>
            </div>
          )}

          <button
            id="btn-reset-permissions"
            onClick={handleResetToInitial}
            disabled={!hasUnsavedChanges}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition",
              hasUnsavedChanges
                ? "border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95"
                : "border-slate-200 text-slate-400 cursor-not-allowed"
            )}
            title="Kembalikan perubahan ke kondisi terakhir disimpan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            id="btn-toggle-lock-matrix"
            type="button"
            onClick={handleToggleLock}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold transition active:scale-95 shadow-xs",
              isRoleLocked
                ? "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100"
                : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
            )}
            title={isRoleLocked ? "Buka kunci agar matriks izin dapat diubah" : "Kunci matriks hak akses ini"}
          >
            {isRoleLocked ? <Unlock className="w-3.5 h-3.5 text-amber-700" /> : <Lock className="w-3.5 h-3.5 text-slate-600" />}
            <span>{isRoleLocked ? 'Buka Kunci' : 'Kunci (Lock)'}</span>
          </button>

          <button
            id="btn-save-permissions"
            onClick={handleSave}
            disabled={isRoleLocked}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95",
              isRoleLocked
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : hasUnsavedChanges
                  ? "bg-white border border-blue-400 text-blue-700 hover:bg-blue-50"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            )}
            title={isRoleLocked ? "Matriks terkunci. Buka kunci untuk menyimpan draft." : "Simpan perubahan matriks"}
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Simpan</span>
          </button>

          <button
            id="btn-save-and-lock"
            onClick={handleSaveAndLock}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all active:scale-95"
            title="Simpan semua perubahan dan kunci matriks hak akses secara permanen"
          >
            <Lock className="w-4 h-4" />
            <span>Simpan & Kunci (v1.14)</span>
          </button>
        </div>
      </div>

      {/* Locked Notice Alert Banner */}
      {lockedNotice && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{lockedNotice}</span>
          </div>
          <button
            type="button"
            onClick={handleToggleLock}
            className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded text-[11px] transition shrink-0"
          >
            Buka Kunci Sekarang
          </button>
        </div>
      )}

      {/* Persistent Lock State Card */}
      {isRoleLocked && (
        <div className="p-4 bg-gradient-to-r from-amber-50/90 to-amber-100/50 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center text-amber-800 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-900 flex items-center gap-2">
                <span>Konfigurasi Matriks Terkunci (Locked v1.14)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 font-semibold">
                  AUDIT PROTECTED
                </span>
              </div>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                Hak akses menu role <strong>{selectedRole}</strong> telah dikunci oleh <strong>{activeRoleMetadata?.lockedBy || 'yoseph.sanjaya (Security Administrator)'}</strong> pada <strong>{activeRoleMetadata?.lockedAt || '2026-09-04 00:45:00'}</strong> WIB. Checkbox dinonaktifkan untuk mencegah modifikasi tidak disengaja.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleLock}
            className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 font-semibold rounded-lg text-xs transition shrink-0 flex items-center gap-1.5 shadow-2xs"
          >
            <Unlock className="w-3.5 h-3.5 text-amber-700" />
            <span>Buka Kunci (Unlock)</span>
          </button>
        </div>
      )}

      {/* Top Filter & Quick Preset Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Role / Group Selector */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Select Role / Group</span>
            </label>
            <select
              id="select-access-role"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            >
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {role} {roleMenuMatrices[role] ? `(${roleMenuMatrices[role].description || 'Configured'})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Preset Buttons */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quick Policy Presets
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="btn-preset-full"
                onClick={handleApplyFullAccess}
                disabled={isRoleLocked}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md border transition flex items-center gap-1",
                  isRoleLocked
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border-slate-200"
                )}
              >
                <Unlock className="w-3 h-3" />
                <span>Grant All</span>
              </button>

              <button
                type="button"
                id="btn-preset-readonly"
                onClick={handleApplyReadOnly}
                disabled={isRoleLocked}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md border transition flex items-center gap-1",
                  isRoleLocked
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 border-slate-200"
                )}
              >
                <Eye className="w-3 h-3" />
                <span>Read-Only</span>
              </button>

              <button
                type="button"
                id="btn-preset-revoke"
                onClick={handleApplyRevokeAll}
                disabled={isRoleLocked}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium rounded-md border transition flex items-center gap-1",
                  isRoleLocked
                    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                    : "bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border-slate-200"
                )}
              >
                <Lock className="w-3 h-3" />
                <span>Revoke All</span>
              </button>

              <button
                type="button"
                id="btn-toggle-expand"
                onClick={handleToggleExpandAll}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md border border-slate-200 transition flex items-center gap-1"
              >
                <Layers className="w-3 h-3" />
                <span>Expand / Collapse</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Filter Menus
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-menu-access"
                type="text"
                placeholder="Search menu name or code..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Selected Role Metadata Info Banner */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              Target Role: <strong className="text-slate-800">{selectedRole}</strong>
              {activeRoleMetadata?.description && ` • ${activeRoleMetadata.description}`}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>Version: <strong className="text-blue-700">{activeRoleMetadata?.version || '1.14'}</strong></span>
            <span>Status: <strong className={isRoleLocked ? "text-amber-700" : "text-emerald-600"}>{isRoleLocked ? 'Locked' : 'Active'}</strong></span>
            <span>Last Updated: <strong className="text-slate-700">{activeRoleMetadata?.lastUpdated || '2026-09-04 00:45:00'}</strong></span>
            <span>By: <strong className="text-slate-700">{activeRoleMetadata?.updatedBy || 'yoseph.sanjaya'}</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Total Menu Nodes</span>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{getAllMenuItemIds().length}</div>
          </div>
          <Layers className="w-5 h-5 text-slate-400" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">View Permissions</span>
            <div className="text-lg font-bold font-mono text-blue-600 mt-0.5">{totalViewAllowed}</div>
          </div>
          <Eye className="w-5 h-5 text-blue-400" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Create / Add Roles</span>
            <div className="text-lg font-bold font-mono text-emerald-600 mt-0.5">{totalCreateAllowed}</div>
          </div>
          <PlusCircle className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">Delete Privileges</span>
            <div className="text-lg font-bold font-mono text-rose-600 mt-0.5">{totalDeleteAllowed}</div>
          </div>
          <Trash2 className="w-5 h-5 text-rose-400" />
        </div>
      </div>

      {/* Access Matrix Table (Tree View) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">
              Menu Permission Matrix for [{selectedRole}]
            </span>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Tandai checkbox pada Parent untuk mengaktifkan/menonaktifkan seluruh sub-menu di bawahnya.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider select-none">
                <th className="py-3.5 px-4 min-w-[280px]">
                  Menu Hierarchy & Structure
                </th>

                {/* VIEW / READ HEADER */}
                <th className="py-3.5 px-3 text-center w-28">
                  <div 
                    onClick={() => handleToggleColumn('canView')}
                    className="inline-flex items-center gap-1.5 cursor-pointer hover:text-blue-600 transition"
                    title="Toggle seluruh kolom View / Read"
                  >
                    {getHeaderColumnState('canView') === 'checked' && <CheckSquare className="w-4 h-4 text-blue-600" />}
                    {getHeaderColumnState('canView') === 'unchecked' && <Square className="w-4 h-4 text-slate-400" />}
                    {getHeaderColumnState('canView') === 'indeterminate' && <MinusSquare className="w-4 h-4 text-blue-600" />}
                    <span>View / Read</span>
                  </div>
                </th>

                {/* CREATE / ADD HEADER */}
                <th className="py-3.5 px-3 text-center w-28">
                  <div 
                    onClick={() => handleToggleColumn('canCreate')}
                    className="inline-flex items-center gap-1.5 cursor-pointer hover:text-emerald-600 transition"
                    title="Toggle seluruh kolom Create / Add"
                  >
                    {getHeaderColumnState('canCreate') === 'checked' && <CheckSquare className="w-4 h-4 text-emerald-600" />}
                    {getHeaderColumnState('canCreate') === 'unchecked' && <Square className="w-4 h-4 text-slate-400" />}
                    {getHeaderColumnState('canCreate') === 'indeterminate' && <MinusSquare className="w-4 h-4 text-emerald-600" />}
                    <span>Create / Add</span>
                  </div>
                </th>

                {/* EDIT / UPDATE HEADER */}
                <th className="py-3.5 px-3 text-center w-28">
                  <div 
                    onClick={() => handleToggleColumn('canEdit')}
                    className="inline-flex items-center gap-1.5 cursor-pointer hover:text-amber-600 transition"
                    title="Toggle seluruh kolom Edit / Update"
                  >
                    {getHeaderColumnState('canEdit') === 'checked' && <CheckSquare className="w-4 h-4 text-amber-600" />}
                    {getHeaderColumnState('canEdit') === 'unchecked' && <Square className="w-4 h-4 text-slate-400" />}
                    {getHeaderColumnState('canEdit') === 'indeterminate' && <MinusSquare className="w-4 h-4 text-amber-600" />}
                    <span>Edit / Update</span>
                  </div>
                </th>

                {/* DELETE HEADER */}
                <th className="py-3.5 px-3 text-center w-28">
                  <div 
                    onClick={() => handleToggleColumn('canDelete')}
                    className="inline-flex items-center gap-1.5 cursor-pointer hover:text-rose-600 transition"
                    title="Toggle seluruh kolom Delete"
                  >
                    {getHeaderColumnState('canDelete') === 'checked' && <CheckSquare className="w-4 h-4 text-rose-600" />}
                    {getHeaderColumnState('canDelete') === 'unchecked' && <Square className="w-4 h-4 text-slate-400" />}
                    {getHeaderColumnState('canDelete') === 'indeterminate' && <MinusSquare className="w-4 h-4 text-rose-600" />}
                    <span>Delete</span>
                  </div>
                </th>

                {/* EXPORT / DOWNLOAD HEADER */}
                <th className="py-3.5 px-3 text-center w-28">
                  <div 
                    onClick={() => handleToggleColumn('canExport')}
                    className="inline-flex items-center gap-1.5 cursor-pointer hover:text-purple-600 transition"
                    title="Toggle seluruh kolom Export / Download"
                  >
                    {getHeaderColumnState('canExport') === 'checked' && <CheckSquare className="w-4 h-4 text-purple-600" />}
                    {getHeaderColumnState('canExport') === 'unchecked' && <Square className="w-4 h-4 text-slate-400" />}
                    {getHeaderColumnState('canExport') === 'indeterminate' && <MinusSquare className="w-4 h-4 text-purple-600" />}
                    <span>Export</span>
                  </div>
                </th>

                {/* ROW ACTION */}
                <th className="py-3.5 px-3 text-center w-24">
                  Row Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredTree.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan menu yang sesuai dengan kata kunci "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredTree.map(parent => {
                  const isExpanded = !!expandedParents[parent.id];
                  const parentPerm = getPermission(parent.id);

                  return (
                    <React.Fragment key={parent.id}>
                      {/* PARENT ROW */}
                      <tr className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors border-t-2 border-slate-200 font-semibold">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleParentExpand(parent.id)}
                              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <Folder className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="text-slate-900 font-bold tracking-tight">
                              {parent.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 ml-1">
                              {parent.children?.length || 0} Sub-menus
                            </span>
                          </div>
                        </td>

                        {/* Parent canView */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(parent, 'canView')}
                            className="p-1 rounded hover:bg-blue-50 text-slate-700 transition"
                            title={`Toggle View untuk seluruh modul ${parent.name}`}
                          >
                            {getParentState(parent, 'canView') === 'checked' && (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            )}
                            {getParentState(parent, 'canView') === 'unchecked' && (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            )}
                            {getParentState(parent, 'canView') === 'indeterminate' && (
                              <MinusSquare className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        </td>

                        {/* Parent canCreate */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(parent, 'canCreate')}
                            className="p-1 rounded hover:bg-emerald-50 text-slate-700 transition"
                            title={`Toggle Create untuk seluruh modul ${parent.name}`}
                          >
                            {getParentState(parent, 'canCreate') === 'checked' && (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            )}
                            {getParentState(parent, 'canCreate') === 'unchecked' && (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            )}
                            {getParentState(parent, 'canCreate') === 'indeterminate' && (
                              <MinusSquare className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                        </td>

                        {/* Parent canEdit */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(parent, 'canEdit')}
                            className="p-1 rounded hover:bg-amber-50 text-slate-700 transition"
                            title={`Toggle Edit untuk seluruh modul ${parent.name}`}
                          >
                            {getParentState(parent, 'canEdit') === 'checked' && (
                              <CheckSquare className="w-4 h-4 text-amber-600" />
                            )}
                            {getParentState(parent, 'canEdit') === 'unchecked' && (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            )}
                            {getParentState(parent, 'canEdit') === 'indeterminate' && (
                              <MinusSquare className="w-4 h-4 text-amber-600" />
                            )}
                          </button>
                        </td>

                        {/* Parent canDelete */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(parent, 'canDelete')}
                            className="p-1 rounded hover:bg-rose-50 text-slate-700 transition"
                            title={`Toggle Delete untuk seluruh modul ${parent.name}`}
                          >
                            {getParentState(parent, 'canDelete') === 'checked' && (
                              <CheckSquare className="w-4 h-4 text-rose-600" />
                            )}
                            {getParentState(parent, 'canDelete') === 'unchecked' && (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            )}
                            {getParentState(parent, 'canDelete') === 'indeterminate' && (
                              <MinusSquare className="w-4 h-4 text-rose-600" />
                            )}
                          </button>
                        </td>

                        {/* Parent canExport */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(parent, 'canExport')}
                            className="p-1 rounded hover:bg-purple-50 text-slate-700 transition"
                            title={`Toggle Export untuk seluruh modul ${parent.name}`}
                          >
                            {getParentState(parent, 'canExport') === 'checked' && (
                              <CheckSquare className="w-4 h-4 text-purple-600" />
                            )}
                            {getParentState(parent, 'canExport') === 'unchecked' && (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            )}
                            {getParentState(parent, 'canExport') === 'indeterminate' && (
                              <MinusSquare className="w-4 h-4 text-purple-600" />
                            )}
                          </button>
                        </td>

                        {/* Parent Row Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRow(parent)}
                            className="px-2 py-0.5 text-[11px] font-semibold bg-slate-200 hover:bg-blue-600 hover:text-white rounded transition"
                            title="Pilih atau lepas semua hak akses untuk grup ini"
                          >
                            Toggle All
                          </button>
                        </td>
                      </tr>

                      {/* CHILDREN ROWS (TREE VIEW SUB-MENUS) */}
                      {isExpanded && parent.children?.map(child => {
                        const childPerm = getPermission(child.id);

                        return (
                          <tr key={child.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="py-2.5 px-4 pl-10">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-300 font-mono text-sm select-none">└─</span>
                                <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="text-slate-800 font-medium">
                                  {child.name}
                                </span>
                                {child.path && (
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {child.path}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Child canView */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                id={`chk-view-${child.id}`}
                                onClick={() => handleTogglePermission(child, 'canView')}
                                className="p-1 rounded hover:bg-blue-50 text-slate-700 transition"
                              >
                                {childPerm.canView ? (
                                  <CheckSquare className="w-4 h-4 text-blue-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                                )}
                              </button>
                            </td>

                            {/* Child canCreate */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                id={`chk-create-${child.id}`}
                                onClick={() => handleTogglePermission(child, 'canCreate')}
                                className="p-1 rounded hover:bg-emerald-50 text-slate-700 transition"
                              >
                                {childPerm.canCreate ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                                )}
                              </button>
                            </td>

                            {/* Child canEdit */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                id={`chk-edit-${child.id}`}
                                onClick={() => handleTogglePermission(child, 'canEdit')}
                                className="p-1 rounded hover:bg-amber-50 text-slate-700 transition"
                              >
                                {childPerm.canEdit ? (
                                  <CheckSquare className="w-4 h-4 text-amber-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                                )}
                              </button>
                            </td>

                            {/* Child canDelete */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                id={`chk-delete-${child.id}`}
                                onClick={() => handleTogglePermission(child, 'canDelete')}
                                className="p-1 rounded hover:bg-rose-50 text-slate-700 transition"
                              >
                                {childPerm.canDelete ? (
                                  <CheckSquare className="w-4 h-4 text-rose-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                                )}
                              </button>
                            </td>

                            {/* Child canExport */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                id={`chk-export-${child.id}`}
                                onClick={() => handleTogglePermission(child, 'canExport')}
                                className="p-1 rounded hover:bg-purple-50 text-slate-700 transition"
                              >
                                {childPerm.canExport ? (
                                  <CheckSquare className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                                )}
                              </button>
                            </td>

                            {/* Child Row Toggle */}
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleRow(child)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                                title="Toggle baris ini"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
