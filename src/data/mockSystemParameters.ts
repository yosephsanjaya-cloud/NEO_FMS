import { SystemUser, SystemGroup, SystemRole, EmailTemplate, ApplicationParameters, UserDefinedParameterConfig, UserDefinedParameterItem, UserSessionRecord } from '../types/systemParameter';

export const INITIAL_SYSTEM_GROUPS: SystemGroup[] = [
  {
    id: 'GRP-001',
    groupName: 'AFC L1',
    description: 'Fraud L1 - First-level alert triage, transaction verification & customer outreach',
    escalationPath: 'AFC L2 (Navigasi approval berlanjut ke AFC L2)',
    createdDate: '2024-01-10 09:00:00',
    updatedDate: '2026-08-01 10:00:00'
  },
  {
    id: 'GRP-002',
    groupName: 'AFC L2',
    description: 'Fraud L2 - Senior fraud investigator, complex dispute resolution & supervisor approval',
    escalationPath: 'Final Sign-off / Lead Approver',
    createdDate: '2024-01-10 09:00:00',
    updatedDate: '2026-08-15 14:30:00'
  },
  {
    id: 'GRP-003',
    groupName: 'Analyst L1',
    description: 'AML Analyst L1 - Initial alert checking, CTR triage & entity screening',
    escalationPath: 'Analyst L2 (Navigasi approval berlanjut ke Analyst L2)',
    createdDate: '2024-01-15 10:30:00',
    updatedDate: '2026-07-20 11:15:00'
  },
  {
    id: 'GRP-004',
    groupName: 'Analyst L2',
    description: 'AML Analyst L2 - Senior AML officer, STR reporting, network linking & compliance sign-off',
    escalationPath: 'Final Compliance Sign-off / STR Approver',
    createdDate: '2024-01-15 10:30:00',
    updatedDate: '2026-08-10 16:00:00'
  },
  {
    id: 'GRP-005',
    groupName: 'IT PSS Maker Checker',
    description: 'IT Technical Support - System uptime monitoring, network interfaces & ISO 8583 switch integrations',
    escalationPath: 'Dual Control / Peer Checker Sign-off',
    createdDate: '2024-02-01 08:00:00',
    updatedDate: '2026-06-12 13:45:00'
  },
  {
    id: 'GRP-006',
    groupName: 'IT DCA Maker Checker',
    description: 'IT Data & Config Administration - Parameter configuration, system master data & user provisioning',
    escalationPath: 'Direct Execution / Super Admin Override',
    createdDate: '2024-02-01 08:00:00',
    updatedDate: '2026-08-25 09:20:00'
  }
];

