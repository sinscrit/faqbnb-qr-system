# REQ-E05-014: Create TranslationStatusColumn Component - Implementation Overview

**Created**: 2026-01-22 19:31
**Last Modified**: 2026-01-22 19:31
**Status**: PENDING
**Epic**: 5 - Owner Translation Management
**Phase**: 3 - Dashboard Integration
**Task ID**: 3.2

---

## 1. Goal

Create a compact table column component that displays translation status for an entity using 6 small dots or icons representing each supported language (es, fr, de, it, nl, pt). The component provides at-a-glance visibility into translation coverage directly within data tables and is clickable to open the TranslationPreviewPanel for detailed view and actions.

**Component File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

**Key Features**:
- 6 colored dots in a horizontal row (one per language)
- Consistent language display order: es, fr, de, it, nl, pt
- Color-coded by status (green/orange/red/purple/amber/gray)
- Tooltip on hover showing detailed language names and statuses
- Clickable to trigger callback (opens preview panel)
- Size variants (sm/md/lg) for different table densities
- Animated pulse effect for 'pending' status
- Keyboard focusable with visible focus ring
- ARIA labels for screen reader accessibility
- Handles missing translation data gracefully

---

## 2. Implementation Plan

### Step 1: Create Component Directory Structure
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/` (new directory)

Create the component directory following the established pattern from other TranslationManagement components.

**Actions**:
- Create directory: `/src/components/TranslationManagement/TranslationStatusColumn/`
- Will contain: `TranslationStatusColumn.tsx`, `StatusDot.tsx` (optional), `index.ts`

### Step 2: Define TypeScript Interfaces
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx` (new)

Define props interfaces and supporting types.

**Pattern Reference**: REQ-E05-008 defines status types and color specifications

**Implementation Details**:
```typescript
interface TranslationStatusColumnProps {
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  translations: LanguageTranslationSummary[];  // Status for each language
  size?: 'sm' | 'md' | 'lg';                   // Dot size variant (default: 'md')
  onClick?: () => void;                         // Callback when clicked (opens preview panel)
  showTooltip?: boolean;                        // Show tooltip on hover (default: true)
  disabled?: boolean;                           // Disable click interaction
  className?: string;                           // Additional CSS classes
}

interface LanguageTranslationSummary {
  language: SupportedLanguage;
  status: 'complete' | 'pending' | 'failed' | 'stale' | 'missing' | 'manual';
  translatedAt?: string;
}

// From LocaleContext.tsx
type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it';
```

**Actions**:
- Import `SupportedLanguage` from `@/contexts/LocaleContext`
- Define `TranslationStatusColumnProps` interface with JSDoc
- Define `LanguageTranslationSummary` interface
- Add JSDoc comments for all props

### Step 3: Define Language Display Order and Constants
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Define constants for language order, flag emojis, and status colors.

**Implementation Details**:
```typescript
// Display order for translation status dots (exclude 'en' source language)
const LANGUAGE_ORDER: SupportedLanguage[] = ['es', 'fr', 'de', 'it', 'nl', 'pt'];

// Flag emojis for each language (REQ-E05-014 specification)
const FLAG_EMOJIS: Record<SupportedLanguage, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  nl: '🇳🇱',
  pt: '🇵🇹',
};

// Status color mapping (matching REQ-E05-008 specification)
const STATUS_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  complete: { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' },
  pending: { bg: 'bg-orange-500', text: 'text-orange-500', ring: 'ring-orange-500' },
  failed: { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500' },
  manual: { bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-500' },
  stale: { bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500' },
  missing: { bg: 'bg-gray-300', text: 'text-gray-300', ring: 'ring-gray-300' },
};

// Size variant configurations
const SIZE_CONFIG = {
  sm: { dot: 'w-1.5 h-1.5', gap: 'gap-0.5' },  // 6px dots, 2px gap
  md: { dot: 'w-2 h-2', gap: 'gap-1' },        // 8px dots, 4px gap (default)
  lg: { dot: 'w-2.5 h-2.5', gap: 'gap-1.5' },  // 10px dots, 6px gap
};
```

