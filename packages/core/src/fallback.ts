import type { AssistantResponse, ConversationState } from './types.js';

const reply = (
  state: ConversationState,
  message: string,
  options: Array<[string, string]> = [],
  alertLevel: AssistantResponse['alertLevel'] = 'info',
): AssistantResponse => ({
  message,
  state,
  quickReplies: options.map(([label, value], index) => ({
    id: `${state.toLowerCase()}-${index + 1}`,
    label,
    value,
    variant: index === 0 ? 'primary' : 'secondary',
  })),
  proposedAction: { type: 'NONE', arguments: {} },
  alertLevel,
});

export function fallbackForState(state: ConversationState): AssistantResponse {
  const map: Record<ConversationState, AssistantResponse> = {
    IDLE: reply('SELECT_SERVICE', 'Certainly. What passport service do you need?', [
      ['New adult passport', 'NEW_ADULT'],
      ['Adult passport renewal', 'ADULT_RENEWAL'],
      ['Minor passport', 'MINOR'],
      ['Lost or damaged passport', 'LOST_OR_DAMAGED'],
      ['I am not sure', 'UNSURE'],
    ]),
    SELECT_SERVICE: reply('SELECT_SERVICE', 'What passport service do you need?', [
      ['New adult passport', 'NEW_ADULT'],
      ['Adult passport renewal', 'ADULT_RENEWAL'],
      ['I am not sure', 'UNSURE'],
    ]),
    SELECT_APPLICANT_TYPE: reply(
      'SELECT_APPLICANT_TYPE',
      'Please choose the applicant type to continue this demonstration.',
    ),
    RENEWAL_PASSPORT_CONDITION: reply(
      'RENEWAL_PASSPORT_CONDITION',
      'What is the current condition of your passport?',
      [
        ['Intact ePassport', 'INTACT'],
        ['Expired ePassport', 'EXPIRED'],
        ['Damaged passport', 'DAMAGED'],
        ['Lost or stolen', 'LOST'],
      ],
    ),
    RENEWAL_INFORMATION_CHANGE: reply(
      'RENEWAL_INFORMATION_CHANGE',
      'Are you requesting changes to your name or personal information?',
      [
        ['No changes', 'NO_CHANGE'],
        ['Use married surname', 'MARRIED_SURNAME'],
        ['Return to maiden name', 'RETURN_TO_MAIDEN'],
        ['Correct information', 'CORRECTION'],
      ],
    ),
    REQUEST_LOCATION: reply(
      'REQUEST_LOCATION',
      'To find nearby demo DFA offices, may eGovAI use your current location?',
      [
        ['Allow location', 'ALLOW_LOCATION'],
        ['Select city manually', 'SELECT_CITY'],
        ['View all locations', 'VIEW_ALL_OFFICES'],
      ],
    ),
    FINDING_OFFICES: reply('FINDING_OFFICES', 'Finding nearby synthetic DFA offices…'),
    SELECT_OFFICE: reply(
      'SELECT_OFFICE',
      'Choose a synthetic DFA office to view its demonstration schedule.',
    ),
    SELECT_DATE: reply('SELECT_DATE', 'Select your preferred demonstration appointment date.'),
    SELECT_TIME: reply('SELECT_TIME', 'Select a specific available demonstration time.'),
    NO_SLOT_AVAILABLE: reply(
      'NO_SLOT_AVAILABLE',
      'No matching demonstration slots are available. Would you like eGovAI to watch for one?',
      [
        ['Join Slot Watch', 'JOIN_SLOT_WATCH'],
        ['Search nearby', 'SEARCH_NEARBY'],
        ['Choose another office', 'CHOOSE_OFFICE'],
      ],
      'warning',
    ),
    CONFIGURE_SLOT_WATCH: reply(
      'CONFIGURE_SLOT_WATCH',
      'Choose a date range and time preference for Slot Watch.',
    ),
    SLOT_WATCH_ACTIVE: reply(
      'SLOT_WATCH_ACTIVE',
      'Slot Watch is active. You will be notified when a matching demonstration slot appears.',
      [],
      'success',
    ),
    SLOT_OFFER_AVAILABLE: reply(
      'SLOT_OFFER_AVAILABLE',
      'A matching demonstration appointment became available. Reserve it before the offer expires.',
      [
        ['Reserve and continue', 'ACCEPT_SLOT_OFFER'],
        ['Decline', 'DECLINE_SLOT_OFFER'],
      ],
      'success',
    ),
    PREPARING_FORM: reply('PREPARING_FORM', 'Preparing a form from the synthetic eGovPH profile…'),
    REVIEW_FORM: reply(
      'REVIEW_FORM',
      'Your demonstration application is ready. Review all information before continuing.',
    ),
    SELECT_PROCESSING_TYPE: reply(
      'SELECT_PROCESSING_TYPE',
      'Choose regular or expedited demonstration processing.',
      [
        ['Regular · ₱1,000', 'REGULAR'],
        ['Expedited · ₱1,250', 'EXPEDITED'],
      ],
    ),
    REVIEW_APPOINTMENT: reply(
      'REVIEW_APPOINTMENT',
      'Review the office, schedule, service, processing type, and fee. Confirm to hold the slot.',
    ),
    HOLDING_SLOT: reply(
      'HOLDING_SLOT',
      'Your demonstration slot is temporarily held while simulated payment is completed.',
    ),
    SELECT_PAYMENT_METHOD: reply(
      'SELECT_PAYMENT_METHOD',
      'Choose a simulated payment method.',
      [
        ['GCash', 'GCASH'],
        ['Maya', 'MAYA'],
        ['Credit/debit card', 'CARD'],
      ],
    ),
    PAYMENT_PENDING: reply('PAYMENT_PENDING', 'The simulated transaction is awaiting completion.'),
    PAYMENT_VERIFYING: reply('PAYMENT_VERIFYING', 'Verifying the simulated payment server-side…'),
    PAYMENT_SUCCESSFUL: reply(
      'PAYMENT_SUCCESSFUL',
      'The backend verified the simulated payment.',
      [],
      'success',
    ),
    PAYMENT_FAILED: reply(
      'PAYMENT_FAILED',
      'The simulated payment was not completed. No charge was made.',
      [['Try another method', 'RETRY_PAYMENT']],
      'error',
    ),
    APPOINTMENT_CONFIRMED: reply(
      'APPOINTMENT_CONFIRMED',
      'Payment successful! Your demonstration DFA passport appointment is confirmed.',
      [],
      'success',
    ),
    APPOINTMENT_COMPLETED: reply(
      'APPOINTMENT_COMPLETED',
      'DFA received the demonstration application and biometric information.',
      [],
      'success',
    ),
    PASSPORT_UNDER_REVIEW: reply(
      'PASSPORT_UNDER_REVIEW',
      'Your demonstration passport application is currently under review.',
    ),
    PASSPORT_APPROVED: reply(
      'PASSPORT_APPROVED',
      'Your demonstration application was approved and sent for passport production.',
      [],
      'success',
    ),
    PASSPORT_IN_PRODUCTION: reply(
      'PASSPORT_IN_PRODUCTION',
      'Your demonstration passport is in the synthetic production stage.',
    ),
    PASSPORT_DISPATCHED: reply(
      'PASSPORT_DISPATCHED',
      'Your demonstration passport was dispatched. We will notify you when pickup is available.',
    ),
    PASSPORT_READY_FOR_PICKUP: reply(
      'PASSPORT_READY_FOR_PICKUP',
      'Good news! Your demonstration passport is ready for pickup at the supplied release office.',
      [
        ['Remind me tomorrow', 'REMIND_TOMORROW'],
        ['View office hours', 'VIEW_HOURS'],
      ],
      'success',
    ),
    PASSPORT_CLAIMED: reply(
      'PASSPORT_CLAIMED',
      'Your demonstration passport was marked as claimed. Passport Journey is complete.',
      [],
      'success',
    ),
    ADDITIONAL_REQUIREMENT: reply(
      'ADDITIONAL_REQUIREMENT',
      'A demonstration supporting requirement was requested. Open Passport Journey for details.',
      [],
      'warning',
    ),
    ERROR: reply(
      'ERROR',
      'Something interrupted the demonstration. Your sensitive information was not affected.',
      [['Return to start', 'RESET']],
      'error',
    ),
  };
  return map[state];
}
