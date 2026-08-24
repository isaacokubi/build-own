import test from 'node:test';
import assert from 'node:assert/strict';
import { analyticsSummary } from '../src/controllers/documentReportController.js';

test('analytics summary rejects requests without tenant context', async () => {
  const response = { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await analyticsSummary({ user: {} }, response, () => {});

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.code, 'TENANT_REQUIRED');
});
