import { Building2, Calendar, Hash, MapPin, MapPinned } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  getPropertyTypeIcon,
  getTransactionTypeIcon,
} from '@/features/catalog/utils/catalog-icons';
import { getSpecIcon } from '@/features/listings/lib/spec-icon-map';
import {
  formatSpecDisplayValue,
  getOrderedSpecEntries,
  getSpecFieldLabel,
} from '@/features/listings/lib/property-spec-display';
import {
  PublicListingCatalogItemDetailed,
  ListingPropertySpecs,
} from '@/features/listings/types/listing-detail';
import { PropertySpecSchema } from '@/features/catalog/types/property-subtype';
import { formatPriceYER } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/format';
import { getServerTranslations } from '@/lib/i18n/server';
import { cn } from '@/lib/utils/cn';

interface ListingSpecGridProps {
  price: string;
  customId: number;
  propertyType: PublicListingCatalogItemDetailed;
  transactionType: PublicListingCatalogItemDetailed & { display_name_ar: string };
  publishedAt: string | null;
  cityName: string;
  neighborhoodName: string;
  address: string;
  specs: ListingPropertySpecs;
  schema: PropertySpecSchema | null | undefined;
}

function SpecTile({
  icon: Icon,
  label,
  value,
  wide = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl bg-gray-50/70 p-3',
        wide && 'col-span-2',
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
      <div className="min-w-0">
        <p className="text-[11px] text-gray-500">{label}</p>
        <p
          className={cn(
            'text-sm font-semibold text-primary-dark',
            wide ? 'line-clamp-2' : 'truncate',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export async function ListingSpecGrid({
  price,
  customId,
  propertyType,
  transactionType,
  publishedAt,
  cityName,
  neighborhoodName,
  address,
  specs,
  schema,
}: ListingSpecGridProps) {
  const { t } = await getServerTranslations();
  const entries = getOrderedSpecEntries(specs, schema);
  const booleanLabels = { yes: t('detail.specs.yes'), no: t('detail.specs.no') };

  const PropertyTypeIcon = getPropertyTypeIcon(propertyType.icon);
  const TransactionTypeIcon = getTransactionTypeIcon(transactionType.icon ?? '');

  return (
    <div className="rounded-2xl bg-white p-5 shadow-(--shadow-soft) ring-1 ring-gray-100">
      <p className="text-2xl font-bold text-primary-dark">{formatPriceYER(price)}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">

      </div>

      {entries.length > 0 ? (
        <>
          <p className="mt-4 mb-3 text-sm font-semibold text-gray-500">{t('detail.specs.title')}</p>
          <div className="grid grid-cols-2 gap-3">
            {entries.map(([key, value]) => {
              const Icon = getSpecIcon(key);
              const label = getSpecFieldLabel(key, schema);
              const displayValue = formatSpecDisplayValue(key, value, schema, booleanLabels);

              return (
                <SpecTile key={key} icon={Icon} label={label} value={displayValue} />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
