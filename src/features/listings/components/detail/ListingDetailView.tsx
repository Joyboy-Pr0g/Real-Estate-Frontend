import { Container } from '@/components/ui/container';
import { ListingBreadcrumb } from '@/features/listings/components/detail/ListingBreadcrumb';
import { ListingTitleBar } from '@/features/listings/components/detail/ListingTitleBar';
import { ListingOfficeCard } from '@/features/listings/components/detail/ListingOfficeCard';
import { ListingContactAside } from '@/features/listings/components/detail/ListingContactAside';
import { ListingGallery } from '@/features/listings/components/detail/ListingGallery';
import { ListingSpecGrid } from '@/features/listings/components/detail/ListingSpecGrid';
import { ListingContentTabs } from '@/features/listings/components/detail/ListingContentTabs';
import { ListingDetailsTab } from '@/features/listings/components/detail/ListingDetailsTab';
import { ListingLocationTab } from '@/features/listings/components/detail/ListingLocationTab';
import { ListingHistoryTab } from '@/features/listings/components/detail/ListingHistoryTab';
import { ListingMetricsTab } from '@/features/listings/components/detail/ListingMetricsTab';
import { isSaleTransaction } from '@/features/listings/lib/listing-transaction';
import { SimilarOfficeListings } from '@/features/listings/components/detail/SimilarOfficeListings';
import { StickyListingHeader } from '@/features/listings/components/detail/StickyListingHeader';
import { ViewTracker } from '@/features/listings/components/detail/ViewTracker';
import { PublicListingDetail } from '@/features/listings/types/listing-detail';
import { PublicMainFeature } from '@/features/catalog/types/feature';
import { PublicListing } from '@/features/listings/types/listing';

interface ListingDetailViewProps {
  listing: PublicListingDetail;
  // mainFeatures: PublicMainFeature[];
  similarListings: PublicListing[];
  isAuthenticated: boolean;
  canStartMessage?: boolean;
  isSaved?: boolean;
  similarSavedIds?: string[];
}

export function ListingDetailView({
  listing,
  // mainFeatures,
  similarListings,
  isAuthenticated,
  canStartMessage = false,
  isSaved = false,
  similarSavedIds = [],
}: ListingDetailViewProps) {
  const showMetricsTab = isSaleTransaction(listing.transaction_type.name);
  const hasSeller = Boolean(listing.seller);

  return (
    <div className="py-4">
      <Container className="max-w-8xl">
        <div className="space-y-3">
          <ListingBreadcrumb listing={listing} />
          <ListingTitleBar
            listingId={listing.id}
            listingSlug={listing.slug}
            title={listing.title}
            isAuthenticated={isAuthenticated}
            initialSaved={isSaved}
          />

          <div
            className={
              hasSeller
                ? 'grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_min(22rem,30%)] lg:items-start lg:gap-6'
                : 'flex flex-col gap-4'
            }
          >
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <ListingGallery
                title={listing.title}
                photos={listing.photos}
                videoUrl={listing.video_url}
                videoThumbnail={listing.video_thumbnail}
                customId={listing.custom_id}
                propertyType={listing.property_type}
                subtype={listing.property_subtype}
                transactionType={listing.transaction_type}
                publishedAt={listing.published_at}
                updatedAt={listing.updated_at}
                address={listing.address}
                metaLayout={hasSeller ? 'inline' : 'stacked'}
              />
            </div>

            {listing.seller ? (
              <aside className="min-w-0 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start">
                <ListingContactAside
                  price={listing.price}
                  yerVariant={listing.yer_variant}
                  priceType={listing.price_type}
                  listingId={listing.id}
                  listingSlug={listing.slug}
                  isAuthenticated={isAuthenticated}
                  canStartMessage={canStartMessage}
                >
                  <ListingOfficeCard seller={listing.seller} />
                </ListingContactAside>
              </aside>
            ) : null}

            <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
              <ListingSpecGrid
                price={listing.price}
                priceType={listing.price_type}
                yerVariant={listing.yer_variant}
                specs={listing.property_specs}
                schema={listing.property_subtype.spec_schema}
                showPriceHeader={!hasSeller}
                specColumnLayout={hasSeller ? 'wide' : 'default'}
              />

              <ListingContentTabs
                details={
                  <ListingDetailsTab
                    description={listing.description}
                    // mainFeatures={mainFeatures}
                    featuresIds={listing.features_ids}
                  />
                }
                location={
                  <ListingLocationTab
                    listingId={listing.id}
                    latitude={Number(listing.latitude)}
                    longitude={Number(listing.longitude)}
                    address={listing.address}
                    neighborhood={listing.neighborhood}
                  />
                }
                history={
                  listing.histories.length > 0 ? (
                    <ListingHistoryTab histories={listing.histories} yerVariant={listing.yer_variant} />
                  ) : undefined
                }
                metrics={showMetricsTab ? <ListingMetricsTab listingId={listing.id} /> : undefined}
              />
            </div>
          </div>

          {listing.seller ? (
            <StickyListingHeader
              listingId={listing.id}
              listingSlug={listing.slug}
              listingPhoto={listing.photos.find((photo) => photo.is_main)?.url}
              title={listing.title}
              price={listing.price}
              yerVariant={listing.yer_variant}
              isAuthenticated={isAuthenticated}
              canStartMessage={canStartMessage}
              initialSaved={isSaved}
            />
          ) : null}

          {listing.seller?.type === 'office' ? (
            <SimilarOfficeListings
              officeName={listing.seller.name}
              listings={similarListings}
              isAuthenticated={isAuthenticated}
              savedIds={similarSavedIds}
            />
          ) : null}
        </div>
      </Container>

      <ViewTracker listingId={listing.id} isAuthenticated={isAuthenticated} />
    </div>
  );
}
