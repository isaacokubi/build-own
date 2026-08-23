import AuditLog from '../models/AuditLog.js';

export async function writeAudit(req, { action, entity, entityId, before, after, metadata } = {}) {
  return AuditLog.create({ tenantId: req.user?.tenantId || req.tenantId || undefined, userId: req.user?._id, role: req.user?.role, action, entity, entityId, ipAddress: req.ip, userAgent: req.get('user-agent'), before, after, metadata });
}
