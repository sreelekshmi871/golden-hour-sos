export type EmergencyCategory = 
  | 'cardiac'
  | 'accident'
  | 'stroke'
  | 'respiratory'
  | 'pediatric'
  | 'burn'
  | 'poison'
  | 'general';

export type TriageSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface FirstAidStep {
  step: number;
  title: string;
  instruction: string;
  tamilInstruction?: string;
  criticalWarning?: string;
  hasTimer?: boolean;
  timerDurationSeconds?: number;
  audioPrompt?: string;
}

export interface TriageResult {
  category: EmergencyCategory;
  severity: TriageSeverity;
  headline: string;
  reasoning: string;
  goldenHourWindowMinutes: number;
  timeRemainingMinutes: number;
  requiredSpecialists: string[];
  requiredFacilities: string[];
  vitalSignsToMonitor: string[];
  firstAidSteps: FirstAidStep[];
  preHospitalMedicationWarning: string;
  cprRequired: boolean;
  dispatchPriorityCode: string; // e.g. "CODE RED - CAT 1"
}

export interface SpecialistStatus {
  name: string;
  specialty: string;
  status: 'on_duty' | 'in_emergency_ot' | 'on_call';
}

export interface Hospital {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: 'Government Apex Trauma' | 'Super Specialty' | 'Multi-Specialty Private' | 'Cardiac Center' | 'Neuroscience Institute';
  level: 'Level 1 Trauma Center' | 'Comprehensive Stroke Center' | 'Primary Cardiac Care' | 'General Emergency';
  address: string;
  phone: string;
  emergencyHotline: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  lat?: number;
  lng?: number;
  totalBeds: number;
  availableIcuBeds: number;
  availableTraumaBays: number;
  totalVentilators: number;
  availableVentilators: number;
  cathLabActive: boolean;
  ctMriAvailable: boolean;
  bloodBankO_NegativeAvailable: boolean;
  ecmoAvailable: boolean;
  specialists: SpecialistStatus[];
  matchScore?: number;
  distanceKm?: number;
  estimatedDriveTimeMins?: number;
  trafficStatus: 'normal' | 'moderate' | 'heavy';
  acceptedInsurances: string[];
  hasHelipad: boolean;
  pinHash?: string;
  active?: boolean;
}

export interface EmergencyAlert {
  id: string;
  caseCode?: string;
  userId?: string | null;
  timestamp: number;
  incidentTime: string;
  patientName?: string;
  patientAge?: string;
  patientPhone?: string;
  emergencyContact?: string;
  patientDescription: string;
  patientAgeGroup?: string;
  patientGender?: string;
  lang?: 'en' | 'ta';
  triage: TriageResult;
  userLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  assignedHospitalId: string;
  ambulanceId: string;
  status: 'DISPATCHED' | 'ACCEPTED' | 'DIVERTED' | 'EN_ROUTE' | 'ARRIVED';
  etaMinutes: number;
  distanceKm?: number;
  goldenHourElapsedMinutes: number;
  hospitalBedReserved: boolean;
  traumaTeamMobilized: boolean;
  cathLabPrepped: boolean;
  consent?: boolean;
  shareToken?: string;
  vitalsTelemetry?: {
    heartRate: number;
    spO2: number;
    bloodPressure: string;
    respiratoryRate: number;
    gcsScore: number;
  };
  activityLog: Array<{
    time: string;
    event: string;
    actor: string;
  }>;
}

export interface User {
  id: string;
  role: 'patient' | 'hospital' | 'admin';
  name: string;
  phone?: string;
  email?: string;
  lang: 'en' | 'ta';
  hospitalId?: string;
  createdAt: number;
  lastLoginAt?: number;
  profile?: {
    bloodGroup?: string;
    allergies?: string;
    emergencyContacts: Array<{ name: string; phone: string }>;
  };
}

export interface MessageLogEntry {
  id: string;
  alertId: string;
  channel: 'whatsapp' | 'sms' | 'telegram';
  recipient: string;
  status: 'sent' | 'failed' | 'simulated';
  detail: string;
  timestamp: number;
}

export interface DemoOtpPayload {
  phone: string;
  otp: string;
  expiresAt: number;
  demo: boolean;
  message: string;
  channel?: 'sms' | 'whatsapp';
}

