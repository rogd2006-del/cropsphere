import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAddress extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

AddressSchema.index({ userId: 1 });

export const Address = mongoose.model<IAddress>('Address', AddressSchema);
