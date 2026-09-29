'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/locale-provider';


export function ContactSchedule() {
    const { t } = useLocale();

    return (
        <aside className="rounded-2xl border border-gray-200 bg-gradient-to-br from-brand-muted/50 to-white p-6 text-sm text-gray-600 lg:sticky lg:top-24">
            <h2 className="text-base font-bold text-primary-dark">{t('contact.schedule.title')}</h2>
            <p className="mt-2 leading-relaxed">
                {t('contact.schedule.description')}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 border-t border-gray-200/80 pt-4">
                <Link href="/privacy" className="font-medium text-brand hover:underline">
                    {t('contact.schedule.privacy')}
                </Link>
                <Link href="/terms" className="font-medium text-brand hover:underline">
                    {t('contact.schedule.terms')}
                </Link>
            </div>
        </aside>
    )
}