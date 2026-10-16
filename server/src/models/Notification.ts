import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationType = 
  | 'ORDER_PLACED' | 'ORDER_CONFIRMED' | 'ORDER_DISPATCHED' 
  | 'ORDER_DELIVERED' | 'ORDER_CANCELLED' | 'LOW_STOCK' 
  | 'NEW_REVIEW' | 'SYSTEM';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  referenceId?: string;
  referenceType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['ORDER_PLACED', 'ORDER_CONFIRMED', 'ORDER_DISPATCHED', 'ORDER_DELIVERED', 
           'ORDER_CANCELLED', 'LOW_STOCK', 'NEW_REVIEW', 'SYSTEM'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  referenceId: { type: String },
  referenceType: { type: String },
}, { timestamps: true });

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
