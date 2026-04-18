import i18n from '../i18n';

export function format(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'es-CO';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}
