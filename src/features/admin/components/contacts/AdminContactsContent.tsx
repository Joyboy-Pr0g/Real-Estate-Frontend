import { getAdminContacts } from '@/features/contact/services/contact-service';
import { AdminContactsPanel } from '@/features/admin/components/contacts/AdminContactsPanel';

interface AdminContactsContentProps {
  searchParams: Promise<{
    full_name?: string;
    email?: string;
    subject?: string;
    has_replied?: string;
    cursor?: string;
  }>;
}

export async function AdminContactsContent({ searchParams }: AdminContactsContentProps) {
  const params = await searchParams;
  const fullName = params.full_name?.trim() || undefined;
  const email = params.email?.trim() || undefined;
  const subject = params.subject?.trim() || undefined;
  const hasReplied =
    params.has_replied === 'true' ? 'true' : params.has_replied === 'false' ? 'false' : '';

  const page = await getAdminContacts({
    limit: '50',
    ...(fullName ? { full_name: fullName } : {}),
    ...(email ? { email } : {}),
    ...(subject ? { subject } : {}),
    ...(hasReplied ? { has_replied: hasReplied } : {}),
    ...(params.cursor ? { cursor: params.cursor } : {}),
  });

  return (
    <AdminContactsPanel
      initial={page}
      initialFullName={fullName ?? ''}
      initialEmail={email ?? ''}
      initialSubject={subject ?? ''}
      initialHasReplied={hasReplied}
    />
  );
}
