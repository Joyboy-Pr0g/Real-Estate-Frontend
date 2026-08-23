import { getAdminOffices } from '@/features/office/services/admin-offices-service';
import { AdminOfficesPanel } from '@/features/admin/components/offices/AdminOfficesPanel';
import { OfficeVerificationStatus } from '@/features/office/types/office';

interface AdminOfficesContentProps {
  searchParams: Promise<{
    verificationStatus?: string;
    search?: string;
    cursor?: string;
    include_deleted?: string;
  }>;
  lockedStatus?: OfficeVerificationStatus;
}

export async function AdminOfficesContent({ searchParams, lockedStatus }: AdminOfficesContentProps) {
  const params = await searchParams;
  const verificationStatus = lockedStatus ?? (params.verificationStatus as OfficeVerificationStatus | undefined);
  const search = params.search?.trim() || undefined;
  const includeDeleted = params.include_deleted === 'true';

  const page = await getAdminOffices({
    verificationStatus,
    search,
    cursor: params.cursor,
    include_deleted: includeDeleted,
  });

  return (
    <AdminOfficesPanel
      initial={page}
      initialVerificationStatus={verificationStatus}
      initialSearch={search ?? ''}
      initialIncludeDeleted={includeDeleted}
      lockedStatus={lockedStatus}
    />
  );
}
