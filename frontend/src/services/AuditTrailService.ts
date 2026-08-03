import { AuditLogService } from './OtherServices'
import type { AuditAction } from '../types/AuditLog'

interface WriteAuditEventInput {
  actorId: string
  actorRole: string
  action: AuditAction
  targetType: 'Ticket' | 'User' | 'Role' | 'Session' | 'System'
  targetId: string
  details: string
}

export const AuditTrailService = {
  async writeEvent(input: WriteAuditEventInput) {
    await AuditLogService.create({
      actorId: input.actorId,
      actorRole: input.actorRole,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      details: input.details,
      ipAddress: '127.0.0.1'
    })
  }
}
