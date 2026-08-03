export type CapaStatus = 'Open' | 'Delayed' | 'Verified';

export interface CapaRecord {
  id: string;
  ticketId: string;
  rootCauseMethod: '5Whys' | 'Fishbone';
  status: CapaStatus;
  owner: string;
  dueAt: string;
  verifiedAt?: string;
}
