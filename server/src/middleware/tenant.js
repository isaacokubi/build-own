import mongoose from 'mongoose';

export function requireTenant(req, res, next) {
  if (req.user?.role === 'SUPERADMIN') return next();
  if (!req.user?.tenantId) return res.status(403).json({ success: false, message: 'Tenant context required', code: 'TENANT_REQUIRED' });
  req.tenantId = new mongoose.Types.ObjectId(req.user.tenantId);
  next();
}

export function tenantFilter(req, filter = {}) {
  if (req.user?.role === 'SUPERADMIN') return filter;
  if (!req.tenantId) throw Object.assign(new Error('Tenant context required'), { status: 403, code: 'TENANT_REQUIRED' });
  return { ...filter, tenantId: req.tenantId };
}
