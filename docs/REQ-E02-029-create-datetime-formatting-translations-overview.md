# Implementation Breakdown: REQ-E02-029 - Create Date/Time Formatting Translations

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-029
**Request Source:** docs/gen_requests_epic2.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.9
**Type:** NEW FEATURE
**Size:** M (Medium)
**Priority:** P1 - High (Foundation component for Epic 2)

---

## 1. Executive Summary

This task creates comprehensive date and time formatting utilities that integrate with the next-intl localization system to display temporal information in locale-appropriate formats across all six supported languages (English, French, Spanish, German, Dutch, Italian). The implementation will replace current hardcoded `en-US` date formatting with locale-aware formatting functions, add support for relative time expressions (e.g., "2 hours ago"), and create translation entries for all temporal strings.

### Key Deliverables
1. Create `datetime` and `relative` namespaces in translation files
2. Create locale-aware date/time formatting utility module
3. Create a custom hook for component-level date formatting
4. Add translations for all 6 supported languages
5. Document usage patterns for future component updates

---

## 2. Current State Analysis

### Existing Date/Time Formatting

**Location:** `/src/lib/utils.ts` (lines 72-129)

Current implementation has two functions with significant limitations:

```typescript
// formatDate: Returns ISO format YYYY-MM-DD (no localization needed)
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// formatPrintableDate: HARDCODED to en-US locale
export function formatPrintableDate(date: string | Date): string {
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

### Components Using Date Formatting (35+ files)

Date formatting is scattered across the codebase with inconsistent patterns:

| Component | Current Pattern | Issue |
|-----------|-----------------|-------|
| `InstructionsTable/GuideCard.tsx` | `toLocaleDateString('en-US', ...)` | Hardcoded locale |
| `InstructionsTable/InstructionsTable.tsx` | `toLocaleDateString('en-US', ...)` | Hardcoded locale |
| `AccessRequestTable.tsx` | `toLocaleDateString('en-US', ...)` | Hardcoded locale |
| `UserDashboard.tsx` | Custom relative time (English only) | No i18n for "ago" |
| `ItemManager/ItemRow.tsx` | `toLocaleDateString('en-US', ...)` | Hardcoded locale |
| `ItemPreview/AnalyticsSection.tsx` | `toLocaleDateString('en-US', ...)` | Hardcoded locale |
| `email-templates.ts` | `toLocaleDateString()` (default) | No locale parameter |

### Relative Time - Current State

Only basic implementation exists in `UserDashboard.tsx`:

```typescript
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};
```

**Issues:**
- No translation for "ago", "yesterday", "today"
- Hardcoded logic without locale awareness
- No support for "X minutes ago", "X days ago", etc.

### i18n Infrastructure (Epic 1 Complete)

**Available from Epic 1:**
- next-intl v4.7.0 installed and configured
- 6 supported locales: `en`, `fr`, `es`, `de`, `nl`, `it`
- `useTranslations()` hook for client components
- `getTranslations()` for server components
- `NextIntlClientProvider` in root layout
- Locale detection via cookie, Accept-Language header, default

**Not Yet Used:**
- `useFormatter()` hook from next-intl (for date/time formatting)
- ICU message format for pluralization

---

## 3. Technical Approach

### Approach Selection: next-intl's Built-in Formatting

next-intl provides `useFormatter()` hook with built-in date/time formatting capabilities that leverage the Intl.DateTimeFormat API with locale awareness. This approach:

1. **Uses existing infrastructure** - No additional dependencies required
2. **Type-safe** - Full TypeScript support
3. **Server/Client compatible** - Works in both environments
4. **ICU pluralization** - Built-in support for relative time plurals

### API Design

```typescript
// New file: /src/lib/i18n/datetime-formatting.ts

// Client-side hook
export function useDateTimeFormatter() {
  const t = useTranslations('datetime');
  const locale = useLocale();

  return {
    // Absolute date formatting
    formatDate: (date: Date | string, format?: 'short' | 'medium' | 'long') => string;
    formatTime: (date: Date | string, format?: 'short' | 'long') => string;
    formatDateTime: (date: Date | string, format?: 'short' | 'medium' | 'long') => string;

    // Relative time formatting
    formatRelative: (date: Date | string) => string;

    // Duration formatting
    formatDuration: (seconds: number) => string;
  };
}

