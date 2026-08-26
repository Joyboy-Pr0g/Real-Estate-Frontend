import { getAdminOfficeActionLogs } from '@/features/admin/services/admin-office-action-logs-service';
import { getOfficeDetail } from '@/features/office/services/office-service';
import { AdminOfficeActionLogsPanel } from '@/features/admin/components/office-action-logs/AdminOfficeActionLogsPanel';

interface AdminOfficeActionLogsContentProps {
  searchParams: Promise<{
    office_id?: string;
    cursor?: string;
  }>;
}

export async function AdminOfficeActionLogsContent({ searchParams }: AdminOfficeActionLogsContentProps) {
  const params = await searchParams;
  const officeId = params.office_id || undefined;

  const [page, officeDetail] = await Promise.all([
    getAdminOfficeActionLogs({ office_id: officeId, cursor: params.cursor }),
    officeId ? getOfficeDetail(officeId) : Promise.resolve(null),
  ]);

  return (
    <AdminOfficeActionLogsPanel
      initial={page}
      initialOfficeId={officeId ?? ''}
      initialOfficeLabel={officeDetail?.name ?? ''}
    />
  );
}
