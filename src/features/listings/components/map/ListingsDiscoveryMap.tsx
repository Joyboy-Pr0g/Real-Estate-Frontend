'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GoogleMap,
  MarkerClustererF,
  MarkerF,
  OVERLAY_MOUSE_TARGET,
  OverlayViewF,
  useJsApiLoader,
} from '@react-google-maps/api';
import { ChevronLeft, MapPin } from 'lucide-react';
import { env } from '@/env';
import { PublicCatalog, PublicCity } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { LISTING_URL_PARAMS } from '@/features/listings/constants/search-url-params';
import { MAP_ZOOM, YEMEN_MAP_BOUNDS, YEMEN_MAP_CENTER } from '@/features/listings/constants/map-config';
import { buildListingsHref } from '@/features/listings/lib/build-listings-url';
import {
  fetchGeoJson,
  GEO_PATHS,
  getFeatureBounds,
  pointInGeoFeature,
  type GeoFeatureCollection,
  type GeoJsonFeature,
} from '@/features/listings/lib/geo-boundary-loader';
import { buildCityFallbackCollection } from '@/features/listings/lib/map-neighborhood-fallback';
import { parseListingCoordinate } from '@/features/listings/lib/map-geo';
import {
  attachRegionClickCursor,
  attachRegionHoverListeners,
  removeMapListener,
  styleForRegion,
} from '@/features/listings/lib/map-region-layer';
import { MapMarkerInfoCard } from '@/features/listings/components/map/MapMarkerInfoCard';
import { PublicListing } from '@/features/listings/types/listing';
import { useLocale } from '@/lib/i18n/locale-provider';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_LOADER_ID } from '@/lib/google-maps/loader-config';
import { cn } from '@/lib/utils/cn';

export type MapViewLevel = 'country' | 'city' | 'listings';

interface ListingsDiscoveryMapProps {
  catalog: PublicCatalog;
  neighborhoods: PublicNeighborhood[];
  listings: PublicListing[];
  viewLevel: MapViewLevel;
  selectedCity: PublicCity | null;
  selectedNeighborhood: PublicNeighborhood | null;
  className?: string;
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const MAP_PATH = '/listings/map';
/** Gap between card bottom and marker top (px). */
const LISTING_HOVER_MARKER_GAP = 40;
const LISTING_HOVER_HIDE_DELAY_MS = 150;

function findNeighborhoodsInFeature(
  feature: GeoJsonFeature,
  neighborhoods: PublicNeighborhood[],
): PublicNeighborhood[] {
  return neighborhoods.filter((neighborhood) => {
    if (neighborhood.latitude == null || neighborhood.longitude == null) return false;
    return pointInGeoFeature(
      { lat: neighborhood.latitude, lng: neighborhood.longitude },
      feature,
    );
  });
}

export function ListingsDiscoveryMap({
  catalog,
  neighborhoods,
  listings,
  viewLevel,
  selectedCity,
  selectedNeighborhood,
  className,
}: ListingsDiscoveryMapProps) {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  const mapRef = useRef<google.maps.Map | null>(null);
  const layerCleanupRef = useRef<Array<() => void>>([]);
  const districtFeaturesRef = useRef<GeoJsonFeature[]>([]);
  const listingHoverHideRef = useRef<number | null>(null);

  const [hoveredListing, setHoveredListing] = useState<PublicListing | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const cancelListingHoverHide = useCallback(() => {
    if (listingHoverHideRef.current != null) {
      window.clearTimeout(listingHoverHideRef.current);
      listingHoverHideRef.current = null;
    }
  }, []);

  const showListingHover = useCallback(
    (listing: PublicListing, position: { lat: number; lng: number }) => {
      cancelListingHoverHide();
      setHoveredListing(listing);
      setHoverPosition(position);
    },
    [cancelListingHoverHide],
  );

  const scheduleListingHoverHide = useCallback(() => {
    cancelListingHoverHide();
    listingHoverHideRef.current = window.setTimeout(() => {
      setHoveredListing(null);
      setHoverPosition(null);
      listingHoverHideRef.current = null;
    }, LISTING_HOVER_HIDE_DELAY_MS);
  }, [cancelListingHoverHide]);

  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey ?? '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mappableListings = useMemo(
    () =>
      listings
        .map((listing) => {
          const lat = parseListingCoordinate(listing.latitude);
          const lng = parseListingCoordinate(listing.longitude);
          if (lat == null || lng == null) return null;
          return { listing, position: { lat, lng } };
        })
        .filter(
          (item): item is { listing: PublicListing; position: { lat: number; lng: number } } =>
            item !== null,
        ),
    [listings],
  );

  const mapCenter = useMemo(() => {
    if (
      viewLevel === 'listings' &&
      selectedNeighborhood?.latitude != null &&
      selectedNeighborhood.longitude != null
    ) {
      return { lat: selectedNeighborhood.latitude, lng: selectedNeighborhood.longitude };
    }
    if (viewLevel === 'city' && selectedCity?.latitude != null && selectedCity.longitude != null) {
      return { lat: selectedCity.latitude, lng: selectedCity.longitude };
    }
    return YEMEN_MAP_CENTER;
  }, [selectedCity, selectedNeighborhood, viewLevel]);

