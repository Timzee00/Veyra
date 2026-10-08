# Connect a dedicated Supabase project to Veyra

This guide is for a **new dedicated Supabase account/project**. Never reuse another customer's or Timzee Corp application's database.

## Account and project
1. Create a Supabase account at https://supabase.com/dashboard.
2. Create a new organization (if needed), then a **Veyra** project. Record the project reference ID, region and database password securely. Choose a region close to the expected users/deployment, mindful of local data requirements.
3. Connect the new account using the official Supabase connector when available. Do not paste the database password, service_role key, PAT, or secrets into a chat, issue, or GitHub commit.

## Environment
Copy `.env.example` to `.env.local` locally and configure:
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Publishable/anon client key shown by Supabase (project-local)
- `SUPABASE_SERVICE_ROLE_KEY`: private server-only credential; never expose under NEXT_PUBLIC_ or in client components
- `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL`: canonical deployment origins

Add the corresponding project environment variables in the hosting provider's encrypted environment settings. Do not commit `.env.local`.

## Database migration gate
The repo contains ordered numbered migrations under `supabase/migrations`.
**Do not run them against a production project without a clean staging trial.**
1. Provision new Veyra staging database; verify Supabase CLI and CLI migration commands from `supabase --help` and `supabase migration --help`.
2. Apply migrations in order, inspect errors and any prior history, and run database security advisors.
3. Test registration, invitation/auth recovery, profile creation, media storage, draft saving, publication, unpublication, site visibility, pages, multi-tab revision conflicts.
4. Test with two different accounts: one owner must never read or modify another owner's drafts, pages, publications or files.
5. Confirm published website works with anonymous users; drafts must remain private.
6. Explicitly test owner-only publish RPCs, authenticated vs anon grants, and role-based policies.
7. Test image signed-URL expiry, deployment configuration, email redirects and cookies.

## Do not enable these until complete
- Paid custom domains: provider DNS/ownership/SSL verification and entitlement checks not yet integrated.
- Paid AI Architect: no usable credit accounting or plan-to-draft execution yet.
- Agency management: client ownership and team security model not verified.
- Real commerce or clinical workflows: specialist modules not ready.

## Local quality gate without paid GitHub Actions
- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run test:builder`
- `npm run build`
- Browser smoke tests on mobile, desktop, private/public publishing and sign-in.
When any check fails, do not merge to main or advertise production readiness.

## Rollout
Use a separate staging deployment for Veyra, test migrations and seeded demo sites, then promote only after successful checks and a rollback plan.

Brand: Veyra — Powered by Timzee Corp.
