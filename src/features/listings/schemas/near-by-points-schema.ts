import { z } from 'zod';
import { NEAR_BY_POINT_CATEGORIES } from '@/features/listings/types/near-by-points';

export const nearByPointsQuerySchema = z.object({
  category: z.enum(NEAR_BY_POINT_CATEGORIES).optional(),
  radius: z.coerce.number().int().min(500).max(50000).optional(),
});

export type NearByPointsQuery = z.infer<typeof nearByPointsQuerySchema>;
