import { MenuItemNode, MenuPermissions, RoleMenuAccessMatrix } from '../types/accessMenu';

export const FMS_MENU_TREE: MenuItemNode[] = [
  {
    id: 'menu-profile',
    code: 'PROFILE',
    name: 'PROFILE',
    isParent: true,
    children: [
      { id: 'menu-profile-customer', code: 'PROF-CUST', name: 'Customer Profile', path: '/profile/customer', parentId: 'menu-profile' },
      { id: 'menu-profile-card', code: 'PROF-CARD', name: 'Debit Card Profile', path: '/profile/debit-card', parentId: 'menu-profile' },
      { id: 'menu-profile-trx', code: 'PROF-TRX', name: 'Transaction History', path: '/profile/transaction-history', parentId: 'menu-profile' },
      { id: 'menu-profile-card-trx', code: 'PROF-CDTRX', name: 'Card Transaction', path: '/profile/card-transaction', parentId: 'menu-profile' },
    ]
  },
  {
    id: 'menu-alert',
    code: 'ALERT-MGT',
    name: 'ALERT MANAGEMENT',
    isParent: true,
    children: [
      { id: 'menu-alert-fraud', code: 'ALT-FRD', name: 'System Generated Alert Fraud', path: '/alert/fraud', parentId: 'menu-alert' },
      { id: 'menu-alert-aml', code: 'ALT-AML', name: 'AML CIF Grouping', path: '/alert/aml', parentId: 'menu-alert' },
      { id: 'menu-alert-man-fraud', code: 'ALT-MAN-FRD', name: 'Manual Alert Fraud', path: '/manual-alert/fraud', parentId: 'menu-alert' },
      { id: 'menu-alert-man-aml', code: 'ALT-MAN-AML', name: 'Manual Alert AML', path: '/manual-alert/aml', parentId: 'menu-alert' },
      { id: 'menu-alert-history', code: 'ALT-HIST', name: 'Investigation History', path: '/investigation/history', parentId: 'menu-alert' },
    ]
  },
  {
    id: 'menu-rules',
    code: 'RULES-ENG',
    name: 'RULES ENGINE',
    isParent: true,
    children: [
      { id: 'menu-rule-tpl', code: 'RUL-TPL', name: 'Rule Template', path: '/rules/template', parentId: 'menu-rules' },
      { id: 'menu-rule-bsc', code: 'RUL-BSC', name: 'Rule Basic Engine', path: '/rules/basic', parentId: 'menu-rules' },
      { id: 'menu-rule-btest', code: 'RUL-BTST', name: 'Backtesting Simulation', path: '/rules/backtesting', parentId: 'menu-rules' },
      { id: 'menu-rule-risk', code: 'RUL-RISK', name: 'Formula & Risk Weights', path: '/rules/formula-risk', parentId: 'menu-rules' },
    ]
  },
  {
    id: 'menu-lists',
    code: 'LIST-MGT',
    name: 'LIST MANAGEMENT',
    isParent: true,
    children: [
      { id: 'menu-list-black', code: 'LST-BLK', name: 'Blacklist Management', path: '/lists/blacklist', parentId: 'menu-lists' },
      { id: 'menu-list-aml-blk', code: 'LST-AML-BLK', name: 'AML Master Blacklist', path: '/aml/master-blacklist', parentId: 'menu-lists' },
      { id: 'menu-list-watch', code: 'LST-WAT', name: 'Watchlist Management', path: '/lists/watchlist', parentId: 'menu-lists' },
      { id: 'menu-list-white', code: 'LST-WHT', name: 'Whitelist Management', path: '/lists/whitelist', parentId: 'menu-lists' },
      { id: 'menu-list-ext', code: 'LST-EXT', name: 'External Blacklist (DHN/DTTOT)', path: '/lists/external-blacklist', parentId: 'menu-lists' },
    ]
  },
  {
    id: 'menu-system-param',
    code: 'SYS-PARAM',
    name: 'SYSTEM PARAMETER',
    isParent: true,
    children: [
      { id: 'menu-sys-user', code: 'SYS-USR', name: 'User Management', path: '/system-parameter/user', parentId: 'menu-system-param' },
      { id: 'menu-sys-group', code: 'SYS-GRP', name: 'Group Management', path: '/system-parameter/group', parentId: 'menu-system-param' },
      { id: 'menu-sys-role', code: 'SYS-ROL', name: 'Role Management', path: '/system-parameter/role', parentId: 'menu-system-param' },
      { id: 'menu-sys-access', code: 'SYS-ACC', name: 'Access Menu Management', path: '/system-parameter/access-menu', parentId: 'menu-system-param' },
      { id: 'menu-sys-mail', code: 'SYS-MAIL', name: 'Email Template', path: '/system-parameter/email-template', parentId: 'menu-system-param' },
      { id: 'menu-sys-app-param', code: 'SYS-APP-PARAM', name: 'Application Parameter', path: '/system-parameter/application-parameter', parentId: 'menu-system-param' },
      { id: 'menu-sys-udp', code: 'SYS-UDP', name: 'User Defined Parameter', path: '/system-parameter/user-defined-parameter', parentId: 'menu-system-param' },
    ]
  },
  {
    id: 'menu-process',
    code: 'PROCESS-ENG',
    name: 'PROCESS',
    isParent: true,
    children: [
      { id: 'menu-proc-task', code: 'PRC-TSK', name: 'Task', path: '/process/task', parentId: 'menu-process' },
      { id: 'menu-proc-list', code: 'PRC-LST', name: 'List Process', path: '/process/list-process', parentId: 'menu-process' },
      { id: 'menu-proc-exec', code: 'PRC-EXE', name: 'Manual Execution', path: '/process/manual-execution', parentId: 'menu-process' },
    ]
  },
  {
    id: 'menu-audit-trail',
    code: 'AUDIT-TRAIL',
    name: 'AUDIT TRAIL',
    isParent: true,
    children: [
      { id: 'menu-audit-sys', code: 'AUD-SYS', name: 'Audit Trail System (ELMAH)', path: '/audit-trail/system', parentId: 'menu-audit-trail' },
      { id: 'menu-audit-chg', code: 'AUD-CHG', name: 'Audit Trail Changes', path: '/audit-trail/changes', parentId: 'menu-audit-trail' },
      { id: 'menu-audit-log', code: 'AUD-LOG', name: 'Audit Trail User Login', path: '/audit-trail/login', parentId: 'menu-audit-trail' },
      { id: 'menu-audit-acc', code: 'AUD-ACC', name: 'Audit Trail User Access', path: '/audit-trail/access', parentId: 'menu-audit-trail' },
      { id: 'menu-audit-mail', code: 'AUD-MAIL', name: 'Audit Trail Mail', path: '/audit-trail/mail', parentId: 'menu-audit-trail' },
    ]
  },
  {
    id: 'menu-reports-shift',
    code: 'REP-SHIFT',
    name: 'REPORTS & SHIFTING',
    isParent: true,
    children: [
      { id: 'menu-rep-fraud', code: 'REP-FRD', name: 'Fraud Report Analytics', path: '/reports/fraud', parentId: 'menu-reports-shift' },
      { id: 'menu-rep-aml', code: 'REP-AML', name: 'AML Regulatory Report', path: '/reports/aml', parentId: 'menu-reports-shift' },
      { id: 'menu-shift-sched', code: 'SHF-SCH', name: 'Shift Schedule & Roster', path: '/shifting/schedule', parentId: 'menu-reports-shift' },
    ]
  }
];

