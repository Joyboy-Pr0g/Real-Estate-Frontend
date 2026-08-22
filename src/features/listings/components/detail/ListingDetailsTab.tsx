import { Check, X } from 'lucide-react';
import { getCatalogIcon } from '@/features/catalog/utils/catalog-icons';
import { PublicMainFeature } from '@/features/catalog/types/feature';
import { cn } from '@/lib/utils/cn';
import { getServerTranslations } from '@/lib/i18n/server';

interface ListingDetailsTabProps {
  description: string;
  mainFeatures: PublicMainFeature[];
  featuresIds: string[];
}

export async function ListingDetailsTab({ description, mainFeatures, featuresIds }: ListingDetailsTabProps) {
  const { t } = await getServerTranslations();
  const featuresIdSet = new Set(featuresIds);
  const categoriesWithFeatures = mainFeatures.filter((main) => main.sub_features.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-base font-bold text-primary-dark">{t('detail.details.description')}</h3>
        <p className="whitespace-pre-line text-sm leading-7 text-gray-600">{description}</p>
      </div>

      <div>
        <h3 className="mb-4 text-base font-bold text-primary-dark">{t('detail.details.features')}</h3>

        {categoriesWithFeatures.length === 0 ? (
          <p className="text-sm text-gray-500">{t('detail.details.noFeatures')}</p>
        ) : (
          <div className="space-y-5">
            {categoriesWithFeatures.map((main) => (
              <div key={main.id}>
                <p className="mb-2.5 text-sm font-semibold text-gray-500">{main.name}</p>
                <div className="flex flex-wrap gap-2">
                  {main.sub_features.map((sub) => {
                    const available = featuresIdSet.has(sub.id);
                    const Icon = getCatalogIcon(sub.icon);
                    return (
                      <span
                        key={sub.id}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors',
                          available
                            ? 'bg-brand-muted text-brand-dark ring-brand/15'
                            : 'bg-gray-50 text-gray-400 ring-gray-100 line-through decoration-gray-300',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {sub.name}
                        {available ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
