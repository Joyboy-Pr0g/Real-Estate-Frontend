import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import { getAuthToken } from '@/lib/auth/session';
import {
  AdminPropertySubtype,
  AdminPropertyType,
  AdminTransactionType,
  PropertySubtypesSearchParams,
  PropertyTypesSearchParams,
  TransactionTypesSearchParams,
} from '@/features/admin/types/catalog';

async function adminFetch<T>(path: string, searchParams?: Record<string, string | undefined>): Promise<T[]> {
  const token = await getAuthToken();
  if (!token) return [];

  const response = await serverFetch<T[]>(path, {
    token,
    cacheProfile: 'none',
    searchParams,
  });

  return response.data ?? [];
}

export async function getAdminPropertyTypes(
  params: PropertyTypesSearchParams = {},
): Promise<AdminPropertyType[]> {
  return adminFetch<AdminPropertyType>(backendPaths.propertyTypes.admin, {
    status: params.status,
    search: params.search,
  });
}

export async function getAdminPropertySubtypes(
  params: PropertySubtypesSearchParams = {},
): Promise<AdminPropertySubtype[]> {
  return adminFetch<AdminPropertySubtype>(backendPaths.propertySubtypes.admin, {
    search: params.search,
    property_type_id: params.property_type_id,
  });
}

export async function getAdminTransactionTypes(
  params: TransactionTypesSearchParams = {},
): Promise<AdminTransactionType[]> {
  return adminFetch<AdminTransactionType>(backendPaths.transactionTypes.admin, {
    search: params.search,
  });
}
