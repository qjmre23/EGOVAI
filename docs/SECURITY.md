# Security

## Prototype threat model

Primary risks are credential exposure, sensitive data entry, an AI hallucinating transactional outcomes, payment-state spoofing, invalid status jumps, browser notification leakage, and official-looking synthetic documents.

## Credential handling

- `ABSK_API_KEY` exists only in the server environment.
- The browser calls `/api/ai/chat` and cannot see the upstream URL or authorization header.
- `.env` is ignored by Git; `.env.example` contains only a placeholder.
- The key is never returned by an endpoint or logged.
- AI errors are sanitized before they reach the browser.
- A key shared through chat should be rotated before use outside a controlled demo.

## Sensitive-data controls

The product explicitly warns users not to provide real:

- Passport or National ID numbers
- Card numbers or CVV
- OTP, password, wallet PIN, or authentication secret
- Personal information belonging to a real citizen

The synthetic profile masks mobile and passport values. Card simulation uses read-only fixed test values and is never sent to the server or AI.

## Transaction integrity

- Holds accept only known synthetic offices, dates, times, services, and processing types.
- Payment amount must exactly match the configured fee for the hold.
- Payment success is recorded only through the demo callback endpoint.
- Appointment confirmation requires `VERIFIED` payment and an active matching hold.
- Duplicate callbacks and repeated confirmation for the same payment are idempotent.
- Slot Watch offers only one new slot to the earliest eligible request.
- Journey updates enforce the next valid status and reject direct jumps.

## AI trust boundary

AI output is untrusted input. It is JSON-parsed, schema-validated, checked against the conversation-state machine, and then displayed. A proposed action is never executed solely because the model returned it; normal deterministic endpoint checks still apply.

## Web controls

- Helmet sets protective response headers.
- Express disables the `X-Powered-By` header.
- CORS accepts only `WEB_ORIGIN`.
- JSON body size is limited.
- Request bodies and query values are validated with Zod.
- The 20-second upstream timeout prevents indefinitely hanging requests.
- Browser notifications use a generic lock-screen-safe preview.

## Document safety

Every appointment code includes `DEMO`. Printable content includes `DEMONSTRATION ONLY — NOT A VALID DFA DOCUMENT` and a large watermark. The packet does not imitate passport or DFA security features.

## Prototype limitations

This repository is not production security. It has no authentication, authorization, encryption-at-rest layer, durable audit store, webhook signing, rate limiter, CSRF strategy for authenticated sessions, secret manager, or compliance program. Those controls are mandatory before any real integration.

## Incident response for the supplied credential

1. Treat a key pasted into chat as exposed.
2. Create a replacement through the issuing platform.
3. Put the replacement only in `apps/server/.env`.
4. Revoke the exposed key.
5. Verify the key does not appear in tracked files or browser bundles.
6. Review server access logs maintained by the issuer.
