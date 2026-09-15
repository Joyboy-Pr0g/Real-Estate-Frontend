export const queryKeys = {
  catalog: {
    neighborhoods: (cityId: string) => ['catalog', 'neighborhoods', cityId] as const,
    propertySubtypes: (propertyTypeId: string) =>
      ['catalog', 'property-subtypes', propertyTypeId] as const,
  },
  listings: {
    all: ['listings'] as const,
    search: (queryKey: string) => ['listings', 'search', queryKey] as const,
    my: (queryKey: string) => ['listings', 'my', queryKey] as const,
  },
} as const;
