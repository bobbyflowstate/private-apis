# Private APIs Companion – Review Notes

## Security & Structural Findings
- Edge Function `execute_request` currently instantiates a Supabase client with the service-role key while reusing the caller's `Authorization` header. Because the service role bypasses RLS, any authenticated caller who can guess another request ID could read its configuration. Switch to the anon key for per-user access or explicitly validate the JWT and enforce `owner_id` matching before returning data.
- Table `secret_metadata` defines `alias` as the primary key. This blocks different owners from using the same alias. Prefer a composite primary key on `(owner_id, alias)` (and update associated types/queries) to avoid tenant collisions as soon as you add more users.
- `ReactQueryDevtools` is always rendered inside `providers/react-query-provider.tsx`. Bundling the devtools in production bloats the payload and exposes debug UI. Wrap it in a development guard or lazy-load it for dev only.

## Recommended Next Steps
1. Install dependencies (`npm install`) and create `.env.local` from `.env.example` with Supabase URL/anon key (plus the service role key if you want to exercise the Edge Function locally).
2. Apply the database schema with `supabase db push` and (optionally) seed data via `supabase db seed --file supabase/seed/seed.sql`.
3. Harden the `execute_request` Edge Function: validate the caller's JWT, enforce ownership, resolve secrets via Vault, proxy the outbound request, and persist execution logs.
4. Build out CRUD flows for API requests and secrets, including client/server validation (Zod, forms, optimistic updates).
5. Add automated coverage: unit tests for hooks/components, Playwright smoke flows (sign-in → run request → view history), and consider Lighthouse CI for PWA regressions.
6. Shore up Supabase security (RLS for multi-role, invite/onboarding flow, key rotation automation).

_Updated: 2025-10-08 12:34 CEST_
