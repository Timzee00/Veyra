# Veyra Production Architecture

## 1. Core idea

Veyra is a multi-tenant creator platform, not a single portfolio site. The system is organized around domain modules and platform services so that new pages, features and business models can be introduced without coupling the entire application to today's product shape.

## 2. Architectural layers

### Application layer
Routes, layouts and server/client composition live in `src/app`.

### Domain layer
Business capabilities live in `src/modules`. Examples include creators, content, templates, verification, support, moderation, billing and analytics.

### Platform layer
Cross-cutting capabilities live in `src/platform`: authentication, authorization, entitlements, events, privacy/consent, audit logs, storage and notifications.

### Persistence layer
PostgreSQL is accessed through repository/query boundaries. Domain modules should not reach into another module's tables directly.

## 3. Identity is not authorization

A Veyra user may belong to a creator account or organization. Roles answer what an actor is allowed to do. Entitlements answer which product capabilities a creator can use. Verification/reputation is a separate trust state.

```text
Identity → User / Creator / Organization
Access   → Role / Permission
Product  → Plan / Entitlement / Add-on
Trust    → Verification / Recognition / Moderation state
```

## 4. Entitlement architecture

Features are registered independently from plans. Plans map to entitlements; add-ons, promotions and explicit admin grants can also create entitlements.

The application should ask capability questions such as:

```ts
canUse("premium_templates")
limit("projects")
```

It should not scatter checks such as `plan === "pro"` throughout the UI.

## 5. Event architecture

Important business actions emit typed domain events. Analytics, notifications, search indexing and audit workflows can consume those events without tightly coupling the source domain to every consumer.

Examples:

- `creator.created`
- `project.published`
- `comment.created`
- `verification.approved`
- `ticket.created`
- `subscription.updated`
- `consent.changed`

## 6. Trust, privacy and security

Privacy/consent, accessibility, data minimization, retention, auditability, moderation and account security are treated as product systems. They are not deferred footer pages.

Optional cookies/tracking should be gated by stored consent. Sensitive administrative operations should require explicit permissions and produce audit records.

## 7. Multi-tenant security

Every creator-owned record must have an explicit ownership path. Supabase Row Level Security is mandatory for client-accessible tables. Service-role access remains server-only.

Policies should follow the rule:

```text
Can the authenticated actor access this record?
Can the actor perform this exact action?
Is the record public, creator-private, or admin-only?
```

## 8. Template engine

Templates render creator data; they do not own creator data. Switching templates therefore changes presentation without migrating projects or profiles.

```text
Creator data → Template registry → Template renderer → Public portfolio
```

## 9. Support and account assistance

Support is a first-class domain. Tickets contain messages, attachments, assignments, status transitions and audit events. Support agents receive scoped permissions rather than unrestricted database access.

## 10. Verification

Verification is workflow-driven rather than a boolean flag. Applications can be evaluated using configurable eligibility criteria, human review and an auditable status history. Verification may be approved, rejected, suspended, revoked or restored.

## 11. Feature flags

Features can be enabled by environment, rollout, creator, plan, or internal testing cohort. Feature flags are not a replacement for authorization; protected capabilities still require backend entitlement/permission checks.

## 12. Initial delivery order

1. Repository and application foundation.
2. Database core + RLS helpers.
3. Identity and creator accounts.
4. Public portfolio data model.
5. Template registry and renderer.
6. Creator dashboard.
7. Engagement and moderation.
8. Consent/privacy and support systems.
9. Plans, entitlements and billing.
10. Verification and reputation.
11. Analytics, search, notifications and operational tooling.
