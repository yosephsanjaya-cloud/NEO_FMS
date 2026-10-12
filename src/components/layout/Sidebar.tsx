import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3,
  AlertOctagon, 
  FileCheck, 
  Cpu, 
  Layers, 
  PlayCircle, 
  Sliders, 
  ShieldCheck, 
  ShieldAlert,
  Eye,
  ChevronDown, 
  ChevronRight,
  Database,
  UserCheck,
  CreditCard,
  Smartphone,
  Phone,
  CalendarClock,
  Globe,
  Landmark,
  FileWarning,
  History,
  Archive,
  FileCheck2,
  Lock,
  Users,
  Receipt,
  ArrowLeftRight,
  Terminal,
  LogIn,
  KeyRound,
  Mail,
  Workflow,
  Folder,
  ListChecks,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { 
    activeTab, 
    setActiveTab, 
    fraudCases, 
    amlGroups, 
    ruleTemplates,
    ruleBasics,
    listEntries,
    activeListType,
    setActiveListType,
    activeListCategory,
    setActiveListCategory,
    blacklistDomain,
    setBlacklistDomain,
    ruleTemplateDomain,
    setRuleTemplateDomain,
    ruleBasicDomain,
    setRuleBasicDomain,
    shiftHandovers,
    onDutyInvestigators,
    externalBlacklistEntries,
    systemUsers,
    systemGroups,
    systemRoles,
    emailTemplates,
    auditSystemLogs,
    auditChangeLogs,
    auditUserLogins,
    auditUserAccesses,
    auditMailLogs,
    processTasks,
    processList,
    processExecutions,
    amlBlacklistEntries,
    getPendingRuleApprovalCount
  } = useFMS();

  // Expandable state for sub-menus
  const [reportsOpen, setReportsOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(true);
  const [caseMenuOpen, setCaseMenuOpen] = useState(true);
  const [ruleMenuOpen, setRuleMenuOpen] = useState(true);
  const [ruleTemplateSubOpen, setRuleTemplateSubOpen] = useState(true);
  const [ruleTemplateFraudOpen, setRuleTemplateFraudOpen] = useState(true);
  const [ruleTemplateAmlOpen, setRuleTemplateAmlOpen] = useState(false);
  const [ruleBasicSubOpen, setRuleBasicSubOpen] = useState(true);
  const [ruleBasicFraudOpen, setRuleBasicFraudOpen] = useState(true);
  const [ruleBasicAmlOpen, setRuleBasicAmlOpen] = useState(false);

  // Batch 2: Risk Engine & List Management Accordion States
  const [riskEngineMenuOpen, setRiskEngineMenuOpen] = useState(true);
  const [formulaRiskSubOpen, setFormulaRiskSubOpen] = useState(true);

  const [listManagementMenuOpen, setListManagementMenuOpen] = useState(true);
  const [cifSubOpen, setCifSubOpen] = useState(true);
  const [cifFraudOpen, setCifFraudOpen] = useState(true);
  const [cifAmlOpen, setCifAmlOpen] = useState(false);
  
  const [accountSubOpen, setAccountSubOpen] = useState(false);
  const [accountFraudOpen, setAccountFraudOpen] = useState(true);
  const [accountAmlOpen, setAccountAmlOpen] = useState(false);
  
  const [deviceSubOpen, setDeviceSubOpen] = useState(false);
  const [deviceFraudOpen, setDeviceFraudOpen] = useState(true);
  const [deviceAmlOpen, setDeviceAmlOpen] = useState(false);
  
  const [phoneSubOpen, setPhoneSubOpen] = useState(false);
  const [phoneFraudOpen, setPhoneFraudOpen] = useState(true);
  const [phoneAmlOpen, setPhoneAmlOpen] = useState(false);

  const [blacklistMenuOpen, setBlacklistMenuOpen] = useState(true);
  const [blacklistFraudOpen, setBlacklistFraudOpen] = useState(true);
  const [blacklistAmlOpen, setBlacklistAmlOpen] = useState(true);
  const [watchlistMenuOpen, setWatchlistMenuOpen] = useState(false);
  const [watchlistFraudOpen, setWatchlistFraudOpen] = useState(true);
  const [watchlistAmlOpen, setWatchlistAmlOpen] = useState(true);
  const [whitelistMenuOpen, setWhitelistMenuOpen] = useState(false);
  const [whitelistFraudOpen, setWhitelistFraudOpen] = useState(true);
  const [whitelistAmlOpen, setWhitelistAmlOpen] = useState(true);
  const [investigationHistorySubOpen, setInvestigationHistorySubOpen] = useState(true);
  const [systemParameterOpen, setSystemParameterOpen] = useState(true);
  const [processMenuOpen, setProcessMenuOpen] = useState(true);
  const [auditTrailOpen, setAuditTrailOpen] = useState(true);

  // Batch 3: AML Management & System Parameter Accordion States
  const [amlManagementMenuOpen, setAmlManagementMenuOpen] = useState(true);
  const [amlMasterBlacklistSubOpen, setAmlMasterBlacklistSubOpen] = useState(true);
  const [amlExternalBlacklistSubOpen, setAmlExternalBlacklistSubOpen] = useState(false);

  const [sysUserSubOpen, setSysUserSubOpen] = useState(true);
  const [sysGroupSubOpen, setSysGroupSubOpen] = useState(false);
  const [sysRoleSubOpen, setSysRoleSubOpen] = useState(false);
  const [sysAccessMenuSubOpen, setSysAccessMenuSubOpen] = useState(false);
  const [sysAppParamSubOpen, setSysAppParamSubOpen] = useState(false);
  const [sysUdpSubOpen, setSysUdpSubOpen] = useState(false);
  const [sysEmailTemplateSubOpen, setSysEmailTemplateSubOpen] = useState(false);
  const [sysUserSessionSubOpen, setSysUserSessionSubOpen] = useState(false);
  const [sysWatchlistLocationSubOpen, setSysWatchlistLocationSubOpen] = useState(false);

  // Batch 2 & Batch 3 Pending Counts for Badges
  const formulaPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Formula') : 0;
  
  const cifFraudPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('CIF', 'Fraud') : 0;
  const cifAmlPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('CIF', 'AML') : 0;
  const cifPending = cifFraudPending + cifAmlPending;

  const accountFraudPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Source Account Number', 'Fraud') : 0;
  const accountAmlPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Source Account Number', 'AML') : 0;
  const accountPending = accountFraudPending + accountAmlPending;

  const deviceFraudPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Device ID', 'Fraud') : 0;
  const deviceAmlPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Device ID', 'AML') : 0;
  const devicePending = deviceFraudPending + deviceAmlPending;

  const phoneFraudPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Phone Number', 'Fraud') : 0;
  const phoneAmlPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Phone Number', 'AML') : 0;
  const phonePending = phoneFraudPending + phoneAmlPending;
  
  const listManagementTotalPending = cifPending + accountPending + devicePending + phonePending;

  const amlMasterBlacklistPending = getPendingRuleApprovalCount('AML Master Blacklist');
  const amlExternalBlacklistPending = getPendingRuleApprovalCount('External Blacklist');
  const amlManagementTotalPending = amlMasterBlacklistPending + amlExternalBlacklistPending;

  const sysUserPending = getPendingRuleApprovalCount('User Management');
  const sysGroupPending = getPendingRuleApprovalCount('Group Management');
  const sysRolePending = getPendingRuleApprovalCount('Role Management');
  const sysAccessMenuPending = getPendingRuleApprovalCount('Access Menu Management');
  const sysAppParamPending = getPendingRuleApprovalCount('Application Parameter');
  const sysUdpPending = getPendingRuleApprovalCount('User Defined Parameter');
  const sysEmailTemplatePending = getPendingRuleApprovalCount('Email Template');
  const sysUserSessionPending = getPendingRuleApprovalCount('User Session & Lockout');
  const sysWatchlistLocationPending = getPendingRuleApprovalCount('Watchlist Location');
  const systemParameterTotalPending = sysUserPending + sysGroupPending + sysRolePending + sysAccessMenuPending + sysAppParamPending + sysUdpPending + sysEmailTemplatePending + sysUserSessionPending + sysWatchlistLocationPending;

  // Auto-expand accordion if the active tab belongs to a section
  const isProfileActive = (
    activeTab === 'customer-profile' || 
    activeTab === 'debit-card-profile' || 
    activeTab === 'transaction-history' || 
    activeTab === 'card-transaction'
  );

  const isAmlManagementActive = (
    activeTab === 'aml-master-blacklist-view' ||
    activeTab === 'aml-master-blacklist-approval' ||
    activeTab === 'aml-external-blacklist-view' ||
    activeTab === 'aml-external-blacklist-approval' ||
    activeTab === 'aml-master-blacklist' ||
    activeTab === 'external-blacklist'
  );

  const isSystemParameterActive = (
    activeTab === 'system-parameter-user-view' ||
    activeTab === 'system-parameter-user-approval' ||
    activeTab === 'system-parameter-group-view' ||
    activeTab === 'system-parameter-group-approval' ||
    activeTab === 'system-parameter-role-view' ||
    activeTab === 'system-parameter-role-approval' ||
    activeTab === 'system-parameter-access-menu-view' ||
    activeTab === 'system-parameter-access-menu-approval' ||
    activeTab === 'system-parameter-application-view' ||
    activeTab === 'system-parameter-application-approval' ||
    activeTab === 'system-parameter-udp-view' ||
    activeTab === 'system-parameter-udp-approval' ||
    activeTab === 'system-parameter-email-template-view' ||
    activeTab === 'system-parameter-email-template-approval' ||
    activeTab === 'system-parameter-user-session-view' ||
    activeTab === 'system-parameter-user-session-approval' ||
    activeTab === 'system-parameter-watchlist-location-view' ||
    activeTab === 'system-parameter-watchlist-location-approval' ||
    activeTab === 'system-parameter-watchlist-location' ||
    activeTab === 'watchlist-location' ||
    activeTab === 'system-parameter' ||
    activeTab === 'system-user' ||
    activeTab === 'system-group' ||
    activeTab === 'system-role' ||
    activeTab === 'system-access-menu' ||
    activeTab === 'system-email-template' ||
    activeTab === 'system-application-parameter' ||
    activeTab === 'system-user-defined-parameter' ||
    activeTab === 'system-user-session'
  );

  const isProcessActive = (
    activeTab === 'process' ||
    activeTab === 'process-task' ||
    activeTab === 'process-list' ||
    activeTab === 'process-manual-execution'
  );

  const isAuditTrailActive = (
    activeTab === 'audit-trail' ||
    activeTab === 'audit-trail-system' ||
    activeTab === 'audit-trail-changes' ||
    activeTab === 'audit-trail-login' ||
    activeTab === 'audit-trail-access' ||
    activeTab === 'audit-trail-mail'
  );

  useEffect(() => {
    if (isProfileActive) {
      setProfileMenuOpen(true);
    }
  }, [activeTab, isProfileActive]);

  useEffect(() => {
    if (isSystemParameterActive) {
      setSystemParameterOpen(true);
      if (activeTab.startsWith('system-parameter-watchlist-location') || activeTab === 'watchlist-location') {
        setSysWatchlistLocationSubOpen(true);
      }
    }
  }, [activeTab, isSystemParameterActive]);

  useEffect(() => {
    if (isProcessActive) {
      setProcessMenuOpen(true);
    }
  }, [activeTab, isProcessActive]);

  useEffect(() => {
    if (isAuditTrailActive) {
      setAuditTrailOpen(true);
    }
  }, [activeTab, isAuditTrailActive]);

  useEffect(() => {
    if (activeTab === 'rule-template-fraud-view' || activeTab === 'rule-template-fraud-approval') {
      setRuleMenuOpen(true);
      setRuleTemplateSubOpen(true);
      setRuleTemplateFraudOpen(true);
    } else if (activeTab === 'rule-template-aml-view' || activeTab === 'rule-template-aml-approval') {
      setRuleMenuOpen(true);
      setRuleTemplateSubOpen(true);
      setRuleTemplateAmlOpen(true);
    } else if (activeTab === 'rule-basic-fraud-view' || activeTab === 'rule-basic-fraud-approval') {
      setRuleMenuOpen(true);
      setRuleBasicSubOpen(true);
      setRuleBasicFraudOpen(true);
    } else if (activeTab === 'rule-basic-aml-view' || activeTab === 'rule-basic-aml-approval') {
      setRuleMenuOpen(true);
      setRuleBasicSubOpen(true);
      setRuleBasicAmlOpen(true);
    } else if (activeTab === 'rule-template') {
      setRuleMenuOpen(true);
      setRuleTemplateSubOpen(true);
    } else if (activeTab === 'rule-basic') {
      setRuleMenuOpen(true);
      setRuleBasicSubOpen(true);
    } else if (activeTab === 'rule-engine-backtesting' || activeTab === 'backtesting' || activeTab === 'formula-risk') {
      setRuleMenuOpen(true);
    }
  }, [activeTab]);

  // Rule Ticket Approval Badges (Maker-Checker Queue)
  const tplFraudPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Template', 'Fraud') : 0;
  const tplAmlPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Template', 'AML') : 0;
  const tplTotalPending = tplFraudPending + tplAmlPending;

  const basicFraudPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Basic', 'Fraud') : 0;
  const basicAmlPending = getPendingRuleApprovalCount ? getPendingRuleApprovalCount('Basic', 'AML') : 0;
  const basicTotalPending = basicFraudPending + basicAmlPending;

  const ruleEngineTotalPending = tplTotalPending + basicTotalPending;

  // Counter badges (Total cases per queue / category)
  const systemFraudCount = fraudCases.filter(c => c.alertCategory === 'Fraud' && !c.isManualAlert).length;
  const systemAmlCount = amlGroups.length;
  const manualFraudCount = fraudCases.filter(c => c.alertCategory === 'Fraud' && (c.isManualAlert || c.alertSourceType === 'Manual')).length;
  const manualAmlCount = fraudCases.filter(c => c.alertCategory === 'AML' && (c.isManualAlert || c.alertSourceType === 'Manual')).length;
  
  const historyFraudCount = 4 + fraudCases.filter(c => c.alertCategory === 'Fraud' && c.alertStatus === 'Close').length;
  const historyAmlCount = 3 + fraudCases.filter(c => c.alertCategory === 'AML' && c.alertStatus === 'Close').length;
  const totalHistoryCount = historyFraudCount + historyAmlCount;
  
  const totalOpenCases = systemFraudCount + systemAmlCount + manualFraudCount + manualAmlCount;
  const outOfSyncRules = ruleBasics.filter(rb => rb.syncStatus === 'Out of Sync').length;

  const fraudTplCount = ruleTemplates.filter(t => (t.domain || 'Fraud') === 'Fraud').length;
  const amlTplCount = ruleTemplates.filter(t => t.domain === 'AML').length;
  const fraudBasicCount = ruleBasics.filter(rb => (rb.domain || 'Fraud') === 'Fraud').length;
  const amlBasicCount = ruleBasics.filter(rb => rb.domain === 'AML').length;

  const getListCount = (type: 'Blacklist' | 'Watchlist' | 'Whitelist', domain?: 'FRAUD' | 'AML', category?: string) => {
    return listEntries.filter(e => {
      if (e.type !== type) return false;
      const d = (e.domain || e.listCategory || 'FRAUD') as 'FRAUD' | 'AML';
      if (domain && d !== domain) return false;
      if (category && category !== 'All') {
        const c = e.entityType || e.category;
        return c === category;
      }
      return true;
    }).length;
  };

  const handleListSubNav = (type: 'Blacklist' | 'Watchlist' | 'Whitelist', domain: 'FRAUD' | 'AML', category: string) => {
    setActiveListType(type);
    setBlacklistDomain(domain);
    setActiveListCategory(category);
    if (type === 'Blacklist') setActiveTab('blacklist');
    else if (type === 'Watchlist') setActiveTab('watchlist');
    else setActiveTab('whitelist');
  };

  const handleListDomainNav = (type: 'Blacklist' | 'Watchlist' | 'Whitelist', domain: 'FRAUD' | 'AML') => {
    setActiveListType(type);
    setBlacklistDomain(domain);
    setActiveListCategory('All');
    if (type === 'Blacklist') setActiveTab('blacklist');
    else if (type === 'Watchlist') setActiveTab('watchlist');
    else setActiveTab('whitelist');
  };

  const navItemClass = (isActive: boolean) => cn(
    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
    isActive
      ? "bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600 shadow-xs"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  );

  const subNavItemClass = (isActive: boolean) => cn(
    "w-full flex items-center justify-between pl-6 pr-3 py-1.5 rounded-md text-xs transition-all duration-150",
    isActive
      ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
  );

  const subCategories = [
    { label: 'CIF', icon: UserCheck },
    { label: 'Source Account Number', icon: CreditCard },
    { label: 'Device ID', icon: Smartphone },
    { label: 'Phone Number', icon: Phone },
  ];

  // =========================================================================
  // RBAC DYNAMIC MENU ACCESS & PERMISSION CALCULATIONS
  // =========================================================================
  const isSysAdmin = !user || user.username === 'sysadmin' || user.riskDomain === 'FULL ACCESS' || user.group === 'IT DCA Maker Checker' || user.group === 'Administrator';
  const isFraudAllowed = isSysAdmin || user?.riskDomain === 'FRAUD ONLY' || user?.role?.toLowerCase().includes('fraud') || user?.group?.includes('AFC');
  const isAmlAllowed = isSysAdmin || user?.riskDomain === 'AML ONLY' || user?.role?.toLowerCase().includes('aml') || user?.group?.includes('Analyst');

  const isFraudMaker = user?.username === 'afcl1' || user?.group === 'AFC L1';
  const isFraudApprover = isSysAdmin || user?.username === 'afcl2' || user?.group === 'AFC L2' || user?.role?.includes('Checker') || user?.role?.includes('Approver');

  const isAmlMaker = user?.username === 'analystl1' || user?.group === 'Analyst L1';
  const isAmlApprover = isSysAdmin || user?.username === 'analystl2' || user?.group === 'Analyst L2' || user?.role?.includes('Checker') || user?.role?.includes('Approver');

  // Sub-menu Approval Visibility (Makers NEVER see Approval sub-menus; Approvers & sysadmin see them)
  const canSeeFraudApproval = isSysAdmin || (isFraudApprover && !isFraudMaker);
  const canSeeAmlApproval = isSysAdmin || (isAmlApprover && !isAmlMaker);

  // Watchlist Location RBAC:
  // HANYA boleh diakses oleh pengguna dengan role Sysadmin dan domain Fraud (AFC L1 & AFC L2)
  // Sembunyikan/blokir akses menu ini secara total untuk peran AML (Analyst L1 & Analyst L2)
  const isAmlOnlyUser = user?.riskDomain === 'AML ONLY' || user?.username === 'analystl1' || user?.username === 'analystl2' || user?.group === 'Analyst L1' || user?.group === 'Analyst L2';
  const isFraudUser = user?.riskDomain === 'FRAUD ONLY' || user?.username === 'afcl1' || user?.username === 'afcl2' || user?.group === 'AFC L1' || user?.group === 'AFC L2' || user?.role?.toLowerCase().includes('fraud');
  const canSeeWatchlistLocation = (isSysAdmin || isFraudUser) && !isAmlOnlyUser;

  // System Parameter is visible if Sysadmin OR if user can access Watchlist Location
  const canSeeSystemParam = isSysAdmin || canSeeWatchlistLocation;
  const canSeeProcess = isSysAdmin;
  const canSeeAuditTrail = isSysAdmin;

  // Auto-adjust default domain sub-openers based on current user
  useEffect(() => {
    if (user?.riskDomain === 'AML ONLY') {
      setRuleTemplateFraudOpen(false);
      setRuleTemplateAmlOpen(true);
      setRuleBasicFraudOpen(false);
      setRuleBasicAmlOpen(true);
      setCifFraudOpen(false);
      setCifAmlOpen(true);
      setAccountFraudOpen(false);
      setAccountAmlOpen(true);
      setDeviceFraudOpen(false);
      setDeviceAmlOpen(true);
      setPhoneFraudOpen(false);
      setPhoneAmlOpen(true);
    } else if (user?.riskDomain === 'FRAUD ONLY') {
      setRuleTemplateFraudOpen(true);
      setRuleTemplateAmlOpen(false);
      setRuleBasicFraudOpen(true);
      setRuleBasicAmlOpen(false);
      setCifFraudOpen(true);
      setCifAmlOpen(false);
      setAccountFraudOpen(true);
      setAccountAmlOpen(false);
      setDeviceFraudOpen(true);
      setDeviceAmlOpen(false);
      setPhoneFraudOpen(true);
      setPhoneAmlOpen(false);
    }
  }, [user]);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none overflow-y-auto z-20">
      <div className="flex-1 flex flex-col">
        
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-xs">
              N
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">NEO FMS</span>
              <span className="text-[11px] text-slate-500 font-medium block">Bank Sampoerna Engine</span>
            </div>
          </div>
        </div>

        {/* Navigation Group */}
        <nav className="flex-1 py-3 px-3 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-1 font-mono">
            Intelligence
          </div>

          {/* 1. Dashboard */}
          <button
            id="nav-dashboard-btn"
            onClick={() => setActiveTab('dashboard')}
            className={navItemClass(activeTab === 'dashboard')}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className={cn("w-4 h-4", activeTab === 'dashboard' ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              <span>Dashboard Overview</span>
            </div>
          </button>

          {/* 1.B Report & Analytics */}
          {(isFraudAllowed || isAmlAllowed) && (
            <div className="pt-1">
              <button
                id="nav-reports-group"
                onClick={() => setReportsOpen(!reportsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-800">Report &amp; Analytics</span>
                </div>
                {reportsOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {reportsOpen && (
                <div className="mt-0.5 space-y-0.5 border-l-2 border-blue-200 ml-4 pl-1">
                  {isFraudAllowed && (
                    <button
                      id="nav-report-fraud-btn"
                      onClick={() => setActiveTab('report-fraud')}
                      className={cn(
                        "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                        (activeTab === 'report-fraud' || activeTab === 'reports') ? "bg-red-50 text-red-700 font-bold border-l-2 border-red-600" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span>Fraud</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[10px] font-mono font-bold">
                        Fraud
                      </span>
                    </button>
                  )}

                  {isAmlAllowed && (
                    <button
                      id="nav-report-aml-btn"
                      onClick={() => setActiveTab('report-aml')}
                      className={cn(
                        "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                        activeTab === 'report-aml' ? "bg-amber-50 text-amber-800 font-bold border-l-2 border-amber-600" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>AML</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                        AML
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. Case Management */}
          {(isFraudAllowed || isAmlAllowed) && (
            <div className="pt-1">
              <button
                id="nav-case-management-group"
                onClick={() => setCaseMenuOpen(!caseMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-slate-800">Case Management</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {totalOpenCases > 0 && (
                    <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold font-mono">
                      {totalOpenCases}
                    </span>
                  )}
                  {caseMenuOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </button>

              {caseMenuOpen && (
                <div className="mt-0.5 space-y-1.5 border-l-2 border-red-200 ml-4 pl-1">
                  {/* 2.A System Alert Sub-Group */}
                  <div className="space-y-0.5">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Folder className="w-3 h-3 text-red-500" />
                        <span>System Alert</span>
                      </span>
                      {(systemFraudCount + systemAmlCount) > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-700 text-[10px] font-mono font-bold border border-red-200">
                          {systemFraudCount + systemAmlCount}
                        </span>
                      )}
                    </div>
                    
                    {/* System Alert -> Fraud */}
                    {isFraudAllowed && (
                      <button
                        id="nav-system-alert-fraud-btn"
                        onClick={() => setActiveTab('alert-fraud')}
                        className={cn(
                          "w-full flex items-center justify-between pl-4 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                          (activeTab === 'alert-fraud' || activeTab === 'case-system-alert-fraud' || (activeTab === 'case-management-system-alert')) ? "bg-red-50 text-red-700 font-bold border-l-2 border-red-600" : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span>Fraud</span>
                        </div>
                        {systemFraudCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[10px] font-mono font-bold">
                            {systemFraudCount}
                          </span>
                        )}
                      </button>
                    )}

                    {/* System Alert -> AML */}
                    {isAmlAllowed && (
                      <button
                        id="nav-system-alert-aml-btn"
                        onClick={() => setActiveTab('alert-aml')}
                        className={cn(
                          "w-full flex items-center justify-between pl-4 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                          (activeTab === 'alert-aml' || activeTab === 'case-system-alert-aml') ? "bg-amber-50 text-amber-900 font-bold border-l-2 border-amber-600" : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>AML</span>
                        </div>
                        {systemAmlCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                            {systemAmlCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* 2.B Manual Alert Sub-Group */}
                  <div className="space-y-0.5 pt-1 border-t border-slate-100">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Folder className="w-3 h-3 text-amber-500" />
                        <span>Manual Alert</span>
                      </span>
                      {(manualFraudCount + manualAmlCount) > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10px] font-mono font-bold border border-amber-200">
                          {manualFraudCount + manualAmlCount}
                        </span>
                      )}
                    </div>

                    {/* Manual Alert -> Fraud */}
                    {isFraudAllowed && (
                      <button
                        id="nav-manual-alert-fraud-btn"
                        onClick={() => setActiveTab('manual-alert-fraud')}
                        className={cn(
                          "w-full flex items-center justify-between pl-4 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                          activeTab === 'manual-alert-fraud' ? "bg-red-50 text-red-700 font-bold border-l-2 border-red-600" : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          <span>Fraud</span>
                        </div>
                        {manualFraudCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[10px] font-mono font-bold">
                            {manualFraudCount}
                          </span>
                        )}
                      </button>
                    )}

                    {/* Manual Alert -> AML */}
                    {isAmlAllowed && (
                      <button
                        id="nav-manual-alert-aml-btn"
                        onClick={() => setActiveTab('manual-alert-aml')}
                        className={cn(
                          "w-full flex items-center justify-between pl-4 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                          activeTab === 'manual-alert-aml' ? "bg-amber-50 text-amber-900 font-bold border-l-2 border-amber-600" : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>AML</span>
                        </div>
                        {manualAmlCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                            {manualAmlCount}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2.C Investigation History */}
          {(isFraudAllowed || isAmlAllowed) && (
            <div className="space-y-0.5 pt-0.5">
              <button
                id="nav-investigation-history-group"
                onClick={() => {
                  setInvestigationHistorySubOpen(!investigationHistorySubOpen);
                  if (!investigationHistorySubOpen) {
                    if (isFraudAllowed) {
                      setActiveTab('investigation-history-fraud');
                    } else if (isAmlAllowed) {
                      setActiveTab('investigation-history-aml');
                    }
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer",
                  (activeTab === 'investigation-history' || activeTab === 'investigation-history-fraud' || activeTab === 'investigation-history-aml')
                    ? "bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-600 shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <History className={cn("w-4 h-4", (activeTab === 'investigation-history' || activeTab === 'investigation-history-fraud' || activeTab === 'investigation-history-aml') ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                  <span className="font-medium text-slate-800">Investigation History</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono font-bold">
                    {totalHistoryCount}
                  </span>
                  {investigationHistorySubOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {investigationHistorySubOpen && (
                <div className="mt-0.5 space-y-0.5 border-l-2 border-blue-200 ml-4 pl-1">
                  {/* 1. Fraud History Sub-Item (Urutan Pertama) */}
                  {isFraudAllowed && (
                    <button
                      id="nav-investigation-history-fraud-btn"
                      onClick={() => setActiveTab('investigation-history-fraud')}
                      className={cn(
                        "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                        (activeTab === 'investigation-history-fraud' || activeTab === 'investigation-history') ? "bg-red-50 text-red-700 font-bold border-l-2 border-red-600" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span>Fraud History</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[10px] font-mono font-bold">
                        {historyFraudCount}
                      </span>
                    </button>
                  )}

                  {/* 2. AML History Sub-Item (Urutan Kedua) */}
                  {isAmlAllowed && (
                    <button
                      id="nav-investigation-history-aml-btn"
                      onClick={() => setActiveTab('investigation-history-aml')}
                      className={cn(
                        "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer",
                        activeTab === 'investigation-history-aml' ? "bg-amber-50 text-amber-900 font-bold border-l-2 border-amber-600" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>AML History</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                        {historyAmlCount}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Jadwal Shifting (Roster & Duty Management) - Only for Fraud/AFC & Sysadmin */}
          {isFraudAllowed && (
            <button
              id="nav-shift-schedule-btn"
              onClick={() => setActiveTab('shift-schedule')}
              className={navItemClass(activeTab === 'shift-schedule')}
            >
              <div className="flex items-center space-x-2.5">
                <CalendarClock className={cn("w-4 h-4", activeTab === 'shift-schedule' ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                <span>Jadwal Shifting</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {shiftHandovers.filter(h => h.status === 'Pending').length > 0 ? (
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold font-mono">
                    {shiftHandovers.filter(h => h.status === 'Pending').length} HO
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold">
                    {onDutyInvestigators.length} On
                  </span>
                )}
              </div>
            </button>
          )}

          {/* PROFILE GROUP (COLLAPSIBLE ACCORDION) */}
          <div className="pt-1">
            <button
              id="nav-profile-group"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer group",
                isProfileActive
                  ? "bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600 shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <div className="flex items-center space-x-2.5">
                <Users className={cn("w-4 h-4", isProfileActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700")} />
                <span className="font-medium text-slate-800">Profile</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={cn(
                  "px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold border",
                  isProfileActive
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                )}>
                  360°
                </span>
                {profileMenuOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {profileMenuOpen && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-blue-200 ml-4 pl-1">
                {/* 1. Customer Profile */}
                <button
                  id="nav-customer-profile-btn"
                  onClick={() => setActiveTab('customer-profile')}
                  className={cn(
                    "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer group",
                    activeTab === 'customer-profile'
                      ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all shrink-0",
                      activeTab === 'customer-profile'
                        ? "bg-blue-600 ring-2 ring-blue-300 scale-125"
                        : "bg-slate-400 group-hover:bg-slate-600"
                    )}></span>
                    <span className="truncate">Customer Profile</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold",
                    activeTab === 'customer-profile'
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-blue-50/60 text-blue-600 border-blue-200/80"
                  )}>
                    360°
                  </span>
                </button>

                {/* 2. Debit Card Profile */}
                <button
                  id="nav-debit-card-profile-btn"
                  onClick={() => setActiveTab('debit-card-profile')}
                  className={cn(
                    "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer group",
                    activeTab === 'debit-card-profile'
                      ? "bg-emerald-50 text-emerald-800 font-bold border-l-2 border-emerald-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all shrink-0",
                      activeTab === 'debit-card-profile'
                        ? "bg-emerald-600 ring-2 ring-emerald-300 scale-125"
                        : "bg-slate-400 group-hover:bg-slate-600"
                    )}></span>
                    <span className="truncate">Debit Card Profile</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.2 rounded border font-semibold",
                    activeTab === 'debit-card-profile'
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-emerald-50/60 text-emerald-700 border-emerald-200/80"
                  )}>
                    EMV
                  </span>
                </button>

                {/* 3. Transaction History */}
                <button
                  id="nav-transaction-history-btn"
                  onClick={() => setActiveTab('transaction-history')}
                  className={cn(
                    "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer group",
                    activeTab === 'transaction-history'
                      ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all shrink-0",
                      activeTab === 'transaction-history'
                        ? "bg-blue-600 ring-2 ring-blue-300 scale-125"
                        : "bg-slate-400 group-hover:bg-slate-600"
                    )}></span>
                    <span className="truncate">Transaction History</span>
                  </div>
                  <span className={cn(
                    "text-[9px] font-mono px-1.5 py-0.2 rounded border",
                    activeTab === 'transaction-history'
                      ? "bg-blue-100 text-blue-700 border-blue-300 font-semibold"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    Log
                  </span>
                </button>

                {/* 4. Card Transaction */}
                <button
                  id="nav-card-transaction-btn"
                  onClick={() => setActiveTab('card-transaction')}
                  className={cn(
                    "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition cursor-pointer group",
                    activeTab === 'card-transaction'
                      ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all shrink-0",
                      activeTab === 'card-transaction'
                        ? "bg-blue-600 ring-2 ring-blue-300 scale-125"
                        : "bg-slate-400 group-hover:bg-slate-600"
                    )}></span>
                    <span className="truncate">Card Transaction</span>
                  </div>
                  <span className={cn(
                    "text-[9px] font-mono px-1.5 py-0.2 rounded border",
                    activeTab === 'card-transaction'
                      ? "bg-blue-100 text-blue-700 border-blue-300 font-semibold"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    POS/ATM
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mt-4 mb-1 font-mono">
            Logic Engine
          </div>

          {/* 3. Rule Engine */}
          <div className="space-y-0.5">
            <button
              id="nav-rule-engine-group"
              onClick={() => setRuleMenuOpen(!ruleMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              <div className="flex items-center space-x-2.5">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-slate-800">Rule Engine</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {!ruleMenuOpen && ruleEngineTotalPending > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-bold font-mono shadow-xs">
                    {ruleEngineTotalPending}
                  </span>
                )}
                {ruleMenuOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </button>

            {ruleMenuOpen && (
              <div className="mt-0.5 space-y-1 border-l-2 border-blue-200 ml-4 pl-1">
                
                {/* 📁 Rule Template */}
                <div className="space-y-0.5">
                  <button
                    id="nav-rule-template-parent"
                    onClick={() => setRuleTemplateSubOpen(!ruleTemplateSubOpen)}
                    className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rule Template</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {!ruleTemplateSubOpen && tplTotalPending > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                          {tplTotalPending}
                        </span>
                      )}
                      {ruleTemplateSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {ruleTemplateSubOpen && (
                    <div className="mt-0.5 space-y-0.5 border-l border-slate-200 ml-3 pl-1">
                      
                      {/* 📁 Fraud */}
                      {isFraudAllowed && (
                        <div className="space-y-0.5">
                          <button
                            id="nav-rule-template-fraud-folder"
                            onClick={() => setRuleTemplateFraudOpen(!ruleTemplateFraudOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              <span className="font-semibold text-slate-800">Fraud</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!ruleTemplateFraudOpen && tplFraudPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {tplFraudPending}
                                </span>
                              )}
                              {ruleTemplateFraudOpen ? (
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {ruleTemplateFraudOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-red-200 ml-3 pl-1">
                              {/* 📄 View */}
                              <button
                                id="nav-rule-template-fraud-view"
                                onClick={() => {
                                  setRuleTemplateDomain('Fraud');
                                  setActiveTab('rule-template-fraud-view');
                                }}
                                className={subNavItemClass(activeTab === 'rule-template-fraud-view' || (activeTab === 'rule-template' && ruleTemplateDomain === 'Fraud'))}
                              >
                                <span>View</span>
                              </button>

                              {/* 📄 Approval [ Badge ] */}
                              {canSeeFraudApproval && (
                                <button
                                  id="nav-rule-template-fraud-approval"
                                  onClick={() => {
                                    setRuleTemplateDomain('Fraud');
                                    setActiveTab('rule-template-fraud-approval');
                                  }}
                                  className={subNavItemClass(activeTab === 'rule-template-fraud-approval')}
                                >
                                  <div className="flex items-center space-x-1.5">
                                    <span>Approval</span>
                                    {tplFraudPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                        {tplFraudPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 📁 AML */}
                      {isAmlAllowed && (
                        <div className="space-y-0.5 pt-0.5">
                          <button
                            id="nav-rule-template-aml-folder"
                            onClick={() => setRuleTemplateAmlOpen(!ruleTemplateAmlOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="font-semibold text-slate-800">AML</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!ruleTemplateAmlOpen && tplAmlPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {tplAmlPending}
                                </span>
                              )}
                              {ruleTemplateAmlOpen ? (
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {ruleTemplateAmlOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-amber-200 ml-3 pl-1">
                              {/* 📄 View */}
                              <button
                                id="nav-rule-template-aml-view"
                                onClick={() => {
                                  setRuleTemplateDomain('AML');
                                  setActiveTab('rule-template-aml-view');
                                }}
                                className={subNavItemClass(activeTab === 'rule-template-aml-view' || (activeTab === 'rule-template' && ruleTemplateDomain === 'AML'))}
                              >
                                <span>View</span>
                              </button>

                              {/* 📄 Approval [ Badge ] */}
                              {canSeeAmlApproval && (
                                <button
                                  id="nav-rule-template-aml-approval"
                                  onClick={() => {
                                    setRuleTemplateDomain('AML');
                                    setActiveTab('rule-template-aml-approval');
                                  }}
                                  className={subNavItemClass(activeTab === 'rule-template-aml-approval')}
                                >
                                  <div className="flex items-center space-x-1.5">
                                    <span>Approval</span>
                                    {tplAmlPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                        {tplAmlPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* 📁 Rule Basic */}
                <div className="space-y-0.5 pt-0.5">
                  <button
                    id="nav-rule-basic-parent"
                    onClick={() => setRuleBasicSubOpen(!ruleBasicSubOpen)}
                    className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rule Basic</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {!ruleBasicSubOpen && basicTotalPending > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                          {basicTotalPending}
                        </span>
                      )}
                      {ruleBasicSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {ruleBasicSubOpen && (
                    <div className="mt-0.5 space-y-0.5 border-l border-slate-200 ml-3 pl-1">
                      
                      {/* 📁 Fraud */}
                      {isFraudAllowed && (
                        <div className="space-y-0.5">
                          <button
                            id="nav-rule-basic-fraud-folder"
                            onClick={() => setRuleBasicFraudOpen(!ruleBasicFraudOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              <span className="font-semibold text-slate-800">Fraud</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!ruleBasicFraudOpen && basicFraudPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {basicFraudPending}
                                </span>
                              )}
                              {ruleBasicFraudOpen ? (
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {ruleBasicFraudOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-red-200 ml-3 pl-1">
                              {/* 📄 View */}
                              <button
                                id="nav-rule-basic-fraud-view"
                                onClick={() => {
                                  setRuleBasicDomain('Fraud');
                                  setActiveTab('rule-basic-fraud-view');
                                }}
                                className={subNavItemClass(activeTab === 'rule-basic-fraud-view' || (activeTab === 'rule-basic' && ruleBasicDomain === 'Fraud'))}
                              >
                                <span>View</span>
                              </button>

                              {/* 📄 Approval [ Badge ] */}
                              {canSeeFraudApproval && (
                                <button
                                  id="nav-rule-basic-fraud-approval"
                                  onClick={() => {
                                    setRuleBasicDomain('Fraud');
                                    setActiveTab('rule-basic-fraud-approval');
                                  }}
                                  className={subNavItemClass(activeTab === 'rule-basic-fraud-approval')}
                                >
                                  <div className="flex items-center space-x-1.5">
                                    <span>Approval</span>
                                    {basicFraudPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                        {basicFraudPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 📁 AML */}
                      {isAmlAllowed && (
                        <div className="space-y-0.5 pt-0.5">
                          <button
                            id="nav-rule-basic-aml-folder"
                            onClick={() => setRuleBasicAmlOpen(!ruleBasicAmlOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="font-semibold text-slate-800">AML</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!ruleBasicAmlOpen && basicAmlPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {basicAmlPending}
                                </span>
                              )}
                              {ruleBasicAmlOpen ? (
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {ruleBasicAmlOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-amber-200 ml-3 pl-1">
                              {/* 📄 View */}
                              <button
                                id="nav-rule-basic-aml-view"
                                onClick={() => {
                                  setRuleBasicDomain('AML');
                                  setActiveTab('rule-basic-aml-view');
                                }}
                                className={subNavItemClass(activeTab === 'rule-basic-aml-view' || (activeTab === 'rule-basic' && ruleBasicDomain === 'AML'))}
                              >
                                <span>View</span>
                              </button>

                              {/* 📄 Approval [ Badge ] */}
                              {canSeeAmlApproval && (
                                <button
                                  id="nav-rule-basic-aml-approval"
                                  onClick={() => {
                                    setRuleBasicDomain('AML');
                                    setActiveTab('rule-basic-aml-approval');
                                  }}
                                  className={subNavItemClass(activeTab === 'rule-basic-aml-approval')}
                                >
                                  <div className="flex items-center space-x-1.5">
                                    <span>Approval</span>
                                    {basicAmlPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                        {basicAmlPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* 📄 Rule Backtesting (Standalone / In-Menu Approval / Direct Action) */}
                <div className="pt-0.5">
                  <button
                    id="nav-backtesting-btn"
                    onClick={() => setActiveTab('rule-engine-backtesting')}
                    className={subNavItemClass(activeTab === 'rule-engine-backtesting' || activeTab === 'backtesting')}
                  >
                    <div className="flex items-center space-x-2">
                      <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Rule Backtesting</span>
                    </div>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* BATCH 2: RISK ENGINE */}
          {/* ==================================================== */}
          {isFraudAllowed && (
            <div className="space-y-0.5 mt-2">
              <button
                id="nav-risk-engine-parent"
                onClick={() => setRiskEngineMenuOpen(!riskEngineMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Sliders className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-semibold text-slate-800">RISK ENGINE</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  {!riskEngineMenuOpen && formulaPending > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                      {formulaPending}
                    </span>
                  )}
                  {riskEngineMenuOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {riskEngineMenuOpen && (
                <div className="mt-0.5 space-y-1 border-l-2 border-purple-200 ml-4 pl-1">
                  {/* 📁 Formula Risk Engine Sub-folder */}
                  <div className="space-y-0.5">
                    <button
                      id="nav-formula-risk-folder"
                      onClick={() => setFormulaRiskSubOpen(!formulaRiskSubOpen)}
                      className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Folder className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">Formula Risk Engine</span>
                      </div>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                        {!formulaRiskSubOpen && formulaPending > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                            {formulaPending}
                          </span>
                        )}
                        {formulaRiskSubOpen ? (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {formulaRiskSubOpen && (
                      <div className="mt-0.5 space-y-0.5 border-l border-slate-200 ml-3 pl-1">
                        <button
                          id="nav-formula-risk-view"
                          onClick={() => setActiveTab('risk-engine-formula-view')}
                          className={cn(
                            "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                            activeTab === 'risk-engine-formula-view' || activeTab === 'formula-risk'
                              ? "bg-purple-50 text-purple-700 font-semibold border-l-2 border-purple-600"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>View</span>
                          </div>
                        </button>

                        {canSeeFraudApproval && (
                          <button
                            id="nav-formula-risk-approval"
                            onClick={() => setActiveTab('risk-engine-formula-approval')}
                            className={cn(
                              "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                              activeTab === 'risk-engine-formula-approval'
                                ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Approval</span>
                              {formulaPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                                  {formulaPending}
                                </span>
                              )}
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* BATCH 2: LIST MANAGEMENT (Blacklist, Watchlist, Whitelist) */}
          {/* ==================================================== */}
          <div className="space-y-0.5 mt-3">
            <button
              id="nav-list-management-parent"
              onClick={() => setListManagementMenuOpen(!listManagementMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2 truncate">
                <ListChecks className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800 text-xs truncate">LIST MANAGEMENT (Blacklist, Watchlist, Whitelist)</span>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                {!listManagementMenuOpen && listManagementTotalPending > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                    {listManagementTotalPending}
                  </span>
                )}
                {listManagementMenuOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {listManagementMenuOpen && (
              <div className="mt-0.5 space-y-1 border-l-2 border-emerald-200 ml-4 pl-1">
                {/* 1. CIF */}
                <div className="space-y-0.5">
                  <button
                    id="nav-list-cif-folder"
                    onClick={() => setCifSubOpen(!cifSubOpen)}
                    className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">CIF</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                      {!cifSubOpen && cifPending > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {cifPending}
                        </span>
                      )}
                      {cifSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {cifSubOpen && (
                    <div className="mt-0.5 space-y-0.5 border-l border-slate-200 ml-3 pl-1">
                      {/* Fraud */}
                      {isFraudAllowed && (
                        <div className="space-y-0.5">
                          <button
                            id="nav-list-cif-fraud-folder"
                            onClick={() => setCifFraudOpen(!cifFraudOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              <span className="font-semibold text-slate-800">Fraud</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!cifFraudOpen && cifFraudPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {cifFraudPending}
                                </span>
                              )}
                              {cifFraudOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                            </div>
                          </button>
                          {cifFraudOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-red-200 ml-3 pl-1">
                              <button
                                id="nav-list-cif-fraud-view"
                                onClick={() => {
                                  setActiveListCategory('CIF');
                                  setActiveTab('list-management-cif-fraud-view');
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                  activeTab === 'list-management-cif-fraud-view' ? "bg-red-50 text-red-700 font-semibold border-l-2 border-red-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                              >
                                <span>View</span>
                              </button>
                              {canSeeFraudApproval && (
                                <button
                                  id="nav-list-cif-fraud-approval"
                                  onClick={() => {
                                    setActiveListCategory('CIF');
                                    setActiveTab('list-management-cif-fraud-approval');
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                    activeTab === 'list-management-cif-fraud-approval' ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>Approval</span>
                                    {cifFraudPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono ml-1">
                                        {cifFraudPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* AML */}
                      {isAmlAllowed && (
                        <div className="space-y-0.5 pt-0.5">
                          <button
                            id="nav-list-cif-aml-folder"
                            onClick={() => setCifAmlOpen(!cifAmlOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="font-semibold text-slate-800">AML</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!cifAmlOpen && cifAmlPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {cifAmlPending}
                                </span>
                              )}
                              {cifAmlOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                            </div>
                          </button>
                          {cifAmlOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-amber-200 ml-3 pl-1">
                              <button
                                id="nav-list-cif-aml-view"
                                onClick={() => {
                                  setActiveListCategory('CIF');
                                  setActiveTab('list-management-cif-aml-view');
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                  activeTab === 'list-management-cif-aml-view' ? "bg-amber-50 text-amber-900 font-semibold border-l-2 border-amber-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                              >
                                <span>View</span>
                              </button>
                              {canSeeAmlApproval && (
                                <button
                                  id="nav-list-cif-aml-approval"
                                  onClick={() => {
                                    setActiveListCategory('CIF');
                                    setActiveTab('list-management-cif-aml-approval');
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                    activeTab === 'list-management-cif-aml-approval' ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>Approval</span>
                                    {cifAmlPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono ml-1">
                                        {cifAmlPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Source Account Number */}
                <div className="space-y-0.5">
                  <button
                    id="nav-list-account-folder"
                    onClick={() => setAccountSubOpen(!accountSubOpen)}
                    className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Source Account Number</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                      {!accountSubOpen && accountPending > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {accountPending}
                        </span>
                      )}
                      {accountSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {accountSubOpen && (
                    <div className="mt-0.5 space-y-0.5 border-l border-slate-200 ml-3 pl-1">
                      {/* Fraud */}
                      {isFraudAllowed && (
                        <div className="space-y-0.5">
                          <button
                            id="nav-list-account-fraud-folder"
                            onClick={() => setAccountFraudOpen(!accountFraudOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              <span className="font-semibold text-slate-800">Fraud</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!accountFraudOpen && accountFraudPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {accountFraudPending}
                                </span>
                              )}
                              {accountFraudOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                            </div>
                          </button>
                          {accountFraudOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-red-200 ml-3 pl-1">
                              <button
                                id="nav-list-account-fraud-view"
                                onClick={() => {
                                  setActiveListCategory('Source Account Number');
                                  setActiveTab('list-management-account-fraud-view');
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                  activeTab === 'list-management-account-fraud-view' ? "bg-red-50 text-red-700 font-semibold border-l-2 border-red-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                              >
                                <span>View</span>
                              </button>
                              {canSeeFraudApproval && (
                                <button
                                  id="nav-list-account-fraud-approval"
                                  onClick={() => {
                                    setActiveListCategory('Source Account Number');
                                    setActiveTab('list-management-account-fraud-approval');
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                    activeTab === 'list-management-account-fraud-approval' ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>Approval</span>
                                    {accountFraudPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono ml-1">
                                        {accountFraudPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* AML */}
                      {isAmlAllowed && (
                        <div className="space-y-0.5 pt-0.5">
                          <button
                            id="nav-list-account-aml-folder"
                            onClick={() => setAccountAmlOpen(!accountAmlOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="font-semibold text-slate-800">AML</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!accountAmlOpen && accountAmlPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {accountAmlPending}
                                </span>
                              )}
                              {accountAmlOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                            </div>
                          </button>
                          {accountAmlOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-amber-200 ml-3 pl-1">
                              <button
                                id="nav-list-account-aml-view"
                                onClick={() => {
                                  setActiveListCategory('Source Account Number');
                                  setActiveTab('list-management-account-aml-view');
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                  activeTab === 'list-management-account-aml-view' ? "bg-amber-50 text-amber-900 font-semibold border-l-2 border-amber-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                              >
                                <span>View</span>
                              </button>
                              {canSeeAmlApproval && (
                                <button
                                  id="nav-list-account-aml-approval"
                                  onClick={() => {
                                    setActiveListCategory('Source Account Number');
                                    setActiveTab('list-management-account-aml-approval');
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                    activeTab === 'list-management-account-aml-approval' ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>Approval</span>
                                    {accountAmlPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono ml-1">
                                        {accountAmlPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Device ID */}
                <div className="space-y-0.5">
                  <button
                    id="nav-list-device-folder"
                    onClick={() => setDeviceSubOpen(!deviceSubOpen)}
                    className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Device ID</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                      {!deviceSubOpen && devicePending > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {devicePending}
                        </span>
                      )}
                      {deviceSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {deviceSubOpen && (
                    <div className="mt-0.5 space-y-0.5 border-l border-slate-200 ml-3 pl-1">
                      {/* Fraud */}
                      {isFraudAllowed && (
                        <div className="space-y-0.5">
                          <button
                            id="nav-list-device-fraud-folder"
                            onClick={() => setDeviceFraudOpen(!deviceFraudOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              <span className="font-semibold text-slate-800">Fraud</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!deviceFraudOpen && deviceFraudPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {deviceFraudPending}
                                </span>
                              )}
                              {deviceFraudOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                            </div>
                          </button>
                          {deviceFraudOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-red-200 ml-3 pl-1">
                              <button
                                id="nav-list-device-fraud-view"
                                onClick={() => {
                                  setActiveListCategory('Device ID');
                                  setActiveTab('list-management-device-fraud-view');
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                  activeTab === 'list-management-device-fraud-view' ? "bg-red-50 text-red-700 font-semibold border-l-2 border-red-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                              >
                                <span>View</span>
                              </button>
                              {canSeeFraudApproval && (
                                <button
                                  id="nav-list-device-fraud-approval"
                                  onClick={() => {
                                    setActiveListCategory('Device ID');
                                    setActiveTab('list-management-device-fraud-approval');
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                    activeTab === 'list-management-device-fraud-approval' ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>Approval</span>
                                    {deviceFraudPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono ml-1">
                                        {deviceFraudPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* AML */}
                      {isAmlAllowed && (
                        <div className="space-y-0.5 pt-0.5">
                          <button
                            id="nav-list-device-aml-folder"
                            onClick={() => setDeviceAmlOpen(!deviceAmlOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="font-semibold text-slate-800">AML</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!deviceAmlOpen && deviceAmlPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {deviceAmlPending}
                                </span>
                              )}
                              {deviceAmlOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                            </div>
                          </button>
                          {deviceAmlOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-amber-200 ml-3 pl-1">
                              <button
                                id="nav-list-device-aml-view"
                                onClick={() => {
                                  setActiveListCategory('Device ID');
                                  setActiveTab('list-management-device-aml-view');
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                  activeTab === 'list-management-device-aml-view' ? "bg-amber-50 text-amber-900 font-semibold border-l-2 border-amber-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                              >
                                <span>View</span>
                              </button>
                              {canSeeAmlApproval && (
                                <button
                                  id="nav-list-device-aml-approval"
                                  onClick={() => {
                                    setActiveListCategory('Device ID');
                                    setActiveTab('list-management-device-aml-approval');
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                    activeTab === 'list-management-device-aml-approval' ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>Approval</span>
                                    {deviceAmlPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono ml-1">
                                        {deviceAmlPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Phone Number */}
                <div className="space-y-0.5">
                  <button
                    id="nav-list-phone-folder"
                    onClick={() => setPhoneSubOpen(!phoneSubOpen)}
                    className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Phone Number</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                      {!phoneSubOpen && phonePending > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {phonePending}
                        </span>
                      )}
                      {phoneSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {phoneSubOpen && (
                    <div className="mt-0.5 space-y-0.5 border-l border-slate-200 ml-3 pl-1">
                      {/* Fraud */}
                      {isFraudAllowed && (
                        <div className="space-y-0.5">
                          <button
                            id="nav-list-phone-fraud-folder"
                            onClick={() => setPhoneFraudOpen(!phoneFraudOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                              <span className="font-semibold text-slate-800">Fraud</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!phoneFraudOpen && phoneFraudPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {phoneFraudPending}
                                </span>
                              )}
                              {phoneFraudOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                            </div>
                          </button>
                          {phoneFraudOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-red-200 ml-3 pl-1">
                              <button
                                id="nav-list-phone-fraud-view"
                                onClick={() => {
                                  setActiveListCategory('Phone Number');
                                  setActiveTab('list-management-phone-fraud-view');
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                  activeTab === 'list-management-phone-fraud-view' ? "bg-red-50 text-red-700 font-semibold border-l-2 border-red-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                              >
                                <span>View</span>
                              </button>
                              {canSeeFraudApproval && (
                                <button
                                  id="nav-list-phone-fraud-approval"
                                  onClick={() => {
                                    setActiveListCategory('Phone Number');
                                    setActiveTab('list-management-phone-fraud-approval');
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                    activeTab === 'list-management-phone-fraud-approval' ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>Approval</span>
                                    {phoneFraudPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono ml-1">
                                        {phoneFraudPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* AML */}
                      {isAmlAllowed && (
                        <div className="space-y-0.5 pt-0.5">
                          <button
                            id="nav-list-phone-aml-folder"
                            onClick={() => setPhoneAmlOpen(!phoneAmlOpen)}
                            className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span className="font-semibold text-slate-800">AML</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              {!phoneAmlOpen && phoneAmlPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[10px] font-mono font-bold shadow-xs">
                                  {phoneAmlPending}
                                </span>
                              )}
                              {phoneAmlOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                            </div>
                          </button>
                          {phoneAmlOpen && (
                            <div className="mt-0.5 space-y-0.5 border-l border-amber-200 ml-3 pl-1">
                              <button
                                id="nav-list-phone-aml-view"
                                onClick={() => {
                                  setActiveListCategory('Phone Number');
                                  setActiveTab('list-management-phone-aml-view');
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                  activeTab === 'list-management-phone-aml-view' ? "bg-amber-50 text-amber-900 font-semibold border-l-2 border-amber-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                              >
                                <span>View</span>
                              </button>
                              {canSeeAmlApproval && (
                                <button
                                  id="nav-list-phone-aml-approval"
                                  onClick={() => {
                                    setActiveListCategory('Phone Number');
                                    setActiveTab('list-management-phone-aml-approval');
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between pl-4 pr-2 py-1 rounded-md text-[11px] transition cursor-pointer",
                                    activeTab === 'list-management-phone-aml-approval' ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span>Approval</span>
                                    {phoneAmlPending > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold font-mono ml-1">
                                        {phoneAmlPending}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* BATCH 3: AML MANAGEMENT */}
          {/* ========================================================= */}
          {isAmlAllowed && (
            <div className="pt-1">
              <button
                id="nav-aml-management-parent-btn"
                onClick={() => setAmlManagementMenuOpen(!amlManagementMenuOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition",
                  isAmlManagementActive 
                    ? "bg-rose-50/80 text-rose-800 font-semibold border border-rose-100" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className={cn("w-4 h-4", isAmlManagementActive ? "text-rose-600" : "text-rose-500")} />
                  <span className="font-semibold text-slate-800 leading-tight">AML Management</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {!amlManagementMenuOpen && amlManagementTotalPending > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono shadow-xs">
                      {amlManagementTotalPending}
                    </span>
                  )}
                  {amlManagementMenuOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {amlManagementMenuOpen && (
                <div className="mt-0.5 space-y-1 border-l-2 border-rose-200 ml-4 pl-1">
                  {/* 1. AML Master Blacklist */}
                  <div>
                    <button
                      id="nav-aml-master-blacklist-sub-btn"
                      onClick={() => setAmlMasterBlacklistSubOpen(!amlMasterBlacklistSubOpen)}
                      className={cn(
                        "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                        activeTab.startsWith('aml-master-blacklist')
                          ? "bg-rose-50 text-rose-700 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <Folder className="w-3.5 h-3.5 text-rose-500" />
                        <span>AML Master Blacklist</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!amlMasterBlacklistSubOpen && amlMasterBlacklistPending > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                            {amlMasterBlacklistPending}
                          </span>
                        )}
                        {amlMasterBlacklistSubOpen ? (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {amlMasterBlacklistSubOpen && (
                      <div className="ml-5 pl-2 border-l border-rose-100 my-0.5 space-y-0.5">
                        <button
                          id="nav-aml-master-blacklist-view-btn"
                          onClick={() => setActiveTab('aml-master-blacklist-view')}
                          className={cn(
                            "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                            activeTab === 'aml-master-blacklist-view' || activeTab === 'aml-master-blacklist'
                              ? "bg-rose-50 text-rose-700 font-semibold border-l-2 border-rose-600"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>View</span>
                          </div>
                        </button>

                        {canSeeAmlApproval && (
                          <button
                            id="nav-aml-master-blacklist-approval-btn"
                            onClick={() => setActiveTab('aml-master-blacklist-approval')}
                            className={cn(
                              "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                              activeTab === 'aml-master-blacklist-approval'
                                ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Approval</span>
                              {amlMasterBlacklistPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                                  {amlMasterBlacklistPending}
                                </span>
                              )}
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. External Blacklist / DTTOT */}
                  <div>
                    <button
                      id="nav-aml-external-blacklist-sub-btn"
                      onClick={() => setAmlExternalBlacklistSubOpen(!amlExternalBlacklistSubOpen)}
                      className={cn(
                        "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                        activeTab.startsWith('aml-external-blacklist') || activeTab === 'external-blacklist'
                          ? "bg-rose-50 text-rose-700 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <Globe className="w-3.5 h-3.5 text-purple-500" />
                        <span>External Blacklist / DTTOT</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!amlExternalBlacklistSubOpen && amlExternalBlacklistPending > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                            {amlExternalBlacklistPending}
                          </span>
                        )}
                        {amlExternalBlacklistSubOpen ? (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {amlExternalBlacklistSubOpen && (
                      <div className="ml-5 pl-2 border-l border-rose-100 my-0.5 space-y-0.5">
                        <button
                          id="nav-aml-external-blacklist-view-btn"
                          onClick={() => setActiveTab('aml-external-blacklist-view')}
                          className={cn(
                            "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                            activeTab === 'aml-external-blacklist-view' || activeTab === 'external-blacklist'
                              ? "bg-rose-50 text-rose-700 font-semibold border-l-2 border-rose-600"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>View</span>
                          </div>
                        </button>

                        {canSeeAmlApproval && (
                          <button
                            id="nav-aml-external-blacklist-approval-btn"
                            onClick={() => setActiveTab('aml-external-blacklist-approval')}
                            className={cn(
                              "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                              activeTab === 'aml-external-blacklist-approval'
                                ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Approval</span>
                              {amlExternalBlacklistPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                                  {amlExternalBlacklistPending}
                                </span>
                              )}
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* BATCH 3: SYSTEM PARAMETER */}
          {/* ========================================================= */}
          {canSeeSystemParam && (
            <div className="pt-1">
              <button
                id="nav-system-parameter-parent-btn"
                onClick={() => setSystemParameterOpen(!systemParameterOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition",
                  isSystemParameterActive 
                    ? "bg-blue-50/70 text-blue-800 font-semibold border border-blue-100" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <Sliders className={cn("w-4 h-4", isSystemParameterActive ? "text-blue-600" : "text-blue-600/80")} />
                  <span className="font-semibold text-slate-800 leading-tight">System Parameter</span>
                </div>
              <div className="flex items-center space-x-1.5">
                {!systemParameterOpen && systemParameterTotalPending > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono shadow-xs">
                    {systemParameterTotalPending}
                  </span>
                )}
                {systemParameterOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {systemParameterOpen && (
              <div className="mt-0.5 space-y-1 border-l-2 border-blue-200 ml-4 pl-1">
                {isSysAdmin && (
                  <>
                    {/* 1. User Management */}
                <div>
                  <button
                    id="nav-sys-user-sub-btn"
                    onClick={() => setSysUserSubOpen(!sysUserSubOpen)}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab.startsWith('system-parameter-user') || activeTab === 'system-user'
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-blue-500" />
                      <span>User Management</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!sysUserSubOpen && sysUserPending > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {sysUserPending}
                        </span>
                      )}
                      {sysUserSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {sysUserSubOpen && (
                    <div className="ml-5 pl-2 border-l border-blue-100 my-0.5 space-y-0.5">
                      <button
                        id="nav-sys-user-view-btn"
                        onClick={() => setActiveTab('system-parameter-user-view')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-user-view' || activeTab === 'system-user'
                            ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>View</span>
                        </div>
                      </button>

                      <button
                        id="nav-sys-user-approval-btn"
                        onClick={() => setActiveTab('system-parameter-user-approval')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-user-approval'
                            ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Approval</span>
                          {sysUserPending > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                              {sysUserPending}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Group Management */}
                <div>
                  <button
                    id="nav-sys-group-sub-btn"
                    onClick={() => setSysGroupSubOpen(!sysGroupSubOpen)}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab.startsWith('system-parameter-group') || activeTab === 'system-group'
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-purple-500" />
                      <span>Group Management</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!sysGroupSubOpen && sysGroupPending > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {sysGroupPending}
                        </span>
                      )}
                      {sysGroupSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {sysGroupSubOpen && (
                    <div className="ml-5 pl-2 border-l border-blue-100 my-0.5 space-y-0.5">
                      <button
                        id="nav-sys-group-view-btn"
                        onClick={() => setActiveTab('system-parameter-group-view')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-group-view' || activeTab === 'system-group'
                            ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>View</span>
                        </div>
                      </button>

                      <button
                        id="nav-sys-group-approval-btn"
                        onClick={() => setActiveTab('system-parameter-group-approval')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-group-approval'
                            ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Approval</span>
                          {sysGroupPending > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                              {sysGroupPending}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Role Management */}
                <div>
                  <button
                    id="nav-sys-role-sub-btn"
                    onClick={() => setSysRoleSubOpen(!sysRoleSubOpen)}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab.startsWith('system-parameter-role') || activeTab === 'system-role'
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                      <span>Role Management</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!sysRoleSubOpen && sysRolePending > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {sysRolePending}
                        </span>
                      )}
                      {sysRoleSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {sysRoleSubOpen && (
                    <div className="ml-5 pl-2 border-l border-blue-100 my-0.5 space-y-0.5">
                      <button
                        id="nav-sys-role-view-btn"
                        onClick={() => setActiveTab('system-parameter-role-view')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-role-view' || activeTab === 'system-role'
                            ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>View</span>
                        </div>
                      </button>

                      <button
                        id="nav-sys-role-approval-btn"
                        onClick={() => setActiveTab('system-parameter-role-approval')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-role-approval'
                            ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Approval</span>
                          {sysRolePending > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                              {sysRolePending}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Access Menu Management */}
                <div>
                  <button
                    id="nav-sys-access-menu-sub-btn"
                    onClick={() => setSysAccessMenuSubOpen(!sysAccessMenuSubOpen)}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab.startsWith('system-parameter-access-menu') || activeTab === 'system-access-menu'
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Access Menu Management</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!sysAccessMenuSubOpen && sysAccessMenuPending > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {sysAccessMenuPending}
                        </span>
                      )}
                      {sysAccessMenuSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {sysAccessMenuSubOpen && (
                    <div className="ml-5 pl-2 border-l border-blue-100 my-0.5 space-y-0.5">
                      <button
                        id="nav-sys-access-menu-view-btn"
                        onClick={() => setActiveTab('system-parameter-access-menu-view')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-access-menu-view' || activeTab === 'system-access-menu'
                            ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>View</span>
                        </div>
                      </button>

                      <button
                        id="nav-sys-access-menu-approval-btn"
                        onClick={() => setActiveTab('system-parameter-access-menu-approval')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-access-menu-approval'
                            ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Approval</span>
                          {sysAccessMenuPending > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                              {sysAccessMenuPending}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Application Parameter */}
                <div>
                  <button
                    id="nav-sys-app-param-sub-btn"
                    onClick={() => setSysAppParamSubOpen(!sysAppParamSubOpen)}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab.startsWith('system-parameter-application') || activeTab === 'system-application-parameter'
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-violet-500" />
                      <span>Application Parameter</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!sysAppParamSubOpen && sysAppParamPending > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {sysAppParamPending}
                        </span>
                      )}
                      {sysAppParamSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {sysAppParamSubOpen && (
                    <div className="ml-5 pl-2 border-l border-blue-100 my-0.5 space-y-0.5">
                      <button
                        id="nav-sys-app-param-view-btn"
                        onClick={() => setActiveTab('system-parameter-application-view')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-application-view' || activeTab === 'system-application-parameter'
                            ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>View</span>
                        </div>
                      </button>

                      <button
                        id="nav-sys-app-param-approval-btn"
                        onClick={() => setActiveTab('system-parameter-application-approval')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-application-approval'
                            ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Approval</span>
                          {sysAppParamPending > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                              {sysAppParamPending}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 6. User Defined Parameter */}
                <div>
                  <button
                    id="nav-sys-udp-sub-btn"
                    onClick={() => setSysUdpSubOpen(!sysUdpSubOpen)}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab.startsWith('system-parameter-udp') || activeTab === 'system-user-defined-parameter'
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                      <span>User Defined Parameter</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!sysUdpSubOpen && sysUdpPending > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {sysUdpPending}
                        </span>
                      )}
                      {sysUdpSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {sysUdpSubOpen && (
                    <div className="ml-5 pl-2 border-l border-blue-100 my-0.5 space-y-0.5">
                      <button
                        id="nav-sys-udp-view-btn"
                        onClick={() => setActiveTab('system-parameter-udp-view')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-udp-view' || activeTab === 'system-user-defined-parameter'
                            ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>View</span>
                        </div>
                      </button>

                      <button
                        id="nav-sys-udp-approval-btn"
                        onClick={() => setActiveTab('system-parameter-udp-approval')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-udp-approval'
                            ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Approval</span>
                          {sysUdpPending > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                              {sysUdpPending}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 7. Email Template */}
                <div>
                  <button
                    id="nav-sys-email-template-sub-btn"
                    onClick={() => setSysEmailTemplateSubOpen(!sysEmailTemplateSubOpen)}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab.startsWith('system-parameter-email-template') || activeTab === 'system-email-template'
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Email Template</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!sysEmailTemplateSubOpen && sysEmailTemplatePending > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {sysEmailTemplatePending}
                        </span>
                      )}
                      {sysEmailTemplateSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {sysEmailTemplateSubOpen && (
                    <div className="ml-5 pl-2 border-l border-blue-100 my-0.5 space-y-0.5">
                      <button
                        id="nav-sys-email-template-view-btn"
                        onClick={() => setActiveTab('system-parameter-email-template-view')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-email-template-view' || activeTab === 'system-email-template'
                            ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>View</span>
                        </div>
                      </button>

                      <button
                        id="nav-sys-email-template-approval-btn"
                        onClick={() => setActiveTab('system-parameter-email-template-approval')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-email-template-approval'
                            ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Approval</span>
                          {sysEmailTemplatePending > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                              {sysEmailTemplatePending}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* 8. User Session & Lockout */}
                <div>
                  <button
                    id="nav-sys-user-session-sub-btn"
                    onClick={() => setSysUserSessionSubOpen(!sysUserSessionSubOpen)}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab.startsWith('system-parameter-user-session') || activeTab === 'system-user-session'
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <Folder className="w-3.5 h-3.5 text-rose-500" />
                      <span>User Session & Lockout</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!sysUserSessionSubOpen && sysUserSessionPending > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                          {sysUserSessionPending}
                        </span>
                      )}
                      {sysUserSessionSubOpen ? (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {sysUserSessionSubOpen && (
                    <div className="ml-5 pl-2 border-l border-blue-100 my-0.5 space-y-0.5">
                      <button
                        id="nav-sys-user-session-view-btn"
                        onClick={() => setActiveTab('system-parameter-user-session-view')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-user-session-view' || activeTab === 'system-user-session'
                            ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>View</span>
                        </div>
                      </button>

                      <button
                        id="nav-sys-user-session-approval-btn"
                        onClick={() => setActiveTab('system-parameter-user-session-approval')}
                        className={cn(
                          "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                          activeTab === 'system-parameter-user-session-approval'
                            ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Approval</span>
                          {sysUserSessionPending > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                              {sysUserSessionPending}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
                </>
              )}

                {/* 9. Watchlist Location */}
                {canSeeWatchlistLocation && (
                  <div>
                    <button
                      id="nav-sys-watchlist-location-sub-btn"
                      onClick={() => setSysWatchlistLocationSubOpen(!sysWatchlistLocationSubOpen)}
                      className={cn(
                        "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                        activeTab.startsWith('system-parameter-watchlist-location') || activeTab === 'watchlist-location'
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Watchlist Location</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!sysWatchlistLocationSubOpen && sysWatchlistLocationPending > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono">
                            {sysWatchlistLocationPending}
                          </span>
                        )}
                        {sysWatchlistLocationSubOpen ? (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {sysWatchlistLocationSubOpen && (
                      <div className="ml-5 pl-2 border-l border-blue-100 my-0.5 space-y-0.5">
                        <button
                          id="nav-sys-watchlist-location-view-btn"
                          onClick={() => setActiveTab('system-parameter-watchlist-location-view')}
                          className={cn(
                            "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                            activeTab === 'system-parameter-watchlist-location-view' || activeTab === 'system-parameter-watchlist-location' || activeTab === 'watchlist-location'
                              ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Eye className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>View</span>
                          </div>
                        </button>

                        {(isSysAdmin || canSeeFraudApproval) && (
                          <button
                            id="nav-sys-watchlist-location-approval-btn"
                            onClick={() => setActiveTab('system-parameter-watchlist-location-approval')}
                            className={cn(
                              "w-full flex items-center justify-between pl-2 pr-2 py-1 rounded text-xs font-normal transition",
                              activeTab === 'system-parameter-watchlist-location-approval'
                                ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-600"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Approval</span>
                              {sysWatchlistLocationPending > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-orange-500 text-white text-[10px] font-bold font-mono ml-1">
                                  {sysWatchlistLocationPending}
                                </span>
                              )}
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* ========================================================= */}
          {/* PARENT MENU: PROCESS (EOD ENGINE & MANUAL EXECUTION) */}
          {/* ========================================================= */}
          {canSeeProcess && (
            <div className="space-y-1">
              <button
                id="nav-parent-process-btn"
                onClick={() => setProcessMenuOpen(!processMenuOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                  isProcessActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <Workflow className={cn("w-4 h-4", isProcessActive ? "text-white" : "text-blue-600")} />
                  <span>Process</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {processExecutions.some(e => e.status === 'Running') && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  )}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold",
                    isProcessActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  )}>
                    3
                  </span>
                  {processMenuOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  )}
                </div>
              </button>

              {processMenuOpen && (
                <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-200 ml-4 animate-fade-in">
                  {/* Sub-menu 1: Task (/process/task) */}
                  <button
                    id="nav-process-task-btn"
                    onClick={() => setActiveTab('process-task')}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab === 'process-task'
                        ? "bg-blue-50 text-blue-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>Task</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                      {processTasks.length}
                    </span>
                  </button>

                  {/* Sub-menu 2: List Process (/process/list-process) */}
                  <button
                    id="nav-process-list-btn"
                    onClick={() => setActiveTab('process-list')}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab === 'process-list'
                        ? "bg-blue-50 text-blue-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>List Process</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">
                      {processList.length}
                    </span>
                  </button>

                  {/* Sub-menu 3: Manual Execution (/process/manual-execution) */}
                  <button
                    id="nav-process-manual-execution-btn"
                    onClick={() => setActiveTab('process-manual-execution')}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab === 'process-manual-execution'
                        ? "bg-blue-50 text-blue-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Manual Execution</span>
                    </div>
                    {processExecutions.some(e => e.status === 'Running') ? (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold animate-pulse">
                        Running
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                        {processExecutions.length}
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* PARENT MENU: AUDIT TRAIL (COLLAPSIBLE ACCORDION) */}
          {/* ========================================================= */}
          {canSeeAuditTrail && (
            <div className="space-y-1">
              <button
                id="nav-parent-audit-trail-btn"
                onClick={() => setAuditTrailOpen(!auditTrailOpen)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                  isAuditTrailActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center space-x-2.5">
                  <History className={cn("w-4 h-4", isAuditTrailActive ? "text-white" : "text-blue-600")} />
                  <span>Audit Trail</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold",
                    isAuditTrailActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  )}>
                    5
                  </span>
                  {auditTrailOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  )}
                </div>
              </button>

              {auditTrailOpen && (
                <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-200 ml-4 animate-fade-in">
                  {/* Sub-menu 1: Audit Trail System (/audit-trail/system) */}
                  <button
                    id="nav-audit-trail-system-btn"
                    onClick={() => setActiveTab('audit-trail-system')}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab === 'audit-trail-system' || activeTab === 'audit-trail'
                        ? "bg-blue-50 text-blue-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span>Audit Trail System</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                      {auditSystemLogs.length}
                    </span>
                  </button>

                  {/* Sub-menu 2: Audit Trail Changes (/audit-trail/changes) */}
                  <button
                    id="nav-audit-trail-changes-btn"
                    onClick={() => setActiveTab('audit-trail-changes')}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab === 'audit-trail-changes'
                        ? "bg-blue-50 text-blue-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>Audit Trail Changes</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">
                      {auditChangeLogs.length}
                    </span>
                  </button>

                  {/* Sub-menu 3: Audit Trail User Login (/audit-trail/login) */}
                  <button
                    id="nav-audit-trail-login-btn"
                    onClick={() => setActiveTab('audit-trail-login')}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab === 'audit-trail-login'
                        ? "bg-blue-50 text-blue-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Audit Trail User Login</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                      {auditUserLogins.length}
                    </span>
                  </button>

                  {/* Sub-menu 4: Audit Trail User Access (/audit-trail/access) */}
                  <button
                    id="nav-audit-trail-access-btn"
                    onClick={() => setActiveTab('audit-trail-access')}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab === 'audit-trail-access'
                        ? "bg-blue-50 text-blue-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      <span>Audit Trail User Access</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                      {auditUserAccesses.length}
                    </span>
                  </button>

                  {/* Sub-menu 5: Audit Trail Mail (/audit-trail/mail) */}
                  <button
                    id="nav-audit-trail-mail-btn"
                    onClick={() => setActiveTab('audit-trail-mail')}
                    className={cn(
                      "w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-md text-xs font-medium transition",
                      activeTab === 'audit-trail-mail'
                        ? "bg-blue-50 text-blue-700 font-bold" 
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Audit Trail Mail</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                      {auditMailLogs.length}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

        </nav>

        {/* Engine Status Widget */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>FMS Engine Core</span>
            </span>
            <span className="text-emerald-600 font-mono text-[10px] font-bold">Online</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1.5 border-t border-slate-200">
            <div>
              <div className="text-slate-400 font-medium">Rules Loaded</div>
              <div className="text-slate-800 font-bold font-mono">{ruleBasics.length} Rules</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Avg Latency</div>
              <div className="text-emerald-600 font-bold font-mono">8.4 ms</div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer User Profile Card */}
      <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs ${
            user?.riskDomain === 'FULL ACCESS' 
              ? 'bg-purple-600' 
              : user?.riskDomain === 'FRAUD ONLY' 
              ? 'bg-red-600' 
              : 'bg-amber-600'
          }`}>
            {user?.avatar || 'YS'}
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{user?.fullName || 'Yoseph Sanjaya'}</span>
            </div>
            <div className="text-slate-500 text-[10px] flex items-center gap-1">
              <span>{user?.role || 'Lead Fraud Ops & AML'}</span>
            </div>
          </div>
        </div>
        {user?.riskDomain && (
          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
            user.riskDomain === 'FULL ACCESS'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : user.riskDomain === 'FRAUD ONLY'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {user.riskDomain === 'FULL ACCESS' ? 'FULL' : user.riskDomain.replace(' ONLY', '')}
          </span>
        )}
      </div>
    </aside>
  );
};
