# Conversation flow

## Supported complete journeys

### New adult passport

```text
Select service → request location → office → date → time
→ profile consent → review form → processing type → appointment review
→ temporary hold → payment method → server verification → confirmation
→ Appointment Wallet → Passport Journey
```

### Standard adult renewal

```text
Adult renewal → intact or expired ePassport → no changes
→ location and schedule → synthetic passport record review
→ processing, hold, simulated payment, confirmation, tracking
```

### Renewal using married surname

The standard renewal sequence adds a synthetic PSA marriage-record verification indicator and additional original-document reminder. It does not silently change authoritative fields.

## Unavailable-slot journey

```text
Office/date has zero slots → configure Slot Watch
→ active first-come queue → simulated cancellation creates one slot
→ first eligible request receives a temporary offer
→ accept → profile/form review → hold/payment/confirmation
```

Declining marks that request declined. A production implementation would then match the next eligible request; the prototype exposes the queue and matching contract in the repository layer.

## Payment guardrail

```text
HOLDING_SLOT
  → SELECT_PAYMENT_METHOD
  → PAYMENT_PENDING
  → PAYMENT_VERIFYING
  → PAYMENT_SUCCESSFUL or PAYMENT_FAILED
  → APPOINTMENT_CONFIRMED only after server verification
```

Opening or closing the simulated provider cannot prove payment.

## Passport Journey guardrail

The default progression is:

1. Appointment confirmed
2. Appointment completed
3. Biometrics captured
4. Under DFA verification
5. Application approved
6. Passport production
7. Dispatched to release location
8. Ready for pickup
9. Passport claimed

An additional-requirement branch may leave **Under review** and must return there before continuing. The model cannot advance this state; only the synthetic DFA status endpoint can.

## Natural-language behavior

Citizens may type a message at any step. The server asks the AI for one concise, state-aware reply. Selection cards remain the preferred path for structured values so citizens are not forced to type an office, date, time, payment method, or sensitive field.

## Recovery behavior

- Location denied: offer manual city and all-office choices
- No slots: offer Slot Watch
- Hold expired: return to time selection
- Payment failed/cancelled: retain a valid hold and offer another method
- Payment verification delayed: do not confirm
- Backend unavailable: show a nontechnical retry message, never a blank page
- AI unavailable: continue in Guided mode
