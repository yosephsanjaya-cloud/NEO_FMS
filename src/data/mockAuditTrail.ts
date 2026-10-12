import { 
  AuditSystemLog, 
  AuditChangeLog, 
  AuditUserLogin, 
  AuditUserAccess, 
  AuditMailLog 
} from '../types/auditTrail';

export const INITIAL_SYSTEM_LOGS: AuditSystemLog[] = [
  {
    id: 'ERR-2026-0901',
    host: 'fms-core-app01.bank.internal',
    code: 500,
    type: 'NullReference',
    errorMessage: 'System.NullReferenceException: Object reference not set to an instance of an object at FMS.Engine.RuleProcessor.EvaluateVelocityRule(TransactionContext ctx)',
    stackTrace: `System.NullReferenceException: Object reference not set to an instance of an object.
   at FMS.Engine.RuleProcessor.EvaluateVelocityRule(TransactionContext ctx) in /src/FMS.Engine/Rules/VelocityEvaluator.cs:line 142
   at FMS.Engine.RuleEngineWorker.ProcessIncomingTransactionAsync(CardTransactionMessage msg) in /src/FMS.Engine/Workers/RuleEngineWorker.cs:line 89
   at FMS.Engine.Pipeline.TransactionPipeline.ExecuteAsync(TransactionMessage msg) in /src/FMS.Engine/Pipeline/TransactionPipeline.cs:line 45
   at Microsoft.AspNetCore.Mvc.Infrastructure.ActionMethodExecutor.TaskOfIActionResultExecutor.Execute(ActionContext actionContext, Object[] arguments)
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.InvokeActionMethodAsync()
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.InvokeNextActionFilterAsync()`,
    user: 'USR-1002 (Ahmad Rizki)',
    dateTime: '2026-09-03 20:42:15',
    source: 'FMS.Engine.Rules.VelocityEvaluator.cs:142',
    severity: 'High',
    httpMethod: 'POST',
    urlPath: '/api/v1/rules/evaluate/velocity'
  },
  {
    id: 'ERR-2026-0902',
    host: 'fms-worker02.bank.internal',
    code: 500,
    type: 'OutOfMemory',
    errorMessage: 'System.OutOfMemoryException: Exception of type "System.OutOfMemoryException" was thrown during batch aggregation for AML CIF clustering.',
    stackTrace: `System.OutOfMemoryException: Insufficient memory to continue the execution of the program.
   at System.Collections.Generic.Dictionary\`2.Resize(Int32 newSize, Boolean forceNewHashCodes)
   at FMS.Services.AmlAggregatorService.GroupTransactionsByCifWindow(DateTime startTime, DateTime endTime) in /src/FMS.Services/AML/AmlAggregatorService.cs:line 310
   at FMS.Workers.AmlClusteringBackgroundService.ExecuteAsync(CancellationToken stoppingToken) in /src/FMS.Workers/AmlClusteringBackgroundService.cs:line 114
   at Microsoft.Extensions.Hosting.Internal.Host.StartAsync(CancellationToken cancellationToken)`,
    user: 'SYSTEM_CRON',
    dateTime: '2026-09-03 19:15:02',
    source: 'FMS.Services.AML.AmlAggregatorService.cs:310',
    severity: 'Critical',
    httpMethod: 'BACKGROUND_JOB',
    urlPath: 'CRON:aml-cif-cluster-hourly'
  },
  {
    id: 'ERR-2026-0903',
    host: 'fms-api-gateway.bank.internal',
    code: 502,
    type: 'Http',
    errorMessage: 'Bad Gateway: Upstream Core Banking Switch connection refused (10.10.88.20:8080) timed out after 15000ms',
    stackTrace: `System.Net.Http.HttpRequestException: Resource temporarily unavailable (10.10.88.20:8080)
 ---> System.Net.Sockets.SocketException (110): Connection timed out
   at System.Net.Sockets.Socket.AwaitableSocketAsyncEventArgs.ThrowException(SocketError error, CancellationToken cancellationToken)
   at System.Net.Sockets.Socket.ConnectAsync(EndPoint remoteEP)
   at System.Net.Http.HttpConnectionPool.ConnectToTcpHostAsync(String host, Int32 port, HttpRequestMessage initialRequest, Boolean async, CancellationToken cancellationToken)
   --- End of inner exception stack trace ---
   at FMS.Gateway.Clients.CoreBankingClient.QueryCardAccountStatus(String cardNumber) in /src/FMS.Gateway/Clients/CoreBankingClient.cs:line 88
   at FMS.Controllers.DebitCardController.GetProfile(String cardId) in /src/FMS.Gateway/Controllers/DebitCardController.cs:line 54`,
    user: 'USR-1003 (Siti Rahmawati)',
    dateTime: '2026-09-03 18:30:41',
    source: 'FMS.Gateway.Clients.CoreBankingClient.cs:88',
    severity: 'High',
    httpMethod: 'GET',
    urlPath: '/api/v1/cards/4218-76**-****-9821/profile'
  },
  {
    id: 'ERR-2026-0904',
    host: 'fms-core-app01.bank.internal',
    code: 500,
    type: 'SqlException',
    errorMessage: 'Npgsql.PostgresException (0x80004005): 40P01: deadlock detected on table "FMS_EXTERNAL_BLACKLIST_MATCHES"',
    stackTrace: `Npgsql.PostgresException (0x80004005): 40P01: deadlock detected
Process 4812 waits for ExclusiveLock on relation 184920 of database 16384; blocked by process 4819.
Process 4819 waits for RowShareLock on relation 184915 of database 16384; blocked by process 4812.
   at Npgsql.Internal.NpgsqlConnector.ReadMessageLong(Boolean async, DataRowLoadingMode dataRowLoadingMode, Boolean readingNotifications, Boolean isSeeOther)
   at Npgsql.NpgsqlDataReader.NextResult(Boolean async, Boolean isCommand)
   at Npgsql.NpgsqlCommand.ExecuteReader(Boolean async, CommandBehavior behavior, CancellationToken cancellationToken)
   at Dapper.SqlMapper.QueryInternalAsync[T](IDbConnection cnn, CommandDefinition def)
   at FMS.Data.Repositories.BlacklistRepository.InsertCrossMatchBatchAsync(IEnumerable\`1 matches) in /src/FMS.Data/Repositories/BlacklistRepository.cs:line 218`,
    user: 'USR-1001 (Budi Santoso)',
    dateTime: '2026-09-03 17:05:59',
    source: 'FMS.Data.Repositories.BlacklistRepository.cs:218',
    severity: 'Medium',
    httpMethod: 'POST',
    urlPath: '/api/v1/blacklist/cross-match/sync'
  },
  {
    id: 'ERR-2026-0905',
    host: 'fms-worker01.bank.internal',
    code: 504,
    type: 'TimeoutException',
    errorMessage: 'System.TimeoutException: The operation "DispatchEmailNotificationAsync" for template ETPL-001 timed out after 30000ms waiting for SMTP mail relay response.',
    stackTrace: `System.TimeoutException: The operation has timed out.
   at FMS.Services.Mail.SmtpEmailDispatcher.SendMimeMessageAsync(MimeMessage msg, CancellationToken ct) in /src/FMS.Services/Mail/SmtpEmailDispatcher.cs:line 167
   at FMS.Services.Mail.EmailNotificationWorker.ProcessQueueItemAsync(EmailQueueItem item) in /src/FMS.Services/Mail/EmailNotificationWorker.cs:line 95
   at FMS.Services.Mail.EmailNotificationWorker.ExecuteAsync(CancellationToken stoppingToken) in /src/FMS.Services/Mail/EmailNotificationWorker.cs:line 42`,
    user: 'SYSTEM_SCHEDULER',
    dateTime: '2026-09-03 15:10:22',
    source: 'FMS.Services.Mail.SmtpEmailDispatcher.cs:167',
    severity: 'Medium',
    httpMethod: 'DISPATCH',
    urlPath: 'QUEUE:email-dispatcher/ETPL-001'
  },
  {
    id: 'ERR-2026-0906',
    host: 'fms-api-gateway.bank.internal',
    code: 403,
    type: 'Exception',
    errorMessage: 'System.Security.SecurityException: Unauthorized attempt to access System Role deletion API without SUPER_ADMIN privilege.',
    stackTrace: `System.Security.SecurityException: Access Denied.
   at FMS.Security.RoleAuthorizationFilter.OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next) in /src/FMS.Security/RoleAuthorizationFilter.cs:line 62
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.InvokeNextActionFilterAsync()
   at Microsoft.AspNetCore.Mvc.Infrastructure.ControllerActionInvoker.Rethrow(ActionExecutedContextSealed context)`,
    user: 'USR-1004 (Dewi Lestari)',
    dateTime: '2026-09-03 14:02:11',
    source: 'FMS.Security.RoleAuthorizationFilter.cs:62',
    severity: 'Low',
    httpMethod: 'DELETE',
    urlPath: '/api/v1/system-roles/SR-001'
  }
];

