'use client';

import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { WebsiteSettings } from '@/features/website-settings/types/website-settings';
import { formatWhatsappLink } from '@/lib/website-settings/defaults';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ContactInfoCardsProps {
  settings: WebsiteSettings;
}

const cardClass =
  'group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[var(--shadow-float)]';

export function ContactInfoCards({ settings }: ContactInfoCardsProps) {
  const { t } = useLocale();

  const items = [
    settings.website_phone
      ? {
          key: 'phone',
          icon: Phone,
          label: t('contact.info.phone'),
          value: settings.website_phone,
          href: `tel:${settings.website_phone.replace(/\s/g, '')}`,
        }
      : null,
    settings.website_email
      ? {
          key: 'email',
          icon: Mail,
          label: t('contact.info.email'),
          value: settings.website_email,
          href: `mailto:${settings.website_email}`,
        }
      : null,
    settings.support_email && settings.support_email !== settings.website_email
      ? {
          key: 'support',
          icon: Mail,
          label: t('contact.info.supportEmail'),
          value: settings.support_email,
          href: `mailto:${settings.support_email}`,
        }
      : null,
    settings.whatsapp
      ? {
          key: 'whatsapp',
          icon: MessageCircle,
          label: t('contact.info.whatsapp'),
          value: settings.whatsapp,
          href: formatWhatsappLink(settings.whatsapp),
        }
      : null,
    settings.address_text
      ? {
          key: 'address',
          icon: MapPin,
          label: t('contact.info.address'),
          value: settings.address_text,
          href: undefined,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    icon: typeof Phone;
    label: string;
    value: string;
    href?: string;
  }>;

  if (items.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ key, icon: Icon, label, value, href }) => (
        <div key={key} className={cardClass}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand transition group-hover:bg-brand group-hover:text-white">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
            {href ? (
              <a href={href} target={key === 'whatsapp' ? '_blank' : undefined} rel={key === 'whatsapp' ? 'noopener noreferrer' : undefined} className="mt-1 block text-sm font-medium text-primary-dark hover:text-brand">
                {value}
              </a>
            ) : (
              <p className="mt-1 text-sm font-medium leading-relaxed text-primary-dark">{value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
