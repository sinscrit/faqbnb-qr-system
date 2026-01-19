# REQ-345: Create Date/Time Formatting Translations - Implementation Overview
*Generated: 2026-01-19 19:30:00 UTC*
*Last Modified: 2026-01-19 19:30:00 UTC*

## Reference
- **Request**: REQ-345 (Create Date and Time Formatting Translations)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: New Feature (Internationalization)
- **Epic**: 2 - Static UI Translation
- **Sub-Epic**: 2H - Common & Shared Components
- **Task ID**: 2H.9
- **Size**: L
- **Priority**: Part of foundation for all date/time displays

## Goals
1. Create comprehensive date and time formatting translation keys for all 6 supported languages
2. Leverage next-intl's built-in `useFormatter` hook and `Intl.DateTimeFormat` for locale-aware formatting
3. Provide translation strings for relative time expressions (ago, just now, yesterday, etc.)
4. Define locale-specific date and time format patterns
5. Create a centralized date/time formatting utility that integrates with the i18n system
6. Replace hardcoded date formatting functions scattered across 15+ components

## Context from Implementation Plan

### Current State Analysis

The codebase has **fragmented date/time formatting** with multiple approaches:

1. **`/src/lib/utils.ts`** - Basic `formatDate()` function returning `YYYY-MM-DD`:
   ```typescript
   export function formatDate(dateString: string): string {
     const date = new Date(dateString);
     return `${year}-${month}-${day}`;
   }
   ```

2. **`/src/lib/utils.ts`** - `formatPrintableDate()` hardcoded to `'en-US'`:
   ```typescript
   return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', ... });
   ```

3. **Component-level formatDate functions** - Duplicated in ~10 components:
   - `/src/components/InstructionsTable/InstructionsTable.tsx` (line 265)
   - `/src/components/InstructionsTable/GuideCard.tsx` (line 75)
   - `/src/components/ItemManager/components/ItemRow.tsx` (line 43)
   - `/src/components/dashboard/ItemViewModal.tsx` (line 40)
   - `/src/components/AccessRequestTable.tsx` (line 161)
   - `/src/app/admin/items/[publicId]/analytics/page.tsx` (line 178)
   - `/src/app/admin/properties/[propertyId]/page.tsx` (line 180)

4. **Inline date formatting** using `toLocaleDateString('en-US', ...)`:
   - `/src/components/PropertiesManagement.tsx` (lines 390, 471)
   - `/src/components/UserAccessTable.tsx` (line 213)
   - `/src/components/UserDashboard.tsx` (lines 199-209)

5. **Relative time formatting** in `UserDashboard.tsx`:
   ```typescript
   const formatTimestamp = (timestamp: string) => {
     // Returns time if < 24 hours, otherwise date
   };
   ```

### Target State (Per Plan-111 Specification)

Create a `datetime` namespace in translation files with:
- Relative time expressions with ICU pluralization
- Month and day name translations
- Format pattern definitions for each locale
- Integration with next-intl's formatter capabilities

### Dependencies
- **Prerequisite**: Epic 1 complete (next-intl installed and configured)
- **Prerequisite**: Task 2H.1 complete (common namespace structure created)
- **Verified**: `/src/lib/i18n/config.ts` exists with locale configuration
- **Verified**: next-intl provides `useFormatter` hook for locale-aware date/time formatting

## Implementation Order

### Step 1: Create DateTime Translation Namespace Structure
Add the `datetime` namespace to `/messages/en.json` with comprehensive keys for:
- Relative time expressions
- Month names (full and abbreviated)
- Day names (full and abbreviated)
- Date format labels
- Time format labels
- Duration expressions

### Step 2: Create Locale-Specific Translations
Propagate the `datetime` namespace to all 6 language files with culturally appropriate translations:
- `en.json` - English (source of truth)
- `fr.json` - French
- `es.json` - Spanish
- `de.json` - German
- `nl.json` - Dutch
- `it.json` - Italian

### Step 3: Create Date/Time Formatting Utility Module
Create `/src/lib/i18n/datetime-utils.ts` that:
- Leverages next-intl's `useFormatter` hook
- Provides convenience functions for common date/time patterns
- Handles relative time calculations with translated strings
- Respects locale-specific conventions (24h vs 12h, date order)

