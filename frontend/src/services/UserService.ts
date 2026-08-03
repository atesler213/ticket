import { apiClient } from './apiClient';
import type { User } from '../types/User';

export const UserService = {
  async getAll(): Promise<User[]> {
    return apiClient.get<User[]>('/users');
  },
  async getById(id: string): Promise<User | undefined> {
    const all = await this.getAll();
    return all.find(u => u.id === id);
  },
  async create(user: Partial<User>): Promise<User> {
    const newUser = await apiClient.post<User>('/users', user);
    newUser.id = 'usr-' + Date.now();
    newUser.isActive = true;
    newUser.createdAt = new Date().toISOString();
    return newUser;
  },
  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.getById(id);
    if (!user) throw new Error("User not found");
    Object.assign(user, updates);
    return user;
  },
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }
};
