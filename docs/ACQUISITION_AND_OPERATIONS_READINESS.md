# Veyra — acquisition readiness and operational diligence

**Status:** Engineering checklist and ownership standard, not a statement that Veyra currently meets these requirements.

## Product and retention
- First website published within a short guided journey, measurable without storing unnecessary personal data.
- Track activation, publishing success, weekly active creators, 30/90-day retained publishers, upgrade conversion, gross and net revenue retention, average revenue per paying site, churn reasons and support response times.
- Record trustworthy event definitions and consent. Never count fake visits or inflated creator metrics.
- Customer data export and account closure; cancellation never traps creator content.
- Separate roadmap promises from deployed features, with release notes.

## Corporate ownership and transferability
- Timzee Corp must have provable rights to all proprietary source, domain names, brand assets, stock media and other IP.
- Track OSS dependencies/licenses, commercial third-party services, and contributor permissions/assignments.
- Avoid embedding personal developer secrets or credentials; rotate secrets on staff departures or acquisition.
- Document accounts required to transfer GitHub, hosting, DNS, database, email provider, monitoring and payments.
- Keep purchaser-ready inventory of integrations, vendors, data processors, SLAs and renewal dates.

## Security and privacy baseline
- Tenant-scoped Postgres RLS and tests with accounts A/B.
- Least-privilege services; server-side paid entitlements; audited admin and support actions.
- Password and OAuth recovery, session expiry, CSRF assessment, rate limiting, abuse mitigation and secure upload processing.
- Staging-only penetration test and dependency audit before opening to businesses.
- Published/draft isolation, immutable publication versions, backup/restore drill and data retention/deletion policy.
- Consent-aware analytics and contact forms; jurisdiction-specific review for Nigerian and overseas customers.
- Never claim compliance certifications until audited.

## Production operations
- Automated checks on an affordable executor: typecheck, lint, unit tests, Next.js build, browser and accessibility tests, migrations and RLS tests.
- Runbook for outages, restore and rollbacks; health/readiness probes that do not expose sensitive data.
- Logs correlated by request and site ID without collecting unnecessary sensitive text.
- Error monitoring, performance percentiles, queue lag, storage usage and budget alerts.
- Image optimization and caching; bounded cursor search, limits per tenant, load tests and tested scaling plans.
- Public status reporting and incident communication procedures.

## Revenue and billing
- Clearly disclosed Free / Pro / Agency pricing and non-AI feature boundaries.
- Paid custom domain connection verified against DNS/HTTPS provider and entitlement revocation.
- AI Architect must have paid entitlements, token budgets, consumption ledger, input validation and human approval.
- Payment records and refunds reconciled; invoices and tax obligations handled by appropriate providers.
- No promise of unlimited paid AI or free domain registration without funded delivery.

## Exit/diligence dossier
- Architecture diagram and ADRs; ERD and migration history; inventory of credentials without secret values.
- Current release/version, feature matrix, known debt, incident log, operational cost model and realistic capacity evidence.
- Cohort retention and revenue metrics sourced from the actual system.
- Customer agreements, privacy notice, terms, license audit, ownership evidence, IP records and regulatory counsel review.
- Independent reproduction guide: new engineer can configure clean staging, migrate data, build, test and deploy without founder intervention.

## Minimum launch acceptance
No general-availability label until clean staging migrations, owner/visitor flows, two-tenant isolation, mobile accessibility, subscription and domain safety, recovery and rollback pass. Release only the subset of features that meet these gates.

Veyra — Powered by Timzee Corp.
