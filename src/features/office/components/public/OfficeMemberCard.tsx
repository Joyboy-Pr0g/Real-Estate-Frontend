'use client';

import Image from 'next/image';
import { PublicOfficeMember } from '@/features/office/types/public-office';

const DEFAULT_PROFILE_IMAGE = '/default-profile.jpg';

interface OfficeMemberCardProps {
  member: PublicOfficeMember;
}

export function OfficeMemberCard({ member }: OfficeMemberCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
          <Image
            src={DEFAULT_PROFILE_IMAGE}
            alt={member.full_name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-bold text-primary-dark">{member.full_name}</p>
      </div>
    </div>
  );
}
