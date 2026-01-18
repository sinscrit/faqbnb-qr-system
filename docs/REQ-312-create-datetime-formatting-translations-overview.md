# REQ-312: Implementation Breakdown - Create Date and Time Formatting Translations

**Document Generated:** 2026-01-18T19:30:00
**Last Modified:** 2026-01-18T19:30:00
**Request Reference:** `/docs/gen_requests_epic2.md` - Request #312
**Implementation Plan Reference:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.9

---

## Overview

This document provides a technical implementation breakdown for creating localized date and time formatting utilities that automatically display dates, times, and timestamps in culturally appropriate formats based on the user's language and locale preferences. This task establishes the foundational date/time internationalization infrastructure that will be used across the entire application.

### Task Context from Implementation Plan

| Attribute | Value |
|-----------|-------|
| Sub-Epic | 2H - Common & Shared Components |
| Task ID | 2H.9 |
| Task Title | Create date/time formatting translations |
| Dependencies | Task 2H.1 (Create common namespace structure), Epic 1 (next-intl setup) |
| Estimated Strings | ~30 |
| Priority | Part of first sub-epic (foundation) |

### Scope

- Create a centralized date/time formatting utility module with locale-aware functions
- Add date/time related translation keys to the `common.time` namespace in `/messages/en.json`
- Implement relative time formatting ("2 hours ago", "yesterday", "just now")
- Support multiple format styles (short, medium, long, full) for both dates and times
- Replace all existing hardcoded date formatting across the codebase with new utilities
- Ensure 12-hour vs 24-hour time format respects locale conventions
- Translate month names, day names, and relative time expressions for all 6 languages

---

## Technical Context

### Existing Stack (from Implementation Plan)

| Technology | Version/Details |
|------------|-----------------|
| Framework | Next.js 15.5.9 with App Router |
| React | 19.1.0 |
| Language | TypeScript 5.x (strict mode) |
| Styling | Tailwind CSS 4.x |
| i18n Framework | next-intl (from Epic 1) |
| Date Handling | Native JavaScript Date, Intl.DateTimeFormat |

### Dependencies from Epic 1

| Dependency | Location | Purpose |
|------------|----------|---------|
| next-intl package | `package.json` | i18n framework |
| IntlProvider | `/src/app/layout.tsx` | Provider wrapper |
| Translation files | `/messages/*.json` | Translation storage |
| useTranslations hook | next-intl | Client component translations |
| getTranslations | next-intl/server | Server component translations |
| useLocale hook | next-intl | Get current locale |
| useFormatter hook | next-intl | Format dates/numbers with locale |

### Existing Date Formatting Patterns

| File | Function | Current Behavior |
|------|----------|------------------|
| `/src/lib/utils.ts` | `formatDate()` | Manual YYYY-MM-DD string concatenation |
| `/src/lib/utils.ts` | `formatPrintableDate()` | `toLocaleDateString('en-US')` with options |
| `/src/components/ItemManager/components/ItemRow.tsx` | `formatDate()` | `Intl.DateTimeFormat('en-US')` |
| `/src/components/InstructionsTable/InstructionsTable.tsx` | `formatDate()` | `toLocaleDateString('en-US')` |
| `/src/components/InstructionsTable/GuideCard.tsx` | `formatDate()` | `toLocaleDateString('en-US')` |
| `/src/components/ItemManager/utils/formatUtils.ts` | `formatDuration()` | Manual MM:SS/HH:MM:SS formatting |

---

## Current State Analysis

### Date/Time Formatting Issues Identified

#### Hardcoded Locale Pattern
All current date formatting functions hardcode `'en-US'` locale:
```typescript
// Current pattern (hardcoded)
new Intl.DateTimeFormat('en-US', options).format(date)
date.toLocaleDateString('en-US', options)
```

#### Inconsistent Implementations
Multiple implementations of similar formatting logic exist across components:
- `ItemRow.tsx` uses `Intl.DateTimeFormat`
- `InstructionsTable.tsx` uses `toLocaleDateString`
- `utils.ts` uses manual string concatenation

#### Missing Relative Time
No relative time formatting exists (e.g., "2 hours ago", "yesterday", "just now")

