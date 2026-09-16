export const NEAR_BY_POINT_CATEGORIES = [
  'schools',
  'hospitals',
  'mosques',
  'shopping',
  'parks',
  'restaurants',
  'banks',
  'pharmacies',
  'gyms',
  'gas_stations',
] as const;

export type NearByPointCategory = (typeof NEAR_BY_POINT_CATEGORIES)[number];

export interface NearByPointItem {
  id: string;
  poi_name: string;
  poi_name_ar: string | null;
  poi_type: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating: number | null;
  address: string | null;
  photos: string | null;
}

export interface NearByPointsResult {
  listing: { id: string; latitude: string; longitude: string };
  radius_m: number;
  categories: Record<NearByPointCategory, { en: string; ar: string }>;
  nearby_pois: Partial<Record<NearByPointCategory, NearByPointItem[]>>;
  source: 'cache' | 'database' | 'api';
}
