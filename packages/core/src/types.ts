import { z } from 'zod';

export const conversationStates = [
  'IDLE',
  'SELECT_SERVICE',
  'SELECT_APPLICANT_TYPE',
  'SELECT_GROUP_SIZE',
  'REVIEW_GROUP_APPLICANTS',
  'RENEWAL_PASSPORT_CONDITION',
  'RENEWAL_INFORMATION_CHANGE',
  'REQUEST_LOCATION',
  'FINDING_OFFICES',
  'SELECT_OFFICE',
  'SELECT_DATE',
  'SELECT_TIME',
  'NO_SLOT_AVAILABLE',
  'CONFIGURE_SLOT_WATCH',
  'SLOT_WATCH_ACTIVE',
  'SLOT_OFFER_AVAILABLE',
  'PREPARING_FORM',
  'REVIEW_FORM',
  'SELECT_PROCESSING_TYPE',
  'REVIEW_APPOINTMENT',
  'HOLDING_SLOT',
  'SELECT_PAYMENT_METHOD',
  'PAYMENT_PENDING',
  'PAYMENT_VERIFYING',
  'PAYMENT_SUCCESSFUL',
  'PAYMENT_FAILED',
  'APPOINTMENT_CONFIRMED',
  'APPOINTMENT_COMPLETED',
  'PASSPORT_UNDER_REVIEW',
  'PASSPORT_APPROVED',
  'PASSPORT_IN_PRODUCTION',
  'PASSPORT_DISPATCHED',
  'PASSPORT_READY_FOR_PICKUP',
  'PASSPORT_CLAIMED',
  'ADDITIONAL_REQUIREMENT',
  'ERROR',
] as const;

export const allowedActions = [
  'NONE',
  'REQUEST_LOCATION_PERMISSION',
  'FIND_NEARBY_OFFICES',
  'LOAD_AVAILABLE_DATES',
  'LOAD_AVAILABLE_TIMES',
  'PREPARE_APPLICATION_FORM',
  'CREATE_SLOT_WATCH',
  'ACCEPT_SLOT_OFFER',
  'HOLD_APPOINTMENT_SLOT',
  'CREATE_PAYMENT_SESSION',
  'CHECK_PAYMENT_STATUS',
  'CONFIRM_APPOINTMENT',
  'LOAD_PASSPORT_JOURNEY',
  'SET_PICKUP_REMINDER',
] as const;

export type ConversationState = (typeof conversationStates)[number];
export type AllowedAction = (typeof allowedActions)[number];
export type PassportServiceType =
  | 'NEW_ADULT'
  | 'ADULT_RENEWAL'
  | 'GROUP'
  | 'MINOR'
  | 'LOST_OR_DAMAGED'
  | 'UNSURE';
export type RenewalPassportCondition =
  | 'INTACT'
  | 'EXPIRED'
  | 'DAMAGED'
  | 'LOST'
  | 'OLD_NON_EPASSPORT'
  | 'UNSURE';
export type InformationChangeType =
  | 'NO_CHANGE'
  | 'MARRIED_SURNAME'
  | 'RETURN_TO_MAIDEN'
  | 'CORRECTION'
  | 'OTHER';
export type ProcessingType = 'REGULAR' | 'EXPEDITED';

export interface DFAOffice {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  earliestAvailableDate: string;
  availableSlotCount: number;
  distanceKm?: number;
  synthetic: true;
}

export interface AppointmentDate {
  date: string;
  availableSlotCount: number;
}

export interface AppointmentSlot {
  id: string;
  officeId: string;
  date: string;
  time: string;
  available: boolean;
}

export interface DemoProfile {
  verified: true;
  fullName: string;
  displayName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  sex: 'Male' | 'Female';
  civilStatus: string;
  address: string;
  mobile: string;
  email: string;
  occupation: string;
  fatherName: string;
  motherMaidenName: string;
  citizenship: string;
  emergencyContact: string;
}

