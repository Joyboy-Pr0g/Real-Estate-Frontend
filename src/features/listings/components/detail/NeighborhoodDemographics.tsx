import { Cake, Users } from 'lucide-react';
import { ListingDetailNeighborhood } from '@/features/listings/types/listing-detail';
import { useLocale } from '@/lib/i18n/locale-provider';

interface NeighborhoodDemographicsProps {
  neighborhood: ListingDetailNeighborhood;
}

export function NeighborhoodDemographics({ neighborhood }: NeighborhoodDemographicsProps) {
  const { t } = useLocale();
  const { avg_age, population, avg_male, avg_female } = neighborhood;

  const hasAnyStat = [avg_age, population, avg_male, avg_female].some(
    (v) => v !== null && v !== undefined,
  );

  if (!hasAnyStat) return null;

  const stats = [
    population != null ? { icon: Users, label: t('detail.demographics.population'), value: population.toLocaleString() } : null,
    avg_age != null ? { icon: Cake, label: t('detail.demographics.avgAge'), value: String(avg_age) } : null,
  ].filter(Boolean) as { icon: typeof Users; label: string; value: string }[];

  return (
    <div className="mt-6">
      <h4 className="mb-3 text-sm font-bold text-primary-dark">{t('detail.demographics.title')}</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-gray-50/70 p-3 text-center">
            <stat.icon className="mx-auto mb-1.5 h-4 w-4 text-brand" />
            <p className="text-sm font-bold text-primary-dark">{stat.value}</p>
            <p className="text-[11px] text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
