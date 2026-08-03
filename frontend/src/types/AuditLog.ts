export type AuditAction =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_MFA_CHALLENGE'
  | 'AUTH_MFA_VERIFIED'
  | 'TICKET_CREATED'
  | 'TICKET_UPDATED'
  | 'TICKET_STATUS_TRANSITION'
  | 'TICKET_COMMENT_ADDED'
  | 'PERMISSION_CHANGED'
  | 'SENSITIVE_QUEUE_VIEWED';

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: AuditAction;
  targetType: 'Ticket' | 'User' | 'Role' | 'Session' | 'System';
  targetId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}
