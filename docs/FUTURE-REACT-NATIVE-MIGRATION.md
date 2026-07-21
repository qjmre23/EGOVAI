# Future React Native migration

The current phase intentionally excludes an Android APK. The shared domain was designed so a later React Native client can reuse transactional vocabulary and validation without importing DOM or server APIs.

## Reuse directly

From `packages/core`:

- Domain types and status unions
- Conversation transition checks
- Allowed-action checks
- Fee and requirement models
- Haversine calculation
- Deterministic fallback responses
- Synthetic fixtures for development and tests

## Replace at the platform boundary

| Browser prototype | React Native equivalent |
| --- | --- |
| React Router | React Navigation |
| Browser Geolocation API | Expo Location or native location module |
| Browser Notification API | FCM/APNs through Expo Notifications or native SDK |
| CSS media queries | React Native style system and responsive hooks |
| `window.print()` | Native PDF/share module |
| Blob calendar download | Native calendar integration |
| Browser-local HTTP origin | Mobile API environment configuration |

## Recommended package split

```text
apps/
  web/
  mobile/
  server/
packages/
  core/
  api-client/
  design-tokens/
  conversation-orchestrator/
```

Move API request schemas and an authenticated client into `api-client`. Move color, spacing, status, and typography tokens into `design-tokens`. Keep UI components platform-specific unless a cross-platform component system proves worthwhile.

## Production additions

- Government-grade identity and consent integration
- Authenticated, user-scoped persistent repositories
- Real DFA-approved availability and requirements APIs
- PCI-scoped hosted payment integration; no card data in app or AI
- Signed webhooks with replay protection and event idempotency
- Encrypted at-rest data with retention/deletion policy
- Device attestation, certificate pinning where appropriate, and mobile threat hardening
- FCM/APNs tokens, notification preferences, and secure deep links
- Offline-safe retry queues for read-only status and acknowledgments
- Philippine accessibility and localization testing across device sizes

The deterministic server remains authoritative even after migrating the client.
