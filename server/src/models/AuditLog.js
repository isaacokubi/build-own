import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  role: String,
  action: { type: String, required: true, index: true },
  entity: { type: String, required: true, index: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, index: true },
  ipAddress: String,
  userAgent: String,
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });
auditLogSchema.index({ tenantId: 1, createdAt: -1 });
export default mongoose.model('AuditLog', auditLogSchema);
