import { HomeHero } from '@/features/home/components/HomeHero';
import { HomeHeroHeading } from '@/features/home/components/HomeHeroHeading';
import { TrustMarquee } from '@/features/home/components/TrustMarquee';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { PublicCatalog } from '@/features/catalog/types/catalog';

const EMPTY_CATALOG: PublicCatalog = {
  cities: [],
  propertyTypes: [],
  transactionTypes: [],
};

export async function HomeHeroSection() {
  let catalog = EMPTY_CATALOG;

  try {
    catalog = await catalogService.getPublicCatalog();
  } catch {
    // Search pill still renders; panels will show empty lists
  }

  return (
    <section className="hero-bayut relative z-10 overflow-visible pb-8 pt-4 md:pb-10 md:pt-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 start-1/4 h-64 w-64 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute top-0 end-1/4 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
      </div>

      <HomeHeroHeading />
      <HomeHero catalog={catalog} />
      <TrustMarquee />
    </section>
  );
}
