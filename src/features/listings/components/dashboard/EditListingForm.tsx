'use client';

import { FormEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as Tabs from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { ListingSpecFieldsInput } from '@/features/listings/components/dashboard/ListingSpecFieldsInput';
import { ImageGalleryInput } from '@/features/listings/components/dashboard/ImageGalleryInput';
import { VideoInput } from '@/features/listings/components/dashboard/VideoInput';
import { ExistingPhotosGallery } from '@/features/listings/components/dashboard/ExistingPhotosGallery';
import { ExistingVideoPreview } from '@/features/listings/components/dashboard/ExistingVideoPreview';
import { updateListing } from '@/features/listings/services/listing-client';
import { PublicCity } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { PublicListingDetail, ListingPropertySpecs } from '@/features/listings/types/listing-detail';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface EditListingFormProps {
  listing: PublicListingDetail;
  cities: PublicCity[];
  initialNeighborhoods: PublicNeighborhood[];
  redirectPath?: string;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-start outline-none focus:border-brand/40 focus:bg-white';

const tabTriggerClass =
  'inline-flex shrink-0 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 data-[state=active]:bg-brand-muted data-[state=active]:text-brand-dark sm:px-4';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-primary-dark">{children}</span>;
}

export function EditListingForm({
  listing,
  cities,
  initialNeighborhoods,
  redirectPath = '/dashboard/listings',
}: EditListingFormProps) {
  const { t, dir } = useLocale();
  const router = useRouter();

  const [title, setTitle] = useState(listing.title);
  const [description, setDescription] = useState(listing.description);
  const [price, setPrice] = useState(listing.price);
  const [cityId, setCityId] = useState(listing.city.id);
  const [neighborhoodId, setNeighborhoodId] = useState(listing.neighborhood.id);
  const [neighborhoods, setNeighborhoods] = useState<PublicNeighborhood[]>(initialNeighborhoods);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [address, setAddress] = useState(listing.address);
  const [latitude, setLatitude] = useState(listing.latitude);
  const [longitude, setLongitude] = useState(listing.longitude);
  const [specs, setSpecs] = useState<ListingPropertySpecs>(listing.property_specs);
  const [existingPhotos, setExistingPhotos] = useState(listing.photos);
  const [existingVideo, setExistingVideo] = useState(
    listing.video_url && listing.video_public_id
      ? { url: listing.video_url, public_id: listing.video_public_id }
      : null,
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
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

    if (existingPhotos.length === 0 && newImages.length === 0) {
      toast.error(t('dashboard.listings.imagesRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', price.trim());
      formData.append('city_id', cityId);
      formData.append('neighborhood_id', neighborhoodId);
      formData.append('address', address.trim());
      formData.append('latitude', latitude.trim());
      formData.append('longitude', longitude.trim());
      formData.append('property_specs', JSON.stringify(specs));
      newImages.forEach((image) => formData.append('images', image));
      if (video) formData.append('video', video);

      await updateListing(listing.id, formData);
      toast.success(t('dashboard.listings.updated'));
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-gray-400">{t('dashboard.listings.propertyType')}</span>
              <p className="text-sm font-medium text-primary-dark">{listing.property_type.name}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-gray-400">{t('dashboard.listings.propertySubtype')}</span>
              <p className="text-sm font-medium text-primary-dark">{listing.property_subtype.name}</p>
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-medium text-gray-400">{t('dashboard.listings.transactionType')}</span>
              <p className="text-sm font-medium text-primary-dark">
                {listing.transaction_type.display_name_ar || listing.transaction_type.name}
              </p>
            </div>
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
                ) : (
                  <option value="">—</option>
                )}
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
          {listing.property_subtype.spec_schema ? (
            <ListingSpecFieldsInput
              schema={listing.property_subtype.spec_schema}
              values={specs}
              onChange={handleSpecChange}
            />
          ) : (
            <p className="text-sm text-gray-400">{t('dashboard.listings.selectSubtypeFirst')}</p>
          )}
        </Tabs.Content>

        <Tabs.Content value="media" className="space-y-6 p-6">
          <label className="block space-y-1.5">
            <FieldLabel>{t('dashboard.listings.images')}</FieldLabel>
            <ExistingPhotosGallery listingId={listing.id} photos={existingPhotos} onPhotosChange={setExistingPhotos} />
          </label>

          <label className="block space-y-1.5">
            <FieldLabel>{t('dashboard.listings.addImages')}</FieldLabel>
            <ImageGalleryInput images={newImages} onChange={setNewImages} />
          </label>

          <label className="block space-y-1.5">
            <FieldLabel>{t('dashboard.listings.video')}</FieldLabel>
            {existingVideo ? (
              <ExistingVideoPreview
                listingId={listing.id}
                videoUrl={existingVideo.url}
                videoPublicId={existingVideo.public_id}
                onRemoved={() => setExistingVideo(null)}
              />
            ) : (
              <VideoInput video={video} onChange={setVideo} />
            )}
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
