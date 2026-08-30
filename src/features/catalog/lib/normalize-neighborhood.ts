import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';

/** Normalize API rows so neighb_pcode is always available for URL params. */
export function normalizePublicNeighborhood(
  row: Partial<PublicNeighborhood> & Record<string, unknown>,
): PublicNeighborhood | null {
  const id = typeof row.id === 'string' ? row.id : '';
  const name = typeof row.name === 'string' ? row.name : '';
  const city_id = typeof row.city_id === 'string' ? row.city_id : '';
  const neighb_pcode =
    (typeof row.neighb_pcode === 'string' && row.neighb_pcode)
    || (typeof row.neighbPcode === 'string' && row.neighbPcode)
    || '';

  if (!id || !name || !city_id || !neighb_pcode) return null;

  const latitude = typeof row.latitude === 'number' ? row.latitude : null;
  const longitude = typeof row.longitude === 'number' ? row.longitude : null;

  return { id, name, city_id, neighb_pcode, latitude, longitude };
}

export function normalizePublicNeighborhoods(
  rows: Array<Partial<PublicNeighborhood> & Record<string, unknown>>,
): PublicNeighborhood[] {
  return rows
    .map(normalizePublicNeighborhood)
    .filter((row): row is PublicNeighborhood => row !== null);
}
