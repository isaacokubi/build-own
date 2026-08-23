# Documents & Reporting

Batch 30 establishes the production reporting contract for the platform.

## Required capabilities

- Tenant-scoped document metadata and report records.
- Consistent report status and ownership fields.
- CSV export for operational tables.
- Request IDs for troubleshooting failed report generation.
- Server-side pagination and bounded report queries.
- Production-safe storage: binary files belong in configured object storage, not MongoDB documents.

## Operational rules

1. Every document/report must resolve its tenant from authenticated context.
2. Client-supplied tenant IDs must never override authorization context.
3. Generated reports must be reproducible from stored filters and date ranges.
4. Exports must enforce the same authorization rules as the underlying data.
5. Large exports should be generated asynchronously rather than blocking API requests.
6. Sensitive report files should use short-lived signed download URLs.