#### No Time Zone Awareness
Current implementations don't handle time zones consistently

### Files Currently Using Date Formatting

| File | Usage Context |
|------|---------------|
| `/src/lib/utils.ts` | General utility functions |
| `/src/lib/analytics.ts` | Analytics date calculations |
| `/src/components/ItemManager/components/ItemRow.tsx` | Item list creation dates |
| `/src/components/InstructionsTable/InstructionsTable.tsx` | Guide/instruction dates |
| `/src/components/InstructionsTable/GuideCard.tsx` | Guide card dates |
| `/src/components/PropertiesManagement.tsx` | Property creation dates |
| `/src/components/AccessRequestTable.tsx` | Access request dates |
| `/src/components/VisitCounter.tsx` | Visit timestamp displays |
| `/src/app/dashboard2/items/page.tsx` | Item dashboard dates |
| `/src/middleware.ts` | Logging timestamps |

---

## Translation Namespace Structure

### Proposed `common.time` Namespace

```json
{
  "common": {
    "time": {
      "relative": {
        "justNow": "Just now",
        "minutesAgo": "{count, plural, one {# minute} other {# minutes}} ago",
        "hoursAgo": "{count, plural, one {# hour} other {# hours}} ago",
        "daysAgo": "{count, plural, one {# day} other {# days}} ago",
        "weeksAgo": "{count, plural, one {# week} other {# weeks}} ago",
        "monthsAgo": "{count, plural, one {# month} other {# months}} ago",
        "yearsAgo": "{count, plural, one {# year} other {# years}} ago",
        "inMinutes": "in {count, plural, one {# minute} other {# minutes}}",
        "inHours": "in {count, plural, one {# hour} other {# hours}}",
        "inDays": "in {count, plural, one {# day} other {# days}}",
        "today": "Today",
        "yesterday": "Yesterday",
        "tomorrow": "Tomorrow",
        "thisWeek": "This week",
        "lastWeek": "Last week",
        "thisMonth": "This month",
        "lastMonth": "Last month"
      },
      "periods": {
        "am": "AM",
        "pm": "PM",
        "morning": "Morning",
        "afternoon": "Afternoon",
        "evening": "Evening",
        "night": "Night"
      },
      "labels": {
        "date": "Date",
        "time": "Time",
        "dateTime": "Date & Time",
        "createdAt": "Created",
        "updatedAt": "Updated",
        "lastModified": "Last modified",
        "scheduledFor": "Scheduled for",
        "expiresOn": "Expires on",
        "validUntil": "Valid until"
      },
      "duration": {
        "seconds": "{count, plural, one {# second} other {# seconds}}",
        "minutes": "{count, plural, one {# minute} other {# minutes}}",
        "hours": "{count, plural, one {# hour} other {# hours}}",
        "days": "{count, plural, one {# day} other {# days}}"
      }
    }
  }
}
```

### Locale-Specific Format Preferences

The utility will leverage `Intl.DateTimeFormat` options per locale:

| Locale | Date Format | Time Format | Example Date | Example Time |
|--------|-------------|-------------|--------------|--------------|
| en-US | MM/DD/YYYY | 12-hour | 01/18/2026 | 3:30 PM |
| en-GB | DD/MM/YYYY | 24-hour | 18/01/2026 | 15:30 |
| fr-FR | DD/MM/YYYY | 24-hour | 18/01/2026 | 15:30 |
| es-ES | DD/MM/YYYY | 24-hour | 18/01/2026 | 15:30 |
| de-DE | DD.MM.YYYY | 24-hour | 18.01.2026 | 15:30 |
| nl-NL | DD-MM-YYYY | 24-hour | 18-01-2026 | 15:30 |
| it-IT | DD/MM/YYYY | 24-hour | 18/01/2026 | 15:30 |

---

## Implementation Tasks

### Task 2H.9.1: Create Date/Time Formatting Utility Module

**File:** `/src/lib/i18n/dateUtils.ts` (new file)

