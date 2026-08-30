export interface AdminCityPhoto {
  url: string;
  public_id: string;
}

export interface AdminCity {
  id: string;
  name: string;
  governorate: string;
  pcode: string;
  city_photo: AdminCityPhoto;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface AdminNeighborhoodCity {
  id: string;
  name: string;
  pcode: string;
}

export interface AdminNeighborhood {
  id: string;
  city_id: string;
  name: string;
  neighb_pcode: string;
  latitude: number | null;
  longitude: number | null;
  population: number;
  total_idps: number;
  avg_age: number | null;
  avg_female: number | null;
  avg_male: number | null;
  created_at: string;
  updated_at: string;
  city?: AdminNeighborhoodCity;
}

export interface CityFormFields {
  name: string;
  governorate: string;
  pcode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface NeighborhoodPayload {
  city_id: string;
  name: string;
  neighb_pcode: string;
  latitude: number | null;
  longitude: number | null;
  population: number;
  total_idps: number;
  avg_age: number | null;
  avg_female: number | null;
  avg_male: number | null;
}

export type NeighborhoodUpdatePayload = Partial<NeighborhoodPayload>;

export interface CitiesSearchParams {
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface NeighborhoodsSearchParams {
  search?: string;
  city_id?: string;
  cursor?: string;
  limit?: number;
}

export interface AdminLocationsPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface PublicCityOption {
  id: string;
  name: string;
  governorate: string;
  pcode: string;
  city_photo_url: string;
  latitude: number | null;
  longitude: number | null;
}
