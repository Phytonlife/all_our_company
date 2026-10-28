/**
 * Date and timezone utilities for Growth OS Kazakhstan (Asia/Atyrau UTC+5)
 */

export const CAMPAIGN_START_DATE = '2026-10-28';
export const CAMPAIGN_END_DATE = '2027-01-25';
export const CAMPAIGN_TOTAL_DAYS = 90;

/**
 * Returns current date string in YYYY-MM-DD for Asia/Atyrau timezone
 */
export function getAtyrauDateString(overrideDate?: string | null): string {
  if (overrideDate) {
    return overrideDate;
  }
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Atyrau',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch {
    // Fallback if timezone not supported in current environment
    const now = new Date();
    // UTC+5 offset
    const atyrauTime = new Date(now.getTime() + (5 * 60 + now.getTimezoneOffset()) * 60000);
    return atyrauTime.toISOString().slice(0, 10);
  }
}

/**
 * Calculates day number (1..90) of the campaign based on the current date
 */
export function getDayNumber(currentDateStr: string, startDateStr: string = CAMPAIGN_START_DATE): number {
  const current = new Date(currentDateStr + 'T00:00:00Z');
  const start = new Date(startDateStr + 'T00:00:00Z');
  const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(CAMPAIGN_TOTAL_DAYS, diffDays + 1));
}

/**
 * Formats YYYY-MM-DD into Russian display (e.g., "28 октября 2026")
 */
export function formatRussianDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

/**
 * Formats YYYY-MM-DD into short Russian display (e.g., "28.10.2026")
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateStr;
}

/**
 * Returns weekday name in Russian for YYYY-MM-DD
 */
export function getWeekdayName(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00Z');
  const weekdays = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return weekdays[date.getUTCDay()];
}
