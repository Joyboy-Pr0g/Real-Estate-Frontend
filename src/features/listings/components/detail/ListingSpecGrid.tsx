import { getSpecIcon } from '@/features/listings/lib/spec-icon-map';
import { ListingPropertySpecs } from '@/features/listings/types/listing-detail';
import { PropertySpecSchema } from '@/features/catalog/types/property-subtype';
import { formatPriceYER } from '@/lib/utils/currency';
import { getServerTranslations } from '@/lib/i18n/server';

interface ListingSpecGridProps {
  price: string;
  specs: ListingPropertySpecs;
  schema: PropertySpecSchema | null;
}

function humanizeKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

export async function ListingSpecGrid({ price, specs, schema }: ListingSpecGridProps) {
  const { t } = await getServerTranslations();
  const entries = Object.entries(specs);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-gray-100">
      <p className="text-2xl font-bold text-primary-dark">{formatPriceYER(price)}</p>

      {entries.length > 0 ? (
        <>
          <p className="mt-4 mb-3 text-sm font-semibold text-gray-500">{t('detail.specs.title')}</p>
          <div className="grid grid-cols-2 gap-3">
            {entries.map(([key, value]) => {
              const field = schema?.fields[key];
              const Icon = getSpecIcon(key);
              const label = field?.label ?? humanizeKey(key);

              let displayValue: string;
              if (typeof value === 'boolean') {
                displayValue = value ? t('detail.specs.yes') : t('detail.specs.no');
              } else if (field?.type === 'enum') {
                displayValue = field.options?.find((o) => o.value === String(value))?.label ?? String(value);
              } else {
                displayValue = String(value);
              }

              return (
                <div key={key} className="flex items-start gap-2.5 rounded-xl bg-gray-50/70 p-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-500">{label}</p>
                    <p className="truncate text-sm font-semibold text-primary-dark">{displayValue}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
