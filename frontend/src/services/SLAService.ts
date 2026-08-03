import { apiClient } from './apiClient'
import type { SLAPolicy } from '../types/SLAPolicy'

export const SLAService = {
  async getAll(): Promise<SLAPolicy[]> {
    return await apiClient.get<SLAPolicy[]>('/sla-policies')
  },
  
  async getById(id: string): Promise<SLAPolicy> {
    return await apiClient.get<SLAPolicy>(`/sla-policies/${id}`)
  },
  
  async create(data: Partial<SLAPolicy>): Promise<SLAPolicy> {
    return await apiClient.post<SLAPolicy>('/sla-policies', data)
  },
  
  async update(id: string, data: Partial<SLAPolicy>): Promise<SLAPolicy> {
    return await apiClient.put<SLAPolicy>(`/sla-policies/${id}`, data)
  },
  
  async delete(id: string): Promise<void> {
    return await apiClient.delete(`/sla-policies/${id}`)
  }
}
