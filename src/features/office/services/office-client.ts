'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { OfficeUserRole, MyOffice } from '@/features/office/types/office';
import { SearchableSelectOption } from '@/components/ui/searchable-select';

export async function applyAsOffice(formData: FormData): Promise<void> {
  await clientFetch(bffPaths.offices.create, { method: 'POST', body: formData });
}

export async function resubmitOffice(id: string, formData: FormData): Promise<void> {
  await clientFetch(bffPaths.offices.resubmit(id), { method: 'PATCH', body: formData });
}

export async function softDeleteOffice(id: string): Promise<void> {
  await clientFetch(bffPaths.offices.softDelete(id), { method: 'PATCH' });
}

export async function restoreOffice(id: string): Promise<void> {
  await clientFetch(bffPaths.offices.restore(id), { method: 'PATCH' });
}

export async function hardDeleteOffice(id: string): Promise<void> {
  await clientFetch(bffPaths.offices.delete(id), { method: 'DELETE' });
}

export interface MyDeletedOfficesPage {
  items: MyOffice[];
  next_cursor: string | null;
  has_more: boolean;
}

export async function fetchMyDeletedOffices(params: Record<string, string> = {}): Promise<MyDeletedOfficesPage> {
  const response = await clientFetch<MyOffice[]>(bffPaths.offices.myDeleted, { searchParams: params });
  return {
    items: response.data ?? [],
    next_cursor: response.next_cursor ?? null,
    has_more: Boolean(response.has_more),
  };
}

export async function updateOffice(id: string, formData: FormData): Promise<void> {
  await clientFetch(bffPaths.offices.update(id), { method: 'PUT', body: formData });
}

export interface AddOfficeUserInput {
  f_name: string;
  l_name: string;
  email: string;
  phone_number: string;
  role: Exclude<OfficeUserRole, 'office_admin'>;
}

export async function addOfficeUser(officeId: string, dto: AddOfficeUserInput): Promise<void> {
  await clientFetch(bffPaths.offices.users(officeId), { method: 'POST', body: { ...dto } });
}

export async function removeOfficeUsers(officeId: string, userIds: string[]): Promise<void> {
  await clientFetch(bffPaths.offices.users(officeId), { method: 'DELETE', body: { userIds } });
}

export function createSearchMyOfficesForSelect(offices: MyOffice[]) {
  return async (query: string): Promise<SearchableSelectOption[]> => {
    const q = query.trim().toLowerCase();
    return offices
      .filter(
        (office) =>
          !q ||
          office.name.toLowerCase().includes(q) ||
          office.city.name.toLowerCase().includes(q) ||
          office.neighborhood.name.toLowerCase().includes(q),
      )
      .slice(0, 10)
      .map((office) => ({
        id: office.id,
        label: office.name,
        sublabel: `${office.city.name}, ${office.neighborhood.name}`,
      }));
  };
}
