export type AlertStatus = 'Open' | 'Draft' | 'Pending Approval' | 'Close' | 'Rejected';
export type InvestigationStatus = 'Opened' | 'On Check' | 'Closed' | 'Partial Closed' | 'Done';
export type CaseUrgency = 'Low' | 'Med' | 'High' | 'Critical';
export type HandlingPriority = 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
export type SyncStatus = 'In Sync' | 'Out of Sync';
export type TestingStatus = 'Need Testing' | 'Passed' | 'Failed';
export type RuleDomain = 'Fraud' | 'AML';

export interface VariablePlaceholder {
  id: string;
  key: string; // e.g. {{AMOUNT_LIMIT}}
  label: string; // e.g. Batas Nominal Transaksi
  dataType: 'Number' | 'String' | 'Boolean' | 'Enum';
  defaultValue: string | number | boolean;
  unit?: string; // e.g. IDR, Menit, Kali, %
  enumOptions?: string[];
  description?: string;
}

export interface AiCopilotMetadata {
  isAiGenerated: boolean;
  prompt: string;
  generatedAt: string;
  technicalSummary: string;
  category?: string;
  efficiencyScore?: number;
  bottleneckRisks?: string[];
  optimizationTips?: string[];
  suggestedPlaceholders?: VariablePlaceholder[];
  verifiedByMaker: boolean;
}

export interface RuleTemplate {
  id: string;
  code: string; // e.g. TPL-VEL-01
  name: string;
  description: string;
  version: string; // 1.0, 1.01, 2.0
  status: 'Active' | 'Inactive';
  testingStatus: TestingStatus;
  domain: RuleDomain; // 'Fraud' | 'AML'
  category?: string;
  parameters: VariablePlaceholder[];
  queryLogic: string; // SQL / JSON Expression
  updatedAt: string;
  createdOn: string;
  author: string;
  aiCopilot?: AiCopilotMetadata;
}

export interface AutoBlockConfig {
  cif: boolean;
  sourceAccountNumber: boolean;
  deviceId: boolean;
  phoneNumber: boolean;
}

export interface RuleBasic {
  id: string;
  code: string; // e.g. R-TRX-HIGH-VAL-001
  templateCode: string; // references RuleTemplate.code
  templateVersion: string;
  version: string; // 1.0, 1.01, 2.0
  name: string;
  description: string;
  domain: RuleDomain; // 'Fraud' | 'AML'
  status: 'Active' | 'Inactive';
  syncStatus: SyncStatus;
  testingStatus: TestingStatus;
  baseScore: number;
  caseUrgency: CaseUrgency;
  handlingPriority?: HandlingPriority;
  autoBlock?: AutoBlockConfig;
  txnType: string;
  channel: string;
  parameterValues: Record<string, any>; // key => value
  updatedAt: string;
  createdOn: string;
  author: string;
  history?: RuleHistoryEntry[];
}

export interface RuleHistoryEntry {
  version: string;
  updatedAt: string;
  changes: string;
  updatedBy: string;
}

export interface FormulaRiskMatch {
  formulaId: string;
  formulaCode: string;
  name: string;
  points: number;
  matchedField: string;
  matchedValue: string;
}

export interface TransactionInfo {
  trxId: string;
  amount: number;
  currency: string;
  sourceAccount: string;
  destinationAccount: string;
  destinationBank: string;
  channel: string;
  ipAddress: string;
  location: string;
  deviceModel: string;
  timestamp: string;
  trxType: string;
}

export interface CaseTimelineEntry {
  id: string;
  time: string;
  user: string;
  action: string;
  note?: string;
  statusTransition?: string;
}

export interface FraudCaseAttachment {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  type?: string;
  url?: string;
}

export interface CifHistoricalTransaction {
  id: string;
  trxId: string;
  trxRef?: string;
  timestamp: string;
  trxCategory?: string;
  trxType: string;
  amount: number;
  currency: string;
  sourceAccountName?: string;
  sourceAccount: string;
  sourceAccountVaName?: string;
  sourceAccountVaNumber?: string;
  beneficiaryAccountName?: string;
  destinationAccount: string;
  beneficiaryAccountVaName?: string;
  beneficiaryAccountVaNumber?: string;
  destinationBank: string;
  channel: string;
  origin?: string;
  longitude?: string | number;
  latitude?: string | number;
  status: 'BERHASIL' | 'GAGAL' | 'SUCCESS' | 'SUCCEED' | 'SUSPICIOUS' | 'BLOCKED' | 'FLAGGED' | 'FAILED' | string;
  riskScore: number;
  isCurrentAlertTrigger?: boolean;
  anomalyTag?: string;
  location?: string;
  ipAddress?: string;
  deviceModel?: string;
}

export interface FraudCase {
  id: string;
  no: number;
  caseId: string;
  identifiedOn: string;
  alertStatus: AlertStatus;
  investigationStatus: InvestigationStatus;
  assignee: string;
  ruleTemplateCode: string;
  ruleBasicCode: string;
  ruleName: string;
  caseUrgency: CaseUrgency;
  baseScore: number;
  formulaRiskPoints: number;
  finalRiskScore: number;
  finalRiskLevel: CaseUrgency;
  customerName: string;
  customerId?: string;
  cif: string;
  accountNumber?: string;
  sourceVirtualAccount?: string;
  sourceVirtualAccountName?: string;
  linkedAccount?: string;
  deviceId: string;
  phoneNumber: string;
  aging: string;
  transaction: TransactionInfo;
  formulaMatches: FormulaRiskMatch[];
  timeline: CaseTimelineEntry[];
  alertCategory: 'Fraud' | 'AML';
  batchId?: string;
  
