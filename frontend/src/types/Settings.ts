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
  smtpFromName?: string;
  smtpFromEmail?: string;
  enforceMfa?: boolean;
  passwordMinLength?: number;
  sessionTimeoutMinutes?: number;
  businessStartHour?: string;
  businessEndHour?: string;
  businessDays?: string[];
  showCategoryField?: boolean;
  showAssetField?: boolean;
  brandingPrimaryColor?: string;
  brandingLogoUrl?: string;
}
