export interface MedicalCondition {
  name: string;
  type: string;
  severity: string;
  description?: string;
}

export interface DiagnosedBy {
  doctorId: string;
  doctorName: string;
  hospital?: string;
}

export interface TreatmentDetails {
  medicineName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  procedureName?: string;
  notes?: string;
}

export interface Treatment {
  treatmentId: string;
  type: string;
  details: TreatmentDetails;
  startedOn: string;
  endedOn?: string;
}

export interface FollowUp {
  date: string;
  notes: string;
  nextVisit?: string;
}

export interface MedicalDocument {
  type: string;
  url: string;
}

export interface MedicalHistoryEvent {
  eventId: string;
  condition: MedicalCondition;
  diagnosedOn: string;
  diagnosedBy: DiagnosedBy;
  affectedBodyPart?: string;
  treatments: Treatment[];
  followUps: FollowUp[];
  status: string;
  documents: MedicalDocument[];
}
