import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  registrationNumber: { type: String, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  country: { type: String, default: 'Kenya', trim: true },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active', index: true },
  subscription: { plan: { type: String, default: 'starter' }, status: { type: String, default: 'active' }, expiresAt: Date },
  isSystem: { type: Boolean, default: false, index: true }
}, { timestamps: true });

tenantSchema.index({ name: 'text', slug: 'text' });
export default mongoose.model('Tenant', tenantSchema);
