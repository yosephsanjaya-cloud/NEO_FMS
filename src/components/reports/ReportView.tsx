import React from 'react';
import { ReportAnalyticsView } from './ReportAnalyticsView';
import { ReportDomain } from '../../types/fms';

interface ReportViewProps {
  defaultDomain?: ReportDomain;
}

export const ReportView: React.FC<ReportViewProps> = ({ defaultDomain = 'Fraud' }) => {
  return <ReportAnalyticsView defaultDomain={defaultDomain} />;
};

export default ReportView;
