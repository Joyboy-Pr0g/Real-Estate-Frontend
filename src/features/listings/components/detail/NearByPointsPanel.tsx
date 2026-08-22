'use client';

import { useEffect, useState } from 'react';
import {
  Banknote,
  Fuel,
  GraduationCap,
  Landmark,
  MapPin,
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
import { cn } from '@/lib/utils/cn';

interface NearByPointsPanelProps {
  listingId: string;
}

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

export function NearByPointsPanel({ listingId }: NearByPointsPanelProps) {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState<NearByPointCategory>('schools');
  const [result, setResult] = useState<NearByPointsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

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

  const points = result?.nearby_pois[category]?.slice(0, 3) ?? [];

  return (
    <div className="mt-6">
      <h4 className="mb-1 text-sm font-bold text-primary-dark">{t('detail.location.nearbyTitle')}</h4>
      <p className="mb-3 text-xs text-gray-500">{t('detail.location.nearbyHint')}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {NEAR_BY_POINT_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const label = result?.categories[cat]?.[locale] ?? cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                category === cat
                  ? 'bg-brand text-white shadow-md shadow-brand/20'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand/25 hover:text-brand-dark',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">{t('search.loading')}</p>
      ) : error ? (
        <p className="text-sm text-secondary">{t('detail.location.loadError')}</p>
      ) : points.length === 0 ? (
        <p className="text-sm text-gray-500">{t('detail.location.noResults')}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {points.map((poi) => (
            <div key={poi.id} className="flex items-start gap-2.5 rounded-xl bg-gray-50/70 p-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-primary-dark">{poi.poi_name}</p>
                <p className="text-[11px] text-gray-500">
                  {t('detail.location.distanceMeters').replace('{distance}', String(poi.distance))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
