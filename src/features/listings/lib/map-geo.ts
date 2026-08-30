export type MapBoundaryKind = 'city' | 'neighborhood';

export interface MapBoundaryProperties {
  id: string;
  name: string;
  pcode: string;
  kind: MapBoundaryKind;
  cityPcode?: string;
}

interface GeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

interface GeoFeature {
  type: 'Feature';
  properties: MapBoundaryProperties;
  geometry: GeoPolygon;
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

const boundaryCache = new Map<string, GeoFeatureCollection>();

function cacheKey(kind: MapBoundaryKind, id: string): string {
  return `${kind}:${id}`;
}

/** Approximate circular boundary when polygon data is unavailable. */
export function createCirclePolygon(
  center: { lat: number; lng: number },
  radiusKm: number,
  points = 36,
): GeoPolygon {
  const coords: [number, number][] = [];
  const latRad = (center.lat * Math.PI) / 180;

  for (let i = 0; i <= points; i += 1) {
    const angle = (i / points) * 2 * Math.PI;
    const lat =
      center.lat + (radiusKm / 6371) * (180 / Math.PI) * Math.cos(angle);
    const lng =
      center.lng +
      ((radiusKm / 6371) * (180 / Math.PI) * Math.sin(angle)) / Math.cos(latRad);
    coords.push([lng, lat]);
  }

  return { type: 'Polygon', coordinates: [coords] };
}

export function buildBoundaryFeature(
  center: { lat: number; lng: number },
  radiusKm: number,
  properties: MapBoundaryProperties,
): GeoFeature {
  return {
    type: 'Feature',
    properties,
    geometry: createCirclePolygon(center, radiusKm),
  };
}

export function buildBoundaryCollection(
  items: Array<{
    center: { lat: number; lng: number };
    radiusKm: number;
    properties: MapBoundaryProperties;
  }>,
  cacheId: string,
): GeoFeatureCollection {
  const existing = boundaryCache.get(cacheId);
  if (existing) return existing;

  const collection: GeoFeatureCollection = {
    type: 'FeatureCollection',
    features: items.map((item) =>
      buildBoundaryFeature(item.center, item.radiusKm, item.properties),
    ),
  };

  boundaryCache.set(cacheId, collection);
  return collection;
}

export function parseListingCoordinate(value: string): number | null {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
