/**
 * Unit Tests for Date/Time Formatting Utilities
 *
 * Tests for the datetime-formatting module which provides locale-aware
 * date/time formatting for the i18n system.
 *
 * @created 2026-01-21
 * @lastModified 2026-01-21
 */

import { describe, it, expect, vi } from 'vitest';

// Mock next-intl hooks and server functions
vi.mock('next-intl', () => ({
  useFormatter: () => ({
    dateTime: (date: Date, options: { dateStyle?: string; timeStyle?: string }) => {
      if (options.dateStyle && options.timeStyle) {
        return date.toLocaleString('en-US', {
          dateStyle: options.dateStyle as 'short' | 'medium' | 'long',
          timeStyle: options.timeStyle as 'short' | 'long',
        });
      }
      if (options.dateStyle) {
        return date.toLocaleDateString('en-US', {
          dateStyle: options.dateStyle as 'short' | 'medium' | 'long',
        });
      }
      if (options.timeStyle) {
        return date.toLocaleTimeString('en-US', {
          timeStyle: options.timeStyle as 'short' | 'long',
        });
      }
      return date.toLocaleString('en-US');
    },
  }),
  useTranslations: () => {
    const translations: Record<string, string> = {
      'relative.justNow': 'Just now',
      'relative.secondsAgo': '{count, plural, one {# second ago} other {# seconds ago}}',
      'relative.minutesAgo': '{count, plural, one {# minute ago} other {# minutes ago}}',
      'relative.hoursAgo': '{count, plural, one {# hour ago} other {# hours ago}}',
      'relative.daysAgo': '{count, plural, one {# day ago} other {# days ago}}',
      'relative.weeksAgo': '{count, plural, one {# week ago} other {# weeks ago}}',
      'relative.monthsAgo': '{count, plural, one {# month ago} other {# months ago}}',
      'relative.yearsAgo': '{count, plural, one {# year ago} other {# years ago}}',
      'relative.inSeconds': '{count, plural, one {in # second} other {in # seconds}}',
      'relative.inMinutes': '{count, plural, one {in # minute} other {in # minutes}}',
      'relative.inHours': '{count, plural, one {in # hour} other {in # hours}}',
      'relative.inDays': '{count, plural, one {in # day} other {in # days}}',
      'relative.inWeeks': '{count, plural, one {in # week} other {in # weeks}}',
      'relative.inMonths': '{count, plural, one {in # month} other {in # months}}',
      'relative.inYears': '{count, plural, one {in # year} other {in # years}}',
      'units.second': '{count, plural, one {second} other {seconds}}',
      'units.minute': '{count, plural, one {minute} other {minutes}}',
      'units.hour': '{count, plural, one {hour} other {hours}}',
      'units.day': '{count, plural, one {day} other {days}}',
      'units.week': '{count, plural, one {week} other {weeks}}',
      'units.month': '{count, plural, one {month} other {months}}',
      'units.year': '{count, plural, one {year} other {years}}',
    };

    return (key: string, params?: { count?: number }) => {
      const template = translations[key];
      if (!template) return key;

      // Handle ICU pluralization for testing
      if (params?.count !== undefined) {
        const count = params.count;
        // Simple pluralization logic for testing
        if (template.includes('{count, plural,')) {
          const isOne = count === 1;
          const oneMatch = template.match(/one \{([^}]+)\}/);
          const otherMatch = template.match(/other \{([^}]+)\}/);
          const result = isOne ? oneMatch?.[1] : otherMatch?.[1];
          return result?.replace('#', String(count)) ?? template;
        }
      }
      return template;
    };
  },
}));

