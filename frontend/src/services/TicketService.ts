import { apiClient } from './apiClient';
import {
  assertTicketMutable,
  assertValidStatusTransition
} from './TicketWorkflowService';
import { AuditTrailService } from './AuditTrailService';
import { SettingsService } from './OtherServices';
import type { Ticket, TicketStatus, TicketType } from '../types/Ticket';

function getTicketPrefix(ticketType: TicketType): string {
  switch (ticketType) {
    case 'Incident':
      return 'INC-';
    case 'Risk':
      return 'RSK-';
    case 'Change':
      return 'CHG-';
    case 'ServiceHR':
    default:
      return 'SRV-';
  }
}

function getInitialStatus(ticketType: TicketType): TicketStatus {
  return ticketType === 'Incident' ? 'Logged' : 'Open';
}

function normalizePrefix(prefix: string): string {
  const compact = prefix.trim().replace(/\s+/g, '').toUpperCase();
  if (!compact) return 'SRV-';
  return compact.endsWith('-') ? compact : `${compact}-`;
}

async function createTicketId(ticketType: TicketType): Promise<string> {
  const fallbackPrefix = getTicketPrefix(ticketType);
  let configuredPrefix = fallbackPrefix;

  try {
    const settings = await SettingsService.getAll();
    const customPrefix = settings[0]?.ticketPrefix;
    if (customPrefix) {
      configuredPrefix = normalizePrefix(customPrefix);
    }
  } catch {
    configuredPrefix = fallbackPrefix;
  }

  const year = new Date().getUTCFullYear();
  const sequence = Math.floor(Math.random() * 9000) + 1000;
  return `${configuredPrefix}${year}-${sequence}`;
}

export const TicketService = {
  async getAll(): Promise<Ticket[]> {
    return apiClient.get<Ticket[]>('/tickets');
  },
  async getByRequester(requesterId: string): Promise<Ticket[]> {
    const all = await this.getAll();
    return all.filter(t => t.requesterId === requesterId);
  },
  async getById(id: string): Promise<Ticket | undefined> {
    const all = await this.getAll();
    return all.find(t => t.id === id);
  },
  async create(ticket: Partial<Ticket>): Promise<Ticket> {
    const ticketType = ticket.ticketType || 'ServiceHR';
    const newTicket = await apiClient.post<Ticket>('/tickets', ticket);
    newTicket.ticketType = ticketType;
    newTicket.id = await createTicketId(ticketType);
    newTicket.createdAt = new Date().toISOString();
    newTicket.status = getInitialStatus(ticketType);
    newTicket.updatedAt = newTicket.createdAt;
    if (ticketType === 'Incident' && !newTicket.incidentDetails?.timeline) {
      newTicket.incidentDetails = {
        ...newTicket.incidentDetails,
        timeline: {
          detectedAt: newTicket.createdAt
        }
      };
    }
    newTicket.events = [];

    await AuditTrailService.writeEvent({
      actorId: ticket.requesterId || 'system',
      actorRole: 'Employee',
      action: 'TICKET_CREATED',
      targetType: 'Ticket',
      targetId: newTicket.id,
      details: `Created ${ticketType} ticket in ${newTicket.status} state`
    })

    return newTicket;
  },
  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    const ticket = await this.getById(id);
    if (!ticket) throw new Error("Ticket not found");

    assertTicketMutable(ticket);

    if (updates.status) {
      assertValidStatusTransition(ticket, updates.status);
    }
    
    const previousStatus = ticket.status
    Object.assign(ticket, updates);
    ticket.updatedAt = new Date().toISOString();

    await AuditTrailService.writeEvent({
      actorId: updates.assigneeId || ticket.assigneeId || 'system',
      actorRole: 'Support Agent',
      action: updates.status ? 'TICKET_STATUS_TRANSITION' : 'TICKET_UPDATED',
      targetType: 'Ticket',
      targetId: ticket.id,
      details: updates.status
        ? `${previousStatus} -> ${ticket.status}`
        : 'Updated ticket metadata'
    })

    return ticket;
  },
  async addReply(ticketId: string, content: string, actorId: string, isInternal: boolean = false): Promise<Ticket> {
    // In reality this calls POST /tickets/:id/replies
    // We mock it by fetching the ticket, appending the event, and returning the updated ticket
    const ticket = await this.getById(ticketId);
    if (!ticket) throw new Error("Ticket not found");

    assertTicketMutable(ticket);
    
    if (!ticket.events) ticket.events = [];
    ticket.events.push({
      id: 'evt-' + Date.now(),
      type: 'Comment',
      actorId,
      content,
      isInternal,
      createdAt: new Date().toISOString()
    });

    await AuditTrailService.writeEvent({
      actorId,
      actorRole: isInternal ? 'Support Agent' : 'Employee',
      action: 'TICKET_COMMENT_ADDED',
      targetType: 'Ticket',
      targetId: ticketId,
      details: isInternal ? 'Added internal note' : 'Added requester/agent comment'
    })
    
    return ticket;
  }
};
