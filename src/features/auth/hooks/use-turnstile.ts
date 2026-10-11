'use client';

import { useCallback, useRef, useState } from 'react';
import { isTurnstileEnabledOnClient } from '../components/Turnstile';

export function useTurnstile() {
    const [token, setToken] = useState<string | null>(null);
    const resetRef = useRef<(() => void) | null>(null);
    const enabled = isTurnstileEnabledOnClient();

    const registerReset = useCallback((reset: () => void) => {
        resetRef.current = reset;
    }, []);

    const reset = useCallback(() => {
        resetRef.current?.();
        setToken(null);
    }, []);

    const isReady = !enabled || Boolean(token);

    return {
        enabled,
        token,
        setToken,
        reset,
        registerReset,
        isReady,
    };
}