// Helper to flatten tree
export const getAllMenuItemIds = (): string[] => {
  const ids: string[] = [];
  FMS_MENU_TREE.forEach(parent => {
    ids.push(parent.id);
    if (parent.children) {
      parent.children.forEach(child => ids.push(child.id));
    }
  });
  return ids;
};

// Default full permissions
const createFullPermissions = (): MenuPermissions => ({
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canExport: true,
});

// Default read-only permissions
const createReadOnlyPermissions = (): MenuPermissions => ({
  canView: true,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canExport: true,
});

// Default empty permissions
const createNoPermissions = (): MenuPermissions => ({
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canExport: false,
});

// Generator for default matrix per role
export const generateInitialMatrices = (): Record<string, RoleMenuAccessMatrix> => {
  const allIds = getAllMenuItemIds();

  // 1. AFC L1 (Fraud First-Level Operator)
  const afcL1Permissions: Record<string, MenuPermissions> = {};
  allIds.forEach(id => {
    if (id.startsWith('menu-profile') || id.startsWith('menu-alert-fraud') || id.startsWith('menu-alert-man-fraud') || id.startsWith('menu-alert-history')) {
      afcL1Permissions[id] = { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true };
    } else if (id.startsWith('menu-lists') || id.startsWith('menu-rep-fraud')) {
      afcL1Permissions[id] = { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true };
    } else {
      afcL1Permissions[id] = createNoPermissions();
    }
  });
  // Ensure parent flags
  afcL1Permissions['menu-profile'] = { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true };
  afcL1Permissions['menu-alert'] = { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true };
  afcL1Permissions['menu-lists'] = { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true };

  // 2. AFC L2 (Senior Fraud Investigator / Supervisor)
  const afcL2Permissions: Record<string, MenuPermissions> = {};
  allIds.forEach(id => {
    if (id.startsWith('menu-profile') || id.startsWith('menu-alert') || id.startsWith('menu-lists') || id.startsWith('menu-rep-fraud')) {
      afcL2Permissions[id] = { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true };
    } else if (id.startsWith('menu-rules') || id.startsWith('menu-audit-chg') || id.startsWith('menu-shift-sched')) {
      afcL2Permissions[id] = { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true };
    } else {
      afcL2Permissions[id] = createNoPermissions();
    }
  });
  afcL2Permissions['menu-profile'] = createFullPermissions();
  afcL2Permissions['menu-alert'] = createFullPermissions();
  afcL2Permissions['menu-lists'] = createFullPermissions();

  // 3. Analyst L1 (AML Analyst Triage)
  const analystL1Permissions: Record<string, MenuPermissions> = {};
  allIds.forEach(id => {
    if (id.startsWith('menu-profile') || id.startsWith('menu-alert-aml') || id.startsWith('menu-alert-man-aml') || id.startsWith('menu-alert-history')) {
      analystL1Permissions[id] = { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true };
    } else if (id.startsWith('menu-lists') || id.startsWith('menu-rep-aml')) {
      analystL1Permissions[id] = { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true };
    } else {
      analystL1Permissions[id] = createNoPermissions();
    }
  });
  analystL1Permissions['menu-profile'] = { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true };
  analystL1Permissions['menu-alert'] = { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true };

  // 4. Analyst L2 (Senior AML Officer & Compliance Sign-Off)
  const analystL2Permissions: Record<string, MenuPermissions> = {};
  allIds.forEach(id => {
    if (id.startsWith('menu-profile') || id.startsWith('menu-alert') || id.startsWith('menu-lists') || id.startsWith('menu-reports-shift')) {
      analystL2Permissions[id] = { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true };
    } else if (id.startsWith('menu-audit-trail')) {
      analystL2Permissions[id] = { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true };
    } else {
      analystL2Permissions[id] = createNoPermissions();
    }
  });
  analystL2Permissions['menu-profile'] = createFullPermissions();
  analystL2Permissions['menu-alert'] = createFullPermissions();
  analystL2Permissions['menu-audit-trail'] = createReadOnlyPermissions();

  // 5. IT PSS Maker Checker (Technical Platform Support & Engine)
  const itPssPermissions: Record<string, MenuPermissions> = {};
  allIds.forEach(id => {
    if (id.startsWith('menu-rules') || id.startsWith('menu-audit-trail')) {
      itPssPermissions[id] = { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true };
    } else if (id.startsWith('menu-system-param')) {
      itPssPermissions[id] = { canView: true, canCreate: false, canEdit: true, canDelete: false, canExport: true };
    } else {
      itPssPermissions[id] = { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false };
    }
  });
  itPssPermissions['menu-audit-trail'] = createFullPermissions();
  itPssPermissions['menu-rules'] = createFullPermissions();

  // 6. IT DCA Maker Checker (Data Config Administration & Master Access)
  const itDcaPermissions: Record<string, MenuPermissions> = {};
  allIds.forEach(id => {
    if (id.startsWith('menu-system-param') || id.startsWith('menu-audit-trail') || id.startsWith('menu-rules') || id.startsWith('menu-lists')) {
      itDcaPermissions[id] = createFullPermissions();
    } else {
      itDcaPermissions[id] = createReadOnlyPermissions();
    }
  });
  itDcaPermissions['menu-system-param'] = createFullPermissions();
  itDcaPermissions['menu-audit-trail'] = createFullPermissions();

  // 7. Administrator (Super Admin)
  const adminPermissions: Record<string, MenuPermissions> = {};
  allIds.forEach(id => {
    adminPermissions[id] = createFullPermissions();
  });

  return {
    'AFC L1': {
      roleId: 'GRP-001',
      roleName: 'AFC L1',
      description: 'Fraud L1 - First-level alert triage & verification',
      permissions: afcL1Permissions,
      lastUpdated: '2026-09-04 00:45:00',
      updatedBy: 'yoseph.sanjaya',
      isLocked: true,
      lockedBy: 'yoseph.sanjaya (Security Administrator)',
      lockedAt: '2026-09-04 00:45:00',
      version: '1.14'
    },
    'AFC L2': {
      roleId: 'GRP-002',
      roleName: 'AFC L2',
      description: 'Fraud L2 - Senior investigator & supervisor approval',
      permissions: afcL2Permissions,
      lastUpdated: '2026-09-04 00:45:00',
      updatedBy: 'yoseph.sanjaya',
      isLocked: true,
      lockedBy: 'yoseph.sanjaya (Security Administrator)',
      lockedAt: '2026-09-04 00:45:00',
      version: '1.14'
    },
    'Analyst L1': {
      roleId: 'GRP-003',
      roleName: 'Analyst L1',
      description: 'AML Analyst L1 - Initial alert checking & entity screening',
      permissions: analystL1Permissions,
      lastUpdated: '2026-09-04 00:45:00',
      updatedBy: 'siti.aminah',
      isLocked: true,
      lockedBy: 'siti.aminah (AML Compliance Head)',
      lockedAt: '2026-09-04 00:45:00',
      version: '1.14'
    },
    'Analyst L2': {
      roleId: 'GRP-004',
      roleName: 'Analyst L2',
      description: 'AML Analyst L2 - Senior AML officer & STR reporting sign-off',
      permissions: analystL2Permissions,
      lastUpdated: '2026-09-04 00:45:00',
      updatedBy: 'siti.aminah',
      isLocked: true,
      lockedBy: 'siti.aminah (AML Compliance Head)',
      lockedAt: '2026-09-04 00:45:00',
      version: '1.14'
    },
    'IT PSS Maker Checker': {
      roleId: 'GRP-005',
      roleName: 'IT PSS Maker Checker',
      description: 'IT Technical Support - System monitoring & engine execution',
      permissions: itPssPermissions,
      lastUpdated: '2026-09-04 00:45:00',
      updatedBy: 'system.admin',
      isLocked: true,
      lockedBy: 'system.admin (IT PSS Lead)',
      lockedAt: '2026-09-04 00:45:00',
      version: '1.14'
    },
    'IT DCA Maker Checker': {
      roleId: 'GRP-006',
      roleName: 'IT DCA Maker Checker',
      description: 'IT Data & Config Administration - Parameter & user provisioning',
      permissions: itDcaPermissions,
      lastUpdated: '2026-09-04 00:45:00',
      updatedBy: 'yoseph.sanjaya',
      isLocked: true,
      lockedBy: 'yoseph.sanjaya (Security Administrator)',
      lockedAt: '2026-09-04 00:45:00',
      version: '1.14'
    },
    'Administrator': {
      roleId: 'GRP-ADMIN',
      roleName: 'Administrator',
      description: 'Full System Superuser & Security Officer',
      permissions: adminPermissions,
      lastUpdated: '2026-09-04 00:45:00',
      updatedBy: 'root.admin',
      isLocked: true,
      lockedBy: 'root.admin (Chief Security Officer)',
      lockedAt: '2026-09-04 00:45:00',
      version: '1.14'
    }
  };
};
