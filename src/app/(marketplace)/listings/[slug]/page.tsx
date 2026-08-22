import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { listingService } from '@/features/listings/services/listing-service';
import { featureService } from '@/features/catalog/services/feature-service';
import { ListingDetailView } from '@/features/listings/components/detail/ListingDetailView';
import { getSession } from '@/lib/auth/session';

interface ListingDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await listingService.getBySlug(slug);
  if (!listing) return {};

  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = await params;
  const listing = await listingService.getBySlug(slug);
  if (!listing) notFound();

  const [mainFeatures, similar, user] = await Promise.all([
    featureService.getMainFeatures(),
    listingService.search({ office_id: listing.office.id, limit: 12 }),
    getSession(),
  ]);

  return (
    <ListingDetailView
      listing={listing}
      mainFeatures={mainFeatures}
      similarListings={similar.items.filter((item) => item.id !== listing.id)}
      isAuthenticated={Boolean(user)}
    />
  );
}
