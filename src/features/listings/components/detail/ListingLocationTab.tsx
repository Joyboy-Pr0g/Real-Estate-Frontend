'use client';

import { ListingMap } from '@/features/listings/components/detail/ListingMap';
import { NearByPointsPanel } from '@/features/listings/components/detail/NearByPointsPanel';
import { NeighborhoodDemographics } from '@/features/listings/components/detail/NeighborhoodDemographics';
import { ListingDetailNeighborhood } from '@/features/listings/types/listing-detail';

interface ListingLocationTabProps {
  listingId: string;
  latitude: number;
  longitude: number;
  address: string;
  neighborhood: ListingDetailNeighborhood;
}

export function ListingLocationTab({ listingId, latitude, longitude, address, neighborhood }: ListingLocationTabProps) {
  return (
    <div>
      <ListingMap listingId={listingId} latitude={latitude} longitude={longitude} address={address} />
      <NearByPointsPanel listingId={listingId} />
      <NeighborhoodDemographics neighborhood={neighborhood} />
    </div>
  );
}
