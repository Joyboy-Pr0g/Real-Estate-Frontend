'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicCityOption } from '@/features/admin/types/locations';
import {
  AdminGeoLocationMapPicker,
  AdminGeoMapPickerMode,
} from '@/features/admin/components/locations/AdminGeoLocationMapPicker';
import { useLocale } from '@/lib/i18n/locale-provider';

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

function parseOptionalFloat(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

interface AdminLatLonFieldsProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number | null, longitude: number | null) => void;
  mode: AdminGeoMapPickerMode;
  matchCityPcode?: string;
  cityPcode?: string;
  fallbackCities?: PublicCityOption[];
  className?: string;
}

export function AdminLatLonFields({
  latitude,
  longitude,
  onChange,
  mode,
  matchCityPcode,
  cityPcode,
  fallbackCities,
  className,
}: AdminLatLonFieldsProps) {
  const { t } = useLocale();
  const [mapOpen, setMapOpen] = useState(false);

  const initial =
    latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null;

  return (
    <>
      <div className={className}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.latitude')}</span>
            <input
              type="number"
              step="any"
              value={latitude ?? ''}
              onChange={(e) => onChange(parseOptionalFloat(e.target.value), longitude)}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.longitude')}</span>
            <input
              type="number"
              step="any"
              value={longitude ?? ''}
              onChange={(e) => onChange(latitude, parseOptionalFloat(e.target.value))}
              className={fieldClass}
            />
          </label>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 gap-2"
          onClick={() => setMapOpen(true)}
        >
          <MapPin className="h-4 w-4" />
          {t('admin.pickOnMap')}
        </Button>
      </div>

      <AdminGeoLocationMapPicker
        open={mapOpen}
        mode={mode}
        matchCityPcode={matchCityPcode}
        cityPcode={cityPcode}
        fallbackCities={fallbackCities}
        initial={initial}
        onClose={() => setMapOpen(false)}
        onConfirm={(lat, lng) => onChange(lat, lng)}
      />
    </>
  );
}
