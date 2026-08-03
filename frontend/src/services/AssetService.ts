import { apiClient } from './apiClient';
import type { Asset } from '../types/Asset';

export const AssetService = {
  getAll: (): Promise<Asset[]> => apiClient.get<Asset[]>('/assets'),
  create: (data: Partial<Asset>): Promise<Asset> => apiClient.post<Asset>('/assets', { ...data, id: 'ast-' + Date.now() }),
  update: (id: string, data: Partial<Asset>): Promise<Asset> => apiClient.put<Asset>(`/assets/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete(`/assets/${id}`),
};
