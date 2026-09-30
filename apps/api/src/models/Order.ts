import mongoose, { Document, Schema } from 'mongoose';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURN_APPROVED = 'RETURN_APPROVED',
  RETURN_REJECTED = 'RETURN_REJECTED',
  REFUNDING = 'REFUNDING',
  REFUNDED = 'REFUNDED',
}

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  price: number; // Price at the time of order
  quantity: number;
}

export interface IOrder extends Document {
  checkoutGroupId: string; // To link multiple store orders from a single checkout
  customer: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  appliedCoupon?: mongoose.Types.ObjectId;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentIntentId?: string; // For Stripe integration later
  trackingNumber?: string;
  returnReason?: string;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new Schema<IOrder>(
  {
    checkoutGroupId: { type: String, required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    store: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    appliedCoupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    paymentIntentId: { type: String },
    trackingNumber: { type: String },
    returnReason: { type: String },
    refundAmount: { type: Number },
  },
  { timestamps: true }
);

// Optimize queries for finding orders by customer, store, and status
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ store: 1, status: 1 });

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
