export type SystemExceptionType = 
  | 'Exception' 
  | 'OutOfMemory' 
  | 'Http' 
  | 'NullReference' 
  | 'SqlException' 
  | 'TimeoutException'
  | 'SecurityException';

export interface AuditSystemLog {
  id: string;
  host: string;
  code: number;
  type: SystemExceptionType;
  errorMessage: string;
  stackTrace: string;
  user: string;
  dateTime: string;
  source: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  httpMethod?: string;
  urlPath?: string;
}

export type AuditActionType = 'INSERT' | 'UPDATE' | 'DELETE' | 'LOCK' | 'UNLOCK';

export interface FieldComparison {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export interface AuditChangeLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  moduleTable: string;
  recordId: string;
  actionType: AuditActionType;
  reason: string;
  changes: FieldComparison[];
}

export type LoginStatus = 'Success' | 'Failed';
export type LoginAction = 'Login' | 'Logout';

export interface AuditUserLogin {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  ipAddress: string;
  deviceBrowser: string;
  status: LoginStatus;
  action: LoginAction;
  failureReason?: string;
}

export type AccessActionTaken = 'View' | 'Export' | 'Search' | 'Create' | 'Update' | 'Approve' | 'Lock' | 'Unlock' | 'Execute';

export interface AuditUserAccess {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  role: string;
  accessedMenu: string;
  actionTaken: AccessActionTaken;
  ipAddress: string;
  details?: string;
}

export type MailDeliveryStatus = 'Sent' | 'Failed' | 'Bounced';

export interface AuditMailLog {
  id: string;
  timestamp: string;
  emailTemplateName: string;
  templateId?: string;
  recipientTo: string;
  recipientCc?: string;
  subject: string;
  status: MailDeliveryStatus;
  errorMessage?: string;
  durationMs?: number;
  bodySnippet?: string;
}
