import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';

const accessSecret = () => process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET is not configured'); })();
const refreshSecret = () => process.env.JWT_REFRESH_SECRET || accessSecret();
const accessTtl = process.env.JWT_ACCESS_EXPIRES || '15m';
const refreshDays = Number(process.env.JWT_REFRESH_DAYS || 30);

export const hashPassword = (password) => bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 12));
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
export const signAccessToken = (user) => jwt.sign({ sub: user._id.toString(), tenantId: user.tenantId?.toString(), role: user.role, permissions: user.permissions || [] }, accessSecret(), { expiresIn: accessTtl });
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export async function issueRefreshToken(user, req) {
  const token = jwt.sign({ sub: user._id.toString(), type: 'refresh' }, refreshSecret(), { expiresIn: `${refreshDays}d` });
  await Session.create({ userId: user._id, tenantId: user.tenantId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + refreshDays * 86400000), userAgent: req.get('user-agent'), ipAddress: req.ip });
  return token;
}

export async function rotateRefreshToken(token, req) {
  const payload = jwt.verify(token, refreshSecret());
  if (payload.type !== 'refresh') throw Object.assign(new Error('Invalid refresh token'), { status: 401, code: 'INVALID_REFRESH_TOKEN' });
  const session = await Session.findOne({ tokenHash: hashToken(token), revokedAt: null }).select('+tokenHash');
  if (!session || session.expiresAt <= new Date()) throw Object.assign(new Error('Refresh session expired'), { status: 401, code: 'SESSION_EXPIRED' });
  session.revokedAt = new Date(); await session.save();
  const user = await User.findById(payload.sub).select('+passwordHash');
  if (!user || user.status !== 'active') throw Object.assign(new Error('Account unavailable'), { status: 401, code: 'ACCOUNT_UNAVAILABLE' });
  return { user, refreshToken: await issueRefreshToken(user, req), accessToken: signAccessToken(user) };
}

export const revokeRefreshToken = async (token) => Session.updateOne({ tokenHash: hashToken(token) }, { $set: { revokedAt: new Date() } });
