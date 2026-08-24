import Tenant from '../models/Tenant.js';

const BLOCKED_SUBSCRIPTION_STATUSES = new Set([
  'suspended',
  'past_due',
  'expired',
  'cancelled',
  'canceled',
  'inactive',
]);

export function getTenantAccessState(tenant, now = new Date()) {
  if (!tenant) {
    return {
      allowed: false,
      reason: 'TENANT_NOT_FOUND',
      message: 'We could not find your company workspace.',
    };
  }

  if (tenant.status === 'suspended') {
    return {
      allowed: false,
      reason: 'TENANT_SUSPENDED',
      message: 'Your company workspace is currently suspended. Please contact your platform administrator to restore access.',
      expiresAt: tenant.subscription?.expiresAt || null,
    };
  }

  if (tenant.status !== 'active') {
    return {
      allowed: false,
      reason: 'TENANT_INACTIVE',
      message: 'Your company workspace is not currently active. Please contact your platform administrator.',
      expiresAt: tenant.subscription?.expiresAt || null,
    };
  }

  const subscription = tenant.subscription || {};
  const expiresAt = subscription.expiresAt ? new Date(subscription.expiresAt) : null;
  const status = String(subscription.status || 'active').toLowerCase();
  const expired = expiresAt && expiresAt.getTime() <= now.getTime();

  if (BLOCKED_SUBSCRIPTION_STATUSES.has(status) || expired) {
    return {
      allowed: false,
      reason: expired ? 'SUBSCRIPTION_EXPIRED' : 'SUBSCRIPTION_REQUIRED',
      message: 'Your trial or subscription has ended. Please make a subscription to access the platform and unlock your workspace.',
      plan: subscription.plan || 'starter',
      subscriptionStatus: status,
      expiresAt: expiresAt?.toISOString() || null,
    };
  }

  return {
    allowed: true,
    reason: null,
    message: null,
    plan: subscription.plan || 'starter',
    subscriptionStatus: status,
    expiresAt: expiresAt?.toISOString() || null,
  };
}

export async function requireTenantSubscription(req, res, next) {
  try {
    if (req.user?.role === 'SUPERADMIN') return next();
    if (!req.user?.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Tenant context required',
        code: 'TENANT_REQUIRED',
      });
    }

    const tenant = await Tenant.findById(req.user.tenantId).lean();
    const access = getTenantAccessState(tenant);

    if (!access.allowed) {
      return res.status(402).json({
        success: false,
        message: access.message,
        code: access.reason,
        access,
      });
    }

    req.tenant = tenant;
    req.tenantAccess = access;
    next();
  } catch (error) {
    next(error);
  }
}
