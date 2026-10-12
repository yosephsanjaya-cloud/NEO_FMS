export interface SystemUser {
  id: string;
  userId: string;
  username: string;
  fullName?: string;
  riskDomain?: 'FRAUD ONLY' | 'AML ONLY' | 'FULL ACCESS' | string;
  email: string;
  group: string;
  role: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
  updatedDate: string;
  password?: string;
  escalationPath?: string;
}

export type UserSessionStatus = 'ONLINE' | 'LOCKED' | 'OFFLINE';

export interface UserSessionRecord {
  id: string;
  userId: string;
  employeeName: string;
  username: string;
  role: string;
  group: string;
  status: UserSessionStatus;
  failedAttempts: number;
  maxAttempts: number;
  lastLoginIp: string;
  lastActivity: string;
  sessionStartedAt?: string;
  deviceInfo?: string;
  unlockRequested?: boolean;
  unlockRequestNote?: string;
}

export interface SystemGroup {
  id: string;
  groupName: string;
  description: string;
  escalationPath?: string;
  createdDate: string;
  updatedDate: string;
}

export interface SystemRole {
  id: string;
  roleName: string;
  description: string;
  domainScope?: 'FRAUD ONLY' | 'AML ONLY' | 'FULL ACCESS' | string;
  createdDate: string;
  updatedDate: string;
}

export interface EmailTableReference {
  id: string;
  tableName: string;
  tableType: string; // e.g. 'Base Alert Table', 'Customer Info', 'Transaction Log', 'Card Detail'
  queryData: string; // SQL Query / Extraction Statement
  primaryKey: string; // e.g. 'ALERT_ID', 'CIF', 'TRANSACTION_ID'
}

export interface EmailReplacerMapping {
  id: string;
  replacerTag: string; // e.g. '$Case_ID$', '$Customer_Name$', '$Transaction_Amount$'
  fieldReplacer: string; // e.g. '[TableEmailA1].[Case_ID]', '[CustomerInfo].[Full_Name]'
  description?: string;
}

export interface EmailActionExecuted {
  id: string;
  actionType: string; // e.g. 'Update Alert Flag', 'Insert Audit Log', 'Call Notification API'
  statementExecuted: string; // SQL or command statement
}

export interface EmailAttachment {
  id: string;
  reportName: string; // e.g. 'Alert_Investigation_Summary', 'Transaction_Extract'
  parameter: string; // e.g. 'Case_ID=$Case_ID$;Format=PDF'
  renderAs: 'PDF' | 'Excel' | 'CSV' | 'HTML';
}

export interface EmailTemplate {
  id: string; // e.g. 'ETPL-001'
  templateName: string; // e.g. 'A-02-g-DEV', 'Alert Distance Warning'
  monitoringDuration: string; // e.g. 'Realtime', '5 Minutes', '15 Minutes', '1 Hour', 'Daily 08:00', 'Daily 17:00'
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  excludeHoliday: boolean;
  status: 'Active' | 'Inactive';
  
  // Tab 1: Content details
  emailTo: string;
  emailCc: string;
  emailBcc: string;
  emailSubject: string;
  emailBody: string; // HTML / Rich text with variable tags

  // Tab 2: Table References
  tableReferences: EmailTableReference[];

  // Tab 3: Variable Replacer Mapping
  replacerMappings: EmailReplacerMapping[];

  // Tab 4: Actions & Attachments
  actionsExecuted: EmailActionExecuted[];
  attachments: EmailAttachment[];

  createdDate: string;
  updatedDate: string;
}

// ==========================================
// APPLICATION PARAMETERS (4 TABBED SECTIONS)
// ==========================================

export interface EmailParameterConfig {
  smtpServer: string;
  smtpPort: number;
  smtpUserId: string;
  smtpPassword: string;
  smtpSsl: boolean;
  smtpFrom: string;
  pop3Server: string;
  pop3Port: number;
  pop3UserId: string;
  pop3Password: string;
  pop3Ssl: boolean;
  isBodyHtml: boolean;
  isActive: boolean;
}

