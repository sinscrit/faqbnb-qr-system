/**
 * Date/Time Formatting Utilities for i18n
 *
 * Provides locale-aware date/time formatting functions that integrate
 * with next-intl's localization system.
 *
 * @module datetime-formatting
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import { useFormatter, useTranslations } from 'next-intl';
import { getFormatter, getTranslations } from 'next-intl/server';

// ============================================================================
// Types
// ============================================================================

export type DateFormatStyle = 'short' | 'medium' | 'long';
export type TimeFormatStyle = 'short' | 'long';

interface RelativeTimeDiff {
  unit: 'justNow' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  value: number;
  isFuture: boolean;
}

export interface DateTimeFormatterReturn {
  /**
   * Format a date in locale-appropriate format
   * @param date - Date object or ISO string
   * @param style - 'short', 'medium', or 'long'
   * @returns Formatted date string
   */
  formatDate: (date: Date | string, style?: DateFormatStyle) => string;

  /**
   * Format a time in locale-appropriate format
   * @param date - Date object or ISO string
   * @param style - 'short' or 'long'
   * @returns Formatted time string
   */
  formatTime: (date: Date | string, style?: TimeFormatStyle) => string;

  /**
   * Format both date and time in locale-appropriate format
   * @param date - Date object or ISO string
   * @param style - 'short', 'medium', or 'long'
   * @returns Formatted date-time string
   */
  formatDateTime: (date: Date | string, style?: DateFormatStyle) => string;

  /**
   * Format a date as relative time (e.g., "2 hours ago")
   * @param date - Date object or ISO string
   * @returns Localized relative time string
   */
  formatRelative: (date: Date | string) => string;

  /**
   * Format a duration in seconds as localized string
   * @param seconds - Duration in seconds
   * @returns Localized duration string (e.g., "2 hours 30 minutes")
   */
  formatDuration: (seconds: number) => string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse a date input into a Date object
 * @param date - Date object or ISO string
 * @returns Date object
 */
function parseDate(date: Date | string): Date {
  if (typeof date === 'string') {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      console.warn(`Invalid date string: ${date}`);
      return new Date();
    }
    return parsed;
  }
  return date;
}

/**
 * Calculate the relative time difference between a date and now
 * @param date - The date to compare
 * @returns Object containing unit, value, and direction
 */
