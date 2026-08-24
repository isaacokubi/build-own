import test from 'node:test';
import assert from 'node:assert/strict';
import { getTenantAccessState } from '../src/middleware/tenantAccess.js';

test('active subscription remains accessible', () => {
  const now = new Date('2026-08-24T00:00:00.000Z');
  const state = getTenantAccessState({
    status: 'active',
    subscription: { plan: 'starter', status: 'active', expiresAt: '2026-08-30T00:00:00.000Z' },
  }, now);
  assert.equal(state.allowed, true);
  assert.equal(state.reason, null);
});

test('expired subscription is locked with a friendly renewal message', () => {
  const now = new Date('2026-08-24T00:00:00.000Z');
  const state = getTenantAccessState({
    status: 'active',
    subscription: { plan: 'starter', status: 'active', expiresAt: '2026-08-23T00:00:00.000Z' },
  }, now);
  assert.equal(state.allowed, false);
  assert.equal(state.reason, 'SUBSCRIPTION_EXPIRED');
  assert.match(state.message, /make a subscription to access the platform/i);
});

test('suspended tenant is locked before dashboard access', () => {
  const state = getTenantAccessState({
    status: 'suspended',
    subscription: { plan: 'professional', status: 'active', expiresAt: '2026-12-01T00:00:00.000Z' },
  }, new Date('2026-08-24T00:00:00.000Z'));
  assert.equal(state.allowed, false);
  assert.equal(state.reason, 'TENANT_SUSPENDED');
  assert.match(state.message, /currently suspended/i);
});