export const INITIAL_SYSTEM_ROLES: SystemRole[] = [
  {
    id: 'ROL-001',
    roleName: 'Fraud',
    description: 'Anti Fraud Center - Fraud Investigation & Detection',
    domainScope: 'FRAUD ONLY',
    createdDate: '2024-01-01 08:00:00',
    updatedDate: '2026-08-01 10:00:00'
  },
  {
    id: 'ROL-002',
    roleName: 'AML',
    description: 'APU PPT - Anti-Money Laundering & CTF Compliance',
    domainScope: 'AML ONLY',
    createdDate: '2024-01-01 08:00:00',
    updatedDate: '2026-08-01 10:00:00'
  },
  {
    id: 'ROL-003',
    roleName: 'IT',
    description: 'Information Technology & System Administration',
    domainScope: 'FULL ACCESS',
    createdDate: '2024-01-01 08:00:00',
    updatedDate: '2026-08-01 10:00:00'
  },
  {
    id: 'ROL-004',
    roleName: 'Admin',
    description: 'Master Administrator - Full Access Security Matrix',
    domainScope: 'FULL ACCESS',
    createdDate: '2024-01-01 08:00:00',
    updatedDate: '2026-08-01 10:00:00'
  }
];

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'USR-01',
    userId: 'USR-00100',
    username: 'sysadmin',
    fullName: 'Yoseph Sanjaya',
    email: 'sysadmin@banksampoerna.com',
    group: 'IT DCA Maker Checker',
    role: 'Admin',
    riskDomain: 'FULL ACCESS',
    escalationPath: 'Direct Execution / Super Admin Override',
    status: 'Active',
    createdDate: '2024-01-01 08:00:00',
    updatedDate: '2026-08-20 14:15:00'
  },
  {
    id: 'USR-02',
    userId: 'USR-00101',
    username: 'afcl1',
    fullName: 'Anti-Fraud Officer L1',
    email: 'afcl1@banksampoerna.com',
    group: 'AFC L1',
    role: 'Fraud',
    riskDomain: 'FRAUD ONLY',
    escalationPath: 'Navigasi approval berlanjut ke AFC L2',
    status: 'Active',
    createdDate: '2025-01-10 09:00:00',
    updatedDate: '2026-08-15 10:20:00'
  },
  {
    id: 'USR-03',
    userId: 'USR-00102',
    username: 'afcl2',
    fullName: 'Anti-Fraud Team Lead L2',
    email: 'afcl2@banksampoerna.com',
    group: 'AFC L2',
    role: 'Fraud Checker / Approver',
    riskDomain: 'FRAUD ONLY',
    escalationPath: 'Final Sign-off / Lead Approver',
    status: 'Active',
    createdDate: '2025-01-10 09:00:00',
    updatedDate: '2026-08-20 14:15:00'
  },
  {
    id: 'USR-04',
    userId: 'USR-00201',
    username: 'analystl1',
    fullName: 'AML Analyst L1',
    email: 'analystl1@banksampoerna.com',
    group: 'Analyst L1',
    role: 'AML',
    riskDomain: 'AML ONLY',
    escalationPath: 'Navigasi approval berlanjut ke Analyst L2',
    status: 'Active',
    createdDate: '2025-02-01 10:15:00',
    updatedDate: '2026-07-28 16:45:00'
  },
  {
    id: 'USR-05',
    userId: 'USR-00202',
    username: 'analystl2',
    fullName: 'AML Senior Analyst L2',
    email: 'analystl2@banksampoerna.com',
    group: 'Analyst L2',
    role: 'AML Checker / Approver',
    riskDomain: 'AML ONLY',
    escalationPath: 'Final Compliance Sign-off / STR Approver',
    status: 'Active',
    createdDate: '2025-02-01 10:15:00',
    updatedDate: '2026-08-10 13:10:00'
  },
  {
    id: 'USR-06',
    userId: 'USR-00301',
    username: 'reza.firmansyah',
    fullName: 'Reza Firmansyah',
    email: 'reza.firmansyah@banksampoerna.com',
    group: 'IT DCA Maker Checker',
    role: 'IT',
    riskDomain: 'FULL ACCESS',
    escalationPath: 'Dual Control / Peer Checker Sign-off',
    status: 'Active',
    createdDate: '2024-11-20 08:00:00',
    updatedDate: '2026-08-01 09:30:00'
  },
  {
    id: 'USR-07',
    userId: 'USR-00302',
    username: 'dewi.lestari',
    fullName: 'Dewi Lestari',
    email: 'dewi.lestari@banksampoerna.com',
    group: 'IT PSS Maker Checker',
    role: 'IT',
    riskDomain: 'FULL ACCESS',
    escalationPath: 'Dual Control / Peer Checker Sign-off',
    status: 'Inactive',
    createdDate: '2025-04-12 13:40:00',
    updatedDate: '2026-06-19 11:00:00'
  }
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'ETPL-001',
    templateName: 'A-02-g-DEV',
    monitoringDuration: '5 Minutes',
    startDate: '2025-01-01',
    startTime: '08:00:00',
    excludeHoliday: true,
    status: 'Active',
    emailTo: 'afc.investigators@banksampoerna.com, lead.fraud@banksampoerna.com',
    emailCc: 'afc.supervisor@banksampoerna.com',
    emailBcc: 'audit.internal@banksampoerna.com',
    emailSubject: '[FMS ALERT] Impossible Travel Detected - Case $Case_ID$ ($Customer_Name$)',
    emailBody: `<h3>Pemberitahuan Peringatan Fraud Management System (FMS)</h3>
<p>Yth. Tim Fraud Defense & Investigation,</p>
<p>Sistem mendeteksi anomali transaksi berisiko tinggi dengan indikasi <strong>Impossible Travel (Alert Distance Warning)</strong> pada nasabah berikut:</p>
<table border="1" cellpadding="6" style="border-collapse: collapse; width: 100%; max-width: 600px;">
  <tr><td style="background:#f1f5f9;"><strong>Case ID</strong></td><td>$Case_ID$</td></tr>
  <tr><td style="background:#f1f5f9;"><strong>Nama Nasabah</strong></td><td>$Customer_Name$ ($CIF$)</td></tr>
  <tr><td style="background:#f1f5f9;"><strong>Nama Rule</strong></td><td>$Rule_Name$ ($Rule_Code$)</td></tr>
  <tr><td style="background:#f1f5f9;"><strong>Risk Score</strong></td><td><span style="color:red; font-weight:bold;">$Risk_Score$ ($Risk_Level$)</span></td></tr>
  <tr><td style="background:#f1f5f9;"><strong>Nominal Transaksi</strong></td><td>$Transaction_Amount$</td></tr>
  <tr><td style="background:#f1f5f9;"><strong>Lokasi Transaksi</strong></td><td>$Tx_Location_1$ &rarr; $Tx_Location_2$ (Selisih Waktu: $Time_Diff$)</td></tr>
  <tr><td style="background:#f1f5f9;"><strong>Waktu Deteksi</strong></td><td>$Timestamp$ WIB</td></tr>
</table>
<p>Harap segera lakukan verifikasi lanjutan ke nasabah atau lakukan pembekuan sementara akun melalui modul <em>Case Management</em>.</p>
<p>Salam,<br/><strong>Neo Fraud Management System (FMS) Engine v1.14</strong><br/>Bank Sahabat Sampoerna</p>`,
    tableReferences: [
      {
        id: 'TR-01',
        tableName: 'TableEmailA1',
        tableType: 'Base Alert Table',
        queryData: 'SELECT ALERT_ID AS Case_ID, CIF, CUSTOMER_NAME, RULE_BASIC_CODE AS Rule_Code, RULE_NAME, FINAL_RISK_SCORE AS Risk_Score, CASE_URGENCY AS Risk_Level, TRANSACTION_AMOUNT, CREATED_DATE AS Timestamp FROM FMS_FRAUD_ALERTS WHERE ALERT_STATUS = "Open"',
        primaryKey: 'Case_ID'
      },
      {
        id: 'TR-02',
        tableName: 'TableGeoDistance',
        tableType: 'Transaction Log',
        queryData: 'SELECT T1.TX_ID, T1.LOCATION AS Tx_Location_1, T2.LOCATION AS Tx_Location_2, TIMEDIFF(T2.TX_TIME, T1.TX_TIME) AS Time_Diff FROM TX_LOG T1 JOIN TX_LOG T2 ON T1.CIF = T2.CIF WHERE T1.TX_ID <> T2.TX_ID',
        primaryKey: 'TX_ID'
      }
    ],
    replacerMappings: [
      {
        id: 'RM-01',
        replacerTag: '$Case_ID$',
        fieldReplacer: '[TableEmailA1].[Case_ID]',
        description: 'Nomor unik ID Kasus Fraud'
      },
      {
        id: 'RM-02',
        replacerTag: '$Customer_Name$',
        fieldReplacer: '[TableEmailA1].[CUSTOMER_NAME]',
        description: 'Nama Lengkap Pemegang Rekening'
      },
      {
        id: 'RM-03',
        replacerTag: '$CIF$',
        fieldReplacer: '[TableEmailA1].[CIF]',
        description: 'Nomor CIF Nasabah'
      },
      {
        id: 'RM-04',
        replacerTag: '$Rule_Name$',
        fieldReplacer: '[TableEmailA1].[RULE_NAME]',
        description: 'Deskripsi nama rule yang dilanggar'
      },
      {
        id: 'RM-05',
        replacerTag: '$Risk_Score$',
        fieldReplacer: '[TableEmailA1].[Risk_Score]',
        description: 'Skor risiko final kalkulasi Neo FMS'
      },
      {
        id: 'RM-06',
        replacerTag: '$Transaction_Amount$',
        fieldReplacer: '[TableEmailA1].[TRANSACTION_AMOUNT]',
        description: 'Nominal transaksi dalam format Rupiah'
      },
      {
        id: 'RM-07',
        replacerTag: '$Timestamp$',
        fieldReplacer: '[TableEmailA1].[Timestamp]',
        description: 'Waktu deteksi alert'
      }
    ],
    actionsExecuted: [
      {
        id: 'ACT-01',
        actionType: 'Update Alert Flag',
        statementExecuted: 'UPDATE FMS_FRAUD_ALERTS SET EMAIL_NOTIFICATION_SENT = 1, NOTIFIED_AT = NOW() WHERE ALERT_ID = $Case_ID$'
      },
      {
        id: 'ACT-02',
        actionType: 'Insert Audit Log',
        statementExecuted: 'INSERT INTO FMS_AUDIT_TRAIL (EVENT_TYPE, REF_ID, NOTE) VALUES ("EMAIL_DISPATCHED", $Case_ID$, "Notifikasi Impossible Travel dikirim ke tim investigasi")'
      }
    ],
    attachments: [
      {
        id: 'ATT-01',
        reportName: 'Alert_Investigation_Summary',
        parameter: 'Case_ID=$Case_ID$;IncludeDevice=1',
        renderAs: 'PDF'
      }
    ],
    createdDate: '2025-01-10 09:00:00',
    updatedDate: '2026-08-28 11:20:00'
  },
  {
    id: 'ETPL-002',
    templateName: 'Alert Distance Warning',
    monitoringDuration: '15 Minutes',
    startDate: '2025-02-01',
    startTime: '07:00:00',
    excludeHoliday: false,
    status: 'Active',
    emailTo: 'investigator.l1@banksampoerna.com',
    emailCc: 'afc.l2@banksampoerna.com',
    emailBcc: '',
    emailSubject: '[FMS PROD] Peringatan Selisih Lokasi Transaksi Kartu Debit - $Card_Number$',
    emailBody: `<h3>Notifikasi Peringatan Selisih Lokasi Transaksi ATM / POS</h3>
<p>Ditemukan transaksi debit card berturut-turut pada dua lokasi dengan jarak lebih dari 200 km dalam rentang waktu singkat:</p>
<ul>
  <li><strong>Nomor Kartu:</strong> $Card_Number$</li>
  <li><strong>Nama Nasabah:</strong> $Customer_Name$</li>
  <li><strong>Merchant 1:</strong> $Merchant_1$ ($City_1$)</li>
  <li><strong>Merchant 2:</strong> $Merchant_2$ ($City_2$)</li>
  <li><strong>Nominal Transaksi:</strong> $Transaction_Amount$</li>
</ul>
<p>Sistem telah menaikkan status menjadi <em>On Check</em>. Silakan hubungi nasabah untuk konfirmasi kepemilikan kartu fisik.</p>`,
    tableReferences: [
      {
        id: 'TR-03',
        tableName: 'TableCardAlert',
        tableType: 'Card Detail',
        queryData: 'SELECT CARD_ID AS Card_Number, CUSTOMER_NAME, MERCHANT_NAME AS Merchant_1, SETTLEMENT_AMOUNT AS Transaction_Amount FROM FMS_CARD_TRANSACTIONS WHERE RISK_LEVEL = "HIGH"',
        primaryKey: 'Card_Number'
      }
    ],
    replacerMappings: [
      {
        id: 'RM-08',
        replacerTag: '$Card_Number$',
        fieldReplacer: '[TableCardAlert].[Card_Number]',
        description: 'Masked nomor kartu debit'
      },
      {
        id: 'RM-09',
        replacerTag: '$Customer_Name$',
        fieldReplacer: '[TableCardAlert].[CUSTOMER_NAME]',
        description: 'Nama pemegang kartu'
      },
      {
        id: 'RM-10',
        replacerTag: '$Transaction_Amount$',
        fieldReplacer: '[TableCardAlert].[Transaction_Amount]',
        description: 'Nominal transaksi'
      }
    ],
    actionsExecuted: [
      {
        id: 'ACT-03',
        actionType: 'Update Alert Flag',
        statementExecuted: 'UPDATE FMS_CARD_TRANSACTIONS SET INVESTIGATION_STATUS = "On Check" WHERE CARD_ID = $Card_Number$'
      }
    ],
    attachments: [
      {
        id: 'ATT-02',
        reportName: 'Card_Transaction_Extract',
        parameter: 'Card_Number=$Card_Number$;Period=Last24Hours',
        renderAs: 'Excel'
      }
    ],
    createdDate: '2025-02-15 10:15:00',
    updatedDate: '2026-07-19 15:40:00'
  },
  {
    id: 'ETPL-003',
    templateName: 'AML-STR-ESCALATION-NOTIF',
    monitoringDuration: 'Daily 08:00',
    startDate: '2025-01-15',
    startTime: '08:00:00',
    excludeHoliday: true,
    status: 'Active',
    emailTo: 'aml.compliance@banksampoerna.com, mlro@banksampoerna.com',
    emailCc: 'chief.compliance@banksampoerna.com',
    emailBcc: '',
    emailSubject: '[AML URGENT] Rekomendasi Pelaporan Transaksi Keuangan Mencurigakan (LTKM/STR) - CIF $CIF$',
    emailBody: `<h3>Eskalasi Kasus Anti-Money Laundering (APU-PPT)</h3>
<p>Berdasarkan agregasi profil nasabah dan pemantauan transaksi terstruktur (smurfing/structuring), CIF berikut telah melampaui batas ambang risiko AML:</p>
<ul>
  <li><strong>CIF:</strong> $CIF$</li>
  <li><strong>Nama Nasabah:</strong> $Customer_Name$</li>
  <li><strong>Total Transaksi Agregat:</strong> $Aggregate_Amount$</li>
  <li><strong>Frekuensi Transaksi:</strong> $Tx_Count$ transaksi dalam 24 jam</li>
  <li><strong>Status Review L1:</strong> Eskalasi ke Tim L2 untuk pelaporan goAML PPATK</li>
</ul>
<p>Laporan komprehensif terlampir dalam format PDF.</p>`,
    tableReferences: [
      {
        id: 'TR-04',
        tableName: 'TableAmlSummary',
        tableType: 'Base Alert Table',
        queryData: 'SELECT CIF, CUSTOMER_NAME, SUM(TRANSACTION_AMOUNT) AS Aggregate_Amount, COUNT(1) AS Tx_Count FROM FMS_AML_ALERTS GROUP BY CIF, CUSTOMER_NAME HAVING SUM(TRANSACTION_AMOUNT) > 500000000',
        primaryKey: 'CIF'
      }
    ],
    replacerMappings: [
      {
        id: 'RM-11',
        replacerTag: '$CIF$',
        fieldReplacer: '[TableAmlSummary].[CIF]',
        description: 'Nomor Identifikasi Nasabah'
      },
      {
        id: 'RM-12',
        replacerTag: '$Customer_Name$',
        fieldReplacer: '[TableAmlSummary].[CUSTOMER_NAME]',
        description: 'Nama Nasabah Terduga'
      },
      {
        id: 'RM-13',
        replacerTag: '$Aggregate_Amount$',
        fieldReplacer: '[TableAmlSummary].[Aggregate_Amount]',
        description: 'Total akumulasi transaksi mencurigakan'
      }
    ],
    actionsExecuted: [
      {
        id: 'ACT-04',
        actionType: 'Insert Audit Log',
        statementExecuted: 'INSERT INTO AML_ESCALATION_LOG (CIF, ACTION_DATE, NOTE) VALUES ($CIF$, NOW(), "Notifikasi eskalasi STR goAML terkirim")'
      }
    ],
    attachments: [
      {
        id: 'ATT-03',
        reportName: 'AML_Suspicious_Activity_Report',
        parameter: 'CIF=$CIF$;IncludeCounterparties=1',
        renderAs: 'PDF'
      }
    ],
    createdDate: '2025-03-01 11:00:00',
    updatedDate: '2026-08-20 09:10:00'
  },
  {
    id: 'ETPL-004',
    templateName: 'DTTOT-SANCTION-MATCH-ALERT',
    monitoringDuration: 'Realtime',
    startDate: '2025-01-01',
    startTime: '00:00:00',
    excludeHoliday: false,
    status: 'Inactive',
    emailTo: 'compliance.sanction@banksampoerna.com',
    emailCc: 'legal@banksampoerna.com',
    emailBcc: '',
    emailSubject: '[CRITICAL ALERT] Kemiripan Identitas Terhadap Daftar Terduga Teroris (DTTOT) - $Customer_Name$',
    emailBody: `<h3>Pemberitahuan Kritis: Pencocokan Daftar Terduga Teroris (DTTOT)</h3>
<p>Sistem External Blacklist Cross-Match mendeteksi kemiripan data identitas nasabah dengan basis data resmi DTTOT OJK / POLRI:</p>
<p><strong>Nama Nasabah:</strong> $Customer_Name$<br/><strong>NIK / Paspor:</strong> $Identity_Number$<br/><strong>Tingkat Kemiripan (Score):</strong> 98.4% (Direct Match)</p>
<p>Langkah otomatis: Rekening di-flag sementara untuk investigasi kepatuhan hukum.</p>`,
    tableReferences: [
      {
        id: 'TR-05',
        tableName: 'TableDttotMatch',
        tableType: 'Base Alert Table',
        queryData: 'SELECT CIF, CUSTOMER_NAME, NIK AS Identity_Number, MATCH_SCORE FROM EXTERNAL_BLACKLIST WHERE MATCH_STATUS = "Matched With Existing CIF"',
        primaryKey: 'CIF'
      }
    ],
    replacerMappings: [
      {
        id: 'RM-14',
        replacerTag: '$Customer_Name$',
        fieldReplacer: '[TableDttotMatch].[CUSTOMER_NAME]',
        description: 'Nama Nasabah'
      },
      {
        id: 'RM-15',
        replacerTag: '$Identity_Number$',
        fieldReplacer: '[TableDttotMatch].[Identity_Number]',
        description: 'Nomor Identitas NIK/KTP'
      }
    ],
    actionsExecuted: [
      {
        id: 'ACT-05',
        actionType: 'Update Alert Flag',
        statementExecuted: 'UPDATE CIF_MASTER SET ACCOUNT_STATUS = "FREEZE_HOLD" WHERE CIF = $CIF$'
      }
    ],
    attachments: [
      {
        id: 'ATT-04',
        reportName: 'DTTOT_CrossMatch_Audit_Dossier',
        parameter: 'CIF=$CIF$',
        renderAs: 'PDF'
      }
    ],
    createdDate: '2025-05-10 14:00:00',
    updatedDate: '2026-06-05 16:30:00'
  }
];

