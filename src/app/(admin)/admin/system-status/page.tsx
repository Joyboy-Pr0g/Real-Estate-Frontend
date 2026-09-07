import { Container } from '@/components/ui/container';
import { AdminSystemStatusPanel } from '@/features/admin/components/system-status/AdminSystemStatusPanel';

export default function AdminSystemStatusPage() {
  return (
    <Container className="py-8">
      <AdminSystemStatusPanel />
    </Container>
  );
}
