import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { ContactForm } from '@/features/contact/components/ContactForm';
import { ContactInfoCards } from '@/features/contact/components/ContactInfoCards';
import { getPageMetadataFromSettings } from '@/lib/seo/metadata';
import { getWebsiteSettingsServer } from '@/features/website-settings/services/website-settings-server';
import { withWebsiteSettingsDefaults } from '@/lib/website-settings/defaults';
import { getSession } from '@/lib/auth/session';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadataFromSettings({
    title: 'تواصل معنا',
    description: 'تواصل معنا للحصول على الدعم أو الأسئلة المتعلقة بالتحقق من مكتب العقارات أو الاستفسارات حول الشركة.',
    path: '/contact',
  });
}

export default async function ContactPage() {
  const settings = withWebsiteSettingsDefaults(await getWebsiteSettingsServer());
  const user = (await getSession())!;

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-primary-dark lg:text-4xl">تواصل معنا</h1>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              تواصل مع فريق {settings.title} للحصول على الدعم، أسئلة التحقق من مكتب العقارات، أو الاستفسارات حول الشركة.
            </p>
          </div>

          <ContactInfoCards settings={settings} />

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <ContactForm user={user} />
            <aside className="rounded-2xl border border-gray-200 bg-gradient-to-br from-brand-muted/50 to-white p-6 text-sm text-gray-600 lg:sticky lg:top-24">
              <h2 className="text-base font-bold text-primary-dark">ساعات الرد</h2>
              <p className="mt-2 leading-relaxed">
                نرد على رسائل نموذج التواصل خلال أيام العمل. للاستفسارات العاجلة، استخدم الهاتف أو WhatsApp إن وُجد.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 border-t border-gray-200/80 pt-4">
                <Link href="/privacy" className="font-medium text-brand hover:underline">
                  سياسة الخصوصية
                </Link>
                <Link href="/terms" className="font-medium text-brand hover:underline">
                  شروط الخدمة
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </div>
  );
}