### Step 4: Create useDateTimeFormat Hook
Create a React hook that provides:
- `formatDate()` - Locale-aware date formatting
- `formatTime()` - Locale-aware time formatting
- `formatDateTime()` - Combined date and time
- `formatRelativeTime()` - "2 days ago", "just now", etc.
- `formatDateRange()` - "Jan 1 - Jan 15" style ranges

### Step 5: Verification
- Test date/time display in all 6 languages
- Verify relative time expressions work correctly
- Ensure no hardcoded date formats remain

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/lib/i18n/datetime-utils.ts`
- **Purpose**: Centralized date/time formatting utilities with i18n support
- **Exports**:
  - `formatLocalizedDate(date, locale, format)` - Format date with locale
  - `formatLocalizedTime(date, locale, format)` - Format time with locale
  - `getRelativeTimeKey(date)` - Get translation key for relative time
  - `calculateRelativeTime(date)` - Calculate time difference

#### `/src/hooks/useDateTimeFormat.ts`
- **Purpose**: React hook for locale-aware date/time formatting
- **Exports**:
  - `useDateTimeFormat()` hook returning formatting functions
- **Dependencies**:
  - next-intl's `useFormatter` and `useTranslations`
  - `/src/lib/i18n/datetime-utils.ts`

### Files to Modify

#### `/messages/en.json`
- **Purpose**: Primary English translation file
- **Changes**: Add `datetime` namespace with comprehensive keys
- **New Keys to Add**:

```json
{
  "datetime": {
    "relative": {
      "justNow": "Just now",
      "secondsAgo": "{count, plural, one {# second} other {# seconds}} ago",
      "minutesAgo": "{count, plural, one {# minute} other {# minutes}} ago",
      "hoursAgo": "{count, plural, one {# hour} other {# hours}} ago",
      "daysAgo": "{count, plural, one {# day} other {# days}} ago",
      "weeksAgo": "{count, plural, one {# week} other {# weeks}} ago",
      "monthsAgo": "{count, plural, one {# month} other {# months}} ago",
      "yearsAgo": "{count, plural, one {# year} other {# years}} ago",
      "inSeconds": "in {count, plural, one {# second} other {# seconds}}",
      "inMinutes": "in {count, plural, one {# minute} other {# minutes}}",
      "inHours": "in {count, plural, one {# hour} other {# hours}}",
      "inDays": "in {count, plural, one {# day} other {# days}}",
      "inWeeks": "in {count, plural, one {# week} other {# weeks}}",
      "inMonths": "in {count, plural, one {# month} other {# months}}",
      "inYears": "in {count, plural, one {# year} other {# years}}",
      "today": "Today",
      "yesterday": "Yesterday",
      "tomorrow": "Tomorrow",
      "thisWeek": "This week",
      "lastWeek": "Last week",
      "nextWeek": "Next week",
      "thisMonth": "This month",
      "lastMonth": "Last month",
      "nextMonth": "Next month"
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
      "jan": "Jan",
      "feb": "Feb",
      "mar": "Mar",
      "apr": "Apr",
      "may": "May",
      "jun": "Jun",
      "jul": "Jul",
      "aug": "Aug",
      "sep": "Sep",
      "oct": "Oct",
      "nov": "Nov",
      "dec": "Dec"
    },
    "weekdays": {
      "sunday": "Sunday",
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday"
    },
    "weekdaysShort": {
      "sun": "Sun",
      "mon": "Mon",
      "tue": "Tue",
      "wed": "Wed",
      "thu": "Thu",
      "fri": "Fri",
      "sat": "Sat"
    },
    "formats": {
      "dateShort": "Short date",
      "dateLong": "Long date",
      "dateWithTime": "Date with time",
      "timeOnly": "Time only",
      "time12h": "12-hour time",
      "time24h": "24-hour time"
    },
    "labels": {
      "date": "Date",
      "time": "Time",
      "dateTime": "Date & Time",
      "duration": "Duration",
      "startDate": "Start date",
      "endDate": "End date",
      "created": "Created",
      "updated": "Updated",
      "lastModified": "Last modified",
      "lastActive": "Last active",
      "lastSeen": "Last seen"
    },
    "duration": {
      "hours": "{count, plural, one {# hour} other {# hours}}",
      "minutes": "{count, plural, one {# minute} other {# minutes}}",
      "seconds": "{count, plural, one {# second} other {# seconds}}",
      "days": "{count, plural, one {# day} other {# days}}",
      "weeks": "{count, plural, one {# week} other {# weeks}}",
      "months": "{count, plural, one {# month} other {# months}}",
      "hoursMinutes": "{hours, plural, one {# hour} other {# hours}} {minutes, plural, one {# minute} other {# minutes}}",
      "daysHours": "{days, plural, one {# day} other {# days}} {hours, plural, one {# hour} other {# hours}}"
    },
    "range": {
      "to": "to",
      "from": "from",
      "until": "until",
      "separator": " - "
    }
  }
}
```

#### `/messages/fr.json`
- **Purpose**: French translation file
- **Changes**: Add `datetime` namespace with French translations
- **Sample Keys**:
  - `"justNow"`: `"À l'instant"`
  - `"minutesAgo"`: `"il y a {count, plural, one {# minute} other {# minutes}}"`
  - `"january"`: `"janvier"`
  - `"monday"`: `"lundi"`

#### `/messages/es.json`
- **Purpose**: Spanish translation file
- **Changes**: Add `datetime` namespace with Spanish translations
- **Sample Keys**:
  - `"justNow"`: `"Ahora mismo"`
  - `"minutesAgo"`: `"hace {count, plural, one {# minuto} other {# minutos}}"`
  - `"january"`: `"enero"`
  - `"monday"`: `"lunes"`

#### `/messages/de.json`
- **Purpose**: German translation file
- **Changes**: Add `datetime` namespace with German translations
- **Sample Keys**:
  - `"justNow"`: `"Gerade eben"`
  - `"minutesAgo"`: `"vor {count, plural, one {# Minute} other {# Minuten}}"`
  - `"january"`: `"Januar"`
  - `"monday"`: `"Montag"`

#### `/messages/nl.json`
- **Purpose**: Dutch translation file
- **Changes**: Add `datetime` namespace with Dutch translations
- **Sample Keys**:
  - `"justNow"`: `"Zojuist"`
  - `"minutesAgo"`: `"{count, plural, one {# minuut} other {# minuten}} geleden"`
  - `"january"`: `"januari"`
  - `"monday"`: `"maandag"`

#### `/messages/it.json`
- **Purpose**: Italian translation file
- **Changes**: Add `datetime` namespace with Italian translations
- **Sample Keys**:
  - `"justNow"`: `"Adesso"`
  - `"minutesAgo"`: `"{count, plural, one {# minuto} other {# minuti}} fa"`
  - `"january"`: `"gennaio"`
  - `"monday"`: `"lunedì"`

### Files Referenced (Read-Only for Context)

#### `/src/lib/utils.ts`
- **Purpose**: Contains existing `formatDate` and `formatPrintableDate` functions
- **Observation**: These functions are hardcoded to `en-US` locale
- **Lines**: 72-78 (`formatDate`), 110-129 (`formatPrintableDate`)

#### `/src/lib/i18n/config.ts`
- **Purpose**: i18n configuration
- **Verified**: Supports locales: `en`, `fr`, `es`, `de`, `nl`, `it`

#### Components with date formatting (for future refactoring in subsequent tasks):
- `/src/components/UserDashboard.tsx` - `formatTimestamp` function (lines 198-209)
- `/src/components/InstructionsTable/InstructionsTable.tsx` - `formatDate` function (line 265)
- `/src/components/InstructionsTable/GuideCard.tsx` - `formatDate` function (line 75)
- `/src/components/ItemManager/components/ItemRow.tsx` - `formatDate` function (line 43)
- `/src/components/dashboard/ItemViewModal.tsx` - `formatDate` function (line 40)
- `/src/components/AccessRequestTable.tsx` - `formatDate` function (line 161)
- `/src/components/PropertiesManagement.tsx` - inline `toLocaleDateString` (lines 390, 471)
- `/src/components/UserAccessTable.tsx` - inline `toLocaleDateString` (line 213)
- `/src/app/admin/items/[publicId]/analytics/page.tsx` - `formatDate` function (line 178)
- `/src/app/admin/properties/[propertyId]/page.tsx` - `formatDate` function (line 180)
- `/src/app/dashboard/properties/[propertyId]/page.tsx` - imports `formatDate` from utils (line 8)

## Technical Specifications

### Translation Key Convention
```
datetime.{category}.{key}
```

Examples:
- `datetime.relative.justNow`
- `datetime.months.january`
- `datetime.weekdays.monday`
- `datetime.labels.created`
- `datetime.duration.hours`

### Next-intl Integration

next-intl provides built-in formatting via `useFormatter`:

```typescript
import { useFormatter } from 'next-intl';

