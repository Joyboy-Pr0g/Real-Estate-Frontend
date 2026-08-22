'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import {
  AdminPropertySubtype,
  AdminPropertyType,
  AdminTransactionType,
  PropertySubtypePayload,
  PropertySubtypeUpdatePayload,
  PropertyTypePayload,
  PropertyTypeUpdatePayload,
  TransactionTypePayload,
  TransactionTypeUpdatePayload,
} from '@/features/admin/types/catalog';

export async function createPropertyType(payload: PropertyTypePayload): Promise<AdminPropertyType> {
  const res = await clientFetch<AdminPropertyType>(bffPaths.admin.propertyTypes, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data!;
}

export async function updatePropertyType(id: string, payload: PropertyTypeUpdatePayload): Promise<void> {
  await clientFetch(bffPaths.admin.propertyTypeById(id), { method: 'PUT', body: { ...payload } });
}

export async function activatePropertyType(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.activatePropertyType(id), { method: 'PATCH' });
}

export async function deactivatePropertyType(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.deactivatePropertyType(id), { method: 'PATCH' });
}

export async function deletePropertyType(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.propertyTypeById(id), { method: 'DELETE' });
}

export async function createPropertySubtype(payload: PropertySubtypePayload): Promise<AdminPropertySubtype> {
  const res = await clientFetch<AdminPropertySubtype>(bffPaths.admin.propertySubtypes, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data!;
}

export async function updatePropertySubtype(
  id: string,
  payload: PropertySubtypeUpdatePayload,
): Promise<void> {
  await clientFetch(bffPaths.admin.propertySubtypeById(id), { method: 'PUT', body: { ...payload } });
}

export async function deletePropertySubtype(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.propertySubtypeById(id), { method: 'DELETE' });
}

export async function createTransactionType(payload: TransactionTypePayload): Promise<AdminTransactionType> {
  const res = await clientFetch<AdminTransactionType>(bffPaths.admin.transactionTypes, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data!;
}

export async function updateTransactionType(
  id: string,
  payload: TransactionTypeUpdatePayload,
): Promise<void> {
  await clientFetch(bffPaths.admin.transactionTypeById(id), { method: 'PUT', body: { ...payload } });
}

export async function deleteTransactionType(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.transactionTypeById(id), { method: 'DELETE' });
}
