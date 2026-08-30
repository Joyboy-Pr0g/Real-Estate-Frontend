/** Maps geoBoundaries ADM1 shapeISO codes to catalog city pcodes. */
export const CITY_ISO_TO_PCODE: Record<string, string> = {
  'YE-SN': 'YE23', // Sana'a Governorate
  'YE-IB': 'YE11',
  'YE-AB': 'YE12',
  'YE-BA': 'YE14',
  'YE-TA': 'YE15',
  'YE-JA': 'YE16',
  'YE-HJ': 'YE17',
  'YE-HU': 'YE18',
  'YE-HD': 'YE19',
  'YE-DH': 'YE20',
  'YE-SH': 'YE21',
  'YE-SD': 'YE22',
  'YE-AD': 'YE24',
  'YE-LA': 'YE25',
  'YE-MA': 'YE26',
  'YE-MW': 'YE27',
  'YE-MR': 'YE28',
  'YE-AM': 'YE29',
  'YE-RA': 'YE31',
  'YE-SU': 'YE32',
  'YE-DA': 'YE30',
};

/** Arabic city names keyed by pcode (matches backend seed). */
export const CITY_PCODE_TO_NAME: Record<string, string> = {
  YE23: 'صنعاء',
  YE11: 'إب',
  YE12: 'أبين',
  YE14: 'البيضاء',
  YE15: 'تعز',
  YE16: 'الجوف',
  YE17: 'حجة',
  YE18: 'الحديدة',
  YE19: 'حضرموت',
  YE20: 'ذمار',
  YE21: 'شبوة',
  YE22: 'صعدة',
  YE24: 'عدن',
  YE25: 'لحج',
  YE26: 'مأرب',
  YE27: 'المحويت',
  YE28: 'المهرة',
  YE29: 'عمران',
  YE31: 'ريمة',
  YE32: 'سقطرى',
  YE30: 'الضالع',
};

export function pcodeFromShapeIso(shapeIso: string | undefined): string | null {
  if (!shapeIso) return null;
  return CITY_ISO_TO_PCODE[shapeIso] ?? null;
}
