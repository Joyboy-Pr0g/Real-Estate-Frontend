'use client';

import { useLocale } from '@/lib/i18n/locale-provider';

interface ContactHeaderProps {
    title: string;
}

export function ContactHeader({ title }: ContactHeaderProps) {
    const { t } = useLocale();

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-primary-dark lg:text-4xl">{t('contact.title')}</h1>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
                {t('contact.description').replace('{title}', title)}
            </p>
        </div>
    )
}