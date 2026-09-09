'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

interface FilterSegmentProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  active: boolean;
  dimmed?: boolean;
  onClick: () => void;
  className?: string;
}

export function FilterSegment({
  icon: Icon,
  label,
  value,
  hint,
  active,
  dimmed,
  onClick,
  className,
}: FilterSegmentProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex min-w-0 flex-1 flex-col justify-center text-start transition-all duration-300 outline-none',
        'px-3 py-2.5 sm:px-4 sm:py-3',
        'focus-visible:ring-2 focus-visible:ring-brand/25 focus-visible:ring-inset',
        active && 'z-10 bg-white shadow-[var(--shadow-soft)]',
        dimmed && !active && 'opacity-55',
        className,
      )}
    >
      {active ? (
        <motion.span
          layoutId="filter-segment-highlight"
          className="absolute inset-0.5 rounded-xl bg-gradient-to-b from-white to-gray-50/80 ring-1 ring-gray-200/80"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      ) : null}

      <span className="relative flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
        <Icon className="h-3 w-3 text-brand/80" strokeWidth={2.2} />
        {label}
      </span>
      <span
        className={cn(
          'relative mt-0.5 truncate text-xs font-semibold sm:text-[13px]',
          value ? 'text-primary-dark' : 'text-gray-400 font-normal',
        )}
      >
        {value || hint}
      </span>
    </button>
  );
}

interface FilterExpandPanelProps {
  open: boolean;
  children: React.ReactNode;
  compact?: boolean;
}

export function FilterExpandPanel({ open, children, compact = false }: FilterExpandPanelProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: open ? 'auto' : 0,
        opacity: open ? 1 : 0,
      }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div
        className={cn(
          'border-t border-gray-100/90 bg-gray-50/30',
          compact ? 'px-3 py-2.5 sm:px-4' : 'bg-gradient-to-b from-gray-50/50 to-white px-4 py-5 sm:px-6 sm:py-6',
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
  accent?: 'default' | 'secondary';
}

export function FilterChip({ label, onRemove, accent = 'default' }: FilterChipProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-[14rem] items-center gap-1.5 rounded-full py-1.5 ps-3 pe-1.5 text-xs font-medium shadow-sm',
        accent === 'secondary'
          ? 'bg-brand-muted text-brand-dark ring-1 ring-brand/15'
          : 'bg-white text-primary-dark ring-1 ring-gray-200/90',
      )}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors',
          accent === 'secondary'
            ? 'hover:bg-brand/10 text-brand-dark'
            : 'hover:bg-gray-100 text-gray-500',
        )}
        aria-label={`Remove ${label}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

interface SubtypeChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function SubtypeChip({ label, selected, onClick }: SubtypeChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200',
        selected
          ? 'bg-brand text-white shadow-md shadow-brand/20'
          : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand/25 hover:text-brand-dark',
      )}
    >
      {label}
    </button>
  );
}

interface NeighborhoodChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function NeighborhoodChip({ label, selected, onClick }: NeighborhoodChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-200',
        selected
          ? 'bg-brand text-white shadow-md shadow-brand/20'
          : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-brand-muted hover:ring-brand/25 hover:text-brand-dark',
      )}
    >
      {label}
    </button>
  );
}

interface AccordionSectionProps {
  icon: LucideIcon;
  label: string;
  valuePreview?: string;
  hint: string;
  active: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function AccordionSection({
  icon: Icon,
  label,
  valuePreview,
  hint,
  active,
  onToggle,
  children,
}: AccordionSectionProps) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start transition-colors hover:bg-gray-50/60"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
              active || valuePreview ? 'bg-brand text-white' : 'bg-brand-muted text-brand',
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-primary-dark">{label}</span>
            <span
              className={cn(
                'block truncate text-[11px]',
                valuePreview ? 'font-medium text-brand-dark' : 'text-gray-400',
              )}
            >
              {valuePreview || hint}
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
            active && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {active ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface DrillDownBackProps {
  label: string;
  onClick: () => void;
}

interface FilterOptionsSkeletonProps {
  variant?: 'list' | 'chips';
  count?: number;
  className?: string;
}

export function FilterOptionsSkeleton({
  variant = 'list',
  count = variant === 'chips' ? 6 : 5,
  className,
}: FilterOptionsSkeletonProps) {
  if (variant === 'chips') {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="h-8 animate-pulse rounded-lg bg-gray-100"
            style={{ width: `${4.5 + (index % 3) * 1.25}rem` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gray-100" />
          <div
            className="h-3.5 animate-pulse rounded-md bg-gray-100"
            style={{ width: `${55 + (index % 3) * 12}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function DrillDownBack({ label, onClick }: DrillDownBackProps) {
  const { dir } = useLocale();
  const BackIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3 flex items-center gap-1 text-xs font-semibold text-brand-dark transition-colors hover:text-brand-dark/80"
    >
      <BackIcon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
