'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ToastType = 'success' | 'error' | 'info' | 'notification';

export interface NotificationToastInput {
  title: string;
  message?: string;
  href?: string | null;
}

interface Toast {
  id: string;
  message: string;
  title?: string;
  href?: string | null;
  type: ToastType;
}

const TOAST_DURATION_MS = 4000;

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toasts;
}

function addToast(
  message: string,
  type: ToastType,
  options?: { title?: string; href?: string | null },
) {
  toasts = [
    ...toasts,
    {
      id: Math.random().toString(36).slice(2),
      message,
      title: options?.title,
      href: options?.href,
      type,
    },
  ];
  emit();
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function show(message: string, type: ToastType = 'info') {
  addToast(message, type);
}

export const toast = Object.assign(show, {
  success: (message: string) => show(message, 'success'),
  error: (message: string) => show(message, 'error'),
  info: (message: string) => show(message, 'info'),
  notification: ({ title, message = '', href = null }: NotificationToastInput) => {
    addToast(message, 'notification', { title, href });
  },
});

const TYPE_STYLES: Record<ToastType, string> = {
  success: 'border-brand/30 bg-white text-brand-dark shadow-[var(--shadow-soft)]',
  error: 'border-red-200 bg-red-50 text-red-800 shadow-[var(--shadow-soft)]',
  info: 'border-gray-200 bg-white text-primary-dark shadow-[var(--shadow-soft)]',
  notification: 'border-brand/20 bg-white text-primary-dark shadow-[var(--shadow-soft)] ring-1 ring-brand/10',
};

const TYPE_ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  notification: Bell,
};

const TYPE_ICON_STYLES: Record<ToastType, string> = {
  success: 'text-brand',
  error: 'text-red-500',
  info: 'text-gray-400',
  notification: 'text-brand',
};

export function Toaster() {
  const router = useRouter();
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [dir, setDir] = useState<'ltr' | 'rtl'>('rtl');

  useEffect(() => {
    const root = document.documentElement;
    const syncDir = () => setDir(root.dir === 'ltr' ? 'ltr' : 'rtl');
    syncDir();
    const observer = new MutationObserver(syncDir);
    observer.observe(root, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timers = currentToasts.map((t) => setTimeout(() => removeToast(t.id), TOAST_DURATION_MS));
    return () => timers.forEach(clearTimeout);
  }, [currentToasts]);

  const enterY = -8;
  const exitY = -8;

  return (
    <div
      className="pointer-events-none fixed top-4 left-1/2 z-[99999] isolate -translate-x-1/2 space-y-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence>
        {currentToasts.map((t) => {
          const Icon = TYPE_ICONS[t.type];
          const isClickable = Boolean(t.href);

          const handleOpen = () => {
            if (t.href) {
              router.push(t.href);
            }
            removeToast(t.id);
          };

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: enterY }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, y: exitY }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={isClickable ? handleOpen : undefined}
              onKeyDown={
                isClickable
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpen();
                      }
                    }
                  : undefined
              }
              className={cn(
                'pointer-events-auto flex min-w-[280px] max-w-md items-start gap-3 rounded-xl border px-4 py-3.5 text-sm',
                TYPE_STYLES[t.type],
                isClickable && 'cursor-pointer hover:border-brand/40',
              )}
            >
              <Icon size={18} className={cn('mt-0.5 shrink-0', TYPE_ICON_STYLES[t.type])} />
              <div className="min-w-0 flex-1">
                {t.title ? (
                  <p className="font-semibold leading-snug text-primary-dark">{t.title}</p>
                ) : null}
                {t.message ? (
                  <p className={cn('leading-snug', t.title ? 'mt-0.5 text-xs text-gray-500' : 'font-medium')}>
                    {t.message}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeToast(t.id);
                }}
                className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
