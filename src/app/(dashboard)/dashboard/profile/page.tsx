import { getSession } from '@/lib/auth/session';
import { Container } from '@/components/ui/container';
import { ProfileSettingsPanel } from '@/features/dashboard/components/ProfileSettingsPanel';

export default async function ProfilePage() {
  const user = (await getSession())!;

  return (
    <Container className="py-8">
      <ProfileSettingsPanel user={user} />
    </Container>
  );
}
