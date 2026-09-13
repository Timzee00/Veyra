# Veyra Build Roadmap

## Phase 1 — Platform foundation

- Next.js application shell
- typed domain/module boundaries
- environment and configuration handling
- database migration workflow
- authentication and creator identity
- authorization and RLS
- entitlement engine
- event contracts
- audit logging
- consent/privacy primitives

## Phase 2 — Creator platform

- creator onboarding
- profile management
- portfolio sites
- projects and media
- public URLs
- template registry
- template version pinning
- design customization
- creator dashboard

## Phase 3 — Trust and engagement

- likes/views/comments/shares
- moderation/reporting
- verification workflows
- recognised creator states
- support tickets and account assistance
- notifications

## Phase 4 — Growth and monetization

- plans and subscriptions
- campaigns and promotional grants
- add-ons
- billing
- premium templates
- custom domains
- advanced analytics

## Phase 5 — Platform expansion

- discovery/search
- marketplace
- organization/agency accounts
- richer automation
- external integrations
- AI template builder
- AI-assisted creator tools

## Engineering rule

Every new feature must have a clear domain owner, permission model, entitlement model where applicable, event contract where useful, persistence boundary, audit/security impact assessment, and migration/rollback story before production release.
