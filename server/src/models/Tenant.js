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
  subscription: {
    plan: { type: String, default: 'starter', trim: true },
    status: {
      type: String,
      enum: ['trialing', 'active', 'past_due', 'expired', 'cancelled', 'suspended'],
      default: 'active',
      index: true,
    },
    startedAt: Date,
    trialEndsAt: Date,
    expiresAt: Date,
  },
  isSystem: { type: Boolean, default: false, index: true },
}, { timestamps: true });

tenantSchema.index({ name: 'text', slug: 'text' });
tenantSchema.index({ 'subscription.expiresAt': 1, status: 1 });

export default mongoose.model('Tenant', tenantSchema);
