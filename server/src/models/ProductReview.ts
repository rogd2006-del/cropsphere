import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProductReview extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  farmerId: Types.ObjectId;
  orderId: Types.ObjectId;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductReviewSchema = new Schema<IProductReview>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 1000 },
  helpful: { type: Number, default: 0 },
}, { timestamps: true });

// Each user can review a product once per order
ProductReviewSchema.index({ productId: 1, userId: 1, orderId: 1 }, { unique: true });
ProductReviewSchema.index({ productId: 1 });
ProductReviewSchema.index({ farmerId: 1 });

export const ProductReview = mongoose.model<IProductReview>('ProductReview', ProductReviewSchema);