export const INITIAL_CHANGE_LOGS: AuditChangeLog[] = [
  {
    id: 'CHG-2026-8821',
    timestamp: '2026-09-03 16:45:20',
    userId: 'USR-1001',
    userName: 'Budi Santoso',
    userRole: 'Rule Engineer / Admin',
    ipAddress: '10.20.14.88',
    moduleTable: 'FMS_RULE_BASIC',
    recordId: 'RB-VEL-01',
    actionType: 'UPDATE',
    reason: 'Penyesuaian threshold velocity interval transaksi ATM untuk mengantisipasi modus skimming baru',
    changes: [
      { fieldName: 'Threshold_Amount', oldValue: 'Rp 25.000.000', newValue: 'Rp 50.000.000' },
      { fieldName: 'Time_Window_Minutes', oldValue: '10 Menit', newValue: '15 Menit' },
      { fieldName: 'Risk_Score_Weight', oldValue: '75.0', newValue: '88.5' },
      { fieldName: 'Sync_Status', oldValue: 'Out of Sync', newValue: 'Synced' }
    ]
  },
  {
    id: 'CHG-2026-8822',
    timestamp: '2026-09-03 15:10:44',
    userId: 'USR-1003',
    userName: 'Siti Rahmawati',
    userRole: 'System Administrator',
    ipAddress: '10.20.14.92',
    moduleTable: 'SYSTEM_USER',
    recordId: 'USR-1005',
    actionType: 'INSERT',
    reason: 'Pendaftaran akun personil baru Tim Anti-Money Laundering (AML Level 1)',
    changes: [
      { fieldName: 'User_ID', oldValue: '<NULL>', newValue: 'USR-1005' },
      { fieldName: 'Username', oldValue: '<NULL>', newValue: 'hendra.kurniawan' },
      { fieldName: 'Full_Name', oldValue: '<NULL>', newValue: 'Hendra Kurniawan' },
      { fieldName: 'Assigned_Role', oldValue: '<NULL>', newValue: 'AML Investigator (SR-003)' },
      { fieldName: 'Assigned_Group', oldValue: '<NULL>', newValue: 'AML & Compliance Group (GRP-002)' },
      { fieldName: 'Status', oldValue: '<NULL>', newValue: 'Active' }
    ]
  },
  {
    id: 'CHG-2026-8823',
    timestamp: '2026-09-03 14:02:11',
    userId: 'USR-1002',
    userName: 'Ahmad Rizki',
    userRole: 'Fraud Investigator Lead',
    ipAddress: '10.20.14.102',
    moduleTable: 'EMAIL_TEMPLATE',
    recordId: 'ETPL-002',
    actionType: 'UPDATE',
    reason: 'Penambahan recipient supervisor CC dan perpanjangan monitoring duration ke 15 Menit',
    changes: [
      { fieldName: 'Monitoring_Duration', oldValue: '5 Minutes', newValue: '15 Minutes' },
      { fieldName: 'Email_CC', oldValue: 'supervisor@banksampoerna.com', newValue: 'supervisor@banksampoerna.com; head.fraud@banksampoerna.com' },
      { fieldName: 'Exclude_Holiday', oldValue: 'false', newValue: 'true' }
    ]
  },
  {
    id: 'CHG-2026-8824',
    timestamp: '2026-09-03 11:33:05',
    userId: 'USR-1001',
    userName: 'Budi Santoso',
    userRole: 'Rule Engineer / Admin',
    ipAddress: '10.20.14.88',
    moduleTable: 'EXTERNAL_BLACKLIST',
    recordId: 'EBL-2026-0941',
    actionType: 'INSERT',
    reason: 'Sinkronisasi DTTOT Surat Edaran PPATK No. 14/2026 untuk Daftar Terduga Teroris',
    changes: [
      { fieldName: 'Entity_Name', oldValue: '<NULL>', newValue: 'Jafar Sodiq Al-Habsyi' },
      { fieldName: 'List_Type', oldValue: '<NULL>', newValue: 'DTTOT PPATK' },
      { fieldName: 'Identity_No', oldValue: '<NULL>', newValue: '3201091829100004' },
      { fieldName: 'Risk_Category', oldValue: '<NULL>', newValue: 'Sanction High Risk' }
    ]
  },
  {
    id: 'CHG-2026-8825',
    timestamp: '2026-09-02 18:20:19',
    userId: 'USR-1003',
    userName: 'Siti Rahmawati',
    userRole: 'System Administrator',
    ipAddress: '10.20.14.92',
    moduleTable: 'SYSTEM_ROLE',
    recordId: 'SR-005',
    actionType: 'DELETE',
    reason: 'Penghapusan legacy role Temporary Intern Auditor pasca audit berkala OJK',
    changes: [
      { fieldName: 'Role_Code', oldValue: 'ROLE_INTERN_AUDIT', newValue: '<DELETED>' },
      { fieldName: 'Role_Name', oldValue: 'Temporary Intern Auditor', newValue: '<DELETED>' },
      { fieldName: 'Permissions', oldValue: 'VIEW_REPORTS, VIEW_CASES', newValue: '<DELETED>' }
    ]
  }
];

