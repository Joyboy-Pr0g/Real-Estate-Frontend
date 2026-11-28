import { Suspense } from 'react';
import { AdminNeighborhoodsContent } from '@/features/admin/components/neighborhoods/AdminNeighborhoodsContent';
import { Container } from '@/components/ui/container';

interface PageProps {
  searchParams: Promise<{ search?: string; city_id?: string }>;
}

function Skeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

export default function AdminNeighborhoodsPage(props: PageProps) {
  return (
    <Container className="py-8">
      <Suspense fallback={<Skeleton />}>
        <AdminNeighborhoodsContent {...props} />
      </Suspense>
    </Container>
  );
}
