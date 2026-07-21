# eGovAI Passport Concierge

**Ask. Book. Pay. Track.**

An unofficial, browser-based hackathon prototype showing how a future eGovAI experience could help Filipino citizens prepare a passport application, find synthetic DFA appointment schedules, join Slot Watch, complete a simulated payment, keep an appointment packet, and receive proactive Passport Journey updates.

> **HACKATHON PROTOTYPE:** This project uses synthetic data and simulated transactions. It is not connected to DFA, eGovPH, GCash, Maya, or any payment provider.

## What the prototype demonstrates

- Natural-language and guided eGovAI conversations in English or Taglish
- Complete new-adult and standard adult-renewal booking flows
- Adult renewal using a married surname with a synthetic marriage-record requirement
- Permission-based browser geolocation, manual city fallback, and Haversine distance sorting
- Six visibly synthetic DFA locations, appointment dates, and time slots
- Explicit profile consent and a categorized prefilled application review
- Deterministic appointment holds with countdown and expiration controls
- GCash, Maya, and fixed-test-card payment simulations
- Server-side verification before any appointment can be confirmed
- Demo appointment codes containing `DEMO`, QR codes, receipt, calendar file, and printable packet
- Slot Watch queue, targeted temporary offer, and in-app/browser notification simulation
- Appointment Wallet, Notification Center, and deterministic Passport Journey timeline
- Desktop presentation layout with a phone-sized interface and Demo Control Center
- Full-screen responsive mobile layout with touch-sized actions and accessible status updates
- Guided fallback mode when the AI service is unavailable or returns invalid output

## Architecture

This is an npm-workspaces monorepo:

```text
apps/
  web/       Vite + React + TypeScript browser experience
  server/    Express + TypeScript API and Qwen orchestration
packages/
  core/      Platform-independent models, state machine, mock data, and location logic
docs/        Architecture, security, AI, flow, migration, and demo notes
```

Transactional state is controlled by deterministic application logic. The model may write friendly explanations and propose actions, but it cannot create slots, verify payment, confirm a booking, issue an appointment code, or change passport status.

## Local setup

Requirements:

- Node.js 22 or newer
- npm 10 or newer

Install and run both applications:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The local API runs at `http://localhost:3001`.

Other commands:

```bash
npm run dev:web
npm run dev:server
npm run typecheck
npm run lint
npm run test
npm run build
npm run format
```

## Server AI configuration

The browser never receives the AI credential or upstream endpoint. Copy `apps/server/.env.example` to `apps/server/.env` and provide a server-only key:

```dotenv
ABSK_API_KEY=replace_with_your_rotated_server_key
ABSK_BASE_URL=https://bedrock-mantle.us-east-1.api.aws/v1
ABSK_MODEL=qwen.qwen3-vl-235b-a22b-instruct
WEB_ORIGIN=http://localhost:5173
PORT=3001
```

`.env` files are ignored by Git. Never rename the credential with a `VITE_` prefix or move it into browser code.

### Credential warning

Any credential shared in chat or another collaborative channel should be considered exposed. Rotate it before using the prototype beyond a controlled local demonstration, place only the rotated value in `apps/server/.env`, and revoke the old credential.

The app remains fully demonstrable without a working credential; it displays **Guided mode** and uses deterministic responses for the current state.

## Five-minute presentation path

1. Open eGovAI and choose **Book a DFA appointment**.
2. Choose **Adult passport renewal**, **Intact ePassport**, then **No changes**.
3. Permit location or manually select **Antipolo**.
4. In Demo Control Center, enable **No-slot mode**, then open DFA Antipolo.
5. Join **Slot Watch** and trigger a cancellation alert.
6. Accept the offered slot and allow the synthetic profile to prepare the form.
7. Review the masked passport record, confirm, choose regular processing, and hold the slot.
8. Select **GCash** and simulate success. Show the confirmed code and QR packet.
9. Open **Passport Journey** and use Demo Control Center to advance valid statuses.
10. Trigger **Ready for pickup** and show the high-priority safe notification and claim QR.

See `docs/DEMO-SCRIPT.md` for presenter narration and timing.

## Demo Control Center

On desktop, the panel appears beside the phone. On mobile, open it from the top-right menu.

It can:

- Load a new-passport, renewal, married-surname, or no-slot preset
- Trigger a Slot Watch offer
- Mark the current simulated payment successful or failed
- Expire the active appointment hold
- Advance Passport Journey through valid deterministic events
- Toggle AI, force guided fallback, remove slots, accelerate timers, and request browser notifications
- Clear chat or reset all in-memory demo records

Invalid status jumps are rejected and surface a friendly presentation notice.

## Test coverage

The suite covers:

- Valid and invalid conversation transitions
- Payment verification and appointment-confirmation prerequisites
- Blocking AI-generated booking and Passport Journey jumps
- Haversine distance and office sorting
- Server-side credential non-disclosure
- AI JSON validation and fallback safety
- Payment callback idempotency
- First-eligible Slot Watch offer behavior
- Passport Journey sequence enforcement
- Visible disclaimers, keyboard interaction, and masked UI values

## Security rules

- Do not enter real passport, National ID, card, CVV, OTP, password, or wallet-PIN information.
- All displayed identity and appointment records are synthetic.
- Card UI uses fixed test values and never sends card data to the API or AI.
- CORS accepts only the configured local web origin.
- Upstream failures are sanitized before reaching the browser.
- Appointment and status records exist in memory and reset when the server restarts.
- Printable artifacts include a large demonstration warning and deliberately omit real-document security features.

See `docs/SECURITY.md` for the threat model and controls.

## Known limitations

- The prototype does not connect to real government, payment, identity, mapping, email, SMS, or push services.
- In-memory records are single-process and intentionally nonpersistent.
- Minor, lost, damaged, and correction cases provide guidance but not the full transactional journey.
- Browser geolocation and notifications depend on local browser permission.
- “Save as PDF” uses the browser print dialog.
- The phone frame is optimized for a live demo, not production-scale content or localization.
- No Android APK is included in this phase.

## Documentation

- `docs/ARCHITECTURE.md`
- `docs/AI-ORCHESTRATION.md`
- `docs/CONVERSATION-FLOW.md`
- `docs/FUTURE-REACT-NATIVE-MIGRATION.md`
- `docs/SECURITY.md`
- `docs/DEMO-SCRIPT.md`
