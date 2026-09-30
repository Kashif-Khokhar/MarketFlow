import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().optional(),
  storeId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(3).max(1000),
  images: z.array(z.string().url()).optional()
}).refine(data => data.productId || data.storeId, {
  message: "Must provide either productId or storeId",
  path: ["productId"]
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
