/**
 * Core type definitions for Family Health Vault AI
 */

export type RoutePath =
  | '/'
  | '/dashboard'
  | '/family'
  | '/documents'
  | '/medicines'
  | '/appointments'
  | '/emergency'
  | '/doctor-summary'
  | '/settings';

export interface NavigationItem {
  name: string;
  href: RoutePath;
  icon: string;
  badge?: string;
  description?: string;
}

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';

export type RelationshipRole =
  | 'Parent'
  | 'Child'
  | 'Spouse'
  | 'Grandparent'
  | 'Sibling'
  | 'Dependent'
  | 'Other';

export interface FamilyMember {
  id: string;
  name: string;
  role: RelationshipRole;
  age: number;
  dateOfBirth?: string;
  bloodType: BloodType;
  allergies: string[];
  chronicConditions: string[];
  primaryPhysician: string;
  physicianPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  preferredHospital: string;
  notes?: string;
  avatarColor: string;
}

export type MedicationStatus = 'active' | 'as-needed' | 'paused' | 'completed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  memberId: string;
  familyMemberName: string;
  instructions: string;
  purpose?: string;
  prescribedBy?: string;
  startDate?: string;
  refillDaysLeft: number;
  status: MedicationStatus;
  takenToday: boolean;
  lastTakenDate?: string;
  reminderEnabled?: boolean;
  reminderTimes?: string[];
}

export type AppointmentType =
  | 'Routine Checkup'
  | 'Follow-up'
  | 'Pediatric'
  | 'Dental'
  | 'Specialist'
  | 'Lab Work'
  | 'Vision';

export interface Appointment {
  id: string;
  provider: string;
  specialty: string;
  memberId: string;
  familyMemberName: string;
  date: string;
  time: string;
  location: string;
  type: AppointmentType;
  notes?: string;
  completed: boolean;
  questionsToAsk?: string[];
}

export type DocumentCategory =
  | 'Lab Report'
  | 'Immunization'
  | 'Prescription'
  | 'Clinical Note'
  | 'Insurance'
  | 'Radiology'
  | 'Discharge Summary';

export interface HealthDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  memberId: string;
  familyMemberName: string;
  date: string;
  provider: string;
  fileType: string;
  size: string;
  summary?: string;
  tags?: string[];
}

export interface DoctorVisitSummary {
  id: string;
  memberId: string;
  familyMemberName: string;
  visitDate: string;
  doctorName: string;
  clinic: string;
  chiefComplaint: string;
  symptoms: string[];
  questionsForDoctor: string[];
  notes?: string;
  createdAt: string;
}

export interface VaultSettings {
  familyName: string;
  primaryContactName: string;
  primaryContactPhone: string;
  emergencyNotes: string;
  showDemoNotice: boolean;
}

export interface StatMetric {
  title: string;
  value: string | number;
  label: string;
  icon: string;
  changeNote?: string;
  href: RoutePath;
}

// Backward compatibility aliases
export type FamilyMemberSample = FamilyMember;
export type HealthDocumentSample = HealthDocument;
export type MedicationSample = Medication;
export type AppointmentSample = Appointment;
