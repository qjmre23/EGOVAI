import { describe, expect, it } from 'vitest';
import { canTransition, isActionAllowed } from './stateMachine.js';

describe('conversation state machine', () => {
  it('allows the standard booking sequence', () => {
    expect(canTransition('SELECT_OFFICE', 'SELECT_DATE')).toBe(true);
    expect(canTransition('PAYMENT_VERIFYING', 'PAYMENT_SUCCESSFUL')).toBe(true);
    expect(canTransition('PAYMENT_SUCCESSFUL', 'APPOINTMENT_CONFIRMED')).toBe(true);
  });

  it('blocks skipping payment verification and booking prerequisites', () => {
    expect(canTransition('PAYMENT_PENDING', 'PAYMENT_SUCCESSFUL')).toBe(false);
    expect(canTransition('SELECT_OFFICE', 'APPOINTMENT_CONFIRMED')).toBe(false);
    expect(canTransition('REVIEW_APPOINTMENT', 'APPOINTMENT_CONFIRMED')).toBe(false);
  });

  it('blocks AI-driven passport status jumps', () => {
    expect(canTransition('PASSPORT_UNDER_REVIEW', 'PASSPORT_READY_FOR_PICKUP')).toBe(false);
    expect(isActionAllowed('PASSPORT_UNDER_REVIEW', 'CONFIRM_APPOINTMENT')).toBe(false);
  });
});
