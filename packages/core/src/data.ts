import type {
  AppointmentDate,
  AppointmentSlot,
  DemoProfile,
  DFAOffice,
  PassportJourneyStatus,
  ProcessingType,
} from './types.js';

export const PROTOTYPE_DISCLAIMER =
  'This prototype uses synthetic data and simulated transactions. It is not connected to DFA, eGovPH, GCash, Maya, or any payment provider.';

export const DOCUMENT_WARNING = 'DEMONSTRATION ONLY — NOT A VALID DFA DOCUMENT';

export const DEMO_PROFILE: DemoProfile = {
  verified: true,
  fullName: 'JUAN SANTOS DELA CRUZ',
  displayName: 'Juan',
  dateOfBirth: '1995-05-10',
  placeOfBirth: 'Quezon City, Metro Manila',
  sex: 'Male',
  civilStatus: 'Married',
  address: '42 Mabuhay Street, Quezon City',
  mobile: '+63 917 *** 0184',
  email: 'juan.demo@example.test',
  occupation: 'Product Designer',
  fatherName: 'ROBERTO M. DELA CRUZ',
  motherMaidenName: 'ELENA SANTOS REYES',
  citizenship: 'Filipino',
  emergencyContact: 'Maria Dela Cruz · +63 918 *** 3201',
};

export const DEMO_PASSPORT_RECORD = {
  recordFound: true,
  passportNumberMasked: 'P12****89',
  dateIssued: '2017-08-14',
  dateOfExpiry: '2027-08-13',
  issuingAuthority: 'DFA Manila',
  holderName: 'JUAN SANTOS DELA CRUZ',
  status: 'ACTIVE',
} as const;

export const DEMO_OFFICES: DFAOffice[] = [
  {
    id: 'dfa-antipolo-demo',
    name: 'DFA Antipolo — Demo',
    city: 'Antipolo',
    address: 'SM Cherry Antipolo, Marikina-Infanta Highway',
    latitude: 14.5865,
    longitude: 121.1762,
    earliestAvailableDate: '2026-11-04',
    availableSlotCount: 14,
    synthetic: true,
  },
  {
    id: 'dfa-ncr-east-demo',
    name: 'DFA NCR East — Demo',
    city: 'Pasig',
    address: 'SM Megamall, Mandaluyong City',
    latitude: 14.5847,
    longitude: 121.0567,
    earliestAvailableDate: '2026-11-05',
    availableSlotCount: 9,
    synthetic: true,
  },
  {
    id: 'dfa-ncr-northeast-demo',
    name: 'DFA NCR Northeast — Demo',
    city: 'Quezon City',
    address: 'Ali Mall, Araneta City, Quezon City',
    latitude: 14.6204,
    longitude: 121.0538,
    earliestAvailableDate: '2026-11-06',
    availableSlotCount: 7,
    synthetic: true,
  },
  {
    id: 'dfa-aseana-demo',
    name: 'DFA Aseana — Demo',
    city: 'Parañaque',
    address: 'Aseana Business Park, Parañaque City',
    latitude: 14.5298,
    longitude: 120.9903,
    earliestAvailableDate: '2026-11-07',
    availableSlotCount: 18,
    synthetic: true,
  },
  {
    id: 'dfa-san-pablo-demo',
    name: 'DFA San Pablo — Demo',
    city: 'San Pablo',
    address: 'SM City San Pablo, Laguna',
    latitude: 14.0744,
    longitude: 121.3237,
    earliestAvailableDate: '2026-11-10',
    availableSlotCount: 11,
    synthetic: true,
  },
  {
    id: 'dfa-batangas-demo',
    name: 'DFA Batangas — Demo',
    city: 'Batangas City',
    address: 'SM City Batangas, Batangas City',
    latitude: 13.7565,
    longitude: 121.0583,
    earliestAvailableDate: '2026-11-12',
    availableSlotCount: 8,
    synthetic: true,
  },
];

export const OFFICE_DATES: Record<string, AppointmentDate[]> = Object.fromEntries(
  DEMO_OFFICES.map((office, officeIndex) => [
    office.id,
    [
      { date: `2026-11-${String(4 + officeIndex).padStart(2, '0')}`, availableSlotCount: 6 },
      { date: `2026-11-${String(5 + officeIndex).padStart(2, '0')}`, availableSlotCount: 5 },
      { date: `2026-11-${String(6 + officeIndex).padStart(2, '0')}`, availableSlotCount: 3 },
    ],
  ]),
);

export const DEFAULT_TIMES = ['09:00', '09:30', '10:00', '13:30', '14:00', '15:00'];

export function createSlots(officeId: string, date: string): AppointmentSlot[] {
  return DEFAULT_TIMES.map((time) => ({
    id: `${officeId}-${date}-${time.replace(':', '')}`,
    officeId,
    date,
    time,
    available: true,
  }));
}

export const FEES: Record<ProcessingType, { processing: number; convenience: number; total: number }> = {
  REGULAR: { processing: 950, convenience: 50, total: 1000 },
  EXPEDITED: { processing: 1200, convenience: 50, total: 1250 },
};

export const JOURNEY_COPY: Record<PassportJourneyStatus, { title: string; explanation: string }> = {
  APPOINTMENT_CONFIRMED: {
    title: 'Appointment confirmed',
    explanation: 'Your demonstration appointment is saved and ready for the scheduled visit.',
  },
  APPOINTMENT_COMPLETED: {
    title: 'Appointment completed',
    explanation: 'DFA received the demonstration application and biometric information.',
  },
  BIOMETRICS_CAPTURED: {
    title: 'Biometrics captured',
    explanation: 'Photo, fingerprints, and signature were recorded in the simulated visit.',
  },
  UNDER_REVIEW: {
    title: 'Under DFA verification',
    explanation: 'The demonstration passport application is currently under review.',
  },
  ADDITIONAL_REQUIREMENT: {
    title: 'Additional requirement requested',
    explanation: 'A synthetic supporting document is requested before review can continue.',
  },
  APPROVED: {
    title: 'Application approved',
    explanation: 'The demonstration application was approved and sent for production.',
  },
  IN_PRODUCTION: {
    title: 'Passport production',
    explanation: 'The demonstration passport is in the synthetic production stage.',
  },
  DISPATCHED: {
    title: 'Dispatched to release location',
    explanation: 'The demonstration passport was dispatched but is not yet ready for pickup.',
  },
  READY_FOR_PICKUP: {
    title: 'Ready for pickup',
    explanation: 'DFA has confirmed that the demonstration passport is ready for pickup.',
  },
  CLAIMED: {
    title: 'Passport claimed',
    explanation: 'The demonstration Passport Journey is complete.',
  },
};