export interface ApplicationForm {
  id: string;
  type: PassportServiceType;
  profile: DemoProfile;
  groupApplicantCount?: number;
  groupApplicants?: GroupApplicantSummary[];
  completionPercentage: number;
  missingFields: string[];
  requestedChange: InformationChangeType;
  passportNumberMasked?: string;
  requirements: string[];
  warnings: string[];
  consented: boolean;
}

export interface GroupApplicantSummary {
  id: string;
  label: string;
  relationship: string;
  service: 'NEW_ADULT' | 'ADULT_RENEWAL' | 'MINOR';
  requestedInfo: string[];
}

export interface AppointmentHold {
  id: string;
  officeId: string;
  date: string;
  time: string;
  service: PassportServiceType;
  groupApplicantCount?: number;
  informationChange?: InformationChangeType;
  processingType: ProcessingType;
  amount: number;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'RELEASED' | 'CONSUMED';
}

export interface SlotWatchRequest {
  id: string;
  officeId: string;
  dateFrom: string;
  dateTo: string;
  timePreference: 'MORNING' | 'AFTERNOON' | 'ANY';
  createdAt: string;
  status: 'ACTIVE' | 'OFFERED' | 'FULFILLED' | 'DECLINED' | 'EXPIRED';
}

export interface SlotOffer {
  id: string;
  slotWatchId: string;
  slot: AppointmentSlot;
  expiresAt: string;
  status: 'ACTIVE' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
}

export interface PaymentSession {
  id: string;
  holdId: string;
  method: 'GCASH' | 'MAYA' | 'CARD';
  amount: number;
  reference: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
}

export interface Appointment {
  id: string;
  code: string;
  holdId: string;
  paymentId: string;
  office: DFAOffice;
  date: string;
  time: string;
  service: PassportServiceType;
  groupApplicantCount?: number;
  groupAppointmentCodes?: string[];
  processingType: ProcessingType;
  amountPaid: number;
  paymentReference: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  requirements: string[];
  createdAt: string;
  applicationId: string;
}

export const passportJourneyStatuses = [
  'APPOINTMENT_CONFIRMED',
  'APPOINTMENT_COMPLETED',
  'BIOMETRICS_CAPTURED',
  'UNDER_REVIEW',
  'ADDITIONAL_REQUIREMENT',
  'APPROVED',
  'IN_PRODUCTION',
  'DISPATCHED',
  'READY_FOR_PICKUP',
  'CLAIMED',
] as const;

export type PassportJourneyStatus = (typeof passportJourneyStatuses)[number];

export interface PassportJourneyEvent {
  id: string;
  status: PassportJourneyStatus;
  title: string;
  explanation: string;
  timestamp: string;
  source: 'Simulated DFA Status Service';
}

export interface PassportJourney {
  applicationId: string;
  appointmentId: string;
  currentStatus: PassportJourneyStatus;
  maskedReference: string;
  releaseOffice: string;
  events: PassportJourneyEvent[];
}

export interface Notification {
  id: string;
  category: 'APPOINTMENT' | 'SLOT_WATCH' | 'PAYMENT' | 'PASSPORT_STATUS' | 'PICKUP' | 'SYSTEM';
  title: string;
  preview: string;
  timestamp: string;
  read: boolean;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  relatedType?: 'APPOINTMENT' | 'SLOT_OFFER' | 'PASSPORT_JOURNEY' | 'CHAT';
  relatedId?: string;
}

export interface AuditEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export const assistantResponseSchema = z.object({
  message: z.string().min(1).max(2000),
  state: z.enum(conversationStates),
  quickReplies: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1).max(120),
        value: z.string().min(1).max(120),
        variant: z.enum(['primary', 'secondary', 'danger']),
      }),
    )
    .max(8),
  proposedAction: z.object({
    type: z.enum(allowedActions),
    arguments: z.record(z.unknown()),
  }),
  alertLevel: z.enum(['info', 'success', 'warning', 'error']),
});

export type AssistantResponse = z.infer<typeof assistantResponseSchema>;
