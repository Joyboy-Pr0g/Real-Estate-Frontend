import { z } from 'zod';

export const subFeaturesSearchSchema = z.object({
  main_feature_id: z.string().uuid().optional(),
});

export const mainFeatureBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  icon: z.string().trim().min(1).max(100),
  order: z.number().int().min(1),
});

export const mainFeatureUpdateBodySchema = mainFeatureBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export const subFeatureBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  icon: z.string().trim().min(1).max(100),
  order: z.number().int().min(1),
  main_feature_id: z.string().uuid(),
});

export const subFeatureUpdateBodySchema = subFeatureBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export const subFeatureBulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});
