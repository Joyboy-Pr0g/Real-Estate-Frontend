export const queryKeys = {
  listings: {
    all: ['listings'] as const,
    search: (queryKey: string) => ['listings', 'search', queryKey] as const,
    my: (queryKey: string) => ['listings', 'my', queryKey] as const,
  },
} as const;
