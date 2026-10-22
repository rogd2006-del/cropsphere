import mongoose, { Schema, Document, Types } from 'mongoose';

export type CloudEventType = 'ORDER_PLACED' | 'ORDER_UPDATED' | 'INVENTORY_CHANGED' | 'INVENTORY_LOW';

export interface ICloudServiceEvent extends Document {
  _id: Types.ObjectId;
  type: CloudEventType;
  payload: Record<string, unknown>;
  processed: boolean;
  retries: number;
  maxRetries: number;
  processingError?: string;
  processedAt?: Date;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const CloudServiceEventSchema = new Schema<ICloudServiceEvent>({
  type: {
    type: String,
    enum: ['ORDER_PLACED', 'ORDER_UPDATED', 'INVENTORY_CHANGED', 'INVENTORY_LOW'],
    required: true,
  },
  payload: { type: Schema.Types.Mixed, required: true },
  processed: { type: Boolean, default: false },
  retries: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  processingError: { type: String },
  processedAt: { type: Date },
  idempotencyKey: { type: String, required: true, unique: true },
}, { timestamps: true });

CloudServiceEventSchema.index({ processed: 1, createdAt: 1 });
// Note: idempotencyKey index is created automatically by unique:true on the field
CloudServiceEventSchema.index({ type: 1 });

export const CloudServiceEvent = mongoose.model<ICloudServiceEvent>('CloudServiceEvent', CloudServiceEventSchema);
