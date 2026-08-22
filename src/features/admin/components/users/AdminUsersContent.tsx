import { getAdminUsers } from '@/features/admin/services/admin-users-service';
import { AdminUsersPanel } from '@/features/admin/components/users/AdminUsersPanel';
import { UserRole, UserStatus } from '@/features/auth/types/user';

interface AdminUsersContentProps {
  searchParams: Promise<{
    role?: string;
    status?: string;
    search?: string;
    cursor?: string;
    include_deleted?: string;
  }>;
}

export async function AdminUsersContent({ searchParams }: AdminUsersContentProps) {
  const params = await searchParams;
  const role = params.role as UserRole | undefined;
  const status = params.status as UserStatus | undefined;
  const search = params.search?.trim() || undefined;
  const includeDeleted = params.include_deleted === 'true';

  const page = await getAdminUsers({
    role,
    status,
    search,
    cursor: params.cursor,
    include_deleted: includeDeleted,
  });

  return (
    <AdminUsersPanel
      initial={page}
      initialRole={role}
      initialStatus={status}
      initialSearch={search ?? ''}
      initialIncludeDeleted={includeDeleted}
    />
  );
}
