# Veyra Product Principles

## Campaigns and durable benefits

Campaigns are temporary distribution mechanisms. A campaign ending must not automatically revoke benefits already granted unless the grant itself was explicitly temporary.

Every campaign benefit resolves into an entitlement grant with its own source, grant policy, expiration policy, and audit trail.

Supported grant semantics may include:

- permanent
- temporary
- expires_at
- usage_limited
- subscription_bound
- version_pinned
- manual_upgrade

## Template versioning

Published creator sites reference an exact template version. Updating the catalog does not silently redesign existing creator sites.

Creators may preview and explicitly upgrade to a newer compatible version. Critical security or compatibility interventions are governed by platform policy.

## Pop-up and banner system

Veyra supports contextual banners, modal announcements, in-product notices, campaign prompts, upgrade prompts, onboarding guidance, verification notices, support notices, and other useful communication surfaces.

Banners are managed as data, not hard-coded into individual pages.

A notice may define:

- audience
- placement
- priority
- start/end time
- frequency/cooldown
- dismissibility
- required action
- target route
- campaign association
- entitlement/eligibility rules
- analytics event names

Useful notices must respect accessibility, reduced motion, consent/privacy rules, and user dismissal preferences. They must never become an uncontrolled source of spam.

## Customization and future AI templates

Templates are structural systems that consume creator data and design tokens. Creator customization changes design tokens rather than generating arbitrary application code.

The future AI Template Builder will generate a validated Veyra Template Definition. AI-created templates can be premium, campaign-granted, add-on based, or otherwise entitlement-controlled without changing the renderer.

## Scalability rule

New features should be added as domain modules or platform services. Product configuration should prefer registry/configuration + entitlement data over scattered plan-name checks and page-specific conditionals.
