export type NotificationType =
  | 'office_verified'
  | 'office_rejected'
  | 'office_suspended'
  | 'office_unsuspended'
  | 'individual_lister_verified'
  | 'individual_lister_rejected'
  | 'individual_lister_suspended'
  | 'individual_lister_unsuspended'
  | 'staff_new_office_application'
  | 'staff_office_resubmitted'
  | 'staff_new_individual_lister_application'
  | 'staff_individual_lister_resubmitted'
  | 'staff_new_listing_report'
  | 'staff_new_conversation_report'
  | 'staff_new_support_ticket'
  | 'new_message'
  | 'user_activated'
  | 'user_deactivated';

export interface AppNotification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  link_path: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationUnreadCount {
  count: number;
}

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}
