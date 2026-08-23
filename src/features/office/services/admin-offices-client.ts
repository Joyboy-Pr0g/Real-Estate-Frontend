'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { SearchableSelectOption } from '@/components/ui/searchable-select';
import { AdminOfficesPage, OfficeDetail } from '@/features/office/types/office';

export async function loadMoreAdminOffices(
  params: Record<string, string>,
): Promise<AdminOfficesPage> {
  const response = await clientFetch<OfficeDetail[]>(bffPaths.admin.offices, { searchParams: params });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}

export async function searchOfficesForSelect(query: string): Promise<SearchableSelectOption[]> {
  const params: Record<string, string> = { limit: '10' };
  if (query.trim()) params.search = query.trim();

  const response = await clientFetch<OfficeDetail[]>(bffPaths.admin.offices, { searchParams: params });
  return (response.data ?? []).map((office) => ({
    id: office.id,
    label: office.name,
    sublabel: `${office.city.name}, ${office.neighborhood.name}`,
  }));
}

export async function verifyOffice(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.officeVerify(id), { method: 'PATCH' });
}

export async function rejectOffice(id: string, reason: string): Promise<void> {
  await clientFetch(bffPaths.admin.officeReject(id), { method: 'PATCH', body: { reason } });
}

export async function suspendOffice(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.officeSuspend(id), { method: 'PATCH' });
}

export async function unsuspendOffice(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.officeUnsuspend(id), { method: 'PATCH' });
}

export async function adminSoftDeleteOffice(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.officeSoftDelete(id), { method: 'PATCH' });
}

export async function restoreOffice(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.officeRestore(id), { method: 'PATCH' });
}

export async function hardDeleteOffice(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.officeById(id), { method: 'DELETE' });
}

export async function forceRemoveOfficeUsers(officeId: string, userIds: string[]): Promise<void> {
  await clientFetch(bffPaths.admin.officeUsers(officeId), { method: 'DELETE', body: { userIds } });
}
