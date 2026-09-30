import { z } from 'zod';

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().min(0),
  minPurchaseAmount: z.number().min(0).default(0),
  maxDiscountAmount: z.number().min(0).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  usageLimit: z.number().int().min(1),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const applyCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
