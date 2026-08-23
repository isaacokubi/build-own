# Production Deployment Checklist

1. Set `NODE_ENV=production`.
2. Set a strong `MONGODB_URI` and verify the database user has only the permissions required by the application.
3. Set unique, high-entropy `JWT_SECRET` and `JWT_REFRESH_SECRET` values.
4. Set `CORS_ORIGINS` to the exact production frontend origins.
5. Set `TRUST_PROXY=true` only when the deployment is actually behind a trusted reverse proxy.
6. Configure backup provider, retention, and restoration procedures.
7. Verify `/api/health/live` and `/api/health/ready` after deployment.
8. Confirm application logs contain request IDs and no secrets or credentials.
9. Verify scheduled database backups and perform periodic isolated restore tests.
10. Confirm the frontend points to the production API and no localhost fallback is active in production configuration.
11. Run the CI workflow and review dependency/security alerts before release.
12. Roll out using a reversible deployment strategy and keep the previous release available until health checks pass.
