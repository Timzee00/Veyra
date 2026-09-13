# Veyra Notices & Popups

Veyra supports contextual banners, popups, announcements and in-product notices as a platform capability.

## Design principles

Notices are data-driven and targeted. A notice may be shown globally, on a specific route, to a creator segment, during a campaign, or to users meeting a feature/entitlement condition.

## Supported behavior

- start/end scheduling
- audience targeting
- route targeting
- priority and placement
- dismissal
- snooze/cooldown
- impression tracking
- click tracking
- conversion tracking
- frequency limits
- accessibility and keyboard support
- reduced-motion behavior

## Important distinction

A notice is presentation. The underlying feature, campaign, entitlement or policy is the source of truth. Closing a notice must never revoke an entitlement or alter account state unless an explicit action is taken.

## Example uses

```text
New feature announcement
Campaign promotion
Premium template availability
Verification eligibility
Security alert
Account action required
Maintenance notice
Creator onboarding tip
Upgrade suggestion
Support response notification
```

Notices should use the platform event system for analytics rather than embedding analytics logic into every UI component.
