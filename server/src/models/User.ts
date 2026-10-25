import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserRole = 'CONSUMER' | 'FARMER' | 'ADMIN';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  clerkId?: string;
  role: UserRole;
  name: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         email: { type: string, format: email }
 *         role: { type: string, enum: [CONSUMER, FARMER, ADMIN] }
 *         name: { type: string }
 *         phone: { type: string }
 *         isActive: { type: boolean }
 *         clerkId: { type: string }
 */
const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false, select: false },
  clerkId: { type: String, sparse: true, index: true },
  role: { type: String, enum: ['CONSUMER', 'FARMER', 'ADMIN'], default: 'CONSUMER' },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
}, { timestamps: true });

// Note: email index is created automatically by unique:true on the field
UserSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
