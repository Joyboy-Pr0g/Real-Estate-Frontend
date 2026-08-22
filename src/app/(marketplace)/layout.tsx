import { Suspense } from 'react';
import { SiteHeader } from '@/features/layout/components/SiteHeader';
import { SiteFooter } from '@/features/layout/components/SiteFooter';
import { CategoryNavBar } from '@/features/home/components/CategoryNavBar';
import { CategoryNavSkeleton } from '@/features/home/components/CategoryNav';
import { SiteHeaderOverrideProvider } from '@/features/layout/context/site-header-override';
import { getSession } from '@/lib/auth/session';

export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  return (
    <SiteHeaderOverrideProvider>
      <SiteHeader
        user={user}
        categoryNav={
          <Suspense fallback={<CategoryNavSkeleton centered />}>
            <CategoryNavBar />
          </Suspense>
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </SiteHeaderOverrideProvider>
  );
}