function MyComponent() {
  const format = useFormatter();

  // Automatic locale-aware formatting
  const formattedDate = format.dateTime(new Date(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Relative time formatting
  const relativeTime = format.relativeTime(new Date('2026-01-17'));
}
```

### Proposed useDateTimeFormat Hook API

```typescript
// /src/hooks/useDateTimeFormat.ts
import { useFormatter, useTranslations, useLocale } from 'next-intl';

export function useDateTimeFormat() {
  const format = useFormatter();
  const t = useTranslations('datetime');
  const locale = useLocale();

  return {
    // Format date according to locale conventions
    formatDate: (date: Date | string, style: 'short' | 'medium' | 'long' = 'medium') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format.dateTime(dateObj, getDateFormatOptions(style));
    },

    // Format time according to locale conventions
    formatTime: (date: Date | string, style: '12h' | '24h' | 'auto' = 'auto') => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format.dateTime(dateObj, getTimeFormatOptions(style, locale));
    },

    // Format relative time ("2 days ago", "in 3 hours")
    formatRelativeTime: (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format.relativeTime(dateObj);
    },

    // Get translated month name
    getMonthName: (month: number, style: 'full' | 'short' = 'full') => {
      const monthKeys = ['january', 'february', ...];
      const namespace = style === 'short' ? 'monthsShort' : 'months';
      return t(`${namespace}.${monthKeys[month]}`);
    },

    // Get translated day name
    getDayName: (day: number, style: 'full' | 'short' = 'full') => {
      const dayKeys = ['sunday', 'monday', ...];
      const namespace = style === 'short' ? 'weekdaysShort' : 'weekdays';
      return t(`${namespace}.${dayKeys[day]}`);
    },

    // Format duration
    formatDuration: (seconds: number) => {
      // Calculate hours, minutes, etc. and return translated string
    },

    // Format date range
    formatDateRange: (startDate: Date, endDate: Date, style: 'short' | 'long' = 'short') => {
      return format.dateTimeRange(startDate, endDate, getDateFormatOptions(style));
    }
  };
}
```

### Locale-Specific Date Format Conventions

| Locale | Short Date | Long Date | Time Format |
|--------|------------|-----------|-------------|
| en | MM/DD/YYYY | January 19, 2026 | 12-hour (AM/PM) |
| fr | DD/MM/YYYY | 19 janvier 2026 | 24-hour |
| es | DD/MM/YYYY | 19 de enero de 2026 | 24-hour |
| de | DD.MM.YYYY | 19. Januar 2026 | 24-hour |
| nl | DD-MM-YYYY | 19 januari 2026 | 24-hour |
| it | DD/MM/YYYY | 19 gennaio 2026 | 24-hour |

### ICU Message Format Examples

**Pluralization for Relative Time:**
```json
"minutesAgo": "{count, plural, one {# minute} other {# minutes}} ago"
```

Usage in code:
```typescript
t('relative.minutesAgo', { count: 5 }) // "5 minutes ago"
t('relative.minutesAgo', { count: 1 }) // "1 minute ago"
```

**Variable Interpolation for Duration:**
```json
"hoursMinutes": "{hours, plural, one {# hour} other {# hours}} {minutes, plural, one {# minute} other {# minutes}}"
```

Usage in code:
```typescript
t('duration.hoursMinutes', { hours: 2, minutes: 30 }) // "2 hours 30 minutes"
```

## Migration Strategy

### Phase 1: Create Translation Keys (This Task)
- Add `datetime` namespace to all 6 translation files
- Create utility module and hook

### Phase 2: Gradual Component Migration (Future Tasks)
Components will be updated to use the new hook in subsequent tasks:

1. Replace local `formatDate` functions with `useDateTimeFormat` hook
2. Replace hardcoded `toLocaleDateString('en-US', ...)` calls
3. Update relative time formatting in `UserDashboard.tsx`

### Backward Compatibility
- Existing `formatDate` function in `/src/lib/utils.ts` remains unchanged initially
- New components should use `useDateTimeFormat` hook
- Existing components can be migrated incrementally

## Success Validation Checklist

### Translation Structure Verification
- [ ] `/messages/en.json` contains complete `datetime` namespace
- [ ] `datetime.relative` sub-namespace has all relative time keys with ICU pluralization
- [ ] `datetime.months` sub-namespace has all 12 month names
- [ ] `datetime.monthsShort` sub-namespace has all 12 abbreviated month names
- [ ] `datetime.weekdays` sub-namespace has all 7 day names
- [ ] `datetime.weekdaysShort` sub-namespace has all 7 abbreviated day names
- [ ] `datetime.formats` sub-namespace has format labels
- [ ] `datetime.labels` sub-namespace has common datetime labels
- [ ] `datetime.duration` sub-namespace has duration format strings
- [ ] `datetime.range` sub-namespace has range-related strings

### JSON Validity
- [ ] All 6 translation files are valid JSON
- [ ] All 6 files have identical `datetime` key structures
- [ ] ICU pluralization syntax is correct in all files

### Utility Module Verification
- [ ] `/src/lib/i18n/datetime-utils.ts` created with all helper functions
- [ ] `/src/hooks/useDateTimeFormat.ts` created with comprehensive formatting functions
- [ ] Hook integrates with next-intl's `useFormatter`
- [ ] TypeScript types are properly defined

### Functional Verification
- [ ] Application builds without errors
- [ ] Date/time formatting works in English
- [ ] Date/time formatting works in French
- [ ] Date/time formatting works in Spanish
- [ ] Date/time formatting works in German
- [ ] Date/time formatting works in Dutch
- [ ] Date/time formatting works in Italian
- [ ] Relative time expressions display correctly
- [ ] Month and day names translate correctly

### Translation Completeness
- [ ] French translations complete for all datetime keys (~85 keys)
- [ ] Spanish translations complete for all datetime keys
- [ ] German translations complete for all datetime keys
- [ ] Dutch translations complete for all datetime keys
- [ ] Italian translations complete for all datetime keys

## Notes

### Pattern Alignment
- Follow ICU message format for pluralization (next-intl standard)
- Use camelCase for translation keys (matching existing codebase convention)
- Maintain alphabetical ordering within each sub-category

### Next-intl Best Practices
- Prefer `useFormatter` for date/time formatting over manual implementations
- Use built-in `format.relativeTime()` for relative time expressions
- Leverage `format.dateTimeRange()` for date ranges

### Regional Considerations
- European locales (fr, es, de, nl, it) prefer 24-hour time format
- Date order varies: MM/DD/YYYY (US) vs DD/MM/YYYY (Europe) vs YYYY-MM-DD (ISO)
- Month capitalization varies: English capitalizes, most European languages don't

### Future Integration Points
- Components displaying dates will import and use `useDateTimeFormat` hook
- Calendar components will use translated month/day names
- Analytics pages will use locale-aware date ranges

## Dependencies
- next-intl package (already installed via Epic 1)
- Valid `/messages/*.json` files (already exist via Epic 1)
- No new npm packages required

## Risk Assessment
- **Risk Level**: Low to Medium
- **Rationale**:
  - Additive changes to translation files
  - New utility module doesn't affect existing code
  - Hook pattern is isolated and opt-in
  - next-intl provides battle-tested formatting capabilities
- **Mitigation**:
  - Validate JSON syntax before committing
  - Test formatting in all supported locales
  - Keep existing `formatDate` function unchanged for backward compatibility

## Effort Estimate
- **Estimated Time**: 4-6 hours
- **Breakdown**:
  - Create `datetime` namespace in en.json: 1 hour
  - Generate translations for 5 other languages: 2-3 hours
  - Create datetime-utils.ts utility module: 30 minutes
  - Create useDateTimeFormat hook: 1 hour
  - Testing and verification: 30 minutes
