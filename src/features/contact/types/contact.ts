export interface ContactRow {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  has_replied: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmitContactInput {
  full_name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ReplyContactInput {
  reply_message: string;
}

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export type ContactsPage = CursorPage<ContactRow>;
