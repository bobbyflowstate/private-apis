# Private APIs Companion App — Product & Technical Specification

## 1. Vision & Goals
- Provide a secure, mobile-friendly control panel to run personal API workflows from anywhere.
- Centralize frequently used private endpoints (some with API keys/secrets) behind authenticated access.
- Deliver offline-ready PWA experience so the app can be installed on iOS/Android home screens.
- Allow rapid iteration: add new requests without code changes when possible.

### Success Metrics
- User (owner) can log in and execute any saved request in ≤3 taps.
- New API request can be configured end-to-end (form + auth) in <10 minutes.
- 99% of requests succeed without re-authenticating midway.
- All sensitive values at rest are encrypted and never exposed client-side unless required for a request.

## 2. Target Platforms & Personas
- **Primary persona:** Single authenticated owner (me) using desktop + iOS Safari/Android Chrome.
- **Secondary persona:** (Optional) trusted collaborator with restricted access (read-only, no secrets). Future scope.
- **Devices:** Modern browsers, plus PWA install support on iOS ≥15+, Android ≥11, macOS desktop.

## 3. High-Level User Journeys
1. **Authenticate** via Supabase Auth (passwordless email link or email+password). Session persists for 7 days idle.
2. **Browse Requests**: Home dashboard lists saved API requests grouped by category, showing quick actions.
3. **Run Request**: Submit request, view formatted response payload, optionally copy or trigger follow-on action.
4. **Add/Edit Request**: Enter metadata (name, category, description), HTTP settings, required parameters, and secret bindings.
5. **Manage Secrets**: Create/update API keys, tokens, or shared headers; associate them with requests without revealing raw values in UI.
6. **Review History**: Inspect past executions with timestamps, status, output snippet, and runtime.

## 4. Feature Breakdown
### Must-Have (MVP)
- Supabase Auth integration (email/password, magic link fallback).
- Role-based access: `owner`, `guest` (future). MVP allows only `owner` sign-ins (checked via allowlist).
- Dashboard with grouped request cards, search, filter by tag.
- Request execution engine supporting:
  - HTTP methods: GET, POST, PUT, PATCH, DELETE.
  - Custom headers, query params, JSON body.
  - Parameter substitution (template syntax) with runtime prompts.
  - Response viewer (JSON tree + raw text tab).
- Secrets manager: UI to store API keys in Supabase Vault/Secrets, referencing secrets by alias.
- Request history log with response status, duration, truncated payload, and manual notes.
- Progressive Web App capabilities: service worker, manifest, offline shell caching, install prompt.
- Mobile-responsive UI with quick action buttons, haptic-friendly spacing.

### Nice-to-Have (Post-MVP)
- Request scheduling (cron) with Supabase Edge Functions.
- Push notifications on request completion/failure.
- Aggregated analytics on success rate/time per request.
- Parameter presets and linked flows (request chaining).
- Environment separation (dev/test/prod) for secrets + requests.

## 5. System Architecture
### Frontend
- Next.js 14 (App Router) with React 18 + TypeScript for server/client rendering balance.
- State management: TanStack Query for async data + lightweight Zustand or Context for UI prefs.
- UI library: Tailwind CSS + Headless UI components for accessibility.
- PWA implementation: Workbox-powered service worker (precaching UI shell, runtime caching for Supabase REST calls where safe).

### Backend / Services
- Supabase hosted backend:
  - Auth with email/password; restrict sign-up via invite code or manual user creation.
  - Database (PostgreSQL) for request metadata, history, audit logs.
  - Edge Functions for executing outbound HTTP requests securely and handling secrets.
  - Supabase Secrets/Vault for encrypted storage of API keys.
  - Realtime for streaming request execution updates (optional).
- Optional self-hosted proxy for APIs requiring IP allowlists (future consideration).

### Execution Flow
1. Client triggers "Run" with parameters.
2. Client calls Supabase Edge Function `execute_request` with request ID + param payload.
3. Edge Function retrieves request definition & resolves secrets server-side.
4. Function performs outbound HTTP request, handles retries/timeouts, sanitizes response.
5. Execution log is persisted (status, payload excerpt, metadata).
6. Function returns response body/headers/status to client (capped size; fallback to download link for large bodies stored in Storage).

## 6. Data Modeling (Supabase Postgres)
- `profiles`
  - `id (uuid)` PK, references `auth.users`.
  - `role` enum (`owner`, `guest`).
  - `display_name` text.
  - `created_at`, `updated_at`.

- `api_categories`
  - `id` uuid PK.
  - `name` text, unique per user.
  - `icon` text (optional emoji name).
  - `sort_order` int.

- `api_requests`
  - `id` uuid PK.
  - `owner_id` uuid (FK `profiles`).
  - `category_id` uuid FK.
  - `name`, `description`.
  - `method` text (validated list).
  - `url` text.
  - `headers` jsonb (runtime templating with `{{variable}}`).
  - `query_params` jsonb.
  - `body_template` jsonb or text (depending on `Content-Type`).
  - `timeout_ms` int default 10000.
  - `secret_bindings` jsonb array of `{alias, injectAsHeader|query|body}`.
  - `requires_confirmation` bool.
  - `created_at`, `updated_at`, `archived_at`.

