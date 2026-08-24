import Tenant from '../models/Tenant.js';

function buildTrialSubscription(input = {}) {
  if (input && Object.keys(input).length) return input;
  const now = new Date();
  const trialDays = Math.max(Number(process.env.TRIAL_DAYS || 14), 1);
  const expiresAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  return {
    plan: 'trial',
    status: 'trialing',
    startedAt: now,
    trialEndsAt: expiresAt,
    expiresAt,
  };
}

export async function listTenants(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const search = String(req.query.search || '').trim();
    const filter = search ? { $text: { $search: search } } : {};
    const [total, tenants] = await Promise.all([
      Tenant.countDocuments(filter),
      Tenant.find(filter).populate('owner', 'name email role').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()
    ]);
    return res.json({ success: true, data: tenants, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
}

export async function createTenant(req, res, next) {
  try {
    const tenant = await Tenant.create({
      ...req.body,
      subscription: buildTrialSubscription(req.body?.subscription),
    });
    return res.status(201).json({ success: true, data: tenant });
  } catch (e) { next(e); }
}

export async function updateTenant(req, res, next) {
  try { const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!tenant) return res.status(404).json({ success:false,message:'Tenant not found'}); return res.json({success:true,data:tenant}); } catch(e){ next(e); }
}

export async function updateTenantStatus(req,res,next){
  try { const status = String(req.body.status || ''); if (!['active','suspended','pending'].includes(status)) return res.status(400).json({success:false,message:'Invalid tenant status'}); const tenant=await Tenant.findByIdAndUpdate(req.params.id,{status},{new:true}); if(!tenant)return res.status(404).json({success:false,message:'Tenant not found'}); return res.json({success:true,data:tenant}); } catch(e){next(e);}
}

export async function deleteTenant(req,res,next){
  try { const confirmation=String(req.body.confirmation||'').trim(); if(confirmation!=='DELETE')return res.status(400).json({success:false,message:'Type DELETE to permanently remove a company'}); const tenant=await Tenant.findById(req.params.id); if(!tenant)return res.status(404).json({success:false,message:'Tenant not found'}); if(tenant.isSystem)return res.status(403).json({success:false,message:'System tenant cannot be deleted'}); await Tenant.deleteOne({_id:tenant._id}); return res.json({success:true,message:'Tenant deleted successfully'}); }catch(e){next(e);}
}
