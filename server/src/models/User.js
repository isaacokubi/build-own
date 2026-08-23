import mongoose from 'mongoose';

const roles = ['SUPERADMIN','ADMIN','DIRECTOR','PROJECT_MANAGER','SITE_MANAGER','ENGINEER','ARCHITECT','FOREMAN','ACCOUNTANT','PROCUREMENT_OFFICER','STOREKEEPER','HR_MANAGER','SAFETY_OFFICER','QUALITY_OFFICER','EMPLOYEE','CLIENT','CONTRACTOR','SUBCONTRACTOR','SUPPLIER'];

const userSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true, required: function () { return this.role !== 'SUPERADMIN'; } },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: roles, default: 'EMPLOYEE', index: true },
  permissions: { type: [String], default: [] },
  status: { type: String, enum: ['active','suspended','locked'], default: 'active', index: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  lastLoginAt: Date,
  emailVerifiedAt: Date
}, { timestamps: true });

userSchema.index({ tenantId: 1, role: 1, status: 1 });
export { roles };
export default mongoose.model('User', userSchema);
