export type ListingMessageType = 'text' | 'image' | 'voice';

export type ConversationReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface MessageMedia {
  url: string;
  public_id: string;
  mime_type: string;
  size_bytes?: number;
  duration_seconds?: number;
}

export interface ParticipantSummary {
  id: string;
  f_name: string;
  l_name: string;
  user_image_url: string | null;
}

export interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  main_image_url: string | null;
}

export interface BlockState {
  blocked_by_me: boolean;
  blocked_me: boolean;
}

export interface ConversationInboxRow {
  id: string;
  listing: ListingSummary;
  other_participant: ParticipantSummary;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  block_state: BlockState;
}

export interface ConversationDetail extends ConversationInboxRow {
  buyer: ParticipantSummary;
  seller_side: 'office' | 'individual_lister';
}

export interface MessageItem {
  id: string;
  sender_id: string;
  message_type: ListingMessageType;
  content: string | null;
  media: MessageMedia | null;
  created_at: string;
  deleted: boolean;
  placeholder?: string;
}

export interface AdminConversationInboxRow extends ConversationInboxRow {
  buyer: ParticipantSummary;
  seller: ParticipantSummary;
  office?: ParticipantSummary | null;
  seller_users?: ParticipantSummary[];
  seller_side: 'office' | 'individual_lister';
  has_block: boolean;
}

export type AdminConversationDetail = AdminConversationInboxRow;

export interface MessageAdminItem extends MessageItem {
  deleted_at: string | null;
  deleted_by_id: string | null;
  original_content: string | null;
  original_media: MessageMedia | null;
  sender?: ParticipantSummary;
}

export interface BlockAuditRow {
  id: string;
  blocker: ParticipantSummary;
  blocked: ParticipantSummary;
  created_at: string;
}

export interface ConversationReportItem {
  id: string;
  conversation_id: string;
  reason: string;
  description: string | null;
  status: ConversationReportStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reporter: ParticipantSummary;
  listing: ListingSummary;
}

export interface SocketNotificationPayload {
  conversationId: string;
  listingTitle: string;
  listingSlug: string;
  preview: string;
  senderName: string;
}

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}
