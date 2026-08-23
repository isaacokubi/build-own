import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [], tenantId: user.tenantId || null, status: user.status });
const issueToken = (user) => {
  if (!process.env.JWT_SECRET) throw Object.assign(new Error('Authentication is not configured'), { code: 'AUTH_CONFIG_ERROR', status: 500 });
  return jwt.sign({ sub: String(user._id), role: user.role, tenantId: user.tenantId ? String(user.tenantId) : null }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
};
export async function login(req, res) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase(); const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ success:false, message:'Email and password are required', code:'VALIDATION_ERROR' });
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || user.status !== 'active') return res.status(401).json({ success:false, message:'Invalid email or password', code:'AUTH_INVALID' });
    if (user.lockedUntil && user.lockedUntil > new Date()) return res.status(423).json({ success:false, message:'Account temporarily locked', code:'ACCOUNT_LOCKED' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { user.failedLoginAttempts=(user.failedLoginAttempts||0)+1; if(user.failedLoginAttempts>=5) user.lockedUntil=new Date(Date.now()+15*60*1000); await user.save(); return res.status(401).json({ success:false,message:'Invalid email or password',code:'AUTH_INVALID' }); }
    user.failedLoginAttempts=0; user.lockedUntil=undefined; user.lastLoginAt=new Date(); await user.save();
    return res.json({ success:true, data:{ token:issueToken(user), user:publicUser(user) } });
  } catch (error) { return res.status(error.status||500).json({ success:false,message:error.status?error.message:'Authentication failed',code:error.code||'AUTH_ERROR' }); }
}
export async function register(req, res) {
  try {
    const { name, email:rawEmail, password, role='EMPLOYEE', tenantId }=req.body||{}; const email=String(rawEmail||'').trim().toLowerCase();
    if(!name||!email||!password) return res.status(400).json({success:false,message:'Name, email and password are required',code:'VALIDATION_ERROR'});
    if(password.length<8) return res.status(400).json({success:false,message:'Password must be at least 8 characters',code:'VALIDATION_ERROR'});
    if(!User.schema.path('role').enumValues.includes(role)) return res.status(400).json({success:false,message:'Invalid role',code:'VALIDATION_ERROR'});
    if(await User.exists({email})) return res.status(409).json({success:false,message:'Email already registered',code:'EMAIL_EXISTS'});
    if(role!=='SUPERADMIN'&&!tenantId) return res.status(400).json({success:false,message:'tenantId is required',code:'TENANT_REQUIRED'});
    if(tenantId&&!(await Tenant.exists({_id:tenantId,status:'active'}))) return res.status(400).json({success:false,message:'Invalid or inactive tenant',code:'TENANT_INVALID'});
    const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12),role,tenantId:role==='SUPERADMIN'?undefined:tenantId});
    return res.status(201).json({success:true,data:{user:publicUser(user)}});
  } catch { return res.status(500).json({success:false,message:'Registration failed',code:'REGISTER_ERROR'}); }
}
export async function refresh(_req,res){ return res.status(501).json({success:false,message:'Refresh tokens are not configured',code:'REFRESH_NOT_CONFIGURED'}); }
export async function logout(_req,res){ return res.json({success:true,data:{loggedOut:true}}); }
