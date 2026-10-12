import React from 'react';
import { CaseSummaryCards } from './CaseSummaryCards';
import { ApprovalSummaryWidgets } from './ApprovalSummaryWidgets';
import { CaseApprovalWidget } from './CaseApprovalWidget';

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* SECTION A: CASE SUMMARY CARDS (RBAC Conditional: 4 Cards Legacy for Analyst, 6 Cards Modern for AFC & Sysadmin) */}
      <CaseSummaryCards />

      {/* NEW: CASE APPROVAL WIDGET (Fraud / AML based on role) */}
      <CaseApprovalWidget />

      {/* CHECKER APPROVAL SUMMARY WIDGETS (Middle Section - Only visible for Checker / Approver role) */}
      <ApprovalSummaryWidgets />

    </div>
  );
};