**Exports:**
- `formatDate(date: Date | string, style?: DateStyle, locale?: string): string`
- `formatTime(date: Date | string, style?: TimeStyle, locale?: string): string`
- `formatDateTime(date: Date | string, dateStyle?: DateStyle, timeStyle?: TimeStyle, locale?: string): string`
- `formatRelativeTime(date: Date | string, baseDate?: Date, locale?: string): string`
- `formatDuration(seconds: number): string`
- `getRelativeTimeKey(date: Date | string, baseDate?: Date): { key: string; count?: number }`

**Implementation:**

```typescript
// /src/lib/i18n/dateUtils.ts
import { useLocale, useTranslations } from 'next-intl';

export type DateStyle = 'short' | 'medium' | 'long' | 'full';
export type TimeStyle = 'short' | 'medium' | 'long' | 'full';

/**
 * Locale to Intl.DateTimeFormat locale mapping
 */
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  nl: 'nl-NL',
  it: 'it-IT',
};

/**
 * Get the Intl locale from the application locale
 */
export function getIntlLocale(locale: string): string {
  return LOCALE_MAP[locale] || 'en-US';
}

/**
 * Safely parse a date from various input formats
 */
export function parseDate(input: Date | string | number): Date {
  if (input instanceof Date) {
    return input;
  }
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${input}`);
  }
  return date;
}

/**
 * Format a date according to locale conventions
 */
export function formatDate(
  date: Date | string,
  style: DateStyle = 'medium',
  locale: string = 'en'
): string {
  try {
    const parsedDate = parseDate(date);
    const intlLocale = getIntlLocale(locale);

    return new Intl.DateTimeFormat(intlLocale, {
      dateStyle: style,
    }).format(parsedDate);
  } catch {
    return '-';
  }
}

/**
 * Format a time according to locale conventions
 */
export function formatTime(
  date: Date | string,
  style: TimeStyle = 'short',
  locale: string = 'en'
): string {
  try {
    const parsedDate = parseDate(date);
    const intlLocale = getIntlLocale(locale);

    return new Intl.DateTimeFormat(intlLocale, {
      timeStyle: style,
    }).format(parsedDate);
  } catch {
    return '-';
  }
}

/**
 * Format both date and time according to locale conventions
 */
export function formatDateTime(
  date: Date | string,
  dateStyle: DateStyle = 'medium',
  timeStyle: TimeStyle = 'short',
  locale: string = 'en'
): string {
  try {
    const parsedDate = parseDate(date);
    const intlLocale = getIntlLocale(locale);

    return new Intl.DateTimeFormat(intlLocale, {
      dateStyle,
      timeStyle,
    }).format(parsedDate);
  } catch {
    return '-';
  }
}

/**
 * Get the translation key and count for relative time
 */
export function getRelativeTimeKey(
  date: Date | string,
  baseDate: Date = new Date()
): { key: string; count?: number } {
  const parsedDate = parseDate(date);
  const diffMs = baseDate.getTime() - parsedDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Future dates
  if (diffMs < 0) {
    const absDiffMinutes = Math.abs(diffMinutes);
    const absDiffHours = Math.abs(diffHours);
    const absDiffDays = Math.abs(diffDays);

    if (absDiffDays === 1) return { key: 'tomorrow' };
    if (absDiffDays > 1) return { key: 'inDays', count: absDiffDays };
    if (absDiffHours >= 1) return { key: 'inHours', count: absDiffHours };
    if (absDiffMinutes >= 1) return { key: 'inMinutes', count: absDiffMinutes };
    return { key: 'justNow' };
  }

  // Past dates
  if (diffSeconds < 60) return { key: 'justNow' };
  if (diffMinutes < 60) return { key: 'minutesAgo', count: diffMinutes };
  if (diffHours < 24) return { key: 'hoursAgo', count: diffHours };
  if (diffDays === 1) return { key: 'yesterday' };
  if (diffDays < 7) return { key: 'daysAgo', count: diffDays };
  if (diffWeeks < 4) return { key: 'weeksAgo', count: diffWeeks };
  if (diffMonths < 12) return { key: 'monthsAgo', count: diffMonths };
  return { key: 'yearsAgo', count: diffYears };
}

