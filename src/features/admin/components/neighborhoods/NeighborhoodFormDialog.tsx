'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createNeighborhood,
  updateNeighborhood,
} from '@/features/admin/services/admin-locations-client';
import { buildPartialUpdate, hasPartialChanges } from '@/features/admin/lib/partial-update';
import {
  AdminNeighborhood,
  NeighborhoodPayload,
  PublicCityOption,
} from '@/features/admin/types/locations';
import { toast } from '@/components/ui/toaster';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface NeighborhoodFormDialogProps {
  open: boolean;
  item: AdminNeighborhood | null;
  cities: PublicCityOption[];
  onClose: () => void;
  onSaved: () => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

const emptyForm = (): NeighborhoodPayload => ({
  city_id: '',
  name: '',
  neighb_pcode: '',
  latitude: null,
  longitude: null,
  population: 0,
  total_idps: 0,
  avg_age: null,
  avg_female: null,
  avg_male: null,
});

function toPayload(item: AdminNeighborhood): NeighborhoodPayload {
  return {
    city_id: item.city_id,
    name: item.name,
    neighb_pcode: item.neighb_pcode,
    latitude: item.latitude,
    longitude: item.longitude,
    population: item.population,
    total_idps: item.total_idps,
    avg_age: item.avg_age,
    avg_female: item.avg_female,
    avg_male: item.avg_male,
  };
}

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isNaN(num) ? null : num;
}

export function NeighborhoodFormDialog({
  open,
  item,
  cities,
  onClose,
  onSaved,
}: NeighborhoodFormDialogProps) {
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<NeighborhoodPayload>(emptyForm());

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm(toPayload(item));
    } else {
      setForm({ ...emptyForm(), city_id: cities[0]?.id ?? '' });
    }
  }, [open, item, cities]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const next: NeighborhoodPayload = {
          city_id: form.city_id,
          name: form.name.trim(),
          neighb_pcode: form.neighb_pcode.trim(),
          latitude: form.latitude,
          longitude: form.longitude,
          population: form.population,
          total_idps: form.total_idps,
          avg_age: form.avg_age,
          avg_female: form.avg_female,
          avg_male: form.avg_male,
        };

        if (item) {
          const patch = buildPartialUpdate(next, toPayload(item));
          if (!hasPartialChanges(patch)) {
            toast.info(t('admin.noChanges'));
            return;
          }
          await updateNeighborhood(item.id, patch);
          toast.success(t('admin.neighborhoodUpdated'));
        } else {
          await createNeighborhood(next);
          toast.success(t('admin.neighborhoodCreated'));
        }

        onSaved();
        onClose();
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-[var(--shadow-float)]">
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label={t('admin.close')}
            className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="ps-10 text-lg font-bold text-primary-dark">
            {item ? t('admin.editNeighborhood') : t('admin.createNeighborhood')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-primary-dark">{t('admin.city')}</span>
            <select
              required
              value={form.city_id}
              onChange={(e) => setForm({ ...form, city_id: e.target.value })}
              className={fieldClass}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} ({city.pcode})
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.catalogName')}</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.neighborhoodPcode')}</span>
            <input required value={form.neighb_pcode} onChange={(e) => setForm({ ...form, neighb_pcode: e.target.value })} className={fieldClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.latitude')}</span>
            <input
              type="number"
              step="any"
              value={form.latitude ?? ''}
              onChange={(e) => setForm({ ...form, latitude: parseOptionalInt(e.target.value) })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.longitude')}</span>
            <input
              type="number"
              step="any"
              value={form.longitude ?? ''}
              onChange={(e) => setForm({ ...form, longitude: parseOptionalInt(e.target.value) })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.population')}</span>
            <input
              type="number"
              required
              min={0}
              value={form.population}
              onChange={(e) => setForm({ ...form, population: Number(e.target.value) || 0 })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.totalIdps')}</span>
            <input
              type="number"
              required
              min={0}
              value={form.total_idps}
              onChange={(e) => setForm({ ...form, total_idps: Number(e.target.value) || 0 })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.avgAge')}</span>
            <input
              type="number"
              min={0}
              value={form.avg_age ?? ''}
              onChange={(e) => setForm({ ...form, avg_age: parseOptionalInt(e.target.value) })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.avgFemale')}</span>
            <input
              type="number"
              min={0}
              value={form.avg_female ?? ''}
              onChange={(e) => setForm({ ...form, avg_female: parseOptionalInt(e.target.value) })}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-medium text-primary-dark">{t('admin.avgMale')}</span>
            <input
              type="number"
              min={0}
              value={form.avg_male ?? ''}
              onChange={(e) => setForm({ ...form, avg_male: parseOptionalInt(e.target.value) })}
              className={fieldClass}
            />
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              {t('admin.cancel')}
            </Button>
            <Button type="submit" disabled={pending}>
              {t('admin.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
