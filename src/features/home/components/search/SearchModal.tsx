'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { EASE_OUT_EXPO } from '@/lib/motion/reveal';
import { cn } from '@/lib/utils/cn';

interface SearchModalProps {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

export function SearchModal({ open, title, onClose, children }: SearchModalProps) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/45 cursor-default"
            onClick={onClose}
          />

          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'search-modal-title' : undefined}
              data-search-panel-root
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
              className={cn(
                'pointer-events-auto flex w-full max-w-xl flex-col overflow-hidden',
                'rounded-3xl border border-gray-200 bg-white shadow-[0_32px_64px_rgba(15,23,42,0.2)]',
                'max-h-[min(85vh,640px)]',
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 shrink-0">
                  <h2
                    id="search-modal-title"
                    className="text-lg font-semibold text-primary-dark"
                  >
                    {title}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-dark"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="overflow-y-auto px-6 py-5">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
