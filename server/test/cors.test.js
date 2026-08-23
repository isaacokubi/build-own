import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedCorsOrigin } from '../src/config/cors.js';

test('allows configured CORS origins', () => {
  assert.equal(isAllowedCorsOrigin('http://localhost:5173'), true);
});

test('allows alternate localhost development ports outside production', () => {
  const original = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  assert.equal(isAllowedCorsOrigin('http://localhost:5175'), true);
  assert.equal(isAllowedCorsOrigin('http://127.0.0.1:5180'), true);

  if (original === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = original;
});

test('does not allow arbitrary remote origins in development', () => {
  assert.equal(isAllowedCorsOrigin('https://example.com'), false);
});

test('does not allow unconfigured localhost origins in production', () => {
  const original = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';

  assert.equal(isAllowedCorsOrigin('http://localhost:5175'), false);

  if (original === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = original;
});