  // Alert source classification
  isManualAlert?: boolean;
  alertSourceType?: 'System' | 'Manual';
  source?: string;
  detectionDate?: string;
  externalCaseId?: string;
  incidentDescription?: string;
  note?: string;
  transactionEvidenceList?: TransactionInfo[];
  
  // Follow Up Form Fields (Bank Sampoerna Neo FMS Spec)
  reviewer?: string;
  reviewerResult?: string;
  reviewerComment?: string;
  finalResult?: string;
  closingAction?: string;
  typeOfFraud?: string;
  attachments?: FraudCaseAttachment[];
  
  // Approval fields
  approvedBy?: string;
  approvedAt?: string;
  approverNotes?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  
  // Legacy / fallback
  resolutionNotes?: string;
  disposition?: 'Pending' | 'True Positive (Fraud)' | 'False Positive' | 'Suspicious / Escalate' | 'Customer Confirmed';
}

export interface AmlCifGroup {
  batchId?: string;
  cif: string;
  customerName: string;
  cases: FraudCase[];
  totalCases: number;
  highestUrgency: CaseUrgency;
  maxRiskScore: number;
  maxRiskLevel: CaseUrgency;
  identifiedRange: string;
  rulesViolated: Array<{ code: string; name: string; score: number }>;
  assignees: string[];
  overallStatus: AlertStatus;
  investigationStatus: InvestigationStatus;
  deviceId: string;
  phoneNumber: string;
  maxAging: string;
}

export type BacktestCategory = 
  | 'New Rule' 
  | 'New Config Template' 
  | 'New Config Basic' 
  | 'Dependency Change' 
  | 'Comparison';

export interface BacktestingSession {
  id: string;
  category: BacktestCategory;
  ruleTemplateId?: string;
  ruleTemplateCode?: string;
  ruleTemplateVersion?: string;
  ruleBasicId?: string;
  ruleBasicCode?: string;
  ruleBasicVersion?: string;
  targetVersion: string;
  datasetPeriod: string;
  totalTransactionsTested: number;
  triggeredAlertsCount: number;
  estimatedFPRate: number; // in percentage, e.g. 3.4%
  impactedCifsCount: number;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  passed: boolean;
  createdAt: string;
  logs: string[];
  syncApplied?: boolean;
}

export interface FormulaCondition {
  field: string;
  operator: 'EQUALS' | 'IN' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'IS_TRUE';
  value: string;
}

export type RiskIndicator = 
  | 'Blacklist' 
  | 'Watchlist' 
  | 'Repeated Offender' 
  | 'New Device' 
  | 'Off-Hours' 
  | 'Dormant Account';

export type RepeatedOffenderScope = 'Same Rule Basic Only' | 'Any Rule Basic (Cross-Rule)';

export interface RepeatedOffenderConfig {
  triggerScope: RepeatedOffenderScope;
  thresholdFrequency: number;
  lookbackWindowValue: number;
  lookbackWindowUnit: 'Hours' | 'Days';
}

export interface FormulaRisk {
  id: string;
  code: string;
  name: string;
  description: string;
  scope: 'Global' | 'Specific';
  isGlobal?: boolean;
  specificRuleCodes: string[];
  targetRuleCode?: string; // for legacy support
  riskIndicators: RiskIndicator[];
  repeatedOffenderConfig?: RepeatedOffenderConfig;
  points: number; // e.g. +10, +15, +20
  status: 'Active' | 'Inactive';
  createdAt?: string;
  author?: string;
}

export type ListType = 'Blacklist' | 'Watchlist' | 'Whitelist';
export type ListDomain = 'FRAUD' | 'AML';
export type EntitySubTab = 'CIF' | 'Source Account Number' | 'Device ID' | 'Phone Number';

export type ListCategory = 
  | 'CIF' 
  | 'Source Account Number' 
  | 'Destination Account Number' 
  | 'Beneficiary Bank Code' 
  | 'NIK / KTP' 
  | 'Device ID' 
  | 'IP Address / Subnet' 
  | 'Phone Number' 
  | 'Merchant ID / Terminal ID';

export interface BlacklistEntry {
  id: string;
  type: ListType;
  category: 'FRAUD' | 'AML'; // Primary Category: FRAUD vs AML
  domain?: 'FRAUD' | 'AML';
  entityType: EntitySubTab | ListCategory;
  value: string;
  holderName?: string;
  reason: string;
  tags: string[];
  riskWeight: number;
  source: string;
  addedBy: string;
  addedAt?: string;
  createdAt?: string;
  expiryDate?: string;
  matchCount?: number;
  status: 'Active' | 'Expired' | 'Suspended' | 'Revoked';
  applyToAllRules?: boolean;
  appliedRuleCodes?: string[];
}

export interface ListEntry {
  id: string;
  type: ListType;
  domain?: 'FRAUD' | 'AML';
  category: ListCategory;
  listCategory?: 'FRAUD' | 'AML';
  entityType?: EntitySubTab | ListCategory;
  value: string;
  holderName?: string;
  reason: string;
  tags: string[];
  riskWeight: number;
  source: string;
  addedBy: string;
  addedAt?: string;
  createdAt?: string;
  expiryDate?: string;
  matchCount?: number;
  status: 'Active' | 'Expired' | 'Suspended' | 'Revoked' | 'Pending Approval' | 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'SCHEDULED_INACTIVE';
  applyToAllRules?: boolean;
  appliedRuleCodes?: string[];

