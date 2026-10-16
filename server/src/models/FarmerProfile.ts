import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFarmerProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  farmName: string;
  bio: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: { lat: number; lng: number };
  };
  coverImage?: string;
  certifications: string[];
  farmingPractices: string[];
  rating: number;
  totalReviews: number;
  yearsInFarming: number;
  isVerified: boolean;
  website?: string;
  socialMedia?: { instagram?: string; facebook?: string };
  createdAt: Date;
  updatedAt: Date;
}

const FarmerProfileSchema = new Schema<IFarmerProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  farmName: { type: String, required: true, trim: true },
  bio: { type: String, default: '', maxlength: 1000 },
  location: {
    address: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  coverImage: { type: String },
  certifications: [{ type: String }],
  farmingPractices: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  yearsInFarming: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  website: { type: String },
  socialMedia: {
    instagram: { type: String },
    facebook: { type: String },
  },
}, { timestamps: true });

FarmerProfileSchema.index({ userId: 1 });
FarmerProfileSchema.index({ 'location.city': 1 });
FarmerProfileSchema.index({ rating: -1 });

export const FarmerProfile = mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema);
