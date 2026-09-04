import { Suspense } from 'react';
import { AdminPermissionsContent } from '@/features/admin/components/permissions/AdminPermissionsContent';

function PermissionsFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    </div>
  );
}

export default function AdminPermissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ user_id?: string; permission_id?: string }>;
}) {
  return (
    <Suspense fallback={<PermissionsFallback />}>
      <AdminPermissionsContent searchParams={searchParams} />
    </Suspense>
  );
}
