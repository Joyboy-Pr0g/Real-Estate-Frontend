'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CarouselArrowProps {
  onClick: () => void;
  disabled: boolean;
  label: string;
  icon: LucideIcon;
}

export function CarouselArrow({ onClick, disabled, label, icon: Icon }: CarouselArrowProps) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border transition-all',
        disabled
          ? 'border-gray-100 text-gray-300 cursor-not-allowed'
          : 'border-gray-200 text-primary-dark hover:border-gray-300 hover:shadow-sm bg-white',
      )}
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  );
}
