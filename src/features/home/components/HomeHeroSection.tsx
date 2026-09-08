import { Suspense } from 'react';
import { HomeHero } from '@/features/home/components/HomeHero';
import { HomeHeroHeading } from '@/features/home/components/HomeHeroHeading';
import { HomeHeroMotion } from '@/features/home/components/HomeHeroMotion';
import { HomeHeroVisual } from '@/features/home/components/HomeHeroVisual';
import { CategoryNavBar } from '@/features/home/components/CategoryNavBar';
import { CategoryNavSkeleton } from '@/features/home/components/CategoryNav';
import { catalogService } from '@/features/catalog/services/catalog-service';
import { Container } from '@/components/ui/container';
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
    <section className="relative z-10 min-h-[560px] overflow-hidden bg-[#163d2e] md:min-h-[620px] lg:min-h-[680px]">
      <HomeHeroMotion>
        <HomeHeroVisual />

        <div className="relative z-10 flex min-h-[560px] flex-col md:min-h-[620px] lg:min-h-[680px]">
          <Container className="flex flex-1 flex-col justify-center py-10 md:py-14 lg:py-16">
            <div className="max-w-4xl">
              <HomeHeroHeading />
              <div className="mt-8 md:mt-10">
                <HomeHero catalog={catalog} />
              </div>
            </div>
          </Container>

          <div className="relative border-t border-white/10 bg-white/[0.97] py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.12)]">
            <Container>
              <Suspense fallback={<CategoryNavSkeleton centered />}>
                <CategoryNavBar />
              </Suspense>
            </Container>
          </div>
        </div>
      </HomeHeroMotion>
    </section>
  );
}
