export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketType = 'Incident' | 'Risk' | 'Change' | 'ServiceHR';
export type TicketStatus =
  | 'Logged'
  | 'Triage'
  | 'Assessment'
  | 'Mitigation & Containment'
  | 'Evidence Collection'
  | 'Pending Verification'
  | 'Audit Ready'
  | 'False Positive'
  | 'Open'
  | 'In Progress'
  | 'Pending'
  | 'Resolved'
  | 'Closed';
export type TicketEventType = 'Comment' | 'StatusChange' | 'Assignment' | 'SystemMessage';
export type DataClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted';
export type DetectionSource = 'SIEM' | 'EDR' | 'UserReport' | 'Pentest' | 'ExternalReport' | 'Other';

export interface EvidencePointer {
  id: string;
  name: string;
  location: string;
  hashSha256: string;
  collectedAt: string;
}

export interface IncidentTimeline {
  detectedAt?: string;
  triagedAt?: string;
  assessmentAt?: string;
  mitigationStartedAt?: string;
  containmentAt?: string;
  evidenceCollectedAt?: string;
  verificationStartedAt?: string;
  closedAt?: string;
}

export interface IncidentDetails {
  detectionSource?: DetectionSource;
  affectedAssetIds?: string[];
  classification?: DataClassification;
  severity?: 'Low' | 'Medium' | 'High';
  timeline?: IncidentTimeline;
  evidencePointers?: EvidencePointer[];
}

export interface RiskDetails {
  riskDescription?: string;
  inherentRiskScore?: number;
  residualRiskScore?: number;
  isoControls?: string[];
  riskOwner?: string;
  actionPlan?: string;
}

export interface ChangeDetails {
  changeType?: 'Standard' | 'Emergency' | 'Major';
  impactAnalysis?: string;
  rollbackPlan?: string;
  testApprovalRecord?: string;
  relatedAssetId?: string;
}

export interface ServiceHRDetails {
  processType?: 'Starter' | 'Mover' | 'Leaver' | 'ServiceRequest';
  accessAuthorizationForm?: boolean;
  leaverChecklistCompleted?: boolean;
  byodWipeDeclaration?: boolean;
}

export interface CapaDetails {
  rootCauseMethod?: '5Whys' | 'Fishbone';
  rootCauseAnalysis?: string;
  correctiveActionTicketId?: string;
  effectivenessReviewDueAt?: string;
}

export interface TicketEvent {
  id: string;
  type: TicketEventType;
  actorId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketType: TicketType;
  companyId: string;
  requesterId: string;
  agentId: string | null;
  departmentId: string | null;
  categoryId: string;
  assetId: string | null;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  dataClassification?: DataClassification;
  isSensitiveQueue?: boolean;
  assigneeId?: string;
  assigneeName?: string | null;
  sla?: {
    dueDate: string;
    isBreached: boolean;
  };
  events?: TicketEvent[];
  incidentDetails?: IncidentDetails;
  riskDetails?: RiskDetails;
  changeDetails?: ChangeDetails;
  serviceHrDetails?: ServiceHRDetails;
  capa?: CapaDetails;
  createdAt: string;
  updatedAt: string;
}