  // Batch / Bulk Import & Maker-Checker fields
  batchId?: string;
  ticketId?: string;
  cif?: string;
  accountNumber?: string;

  // Whitelist Specific Fields (Date Range & Recurring Payroll)
  whitelistType?: 'PERMANENT' | 'DATE_RANGE' | 'RECURRING_MONTHLY';
  startDate?: string;
  endDate?: string;
  recurringDayOfMonth?: number;
  customerName?: string;
}

export interface BatchUploadDraft {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  targetDomain: 'FRAUD' | 'AML';
  targetListType: ListType;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  rows: any[];
}

export interface WhitelistEntry {
  id: string;
  category: 'FRAUD' | 'AML';
  entityType: 'CIF' | 'ACCOUNT' | 'DEVICE_ID' | 'PHONE';
  entityValue: string;
  customerName?: string;
  whitelistType: 'PERMANENT' | 'DATE_RANGE' | 'RECURRING_MONTHLY';
  // Untuk Specific Date Range
  startDate?: string;
  endDate?: string;
  // Untuk Recurring Monthly (Payroll)
  recurringDayOfMonth?: number; // Contoh: 25 untuk tanggal 25 setiap bulan
  reason: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SCHEDULED_INACTIVE';
  createdBy: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  domain: 'FRAUD' | 'AML' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetTab?: string;
  ticketId?: string;
  targetRole?: string;
}

export type RuleTicketActionType = 'CREATE' | 'UPDATE' | 'DELETE';
export type RuleTicketStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RuleApprovalTicket {
  id: string; // e.g. "TKT-TPL-20260907-001"
  ticketNo: string; // e.g. "TKT-2026-0041"
  targetType: 'Template' | 'Basic' | 'Formula' | 'CIF' | 'Source Account Number' | 'Device ID' | 'Phone Number' | string;
  domain: RuleDomain | 'Fraud' | 'AML' | string; // 'Fraud' | 'AML'
  actionType: RuleTicketActionType;
  targetCode: string; // e.g. "TPL-VEL-01" or "R-TRX-HIGH-VAL-001"
  targetName: string;
  status: RuleTicketStatus;
  makerName: string;
  makerRole: string;
  createdAt: string;
  makerNotes?: string;
  checkerName?: string;
  checkerRole?: string;
  reviewedAt?: string;
  checkerNotes?: string;
  changeSummary: string;
  previousData?: RuleTemplate | RuleBasic | FormulaRisk | ListEntry | any;
  proposedData?: RuleTemplate | RuleBasic | FormulaRisk | ListEntry | any;
  versionFrom?: string;
  versionTo?: string;
}

export type ActiveNavTab = 
  | 'dashboard'
  | 'case-management-system-alert'
  | 'case-management-manual-alert'
  | 'rule-template-fraud-view'
  | 'rule-template-fraud-approval'
  | 'rule-template-aml-view'
  | 'rule-template-aml-approval'
  | 'rule-basic-fraud-view'
  | 'rule-basic-fraud-approval'
  | 'rule-basic-aml-view'
  | 'rule-basic-aml-approval'
  | 'rule-engine-backtesting'
  | 'risk-engine-formula-view'
  | 'risk-engine-formula-approval'
  | 'list-management-cif-view'
  | 'list-management-cif-approval'
  | 'list-management-cif-fraud-view'
  | 'list-management-cif-fraud-approval'
  | 'list-management-cif-aml-view'
  | 'list-management-cif-aml-approval'
  | 'list-management-account-view'
  | 'list-management-account-approval'
  | 'list-management-account-fraud-view'
  | 'list-management-account-fraud-approval'
  | 'list-management-account-aml-view'
  | 'list-management-account-aml-approval'
  | 'list-management-device-view'
  | 'list-management-device-approval'
  | 'list-management-device-fraud-view'
  | 'list-management-device-fraud-approval'
  | 'list-management-device-aml-view'
  | 'list-management-device-aml-approval'
  | 'list-management-phone-view'
  | 'list-management-phone-approval'
  | 'list-management-phone-fraud-view'
  | 'list-management-phone-fraud-approval'
  | 'list-management-phone-aml-view'
  | 'list-management-phone-aml-approval'
  | 'case-system-alert-fraud'
  | 'case-system-alert-aml'
  | 'aml-master-blacklist-view'
  | 'aml-master-blacklist-approval'
  | 'aml-external-blacklist-view'
  | 'aml-external-blacklist-approval'
  | 'system-parameter-user-view'
  | 'system-parameter-user-approval'
  | 'system-parameter-group-view'
  | 'system-parameter-group-approval'
  | 'system-parameter-role-view'
  | 'system-parameter-role-approval'
  | 'system-parameter-access-menu-view'
  | 'system-parameter-access-menu-approval'
  | 'system-parameter-application-view'
  | 'system-parameter-application-approval'
  | 'system-parameter-udp-view'
  | 'system-parameter-udp-approval'
  | 'system-parameter-email-template-view'
  | 'system-parameter-email-template-approval'
  | 'system-parameter-user-session-view'
  | 'system-parameter-user-session-approval'
  | 'system-user-session'
  | 'system-parameter-watchlist-location'
  | 'system-parameter-watchlist-location-view'
  | 'system-parameter-watchlist-location-approval'
  | 'watchlist-location'
  | 'customer-profile'
  | 'debit-card-profile'
  | 'transaction-history'
  | 'card-transaction'
  | 'alert-fraud'
  | 'alert-aml'
  | 'manual-alert-fraud'
  | 'manual-alert-aml'
  | 'investigation-history'
  | 'investigation-history-fraud'
  | 'investigation-history-aml'
  | 'shift-schedule'
  | 'rule-template'
  | 'rule-basic'
  | 'backtesting'
  | 'formula-risk'
  | 'blacklist'
  | 'watchlist'
  | 'whitelist'
  | 'lists'
  | 'management-list'
  | 'external-blacklist'
  | 'aml-master-blacklist'
  | 'reports'
  | 'report-fraud'
  | 'report-aml'
  | 'system-parameter'
  | 'system-user'
  | 'system-group'
  | 'system-role'
  | 'system-access-menu'
  | 'system-email-template'
  | 'system-application-parameter'
  | 'system-user-defined-parameter'
  | 'process'
  | 'process-task'
  | 'process-list'
  | 'process-manual-execution'
  | 'audit-trail'
  | 'audit-trail-system'
  | 'audit-trail-changes'
  | 'audit-trail-login'
  | 'audit-trail-access'
  | 'audit-trail-mail';

