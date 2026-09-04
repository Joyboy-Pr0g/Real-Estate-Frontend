'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PublicCatalog } from '@/features/catalog/types/catalog';
import {
  getAllCategoryIcon,
  getPropertyTypeIcon,
  getTransactionLabel,
  getTransactionTypeIcon,
} from '@/features/catalog/utils/catalog-icons';
import { buildListingsUrl } from '@/features/listings/lib/build-listings-url';
import { LISTING_URL_PARAMS } from '@/features/listings/constants/search-url-params';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import type { TranslationKey } from '@/lib/i18n/ar';
import { Map, type LucideIcon } from 'lucide-react';

export function CategoryNavSkeleton({ centered }: { centered?: boolean }) {
  return (
    <nav
      className={cn(
        'flex items-center gap-2 py-1 overflow-x-auto no-scrollbar',
        centered ? 'justify-center' : 'justify-start',
      )}
      aria-label="Categories"
      aria-busy="true"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-20 w-20 rounded-xl bg-gray-100 animate-pulse shrink-0" />
      ))}
    </nav>
  );
}

interface CategoryNavProps {
  catalog: PublicCatalog;
}

export function CategoryNav({ catalog }: CategoryNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, t } = useLocale();

  const transactionTypeSlug = searchParams.get(LISTING_URL_PARAMS.transactionType);
  const propertyTypeSlug = searchParams.get(LISTING_URL_PARAMS.propertyType);
  const isHome = pathname === '/';
  const isListings = pathname === '/listings';
  const isAllActive =
    (isHome || isListings) && !transactionTypeSlug && !propertyTypeSlug;

  type NavItem = {
    key: string;
    href: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
  };

  const items: NavItem[] = [
    {
      key: 'all',
      href: buildListingsUrl(),
      label: t('category.all' as TranslationKey),
      icon: getAllCategoryIcon(),
      active: isAllActive,
    },
    ...catalog.transactionTypes.map((tx) => ({
      key: `tx-${tx.slug}`,
      href: buildListingsUrl({ transactionTypeSlug: tx.slug }),
      label: getTransactionLabel(tx, locale),
      icon: getTransactionTypeIcon(tx.icon),
      active: transactionTypeSlug === tx.slug,
    })),
    ...catalog.propertyTypes.map((pt) => ({
      key: `pt-${pt.slug}`,
      href: buildListingsUrl({ propertyTypeSlug: pt.slug }),
      label: pt.name,
      icon: getPropertyTypeIcon(pt.icon),
      active: propertyTypeSlug === pt.slug,
    })),
    {
      key: 'map',
      href: '/listings/map',
      label: t('nav.map'),
      icon: Map,
      active: pathname === '/listings/map',
    },
  ];

  return (
    <nav
      className={cn(
        'flex items-center gap-0.5 overflow-x-auto no-scrollbar py-1',
        isHome ? 'justify-center' : 'justify-start',
      )}
      aria-label="Categories"
    >
      {items.map(({ key, href, label, icon: Icon, active }) => (
        <Link
          key={key}
          href={href}
          className={cn(
            'relative flex flex-col items-center gap-1.5 min-w-15 max-w-18 px-2 py-2 rounded-xl transition-colors shrink-0',
            active ? 'text-primary-dark' : 'text-gray-500 hover:text-brand hover:bg-brand-muted/60',
          )}
        >
          <Icon
            className={cn('h-6 w-6 transition-transform', active && 'scale-105')}
            strokeWidth={active ? 2.25 : 1.75}
          />
          <span
            className={cn(
              'text-[11px] text-center leading-tight line-clamp-2',
              active ? 'font-semibold' : 'font-medium',
            )}
          >
            {label}
          </span>
          {active && (
            <motion.span
              layoutId="category-underline"
              className="absolute -bottom-0.5 inset-x-2 h-0.5 rounded-full bg-brand"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </Link>
      ))}
    </nav>
  );
}
