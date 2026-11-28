import { redirect } from 'next/navigation';

interface OfficeUsersDetailRedirectProps {
  params: Promise<{ id: string }>;
}

export default async function OfficeUsersDetailRedirectPage({ params }: OfficeUsersDetailRedirectProps) {
  const { id } = await params;
  redirect(`/dashboard/office/${id}`);
}
