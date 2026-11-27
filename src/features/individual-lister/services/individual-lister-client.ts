'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type { IndividualListerProfile } from '@/features/individual-lister/types/individual-lister';

export async function applyAsIndividualLister(idPhoto: File): Promise<void> {
  const formData = new FormData();
  formData.append('id_photo', idPhoto);
  await clientFetch(bffPaths.individualListers.create, { method: 'POST', body: formData });
}

export async function fetchMyIndividualListerProfile(): Promise<IndividualListerProfile | null> {
  try {
    const response = await clientFetch<IndividualListerProfile | null>(bffPaths.individualListers.my);
    return response.data ?? null;
  } catch {
    return null;
  }
}
