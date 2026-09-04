import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { OfficeDetailView } from '@/features/office/components/public/OfficeDetailView';
import { decodeOfficeNameParam } from '@/features/office/lib/office-url';
import { publicOfficeService } from '@/features/office/services/public-office-service';

interface OfficeDetailPageProps {
  params: Promise<{ name: string }>;
}

const getOfficeDetail = cache((name: string) => publicOfficeService.getByName(name));

export async function generateMetadata({ params }: OfficeDetailPageProps): Promise<Metadata> {
  const { name } = await params;
  const office = await getOfficeDetail(decodeOfficeNameParam(name));
  if (!office) return {};

  return {
    title: office.name,
    description: `${office.name} — ${office.neighborhood}, ${office.city}`,
  };
}

export default async function OfficeDetailPage({ params }: OfficeDetailPageProps) {
  const { name: rawName } = await params;
  const name = decodeOfficeNameParam(rawName);

  const [office, listings] = await Promise.all([
    getOfficeDetail(name),
    publicOfficeService.getListings(name, { limit: 8 }),
  ]);

  if (!office) notFound();

  return (
    <Container className="py-10 md:py-14">
      <OfficeDetailView
        office={office}
        initialListings={listings.items}
        initialCursor={listings.next_cursor}
        initialHasMore={listings.has_more}
      />
    </Container>
  );
}
