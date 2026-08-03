import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TicketService } from '../services/TicketService'
import type { Ticket } from '../types/Ticket'

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref<Ticket[]>([])
  const isLoading = ref(false)

  const privilegedRoles = ['CISO / ISB', 'Security Manager']

  async function fetchMyTickets(userId: string) {
    isLoading.value = true
    try {
      const all = await TicketService.getAll()
      // For an employee, "my tickets" are tickets they requested
      tickets.value = all.filter(t => t.requesterId === userId)
    } finally {
      isLoading.value = false
    }
  }

  // Agent Specific Getters/Fetchers
  async function fetchAgentQueue(agentId: string) {
    isLoading.value = true
    try {
      const all = await TicketService.getAll()
      tickets.value = all.filter(t => t.assigneeId === agentId)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUnassignedTickets() {
    isLoading.value = true
    try {
      const all = await TicketService.getAll()
      tickets.value = all.filter(t => !t.assigneeId)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSensitiveQueue(userRole?: string) {
    isLoading.value = true
    try {
      if (!userRole || !privilegedRoles.includes(userRole)) {
        tickets.value = []
        return
      }
      const all = await TicketService.getAll()
      tickets.value = all.filter(t =>
        t.ticketType === 'Incident' &&
        (t.dataClassification === 'Confidential' || t.dataClassification === 'Restricted' || t.isSensitiveQueue)
      )
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAllTickets() {
    isLoading.value = true
    try {
      tickets.value = await TicketService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  async function createTicket(ticket: Partial<Ticket>) {
    isLoading.value = true
    try {
      const newTicket = await TicketService.create(ticket)
      tickets.value.unshift(newTicket) // add to top of list
      return newTicket
    } finally {
      isLoading.value = false
    }
  }

  async function addReply(ticketId: string, content: string, actorId: string, isInternal: boolean = false) {
    isLoading.value = true
    try {
      const updatedTicket = await TicketService.addReply(ticketId, content, actorId, isInternal)
      // Update local cache
      const index = tickets.value.findIndex(t => t.id === ticketId)
      if (index !== -1) {
        tickets.value[index] = updatedTicket
      }
      return updatedTicket
    } finally {
      isLoading.value = false
    }
  }

  async function updateTicket(ticketId: string, updates: Partial<Ticket>) {
    isLoading.value = true
    try {
      const updatedTicket = await TicketService.updateTicket(ticketId, updates)
      const index = tickets.value.findIndex(t => t.id === ticketId)
      if (index !== -1) {
        tickets.value[index] = updatedTicket
      }
      return updatedTicket
    } finally {
      isLoading.value = false
    }
  }

  return { 
    tickets, 
    isLoading, 
    fetchAllTickets, 
    fetchMyTickets, 
    fetchAgentQueue,
    fetchUnassignedTickets,
    fetchSensitiveQueue,
    createTicket, 
    addReply,
    updateTicket
  }
})
