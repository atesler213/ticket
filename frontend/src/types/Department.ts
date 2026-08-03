export interface Department {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  managerId: string | null;
  createdAt: string;
}
