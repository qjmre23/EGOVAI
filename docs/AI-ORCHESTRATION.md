# AI orchestration

## Role of AI

The Qwen model improves natural-language understanding, concise explanations, requirement guidance, and English/Filipino/Taglish tone matching. It is never a source of transactional truth.

The application, not the model, owns:

- Office and slot availability
- Fee amounts
- Appointment holds
- Payment status
- Appointment confirmation and codes
- Requirements data
- Slot Watch matching
- Passport Journey status

## Request path

The browser calls only `POST /api/ai/chat`. The Express server builds a sanitized `APP_CONTEXT`, adds the fixed DFA system prompt, and calls:

```text
POST {ABSK_BASE_URL}/chat/completions
Authorization: Bearer {ABSK_API_KEY}
```

The request uses the configured model, temperature `0.2`, and maximum `800` tokens. The browser does not know the upstream URL or key.

## Sanitized context

Context may contain:

- Current conversation state and language
- The latest citizen message
- Synthetic display-name and profile-verification flags
- Synthetic office/date/time availability
- Selected scheduling values
- Form completion metadata
- Hold, payment, booking, and journey statuses
- Explicit actions currently allowed

It never contains the AI key, real financial information, a full passport number, a National ID, or other real sensitive identity data.

## Output contract

The model must return JSON matching `AssistantResponse`:

- `message`
- `state`
- zero or more typed quick replies
- one `proposedAction`
- `alertLevel`

The server safely extracts the JSON object, validates it with Zod, checks the proposed state transition, and verifies that the proposed action is allowed in the current state.

## Failure behavior

Guided fallback is used when:

- No key is configured
- AI is disabled in Demo Control Center
- The 20-second timeout expires
- The endpoint is unavailable or rate-limited
- Output is not valid JSON
- Output violates the response schema
- The model proposes an invalid state or action

Only transient HTTP failures receive one retry. Raw upstream errors and response bodies are never returned to the citizen. Development logging records only a sanitized error category and never prints the credential.

## Defense against hallucinated transactions

Even a schema-valid AI response cannot mutate transactional records. The UI must call a deterministic application endpoint, and that endpoint revalidates prerequisites. For example, an AI message claiming payment success has no effect unless the payment repository reports `VERIFIED` and the confirmation endpoint accepts the matching hold.
