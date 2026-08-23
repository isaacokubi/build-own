import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required', code: 'AUTH_REQUIRED' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).lean();
    if (!user || user.status !== 'active') return res.status(401).json({ success: false, message: 'Invalid or inactive account', code: 'AUTH_INVALID' });
    req.user = user; req.auth = payload; req.tenantId = user.tenantId || null; next();
  } catch { return res.status(401).json({ success: false, message: 'Invalid authentication token', code: 'AUTH_INVALID' }); }
}

export const requireAuth = authenticate;
export function authorize(...allowedRoles) { return (req, res, next) => allowedRoles.includes(req.user?.role) ? next() : res.status(403).json({ success: false, message: 'Insufficient permissions', code: 'FORBIDDEN' }); }
export const requireRole = (...roles) => authorize(...roles);
export const requirePermission = (...permissions) => (req, res, next) => {
  if (req.user?.role === 'SUPERADMIN' || permissions.every(p => (req.user?.permissions || []).includes(p))) return next();
  return res.status(403).json({ success: false, message: 'Insufficient permission', code: 'PERMISSION_DENIED' });
};
export const requireSuperAdmin = requireRole('SUPERADMIN');
