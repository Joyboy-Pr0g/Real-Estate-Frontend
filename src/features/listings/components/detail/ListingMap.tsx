'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { env } from '@/env';
import {
  Banknote,
  ChevronDown,
  Fuel,
  GraduationCap,
  Landmark,
  MapPin,
  Navigation,
  Pill,
  ShoppingBag,
  Stethoscope,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { bffPaths } from '@/lib/api/endpoints';
import { clientFetch } from '@/lib/api/client';
import { NEAR_BY_POINT_CATEGORIES, NearByPointCategory, NearByPointsResult } from '@/features/listings/types/near-by-points';
import { useLocale } from '@/lib/i18n/locale-provider';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_LOADER_ID } from '@/lib/google-maps/loader-config';
import { cn } from '@/lib/utils/cn';

interface ListingMapProps {
  listingId: string;
  latitude: number;
  longitude: number;
  address: string;
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '480px', borderRadius: '1rem' };
const DEFAULT_ZOOM = 14;

const CATEGORY_ICONS: Record<NearByPointCategory, LucideIcon> = {
  schools: GraduationCap,
  hospitals: Stethoscope,
  mosques: Landmark,
  shopping: ShoppingBag,
  parks: Trees,
  restaurants: UtensilsCrossed,
  banks: Banknote,
  pharmacies: Pill,
  gas_stations: Fuel,
};

const CATEGORY_EMOJI: Record<NearByPointCategory, string> = {
  schools: '🎓',
  hospitals: '🏥',
  mosques: '🕌',
  shopping: '🛍️',
  parks: '🌳',
  restaurants: '🍽️',
  banks: '🏦',
  pharmacies: '💊',
  gas_stations: '⛽',
};

function buildCategoryMarkerIcon(category: NearByPointCategory): google.maps.Icon {
  const emoji = CATEGORY_EMOJI[category];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34">
    <circle cx="17" cy="17" r="15" fill="#28b16d" stroke="#ffffff" stroke-width="2"/>
    <text x="17" y="22" font-size="15" text-anchor="middle">${emoji}</text>
  </svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(34, 34),
    anchor: new google.maps.Point(17, 17),
  };
}

// Mirrors NearByPointsPanel.tsx: single active category, scoped fetch,
// same default — the map shows exactly the same points that panel does.
export function ListingMap({ listingId, latitude, longitude, address }: ListingMapProps) {
  const { t, locale } = useLocale();
  const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const center = { lat: latitude, lng: longitude };
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  const [category, setCategory] = useState<NearByPointCategory>('schools');
  const [result, setResult] = useState<NearByPointsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activePoiId, setActivePoiId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isInitialZoomRef = useRef(true);

  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey ?? '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    clientFetch<NearByPointsResult>(bffPaths.listings.nearByPoints(listingId), {
      searchParams: { category },
    })
      .then((res) => {
        if (!cancelled) setResult(res.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [listingId, category]);

  const onLoad = useCallback((map: google.maps.Map) => {
    map.setCenter(center);
    map.setZoom(DEFAULT_ZOOM);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run once on load
  }, []);

  const handleZoomChanged = useCallback(() => {
    if (isInitialZoomRef.current) {
      isInitialZoomRef.current = false;
      return;
    }
    setSidebarOpen(false);
  }, []);

  if (!apiKey || !isLoaded) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-2 rounded-2xl bg-gray-50 text-center ring-1 ring-gray-100">
        <MapPin className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">{apiKey ? undefined : t('detail.location.mapUnavailable')}</p>
        <p className="max-w-xs px-4 text-sm font-medium text-primary-dark">{address}</p>
      </div>
    );
  }

  const points = result?.nearby_pois[category] ?? [];
  const activePoi = points.find((poi) => poi.id === activePoiId) ?? null;
  const markerIcon = buildCategoryMarkerIcon(category);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={DEFAULT_ZOOM}
        onLoad={onLoad}
        onZoomChanged={handleZoomChanged}
        options={{ gestureHandling: 'greedy' }}
      >
        <MarkerF position={center} title={address} zIndex={10} />

        {points.map((poi) => (
          <MarkerF
            key={poi.id}
            position={{ lat: poi.latitude, lng: poi.longitude }}
            title={poi.poi_name}
            icon={markerIcon}
            onClick={() => setActivePoiId(poi.id)}
          />
        ))}

        {activePoi ? (
          <InfoWindowF
            position={{ lat: activePoi.latitude, lng: activePoi.longitude }}
            onCloseClick={() => setActivePoiId(null)}
          >
            <div className="text-xs">
              <p className="font-semibold text-primary-dark">{activePoi.poi_name}</p>
              <p className="text-gray-500">
                {t('detail.location.distanceMeters').replace('{distance}', String(activePoi.distance))}
              </p>
            </div>
          </InfoWindowF>
        ) : null}
      </GoogleMap>

      {/* Category sidebar overlay — same single-select model as NearByPointsPanel */}
      <div className="absolute inset-s-3 top-3 w-56 max-w-[calc(100%-24px)] rounded-2xl bg-white/95 shadow-var(--shadow-float) ring-1 ring-gray-100 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-sm font-semibold text-primary-dark"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand" />
            {t('detail.location.nearbyTitle')}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', sidebarOpen && 'rotate-180')} />
        </button>

        {sidebarOpen ? (
          <div className="max-h-72 space-y-1 overflow-y-auto border-t border-gray-100 px-2 py-2">
            {NEAR_BY_POINT_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const label = result?.categories[cat]?.[locale] ?? cat;
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm transition-colors',
                    active ? 'bg-brand-muted font-semibold text-brand-dark' : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand" />
                  <span className="flex-1 truncate">{label}</span>
                </button>
              );
            })}
            {loading ? (
              <p className="px-2 py-1 text-xs text-gray-400">{t('search.loading')}</p>
            ) : error ? (
              <p className="px-2 py-1 text-xs text-secondary">{t('detail.location.loadError')}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Directions overlay */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-e-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-brand-dark shadow-var(--shadow-soft) ring-1 ring-gray-100 backdrop-blur-sm hover:bg-white"
      >
        <Navigation className="h-3.5 w-3.5" />
        {t('detail.location.getDirections')}
      </a>
    </div>
  );
}
