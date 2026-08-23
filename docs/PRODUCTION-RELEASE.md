# Production Release Validation

## Application

- [ ] `NODE_ENV=production` is configured in the deployment environment.
- [ ] Production frontend uses the production API origin.
- [ ] No production configuration depends on localhost fallbacks.
- [ ] `/api/health/live` returns healthy.
- [ ] `/api/health/ready` returns healthy with database connectivity.

## Security

- [ ] Production JWT secrets are unique and high entropy.
- [ ] MongoDB credentials are stored only in deployment secrets.
- [ ] CORS origins are explicitly restricted.
- [ ] Tenant authorization is derived from authenticated identity.
- [ ] Administrative and destructive operations are role protected and audited.
- [ ] Logs do not expose credentials, tokens, or sensitive personal data.

## Data

- [ ] MongoDB backups are enabled and retention is configured.
- [ ] A restoration test has been completed successfully.
- [ ] TTL retention policies are verified for notification and audit collections.

## Quality

- [ ] Backend tests pass in CI.
- [ ] Frontend production build completes successfully.
- [ ] Authentication and protected routes have been smoke tested.
- [ ] Core workflows have been smoke tested: construction, finance, procurement, HR, payroll, equipment, inventory, safety and quality.
- [ ] CSV/report exports are authorized and tenant scoped.

## Release

- [ ] Deployment health checks pass.
- [ ] No blocking CI failures remain.
- [ ] The release commit is recorded.
- [ ] Rollback to the previous release has been verified.
