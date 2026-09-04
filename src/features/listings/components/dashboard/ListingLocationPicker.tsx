'use client';

import { useCallback, useMemo, useState } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { YEMEN_MAP_CENTER, MAP_ZOOM } from '@/features/listings/constants/map-config';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_LOADER_ID } from '@/lib/google-maps/loader-config';
import { useLocale } from '@/lib/i18n/locale-provider';

const MAP_CONTAINER_STYLE = { width: '100%', height: '360px', borderRadius: '0.75rem' };

interface ListingLocationPickerProps {
  latitude: string;
  longitude: string;
  onConfirm: (latitude: string, longitude: string) => void;
  disabled?: boolean;
  initialCenter?: { lat: number; lng: number } | null;
}

export function ListingLocationPicker({
  latitude,
  longitude,
  onConfirm,
  disabled = false,
  initialCenter = null,
}: ListingLocationPickerProps) {
  const { t } = useLocale();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const [open, setOpen] = useState(false);
  const [draftLat, setDraftLat] = useState(latitude);
  const [draftLng, setDraftLng] = useState(longitude);

  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey ?? '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const center = useMemo(() => {
    const draftLatNum = Number(draftLat);
    const draftLngNum = Number(draftLng);
    if (draftLat && draftLng && Number.isFinite(draftLatNum) && Number.isFinite(draftLngNum)) {
      return { lat: draftLatNum, lng: draftLngNum };
    }

    const savedLat = Number(latitude);
    const savedLng = Number(longitude);
    if (latitude && longitude && Number.isFinite(savedLat) && Number.isFinite(savedLng)) {
      return { lat: savedLat, lng: savedLng };
    }

    if (initialCenter) return initialCenter;
    return YEMEN_MAP_CENTER;
  }, [draftLat, draftLng, latitude, longitude, initialCenter]);

  const mapZoom =
    draftLat && draftLng
      ? MAP_ZOOM.listing
      : initialCenter
        ? MAP_ZOOM.neighborhood
        : MAP_ZOOM.country;

  const handleOpen = () => {
    if (disabled) return;
    setDraftLat(latitude);
    setDraftLng(longitude);
    setOpen(true);
  };

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    setDraftLat(event.latLng.lat().toFixed(6));
    setDraftLng(event.latLng.lng().toFixed(6));
  }, []);

  const hasSelection = Boolean(draftLat && draftLng);

  return (
    <>
      <div className="space-y-2">
        <Button type="button" variant="outline" onClick={handleOpen} disabled={disabled} className="gap-2">
          <MapPin className="h-4 w-4" />
          {latitude && longitude ? t('dashboard.listings.changeLocation') : t('dashboard.listings.pickLocation')}
        </Button>
        {disabled ? (
          <p className="text-xs text-gray-500">{t('dashboard.listings.pickLocationRequiresNeighborhood')}</p>
        ) : latitude && longitude ? (
          <p className="text-xs text-gray-500" dir="ltr">
            {latitude}, {longitude}
          </p>
        ) : (
          <p className="text-xs text-gray-500">{t('dashboard.listings.pickLocationHint')}</p>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-[var(--shadow-float)]">
            <h2 className="text-lg font-bold text-primary-dark">{t('dashboard.listings.pickLocationTitle')}</h2>
            <p className="mt-1 text-sm text-gray-500">{t('dashboard.listings.pickLocationDescription')}</p>

            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
              {!apiKey ? (
                <div className="flex h-[360px] items-center justify-center bg-gray-50 text-sm text-gray-500">
                  {t('dashboard.listings.mapUnavailable')}
                </div>
              ) : !isLoaded ? (
                <div className="flex h-[360px] items-center justify-center bg-gray-50 text-sm text-gray-500">
                  {t('dashboard.listings.mapLoading')}
                </div>
              ) : (
                <GoogleMap
                  key={`${initialCenter?.lat ?? 'yemen'}-${initialCenter?.lng ?? 'yemen'}-${latitude}-${longitude}`}
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={center}
                  zoom={mapZoom}
                  onClick={handleMapClick}
                  options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
                >
                  {hasSelection ? <MarkerF position={{ lat: Number(draftLat), lng: Number(draftLng) }} /> : null}
                </GoogleMap>
              )}
            </div>

            {hasSelection ? (
              <p className="mt-3 text-xs text-gray-500" dir="ltr">
                {draftLat}, {draftLng}
              </p>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('admin.cancel')}
              </Button>
              <Button
                type="button"
                disabled={!hasSelection}
                onClick={() => {
                  onConfirm(draftLat, draftLng);
                  setOpen(false);
                }}
              >
                {t('dashboard.listings.confirmLocation')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
