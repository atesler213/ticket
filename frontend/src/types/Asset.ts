export type AssetType = 'Laptop' | 'Monitor' | 'Phone' | 'Printer' | 'Server' | 'Software' | 'License' | 'Accessory';
export type AssetStatus = 'In Use' | 'Available' | 'In Repair' | 'Retired';
export type AssetClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted';
export type CIAValue = 'Low' | 'Medium' | 'High';

export interface CIARating {
  confidentiality: CIAValue;
  integrity: CIAValue;
  availability: CIAValue;
}

export interface Asset {
  id: string;
  companyId: string;
  name: string;
  assetTag: string;
  type: AssetType;
  status: AssetStatus;
  assignedToId: string | null;
  assignedToName?: string | null;
  department?: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  warrantyExpiry: string | null;
  ownerEmail?: string;
  classification?: AssetClassification;
  ciaRating?: CIARating;
  createdAt: string;
  updatedAt: string;
}