/**
 * Format media duration (seconds to MM:SS or HH:MM:SS)
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
```

---

### Task 2H.9.2: Create React Hook for Date/Time Formatting

**File:** `/src/lib/i18n/useDateFormatter.ts` (new file)

**Implementation:**

```typescript
// /src/lib/i18n/useDateFormatter.ts
'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  getRelativeTimeKey,
  type DateStyle,
  type TimeStyle,
} from './dateUtils';

/**
 * React hook for locale-aware date/time formatting
 */
export function useDateFormatter() {
  const locale = useLocale();
  const t = useTranslations('common.time.relative');

  return {
    /**
     * Format a date according to current locale
     */
    formatDate: (date: Date | string, style: DateStyle = 'medium') =>
      formatDate(date, style, locale),

    /**
     * Format a time according to current locale
     */
    formatTime: (date: Date | string, style: TimeStyle = 'short') =>
      formatTime(date, style, locale),

    /**
     * Format date and time according to current locale
     */
    formatDateTime: (
      date: Date | string,
      dateStyle: DateStyle = 'medium',
      timeStyle: TimeStyle = 'short'
    ) => formatDateTime(date, dateStyle, timeStyle, locale),

    /**
     * Format relative time with translations
     */
    formatRelativeTime: (date: Date | string, baseDate: Date = new Date()) => {
      try {
        const { key, count } = getRelativeTimeKey(date, baseDate);
        return count !== undefined ? t(key, { count }) : t(key);
      } catch {
        return '-';
      }
    },

    /**
     * Format duration (seconds to MM:SS or HH:MM:SS)
     */
    formatDuration,

    /**
     * Get the current locale
     */
    locale,
  };
}
```

---

### Task 2H.9.3: Add Time Translation Keys to Translation Files

**File:** `/messages/en.json`

**Action:** Add the `common.time` namespace with all date/time related translation keys.

**Example structure for French (`/messages/fr.json`):**

```json
{
  "common": {
    "time": {
      "relative": {
        "justNow": "A l'instant",
        "minutesAgo": "il y a {count, plural, one {# minute} other {# minutes}}",
        "hoursAgo": "il y a {count, plural, one {# heure} other {# heures}}",
        "daysAgo": "il y a {count, plural, one {# jour} other {# jours}}",
        "weeksAgo": "il y a {count, plural, one {# semaine} other {# semaines}}",
        "monthsAgo": "il y a {count, plural, one {# mois} other {# mois}}",
        "yearsAgo": "il y a {count, plural, one {# an} other {# ans}}",
        "inMinutes": "dans {count, plural, one {# minute} other {# minutes}}",
        "inHours": "dans {count, plural, one {# heure} other {# heures}}",
        "inDays": "dans {count, plural, one {# jour} other {# jours}}",
        "today": "Aujourd'hui",
        "yesterday": "Hier",
        "tomorrow": "Demain",
        "thisWeek": "Cette semaine",
        "lastWeek": "La semaine derniere",
        "thisMonth": "Ce mois-ci",
        "lastMonth": "Le mois dernier"
      },
      "periods": {
        "am": "AM",
        "pm": "PM",
        "morning": "Matin",
        "afternoon": "Apres-midi",
        "evening": "Soir",
        "night": "Nuit"
      },
      "labels": {
        "date": "Date",
        "time": "Heure",
        "dateTime": "Date et heure",
        "createdAt": "Cree le",
        "updatedAt": "Mis a jour le",
        "lastModified": "Derniere modification",
        "scheduledFor": "Prevu pour",
        "expiresOn": "Expire le",
        "validUntil": "Valide jusqu'au"
      },
      "duration": {
        "seconds": "{count, plural, one {# seconde} other {# secondes}}",
        "minutes": "{count, plural, one {# minute} other {# minutes}}",
        "hours": "{count, plural, one {# heure} other {# heures}}",
        "days": "{count, plural, one {# jour} other {# jours}}"
      }
    }
  }
}
```

---

### Task 2H.9.4: Update `/src/lib/utils.ts` - Replace Existing Functions

**File:** `/src/lib/utils.ts`

**Current Code (lines 72-78):**
```typescript
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**Updated Code:**
```typescript
import { formatDate as formatDateLocalized, formatDateTime } from '@/lib/i18n/dateUtils';

/**
 * @deprecated Use formatDateLocalized from '@/lib/i18n/dateUtils' with useDateFormatter hook
 * Kept for backwards compatibility - returns ISO date format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Re-export locale-aware formatting functions for easier imports
 */
export { formatDateLocalized, formatDateTime };
```

