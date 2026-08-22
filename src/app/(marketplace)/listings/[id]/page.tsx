import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { listingService } from '@/features/listings/services/listing-service';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { featureService } from '@/features/catalog/services/feature-service';
import { ListingDetailView } from '@/features/listings/components/detail/ListingDetailView';
import { getSession } from '@/lib/auth/session';

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await listingService.getById(id);
  if (!listing) return {};

  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const listing = await listingService.getById(id);
  if (!listing) notFound();

  const [subtype, mainFeatures, similar, user] = await Promise.all([
    catalogService.getPropertySubtypeBySlug(listing.property_subtype.slug),
    featureService.getMainFeatures(),
    listingService.search({ office_id: listing.office.id, limit: 12 }),
    getSession(),
  ]);

  return (
    <ListingDetailView
      listing={listing}
      specSchema={subtype?.spec_schema ?? null}
      mainFeatures={mainFeatures}
      similarListings={similar.items.filter((item) => item.id !== listing.id)}
      isAuthenticated={Boolean(user)}
    />
  );
}
