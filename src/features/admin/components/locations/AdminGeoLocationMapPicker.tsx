'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { X } from 'lucide-react';
import { env } from '@/env';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { PublicCityOption } from '@/features/admin/types/locations';
import { MAP_ZOOM, YEMEN_MAP_BOUNDS, YEMEN_MAP_CENTER } from '@/features/listings/constants/map-config';
import {
  enrichLegacyCityFeature,
  fetchGeoJson,
  GEO_PATHS,
  getFeatureBounds,
  pointInGeoFeature,
  type GeoJsonFeature,
} from '@/features/listings/lib/geo-boundary-loader';
import { buildCityFallbackCollection } from '@/features/listings/lib/map-neighborhood-fallback';
import {
  attachRegionClickCursor,
  attachRegionHoverListeners,
  removeMapListener,
  styleForRegion,
} from '@/features/listings/lib/map-region-layer';
import { useLocale } from '@/lib/i18n/locale-provider';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_LOADER_ID } from '@/lib/google-maps/loader-config';

export type AdminGeoMapPickerMode = 'city' | 'neighborhood';

interface AdminGeoLocationMapPickerProps {
  open: boolean;
  mode: AdminGeoMapPickerMode;
  /** When set (city form), click must fall inside this city pcode polygon. */
  matchCityPcode?: string;
  /** Required for neighborhood mode — districts GeoJSON is loaded for this pcode. */
  cityPcode?: string;
  fallbackCities?: PublicCityOption[];
  initial?: { lat: number; lng: number } | null;
  onClose: () => void;
  onConfirm: (latitude: number, longitude: number) => void;
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

function findFeatureAtPoint(
  point: google.maps.LatLngLiteral,
  features: GeoJsonFeature[],
): GeoJsonFeature | null {
  for (const feature of features) {
    if (pointInGeoFeature(point, feature)) return feature;
  }
  return null;
}

function resolveGeoFeatureFromDataClick(
  dataFeature: google.maps.Data.Feature,
  features: GeoJsonFeature[],
): GeoJsonFeature | null {
  const shapeId = dataFeature.getProperty('shapeId') as string | undefined;
  const pcode = dataFeature.getProperty('pcode') as string | undefined;
  const featureId = dataFeature.getProperty('id') as string | undefined;

  const matched = features.find((feature) => {
    const props = feature.properties;
    if (shapeId && String(props.shapeId ?? '') === String(shapeId)) return true;
    if (pcode && String(props.pcode ?? '') === String(pcode)) return true;
    if (featureId && String(feature.id ?? props.pcode ?? '') === String(featureId)) return true;
    return false;
  });
  return matched ?? null;
}

export function AdminGeoLocationMapPicker({
  open,
  mode,
  matchCityPcode,
  cityPcode,
  fallbackCities = [],
  initial,
  onClose,
  onConfirm,
}: AdminGeoLocationMapPickerProps) {
  const { t } = useLocale();
  const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const mapRef = useRef<google.maps.Map | null>(null);
  const featuresRef = useRef<GeoJsonFeature[]>([]);
  const cleanupRef = useRef<Array<() => void>>([]);
  const [draft, setDraft] = useState<{ lat: number; lng: number } | null>(initial ?? null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [layerReady, setLayerReady] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey ?? '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!open) return;
    setDraft(initial ?? null);
    setLayerReady(false);
  }, [open, initial]);

  const clearLayer = useCallback((map: google.maps.Map) => {
    for (const cleanup of cleanupRef.current) cleanup();
    cleanupRef.current = [];
    map.data.forEach((feature) => map.data.remove(feature));
  }, []);

  const fitFeatures = useCallback((map: google.maps.Map, features: GeoJsonFeature[]) => {
    const bounds = new google.maps.LatLngBounds();
    let hasBounds = false;
    for (const feature of features) {
      const featureBounds = getFeatureBounds(feature.geometry);
      if (!featureBounds) continue;
      bounds.union(featureBounds);
      hasBounds = true;
    }
    if (hasBounds) {
      map.fitBounds(bounds, 48);
      return;
    }
    map.setCenter(YEMEN_MAP_CENTER);
    map.setZoom(MAP_ZOOM.country);
  }, []);

