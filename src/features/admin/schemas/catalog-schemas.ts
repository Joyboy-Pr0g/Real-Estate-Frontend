import { z } from 'zod';
import { TRANSACTION_TYPE_NAMES } from '@/features/admin/types/catalog';

export const propertyTypesSearchSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().trim().max(100).optional(),
});

export const propertyTypeBodySchema = z.object({
  name: z.string().trim().min(2).max(20).optional(),
  icon: z.string().trim().min(2).max(20).optional(),
});

export const propertyTypeUpdateBodySchema = propertyTypeBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export const propertySubtypesSearchSchema = z.object({
  search: z.string().trim().max(100).optional(),
  property_type_id: z.string().uuid().optional(),
});

const propertySpecOptionSchema = z.object({
  value: z.string().trim().min(1),
  label: z.string().trim().min(1).max(100),
});

const propertySpecFieldSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'enum']),
  label: z.string().trim().min(1).max(100),
  required: z.boolean(),
  filterable: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(propertySpecOptionSchema).optional(),
});

const propertySpecSchemaSchema = z.object({
  fields: z.record(z.string(), propertySpecFieldSchema),
});

export const propertySubtypeBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  property_type_id: z.string().uuid(),
  icon: z.string().trim().min(2).max(50),
  spec_schema: propertySpecSchemaSchema.optional(),
});

export const propertySubtypeUpdateBodySchema = propertySubtypeBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export const transactionTypesSearchSchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export const transactionTypeBodySchema = z.object({
  name: z.enum(TRANSACTION_TYPE_NAMES),
  display_name_ar: z.string().trim().min(2).max(100),
  icon: z.string().trim().min(2).max(50),
});

export const transactionTypeUpdateBodySchema = transactionTypeBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);