// ==========================================
// CUSTOMER PROFILE TYPES (360° VIEW)
// ==========================================
export type CustomerStatusType = 'Active' | 'Inactive' | 'Dormant' | 'Suspend / Blocked';
export type CustomerRiskRatingType = 'High' | 'Medium' | 'Low';
export type CustomerTypeCategory = 'Individual' | 'Corporate' | 'SME / Prioritas';
export type CustomerIdDocType = 'KTP' | 'SIM' | 'Paspor' | 'KITAS';

export interface CustomerProfileRecord {
  id: string; // Customer ID, e.g. CUST-2021-08192
  cif: string; // CIF, e.g. CIF1089201
  customerName: string; // e.g. dr. Budi Rahardjo Sp.A
  customerStartDate: string; // e.g. 15 Mar 2021
  branchId: string; // e.g. KC Jakarta Sudirman (014)
  crManager: string; // e.g. Siti Rahmawati - CRM Private Banking
  dateOfLastDueDiligence: string; // e.g. 12 Agu 2026
  customerStatus: CustomerStatusType;
  riskRatingTest: CustomerRiskRatingType;

  // Tab 1: Personal & General Information
  emailAddress: string;
  personId: string;
  customerSource: string;
  customerType: CustomerTypeCategory;
  idType: CustomerIdDocType;
  idNumber: string;

  fullName: string;
  nickName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  placeOfBirth: string;

  // Additional rich profile details
  phoneNumber?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  occupation?: string;
  employerName?: string;
  monthlyIncomeRange?: string;
  sourceOfFunds?: string;
  taxId?: string; // NPWP
  pepStatus?: boolean; // Politically Exposed Person
  kycTier?: string; // e.g. Tier 3 - Enhanced Due Diligence
  totalAccountsCount?: number;
  associatedAccounts?: Array<{ accountNumber: string; accountType: string; status: string; balance: number }>;
  deviceId?: string;
  deviceModel?: string;
  transactionHistory?: CustomerTransactionRecord[];
  totalActiveAlertsCount?: number;
  notes?: string;
}

export interface CustomerTransactionRecord {
  // 14 MANDATORY FIELDS
  id: string; // 1. Transaction ID (ID Transaksi Sistem)
  transactionRef: string; // 2. Transaction Reference (Nomor Referensi Transaksi / FT / RRN)
  deviceId: string; // 3. Device ID (Identitas Unik Perangkat)
  deviceModel: string; // 4. Device Model (Tipe/Model HP Perangkat)
  longitude: string | number; // 5. Longitude (Koordinat Lokasi)
  latitude: string | number; // 6. Latitude (Koordinat Lokasi)
  phoneNumber: string; // 7. Phone Number (Nomor Telepon Terdaftar)
  transactionDate: string; // 8. Transaction Date (Tanggal & Waktu Transaksi)
  transactionCategory: 'Incoming Transfer' | 'Outgoing Transfer' | 'ONUS'; // 9. Transaction Category
  amount: number; // 10. Transaction Amount (Nominal Transaksi)
  beneficiaryAccountName: string; // 11. Beneficiary Account Name (Nama Rekening Penerima)
  beneficiaryAccountNumber: string; // 12. Beneficiary Account Number (Nomor Rekening Penerima)
  beneficiaryVaName?: string; // 13. Beneficiary Account VA Name (Nama Virtual Account Penerima - jika ada)
  beneficiaryVaNumber?: string; // 14. Beneficiary Account VA Number (Nomor Virtual Account Penerima - jika ada)

  // Source Account & Additional Context Fields
  sourceAccount: string; // Source Account (Nomor Rekening Sumber/Asal)
  accountNumber?: string; // Backward-compatible alias for sourceAccount
  sourceAccountType?: string; // e.g. "Giro Utama (IDR)", "Tabungan Bisnis"
  channel?: string; // e.g. "BI-FAST", "Sampoerna Mobile", "QRIS", "ATM", "RTOL"
  direction?: 'CR' | 'DB';
  status: 'BERHASIL' | 'GAGAL' | 'PENDING' | 'SUCCESS';
  beneficiaryBank?: string; // e.g. "Bank Central Asia (BCA)", "Bank Mandiri", "Bank Sampoerna (ONUS)"
  availableBalance?: number;
  ipAddress?: string;
  notes?: string;
}

