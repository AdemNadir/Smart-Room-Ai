import { t } from '../strings.js';

export function displayDate(value, lang = 'en') {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function addDays(dateText, days) {
  const date = new Date(`${dateText}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatHours(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? '');
  return number.toFixed(1);
}

export function formatRate(value, withPercent = false) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? '');
  const text = (number * 100).toFixed(1);
  return withPercent ? `${text}%` : text;
}

export function formatScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? '');
  return number.toFixed(2);
}

export function statusLabel(lang, status) {
  return t(lang, `status.${status}`) === `status.${status}` ? status : t(lang, `status.${status}`);
}

export function equipmentLabel(lang, item) {
  const key = `equipment.${item}`;
  return t(lang, key) === key ? item : t(lang, key);
}

export function roomTypeLabel(lang, type) {
  const key = `roomType.${type}`;
  return t(lang, key) === key ? type : t(lang, key);
}

export function weekdayLabel(lang, weekday) {
  const key = `weekday.${weekday}`;
  return t(lang, key) === key ? weekday : t(lang, key);
}

export function errorMessage(lang, error) {
  if (!error) return t(lang, 'error.unexpected');
  const key = `error.${error.code}`;
  const message = t(lang, key);
  if (message !== key) return message;
  return error.message || t(lang, 'error.unexpected');
}

export function fieldError(lang, code) {
  const key = `validation.${code}`;
  const message = t(lang, key);
  return message === key ? code : message;
}

export function isOfflineError(error) {
  return Boolean(error && ['offline', 'network_error', 'timeout'].includes(error.code));
}

export function timeToMinutes(value) {
  if (!/^\d{2}:\d{2}$/.test(value || '')) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function dayStripPosition(start, end, dayStart, dayEnd) {
  const blockStart = timeToMinutes(start);
  const blockEnd = timeToMinutes(end);
  const windowStart = timeToMinutes(dayStart);
  const windowEnd = timeToMinutes(dayEnd);
  if ([blockStart, blockEnd, windowStart, windowEnd].some((value) => value === null)) return null;
  if (windowEnd <= windowStart || blockEnd <= blockStart) return null;

  const clippedStart = Math.max(blockStart, windowStart);
  const clippedEnd = Math.min(blockEnd, windowEnd);
  if (clippedEnd <= clippedStart) return null;

  return {
    left: ((clippedStart - windowStart) / (windowEnd - windowStart)) * 100,
    width: ((clippedEnd - clippedStart) / (windowEnd - windowStart)) * 100,
  };
}

export function hourTicks(dayStart, dayEnd) {
  const start = timeToMinutes(dayStart);
  const end = timeToMinutes(dayEnd);
  if (start === null || end === null) return [];
  const ticks = [];
  for (let minutes = start; minutes <= end; minutes += 120) {
    ticks.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:00`);
  }
  return ticks;
}