- `request_parameters`
  - `id` uuid PK.
  - `request_id` uuid FK.
  - `key` text.
  - `type` enum (`string`, `number`, `boolean`, `select`, `multi-select`).
  - `required` bool.
  - `default_value` text.
  - `config` jsonb (options for selects, validation regex, helper text).

- `secrets`
  - Stored via Supabase Secrets/Vault, referenced by alias. Metadata table `secret_metadata` includes:
    - `alias` text PK.
    - `owner_id` uuid FK.
    - `description` text.
    - `scopes` jsonb (list of request IDs allowed to use this secret).
    - `created_at`, `updated_at`.

- `request_executions`
  - `id` uuid PK.
  - `request_id` uuid FK.
  - `owner_id` uuid FK.
  - `status` enum (`success`, `failure`, `error`, `timeout`).
  - `http_status` int.
  - `duration_ms` int.
  - `response_excerpt` text (trimmed to 5 KB max, sanitized).
  - `error_message` text.
  - `executed_at` timestamptz default now().
  - `parameters_used` jsonb.
  - `notes` text (manual annotations).
  - `storage_path` text (optional pointer to full response stored in Supabase Storage bucket `responses`).

## 7. Security & Compliance
- Enforce RLS (Row Level Security) so only owner can access their rows; future `guest` gets read-only policies.
- Secrets never pass through the client in raw form. Edge Functions fetch secrets server-side only when executing requests.
- Use Supabase Vault/Secrets API to store encrypted secret values; require manual entry via secure admin UI modal.
- Hash request body/headers templates to detect tampering and optionally require confirmation for dangerous requests.
- Rate limit `execute_request` function per user (e.g., 60/minute) to prevent abuse.
- Audit logging: capture auth events and secret updates.
- Token rotation support: allow re-uploading secrets without downtime.
- Enforce HTTPS-only and same-origin; use CSP to restrict script sources.
- PWA caching: exclude sensitive API responses from storage; store only metadata.

## 8. Progressive Web App Requirements
- `manifest.json` with icons, name "Private APIs", theme/background colors.
- Workbox service worker strategies:
  - `StaleWhileRevalidate` for static assets.
  - `NetworkFirst` with timeout for Supabase RPC/Edge queries.
  - `CacheFirst` for icon fonts/images.
- Offline experiences:
  - Show cached dashboard shell with placeholder state when offline.
  - Allow queuing requests offline (optional later); MVP disables execute while offline but shows status message.
- Prompt install CTA once logged in and PWA criteria met.
- Handle updates: service worker postMessage to notify user of new version.

## 9. UI/UX Overview
- **Navigation:** Bottom tab bar on mobile (Dashboard, History, Settings). Sidebar on desktop.
- **Dashboard Cards:** show method, name, description, quick run button, tag chips.
- **Request Detail:** tabs for Configuration, Parameters, History; run button triggers Edge Function.
- **Execution Drawer:** shows request log, spinner during execution, response viewer with tabs (Formatted JSON, Raw, Headers).
- **Secret Manager:** accessible from Settings; entries list alias + description + last rotated date; reveal requires step-up auth (re-enter password/magic link).
- **History:** filter by status/date/request; clicking record opens response.
- **Theming:** Light/dark toggle stored per profile.

## 10. Configuration & Deployment
- Environment configuration via `.env` for Supabase keys, service URLs.
- Local dev: Supabase local stack or remote project with service role key secured in `.env.local`.
- Deployment: Vercel (preferred) or Supabase Platform. Service worker needs HTTPS + custom domain.
- Set up GitHub Actions to lint (`biome` or `eslint`), type-check, run Jest/Playwright tests, and deploy preview builds.
- Store secrets in Vercel env vars or Supabase config; never commit.
- Provision Supabase Edge Function(s) via CLI; include CI step to deploy functions.

## 11. Testing Strategy
- Unit tests: form validators, templating engine, secret binding resolver.
- Integration tests: request execution flow via mocked Supabase Edge Function.
- End-to-end: Playwright for login + run request + view response happy path.
- Security tests: ensure secrets not exposed in network logs; simulate unauthorized access to confirm RLS.
- PWA audits: use Lighthouse CI threshold (PWA score ≥90).

## 12. Future Enhancements & Ideas
- OAuth 2.0 client capability for APIs requiring token exchange (store refresh tokens securely server-side).
- Webhooks to trigger requests; create macros/workflows chaining multiple API calls.
- Markdown-enabled notes per request for documentation.
- Response transformations (JQ-like) and interactive summaries.
- Siri Shortcuts / Android intents to trigger specific requests via custom URL scheme.
- Biometric re-auth on mobile for secret access.

## 13. Open Questions
- Should we allow storing large binary responses? (If yes, use Supabase Storage + signed URLs.)
- Need to decide if offline queued requests are worth complexity.
- Determine strategy for APIs requiring client-side certificates (unlikely for MVP).
- Consider multi-factor auth for critical actions (secret rotation, request delete).

## 14. Implementation Roadmap (High-Level)
1. Project bootstrapping: Next.js + Supabase client setup, auth skeleton, PWA manifest.
2. DB schema + RLS policies + seed data migration.
3. Secrets management UI + Vault integration.
4. Request configuration interface with templating + validation.
5. Edge Function execution path + logging + history views.
6. PWA hardening, responsive polish, accessibility checks.
7. Testing automation, CI/CD, deployment to production.
