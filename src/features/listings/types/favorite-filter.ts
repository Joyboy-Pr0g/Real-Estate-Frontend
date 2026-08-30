export interface FavoriteFilterItem {
  id: string;
  name: string;
  filters: Record<string, string>;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFavoriteFilterPayload {
  name: string;
  filters: Record<string, string>;
  email_notifications?: boolean;
}

export interface FavoriteFiltersPage {
  items: FavoriteFilterItem[];
  next_cursor: string | null;
  has_more: boolean;
}
