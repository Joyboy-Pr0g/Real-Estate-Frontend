import { getAuthToken } from '@/lib/auth/session';
import { serverFetch } from '@/lib/api/server';
import { backendPaths } from '@/lib/api/endpoints';
import type { ContactRow, ContactsPage } from '@/features/contact/types/contact';

function unwrapList(response: {
  data?: ContactRow[];
  next_cursor?: string | null;
  has_more?: boolean;
}): ContactsPage {
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function getAdminContacts(params: Record<string, string> = {}): Promise<ContactsPage> {
  const token = await getAuthToken();
  const response = await serverFetch<ContactRow[]>(backendPaths.contacts.admin.list, {
    token,
    searchParams: params,
  });
  return unwrapList(response);
}

export async function getAdminContact(contactId: string): Promise<ContactRow | null> {
  const token = await getAuthToken();
  const response = await serverFetch<ContactRow>(backendPaths.contacts.admin.byId(contactId), { token });
  return response.data ?? null;
}
