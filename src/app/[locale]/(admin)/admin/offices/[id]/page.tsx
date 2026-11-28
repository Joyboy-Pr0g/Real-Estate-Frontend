import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { getOfficeDetail } from '@/features/office/services/office-service';
import { AdminOfficeDetailView } from '@/features/admin/components/offices/AdminOfficeDetailView';

interface AdminOfficeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOfficeDetailPage({ params }: AdminOfficeDetailPageProps) {
  const { id } = await params;
  const office = await getOfficeDetail(id);
  if (!office) notFound();

  return (
    <Container className="py-8">
      <AdminOfficeDetailView office={office} />
    </Container>
  );
}
