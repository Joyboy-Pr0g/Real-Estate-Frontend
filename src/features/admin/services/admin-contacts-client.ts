'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type { ContactRow, ContactsPage, ReplyContactInput } from '@/features/contact/types/contact';

export async function fetchAdminContacts(params: Record<string, string> = {}): Promise<ContactsPage> {
  const response = await clientFetch<ContactRow[]>(bffPaths.contacts.admin.list, {
    searchParams: params,
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function fetchAdminContact(contactId: string) {
  return clientFetch<ContactRow>(bffPaths.contacts.admin.byId(contactId));
}

export async function replyToContact(contactId: string, body: ReplyContactInput) {
  return clientFetch<ContactRow>(bffPaths.contacts.admin.reply(contactId), {
    method: 'POST',
    body: { ...body },
  });
}