  const loadCityFeatures = useCallback(async (): Promise<GeoJsonFeature[]> => {
    try {
      const collection = await fetchGeoJson(GEO_PATHS.cities);
      return collection.features
        .map((feature) => enrichLegacyCityFeature(feature))
        .filter((feature): feature is GeoJsonFeature => feature != null);
    } catch {
      const fallback = buildCityFallbackCollection(
        fallbackCities.map((city) => ({
          id: city.id,
          name: city.name,
          pcode: city.pcode,
          latitude: city.latitude,
          longitude: city.longitude,
          governorate: city.governorate,
          city_photo_url: city.city_photo_url,
        })),
      );
      return fallback.features as unknown as GeoJsonFeature[];
    }
  }, [fallbackCities]);

  const loadNeighborhoodFeatures = useCallback(
    async (pcode: string): Promise<GeoJsonFeature[]> => {
      try {
        const districts = await fetchGeoJson(GEO_PATHS.cityDistricts(pcode));
        return districts.features;
      } catch {
        const cities = await loadCityFeatures();
        const cityFeature = cities.find((f) => String(f.properties.pcode ?? '') === pcode);
        return cityFeature ? [cityFeature] : [];
      }
    },
    [loadCityFeatures],
  );

  const validatePick = useCallback(
    (point: google.maps.LatLngLiteral, feature: GeoJsonFeature | null): boolean => {
      if (!feature) {
        toast.error(t('admin.pickLocationOutsideRegion'));
        return false;
      }

      if (mode === 'city') {
        const pcode = String(feature.properties.pcode ?? '');
        if (matchCityPcode && pcode && pcode !== matchCityPcode) {
          toast.error(t('admin.pickLocationCityPcodeMismatch'));
          return false;
        }
        return true;
      }

      const kind = String(feature.properties.kind ?? '');
      if (kind && kind !== 'district' && kind !== 'neighborhood') {
        const cityOnlyFallback = cityPcode && String(feature.properties.pcode ?? '') === cityPcode;
        if (!cityOnlyFallback) {
          toast.error(t('admin.pickLocationOutsideRegion'));
          return false;
        }
      }
      return true;
    },
    [cityPcode, matchCityPcode, mode, t],
  );

  const handleMapPick = useCallback(
    (point: google.maps.LatLngLiteral, clickedDataFeature?: google.maps.Data.Feature) => {
      let feature: GeoJsonFeature | null = null;

      if (clickedDataFeature) {
        feature = resolveGeoFeatureFromDataClick(clickedDataFeature, featuresRef.current);
        if (!feature) {
          feature = {
            type: 'Feature',
            properties: {
              kind: (clickedDataFeature.getProperty('kind') as string)
                ?? (mode === 'city' ? 'city' : 'district'),
              pcode: clickedDataFeature.getProperty('pcode') as string | undefined,
              shapeId: clickedDataFeature.getProperty('shapeId') as string | undefined,
            },
            geometry: { type: 'Polygon', coordinates: [] },
          };
        }
      } else {
        feature = findFeatureAtPoint(point, featuresRef.current);
      }

      if (!validatePick(point, feature)) return;
      setDraft({ lat: point.lat, lng: point.lng });
    },
    [mode, validatePick],
  );

  const handleMapPickRef = useRef(handleMapPick);
  handleMapPickRef.current = handleMapPick;

