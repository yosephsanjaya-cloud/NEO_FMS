import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { 
  FraudCase, 
  RuleTemplate, 
  RuleBasic, 
  FormulaRisk, 
  ListEntry, 
  ListType,
  ExternalBlacklistEntry,
  BacktestingSession, 
  AmlCifGroup, 
  ActiveNavTab,
  AlertStatus,
  InvestigationStatus,
  CaseUrgency,
  VariablePlaceholder,
  FraudCaseAttachment,
  TransactionInfo,
  ShiftSchedule,
  ShiftHandover,
  InvestigatorProfile,
  ShiftCode,
  ShiftDefinition,
  RuleApprovalTicket,
  RuleTicketActionType,
  RuleTicketStatus,
  SystemNotification,
  InvestigationHistoryItem,
  HistoryDomain,
  AmlCifHistoryGroup
} from '../types/fms';
import { INITIAL_INVESTIGATION_HISTORY } from '../data/mockInvestigationHistory';
import { formatTaxonomyLabel, resolveClosingStatus } from '../lib/taxonomyHelper';
import { 
  INITIAL_RULE_TEMPLATES, 
  INITIAL_RULE_BASICS, 
  INITIAL_FORMULA_RISKS, 
  INITIAL_LIST_ENTRIES, 
  INITIAL_FRAUD_CASES, 
  INITIAL_BACKTESTING_SESSIONS 
} from '../data/mockData';
import { INITIAL_RULE_APPROVAL_TICKETS } from '../data/mockRuleApprovalTickets';
import {
  INITIAL_EXTERNAL_BLACKLIST
} from '../data/mockExternalBlacklist';
import {
  SHIFT_DEFINITIONS,
  INITIAL_INVESTIGATORS,
  generateInitialShiftSchedules,
  INITIAL_HANDOVERS,
  formatDateYYYYMMDD
} from '../data/mockShiftData';
import { 
  bumpVersionMinor, 
  bumpVersionMajor, 
  bumpSemanticVersion,
  calculateRiskLevelFromScore 
} from '../lib/utils';
import { 
  SystemUser, 
  SystemGroup, 
  SystemRole, 
  EmailTemplate, 
  ApplicationParameters,
  UserDefinedParameterConfig,
  UserDefinedParameterItem,
  UserSessionRecord
} from '../types/systemParameter';
import { 
  INITIAL_SYSTEM_USERS, 
  INITIAL_SYSTEM_GROUPS, 
  INITIAL_SYSTEM_ROLES,
  INITIAL_EMAIL_TEMPLATES,
  INITIAL_APPLICATION_PARAMETERS,
  INITIAL_USER_DEFINED_PARAMETERS,
  INITIAL_UDP_ITEMS,
  INITIAL_USER_SESSIONS
} from '../data/mockSystemParameters';
import { 
  AuditSystemLog, 
  AuditChangeLog, 
  AuditUserLogin, 
  AuditUserAccess, 
  AuditMailLog 
} from '../types/auditTrail';
import { WatchlistLocation } from '../types/watchlistLocation';
import { INITIAL_WATCHLIST_LOCATIONS } from '../data/mockWatchlistLocations';
import { 
  INITIAL_SYSTEM_LOGS, 
  INITIAL_CHANGE_LOGS, 
  INITIAL_LOGIN_LOGS, 
  INITIAL_ACCESS_LOGS, 
  INITIAL_MAIL_LOGS 
} from '../data/mockAuditTrail';
import { RoleMenuAccessMatrix, MenuPermissions } from '../types/accessMenu';
import { generateInitialMatrices } from '../data/mockAccessMenu';
import { ProcessTask, ProcessItem, ProcessExecutionLog, ExecutionLogDetailStep } from '../types/process';
import { 
  INITIAL_PROCESS_TASKS, 
  INITIAL_PROCESS_LIST, 
  INITIAL_PROCESS_EXECUTIONS 
} from '../data/mockProcessData';
import { AmlMasterBlacklistEntry } from '../types/amlBlacklist';
import { INITIAL_AML_BLACKLIST } from '../data/mockAmlBlacklist';

interface FMSContextType {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  fraudCases: FraudCase[];
  ruleTemplates: RuleTemplate[];
  ruleBasics: RuleBasic[];
  formulaRisks: FormulaRisk[];
  listEntries: ListEntry[];
  backtestSessions: BacktestingSession[];
  
  // Modals & Selected items state
  selectedCaseForDetail: FraudCase | null;
  setSelectedCaseForDetail: (c: FraudCase | null) => void;
  selectedCaseForFollowUp: FraudCase | null;
  setSelectedCaseForFollowUp: (c: FraudCase | null) => void;
  selectedCaseForApproval: FraudCase | null;
  setSelectedCaseForApproval: (c: FraudCase | null) => void;
  selectedAmlGroupForDetail: AmlCifGroup | null;
  setSelectedAmlGroupForDetail: (g: AmlCifGroup | null) => void;
  selectedAmlGroupForFollowUp: AmlCifGroup | null;
  setSelectedAmlGroupForFollowUp: (g: AmlCifGroup | null) => void;

  // Case Actions
  handleOpenDetail: (caseId: string | FraudCase) => void;
  handleOpenFollowUp: (caseId: string | FraudCase) => void;
  handleOpenApproval: (caseId: string | FraudCase) => void;
  handleSaveDraftFollowUp: (
    caseId: string,
    data: {
      reviewer?: string;
      reviewerResult?: string;
      reviewerComment?: string;
      finalResult?: string;
      closingAction?: string;
      typeOfFraud?: string;
      attachments?: any[];
    }
  ) => void;
  handleSubmitFollowUp: (
    caseId: string,
    data: {
      reviewer?: string;
      reviewerResult?: string;
      reviewerComment?: string;
      finalResult?: string;
      closingAction?: string;
      typeOfFraud?: string;
      attachments?: any[];
      suspendDuration?: string;
      watchlistType?: 'Permanent' | 'Temporary';
      watchlistDuration?: string;
    }
  ) => string;
  investigationHistory: InvestigationHistoryItem[];
  amlInvestigationHistory: (InvestigationHistoryItem | AmlCifHistoryGroup)[];
  addAmlCifHistoryGroup?: (group: AmlCifHistoryGroup) => void;
  updateInvestigationHistoryItem: (updatedItem: InvestigationHistoryItem | AmlCifHistoryGroup) => void;
  handleApproveCase: (
    caseId: string,
    approverName: string,
    approverNotes?: string,
    followUpPayload?: {
      reviewerResult?: string;
      finalResult?: string;
      closingAction?: string;
      typeOfFraud?: string;
      typeOfAml?: string;
      reviewerComment?: string;
      reviewer?: string;
      submittedBy?: string;
      approverComment?: string;
      approvedBy?: string;
      closedAt?: string;
    }
  ) => void;
  handleRejectCase: (
    caseId: string,
    rejectorName: string,
    rejectReason?: string,
    returnStatus?: 'Draft' | 'Open'
  ) => void;
  updateCifStatus: (cifNumber: string, newStatus: InvestigationStatus) => void;
  handleSaveFollowUp: (
    caseId: string, 
    update: { 
      alertStatus: AlertStatus; 
      assignee?: string; 
      resolutionNotes?: string; 
      disposition?: any;
      reviewer?: string;
      reviewerResult?: string;
      reviewerComment?: string;
      finalResult?: string;
      closingAction?: string;
      typeOfFraud?: string;
      attachments?: any[];
    }
  ) => void;
  handleBatchAction: (
    caseIds: string[], 
    update: { 
      alertStatus?: AlertStatus; 
      assignee?: string; 
      disposition?: any; 
      note?: string 
    }
  ) => void;
  handleOpenBatchFollowUp: (caseIds: string[]) => void;
  handleBatchFollowUpSubmit: (
    caseIds: string[],
    data: {
      alertStatus?: AlertStatus;
      investigator?: string;
      reviewer?: string;
      finalResult: string;
      reviewerResult: string;
      closingAction: string;
      typeOfFraud: string;
      reviewerComment: string;
      attachments?: FraudCaseAttachment[];
      suspendDuration?: string;
      watchlistType?: 'Permanent' | 'Temporary';
      watchlistDuration?: string;
    }
  ) => void;
  handleBatchFollowUpSaveDraft: (
    caseIds: string[],
    data: {
      alertStatus?: AlertStatus;
      investigator?: string;
      reviewer?: string;
      finalResult: string;
      reviewerResult: string;
      closingAction: string;
      typeOfFraud: string;
      reviewerComment: string;
      attachments?: FraudCaseAttachment[];
    }
  ) => void;

  // Manual Alert Actions
  createManualAlert: (data: {
    alertCategory: 'Fraud' | 'AML';
    source: string;
    severity: CaseUrgency;
    detectionDate: string;
    cif: string;
    customerName: string;
    customerId?: string;
    sourceAccountNumber?: string;
    phoneNumber?: string;
    deviceId?: string;
    externalCaseId?: string;
    incidentDescription: string;
    note?: string;
    transaction?: TransactionInfo;
    transactionEvidenceList?: TransactionInfo[];
    attachments?: FraudCaseAttachment[];
    alertStatus?: AlertStatus;
  }) => FraudCase;

  // Rule Template Actions
  createRuleTemplate: (tpl: Omit<RuleTemplate, 'id' | 'version' | 'status' | 'testingStatus' | 'createdOn' | 'updatedAt'>) => void;
  updateRuleTemplate: (id: string, updated: Partial<RuleTemplate>, parameterStructureChanged: boolean) => void;
  deleteRuleTemplate: (id: string) => void;

  // Rule Basic Actions
  createRuleBasic: (basic: Omit<RuleBasic, 'id' | 'version' | 'status' | 'syncStatus' | 'testingStatus' | 'createdOn' | 'updatedAt'>) => void;
  updateRuleBasic: (id: string, updated: Partial<RuleBasic>) => void;
  syncRuleBasic: (id: string) => void;
  deleteRuleBasic: (id: string) => void;

  // Rule Maker-Checker Approval Actions
  ruleApprovalTickets: RuleApprovalTicket[];
  createRuleTicket: (ticket: Omit<RuleApprovalTicket, 'id' | 'ticketNo' | 'createdAt' | 'status'>) => RuleApprovalTicket;
  approveRuleTicket: (ticketId: string, checkerName?: string, checkerNotes?: string) => void;
  rejectRuleTicket: (ticketId: string, rejectorName?: string, rejectNotes?: string) => void;
  getPendingRuleApprovalCount: (targetType?: string, domain?: string) => number;

  // Formula Risk Actions
  createFormulaRisk: (formula: Omit<FormulaRisk, 'id' | 'createdAt'>) => void;
  updateFormulaRisk: (id: string, updated: Partial<FormulaRisk>) => void;
  deleteFormulaRisk: (id: string) => void;

  // List Management Actions
  createListEntry: (entry: Omit<ListEntry, 'id' | 'createdAt' | 'matchCount'>) => { newEntry: ListEntry; ticketNo?: string };
  updateListEntry: (id: string, updated: Partial<ListEntry>) => void;
  deleteListEntry: (id: string) => void;
  bulkImportListEntries: (
    entries: Array<Omit<ListEntry, 'id' | 'createdAt' | 'matchCount'>>,
    options?: { batchId?: string; fileName?: string; targetDomain?: 'FRAUD' | 'AML'; targetListType?: ListType; makerName?: string }
  ) => { addedCount: number; batchId?: string; ticketNo?: string };

  // External Blacklist Actions
  externalBlacklistEntries: ExternalBlacklistEntry[];
  createExternalBlacklistEntry: (entry: Omit<ExternalBlacklistEntry, 'id' | 'createdAt' | 'matchStatus' | 'lastCheckedAt'>) => void;
  updateExternalBlacklistEntry: (id: string, updated: Partial<ExternalBlacklistEntry>) => void;
  deleteExternalBlacklistEntry: (id: string) => void;
  bulkImportExternalBlacklist: (entries: Array<Omit<ExternalBlacklistEntry, 'id' | 'createdAt' | 'matchStatus' | 'lastCheckedAt'>>) => { addedCount: number; matchedCount: number };
  checkCifMatch: (entry: { identityNumber: string; fullName: string; accountNumber?: string; phoneNumber?: string }) => { isMatched: boolean; matchedCif?: string; matchedCustomerName?: string };

  // Backtesting
  runBacktestSimulation: (sessionParams: {
    category: any;
    ruleTemplateCode?: string;
    ruleBasicCode?: string;
    targetVersion: string;
    datasetPeriod: string;
  }) => Promise<BacktestingSession>;
  promoteRuleAfterTest: (ruleType: 'Template' | 'Basic', code: string) => void;

  // Shifting & Roster Management (Section D)
  shiftSchedules: ShiftSchedule[];
  shiftHandovers: ShiftHandover[];
  investigators: InvestigatorProfile[];
  shiftDefinitions: ShiftDefinition[];
  activeShiftDef: ShiftDefinition;
  onDutyInvestigators: InvestigatorProfile[];
  addShiftSchedule: (schedule: Omit<ShiftSchedule, 'id'>) => void;
  updateShiftSchedule: (id: string, updated: Partial<ShiftSchedule>) => void;
  deleteShiftSchedule: (id: string) => void;
  bulkAssignShift: (data: { userIds: string[]; startDate: string; endDate: string; shiftCode: ShiftCode; notes?: string }) => void;
  createShiftHandover: (data: Omit<ShiftHandover, 'id' | 'handoverNo' | 'timestamp' | 'status'>) => ShiftHandover;
  acknowledgeShiftHandover: (id: string, acknowledgedBy: string) => void;
  getInvestigatorDutyStatus: (nameOrAssignee: string) => { isOnDuty: boolean; currentShift?: string; role?: string; profile?: InvestigatorProfile };
  autoRecommendAssignee: (domain?: 'Fraud' | 'AML') => InvestigatorProfile | null;

  // Computed / Aggregated Data
  amlGroups: AmlCifGroup[];
  kpiStats: {
    totalCases: number;
    lowUrgency: number;
    medUrgency: number;
    highUrgency: number;
    openAlerts: number;
    onCheckAlerts: number;
    pendingApproval: number;
    closedAlerts: number;
  };
  activeListType: 'Blacklist' | 'Watchlist' | 'Whitelist';
  setActiveListType: (type: 'Blacklist' | 'Watchlist' | 'Whitelist') => void;
  activeListCategory: string;
  setActiveListCategory: (cat: string) => void;
  ruleTemplateDomain: 'ALL' | 'Fraud' | 'AML';
  setRuleTemplateDomain: (domain: 'ALL' | 'Fraud' | 'AML') => void;
  ruleBasicDomain: 'ALL' | 'Fraud' | 'AML';
  setRuleBasicDomain: (domain: 'ALL' | 'Fraud' | 'AML') => void;
  blacklistDomain: 'FRAUD' | 'AML';
  setBlacklistDomain: (domain: 'FRAUD' | 'AML') => void;

  // System Parameter (User, Group, Role)
  systemUsers: SystemUser[];
  systemGroups: SystemGroup[];
  systemRoles: SystemRole[];
  addSystemUser: (user: Omit<SystemUser, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateSystemUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteSystemUser: (id: string) => void;
  addSystemGroup: (group: Omit<SystemGroup, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateSystemGroup: (id: string, updates: Partial<SystemGroup>) => void;
  deleteSystemGroup: (id: string) => void;
  addSystemRole: (role: Omit<SystemRole, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateSystemRole: (id: string, updates: Partial<SystemRole>) => void;
  deleteSystemRole: (id: string) => void;

  // System Parameter (Email Template)
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: Omit<EmailTemplate, 'id' | 'createdDate' | 'updatedDate'>) => void;
  updateEmailTemplate: (id: string, updates: Partial<EmailTemplate>) => void;
  deleteEmailTemplate: (id: string) => void;
  toggleEmailTemplateStatus: (id: string) => void;

  // System Parameter (Watchlist Location)
  watchlistLocations: WatchlistLocation[];
  createWatchlistLocation: (loc: Omit<WatchlistLocation, 'id' | 'createdDate' | 'lastUpdateDate' | 'approvalStatus'>, reason?: string, asMaker?: boolean) => WatchlistLocation;
  updateWatchlistLocation: (id: string, updates: Partial<WatchlistLocation>, reason?: string, asMaker?: boolean) => void;
  deleteWatchlistLocation: (id: string, reason?: string, asMaker?: boolean) => void;
  toggleWatchlistLocationStatus: (id: string, reason?: string, asMaker?: boolean) => void;
  resetWatchlistLocations: () => void;

  // Audit Trail State & Operations
  auditSystemLogs: AuditSystemLog[];
  auditChangeLogs: AuditChangeLog[];
  auditUserLogins: AuditUserLogin[];
  auditUserAccesses: AuditUserAccess[];
  auditMailLogs: AuditMailLog[];
  addAuditSystemLog: (log: Omit<AuditSystemLog, 'id' | 'dateTime'>) => void;
  clearAuditSystemLogs: () => void;
  addAuditChangeLog: (log: Omit<AuditChangeLog, 'id' | 'timestamp'>) => void;
  addAuditUserLogin: (log: Omit<AuditUserLogin, 'id' | 'timestamp'>) => void;
  addAuditUserAccess: (log: Omit<AuditUserAccess, 'id' | 'timestamp'>) => void;
  addAuditMailLog: (log: Omit<AuditMailLog, 'id' | 'timestamp'>) => void;

  // Notification Center
  notifications: SystemNotification[];
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (domainFilter?: 'FRAUD' | 'AML' | 'ALL') => void;
  clearAllNotifications: () => void;

  // Interactive Live Demo & Session Storage Persistence
  resetToInitialMockData: () => void;

  // Access Menu Management
  roleMenuMatrices: Record<string, RoleMenuAccessMatrix>;
  saveRoleMenuPermissions: (roleName: string, permissions: Record<string, MenuPermissions>, lockStatus?: boolean) => void;
  toggleLockRoleMenuMatrix: (roleName: string, lock: boolean) => void;
  resetRoleMenuPermissions: (roleName: string) => void;

  // Application Parameters
  applicationParameters: ApplicationParameters;
  updateApplicationParameters: (
    section: 'email' | 'login' | 'message' | 'integration' | 'all',
    updates: any,
    reason?: string
  ) => void;
  resetApplicationParameters: () => void;

  // User Defined Parameters (UDP)
  userDefinedParameters: UserDefinedParameterConfig;
  userDefinedParameterItems: UserDefinedParameterItem[];
  updateUserDefinedParameters: (updates: Partial<UserDefinedParameterConfig>, reason?: string) => void;
  updateUserDefinedParameterItem: (id: string, updates: Partial<UserDefinedParameterItem>) => void;
  resetUserDefinedParameters: () => void;

  // User Session & Lockout Management
  userSessions: UserSessionRecord[];
  forceLogoutUser: (sessionIdOrUserId: string) => void;
  requestUnlockUser: (sessionIdOrUserId: string, reason: string) => void;

  // Process Module (Task, List Process, Manual Execution)
  processTasks: ProcessTask[];
  addProcessTask: (task: Omit<ProcessTask, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => ProcessTask;
  updateProcessTask: (id: string, updates: Partial<ProcessTask>) => void;
  deleteProcessTask: (id: string) => void;
  toggleProcessTaskStatus: (id: string) => void;

  processList: ProcessItem[];
  addProcessItem: (item: Omit<ProcessItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => ProcessItem;
  updateProcessItem: (id: string, updates: Partial<ProcessItem>) => void;
  deleteProcessItem: (id: string) => void;
  toggleProcessItemStatus: (id: string) => void;

  processExecutions: ProcessExecutionLog[];
  triggerManualExecution: (params: {
    type: 'Process' | 'Task';
    targetId: string;
    executionDate?: string;
    remarks?: string;
  }) => ProcessExecutionLog;
  terminateExecution: (id: string) => void;

  // AML Master Blacklist (Judol & Entitas Terlarang)
  amlBlacklistEntries: AmlMasterBlacklistEntry[];
  addAmlBlacklistEntry: (entry: Omit<AmlMasterBlacklistEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => AmlMasterBlacklistEntry;
  updateAmlBlacklistEntry: (id: string, updates: Partial<AmlMasterBlacklistEntry>) => void;
  deleteAmlBlacklistEntry: (id: string) => void;
  toggleAmlBlacklistStatus: (id: string) => void;
  bulkImportAmlBlacklist: (entries: Array<Omit<AmlMasterBlacklistEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>) => { addedCount: number };
}

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-001',
    domain: 'FRAUD',
    title: 'Pengajuan Approval Baru',
    message: 'User afcl1 mengajukan perubahan pada Template Rule TRX High Value (TPL-VEL-01). Perlu peninjauan Anda.',
    timestamp: '10 menit yang lalu',
    isRead: false,
    targetTab: 'rule-template-fraud-approval',
    ticketId: 'TKT-TPL-FRD-20260907-001',
    targetRole: 'afcl2'
  },
  {
    id: 'notif-002',
    domain: 'AML',
    title: 'Pengajuan Disetujui',
    message: 'Pengajuan Basic Rule AML (R-AML-STRUCT-01) Anda telah DISETUJUI oleh Hendrawan Kusuma.',
    timestamp: '1 jam yang lalu',
    isRead: false,
    targetTab: 'rule-basic-aml-view',
    ticketId: 'TKT-BSC-AML-20260907-002',
    targetRole: 'analystl1'
  }
];

export const DEMO_SESSION_KEYS = {
  CASES_LIST: 'casesList',
  NOTIFICATIONS: 'notifications',
  APPROVAL_QUEUE: 'approvalQueue',
  FMS_CASES_LIST: 'fms_cases_list',
  FMS_NOTIFICATIONS: 'fms_notifications',
  FMS_APPROVAL_QUEUE: 'fms_approval_queue',
  LIST_ENTRIES: 'fms_list_entries',
  BATCH_DRAFTS: 'fms_batch_upload_drafts'
} as const;

// Helper to purge demo cache from sessionStorage
export const clearDemoSessionCache = () => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(DEMO_SESSION_KEYS.CASES_LIST);
      sessionStorage.removeItem(DEMO_SESSION_KEYS.NOTIFICATIONS);
      sessionStorage.removeItem(DEMO_SESSION_KEYS.APPROVAL_QUEUE);
      sessionStorage.removeItem(DEMO_SESSION_KEYS.FMS_CASES_LIST);
      sessionStorage.removeItem(DEMO_SESSION_KEYS.FMS_NOTIFICATIONS);
      sessionStorage.removeItem(DEMO_SESSION_KEYS.FMS_APPROVAL_QUEUE);
      sessionStorage.removeItem(DEMO_SESSION_KEYS.LIST_ENTRIES);
      sessionStorage.removeItem(DEMO_SESSION_KEYS.BATCH_DRAFTS);
      sessionStorage.removeItem('fms_cif_status_overrides');
    }
  } catch (err) {
    console.warn('Failed clearing demo session storage cache:', err);
  }
};

// Automatic Reset on Reload / Refresh:
// When the page or frame is refreshed (F5, AI Studio "Reload Frame" button, or re-opened tab),
// purge sessionStorage cache so the app automatically reverts to Initial Mock Data.
if (typeof window !== 'undefined') {
  try {
    const navEntries = window.performance?.getEntriesByType?.('navigation');
    const isReload = (navEntries && navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'reload') ||
      // @ts-ignore
      window.performance?.navigation?.type === 1;

    if (isReload) {
      clearDemoSessionCache();
    }
  } catch (err) {
    console.warn('Navigation check error:', err);
  }

  // Clear session cache on window unload/reload so next reload starts fresh with initial mock data
  window.addEventListener('beforeunload', () => {
    try {
      clearDemoSessionCache();
    } catch {
      // Ignore cleanup error on unload
    }
  });
}

