export type IntegrationStatus = 'Connected' | 'Degraded' | 'Disconnected';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'SSO' | 'ITAM' | 'SIEM' | 'NTP';
  status: IntegrationStatus;
  endpoint: string;
  lastSyncAt?: string;
  notes?: string;
}