export interface LoginParameterConfig {
  checkIpAddress: boolean;
  emailTemplateModuleApproval: string; // Template ID or Name
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  passwordExpiryDays: number;
  forcePasswordChangeFirstLogin: boolean;
  isActive: boolean;
}

export interface MessageParameterConfig {
  userLoginFailBecauseDisabled: string;
  userInactiveResponseText: string;
  concurrentLoginAlert: string;
  passwordRetryExceededResponse: string;
  invalidCredentialResponse: string;
  isActive: boolean;
}

export interface BankingIntegrationConfig {
  kodeKantorPusatKonvensional: string;
  kodeKantorPusatSyariah: string;
  sandiBankPelapor: string;
  idOrganisasi: string;
  coreBankingPrimaryIp: string;
  coreBankingSecondaryIp: string;
  bypassBiAntasenaValidation: boolean;
  bypassOneReportingValidation: boolean;
  maxRowToExportErrorValidation: number;
  maxSizeXml: number; // in MB
  timeoutApiBi: number; // in seconds
  xmlrpcRequestTimeout: number; // in seconds
  isActive: boolean;
}

export interface SlaParameterConfig {
  MB_hours: number;
  OB_hours: number;
  QRIS_hours: number;
  CARD_hours: number;
  VA_days: number;
  isActive?: boolean;
}

export interface ApplicationParameters {
  email: EmailParameterConfig;
  login: LoginParameterConfig;
  message: MessageParameterConfig;
  integration: BankingIntegrationConfig;
  sla?: SlaParameterConfig;
  lastUpdated: string;
  updatedBy: string;
  version: string;
}

// ==========================================
// USER DEFINED PARAMETER (UDP)
// ==========================================

export interface UserDefinedParameterConfig {
  // Frequently Used - Top Section
  jobTypeQueue: 'Single' | 'Batch';
  jobTypeQueueActive: boolean;

  emailToFmsError: string;
  emailCcFmsError: string;
  emailToAml: string;
  emailToFraud: string;
  emailRoutingActive: boolean;

  // Tab 1: Queue & Memory Limits
  limitQueueOnThread: number;
  limitQueueOnThreadActive: boolean;
  maximumLimitQueueOnMemory: number;
  maximumLimitQueueOnMemoryActive: boolean;
  maxRowJobSingleGetIntoQueueMemory: number;
  maxRowJobSingleGetIntoQueueMemoryActive: boolean;
  maxRowJobBatchGetIntoQueueMemory: number;
  maxRowJobBatchGetIntoQueueMemoryActive: boolean;

  // Tab 2: Delay & Scheduler Timers
  delayAtStartQueue: number;
  delayAtStartQueueActive: boolean;
  delayAtFinishQueue: number;
  delayAtFinishQueueActive: boolean;
  delayRetrySchedulerJobServiceMinute: number;
  delayRetrySchedulerJobServiceMinuteActive: boolean;
  retryFromMinute: number;
  retryFromMinuteActive: boolean;
  delayInsertTriggerSchedulerProcessSecond: number;
  delayInsertTriggerSchedulerProcessSecondActive: boolean;

  // Tab 3: System Rules & Logs
  ruleBlacklistAml: string;
  ruleBlacklistAmlActive: boolean;
  onOffEodLog: boolean; // 1 = ON, 0 = OFF
  onOffEodLogActive: boolean;
  concurrentJobBatchHandler: number;
  concurrentJobBatchHandlerActive: boolean;

  lastUpdated: string;
  updatedBy: string;
}

export interface UserDefinedParameterItem {
  id: string;
  parameterKey: string;
  parameterName: string;
  parameterValue: string;
  category: 'Screening & Queue' | 'Email Routing' | 'Queue & Memory Limits' | 'Delay & Scheduler Timers' | 'System Rules & Logs';
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'SELECT';
  description: string;
  isActive: boolean;
  updatedDate: string;
  updatedBy: string;
}



