import mongoose, { Document, Schema } from 'mongoose';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export interface IProduct extends Document {
  store: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  attributes: Map<string, string>;
  status: ProductStatus;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    attributes: { type: Map, of: String },
    status: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.DRAFT },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ store: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
