import type {
  AppointmentDate,
  AppointmentSlot,
  DemoProfile,
  DFAOffice,
  GroupApplicantSummary,
  PassportJourneyStatus,
  ProcessingType,
} from './types.js';

export const PROTOTYPE_DISCLAIMER =
  'This prototype uses synthetic data and simulated transactions. It is not connected to DFA, eGovPH, GCash, Maya, or any payment provider.';

export const DOCUMENT_WARNING = 'DEMONSTRATION ONLY - NOT A VALID DFA DOCUMENT';

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
  emergencyContact: 'Maria Dela Cruz - +63 918 *** 3201',
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

const office = (
  id: string,
  name: string,
  city: string,
  address: string,
  latitude: number,
  longitude: number,
  earliestAvailableDate: string,
  availableSlotCount: number,
): DFAOffice => ({
  id,
  name,
  city,
  address,
  latitude,
  longitude,
  earliestAvailableDate,
  availableSlotCount,
  synthetic: true,
});

export const DEMO_OFFICES: DFAOffice[] = [
  office('dfa-antipolo-demo', 'ANTIPOLO (SM CENTER, ANTIPOLO CITY, RIZAL)', 'Antipolo', 'SM Center Antipolo, Antipolo City, Rizal', 14.5865, 121.1762, '2026-11-04', 14),
  office('dfa-ncr-east-demo', 'DFA NCR EAST (SM MEGAMALL, MANDALUYONG CITY)', 'Mandaluyong', 'SM Megamall, Mandaluyong City', 14.5847, 121.0567, '2026-11-05', 9),
  office('dfa-ncr-northeast-demo', 'DFA NCR NORTHEAST (ALI MALL CUBAO, QUEZON CITY)', 'Quezon City', 'Ali Mall, Araneta City, Quezon City', 14.6204, 121.0538, '2026-11-06', 7),
  office('dfa-aseana-demo', 'DFA MANILA (ASEANA)', 'Paranaque', 'Aseana Business Park, Paranaque City', 14.5298, 120.9903, '2026-11-07', 18),
  office('dfa-san-pablo-demo', 'SAN PABLO (SM CITY SAN PABLO)', 'San Pablo', 'SM City San Pablo, Laguna', 14.0744, 121.3237, '2026-11-10', 11),
  office('dfa-batangas-demo', 'BATANGAS (SM CITY BATANGAS)', 'Batangas City', 'SM City Batangas, Batangas City', 13.7565, 121.0583, '2026-11-12', 8),
  office('dfa-angeles-demo', 'ANGELES (SM CITY CLARK, ANGELES CITY)', 'Angeles', 'SM City Clark, Angeles City', 15.1683, 120.5809, '2026-11-13', 10),
  office('dfa-antique-demo', 'ANTIQUE (CITYMALL ANTIQUE)', 'San Jose de Buenavista', 'CityMall Antique, Antique', 10.745, 121.942, '2026-11-14', 5),
  office('dfa-bacolod-demo', 'BACOLOD (ROBINSONS BACOLOD)', 'Bacolod', 'Robinsons Bacolod, Bacolod City', 10.6765, 122.9509, '2026-11-15', 8),
  office('dfa-baguio-demo', 'BAGUIO (SM CITY BAGUIO)', 'Baguio', 'SM City Baguio, Baguio City', 16.4114, 120.5931, '2026-11-16', 7),
  office('dfa-balanga-demo', 'BALANGA (THE BUNKER BUILDING, CAPITOL COMPOUND)', 'Balanga', 'The Bunker Building, Capitol Compound, Balanga City', 14.6761, 120.536, '2026-11-17', 6),
  office('dfa-butuan-demo', 'BUTUAN (ROBINSONS BUTUAN)', 'Butuan', 'Robinsons Butuan, Butuan City', 8.9475, 125.5406, '2026-11-18', 9),
  office('dfa-cagayan-de-oro-demo', 'CAGAYAN DE ORO (BPO TOWER SM DOWNTOWN PREMIER)', 'Cagayan de Oro', 'BPO Tower, SM Downtown Premier, Cagayan de Oro', 8.4822, 124.6472, '2026-11-19', 12),
  office('dfa-calasaio-demo', 'CALASIAO (ROBINSONS CALASIAO, PANGASINAN)', 'Calasiao', 'Robinsons Calasiao, Pangasinan', 16.0165, 120.3585, '2026-11-20', 6),
  office('dfa-candon-demo', 'CANDON (CANDON CITY ARENA)', 'Candon', 'Candon City Arena, Candon City', 17.1947, 120.4517, '2026-11-21', 4),
  office('dfa-cebu-demo', 'CEBU (ROBINSONS GALLERIA, CEBU CITY)', 'Cebu City', 'Robinsons Galleria Cebu, Cebu City', 10.3069, 123.9094, '2026-11-22', 16),
  office('dfa-clarin-demo', 'CLARIN (TOWN CENTER, CLARIN, MISAMIS OCC)', 'Clarin', 'Town Center, Clarin, Misamis Occidental', 8.2046, 123.8589, '2026-11-23', 5),
  office('dfa-ncr-central-demo', 'DFA NCR CENTRAL - (ROBINSONS GALLERIA ORTIGAS, QUEZON CITY)', 'Quezon City', 'Robinsons Galleria Ortigas, Quezon City', 14.5916, 121.0598, '2026-11-24', 8),
  office('dfa-ncr-north-demo', 'DFA NCR NORTH (ROBINSONS NOVALICHES, QUEZON CITY)', 'Quezon City', 'Robinsons Novaliches, Quezon City', 14.7346, 121.0553, '2026-11-25', 6),
  office('dfa-ncr-south-demo', 'DFA NCR SOUTH (FESTIVAL MALL, MUNTINLUPA CITY)', 'Muntinlupa', 'Festival Mall, Muntinlupa City', 14.4171, 121.0385, '2026-11-26', 7),
  office('dfa-ncr-west-demo', 'DFA NCR WEST (SM CITY, MANILA)', 'Manila', 'SM City Manila, Manila', 14.5902, 120.9826, '2026-11-27', 7),
  office('dfa-dasmarinas-demo', 'DASMARINAS (SM CITY DASMARINAS)', 'Dasmarinas', 'SM City Dasmarinas, Cavite', 14.3009, 120.9563, '2026-11-28', 9),
  office('dfa-davao-demo', 'DAVAO (SM CITY DAVAO)', 'Davao City', 'SM City Davao, Davao City', 7.0503, 125.5889, '2026-11-29', 13),
  office('dfa-dumaguete-demo', 'DUMAGUETE (ROBINSONS DUMAGUETE)', 'Dumaguete', 'Robinsons Dumaguete, Dumaguete City', 9.3068, 123.3054, '2026-11-30', 6),
  office('dfa-general-santos-demo', 'GENERAL SANTOS (ROBINSONS GEN. SANTOS CITY)', 'General Santos', 'Robinsons General Santos City', 6.1164, 125.1716, '2026-12-01', 6),
  office('dfa-ilocos-norte-demo', 'ILOCOS NORTE (ROBINSONS PLACE, SAN NICOLAS)', 'San Nicolas', 'Robinsons Place Ilocos, San Nicolas', 18.1776, 120.5963, '2026-12-02', 7),
  office('dfa-iloilo-demo', 'ILOILO (ROBINSONS ILOILO)', 'Iloilo City', 'Robinsons Iloilo, Iloilo City', 10.7202, 122.5621, '2026-12-03', 10),
  office('dfa-kidapawan-demo', 'KIDAPAWAN (KIDAPAWAN CITY)', 'Kidapawan', 'Kidapawan City, Cotabato', 7.0083, 125.0894, '2026-12-04', 4),
  office('dfa-la-union-demo', 'LA UNION (CSI MALL SAN FERNANDO, LA UNION)', 'San Fernando', 'CSI Mall San Fernando, La Union', 16.6159, 120.3166, '2026-12-05', 6),
  office('dfa-legazpi-demo', 'LEGAZPI (PACIFIC MALL LEGAZPI)', 'Legazpi', 'Pacific Mall Legazpi, Legazpi City', 13.1391, 123.7438, '2026-12-06', 8),
  office('dfa-lipa-demo', 'LIPA (ROBINSONS LIPA)', 'Lipa', 'Robinsons Lipa, Lipa City', 13.9411, 121.1647, '2026-12-07', 7),
  office('dfa-lucena-demo', 'LUCENA (PACIFIC MALL, LUCENA)', 'Lucena', 'Pacific Mall Lucena, Lucena City', 13.9414, 121.6232, '2026-12-08', 5),
  office('dfa-malolos-demo', 'MALOLOS (CTTCH, XENTRO MALL, MALOLOS CITY)', 'Malolos', 'CTTCH, Xentro Mall, Malolos City', 14.8527, 120.816, '2026-12-09', 9),
  office('dfa-olongapo-demo', 'OLONGAPO (SM CITY OLONGAPO CENTRAL)', 'Olongapo', 'SM City Olongapo Central, Olongapo City', 14.8386, 120.2842, '2026-12-10', 6),
  office('dfa-pagadian-demo', 'PAGADIAN (C3 MALL, PAGADIAN CITY)', 'Pagadian', 'C3 Mall, Pagadian City', 7.8257, 123.437, '2026-12-11', 4),
  office('dfa-pampanga-demo', 'PAMPANGA (ROBINSONS STARMILLS SAN FERNANDO)', 'San Fernando', 'Robinsons Starmills, San Fernando, Pampanga', 15.0583, 120.6963, '2026-12-12', 10),
  office('dfa-paniqui-demo', 'PANIQUI, TARLAC (WALTERMART)', 'Paniqui', 'Waltermart Paniqui, Tarlac', 15.6689, 120.5803, '2026-12-13', 5),
  office('dfa-puerto-princesa-demo', 'PUERTO PRINCESA (ROBINSONS PALAWAN)', 'Puerto Princesa', 'Robinsons Palawan, Puerto Princesa', 9.7638, 118.7473, '2026-12-14', 6),
  office('dfa-santiago-demo', 'SANTIAGO (ISABELA) (ROBINSONS PLACE SANTIAGO)', 'Santiago', 'Robinsons Place Santiago, Isabela', 16.6881, 121.5487, '2026-12-15', 5),
  office('dfa-tacloban-demo', 'TACLOBAN (ROBINSONS N. ABUCAY, TAC. CITY)', 'Tacloban', 'Robinsons North Abucay, Tacloban City', 11.2543, 125.0029, '2026-12-16', 8),
  office('dfa-tagbilaran-demo', 'TAGBILARAN (ALTURAS MALL, TAGBILARAN CITY)', 'Tagbilaran', 'Alturas Mall, Tagbilaran City', 9.6504, 123.853, '2026-12-17', 6),
  office('dfa-tagum-demo', 'TAGUM (ROBINSONS PLACE OF TAGUM)', 'Tagum', 'Robinsons Place Tagum, Tagum City', 7.4478, 125.8073, '2026-12-18', 5),
  office('dfa-tuguegarao-demo', 'TUGUEGARAO (REG. GOVT CENTER, TUGUEGARAO CITY)', 'Tuguegarao', 'Regional Government Center, Tuguegarao City', 17.6132, 121.727, '2026-12-19', 7),
  office('dfa-zamboanga-demo', 'ZAMBOANGA (GO-VELAYO BLDG. VET. AVE. ZAMBO)', 'Zamboanga', 'Go-Velayo Building, Veterans Avenue, Zamboanga City', 6.9214, 122.079, '2026-12-20', 6),
];

