export interface Settings {
  companyId: string;
  companyName?: string;
  supportEmail?: string;
  allowGuestTickets: boolean;
  defaultTimezone: string;
  defaultLanguage: string;
  ticketPrefix: string;
  requireApprovalForAssets: boolean;
  smtpServer: string | null;
  smtpPort: number | null;
}
