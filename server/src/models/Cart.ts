import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
  priceSnapshot: number;
  nameSnapshot: string;
  unitSnapshot: string;
  imageSnapshot?: string;
  farmerIdSnapshot: Types.ObjectId;
  farmerNameSnapshot: string;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceSnapshot: { type: Number, required: true },
  nameSnapshot: { type: String, required: true },
  unitSnapshot: { type: String, required: true },
  imageSnapshot: { type: String },
  farmerIdSnapshot: { type: Schema.Types.ObjectId, required: true },
  farmerNameSnapshot: { type: String, required: true },
}, { _id: false });

const CartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
}, { timestamps: true });

// Note: userId index is created automatically by unique:true on the field

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
