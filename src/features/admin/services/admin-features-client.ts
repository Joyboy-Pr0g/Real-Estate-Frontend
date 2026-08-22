'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import {
  AdminMainFeature,
  AdminSubFeature,
  MainFeaturePayload,
  MainFeatureUpdatePayload,
  SubFeaturePayload,
  SubFeatureUpdatePayload,
} from '@/features/admin/types/features';

export async function createMainFeature(payload: MainFeaturePayload): Promise<AdminMainFeature> {
  const res = await clientFetch<AdminMainFeature>(bffPaths.admin.features, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data!;
}

export async function updateMainFeature(id: string, payload: MainFeatureUpdatePayload): Promise<void> {
  await clientFetch(bffPaths.admin.featureById(id), { method: 'PUT', body: { ...payload } });
}

export async function deleteMainFeature(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.featureById(id), { method: 'DELETE' });
}

export async function createSubFeature(payload: SubFeaturePayload): Promise<AdminSubFeature> {
  const res = await clientFetch<AdminSubFeature>(bffPaths.admin.subFeatures, {
    method: 'POST',
    body: { ...payload },
  });
  return res.data!;
}

export async function updateSubFeature(id: string, payload: SubFeatureUpdatePayload): Promise<void> {
  await clientFetch(bffPaths.admin.subFeatureById(id), { method: 'PUT', body: { ...payload } });
}

export async function deleteSubFeature(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.subFeatureById(id), { method: 'DELETE' });
}

export async function bulkDeleteSubFeatures(ids: string[]): Promise<void> {
  await clientFetch(bffPaths.admin.subFeaturesBulkDelete, {
    method: 'DELETE',
    body: { ids },
  });
}
