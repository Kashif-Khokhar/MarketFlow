import mongoose, { Document, Schema } from 'mongoose';
import { Product } from './Product';
import { Store } from './Store';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product?: mongoose.Types.ObjectId;
  store?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    store: { type: Schema.Types.ObjectId, ref: 'Store' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 100 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A user can only leave one review per product or store
reviewSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { product: { $exists: true } } });
reviewSchema.index({ user: 1, store: 1 }, { unique: true, partialFilterExpression: { store: { $exists: true } } });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function (targetId: string, targetType: 'product' | 'store') {
  const matchObj = targetType === 'product' ? { product: targetId } : { store: targetId };
  
  const stats = await this.aggregate([
    { $match: matchObj },
    {
      $group: {
        _id: targetType === 'product' ? '$product' : '$store',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    if (targetType === 'product') {
      await Product.findByIdAndUpdate(targetId, {
        rating: stats[0].avgRating,
        totalReviews: stats[0].nRating
      });
    } else {
      await Store.findByIdAndUpdate(targetId, {
        rating: stats[0].avgRating,
        totalReviews: stats[0].nRating
      });
    }
  } else {
    if (targetType === 'product') {
      await Product.findByIdAndUpdate(targetId, { rating: 0, totalReviews: 0 });
    } else {
      await Store.findByIdAndUpdate(targetId, { rating: 0, totalReviews: 0 });
    }
  }
};

// Call calcAverageRatings after saving a review
reviewSchema.post('save', function (this: any) {
  if (this.product) (this.constructor as any).calcAverageRatings(this.product, 'product');
  if (this.store) (this.constructor as any).calcAverageRatings(this.store, 'store');
});

// For update and delete, we need query middleware
reviewSchema.pre(/^findOneAnd/, async function (this: any, next) {
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function (this: any) {
  if (this.r) {
    if (this.r.product) await this.r.constructor.calcAverageRatings(this.r.product, 'product');
    if (this.r.store) await this.r.constructor.calcAverageRatings(this.r.store, 'store');
  }
});

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
