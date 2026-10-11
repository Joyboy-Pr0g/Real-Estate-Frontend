import { getSpecIcon } from '@/features/listings/lib/spec-icon-map';
import {
  formatSpecDisplayValue,
  getOrderedSpecEntries,
  getSpecFieldLabel,
} from '@/features/listings/lib/property-spec-display';
import { SpecTile } from '@/features/listings/components/detail/SpecTile';
import { ListingPropertySpecs } from '@/features/listings/types/listing-detail';
import { PropertySpecSchema } from '@/features/catalog/types/property-subtype';
import { ListingPriceType, ListingPriceTypeEnum, YerVariant } from '@/features/listings/types/listing';
import { formatPrice } from '@/lib/utils/currency';
import { getServerTranslations } from '@/lib/i18n/server';
import { cn } from '@/lib/utils/cn';

interface ListingSpecGridProps {
  price: string;
  priceType: ListingPriceType;
  yerVariant: YerVariant;
  specs: ListingPropertySpecs;
  schema: PropertySpecSchema | null | undefined;
  showPriceHeader?: boolean;
  specColumnLayout?: 'default' | 'wide';
}

export async function ListingSpecGrid({
  price,
  priceType,
  yerVariant,
  specs,
  schema,
  showPriceHeader = true,
  specColumnLayout = 'default',
}: ListingSpecGridProps) {
  const { t } = await getServerTranslations();
  const entries = getOrderedSpecEntries(specs, schema);
  const booleanLabels = { yes: t('detail.specs.yes'), no: t('detail.specs.no') };

  const specGridClass =
    specColumnLayout === 'wide'
      ? 'grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4'
      : 'grid grid-cols-2 gap-3';

  return (
    <div className="rounded-2xl bg-white p-5 shadow-(--shadow-soft) ring-1 ring-gray-100">
      {showPriceHeader ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-primary-dark">
              {formatPrice(price, yerVariant)}
            </span>
          </div>

          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
              priceType === ListingPriceTypeEnum.NEGOTIABLE
                ? 'bg-amber-50 text-amber-700 ring-amber-200'
                : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {priceType === ListingPriceTypeEnum.NEGOTIABLE ? t('card.negotiable') : t('card.fixed')}
          </span>
        </div>
      ) : null}

      {entries.length > 0 ? (
        <>
          <p className={cn('mb-3 text-sm font-semibold text-gray-500', showPriceHeader ? 'mt-4' : 'mt-0')}>
            {t('detail.specs.title')}
          </p>
          <div className={specGridClass}>
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