vi.mock('next-intl/server', () => ({
  getFormatter: async () => ({
    dateTime: (date: Date, options: { dateStyle?: string; timeStyle?: string }) => {
      if (options.dateStyle && options.timeStyle) {
        return date.toLocaleString('en-US', {
          dateStyle: options.dateStyle as 'short' | 'medium' | 'long',
          timeStyle: options.timeStyle as 'short' | 'long',
        });
      }
      if (options.dateStyle) {
        return date.toLocaleDateString('en-US', {
          dateStyle: options.dateStyle as 'short' | 'medium' | 'long',
        });
      }
      if (options.timeStyle) {
        return date.toLocaleTimeString('en-US', {
          timeStyle: options.timeStyle as 'short' | 'long',
        });
      }
      return date.toLocaleString('en-US');
    },
  }),
  getTranslations: async () => {
    const translations: Record<string, string> = {
      'relative.justNow': 'Just now',
      'relative.secondsAgo': '{count, plural, one {# second ago} other {# seconds ago}}',
      'relative.minutesAgo': '{count, plural, one {# minute ago} other {# minutes ago}}',
      'relative.hoursAgo': '{count, plural, one {# hour ago} other {# hours ago}}',
      'relative.daysAgo': '{count, plural, one {# day ago} other {# days ago}}',
      'relative.weeksAgo': '{count, plural, one {# week ago} other {# weeks ago}}',
      'relative.monthsAgo': '{count, plural, one {# month ago} other {# months ago}}',
      'relative.yearsAgo': '{count, plural, one {# year ago} other {# years ago}}',
      'relative.inSeconds': '{count, plural, one {in # second} other {in # seconds}}',
      'relative.inMinutes': '{count, plural, one {in # minute} other {in # minutes}}',
      'relative.inHours': '{count, plural, one {in # hour} other {in # hours}}',
      'relative.inDays': '{count, plural, one {in # day} other {in # days}}',
      'relative.inWeeks': '{count, plural, one {in # week} other {in # weeks}}',
      'relative.inMonths': '{count, plural, one {in # month} other {in # months}}',
      'relative.inYears': '{count, plural, one {in # year} other {in # years}}',
      'units.second': '{count, plural, one {second} other {seconds}}',
      'units.minute': '{count, plural, one {minute} other {minutes}}',
      'units.hour': '{count, plural, one {hour} other {hours}}',
      'units.day': '{count, plural, one {day} other {days}}',
      'units.week': '{count, plural, one {week} other {weeks}}',
      'units.month': '{count, plural, one {month} other {months}}',
      'units.year': '{count, plural, one {year} other {years}}',
    };

    return (key: string, params?: { count?: number }) => {
      const template = translations[key];
      if (!template) return key;

      if (params?.count !== undefined) {
        const count = params.count;
        if (template.includes('{count, plural,')) {
          const isOne = count === 1;
          const oneMatch = template.match(/one \{([^}]+)\}/);
          const otherMatch = template.match(/other \{([^}]+)\}/);
          const result = isOne ? oneMatch?.[1] : otherMatch?.[1];
          return result?.replace('#', String(count)) ?? template;
        }
      }
      return template;
    };
  },
}));

// Import after mocks are set up
import { useDateTimeFormatter, getDateTimeFormatter } from '../datetime-formatting';

