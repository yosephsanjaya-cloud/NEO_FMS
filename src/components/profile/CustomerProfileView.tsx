import React from 'react';
import { CustomerProfileDetail } from './CustomerProfileDetail';
import { CustomerProfileRecord } from '../../types/fms';

interface CustomerProfileViewProps {
  searchedAccount?: string | null;
  customer: CustomerProfileRecord;
  onBackToList: () => void;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = (props) => {
  return <CustomerProfileDetail {...props} />;
};

export default CustomerProfileView;
