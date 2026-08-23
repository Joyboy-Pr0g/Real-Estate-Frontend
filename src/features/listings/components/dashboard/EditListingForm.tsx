'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface EditListingFormProps {
  listing: PublicListingDetail;
  cities: PublicCity[];
  initialNeighborhoods: PublicNeighborhood[];
  redirectPath?: string;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

export function EditListingForm({
  listing,
  cities,
  initialNeighborhoods,
  redirectPath = '/dashboard/listings',
}: EditListingFormProps) {
  const { t } = useLocale();
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
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <span className="block text-xs font-medium text-gray-400">{t('dashboard.listings.propertyType')}</span>
            <span className="font-medium text-primary-dark">{listing.property_type.name}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-400">{t('dashboard.listings.propertySubtype')}</span>
            <span className="font-medium text-primary-dark">{listing.property_subtype.name}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-400">{t('dashboard.listings.transactionType')}</span>
            <span className="font-medium text-primary-dark">
              {listing.transaction_type.display_name_ar || listing.transaction_type.name}
            </span>
          </div>
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
        <ListingSpecFieldsInput
          schema={listing.property_subtype.spec_schema!}
          values={specs}
          onChange={handleSpecChange}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.images')}</span>
          <ExistingPhotosGallery listingId={listing.id} photos={existingPhotos} onPhotosChange={setExistingPhotos} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.addImages')}</span>
          <ImageGalleryInput images={newImages} onChange={setNewImages} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.listings.video')}</span>
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
      </section>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? t('dashboard.submitting') : t('dashboard.submit')}
        </Button>
      </div>
    </form>
  );
}
