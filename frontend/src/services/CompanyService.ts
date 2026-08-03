import { apiClient } from './apiClient';
import type { Company } from '../types/Company';

export const CompanyService = {
  async getAll(): Promise<Company[]> {
    return apiClient.get<Company[]>('/companies');
  },
  async getById(id: string): Promise<Company | undefined> {
    const all = await this.getAll();
    return all.find(c => c.id === id);
  },
  async getBySubdomain(subdomain: string): Promise<Company | undefined> {
    const all = await this.getAll();
    return all.find(c => c.subdomain === subdomain);
  }
};
