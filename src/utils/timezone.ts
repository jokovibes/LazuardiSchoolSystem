/**
 * Timezone and Date Utility for Indonesian Western Time (WIB / UTC+7 / Asia/Jakarta)
 *
 * Ensures accurate handling between Supabase database UTC timestamps
 * and user-facing application records in WIB (UTC+7).
 */

export const WIB_TIMEZONE = 'Asia/Jakarta';

/**
 * Returns current date in WIB (UTC+7) formatted as 'YYYY-MM-DD'
 */
export function getWIBDateString(date: Date | string | number = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: WIB_TIMEZONE }).format(new Date());
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: WIB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}

/**
 * Returns current time in WIB (UTC+7) formatted as 'HH:mm'
 */
export function getWIBTimeString(date: Date | string | number = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    d.setTime(Date.now());
  }
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: WIB_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d).replace('.', ':');
}

/**
 * Converts a UTC date string or Supabase UTC created_at timestamp into
 * a WIB (UTC+7) date string in 'YYYY-MM-DD' format.
 */
export function convertUtcToWibDate(dateStr?: string, utcCreatedAt?: string): string {
  // If Supabase created_at timestamp exists (stored in UTC), calculate WIB date from it
  if (utcCreatedAt && typeof utcCreatedAt === 'string') {
    let clean = utcCreatedAt.trim();
    if (!clean.includes('T')) clean = clean.replace(' ', 'T');
    if (!clean.endsWith('Z') && !clean.includes('+')) clean += 'Z';
    const parsed = new Date(clean);
    if (!isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('en-CA', { timeZone: WIB_TIMEZONE }).format(parsed);
    }
  }

  // If dateStr contains an ISO timestamp with time info
  if (dateStr && typeof dateStr === 'string') {
    if (dateStr.includes('T')) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return new Intl.DateTimeFormat('en-CA', { timeZone: WIB_TIMEZONE }).format(parsed);
      }
    }
    // If it's already a clean YYYY-MM-DD, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      return dateStr.trim();
    }
  }

  // Fallback to today's WIB date
  return getWIBDateString();
}

/**
 * Formats a date string or timestamp into readable Indonesian date format in WIB.
 * Example: '13 Agu 2026' or '24 Sep 2026'
 */
export function formatDateIndoWIB(dateStr?: string, utcCreatedAt?: string): string {
  const wibDate = convertUtcToWibDate(dateStr, utcCreatedAt);
  if (!wibDate) return '-';

  try {
    const parts = wibDate.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${months[monthIdx]} ${year}`;
      }
    }
  } catch {
    // fallback
  }

  return wibDate;
}