// ==========================================
// DEBIT CARD PROFILE & HISTORY TYPES
// ==========================================
export type DebitCardStatusType = 
  | 'Active' 
  | 'Blocked - Fraud Suspicion' 
  | 'Blocked - Lost/Stolen' 
  | 'Blocked - PIN Exceeded' 
  | 'Temporary Locked' 
  | 'Inactive' 
  | 'Expired' 
  | 'Closed';

export type DebitCardTypeCategory = 
  | 'GPN Chip Regular' 
  | 'GPN Chip Bisnis' 
  | 'Mastercard Platinum' 
  | 'Mastercard Gold' 
  | 'Mastercard Prioritas' 
  | 'Visa Gold Debit' 
  | 'Visa Platinum Corporate';

export interface CardHistoryRecord {
  id: string;
  cardHistoryStatus: 'ISSUED' | 'ACTIVATED' | 'PIN_GENERATED' | 'TEMPORARY_LOCK' | 'BLOCKED_FRAUD' | 'BLOCKED_LOST' | 'UNBLOCKED' | 'REPLACED' | 'CLOSED' | 'LIMIT_UPDATED';
  cardHistorySequence: number;
  cardHistoryStartTime: string;
  notes?: string;
  channel?: string;
  operator?: string;
}

export interface DebitCardRecord {
  id: string;
  cardId: string;
  cardNumber: string; // e.g. "5371 45** **** 8821"
  rawCardNumber?: string;
  cardType: DebitCardTypeCategory;
  cardName: string; // Name printed on card
  linkedAccountNumbers: string[];
  primaryAccount: string;
  activatedTimestamp: string;
  expirationTimestamp: string;
  closedTimestamp: string;
  cardBlockCode: string; // e.g. '00 - NORMAL' | '67 - SUSPECTED FRAUD' | '41 - LOST CARD'
  status: DebitCardStatusType;
  cif: string;
  customerName: string;
  branchCode: string;
  chipType?: string;

  // Limits (Section Kanan)
  withdrawalLimit: number;
  dailyWithdrawalLimit: number;
  posTransactionLimit: number;
  dailyPosTransactionLimit: number;
  ecommerceTransactionLimitAmount: number;
  ecommerceDailyLimitAmount: number;
  contactlessDailyLimitAmount: number;

  // History (Section B)
  history: CardHistoryRecord[];
}

// ==========================================
// EXTERNAL BLACKLIST TYPES
// ==========================================
export type ExternalIdentityType = 'NIK / KTP' | 'Passport' | 'NPWP';
export type ExternalDataSource = 
  | 'DTTOT' 
  | 'Regulator (OJK/BI)' 
  | 'Konsorsium Perbankan' 
  | 'Aparat Penegak Hukum' 
  | 'Internal Inquiry';
export type ExternalThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM';
export type ExternalMatchStatus = 'No Match' | 'Matched With Existing CIF';

export interface ExternalBlacklistEntry {
  id: string;
  // Section 1: Data Identitas Personal
  fullName: string;
  identityType: ExternalIdentityType;
  identityNumber: string;
  birthDate?: string;
  birthPlace?: string;
  citizenship?: string;

  // Section 2: Data Kontak & Rekening Tambahan
  accountNumber?: string;
  bankName?: string;
  phoneNumber?: string;

  // Section 3: Sumber & Legal Basis
  source: ExternalDataSource;
  referenceNumber: string;
  threatLevel: ExternalThreatLevel;
  reason: string;

  // System & Match metadata
  createdAt: string;
  createdBy: string;
  matchStatus: ExternalMatchStatus;
  matchedCif?: string;
  matchedCustomerName?: string;
  lastCheckedAt?: string;
}

// ==========================================
// REPORT & ANALYTICS TYPES
// ==========================================
export type ReportDomain = 'Fraud' | 'AML';
export type ReportViewTab = 'investigator' | 'customer' | 'rule';
export type DateRangePreset = 'today' | 'last7days' | 'thisMonth' | 'last3Months' | 'custom';
export type ChartVisualizationType = 'donut' | 'bar' | 'line' | 'none';

export interface InvestigatorPerformance {
  id: string;
  no: number;
  name: string;
  role: 'L1 Maker' | 'L1 Maker (Fraud)' | 'AML Analyst' | 'AML Compliance Analyst' | string;
  domain: ReportDomain;
  totalHandled: number;
  confirmedCount: number;
  falsePositiveCount: number;
  pendingEscalated: number;
  avgHandlingTime: string;
  slaStatus: 'Compliant' | 'Warning' | 'Breach';
  slaRate: number;
}

export interface CustomerRuleSummary {
  id: string;
  no: number;
  cif: string;
  customerName: string;
  accountNumber: string;
  domain: ReportDomain;
  totalRuleTriggered: number;
  highestRiskScore: number;
  totalTxnValueIdr: number;
  currentStatus: 'Hold Account' | 'Active' | 'Suspended' | 'Monitoring';
  lastAlertDate: string;
}

export type RuleHealthStatus = 'OPTIMAL' | 'NEEDS REVIEW' | 'HIGH NOISE';
export type RuleUrgency = 'High' | 'Medium' | 'Low';

