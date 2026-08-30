import type { RegionFeatureProperties } from '@/features/listings/lib/geo-boundary-loader';

export const MAP_REGION_STYLES = {
  country: {
    default: {
      fillColor: '#28b16d',
      fillOpacity: 0.05,
      strokeColor: '#1a8f55',
      strokeWeight: 2,
      strokeOpacity: 0.9,
      clickable: false,
      zIndex: 1,
    },
  },
  city: {
    default: {
      fillColor: '#28b16d',
      fillOpacity: 0.1,
      strokeColor: '#1a8f55',
      strokeWeight: 1.25,
      strokeOpacity: 0.85,
      clickable: true,
      zIndex: 2,
    },
    hover: {
      fillColor: '#28b16d',
      fillOpacity: 0.38,
      strokeColor: '#0f7a45',
      strokeWeight: 2.75,
      strokeOpacity: 1,
      clickable: true,
      zIndex: 10,
    },
  },
  district: {
    default: {
      fillColor: '#0ea5e9',
      fillOpacity: 0.12,
      strokeColor: '#0284c7',
      strokeWeight: 1.25,
      strokeOpacity: 0.9,
      clickable: true,
      zIndex: 2,
    },
    hover: {
      fillColor: '#0ea5e9',
      fillOpacity: 0.38,
      strokeColor: '#0369a1',
      strokeWeight: 2.75,
      strokeOpacity: 1,
      clickable: true,
      zIndex: 10,
    },
  },
} as const satisfies Record<
  'country' | 'city' | 'district',
  { default: google.maps.Data.StyleOptions; hover?: google.maps.Data.StyleOptions }
>;

export function styleForRegion(
  kind: RegionFeatureProperties['kind'] | 'neighborhood',
  hovered: boolean,
): google.maps.Data.StyleOptions {
  if (kind === 'country') return MAP_REGION_STYLES.country.default;
  if (kind === 'city') {
    return hovered ? MAP_REGION_STYLES.city.hover : MAP_REGION_STYLES.city.default;
  }
  return hovered ? MAP_REGION_STYLES.district.hover : MAP_REGION_STYLES.district.default;
}

export function removeMapListener(listener: google.maps.MapsEventListener): () => void {
  return () => {
    google.maps.event.removeListener(listener);
  };
}

export function attachRegionHoverListeners(
  data: google.maps.Data,
  onHoverChange?: (name: string | null) => void,
): () => void {
  const listeners: google.maps.MapsEventListener[] = [];

  listeners.push(
    data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
      const kind = event.feature.getProperty('kind') as RegionFeatureProperties['kind'];
      if (kind === 'country') return;

      data.overrideStyle(event.feature, styleForRegion(kind, true));
      const name = event.feature.getProperty('name') as string | undefined;
      onHoverChange?.(name ?? null);
    }),
  );

  listeners.push(
    data.addListener('mouseout', (event: google.maps.Data.MouseEvent) => {
      const kind = event.feature.getProperty('kind') as RegionFeatureProperties['kind'];
      if (kind === 'country') return;

      data.revertStyle(event.feature);
      onHoverChange?.(null);
    }),
  );

  return () => {
    for (const listener of listeners) {
      google.maps.event.removeListener(listener);
    }
  };
}

export function attachRegionClickCursor(map: google.maps.Map, data: google.maps.Data): () => void {
  const listeners: google.maps.MapsEventListener[] = [];

  listeners.push(
    data.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
      const kind = event.feature.getProperty('kind');
      if (kind === 'city' || kind === 'district') {
        map.setOptions({ draggableCursor: 'pointer' });
      }
    }),
  );

  listeners.push(
    data.addListener('mouseout', () => {
      map.setOptions({ draggableCursor: null });
    }),
  );

  return () => {
    for (const listener of listeners) {
      google.maps.event.removeListener(listener);
    }
  };
}
