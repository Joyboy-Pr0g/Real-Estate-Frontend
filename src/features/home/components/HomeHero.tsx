'use client';

import { SearchPill } from '@/features/home/components/SearchPill';
import { PublicCatalog } from '@/features/catalog/types/catalog';
import { Reveal } from '@/lib/motion/reveal';
import { Container } from '@/components/ui/container';

interface HomeHeroProps {
  catalog: PublicCatalog;
}

export function HomeHero({ catalog }: HomeHeroProps) {
  return (
    <Container className="relative">
      <Reveal immediate className="relative z-30">
        <SearchPill catalog={catalog} />
      </Reveal>
    </Container>
  );
}
