import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import {
  AdminLatestAction,
  AdminOfficeActionLogEntry,
  CursorPage,
} from '@/features/admin/types/action-logs';

export async function getAdminLatestActions(
  entityType: string,
  entityIds: string[],
): Promise<Record<string, AdminLatestAction>> {
  if (entityIds.length === 0) return {};

  const res = await clientFetch<AdminLatestAction[]>(bffPaths.admin.actionLogsLatest, {
    searchParams: {
      entity_type: entityType,
      ids: entityIds.join(','),
    },
  });

  const map: Record<string, AdminLatestAction> = {};
  for (const row of res.data ?? []) {
    map[row.entity_id] = row;
  }
  return map;
}

export async function getAdminOfficeActionLogs(params: {
  office_id?: string;
  cursor?: string;
  limit?: number;
}): Promise<CursorPage<AdminOfficeActionLogEntry>> {
  const res = await clientFetch<AdminOfficeActionLogEntry[]>(bffPaths.admin.officeActionLogs, {
    searchParams: {
      office_id: params.office_id,
      cursor: params.cursor,
      limit: params.limit,
    },
  });

  return {
    items: res.data ?? [],
    next_cursor: res.next_cursor ?? null,
    has_more: Boolean(res.has_more),
  };
}

export async function bulkDeleteOfficeActionLogs(ids: string[]): Promise<number> {
  const res = await clientFetch<{ deleted: number }>(bffPaths.admin.officeActionLogsBulk, {
    method: 'DELETE',
    body: { ids },
  });
  return res.data?.deleted ?? 0;
}
