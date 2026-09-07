import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { listingService } from '@/features/listings/services/listing-service';
import { hasListingSeller } from '@/features/listings/lib/listing-detail-guards';
import { featureService } from '@/features/catalog/services/feature-service';
import { ListingDetailView } from '@/features/listings/components/detail/ListingDetailView';
import { ListingGoneView } from '@/features/listings/components/detail/ListingGoneView';
import { getSession } from '@/lib/auth/session';
import { getMyIndividualListerProfile } from '@/features/individual-lister/services/individual-lister-service';
import {
  buildPageMetadata,
  buildRealEstateListingSchema,
  getSiteUrl,
  getWebsiteSettingsForMetadata,
} from '@/lib/seo/metadata';
import { getListingCanonicalPath } from '@/lib/seo/indexing';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { isListingGoneError } from '@/lib/errors/listing-gone-error';
import type { PublicListingDetail } from '@/features/listings/types/listing-detail';

interface ListingDetailPageProps {
  params: Promise<{ slug: string }>;
}

const getListingDetailBySlug = cache((slug: string) => listingService.getBySlug(slug));

type ListingSlugResolution =
  | { status: 'found'; listing: PublicListingDetail | null }
  | { status: 'gone' };

async function resolveListingBySlug(slug: string): Promise<ListingSlugResolution> {
  try {
    const listing = await getListingDetailBySlug(slug);
    return { status: 'found', listing };
  } catch (error) {
    if (isListingGoneError(error)) {
      return { status: 'gone' };
    }
    throw error;
  }
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const settings = await getWebsiteSettingsForMetadata();
  const resolved = await resolveListingBySlug(slug);

  if (resolved.status === 'gone') {
    return buildPageMetadata(settings, {
      title: 'Listing no longer available',
      description:
        'This property listing has been removed or is no longer published on Yemen Real Estate.',
      path: getListingCanonicalPath(slug),
      robots: { index: false, follow: false },
    });
  }

  const { listing } = resolved;
  if (!listing) return { robots: { index: false, follow: false } };

  const mainPhoto = listing.photos.find((photo) => photo.is_main) ?? listing.photos[0];
  const fallbackImage =
    settings.default_listing_og_fallback_url || settings.og_image_url || settings.header_logo_url;

  return buildPageMetadata(settings, {
    title: listing.title,
    description: listing.description.slice(0, 160),
    path: getListingCanonicalPath(listing.slug),
    image: mainPhoto?.url || fallbackImage,
    type: 'article',
  });
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = await params;
  const resolved = await resolveListingBySlug(slug);

  if (resolved.status === 'gone') {
    return <ListingGoneView slug={slug} />;
  }

  const { listing } = resolved;
  if (!hasListingSeller(listing)) notFound();

  const [mainFeatures, similar, user, settings] = await Promise.all([
    featureService.getMainFeatures(),
    listing.seller.type === 'office'
      ? listingService.search({ office_id: listing.seller.id, limit: 12 })
      : Promise.resolve(null),
    getSession(),
    getWebsiteSettingsForMetadata(),
  ]);

  const similarListings = similar?.items.filter((item) => item.id !== listing.id) ?? [];
  const savedIds = user
    ? await listingService.getSavedListingIds([listing.id, ...similarListings.map((item) => item.id)])
    : [];

  const individualListerProfile =
    user && user.role !== 'office' ? await getMyIndividualListerProfile() : null;

  const isOwnListing =
    listing.seller.type === 'individual'
    && individualListerProfile?.id === listing.seller.id;

  const canStartMessage = Boolean(user) && user!.role !== 'office' && !isOwnListing;
  const listingSchema = buildRealEstateListingSchema(settings, listing, getSiteUrl(settings));

  return (
    <>
      <JsonLdScript data={listingSchema} />
      <ListingDetailView
        listing={listing}
        mainFeatures={mainFeatures}
        similarListings={similarListings}
        isAuthenticated={Boolean(user)}
        canStartMessage={canStartMessage}
        isSaved={savedIds.includes(listing.id)}
        similarSavedIds={savedIds}
      />
    </>
  );
}
