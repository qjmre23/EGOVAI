# Five-minute demo script

## 0:00–0:35 — Set the citizen problem

“Passport applications require several disconnected steps: understanding requirements, finding an appointment, paying, keeping documents, and waiting for status. eGovAI Passport Concierge turns that into one guided citizen journey.”

Point out **HACKATHON PROTOTYPE**, the persistent synthetic-data disclaimer, and the phone-first interface.

## 0:35–1:20 — Ask and personalize

1. Select **Book a DFA appointment**.
2. Select **Adult passport renewal**.
3. Select **Intact ePassport**.
4. Select **No changes**.
5. Choose **Allow location**, or use **Antipolo** manually if browser permission is unavailable.

Narration: “The citizen can type naturally, but structured choices keep them from entering sensitive information. Location is requested only after explicit consent, and synthetic offices are ranked locally using distance.”

## 1:20–2:05 — Demonstrate no slots and Slot Watch

1. In Demo Control Center, enable **No-slot mode** before opening the office schedule.
2. Select **DFA Antipolo — Demo**.
3. Choose **Morning**, then **Activate Slot Watch**.
4. Select **Trigger Slot Watch** in Demo Control Center.
5. Show the in-app alert and Notification Center update.
6. Select **Reserve and continue**.

Narration: “Slot Watch uses a first-come queue. A single cancellation is temporarily offered to one eligible citizen, not broadcast to everyone.”

## 2:05–3:05 — Review, hold, and simulated payment

1. Select **Allow and continue** for the synthetic profile.
2. Point out the masked passport number, verified source fields, citizen-confirmed fields, and requirements.
3. Select **Confirm information** and **Regular**.
4. Select **Confirm and hold this slot**. Show the countdown.
5. Select **Continue to payment**, then **GCash**.
6. Select **Simulate successful payment**.

Narration: “Returning from a provider screen never proves payment. The backend verifies the transaction reference, expected amount, active hold, and payment status before issuing a booking.”

## 3:05–3:45 — Appointment Wallet and packet

1. Show the `DFA-DEMO-…` appointment code and confirmation card.
2. Open **View appointment**.
3. Show the QR code, requirements, verified demo receipt, printable packet, and large demonstration warning.
4. Briefly open **Appointment Wallet**.

Narration: “The citizen no longer hunts through email. Their code, receipt, checklist, packet, and journey live together.”

## 3:45–4:45 — Passport Journey and proactive updates

1. Open **Passport Journey**.
2. In Demo Control Center, advance in order through **Appointment completed**, **Biometrics captured**, **Under review**, **Application approved**, **In production**, and **Dispatched**.
3. Show the timeline and proactive eGovAI message after a change.
4. Select **Ready for pickup**.
5. Show the high-priority in-app card, release office, safe reference, checklist, reminder, and claim QR.

Narration: “The model does not decide this status. Every update originates from the deterministic synthetic DFA status service. The lock screen reveals only that an application has an update.”

## 4:45–5:00 — Close

“This prototype is local, synthetic, and safely demonstrable. The shared state machine, validation, data models, and orchestration can move to React Native in the next phase. eGovAI becomes the trusted conversational layer, while government and payment systems remain the authority.”

## Backup paths

- If geolocation is denied, select **Antipolo** manually.
- If the AI endpoint is unavailable, point out **Guided mode** and continue normally.
- Status updates stay inside the in-app toast and Notification Center.
- If a control rejects a Passport Journey jump, explain that the deterministic guardrail is working and select the next valid status.