function getRelativeTimeDiff(date: Date): RelativeTimeDiff {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const isFuture = diffMs > 0;
  const absDiffMs = Math.abs(diffMs);

  const seconds = Math.floor(absDiffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return { unit: 'years', value: years, isFuture };
  if (months > 0) return { unit: 'months', value: months, isFuture };
  if (weeks > 0) return { unit: 'weeks', value: weeks, isFuture };
  if (days > 0) return { unit: 'days', value: days, isFuture };
  if (hours > 0) return { unit: 'hours', value: hours, isFuture };
  if (minutes > 0) return { unit: 'minutes', value: minutes, isFuture };
  if (seconds > 5) return { unit: 'seconds', value: seconds, isFuture };
  return { unit: 'justNow', value: 0, isFuture: false };
}

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================================
// Client-Side Hook
// ============================================================================

/**
 * React hook for locale-aware date/time formatting in client components
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { formatDate, formatRelative } = useDateTimeFormatter();
 *   return (
 *     <div>
 *       <p>Created: {formatDate(item.createdAt, 'long')}</p>
 *       <p>Updated: {formatRelative(item.updatedAt)}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns Object with formatting functions
 */
export function useDateTimeFormatter(): DateTimeFormatterReturn {
  const t = useTranslations('datetime');
  const format = useFormatter();

  const formatDate = (date: Date | string, style: DateFormatStyle = 'medium'): string => {
    try {
      const dateObj = parseDate(date);
      return format.dateTime(dateObj, { dateStyle: style });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (date: Date | string, style: TimeFormatStyle = 'short'): string => {
    try {
      const dateObj = parseDate(date);
      return format.dateTime(dateObj, { timeStyle: style });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  const formatDateTime = (date: Date | string, style: DateFormatStyle = 'medium'): string => {
    try {
      const dateObj = parseDate(date);
      return format.dateTime(dateObj, { dateStyle: style, timeStyle: 'short' });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Invalid Date';
    }
  };

  const formatRelative = (date: Date | string): string => {
    try {
      const dateObj = parseDate(date);
      const diff = getRelativeTimeDiff(dateObj);

      if (diff.unit === 'justNow') {
        return t('relative.justNow');
      }

      const key = diff.isFuture
        ? `relative.in${capitalize(diff.unit)}`
        : `relative.${diff.unit}Ago`;

      return t(key, { count: diff.value });
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return 'Unknown';
    }
  };

  const formatDuration = (seconds: number): string => {
    try {
      if (seconds < 0) seconds = 0;

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      const parts: string[] = [];
      if (hours > 0) parts.push(`${hours} ${t('units.hour', { count: hours })}`);
      if (minutes > 0) parts.push(`${minutes} ${t('units.minute', { count: minutes })}`);
      if (secs > 0 || parts.length === 0) parts.push(`${secs} ${t('units.second', { count: secs })}`);

      return parts.join(' ');
    } catch (error) {
      console.error('Error formatting duration:', error);
      return 'Unknown';
    }
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
    formatDuration,
  };
}

// ============================================================================
// Server-Side Function
// ============================================================================

/**
 * Get locale-aware date/time formatter for server components
 *
 * @example
 * ```tsx
 * async function MyServerComponent() {
 *   const { formatDate, formatRelative } = await getDateTimeFormatter('en');
 *   return (
 *     <div>
 *       <p>Created: {formatDate(item.createdAt, 'long')}</p>
 *       <p>Updated: {formatRelative(item.updatedAt)}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param locale - The locale to use for formatting
 * @returns Object with formatting functions
 */
export async function getDateTimeFormatter(locale: string): Promise<DateTimeFormatterReturn> {
  const t = await getTranslations({ locale, namespace: 'datetime' });
  const format = await getFormatter({ locale });

  const formatDate = (date: Date | string, style: DateFormatStyle = 'medium'): string => {
    try {
      const dateObj = parseDate(date);
      return format.dateTime(dateObj, { dateStyle: style });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (date: Date | string, style: TimeFormatStyle = 'short'): string => {
    try {
      const dateObj = parseDate(date);
      return format.dateTime(dateObj, { timeStyle: style });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  const formatDateTime = (date: Date | string, style: DateFormatStyle = 'medium'): string => {
    try {
      const dateObj = parseDate(date);
      return format.dateTime(dateObj, { dateStyle: style, timeStyle: 'short' });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Invalid Date';
    }
  };

  const formatRelative = (date: Date | string): string => {
    try {
      const dateObj = parseDate(date);
      const diff = getRelativeTimeDiff(dateObj);

      if (diff.unit === 'justNow') {
        return t('relative.justNow');
      }

      const key = diff.isFuture
        ? `relative.in${capitalize(diff.unit)}`
        : `relative.${diff.unit}Ago`;

      return t(key, { count: diff.value });
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return 'Unknown';
    }
  };

  const formatDuration = (seconds: number): string => {
    try {
      if (seconds < 0) seconds = 0;

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      const parts: string[] = [];
      if (hours > 0) parts.push(`${hours} ${t('units.hour', { count: hours })}`);
      if (minutes > 0) parts.push(`${minutes} ${t('units.minute', { count: minutes })}`);
      if (secs > 0 || parts.length === 0) parts.push(`${secs} ${t('units.second', { count: secs })}`);

      return parts.join(' ');
    } catch (error) {
      console.error('Error formatting duration:', error);
      return 'Unknown';
    }
  };

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
    formatDuration,
  };
}
