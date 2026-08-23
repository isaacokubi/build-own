# Build-Own API Reference

## Base URL

Configure the frontend with the deployed API origin. Local development defaults to `http://localhost:5000`.

## Health

- `GET /api/health` — basic service status.
- `GET /api/health/live` — liveness check.
- `GET /api/health/ready` — readiness check including MongoDB connectivity.

## Authentication

Authentication endpoints are under `/api/auth`. Clients should send the issued bearer token using:

```text
Authorization: Bearer <token>
```

## Tenant administration

Tenant/company operations are under `/api/tenants`. Tenant-scoped endpoints must resolve the authenticated user's tenant and must never accept a client-supplied tenant identifier as an authority override.

## Core modules

- `/api/construction` — projects, contracts, BOQs and construction operations.
- `/api/finance` — finance and procurement operations.
- `/api/hr` — workforce administration.
- `/api/payroll` — payroll operations.
- `/api/equipment` — equipment management.
- `/api/inventory` — inventory management.
- `/api/procurement` — purchasing workflows.
- `/api/hr-payroll` — integrated HR/payroll workflows.
- `/api/safety-quality` — safety and quality management.
- `/api/documents-reporting` — documents and reports.
- `/api/notifications-audit` — notifications and audit records.
- `/api/backup/policy` — backup/recovery readiness metadata.

## API conventions

Successful responses use `{ success: true, data, message?, meta? }`. Errors use `{ success: false, message, code, requestId? }`.

Paginated responses expose `page`, `limit`, `total`, and `pages` in `meta` where supported. Pagination must remain bounded server-side.

Every request receives an `x-request-id` response header. Include that ID when reporting production failures so logs can be correlated.

## Security requirements

Never commit `.env` files, secrets, access tokens, private keys, payment credentials, or production database URLs. Configure secrets in the deployment environment.

Production traffic must use HTTPS. Configure `CORS_ORIGINS` explicitly rather than relying on broad origins.
