import { z } from 'zod';

export const citiesSearchSchema = z.object({
  search: z.string().trim().max(100).optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const neighborhoodBodySchema = z.object({
  city_id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  neighb_pcode: z.string().trim().min(2).max(10),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  population: z.coerce.number().int().min(0),
  total_idps: z.coerce.number().int().min(0),
  avg_age: z.coerce.number().int().min(0).max(150).nullable().optional(),
  avg_female: z.coerce.number().int().min(0).nullable().optional(),
  avg_male: z.coerce.number().int().min(0).nullable().optional(),
});

export const neighborhoodUpdateBodySchema = neighborhoodBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export const neighborhoodsSearchSchema = z.object({
  search: z.string().trim().max(100).optional(),
  city_id: z.string().uuid().optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
