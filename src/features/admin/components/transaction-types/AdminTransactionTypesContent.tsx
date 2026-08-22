import { getAdminTransactionTypes } from '@/features/admin/services/admin-catalog-service';
import { AdminTransactionTypesPanel } from '@/features/admin/components/transaction-types/AdminTransactionTypesPanel';

interface AdminTransactionTypesContentProps {
  searchParams: Promise<{ search?: string }>;
}

export async function AdminTransactionTypesContent({ searchParams }: AdminTransactionTypesContentProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const items = await getAdminTransactionTypes({ search });

  return <AdminTransactionTypesPanel initial={items} initialSearch={search ?? ''} />;
}
