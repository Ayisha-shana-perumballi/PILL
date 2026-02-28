
export type TabType = 'home' | 'calendar' | 'history' | 'alerts' | 'settings' | 'patients';
export type UserRole = 'patient' | 'caregiver';

export enum MedicationStatus {
  TAKEN = 'Taken',
  UPCOMING = 'Upcoming',
  MISSED = 'Missed',
  DELAYED = 'Delayed'
}

export enum ApprovalStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface Medication {
  id: string;
  name: string;
  dosage: string; // e.g. "500mg"
  time: string;
  status: MedicationStatus;
  category: string;
  frequency?: string; // e.g. "Daily", "Twice a day"
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  createdAt?: string; // ISO string
  previousStatus?: MedicationStatus;
  date?: string; // Optional specific date for the medication task
  reminderTime?: string; // Custom reminder time set by caregiver
  
  // Refill Tracking Fields
  pillsRemaining?: number;
  totalPills?: number;
  dailyDosageCount?: number; // How many pills taken per day
  refillThreshold?: number; // Minimum pills before critical alert
  lastRefillDate?: string;
  lastTakenTime?: string; // ISO string of when the last dose was actually taken
}

export interface AIChangeRequest {
  id: string;
  patientId: string;
  patientName: string;
  medicationId: string;
  medicationName: string;
  oldTime: string;
  newTime: string;
  reason: string;
  status: ApprovalStatus;
  timestamp: string;
}

export interface DeviceStatus {
  batteryPercentage: number;
  signalStrength: 'Strong' | 'Moderate' | 'Weak' | 'Offline';
  lastSynced: string;
  firmwareVersion: string;
  isConnected: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar: string;
  patientDisplayId?: string; // Short readable ID for patients (e.g. PC-12345)
  linkedPatientId?: string; // For caregivers
  age?: number;
  weightKg?: number;
  heightCm?: number;
  // Caregiver Details for Patients
  caregiverName?: string;
  caregiverRelationship?: string;
  caregiverPhone?: string;
  caregiverEmail?: string;
  caregiverUserId?: string;
}

export interface RefillRequest {
  id: string;
  patientId: string;
  patientName: string;
  medicationId: string;
  medicationName: string;
  pillsRemaining: number;
  status: ApprovalStatus;
  timestamp: string;
}

export interface PatientNote {
  id: string;
  text: string;
  timestamp: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  patientDisplayId?: string;
  age: number;
  gender: string;
  condition: string;
  adherence: number;
  avatar: string;
  meds: Medication[];
  weightKg?: number;
  heightCm?: number;
  notes?: PatientNote[];
}

export interface DailyAdherence {
  day: string;
  percentage: number;
}

export interface MedicationLog {
  medicationId: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: MedicationStatus;
  timestamp: string; // ISO string of when it was logged
}
