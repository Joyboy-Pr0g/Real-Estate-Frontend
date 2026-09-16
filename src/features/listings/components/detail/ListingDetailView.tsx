import { Container } from '@/components/ui/container';
import { ListingBreadcrumb } from '@/features/listings/components/detail/ListingBreadcrumb';
import { ListingTitleBar } from '@/features/listings/components/detail/ListingTitleBar';
import { ListingOfficeCard } from '@/features/listings/components/detail/ListingOfficeCard';
import { ListingGallery } from '@/features/listings/components/detail/ListingGallery';
import { ListingSpecGrid } from '@/features/listings/components/detail/ListingSpecGrid';
import { ListingContentTabs } from '@/features/listings/components/detail/ListingContentTabs';
import { ListingDetailsTab } from '@/features/listings/components/detail/ListingDetailsTab';
import { ListingLocationTab } from '@/features/listings/components/detail/ListingLocationTab';
import { ListingHistoryTab } from '@/features/listings/components/detail/ListingHistoryTab';
import { SimilarOfficeListings } from '@/features/listings/components/detail/SimilarOfficeListings';
import { StickyListingHeader } from '@/features/listings/components/detail/StickyListingHeader';
import { ViewTracker } from '@/features/listings/components/detail/ViewTracker';
import { PublicListingDetail } from '@/features/listings/types/listing-detail';
import { PublicMainFeature } from '@/features/catalog/types/feature';
import { PublicListing } from '@/features/listings/types/listing';

interface ListingDetailViewProps {
  listing: PublicListingDetail;
  mainFeatures: PublicMainFeature[];
  similarListings: PublicListing[];
  isAuthenticated: boolean;
  canStartMessage?: boolean;
  isSaved?: boolean;
  similarSavedIds?: string[];
}

export function ListingDetailView({
  listing,
  mainFeatures,
  similarListings,
  isAuthenticated,
  canStartMessage = false,
  isSaved = false,
  similarSavedIds = [],
}: ListingDetailViewProps) {
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
            canStartMessage={canStartMessage}
            initialSaved={isSaved}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1.4fr_1.2fr]">
            <div>
              <ListingGallery
                title={listing.title}
                photos={listing.photos}
                videoUrl={listing.video_url}
                videoThumbnail={listing.video_thumbnail}
                customId={listing.custom_id}
                propertyType={listing.property_type}
                transactionType={listing.transaction_type}
                publishedAt={listing.published_at}
                cityName={listing.city.name}
                neighborhoodName={listing.neighborhood.name}
                address={listing.address}
              />
            </div>
            <div>
              <ListingSpecGrid
                price={listing.price}
                priceType={listing.price_type}
                yerVariant={listing.yer_variant}
                specs={listing.property_specs}
                schema={listing.property_subtype.spec_schema}
              />
            </div>
            <div className="w-full">
              {listing.seller ? <ListingOfficeCard seller={listing.seller} /> : null}
            </div>
          </div>

          {listing.seller ? (
            <StickyListingHeader
              listingId={listing.id}
              listingSlug={listing.slug}
              title={listing.title}
              price={listing.price}
              yerVariant={listing.yer_variant}
              cityName={listing.city.name}
              neighborhoodName={listing.neighborhood.name}
              specs={listing.property_specs}
              specSchema={listing.property_subtype.spec_schema}
              seller={listing.seller}
              isAuthenticated={isAuthenticated}
              initialSaved={isSaved}
            />
          ) : null}

          <ListingContentTabs
            details={
              <ListingDetailsTab
                description={listing.description}
                mainFeatures={mainFeatures}
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
          />

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
