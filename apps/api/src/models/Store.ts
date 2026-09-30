import mongoose, { Document, Schema } from 'mongoose';

export enum StoreStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface IStore extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  logoUrl?: string;
  status: StoreStatus;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, maxlength: 1000 },
    logoUrl: { type: String },
    status: { type: String, enum: Object.values(StoreStatus), default: StoreStatus.PENDING },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Store = mongoose.models.Store || mongoose.model<IStore>('Store', storeSchema);