// Server-side function
export async function getDateTimeFormatter(locale: string) {
  // Server-side equivalent
}
```

---

## 4. Implementation Tasks

### Task 4.1: Create Translation Namespace Structure

**Description:** Add `datetime` and `time` namespaces to `/messages/en.json` with all required translation keys for date/time formatting.

**Translation Keys Required:**

```json
{
  "datetime": {
    "formats": {
      "dateShort": "{date, date, short}",
      "dateMedium": "{date, date, medium}",
      "dateLong": "{date, date, long}",
      "timeShort": "{date, time, short}",
      "timeLong": "{date, time, long}",
      "dateTimeShort": "{date, date, short} {date, time, short}",
      "dateTimeMedium": "{date, date, medium} at {date, time, short}",
      "dateTimeLong": "{date, date, long} at {date, time, long}"
    },
    "relative": {
      "justNow": "Just now",
      "secondsAgo": "{count, plural, one {# second ago} other {# seconds ago}}",
      "minutesAgo": "{count, plural, one {# minute ago} other {# minutes ago}}",
      "hoursAgo": "{count, plural, one {# hour ago} other {# hours ago}}",
      "daysAgo": "{count, plural, one {# day ago} other {# days ago}}",
      "weeksAgo": "{count, plural, one {# week ago} other {# weeks ago}}",
      "monthsAgo": "{count, plural, one {# month ago} other {# months ago}}",
      "yearsAgo": "{count, plural, one {# year ago} other {# years ago}}",
      "inSeconds": "{count, plural, one {in # second} other {in # seconds}}",
      "inMinutes": "{count, plural, one {in # minute} other {in # minutes}}",
      "inHours": "{count, plural, one {in # hour} other {in # hours}}",
      "inDays": "{count, plural, one {in # day} other {in # days}}",
      "inWeeks": "{count, plural, one {in # week} other {in # weeks}}",
      "inMonths": "{count, plural, one {in # month} other {in # months}}",
      "inYears": "{count, plural, one {in # year} other {in # years}}",
      "today": "Today",
      "yesterday": "Yesterday",
      "tomorrow": "Tomorrow",
      "thisWeek": "This week",
      "lastWeek": "Last week",
      "nextWeek": "Next week"
    },
    "units": {
      "second": "{count, plural, one {second} other {seconds}}",
      "minute": "{count, plural, one {minute} other {minutes}}",
      "hour": "{count, plural, one {hour} other {hours}}",
      "day": "{count, plural, one {day} other {days}}",
      "week": "{count, plural, one {week} other {weeks}}",
      "month": "{count, plural, one {month} other {months}}",
      "year": "{count, plural, one {year} other {years}}"
    },
    "days": {
      "sunday": "Sunday",
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday"
    },
    "daysShort": {
      "sunday": "Sun",
      "monday": "Mon",
      "tuesday": "Tue",
      "wednesday": "Wed",
      "thursday": "Thu",
      "friday": "Fri",
      "saturday": "Sat"
    },
    "months": {
      "january": "January",
      "february": "February",
      "march": "March",
      "april": "April",
      "may": "May",
      "june": "June",
      "july": "July",
      "august": "August",
      "september": "September",
      "october": "October",
      "november": "November",
      "december": "December"
    },
    "monthsShort": {
      "january": "Jan",
      "february": "Feb",
      "march": "Mar",
      "april": "Apr",
      "may": "May",
      "june": "Jun",
      "july": "Jul",
      "august": "Aug",
      "september": "Sep",
      "october": "Oct",
      "november": "Nov",
      "december": "Dec"
    },
    "periods": {
      "am": "AM",
      "pm": "PM"
    }
  }
}
```

**Files to Modify:**
- `/messages/en.json`

**Estimated Effort:** 1-2 hours

---

### Task 4.2: Create Date/Time Formatting Utility Module

**Description:** Create a new utility module that provides locale-aware date/time formatting functions using next-intl's built-in capabilities.

**New File:** `/src/lib/i18n/datetime-formatting.ts`

**Implementation Details:**

```typescript
/**
 * Date/Time Formatting Utilities for i18n
 *
 * Provides locale-aware date/time formatting functions that integrate
 * with next-intl's localization system.
 *
 * @created 2026-01-20
 * @lastModified 2026-01-20
 */

