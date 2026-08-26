'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
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
import { cn } from '@/lib/utils/cn';

interface CreateListingFormProps {
  propertyTypes: PublicPropertyType[];
  transactionTypes: PublicTransactionType[];
  cities: PublicCity[];
  offices?: MyOffice[];
  redirectPath?: string;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-start outline-none focus:border-brand/40 focus:bg-white';

const tabTriggerClass =
  'inline-flex shrink-0 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 data-[state=active]:bg-brand-muted data-[state=active]:text-brand-dark sm:px-4';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-primary-dark">{children}</span>;
}

export function CreateListingForm({
  propertyTypes,
  transactionTypes,
  cities,
  offices = [],
  redirectPath = '/dashboard/listings',
}: CreateListingFormProps) {
  const { t, dir } = useLocale();
  const router = useRouter();

  const verifiedOffices = useMemo(
    () => offices.filter((office) => office.verification_status === 'verified'),
    [offices],
  );
  const isOfficeFlow = verifiedOffices.length > 0;

  const [selectedOfficeId, setSelectedOfficeId] = useState('');
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

    if (isOfficeFlow && !selectedOfficeId) {
      toast.error(t('dashboard.listings.officeRequired'));
      return;
    }

    if (images.length === 0) {
      toast.error(t('dashboard.listings.imagesRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (selectedOfficeId) formData.append('office_id', selectedOfficeId);
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
    <form onSubmit={handleSubmit} dir={dir} className="mx-auto w-full max-w-3xl text-start">
      <Tabs.Root defaultValue="main" dir={dir} className="rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)]">
        <Tabs.List className="flex gap-1 overflow-x-auto border-b border-gray-100 p-2">
          <Tabs.Trigger value="main" className={tabTriggerClass}>
            {t('dashboard.listings.tabMain')}
          </Tabs.Trigger>
          <Tabs.Trigger value="address" className={tabTriggerClass}>
            {t('dashboard.listings.tabAddress')}
          </Tabs.Trigger>
          <Tabs.Trigger value="specs" className={tabTriggerClass}>
            {t('dashboard.listings.tabSpecs')}
          </Tabs.Trigger>
          <Tabs.Trigger value="media" className={tabTriggerClass}>
            {t('dashboard.listings.tabMedia')}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="main" className="space-y-4 p-6">
          {isOfficeFlow ? (
            <label className="block max-w-md space-y-1.5">
              <FieldLabel>{t('dashboard.listings.selectOffice')}</FieldLabel>
              <select
                required
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                className={fieldClass}
              >
                <option value="">—</option>
                {verifiedOffices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block space-y-1.5">
              <FieldLabel>{t('dashboard.listings.propertyType')}</FieldLabel>
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
              <FieldLabel>{t('dashboard.listings.propertySubtype')}</FieldLabel>
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
                
                {loadingSubtypes ? (
                  <option value="">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </option>
                ) : <option value="">—</option>}
                {propertySubtypes.map((subtype) => (
                  <option key={subtype.id} value={subtype.id}>
                    {subtype.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5 sm:col-span-2 lg:col-span-1">
              <FieldLabel>{t('dashboard.listings.transactionType')}</FieldLabel>
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

          <label className="block max-w-xl space-y-1.5">
            <FieldLabel>{t('dashboard.listings.title')}</FieldLabel>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
          </label>

          <label className="block space-y-1.5">
            <FieldLabel>{t('dashboard.listings.description')}</FieldLabel>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={cn(fieldClass, 'min-h-28 py-2.5')}
            />
          </label>

          <label className="block max-w-xs space-y-1.5">
            <FieldLabel>{t('dashboard.listings.price')}</FieldLabel>
            <input
              required
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={price}
              onChange={(e) => {
                // Only allow numbers and at most one decimal point
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  setPrice(val);
                }
              }}
              className={fieldClass}
            />
          </label>
 
        </Tabs.Content>

        <Tabs.Content value="address" className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <FieldLabel>{t('admin.city')}</FieldLabel>
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
              <FieldLabel>{t('dashboard.neighborhood')}</FieldLabel>
              <select
                required
                value={neighborhoodId}
                onChange={(e) => setNeighborhoodId(e.target.value)}
                disabled={!cityId || loadingNeighborhoods}
                className={fieldClass}
              >
                {loadingNeighborhoods ? (
                  <option value="">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </option>
                ) : <option value="">—</option>}
                {neighborhoods.map((neighborhood) => (
                  <option key={neighborhood.id} value={neighborhood.id}>
                    {neighborhood.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1.5">
            <FieldLabel>{t('dashboard.address')}</FieldLabel>
            <input required value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClass} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <FieldLabel>{t('dashboard.listings.latitude')}</FieldLabel>
              <input
                required
                inputMode="decimal"
                dir="ltr"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block space-y-1.5">
              <FieldLabel>{t('dashboard.listings.longitude')}</FieldLabel>
              <input
                required
                inputMode="decimal"
                dir="ltr"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>
        </Tabs.Content>

        <Tabs.Content value="specs" className="p-6">
          {selectedSubtype ? (
            <ListingSpecFieldsInput schema={selectedSubtype.spec_schema} values={specs} onChange={handleSpecChange} />
          ) : (
            <p className="text-sm text-gray-400">{t('dashboard.listings.selectSubtypeFirst')}</p>
          )}
        </Tabs.Content>

        <Tabs.Content value="media" className="space-y-6 p-6">
          <label className="block space-y-1.5">
            <FieldLabel>{t('dashboard.listings.images')}</FieldLabel>
            <ImageGalleryInput images={images} onChange={setImages} />
          </label>

          <label className="block space-y-1.5">
            <FieldLabel>{t('dashboard.listings.video')}</FieldLabel>
            <VideoInput video={video} onChange={setVideo} />
          </label>

          <div className={cn('flex pt-2', dir === 'rtl' ? 'justify-start' : 'justify-end')}>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('dashboard.submitting') : t('dashboard.submit')}
            </Button>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </form>
  );
}