export interface RulePerformanceItem {
  id: string;
  ruleCode: string;
  ruleName: string;
  ruleType: 'Basic' | 'Template';
  domain: ReportDomain;
  urgency: RuleUrgency;
  totalAlertGenerated: number; // Total Hits
  openCases: number;
  inInvestigation: number; // On Check / In Investigation
  confirmedTruePositive: number; // Confirmed Fraud / AML
  falsePositiveCount: number; // False Positive Count
  pendingEscalated: number; // Pending Approval / Escalated
  falsePositiveRate: number; // percentage e.g. 17.6 -> (falsePositiveCount / totalAlertGenerated) * 100
  accuracyScore: number; // percentage e.g. 82.4
  healthStatus?: RuleHealthStatus; // OPTIMAL (<30%), NEEDS REVIEW (30-70%), HIGH NOISE (>70%)
  recommendedAction: 'Needs Fine-Tuning' | 'Optimal' | 'Adjust Threshold' | 'Review Inactive' | string;
  monthlyBreakdown?: Record<string, number>; // e.g. { 'Aug 2026': 142, 'Jul 2026': 118, 'Jun 2026': 80 }
}

export interface UserAnalysisCase {
  id: string;
  caseId: string;
  customerId: string;
  customerCif: string;
  customerName?: string;
  sourceAccount: string;
  sourceVirtualAccountNumber: string;
  sourceVirtualAccountName: string;
  identifiedOn: string;
  finalResultName: 'Undefine' | 'Confirmed Fraud' | 'Non-Fraud' | 'Confirmed AML' | 'False Positive' | string;
  ruleCode: string;
  ruleName: string;
  caseStatusName: 'OPEN' | 'ON_CHECK' | 'CLOSED';
  amount?: number;
  channel?: string;
}

// ==========================================
// SHIFTING & DUTY MANAGEMENT (FMS ROSTER)
// ==========================================
export type ShiftCode = 'SHIFT-1' | 'SHIFT-2' | 'SHIFT-3' | 'OFF';
export type ShiftName = 'Shift 1 (Pagi)' | 'Shift 2 (Siang)' | 'Shift 3 (Malam)' | 'Libur / Off';
export type InvestigatorRole = 'L1 Maker' | 'L2 Checker' | 'Supervisor' | 'AML Analyst';
export type ShiftDutyStatus = 'On Duty' | 'Off Duty' | 'Standby' | 'On Leave';

export interface InvestigatorProfile {
  id: string;
  name: string;
  role: InvestigatorRole;
  email: string;
  phone: string;
  avatarBg: string;
  department: string;
  activeOnDuty?: boolean;
}

export interface ShiftDefinition {
  code: ShiftCode;
  name: ShiftName;
  hours: string;
  startTime: string;
  endTime: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface ShiftSchedule {
  id: string;
  userId: string;
  userName: string;
  role: InvestigatorRole;
  date: string; // YYYY-MM-DD
  shiftCode: ShiftCode;
  shiftName: string;
  shiftHours: string;
  status: ShiftDutyStatus;
  notes?: string;
  updatedAt?: string;
}

export interface ShiftHandover {
  id: string;
  handoverNo: string;
  timestamp: string;
  offloadingUserId: string;
  offloadingUserName: string;
  offloadingRole: InvestigatorRole;
  receivingUserId: string;
  receivingUserName: string;
  receivingRole: InvestigatorRole;
  shiftFrom: string;
  shiftTo: string;
  caseIds: string[];
  criticalCaseCount: number;
  notes: string;
  status: 'Pending' | 'Acknowledged';
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// ==========================================
// INVESTIGATION HISTORY & AUDIT SNAPSHOT TYPES
// ==========================================
export type HistoryDomain = 'Fraud' | 'AML';
export type HistoryClosingStatus = 
  | 'CLOSED - CONFIRMED FRAUD' 
  | 'CLOSED - CONFIRMED AML' 
  | 'CLOSED - FALSE POSITIVE'
  | 'CLOSED - SUSPICIOUS / MONITORING'
  | 'CLOSED - ESCALATED / STR REPORTED'
  | string;

export interface HistoryOfficerProfile {
  id: string;
  name: string;
  unit: string;
  actionTime: string;
  recommendation?: string;
  decision?: string;
  notes?: string;
}

export interface HistoryAnomalyTransaction {
  no: number;
  trxId: string;
  timestamp: string;
  channel: string;
  amount: number;
  currency: string;
  statusFlag: 'SUSPICIOUS' | 'CONFIRMED FRAUD' | 'CONFIRMED AML' | 'BLOCKED' | 'FLAGGED' | 'CLEARED' | 'HIGH RISK' | 'SUCCESS' | 'BERHASIL' | 'FAILED' | 'GAGAL' | 'DIBLOKIR' | 'PENDING';
  sourceAccount: string;
  destinationAccount: string;
  destinationBank: string;
  trxType?: string;
}

export interface HistoryAuditTimeline {
  id: string;
  timestamp: string;
  stage: string;
  user: string;
  role: string;
  action: string;
  details?: string;
  statusTransition?: string;
}

export interface ViolatedRuleItem {
  ruleCaseId?: string;
  ruleCode: string;
  ruleName: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  hitCount: number;
  pointsAdded: number;
  triggerCondition?: string;
  triggeredAmountIdr?: number;
  transactions?: HistoryAnomalyTransaction[];
}

export interface InvestigationHistoryItem {
  id: string;
  caseId: string;
  ticketTitle: string;
  domain: HistoryDomain;
  alertCategory: 'Fraud' | 'AML';
  closedAt: string;
  closedDateOnly: string;
  customerName: string;
  customerType: 'Individual' | 'Corporate';
  cif: string;
  accountNumber: string;
  sourceAccount?: string;
  ruleBasicCode: string;
  ruleBasicName: string;
  ruleTemplateCode?: string;
  violatedRules?: ViolatedRuleItem[];
  slaLevel: HandlingPriority;
  lossAmountIdr: number;
  incidentDescription: string;
  reportingUnit: string;
  branchOffice: string;
  