**Actions**:
- Define `LANGUAGE_ORDER` constant array
- Define `FLAG_EMOJIS` record with all language flags
- Define `STATUS_COLORS` record with Tailwind classes
- Define `SIZE_CONFIG` for dot and gap sizing
- Add comments explaining color/size choices

### Step 4: Create StatusDot Subcomponent (Optional)
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/StatusDot.tsx` (optional new file)

Create an optional reusable status dot component for cleaner code organization.

**Implementation Details**:
```typescript
interface StatusDotProps {
  status: string;
  size: 'sm' | 'md' | 'lg';
  isPending?: boolean;  // Trigger pulse animation
}

export function StatusDot({ status, size, isPending }: StatusDotProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.missing;
  const sizeClass = SIZE_CONFIG[size].dot;

  return (
    <div
      className={cn(
        'rounded-full',
        sizeClass,
        status === 'missing' ? 'border-2 border-current' : colors.bg,
        status === 'missing' && colors.text,
        isPending && 'animate-pulse motion-reduce:animate-none'
      )}
      aria-hidden="true"
    />
  );
}
```

**Alternative**: Keep dot rendering inline in main component if subcomponent feels over-engineered.

**Actions**:
- Decide whether to extract as separate component or keep inline
- If extracted: Create StatusDot.tsx with props interface
- If inline: Add dot rendering logic directly in main component map function
- Include `motion-reduce:animate-none` for accessibility

### Step 5: Implement Main Component Structure
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Build the component skeleton with proper client directive and imports.

**Actions**:
- Add `'use client'` directive at top of file
- Import necessary dependencies:
  - React: useMemo
  - next-intl: useTranslations
  - @radix-ui/react-tooltip: Tooltip primitives
  - @/lib/utils: cn utility
  - @/contexts/LocaleContext: SupportedLanguage type
- Create component function with props destructuring
- Set up translation hook: `useTranslations('translationManagement.statusColumn')`

### Step 6: Process Translations Array
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Transform incoming translations array into consistent language-ordered map.

**Implementation Details**:
```typescript
// Create a map of language -> status for quick lookup
const translationMap = useMemo(() => {
  const map = new Map<SupportedLanguage, LanguageTranslationSummary>();
  translations.forEach(trans => {
    map.set(trans.language, trans);
  });
  return map;
}, [translations]);

