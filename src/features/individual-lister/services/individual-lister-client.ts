'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';

export async function applyAsIndividualLister(idPhoto: File): Promise<void> {
  const formData = new FormData();
  formData.append('id_photo', idPhoto);
  await clientFetch(bffPaths.individualListers.create, { method: 'POST', body: formData });
}
