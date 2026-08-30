'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { updateOffice } from '@/features/office/services/office-client';
import { OfficeDetail } from '@/features/office/types/office';
import { PublicCity } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatPhoneNumber } from '@/lib/utils/format';

interface OfficeProfileFormProps {
  office: OfficeDetail;
  cities: PublicCity[];
  initialNeighborhoods: PublicNeighborhood[];
  onDone: () => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';
const fileClass =
  'block w-full text-sm text-gray-600 file:me-3 file:rounded-lg file:border-0 file:bg-brand-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-dark';

export function OfficeProfileForm({ office, cities, initialNeighborhoods, onDone }: OfficeProfileFormProps) {
  const { t } = useLocale();
  const router = useRouter();

  const [name, setName] = useState(office.name);
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(office.phone_number));
  const [email, setEmail] = useState(office.email);
  const [address, setAddress] = useState(office.address);
  const [cityId, setCityId] = useState(office.city.id);
  const [neighborhoodId, setNeighborhoodId] = useState(office.neighborhood.id);
  const [neighborhoods, setNeighborhoods] = useState<PublicNeighborhood[]>(initialNeighborhoods);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [officePhoto, setOfficePhoto] = useState<File | null>(null);
  const [idImage, setIdImage] = useState<File | null>(null);
  const [commercialLicense, setCommercialLicense] = useState<File | null>(null);
  const [officeLicense, setOfficeLicense] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCityChange = async (value: string) => {
    setCityId(value);
    setNeighborhoodId('');
    setNeighborhoods([]);
    if (!value) return;

    setLoadingNeighborhoods(true);
    try {
      const res = await clientFetch<PublicNeighborhood[]>(bffPaths.neighborhoods.public, {
        params: { city_id: value },
      });
      setNeighborhoods(res.data ?? []);
    } catch {
      setNeighborhoods([]);
    } finally {
      setLoadingNeighborhoods(false);
    }
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone_number', phoneNumber.trim());
      formData.append('email', email.trim());
      formData.append('address', address.trim());
      formData.append('city_id', cityId);
      formData.append('neighborhood_id', neighborhoodId);
      if (officePhoto) formData.append('office_photo', officePhoto);
      if (idImage) formData.append('id_image', idImage);
      if (commercialLicense) formData.append('commercial_license', commercialLicense);
      if (officeLicense) formData.append('office_license', officeLicense);

      await updateOffice(office.id, formData);
      toast.success(t('dashboard.office.updated'));
      router.refresh();
      onDone();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.name')}</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('auth.phone')}</span>
          <input
            required
            type="tel"
            dir="ltr"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.emailLabel')}</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('admin.city')}</span>
          <select
            required
            value={cityId}
            onChange={(e) => void handleCityChange(e.target.value)}
            className={fieldClass}
          >
            <option value="">—</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.neighborhood')}</span>
          <select
            required
            value={neighborhoodId}
            onChange={(e) => setNeighborhoodId(e.target.value)}
            disabled={!cityId || loadingNeighborhoods}
            className={fieldClass}
          >
            <option value="">—</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.id}>
                {neighborhood.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-primary-dark">{t('dashboard.address')}</span>
        <input required value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.officePhoto')}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setOfficePhoto(e.target.files?.[0] ?? null)}
            className={fileClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.idImage')}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => setIdImage(e.target.files?.[0] ?? null)}
            className={fileClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.commercialLicense')}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => setCommercialLicense(e.target.files?.[0] ?? null)}
            className={fileClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.officeLicense')}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => setOfficeLicense(e.target.files?.[0] ?? null)}
            className={fileClass}
          />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={submitting}>
          {t('admin.cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t('dashboard.submitting') : t('dashboard.submit')}
        </Button>
      </div>
    </form>
  );
}
