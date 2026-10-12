import React, { useEffect } from 'react';
import { FMSProvider, useFMS } from './context/FMSContext';
import { CustomerProvider } from './context/CustomerContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { FraudCaseManagementView } from './components/cases/FraudCaseManagementView';
import { AmlCaseManagementView } from './components/cases/AmlCaseManagementView';
import { ManualAlertView } from './components/cases/ManualAlertView';
import { RuleTemplateList } from './components/rules/RuleTemplateList';
import { RuleBasicList } from './components/rules/RuleBasicList';
import { BacktestingView } from './components/rules/BacktestingView';
import { FormulaRiskView } from './components/formula/FormulaRiskView';
import { ManagementListView } from './components/lists/ManagementListView';
import { ExternalBlacklistView } from './components/lists/ExternalBlacklistView';
import { CustomerProfilePage } from './pages/profile/CustomerProfilePage';
import { DebitCardProfilePage } from './pages/profile/DebitCardProfilePage';
import { TransactionHistoryPage } from './pages/profile/TransactionHistoryPage';
import { CardTransactionPage } from './pages/profile/CardTransactionPage';
import { ShiftScheduleView } from './components/shifting/ShiftScheduleView';
import { ReportAnalyticsView } from './components/reports/ReportAnalyticsView';
import { InvestigationHistoryView } from './components/investigation/InvestigationHistoryView';
import { UserManagementPage } from './pages/system-parameter/UserManagementPage';
import { GroupManagementPage } from './pages/system-parameter/GroupManagementPage';
import { RoleManagementPage } from './pages/system-parameter/RoleManagementPage';
import { AccessMenuManagementPage } from './pages/system-parameter/AccessMenuManagementPage';
import { EmailTemplatePage } from './pages/system-parameter/EmailTemplatePage';
import { ApplicationParameterPage } from './pages/system-parameter/ApplicationParameterPage';
import { UserDefinedParameterPage } from './pages/system-parameter/UserDefinedParameterPage';
import { UserSessionPage } from './pages/system-parameter/UserSessionPage';
import { WatchlistLocationView } from './pages/system-parameter/WatchlistLocationView';
import { AuditTrailSystemPage } from './pages/audit-trail/AuditTrailSystemPage';
import { AuditTrailChangesPage } from './pages/audit-trail/AuditTrailChangesPage';
import { AuditTrailLoginPage } from './pages/audit-trail/AuditTrailLoginPage';
import { AuditTrailAccessPage } from './pages/audit-trail/AuditTrailAccessPage';
import { AuditTrailMailPage } from './pages/audit-trail/AuditTrailMailPage';
import { TaskPage } from './pages/process/TaskPage';
import { ListProcessPage } from './pages/process/ListProcessPage';
import { ManualExecutionPage } from './pages/process/ManualExecutionPage';
import { AMLMasterBlacklistPage } from './pages/aml/AMLMasterBlacklistPage';
import { CaseDetailModal } from './components/cases/CaseDetailModal';
import { AmlGroupDetailModal } from './components/cases/AmlGroupDetailModal';
import { SystemAlertPageView } from './components/cases/SystemAlertPageView';
import { ManualAlertPageView } from './components/cases/ManualAlertPageView';
import { RuleApprovalQueueView } from './components/rules/RuleApprovalQueueView';
import { ListManagementApprovalView } from './components/lists/ListManagementApprovalView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';

