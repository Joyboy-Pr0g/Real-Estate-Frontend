export interface AdminLatestAction {
  entity_id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  entity_type: string;
  changes_json: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminActionLogEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes_json: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

export interface OfficeActionLogEntry {
  id: string;
  office_id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes_json: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

export interface AdminOfficeActionLogEntry extends OfficeActionLogEntry {
  office_name: string;
}

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface ListingActionLogsBundle {
  admin_logs: CursorPage<AdminActionLogEntry>;
  office_logs: CursorPage<OfficeActionLogEntry>;
}
