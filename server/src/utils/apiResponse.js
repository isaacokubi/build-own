export const success=(res,data=null,message='OK',status=200,meta)=>res.status(status).json({success:true,message,data,...(meta?{meta}:{})});
export const failure=(res,message='Request failed',code='REQUEST_FAILED',status=400)=>res.status(status).json({success:false,message,code});
