# Veyra Feature Lifecycle

Veyra features are designed to survive product evolution.

## 1. Register the capability

A feature exists independently from subscription plans. Examples:

- `premium_templates`
- `advanced_analytics`
- `ai_template_builder`
- `custom_domain`
- `platform_branding_removal`

## 2. Attach access rules

Access can come from a plan, add-on, campaign, promotion, administrator grant, verification state, or another approved entitlement source.

Do not encode business rules using plan names in UI code.

## 3. Campaign benefits become grants

A campaign may be temporary while its resulting benefit is permanent. Claiming a benefit creates an entitlement grant with its own lifetime and audit identity.

## 4. Asset versions are immutable

Published template versions should be treated as immutable assets. Fixes and redesigns create new versions. A creator site points at the version it is using.

## 5. Existing users are not silently upgraded

Unless the creator's binding explicitly permits automatic compatible upgrades, a new template release does not change an existing published site.

## 6. Safe retirement

A feature or template can be deprecated without deleting the creator's existing content. Retirement is a workflow involving compatibility, migration, communication, and audit records.

## 7. Communications use the notice system

Useful product communication should use the data-driven notice system rather than page-specific hard-coded popups. Campaign announcements, onboarding hints, upgrade opportunities, verification reminders, support updates, maintenance notices, and creator education can all use the same infrastructure.

Notices must support targeting, scheduling, frequency limits, dismissals, accessibility, privacy/consent constraints, and analytics.

## 8. Future AI template builder

The AI Template Builder is deliberately deferred. The current template contracts are designed so it can later produce validated template definitions without becoming a separate rendering architecture.
