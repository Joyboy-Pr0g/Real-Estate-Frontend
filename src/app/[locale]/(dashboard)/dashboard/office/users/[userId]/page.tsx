import { redirect } from 'next/navigation';

interface LegacyOfficeUserLogsRedirectProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ office_id?: string }>;
}

export default async function LegacyOfficeUserLogsRedirectPage({
  params,
  searchParams,
}: LegacyOfficeUserLogsRedirectProps) {
  const { userId } = await params;
  const { office_id: officeId } = await searchParams;

  if (officeId) {
    redirect(`/dashboard/office/${officeId}/users/${userId}`);
  }

  redirect('/dashboard/office');
}
