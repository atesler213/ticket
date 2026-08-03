export type NotificationType = 'TicketUpdate' | 'Mention' | 'SystemAlert' | 'SlaWarning';

export interface Notification {
  id: string;
  userId: string;
  companyId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}
