import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  system: { type: Boolean, default: false, index: true }
}, { timestamps: true });

roleSchema.index({ tenantId: 1, name: 1 }, { unique: true, partialFilterExpression: { tenantId: { $type: 'objectId' } } });

export default mongoose.model('Role', roleSchema);
