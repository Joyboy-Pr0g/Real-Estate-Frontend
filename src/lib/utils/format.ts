export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatMessageTime(value: string | Date, locale: string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    ...(sameDay ? { timeStyle: 'short' } : { dateStyle: 'short', timeStyle: 'short' }),
  }).format(date);
}

export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const digits = cleaned.startsWith('967') ? cleaned.slice(3) : cleaned;
  const trimmedDigits = digits.slice(0, 9);
  let formatted = '+967';
  if (trimmedDigits.length > 0) {
    formatted += ` ${trimmedDigits.slice(0, 3)}`;
  }
  if (trimmedDigits.length > 3) {
    formatted += ` ${trimmedDigits.slice(3, 6)}`;
  }
  if (trimmedDigits.length > 6) {
    formatted += ` ${trimmedDigits.slice(6, 9)}`;
  }
  return formatted;
}
