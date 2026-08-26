import { Container } from '@/components/ui/container';
import { AdminOfficeActionLogsContent } from '@/features/admin/components/office-action-logs/AdminOfficeActionLogsContent';

interface AdminOfficeActionLogsPageProps {
  searchParams: Promise<{
    office_id?: string;
    cursor?: string;
  }>;
}

export default async function AdminOfficeActionLogsPage({ searchParams }: AdminOfficeActionLogsPageProps) {
  return (
    <Container className="py-8">
      <AdminOfficeActionLogsContent searchParams={searchParams} />
    </Container>
  );
}