**Current Code (lines 110-129) - `formatPrintableDate`:**
```typescript
export function formatPrintableDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
}
```

**Updated Code:**
```typescript
import { formatDateTime, getIntlLocale } from '@/lib/i18n/dateUtils';

/**
 * Format a date for printing with locale-aware formatting
 * @deprecated Consider using formatDateTime from useDateFormatter hook instead
 */
export function formatPrintableDate(date: string | Date, locale: string = 'en'): string {
  try {
    return formatDateTime(date, 'long', 'short', locale);
  } catch {
    return 'Invalid Date';
  }
}
```

---

### Task 2H.9.5: Update ItemRow Component

**File:** `/src/components/ItemManager/components/ItemRow.tsx`

**Current Code (lines 43-48):**
```typescript
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
```

**Updated Code:**
```typescript
import { useDateFormatter } from '@/lib/i18n/useDateFormatter';

export function ItemRow({ item, ...props }: ItemRowProps) {
  const { formatDate } = useDateFormatter();

  // Replace inline formatDate call with:
  // {formatDate(item.createdAt, 'medium')}
}
```

---

### Task 2H.9.6: Update InstructionsTable Component

**File:** `/src/components/InstructionsTable/InstructionsTable.tsx`

**Current Code:**
```typescript
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
};
```

**Updated Code:**
```typescript
import { useDateFormatter } from '@/lib/i18n/useDateFormatter';

export function InstructionsTable({ guides, ...props }: InstructionsTableProps) {
  const { formatDate } = useDateFormatter();

  // Replace inline formatDate call with:
  // {formatDate(guide.created_at, 'medium')}
}
```

---

### Task 2H.9.7: Update GuideCard Component

**File:** `/src/components/InstructionsTable/GuideCard.tsx`

**Current Code (lines 75-85):**
```typescript
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
};
```

**Updated Code:**
```typescript
import { useDateFormatter } from '@/lib/i18n/useDateFormatter';

export function GuideCard({ guide, ...props }: GuideCardProps) {
  const { formatDate } = useDateFormatter();

  // Use formatDate(guide.created_at, 'short') for compact display
}
```

---

### Task 2H.9.8: Update formatUtils.ts - Integrate Duration Formatting

**File:** `/src/components/ItemManager/utils/formatUtils.ts`

**Current Code (lines 26-41):**
```typescript
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
```

**Updated Code:**
```typescript
// Re-export from centralized location
export { formatDuration } from '@/lib/i18n/dateUtils';
```

---

### Task 2H.9.9: Update PropertiesManagement Component

**File:** `/src/components/PropertiesManagement.tsx`

**Current Code:**
```typescript
<td>{new Date(property.created_at).toLocaleDateString() || 'Unknown'}</td>
```

**Updated Code:**
```typescript
import { useDateFormatter } from '@/lib/i18n/useDateFormatter';

export function PropertiesManagement({ ... }) {
  const { formatDate } = useDateFormatter();

  // Replace with:
  // <td>{formatDate(property.created_at, 'medium')}</td>
}
```

---

### Task 2H.9.10: Create Server-Side Date Formatting Utility

**File:** `/src/lib/i18n/serverDateUtils.ts` (new file)

**Implementation:**

```typescript
// /src/lib/i18n/serverDateUtils.ts
import { getLocale, getTranslations } from 'next-intl/server';
import {
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTimeKey,
  type DateStyle,
  type TimeStyle,
} from './dateUtils';

/**
 * Get locale-aware date formatting functions for server components
 */
export async function getDateFormatter() {
  const locale = await getLocale();
  const t = await getTranslations('common.time.relative');

  return {
    formatDate: (date: Date | string, style: DateStyle = 'medium') =>
      formatDate(date, style, locale),

    formatTime: (date: Date | string, style: TimeStyle = 'short') =>
      formatTime(date, style, locale),

    formatDateTime: (
      date: Date | string,
      dateStyle: DateStyle = 'medium',
      timeStyle: TimeStyle = 'short'
    ) => formatDateTime(date, dateStyle, timeStyle, locale),

    formatRelativeTime: (date: Date | string, baseDate: Date = new Date()) => {
      try {
        const { key, count } = getRelativeTimeKey(date, baseDate);
        return count !== undefined ? t(key, { count }) : t(key);
      } catch {
        return '-';
      }
    },

    locale,
  };
}
```