// Build ordered dots data
const dotsData = useMemo(() => {
  return LANGUAGE_ORDER.map(lang => {
    const translation = translationMap.get(lang);
    return {
      language: lang,
      status: translation?.status || 'missing',
      translatedAt: translation?.translatedAt,
    };
  });
}, [translationMap]);
```

**Actions**:
- Use useMemo for translation map creation
- Map LANGUAGE_ORDER to dot data objects
- Handle missing languages gracefully (default to 'missing' status)
- Maintain consistent order regardless of input array order

### Step 7: Calculate Completion Summary
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Calculate completion count for ARIA label and tooltip summary.

**Implementation Details**:
```typescript
const completionSummary = useMemo(() => {
  const completeCount = dotsData.filter(d => d.status === 'complete').length;
  const totalCount = dotsData.length;
  return { completeCount, totalCount };
}, [dotsData]);
```

**Actions**:
- Count complete translations
- Calculate total languages (should be 6)
- Use for ARIA label and tooltip footer

### Step 8: Build ARIA Label
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Create descriptive ARIA label for screen readers.

**Implementation Details**:
```typescript
const ariaLabel = useMemo(() => {
  const { completeCount, totalCount } = completionSummary;
  const translationKey = onClick ? 'ariaLabelClickable' : 'ariaLabel';
  return t(translationKey, { complete: completeCount, total: totalCount });
}, [completionSummary, onClick, t]);
```

**Translation Keys Required**:
- `ariaLabel`: "{complete} of {total} translations complete"
- `ariaLabelClickable`: "{complete} of {total} translations complete, click to view details"

**Actions**:
- Use completion summary to build label
- Include clickable indication if onClick provided
- Use i18n for accessible text

### Step 9: Render Dots Container
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Create the container element for the dots with appropriate ARIA and interaction attributes.

**Implementation Details**:
```typescript
const containerElement = (
  <div
    className={cn(
      'inline-flex items-center',
      SIZE_CONFIG[size].gap,
      onClick && !disabled && 'cursor-pointer',
      onClick && !disabled && 'hover:opacity-80 transition-opacity',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    role={onClick && !disabled ? 'button' : undefined}
    tabIndex={onClick && !disabled ? 0 : undefined}
    onClick={onClick && !disabled ? onClick : undefined}
    onKeyDown={onClick && !disabled ? handleKeyDown : undefined}
    aria-label={ariaLabel}
    aria-disabled={disabled || undefined}
  >
    {dotsData.map((dot, index) => (
      <div
        key={dot.language}
        className={cn(
          'rounded-full',
          SIZE_CONFIG[size].dot,
          dot.status === 'missing'
            ? `border-2 ${STATUS_COLORS[dot.status].text}`
            : STATUS_COLORS[dot.status].bg,
          dot.status === 'pending' && 'animate-pulse motion-reduce:animate-none'
        )}
        aria-hidden="true"
      />
    ))}
  </div>
);

function handleKeyDown(e: React.KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onClick?.();
  }
}
```

**Actions**:
- Apply size-specific gap classes
- Add cursor pointer and hover effect when clickable
- Make keyboard focusable when onClick provided
- Implement keyboard handler for Enter and Space keys
- Map over dotsData to render each dot
- Apply status-specific colors and animations
- Use `motion-reduce:animate-none` for accessibility

### Step 10: Implement Tooltip Content
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Create detailed tooltip content with language names and statuses.

**Pattern Reference**: `/src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx` (lines 14-15, 113-154) - Radix Tooltip usage

**Implementation Details**:
```typescript
const tooltipContent = (
  <div className="space-y-1">
    <div className="font-semibold text-xs mb-2">
      {t('tooltipTitle')}
    </div>
    <div className="space-y-0.5">
      {dotsData.map(dot => (
        <div key={dot.language} className="flex items-center gap-2 text-xs">
          <span>{FLAG_EMOJIS[dot.language]}</span>
          <span className="font-medium">{tLang(dot.language)}:</span>
          <span className={STATUS_COLORS[dot.status].text}>
            {tStatus(dot.status)}
          </span>
        </div>
      ))}
    </div>
    <div className="border-t border-gray-700 pt-1 mt-2 text-xs text-gray-300">
      {t('tooltipSummary', completionSummary)}
    </div>
  </div>
);
```

**Translation Hooks Required**:
- `const t = useTranslations('translationManagement.statusColumn');`
- `const tLang = useTranslations('languages');`
- `const tStatus = useTranslations('translationManagement.statuses');`

**Translation Keys Required**:
- `tooltipTitle`: "Translation Status"
- `tooltipSummary`: "{completeCount}/{totalCount} translations"
- Plus language names in `languages` namespace
- Plus status names in `translationManagement.statuses` namespace

**Actions**:
- Create structured tooltip content div
- Map over dotsData to show each language
- Include flag emoji, language name, and status
- Add summary footer with completion count
- Use multiple translation namespaces for different content

### Step 11: Wrap with Radix Tooltip
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Wrap the dots container with Radix UI Tooltip component.

**Pattern Reference**: `/src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx` (lines 114-154)

**Implementation Details**:
```typescript
if (!showTooltip) {
  return containerElement;
}

return (
  <Tooltip.Provider delayDuration={300}>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {containerElement}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className={cn(
            'z-50 overflow-hidden rounded-md',
            'bg-gray-900 px-3 py-2',
            'text-sm text-white',
            'shadow-md',
            'max-w-xs',
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
          sideOffset={5}
        >
          {tooltipContent}
          <Tooltip.Arrow className="fill-gray-900" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);
```

**Actions**:
- Conditionally skip tooltip if `showTooltip` is false
- Use Radix Tooltip.Provider with 300ms delay
- Wrap container with Tooltip.Trigger using asChild
- Render tooltip content in Portal
- Apply consistent styling matching TruncatedText pattern
- Add arrow pointing to trigger element

### Step 12: Handle Focus Visible State
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Add visible focus ring for keyboard navigation.

**Implementation Details**:
```typescript
// In container className:
cn(
  // ... existing classes
  onClick && !disabled && 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm'
)
```

**Actions**:
- Add focus-visible ring classes when clickable
- Use blue ring color for consistency
- Add ring-offset for visibility
- Apply rounded corners to ring container

### Step 13: Create Barrel Export
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/index.ts` (new)

Create index file for clean imports.

**Actions**:
- Export TranslationStatusColumn as default and named export
- Export TranslationStatusColumnProps type
- Export LanguageTranslationSummary type if reusable

### Step 14: Update Parent Barrel Export
**File**: `/src/components/TranslationManagement/index.ts`

Add TranslationStatusColumn to parent namespace exports.

**Note**: This file may not exist yet (entire TranslationManagement namespace is new in Epic 5).

**Actions**:
- Create `/src/components/TranslationManagement/index.ts` if it doesn't exist
- Add export statement for TranslationStatusColumn
- Add export statement for TranslationStatusColumnProps type
- Maintain alphabetical or logical ordering with other Epic 5 components

### Step 15: Add Translation Keys to Message Files
**Files**:
- `/messages/en.json`
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

Add required translation keys for the component.

**English Template** (`/messages/en.json`):
```json
{
  "translationManagement": {
    "statusColumn": {
      "ariaLabel": "{complete} of {total} translations complete",
      "ariaLabelClickable": "{complete} of {total} translations complete, click to view details",
      "tooltipTitle": "Translation Status",
      "tooltipSummary": "{completeCount}/{totalCount} translations"
    },
    "statuses": {
      "complete": "Complete",
      "pending": "Pending",
      "failed": "Failed",
      "manual": "Manual",
      "stale": "Stale",
      "missing": "Missing"
    }
  },
  "languages": {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "nl": "Dutch",
    "pt": "Portuguese"
  }
}
```

**Actions**:
- Add keys to English file first (source language)
- Copy structure to all target language files (fr, es, de, nl, it)
- Note: Portuguese (pt) is NOT in the target languages but appears in the dots
- Translate text appropriately for each language
- Ensure consistent key structure across all files
- Validate JSON syntax

### Step 16: Add Example Usage Documentation
**File**: `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`

Add JSDoc with usage examples at top of file.

**Implementation Details**:
```typescript
/**
 * TranslationStatusColumn Component
 *
 * Displays translation status as 6 colored dots representing each supported language.
 * Provides at-a-glance visibility into translation coverage for table columns.
 *
 * @example
 * // In a table cell
 * <TranslationStatusColumn
 *   entityId={item.id}
 *   entityType="item"
 *   translations={item.translationStatuses}
 *   onClick={() => openPreviewPanel(item.id, 'item')}
 * />
 *
 * @example
 * // Compact size for dense tables
 * <TranslationStatusColumn
 *   entityId={article.id}
 *   entityType="article"
 *   translations={article.translationStatuses}
 *   size="sm"
 *   onClick={() => openPreviewPanel(article.id, 'article')}
 * />
 *
 * @example
 * // Read-only display (no click action)
 * <TranslationStatusColumn
 *   entityId={link.id}
 *   entityType="link"
 *   translations={link.translationStatuses}
 *   showTooltip={true}
 * />
 *
 * @module TranslationManagement/TranslationStatusColumn
 * @see docs/REQ-E05-014-create-translationstatuscolumn-component-overview.md
 * @lastModified 2026-01-22
 */
```

**Actions**:
- Add comprehensive JSDoc comment block
- Include 3-4 usage examples covering common scenarios
- Reference this overview document
- Add @lastModified timestamp

### Step 17: Manual Integration Testing
**Context**: ItemManager table integration testing

Test the component in actual table context.

**Test Scenarios**:
1. Component renders 6 dots in correct language order (es, fr, de, it, nl, pt)
2. Dots are colored correctly based on status
3. Missing languages show as gray hollow dots
4. Pending status dots animate with pulse
5. Animation respects prefers-reduced-motion
6. Tooltip appears on hover with correct content
7. Tooltip shows all language names and statuses
8. Tooltip summary displays correct completion count
9. Click triggers onClick callback when provided
10. Keyboard navigation works (Tab to focus, Enter/Space to click)
11. Focus ring is visible on keyboard focus
12. Component works in sm/md/lg sizes
13. Disabled state prevents interaction
14. ARIA label is correct and descriptive
15. Component integrates cleanly in ItemList table

**Actions**:
- Add TranslationStatusColumn to ItemList component as test column
- Create mock translation data for testing
- Test all size variants
- Test with various status combinations
- Verify tooltip positioning and content
- Test keyboard navigation and focus states
- Verify accessibility with screen reader
- Test in different table densities
- Validate all i18n strings display correctly

---

## 3. Authorized Files for Modification

### New Files to Create:
1. `/src/components/TranslationManagement/TranslationStatusColumn/TranslationStatusColumn.tsx`
   - Main component implementation
   - Lines: ~300-350 (estimated)

2. `/src/components/TranslationManagement/TranslationStatusColumn/StatusDot.tsx` (optional)
   - Status dot subcomponent
   - Lines: ~40-50 (estimated)
   - Note: May be kept inline instead of separate file

3. `/src/components/TranslationManagement/TranslationStatusColumn/index.ts`
   - Barrel export file
   - Lines: ~5-10

### Existing Files to Modify:
4. `/src/components/TranslationManagement/index.ts`
   - Add TranslationStatusColumn exports
   - Modification: Add 2-3 export lines
   - Note: File may not exist yet; create if needed

5. `/messages/en.json`
   - Add statusColumn and statuses translation keys
   - Modification: Add `translationManagement.statusColumn` and `translationManagement.statuses` namespaces

6. `/messages/fr.json`
   - Add statusColumn and statuses translation keys
   - Modification: Add `translationManagement.statusColumn` and `translationManagement.statuses` namespaces

7. `/messages/es.json`
   - Add statusColumn and statuses translation keys
   - Modification: Add `translationManagement.statusColumn` and `translationManagement.statuses` namespaces

8. `/messages/de.json`
   - Add statusColumn and statuses translation keys
   - Modification: Add `translationManagement.statusColumn` and `translationManagement.statuses` namespaces

9. `/messages/nl.json`
   - Add statusColumn and statuses translation keys
   - Modification: Add `translationManagement.statusColumn` and `translationManagement.statuses` namespaces

10. `/messages/it.json`
    - Add statusColumn and statuses translation keys
    - Modification: Add `translationManagement.statusColumn` and `translationManagement.statuses` namespaces

---

## 4. Dependencies

### Internal Dependencies (Must Exist First):
- **REQ-E05-006**: TranslationManagement types file
  - Required for: `LanguageTranslationSummary` interface (may be defined in component if not in shared types)
  - Import: `@/components/TranslationManagement/TranslationManagement.types`

- **REQ-E05-007**: TranslationPreviewPanel component
  - Required for: Opens when status column is clicked
  - Import: `@/components/TranslationManagement/TranslationPreviewPanel`
  - Note: Component doesn't directly import but parent integrates both

- **REQ-E05-008**: TranslationStatusItem component
  - Required for: Shares status color specifications
  - Reference only (not direct import)

### External Dependencies (Existing):
- **@radix-ui/react-tooltip**: Tooltip primitives
  - Usage: Tooltip.Provider, Tooltip.Root, Tooltip.Trigger, Tooltip.Content, Tooltip.Portal, Tooltip.Arrow

- **next-intl**: Internationalization
  - Usage: `useTranslations` hook for multiple namespaces

- **React**: Core framework (v18+)
  - Usage: useMemo, keyboard event handlers

- **lucide-react**: Icon library (potential future use)
  - Note: Current spec uses colored dots, not icons

- **Tailwind CSS**: Styling utility classes

- **@/lib/utils**: Utility functions
  - Usage: `cn()` for className merging

- **@/contexts/LocaleContext**: Locale types
  - Usage: `SupportedLanguage` type definition

---

## 5. Key Technical Decisions

### 5.1 Language Display Order
**Decision**: Always display dots in consistent order: es, fr, de, it, nl, pt (exclude 'en' source language).

**Rationale**:
- English is the source language, not a translation target
- Consistent order across all tables improves user familiarity
- Matches order specified in REQ-E05-014 requirement
- Total of 6 dots (not 7) keeps component compact

**Implementation**: Use `LANGUAGE_ORDER` constant array to map dots regardless of input array order.

### 5.2 Missing Status Representation
**Decision**: Use hollow/outline gray dot for 'missing' status instead of solid filled dot.

**Rationale**:
- Visual distinction from other status types (which use solid filled dots)
- Empty/hollow conveys "not present" more intuitively
- Matches specification in REQ-E05-014

**Implementation**: Conditional rendering: `border-2 border-current` for missing, `bg-{color}` for all others.

### 5.3 Pending Animation with Motion Reduction
**Decision**: Animate pending status dots with pulse effect, but disable animation for users with `prefers-reduced-motion`.

**Rationale**:
- Pulse draws attention to in-progress translations
- Respects user accessibility preferences
- Follows WCAG guidelines for motion sensitivity

**Pattern Reference**: `/src/components/SimpleDashboard/LoadingIndicator.tsx` (lines 55, 79-82) shows motion-reduce pattern

**Implementation**: `animate-pulse motion-reduce:animate-none` classes.

### 5.4 Tooltip Implementation
**Decision**: Use Radix UI Tooltip instead of browser native title attribute.

**Rationale**:
- Rich content support (flags, multiple lines, formatting)
- Consistent styling and positioning
- Better accessibility with ARIA attributes
- Touch-friendly for mobile devices

**Pattern Reference**: TruncatedText.tsx uses Radix Tooltip successfully.

### 5.5 Clickable as Button vs Link
**Decision**: Use `role="button"` with keyboard handlers instead of actual `<button>` element.

**Rationale**:
- Component is inline display (doesn't work well as button in table cell)
- More flexible styling without button resets
- Maintains semantic meaning with ARIA role
- Common pattern for custom interactive elements

**Implementation**: `role="button"`, `tabIndex={0}`, keyboard event handlers for Enter and Space keys.

### 5.6 Size Variants Strategy
**Decision**: Define three size presets (sm/md/lg) rather than custom size props.

**Rationale**:
- Matches table density use cases (compact, standard, spacious)
- Prevents inconsistent sizing across tables
- Simplified API with clear use cases
- Matches REQ-E05-014 specification

**Sizes**:
- sm: 6px dots, 2px gap (~44px total width)
- md: 8px dots, 4px gap (~64px total width) - default
- lg: 10px dots, 6px gap (~84px total width)

---

## 6. Risks and Mitigations

### Risk 1: Translation Data Shape Mismatch
**Risk**: Actual translation data from API may not match expected `LanguageTranslationSummary[]` shape.

**Impact**: Medium - Component won't render correctly if data structure differs

**Mitigation**:
- Define clear interface in REQ-E05-006 (TranslationManagement types)
- Add runtime checks for data structure
- Gracefully handle missing/malformed data
- Use optional chaining for all data access
- Test with real API data early

**Likelihood**: Low (interfaces defined in previous tasks)

### Risk 2: Missing Languages in Input Array
**Risk**: `translations` prop may not include all 6 languages.

**Impact**: Low - Already handled in design

**Mitigation**:
- Use Map lookup with fallback to 'missing' status
- Always render all 6 dots regardless of input array length
- Document expected behavior in JSDoc

**Likelihood**: High (expected scenario)

### Risk 3: Portuguese Language Confusion
**Risk**: Portuguese (pt) is NOT in the supported target languages but appears in the dots.

**Impact**: Medium - Confusion about why pt is displayed

**Mitigation**:
- Verify with product team whether pt should be included
- If pt is mistake: Update LANGUAGE_ORDER to exclude it (5 dots instead of 6)
- If pt is correct: Update SUPPORTED_LOCALES in LocaleContext to include pt
- Document decision clearly in code comments

**Likelihood**: Medium (potential spec inconsistency)

**NOTE**: LocaleContext shows supported languages as `en, fr, es, de, nl, it` (6 total), but REQ-E05-014 spec lists `es, fr, de, it, nl, pt` (also 6 total). The 'it' vs 'pt' mismatch needs clarification.

### Risk 4: Tooltip Positioning in Scrolling Tables
**Risk**: Tooltip may be clipped or positioned incorrectly in scrollable table containers.

**Impact**: Low - Radix handles positioning but may need adjustments

**Mitigation**:
- Use Radix Tooltip.Portal to render outside scroll container
- Test in scrollable table contexts
- Add `sideOffset` and collision detection props if needed
- Consider alternative positioning strategies for edge cases

**Likelihood**: Low (Radix handles most cases)

### Risk 5: Performance with Many Rows
**Risk**: Rendering many TranslationStatusColumn instances in large tables may impact performance.

**Impact**: Low - Component is lightweight

**Mitigation**:
- Use useMemo for computed values
- Avoid unnecessary re-renders with proper props
- Consider React.memo if performance issues arise
- Test with 100+ row tables

**Likelihood**: Very Low

### Risk 6: Color Contrast in Different Themes
**Risk**: Status colors may not meet WCAG contrast requirements in all contexts.

**Impact**: Medium - Accessibility issue

**Mitigation**:
- Use established color palette from REQ-E05-008
- Test contrast ratios for all status colors
- Consider dark mode variants if needed
- Add tooltip as accessible fallback for color information

**Likelihood**: Low (colors are pre-specified)

---

## 7. Out of Scope

### 7.1 Flag Icon Images
- Component uses flag emojis (🇪🇸, 🇫🇷, etc.), not flag icon images
- Rationale: Spec shows flag emojis, simpler implementation, no asset management
- Future Enhancement: Could add optional flag icon images via prop

### 7.2 Progress Bar View
- Component shows discrete dots, not a progress bar
- Rationale: Different use case (progress bar is for TranslationProgressBar component)
- Future Enhancement: Could add variant prop for progress bar display mode

### 7.3 Individual Dot Tooltips
- Tooltip shows all languages at once, not per-dot tooltips
- Rationale: More efficient, less UI clutter, matches spec
- Future Enhancement: Could add per-dot tooltips on long-press or extended hover

### 7.4 Sorting/Filtering by Translation Status
- Component is display-only, doesn't include filter/sort controls
- Rationale: Filtering is handled by separate TranslationStatusFilter component (REQ-E05-015)
- Use Case: Parent table component handles sorting/filtering logic

### 7.5 Real-time Updates
- Component does NOT subscribe to realtime updates
- Rationale: Parent component provides data; realtime handled at data layer
- Future Enhancement: Could integrate with useTranslationRealtime hook

### 7.6 Editable Inline Status
- Clicking opens preview panel, does NOT allow inline status editing
- Rationale: Status editing happens in TranslationEditor component
- Use Case: Component is read-only indicator with navigation

### 7.7 Custom Status Types
- Hard-coded status types: complete, pending, failed, stale, missing, manual
- Rationale: Status types defined by translation service architecture
- Out of Scope: User-defined custom statuses

### 7.8 Percentage Display
- Shows discrete dots, not percentage text
- Rationale: TranslationProgressBar handles percentage display
- Use Case: Dots provide quick visual scan without reading numbers

### 7.9 Language Selection
- Component displays all 6 languages, no selection interface
- Rationale: Not a selector, just a status indicator
- Use Case: Language selection happens in TranslationEditor or settings

---

## 8. Testing Considerations

### Unit Tests (Future):
- Renders correct number of dots (6)
- Dots are in correct language order (es, fr, de, it, nl, pt)
- Each status type renders with correct color
- Missing languages show as gray hollow dots
- Pending status adds pulse animation
- Tooltip content is correct and complete
- Click triggers onClick callback when provided
- Keyboard Enter/Space triggers onClick
- Disabled state prevents interaction
- Size variants apply correct classes
- Motion-reduced users don't see animation

### Integration Tests (Future):
- Component integrates in ItemList table
- Tooltip positioning works in scrollable tables
- Focus management works in table context
- ARIA labels are announced correctly

### Manual Testing (Required):
- Visual verification in actual table
- Hover to see tooltip with all languages
- Click to trigger preview panel (when integrated)
- Keyboard navigation (Tab, Enter, Space)
- Focus ring visibility
- Test all size variants (sm, md, lg)
- Test with various status combinations
- Test with missing languages in data
- Verify accessibility with screen reader
- Test in responsive table layouts

---

## 9. Estimated Effort

**Total Effort**: 5-7 hours

**Breakdown**:
- Component structure and interfaces: 1 hour
- Language constants and mappings: 0.5 hours
- Dot rendering and sizing logic: 1.5 hours
- Tooltip implementation with Radix: 1.5 hours
- Click/keyboard interaction: 1 hour
- Translation keys and i18n: 0.5 hours
- Testing and refinement: 1-2 hours

**Complexity**: Medium
- Multiple translation namespaces to manage
- Radix Tooltip integration
- Keyboard accessibility requirements
- Consistent language ordering logic
- Status color mapping with animations

---

## 10. Success Criteria

This task is complete when:

1. ✅ TranslationStatusColumn component renders 6 dots in a horizontal row
2. ✅ Dots are always displayed in order: es, fr, de, it, nl, pt
3. ✅ Each dot is color-coded by status (green/orange/red/purple/amber/gray)
4. ✅ Missing status shows hollow/outline dot instead of filled
5. ✅ Pending status dots have pulse animation
6. ✅ Animation respects prefers-reduced-motion
7. ✅ Hovering shows tooltip with language names and statuses
8. ✅ Tooltip includes summary count (e.g., "3/6 translations")
9. ✅ Clicking component triggers onClick callback when provided
10. ✅ Component is keyboard focusable when clickable
11. ✅ Enter and Space keys trigger onClick
12. ✅ Visible focus ring appears on keyboard focus
13. ✅ Disabled state prevents all interaction
14. ✅ Size variants (sm/md/lg) render with correct dimensions
15. ✅ ARIA label describes overall status for screen readers
16. ✅ Component handles empty or partial translations array gracefully
17. ✅ All UI text is internationalized via next-intl
18. ✅ Component exports are added to parent namespace
19. ✅ TypeScript types are properly defined and exported

---

## 11. Related Documentation

- **Epic 5 Implementation Plan**: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Source Request**: `/docs/gen_requests_epic5.md` (Request #14, lines 1833-2048)
- **REQ-E05-006**: TranslationManagement types file (dependency)
- **REQ-E05-007**: TranslationPreviewPanel component (integration)
- **REQ-E05-008**: TranslationStatusItem component (status color reference)
- **REQ-E05-013**: TranslationStatusWidget component (dashboard integration)
- **LocaleContext**: `/src/contexts/LocaleContext.tsx` (SupportedLanguage type)
- **Radix Tooltip Pattern**: `/src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx`
- **ItemManager Table**: `/src/components/ItemManager/components/ItemList.tsx` (integration point)

---

## 12. Notes

- **IMPORTANT**: Verify whether Portuguese (pt) should be included in language dots. LocaleContext shows supported languages as `en, fr, es, de, nl, it` but REQ-E05-014 spec shows `es, fr, de, it, nl, pt`. This is a potential inconsistency that needs clarification.
- The component is designed to be lightweight and reusable across different table contexts (items, articles, links, tags)
- Status colors must remain consistent with REQ-E05-008 (TranslationStatusItem) for visual coherence
- The hollow dot representation for 'missing' status is critical for visual distinction
- Tooltip provides essential context for users who may not understand the color coding system
- Consider adding loading state if translation data fetching is slow
- The component does not handle data fetching; it's a pure presentational component

---

**Document Status**: Ready for Implementation
**Next Step**: Begin implementation starting with Step 1 (directory structure)
