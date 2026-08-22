import type { PropertySpecSchema } from '@/features/catalog/types/property-subtype';

export type PropertyTypeStatus = 'active' | 'inactive';

export type TransactionTypeName = 'for_sale' | 'for_rent' | 'with_assets' | 'lease_takeover';

export const TRANSACTION_TYPE_NAMES: TransactionTypeName[] = [
  'for_sale',
  'for_rent',
  'with_assets',
  'lease_takeover',
];

export interface AdminPropertyType {
  id: string;
  name: string;
  slug: string;
  status: PropertyTypeStatus;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminPropertySubtype {
  id: string;
  name: string;
  slug: string;
  property_type_id: string;
  icon: string;
  spec_schema_version: number;
  spec_schema: PropertySpecSchema;
  created_at: string;
  updated_at: string;
}

export interface AdminTransactionType {
  id: string;
  name: TransactionTypeName;
  slug: string;
  display_name_ar: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyTypePayload {
  name: string;
  icon: string;
}

export type PropertyTypeUpdatePayload = Partial<PropertyTypePayload>;

export interface PropertySubtypePayload {
  name: string;
  property_type_id: string;
  icon: string;
  spec_schema?: PropertySpecSchema;
}

export type PropertySubtypeUpdatePayload = Partial<PropertySubtypePayload>;

export interface TransactionTypePayload {
  name: TransactionTypeName;
  display_name_ar: string;
  icon: string;
}

export type TransactionTypeUpdatePayload = Partial<TransactionTypePayload>;

export interface PropertyTypesSearchParams {
  status?: PropertyTypeStatus;
  search?: string;
}

export interface PropertySubtypesSearchParams {
  search?: string;
  property_type_id?: string;
}

export interface TransactionTypesSearchParams {
  search?: string;
}
