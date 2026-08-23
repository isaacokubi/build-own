import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  siteManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String, trim: true },
  coordinates: { lat: Number, lng: Number },
  contractValue: { type: Number, min: 0, default: 0 },
  budget: { type: Number, min: 0, default: 0 },
  startDate: Date,
  expectedCompletionDate: Date,
  actualCompletionDate: Date,
  status: { type: String, enum: ['planning','tender','awarded','mobilization','active','delayed','on_hold','completed','cancelled'], default: 'planning', index: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  description: String,
  scope: String,
  isDeleted: { type: Boolean, default: false, index: true }
}, { timestamps: true });
projectSchema.index({ tenantId: 1, code: 1 }, { unique: true });
projectSchema.index({ tenantId: 1, status: 1, isDeleted: 1 });
export default mongoose.model('Project', projectSchema);