const getInitialCases = (): FraudCase[] => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(DEMO_SESSION_KEYS.CASES_LIST) || 
                  sessionStorage.getItem(DEMO_SESSION_KEYS.FMS_CASES_LIST);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_FRAUD_CASES.length) return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading casesList from sessionStorage:', err);
  }
  return INITIAL_FRAUD_CASES;
};

const getInitialNotifications = (): SystemNotification[] => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(DEMO_SESSION_KEYS.NOTIFICATIONS) || 
                  sessionStorage.getItem(DEMO_SESSION_KEYS.FMS_NOTIFICATIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading notifications from sessionStorage:', err);
  }
  return INITIAL_NOTIFICATIONS;
};

const getInitialApprovalQueue = (): RuleApprovalTicket[] => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(DEMO_SESSION_KEYS.APPROVAL_QUEUE) || 
                  sessionStorage.getItem(DEMO_SESSION_KEYS.FMS_APPROVAL_QUEUE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading approvalQueue from sessionStorage:', err);
  }
  return INITIAL_RULE_APPROVAL_TICKETS;
};

const persistCasesToSession = (cases: FraudCase[]) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const serialized = JSON.stringify(cases);
      sessionStorage.setItem(DEMO_SESSION_KEYS.CASES_LIST, serialized);
      sessionStorage.setItem(DEMO_SESSION_KEYS.FMS_CASES_LIST, serialized);
    }
  } catch (err) {
    console.warn('Error saving casesList to sessionStorage:', err);
  }
};

const persistNotificationsToSession = (notifs: SystemNotification[]) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const serialized = JSON.stringify(notifs);
      sessionStorage.setItem(DEMO_SESSION_KEYS.NOTIFICATIONS, serialized);
      sessionStorage.setItem(DEMO_SESSION_KEYS.FMS_NOTIFICATIONS, serialized);
    }
  } catch (err) {
    console.warn('Error saving notifications to sessionStorage:', err);
  }
};

const persistApprovalQueueToSession = (queue: RuleApprovalTicket[]) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const serialized = JSON.stringify(queue);
      sessionStorage.setItem(DEMO_SESSION_KEYS.APPROVAL_QUEUE, serialized);
      sessionStorage.setItem(DEMO_SESSION_KEYS.FMS_APPROVAL_QUEUE, serialized);
      
      // Explicitly persist listManagementApprovals for L1/L2 List Management sync
      const listTickets = queue.filter(t => 
        ['CIF', 'Source Account Number', 'Device ID', 'Phone Number', 'Batch Upload List'].includes(t.targetType)
      );
      sessionStorage.setItem('listManagementApprovals', JSON.stringify(listTickets));
    }
  } catch (err) {
    console.warn('Error saving approvalQueue to sessionStorage:', err);
  }
};

const getInitialListEntries = (): ListEntry[] => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(DEMO_SESSION_KEYS.LIST_ENTRIES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading listEntries from sessionStorage:', err);
  }
  return INITIAL_LIST_ENTRIES;
};

const persistListEntriesToSession = (entries: ListEntry[]) => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(DEMO_SESSION_KEYS.LIST_ENTRIES, JSON.stringify(entries));
    }
  } catch (err) {
    console.warn('Error saving listEntries to sessionStorage:', err);
  }
};

const getInitialInvestigationHistory = (domain: 'Fraud' | 'AML'): InvestigationHistoryItem[] => {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const specificKey = domain === 'Fraud' ? 'investigationHistory' : 'amlInvestigationHistory';
      const rawSpecific = sessionStorage.getItem(specificKey);
      if (rawSpecific) {
        const parsed = JSON.parse(rawSpecific);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const rawAll = sessionStorage.getItem('fms_investigation_history');
      if (rawAll) {
        const parsedAll = JSON.parse(rawAll);
        if (Array.isArray(parsedAll)) {
          const filtered = parsedAll.filter((item: any) => item.domain === domain);
          if (filtered.length > 0) return filtered;
        }
      }
    }
  } catch (err) {
    console.warn('Error reading history from sessionStorage:', err);
  }
  return INITIAL_INVESTIGATION_HISTORY.filter(item => item.domain === domain);
};

const FMSContext = createContext<FMSContextType | undefined>(undefined);

