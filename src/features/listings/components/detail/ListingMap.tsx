'use client';

import { useCallback, useEffect, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
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
import {
  NEAR_BY_POINT_CATEGORIES,
  NearByPointCategory,
  NearByPointItem,
  NearByPointsResult,
} from '@/features/listings/types/near-by-points';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface ListingMapProps {
  listingId: string;
  latitude: number;
  longitude: number;
  address: string;
}

const MAP_CONTAINER_STYLE = { width: '100%', height: '480px', borderRadius: '1rem' };
const DEFAULT_ZOOM = 14;
const DEFAULT_SELECTED_CATEGORIES: NearByPointCategory[] = ['schools', 'hospitals', 'mosques'];

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

export function ListingMap({ listingId, latitude, longitude, address }: ListingMapProps) {
  const { t, locale } = useLocale();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const center = { lat: latitude, lng: longitude };
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  const [result, setResult] = useState<NearByPointsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<NearByPointCategory>>(
    () => new Set(DEFAULT_SELECTED_CATEGORIES),
  );
  const [activePoiId, setActivePoiId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: 'listing-detail-map',
    googleMapsApiKey: apiKey ?? '',
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    clientFetch<NearByPointsResult>(bffPaths.listings.nearByPoints(listingId))
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
  }, [listingId]);

  const toggleCategory = (category: NearByPointCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  // Fixed center/zoom set once on load — never re-centered or re-zoomed
  // afterwards (toggling categories must not move the map), so users can
  // freely pan/zoom without the map fighting them.
  const onLoad = useCallback((map: google.maps.Map) => {
    map.setCenter(center);
    map.setZoom(DEFAULT_ZOOM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const visiblePoints: NearByPointItem[] = NEAR_BY_POINT_CATEGORIES.flatMap((cat) =>
    selectedCategories.has(cat) ? (result?.nearby_pois[cat] ?? []) : [],
  );
  const activePoi = visiblePoints.find((poi) => poi.id === activePoiId) ?? null;
  const selectedCount = selectedCategories.size;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={center} zoom={DEFAULT_ZOOM} onLoad={onLoad}>
        <MarkerF position={center} title={address} zIndex={10} />

        {visiblePoints.map((poi) => (
          <MarkerF
            key={poi.id}
            position={{ lat: poi.latitude, lng: poi.longitude }}
            title={poi.poi_name}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#28b16d',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
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

      {/* Category sidebar overlay */}
      <div className="absolute start-3 top-3 w-56 max-w-[calc(100%-24px)] rounded-2xl bg-white/95 shadow-[var(--shadow-float)] ring-1 ring-gray-100 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-sm font-semibold text-primary-dark"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand" />
            {t('detail.location.nearbyTitle')}
            <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{selectedCount}</span>
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', sidebarOpen && 'rotate-180')} />
        </button>

        {sidebarOpen ? (
          <div className="max-h-72 space-y-1 overflow-y-auto border-t border-gray-100 px-2 py-2">
            {loading ? (
              <p className="px-2 py-1 text-xs text-gray-400">{t('search.loading')}</p>
            ) : error ? (
              <p className="px-2 py-1 text-xs text-secondary">{t('detail.location.loadError')}</p>
            ) : (
              NEAR_BY_POINT_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                const label = result?.categories[cat]?.[locale] ?? cat;
                const count = result?.nearby_pois[cat]?.length ?? 0;
                const checked = selectedCategories.has(cat);
                return (
                  <label
                    key={cat}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat)}
                      className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                    />
                    <Icon className="h-3.5 w-3.5 shrink-0 text-brand" />
                    <span className="flex-1 truncate">{label}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </label>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      {/* Directions overlay */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute end-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-xs font-semibold text-brand-dark shadow-[var(--shadow-soft)] ring-1 ring-gray-100 backdrop-blur-sm hover:bg-white"
      >
        <Navigation className="h-3.5 w-3.5" />
        {t('detail.location.getDirections')}
      </a>
    </div>
  );
}