export const OFFICE_DATES: Record<string, AppointmentDate[]> = Object.fromEntries(
  DEMO_OFFICES.map((dfaOffice, officeIndex) => [
    dfaOffice.id,
    [0, 1, 2].map((offset) => ({
      date: new Date(Date.UTC(2026, 10, 4 + officeIndex + offset)).toISOString().slice(0, 10),
      availableSlotCount: [6, 5, 3][offset]!,
    })),
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

export const GROUP_APPOINTMENT_INFO = [
  'Application type for each applicant',
  'Shared site, date, and timeslot selection',
  'Working email address and mobile number',
  'Full name, birth date, birth place, sex, civil status, and citizenship',
  'Current address, occupation, and emergency contact',
  'Father name and mother maiden name',
  'Current passport details for renewal applicants',
  'Applicant-specific requirements and consent',
] as const;

export const DEMO_GROUP_APPLICANTS: GroupApplicantSummary[] = [
  {
    id: 'group-primary',
    label: 'Applicant 1',
    relationship: 'Primary applicant',
    service: 'ADULT_RENEWAL',
    requestedInfo: [...GROUP_APPOINTMENT_INFO],
  },
  {
    id: 'group-spouse',
    label: 'Applicant 2',
    relationship: 'Spouse',
    service: 'ADULT_RENEWAL',
    requestedInfo: [...GROUP_APPOINTMENT_INFO],
  },
  {
    id: 'group-child',
    label: 'Applicant 3',
    relationship: 'Minor child',
    service: 'MINOR',
    requestedInfo: [
      ...GROUP_APPOINTMENT_INFO,
      'Parent or guardian information and minor-specific supporting documents',
    ],
  },
  {
    id: 'group-parent',
    label: 'Applicant 4',
    relationship: 'Parent',
    service: 'NEW_ADULT',
    requestedInfo: [...GROUP_APPOINTMENT_INFO],
  },
  {
    id: 'group-sibling',
    label: 'Applicant 5',
    relationship: 'Sibling',
    service: 'NEW_ADULT',
    requestedInfo: [...GROUP_APPOINTMENT_INFO],
  },
];

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
