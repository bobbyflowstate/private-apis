# Private APIs Companion

A Next.js + Supabase progressive web app that centralises personal API workflows behind secure authentication. Built with TypeScript, Tailwind CSS, TanStack Query, and Supabase Edge Functions.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   - Duplicate `.env.example` into `.env.local` and populate:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (only needed for local function emulation).

3. **Supabase setup**
   - Create a Supabase project and enable email/password auth for the owner account.
   - Apply the SQL migration(s):
     ```bash
     supabase db push
     ```
   - Seed optional sample data:
     ```bash
     supabase db seed --file supabase/seed/seed.sql
     ```
   - Deploy the Edge Function once you customise it:
     ```bash
     supabase functions deploy execute_request
     ```

4. **Run the app**
   ```bash
   npm run dev
   ```
   The PWA shell is available at `http://localhost:3000`.

## Key Features (Scaffolded)

- Authenticated dashboard with navigation shell, mobile nav, and theming stored via Zustand.
- Request catalogue + detail view wired for Supabase data (server components for read paths, React Query for revalidation).
- Execution panel invoking the placeholder `execute_request` Edge Function.
- Secrets manager & preferences panels ready to hook into Supabase Vault.
- Progressive Web App configuration via `next-pwa` with installable manifest and runtime caching strategies.
- Supabase schema migration + seed script mirroring the project specification.

## Testing & Tooling

- `npm run lint` – Next.js ESLint configuration.
- `npm run typecheck` – TypeScript no-emit validation.
- `npm run test` – placeholder Jest entry (add tests under `tests/unit`).
- `npm run e2e` – Playwright placeholder; add specs under `tests/e2e`.

CI/CD recommendations (not included): set up GitHub Actions to run lint, typecheck, unit tests, Playwright (headedless), and Vercel deploy previews.

## Deployment Notes

- Deploy the Next.js app to Vercel; configure env vars in both preview and production environments.
- Configure Supabase Auth sign-in redirect URLs to include the Vercel domain(s) and local dev URL.
- Rotate Supabase anon/service keys regularly and use Supabase Vault for all API credentials.
- For true secure execution, complete the Edge Function to resolve secrets server-side, forward requests, capture responses, and insert execution logs.

## Next Steps

- Finish the Edge Function implementation (secret resolution, outbound fetch, logging, error handling).
- Build UI affordances for creating/editing requests and secrets (forms + validations).
- Add Playwright smoke tests (sign-in, run request, view history) and integrate Lighthouse CI for PWA audits.
- Harden RLS policies for multi-role support and implement allow-listed sign-up logic.