export const INITIAL_APPLICATION_PARAMETERS: ApplicationParameters = {
  email: {
    smtpServer: 'smtp.banksampoerna.com',
    smtpPort: 587,
    smtpUserId: 'fms-mailer@banksampoerna.com',
    smtpPassword: 'SampoernaMail#2026!',
    smtpSsl: true,
    smtpFrom: 'fms.alert@banksampoerna.com',
    pop3Server: 'pop3.banksampoerna.com',
    pop3Port: 995,
    pop3UserId: 'fms-inbox@banksampoerna.com',
    pop3Password: 'SampoernaPop#2026!',
    pop3Ssl: true,
    isBodyHtml: true,
    isActive: true,
  },
  login: {
    checkIpAddress: true,
    emailTemplateModuleApproval: 'ETPL-001',
    sessionTimeout: 30, // 30 minutes
    maxLoginAttempts: 3,
    lockoutDurationMinutes: 30,
    passwordExpiryDays: 90,
    forcePasswordChangeFirstLogin: true,
    isActive: true,
  },
  message: {
    userLoginFailBecauseDisabled: 'Akun pengguna ini telah dinonaktifkan oleh administrator keamanan Bank Sampoerna. Silakan hubungi IT Helpdesk.',
    userInactiveResponseText: 'Status akun Anda sedang tidak aktif. Harap verifikasi status kepegawaian Anda ke bagian Compliance & Security.',
    concurrentLoginAlert: 'Login failed. User Name is being used on another computer',
    passwordRetryExceededResponse: 'Batas percobaan kata sandi terlampaui. Akun Anda telah terkunci secara otomatis. Hubungi Security Administrator.',
    invalidCredentialResponse: 'Invalid Credential. Please Contact Your Administrator',
    isActive: true,
  },
  integration: {
    kodeKantorPusatKonvensional: '023001',
    kodeKantorPusatSyariah: '023002',
    sandiBankPelapor: '023',
    idOrganisasi: 'BKS-FMS-PROD-01',
    coreBankingPrimaryIp: '10.196.242.20',
    coreBankingSecondaryIp: '10.196.242.21',
    bypassBiAntasenaValidation: false,
    bypassOneReportingValidation: false,
    maxRowToExportErrorValidation: 100000,
    maxSizeXml: 50, // 50 MB
    timeoutApiBi: 60, // 60 Seconds
    xmlrpcRequestTimeout: 30, // 30 Seconds
    isActive: true,
  },
  lastUpdated: '2026-09-04 08:30:00',
  updatedBy: 'yoseph.sanjaya',
  version: '1.14'
};

