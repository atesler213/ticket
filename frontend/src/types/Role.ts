export interface Role {
  id: string;
  companyId: string;
  name: string;
  description: string;
  isSystem: boolean; // System roles cannot be deleted
  permissions?: string[];
}

export interface Permission {
  id: string;
  name: string; // e.g., 'ticket.create', 'user.delete'
  description: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}
