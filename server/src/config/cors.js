const DEFAULT_LOCAL_ORIGIN_PATTERN = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/;

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = new Set(configuredOrigins);

export function isAllowedCorsOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;

  // Local development frequently moves between Vite ports (5173, 5174,
  // 5175, etc.). Allow localhost origins outside production while keeping
  // production deployments restricted to the explicit allowlist above.
  if (process.env.NODE_ENV !== 'production' && DEFAULT_LOCAL_ORIGIN_PATTERN.test(origin)) {
    return true;
  }

  return false;
}

export function getConfiguredCorsOrigins() {
  return [...allowedOrigins];
}
