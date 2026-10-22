import mongoose, { Schema, Document, Types } from 'mongoose';

export type OrderStatus = 
  | 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DISPATCHED' 
  | 'DELIVERED' | 'CANCELLED' | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
export type DeliveryMethod = 'PICKUP' | 'DELIVERY';

export interface IOrderItem {
  productId: Types.ObjectId;
  farmerId: Types.ObjectId;
  name: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  imageSnapshot?: string;
  subtotal: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  consumerId: Types.ObjectId;
  farmerId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentReference?: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  pickupDate?: Date;
  notes?: string;
  statusHistory: { status: OrderStatus; timestamp: Date; note?: string }[];
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  imageSnapshot: { type: String },
  subtotal: { type: Number, required: true },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  consumerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'REJECTED'],
    default: 'PENDING',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED'],
    default: 'PENDING',
  },
  paymentMethod: { type: String, default: 'DEMO_PAYMENT' },
  paymentReference: { type: String },
  deliveryMethod: { type: String, enum: ['PICKUP', 'DELIVERY'], required: true },
  deliveryAddress: {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String,
  },
  pickupDate: { type: Date },
  notes: { type: String, maxlength: 500 },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  }],
  idempotencyKey: { type: String, unique: true, sparse: true },
}, { timestamps: true });

OrderSchema.index({ consumerId: 1, createdAt: -1 });
OrderSchema.index({ farmerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
// Note: orderNumber and idempotencyKey indexes are created by unique:true on those fields

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
