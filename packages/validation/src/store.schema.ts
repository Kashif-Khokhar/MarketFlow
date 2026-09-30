import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(3, 'Store name must be at least 3 characters'),
  description: z.string().max(1000).optional(),
  logoUrl: z.string().url().optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export const updateStoreSchema = createStoreSchema.partial();
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
