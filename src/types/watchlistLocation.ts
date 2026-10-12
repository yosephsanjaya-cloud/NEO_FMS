export type WatchlistLocationStatus = 'Active' | 'Inactive';

export type WatchlistLocationApprovalStatus = 
  | 'Active' 
  | 'Pending Approval - New' 
  | 'Pending Approval - Edit' 
  | 'Pending Approval - Delete';

export interface WatchlistLocation {
  id: string; // e.g. "WLOC-001"
  name: string; // e.g. "Kabupaten Ogan Ilir, Sumatera Selatan"
  latitude: number; // e.g. -3.4285
  longitude: number; // e.g. 104.6465
  status: WatchlistLocationStatus; // 'Active' | 'Inactive'
  approvalStatus: WatchlistLocationApprovalStatus;
  createdDate: string; // e.g. '2026-09-15 10:30:00'
  lastUpdateDate: string; // e.g. '2026-09-18 14:20:00'
  createdBy: string;
  lastUpdatedBy?: string;
  notes?: string;
  radiusKm?: number;
  proposedChanges?: Partial<WatchlistLocation>;
  ticketId?: string;
}
