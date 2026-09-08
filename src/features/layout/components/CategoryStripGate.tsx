'use client';

import { usePathname } from 'next/navigation';
import { Container } from '@/components/ui/container';

interface CategoryStripGateProps {
  children: React.ReactNode;
}

/** Client gate — hides category strip on homepage. Server children stay async RSC. */
export function CategoryStripGate({ children }: CategoryStripGateProps) {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <div className="border-b border-gray-100 bg-white">
      <Container className="max-w-8xl py-2">{children}</Container>
    </div>
  );
}
