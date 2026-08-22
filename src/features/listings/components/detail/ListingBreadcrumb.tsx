import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { buildListingsUrl } from '@/features/listings/lib/build-listings-url';
import { PublicListingDetail } from '@/features/listings/types/listing-detail';

interface ListingBreadcrumbProps {
  listing: PublicListingDetail;
}

export async function ListingBreadcrumb({ listing }: ListingBreadcrumbProps) {

  const crumbs = [
    { label: listing.property_type.name, href: buildListingsUrl({ propertyTypeSlug: listing.property_type.slug }) },
    {
      label: listing.transaction_type.display_name_ar,
      href: buildListingsUrl({
        propertyTypeSlug: listing.property_type.slug,
        transactionTypeSlug: listing.transaction_type.slug,
      }),
    },
    {
      label: listing.property_subtype.name,
      href: buildListingsUrl({
        propertyTypeSlug: listing.property_type.slug,
        transactionTypeSlug: listing.transaction_type.slug,
        propertySubtypeSlug: listing.property_subtype.slug,
      }),
    },
    { label: listing.city.name, href: buildListingsUrl({ cityPcode: listing.city.pcode }) },
    { label: listing.neighborhood.name, href: undefined },
  ];

  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
      {crumbs.map((crumb, i) => (
        <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
          {i > 0 ? <ChevronLeft className="h-3 w-3 rtl:rotate-180" /> : null}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-brand-dark hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-primary-dark font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
