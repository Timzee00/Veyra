# Veyra Engineering Rules

1. Domain modules own their business logic and persistence boundaries.
2. Platform services provide cross-cutting capabilities; they do not become a dumping ground for unrelated domain logic.
3. No client-side secret handling. Server-only credentials stay server-side.
4. No authorization based solely on UI visibility.
5. No subscription-plan string checks scattered through components. Use entitlements.
6. Public data, creator-private data and admin data have separate access paths.
7. Uploaded media is stored in object storage; relational data stores metadata and ownership.
8. Published template versions are immutable and creator sites pin an explicit version.
9. Campaigns grant benefits; campaign expiry does not implicitly revoke permanent grants.
10. Notices announce or guide. They are not the source of truth for permissions or entitlements.
11. Important mutations should emit typed domain events and/or audit records where appropriate.
12. New database changes arrive through migrations; production data is never changed by ad-hoc application startup code.
13. Every user-facing capability must have loading, empty, success, error and inaccessible states.
14. Accessibility is part of acceptance criteria, not a post-release polish task.
15. Any new feature must document security, privacy, ownership, limits, observability, rollback and upgrade behavior before release.
