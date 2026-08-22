'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
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