  const mapZoom = useMemo(() => {
    if (viewLevel === 'listings') return MAP_ZOOM.neighborhood;
    if (viewLevel === 'city') return MAP_ZOOM.city;
    return MAP_ZOOM.country;
  }, [viewLevel]);

  const clearMapLayer = useCallback((map: google.maps.Map) => {
    for (const cleanup of layerCleanupRef.current) {
      cleanup();
    }
    layerCleanupRef.current = [];
    map.data.forEach((feature) => map.data.remove(feature));
    districtFeaturesRef.current = [];
  }, []);

  const applyDefaultStyles = useCallback((data: google.maps.Data) => {
    data.setStyle((feature) => {
      const kind = feature.getProperty('kind') as string;
      return styleForRegion(kind as 'country' | 'city' | 'district', false);
    });
  }, []);

  const fitGeoCollection = useCallback((map: google.maps.Map, collection: GeoFeatureCollection) => {
    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    for (const feature of collection.features) {
      const featureBounds = getFeatureBounds(feature.geometry);
      if (!featureBounds) continue;
      bounds.union(featureBounds);
      hasPoints = true;
    }

    if (hasPoints) {
      map.fitBounds(bounds, 48);
    }
  }, []);

  const loadCountryLayer = useCallback(
    async (map: google.maps.Map) => {
      clearMapLayer(map);
      const { data } = map;

      try {
        const citiesGeo = await fetchGeoJson(GEO_PATHS.cities);
        data.addGeoJson(citiesGeo);
        fitGeoCollection(map, citiesGeo);
      } catch {
        data.addGeoJson(buildCityFallbackCollection(catalog.cities));
      }

      applyDefaultStyles(data);
      layerCleanupRef.current.push(attachRegionHoverListeners(data, setHoveredRegion));
      layerCleanupRef.current.push(attachRegionClickCursor(map, data));

      layerCleanupRef.current.push(
        removeMapListener(
          data.addListener('click', (event: google.maps.Data.MouseEvent) => {
            const kind = event.feature.getProperty('kind');
            if (kind !== 'city') return;

            const pcode = event.feature.getProperty('pcode') as string;
            const geometry = event.feature.getGeometry();
            if (geometry) {
              const bounds = new google.maps.LatLngBounds();
              geometry.forEachLatLng((latLng) => bounds.extend(latLng));
              map.fitBounds(bounds, 56);
            }

            router.push(
              buildListingsHref(
                searchParams,
                {
                  [LISTING_URL_PARAMS.city]: pcode,
                  [LISTING_URL_PARAMS.neighborhood]: null,
                },
                { basePath: MAP_PATH },
              ),
            );
          }),
        ),
      );
    },
    [applyDefaultStyles, catalog.cities, clearMapLayer, fitGeoCollection, router, searchParams],
  );

  const loadCityLayer = useCallback(
    async (map: google.maps.Map) => {
      if (!selectedCity) return;

      clearMapLayer(map);
      const { data } = map;

      try {
        const districtsGeo = await fetchGeoJson(GEO_PATHS.cityDistricts(selectedCity.pcode));
        districtFeaturesRef.current = districtsGeo.features;
        data.addGeoJson(districtsGeo);
        fitGeoCollection(map, districtsGeo);
      } catch {
        return;
      }

      applyDefaultStyles(data);
      layerCleanupRef.current.push(attachRegionHoverListeners(data, setHoveredRegion));
      layerCleanupRef.current.push(attachRegionClickCursor(map, data));

      layerCleanupRef.current.push(
        removeMapListener(
          data.addListener('click', (event: google.maps.Data.MouseEvent) => {
            const kind = event.feature.getProperty('kind');
            if (kind !== 'district') return;

            const shapeId = event.feature.getProperty('shapeId') as string;
            const districtFeature = districtFeaturesRef.current.find(
              (feature) => feature.properties.shapeId === shapeId,
            );
            if (!districtFeature) return;

            const geometry = event.feature.getGeometry();
            if (geometry) {
              const bounds = new google.maps.LatLngBounds();
              geometry.forEachLatLng((latLng) => bounds.extend(latLng));
              map.fitBounds(bounds, 64);
            }

            const matches = findNeighborhoodsInFeature(districtFeature, neighborhoods);
            if (matches.length === 1) {
              router.push(
                buildListingsHref(
                  searchParams,
                  {
                    [LISTING_URL_PARAMS.city]: selectedCity.pcode,
                    [LISTING_URL_PARAMS.neighborhood]: matches[0].neighb_pcode,
                  },
                  { basePath: MAP_PATH },
                ),
              );
            }
          }),
        ),
      );
    },
    [
      applyDefaultStyles,
      clearMapLayer,
      fitGeoCollection,
      neighborhoods,
      router,
      searchParams,
      selectedCity,
    ],
  );