---

### Task 2H.9.11: Create Barrel Export File

**File:** `/src/lib/i18n/index.ts` (new file or update existing)

**Implementation:**

```typescript
// /src/lib/i18n/index.ts

// Date utilities
export {
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  getRelativeTimeKey,
  getIntlLocale,
  parseDate,
  type DateStyle,
  type TimeStyle,
} from './dateUtils';

// React hook for client components
export { useDateFormatter } from './useDateFormatter';

// Server component utilities
export { getDateFormatter } from './serverDateUtils';
```

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/i18n/dateUtils.ts` | Core date/time formatting utilities |
| `/src/lib/i18n/useDateFormatter.ts` | React hook for client component formatting |
| `/src/lib/i18n/serverDateUtils.ts` | Server component formatting utilities |
| `/src/lib/i18n/index.ts` | Barrel exports (create or update) |

### Translation Files

| File Path | Action |
|-----------|--------|
| `/messages/en.json` | Add `common.time` namespace with all date/time keys |
| `/messages/fr.json` | Add French translations for date/time keys |
| `/messages/es.json` | Add Spanish translations for date/time keys |
| `/messages/de.json` | Add German translations for date/time keys |
| `/messages/nl.json` | Add Dutch translations for date/time keys |
| `/messages/it.json` | Add Italian translations for date/time keys |

### Existing Utility Files to Update

| File Path | Modification |
|-----------|--------------|
| `/src/lib/utils.ts` | Update `formatDate`, `formatPrintableDate` to use new utilities |

### Components to Update

| File Path | Modification |
|-----------|--------------|
| `/src/components/ItemManager/components/ItemRow.tsx` | Replace inline `formatDate` with `useDateFormatter` |
| `/src/components/InstructionsTable/InstructionsTable.tsx` | Replace inline `formatDate` with `useDateFormatter` |
| `/src/components/InstructionsTable/GuideCard.tsx` | Replace inline `formatDate` with `useDateFormatter` |
| `/src/components/ItemManager/utils/formatUtils.ts` | Re-export `formatDuration` from central location |
| `/src/components/PropertiesManagement.tsx` | Replace `toLocaleDateString` with `useDateFormatter` |
| `/src/components/AccessRequestTable.tsx` | Replace date formatting with `useDateFormatter` |
| `/src/components/VisitCounter.tsx` | Replace timestamp formatting with `useDateFormatter` |
| `/src/app/dashboard2/items/page.tsx` | Replace date formatting with `useDateFormatter` |

---

## Integration Contract

### Client Component Pattern

```typescript
// Client component usage
'use client';

import { useDateFormatter } from '@/lib/i18n/useDateFormatter';

function ItemCard({ item }: { item: Item }) {
  const { formatDate, formatRelativeTime } = useDateFormatter();

  return (
    <div>
      <p>Created: {formatDate(item.createdAt, 'medium')}</p>
      <p>Last updated: {formatRelativeTime(item.updatedAt)}</p>
    </div>
  );
}
```

### Server Component Pattern

```typescript
// Server component usage
import { getDateFormatter } from '@/lib/i18n/serverDateUtils';

