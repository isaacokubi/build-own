import mongoose from 'mongoose';
const itemSchema=new mongoose.Schema({code:String,description:{type:String,required:true},unit:{type:String,required:true},quantity:{type:Number,min:0,required:true},unitRate:{type:Number,min:0,required:true},category:String,section:String,notes:String,total:{type:Number,min:0,default:0}},{_id:true});
itemSchema.pre('validate',function(next){this.total=this.quantity*this.unitRate;next();});
const boqSchema=new mongoose.Schema({tenantId:{type:mongoose.Schema.Types.ObjectId,ref:'Tenant',required:true,index:true},project:{type:mongoose.Schema.Types.ObjectId,ref:'Project',required:true,index:true},name:{type:String,required:true},version:{type:Number,default:1},items:[itemSchema],status:{type:String,enum:['draft','submitted','approved','rejected'],default:'draft'},total:{type:Number,default:0}},{timestamps:true});
boqSchema.pre('validate',function(next){this.total=this.items.reduce((s,i)=>s+(i.quantity*i.unitRate),0);next();});
export default mongoose.model('BOQ',boqSchema);
