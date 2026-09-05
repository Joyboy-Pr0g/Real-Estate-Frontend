'use client';

import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import type {
  AnnouncementDetail,
  AnnouncementListItem,
  AnnouncementsPage,
  CreateAnnouncementInput,
} from '@/features/admin/types/admin-announcement';

function unwrapList<T>(response: { data?: T[]; next_cursor?: string | null; has_more?: boolean }): AnnouncementsPage {
  return {
    items: (response.data ?? []) as AnnouncementListItem[],
    next_cursor: response.next_cursor ?? null,
    has_more: response.has_more ?? false,
  };
}

export async function fetchAdminAnnouncements(params: Record<string, string> = {}): Promise<AnnouncementsPage> {
  const response = await clientFetch<AnnouncementListItem[]>(bffPaths.announcements.admin.list, {
    searchParams: params,
  });
  return unwrapList(response);
}

export async function fetchAdminAnnouncement(id: string): Promise<AnnouncementDetail> {
  const response = await clientFetch<AnnouncementDetail>(bffPaths.announcements.admin.byId(id));
  return response.data!;
}

export async function estimateAnnouncementAudience(audience: string): Promise<number> {
  const response = await clientFetch<{ count: number }>(bffPaths.announcements.admin.estimateAudience, {
    searchParams: { audience },
  });
  return response.data?.count ?? 0;
}

export async function saveAnnouncementDraft(input: CreateAnnouncementInput): Promise<{ id: string }> {
  const response = await clientFetch<{ id: string }>(bffPaths.announcements.admin.draft, {
    method: 'POST',
    body: { ...input },
  });
  return response.data!;
}

export async function sendAnnouncementNow(input: CreateAnnouncementInput): Promise<{ id: string }> {
  const response = await clientFetch<{ id: string }>(bffPaths.announcements.admin.send, {
    method: 'POST',
    body: { ...input },
  });
  return response.data!;
}
