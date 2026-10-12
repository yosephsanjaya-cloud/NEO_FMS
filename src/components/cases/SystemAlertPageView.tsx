import React from 'react';
import { FraudCaseManagementView } from './FraudCaseManagementView';
import { AmlCaseManagementView } from './AmlCaseManagementView';

interface SystemAlertPageViewProps {
  defaultCategory?: 'Fraud' | 'AML';
}

export const SystemAlertPageView: React.FC<SystemAlertPageViewProps> = ({ defaultCategory = 'Fraud' }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {defaultCategory === 'Fraud' ? (
        <FraudCaseManagementView />
      ) : (
        <AmlCaseManagementView />
      )}
    </div>
  );
};