export const INITIAL_LOGIN_LOGS: AuditUserLogin[] = [
  {
    id: 'LOG-2026-0041',
    timestamp: '2026-09-03 20:15:30',
    userId: 'USR-1001',
    username: 'budi.santoso',
    ipAddress: '10.20.14.88',
    deviceBrowser: 'Chrome 128 / Windows 11',
    status: 'Success',
    action: 'Login'
  },
  {
    id: 'LOG-2026-0042',
    timestamp: '2026-09-03 19:55:12',
    userId: 'USR-1002',
    username: 'ahmad.rizki',
    ipAddress: '10.20.14.102',
    deviceBrowser: 'Safari 17.5 / macOS Sonoma',
    status: 'Success',
    action: 'Login'
  },
  {
    id: 'LOG-2026-0043',
    timestamp: '2026-09-03 19:40:08',
    userId: 'USR-1004',
    username: 'dewi.lestari',
    ipAddress: '192.168.10.45',
    deviceBrowser: 'Firefox 129 / Windows 10',
    status: 'Failed',
    action: 'Login',
    failureReason: 'Invalid password (attempt 2 of 3)'
  },
  {
    id: 'LOG-2026-0044',
    timestamp: '2026-09-03 19:42:19',
    userId: 'USR-1004',
    username: 'dewi.lestari',
    ipAddress: '192.168.10.45',
    deviceBrowser: 'Firefox 129 / Windows 10',
    status: 'Success',
    action: 'Login'
  },
  {
    id: 'LOG-2026-0045',
    timestamp: '2026-09-03 18:00:02',
    userId: 'USR-1005',
    username: 'hendra.kurniawan',
    ipAddress: '10.20.14.115',
    deviceBrowser: 'Edge 128 / Windows 11',
    status: 'Success',
    action: 'Logout'
  },
  {
    id: 'LOG-2026-0046',
    timestamp: '2026-09-03 17:15:33',
    userId: 'USR-1003',
    username: 'siti.rahmawati',
    ipAddress: '10.20.14.92',
    deviceBrowser: 'Chrome 128 / Windows 11',
    status: 'Success',
    action: 'Login'
  },
  {
    id: 'LOG-2026-0047',
    timestamp: '2026-09-03 14:10:05',
    userId: 'UNKNOWN_USER',
    username: 'admin.hacker',
    ipAddress: '103.41.205.12',
    deviceBrowser: 'Python-requests/2.31',
    status: 'Failed',
    action: 'Login',
    failureReason: 'Account does not exist & blocked by WAF'
  }
];

