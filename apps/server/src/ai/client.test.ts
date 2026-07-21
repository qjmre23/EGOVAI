import { describe, expect, it } from 'vitest';
import { aiInternals } from './client.js';

describe('AI response safety', () => {
  it('extracts fenced JSON and validates schema', () => {
    const raw = '```json\n{"message":"Choose a service","state":"SELECT_SERVICE","quickReplies":[],"proposedAction":{"type":"NONE","arguments":{}},"alertLevel":"info"}\n```';
    const parsed = aiInternals.validateAiResponse(raw, 'SELECT_SERVICE');
    expect(parsed.message).toBe('Choose a service');
  });

  it('rejects invalid transactional transitions', () => {
    const raw = '{"message":"Confirmed","state":"APPOINTMENT_CONFIRMED","quickReplies":[],"proposedAction":{"type":"NONE","arguments":{}},"alertLevel":"success"}';
    expect(() => aiInternals.validateAiResponse(raw, 'SELECT_OFFICE')).toThrow(/invalid state/i);
  });
});
