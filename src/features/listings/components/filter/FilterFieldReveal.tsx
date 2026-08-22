'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface FilterFieldRevealProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterFieldReveal({ children, className }: FilterFieldRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, width: 0, marginInlineStart: 0 }}
      animate={{ opacity: 1, width: 'auto', marginInlineStart: 0 }}
      exit={{ opacity: 0, width: 0, marginInlineStart: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn('overflow-hidden shrink-0', className)}
    >
      <div className="min-w-[9.5rem] sm:min-w-[10.5rem] md:min-w-[11.5rem]">{children}</div>
    </motion.div>
  );
}
