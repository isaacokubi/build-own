import Tenant from '../models/Tenant.js';
import { getTenantAccessState } from '../middleware/tenantAccess.js';

export async function getMyTenant(req,res,next){
  try{
    if(req.user?.role==='SUPERADMIN')return res.status(403).json({success:false,message:'Superadmin uses company administration',code:'SUPERADMIN_CONTEXT'});
    if(!req.user?.tenantId)return res.status(403).json({success:false,message:'Tenant context required',code:'TENANT_REQUIRED'});
    const tenant=await Tenant.findById(req.user.tenantId).populate('owner','name email role').lean();
    if(!tenant)return res.status(404).json({success:false,message:'Company not found',code:'TENANT_NOT_FOUND'});
    const access=getTenantAccessState(tenant);
    return res.json({success:true,data:tenant,access});
  }catch(e){next(e)}
}
