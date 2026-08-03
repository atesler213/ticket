export interface Permission {
  id: string;
  name: string; // e.g., 'ticket.create', 'ticket.delete', 'user.manage'
  description: string;
  module: string; // e.g., 'Tickets', 'Assets', 'Users'
}