describe('datetime-formatting', () => {
  describe('useDateTimeFormatter', () => {
    describe('formatDate', () => {
      it('should format date with short style', () => {
        const { formatDate } = useDateTimeFormatter();
        const date = new Date('2026-01-20T10:30:00Z');
        const result = formatDate(date, 'short');
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });

      it('should format date with medium style (default)', () => {
        const { formatDate } = useDateTimeFormatter();
        const date = new Date('2026-01-20T10:30:00Z');
        const result = formatDate(date);
        expect(result).toBeTruthy();
      });

      it('should format date with long style', () => {
        const { formatDate } = useDateTimeFormatter();
        const date = new Date('2026-01-20T10:30:00Z');
        const result = formatDate(date, 'long');
        expect(result).toBeTruthy();
      });

      it('should accept ISO string input', () => {
        const { formatDate } = useDateTimeFormatter();
        const result = formatDate('2026-01-20T10:30:00Z');
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });

      it('should handle invalid date gracefully', () => {
        const { formatDate } = useDateTimeFormatter();
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const result = formatDate('invalid-date');
        expect(result).toBeTruthy(); // Returns current date on invalid input
        consoleSpy.mockRestore();
      });
    });

    describe('formatTime', () => {
      it('should format time with short style (default)', () => {
        const { formatTime } = useDateTimeFormatter();
        const date = new Date('2026-01-20T14:30:00');
        const result = formatTime(date);
        expect(result).toBeTruthy();
      });

      it('should format time with long style', () => {
        const { formatTime } = useDateTimeFormatter();
        const date = new Date('2026-01-20T14:30:00');
        const result = formatTime(date, 'long');
        expect(result).toBeTruthy();
      });
    });

    describe('formatDateTime', () => {
      it('should combine date and time formatting', () => {
        const { formatDateTime } = useDateTimeFormatter();
        const date = new Date('2026-01-20T14:30:00');
        const result = formatDateTime(date);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });

      it('should accept different styles', () => {
        const { formatDateTime } = useDateTimeFormatter();
        const date = new Date('2026-01-20T14:30:00');
        const short = formatDateTime(date, 'short');
        const long = formatDateTime(date, 'long');
        expect(short).toBeTruthy();
        expect(long).toBeTruthy();
      });
    });

    describe('formatRelative', () => {
      it('should return "Just now" for very recent times', () => {
        const { formatRelative } = useDateTimeFormatter();
        // Within 5 seconds of now
        const now = new Date();
        const result = formatRelative(now);
        expect(result).toBe('Just now');
      });

      it('should format seconds ago correctly', () => {
        const { formatRelative } = useDateTimeFormatter();
        // 30 seconds ago
        const date = new Date(Date.now() - 30 * 1000);
        const result = formatRelative(date);
        expect(result).toContain('seconds ago');
      });

      it('should format minutes ago correctly', () => {
        const { formatRelative } = useDateTimeFormatter();
        // 5 minutes ago
        const date = new Date(Date.now() - 5 * 60 * 1000);
        const result = formatRelative(date);
        expect(result).toContain('minutes ago');
      });

      it('should format hours ago correctly', () => {
        const { formatRelative } = useDateTimeFormatter();
        // 3 hours ago
        const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
        const result = formatRelative(date);
        expect(result).toContain('hours ago');
      });

      it('should format days ago correctly', () => {
        const { formatRelative } = useDateTimeFormatter();
        // 2 days ago
        const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        const result = formatRelative(date);
        expect(result).toContain('days ago');
      });

      it('should format weeks ago correctly', () => {
        const { formatRelative } = useDateTimeFormatter();
        // 2 weeks ago
        const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const result = formatRelative(date);
        expect(result).toContain('weeks ago');
      });

      it('should format months ago correctly', () => {
        const { formatRelative } = useDateTimeFormatter();
        // ~3 months ago (90 days)
        const date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const result = formatRelative(date);
        expect(result).toContain('months ago');
      });

      it('should format years ago correctly', () => {
        const { formatRelative } = useDateTimeFormatter();
        // ~2 years ago (730 days)
        const date = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
        const result = formatRelative(date);
        expect(result).toContain('years ago');
      });

      it('should handle future dates with "in X" format', () => {
        const { formatRelative } = useDateTimeFormatter();
        // 5 days in future
        const date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        const result = formatRelative(date);
        expect(result).toContain('in');
        expect(result).toContain('days');
      });

      it('should handle singular/plural correctly for 1 unit', () => {
        const { formatRelative } = useDateTimeFormatter();
        // Exactly 1 hour ago
        const date = new Date(Date.now() - 1 * 60 * 60 * 1000);
        const result = formatRelative(date);
        expect(result).toBe('1 hour ago');
      });

      it('should handle singular/plural correctly for multiple units', () => {
        const { formatRelative } = useDateTimeFormatter();
        // 2 hours ago
        const date = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const result = formatRelative(date);
        expect(result).toBe('2 hours ago');
      });
    });

    describe('formatDuration', () => {
      it('should format duration in hours, minutes, seconds', () => {
        const { formatDuration } = useDateTimeFormatter();
        // 1 hour, 1 minute, 1 second = 3661 seconds
        const result = formatDuration(3661);
        expect(result).toContain('hour');
        expect(result).toContain('minute');
        expect(result).toContain('second');
      });

      it('should omit zero-value units', () => {
        const { formatDuration } = useDateTimeFormatter();
        // Exactly 1 hour = 3600 seconds
        const result = formatDuration(3600);
        expect(result).toContain('hour');
        expect(result).not.toContain('minute');
        expect(result).not.toContain('second');
      });

      it('should handle zero seconds', () => {
        const { formatDuration } = useDateTimeFormatter();
        const result = formatDuration(0);
        expect(result).toContain('0');
        expect(result).toContain('second');
      });

      it('should handle negative values gracefully (treat as 0)', () => {
        const { formatDuration } = useDateTimeFormatter();
        const result = formatDuration(-100);
        expect(result).toContain('0');
        expect(result).toContain('second');
      });

      it('should format only minutes and seconds', () => {
        const { formatDuration } = useDateTimeFormatter();
        // 5 minutes 30 seconds = 330 seconds
        const result = formatDuration(330);
        expect(result).not.toContain('hour');
        expect(result).toContain('minute');
        expect(result).toContain('second');
      });
    });
  });

  describe('getDateTimeFormatter (server)', () => {
    it('should return same API as client hook', async () => {
      const formatter = await getDateTimeFormatter('en');
      expect(formatter).toHaveProperty('formatDate');
      expect(formatter).toHaveProperty('formatTime');
      expect(formatter).toHaveProperty('formatDateTime');
      expect(formatter).toHaveProperty('formatRelative');
      expect(formatter).toHaveProperty('formatDuration');
    });

    it('should accept locale parameter', async () => {
      const formatter = await getDateTimeFormatter('fr');
      expect(formatter).toBeTruthy();
    });

    it('should format dates correctly', async () => {
      const { formatDate } = await getDateTimeFormatter('en');
      const date = new Date('2026-01-20T10:30:00Z');
      const result = formatDate(date, 'medium');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should format relative times correctly', async () => {
      const { formatRelative } = await getDateTimeFormatter('en');
      const result = formatRelative(new Date());
      expect(result).toBeTruthy();
    });

    it('should format durations correctly', async () => {
      const { formatDuration } = await getDateTimeFormatter('en');
      const result = formatDuration(3661);
      expect(result).toBeTruthy();
      expect(result).toContain('hour');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string input', () => {
      const { formatDate } = useDateTimeFormatter();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // Empty string is technically invalid and will trigger the fallback
      const result = formatDate('');
      expect(result).toBeTruthy();
      consoleSpy.mockRestore();
    });

    it('should handle very old dates', () => {
      const { formatDate } = useDateTimeFormatter();
      const result = formatDate(new Date('1900-01-01'));
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle very far future dates', () => {
      const { formatDate } = useDateTimeFormatter();
      const result = formatDate(new Date('2100-12-31'));
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle Date object at midnight', () => {
      const { formatTime } = useDateTimeFormatter();
      const result = formatTime(new Date('2026-01-20T00:00:00'));
      expect(result).toBeTruthy();
    });

    it('should handle Date object at end of day', () => {
      const { formatTime } = useDateTimeFormatter();
      const result = formatTime(new Date('2026-01-20T23:59:59'));
      expect(result).toBeTruthy();
    });

    it('should handle large duration values', () => {
      const { formatDuration } = useDateTimeFormatter();
      // 100 hours worth of seconds
      const result = formatDuration(360000);
      expect(result).toBeTruthy();
      expect(result).toContain('hour');
    });
  });
});
