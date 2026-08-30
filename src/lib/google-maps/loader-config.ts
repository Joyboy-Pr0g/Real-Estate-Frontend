import type { Libraries } from '@react-google-maps/api';

/** Single loader id for every map in the app — avoids duplicate script injection. */
export const GOOGLE_MAPS_LOADER_ID = 'real-estate-google-maps';

/**
 * Stable array reference. Never pass `libraries: ['…']` inline in a component —
 * @react-google-maps/api warns and may reload the script when the reference changes.
 */
export const GOOGLE_MAPS_LIBRARIES: Libraries = ['maps', 'geometry'];
