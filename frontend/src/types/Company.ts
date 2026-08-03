export interface Company {
  id: string;
  name: string;
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sidebarColor: string;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  supportEmail: string;
  supportPhone: string;
  subdomain: string;
  customDomain: string | null;
  createdAt: string;
}
