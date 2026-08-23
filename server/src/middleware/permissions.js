export const requirePermissions = (...required) => (req, res, next) => {
  const granted = new Set(req.user?.permissions || []);
  if (req.user?.role === 'SUPERADMIN' || required.every(permission => granted.has(permission))) return next();
  return res.status(403).json({ success: false, message: 'Insufficient permissions', code: 'PERMISSION_DENIED' });
};

export const requireTenant = (req, res, next) => {
  if (req.user?.role === 'SUPERADMIN') return next();
  if (!req.user?.tenantId) return res.status(403).json({ success: false, message: 'Tenant context required', code: 'TENANT_REQUIRED' });
  req.tenantId = req.user.tenantId;
  next();
};
