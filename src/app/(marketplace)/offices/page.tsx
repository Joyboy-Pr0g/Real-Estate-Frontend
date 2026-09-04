import { Suspense } from 'react';
import { OfficesContent } from '@/features/office/components/public/OfficesContent';

interface OfficesPageProps {
  searchParams: Promise<{
    cityId?: string;
    neighborhoodId?: string;
    search?: string;
    cursor?: string;
  }>;
}

export default function OfficesPage({ searchParams }: OfficesPageProps) {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-7xl animate-pulse rounded-2xl bg-gray-100 px-4 py-10" />}>
      <OfficesContent searchParams={searchParams} />
    </Suspense>
  );
}
