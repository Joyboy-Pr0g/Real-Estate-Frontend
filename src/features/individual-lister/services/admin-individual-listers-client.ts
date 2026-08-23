'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { SearchableSelectOption } from '@/components/ui/searchable-select';
import {
  AdminIndividualListersPage,
  IndividualListerProfile,
} from '@/features/individual-lister/types/individual-lister';

export async function loadMoreAdminIndividualListers(
  params: Record<string, string>,
): Promise<AdminIndividualListersPage> {
  const response = await clientFetch<IndividualListerProfile[]>(bffPaths.admin.individualListers, {
    searchParams: params,
  });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}

export async function searchIndividualListersForSelect(query: string): Promise<SearchableSelectOption[]> {
  const params: Record<string, string> = { limit: '10' };
  if (query.trim()) params.search = query.trim();

  const response = await clientFetch<IndividualListerProfile[]>(bffPaths.admin.individualListers, {
    searchParams: params,
  });
  return (response.data ?? []).map((lister) => ({
    id: lister.id,
    label: lister.user ? `${lister.user.f_name} ${lister.user.l_name}` : lister.id,
    sublabel: lister.user?.phone_number,
  }));
}

export async function verifyIndividualLister(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.individualListerVerify(id), { method: 'PATCH' });
}

export async function rejectIndividualLister(id: string, reason: string): Promise<void> {
  await clientFetch(bffPaths.admin.individualListerReject(id), { method: 'PATCH', body: { reason } });
}

export async function suspendIndividualLister(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.individualListerSuspend(id), { method: 'PATCH' });
}

export async function unsuspendIndividualLister(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.individualListerUnsuspend(id), { method: 'PATCH' });
}

export async function softDeleteIndividualLister(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.individualListerSoftDelete(id), { method: 'PATCH' });
}

export async function restoreIndividualLister(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.individualListerRestore(id), { method: 'PATCH' });
}

export async function hardDeleteIndividualLister(id: string): Promise<void> {
  await clientFetch(bffPaths.admin.individualListerById(id), { method: 'DELETE' });
}
