'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { cn } from '@/lib/utils/cn';
import { env } from '@/env';

interface TurnstileFieldProps {
  onTokenChange: (token: string | null) => void;
  onResetReady?: (reset: () => void) => void;
  className?: string;
}

export function TurnstileField({ onTokenChange, onResetReady, className }: TurnstileFieldProps) {
  const ref = useRef<TurnstileInstance>(null);

  const reset = useCallback(() => {
    ref.current?.reset();
    onTokenChange(null);
  }, [onTokenChange]);

  useEffect(() => {
    onResetReady?.(reset);
  }, [onResetReady, reset]);

  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) {
    return null;
  }

  return (
    <div className={cn('flex justify-center', className)}>
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onTokenChange}
        onExpire={reset}
        onError={() => onTokenChange(null)}
        options={{
          theme: 'dark',
          size: 'flexible',
        }}
      />
    </div>
  );
}

export function isTurnstileEnabledOnClient(): boolean {
  return Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}
