import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  type: { type: String, enum: ['SYSTEM', 'PROJECT', 'FINANCE', 'PROCUREMENT', 'SAFETY', 'QUALITY', 'HR', 'TASK'], default: 'SYSTEM' },
  read: { type: Boolean, default: false },
  readAt: Date,
  link: { type: String, trim: true, maxlength: 500 },
  dedupeKey: { type: String, trim: true, unique: true, sparse: true, index: true },
}, { timestamps: true });

notificationSchema.index({ tenantId: 1, recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * Number(process.env.NOTIFICATION_RETENTION_DAYS || 180) });

const auditSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  role: String,
  ip: String,
  action: { type: String, required: true, trim: true, maxlength: 120 },
  entity: { type: String, required: true, trim: true, maxlength: 120 },
  entityId: Schema.Types.ObjectId,
  previousValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

auditSchema.index({ tenantId: 1, createdAt: -1 });
auditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * Number(process.env.AUDIT_RETENTION_DAYS || 730) });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditSchema);
