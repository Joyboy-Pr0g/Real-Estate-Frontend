'use client';

import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { PublicOfficeMember } from '@/features/office/types/public-office';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';

const DEFAULT_PROFILE_IMAGE = '/default-profile.jpg';

interface OfficeMemberCardProps {
  member: PublicOfficeMember;
}

export function OfficeMemberCard({ member }: OfficeMemberCardProps) {
  const { t } = useLocale();
  const roleKey = `offices.role.${member.role}` as TranslationKey;
  const avatarSrc = member.user_image_url ?? DEFAULT_PROFILE_IMAGE;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
          <Image
            src={avatarSrc}
            alt={member.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-primary-dark">{member.name}</p>
          <span
            className={cn(
              'mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
              member.role === 'office_admin'
                ? 'bg-brand-muted text-brand-dark'
                : 'bg-gray-100 text-gray-600',
            )}
          >
            {t(roleKey)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <a
          href={`tel:${member.phone_number}`}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted/40"
        >
          <Phone className="h-3.5 w-3.5 text-brand" />
          <span dir="ltr">{member.phone_number}</span>
        </a>
        <a
          href={`mailto:${member.email}`}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-primary-dark transition-colors hover:border-brand/30 hover:bg-brand-muted/40"
        >
          <Mail className="h-3.5 w-3.5 text-brand" />
          <span className="truncate">{member.email}</span>
        </a>
      </div>
    </div>
  );
}
