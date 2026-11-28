import { redirect } from 'next/navigation';

interface OfficeAnalyticsDetailRedirectProps {
  params: Promise<{ id: string }>;
}

export default async function OfficeAnalyticsDetailRedirectPage({ params }: OfficeAnalyticsDetailRedirectProps) {
  const { id } = await params;
  redirect(`/dashboard/office/${id}`);
}
