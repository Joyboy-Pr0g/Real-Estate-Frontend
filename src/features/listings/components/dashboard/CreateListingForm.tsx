'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { ListingSpecFieldsInput } from '@/features/listings/components/dashboard/ListingSpecFieldsInput';
import { ImageGalleryInput } from '@/features/listings/components/dashboard/ImageGalleryInput';
import { VideoInput } from '@/features/listings/components/dashboard/VideoInput';
import { createListing } from '@/features/listings/services/listing-client';
import { PublicPropertyType, PublicTransactionType, PublicCity } from '@/features/catalog/types/catalog';
import { PublicPropertySubtype } from '@/features/catalog/types/property-subtype';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { ListingPropertySpecs } from '@/features/listings/types/listing-detail';
import { MyOffice } from '@/features/office/types/office';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';

interface CreateListingFormProps {
  propertyTypes: PublicPropertyType[];
  transactionTypes: PublicTransactionType[];
  cities: PublicCity[];
  offices?: MyOffice[];
  redirectPath?: string;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

export function CreateListingForm({
  propertyTypes,
  transactionTypes,
  cities,
  offices = [],
  redirectPath = '/dashboard/listings',
}: CreateListingFormProps) {
  const { t } = useLocale();
  const router = useRouter();

  const officeId = offices[0]?.id ?? '';
  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [propertySubtypeId, setPropertySubtypeId] = useState('');
  const [propertySubtypes, setPropertySubtypes] = useState<PublicPropertySubtype[]>([]);
  const [loadingSubtypes, setLoadingSubtypes] = useState(false);
  const [transactionTypeId, setTransactionTypeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cityId, setCityId] = useState('');
  const [neighborhoodId, setNeighborhoodId] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<PublicNeighborhood[]>([]);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [specs, setSpecs] = useState<ListingPropertySpecs>({});
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedSubtype = propertySubtypes.find((subtype) => subtype.id === propertySubtypeId) ?? null;

  const handlePropertyTypeChange = async (value: string) => {
    setPropertyTypeId(value);
    setPropertySubtypeId('');
    setPropertySubtypes([]);
    setSpecs({});
    if (!value) return;

    setLoadingSubtypes(true);
    try {
      const res = await clientFetch<PublicPropertySubtype[]>(bffPaths.propertySubtypes.byPropertyType(value));
      setPropertySubtypes(res.data ?? []);
    } catch {
      setPropertySubtypes([]);
    } finally {
      setLoadingSubtypes(false);
    }
  };

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

  const handleSpecChange = (fieldName: string, value: string | number | boolean | undefined) => {
    setSpecs((prev) => {
      const next = { ...prev };
      if (value === undefined) delete next[fieldName];
      else next[fieldName] = value;
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (images.length === 0) {
      toast.error(t('dashboard.listings.imagesRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (officeId) formData.append('office_id', officeId);
      formData.append('property_type_id', propertyTypeId);
      formData.append('property_subtype_id', propertySubtypeId);
      formData.append('transaction_type_id', transactionTypeId);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', price.trim());
      formData.append('city_id', cityId);
      formData.append('neighborhood_id', neighborhoodId);
      formData.append('address', address.trim());
      formData.append('latitude', latitude.trim());
      formData.append('longitude', longitude.trim());
      formData.append('property_specs', JSON.stringify(specs));
      images.forEach((image) => formData.append('images', image));
      if (video) formData.append('video', video);

      await createListing(formData);
      toast.success(t('dashboard.listings.created'));
      router.push(redirectPath);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.propertyType')}</span>
            <select
              required
              value={propertyTypeId}
              onChange={(e) => void handlePropertyTypeChange(e.target.value)}
              className={fieldClass}
            >
              <option value="">—</option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.propertySubtype')}</span>
            <select
              required
              value={propertySubtypeId}
              onChange={(e) => {
                setPropertySubtypeId(e.target.value);
                setSpecs({});
              }}
              disabled={!propertyTypeId || loadingSubtypes}
              className={fieldClass}
            >
              <option value="">—</option>
              {propertySubtypes.map((subtype) => (
                <option key={subtype.id} value={subtype.id}>
                  {subtype.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.transactionType')}</span>
            <select
              required
              value={transactionTypeId}
              onChange={(e) => setTransactionTypeId(e.target.value)}
              className={fieldClass}
            >
              <option value="">—</option>
              {transactionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.display_name_ar || type.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.title')}</span>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.description')}</span>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass.replace('h-11', 'min-h-28 py-2.5')}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.price')}</span>
          <input
            required
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={fieldClass}
          />
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('admin.city')}</span>
            <select required value={cityId} onChange={(e) => void handleCityChange(e.target.value)} className={fieldClass}>
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
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.latitude')}</span>
            <input
              required
              inputMode="decimal"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.longitude')}</span>
            <input
              required
              inputMode="decimal"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-sm font-bold text-primary-dark">{t('dashboard.listings.specsTitle')}</h2>
        {selectedSubtype ? (
          <ListingSpecFieldsInput schema={selectedSubtype.spec_schema} values={specs} onChange={handleSpecChange} />
        ) : (
          <p className="text-sm text-gray-400">{t('dashboard.listings.selectSubtypeFirst')}</p>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.images')}</span>
          <ImageGalleryInput images={images} onChange={setImages} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.video')}</span>
          <VideoInput video={video} onChange={setVideo} />
        </label>
      </section>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? t('dashboard.submitting') : t('dashboard.submit')}
        </Button>
      </div>
    </form>
  );
}
