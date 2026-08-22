import { Container } from '@/components/ui/container';
import { ListingBreadcrumb } from '@/features/listings/components/detail/ListingBreadcrumb';
import { ListingTitleBar } from '@/features/listings/components/detail/ListingTitleBar';
import { ListingOfficeCard } from '@/features/listings/components/detail/ListingOfficeCard';
import { ListingGallery } from '@/features/listings/components/detail/ListingGallery';
import { ListingSpecGrid } from '@/features/listings/components/detail/ListingSpecGrid';
import { ListingContentTabs } from '@/features/listings/components/detail/ListingContentTabs';
import { ListingDetailsTab } from '@/features/listings/components/detail/ListingDetailsTab';
import { ListingLocationTab } from '@/features/listings/components/detail/ListingLocationTab';
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
}

export function ListingDetailView({
  listing,
  mainFeatures,
  similarListings,
  isAuthenticated,
}: ListingDetailViewProps) {
  return (
    <div className="py-6">
      <Container>
        <div className="space-y-4">
          <ListingBreadcrumb listing={listing} />
          <ListingTitleBar listingId={listing.id} title={listing.title} isAuthenticated={isAuthenticated} />
          <ListingOfficeCard office={listing.office} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ListingGallery
                title={listing.title}
                photos={listing.photos}
                videoUrl={listing.video_url}
                videoThumbnail={listing.video_thumbnail}
              />
            </div>
            <div className="lg:col-span-1">
              <ListingSpecGrid
                price={listing.price}
                customId={listing.custom_id}
                propertyType={listing.property_type}
                transactionType={listing.transaction_type}
                publishedAt={listing.published_at}
                cityName={listing.city.name}
                neighborhoodName={listing.neighborhood.name}
                address={listing.address}
                specs={listing.property_specs}
                schema={listing.property_subtype.spec_schema}
              />
            </div>
          </div>

          <StickyListingHeader
            listingId={listing.id}
            title={listing.title}
            price={listing.price}
            cityName={listing.city.name}
            neighborhoodName={listing.neighborhood.name}
            specs={listing.property_specs}
            specSchema={listing.property_subtype.spec_schema}
            office={listing.office}
            isAuthenticated={isAuthenticated}
          />

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
          />

          <SimilarOfficeListings officeName={listing.office.name} listings={similarListings} />
        </div>
      </Container>

      <ViewTracker listingId={listing.id} isAuthenticated={isAuthenticated} />
    </div>
  );
}
