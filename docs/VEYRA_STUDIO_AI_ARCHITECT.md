# Veyra Studio — AI Site Architect and Agency Workflow

Status: proposed product specification, not an implemented AI service.

## Who uses it

- Site owner: creates and owns a website.
- Freelancer: creates and manages client websites through explicit invitations.
- Agency: manages a team, clients, and several sites with scoped roles.
- Veyra operator: handles platform abuse and support through audited, scoped controls.

A template is reusable presentation; a website is an independently owned site containing pages, content, assets, settings, domain, and publication history.

## Paid AI Architect workflow

1. User selects site category (portfolio, business, store, organization, blog) and states a goal.
2. Structured intake captures audience, brand, required pages, functionality, languages, integrations, accessibility, and operating requirements.
3. AI generates **a proposal**, never immediately deploys: sitemap, page-by-page sections, content placeholders, design direction, data entities, feature dependencies, third-party service requirements, security/compliance considerations, phases, and clearly marked assumptions.
4. Show editable plan with accept, modify, reject, and regenerate controls.
5. User approves an exact plan version; save approval, actor, timestamp and selected site ID.
6. Only after approval should a separate builder create **draft** website components within the platform's supported capabilities.
7. Preview in an isolated environment, validate accessibility/content and integrations, request approval, then publish with rollback capability.

The model must not promise features the platform cannot implement. A hospital public information website is not a patient-records system. E-commerce must have real checkout, inventory, tax, fraud and shipping integrations before it can be sold as operational.

## Billing and entitlement security

- AI Architect requires active paid entitlement and available usage credits, verified **server-side** on each request.
- Meter input/output tokens and expensive downstream actions; reserve/refund credits idempotently.
- Provide estimates before generation, clear errors at limits, and non-AI manual editing for all users.
- No unmetered endpoint and no client-exposed provider keys.
- Use idempotency keys, per-user/site/workspace rate limits, abuse protection and audit logs.
- Pricing, payment provider, invoice/tax rules and subscription lifecycle require separate verified implementation.
- Do not claim paid feature is available until billing, webhook validation, receipts and entitlement revocation are tested.

## Multi-tenancy and client ownership

- Each website belongs to a site owner/workspace, not the freelancer's personal profile.
- Freelancer role permits site-specific edits only; publishing, billing and ownership changes require explicit owner authorization.
- Tenant isolation enforced in database RLS and server actions.
- Handover is a tracked acceptance workflow, never credential sharing.
- Revoked collaborators lose access immediately; attachments and secrets remain isolated.

## AI plan data contract

Plan: { site_type, objective, audience, pages: [{ slug, purpose, sections }], visual_direction, capabilities, integrations, content_needed, security_notes, assumptions, out_of_scope, phases, estimated_credits, status, version }.
Statuses: draft -> proposed -> needs_revision | approved -> building_draft -> review -> published; cancelled at any nonpublished stage.
All AI-originated descriptions are untrusted until approved. Sanitize any generated markup and prohibit arbitrary JS injection.

## Suggested delivery order

1. Site/workspace ownership and agency memberships, including RLS tests.
2. Manual plan editor and versioned review/approval workflow (available without AI).
3. Paid AI provider integration with strict structured output, usage limits and cost visibility.
4. Bounded draft builder for supported section types; no arbitrary remote code.
5. Preview, rollback, reliable publishing, handover and audit history.

## Launch measures

Time to first approved plan; completion and publication rates; cost per usable plan; owner acceptance; support tickets; safety incidents; upgrade conversion and 30-day return rate.

Branding: Veyra — Powered by Timzee Corp.
