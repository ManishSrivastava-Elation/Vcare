// utils/timeHelpers.ts

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Parse any date string as UTC (appends Z if missing) */
export function toUTCDate(date: Date | string): Date {
  if (date instanceof Date) return date;
  const normalized = /[Zz]$|[+-]\d{2}:?\d{2}$/.test(date)
    ? date
    : date.replace(' ', 'T') + 'Z';
  return new Date(normalized);
}

/** Current time as IST Date (for DB storage / display of current time) */
export function getISTDate(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

/** Convert UTC date/string → IST Date (use for DB storage & current time display) */
export function convertToIST(date: Date | string): Date {
  if (!date) return getISTDate();
  const utcMs = toUTCDate(date).getTime();
  if (isNaN(utcMs)) return getISTDate();
  return new Date(utcMs + IST_OFFSET_MS);
}

/**
 * Extract date parts from an IST string from API/DB.
 * Since DB already stores IST, we just parse it as UTC and read parts.
 * e.g. "2026-05-05 19:30:00" → returns { year:2026, month:4, day:5 }
 */
export function extractISTDateParts(date: string): { year: number; month: number; day: number } {
  const d = toUTCDate(date);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
}

/**
 * Display time from API response or Date object.
 * If string: shows as-is (assumes IST).
 * If Date: converts to IST first.
 */
export function extractTime(date: Date | string): string {
  const d = typeof date === 'string' ? toUTCDate(date) : convertToIST(date);
  const h24 = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

/** @deprecated use extractTime for display */
export function formatTime(date: Date | string): string {
  return extractTime(date);
}

/** @deprecated use extractTime for display */
export function showFormatTime(date: Date | string): string {
  const d = typeof date === 'string' ? toUTCDate(date) : convertToIST(date);
  const h = d.getUTCHours().toString().padStart(2, '0');
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function getFormattedTime() {
  return extractTime(new Date());
}

export function getFormattedDate() {
  const ist = getISTDate();
  return ist.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

export function getGreeting() {
  const hour = getISTDate().getUTCHours();
  if (hour < 12) return 'Good Morning 👋';
  if (hour < 17) return 'Good Afternoon ☀️';
  return 'Good Evening 🌙';
}

/** Store current time in DB as IST formatted string */
export function getDatabaseFormatTime(date: Date = new Date()): string {
  const ist = convertToIST(date);
  const y = ist.getUTCFullYear();
  const mo = (ist.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = ist.getUTCDate().toString().padStart(2, '0');
  const h = ist.getUTCHours().toString().padStart(2, '0');
  const mi = ist.getUTCMinutes().toString().padStart(2, '0');
  const s = ist.getUTCSeconds().toString().padStart(2, '0');
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}