import { useFormatter, useTranslations, useLocale } from 'next-intl';
import { getFormatter, getTranslations } from 'next-intl/server';

export type DateFormatStyle = 'short' | 'medium' | 'long';
export type TimeFormatStyle = 'short' | 'long';

/**
 * Calculate the relative time difference between a date and now
 */
function getRelativeTimeDiff(date: Date): { unit: string; value: number; isFuture: boolean } {
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

// Client-side hook implementation
export function useDateTimeFormatter() {
  const t = useTranslations('datetime');
  const format = useFormatter();

  return {
    formatDate: (date: Date | string, style: DateFormatStyle = 'medium') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format.dateTime(dateObj, {
        dateStyle: style,
      });
    },

    formatTime: (date: Date | string, style: TimeFormatStyle = 'short') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format.dateTime(dateObj, {
        timeStyle: style,
      });
    },

    formatDateTime: (date: Date | string, style: DateFormatStyle = 'medium') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format.dateTime(dateObj, {
        dateStyle: style,
        timeStyle: 'short',
      });
    },

    formatRelative: (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const diff = getRelativeTimeDiff(dateObj);

      if (diff.unit === 'justNow') {
        return t('relative.justNow');
      }

      const key = diff.isFuture ? `in${capitalize(diff.unit)}` : `${diff.unit}Ago`;
      return t(`relative.${key}`, { count: diff.value });
    },

    formatDuration: (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      const parts: string[] = [];
      if (hours > 0) parts.push(t('units.hour', { count: hours }));
      if (minutes > 0) parts.push(t('units.minute', { count: minutes }));
      if (secs > 0 || parts.length === 0) parts.push(t('units.second', { count: secs }));

      return parts.join(' ');
    },
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Server-side function
export async function getDateTimeFormatter(locale: string) {
  const t = await getTranslations({ locale, namespace: 'datetime' });
  const format = await getFormatter({ locale });

  // Return similar API for server components
  return {
    formatDate: (date: Date | string, style: DateFormatStyle = 'medium') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format.dateTime(dateObj, { dateStyle: style });
    },
    // ... (same methods as client hook)
  };
}
```

**Files to Create:**
- `/src/lib/i18n/datetime-formatting.ts`

**Files to Modify:**
- `/src/lib/i18n/index.ts` (add export)

**Estimated Effort:** 3-4 hours

---

### Task 4.3: Generate Translations for 5 Non-English Languages

**Description:** Create translation entries for `datetime` namespace in all non-English language files.

**Files to Modify:**
- `/messages/fr.json` (French)
- `/messages/es.json` (Spanish)
- `/messages/de.json` (German)
- `/messages/nl.json` (Dutch)
- `/messages/it.json` (Italian)

**Key Translation Considerations:**

| Language | Relative Time Pattern | Plural Rules | 12/24h Clock |
|----------|----------------------|--------------|--------------|
| English | "2 hours ago" | one/other | 12h (AM/PM) |
| French | "il y a 2 heures" | one/other | 24h |
| Spanish | "hace 2 horas" | one/other | 24h |
| German | "vor 2 Stunden" | one/other | 24h |
| Dutch | "2 uur geleden" | one/other | 24h |
| Italian | "2 ore fa" | one/other | 24h |

**Sample Translation (French):**

```json
{
  "datetime": {
    "relative": {
      "justNow": "À l'instant",
      "secondsAgo": "{count, plural, one {il y a # seconde} other {il y a # secondes}}",
      "minutesAgo": "{count, plural, one {il y a # minute} other {il y a # minutes}}",
      "hoursAgo": "{count, plural, one {il y a # heure} other {il y a # heures}}",
      "daysAgo": "{count, plural, one {il y a # jour} other {il y a # jours}}",
      "weeksAgo": "{count, plural, one {il y a # semaine} other {il y a # semaines}}",
      "monthsAgo": "{count, plural, one {il y a # mois} other {il y a # mois}}",
      "yearsAgo": "{count, plural, one {il y a # an} other {il y a # ans}}",
      "today": "Aujourd'hui",
      "yesterday": "Hier",
      "tomorrow": "Demain"
    }
  }
}
```

**Estimated Effort:** 2-3 hours

---

### Task 4.4: Update Existing formatPrintableDate Function

**Description:** Update the existing `formatPrintableDate` function in `/src/lib/utils.ts` to accept a locale parameter or deprecate it in favor of the new utility.

**Current Code (to modify):**
```typescript
// /src/lib/utils.ts lines 110-129
export function formatPrintableDate(date: string | Date): string {
  // ... hardcoded en-US
}
```

**Options:**
1. **Option A (Recommended):** Mark as deprecated, point to new utility
2. **Option B:** Add locale parameter for backward compatibility

**Implementation (Option A):**

```typescript
/**
 * @deprecated Use useDateTimeFormatter() hook from '@/lib/i18n/datetime-formatting' instead
 * This function will be removed in a future version.
 */
