export type RoleName = 
  | 'System Administrator' 
  | 'Company Administrator' 
  | 'CISO / ISB'
  | 'Security Manager'
  | 'IT Manager' 
  | 'Senior Agent' 
  | 'Support Agent' 
  | 'IT Support Agent'
  | 'Employee' 
  | 'Guest';

export interface User {
  id: string;
  companyId: string;
  departmentId: string | null;
  name: string;
  email: string;
  role: RoleName;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