export const INITIAL_ACCESS_LOGS: AuditUserAccess[] = [
  {
    id: 'ACS-2026-1191',
    timestamp: '2026-09-03 20:45:11',
    userId: 'USR-1002',
    username: 'ahmad.rizki',
    role: 'Fraud Investigator Lead',
    accessedMenu: 'Fraud Alert (System Generated)',
    actionTaken: 'View',
    ipAddress: '10.20.14.102',
    details: 'Membuka rincian kasus CAS-20260903-09412 nasabah Yoseph Sanjaya'
  },
  {
    id: 'ACS-2026-1192',
    timestamp: '2026-09-03 20:10:48',
    userId: 'USR-1001',
    username: 'budi.santoso',
    role: 'Rule Engineer / Admin',
    accessedMenu: 'Rule Basic Engine',
    actionTaken: 'Update',
    ipAddress: '10.20.14.88',
    details: 'Update parameter rule RB-VEL-01 Impossible Travel'
  },
  {
    id: 'ACS-2026-1193',
    timestamp: '2026-09-03 19:30:20',
    userId: 'USR-1003',
    username: 'siti.rahmawati',
    role: 'System Administrator',
    accessedMenu: 'System Parameter / User Management',
    actionTaken: 'Create',
    ipAddress: '10.20.14.92',
    details: 'Menambahkan user baru Hendra Kurniawan (USR-1005)'
  },
  {
    id: 'ACS-2026-1194',
    timestamp: '2026-09-03 18:45:00',
    userId: 'USR-1004',
    username: 'dewi.lestari',
    role: 'Compliance Officer',
    accessedMenu: 'AML Group Management',
    actionTaken: 'Export',
    ipAddress: '192.168.10.45',
    details: 'Export data 28 kasus AML CIF Grouping ke berkas Excel bulanan'
  },
  {
    id: 'ACS-2026-1195',
    timestamp: '2026-09-03 17:50:12',
    userId: 'USR-1002',
    username: 'ahmad.rizki',
    role: 'Fraud Investigator Lead',
    accessedMenu: 'Debit Card Profile (360°)',
    actionTaken: 'Search',
    ipAddress: '10.20.14.102',
    details: 'Pencarian kartu debit nomor 4218-76**-****-9821'
  },
  {
    id: 'ACS-2026-1196',
    timestamp: '2026-09-03 16:15:39',
    userId: 'USR-1001',
    username: 'budi.santoso',
    role: 'Rule Engineer / Admin',
    accessedMenu: 'External Blacklist Cross-Match',
    actionTaken: 'Approve',
    ipAddress: '10.20.14.88',
    details: 'Konfirmasi pemblokiran rekening CIF-0044129 atas kesesuaian DTTOT'
  }
];