  const syncMapLayer = useCallback(
    async (map: google.maps.Map) => {
      clearLayer(map);
      setLayerReady(false);

      if (mode === 'neighborhood' && !cityPcode?.trim()) {
        toast.error(t('admin.neighborhoodMapRequiresCity'));
        return;
      }

      let features: GeoJsonFeature[] = [];
      if (mode === 'city') {
        features = await loadCityFeatures();
        if (matchCityPcode) {
          const matched = features.filter((f) => String(f.properties.pcode ?? '') === matchCityPcode);
          if (matched.length > 0) features = matched;
        }
      } else {
        features = await loadNeighborhoodFeatures(cityPcode!.trim());
      }

      featuresRef.current = features;
      if (features.length === 0) {
        toast.error(t('admin.pickLocationMapDataMissing'));
        return;
      }

      map.data.addGeoJson({ type: 'FeatureCollection', features });

      cleanupRef.current.push(attachRegionHoverListeners(map.data, setHoveredRegion));
      cleanupRef.current.push(attachRegionClickCursor(map, map.data));
      cleanupRef.current.push(
        removeMapListener(
          map.data.addListener('click', (event: google.maps.Data.MouseEvent) => {
            if (!event.latLng) return;
            const point = { lat: event.latLng.lat(), lng: event.latLng.lng() };
            handleMapPickRef.current(point, event.feature);
          }),
        ),
      );
      cleanupRef.current.push(
        removeMapListener(
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return;
            handleMapPickRef.current({ lat: event.latLng.lat(), lng: event.latLng.lng() });
          }),
        ),
      );

      fitFeatures(map, features);
      setLayerReady(true);
    },
    [
      cityPcode,
      clearLayer,
      fitFeatures,
      loadCityFeatures,
      loadNeighborhoodFeatures,
      matchCityPcode,
      mode,
      t,
    ],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layerReady) return;

    map.data.setStyle((feature) => {
      const kind = (feature.getProperty('kind') as string) ?? (mode === 'city' ? 'city' : 'district');
      const name = String(feature.getProperty('name') ?? feature.getProperty('shapeName') ?? '');
      const hovered = Boolean(hoveredRegion && name && hoveredRegion === name);
      const regionKind = kind === 'city' ? 'city' : 'district';
      return { ...styleForRegion(regionKind, hovered), clickable: true, cursor: 'pointer' };
    });
  }, [hoveredRegion, layerReady, mode]);

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      map.setOptions({
        restriction: {
          latLngBounds: YEMEN_MAP_BOUNDS,
          strictBounds: false,
        },
      });
      void syncMapLayer(map);
    },
    [syncMapLayer],
  );

  useEffect(() => {
    if (!open || !mapRef.current) return;
    void syncMapLayer(mapRef.current);
  }, [open, syncMapLayer]);

  useEffect(
    () => () => {
      if (mapRef.current) clearLayer(mapRef.current);
    },
    [clearLayer],
  );

  if (!open) return null;

  const center = draft ?? initial ?? YEMEN_MAP_CENTER;
  const zoom = draft || initial ? MAP_ZOOM.neighborhood : MAP_ZOOM.country;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-primary-dark">
            {mode === 'city' ? t('admin.pickLocationCityTitle') : t('admin.pickLocationNeighborhoodTitle')}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {mode === 'city' ? t('admin.pickLocationCityDescription') : t('admin.pickLocationNeighborhoodDescription')}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label={t('admin.close')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        {!apiKey ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            {t('dashboard.listings.mapUnavailable')}
          </div>
        ) : !isLoaded ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            {t('dashboard.listings.mapLoading')}
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={center}
            zoom={zoom}
            onLoad={onMapLoad}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              gestureHandling: 'greedy',
            }}
          >
            {draft ? <MarkerF position={draft} /> : null}
          </GoogleMap>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:px-6">
        <p className="text-xs text-gray-500" dir="ltr">
          {draft ? `${draft.lat.toFixed(6)}, ${draft.lng.toFixed(6)}` : t('admin.pickLocationNoSelection')}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('admin.cancel')}
          </Button>
          <Button
            type="button"
            disabled={!draft || !layerReady}
            onClick={() => {
              if (!draft) return;
              onConfirm(draft.lat, draft.lng);
              onClose();
            }}
          >
            {t('dashboard.listings.confirmLocation')}
          </Button>
        </div>
      </div>
    </div>
  );
}