  // Dual Control
  l1Maker: HistoryOfficerProfile;
  l2Checker: HistoryOfficerProfile;
  
  // Closing Status
  closingStatus: HistoryClosingStatus;
  closingAction: string;
  typeOfFraud?: string;
  typeOfAml?: string;

  // L1 Follow-Up & Reviewer Payload (Precise Audit Record)
  reviewerResult?: string;
  finalResult?: string;
  reviewerComment?: string;
  approverComment?: string;
  approvedBy?: string;
  submittedBy?: string;
  
  // Risk Profile Snapshot (Immutable)
  riskScoreSnapshot: number;
  riskLevelSnapshot: CaseUrgency;
  baseScoreSnapshot: number;
  repeatedOffenderAdjustment: number;
  formulaAdjustments: Array<{
    code: string;
    name: string;
    points: number;
    matchedField: string;
    matchedValue: string;
  }>;
  formulaResultTotal: number;
  
  // Anomaly Transactions (AML Batch / Fraud Outlier)
  anomalyTransactions: HistoryAnomalyTransaction[];
  
  // Audit Timeline
  auditTimeline: HistoryAuditTimeline[];
  
  // Digital Security Signature for Immutability
  auditHash: string;
  
  // Post-Closure Analysis Attachments
  postClosureAttachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    uploadedBy: string;
    uploadedRole: string;
    timestamp: string;
  }>;
}

export type AmlHistoryEntry = InvestigationHistoryItem;

// ==========================================
// AML CIF GROUPED HISTORY TYPES
// ==========================================
export interface AmlChildRuleHistoryItem {
  id?: string;
  caseId: string;
  ruleCode: string;
  ruleName: string;
  ruleTemplateCode?: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  urgency?: CaseUrgency;
  amount?: number;
  identifiedOn?: string;
  channel?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  destinationBank?: string;
  
  // Follow-up decision per child rule
  reviewerResult: string;
  finalResult: string;
  closingAction: string;
  typeOfAml?: string;
  typeOfFraud?: string;
  reviewerComment: string;
  approverComment?: string;
  approvedBy?: string;
  approvedAt?: string;
  l1Maker?: string;
  l2Checker?: string;
  status?: string;
  transactionEvidenceList?: any[];
  transaction?: any;
}

export interface AmlCifHistoryGroup {
  id: string; // e.g. "aml-hist-cif-CIF8829103-20260911123000"
  batchId?: string; // e.g. "BATCH-20260825-001"
  investigationId?: string; // unique investigation incident/approval ID
  cif: string;
  customerName: string;
  customerType?: 'Individual' | 'Corporate';
  accountNumber?: string;
  deviceId?: string;
  phoneNumber?: string;
  totalRulesResolved: number;
  highestRiskScore: number;
  investigationStatus: 'Closed';
  completionDate: string; // "YYYY-MM-DD HH:mm:ss"
  completionDateOnly?: string;
  
  // Aggregate decisions / summaries
  overallClosingStatus?: string; // e.g. "CLOSED - CONFIRMED AML" | "CLOSED - SUSPICIOUS" | "CLOSED - FALSE POSITIVE"
  overallClosingAction?: string;
  overallFinalResult?: string;
  overallReviewerResult?: string;
  overallTypeOfAml?: string;
  
  // Officer details
  l1Maker: {
    name: string;
    unit?: string;
    notes?: string;
    actionTime?: string;
  };
  l2Checker: {
    name: string;
    unit?: string;
    notes?: string;
    actionTime?: string;
  };
  
  // Child rules violated and resolved
  childRules: AmlChildRuleHistoryItem[];
  cases?: FraudCase[];

  // Post-Closure Analysis Attachments
  postClosureAttachments?: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    uploadedBy: string;
    uploadedRole: string;
    timestamp: string;
  }>;
}

// ==========================================
// TRANSACTION HISTORY TYPES (PROFILE DOMAIN)
// ==========================================
export interface TransactionHistoryRecord {
  // Primary Identifiers
  id: string; // e.g. "TXD-20260901-89012"
  PK_OneFcc_Case_Management_Transaction_Detail_ID: number | string;
  Customer_ID?: string; // Optional (Standardized to CIF)
  Source_CIF: string; // Primary CIF Identifier
  Source_Account_Number: string;
  Source_Account_Name: string;
  Beneficiary_CIF: string;
  Beneficiary_Account_Number: string;
  Beneficiary_Account_Name: string;