async function ItemDetails({ item }: { item: Item }) {
  const { formatDate, formatRelativeTime } = await getDateFormatter();

  return (
    <div>
      <p>Created: {formatDate(item.createdAt, 'long')}</p>
      <p>Last updated: {formatRelativeTime(item.updatedAt)}</p>
    </div>
  );
}
```

### Format Style Reference

| Style | Date Example (en-US) | Date Example (de-DE) |
|-------|---------------------|---------------------|
| short | 1/18/26 | 18.01.26 |
| medium | Jan 18, 2026 | 18.01.2026 |
| long | January 18, 2026 | 18. Januar 2026 |
| full | Saturday, January 18, 2026 | Samstag, 18. Januar 2026 |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| Centralized date/time formatting utility module created | Task 2H.9.1 - `/src/lib/i18n/dateUtils.ts` |
| Utility supports locale-specific patterns for all target languages | Locale map in `dateUtils.ts` with 6 locales |
| Time formatting respects 12-hour vs 24-hour based on locale | `Intl.DateTimeFormat` with `timeStyle` option handles this automatically |
| Relative time expressions translated for each language | `common.time.relative` namespace with ICU pluralization |
| Month and day names available in all target languages | Handled automatically by `Intl.DateTimeFormat` |
| Day of week names translated for each language | Handled automatically by `Intl.DateTimeFormat` |
| Formatting utilities accept Date objects or ISO strings | `parseDate()` function handles both |
| Different format styles available (short, medium, long, full) | `DateStyle` and `TimeStyle` type exports |
| Translation files include date/time strings in common namespace | `common.time` namespace structure |
| All existing hardcoded date formatting replaced | Tasks 2H.9.4 through 2H.9.9 |
| Date/time displays reflect user's current language | `useDateFormatter` hook uses `useLocale()` |
| Edge cases handled correctly (time zones, DST, leap years) | `Intl.DateTimeFormat` handles these natively |
| Documentation exists for using utilities | JSDoc comments in all exported functions |

---

## Testing Considerations

### Manual Testing Checklist

- [ ] Date displays correctly formatted in all 6 languages
- [ ] Time displays use 12-hour format for en-US, 24-hour for others
- [ ] Relative time "Just now" displays for dates < 1 minute ago
- [ ] Relative time "X minutes ago" displays correctly with pluralization
- [ ] Relative time "Yesterday" displays for dates 24-48 hours ago
- [ ] Relative time "X days ago" displays correctly
- [ ] Future dates show "in X hours/days" correctly
- [ ] Invalid dates display fallback "-" instead of crashing
- [ ] ItemRow shows localized creation date
- [ ] InstructionsTable shows localized dates
- [ ] GuideCard shows compact localized dates
- [ ] PropertiesManagement shows localized property creation dates
- [ ] Format styles (short, medium, long, full) work correctly

### Edge Case Testing

- [ ] Midnight dates format correctly
- [ ] Year boundaries (Dec 31 to Jan 1) display correctly
- [ ] Leap year dates (Feb 29) format correctly
- [ ] Invalid date strings return fallback gracefully
- [ ] Null/undefined dates don't crash components
- [ ] Very old dates (years ago) format correctly
- [ ] Future dates format correctly

### Accessibility Testing

- [ ] Screen readers announce dates correctly in each language
- [ ] Time values are announced with appropriate context
- [ ] Relative times are understandable when read aloud

---

## Dependencies

### Internal Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| Task 2H.1 - Common namespace structure | Must be complete | Translation file structure |
| Epic 1 - next-intl setup | Must be complete | useLocale, useTranslations hooks |

### External Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| next-intl | (from Epic 1) | Translation hooks and locale detection |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Intl.DateTimeFormat browser compatibility | Low | Medium | All modern browsers support it; test on Safari |
| Timezone handling edge cases | Medium | Low | Document that times are displayed in user's local timezone |
| Missing translations crash app | Low | High | Use try/catch with fallbacks in all formatting functions |
| Performance overhead from multiple Intl.DateTimeFormat instances | Low | Low | Consider memoization if issues arise |
| ICU pluralization complexity | Medium | Medium | Test all pluralization rules in each language |
| Server/client hydration mismatch | Medium | Medium | Ensure locale is available during SSR |

---

## References

- Request: `/docs/gen_requests_epic2.md` - Request #312
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- Existing Date Utilities:
  - `/src/lib/utils.ts` - `formatDate`, `formatPrintableDate`
  - `/src/components/ItemManager/utils/formatUtils.ts` - `formatDuration`
  - `/src/components/ItemManager/components/ItemRow.tsx` - inline `formatDate`
- MDN Intl.DateTimeFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
- next-intl Documentation: https://next-intl-docs.vercel.app/
- ICU Message Format: https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*End of Document*
