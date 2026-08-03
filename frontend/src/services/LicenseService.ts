import { apiClient } from './apiClient';
import type { License } from '../types/License';

export const LicenseService = {
  getAll: (): Promise<License[]> => apiClient.get<License[]>('/licenses'),
  create: (data: Partial<License>): Promise<License> => apiClient.post<License>('/licenses', { ...data, id: 'lic-' + Date.now(), assignedUsers: [] }),
  update: (id: string, data: Partial<License>): Promise<License> => apiClient.put<License>(`/licenses/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete(`/licenses/${id}`),
};
