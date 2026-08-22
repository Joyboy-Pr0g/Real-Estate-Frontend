import { getSpecIcon } from '@/features/listings/lib/spec-icon-map';
import {
  formatSpecDisplayValue,
  getOrderedSpecEntries,
  getSpecFieldLabel,
} from '@/features/listings/lib/property-spec-display';
import { SpecTile } from '@/features/listings/components/detail/SpecTile';
import { ListingPropertySpecs } from '@/features/listings/types/listing-detail';
import { PropertySpecSchema } from '@/features/catalog/types/property-subtype';
import { formatPriceYER } from '@/lib/utils/currency';
import { getServerTranslations } from '@/lib/i18n/server';

interface ListingSpecGridProps {
  price: string;
  specs: ListingPropertySpecs;
  schema: PropertySpecSchema | null | undefined;
}

export async function ListingSpecGrid({ price, specs, schema }: ListingSpecGridProps) {
  const { t } = await getServerTranslations();
  const entries = getOrderedSpecEntries(specs, schema);
  const booleanLabels = { yes: t('detail.specs.yes'), no: t('detail.specs.no') };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-(--shadow-soft) ring-1 ring-gray-100">
      <p className="text-2xl font-bold text-primary-dark">{formatPriceYER(price)}</p>

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
