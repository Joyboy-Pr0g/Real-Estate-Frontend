import { z } from 'zod';
import { ListingSpecFilters } from '@/features/listings/types/spec-filters';

export const listingSearchQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  sort: z
    .enum(['created_at', 'most_saved', 'most_viewed', 'description_length'])
    .optional(),
  cursor: z.string().optional(),
  city_id: z.string().uuid().optional(),
  neighborhood_id: z.string().uuid().optional(),
  property_type_id: z.string().uuid().optional(),
  property_subtype_id: z.string().uuid().optional(),
  transaction_type_id: z.string().uuid().optional(),
  min_price: z.string().optional(),
  max_price: z.string().optional(),
  spec: z.custom<ListingSpecFilters>().optional(),
});

export type ListingSearchQuery = z.infer<typeof listingSearchQuerySchema>;
