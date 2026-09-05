import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

const DEFAULT_PROFILE_IMAGE = '/default-profile.jpg';

interface OfficeUserAvatarProps {
  photoUrl?: string | null;
  name: string;
  className?: string;
}

export function OfficeUserAvatar({ photoUrl, name, className }: OfficeUserAvatarProps) {
  const avatarSrc = photoUrl ?? DEFAULT_PROFILE_IMAGE;

  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-muted text-brand',
        className,
      )}
    >
      <Image src={avatarSrc} alt={name} fill className="object-cover" sizes="40px" />
    </span>
  );
}
