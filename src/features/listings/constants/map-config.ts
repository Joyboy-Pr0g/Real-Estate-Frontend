export const YEMEN_MAP_BOUNDS = {
  north: 19.0,
  south: 11.5,
  east: 55.0,
  west: 41.5,
} as const;

export const YEMEN_MAP_CENTER = { lat: 15.35, lng: 44.21 } as const;

export const MAP_ZOOM = {
  country: 6,
  city: 9,
  neighborhood: 12,
  listing: 14,
} as const;

export const MAP_LISTINGS_PAGE_SIZE = 100;

export const CITY_BOUNDARY_RADIUS_KM = 38;
export const NEIGHBORHOOD_BOUNDARY_RADIUS_KM = 5;
