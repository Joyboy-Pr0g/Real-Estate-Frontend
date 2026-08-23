import { z } from 'zod';

export const adminOfficesSearchSchema = z.object({
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'suspended']).optional(),
  search: z.string().trim().max(100).optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  include_deleted: z.coerce.boolean().optional(),
});

export const officeRejectBodySchema = z.object({
  reason: z.string().trim().min(2).max(255),
});

export const adminIndividualListersSearchSchema = z.object({
  verificationStatus: z.enum(['pending', 'verified', 'rejected', 'suspended']).optional(),
  search: z.string().trim().max(100).optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  include_deleted: z.coerce.boolean().optional(),
});

export const individualListerRejectBodySchema = z.object({
  reason: z.string().trim().min(2).max(255),
});

export const adminListingsSearchSchema = z.object({
  status: z.enum(['draft', 'published', 'sold', 'rented']).optional(),
  search: z.string().trim().max(100).optional(),
  property_type_id: z.string().uuid().optional(),
  property_subtype_id: z.string().uuid().optional(),
  transaction_type_id: z.string().uuid().optional(),
  city_id: z.string().uuid().optional(),
  neighborhood_id: z.string().uuid().optional(),
  office_id: z.string().uuid().optional(),
  individual_lister_id: z.string().uuid().optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  include_deleted: z.coerce.boolean().optional(),
});
