import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  price: number;
  stock: number;
  reservedStock: number;
  attributes: Map<string, string>; // e.g., {"Color": "Black", "Size": "M"}
  images?: string[];
  isActive: boolean;
}

const productVariantSchema = new Schema<IProductVariant>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    attributes: { type: Map, of: String, required: true },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// We need to efficiently find variants for a product
productVariantSchema.index({ product: 1 });

export const ProductVariant = mongoose.models.ProductVariant || mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);
