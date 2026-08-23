'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { OfficeUserRole } from '@/features/office/types/office';

export async function applyAsOffice(formData: FormData): Promise<void> {
  await clientFetch(bffPaths.offices.create, { method: 'POST', body: formData });
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
