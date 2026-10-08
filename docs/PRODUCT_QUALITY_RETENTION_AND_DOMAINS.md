# Veyra product quality, growth and paid custom domains

Status: roadmap and implementation acceptance criteria. Domain provisioning, billing, AI services, and website editor are NOT live.

## Position
Veyra = premium guided websites + creator/business discovery + client conversion. Powered by Timzee Corp.

## What we take from market leaders
- Framer: refined layouts, typography and motion. Keep semantic accessible HTML, fast pages, reduced-motion.
- Webflow: custom domains per paid site, granular publishing, staged preview and CMS boundaries.
- Squarespace: short guided intake, editable templates, brand styles and AI-assisted suggestions.
- Shopify: freelancer-managed client sites and explicit client ownership transfer.
- Wix: site-type-aware onboarding; show relevant tools, hide irrelevant complexity.

## UX contract
1. Ask "What do you want to create?" Portfolio, service business, blog, store or organization.
2. Ask "How do you want to start?" Template, blank canvas, hire an expert, paid AI Architect.
3. One site switcher, clear draft/live badges, preview-first editing, autosave revision history and undo.
4. One accessible responsive editor; reuse content when switching templates.
5. Plain language system states: Saved, Draft, Publishing, Live, Needs attention.
6. Free URL, always available; publish-checklist includes navigation, alt text, forms, mobile, SEO.
7. Product tours are skippable, mobile performance measured, error messages actionable.
8. Distinct public creator profile vs. independently branded website and opt-in directory listing.
9. No false claims or fake popularity rankings. Curated picks are clearly labelled.

## Paid custom domain: end-to-end spec
- Feature ID already registered: custom_domain. Access must be checked on backend AND database per site. No frontend-only gating.
- UI: Domains > Add domain > enter an existing hostname > check eligibility > show DNS records from actual hosting provider > Verify > Attach > Active (HTTPS) / Error.
- Normalized hostname: Unicode IDNA processing and lowercase; reject IPs, localhost, public suffixes, reserved/platform-controlled hostnames, paths, spaces and duplicates. Prevent site-to-site domain takeover.
- Verify DNS and ownership against deployment-provider challenge, never trust self-reported status.
- Provider integration must support domain attach/detach, certificate issuance, HTTPS enforcement, canonical redirects, root/www preferences, status reconciliation and retries.
- Do not require a paid plan to keep a free Veyra URL, even after subscription expiry.
- Subscription downgrade/expiry: notify before transition; remove custom hostname after defined grace period only through audited state machine; preserve content and free URL; clear, reversible reactivation.
- Domain payment is distinct from domain registration: user may buy domain from any registrar; Veyra charges for linking and managing it. Don't suggest domain registration is included unless contracted.
- Store site_id, hostname, status, verification method, dns target, last_checked, error code, activated_at. Never treat UI "connected" as proof certificate works.
- DNS change can take time; UI should say checking, offer copyable record details and a Retry button, without invented ETA.
- Domain ownership changes/transfer and collaborators require owner approval; keep audit trail.
- Security tests: malicious DNS claiming, duplicate domain on other account, hostname normalization collisions, tenant misrouting, billing expiry, attach race, rollback, expired certificate, record removal.
- Do not release until real provider and real test domain succeed.

## Retention loops
Activation: publish first website quickly; immediate shareable preview.
Week 1: visitor inquiry, contact action, share insights, relevant improvement tips.
Monthly: accurate site health and performance digest, published project reminders, actionable SEO/accessibility guidance.
Agency: site client approvals, handover, shared inbox and billing transparency.
Premium must pay for repeat value: custom domains, more site capacity, authenticated collaboration, detailed analytics, paid AI credits. Avoid artificial lock-in: exports and clean cancellation.

## Performance & one-million-site approach
Page at most 24 directory results, deterministic cursor pagination per result type, indexes and measured query plans.
Store media in object storage + CDN, precompute responsive thumbnails in job queue, enforce uploads and per-tenant quotas.
Site metadata caches with targeted invalidation on publish/unpublish; don't cache draft data into public CDN.
Dedicated search as necessary when PostgreSQL query metrics justify it; don't do substring scans on 1M rows.
Load test with representative million-profile fixture in staging; measure P95 search/render latency and error rates. Rate limit public discovery and inquiry submissions.
Security: RLS, owner-only mutations, support permission boundaries, audits, anti-spam and abuse moderation.

## Sequence
P0: repair CI-free local build/type checking and auth flow, publishing/privacy correctness, site ownership and RLS tests.
P1: website type onboarding, distinct design templates, section editor, preview and revision history.
P2: paid billing entitlements + actual custom domain provider integration and domain settings screen.
P3: inquiries, testimonials, real analytics, client onboarding and agency collaboration.
P4: paid AI Architect, plan approval/versioning, bounded draft building and usage accounting.
P5: load tests, image optimization/CDN, content moderation, internationalization, beta rollouts.

## Validation gates
- Users can publish a useful site on mobile without instructions.
- Keyboard and screen-reader flows work, text contrast and reduced-motion verified.
- Test website creation, import, media, draft, preview, publish, domain, owner transfer and cancellation.
- Run migrations in staging and test RLS across two separate tenants.
- Do not call this production ready until checks pass.
