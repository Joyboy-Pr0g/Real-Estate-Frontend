export type SupportTicketStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export type SupportTicketMessageType = 'text' | 'image';

export interface TicketMessageMedia {
  url: string;
  public_id: string;
  mime_type: string;
  size_bytes?: number;
}

export interface TicketRequesterSummary {
  id: string;
  f_name: string;
  l_name: string;
  email: string;
  user_image_url: string | null;
}

export interface SupportTicketInboxRow {
  id: string;
  subject: string;
  status: SupportTicketStatus;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  requester?: TicketRequesterSummary;
}

export interface SupportTicketDetail extends SupportTicketInboxRow {
  user_id: string;
  updated_at: string;
}

export interface SupportTicketMessageItem {
  id: string;
  sender_id: string;
  message_type: SupportTicketMessageType;
  content: string | null;
  media: TicketMessageMedia | null;
  created_at: string;
  sender?: TicketRequesterSummary;
  is_admin?: boolean;
}

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export type SupportTicketsPage = CursorPage<SupportTicketInboxRow>;

export interface CanCreateTicketResult {
  allowed: boolean;
  reason?: 'not_eligible' | 'open_ticket_exists';
}