  // Transaction Specification
  Transaction_ID: string;
  Transaction_Reference: string; // e.g. "REF-BIFAST-998231"
  ftNumber?: string; // Nomor FT (Financial Transaction Reference Number)
  Case_ID?: string; // e.g. "CAS-20260825-00109" (populated when flagged)
  Transaction_Datetime: string; // e.g. "2026-09-01 14:22:19 WIB"
  Transaction_Date?: string;
  Transaction_Location: string; // e.g. "Jakarta Pusat - Internet Banking IP 103.149.12.88"
  Currency_Code: string; // e.g. "IDR" | "USD"
  Total_Balance: number; // Available Balance (Saldo Akhir Nasabah)
  Transaction_amount: number; // Nominal Transaksi
  destination_Account_VA: string;
  destination_account_VA_name: string;
  Source_Account_VA: string;
  source_account_VA_name: string;
  vaNumber?: string; // Virtual Account (VA) Number
  rule_bifast: string;

  // Technical & Device Audit Data
  deviceId?: string; // Device ID (UUID / Hash)
  deviceModel?: string; // Device Model (e.g. iPhone 15 Pro, Samsung Galaxy S24)
  ipAddress?: string; // IP Address
  rrn?: string; // RRN (Retrieval Reference Number)
  merchantName?: string; // Merchant Name / Terminal ID
  transactionCategory?: 'Incoming' | 'Outgoing' | 'ONUS' | 'Incoming Transfer' | 'Outgoing Transfer' | string;

  // Metadata & Status
  Flagged: boolean; // or 'YES' | 'NO'
  flagReason?: string;
  channel: 'BI-FAST' | 'Virtual Account' | 'RTOL' | 'RTGS' | 'QRIS' | 'ATM' | 'Over-the-Counter' | 'Internal Transfer' | string;
  transactionStatus?: 'BERHASIL' | 'GAGAL' | 'SUCCESS' | 'SUSPICIOUS' | 'FLAGGED' | 'BLOCKED' | 'PENDING' | 'REJECTED' | string;
  riskScore?: number;
  terminalId?: string;
  notes?: string;
}

// ==========================================
// CARD TRANSACTION TYPES (PROFILE DOMAIN)
// ==========================================
export interface CardTransactionRecord {
  // Section 1: Basic Transaction Info
  id: string; // e.g. "CTX-20260902-001"
  Customer_ID: string; // e.g. "CUST-BSS-892102"
  Customer_CIF: string; // e.g. "CIF-882910"
  Transaction_ID: string; // e.g. "TXN-CARD-20260902-88019"
  Record_ID: string | number; // e.g. "REC-9821039" or 9821039
  Account_Number: string; // e.g. "1098200192"
  Card_ID: string; // e.g. "5379-4112-8829-1092"
  Additional_Datetime: string; // e.g. "2026-09-02 15:42:10 WIB"
  Processing_Code: string; // e.g. "000000 (Purchase / Goods & Services)"

  // Section 2: Amount & Settlement Detail
  Transaction_Currency_Code: string; // e.g. "IDR (360)"
  Transaction_Amount: number; // in IDR
  Transaction_Fee_Amount: number;
  Settlement_Amount: number;
  Cardholder_Billing_Amount: number;
  Cardholder_Billing_Fee_Amount: number;
  Date_Settlement: string; // e.g. "2026-09-02"

  // Section 3: POS & Merchant Technical Data
  Merchant_Type: string; // MCC e.g. "5411 (Grocery Stores, Supermarkets)"
  Trimmed_Acquiring_Institution: string; // e.g. "BANK CENTRAL ASIA"
  Pos_Entry_Mode: string; // e.g. "051 (Integrated Circuit Card / EMV Chip with PIN)"
  Pos_Condition_Code: string; // e.g. "00 (Normal Presentment)"
  Pos_Pin_Capture: string; // e.g. "12 (PIN Entered Online)"
  Acquiring_Institution_Code: string; // e.g. "014000"
  Reference_Retrieval_Number: string; // RRN e.g. "260902881920"
  Authorization_Identification_Response: string; // Auth Code e.g. "AUTH88192"
  Response_Code: string; // e.g. "00 (Approved)"
  Receiving_Institution_Code: string; // e.g. "503 (PT Bank Sahabat Sampoerna)"

  // Section 4: Virtual Account & Audit Info
  Source_Account_VA: string; // e.g. "VA-881029102"
  Source_Account_VA_Name: string; // e.g. "Sampoerna Mobile Saver Primary"
  Destination_Account_VA: string; // e.g. "VA-990192801"
  Destination_Account_VA_Name: string; // e.g. "Indomaret Point Settlement VA"
  Account_Identification_1: string; // e.g. "ACC-ID1-PRIMARY-SAVINGS"
  Account_Identification_2: string; // e.g. "ACC-ID2-DEBIT-LINK-5379"
  Transaction_Description: string; // e.g. "Debit Card Purchase at INDOMARET POINT SENAYAN"
  Created_By: string; // e.g. "SWITCH_ENGINE_ISO8583"
  Created_Date: string; // e.g. "2026-09-02 15:42:11 WIB"
  Last_Update_By: string; // e.g. "SETTLEMENT_BATCH_DAEMON"
  Last_Update_Date: string; // e.g. "2026-09-02 23:30:00 WIB"

  // Auxiliary Fields for Lookup Grid & UI Badges
  Local_Time: string; // e.g. "15:42:10"
  Local_Date: string; // e.g. "2026-09-02"
  Terminal_ID?: string; // e.g. "EDC-IDM-9912"
  Merchant_Name?: string; // e.g. "Indomaret Point Senayan Park"
  Channel_Type?: 'EDC POS' | 'ATM' | 'E-COMMERCE 3DS' | 'QRIS CPM';
  Flagged?: boolean;
  Risk_Score?: number;
}

