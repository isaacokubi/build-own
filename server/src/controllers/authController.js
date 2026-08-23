import User from '../models/User.js';
import { hashPassword, verifyPassword, signAccessToken, issueRefreshToken, rotateRefreshToken, revokeRefreshToken } from '../services/authService.js';

const fail = (message, code, status=400) => Object.assign(new Error(message), { code, status });

export async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || '');
    if (!email || !password) throw fail('Email and password are required', 'VALIDATION_ERROR');
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw fail('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    if (user.lockedUntil && user.lockedUntil > new Date()) throw fail('Account temporarily locked', 'ACCOUNT_LOCKED', 423);
    if (user.status !== 'active') throw fail('Account is not active', 'ACCOUNT_UNAVAILABLE', 403);
    if (!(await verifyPassword(password, user.passwordHash))) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= Number(process.env.LOGIN_MAX_ATTEMPTS || 5)) { user.lockedUntil = new Date(Date.now() + Number(process.env.LOGIN_LOCK_MINUTES || 15) * 60000); user.failedLoginAttempts = 0; }
      await user.save(); throw fail('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }
    user.failedLoginAttempts = 0; user.lockedUntil = undefined; user.lastLoginAt = new Date(); await user.save();
    res.json({ success: true, data: { accessToken: signAccessToken(user), refreshToken: await issueRefreshToken(user, req), user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId, permissions: user.permissions } } });
  } catch (e) { next(e); }
}

export async function refresh(req, res, next) { try { const result = await rotateRefreshToken(req.body.refreshToken, req); res.json({ success: true, data: { accessToken: result.accessToken, refreshToken: result.refreshToken } }); } catch(e) { next(Object.assign(e, { status: e.status || 401 })); } }
export async function logout(req, res, next) { try { if (req.body.refreshToken) await revokeRefreshToken(req.body.refreshToken); res.json({ success: true, data: null }); } catch(e) { next(e); } }

export async function register(req, res, next) {
  try {
    if (process.env.ALLOW_PUBLIC_REGISTRATION !== 'true') throw fail('Public registration is disabled', 'REGISTRATION_DISABLED', 403);
    const { name, email, password, tenantId } = req.body;
    if (!name || !email || !password || !tenantId) throw fail('Name, email, password and company are required', 'VALIDATION_ERROR');
    const exists = await User.exists({ email: email.toLowerCase() }); if (exists) throw fail('Email already registered', 'EMAIL_EXISTS', 409);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash: await hashPassword(password), tenantId, role: 'EMPLOYEE' });
    res.status(201).json({ success: true, data: { id: user._id, email: user.email } });
  } catch(e) { next(e); }
}
