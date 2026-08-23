import { getAdminIndividualListers } from '@/features/individual-lister/services/admin-individual-listers-service';
import { AdminIndividualListersPanel } from '@/features/admin/components/individual-listers/AdminIndividualListersPanel';
import { IndividualListerVerificationStatus } from '@/features/individual-lister/types/individual-lister';

interface AdminIndividualListersContentProps {
  searchParams: Promise<{
    verificationStatus?: string;
    search?: string;
    cursor?: string;
    include_deleted?: string;
  }>;
  lockedStatus?: IndividualListerVerificationStatus;
}

export async function AdminIndividualListersContent({ searchParams, lockedStatus }: AdminIndividualListersContentProps) {
  const params = await searchParams;
  const verificationStatus =
    lockedStatus ?? (params.verificationStatus as IndividualListerVerificationStatus | undefined);
  const search = params.search?.trim() || undefined;
  const includeDeleted = params.include_deleted === 'true';

  const page = await getAdminIndividualListers({
    verificationStatus,
    search,
    cursor: params.cursor,
    include_deleted: includeDeleted,
  });

  return (
    <AdminIndividualListersPanel
      initial={page}
      initialVerificationStatus={verificationStatus}
      initialSearch={search ?? ''}
      initialIncludeDeleted={includeDeleted}
      lockedStatus={lockedStatus}
    />
  );
}
