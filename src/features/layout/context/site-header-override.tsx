'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface SiteHeaderOverrideValue {
  override: ReactNode | null;
  hidden: boolean;
  setOverride: (override: ReactNode | null, hidden: boolean) => void;
}

const defaultValue: SiteHeaderOverrideValue = {
  override: null,
  hidden: false,
  setOverride: () => {},
};

const SiteHeaderOverrideContext = createContext<SiteHeaderOverrideValue>(defaultValue);

export function SiteHeaderOverrideProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ override: ReactNode | null; hidden: boolean }>({
    override: null,
    hidden: false,
  });

  const value = useMemo<SiteHeaderOverrideValue>(
    () => ({
      ...state,
      setOverride: (override, hidden) => setState({ override, hidden }),
    }),
    [state],
  );

  return (
    <SiteHeaderOverrideContext.Provider value={value}>{children}</SiteHeaderOverrideContext.Provider>
  );
}

export function useSiteHeaderOverride() {
  return useContext(SiteHeaderOverrideContext);
}
