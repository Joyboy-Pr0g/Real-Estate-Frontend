'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Globe,
  LayoutDashboard,
  LogOut,
  User,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthUser } from '@/features/auth/types/user';
import { getRoleHomePath } from '@/lib/auth/constants';
import { logout } from '@/features/auth/services/auth-service';
import { useLocale } from '@/lib/i18n/locale-provider';

interface UserMenuProps {
  user: AuthUser;
}

function getDashboardHref(role: AuthUser['role']) {
  return getRoleHomePath(role);
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();
  const displayName = `${user.f_name} ${user.l_name}`.trim() || user.email.split('@')[0];

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // redirect anyway
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-full">
          <User className="h-4 w-4" />
          <span className="max-w-28 truncate hidden sm:inline">{displayName}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href={getDashboardHref(user.role)} className="cursor-pointer">
            <LayoutDashboard className="h-4 w-4" />
            {t('nav.dashboard')}
          </Link>
        </DropdownMenuItem>

        {user.role === 'platform_admin' ? (
          <DropdownMenuItem asChild>
            <Link href="/admin/users" className="cursor-pointer">
              <Users className="h-4 w-4" />
              {t('admin.users')}
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
        >
          <Globe className="h-4 w-4" />
          {locale === 'en' ? 'العربية' : 'English'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
