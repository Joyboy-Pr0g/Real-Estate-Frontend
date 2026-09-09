import { AuthUser } from '@/features/auth/types/user';
import { BuyerDashboardView } from '@/features/dashboard/components/BuyerDashboardView';
import { OfficeDashboardView } from '@/features/dashboard/components/OfficeDashboardView';
import {
  getBuyerDashboardSnapshot,
  getOfficeDashboardSnapshot,
} from '@/features/dashboard/services/dashboard-home-service';
import { getMyIndividualListerProfile } from '@/features/individual-lister/services/individual-lister-service';
import { getMyOffices } from '@/features/office/services/office-service';

interface DashboardContentProps {
  user: AuthUser;
}

export async function DashboardContent({ user }: DashboardContentProps) {
  if (user.role === 'office') {
    const offices = await getMyOffices();
    const primaryOffice = offices[0] ?? null;
    const snapshot = primaryOffice ? await getOfficeDashboardSnapshot(primaryOffice.id) : null;

    return <OfficeDashboardView user={user} context={{ offices, snapshot }} />;
  }

  const [snapshot, individualListerProfile] = await Promise.all([
    getBuyerDashboardSnapshot(),
    getMyIndividualListerProfile(),
  ]);

  return (
    <BuyerDashboardView
      user={user}
      snapshot={snapshot}
      hasIndividualListerProfile={individualListerProfile !== null}
    />
  );
}