export const INITIAL_USER_DEFINED_PARAMETERS: UserDefinedParameterConfig = {
  // Frequently Used - Top Section
  jobTypeQueue: 'Single',
  jobTypeQueueActive: true,

  emailToFmsError: 'fms-support@banksampoerna.com, it-ops@banksampoerna.com',
  emailCcFmsError: 'fms-lead@banksampoerna.com',
  emailToAml: 'aml-monitoring@banksampoerna.com, compliance@banksampoerna.com',
  emailToFraud: 'fraud-investigation@banksampoerna.com, afc-alert@banksampoerna.com',
  emailRoutingActive: true,

  // Tab 1: Queue & Memory Limits
  limitQueueOnThread: 8000,
  limitQueueOnThreadActive: true,
  maximumLimitQueueOnMemory: 10000,
  maximumLimitQueueOnMemoryActive: true,
  maxRowJobSingleGetIntoQueueMemory: 5000,
  maxRowJobSingleGetIntoQueueMemoryActive: true,
  maxRowJobBatchGetIntoQueueMemory: 500,
  maxRowJobBatchGetIntoQueueMemoryActive: true,

  // Tab 2: Delay & Scheduler Timers
  delayAtStartQueue: 5,
  delayAtStartQueueActive: true,
  delayAtFinishQueue: 10,
  delayAtFinishQueueActive: true,
  delayRetrySchedulerJobServiceMinute: 60,
  delayRetrySchedulerJobServiceMinuteActive: true,
  retryFromMinute: 360,
  retryFromMinuteActive: true,
  delayInsertTriggerSchedulerProcessSecond: 3,
  delayInsertTriggerSchedulerProcessSecondActive: true,

  // Tab 3: System Rules & Logs
  ruleBlacklistAml: 'AML4,AML 4 - DTTOT & High Risk Cross Match Alert',
  ruleBlacklistAmlActive: true,
  onOffEodLog: true, // 1 = ON, 0 = OFF
  onOffEodLogActive: true,
  concurrentJobBatchHandler: 10,
  concurrentJobBatchHandlerActive: true,

  lastUpdated: '2026-09-04 09:15:00',
  updatedBy: 'yoseph.sanjaya'
};

