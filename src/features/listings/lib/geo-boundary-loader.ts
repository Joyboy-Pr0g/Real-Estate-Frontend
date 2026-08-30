import {
  CITY_PCODE_TO_NAME,
  pcodeFromShapeIso,
} from '@/features/listings/lib/city-iso-to-pcode';
import type { MapBoundaryKind } from '@/features/listings/lib/map-geo';

export interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}

export interface GeoJsonFeature {
  type: 'Feature';
  id?: string;
  properties: Record<string, unknown>;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: unknown;
  };
}

export interface RegionFeatureProperties {
  kind: MapBoundaryKind | 'country' | 'district';
  pcode?: string;
  name?: string;
  shapeId?: string;
  cityPcode?: string;
}

const geoCache = new Map<string, GeoFeatureCollection>();

export const GEO_PATHS = {
  cities: '/geo/yemen-cities.geojson',
  cityDistricts: (cityPcode: string) => `/geo/cities/${cityPcode}.geojson`,
} as const;

export async function fetchGeoJson(url: string): Promise<GeoFeatureCollection> {
  const cached = geoCache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load geo JSON: ${url}`);
  }

  const data = (await response.json()) as GeoFeatureCollection;
  geoCache.set(url, data);
  return data;
}

export function getFeatureBounds(
  geometry: GeoJsonFeature['geometry'],
): google.maps.LatLngBounds | null {
  const bounds = new google.maps.LatLngBounds();
  let hasPoint = false;

  const extendRing = (ring: [number, number][]) => {
    for (const [lng, lat] of ring) {
      bounds.extend({ lat, lng });
      hasPoint = true;
    }
  };

  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates as [number, number][][];
    extendRing(coords[0]);
  } else if (geometry.type === 'MultiPolygon') {
    const coords = geometry.coordinates as [number, number][][][];
    for (const poly of coords) {
      extendRing(poly[0]);
    }
  }

  return hasPoint ? bounds : null;
}

export function enrichLegacyCityFeature(feature: GeoJsonFeature): GeoJsonFeature | null {
  const props = feature.properties;
  if (props.kind === 'city' && props.pcode) return feature;

  const pcode = pcodeFromShapeIso(String(props.shapeISO ?? ''));
  if (!pcode) return null;

  return {
    ...feature,
    id: pcode,
    properties: {
      kind: 'city',
      pcode,
      name: CITY_PCODE_TO_NAME[pcode] ?? props.shapeName,
      shapeName: props.shapeName,
    },
  };
}

export function pointInGeoFeature(
  point: google.maps.LatLngLiteral,
  feature: GeoJsonFeature,
): boolean {
  const geometry = feature.geometry;
  if (!google.maps.geometry?.poly) return false;

  const latLng = new google.maps.LatLng(point.lat, point.lng);

  if (geometry.type === 'Polygon') {
    const paths = (geometry.coordinates as [number, number][][]).map((ring) =>
      ring.map(([lng, lat]) => ({ lat, lng })),
    );
    return google.maps.geometry.poly.containsLocation(
      latLng,
      new google.maps.Polygon({ paths: paths[0] }),
    );
  }

  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as [number, number][][][]).some((poly) => {
      const paths = poly.map((ring) => ring.map(([lng, lat]) => ({ lat, lng })));
      return google.maps.geometry.poly.containsLocation(
        latLng,
        new google.maps.Polygon({ paths: paths[0] }),
      );
    });
  }

  return false;
}
