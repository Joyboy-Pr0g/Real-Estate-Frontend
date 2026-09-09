import type { ListingDetailPhoto } from '@/features/listings/types/listing-detail';

export interface ListingImageDraft {
  id: string;
  file: File;
}

export function createListingImageDraft(file: File): ListingImageDraft {
  return { id: crypto.randomUUID(), file };
}

export function buildCreateImageMeta(images: ListingImageDraft[], mainImageId: string | null) {
  const resolvedMainId = mainImageId ?? images[0]?.id ?? null;

  return images.map((item, index) => ({
    order: index,
    is_main: item.id === resolvedMainId,
  }));
}

export function sortPhotosByOrder(photos: ListingDetailPhoto[]): ListingDetailPhoto[] {
  return [...photos].sort((a, b) => a.order - b.order);
}

export function buildImagesOrderPayload(photos: ListingDetailPhoto[]) {
  return sortPhotosByOrder(photos).map((photo, index) => ({
    public_id: photo.public_id,
    order: index,
  }));
}