export const INITIAL_MAIL_LOGS: AuditMailLog[] = [
  {
    id: 'MAIL-2026-0511',
    timestamp: '2026-09-03 20:50:00',
    emailTemplateName: 'A-02-g-DEV',
    templateId: 'ETPL-001',
    recipientTo: 'investigator.fraud@banksampoerna.com',
    recipientCc: 'supervisor.fraud@banksampoerna.com',
    subject: '[FMS ALERT] High Risk Notification - Case CAS-20260903-09412 (Yoseph Sanjaya Gunawan)',
    status: 'Sent',
    durationMs: 420,
    bodySnippet: 'Yth. Tim Investigasi, Sistem mendeteksi aktivitas mencurigakan Impossible Travel...'
  },
  {
    id: 'MAIL-2026-0512',
    timestamp: '2026-09-03 19:00:15',
    emailTemplateName: 'Alert Distance Warning',
    templateId: 'ETPL-002',
    recipientTo: 'monitoring.atm@banksampoerna.com',
    subject: '[FMS SPIKE] Velocity Cluster Alert - Case CAS-20260903-08812',
    status: 'Sent',
    durationMs: 380,
    bodySnippet: 'Terjadi anomali frekuensi transaksi tinggi dalam waktu 5 menit di ATM Thamrin...'
  },
  {
    id: 'MAIL-2026-0513',
    timestamp: '2026-09-03 18:30:40',
    emailTemplateName: 'AML-STR-ESCALATION-NOTIF',
    templateId: 'ETPL-003',
    recipientTo: 'compliance.aml@banksampoerna.com',
    subject: '[AML ESCALATION] Urgent: Multi-rule Violation for CIF-0098231',
    status: 'Failed',
    errorMessage: 'SMTP Error: 550 5.1.1 User unknown or mailbox full at compliance.aml@banksampoerna.com',
    durationMs: 1250,
    bodySnippet: 'Laporan Eskalasi STR: Nasabah melanggar 3 rule structuring AML simultan...'
  },
  {
    id: 'MAIL-2026-0514',
    timestamp: '2026-09-03 17:15:00',
    emailTemplateName: 'DTTOT-SANCTION-MATCH-ALERT',
    templateId: 'ETPL-004',
    recipientTo: 'legal.compliance@banksampoerna.com',
    recipientCc: 'director.risk@banksampoerna.com',
    subject: '[CRITICAL COMPLIANCE] DTTOT Sanction List Cross-Match Detected: Jafar Sodiq',
    status: 'Sent',
    durationMs: 510,
    bodySnippet: 'Pemberitahuan Kepatuhan Hukum: Rekening CIF-0044129 terindikasi match 98% daftar terorisme PPATK...'
  },
  {
    id: 'MAIL-2026-0515',
    timestamp: '2026-09-03 15:40:22',
    emailTemplateName: 'Daily Shift Summary',
    templateId: 'ETPL-005',
    recipientTo: 'shift.lead@banksampoerna.com',
    subject: '[FMS SUMMARY] Daily Shift Handover Report - 03 Sep 2026',
    status: 'Bounced',
    errorMessage: 'Mail Delivery Subsystem: Message rejected due to attachment size limit exceeded (>25MB)',
    durationMs: 890,
    bodySnippet: 'Ringkasan shift 1 (Pagi): Total 42 alert ditangani, 3 eskalasi AML...'
  }
];
