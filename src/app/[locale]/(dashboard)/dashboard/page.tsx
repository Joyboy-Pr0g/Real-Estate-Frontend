import { getSession } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { DashboardContent } from '@/features/dashboard/components/DashboardContent';

export default async function DashboardPage() {
  const user = (await getSession())!;

  return (
    <Container className="py-8">
      <DashboardContent user={user} />
    </Container>
  );
}