export const INITIAL_UDP_ITEMS: UserDefinedParameterItem[] = [
  {
    id: 'UDP-001',
    parameterKey: 'FMS_SCHEDULER_JOB_TYPE_QUEUE',
    parameterName: 'FMS Scheduler Job Type Queue',
    parameterValue: 'Single',
    category: 'Screening & Queue',
    dataType: 'SELECT',
    description: 'Metode eksekusi antrean screening transaksi (Single / Batch Processing)',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-002',
    parameterKey: 'EMAIL_TO_FMS_ERROR',
    parameterName: 'EmailTo FMS Error Notification',
    parameterValue: 'fms-support@banksampoerna.com, it-ops@banksampoerna.com',
    category: 'Email Routing',
    dataType: 'STRING',
    description: 'Daftar alamat email penerima notifikasi error sistem & daemon scheduler',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-003',
    parameterKey: 'EMAIL_CC_FMS_ERROR',
    parameterName: 'EmailCc FMS Error Notification',
    parameterValue: 'fms-lead@banksampoerna.com',
    category: 'Email Routing',
    dataType: 'STRING',
    description: 'Tembusan (Cc) email untuk notifikasi insiden kegagalan sistem FMS',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-004',
    parameterKey: 'EMAIL_TO_AML',
    parameterName: 'EmailTo AML',
    parameterValue: 'aml-monitoring@banksampoerna.com, compliance@banksampoerna.com',
    category: 'Email Routing',
    dataType: 'STRING',
    description: 'Daftar alamat email penerima alert otomatis divisi Anti-Money Laundering',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-005',
    parameterKey: 'EMAIL_TO_FRAUD',
    parameterName: 'EmailTo Fraud',
    parameterValue: 'fraud-investigation@banksampoerna.com, afc-alert@banksampoerna.com',
    category: 'Email Routing',
    dataType: 'STRING',
    description: 'Daftar alamat email penerima alert otomatis divisi Anti-Fraud & Triage',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-006',
    parameterKey: 'LIMIT_QUEUE_ON_THREAD',
    parameterName: 'Limit Queue on Thread',
    parameterValue: '8000',
    category: 'Queue & Memory Limits',
    dataType: 'NUMBER',
    description: 'Batas kapasitas antrean per worker thread pipeline screening',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-007',
    parameterKey: 'MAX_LIMIT_QUEUE_ON_MEMORY',
    parameterName: 'Maximum Limit Queue On Memory',
    parameterValue: '10000',
    category: 'Queue & Memory Limits',
    dataType: 'NUMBER',
    description: 'Kapasitas maksimal tampungan buffer antrean di dalam RAM (In-Memory Buffer)',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-008',
    parameterKey: 'MAX_ROW_JOB_SINGLE_INTO_QUEUE',
    parameterName: 'Max Row Job Single Get Into Queue Memory From DB',
    parameterValue: '5000',
    category: 'Queue & Memory Limits',
    dataType: 'NUMBER',
    description: 'Batas baris query fetch database per siklus untuk pemrosesan mode Single',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-009',
    parameterKey: 'MAX_ROW_JOB_BATCH_INTO_QUEUE',
    parameterName: 'Max Row Job Batch Get Into Queue Memory From DB',
    parameterValue: '500',
    category: 'Queue & Memory Limits',
    dataType: 'NUMBER',
    description: 'Batas chunk record transaksi per batch insert ke queue memory',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-010',
    parameterKey: 'DELAY_AT_START_QUEUE',
    parameterName: 'Delay At Start Queue',
    parameterValue: '5',
    category: 'Delay & Scheduler Timers',
    dataType: 'NUMBER',
    description: 'Jeda penundaan inisialisasi antrean saat daemon worker pertama kali start (detik)',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-011',
    parameterKey: 'DELAY_AT_FINISH_QUEUE',
    parameterName: 'Delay At Finish Queue',
    parameterValue: '10',
    category: 'Delay & Scheduler Timers',
    dataType: 'NUMBER',
    description: 'Jeda penutupan graceful shutdown setelah antrean tuntas diproses (detik)',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-012',
    parameterKey: 'DELAY_RETRY_SCHEDULER_MINUTE',
    parameterName: 'Delay Retry Scheduler Job Service (Minute)',
    parameterValue: '60',
    category: 'Delay & Scheduler Timers',
    dataType: 'NUMBER',
    description: 'Interval tunggu sebelum mencoba kembali eksekusi job scheduler yang gagal (menit)',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-013',
    parameterKey: 'RETRY_FROM_MINUTE',
    parameterName: 'Retry from (Minute)',
    parameterValue: '360',
    category: 'Delay & Scheduler Timers',
    dataType: 'NUMBER',
    description: 'Jendela batas waktu ke belakang untuk meninjau transaksi pending retry (menit)',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-014',
    parameterKey: 'DELAY_INSERT_TRIGGER_SECOND',
    parameterName: 'Delay Insert Trigger Scheduler Process in Second',
    parameterValue: '3',
    category: 'Delay & Scheduler Timers',
    dataType: 'NUMBER',
    description: 'Jeda jeda penulisan trigger record ke database untuk mencegah lock contention (detik)',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-015',
    parameterKey: 'RULE_BLACKLIST_AML',
    parameterName: 'Rule Blacklist AML',
    parameterValue: 'AML4,AML 4 - DTTOT & High Risk Cross Match Alert',
    category: 'System Rules & Logs',
    dataType: 'STRING',
    description: 'Pemetaan kode aturan blacklist AML utama yang dievaluasi otomatis oleh screening engine',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-016',
    parameterKey: 'ON_OFF_EOD_LOG',
    parameterName: 'ON/OFF EOD LOG',
    parameterValue: '1',
    category: 'System Rules & Logs',
    dataType: 'BOOLEAN',
    description: 'Status pencatatan log lengkap End-of-Day (1 = ON, 0 = OFF)',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  },
  {
    id: 'UDP-017',
    parameterKey: 'CONCURRENT_JOB_BATCH_HANDLER',
    parameterName: 'ConcurrentJobBatchHandler',
    parameterValue: '10',
    category: 'System Rules & Logs',
    dataType: 'NUMBER',
    description: 'Jumlah instansi worker paralel yang diizinkan memproses batch secara bersamaan',
    isActive: true,
    updatedDate: '2026-09-04 09:15:00',
    updatedBy: 'yoseph.sanjaya'
  }
];

