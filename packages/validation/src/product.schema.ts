import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  parent: z.string().optional(), // ObjectId as string
  imageUrl: z.string().url().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createProductVariantSchema = z.object({
  sku: z.string().min(3),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  attributes: z.record(z.string()), // e.g., { "Color": "Red", "Size": "M" }
  images: z.array(z.string().url()).optional(),
});

export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>;

export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  basePrice: z.number().min(0, 'Base price cannot be negative'),
  category: z.string(), // ObjectId
  attributes: z.record(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  variants: z.array(createProductVariantSchema).min(1, 'At least one variant is required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.omit({ variants: true }).partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