  const syncMapView = useCallback(
    async (map: google.maps.Map) => {
      setHoveredRegion(null);

      if (viewLevel === 'country') {
        await loadCountryLayer(map);
        return;
      }

      if (viewLevel === 'city') {
        await loadCityLayer(map);
        return;
      }

      clearMapLayer(map);
      map.setCenter(mapCenter);
      map.setZoom(mapZoom);
    },
    [clearMapLayer, loadCityLayer, loadCountryLayer, mapCenter, mapZoom, viewLevel],
  );

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      void syncMapView(map);
    },
    [syncMapView],
  );

  useEffect(
    () => () => {
      cancelListingHoverHide();
    },
    [cancelListingHoverHide],
  );

  useEffect(() => {
    if (mapRef.current) void syncMapView(mapRef.current);
  }, [syncMapView]);

  useEffect(
    () => () => {
      if (mapRef.current) clearMapLayer(mapRef.current);
    },
    [clearMapLayer],
  );

  const handleBack = () => {
    if (viewLevel === 'listings') {
      router.push(
        buildListingsHref(
          searchParams,
          { [LISTING_URL_PARAMS.neighborhood]: null },
          { basePath: MAP_PATH },
        ),
      );
      return;
    }

    if (viewLevel === 'city') {
      router.push(
        buildListingsHref(
          searchParams,
          {
            [LISTING_URL_PARAMS.city]: null,
            [LISTING_URL_PARAMS.neighborhood]: null,
          },
          { basePath: MAP_PATH },
        ),
      );
    }
  };

  if (!apiKey || !isLoaded) {
    return (
      <div
        className={cn(
          'flex h-full flex-col items-center justify-center bg-gray-50 text-center',
          className,
        )}
      >
        <MapPin className="mb-2 h-10 w-10 text-gray-300" />
        <p className="text-sm text-gray-500">
          {apiKey ? t('search.loading') : t('detail.location.mapUnavailable')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('relative h-full min-h-80', className)}>
      {(viewLevel === 'city' || viewLevel === 'listings') && (
        <button
          type="button"
          onClick={handleBack}
          className="absolute inset-s-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-primary-dark shadow-(--shadow-soft) ring-1 ring-gray-100 backdrop-blur-sm hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
          {viewLevel === 'listings' ? selectedCity?.name : t('map.backToCountry')}
        </button>
      )}

      {hoveredRegion ? (
        <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-16">
          <div className="rounded-full bg-primary-dark/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
            {hoveredRegion}
          </div>
        </div>
      ) : null}

      {viewLevel === 'listings' && selectedNeighborhood ? (
        <div className="absolute inset-s-3 top-14 z-20 rounded-full bg-brand/95 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
          {selectedNeighborhood.name}
        </div>
      ) : null}

      {viewLevel === 'city' && selectedCity && !hoveredRegion ? (
        <div className="absolute inset-s-3 top-14 z-20 rounded-full bg-brand/95 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
          {selectedCity.name}
        </div>
      ) : null}

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onLoad}
        options={{
          gestureHandling: 'greedy',
          restriction: {
            latLngBounds: YEMEN_MAP_BOUNDS,
            strictBounds: true,
          },
          minZoom: MAP_ZOOM.country,
          maxZoom: 18,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {viewLevel === 'listings' ? (
          <MarkerClustererF averageCenter enableRetinaIcons gridSize={60} maxZoom={16}>
            {(clusterer) => (
              <>
                {mappableListings.map(({ listing, position }) => (
                  <MarkerF
                    key={listing.id}
                    position={position}
                    clusterer={clusterer}
                    onClick={() => router.push(`/listings/${listing.slug}`)}
                    onMouseOver={() => showListingHover(listing, position)}
                    onMouseOut={scheduleListingHoverHide}
                  />
                ))}
              </>
            )}
          </MarkerClustererF>
        ) : null}

        {viewLevel === 'listings' && hoveredListing && hoverPosition ? (
          <OverlayViewF
            position={hoverPosition}
            mapPaneName={OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={(width, height) => ({
              x: -Math.round(width / 2),
              y: -Math.round(height),
            })}
          >
            <div
              className="pointer-events-auto flex flex-col items-center"
              onMouseEnter={cancelListingHoverHide}
              onMouseLeave={scheduleListingHoverHide}
            >
              <button
                type="button"
                onClick={() => router.push(`/listings/${hoveredListing.slug}`)}
                className="block cursor-pointer text-start"
              >
                <MapMarkerInfoCard listing={hoveredListing} />
              </button>
              {/* Invisible bridge so moving from marker to card does not break hover. */}
              <div
                aria-hidden
                className="w-full max-w-32"
                style={{ height: LISTING_HOVER_MARKER_GAP }}
              />
            </div>
          </OverlayViewF>
        ) : null}
      </GoogleMap>
    </div>
  );
}
