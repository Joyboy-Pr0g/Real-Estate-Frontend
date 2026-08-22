export const CITY_GRADIENTS = [
  'from-slate-700 to-slate-900',
  'from-sky-600 to-blue-800',
  'from-rose-600 to-red-900',
  'from-teal-600 to-emerald-900',
  'from-violet-600 to-purple-900',
  'from-amber-600 to-orange-900',
  'from-indigo-600 to-indigo-900',
  'from-cyan-600 to-cyan-900',
] as const;

export function getCityGradient(index: number): string {
  return CITY_GRADIENTS[index % CITY_GRADIENTS.length];
}
