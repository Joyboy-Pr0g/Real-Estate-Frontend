export type AnnouncementStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export type AnnouncementAudience = 'all_active' | 'buyers' | 'offices';

export interface AnnouncementAudienceSnapshot {
  buyer: number;
  office: number;
  total: number;
}

export interface AnnouncementPlatformSnapshot {
  web: number;
  android: number;
  ios: number;
  other: number;
}

export interface AnnouncementErrorSample {
  code: string;
  message: string;
  count: number;
}

export interface CreateAnnouncementInput {
  title: string;
  body_html: string;
  audience: AnnouncementAudience;
  scheduled_at?: string | null;
}

export interface AnnouncementListItem {
  id: string;
  title: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  created_by_admin_id: string;
  created_by_admin_name: string;
  scheduled_at: string | null;
  sent_at: string | null;
  target_user_count: number;
  in_app_created_count: number;
  push_success_count: number;
  read_count: number;
  read_rate: number;
  created_at: string;
}

export interface AnnouncementDetail extends AnnouncementListItem {
  body_html: string;
  body_plain: string;
  push_preview: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  push_attempted_count: number;
  push_failure_count: number;
  no_token_count: number;
  first_read_at: string | null;
  audience_snapshot: AnnouncementAudienceSnapshot | null;
  push_platform_snapshot: AnnouncementPlatformSnapshot | null;
  error_samples: AnnouncementErrorSample[];
  reads_over_time: { bucket: string; count: number }[];
  read_by_role: { role: string; read_count: number; total_count: number; read_rate: number }[];
  read_by_platform: { platform: string; read_count: number }[];
}

export interface AnnouncementPublic {
  id: string;
  title: string;
  body_html: string;
  sent_at: string | null;
  created_at: string;
}

export interface AnnouncementsPage {
  items: AnnouncementListItem[];
  next_cursor: string | null;
  has_more: boolean;
}
