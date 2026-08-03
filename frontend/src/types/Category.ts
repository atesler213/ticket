export interface Category {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  defaultDepartmentId: string | null;
  defaultPriority: 'Low' | 'Medium' | 'High' | 'Urgent';
}