export const INITIAL_USER_SESSIONS: UserSessionRecord[] = [
  {
    id: 'SESS-001',
    userId: 'USR-00101',
    employeeName: 'Budi Santoso',
    username: 'budi.santoso',
    role: 'Fraud Investigator L1',
    group: 'AFC L1',
    status: 'ONLINE',
    failedAttempts: 0,
    maxAttempts: 3,
    lastLoginIp: '10.20.14.88',
    lastActivity: '2026-09-07 23:25:10 WIB',
    sessionStartedAt: '2026-09-07 08:00:00 WIB',
    deviceInfo: 'Chrome 128 / Windows 11'
  },
  {
    id: 'SESS-002',
    userId: 'USR-00102',
    employeeName: 'Siti Rahmawati',
    username: 'siti.rahmawati',
    role: 'Senior Fraud Lead L2',
    group: 'AFC L2',
    status: 'ONLINE',
    failedAttempts: 0,
    maxAttempts: 3,
    lastLoginIp: '10.20.14.92',
    lastActivity: '2026-09-07 23:28:42 WIB',
    sessionStartedAt: '2026-09-07 08:30:00 WIB',
    deviceInfo: 'Chrome 128 / macOS Sonoma'
  },
  {
    id: 'SESS-003',
    userId: 'USR-00201',
    employeeName: 'Agus Pratama',
    username: 'agus.pratama',
    role: 'AML Officer',
    group: 'Analyst L2',
    status: 'LOCKED',
    failedAttempts: 3,
    maxAttempts: 3,
    lastLoginIp: '10.20.18.105',
    lastActivity: '2026-09-07 21:14:02 WIB',
    sessionStartedAt: '-',
    deviceInfo: 'Edge 127 / Windows 11',
    unlockRequested: true,
    unlockRequestNote: 'Helpdesk Call Ref: HD-98120. OTP & Identity verified.'
  },
  {
    id: 'SESS-004',
    userId: 'USR-00202',
    employeeName: 'Hendra Wijaya',
    username: 'hendra.wijaya',
    role: 'AML Analyst L1',
    group: 'Analyst L1',
    status: 'OFFLINE',
    failedAttempts: 1,
    maxAttempts: 3,
    lastLoginIp: '10.20.18.112',
    lastActivity: '2026-09-07 17:30:00 WIB',
    sessionStartedAt: '-',
    deviceInfo: 'Firefox 129 / Windows 10'
  },
  {
    id: 'SESS-005',
    userId: 'USR-00301',
    employeeName: 'Reza Firmansyah',
    username: 'reza.firmansyah',
    role: 'IT Administrator',
    group: 'IT DCA Maker Checker',
    status: 'ONLINE',
    failedAttempts: 0,
    maxAttempts: 3,
    lastLoginIp: '10.20.2.14',
    lastActivity: '2026-09-07 23:29:15 WIB',
    sessionStartedAt: '2026-09-07 13:00:00 WIB',
    deviceInfo: 'Chrome 128 / Windows 11'
  },
  {
    id: 'SESS-006',
    userId: 'USR-00302',
    employeeName: 'Dewi Lestari',
    username: 'dewi.lestari',
    role: 'System Support',
    group: 'IT PSS Maker Checker',
    status: 'LOCKED',
    failedAttempts: 3,
    maxAttempts: 3,
    lastLoginIp: '10.20.2.89',
    lastActivity: '2026-09-07 19:45:10 WIB',
    sessionStartedAt: '-',
    deviceInfo: 'Chrome 128 / Windows 11',
    unlockRequested: false
  },
  {
    id: 'SESS-007',
    userId: 'USR-00401',
    employeeName: 'Rina Kurniawati',
    username: 'rina.kurniawati',
    role: 'Helpdesk Support',
    group: 'IT Helpdesk Support',
    status: 'OFFLINE',
    failedAttempts: 2,
    maxAttempts: 3,
    lastLoginIp: '10.20.5.21',
    lastActivity: '2026-09-07 18:10:00 WIB',
    sessionStartedAt: '-',
    deviceInfo: 'Safari 17 / macOS Ventura'
  }
];



