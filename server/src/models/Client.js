import mongoose from 'mongoose';
const clientSchema = new mongoose.Schema({ tenantId:{type:mongoose.Schema.Types.ObjectId,ref:'Tenant',required:true,index:true}, type:{type:String,enum:['individual','company'],default:'company'}, name:{type:String,required:true,trim:true}, registrationNumber:String, email:{type:String,trim:true,lowercase:true}, phone:String, address:String, contacts:[{name:String,email:String,phone:String,position:String}], notes:String, isDeleted:{type:Boolean,default:false} },{timestamps:true});
clientSchema.index({tenantId:1,name:1});
export default mongoose.model('Client',clientSchema);
