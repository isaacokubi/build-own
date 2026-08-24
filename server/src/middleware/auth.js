import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function authenticate(req,res,next){
  try{
    if(req.user)return next();
    const header=req.get('authorization')||'';
    const token=header.startsWith('Bearer ')?header.slice(7):null;
    if(!token)return res.status(401).json({success:false,message:'Authentication required',code:'AUTH_REQUIRED'});
    if(!process.env.JWT_SECRET)return res.status(500).json({success:false,message:'Authentication is not configured',code:'AUTH_CONFIG_ERROR'});
    const payload=jwt.verify(token,process.env.JWT_SECRET);
    const user=await User.findById(payload.sub).lean();
    if(!user||user.status!=='active')return res.status(401).json({success:false,message:'Invalid or inactive account',code:'AUTH_INVALID'});
    req.user=user;
    next();
  }catch{return res.status(401).json({success:false,message:'Invalid authentication token',code:'AUTH_INVALID'})}
}
export const requireAuth=authenticate;
export function authorize(...allowedRoles){return(req,res,next)=>allowedRoles.includes(req.user?.role)?next():res.status(403).json({success:false,message:'Insufficient permissions',code:'FORBIDDEN'})}
export const requireRole=authorize;
export function requirePermission(...permissions){return(req,res,next)=>{const userPermissions=req.user?.permissions||[];const ok=permissions.every(p=>userPermissions.includes(p));return ok?next():res.status(403).json({success:false,message:'Required permission missing',code:'PERMISSION_DENIED'})}}
