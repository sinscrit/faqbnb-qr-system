# Date/Time Formatting Utilities

**Last Modified:** 2026-01-21

## Overview

The datetime formatting utilities provide locale-aware formatting for dates, times, relative time expressions, and durations across all 6 supported languages (English, French, Spanish, German, Dutch, Italian).

These utilities integrate with next-intl's localization system to ensure consistent formatting based on the user's active locale.

## Installation

Already included in the i18n module - no additional installation required.

```typescript
import { useDateTimeFormatter, getDateTimeFormatter } from '@/lib/i18n';
```

## Usage

### Client Components

Use the `useDateTimeFormatter()` hook in React client components:

```tsx
'use client';

import { useDateTimeFormatter } from '@/lib/i18n';

function MyComponent() {
  const { formatDate, formatTime, formatDateTime, formatRelative, formatDuration } = useDateTimeFormatter();

  return (
    <div>
      <p>Date: {formatDate(item.createdAt, 'long')}</p>
      <p>Time: {formatTime(item.createdAt)}</p>
      <p>DateTime: {formatDateTime(item.createdAt)}</p>
      <p>Relative: {formatRelative(item.updatedAt)}</p>
      <p>Duration: {formatDuration(3661)}</p>
    </div>
  );
}
```

### Server Components

Use the `getDateTimeFormatter()` async function in React server components:

```tsx
import { getDateTimeFormatter } from '@/lib/i18n';

async function MyServerComponent({ locale }: { locale: string }) {
  const { formatDate, formatRelative } = await getDateTimeFormatter(locale);

  return (
    <div>
      <p>Created: {formatDate(item.createdAt, 'medium')}</p>
      <p>Updated: {formatRelative(item.updatedAt)}</p>
    </div>
  );
}
```

## API Reference

### Types

```typescript
type DateFormatStyle = 'short' | 'medium' | 'long';
type TimeFormatStyle = 'short' | 'long';
```

### Methods

#### formatDate(date, style?)

Formats a date in locale-appropriate format.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| date | `Date \| string` | required | Date object or ISO string |
| style | `DateFormatStyle` | `'medium'` | Format style |

**Examples:**

| Style | English Output |
|-------|---------------|
| `'short'` | 1/20/26 |
| `'medium'` | Jan 20, 2026 |
| `'long'` | January 20, 2026 |

#### formatTime(date, style?)

Formats a time in locale-appropriate format.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| date | `Date \| string` | required | Date object or ISO string |
| style | `TimeFormatStyle` | `'short'` | Format style |

**Examples:**

| Style | English Output |
|-------|---------------|
| `'short'` | 2:30 PM |
| `'long'` | 2:30:00 PM EST |

#### formatDateTime(date, style?)

Formats both date and time together in locale-appropriate format.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| date | `Date \| string` | required | Date object or ISO string |
| style | `DateFormatStyle` | `'medium'` | Format style for date portion |

#### formatRelative(date)

Formats a date as a relative time expression (e.g., "2 hours ago").

| Parameter | Type | Description |
|-----------|------|-------------|
| date | `Date \| string` | Date object or ISO string |

**Returns:** Localized relative time string

#### formatDuration(seconds)

Formats a duration in seconds as a localized string.

| Parameter | Type | Description |
|-----------|------|-------------|
| seconds | `number` | Duration in seconds |

**Returns:** Localized duration string (e.g., "2 hours 30 minutes")

## Relative Time Output by Locale

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Just now | À l'instant | Ahora mismo | Gerade eben | Zojuist | Proprio ora |
| 2 hours ago | il y a 2 heures | hace 2 horas | vor 2 Stunden | 2 uur geleden | 2 ore fa |
| in 3 days | dans 3 jours | en 3 días | in 3 Tagen | over 3 dagen | tra 3 giorni |

## Supported Time Units

The relative time formatter supports:

- **Seconds** - for differences < 1 minute
- **Minutes** - for differences < 1 hour
- **Hours** - for differences < 1 day
- **Days** - for differences < 1 week
- **Weeks** - for differences < 1 month
- **Months** - for differences < 1 year
- **Years** - for differences >= 1 year

All units support proper singular/plural forms in each language.

## Error Handling

All formatting functions handle errors gracefully:

- Invalid date strings: Returns fallback text ("Invalid Date", "Invalid Time", "Unknown")
- Console warnings in development for debugging
- Will not throw exceptions that could break your UI

```typescript
const { formatDate } = useDateTimeFormatter();

// These all handle errors gracefully
formatDate('invalid-date');  // Returns "Invalid Date"
formatDate(null as any);     // Returns current date formatted
formatDate('');              // Returns current date formatted
```

## Migration from formatPrintableDate

The legacy `formatPrintableDate` function in `@/lib/utils` is deprecated.

**Before (deprecated):**
```tsx
import { formatPrintableDate } from '@/lib/utils';
const formatted = formatPrintableDate(date);
```

**After (recommended):**
```tsx
import { useDateTimeFormatter } from '@/lib/i18n';
const { formatDateTime } = useDateTimeFormatter();
const formatted = formatDateTime(date, 'long');
```

## Translation Keys

The datetime formatting uses the `datetime` namespace in translation files. Keys include:

- `datetime.relative.*` - Relative time expressions
- `datetime.units.*` - Time unit labels with pluralization
- `datetime.days.*` / `datetime.daysShort.*` - Day names
- `datetime.months.*` / `datetime.monthsShort.*` - Month names
- `datetime.periods.*` - AM/PM indicators

## References

- [next-intl Formatting Documentation](https://next-intl-docs.vercel.app/docs/usage/dates-times)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- REQ-E02-029: Create date/time formatting translations
