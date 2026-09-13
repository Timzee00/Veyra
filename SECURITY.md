# Veyra Security

Security is a product requirement for Veyra.

## Engineering principles

- Never expose Supabase service-role credentials in browser code.
- Enforce tenant isolation with PostgreSQL Row Level Security.
- Treat frontend checks as user experience, not authorization.
- Validate and authorize sensitive mutations on the server.
- Record privileged administrative actions in audit logs.
- Keep personally identifiable data collection purposeful and minimal.
- Gate optional analytics/marketing technologies behind consent where required.
- Keep uploads isolated by creator and validate media metadata before processing.
- Rate-limit anonymous engagement and public support/lead endpoints.
- Review third-party integrations before enabling them in production.

## Reporting

Do not publish sensitive security details in public issues. Production reporting and incident-response contacts will be added before public launch.