export function formatPrintableDate(date: string | Date): string {
  console.warn('formatPrintableDate is deprecated. Use useDateTimeFormatter() for locale-aware formatting.');
  // Keep existing implementation for backward compatibility
  // ...
}
```

**Files to Modify:**
- `/src/lib/utils.ts`

**Estimated Effort:** 30 minutes

---

### Task 4.5: Create Documentation and Usage Examples

**Description:** Document the new date/time formatting utilities with usage examples.

**Documentation Content:**
- API reference for `useDateTimeFormatter()` hook
- API reference for `getDateTimeFormatter()` server function
- Migration guide from old functions
- Examples for common use cases
- Locale-specific formatting notes

**Files to Create:**
- `/docs/i18n/datetime-formatting.md`

**Estimated Effort:** 1 hour

---

### Task 4.6: Add Unit Tests for Date/Time Formatting

**Description:** Create unit tests to verify date/time formatting works correctly across all locales.

**Test Cases:**
1. Absolute date formatting (short, medium, long) for each locale
2. Time formatting (12h vs 24h) per locale conventions
3. Relative time formatting with edge cases
4. Future dates ("in X days")
5. Boundary conditions (just now, exactly 1 hour, etc.)
6. Invalid date handling
7. String date parsing

**Files to Create:**
- `/src/lib/i18n/__tests__/datetime-formatting.test.ts`

**Estimated Effort:** 2 hours

---

## 5. Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/datetime-formatting.ts` | Main date/time formatting utility module |
| `/src/lib/i18n/__tests__/datetime-formatting.test.ts` | Unit tests |
| `/docs/i18n/datetime-formatting.md` | Usage documentation |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/messages/en.json` | Add `datetime` namespace |
| `/messages/fr.json` | Add `datetime` namespace translations |
| `/messages/es.json` | Add `datetime` namespace translations |
| `/messages/de.json` | Add `datetime` namespace translations |
| `/messages/nl.json` | Add `datetime` namespace translations |
| `/messages/it.json` | Add `datetime` namespace translations |
| `/src/lib/utils.ts` | Deprecate `formatPrintableDate` function |
| `/src/lib/i18n/index.ts` | Export new utilities |

### Functions to Create

| Function | Location | Purpose |
|----------|----------|---------|
| `useDateTimeFormatter()` | `/src/lib/i18n/datetime-formatting.ts` | Client-side hook for date/time formatting |
| `getDateTimeFormatter()` | `/src/lib/i18n/datetime-formatting.ts` | Server-side function for date/time formatting |
| `getRelativeTimeDiff()` | `/src/lib/i18n/datetime-formatting.ts` | Helper to calculate relative time difference |

### Functions to Deprecate (NOT Remove)

| Function | Location | Reason |
|----------|----------|--------|
| `formatPrintableDate()` | `/src/lib/utils.ts` | Replaced by locale-aware utility, keep for backward compatibility |

---

## 6. Dependencies

### Required (Already Installed)

| Package | Version | Purpose |
|---------|---------|---------|
| `next-intl` | ^4.7.0 | i18n framework with date/time formatting |
| `react` | 19.1.0 | React hooks |

### No Additional Dependencies Required

The implementation uses next-intl's built-in `useFormatter()` hook which leverages the browser's `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` APIs. No additional date libraries (date-fns, dayjs, moment) are needed.

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation quality for relative time | Medium | Medium | Use professional translation review for critical strings |
| Pluralization edge cases | Low | Low | next-intl handles ICU pluralization well; add unit tests |
| Browser Intl API inconsistencies | Low | Low | Modern browsers have good support; graceful degradation in place |
| Breaking existing components | Low | Medium | Deprecate old function instead of removing; phased migration |
| Server/client hydration mismatch | Medium | High | Use consistent locale detection; test SSR scenarios |

---

## 8. Acceptance Criteria

Based on REQ-E02-029 requirements:

- [ ] Date/time formatting utilities are created within the localization infrastructure
- [ ] Utilities integrate with next-intl or leverage its formatting capabilities
- [ ] Relative time formatting function translates expressions like "X ago" and "in X" to all six languages
- [ ] Relative time supports common intervals including seconds, minutes, hours, days, weeks, months, and years
- [ ] Relative time expressions use appropriate singular and plural forms in each language
- [ ] Absolute date formatting function formats dates according to locale conventions for all six languages
- [ ] Date formatting supports short formats (numeric), medium formats (abbreviated month), and long formats (full month name)
- [ ] Time formatting function displays times using 12-hour or 24-hour clocks appropriate to each locale
- [ ] Time formatting includes proper AM/PM indicators in locales where applicable
- [ ] DateTime combination formatting displays both date and time components in locale-appropriate order
- [ ] Duration formatting expresses time spans using localized unit labels (hours, minutes, seconds)
- [ ] All formatting utilities accept standard JavaScript Date objects or timestamps
- [ ] Utilities handle timezone considerations appropriately when formatting
- [ ] Formatted output maintains proper character encoding for all languages including accented characters
- [ ] Common temporal translations are added to the i18n `datetime` namespace
- [ ] Temporal unit labels (second, minute, hour, day, week, month, year) are translated in singular and plural forms
- [ ] Documentation is provided showing usage examples for each formatting utility
- [ ] Utilities are exported from a central location for easy import throughout the application
- [ ] Formatting functions gracefully handle invalid date inputs without throwing exceptions
- [ ] All formatting respects the user's current active locale from the localization context

---

## 9. Testing Strategy

### Unit Tests

1. **Format Accuracy Tests**
   - Verify each format style produces expected output for known dates
   - Test all 6 locales

2. **Relative Time Tests**
   - Test boundaries (0 seconds, 59 seconds, 60 seconds, etc.)
   - Test past and future dates
   - Verify pluralization (1 hour vs 2 hours)

3. **Edge Case Tests**
   - Invalid dates (null, undefined, malformed strings)
   - Extreme dates (very old, very far future)
   - Timezone edge cases

### Integration Tests

1. **Hook Integration**
   - Test `useDateTimeFormatter()` in component context
   - Verify locale changes trigger re-rendering

2. **Server Component Tests**
   - Test `getDateTimeFormatter()` in server context
   - Verify SSR output matches client hydration

### Manual Testing Checklist

- [ ] Verify relative time displays correctly in all 6 languages
- [ ] Verify date format matches regional conventions (DD/MM/YYYY vs MM/DD/YYYY)
- [ ] Verify time format (12h vs 24h) is appropriate per locale
- [ ] Test language switching updates all formatted dates immediately
- [ ] Test on mobile devices for layout issues with longer translated text

---

## 10. Future Considerations (Out of Scope)

The following are **NOT** part of this task but should be considered for future work:

1. **Component Migration** - Updating 35+ components to use new utilities (separate Epic 2 tasks)
2. **Timezone Selection UI** - Allowing users to set preferred timezone
3. **Calendar Localization** - First day of week, weekend definitions
4. **Number Formatting** - Currency, percentages (separate utility)
5. **RTL Language Support** - Arabic, Hebrew date formatting

---

## 11. Implementation Order

**Recommended execution order:**

1. **Task 4.1** - Create English translation namespace (foundation)
2. **Task 4.2** - Create utility module (core implementation)
3. **Task 4.6** - Add unit tests (verify implementation)
4. **Task 4.3** - Generate non-English translations
5. **Task 4.4** - Deprecate old function
6. **Task 4.5** - Create documentation

**Total Estimated Effort:** 8-12 hours (1-2 days)

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md) - Sub-Epic 2H, Task 2H.9
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-029
- [next-intl Formatting Documentation](https://next-intl-docs.vercel.app/docs/usage/dates-times)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Intl.DateTimeFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Intl.RelativeTimeFormat MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat)

---

*Document generated for FAQBNB L10N Epic 2 - Static UI Translation*
