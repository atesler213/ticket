export interface SLATarget {
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'All Priorities';
  firstResponseMinutes: number;
  resolutionMinutes: number;
}

export interface SLAPolicy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  conditions: string; // E.g., "All tickets", "Requester Department is 'Executive'"
  targets: SLATarget[];
  createdAt: string;
  updatedAt: string;
}