export const FMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [userRole, setUserRole] = useState<string>('Checker / Approver');
  const [activeListType, setActiveListType] = useState<'Blacklist' | 'Watchlist' | 'Whitelist'>('Blacklist');
  const [activeListCategory, setActiveListCategory] = useState<string>('All');
  const [blacklistDomain, setBlacklistDomain] = useState<'FRAUD' | 'AML'>('FRAUD');
  const [ruleTemplateDomain, setRuleTemplateDomain] = useState<'ALL' | 'Fraud' | 'AML'>('Fraud');
  const [ruleBasicDomain, setRuleBasicDomain] = useState<'ALL' | 'Fraud' | 'AML'>('Fraud');
  const [fraudCases, setFraudCases] = useState<FraudCase[]>(getInitialCases);
  const [investigationHistory, setInvestigationHistory] = useState<InvestigationHistoryItem[]>(() => getInitialInvestigationHistory('Fraud'));
  const [amlInvestigationHistory, setAmlInvestigationHistory] = useState<any[]>(() => getInitialInvestigationHistory('AML'));
  const [ruleTemplates, setRuleTemplates] = useState<RuleTemplate[]>(INITIAL_RULE_TEMPLATES);
  const [ruleBasics, setRuleBasics] = useState<RuleBasic[]>(INITIAL_RULE_BASICS);
  const [ruleApprovalTickets, setRuleApprovalTickets] = useState<RuleApprovalTicket[]>(getInitialApprovalQueue);
  const [formulaRisks, setFormulaRisks] = useState<FormulaRisk[]>(INITIAL_FORMULA_RISKS);
  const [applicationParameters, setApplicationParameters] = useState<ApplicationParameters>(INITIAL_APPLICATION_PARAMETERS);
  const [userDefinedParameters, setUserDefinedParameters] = useState<UserDefinedParameterConfig>(INITIAL_USER_DEFINED_PARAMETERS);
  const [userDefinedParameterItems, setUserDefinedParameterItems] = useState<UserDefinedParameterItem[]>(INITIAL_UDP_ITEMS);
  const [listEntries, setListEntries] = useState<ListEntry[]>(getInitialListEntries);
  const [externalBlacklistEntries, setExternalBlacklistEntries] = useState<ExternalBlacklistEntry[]>(INITIAL_EXTERNAL_BLACKLIST);
  const [backtestSessions, setBacktestSessions] = useState<BacktestingSession[]>(INITIAL_BACKTESTING_SESSIONS);

  // Notification Center State & Operations with sessionStorage persistence
  const [notifications, setNotifications] = useState<SystemNotification[]>(getInitialNotifications);

  // CIF Status Overrides for real-time synchronization between Follow Up Modal and Main Table
  const [cifStatusOverrides, setCifStatusOverrides] = useState<Record<string, InvestigationStatus>>(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = sessionStorage.getItem('fms_cif_status_overrides');
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return {};
  });

  // Sync changes to sessionStorage whenever casesList, notifications, approvalQueue, or listEntries changes
  useEffect(() => {
    persistCasesToSession(fraudCases);
  }, [fraudCases]);

  useEffect(() => {
    persistNotificationsToSession(notifications);
  }, [notifications]);

  useEffect(() => {
    persistApprovalQueueToSession(ruleApprovalTickets);
  }, [ruleApprovalTickets]);

  useEffect(() => {
    persistListEntriesToSession(listEntries);
  }, [listEntries]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('investigationHistory', JSON.stringify(investigationHistory));
        sessionStorage.setItem('fms_investigation_history', JSON.stringify([...investigationHistory, ...amlInvestigationHistory]));
      }
    } catch {}
  }, [investigationHistory, amlInvestigationHistory]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('amlInvestigationHistory', JSON.stringify(amlInvestigationHistory));
      }
    } catch {}
  }, [amlInvestigationHistory]);

  const resetToInitialMockData = () => {
    clearDemoSessionCache();
    setCifStatusOverrides({});
    setFraudCases(INITIAL_FRAUD_CASES);
    setInvestigationHistory(INITIAL_INVESTIGATION_HISTORY.filter(h => h.domain === 'Fraud'));
    setAmlInvestigationHistory(INITIAL_INVESTIGATION_HISTORY.filter(h => h.domain === 'AML'));
    setNotifications(INITIAL_NOTIFICATIONS);
    setRuleApprovalTickets(INITIAL_RULE_APPROVAL_TICKETS);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('fms_watchlist_locations');
    }
    setWatchlistLocations(INITIAL_WATCHLIST_LOCATIONS);
  };

  const addNotification = (n: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: SystemNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: 'Baru saja',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = (domainFilter: 'FRAUD' | 'AML' | 'ALL' = 'ALL') => {
    setNotifications(prev => prev.map(n => {
      if (domainFilter === 'ALL' || n.domain === domainFilter) {
        return { ...n, isRead: true };
      }
      return n;
    }));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getApprovalTabForTicket = (targetType: string, domain: string): string => {
    const isFraud = domain === 'Fraud' || domain === 'FRAUD';
    if (targetType === 'Template') {
      return isFraud ? 'rule-template-fraud-approval' : 'rule-template-aml-approval';
    }
    if (targetType === 'Basic') {
      return isFraud ? 'rule-basic-fraud-approval' : 'rule-basic-aml-approval';
    }
    if (targetType === 'Formula') {
      return 'risk-engine-formula-approval';
    }
    if (targetType === 'CIF') {
      return isFraud ? 'list-management-cif-fraud-approval' : 'list-management-cif-aml-approval';
    }
    if (targetType === 'Source Account Number' || targetType === 'Account') {
      return isFraud ? 'list-management-account-fraud-approval' : 'list-management-account-aml-approval';
    }
    if (targetType === 'Device ID') {
      return isFraud ? 'list-management-device-fraud-approval' : 'list-management-device-aml-approval';
    }
    if (targetType === 'Phone Number') {
      return isFraud ? 'list-management-phone-fraud-approval' : 'list-management-phone-aml-approval';
    }
    if (targetType === 'AML Master Blacklist') {
      return 'aml-master-blacklist-approval';
    }
    if (targetType === 'External Blacklist') {
      return 'aml-external-blacklist-approval';
    }
    if (targetType === 'Watchlist Location') {
      return 'system-parameter-watchlist-location-approval';
    }
    return isFraud ? 'rule-template-fraud-approval' : 'rule-template-aml-approval';
  };

  // Helper to load Watchlist Locations with sessionStorage fallback
  const loadInitialWatchlistLocations = (): WatchlistLocation[] => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = sessionStorage.getItem('fms_watchlist_locations');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Error reading watchlistLocations from sessionStorage:', e);
      }
    }
    return INITIAL_WATCHLIST_LOCATIONS;
  };

  // Shifting & Roster State (Section D)
  const [shiftSchedules, setShiftSchedules] = useState<ShiftSchedule[]>(generateInitialShiftSchedules());
  const [shiftHandovers, setShiftHandovers] = useState<ShiftHandover[]>(INITIAL_HANDOVERS);
  const [investigators, setInvestigators] = useState<InvestigatorProfile[]>(INITIAL_INVESTIGATORS);

  // System Parameter State (User, Group, Role, Email Template, User Session, Watchlist Location)
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_SYSTEM_USERS);
  const [systemGroups, setSystemGroups] = useState<SystemGroup[]>(INITIAL_SYSTEM_GROUPS);
  const [systemRoles, setSystemRoles] = useState<SystemRole[]>(INITIAL_SYSTEM_ROLES);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(INITIAL_EMAIL_TEMPLATES);
  const [userSessions, setUserSessions] = useState<UserSessionRecord[]>(INITIAL_USER_SESSIONS);
  const [watchlistLocations, setWatchlistLocations] = useState<WatchlistLocation[]>(loadInitialWatchlistLocations);

  // Persist Watchlist Locations to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem('fms_watchlist_locations', JSON.stringify(watchlistLocations));
      } catch (e) {
        console.warn('Error saving watchlistLocations to sessionStorage:', e);
      }
    }
  }, [watchlistLocations]);

  // Audit Trail State (System, Changes, Login, Access, Mail)
  const [auditSystemLogs, setAuditSystemLogs] = useState<AuditSystemLog[]>(INITIAL_SYSTEM_LOGS);
  const [auditChangeLogs, setAuditChangeLogs] = useState<AuditChangeLog[]>(INITIAL_CHANGE_LOGS);
  const [auditUserLogins, setAuditUserLogins] = useState<AuditUserLogin[]>(INITIAL_LOGIN_LOGS);
  const [auditUserAccesses, setAuditUserAccesses] = useState<AuditUserAccess[]>(INITIAL_ACCESS_LOGS);
  const [auditMailLogs, setAuditMailLogs] = useState<AuditMailLog[]>(INITIAL_MAIL_LOGS);

  // Process State (Task, List Process, Manual Execution)
  const [processTasks, setProcessTasks] = useState<ProcessTask[]>(INITIAL_PROCESS_TASKS);
  const [processList, setProcessList] = useState<ProcessItem[]>(INITIAL_PROCESS_LIST);
  const [processExecutions, setProcessExecutions] = useState<ProcessExecutionLog[]>(INITIAL_PROCESS_EXECUTIONS);

  // AML Master Blacklist State (Judol & Entitas Terlarang)
  const [amlBlacklistEntries, setAmlBlacklistEntries] = useState<AmlMasterBlacklistEntry[]>(INITIAL_AML_BLACKLIST);

  // Access Menu Management State
  const [roleMenuMatrices, setRoleMenuMatrices] = useState<Record<string, RoleMenuAccessMatrix>>(() => {
    try {
      const saved = localStorage.getItem('FMS_ROLE_MENU_MATRICES');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading FMS_ROLE_MENU_MATRICES from localStorage', e);
    }
    return generateInitialMatrices();
  });

  // Active shift definition based on current time (WIB UTC+7)
  const activeShiftDef = useMemo<ShiftDefinition>(() => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 7 && currentHour < 15) {
      return SHIFT_DEFINITIONS[0]; // Shift 1: 07:00 - 15:00
    } else if (currentHour >= 15 && currentHour < 23) {
      return SHIFT_DEFINITIONS[1]; // Shift 2: 15:00 - 23:00
    } else {
      return SHIFT_DEFINITIONS[2]; // Shift 3: 23:00 - 07:00
    }
  }, []);

  // Today's active on-duty investigators
  const onDutyInvestigators = useMemo<InvestigatorProfile[]>(() => {
    const todayStr = formatDateYYYYMMDD(new Date());
    const todaysDutySchedules = shiftSchedules.filter(
      s => s.date === todayStr && s.shiftCode === activeShiftDef.code && s.status === 'On Duty'
    );
    const userIds = new Set(todaysDutySchedules.map(s => s.userId));
    return investigators.filter(inv => userIds.has(inv.id) || inv.activeOnDuty);
  }, [shiftSchedules, activeShiftDef, investigators]);

  // Helper to determine if an assignee string or user ID is currently on duty
  const getInvestigatorDutyStatus = (nameOrAssignee: string) => {
    if (!nameOrAssignee) return { isOnDuty: false, role: 'Investigator' };
    const cleanQuery = nameOrAssignee.toLowerCase();
    
    // Find matching profile
    const profile = investigators.find(
      inv => cleanQuery.includes(inv.name.toLowerCase()) || cleanQuery.includes(inv.id.toLowerCase())
    );

    if (!profile) {
      const isDemoActive = cleanQuery.includes('budi') || cleanQuery.includes('dewi') || cleanQuery.includes('siti') || cleanQuery.includes('maya');
      return {
        isOnDuty: isDemoActive,
        currentShift: isDemoActive ? activeShiftDef.name : 'Off Duty',
        role: cleanQuery.includes('l2') || cleanQuery.includes('checker') ? 'L2 Checker' : 'L1 Maker'
      };
    }

    const isOnDuty = onDutyInvestigators.some(inv => inv.id === profile.id);
    return {
      isOnDuty,
      currentShift: isOnDuty ? activeShiftDef.name : 'Off Duty',
      role: profile.role,
      profile
    };
  };

  // Auto recommend L1 Maker on active duty
  const autoRecommendAssignee = (domain: 'Fraud' | 'AML' = 'Fraud'): InvestigatorProfile | null => {
    if (domain === 'AML') {
      const amlDuty = onDutyInvestigators.find(inv => inv.role === 'AML Analyst');
      if (amlDuty) return amlDuty;
    }
    const l1Duty = onDutyInvestigators.find(inv => inv.role === 'L1 Maker');
    if (l1Duty) return l1Duty;
    return onDutyInvestigators[0] || investigators[0];
  };

  const addShiftSchedule = (schedule: Omit<ShiftSchedule, 'id'>) => {
    const newSchedule: ShiftSchedule = {
      ...schedule,
      id: `sch-${schedule.userId}-${schedule.date}-${Date.now()}`
    };
    setShiftSchedules(prev => {
      const filtered = prev.filter(s => !(s.userId === schedule.userId && s.date === schedule.date));
      return [...filtered, newSchedule];
    });
  };

  const updateShiftSchedule = (id: string, updated: Partial<ShiftSchedule>) => {
    setShiftSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updated, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) } : s));
  };

  const deleteShiftSchedule = (id: string) => {
    setShiftSchedules(prev => prev.filter(s => s.id !== id));
  };

  const bulkAssignShift = (data: { userIds: string[]; startDate: string; endDate: string; shiftCode: ShiftCode; notes?: string }) => {
    const shiftDef = SHIFT_DEFINITIONS.find(s => s.code === data.shiftCode) || SHIFT_DEFINITIONS[0];
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const newSchedules: ShiftSchedule[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDateYYYYMMDD(d);
      data.userIds.forEach(userId => {
        const inv = investigators.find(u => u.id === userId);
        if (inv) {
          newSchedules.push({
            id: `sch-${userId}-${dateStr}`,
            userId,
            userName: inv.name,
            role: inv.role,
            date: dateStr,
            shiftCode: data.shiftCode,
            shiftName: shiftDef.name,
            shiftHours: shiftDef.hours,
            status: data.shiftCode === 'OFF' ? 'Off Duty' : 'On Duty',
            notes: data.notes
          });
        }
      });
    }

    setShiftSchedules(prev => {
      const keysToReplace = new Set(newSchedules.map(ns => `${ns.userId}_${ns.date}`));
      const kept = prev.filter(s => !keysToReplace.has(`${s.userId}_${s.date}`));
      return [...kept, ...newSchedules];
    });
  };

  const createShiftHandover = (data: Omit<ShiftHandover, 'id' | 'handoverNo' | 'timestamp' | 'status'>): ShiftHandover => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const dateNum = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const handoverNo = `HO-${dateNum}-${randomSeq}`;

    const newHandover: ShiftHandover = {
      ...data,
      id: `ho-${Date.now()}`,
      handoverNo,
      timestamp,
      status: 'Pending'
    };

    setShiftHandovers(prev => [newHandover, ...prev]);
    return newHandover;
  };

  const acknowledgeShiftHandover = (id: string, acknowledgedBy: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setShiftHandovers(prev => prev.map(ho => {
      if (ho.id === id) {
        return {
          ...ho,
          status: 'Acknowledged',
          acknowledgedAt: timestamp,
          acknowledgedBy
        };
      }
      return ho;
    }));
  };

  // Selected modals
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<FraudCase | null>(null);
  const [selectedCaseForFollowUp, setSelectedCaseForFollowUp] = useState<FraudCase | null>(null);
  const [selectedCaseForApproval, setSelectedCaseForApproval] = useState<FraudCase | null>(null);
  const [selectedAmlGroupForDetail, setSelectedAmlGroupForDetail] = useState<AmlCifGroup | null>(null);
  const [selectedAmlGroupForFollowUp, setSelectedAmlGroupForFollowUp] = useState<AmlCifGroup | null>(null);

  // Helper to calculate Formula Risk points for a case
  const evaluateFormulaPointsForCase = (c: FraudCase, formulas: FormulaRisk[], lists: ListEntry[], allCases: FraudCase[]) => {
    let totalPoints = 0;
    const matches: any[] = [];

    const activeFormulas = formulas.filter(f => f.status === 'Active');
    
    // Preparation for indicators
    const blacklistedAccounts = lists.filter(l => l.type === 'Blacklist' && l.category === 'Source Account Number' && l.status === 'Active').map(l => l.value);
    const blacklistedDestAccounts = lists.filter(l => l.type === 'Blacklist' && l.category === 'Destination Account Number' && l.status === 'Active').map(l => l.value);
    const blacklistedCifs = lists.filter(l => l.type === 'Blacklist' && l.category === 'CIF' && l.status === 'Active').map(l => l.value);
    const blacklistedDevices = lists.filter(l => l.type === 'Blacklist' && l.category === 'Device ID' && l.status === 'Active').map(l => l.value);
    const blacklistedPhones = lists.filter(l => l.type === 'Blacklist' && l.category === 'Phone Number' && l.status === 'Active').map(l => l.value);
    const watchlistCifs = lists.filter(l => l.type === 'Watchlist' && l.category === 'CIF' && l.status === 'Active').map(l => l.value);

    activeFormulas.forEach(formula => {
      // 1. Check Matching Rule Basic (Cakupan Rule)
      const glob = formula.isGlobal ?? (formula.scope === 'Global');
      if (!glob && formula.specificRuleCodes && !formula.specificRuleCodes.includes(c.ruleBasicCode)) {
        return;
      }

      // 2. Evaluate Indicators
      let indicatorMatched = false;
      let matchedReason = '';

      for (const indicator of formula.riskIndicators) {
        if (indicator === 'Blacklist') {
          if (
            blacklistedCifs.includes(c.cif) || 
            blacklistedAccounts.includes(c.transaction.sourceAccount) ||
            blacklistedDestAccounts.includes(c.transaction.destinationAccount) ||
            blacklistedDevices.includes(c.deviceId) ||
            blacklistedPhones.includes(c.phoneNumber)
          ) {
            indicatorMatched = true;
            matchedReason = 'Terdaftar di Blacklist (CIF/Acc/Device/Phone)';
            break;
          }
        } else if (indicator === 'Watchlist') {
          if (watchlistCifs.includes(c.cif)) {
            indicatorMatched = true;
            matchedReason = 'Terdaftar di Watchlist (CIF)';
            break;
          }
        } else if (indicator === 'Off-Hours') {
          const hour = new Date(c.transaction.timestamp).getHours();
          if (hour >= 0 && hour <= 5) {
            indicatorMatched = true;
            matchedReason = `Jam Transaksi Mencurigakan (${hour}:00)`;
            break;
          }
        } else if (indicator === 'New Device') {
          if (c.transaction.deviceModel.toLowerCase().includes('emulator') || c.transaction.deviceModel.toLowerCase().includes('virtualized')) {
            indicatorMatched = true;
            matchedReason = 'Perangkat Baru / Unrecognized Device';
            break;
          }
        } else if (indicator === 'Dormant Account') {
           // Mock logic for dormant
           if (c.transaction.amount > 50000000 && c.ruleBasicCode === 'R-TRX-HIGH-VAL-001') {
              indicatorMatched = true;
              matchedReason = 'Aktivasi Rekening Pasif (Dormant)';
              break;
           }
        } else if (indicator === 'Repeated Offender') {
          if (formula.repeatedOffenderConfig) {
            const config = formula.repeatedOffenderConfig;
            const now = new Date(c.transaction.timestamp).getTime();
            const windowMs = config.lookbackWindowValue * (config.lookbackWindowUnit === 'Hours' ? 3600000 : 86400000);
            
            const history = allCases.filter(prevCase => {
              if (prevCase.id === c.id || prevCase.caseId === c.caseId) return false;
              if (prevCase.cif !== c.cif) return false;
              
              const prevTime = new Date(prevCase.transaction.timestamp).getTime();
              if (now - prevTime > windowMs || now - prevTime < 0) return false;
              
              if (config.triggerScope === 'Same Rule Basic Only') {
                return prevCase.ruleBasicCode === c.ruleBasicCode;
              }
              return true; // Any Rule Basic
            });

            if (history.length + 1 >= config.thresholdFrequency) {
              indicatorMatched = true;
              matchedReason = `Repeated Offender (${history.length + 1}x alert dalam ${config.lookbackWindowValue} ${config.lookbackWindowUnit})`;
              break;
            }
          }
        }
      }

      if (indicatorMatched) {
        totalPoints += formula.points;
        matches.push({
          formulaId: formula.id,
          formulaCode: formula.code,
          name: formula.name,
          points: formula.points,
          matchedField: matchedReason,
          matchedValue: 'True'
        });
      }
    });

    return { totalPoints, matches };
  };

  // Case Action Handlers
  const handleOpenDetail = (caseParam: string | FraudCase) => {
    const caseId = typeof caseParam === 'string' ? caseParam : caseParam.caseId;
    setFraudCases(prev => prev.map(c => {
      if (c.caseId === caseId || c.id === caseId) {
        const updated: FraudCase = {
          ...c,
          investigationStatus: 'Opened',
          timeline: [
            ...c.timeline,
            {
              id: `tl-${Date.now()}`,
              time: new Date().toISOString().replace('T', ' ').slice(0, 19),
              user: 'Current User (Investigator)',
              action: 'Detail Opened',
              statusTransition: 'Investigation Status -> Opened'
            }
          ]
        };
        setSelectedCaseForDetail(updated);
        return updated;
      }
      return c;
    }));
  };

  const handleOpenFollowUp = (caseParam: string | FraudCase) => {
    const caseId = typeof caseParam === 'string' ? caseParam : caseParam.caseId;
    setFraudCases(prev => prev.map(c => {
      if (c.caseId === caseId || c.id === caseId) {
        const updated: FraudCase = {
          ...c,
          investigationStatus: 'On Check',
          timeline: [
            ...c.timeline,
            {
              id: `tl-${Date.now()}`,
              time: new Date().toISOString().replace('T', ' ').slice(0, 19),
              user: 'Current User (Investigator)',
              action: 'Follow Up Initiated',
              statusTransition: 'Investigation Status -> On Check'
            }
          ]
        };
        setSelectedCaseForFollowUp(updated);
        return updated;
      }
      return c;
    }));
  };

  const handleOpenApproval = (caseParam: string | FraudCase) => {
    const targetCase = typeof caseParam === 'string'
      ? fraudCases.find(c => c.caseId === caseParam || c.id === caseParam)
      : caseParam;
    if (targetCase) {
      setSelectedCaseForApproval(targetCase);
    }
  };

  const handleSaveDraftFollowUp = (
    caseId: string,
    data: {
      reviewer?: string;
      reviewerResult?: string;
      reviewerComment?: string;
      finalResult?: string;
      closingAction?: string;
      typeOfFraud?: string;
      attachments?: any[];
    }
  ) => {
    setFraudCases(prev => prev.map(c => {
      if (c.caseId === caseId || c.id === caseId) {
        return {
          ...c,
          alertStatus: 'Draft',
          investigationStatus: 'On Check',
          reviewer: data.reviewer ?? c.reviewer ?? 'Sysadmin - sysadmin',
          reviewerResult: data.reviewerResult ?? c.reviewerResult ?? 'NONE',
          reviewerComment: data.reviewerComment ?? c.reviewerComment ?? '',
          finalResult: data.finalResult ?? c.finalResult ?? 'NONE',
          closingAction: data.closingAction ?? c.closingAction ?? 'NONE',
          typeOfFraud: data.typeOfFraud ?? c.typeOfFraud ?? 'NONE',
          attachments: data.attachments ?? c.attachments ?? [],
          timeline: [
            ...c.timeline,
            {
              id: `tl-${Date.now()}`,
              time: new Date().toISOString().replace('T', ' ').slice(0, 19),
              user: data.reviewer || 'Reviewer',
              action: 'Follow Up Saved as Draft',
              note: `Draft saved with Reviewer Result: ${data.reviewerResult || 'NONE'}, Final Result: ${data.finalResult || 'NONE'}.`,
              statusTransition: 'Alert Status -> Draft'
            }
          ]
        };
      }
      return c;
    }));
    setSelectedCaseForFollowUp(null);
  };

  const handleSubmitFollowUp = (
    caseId: string,
    data: {
      reviewer?: string;
      reviewerResult?: string;
      reviewerComment?: string;
      finalResult?: string;
      closingAction?: string;
      typeOfFraud?: string;
      attachments?: any[];
      suspendDuration?: string;
      watchlistType?: 'Permanent' | 'Temporary';
      watchlistDuration?: string;
    }
  ): string => {
    let feedbackMsg = '';
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    setFraudCases(prev => {
      const targetCase = prev.find(c => c.caseId === caseId || c.id === caseId);
      if (targetCase && data.closingAction && data.closingAction !== 'NONE') {
        const actionStr = data.closingAction;
        const actionLower = actionStr.toLowerCase();
        
        let category: 'CIF' | 'Source Account Number' | 'Device ID' | 'Phone Number' | null = null;
        let value = '';

        if (actionLower.includes('account')) {
          category = 'Source Account Number';
          value = targetCase.accountNumber || targetCase.transaction?.sourceAccount || '';
        } else if (actionLower.includes('cif')) {
          category = 'CIF';
          value = targetCase.cif || '';
        } else if (actionLower.includes('device id') || actionLower.includes('device')) {
          category = 'Device ID';
          value = targetCase.deviceId || '';
        } else if (actionLower.includes('phone') || actionLower.includes('phone number')) {
          category = 'Phone Number';
          value = targetCase.phoneNumber || '';
        }

        if (value) {
          const isPermanent = actionLower.includes('suspend') && !actionLower.includes('temporary');
          const isTemporary = actionLower.includes('temporary suspend');
          const isRelease = actionLower.includes('release');
          const isWatchlist = actionLower.includes('watchlist');

          if (isPermanent) {
            feedbackMsg = `Entitas [${value}] berhasil dimasukkan ke Fraud Blacklist Permanen.`;
            setListEntries(lPrev => {
              const exists = lPrev.some(l => l.type === 'Blacklist' && l.value === value && l.status === 'Active');
              if (exists) {
                return lPrev.map(l => (l.type === 'Blacklist' && l.value === value) ? { ...l, status: 'Active', reason: `Permanent Suspend (Fraud Case ${targetCase.caseId})` } : l);
              }
              const newEntry: ListEntry = {
                id: `lst-${Date.now()}`,
                type: 'Blacklist',
                domain: 'FRAUD',
                category: category as any,
                entityType: category as any,
                value: value,
                holderName: targetCase.customerName,
                reason: `Permanent Suspend from Fraud Case [${targetCase.caseId}] - ${targetCase.ruleName}`,
                tags: ['Permanent', 'Fraud Blacklist', targetCase.caseId],
                riskWeight: 100,
                source: `Fraud Case Follow-Up (${targetCase.caseId})`,
                addedBy: data.reviewer || 'Sysadmin',
                addedAt: timestamp,
                createdAt: timestamp,
                status: 'Active',
                customerName: targetCase.customerName
              };
              return [newEntry, ...lPrev];
            });
          } else if (isTemporary) {
            const duration = data.suspendDuration || '1 x 24 Jam';
            let expiryDate = new Date();
            if (duration.includes('24 Jam') || duration.includes('1 x 24')) {
              expiryDate.setHours(expiryDate.getHours() + 24);
            } else if (duration.includes('3 Hari')) {
              expiryDate.setDate(expiryDate.getDate() + 3);
            } else if (duration.includes('7 Hari')) {
              expiryDate.setDate(expiryDate.getDate() + 7);
            } else if (duration.includes('14 Hari')) {
              expiryDate.setDate(expiryDate.getDate() + 14);
            } else if (duration.includes('30 Hari')) {
              expiryDate.setDate(expiryDate.getDate() + 30);
            } else {
              expiryDate.setHours(expiryDate.getHours() + 24);
            }
            const expiryStr = expiryDate.toISOString().replace('T', ' ').slice(0, 19);
            feedbackMsg = `Entitas [${value}] berhasil ditangguhkan sementara selama ${duration} (Berakhir pada ${expiryStr}).`;

            setListEntries(lPrev => {
              const exists = lPrev.some(l => l.type === 'Blacklist' && l.value === value && l.status === 'Active');
              if (exists) {
                return lPrev.map(l => (l.type === 'Blacklist' && l.value === value) ? {
                  ...l,
                  status: 'Active',
                  expiryDate: expiryStr,
                  tags: ['Temporary Active', duration, targetCase.caseId],
                  reason: `Temporary Suspend (${duration}, Berakhir: ${expiryStr}) - Fraud Case [${targetCase.caseId}]`
                } : l);
              }
              const newEntry: ListEntry = {
                id: `lst-${Date.now()}`,
                type: 'Blacklist',
                domain: 'FRAUD',
                category: category as any,
                entityType: category as any,
                value: value,
                holderName: targetCase.customerName,
                reason: `Temporary Suspend (${duration}, Berakhir: ${expiryStr}) - Fraud Case [${targetCase.caseId}]`,
                tags: ['Temporary Active', duration, targetCase.caseId],
                riskWeight: 100,
                source: `Fraud Case Follow-Up (${targetCase.caseId})`,
                addedBy: data.reviewer || 'Sysadmin',
                addedAt: timestamp,
                createdAt: timestamp,
                expiryDate: expiryStr,
                status: 'Active',
                customerName: targetCase.customerName
              };
              return [newEntry, ...lPrev];
            });
          } else if (isRelease) {
            feedbackMsg = `Entitas [${value}] berhasil dicabut dari Blacklist (Status: Released).`;
            setListEntries(lPrev => lPrev.map(l => {
              if (l.type === 'Blacklist' && l.value === value && l.status === 'Active') {
                return {
                  ...l,
                  status: 'Revoked',
                  reason: `Released from Fraud Case [${targetCase.caseId}] (Status: Released / Whitelisted)`
                };
              }
              return l;
            }));
          } else if (isWatchlist) {
            const isWlPerm = data.watchlistType === 'Permanent';
            if (isWlPerm) {
              feedbackMsg = `Entitas [${value}] berhasil dimasukkan ke Fraud Watchlist Permanen.`;
              setListEntries(lPrev => {
                const exists = lPrev.some(l => l.type === 'Watchlist' && l.value === value && l.status === 'Active');
                if (exists) {
                  return lPrev.map(l => (l.type === 'Watchlist' && l.value === value) ? { ...l, status: 'Active', reason: `Permanent Watchlist (Fraud Case ${targetCase.caseId})` } : l);
                }
                const newEntry: ListEntry = {
                  id: `lst-${Date.now()}`,
                  type: 'Watchlist',
                  domain: 'FRAUD',
                  category: category as any,
                  entityType: category as any,
                  value: value,
                  holderName: targetCase.customerName,
                  reason: `Permanent Watchlist from Fraud Case [${targetCase.caseId}] - ${targetCase.ruleName}`,
                  tags: ['Permanent', 'Fraud Watchlist', targetCase.caseId],
                  riskWeight: 50,
                  source: `Fraud Case Follow-Up (${targetCase.caseId})`,
                  addedBy: data.reviewer || 'Sysadmin',
                  addedAt: timestamp,
                  createdAt: timestamp,
                  status: 'Active',
                  customerName: targetCase.customerName
                };
                return [newEntry, ...lPrev];
              });
            } else {
              const duration = data.watchlistDuration || '1 x 24 Jam';
              let expiryDate = new Date();
              if (duration.includes('24 Jam') || duration.includes('1 x 24')) {
                expiryDate.setHours(expiryDate.getHours() + 24);
              } else if (duration.includes('3 Hari')) {
                expiryDate.setDate(expiryDate.getDate() + 3);
              } else if (duration.includes('7 Hari')) {
                expiryDate.setDate(expiryDate.getDate() + 7);
              } else if (duration.includes('14 Hari')) {
                expiryDate.setDate(expiryDate.getDate() + 14);
              } else if (duration.includes('30 Hari')) {
                expiryDate.setDate(expiryDate.getDate() + 30);
              } else {
                expiryDate.setHours(expiryDate.getHours() + 24);
              }
              const expiryStr = expiryDate.toISOString().replace('T', ' ').slice(0, 19);
              feedbackMsg = `Entitas [${value}] berhasil dimasukkan ke Fraud Watchlist Sementara (Durasi: ${duration}).`;

              setListEntries(lPrev => {
                const exists = lPrev.some(l => l.type === 'Watchlist' && l.value === value && l.status === 'Active');
                if (exists) {
                  return lPrev.map(l => (l.type === 'Watchlist' && l.value === value) ? {
                    ...l,
                    status: 'Active',
                    expiryDate: expiryStr,
                    tags: ['Temporary Active', duration, targetCase.caseId],
                    reason: `Temporary Watchlist (${duration}, Berakhir: ${expiryStr}) - Fraud Case [${targetCase.caseId}]`
                  } : l);
                }
                const newEntry: ListEntry = {
                  id: `lst-${Date.now()}`,
                  type: 'Watchlist',
                  domain: 'FRAUD',
                  category: category as any,
                  entityType: category as any,
                  value: value,
                  holderName: targetCase.customerName,
                  reason: `Temporary Watchlist (${duration}, Berakhir: ${expiryStr}) - Fraud Case [${targetCase.caseId}]`,
                  tags: ['Temporary Active', duration, targetCase.caseId],
                  riskWeight: 50,
                  source: `Fraud Case Follow-Up (${targetCase.caseId})`,
                  addedBy: data.reviewer || 'Sysadmin',
                  addedAt: timestamp,
                  createdAt: timestamp,
                  expiryDate: expiryStr,
                  status: 'Active',
                  customerName: targetCase.customerName
                };
                return [newEntry, ...lPrev];
              });
            }
          }
        }
      }

      const updated = prev.map(c => {
        if (c.caseId === caseId || c.id === caseId) {
          return {
            ...c,
            alertStatus: 'Pending Approval' as AlertStatus,
            investigationStatus: 'On Check' as InvestigationStatus,
            reviewer: data.reviewer ?? c.reviewer ?? 'Sysadmin - sysadmin',
            reviewerResult: data.reviewerResult ?? c.reviewerResult ?? 'NONE',
            reviewerComment: data.reviewerComment ?? c.reviewerComment ?? '',
            finalResult: data.finalResult ?? c.finalResult ?? 'NONE',
            closingAction: data.closingAction ?? c.closingAction ?? 'NONE',
            typeOfFraud: data.typeOfFraud ?? c.typeOfFraud ?? 'NONE',
            attachments: data.attachments ?? c.attachments ?? [],
            timeline: [
              ...c.timeline,
              {
                id: `tl-${Date.now()}`,
                time: timestamp,
                user: data.reviewer || 'Reviewer',
                action: 'Follow Up Submitted for Approval',
                note: `Reviewer Result: ${data.reviewerResult || 'NONE'} | Final Result: ${data.finalResult || 'NONE'} | Closing Action: ${data.closingAction || 'NONE'} | Type of Fraud: ${data.typeOfFraud || 'NONE'}. Notes: ${data.reviewerComment || '-'}`,
                statusTransition: 'Alert Status -> Pending Approval'
              }
            ]
          };
        }
        return c;
      });
      persistCasesToSession(updated);
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem(`fms_followup_payload_${caseId}`, JSON.stringify(data));
        }
      } catch {}
      return updated;
    });
    setSelectedCaseForFollowUp(null);
    setSelectedAmlGroupForFollowUp(null);

    const submittedCase = fraudCases.find(c => c.caseId === caseId || c.id === caseId);
    const isAml = submittedCase?.alertCategory === 'AML' || submittedCase?.ruleBasicCode?.toUpperCase().includes('AML') || submittedCase?.cif === 'CIF8829103';
    const notifDomain = isAml ? 'AML' : 'FRAUD';
    const notifTargetRole = isAml ? 'analystl2' : 'afcl2';
    const notifTargetTab = isAml ? 'case-system-alert-aml' : 'case-system-alert-fraud';

    addNotification({
      domain: notifDomain,
      title: `Persetujuan Kasus ${notifDomain} (Pending Approval)`,
      message: `Kasus [${submittedCase?.caseId || caseId}] - ${submittedCase?.customerName || 'Nasabah'} telah disubmit oleh Maker (${data.reviewer || 'Maker L1'}) dan membutuhkan persetujuan Checker.`,
      targetTab: notifTargetTab,
      targetRole: notifTargetRole,
      ticketId: submittedCase?.caseId || caseId
    });

    return feedbackMsg || 'Follow up berhasil disubmit ke Pending Approval.';
  };

  const handleApproveCase = (
    caseId: string,
    approverName: string,
    approverNotes?: string,
    followUpPayload?: {
      reviewerResult?: string;
      finalResult?: string;
      closingAction?: string;
      typeOfFraud?: string;
      typeOfAml?: string;
      reviewerComment?: string;
      reviewer?: string;
      submittedBy?: string;
      approverComment?: string;
      approvedBy?: string;
      closedAt?: string;
    }
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const targetCase = fraudCases.find(c => c.caseId === caseId || c.id === caseId);

    // Retrieve saved payload from sessionStorage as fallback
    let sessionPayload: any = null;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = sessionStorage.getItem(`fms_followup_payload_${caseId}`);
        if (raw) sessionPayload = JSON.parse(raw);
      }
    } catch {}

    const resolvedReviewer = followUpPayload?.submittedBy || followUpPayload?.reviewer || sessionPayload?.reviewer || targetCase?.reviewer || 'Maker L1';
    
    // Resolve Reviewer Result
    const resolvedReviewerResult = (followUpPayload?.reviewerResult && followUpPayload.reviewerResult !== 'NONE')
      ? followUpPayload.reviewerResult
      : (sessionPayload?.reviewerResult && sessionPayload.reviewerResult !== 'NONE')
      ? sessionPayload.reviewerResult
      : (targetCase?.reviewerResult && targetCase.reviewerResult !== 'NONE' ? targetCase.reviewerResult : 'FR-RR-001 - Fraud');

    // Resolve Final Result
    const resolvedFinalResult = (followUpPayload?.finalResult && followUpPayload.finalResult !== 'NONE')
      ? followUpPayload.finalResult
      : (sessionPayload?.finalResult && sessionPayload.finalResult !== 'NONE')
      ? sessionPayload.finalResult
      : (targetCase?.finalResult && targetCase.finalResult !== 'NONE' ? targetCase.finalResult : 'FR-FR-001 - Fraud');

    // Resolve Closing Action
    const resolvedClosingAction = (followUpPayload?.closingAction && followUpPayload.closingAction !== 'NONE')
      ? followUpPayload.closingAction
      : (sessionPayload?.closingAction && sessionPayload.closingAction !== 'NONE')
      ? sessionPayload.closingAction
      : (targetCase?.closingAction && targetCase.closingAction !== 'NONE' ? targetCase.closingAction : 'FR-CA-001 - Suspend Account');

    // Resolve Type of Threat (Fraud / AML)
    const resolvedTypeOfThreat = (followUpPayload?.typeOfFraud && followUpPayload.typeOfFraud !== 'NONE')
      ? followUpPayload.typeOfFraud
      : (followUpPayload?.typeOfAml && followUpPayload.typeOfAml !== 'NONE')
      ? followUpPayload.typeOfAml
      : (sessionPayload?.typeOfFraud && sessionPayload.typeOfFraud !== 'NONE')
      ? sessionPayload.typeOfFraud
      : (sessionPayload?.typeOfAml && sessionPayload.typeOfAml !== 'NONE')
      ? sessionPayload.typeOfAml
      : (targetCase?.typeOfFraud && targetCase.typeOfFraud !== 'NONE' ? targetCase.typeOfFraud : 'FR-TOF-001 - Account Take Over (ATO)');

    const resolvedReviewerComment = followUpPayload?.reviewerComment || sessionPayload?.reviewerComment || targetCase?.reviewerComment || targetCase?.resolutionNotes || 'Rekomendasi tindak lanjut telah diverifikasi oleh Investigator L1.';
    const resolvedApproverComment = followUpPayload?.approverComment || approverNotes || 'Approval penutupan investigasi kasus telah disetujui L2 Checker.';
    const resolvedApprovedBy = followUpPayload?.approvedBy || approverName || 'Checker L2';
    const resolvedClosedAt = followUpPayload?.closedAt || timestamp;

    const isAml = targetCase?.alertCategory === 'AML' || targetCase?.ruleBasicCode?.toUpperCase().includes('AML') || (targetCase?.cif && (targetCase.cif.startsWith('CIF88') || targetCase.cif.startsWith('CIF-AML')));
    const domain: HistoryDomain = isAml ? 'AML' : 'Fraud';
    const closingStatus = resolveClosingStatus(domain, resolvedFinalResult, resolvedReviewerResult);

    setFraudCases(prev => {
      const updated = prev.map(c => {
        if (c.caseId === caseId || c.id === caseId) {
          return {
            ...c,
            alertStatus: 'Close' as AlertStatus,
            investigationStatus: 'Closed' as InvestigationStatus,
            reviewer: resolvedReviewer,
            reviewerResult: resolvedReviewerResult,
            finalResult: resolvedFinalResult,
            closingAction: resolvedClosingAction,
            typeOfFraud: resolvedTypeOfThreat,
            reviewerComment: resolvedReviewerComment,
            approvedBy: resolvedApprovedBy,
            approvedAt: resolvedClosedAt,
            approverNotes: resolvedApproverComment,
            timeline: [
              ...c.timeline,
              {
                id: `tl-${Date.now()}`,
                time: timestamp,
                user: resolvedApprovedBy,
                action: 'Case Approved & Closed',
                note: `Approved [${closingStatus}]. Reviewer: ${resolvedReviewerResult} | Final: ${resolvedFinalResult}. Notes: ${resolvedApproverComment}`,
                statusTransition: 'Alert Status -> Close, Investigation Status -> Closed'
              }
            ]
          };
        }
        return c;
      });
      persistCasesToSession(updated);
      return updated;
    });

    // Create immutable InvestigationHistoryItem
    const newHistoryItem: InvestigationHistoryItem = {
      id: `hist-dyn-${caseId}-${Date.now()}`,
      caseId: targetCase?.caseId || caseId,
      ticketTitle: targetCase?.ruleName || `Penutupan Kasus ${caseId}`,
      domain,
      alertCategory: isAml ? 'AML' : 'Fraud',
      closedAt: resolvedClosedAt,
      closedDateOnly: resolvedClosedAt.substring(0, 10),
      customerName: targetCase?.customerName || 'Nasabah Terkait',
      customerType: (targetCase?.customerName?.includes('PT') || targetCase?.customerName?.includes('CV')) ? 'Corporate' : 'Individual',
      cif: targetCase?.cif || 'CIF8820000',
      accountNumber: targetCase?.accountNumber || targetCase?.transaction?.sourceAccount || '10892019283',
      sourceAccount: targetCase?.transaction?.sourceAccount || targetCase?.accountNumber,
      ruleBasicCode: targetCase?.ruleBasicCode || 'R-DEF-001',
      ruleBasicName: targetCase?.ruleName || 'Rule Investigation',
      ruleTemplateCode: targetCase?.ruleTemplateCode,
      slaLevel: 'P2 - High',
      lossAmountIdr: targetCase?.transaction?.amount || 50000000,
      incidentDescription: targetCase?.incidentDescription || `Kasus ${targetCase?.ruleName || caseId} telah diselesaikan oleh L1 dan disetujui L2.`,
      reportingUnit: targetCase?.source || 'Automated Engine (FMS)',
      branchOffice: 'KC Sampoerna Jakarta Pusat',
      l1Maker: {
        id: 'USR-INV-0142',
        name: resolvedReviewer,
        unit: domain === 'Fraud' ? 'Fraud Investigation Unit' : 'AML Compliance Unit',
        actionTime: resolvedClosedAt,
        recommendation: `${formatTaxonomyLabel(resolvedFinalResult, domain)} | Reviewer: ${formatTaxonomyLabel(resolvedReviewerResult, domain)}`,
        notes: resolvedReviewerComment
      },
      l2Checker: {
        id: 'USR-SPV-0008',
        name: resolvedApprovedBy,
        unit: domain === 'Fraud' ? 'Fraud Risk Governance & Quality Review' : 'AML Compliance & Regulatory Reporting',
        actionTime: resolvedClosedAt,
        decision: closingStatus,
        notes: resolvedApproverComment
      },
      closingStatus,
      closingAction: resolvedClosingAction,
      typeOfFraud: resolvedTypeOfThreat,
      typeOfAml: isAml ? resolvedTypeOfThreat : undefined,
      reviewerResult: resolvedReviewerResult,
      finalResult: resolvedFinalResult,
      reviewerComment: resolvedReviewerComment,
      approverComment: resolvedApproverComment,
      approvedBy: resolvedApprovedBy,
      submittedBy: resolvedReviewer,
      riskScoreSnapshot: targetCase?.finalRiskScore || 80,
      riskLevelSnapshot: targetCase?.finalRiskLevel || 'High',
      baseScoreSnapshot: targetCase?.baseScore || 70,
      repeatedOffenderAdjustment: 0,
      formulaAdjustments: (targetCase?.formulaMatches || []).map(fm => ({
        code: fm.formulaCode,
        name: fm.name,
        points: fm.points,
        matchedField: fm.matchedField,
        matchedValue: fm.matchedValue
      })),
      formulaResultTotal: targetCase?.finalRiskScore || 80,
      anomalyTransactions: targetCase?.transaction ? [
        {
          no: 1,
          trxId: targetCase.transaction.trxId,
          timestamp: targetCase.transaction.timestamp,
          channel: targetCase.transaction.channel || 'Mobile Banking',
          amount: targetCase.transaction.amount,
          currency: 'IDR',
          statusFlag: closingStatus.includes('CONFIRMED') ? (domain === 'Fraud' ? 'CONFIRMED FRAUD' : 'CONFIRMED AML') : 'CLEARED',
          sourceAccount: targetCase.transaction.sourceAccount,
          destinationAccount: targetCase.transaction.destinationAccount,
          destinationBank: targetCase.transaction.destinationBank,
          trxType: targetCase.transaction.trxType
        }
      ] : [],
      auditTimeline: [
        {
          id: `aud-1-${caseId}`,
          timestamp: targetCase?.identifiedOn || '2026-08-25 09:00:00',
          stage: 'Case Created',
          user: 'Neo FMS Engine',
          role: 'System',
          action: 'Alert Generated',
          details: `Triggered by ${targetCase?.ruleBasicCode || 'System'}`
        },
        {
          id: `aud-2-${caseId}`,
          timestamp: resolvedClosedAt,
          stage: 'Follow Up Submitted (Maker L1)',
          user: resolvedReviewer,
          role: 'L1 Maker',
          action: 'Follow Up Form Submitted',
          details: `Reviewer: ${resolvedReviewerResult}. Final: ${resolvedFinalResult}. Action: ${resolvedClosingAction}`
        },
        {
          id: `aud-3-${caseId}`,
          timestamp: resolvedClosedAt,
          stage: 'Approved & Closed by L2 Checker',
          user: resolvedApprovedBy,
          role: 'L2 Reviewer',
          action: 'Approved & Permanently Closed',
          details: `Status: ${closingStatus}. Note: ${resolvedApproverComment}`
        }
      ],
      auditHash: `SHA256:${caseId}${Math.random().toString(36).substring(2)}`
    };

    if (domain === 'Fraud') {
      setInvestigationHistory(prev => {
        const next = [newHistoryItem, ...prev.filter(h => h.caseId !== caseId)];
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem('investigationHistory', JSON.stringify(next));
          }
        } catch {}
        return next;
      });
    } else {
      setAmlInvestigationHistory(prev => {
        const next = [newHistoryItem, ...prev.filter(h => h.caseId !== caseId)];
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem('amlInvestigationHistory', JSON.stringify(next));
          }
        } catch {}
        return next;
      });
    }

    if (targetCase) {
      const targetRole = isAml ? 'analystl1' : 'afcl1';
      const targetTab = isAml ? 'case-system-alert-aml' : 'case-system-alert-fraud';

      addNotification({
        domain: isAml ? 'AML' : 'FRAUD',
        title: `Kasus ${domain} Disetujui (Closed)`,
        message: `Kasus [${targetCase.caseId}] telah disetujui oleh Checker (${resolvedApprovedBy}). Status kasus kini CLOSED (${closingStatus}).`,
        targetTab,
        targetRole,
        ticketId: targetCase.caseId
      });
    }

    setSelectedCaseForApproval(null);
    setSelectedCaseForDetail(null);
    setSelectedCaseForFollowUp(null);
  };

  const updateInvestigationHistoryItem = (updatedItem: InvestigationHistoryItem | AmlCifHistoryGroup) => {
    setInvestigationHistory(prev => {
      const idx = prev.findIndex(item => item.id === updatedItem.id);
      if (idx !== -1) {
        const newHist = [...prev];
        newHist[idx] = updatedItem as InvestigationHistoryItem;
        return newHist;
      }
      return prev;
    });
    setAmlInvestigationHistory(prev => {
      const idx = prev.findIndex(item => item.id === updatedItem.id);
      if (idx !== -1) {
        const newHist = [...prev];
        newHist[idx] = updatedItem;
        return newHist;
      }
      return prev;
    });
  };

  const updateCifStatus = (cifNumber: string, newStatus: InvestigationStatus) => {
    setCifStatusOverrides(prev => {
      const next = { ...prev, [cifNumber]: newStatus };
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('fms_cif_status_overrides', JSON.stringify(next));
        }
      } catch (err) {
        console.warn('Error saving CIF status override:', err);
      }
      return next;
    });

    setFraudCases(prev => {
      const updated = prev.map(c => {
        if (c.cif === cifNumber) {
          return {
            ...c,
            alertStatus: (newStatus === 'Closed' ? 'Close' : (newStatus === 'Opened' ? 'Open' : c.alertStatus)) as AlertStatus,
            investigationStatus: newStatus
          };
        }
        return c;
      });
      persistCasesToSession(updated);
      return updated;
    });
  };

  const addAmlCifHistoryGroup = (group: AmlCifHistoryGroup) => {
    setAmlInvestigationHistory(prev => {
      const filtered = prev.filter((item: any) => item.id !== group.id);
      const next = [group, ...filtered];
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('amlInvestigationHistory', JSON.stringify(next));
          sessionStorage.setItem('fms_aml_cif_history', JSON.stringify(next));
        }
      } catch (err) {
        console.warn('Error saving AML CIF history to sessionStorage:', err);
      }
      return next;
    });
  };

  const handleRejectCase = (
    caseId: string,
    rejectorName: string,
    rejectReason?: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const targetCase = fraudCases.find(c => c.caseId === caseId || c.id === caseId);

    setFraudCases(prev => prev.map(c => {
      if (c.caseId === caseId || c.id === caseId) {
        return {
          ...c,
          alertStatus: 'Rejected',
          investigationStatus: 'On Check',
          rejectionReason: rejectReason || 'Revisi data investigasi diperlukan.',
          rejectedBy: rejectorName,
          rejectedAt: timestamp,
          timeline: [
            ...c.timeline,
            {
              id: `tl-${Date.now()}`,
              time: timestamp,
              user: rejectorName || 'Supervisor / Manager',
              action: 'Approval Rejected / Returned',
              note: rejectReason ? `Ditolak Checker: ${rejectReason}` : 'Approval ditolak. Case dikembalikan ke antrean investigasi.',
              statusTransition: `Alert Status -> Rejected`
            }
          ]
        };
      }
      return c;
    }));

    if (targetCase) {
      const isAml = targetCase.alertCategory === 'AML' || targetCase.ruleBasicCode?.toUpperCase().includes('AML') || targetCase.cif === 'CIF8829103';
      const domain = isAml ? 'AML' : 'FRAUD';
      const targetRole = isAml ? 'analystl1' : 'afcl1';
      const targetTab = isAml ? 'case-system-alert-aml' : 'case-system-alert-fraud';

      addNotification({
        domain,
        title: `Kasus ${domain} Ditolak Checker`,
        message: `Kasus [${targetCase.caseId}] ditolak oleh Checker (${rejectorName || 'Checker L2'})${rejectReason ? `: "${rejectReason}"` : ''}. Status menjadi Rejected.`,
        targetTab,
        targetRole,
        ticketId: targetCase.caseId
      });
    }

    setSelectedCaseForApproval(null);
    setSelectedCaseForDetail(null);
    setSelectedCaseForFollowUp(null);
  };

  const handleSaveFollowUp = (
    caseId: string, 
    update: { 
      alertStatus: AlertStatus; 
      assignee?: string; 
      resolutionNotes?: string; 
      disposition?: any;
      reviewer?: string;
      reviewerResult?: string;
      reviewerComment?: string;
      finalResult?: string;
      closingAction?: string;
      typeOfFraud?: string;
      attachments?: any[];
    }
  ) => {
    setFraudCases(prev => prev.map(c => {
      if (c.caseId === caseId || c.id === caseId) {
        return {
          ...c,
          alertStatus: update.alertStatus,
          assignee: update.assignee || c.assignee,
          resolutionNotes: update.resolutionNotes || update.reviewerComment || c.resolutionNotes,
          disposition: update.disposition || update.reviewerResult || c.disposition,
          reviewer: update.reviewer || c.reviewer,
          reviewerResult: update.reviewerResult || c.reviewerResult,
          reviewerComment: update.reviewerComment || update.resolutionNotes || c.reviewerComment,
          finalResult: update.finalResult || c.finalResult,
          closingAction: update.closingAction || c.closingAction,
          typeOfFraud: update.typeOfFraud || c.typeOfFraud,
          attachments: update.attachments || c.attachments,
          timeline: [
            ...c.timeline,
            {
              id: `tl-${Date.now()}`,
              time: new Date().toISOString().replace('T', ' ').slice(0, 19),
              user: update.assignee || update.reviewer || 'Investigator',
              action: `Follow Up Saved (${update.alertStatus})`,
              note: update.resolutionNotes || update.reviewerComment ? `${update.disposition || update.reviewerResult ? `[${update.disposition || update.reviewerResult}] ` : ''}${update.resolutionNotes || update.reviewerComment}` : `Status changed to ${update.alertStatus}`,
              statusTransition: `Alert Status -> ${update.alertStatus}`
            }
          ]
        };
      }
      return c;
    }));
    setSelectedCaseForFollowUp(null);
    setSelectedAmlGroupForFollowUp(null);
  };

  const handleBatchAction = (
    caseIds: string[], 
    update: { 
      alertStatus?: AlertStatus; 
      assignee?: string; 
      disposition?: any; 
      note?: string 
    }
  ) => {
    setFraudCases(prev => prev.map(c => {
      if (caseIds.includes(c.id) || caseIds.includes(c.caseId)) {
        return {
          ...c,
          alertStatus: update.alertStatus ?? c.alertStatus,
          assignee: update.assignee ?? c.assignee,
          disposition: update.disposition ?? c.disposition,
          timeline: [
            ...c.timeline,
            {
              id: `tl-${Date.now()}`,
              time: new Date().toISOString().replace('T', ' ').slice(0, 19),
              user: update.assignee || 'Batch Operator',
              action: `Batch Action Applied`,
              note: update.note || `Batch updated ${update.alertStatus ? `to ${update.alertStatus}` : ''}`,
              statusTransition: update.alertStatus ? `Alert Status -> ${update.alertStatus}` : undefined
            }
          ]
        };
      }
      return c;
    }));
  };

  const handleOpenBatchFollowUp = (caseIds: string[]) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setFraudCases(prev => prev.map(c => {
      if (caseIds.includes(c.id) || caseIds.includes(c.caseId)) {
        return {
          ...c,
          investigationStatus: 'On Check',
          timeline: [
            ...c.timeline,
            {
              id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              time: timestamp,
              user: 'Budi Santoso (Fraud Investigator L1 (Maker))',
              action: 'Batch Follow Up Initiated',
              statusTransition: 'Investigation Status -> On Check'
            }
          ]
        };
      }
      return c;
    }));
  };

  const handleBatchFollowUpSubmit = (
    caseIds: string[],
    data: {
      alertStatus?: AlertStatus;
      investigator?: string;
      reviewer?: string;
      finalResult: string;
      reviewerResult: string;
      closingAction: string;
      typeOfFraud: string;
      reviewerComment: string;
      attachments?: FraudCaseAttachment[];
      suspendDuration?: string;
      watchlistType?: 'Permanent' | 'Temporary';
      watchlistDuration?: string;
    }
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const targetStatus = data.alertStatus || 'Pending Approval';
    const activeReviewer = data.reviewer || data.investigator || 'Budi Santoso (Fraud Investigator L1 (Maker))';

    setFraudCases(prev => {
      caseIds.forEach(id => {
        const targetCase = prev.find(c => c.id === id || c.caseId === id);
        if (targetCase && data.closingAction && data.closingAction !== 'NONE') {
          const actionStr = data.closingAction;
          const actionLower = actionStr.toLowerCase();
          
          let category: 'CIF' | 'Source Account Number' | 'Device ID' | 'Phone Number' | null = null;
          let value = '';

          if (actionLower.includes('account')) {
            category = 'Source Account Number';
            value = targetCase.accountNumber || targetCase.transaction?.sourceAccount || '';
          } else if (actionLower.includes('cif')) {
            category = 'CIF';
            value = targetCase.cif || '';
          } else if (actionLower.includes('device id') || actionLower.includes('device')) {
            category = 'Device ID';
            value = targetCase.deviceId || '';
          } else if (actionLower.includes('phone') || actionLower.includes('phone number')) {
            category = 'Phone Number';
            value = targetCase.phoneNumber || '';
          }

          if (value) {
            const isPermanent = actionLower.includes('suspend') && !actionLower.includes('temporary');
            const isTemporary = actionLower.includes('temporary suspend');
            const isRelease = actionLower.includes('release');
            const isWatchlist = actionLower.includes('watchlist');

            if (isPermanent) {
              setListEntries(lPrev => {
                const exists = lPrev.some(l => l.type === 'Blacklist' && l.value === value && l.status === 'Active');
                if (exists) return lPrev;
                const newEntry: ListEntry = {
                  id: `lst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  type: 'Blacklist',
                  domain: 'FRAUD',
                  category: category as any,
                  entityType: category as any,
                  value: value,
                  holderName: targetCase.customerName,
                  reason: `Permanent Suspend from Batch Fraud Case [${targetCase.caseId}]`,
                  tags: ['Permanent', 'Fraud Blacklist', targetCase.caseId],
                  riskWeight: 100,
                  source: `Batch Fraud Case Follow-Up (${targetCase.caseId})`,
                  addedBy: activeReviewer,
                  addedAt: timestamp,
                  createdAt: timestamp,
                  status: 'Active',
                  customerName: targetCase.customerName
                };
                return [newEntry, ...lPrev];
              });
            } else if (isTemporary) {
              const duration = data.suspendDuration || '1 x 24 Jam';
              let expiryDate = new Date();
              if (duration.includes('24 Jam') || duration.includes('1 x 24')) {
                expiryDate.setHours(expiryDate.getHours() + 24);
              } else if (duration.includes('3 Hari')) {
                expiryDate.setDate(expiryDate.getDate() + 3);
              } else if (duration.includes('7 Hari')) {
                expiryDate.setDate(expiryDate.getDate() + 7);
              } else if (duration.includes('14 Hari')) {
                expiryDate.setDate(expiryDate.getDate() + 14);
              } else if (duration.includes('30 Hari')) {
                expiryDate.setDate(expiryDate.getDate() + 30);
              } else {
                expiryDate.setHours(expiryDate.getHours() + 24);
              }
              const expiryStr = expiryDate.toISOString().replace('T', ' ').slice(0, 19);

              setListEntries(lPrev => {
                const exists = lPrev.some(l => l.type === 'Blacklist' && l.value === value && l.status === 'Active');
                if (exists) {
                  return lPrev.map(l => (l.type === 'Blacklist' && l.value === value) ? { ...l, status: 'Active', expiryDate: expiryStr } : l);
                }
                const newEntry: ListEntry = {
                  id: `lst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  type: 'Blacklist',
                  domain: 'FRAUD',
                  category: category as any,
                  entityType: category as any,
                  value: value,
                  holderName: targetCase.customerName,
                  reason: `Temporary Suspend (${duration}, Berakhir: ${expiryStr}) - Batch Fraud Case [${targetCase.caseId}]`,
                  tags: ['Temporary Active', duration, targetCase.caseId],
                  riskWeight: 100,
                  source: `Batch Fraud Case Follow-Up (${targetCase.caseId})`,
                  addedBy: activeReviewer,
                  addedAt: timestamp,
                  createdAt: timestamp,
                  expiryDate: expiryStr,
                  status: 'Active',
                  customerName: targetCase.customerName
                };
                return [newEntry, ...lPrev];
              });
            } else if (isRelease) {
              setListEntries(lPrev => lPrev.map(l => (l.type === 'Blacklist' && l.value === value && l.status === 'Active') ? { ...l, status: 'Revoked', reason: `Released from Batch Fraud Case [${targetCase.caseId}]` } : l));
            } else if (isWatchlist) {
              const isWlPerm = data.watchlistType === 'Permanent';
              if (isWlPerm) {
                setListEntries(lPrev => {
                  const exists = lPrev.some(l => l.type === 'Watchlist' && l.value === value && l.status === 'Active');
                  if (exists) return lPrev;
                  const newEntry: ListEntry = {
                    id: `lst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    type: 'Watchlist',
                    domain: 'FRAUD',
                    category: category as any,
                    entityType: category as any,
                    value: value,
                    holderName: targetCase.customerName,
                    reason: `Permanent Watchlist from Batch Fraud Case [${targetCase.caseId}]`,
                    tags: ['Permanent', 'Fraud Watchlist', targetCase.caseId],
                    riskWeight: 50,
                    source: `Batch Fraud Case Follow-Up (${targetCase.caseId})`,
                    addedBy: activeReviewer,
                    addedAt: timestamp,
                    createdAt: timestamp,
                    status: 'Active',
                    customerName: targetCase.customerName
                  };
                  return [newEntry, ...lPrev];
                });
              } else {
                const duration = data.watchlistDuration || '1 x 24 Jam';
                let expiryDate = new Date();
                if (duration.includes('24 Jam') || duration.includes('1 x 24')) {
                  expiryDate.setHours(expiryDate.getHours() + 24);
                } else if (duration.includes('3 Hari')) {
                  expiryDate.setDate(expiryDate.getDate() + 3);
                } else if (duration.includes('7 Hari')) {
                  expiryDate.setDate(expiryDate.getDate() + 7);
                } else if (duration.includes('14 Hari')) {
                  expiryDate.setDate(expiryDate.getDate() + 14);
                } else if (duration.includes('30 Hari')) {
                  expiryDate.setDate(expiryDate.getDate() + 30);
                } else {
                  expiryDate.setHours(expiryDate.getHours() + 24);
                }
                const expiryStr = expiryDate.toISOString().replace('T', ' ').slice(0, 19);

                setListEntries(lPrev => {
                  const exists = lPrev.some(l => l.type === 'Watchlist' && l.value === value && l.status === 'Active');
                  if (exists) {
                    return lPrev.map(l => (l.type === 'Watchlist' && l.value === value) ? { ...l, status: 'Active', expiryDate: expiryStr } : l);
                  }
                  const newEntry: ListEntry = {
                    id: `lst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    type: 'Watchlist',
                    domain: 'FRAUD',
                    category: category as any,
                    entityType: category as any,
                    value: value,
                    holderName: targetCase.customerName,
                    reason: `Temporary Watchlist (${duration}, Berakhir: ${expiryStr}) - Batch Fraud Case [${targetCase.caseId}]`,
                    tags: ['Temporary Active', duration, targetCase.caseId],
                    riskWeight: 50,
                    source: `Batch Fraud Case Follow-Up (${targetCase.caseId})`,
                    addedBy: activeReviewer,
                    addedAt: timestamp,
                    createdAt: timestamp,
                    expiryDate: expiryStr,
                    status: 'Active',
                    customerName: targetCase.customerName
                  };
                  return [newEntry, ...lPrev];
                });
              }
            }
          }
        }
      });

      return prev.map(c => {
        if (caseIds.includes(c.id) || caseIds.includes(c.caseId)) {
          // Merge attachments
          const mergedAttachments = [
            ...(c.attachments || []),
            ...(data.attachments || [])
          ].filter((att, index, self) => index === self.findIndex(t => t.name === att.name));

          return {
            ...c,
            alertStatus: targetStatus,
            investigationStatus: (targetStatus === 'Close' ? 'On Check' : 'On Check') as InvestigationStatus,
            reviewer: activeReviewer,
            finalResult: data.finalResult,
            reviewerResult: data.reviewerResult,
            closingAction: data.closingAction,
            typeOfFraud: data.typeOfFraud,
            reviewerComment: data.reviewerComment,
            resolutionNotes: data.reviewerComment,
            attachments: mergedAttachments.length > 0 ? mergedAttachments : c.attachments,
            timeline: [
              ...c.timeline,
              {
                id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                time: timestamp,
                user: activeReviewer,
                action: `Batch Follow Up Submitted (${targetStatus})`,
                note: `[BATCH] Final: ${data.finalResult} | Reviewer: ${data.reviewerResult} | Action: ${data.closingAction} | Type: ${data.typeOfFraud}${data.attachments && data.attachments.length > 0 ? ` | ${data.attachments.length} Dokumen Dilampirkan` : ''}. Catatan: ${data.reviewerComment}`,
                statusTransition: `Alert Status -> ${targetStatus}`
              }
            ]
          };
        }
        return c;
      });
    });
  };

  const handleBatchFollowUpSaveDraft = (
    caseIds: string[],
    data: {
      alertStatus?: AlertStatus;
      investigator?: string;
      reviewer?: string;
      finalResult: string;
      reviewerResult: string;
      closingAction: string;
      typeOfFraud: string;
      reviewerComment: string;
      attachments?: FraudCaseAttachment[];
    }
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const targetStatus = data.alertStatus || 'Draft';
    const activeReviewer = data.reviewer || data.investigator || 'Budi Santoso (Fraud Investigator L1 (Maker))';

    setFraudCases(prev => prev.map(c => {
      if (caseIds.includes(c.id) || caseIds.includes(c.caseId)) {
        // Merge attachments
        const mergedAttachments = [
          ...(c.attachments || []),
          ...(data.attachments || [])
        ].filter((att, index, self) => index === self.findIndex(t => t.name === att.name));

        return {
          ...c,
          alertStatus: targetStatus,
          investigationStatus: 'On Check',
          reviewer: activeReviewer,
          finalResult: data.finalResult,
          reviewerResult: data.reviewerResult,
          closingAction: data.closingAction,
          typeOfFraud: data.typeOfFraud,
          reviewerComment: data.reviewerComment,
          resolutionNotes: data.reviewerComment,
          attachments: mergedAttachments.length > 0 ? mergedAttachments : c.attachments,
          timeline: [
            ...c.timeline,
            {
              id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              time: timestamp,
              user: activeReviewer,
              action: `Batch Follow Up Saved as Draft`,
              note: `[BATCH DRAFT] Final: ${data.finalResult} | Reviewer: ${data.reviewerResult} | Action: ${data.closingAction}${data.attachments && data.attachments.length > 0 ? ` | ${data.attachments.length} Dokumen Dilampirkan` : ''}. Catatan: ${data.reviewerComment}`,
              statusTransition: `Alert Status -> ${targetStatus}`
            }
          ]
        };
      }
      return c;
    }));
  };

  // Manual Alert Creation Action
  const createManualAlert = (data: {
    alertCategory: 'Fraud' | 'AML';
    source: string;
    severity: CaseUrgency;
    detectionDate: string;
    cif: string;
    customerName: string;
    customerId?: string;
    sourceAccountNumber?: string;
    phoneNumber?: string;
    deviceId?: string;
    externalCaseId?: string;
    incidentDescription: string;
    note?: string;
    transaction?: TransactionInfo;
    transactionEvidenceList?: TransactionInfo[];
    attachments?: FraudCaseAttachment[];
    alertStatus?: AlertStatus;
  }): FraudCase => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const dateNum = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const prefix = data.alertCategory === 'Fraud' ? 'MAN-FRD' : 'MAN-AML';
    const newCaseId = `${prefix}-${dateNum}-${randomSeq}`;
    const initialStatus = data.alertStatus || 'Open';

    const baseScore = data.severity === 'High' ? 80 : data.severity === 'Med' ? 55 : 30;

    const recommendedAssignee = autoRecommendAssignee(data.alertCategory === 'AML' ? 'AML' : 'Fraud');
    const defaultAssigneeName = recommendedAssignee ? recommendedAssignee.name : 'Budi Santoso';

    const newCase: FraudCase = {
      id: `case-man-${Date.now()}`,
      no: fraudCases.length + 1,
      caseId: newCaseId,
      identifiedOn: timestamp,
      detectionDate: data.detectionDate,
      alertStatus: initialStatus,
      investigationStatus: initialStatus === 'Draft' ? 'Opened' : 'Opened',
      assignee: defaultAssigneeName,
      ruleTemplateCode: data.alertCategory === 'Fraud' ? 'MANUAL-ESC' : 'MANUAL-AML',
      ruleBasicCode: data.alertCategory === 'Fraud' ? 'MANUAL-FRD-INTAKE' : 'MANUAL-AML-INTAKE',
      ruleName: `Manual Escalation - ${data.source}`,
      caseUrgency: data.severity,
      baseScore: baseScore,
      formulaRiskPoints: 0,
      finalRiskScore: baseScore,
      finalRiskLevel: data.severity,
      customerName: data.customerName,
      customerId: data.customerId,
      cif: data.cif,
      accountNumber: data.sourceAccountNumber,
      deviceId: data.deviceId || 'DEV-MANUAL',
      phoneNumber: data.phoneNumber || '08xxxxxxxxxx',
      aging: '1m',
      isManualAlert: true,
      alertSourceType: 'Manual',
      source: data.source,
      externalCaseId: data.externalCaseId,
      incidentDescription: data.incidentDescription,
      note: data.note,
      transaction: data.transaction || {
        trxId: `TRX-MAN-${Date.now().toString().slice(-6)}`,
        amount: 0,
        currency: 'IDR',
        sourceAccount: data.sourceAccountNumber || 'N/A',
        destinationAccount: 'N/A',
        destinationBank: 'N/A',
        channel: 'Manual Intake',
        ipAddress: '127.0.0.1',
        location: 'Bank Sampoerna HO',
        deviceModel: data.deviceId || 'Manual Intake',
        timestamp: timestamp,
        trxType: 'Manual Escalation Record'
      },
      transactionEvidenceList: data.transactionEvidenceList || [],
      attachments: data.attachments || [],
      formulaMatches: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          time: timestamp,
          user: 'Budi Santoso (Fraud Investigator L1 (Maker))',
          action: initialStatus === 'Draft' ? 'Manual Alert Draft Created' : 'Manual Alert Submitted',
          note: `Manual alert dibuat dari sumber: ${data.source}. External Case ID: ${data.externalCaseId || '-'}. Kronologi: ${data.incidentDescription.slice(0, 100)}...`,
          statusTransition: `Alert Status -> ${initialStatus}`
        }
      ],
      alertCategory: data.alertCategory
    };

    setFraudCases(prev => [newCase, ...prev]);
    return newCase;
  };

  // Rule Template Actions (Section C.2)
  const createRuleTemplate = (
    tplData: Omit<RuleTemplate, 'id' | 'version' | 'status' | 'testingStatus' | 'createdOn' | 'updatedAt'>
  ) => {
    const newTpl: RuleTemplate = {
      ...tplData,
      id: `tpl-${Date.now()}`,
      version: '1.0', // Flow A: Status Default: Baru dibuat = Inactive dan Need Testing, Version = 1.0
      status: 'Inactive',
      testingStatus: 'Need Testing',
      createdOn: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setRuleTemplates(prev => [newTpl, ...prev]);
  };

  const updateRuleTemplate = (
    id: string, 
    updated: Partial<RuleTemplate>, 
    parameterStructureChanged: boolean
  ) => {
    const existing = ruleTemplates.find(t => t.id === id);
    if (!existing) return;

    // Versioning logic
    let bumpType: 'major' | 'minor' | 'patch' | null = null;
    let changesArr: string[] = [];

    if (parameterStructureChanged) {
      bumpType = 'major';
      changesArr.push('Parameter placeholder structure changed');
    } else {
      if (updated.queryLogic !== undefined && updated.queryLogic !== existing.queryLogic) {
        bumpType = 'minor';
        changesArr.push('Query logic (SQL/JSON) changed');
      }
      
      const checkPatch = () => {
        if (!bumpType) bumpType = 'patch';
      };

      if (updated.name !== undefined && updated.name !== existing.name) {
        checkPatch();
        changesArr.push('Name changed');
      }
      if (updated.description !== undefined && updated.description !== existing.description) {
        checkPatch();
        changesArr.push('Description changed');
      }
    }

    let nextVersion = existing.version;
    let now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    
    // We don't have history in RuleTemplate type currently, but we update the version correctly
    if (bumpType) {
      nextVersion = bumpSemanticVersion(existing.version, bumpType);
    }

    const updatedTemplate: RuleTemplate = {
      ...existing,
      ...updated,
      version: nextVersion,
      testingStatus: bumpType === 'patch' ? existing.testingStatus : 'Need Testing',
      updatedAt: now,
    };

    setRuleTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));

    // Auto-propagation: C.2 item 5 -> Jika ada perubahan struktur parameter di Template, otomatis tandai seluruh Rule Basic yang terkorelasi menjadi status Out of Sync.
    if (parameterStructureChanged) {
      setRuleBasics(prev => prev.map(rb => {
        if (rb.templateCode === existing.code) {
          return {
            ...rb,
            syncStatus: 'Out of Sync'
          };
        }
        return rb;
      }));
    } else if (bumpType === 'minor' || bumpType === 'patch') {
      // If it's a minor or patch update to the template, the structure didn't change.
      // So the rule basic is still In Sync, but its templateVersion should reflect the parent's new version.
      setRuleBasics(prev => prev.map(rb => {
        if (rb.templateCode === existing.code) {
          return {
            ...rb,
            templateVersion: nextVersion
          };
        }
        return rb;
      }));
    }
  };

  const deleteRuleTemplate = (id: string) => {
    setRuleTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Rule Basic Actions (Section C.3)
  const createRuleBasic = (
    basicData: Omit<RuleBasic, 'id' | 'version' | 'status' | 'syncStatus' | 'testingStatus' | 'createdOn' | 'updatedAt'>
  ) => {
    const newBasic: RuleBasic = {
      ...basicData,
      id: `rb-${Date.now()}`,
      version: '1.0', // Flow B: Status Default: Baru dibuat = Inactive dan Need Testing, Version = 1.0
      status: 'Inactive',
      syncStatus: 'In Sync',
      testingStatus: 'Need Testing',
      createdOn: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setRuleBasics(prev => [newBasic, ...prev]);
  };

  const updateRuleBasic = (id: string, updated: Partial<RuleBasic>) => {
    setRuleBasics(prev => prev.map(rb => {
      if (rb.id === id) {
        let bumpType: 'major' | 'minor' | 'patch' | null = null;
        let changesArr: string[] = [];
        
        // Major changes (X) : penambahan / pengurangan placeholder (template changed)
        if (updated.templateCode !== undefined && updated.templateCode !== rb.templateCode) {
          bumpType = 'major';
          changesArr.push('Rule Template reference (placeholder) changed');
        }

        // Minor changes (Y) : script, parameterValues, autoBlock, baseScore, caseUrgency, channel
        const checkMinor = () => {
          if (bumpType === 'major') return;
          bumpType = 'minor';
        };

        if (updated.parameterValues !== undefined && JSON.stringify(updated.parameterValues) !== JSON.stringify(rb.parameterValues)) {
          checkMinor();
          changesArr.push('Parameter values changed');
        }
        if (updated.autoBlock !== undefined && JSON.stringify(updated.autoBlock) !== JSON.stringify(rb.autoBlock)) {
          checkMinor();
          changesArr.push('Auto-block config changed');
        }
        if (updated.baseScore !== undefined && updated.baseScore !== rb.baseScore) {
          checkMinor();
          changesArr.push(`Base score changed`);
        }
        if (updated.caseUrgency !== undefined && updated.caseUrgency !== rb.caseUrgency) {
          checkMinor();
          changesArr.push(`Urgency changed`);
        }
        if (updated.channel !== undefined && updated.channel !== rb.channel) {
          checkMinor();
          changesArr.push(`Channel changed`);
        }
        if (updated.txnType !== undefined && updated.txnType !== rb.txnType) {
          checkMinor();
          changesArr.push(`Txn Type changed`);
        }
        
        // Patch changes (Z) : name, description
        const checkPatch = () => {
          if (bumpType === 'major' || bumpType === 'minor') return;
          bumpType = 'patch';
        };

        if (updated.name !== undefined && updated.name !== rb.name) {
          checkPatch();
          changesArr.push(`Name changed`);
        }
        if (updated.description !== undefined && updated.description !== rb.description) {
          checkPatch();
          changesArr.push(`Description changed`);
        }

        if (!bumpType) {
          // No tracked changes, just merge
          return { ...rb, ...updated };
        }

        const newVersion = bumpSemanticVersion(rb.version, bumpType);
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        const newHistoryEntry = {
          version: newVersion,
          updatedAt: now,
          changes: changesArr.join(', '),
          updatedBy: updated.author || 'Yoseph Sanjaya (FMS Admin)'
        };

        return {
          ...rb,
          ...updated,
          version: newVersion,
          testingStatus: bumpType === 'patch' ? rb.testingStatus : 'Need Testing',
          updatedAt: now,
          history: [newHistoryEntry, ...(rb.history || [])],
        };
      }
      return rb;
    }));
  };

  // Sync action (C.1 Major Update 2.0 via Sinkronisasi button)
  const syncRuleBasic = (id: string) => {
    const basic = ruleBasics.find(rb => rb.id === id);
    if (!basic) return;

    const parentTemplate = ruleTemplates.find(t => t.code === basic.templateCode);

    setRuleBasics(prev => prev.map(rb => {
      if (rb.id === id) {
        const newVersion = bumpSemanticVersion(rb.version, 'major');
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

        const newHistoryEntry = {
          version: newVersion,
          updatedAt: now,
          changes: 'Sync with Parent Template (Major Update)',
          updatedBy: 'Yoseph Sanjaya (FMS Admin)'
        };

        return {
          ...rb,
          syncStatus: 'In Sync',
          version: newVersion,
          templateVersion: parentTemplate ? parentTemplate.version : rb.templateVersion,
          testingStatus: 'Need Testing',
          updatedAt: now,
          history: [newHistoryEntry, ...(rb.history || [])],
        };
      }
      return rb;
    }));
  };

  const deleteRuleBasic = (id: string) => {
    setRuleBasics(prev => prev.filter(rb => rb.id !== id));
  };

  // Rule Maker-Checker Approval Actions
  const createRuleTicket = (
    ticketData: Omit<RuleApprovalTicket, 'id' | 'ticketNo' | 'createdAt' | 'status'>
  ): RuleApprovalTicket => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const dateNum = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const prefix = ticketData.targetType === 'Template' ? 'TKT-TPL' : 'TKT-BSC';
    const domainPrefix = ticketData.domain === 'Fraud' ? 'FRD' : 'AML';
    
    const newTicket: RuleApprovalTicket = {
      ...ticketData,
      id: `${prefix}-${domainPrefix}-${dateNum}-${randomSeq}`,
      ticketNo: `TKT-${dateNum.slice(0, 6)}-${randomSeq}`,
      status: 'PENDING',
      createdAt: `${timestamp} WIB`
    };

    setRuleApprovalTickets(prev => [newTicket, ...prev]);

    // Add audit change log
    setAuditChangeLogs(prev => [
      {
        id: `aud-chg-${Date.now()}`,
        timestamp: `${timestamp} WIB`,
        userId: 'USR-MAKER-01',
        userName: ticketData.makerName,
        userRole: ticketData.makerRole,
        ipAddress: '10.14.88.21',
        moduleTable: `Rule ${ticketData.targetType} (${ticketData.domain})`,
        recordId: ticketData.targetCode,
        actionType: (ticketData.actionType === 'DELETE' ? 'DELETE' : ticketData.actionType === 'CREATE' ? 'INSERT' : 'UPDATE'),
        reason: `Pengajuan tiket baru [${ticketData.actionType}] untuk ${ticketData.targetCode}: ${ticketData.changeSummary}`,
        changes: [
          {
            fieldName: 'Approval Status',
            oldValue: ticketData.versionFrom || '-',
            newValue: ticketData.versionTo || 'PENDING'
          }
        ]
      },
      ...prev
    ]);

    const isFraud = ticketData.domain === 'Fraud' || ticketData.domain === 'FRAUD';
    addNotification({
      domain: isFraud ? 'FRAUD' : 'AML',
      title: 'Pengajuan Approval Baru',
      message: `User ${ticketData.makerName || 'L1 Maker'} mengajukan perubahan pada ${ticketData.targetType} (${ticketData.targetName || ticketData.targetCode}). Perlu peninjauan Anda.`,
      targetRole: isFraud ? 'afcl2' : 'analystl2',
      targetTab: getApprovalTabForTicket(ticketData.targetType, ticketData.domain),
      ticketId: newTicket.id
    });

    return newTicket;
  };

  const approveRuleTicket = (
    ticketId: string, 
    checkerName = 'Hendrawan Kusuma', 
    checkerNotes = 'Disetujui dan diverifikasi oleh Checker Supervisor.'
  ) => {
    const ticket = ruleApprovalTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Apply changes into live Rule Templates or Rule Basics
    if (ticket.targetType === 'Template') {
      if (ticket.actionType === 'CREATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as RuleTemplate;
        setRuleTemplates(prev => {
          if (prev.some(t => t.code === proposed.code)) {
            return prev.map(t => t.code === proposed.code ? { ...proposed, status: 'Active', updatedAt: `${now} WIB` } : t);
          }
          return [{ ...proposed, status: 'Active', updatedAt: `${now} WIB` }, ...prev];
        });
      } else if (ticket.actionType === 'UPDATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as RuleTemplate;
        setRuleTemplates(prev => prev.map(t => t.code === ticket.targetCode ? { ...proposed, updatedAt: `${now} WIB` } : t));
      } else if (ticket.actionType === 'DELETE') {
        setRuleTemplates(prev => prev.filter(t => t.code !== ticket.targetCode));
      }
    } else if (ticket.targetType === 'Basic') {
      if (ticket.actionType === 'CREATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as RuleBasic;
        setRuleBasics(prev => {
          if (prev.some(b => b.code === proposed.code)) {
            return prev.map(b => b.code === proposed.code ? { ...proposed, status: 'Active', updatedAt: `${now} WIB` } : b);
          }
          return [{ ...proposed, status: 'Active', updatedAt: `${now} WIB` }, ...prev];
        });
      } else if (ticket.actionType === 'UPDATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as RuleBasic;
        setRuleBasics(prev => prev.map(b => b.code === ticket.targetCode ? { ...proposed, updatedAt: `${now} WIB` } : b));
      } else if (ticket.actionType === 'DELETE') {
        setRuleBasics(prev => prev.filter(b => b.code !== ticket.targetCode));
      }
    } else if (ticket.targetType === 'Formula') {
      if (ticket.actionType === 'CREATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as FormulaRisk;
        setFormulaRisks(prev => [proposed, ...prev]);
      } else if (ticket.actionType === 'UPDATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as FormulaRisk;
        setFormulaRisks(prev => prev.map(fr => (fr.code === ticket.targetCode || fr.id === ticket.targetCode) ? { ...proposed } : fr));
      } else if (ticket.actionType === 'DELETE') {
        setFormulaRisks(prev => prev.filter(fr => fr.code !== ticket.targetCode && fr.id !== ticket.targetCode));
      }
    } else if (ticket.targetType === 'Batch Upload List' || ticket.targetType.includes('Batch') || ['CIF', 'Source Account Number', 'Device ID', 'Phone Number'].includes(ticket.targetType)) {
      if (ticket.proposedData?.entries && Array.isArray(ticket.proposedData.entries)) {
        const batchIds = new Set(ticket.proposedData.entries.map((e: any) => e.id));
        setListEntries(prev => prev.map(le => {
          if (batchIds.has(le.id) || (ticket.targetCode && le.batchId === ticket.targetCode)) {
            return { ...le, status: 'Active' };
          }
          return le;
        }));
      } else if (ticket.actionType === 'CREATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as ListEntry;
        setListEntries(prev => {
          const exists = prev.some(le => le.id === proposed.id || le.value === proposed.value);
          if (exists) {
            return prev.map(le => (le.id === proposed.id || le.value === proposed.value) ? { ...proposed, status: 'Active' } : le);
          }
          return [{ ...proposed, status: 'Active' }, ...prev];
        });
      } else if (ticket.actionType === 'UPDATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as ListEntry;
        setListEntries(prev => prev.map(le => (le.id === ticket.targetCode || le.value === ticket.targetCode) ? { ...proposed, status: 'Active' } : le));
      } else if (ticket.actionType === 'DELETE') {
        setListEntries(prev => prev.filter(le => le.id !== ticket.targetCode && le.value !== ticket.targetCode));
      }
    } else if (ticket.targetType === 'User Session & Lockout' || ticket.targetType === 'User Session') {
      setUserSessions(prev => prev.map(s => {
        if (s.userId === ticket.targetCode || s.username === ticket.targetCode || s.id === ticket.targetCode) {
          return {
            ...s,
            status: 'OFFLINE',
            failedAttempts: 0,
            unlockRequested: false,
            unlockRequestNote: undefined
          };
        }
        return s;
      }));
    } else if (ticket.targetType === 'Watchlist Location') {
      if (ticket.actionType === 'CREATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as WatchlistLocation;
        setWatchlistLocations(prev => {
          const exists = prev.some(l => l.id === proposed.id);
          if (exists) {
            return prev.map(l => l.id === proposed.id ? { ...proposed, approvalStatus: 'Active', lastUpdateDate: now } : l);
          }
          return [{ ...proposed, approvalStatus: 'Active', lastUpdateDate: now }, ...prev];
        });
      } else if (ticket.actionType === 'UPDATE' && ticket.proposedData) {
        const proposed = ticket.proposedData as WatchlistLocation;
        setWatchlistLocations(prev => prev.map(l => l.id === ticket.targetCode ? { ...l, ...proposed, approvalStatus: 'Active', proposedChanges: undefined, lastUpdateDate: now } : l));
      } else if (ticket.actionType === 'DELETE') {
        setWatchlistLocations(prev => prev.filter(l => l.id !== ticket.targetCode));
      }
    }

    // Update ticket state to APPROVED
    setRuleApprovalTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'APPROVED',
          checkerName,
          checkerRole: 'L2 Checker Supervisor',
          reviewedAt: `${now} WIB`,
          checkerNotes
        };
      }
      return t;
    }));

    // Add audit change log
    setAuditChangeLogs(prev => [
      {
        id: `aud-chg-${Date.now()}`,
        timestamp: `${now} WIB`,
        userId: 'USR-CHECKER-01',
        userName: checkerName,
        userRole: 'L2 Checker Supervisor',
        ipAddress: '10.14.88.22',
        moduleTable: `Rule ${ticket.targetType} (${ticket.domain})`,
        recordId: ticket.targetCode,
        actionType: (ticket.actionType === 'DELETE' ? 'DELETE' : 'UPDATE'),
        reason: `Persetujuan tiket ${ticket.ticketNo} [${ticket.actionType}]: ${checkerNotes}`,
        changes: [
          {
            fieldName: 'Approval Status',
            oldValue: 'PENDING',
            newValue: 'APPROVED'
          }
        ]
      },
      ...prev
    ]);

    const isFraud = ticket.domain === 'Fraud' || ticket.domain === 'FRAUD';
    addNotification({
      domain: isFraud ? 'FRAUD' : 'AML',
      title: 'Pengajuan Disetujui',
      message: `Pengajuan ${ticket.targetType} (${ticket.targetName || ticket.targetCode}) Anda telah DISETUJUI oleh ${checkerName}.`,
      targetRole: isFraud ? 'afcl1' : 'analystl1',
      targetTab: getApprovalTabForTicket(ticket.targetType, ticket.domain),
      ticketId: ticket.id
    });
  };

  const rejectRuleTicket = (
    ticketId: string, 
    rejectorName = 'Hendrawan Kusuma', 
    rejectNotes = 'Ditolak karena tidak sesuai spesifikasi risiko perbankan.'
  ) => {
    const ticket = ruleApprovalTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (ticket.targetType === 'User Session & Lockout' || ticket.targetType === 'User Session') {
      setUserSessions(prev => prev.map(s => {
        if (s.userId === ticket.targetCode || s.username === ticket.targetCode || s.id === ticket.targetCode) {
          return {
            ...s,
            unlockRequested: false
          };
        }
        return s;
      }));
    }

    if (ticket.targetType === 'Batch Upload List' || ticket.targetType.includes('Batch') || ['CIF', 'Source Account Number', 'Device ID', 'Phone Number'].includes(ticket.targetType)) {
      if (ticket.proposedData?.entries && Array.isArray(ticket.proposedData.entries)) {
        const batchIds = new Set(ticket.proposedData.entries.map((e: any) => e.id));
        setListEntries(prev => prev.map(le => {
          if (batchIds.has(le.id) || (ticket.targetCode && le.batchId === ticket.targetCode)) {
            return { ...le, status: 'Revoked' };
          }
          return le;
        }));
      } else {
        setListEntries(prev => prev.map(le => {
          if (le.id === ticket.targetCode || le.value === ticket.targetCode) {
            return { ...le, status: 'Revoked' };
          }
          return le;
        }));
      }
    }

    if (ticket.targetType === 'Watchlist Location') {
      if (ticket.actionType === 'CREATE') {
        setWatchlistLocations(prev => prev.filter(l => l.id !== ticket.targetCode));
      } else if (ticket.actionType === 'UPDATE' || ticket.actionType === 'DELETE') {
        setWatchlistLocations(prev => prev.map(l => l.id === ticket.targetCode ? { ...l, approvalStatus: 'Active', proposedChanges: undefined, lastUpdateDate: now } : l));
      }
    }

    // Update ticket state to REJECTED
    setRuleApprovalTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'REJECTED',
          checkerName: rejectorName,
          checkerRole: 'L2 Checker Supervisor',
          reviewedAt: `${now} WIB`,
          checkerNotes: rejectNotes
        };
      }
      return t;
    }));

    // Add audit change log
    setAuditChangeLogs(prev => [
      {
        id: `aud-chg-${Date.now()}`,
        timestamp: `${now} WIB`,
        userId: 'USR-CHECKER-01',
        userName: rejectorName,
        userRole: 'L2 Checker Supervisor',
        ipAddress: '10.14.88.22',
        moduleTable: `Rule ${ticket.targetType} (${ticket.domain})`,
        recordId: ticket.targetCode,
        actionType: 'UPDATE',
        reason: `Penolakan tiket ${ticket.ticketNo} [${ticket.actionType}]. Alasan: ${rejectNotes}`,
        changes: [
          {
            fieldName: 'Approval Status',
            oldValue: 'PENDING',
            newValue: 'REJECTED'
          }
        ]
      },
      ...prev
    ]);

    const isFraud = ticket.domain === 'Fraud' || ticket.domain === 'FRAUD';
    addNotification({
      domain: isFraud ? 'FRAUD' : 'AML',
      title: 'Pengajuan Ditolak',
      message: `Pengajuan ${ticket.targetType} (${ticket.targetName || ticket.targetCode}) Anda DITOLAK oleh ${rejectorName}. Catatan: ${rejectNotes}`,
      targetRole: isFraud ? 'afcl1' : 'analystl1',
      targetTab: getApprovalTabForTicket(ticket.targetType, ticket.domain),
      ticketId: ticket.id
    });
  };

  const getPendingRuleApprovalCount = (targetType?: string, domain?: string): number => {
    return ruleApprovalTickets.filter(t => {
      if (t.status !== 'PENDING') return false;
      if (targetType && t.targetType !== targetType) return false;
      if (domain && t.domain !== domain) return false;
      return true;
    }).length;
  };

  // Formula Risk Actions (Section D)
  const createFormulaRisk = (formulaData: Omit<FormulaRisk, 'id' | 'createdAt'>) => {
    const newFormula: FormulaRisk = {
      ...formulaData,
      id: `fr-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setFormulaRisks(prev => [newFormula, ...prev]);
  };

  const updateFormulaRisk = (id: string, updated: Partial<FormulaRisk>) => {
    setFormulaRisks(prev => prev.map(fr => fr.id === id ? { ...fr, ...updated } : fr));
  };

  const deleteFormulaRisk = (id: string) => {
    setFormulaRisks(prev => prev.filter(fr => fr.id !== id));
  };

  // List Management Actions (Section E)
  const createListEntry = (entryData: Omit<ListEntry, 'id' | 'createdAt' | 'matchCount'>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newEntryStatus = entryData.status || 'Pending Approval';
    const newEntry: ListEntry = {
      ...entryData,
      id: `lst-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: timestamp,
      addedAt: timestamp,
      status: newEntryStatus,
      matchCount: 0
    };
    setListEntries(prev => [newEntry, ...prev]);

    let ticketNo: string | undefined = undefined;

    // Strict Maker-Checker: if status is 'Pending Approval', create RuleApprovalTicket
    if (newEntryStatus === 'Pending Approval' || (newEntryStatus as any) === 'PENDING_APPROVAL') {
      const entityCategory = newEntry.entityType || newEntry.category || 'CIF';
      const domainName = (newEntry.domain || newEntry.listCategory || 'FRAUD').toUpperCase() === 'FRAUD' ? 'Fraud' : 'AML';
      ticketNo = `TKT-${new Date().getFullYear()}-${String(ruleApprovalTickets.length + 1).padStart(4, '0')}`;
      
      const newTicket: RuleApprovalTicket = {
        id: `tkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ticketNo,
        targetType: entityCategory,
        domain: domainName as any,
        actionType: 'CREATE',
        targetCode: newEntry.value,
        targetName: `${newEntry.type} ${entityCategory}: ${newEntry.holderName || newEntry.value}`,
        status: 'PENDING',
        makerName: newEntry.addedBy || 'Maker Specialist (L1)',
        makerRole: domainName === 'Fraud' ? 'AFC L1 (Fraud Maker)' : 'Analyst L1 (AML Maker)',
        createdAt: `${timestamp} WIB`,
        makerNotes: newEntry.reason || `Pendaftaran ${newEntry.type} ${entityCategory} baru: ${newEntry.value}`,
        changeSummary: `Pengajuan pendaftaran ${newEntry.type} ${domainName} (${entityCategory}: ${newEntry.value}, Bobot Risiko: ${newEntry.riskWeight || 0}). Menunggu persetujuan L2 Checker.`,
        versionFrom: 'Status: Belum Terdaftar',
        versionTo: `Status: PENDING APPROVAL (${newEntry.type} ${domainName})`,
        proposedData: newEntry
      };

      setRuleApprovalTickets(prev => [newTicket, ...prev]);

      addNotification({
        domain: domainName === 'Fraud' ? 'FRAUD' : 'AML',
        title: `Pengajuan Entitas Baru #${ticketNo}`,
        message: `Pendaftaran ${newEntry.type} (${entityCategory}: ${newEntry.value}) oleh ${newEntry.addedBy || 'Maker L1'} menunggu persetujuan L2 Checker.`,
        targetRole: domainName === 'Fraud' ? 'afcl2' : 'analystl2',
        targetTab: getApprovalTabForTicket(entityCategory, domainName),
        ticketId: newTicket.id
      });
    }

    return { newEntry, ticketNo };
  };

  const updateListEntry = (id: string, updated: Partial<ListEntry>) => {
    setListEntries(prev => prev.map(le => le.id === id ? { ...le, ...updated } : le));
  };

  const deleteListEntry = (id: string) => {
    setListEntries(prev => prev.filter(le => le.id !== id));
  };

  const bulkImportListEntries = (
    entries: Array<Omit<ListEntry, 'id' | 'createdAt' | 'matchCount'>>,
    options?: { batchId?: string; fileName?: string; targetDomain?: 'FRAUD' | 'AML'; targetListType?: ListType; makerName?: string }
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const batchId = options?.batchId || `BATCH-${Date.now().toString().slice(-6)}`;
    const domain = options?.targetDomain || entries[0]?.domain || entries[0]?.listCategory || 'FRAUD';
    const listType = options?.targetListType || entries[0]?.type || 'Blacklist';
    const makerName = options?.makerName || 'Yoseph Sanjaya (DCA Maker)';

    const newEntries: ListEntry[] = entries.map((entryData, idx) => ({
      ...entryData,
      id: `lst-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: timestamp,
      addedAt: timestamp,
      status: 'Pending Approval',
      batchId,
      matchCount: 0
    }));

    setListEntries(prev => [...newEntries, ...prev]);

    // Create RuleApprovalTicket for L2 Checker review
    const ticketNo = `TKT-${new Date().getFullYear()}-${String(ruleApprovalTickets.length + 1).padStart(4, '0')}`;
    const newTicket: RuleApprovalTicket = {
      id: `tkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ticketNo,
      targetType: 'Batch Upload List',
      domain: domain === 'FRAUD' ? 'Fraud' : 'AML',
      actionType: 'CREATE',
      targetCode: batchId,
      targetName: `Batch Upload ${newEntries.length} Entitas (${listType} ${domain})`,
      status: 'PENDING',
      makerName,
      makerRole: 'DCA Maker Specialist',
      createdAt: `${timestamp} WIB`,
      makerNotes: `Import massal ${newEntries.length} entitas dari berkas ${options?.fileName || 'Upload File'}. Membutuhkan verifikasi dan persetujuan L2 Checker.`,
      changeSummary: `Pengajuan import batch ${newEntries.length} entitas ke daftar ${listType} (${domain}). Seluruh data berstatus PENDING APPROVAL.`,
      versionFrom: 'Status: Draft / Pending Ingestion',
      versionTo: `Status: PENDING APPROVAL (${newEntries.length} data)`,
      proposedData: {
        batchId,
        fileName: options?.fileName || 'batch_upload.csv',
        targetDomain: domain,
        targetListType: listType,
        totalEntries: newEntries.length,
        entries: newEntries
      }
    };

    setRuleApprovalTickets(prev => [newTicket, ...prev]);

    addNotification({
      domain: domain === 'FRAUD' ? 'FRAUD' : 'AML',
      title: 'Batch Import Diajukan (Pending Approval)',
      message: `Batch upload ${newEntries.length} entitas (${batchId}) telah dibuat dengan status Pending Approval dan masuk ke antrean persetujuan Supervisor (L2 Checker).`,
      targetRole: domain === 'FRAUD' ? 'afcl2' : 'analystl2',
      targetTab: domain === 'FRAUD' ? 'list-management-cif-fraud-approval' : 'list-management-cif-aml-approval',
      ticketId: newTicket.id
    });

    return { addedCount: newEntries.length, batchId, ticketNo: newTicket.ticketNo };
  };

  // Helper to cross-match CIF against database
  const checkCifMatch = (entry: { identityNumber: string; fullName: string; accountNumber?: string; phoneNumber?: string }): { isMatched: boolean; matchedCif?: string; matchedCustomerName?: string } => {
    // 1. Direct match with fraud cases
    const normName = entry.fullName.toLowerCase().trim();
    const normId = entry.identityNumber.replace(/[\s\.-]/g, '');
    const normAcc = (entry.accountNumber || '').replace(/[\s-]/g, '');
    const normPhone = (entry.phoneNumber || '').replace(/[\s-]/g, '');

    for (const c of fraudCases) {
      if (normAcc && c.accountNumber && c.accountNumber.replace(/[\s-]/g, '') === normAcc) {
        return { isMatched: true, matchedCif: c.cif, matchedCustomerName: c.customerName };
      }
      if (normPhone && c.phoneNumber && c.phoneNumber.replace(/[\s-]/g, '').includes(normPhone.slice(-8))) {
        return { isMatched: true, matchedCif: c.cif, matchedCustomerName: c.customerName };
      }
      if (normName && c.customerName.toLowerCase().includes(normName) || normName.includes(c.customerName.toLowerCase())) {
        return { isMatched: true, matchedCif: c.cif, matchedCustomerName: c.customerName };
      }
    }

    // 2. Known benchmark matches for demo
    if (normId.includes('3171051208820004') || normName.includes('hasanudin') || normName.includes('ba\'asyir')) {
      return { isMatched: true, matchedCif: 'CIF8829103', matchedCustomerName: 'Hendrawan Pratama (Alias Group)' };
    }
    if (normId.includes('3201081905950002') || normName.includes('rian hidayat')) {
      return { isMatched: true, matchedCif: 'CIF7748291', matchedCustomerName: 'Ferry Ardiansyah (Nominee Link)' };
    }

    return { isMatched: false };
  };

  // External Blacklist Actions
  const createExternalBlacklistEntry = (entryData: Omit<ExternalBlacklistEntry, 'id' | 'createdAt' | 'matchStatus' | 'lastCheckedAt'>) => {
    const matchResult = checkCifMatch({
      identityNumber: entryData.identityNumber,
      fullName: entryData.fullName,
      accountNumber: entryData.accountNumber,
      phoneNumber: entryData.phoneNumber
    });

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newEntry: ExternalBlacklistEntry = {
      ...entryData,
      id: `EBL-${new Date().getFullYear()}-${String(externalBlacklistEntries.length + 1).padStart(3, '0')}`,
      createdAt: now,
      lastCheckedAt: now,
      matchStatus: matchResult.isMatched ? 'Matched With Existing CIF' : 'No Match',
      matchedCif: matchResult.matchedCif,
      matchedCustomerName: matchResult.matchedCustomerName
    };
    setExternalBlacklistEntries(prev => [newEntry, ...prev]);
  };

  const updateExternalBlacklistEntry = (id: string, updated: Partial<ExternalBlacklistEntry>) => {
    setExternalBlacklistEntries(prev => prev.map(eb => {
      if (eb.id !== id) return eb;
      const combined = { ...eb, ...updated };
      const matchResult = checkCifMatch({
        identityNumber: combined.identityNumber,
        fullName: combined.fullName,
        accountNumber: combined.accountNumber,
        phoneNumber: combined.phoneNumber
      });
      return {
        ...combined,
        matchStatus: matchResult.isMatched ? 'Matched With Existing CIF' : 'No Match',
        matchedCif: matchResult.matchedCif,
        matchedCustomerName: matchResult.matchedCustomerName,
        lastCheckedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
    }));
  };

  const deleteExternalBlacklistEntry = (id: string) => {
    setExternalBlacklistEntries(prev => prev.filter(eb => eb.id !== id));
  };

  const bulkImportExternalBlacklist = (entries: Array<Omit<ExternalBlacklistEntry, 'id' | 'createdAt' | 'matchStatus' | 'lastCheckedAt'>>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let matchedCount = 0;
    const newEntries: ExternalBlacklistEntry[] = entries.map((entryData, idx) => {
      const matchResult = checkCifMatch({
        identityNumber: entryData.identityNumber,
        fullName: entryData.fullName,
        accountNumber: entryData.accountNumber,
        phoneNumber: entryData.phoneNumber
      });
      if (matchResult.isMatched) matchedCount++;

      return {
        ...entryData,
        id: `EBL-${new Date().getFullYear()}-${String(externalBlacklistEntries.length + idx + 1).padStart(3, '0')}`,
        createdAt: now,
        lastCheckedAt: now,
        matchStatus: matchResult.isMatched ? 'Matched With Existing CIF' : 'No Match',
        matchedCif: matchResult.matchedCif,
        matchedCustomerName: matchResult.matchedCustomerName
      };
    });

    setExternalBlacklistEntries(prev => [...newEntries, ...prev]);
    return { addedCount: newEntries.length, matchedCount };
  };

  // Backtesting Simulation Runner (Section C.4)
  const runBacktestSimulation = async (params: {
    category: any;
    ruleTemplateCode?: string;
    ruleBasicCode?: string;
    targetVersion: string;
    datasetPeriod: string;
  }): Promise<BacktestingSession> => {
    const tpl = ruleTemplates.find(t => t.code === params.ruleTemplateCode);
    const basic = ruleBasics.find(rb => rb.code === params.ruleBasicCode);

    // Guardrail for Dependency Change (C.4 Category 3):
    // Versi Proposed antara Rule Template dan Rule Basic HARUS SAMA agar pengujian dapat dijalankan.
    if (params.category === 'Dependency Change') {
      if (tpl && basic && tpl.version !== basic.version) {
        throw new Error(`Guardrail Validation Failed: Versi Template (${tpl.version}) dan Versi Rule Basic (${basic.version}) harus sama untuk kategori Dependency Change! Silakan klik 'Sinkronisasi' terlebih dahulu.`);
      }
    }

    const newSession: BacktestingSession = {
      id: `bt-${Date.now()}`,
      category: params.category,
      ruleTemplateId: tpl?.id,
      ruleTemplateCode: params.ruleTemplateCode,
      ruleTemplateVersion: tpl?.version,
      ruleBasicId: basic?.id,
      ruleBasicCode: params.ruleBasicCode,
      ruleBasicVersion: basic?.version,
      targetVersion: params.targetVersion,
      datasetPeriod: params.datasetPeriod,
      totalTransactionsTested: 5200000,
      triggeredAlertsCount: Math.floor(Math.random() * 50) + 12,
      estimatedFPRate: parseFloat((Math.random() * 4 + 1.2).toFixed(1)),
      impactedCifsCount: Math.floor(Math.random() * 40) + 8,
      status: 'Completed',
      passed: true,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      logs: [
        `[${new Date().toLocaleTimeString('id-ID')}] Menginisialisasi Backtest Engine Neo FMS (Category: ${params.category})...`,
        `[${new Date().toLocaleTimeString('id-ID')}] Menghubungkan ke Historical Transaction Data Lake: ${params.datasetPeriod}...`,
        `[${new Date().toLocaleTimeString('id-ID')}] Memeriksa validitas parameter query & threshold...`,
        `[${new Date().toLocaleTimeString('id-ID')}] Menjalankan simulasi batching 5.200.000 transaksi...`,
        `[${new Date().toLocaleTimeString('id-ID')}] Analisis False Positive Rate memenuhi ambang batas toleransi (< 8.0%). Status: PASSED.`
      ]
    };

    setBacktestSessions(prev => [newSession, ...prev]);

    // Update testing status on tested rule
    if (basic) {
      setRuleBasics(prev => prev.map(rb => rb.id === basic.id ? { ...rb, testingStatus: 'Passed' } : rb));
    }
    if (tpl) {
      setRuleTemplates(prev => prev.map(t => t.id === tpl.id ? { ...t, testingStatus: 'Passed' } : t));
    }

    return newSession;
  };

  const promoteRuleAfterTest = (ruleType: 'Template' | 'Basic', code: string) => {
    if (ruleType === 'Template') {
      setRuleTemplates(prev => prev.map(t => t.code === code ? { ...t, status: 'Active', testingStatus: 'Passed' } : t));
    } else {
      setRuleBasics(prev => prev.map(rb => rb.code === code ? { ...rb, status: 'Active', testingStatus: 'Passed' } : rb));
    }
  };

  // System Parameter Actions (User, Group, Role)
  const addSystemUser = (userData: Omit<SystemUser, 'id' | 'createdDate' | 'updatedDate'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newUser: SystemUser = {
      ...userData,
      id: `USR-${Date.now().toString().slice(-4)}`,
      createdDate: now,
      updatedDate: now
    };
    setSystemUsers(prev => [newUser, ...prev]);
  };

  const updateSystemUser = (id: string, updates: Partial<SystemUser>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setSystemUsers(prev => prev.map(u => (u.id === id || u.userId === id) ? { ...u, ...updates, updatedDate: now } : u));
  };

  const deleteSystemUser = (id: string) => {
    setSystemUsers(prev => prev.filter(u => u.id !== id && u.userId !== id));
  };

  const addSystemGroup = (groupData: Omit<SystemGroup, 'id' | 'createdDate' | 'updatedDate'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newGroup: SystemGroup = {
      ...groupData,
      id: `GRP-${Date.now().toString().slice(-3)}`,
      createdDate: now,
      updatedDate: now
    };
    setSystemGroups(prev => [newGroup, ...prev]);
  };

  const updateSystemGroup = (id: string, updates: Partial<SystemGroup>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setSystemGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedDate: now } : g));
  };

  const deleteSystemGroup = (id: string) => {
    setSystemGroups(prev => prev.filter(g => g.id !== id));
  };

  const addSystemRole = (roleData: Omit<SystemRole, 'id' | 'createdDate' | 'updatedDate'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newRole: SystemRole = {
      ...roleData,
      id: `ROL-${Date.now().toString().slice(-3)}`,
      createdDate: now,
      updatedDate: now
    };
    setSystemRoles(prev => [newRole, ...prev]);
  };

  const updateSystemRole = (id: string, updates: Partial<SystemRole>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setSystemRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedDate: now } : r));
  };

  const deleteSystemRole = (id: string) => {
    setSystemRoles(prev => prev.filter(r => r.id !== id));
  };

  const addEmailTemplate = (templateData: Omit<EmailTemplate, 'id' | 'createdDate' | 'updatedDate'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newTemplate: EmailTemplate = {
      ...templateData,
      id: `ETPL-${(emailTemplates.length + 1).toString().padStart(3, '0')}`,
      createdDate: now,
      updatedDate: now
    };
    setEmailTemplates(prev => [newTemplate, ...prev]);
  };

  const updateEmailTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setEmailTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedDate: now } : t));
  };

  const deleteEmailTemplate = (id: string) => {
    setEmailTemplates(prev => prev.filter(t => t.id !== id));
  };

  const toggleEmailTemplateStatus = (id: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setEmailTemplates(prev => prev.map(t => t.id === id ? {
      ...t,
      status: t.status === 'Active' ? 'Inactive' : 'Active',
      updatedDate: now
    } : t));
  };

  // System Parameter: Watchlist Location Handlers
  const createWatchlistLocation = (
    locData: Omit<WatchlistLocation, 'id' | 'createdDate' | 'lastUpdateDate' | 'approvalStatus'>,
    reason?: string,
    asMaker: boolean = true
  ): WatchlistLocation => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const maxNum = watchlistLocations.reduce((max, l) => {
      const match = l.id.match(/WLOC-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 8);
    const newId = `WLOC-${String(maxNum + 1).padStart(3, '0')}`;

    const newRecord: WatchlistLocation = {
      ...locData,
      id: newId,
      createdDate: now,
      lastUpdateDate: now,
      approvalStatus: asMaker ? 'Pending Approval - New' : 'Active',
      status: locData.status || 'Active'
    };

    if (asMaker) {
      const ticket = createRuleTicket({
        targetType: 'Watchlist Location',
        domain: 'Fraud',
        actionType: 'CREATE',
        targetCode: newId,
        targetName: locData.name,
        makerName: locData.createdBy || 'Anti-Fraud Officer L1',
        makerRole: 'L1 Maker (Fraud Ops)',
        makerNotes: reason || 'Pengajuan penambahan lokasi watchlist baru oleh Maker.',
        changeSummary: `Penambahan entitas Watchlist Location baru: ${newId} (${locData.name}, Lat: ${locData.latitude}, Long: ${locData.longitude})`,
        previousData: null,
        proposedData: newRecord
      });
      newRecord.ticketId = ticket.id;
    }

    setWatchlistLocations(prev => [newRecord, ...prev]);

    setAuditChangeLogs(prev => [
      {
        id: `aud-chg-${Date.now()}`,
        timestamp: `${now} WIB`,
        userId: locData.createdBy || 'USR-MAKER-01',
        userName: locData.createdBy || 'Anti-Fraud Officer L1',
        userRole: asMaker ? 'AFC L1 (Fraud Maker)' : 'Sysadmin (Full Access)',
        ipAddress: '10.14.88.19',
        moduleTable: 'System Parameter - Watchlist Location',
        recordId: newId,
        actionType: 'INSERT',
        reason: reason || 'Penambahan entitas Watchlist Location baru',
        changes: [
          { fieldName: 'Location Name', oldValue: '-', newValue: locData.name },
          { fieldName: 'Coordinates', oldValue: '-', newValue: `${locData.latitude}, ${locData.longitude}` },
          { fieldName: 'Approval Status', oldValue: '-', newValue: asMaker ? 'Pending Approval - New' : 'Active' }
        ]
      },
      ...prev
    ]);

    return newRecord;
  };

  const updateWatchlistLocation = (
    id: string,
    updates: Partial<WatchlistLocation>,
    reason?: string,
    asMaker: boolean = true
  ) => {
    const existing = watchlistLocations.find(l => l.id === id);
    if (!existing) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (asMaker) {
      const ticket = createRuleTicket({
        targetType: 'Watchlist Location',
        domain: 'Fraud',
        actionType: 'UPDATE',
        targetCode: id,
        targetName: updates.name || existing.name,
        makerName: updates.lastUpdatedBy || 'Anti-Fraud Officer L1',
        makerRole: 'L1 Maker (Fraud Ops)',
        makerNotes: reason || 'Pengajuan pembaruan data/koordinat Watchlist Location.',
        changeSummary: `Pembaruan lokasi ${id} (${existing.name} -> ${updates.name || existing.name})`,
        previousData: existing,
        proposedData: { ...existing, ...updates, lastUpdateDate: now }
      });

      setWatchlistLocations(prev => prev.map(l => {
        if (l.id === id) {
          return {
            ...l,
            approvalStatus: 'Pending Approval - Edit',
            proposedChanges: updates,
            ticketId: ticket.id,
            lastUpdateDate: now
          };
        }
        return l;
      }));
    } else {
      setWatchlistLocations(prev => prev.map(l => {
        if (l.id === id) {
          return {
            ...l,
            ...updates,
            approvalStatus: 'Active',
            proposedChanges: undefined,
            lastUpdateDate: now
          };
        }
        return l;
      }));
    }

    setAuditChangeLogs(prev => [
      {
        id: `aud-chg-${Date.now()}`,
        timestamp: `${now} WIB`,
        userId: updates.lastUpdatedBy || 'USR-MAKER-01',
        userName: updates.lastUpdatedBy || 'Anti-Fraud Officer L1',
        userRole: asMaker ? 'AFC L1 (Fraud Maker)' : 'Sysadmin (Full Access)',
        ipAddress: '10.14.88.19',
        moduleTable: 'System Parameter - Watchlist Location',
        recordId: id,
        actionType: 'UPDATE',
        reason: reason || 'Pembaruan data Watchlist Location',
        changes: [
          { fieldName: 'Status / Koordinat', oldValue: `${existing.name} (${existing.latitude}, ${existing.longitude})`, newValue: `${updates.name || existing.name} (${updates.latitude ?? existing.latitude}, ${updates.longitude ?? existing.longitude})` }
        ]
      },
      ...prev
    ]);
  };

  const deleteWatchlistLocation = (id: string, reason?: string, asMaker: boolean = true) => {
    const existing = watchlistLocations.find(l => l.id === id);
    if (!existing) return;

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (asMaker) {
      const ticket = createRuleTicket({
        targetType: 'Watchlist Location',
        domain: 'Fraud',
        actionType: 'DELETE',
        targetCode: id,
        targetName: existing.name,
        makerName: 'Anti-Fraud Officer L1',
        makerRole: 'L1 Maker (Fraud Ops)',
        makerNotes: reason || 'Pengajuan penghapusan lokasi watchlist yang sudah tidak berisiko.',
        changeSummary: `Penghapusan Watchlist Location ${id} (${existing.name})`,
        previousData: existing,
        proposedData: null
      });

      setWatchlistLocations(prev => prev.map(l => {
        if (l.id === id) {
          return {
            ...l,
            approvalStatus: 'Pending Approval - Delete',
            ticketId: ticket.id,
            lastUpdateDate: now
          };
        }
        return l;
      }));
    } else {
      setWatchlistLocations(prev => prev.filter(l => l.id !== id));
    }

    setAuditChangeLogs(prev => [
      {
        id: `aud-chg-${Date.now()}`,
        timestamp: `${now} WIB`,
        userId: 'USR-OPERATOR',
        userName: 'Operator FMS',
        userRole: asMaker ? 'AFC L1 (Fraud Maker)' : 'Sysadmin',
        ipAddress: '10.14.88.19',
        moduleTable: 'System Parameter - Watchlist Location',
        recordId: id,
        actionType: 'DELETE',
        reason: reason || 'Permohonan penghapusan record watchlist location',
        changes: [{ fieldName: 'Record Status', oldValue: 'Active', newValue: asMaker ? 'Pending Approval - Delete' : 'DELETED' }]
      },
      ...prev
    ]);
  };

  const toggleWatchlistLocationStatus = (id: string, reason?: string, asMaker: boolean = true) => {
    const existing = watchlistLocations.find(l => l.id === id);
    if (!existing) return;

    const targetStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
    updateWatchlistLocation(
      id,
      { status: targetStatus },
      reason || `Pengubahan status operasional lokasi menjadi ${targetStatus}`,
      asMaker
    );
  };

  const resetWatchlistLocations = () => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('fms_watchlist_locations');
    }
    setWatchlistLocations(INITIAL_WATCHLIST_LOCATIONS);
  };

  // User Session & Lockout Handlers
  const forceLogoutUser = (idOrUserId: string) => {
    const session = userSessions.find(s => s.id === idOrUserId || s.userId === idOrUserId);
    if (!session) return;

    setUserSessions(prev => prev.map(s => {
      if (s.id === idOrUserId || s.userId === idOrUserId) {
        return {
          ...s,
          status: 'OFFLINE' as const,
          sessionStartedAt: '-'
        };
      }
      return s;
    }));

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setAuditChangeLogs(prev => [
      {
        id: `aud-chg-${Date.now()}`,
        timestamp: `${now} WIB`,
        userId: 'USR-ADMIN-01',
        userName: 'Yoseph Sanjaya',
        userRole: 'Security Administrator',
        ipAddress: '10.14.88.10',
        moduleTable: 'User Session & Lockout',
        recordId: session.userId,
        actionType: 'UPDATE',
        reason: `Force Logout user ${session.username} (${session.employeeName}) secara paksa oleh Admin`,
        changes: [
          { fieldName: 'Session Status', oldValue: session.status, newValue: 'OFFLINE' }
        ]
      },
      ...prev
    ]);
  };

  const requestUnlockUser = (idOrUserId: string, reason: string) => {
    const session = userSessions.find(s => s.id === idOrUserId || s.userId === idOrUserId);
    if (!session) return;

    // Update session state
    setUserSessions(prev => prev.map(s => {
      if (s.id === idOrUserId || s.userId === idOrUserId) {
        return {
          ...s,
          unlockRequested: true,
          unlockRequestNote: reason
        };
      }
      return s;
    }));

    // Create RuleApprovalTicket for Checker review
    createRuleTicket({
      targetType: 'User Session & Lockout',
      domain: 'System',
      actionType: 'UPDATE',
      targetCode: session.userId,
      targetName: `${session.employeeName} (${session.username})`,
      makerName: 'Rina Kurniawati',
      makerRole: 'Helpdesk Support (Maker)',
      makerNotes: reason,
      changeSummary: `Permohonan Buka Blokir Akun (Unlock Account) & Reset Counter Failed Attempts (3 -> 0) untuk user ${session.userId} (${session.username}).`,
      versionFrom: 'Status: LOCKED (3/3 Failed Attempts)',
      versionTo: 'Status: UNLOCKED (0/3 Failed Attempts)',
      previousData: { userId: session.userId, username: session.username, status: 'LOCKED', failedAttempts: session.failedAttempts },
      proposedData: { userId: session.userId, username: session.username, status: 'OFFLINE', failedAttempts: 0 }
    });
  };

  // Audit Trail Handlers
  const addAuditSystemLog = (logData: Omit<AuditSystemLog, 'id' | 'dateTime'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: AuditSystemLog = {
      ...logData,
      id: `ERR-${Date.now().toString().slice(-4)}`,
      dateTime: now
    };
    setAuditSystemLogs(prev => [newLog, ...prev]);
  };

  const clearAuditSystemLogs = () => {
    setAuditSystemLogs([]);
  };

  const addAuditChangeLog = (changeData: Omit<AuditChangeLog, 'id' | 'timestamp'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: AuditChangeLog = {
      ...changeData,
      id: `CHG-${Date.now().toString().slice(-4)}`,
      timestamp: now
    };
    setAuditChangeLogs(prev => [newLog, ...prev]);
  };

  const addAuditUserLogin = (loginData: Omit<AuditUserLogin, 'id' | 'timestamp'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: AuditUserLogin = {
      ...loginData,
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: now
    };
    setAuditUserLogins(prev => [newLog, ...prev]);
  };

  const addAuditUserAccess = (accessData: Omit<AuditUserAccess, 'id' | 'timestamp'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: AuditUserAccess = {
      ...accessData,
      id: `ACS-${Date.now().toString().slice(-4)}`,
      timestamp: now
    };
    setAuditUserAccesses(prev => [newLog, ...prev]);
  };

  const addAuditMailLog = (mailData: Omit<AuditMailLog, 'id' | 'timestamp'>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog: AuditMailLog = {
      ...mailData,
      id: `MAIL-${Date.now().toString().slice(-4)}`,
      timestamp: now
    };
    setAuditMailLogs(prev => [newLog, ...prev]);
  };

  // Access Menu Permissions Handler
  const saveRoleMenuPermissions = (
    roleName: string, 
    permissions: Record<string, MenuPermissions>, 
    lockStatus?: boolean
  ) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setRoleMenuMatrices(prev => {
      const base = prev[roleName] || {
        roleId: `GRP-${Date.now().toString().slice(-3)}`,
        roleName,
        description: `Role permissions for ${roleName}`,
        permissions: {},
      };
      const isCurrentlyLocked = lockStatus !== undefined ? lockStatus : !!base.isLocked;
      const updated: Record<string, RoleMenuAccessMatrix> = {
        ...prev,
        [roleName]: {
          ...base,
          permissions,
          lastUpdated: now,
          updatedBy: 'yoseph.sanjaya',
          isLocked: isCurrentlyLocked,
          lockedBy: isCurrentlyLocked ? (base.lockedBy || 'yoseph.sanjaya (Security Administrator)') : undefined,
          lockedAt: isCurrentlyLocked ? (base.lockedAt || now) : undefined,
          version: '1.14'
        }
      };
      try {
        localStorage.setItem('FMS_ROLE_MENU_MATRICES', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save matrices to localStorage', e);
      }
      return updated;
    });

    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Security Administrator',
      ipAddress: '10.10.20.101',
      moduleTable: 'SYS_ROLE_MENU_ACCESS',
      recordId: roleName,
      actionType: lockStatus ? 'LOCK' : 'UPDATE',
      reason: `Pembaruan & ${lockStatus ? 'Penguncian (Lock)' : 'Penyimpanan'} konfigurasi Access Menu Management v1.14 untuk role: ${roleName}`,
      changes: [
        {
          fieldName: 'MenuPermissionsMatrix',
          oldValue: `Prior matrix permissions for ${roleName}`,
          newValue: `Updated permissions with ${Object.keys(permissions).length} menu nodes`
        },
        {
          fieldName: 'Version',
          oldValue: '1.13',
          newValue: '1.14'
        },
        ...(lockStatus !== undefined ? [{
          fieldName: 'isLocked',
          oldValue: 'false',
          newValue: lockStatus.toString()
        }] : [])
      ]
    });

    addAuditUserAccess({
      userId: 'USR-00101',
      username: 'yoseph.sanjaya',
      role: 'Security Administrator',
      accessedMenu: '/system-parameter/access-menu',
      actionTaken: lockStatus ? 'Lock' : 'Update',
      ipAddress: '10.10.20.101',
      details: `Simpan ${lockStatus ? '& Kunci (Lock)' : ''} konfigurasi hak akses menu v1.14 untuk role ${roleName}`
    });
  };

  const toggleLockRoleMenuMatrix = (roleName: string, shouldLock: boolean) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setRoleMenuMatrices(prev => {
      const current = prev[roleName];
      if (!current) return prev;
      const updated: Record<string, RoleMenuAccessMatrix> = {
        ...prev,
        [roleName]: {
          ...current,
          isLocked: shouldLock,
          lockedBy: shouldLock ? 'yoseph.sanjaya (Security Administrator)' : undefined,
          lockedAt: shouldLock ? now : undefined,
          lastUpdated: now,
          updatedBy: 'yoseph.sanjaya',
          version: '1.14'
        }
      };
      try {
        localStorage.setItem('FMS_ROLE_MENU_MATRICES', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save matrices to localStorage', e);
      }
      return updated;
    });

    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Security Administrator',
      ipAddress: '10.10.20.101',
      moduleTable: 'SYS_ROLE_MENU_ACCESS',
      recordId: roleName,
      actionType: shouldLock ? 'LOCK' : 'UNLOCK',
      reason: `${shouldLock ? 'Kunci (Lock)' : 'Buka Kunci (Unlock)'} matriks hak akses menu v1.14 untuk role: ${roleName}`,
      changes: [
        {
          fieldName: 'isLocked',
          oldValue: (!shouldLock).toString(),
          newValue: shouldLock.toString()
        },
        {
          fieldName: 'version',
          oldValue: '1.13',
          newValue: '1.14'
        }
      ]
    });

    addAuditUserAccess({
      userId: 'USR-00101',
      username: 'yoseph.sanjaya',
      role: 'Security Administrator',
      accessedMenu: '/system-parameter/access-menu',
      actionTaken: shouldLock ? 'Lock' : 'Unlock',
      ipAddress: '10.10.20.101',
      details: `${shouldLock ? 'Mengunci (Lock)' : 'Membuka kunci (Unlock)'} hak akses menu v1.14 untuk role ${roleName}`
    });
  };

  const resetRoleMenuPermissions = (roleName: string) => {
    const defaults = generateInitialMatrices();
    if (defaults[roleName]) {
      saveRoleMenuPermissions(roleName, defaults[roleName].permissions, defaults[roleName].isLocked);
    }
  };

  const updateApplicationParameters = (
    section: 'email' | 'login' | 'message' | 'integration' | 'all',
    updates: any,
    reason: string = 'Update parameter konfigurasi sistem FMS v1.14'
  ) => {
    setApplicationParameters(prev => {
      let next: ApplicationParameters;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      if (section === 'all') {
        next = { ...prev, ...updates, lastUpdated: now, updatedBy: 'yoseph.sanjaya' };
      } else {
        next = {
          ...prev,
          [section]: { ...prev[section], ...updates },
          lastUpdated: now,
          updatedBy: 'yoseph.sanjaya'
        };
      }

      // Generate changes diff for Audit Trail Changes
      const changedFields: { fieldName: string; oldValue: string; newValue: string }[] = [];
      if (section === 'all') {
        changedFields.push({
          fieldName: 'configuration_bundle',
          oldValue: `v${prev.version} bundle`,
          newValue: `v${next.version} bundle updated`
        });
      } else {
        const oldSection = prev[section];
        Object.keys(updates).forEach(key => {
          const oldVal = String((oldSection as any)[key]);
          const newVal = String(updates[key]);
          if (oldVal !== newVal) {
            changedFields.push({
              fieldName: `${section}.${key}`,
              oldValue: key.toLowerCase().includes('password') ? '********' : oldVal,
              newValue: key.toLowerCase().includes('password') ? '********' : newVal
            });
          }
        });
      }

      if (changedFields.length > 0) {
        addAuditChangeLog({
          userId: 'USR-00101',
          userName: 'yoseph.sanjaya',
          userRole: 'Security Administrator',
          ipAddress: '10.10.20.101',
          moduleTable: 'SYS_PARAM_APPLICATION',
          recordId: `PARAM-${section.toUpperCase()}`,
          actionType: 'UPDATE',
          reason: reason || `Pembaruan parameter bagian ${section.toUpperCase()} oleh Security Administrator`,
          changes: changedFields
        });
      }

      addAuditUserAccess({
        userId: 'USR-00101',
        username: 'yoseph.sanjaya',
        role: 'Security Administrator',
        accessedMenu: '/system-parameter/application-parameter',
        actionTaken: 'Update',
        ipAddress: '10.10.20.101',
        details: `Simpan konfigurasi parameter ${section.toUpperCase()} (FMS v1.14)`
      });

      return next;
    });
  };

  const resetApplicationParameters = () => {
    setApplicationParameters(INITIAL_APPLICATION_PARAMETERS);
  };

  const updateUserDefinedParameters = (
    updates: Partial<UserDefinedParameterConfig>,
    reason: string = 'Update User Defined Parameter (UDP) v1.14'
  ) => {
    setUserDefinedParameters(prev => {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const next = {
        ...prev,
        ...updates,
        lastUpdated: now,
        updatedBy: 'yoseph.sanjaya'
      };

      // Generate diff for Audit Trail Changes
      const changedFields: { fieldName: string; oldValue: string; newValue: string }[] = [];
      Object.keys(updates).forEach(key => {
        const oldVal = String((prev as any)[key]);
        const newVal = String((updates as any)[key]);
        if (oldVal !== newVal) {
          changedFields.push({
            fieldName: `UDP.${key}`,
            oldValue: oldVal,
            newValue: newVal
          });
        }
      });

      if (changedFields.length > 0) {
        addAuditChangeLog({
          userId: 'USR-00101',
          userName: 'yoseph.sanjaya',
          userRole: 'Security Administrator',
          ipAddress: '10.10.20.101',
          moduleTable: 'SYS_PARAM_UDP',
          recordId: 'PARAM-UDP-CONFIG',
          actionType: 'UPDATE',
          reason: reason || 'Pembaruan konfigurasi User Defined Parameter (UDP) oleh Security Administrator',
          changes: changedFields
        });
      }

      addAuditUserAccess({
        userId: 'USR-00101',
        username: 'yoseph.sanjaya',
        role: 'Security Administrator',
        accessedMenu: '/system-parameter/user-defined-parameter',
        actionTaken: 'Update',
        ipAddress: '10.10.20.101',
        details: 'Simpan konfigurasi User Defined Parameter (UDP)'
      });

      return next;
    });

    // Also sync to flat table items
    setUserDefinedParameterItems(prevItems => {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      return prevItems.map(item => {
        if (item.parameterKey === 'FMS_SCHEDULER_JOB_TYPE_QUEUE' && updates.jobTypeQueue !== undefined) {
          return { ...item, parameterValue: updates.jobTypeQueue, isActive: updates.jobTypeQueueActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'EMAIL_TO_FMS_ERROR' && updates.emailToFmsError !== undefined) {
          return { ...item, parameterValue: updates.emailToFmsError, isActive: updates.emailRoutingActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'EMAIL_CC_FMS_ERROR' && updates.emailCcFmsError !== undefined) {
          return { ...item, parameterValue: updates.emailCcFmsError, isActive: updates.emailRoutingActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'EMAIL_TO_AML' && updates.emailToAml !== undefined) {
          return { ...item, parameterValue: updates.emailToAml, isActive: updates.emailRoutingActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'EMAIL_TO_FRAUD' && updates.emailToFraud !== undefined) {
          return { ...item, parameterValue: updates.emailToFraud, isActive: updates.emailRoutingActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'LIMIT_QUEUE_ON_THREAD' && updates.limitQueueOnThread !== undefined) {
          return { ...item, parameterValue: String(updates.limitQueueOnThread), isActive: updates.limitQueueOnThreadActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'MAX_LIMIT_QUEUE_ON_MEMORY' && updates.maximumLimitQueueOnMemory !== undefined) {
          return { ...item, parameterValue: String(updates.maximumLimitQueueOnMemory), isActive: updates.maximumLimitQueueOnMemoryActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'MAX_ROW_JOB_SINGLE_INTO_QUEUE' && updates.maxRowJobSingleGetIntoQueueMemory !== undefined) {
          return { ...item, parameterValue: String(updates.maxRowJobSingleGetIntoQueueMemory), isActive: updates.maxRowJobSingleGetIntoQueueMemoryActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'MAX_ROW_JOB_BATCH_INTO_QUEUE' && updates.maxRowJobBatchGetIntoQueueMemory !== undefined) {
          return { ...item, parameterValue: String(updates.maxRowJobBatchGetIntoQueueMemory), isActive: updates.maxRowJobBatchGetIntoQueueMemoryActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'DELAY_AT_START_QUEUE' && updates.delayAtStartQueue !== undefined) {
          return { ...item, parameterValue: String(updates.delayAtStartQueue), isActive: updates.delayAtStartQueueActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'DELAY_AT_FINISH_QUEUE' && updates.delayAtFinishQueue !== undefined) {
          return { ...item, parameterValue: String(updates.delayAtFinishQueue), isActive: updates.delayAtFinishQueueActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'DELAY_RETRY_SCHEDULER_MINUTE' && updates.delayRetrySchedulerJobServiceMinute !== undefined) {
          return { ...item, parameterValue: String(updates.delayRetrySchedulerJobServiceMinute), isActive: updates.delayRetrySchedulerJobServiceMinuteActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'RETRY_FROM_MINUTE' && updates.retryFromMinute !== undefined) {
          return { ...item, parameterValue: String(updates.retryFromMinute), isActive: updates.retryFromMinuteActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'DELAY_INSERT_TRIGGER_SECOND' && updates.delayInsertTriggerSchedulerProcessSecond !== undefined) {
          return { ...item, parameterValue: String(updates.delayInsertTriggerSchedulerProcessSecond), isActive: updates.delayInsertTriggerSchedulerProcessSecondActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'RULE_BLACKLIST_AML' && updates.ruleBlacklistAml !== undefined) {
          return { ...item, parameterValue: updates.ruleBlacklistAml, isActive: updates.ruleBlacklistAmlActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'ON_OFF_EOD_LOG' && updates.onOffEodLog !== undefined) {
          return { ...item, parameterValue: updates.onOffEodLog ? '1' : '0', isActive: updates.onOffEodLogActive ?? item.isActive, updatedDate: now };
        }
        if (item.parameterKey === 'CONCURRENT_JOB_BATCH_HANDLER' && updates.concurrentJobBatchHandler !== undefined) {
          return { ...item, parameterValue: String(updates.concurrentJobBatchHandler), isActive: updates.concurrentJobBatchHandlerActive ?? item.isActive, updatedDate: now };
        }
        return item;
      });
    });
  };

  const updateUserDefinedParameterItem = (id: string, updates: Partial<UserDefinedParameterItem>) => {
    setUserDefinedParameterItems(prevItems => {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const updated = prevItems.map(item => {
        if (item.id === id) {
          const newItem = { ...item, ...updates, updatedDate: now, updatedBy: 'yoseph.sanjaya' };
          
          addAuditChangeLog({
            userId: 'USR-00101',
            userName: 'yoseph.sanjaya',
            userRole: 'Security Administrator',
            ipAddress: '10.10.20.101',
            moduleTable: 'SYS_PARAM_UDP_ITEM',
            recordId: item.parameterKey,
            actionType: 'UPDATE',
            reason: `Pembaruan item ${item.parameterName} pada tabel dinamis UDP`,
            changes: [
              {
                fieldName: 'parameterValue',
                oldValue: item.parameterValue,
                newValue: updates.parameterValue !== undefined ? updates.parameterValue : item.parameterValue
              },
              {
                fieldName: 'isActive',
                oldValue: String(item.isActive),
                newValue: updates.isActive !== undefined ? String(updates.isActive) : String(item.isActive)
              }
            ]
          });

          return newItem;
        }
        return item;
      });

      return updated;
    });
  };

  const resetUserDefinedParameters = () => {
    setUserDefinedParameters(INITIAL_USER_DEFINED_PARAMETERS);
    setUserDefinedParameterItems(INITIAL_UDP_ITEMS);
  };

  // =========================================================
  // PROCESS MANAGEMENT HANDLERS (TASK, LIST PROCESS, EXECUTION)
  // =========================================================
  const addProcessTask = (taskData: Omit<ProcessTask, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): ProcessTask => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const nextNum = processTasks.length + 1;
    const newId = `TSK-${String(nextNum).padStart(3, '0')}`;
    const newTask: ProcessTask = {
      ...taskData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      createdBy: 'yoseph.sanjaya'
    };

    setProcessTasks(prev => [newTask, ...prev]);

    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      moduleTable: 'PROCESS_TASK',
      recordId: newId,
      actionType: 'INSERT',
      reason: `Penambahan Task Process baru: ${taskData.taskName}`,
      changes: [
        { fieldName: 'taskName', oldValue: '-', newValue: taskData.taskName },
        { fieldName: 'detailsCount', oldValue: '0', newValue: String(taskData.details.length) }
      ]
    });

    return newTask;
  };

  const updateProcessTask = (id: string, updates: Partial<ProcessTask>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setProcessTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates, updatedAt: now };
        addAuditChangeLog({
          userId: 'USR-00101',
          userName: 'yoseph.sanjaya',
          userRole: 'Senior Fraud Lead',
          ipAddress: '10.10.20.101',
          moduleTable: 'PROCESS_TASK',
          recordId: id,
          actionType: 'UPDATE',
          reason: `Pembaruan Task Process: ${t.taskName}`,
          changes: [
            { fieldName: 'updatedAt', oldValue: t.updatedAt, newValue: now }
          ]
        });
        return updated;
      }
      return t;
    }));
  };

  const deleteProcessTask = (id: string) => {
    const target = processTasks.find(t => t.id === id);
    if (!target) return;
    setProcessTasks(prev => prev.filter(t => t.id !== id));
    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      moduleTable: 'PROCESS_TASK',
      recordId: id,
      actionType: 'DELETE',
      reason: `Penghapusan Task Process: ${target.taskName}`,
      changes: [{ fieldName: 'status', oldValue: 'EXISTING', newValue: 'DELETED' }]
    });
  };

  const toggleProcessTaskStatus = (id: string) => {
    setProcessTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = !t.isActive;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        addAuditChangeLog({
          userId: 'USR-00101',
          userName: 'yoseph.sanjaya',
          userRole: 'Senior Fraud Lead',
          ipAddress: '10.10.20.101',
          moduleTable: 'PROCESS_TASK',
          recordId: id,
          actionType: 'UPDATE',
          reason: `Ubah status aktif Task ${t.taskName} menjadi ${newStatus ? 'ACTIVE' : 'INACTIVE'}`,
          changes: [{ fieldName: 'isActive', oldValue: String(t.isActive), newValue: String(newStatus) }]
        });
        return { ...t, isActive: newStatus, updatedAt: now };
      }
      return t;
    }));
  };

  const addProcessItem = (itemData: Omit<ProcessItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): ProcessItem => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const nextNum = processList.length + 1;
    const newId = `PRC-PROC-${String(nextNum).padStart(3, '0')}`;
    const newItem: ProcessItem = {
      ...itemData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      createdBy: 'yoseph.sanjaya'
    };

    setProcessList(prev => [newItem, ...prev]);

    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      moduleTable: 'PROCESS_LIST',
      recordId: newId,
      actionType: 'INSERT',
      reason: `Penambahan List Process baru: ${itemData.processName}`,
      changes: [
        { fieldName: 'processName', oldValue: '-', newValue: itemData.processName },
        { fieldName: 'hasScheduler', oldValue: '-', newValue: String(itemData.hasPeriodicalScheduler) }
      ]
    });

    return newItem;
  };

  const updateProcessItem = (id: string, updates: Partial<ProcessItem>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setProcessList(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates, updatedAt: now };
        addAuditChangeLog({
          userId: 'USR-00101',
          userName: 'yoseph.sanjaya',
          userRole: 'Senior Fraud Lead',
          ipAddress: '10.10.20.101',
          moduleTable: 'PROCESS_LIST',
          recordId: id,
          actionType: 'UPDATE',
          reason: `Pembaruan Process: ${p.processName}`,
          changes: [
            { fieldName: 'updatedAt', oldValue: p.updatedAt, newValue: now }
          ]
        });
        return updated;
      }
      return p;
    }));
  };

  const deleteProcessItem = (id: string) => {
    const target = processList.find(p => p.id === id);
    if (!target) return;
    setProcessList(prev => prev.filter(p => p.id !== id));
    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      moduleTable: 'PROCESS_LIST',
      recordId: id,
      actionType: 'DELETE',
      reason: `Penghapusan Process: ${target.processName}`,
      changes: [{ fieldName: 'status', oldValue: 'EXISTING', newValue: 'DELETED' }]
    });
  };

  const toggleProcessItemStatus = (id: string) => {
    setProcessList(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = !p.isActive;
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        addAuditChangeLog({
          userId: 'USR-00101',
          userName: 'yoseph.sanjaya',
          userRole: 'Senior Fraud Lead',
          ipAddress: '10.10.20.101',
          moduleTable: 'PROCESS_LIST',
          recordId: id,
          actionType: 'UPDATE',
          reason: `Ubah status aktif Process ${p.processName} menjadi ${newStatus ? 'ACTIVE' : 'INACTIVE'}`,
          changes: [{ fieldName: 'isActive', oldValue: String(p.isActive), newValue: String(newStatus) }]
        });
        return { ...p, isActive: newStatus, updatedAt: now };
      }
      return p;
    }));
  };

  const triggerManualExecution = (params: {
    type: 'Process' | 'Task';
    targetId: string;
    executionDate?: string;
    remarks?: string;
  }): ProcessExecutionLog => {
    const now = new Date();
    const startTimeStr = now.toISOString().replace('T', ' ').slice(0, 19);
    const dateStr = params.executionDate || startTimeStr.slice(0, 10);
    const execId = `EXE-${dateStr.replace(/-/g, '')}-${String(processExecutions.length + 1).padStart(3, '0')}`;

    let name = '';
    let steps: ExecutionLogDetailStep[] = [];

    if (params.type === 'Process') {
      const proc = processList.find(p => p.id === params.targetId);
      name = proc ? `${proc.processName} [${proc.id}]` : `Process ${params.targetId}`;
      if (proc && proc.sequenceTasks.length > 0) {
        let stepIdx = 1;
        proc.sequenceTasks.forEach(st => {
          const taskObj = processTasks.find(t => t.id === st.taskId);
          if (taskObj && taskObj.details.length > 0) {
            taskObj.details.forEach(td => {
              steps.push({
                stepNo: stepIdx++,
                stepName: td.spOrSsisFileName,
                stepType: td.taskDetailType,
                status: 'Pending',
                outputLog: td.description
              });
            });
          } else {
            steps.push({
              stepNo: stepIdx++,
              stepName: st.taskName,
              stepType: 'Store Procedure',
              status: 'Pending',
              outputLog: `Running sequence task ${st.taskName}`
            });
          }
        });
      }
    } else {
      const task = processTasks.find(t => t.id === params.targetId);
      name = task ? `${task.taskName} [${task.id}]` : `Task ${params.targetId}`;
      if (task && task.details.length > 0) {
        task.details.forEach((td, idx) => {
          steps.push({
            stepNo: idx + 1,
            stepName: td.spOrSsisFileName,
            stepType: td.taskDetailType,
            status: 'Pending',
            outputLog: td.description
          });
        });
      }
    }

    if (steps.length === 0) {
      steps = [
        {
          stepNo: 1,
          stepName: 'sp_manual_engine_worker',
          stepType: 'Store Procedure',
          status: 'Pending',
          outputLog: 'Initial engine execution worker'
        }
      ];
    }

    const newLog: ProcessExecutionLog = {
      id: execId,
      type: params.type,
      targetId: params.targetId,
      name,
      triggeredBy: 'yoseph.sanjaya (Senior Fraud Lead)',
      triggerMode: 'Manual',
      executionDate: dateStr,
      startTime: startTimeStr,
      duration: '00:00:04',
      status: 'Running',
      remarks: params.remarks || 'Manual on-demand execution triggered via Process Control Panel.',
      totalSteps: steps.length,
      completedSteps: 0,
      steps,
      logs: [
        `[${startTimeStr.slice(11)}] Manual trigger initiated by yoseph.sanjaya. Target: ${name}`,
        `[${startTimeStr.slice(11)}] Execution parameter date: ${dateStr}`,
        `[${startTimeStr.slice(11)}] Initializing connection to SQL Server FMS Engine Core...`
      ],
      databaseTarget: 'SQL_SRV_FMS_PROD (10.10.20.15)'
    };

    setProcessExecutions(prev => [newLog, ...prev]);

    // Log to Audit User Access
    addAuditUserAccess({
      userId: 'USR-00101',
      username: 'yoseph.sanjaya',
      role: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      accessedMenu: 'Process > Manual Execution',
      actionTaken: 'Execute',
      details: `Trigger eksekusi manual untuk ${name} (ID: ${execId})`
    });

    // Simulate completion after 3.5 seconds
    setTimeout(() => {
      setProcessExecutions(prev => prev.map(item => {
        if (item.id === execId && item.status === 'Running') {
          const endNow = new Date();
          const endTimeStr = endNow.toISOString().replace('T', ' ').slice(0, 19);
          const finishedSteps = item.steps.map(s => ({
            ...s,
            status: 'Success' as const,
            duration: '00:00:02',
            rowsAffected: Math.floor(Math.random() * 850) + 120
          }));
          return {
            ...item,
            status: 'Success',
            endTime: endTimeStr,
            duration: '00:00:04',
            completedSteps: item.totalSteps,
            steps: finishedSteps,
            logs: [
              ...item.logs,
              `[${endTimeStr.slice(11)}] All ${item.totalSteps} steps completed successfully.`,
              `[${endTimeStr.slice(11)}] Output stream verified. Rows processed without errors. Return Code: 0 (SUCCESS).`
            ]
          };
        }
        return item;
      }));
    }, 3500);

    return newLog;
  };

  const terminateExecution = (id: string) => {
    setProcessExecutions(prev => prev.map(item => {
      if (item.id === id && item.status === 'Running') {
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
        return {
          ...item,
          status: 'Cancelled',
          endTime: now,
          logs: [
            ...item.logs,
            `[${now.slice(11)}] Execution manually terminated / cancelled by user yoseph.sanjaya.`
          ]
        };
      }
      return item;
    }));
  };

  // ==========================================
  // AML MASTER BLACKLIST HANDLERS & AUDIT TRAIL
  // ==========================================
  const addAmlBlacklistEntry = (entry: Omit<AmlMasterBlacklistEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): AmlMasterBlacklistEntry => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const nextNum = amlBlacklistEntries.length + 1;
    const newId = `AML-BL-${String(nextNum).padStart(3, '0')}`;
    const newEntry: AmlMasterBlacklistEntry = {
      ...entry,
      id: newId,
      createdAt: now,
      updatedAt: now,
      createdBy: 'yoseph.sanjaya@banksampoerna.com'
    };

    setAmlBlacklistEntries(prev => [newEntry, ...prev]);

    // Audit Trail Change Log
    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      moduleTable: 'AML_MASTER_BLACKLIST',
      recordId: newId,
      actionType: 'INSERT',
      reason: `Penambahan Record AML Blacklist: ${entry.nama} (${entry.type})`,
      changes: [
        { fieldName: 'type', oldValue: '-', newValue: entry.type },
        { fieldName: 'nama', oldValue: '-', newValue: entry.nama },
        { fieldName: 'referensi', oldValue: '-', newValue: entry.referensi },
        { fieldName: 'status', oldValue: '-', newValue: entry.status }
      ]
    });

    return newEntry;
  };

  const updateAmlBlacklistEntry = (id: string, updates: Partial<AmlMasterBlacklistEntry>) => {
    const target = amlBlacklistEntries.find(e => e.id === id);
    if (!target) return;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const changesList = Object.keys(updates).map(k => ({
      fieldName: k,
      oldValue: String((target as any)[k] ?? '-'),
      newValue: String((updates as any)[k] ?? '-')
    }));

    setAmlBlacklistEntries(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          updatedAt: now,
          updatedBy: 'yoseph.sanjaya@banksampoerna.com'
        };
      }
      return item;
    }));

    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      moduleTable: 'AML_MASTER_BLACKLIST',
      recordId: id,
      actionType: 'UPDATE',
      reason: `Perubahan data AML Blacklist: ${target.nama}`,
      changes: changesList.length > 0 ? changesList : [{ fieldName: 'record', oldValue: 'MODIFIED', newValue: 'UPDATED' }]
    });
  };

  const deleteAmlBlacklistEntry = (id: string) => {
    const target = amlBlacklistEntries.find(e => e.id === id);
    if (!target) return;
    setAmlBlacklistEntries(prev => prev.filter(e => e.id !== id));

    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      moduleTable: 'AML_MASTER_BLACKLIST',
      recordId: id,
      actionType: 'DELETE',
      reason: `Penghapusan data AML Blacklist: ${target.nama} (${target.type})`,
      changes: [{ fieldName: 'status', oldValue: target.status, newValue: 'DELETED' }]
    });
  };

  const toggleAmlBlacklistStatus = (id: string) => {
    const target = amlBlacklistEntries.find(e => e.id === id);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    setAmlBlacklistEntries(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          updatedAt: now,
          updatedBy: 'yoseph.sanjaya@banksampoerna.com'
        };
      }
      return item;
    }));

    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      moduleTable: 'AML_MASTER_BLACKLIST',
      recordId: id,
      actionType: 'UPDATE',
      reason: `Ubah status AML Blacklist ${target.nama} menjadi ${newStatus}`,
      changes: [{ fieldName: 'status', oldValue: target.status, newValue: newStatus }]
    });
  };

  const bulkImportAmlBlacklist = (entries: Array<Omit<AmlMasterBlacklistEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let startIdx = amlBlacklistEntries.length + 1;
    const createdList: AmlMasterBlacklistEntry[] = entries.map(entry => {
      const newId = `AML-BL-${String(startIdx++).padStart(3, '0')}`;
      return {
        ...entry,
        id: newId,
        createdAt: now,
        updatedAt: now,
        createdBy: 'yoseph.sanjaya@banksampoerna.com'
      };
    });

    setAmlBlacklistEntries(prev => [...createdList, ...prev]);

    addAuditChangeLog({
      userId: 'USR-00101',
      userName: 'yoseph.sanjaya',
      userRole: 'Senior Fraud Lead',
      ipAddress: '10.10.20.101',
      moduleTable: 'AML_MASTER_BLACKLIST',
      recordId: `BULK-${Date.now()}`,
      actionType: 'INSERT',
      reason: `Bulk Import ${entries.length} data entitas AML Blacklist`,
      changes: [{ fieldName: 'bulkCount', oldValue: '0', newValue: String(entries.length) }]
    });

    return { addedCount: entries.length };
  };

  // Section B.2: AML CIF Grouping
  // Agregasi Data: Tampilan tabel dikelompokkan (grouped) berdasarkan CIF.
  // Jika 1 CIF melanggar 3 rule berbeda, data ditampilkan dalam 1 baris entitas CIF.
  const amlGroups = useMemo<AmlCifGroup[]>(() => {
    // Include both AML category cases and cases sharing CIFs
    const amlCases = fraudCases.filter(c => c.alertCategory === 'AML' || c.cif === 'CIF8829103');
    const groupMap = new Map<string, FraudCase[]>();

    amlCases.forEach(c => {
      const existing = groupMap.get(c.cif) || [];
      existing.push(c);
      groupMap.set(c.cif, existing);
    });

    const groups: AmlCifGroup[] = [];
    groupMap.forEach((cases, cif) => {
      const first = cases[0];
      const maxScore = Math.max(...cases.map(c => c.finalRiskScore));
      
      // Determine highest urgency
      let highestUrgency: CaseUrgency = 'Low';
      if (cases.some(c => c.caseUrgency === 'High')) highestUrgency = 'High';
      else if (cases.some(c => c.caseUrgency === 'Med')) highestUrgency = 'Med';

      const uniqueRules = Array.from(
        new Map(cases.map(c => [c.ruleBasicCode, { code: c.ruleBasicCode, name: c.ruleName, score: c.finalRiskScore }])).values()
      );

      const uniqueAssignees = Array.from(new Set(cases.map(c => c.assignee)));

      // Calculate max aging for AML group
      const agingValues = cases.map(c => {
        const val = parseInt(c.aging || '0');
        return isNaN(val) ? 0 : val;
      });
      const maxAging = Math.max(...agingValues);

      let overallStatus: AlertStatus = 'Open';
      if (cases.every(c => c.alertStatus === 'Close')) overallStatus = 'Close';
      else if (cases.some(c => c.alertStatus === 'Pending Approval')) overallStatus = 'Pending Approval';
      else if (cases.some(c => c.alertStatus === 'Draft')) overallStatus = 'Draft';

      // Aggregation evaluation for parent CIF:
      // - If all child alert/rules under this CIF are Closed -> 'Closed' (Green badge)
      // - If only partial child alert/rules are Closed -> 'Partial Closed' (Blue badge)
      // - If any child alert is On Check, Pending Approval, or Draft -> 'On Check' (Orange badge)
      // - Otherwise -> 'Opened' (Indigo badge)
      const totalCasesCount = cases.length;
      const closedCasesCount = cases.filter(c => 
        c.alertStatus === 'Close' || c.investigationStatus === 'Closed' || c.investigationStatus === 'Done'
      ).length;

      let investigationStatus: InvestigationStatus = 'Opened';
      if (cifStatusOverrides[cif]) {
        investigationStatus = cifStatusOverrides[cif];
      } else if (totalCasesCount > 0 && closedCasesCount === totalCasesCount) {
        investigationStatus = 'Closed';
      } else if (closedCasesCount > 0) {
        investigationStatus = 'Partial Closed';
      } else if (cases.some(c => c.investigationStatus === 'On Check' || c.alertStatus === 'Pending Approval' || c.alertStatus === 'Draft')) {
        investigationStatus = 'On Check';
      } else {
        investigationStatus = 'Opened';
      }

      if (investigationStatus === 'Closed') {
        overallStatus = 'Close';
      }

      const batchId = (first as any).batchId || `BATCH-20260825-${cif.replace(/[^0-9]/g, '') || '001'}`;

      groups.push({
        batchId,
        cif,
        customerName: first.customerName,
        cases,
        totalCases: cases.length,
        highestUrgency,
        maxRiskScore: maxScore,
        maxRiskLevel: calculateRiskLevelFromScore(maxScore),
        identifiedRange: `${cases[cases.length - 1].identifiedOn} - ${cases[0].identifiedOn}`,
        rulesViolated: uniqueRules,
        assignees: uniqueAssignees,
        overallStatus,
        investigationStatus,
        deviceId: first.deviceId,
        phoneNumber: first.phoneNumber,
        maxAging: `${maxAging} Days`
      });
    });

    // Default sort by Highest Urgency High first, then highest Max Risk Score
    return groups.sort((a, b) => {
      const urgencyWeight: Record<CaseUrgency, number> = { Critical: 4, High: 3, Med: 2, Low: 1 };
      const diffUrgency = urgencyWeight[b.highestUrgency] - urgencyWeight[a.highestUrgency];
      if (diffUrgency !== 0) return diffUrgency;
      return b.maxRiskScore - a.maxRiskScore;
    });
  }, [fraudCases, cifStatusOverrides]);

  // Section A: Dashboard KPI Summary Cards (4 KPI Cards: Total Case, Low Urgency, Medium Urgency, High Urgency)
  const kpiStats = useMemo(() => {
    // Calculate for fraud alerts
    const totalCases = fraudCases.length;
    const lowUrgency = fraudCases.filter(c => c.caseUrgency === 'Low').length;
    const medUrgency = fraudCases.filter(c => c.caseUrgency === 'Med').length;
    const highUrgency = fraudCases.filter(c => c.caseUrgency === 'High').length;
    
    const openAlerts = fraudCases.filter(c => c.alertStatus === 'Open').length;
    const onCheckAlerts = fraudCases.filter(c => c.investigationStatus === 'On Check').length;
    const pendingApproval = fraudCases.filter(c => c.alertStatus === 'Pending Approval').length;
    const closedAlerts = fraudCases.filter(c => c.alertStatus === 'Close').length;

    return {
      totalCases,
      lowUrgency,
      medUrgency,
      highUrgency,
      openAlerts,
      onCheckAlerts,
      pendingApproval,
      closedAlerts
    };
  }, [fraudCases]);

  return (
    <FMSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        userRole,
        setUserRole,
        fraudCases,
        ruleTemplates,
        ruleBasics,
        formulaRisks,
        listEntries,
        backtestSessions,
        selectedCaseForDetail,
        setSelectedCaseForDetail,
        selectedCaseForFollowUp,
        setSelectedCaseForFollowUp,
        selectedCaseForApproval,
        setSelectedCaseForApproval,
        selectedAmlGroupForDetail,
        setSelectedAmlGroupForDetail,
        selectedAmlGroupForFollowUp,
        setSelectedAmlGroupForFollowUp,
        handleOpenDetail,
        handleOpenFollowUp,
        handleOpenApproval,
        handleSaveDraftFollowUp,
        handleSubmitFollowUp,
        handleApproveCase,
        handleRejectCase,
        updateCifStatus,
        updateInvestigationHistoryItem,
        handleSaveFollowUp,
        handleBatchAction,
        handleOpenBatchFollowUp,
        handleBatchFollowUpSubmit,
        handleBatchFollowUpSaveDraft,
        createManualAlert,
        createRuleTemplate,
        updateRuleTemplate,
        deleteRuleTemplate,
        createRuleBasic,
        updateRuleBasic,
        syncRuleBasic,
        deleteRuleBasic,
        ruleApprovalTickets,
        createRuleTicket,
        approveRuleTicket,
        rejectRuleTicket,
        getPendingRuleApprovalCount,
        createFormulaRisk,
        updateFormulaRisk,
        deleteFormulaRisk,
        createListEntry,
        updateListEntry,
        deleteListEntry,
        bulkImportListEntries,
        externalBlacklistEntries,
        createExternalBlacklistEntry,
        updateExternalBlacklistEntry,
        deleteExternalBlacklistEntry,
        bulkImportExternalBlacklist,
        checkCifMatch,
        runBacktestSimulation,
        promoteRuleAfterTest,
        shiftSchedules,
        shiftHandovers,
        investigators,
        shiftDefinitions: SHIFT_DEFINITIONS,
        activeShiftDef,
        onDutyInvestigators,
        addShiftSchedule,
        updateShiftSchedule,
        deleteShiftSchedule,
        bulkAssignShift,
        createShiftHandover,
        acknowledgeShiftHandover,
        getInvestigatorDutyStatus,
        autoRecommendAssignee,
        amlGroups,
        kpiStats,
        activeListType,
        setActiveListType,
        activeListCategory,
        setActiveListCategory,
        ruleTemplateDomain,
        setRuleTemplateDomain,
        ruleBasicDomain,
        setRuleBasicDomain,
        blacklistDomain,
        setBlacklistDomain,
        systemUsers,
        systemGroups,
        systemRoles,
        addSystemUser,
        updateSystemUser,
        deleteSystemUser,
        addSystemGroup,
        updateSystemGroup,
        deleteSystemGroup,
        addSystemRole,
        updateSystemRole,
        deleteSystemRole,
        emailTemplates,
        addEmailTemplate,
        updateEmailTemplate,
        deleteEmailTemplate,
        toggleEmailTemplateStatus,
        watchlistLocations,
        createWatchlistLocation,
        updateWatchlistLocation,
        deleteWatchlistLocation,
        toggleWatchlistLocationStatus,
        resetWatchlistLocations,
        auditSystemLogs,
        auditChangeLogs,
        auditUserLogins,
        auditUserAccesses,
        auditMailLogs,
        addAuditSystemLog,
        clearAuditSystemLogs,
        addAuditChangeLog,
        addAuditUserLogin,
        addAuditUserAccess,
        addAuditMailLog,
        roleMenuMatrices,
        saveRoleMenuPermissions,
        toggleLockRoleMenuMatrix,
        resetRoleMenuPermissions,
        applicationParameters,
        updateApplicationParameters,
        resetApplicationParameters,
        userDefinedParameters,
        userDefinedParameterItems,
        updateUserDefinedParameters,
        updateUserDefinedParameterItem,
        resetUserDefinedParameters,
        userSessions,
        forceLogoutUser,
        requestUnlockUser,
        processTasks,
        addProcessTask,
        updateProcessTask,
        deleteProcessTask,
        toggleProcessTaskStatus,
        processList,
        addProcessItem,
        updateProcessItem,
        deleteProcessItem,
        toggleProcessItemStatus,
        processExecutions,
        triggerManualExecution,
        terminateExecution,
        amlBlacklistEntries,
        addAmlBlacklistEntry,
        updateAmlBlacklistEntry,
        deleteAmlBlacklistEntry,
        toggleAmlBlacklistStatus,
        bulkImportAmlBlacklist,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        investigationHistory,
        amlInvestigationHistory,
        addAmlCifHistoryGroup,
        resetToInitialMockData
      }}
    >
      {children}
    </FMSContext.Provider>
  );
};

export const useFMS = () => {
  const context = useContext(FMSContext);
  if (!context) {
    throw new Error('useFMS must be used within an FMSProvider');
  }
  return context;
};
