# Architecture

## Design goals

The prototype separates conversational presentation from transactional authority. It is mobile-first, remains usable without AI, and keeps the reusable passport domain independent of browser and Node.js APIs so it can later move to React Native.

## Runtime topology

```text
Browser (React/Vite)
  ├─ guided cards, accessibility, geolocation, in-app notifications
  ├─ Zustand presentation state
  └─ /api/* only
          │
          ▼
Local API (Express)
  ├─ Zod request validation
  ├─ deterministic forms, holds, payments, bookings, Slot Watch, tracking
  ├─ in-memory repositories and audit events
  └─ /api/ai/chat orchestration
          │
          ▼
OpenAI-compatible Qwen endpoint
  └─ message drafting and proposed actions only
```

## Workspace responsibilities

### `packages/core`

- Shared TypeScript domain models
- Conversation-state and allowed-action vocabulary
- Valid transition checks
- Synthetic offices, profile, fees, schedules, and journey copy
- Haversine distance and deterministic fallback copy
- No imports from Express, React, the DOM, or Node-specific APIs

### `apps/server`

- Express security middleware and same-origin CORS policy
- AI configuration and OpenAI-compatible upstream client
- Safe JSON extraction and Zod output validation
- One retry for transient upstream failures and a 20-second abort timeout
- In-memory repositories for forms, holds, payments, appointments, watches, offers, journeys, notifications, and audit records
- Deterministic payment verification, booking, and status progression

### `apps/web`

- React Router routes for chat, wallet, appointment detail, Passport Journey, notifications, profile, privacy, about, and demo controls
- Zustand orchestration of browser interactions and API requests
- Device geolocation requested only after explicit selection
- Lock-screen-safe Browser Notification API usage
- Printable appointment packet, synthetic receipt, QR values, and calendar export
- Responsive phone frame and desktop control center

## Transaction boundaries

The browser chooses an action, but the server proves its prerequisites:

1. A form requires explicit synthetic-profile consent.
2. A hold requires a known office, known date, known time, service, and processing type.
3. A payment session requires an active hold and the exact configured total.
4. A simulated callback changes a payment to `VERIFIED` or `FAILED`.
5. Confirmation requires a verified payment and a matching active hold.
6. A Passport Journey change must be the next valid deterministic status.

Callback handling and appointment confirmation are idempotent for the same payment identifier.

## Data lifetime

All records are stored in one local server process. Restarting the server clears them. This is intentional for a hackathon demonstration and prevents accidental persistence of demo-entered information.

## Accessibility model

- Semantic buttons, links, headings, lists, dialogs, fields, and navigation landmarks
- Minimum 44-pixel interactive targets
- Visible keyboard focus
- `aria-live` messaging for chat and toasts
- Safe text labels for icon-only actions
- Status differences expressed with copy/icons in addition to color
- Reduced-motion media query
- Browser-print stylesheet with a visible demonstration watermark
