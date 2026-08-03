import type { Ticket, TicketStatus } from '../types/Ticket'

const TERMINAL_STATUSES: TicketStatus[] = ['Audit Ready', 'Closed']

const INCIDENT_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  Logged: ['Triage'],
  Triage: ['Assessment', 'False Positive'],
  Assessment: ['Mitigation & Containment'],
  'Mitigation & Containment': ['Evidence Collection'],
  'Evidence Collection': ['Pending Verification'],
  'Pending Verification': ['Audit Ready'],
  'Audit Ready': [],
  'False Positive': [],
  Open: ['In Progress', 'Pending', 'Resolved', 'Closed'],
  'In Progress': ['Pending', 'Resolved', 'Closed'],
  Pending: ['In Progress', 'Resolved', 'Closed'],
  Resolved: ['Closed'],
  Closed: []
}

const DEFAULT_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  Open: ['In Progress', 'Pending', 'Resolved', 'Closed'],
  'In Progress': ['Pending', 'Resolved', 'Closed'],
  Pending: ['In Progress', 'Resolved', 'Closed'],
  Resolved: ['Closed'],
  Closed: [],
  Logged: ['Triage'],
  Triage: ['Assessment'],
  Assessment: ['Mitigation & Containment'],
  'Mitigation & Containment': ['Evidence Collection'],
  'Evidence Collection': ['Pending Verification'],
  'Pending Verification': ['Audit Ready'],
  'Audit Ready': [],
  'False Positive': []
}

export function isTicketImmutable(status: TicketStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

export function canTransitionStatus(ticket: Ticket, nextStatus: TicketStatus): boolean {
  if (ticket.status === nextStatus) {
    return true
  }

  const transitionMap = ticket.ticketType === 'Incident' ? INCIDENT_TRANSITIONS : DEFAULT_TRANSITIONS
  const allowed = transitionMap[ticket.status] || []
  return allowed.includes(nextStatus)
}

export function assertTicketMutable(ticket: Ticket) {
  if (isTicketImmutable(ticket.status)) {
    throw new Error('Ticket is immutable after closure/audit-ready stage')
  }
}

export function assertValidStatusTransition(ticket: Ticket, nextStatus: TicketStatus) {
  if (!canTransitionStatus(ticket, nextStatus)) {
    throw new Error(`Invalid status transition from ${ticket.status} to ${nextStatus}`)
  }
}