const FMSContent: React.FC = () => {
  const { activeTab, setActiveTab, addNotification } = useFMS();
  const { user } = useAuth();

  useEffect(() => {
    const isSysAdmin = user?.riskDomain === 'FULL ACCESS' || user?.username === 'sysadmin';
    const isAmlOnly = user?.riskDomain === 'AML ONLY' || user?.username === 'analystl1' || user?.username === 'analystl2' || user?.group === 'Analyst L1' || user?.group === 'Analyst L2';

    // Watchlist Location: Total isolation from AML domain
    if (isAmlOnly && (activeTab.startsWith('system-parameter-watchlist-location') || activeTab === 'watchlist-location')) {
      setActiveTab('dashboard');
      addNotification({
        domain: 'AML',
        title: 'Akses Ditolak (403)',
        message: 'Menu Watchlist Location dibatasi khusus untuk Fraud Operations & Sysadmin.',
        targetRole: user?.role || 'AML Analyst'
      });
      return;
    }

    // Fraud Maker cannot directly open Approval Queue tab (Checker only)
    if ((user?.username === 'afcl1' || user?.group === 'AFC L1') && activeTab === 'system-parameter-watchlist-location-approval') {
      setActiveTab('system-parameter-watchlist-location-view');
      addNotification({
        domain: 'FRAUD',
        title: 'Akses Terbatas (Maker)',
        message: 'Antrean approval Watchlist Location hanya dapat diakses oleh peran Checker (AFC L2 / Sysadmin).',
        targetRole: user?.role || 'Fraud Maker'
      });
      return;
    }

    if (!isSysAdmin) {
      const restrictedTabs = [
        'system-parameter-user-approval',
        'system-parameter-group-approval',
        'system-parameter-role-approval',
        'system-parameter-access-menu-approval',
        'system-parameter-application-approval',
        'system-parameter-udp-approval',
        'system-parameter-email-template-approval',
        'system-parameter-user-session-approval'
      ];
      
      if (restrictedTabs.includes(activeTab)) {
        setActiveTab('dashboard');
        addNotification({
          domain: 'SYSTEM',
          title: 'Access Denied',
          message: 'Access Denied: Insufficient Privileges',
          targetRole: user?.role || 'User'
        });
      }
    }
  }, [activeTab, user, setActiveTab, addNotification]);
  
  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Main View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'customer-profile' && <CustomerProfilePage />}
            {activeTab === 'debit-card-profile' && <DebitCardProfilePage />}
            {activeTab === 'transaction-history' && <TransactionHistoryPage />}
            {activeTab === 'card-transaction' && <CardTransactionPage />}
            {activeTab === 'reports' && <ReportAnalyticsView defaultDomain="Fraud" />}
            {activeTab === 'report-fraud' && <ReportAnalyticsView defaultDomain="Fraud" />}
            {activeTab === 'report-aml' && <ReportAnalyticsView defaultDomain="AML" />}
            
            {/* Case Management Standalone Pages with Isolated Domains */}
            {activeTab === 'case-management-system-alert' && <SystemAlertPageView defaultCategory="Fraud" />}
            {activeTab === 'case-management-manual-alert' && <ManualAlertPageView defaultDomain="Fraud" />}
            {activeTab === 'alert-fraud' && <SystemAlertPageView defaultCategory="Fraud" />}
            {activeTab === 'case-system-alert-fraud' && <SystemAlertPageView defaultCategory="Fraud" />}
            {activeTab === 'alert-aml' && <SystemAlertPageView defaultCategory="AML" />}
            {activeTab === 'case-system-alert-aml' && <SystemAlertPageView defaultCategory="AML" />}
            {activeTab === 'manual-alert-fraud' && <ManualAlertPageView defaultDomain="Fraud" />}
            {activeTab === 'manual-alert-aml' && <ManualAlertPageView defaultDomain="AML" />}
            
            {/* Investigation History with Isolated Domains */}
            {activeTab === 'investigation-history' && <InvestigationHistoryView defaultDomain="Fraud" />}
            {activeTab === 'investigation-history-fraud' && <InvestigationHistoryView defaultDomain="Fraud" />}
            {activeTab === 'investigation-history-aml' && <InvestigationHistoryView defaultDomain="AML" />}
            {activeTab === 'shift-schedule' && <ShiftScheduleView />}

            {/* Rule Engine Hierarchical Pages */}
            {activeTab === 'rule-template' && <RuleTemplateList />}
            {activeTab === 'rule-template-fraud-view' && <RuleTemplateList domain="Fraud" />}
            {activeTab === 'rule-template-fraud-approval' && <RuleApprovalQueueView ruleType="Template" domain="Fraud" />}
            {activeTab === 'rule-template-aml-view' && <RuleTemplateList domain="AML" />}
            {activeTab === 'rule-template-aml-approval' && <RuleApprovalQueueView ruleType="Template" domain="AML" />}
            
            {activeTab === 'rule-basic' && <RuleBasicList />}
            {activeTab === 'rule-basic-fraud-view' && <RuleBasicList domain="Fraud" />}
            {activeTab === 'rule-basic-fraud-approval' && <RuleApprovalQueueView ruleType="Basic" domain="Fraud" />}
            {activeTab === 'rule-basic-aml-view' && <RuleBasicList domain="AML" />}
            {activeTab === 'rule-basic-aml-approval' && <RuleApprovalQueueView ruleType="Basic" domain="AML" />}

            {(activeTab === 'rule-engine-backtesting' || activeTab === 'backtesting') && <BacktestingView />}
            {(activeTab === 'formula-risk' || activeTab === 'risk-engine-formula-view') && <FormulaRiskView />}
            {activeTab === 'risk-engine-formula-approval' && <RuleApprovalQueueView targetType="Formula" />}

            {/* List Management Batch 2 Routes */}
            {/* CIF */}
            {activeTab === 'list-management-cif-fraud-view' && <ManagementListView defaultCategory="CIF" defaultDomain="Fraud" />}
            {activeTab === 'list-management-cif-fraud-approval' && <ListManagementApprovalView entityType="CIF" domain="FRAUD" />}
            {activeTab === 'list-management-cif-aml-view' && <ManagementListView defaultCategory="CIF" defaultDomain="AML" />}
            {activeTab === 'list-management-cif-aml-approval' && <ListManagementApprovalView entityType="CIF" domain="AML" />}
            
            {/* Source Account Number */}
            {activeTab === 'list-management-account-fraud-view' && <ManagementListView defaultCategory="Source Account Number" defaultDomain="Fraud" />}
            {activeTab === 'list-management-account-fraud-approval' && <ListManagementApprovalView entityType="Source Account Number" domain="FRAUD" />}
            {activeTab === 'list-management-account-aml-view' && <ManagementListView defaultCategory="Source Account Number" defaultDomain="AML" />}
            {activeTab === 'list-management-account-aml-approval' && <ListManagementApprovalView entityType="Source Account Number" domain="AML" />}
            
            {/* Device ID */}
            {activeTab === 'list-management-device-fraud-view' && <ManagementListView defaultCategory="Device ID" defaultDomain="Fraud" />}
            {activeTab === 'list-management-device-fraud-approval' && <ListManagementApprovalView entityType="Device ID" domain="FRAUD" />}
            {activeTab === 'list-management-device-aml-view' && <ManagementListView defaultCategory="Device ID" defaultDomain="AML" />}
            {activeTab === 'list-management-device-aml-approval' && <ListManagementApprovalView entityType="Device ID" domain="AML" />}
            
            {/* Phone Number */}
            {activeTab === 'list-management-phone-fraud-view' && <ManagementListView defaultCategory="Phone Number" defaultDomain="Fraud" />}
            {activeTab === 'list-management-phone-fraud-approval' && <ListManagementApprovalView entityType="Phone Number" domain="FRAUD" />}
            {activeTab === 'list-management-phone-aml-view' && <ManagementListView defaultCategory="Phone Number" defaultDomain="AML" />}
            {activeTab === 'list-management-phone-aml-approval' && <ListManagementApprovalView entityType="Phone Number" domain="AML" />}

            {/* General fallback list management approval routes */}
            {activeTab === 'list-management-cif-approval' && <ListManagementApprovalView entityType="CIF" domain="FRAUD" />}
            {activeTab === 'list-management-account-approval' && <ListManagementApprovalView entityType="Source Account Number" domain="FRAUD" />}
            {activeTab === 'list-management-device-approval' && <ListManagementApprovalView entityType="Device ID" domain="FRAUD" />}
            {activeTab === 'list-management-phone-approval' && <ListManagementApprovalView entityType="Phone Number" domain="FRAUD" />}

            {(activeTab === 'lists' || activeTab === 'management-list' || activeTab === 'blacklist' || activeTab === 'watchlist' || activeTab === 'whitelist') && (
              <ManagementListView />
            )}
            {/* AML Management Batch 3 Routes */}
            {(activeTab === 'aml-master-blacklist-view' || activeTab === 'aml-master-blacklist') && <AMLMasterBlacklistPage />}
            {activeTab === 'aml-master-blacklist-approval' && <RuleApprovalQueueView targetType="AML Master Blacklist" />}
            
            {(activeTab === 'aml-external-blacklist-view' || activeTab === 'external-blacklist') && <ExternalBlacklistView />}
            {activeTab === 'aml-external-blacklist-approval' && <RuleApprovalQueueView targetType="External Blacklist" />}

            {/* System Parameter Batch 3 Routes */}
            {(activeTab === 'system-parameter-user-view' || activeTab === 'system-parameter' || activeTab === 'system-user') && <UserManagementPage />}
            {activeTab === 'system-parameter-user-approval' && <RuleApprovalQueueView targetType="User Management" />}

            {(activeTab === 'system-parameter-group-view' || activeTab === 'system-group') && <GroupManagementPage />}
            {activeTab === 'system-parameter-group-approval' && <RuleApprovalQueueView targetType="Group Management" />}

            {(activeTab === 'system-parameter-role-view' || activeTab === 'system-role') && <RoleManagementPage />}
            {activeTab === 'system-parameter-role-approval' && <RuleApprovalQueueView targetType="Role Management" />}

            {(activeTab === 'system-parameter-access-menu-view' || activeTab === 'system-access-menu') && <AccessMenuManagementPage />}
            {activeTab === 'system-parameter-access-menu-approval' && <RuleApprovalQueueView targetType="Access Menu Management" />}

            {(activeTab === 'system-parameter-application-view' || activeTab === 'system-application-parameter') && <ApplicationParameterPage />}
            {activeTab === 'system-parameter-application-approval' && <RuleApprovalQueueView targetType="Application Parameter" />}

            {(activeTab === 'system-parameter-udp-view' || activeTab === 'system-user-defined-parameter') && <UserDefinedParameterPage />}
            {activeTab === 'system-parameter-udp-approval' && <RuleApprovalQueueView targetType="User Defined Parameter" />}

            {(activeTab === 'system-parameter-email-template-view' || activeTab === 'system-email-template') && <EmailTemplatePage />}
            {activeTab === 'system-parameter-email-template-approval' && <RuleApprovalQueueView targetType="Email Template" />}

            {(activeTab === 'system-parameter-user-session-view' || activeTab === 'system-user-session') && <UserSessionPage mode="view" />}
            {activeTab === 'system-parameter-user-session-approval' && <UserSessionPage mode="approval" />}

            {/* System Parameter: Watchlist Location */}
            {(activeTab === 'system-parameter-watchlist-location-view' || activeTab === 'system-parameter-watchlist-location' || activeTab === 'watchlist-location') && <WatchlistLocationView mode="view" />}
            {activeTab === 'system-parameter-watchlist-location-approval' && <WatchlistLocationView mode="approval" />}
            {(activeTab === 'process' || activeTab === 'process-task') && <TaskPage />}
            {activeTab === 'process-list' && <ListProcessPage />}
            {activeTab === 'process-manual-execution' && <ManualExecutionPage />}
            {(activeTab === 'audit-trail' || activeTab === 'audit-trail-system') && <AuditTrailSystemPage />}
            {activeTab === 'audit-trail-changes' && <AuditTrailChangesPage />}
            {activeTab === 'audit-trail-login' && <AuditTrailLoginPage />}
            {activeTab === 'audit-trail-access' && <AuditTrailAccessPage />}
            {activeTab === 'audit-trail-mail' && <AuditTrailMailPage />}
          </div>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CaseDetailModal />
      <AmlGroupDetailModal />
    </div>
  );
};

const FMSApp: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <FMSContent />;
};

export default function App() {
  return (
    <AuthProvider>
      <FMSProvider>
        <CustomerProvider>
          <FMSApp />
        </CustomerProvider>
      </FMSProvider>
    </AuthProvider>
  );
}
