import React from 'react';
import { BulkUploadListModal } from './BulkUploadListModal';
import { ListEntry, ListType } from '../../types/fms';

interface ManagementListImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDomain: 'FRAUD' | 'AML';
  activeListType: ListType;
  activeEntitySubTab: string;
  onBulkImport: (
    entries: Array<Omit<ListEntry, 'id' | 'createdAt' | 'matchCount'>>,
    options?: { batchId?: string; fileName?: string; targetDomain?: 'FRAUD' | 'AML'; targetListType?: ListType; makerName?: string }
  ) => { addedCount: number; batchId?: string; ticketNo?: string };
  onSuccessToast?: (message: string) => void;
}

export const ManagementListImportModal: React.FC<ManagementListImportModalProps> = (props) => {
  return <BulkUploadListModal {...props} />;
};

export { BulkUploadListModal };
