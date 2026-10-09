# Veyra

**Your work, unmistakably yours.**

Veyra is a modular portfolio and creator platform designed to grow from a premium publishing product into a broader creator ecosystem.

> Powered by Timzee Corp

## Product principles

- **Creator-first:** creators own their identity, content, presentation and audience relationships.
- **Modular:** capabilities are isolated into domains so new features can be added without rebuilding the product.
- **Entitlement-driven:** plans, add-ons, promotions and admin grants all flow through one access model.
- **Trust by design:** privacy, consent, accessibility, moderation, verification, security and auditability are product requirements.
- **Learning through shipping:** the codebase is intentionally structured so the product can be built while the underlying engineering concepts are learned properly.
- **Production-minded:** multi-tenant isolation, server-side authorization, observability and migrations are considered from day one.

## Stack

- Next.js App Router + TypeScript
- React
- PostgreSQL through Supabase
- Supabase Auth + Storage + Row Level Security
- A Next.js-capable server host for deployment (hosting provider is deliberately not locked in)

## Actual development status

This is an **unreleased development product**, not a production-ready website builder. The current branch contains authentication flows, creator profiles and portfolio presentation, a homepage content editor, a multi-page drag-to-reorder editor, section bundles and a private saved-section library, owner-scoped publishing, plus private recovery from up to 30 published page versions.

Planned but **not launch-ready**: live payment reconciliation, paid custom domains, AI website generation, shared agency collaboration, end-to-end media management, full responsive drag-and-drop layout controls, and large-scale capacity evidence. Do not expose mock or gated features as working services.

The repo has not passed a complete local TypeScript/build/browser verification gate yet. The dedicated Supabase staging project has had database migrations and seeds applied and a rollback-only page history / tenant-ownership SQL test executed successfully.

## Architecture

```text
src/
├── app/                 # routes and application composition
├── components/          # reusable presentation components
├── modules/             # business domains
│   ├── creators/
│   ├── content/
│   ├── templates/
│   ├── verification/
│   ├── support/
│   ├── moderation/
│   ├── billing/
│   └── analytics/
├── platform/            # cross-domain infrastructure
│   ├── auth/
│   ├── permissions/
│   ├── entitlements/
│   ├── events/
│   ├── audit/
│   ├── privacy/
│   └── storage/
└── types/

supabase/
├── migrations/
├── functions/
└── seed/

docs/
└── ARCHITECTURE.md
```

## Reproduce the environment

1. Use **Node.js 22 or later**. **Current blocker:** this repository does not yet have a committed `package-lock.json`. A maintainer with npm registry access must run `npm install --package-lock-only --ignore-scripts`, review and commit the resulting lockfile. **Then** use `npm ci` for reproducible installs and test/build checks. Do not label the build verified until these commands actually pass.
2. Set the variables documented in `.env.example`, using credentials for a **dedicated** Veyra Supabase project. Never commit secrets.
3. Apply the ordered SQL in `supabase/migrations/` to an empty **staging** project. Apply required seed data `supabase/seed/0001_catalog.sql` and `0002_templates.sql` **after** migrations; optional `0003_blog.sql` loads sample editorial content. Skipping the seeds prevents creator onboarding and template selection.
4. Run `npm run typecheck`, `npm run lint`, `npm run test:builder`, and `npm run build`. These checks do not require GitHub Actions or Netlify.
5. Against staging only, run the rollback-only tests `tests/db/creator-onboarding-smoke.sql`, `tests/db/page-history-smoke.sql`, `tests/db/design-revision-smoke.sql`, `tests/db/public-site-visibility-smoke.sql`, and `tests/db/saved-section-library-smoke.sql` with a trusted SQL editor. Each creates temporary fixtures inside a transaction and rolls them back.
6. Manually verify desktop/mobile, sign-up, profile, page authoring, publishing, unpublishing, unauthorized cross-account access, redirects, accessibility and media handling before merging or deploying.

See [Supabase setup](docs/NEW_SUPABASE_PROJECT_SETUP.md), [launch gates](docs/BUILDER_RELEASE_GATES.md), and [operational/acquisition standards](docs/ACQUISITION_AND_OPERATIONS_READINESS.md).

## Development rule

Business domains must not import each other's database implementation directly. Cross-domain behavior should use explicit service boundaries, typed events, or platform contracts. This keeps future features replaceable and the system understandable.
