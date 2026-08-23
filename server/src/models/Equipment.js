import mongoose from 'mongoose';
const { Schema } = mongoose;
const equipmentSchema = new Schema({
  tenantId:{type:Schema.Types.ObjectId,ref:'Tenant',required:true,index:true},
  assetNumber:{type:String,required:true,trim:true}, name:{type:String,required:true,trim:true}, category:{type:String,required:true,trim:true},
  type:String, manufacturer:String, model:String, serialNumber:String, year:Number,
  status:{type:String,enum:['Available','Assigned','Maintenance','Out of Service','Retired'],default:'Available'},
  location:String, projectId:{type:Schema.Types.ObjectId,ref:'ConstructionProject'}, operatorId:{type:Schema.Types.ObjectId,ref:'Employee'},
  acquisitionDate:Date, acquisitionCost:{type:Number,min:0,default:0}, meterReading:{type:Number,min:0,default:0}, meterUnit:{type:String,enum:['Hours','Kilometers','Miles'],default:'Hours'},
  fuelType:String, fuelCapacity:{type:Number,min:0}, notes:String
},{timestamps:true});
equipmentSchema.index({tenantId:1,assetNumber:1},{unique:true}); equipmentSchema.index({tenantId:1,status:1}); equipmentSchema.index({tenantId:1,projectId:1});
const maintenanceSchema = new Schema({tenantId:{type:Schema.Types.ObjectId,ref:'Tenant',required:true,index:true},equipmentId:{type:Schema.Types.ObjectId,ref:'Equipment',required:true},type:{type:String,enum:['Preventive','Corrective','Inspection','Service'],required:true},scheduledDate:Date,completedDate:Date,description:{type:String,required:true},vendor:String,cost:{type:Number,min:0,default:0},meterReading:{type:Number,min:0},status:{type:String,enum:['Scheduled','In Progress','Completed','Cancelled'],default:'Scheduled'},nextServiceDate:Date,notes:String},{timestamps:true});
maintenanceSchema.index({tenantId:1,equipmentId:1,scheduledDate:1});
const fuelSchema = new Schema({tenantId:{type:Schema.Types.ObjectId,ref:'Tenant',required:true,index:true},equipmentId:{type:Schema.Types.ObjectId,ref:'Equipment',required:true},projectId:{type:Schema.Types.ObjectId,ref:'ConstructionProject'},date:{type:Date,required:true},quantity:{type:Number,min:0,required:true},unit:{type:String,enum:['Litres','Gallons'],default:'Litres'},unitCost:{type:Number,min:0,default:0},totalCost:{type:Number,min:0,default:0},meterReading:{type:Number,min:0},supplier:String,reference:String,notes:String},{timestamps:true});
fuelSchema.index({tenantId:1,equipmentId:1,date:-1});
const assignmentSchema = new Schema({tenantId:{type:Schema.Types.ObjectId,ref:'Tenant',required:true,index:true},equipmentId:{type:Schema.Types.ObjectId,ref:'Equipment',required:true},projectId:{type:Schema.Types.ObjectId,ref:'ConstructionProject'},operatorId:{type:Schema.Types.ObjectId,ref:'Employee'},startDate:{type:Date,required:true},endDate:Date,handoverNotes:String,status:{type:String,enum:['Active','Completed','Cancelled'],default:'Active'}},{timestamps:true});
assignmentSchema.index({tenantId:1,equipmentId:1,status:1});
export const Equipment=mongoose.models.Equipment||mongoose.model('Equipment',equipmentSchema);
export const EquipmentMaintenance=mongoose.models.EquipmentMaintenance||mongoose.model('EquipmentMaintenance',maintenanceSchema);
export const EquipmentFuel=mongoose.models.EquipmentFuel||mongoose.model('EquipmentFuel',fuelSchema);
export const EquipmentAssignment=mongoose.models.EquipmentAssignment||mongoose.model('EquipmentAssignment',assignmentSchema);
