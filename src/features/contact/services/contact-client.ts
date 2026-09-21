'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type { ContactRow, SubmitContactInput } from '@/features/contact/types/contact';

export async function submitContact(body: SubmitContactInput) {
  return clientFetch<ContactRow>(bffPaths.contacts.submit, {
    method: 'POST',
    body: { ...body },
  });
}
