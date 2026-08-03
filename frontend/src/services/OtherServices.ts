import { apiClient } from './apiClient';
import type { Department } from '../types/Department';
import type { Category } from '../types/Category';
import type { Notification } from '../types/Notification';
import type { KnowledgebaseArticle } from '../types/Knowledgebase';
import type { Settings } from '../types/Settings';
import type { Role, Permission } from '../types/Role';
import type { AuditLog } from '../types/AuditLog';
import type { CapaRecord } from '../types/Capa';
import type { IntegrationConfig } from '../types/Integration';

export const DepartmentService = {
  getAll: () => apiClient.get<Department[]>('/departments'),
  create: (data: Partial<Department>) => apiClient.post<Department>('/departments', { ...data, id: 'dept-' + Date.now() }),
  update: (id: string, data: Partial<Department>) => apiClient.put<Department>(`/departments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/departments/${id}`)
};

export const CategoryService = {
  getAll: () => apiClient.get<Category[]>('/categories'),
  create: (data: Partial<Category>) => apiClient.post<Category>('/categories', { ...data, id: 'cat-' + Date.now() }),
  update: (id: string, data: Partial<Category>) => apiClient.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`)
};

export const NotificationService = {
  getAll: () => apiClient.get<Notification[]>('/notifications')
};

export const KnowledgebaseService = {
  getAll: () => apiClient.get<KnowledgebaseArticle[]>('/knowledgebase')
};

export const SettingsService = {
  getAll: () => apiClient.get<Settings[]>('/settings'),
  update: (id: string, data: Partial<Settings>) => apiClient.put<Settings>(`/settings/${id}`, data)
};

export const RoleService = {
  getAll: () => apiClient.get<Role[]>('/roles'),
  create: (data: Partial<Role>) => apiClient.post<Role>('/roles', { ...data, id: 'role-' + Date.now() }),
  update: (id: string, data: Partial<Role>) => apiClient.put<Role>(`/roles/${id}`, data),
  delete: (id: string) => apiClient.delete(`/roles/${id}`)
};

export const PermissionService = {
  getAll: () => apiClient.get<Permission[]>('/permissions')
};

export const AuditLogService = {
  getAll: () => apiClient.get<AuditLog[]>('/audit-logs'),
  create: (data: Partial<AuditLog>) => apiClient.post<AuditLog>('/audit-logs', {
    ...data,
    id: data.id || 'aud-' + Date.now(),
    createdAt: data.createdAt || new Date().toISOString()
  })
};

export const CapaService = {
  getAll: () => apiClient.get<CapaRecord[]>('/capa')
};

export const IntegrationService = {
  getAll: () => apiClient.get<IntegrationConfig[]>('/integrations'),
  update: (id: string, data: Partial<IntegrationConfig>) => apiClient.put<IntegrationConfig>(`/integrations/${id}`, data)
};
