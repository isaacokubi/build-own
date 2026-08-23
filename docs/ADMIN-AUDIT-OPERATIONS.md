# Admin, Audit & Tenant Operations

## Tenant isolation

Every tenant-scoped request must derive tenant context from the authenticated identity. Client-supplied tenant IDs are never authorization boundaries.

## Administration

Administrative interfaces should expose only actions permitted by the authenticated role. Destructive actions require explicit confirmation and should produce an audit record.

## Audit records

Record actor, role, tenant, action, entity, entity ID, request IP when available, and relevant before/after values. Audit queries must remain tenant-scoped and paginated.

## Notifications

Notification reads and writes must be scoped to the authenticated recipient and tenant. Retention is controlled by the server-side retention configuration.

## Operational review

Before production release verify tenant isolation, role enforcement, audit creation, notification delivery, destructive-action confirmation, and export authorization across all administrative modules.
