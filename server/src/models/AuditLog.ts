import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  userEmail?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String },
  metadata: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  requestId: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
