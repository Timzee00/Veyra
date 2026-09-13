# Veyra Campaigns, Entitlements & Versioning

## Purpose

Veyra campaigns are separate from the benefits they grant. A campaign may expire while an entitlement granted during that campaign continues to exist.

## Grant lifecycle

```text
Campaign
  -> eligibility
  -> claim/grant
  -> creator entitlement
  -> entitlement lifecycle
```

Campaign state must never be used as the sole source of truth for an already-granted benefit.

## Grant modes

- permanent: entitlement has no expiry unless explicitly revoked
- temporary: entitlement has an expiry timestamp
- scheduled: entitlement starts and/or expires at configured times
- usage_limited: entitlement is consumed against a configured quantity
- subscription_bound: entitlement follows a qualifying subscription
- version_pinned: an asset entitlement references an exact version

## Template versioning

Templates are immutable releases from the perspective of an active creator site. A template may have many versions:

```text
Cinema
  v1.0
  v1.1
  v2.0
```

A published creator site references the exact template version it is using. New versions do not silently replace the creator's current version.

Creators may be offered an upgrade preview. Upgrades are explicit unless a template's compatibility policy says otherwise.

## Deprecation

A version can be active, deprecated, maintenance, or blocked. Deprecation does not automatically remove an existing entitlement. A blocked version is reserved for exceptional cases such as a critical security or platform-compatibility issue and must follow the platform's migration policy.

## Entitlement precedence

When multiple grants affect the same capability, Veyra should resolve them deterministically using grant source, scope, start/end dates, explicit revocations and product rules. A campaign ending must not accidentally erase a permanent grant.

## Example

A September campaign grants `template.cinema.v1` permanently. The campaign ends on September 30. New creators can no longer claim the campaign benefit, while existing recipients continue to use `v1`. When `v2` is released, recipients remain pinned to `v1` until they explicitly upgrade.
