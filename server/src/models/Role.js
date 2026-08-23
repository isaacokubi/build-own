import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  name: { type: String, required: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  system: { type: Boolean, default: false }
}, { timestamps: true });
roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });
export default mongoose.model('Role', roleSchema);
