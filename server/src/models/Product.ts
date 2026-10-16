import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProductCategory = 
  | 'vegetables' | 'fruits' | 'grains' | 'dairy' 
  | 'herbs' | 'nuts' | 'honey' | 'eggs' | 'other';

export type ProductUnit = 'kg' | 'g' | 'lb' | 'oz' | 'dozen' | 'bunch' | 'piece' | 'litre' | 'pack';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  farmerId: Types.ObjectId;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  unit: ProductUnit;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  location: string;
  city: string;
  state: string;
  images: string[];
  harvestDate?: Date;
  expiryDate?: Date;
  availability: boolean;
  freshness: 'very-fresh' | 'fresh' | 'good' | 'limited';
  origin: string;
  organic: boolean;
  tags: string[];
  lowStockThreshold: number;
  lowStockAlertSent: boolean;
  viewCount: number;
  soldCount: number;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required: [farmerId, name, category, price, unit, stockQuantity]
 *       properties:
 *         _id: { type: string }
 *         farmerId: { type: string }
 *         name: { type: string }
 *         description: { type: string }
 *         category: { type: string, enum: [vegetables, fruits, grains, dairy, herbs, nuts, honey, eggs, other] }
 *         price: { type: number, minimum: 0 }
 *         unit: { type: string }
 *         stockQuantity: { type: number, minimum: 0 }
 *         availability: { type: boolean }
 */
const ProductSchema = new Schema<IProduct>({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 2000 },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'grains', 'dairy', 'herbs', 'nuts', 'honey', 'eggs', 'other'],
  },
  price: { type: Number, required: true, min: 0 },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'lb', 'oz', 'dozen', 'bunch', 'piece', 'litre', 'pack'],
  },
  stockQuantity: { type: Number, required: true, min: 0, default: 0 },
  minOrderQuantity: { type: Number, default: 1, min: 1 },
  maxOrderQuantity: { type: Number },
  location: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, required: true },
  images: [{ type: String }],
  harvestDate: { type: Date },
  expiryDate: { type: Date },
  availability: { type: Boolean, default: true },
  freshness: {
    type: String,
    enum: ['very-fresh', 'fresh', 'good', 'limited'],
    default: 'fresh',
  },
  origin: { type: String, default: '' },
  organic: { type: Boolean, default: false },
  tags: [{ type: String }],
  lowStockThreshold: { type: Number, default: 10 },
  lowStockAlertSent: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

ProductSchema.index({ farmerId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ availability: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ city: 1, state: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
