'use client';

import { SearchPill } from '@/features/home/components/SearchPill';
import { PublicCatalog } from '@/features/catalog/types/catalog';

interface HomeHeroProps {
  catalog: PublicCatalog;
}

export function HomeHero({ catalog }: HomeHeroProps) {
  return (
    <div className="hero-search relative z-30 w-full">
      <SearchPill catalog={catalog} variant="hero-row" />
    </div>
  );
}
