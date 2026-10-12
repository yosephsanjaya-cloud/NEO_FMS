export interface MenuPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

export interface MenuItemNode {
  id: string;
  code: string;
  name: string;
  category?: string;
  path?: string;
  isParent?: boolean;
  parentId?: string | null;
  children?: MenuItemNode[];
  permissions?: MenuPermissions;
}

export type PermissionKey = keyof MenuPermissions; // 'canView' | 'canCreate' | 'canEdit' | 'canDelete' | 'canExport'

export interface RoleMenuAccessMatrix {
  roleId: string;
  roleName: string;
  description?: string;
  permissions: Record<string, MenuPermissions>; // menuId -> MenuPermissions
  lastUpdated?: string;
  updatedBy?: string;
  isLocked?: boolean;
  lockedBy?: string;
  lockedAt?: string;
  version?: string;
}
