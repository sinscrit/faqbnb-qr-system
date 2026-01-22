# Implementation Overview: Create TranslationStatusItem Component

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-008 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 23:45 |
| Breakdown Created | 2026-01-22 19:06 |
| T-shirt Size | S |
| Estimated Effort | 3-4 hours |

## Goals

Create a reusable row component that displays translation status for a single language within the TranslationPreviewPanel. Each row shows flag emoji, language name, status icon with color, preview text, and action buttons that vary by translation status. The component supports bulk selection via checkbox and provides accessible keyboard navigation.

**Technical Requirements:**
- Display flag emoji and localized language name
- Show status icon with color coding: green (complete), orange (pending/stale), red (failed), purple (manual), gray (missing)
- Truncate preview text to ~30 characters with tooltip for full text
- Conditionally render action buttons based on translation status
- Support bulk selection with checkbox when `onSelectionChange` prop is provided
- Hover highlight effect with proper keyboard navigation
- i18n support via next-intl for all UI text
- ARIA attributes for accessibility
- Disabled state support (grayed out with no interactions)

### Assumptions & Clarifications

- **Discovery**: AssetItem.tsx (lines 154-327) provides excellent pattern for row component with similar features (thumbnails, actions, state variants)
- **Discovery**: Project uses lucide-react icons consistently (Check, Clock, AlertCircle, X, Pencil, AlertTriangle, Circle)
- **Discovery**: Translation status types defined in existing types: 'pending', 'processing', 'completed', 'failed', 'manual'
- **Assumption**: 'stale' status is a derived status (not stored in DB) computed from source_version_at comparison
- **Assumption**: Component receives displayTranslation type (from TranslationManagement.types.ts) as prop
- **Assumption**: Tooltip component exists in project (shadcn/ui or custom)
- **Clarification needed**: Should clicking the row outside buttons trigger preview or select the checkbox?

## Implementation Plan

### Step 1: Create Component File Structure and Basic Imports
- **Description**: Set up component file with 'use client' directive and import all dependencies
- **Rationale**: Establish foundation with proper React Client Component setup
- **Estimated Effort**: 15 minutes

Component file: `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

Required imports:
- React hooks: `useMemo` for computed values
- next-intl: `useTranslations` for i18n
- lucide-react icons: `Check`, `Clock`, `AlertCircle`, `X`, `Pencil`, `AlertTriangle`, `Circle`, `Loader2`
- Utils: `cn` from `@/lib/utils`
- Types: `TranslationStatusItemProps` from `../TranslationManagement.types`

Module JSDoc header:
```typescript
/**
 * TranslationStatusItem Component
 *
 * Displays translation status for a single language as a row in the preview panel.
 * Shows flag emoji, language name, status icon, preview text, and action buttons.
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationStatusItem
 * @lastModified 2026-01-22 19:06 (REQ-E05-008 - Initial implementation)
 */
```

### Step 2: Define Constants and Helper Functions
- **Description**: Create constants for flag emojis, status colors, and icon mapping
- **Rationale**: Centralize configuration for maintainability and consistency
- **Estimated Effort**: 30 minutes

**Flag Emoji Mapping:**
```typescript
const FLAG_EMOJIS: Record<string, string> = {
  en: '🇺🇸', // US flag for English
  fr: '🇫🇷', // French
  es: '🇪🇸', // Spanish
  de: '🇩🇪', // German
  nl: '🇳🇱', // Dutch
  it: '🇮🇹', // Italian
} as const;
```

**Status Icon and Color Configuration:**
```typescript
const STATUS_CONFIG = {
  complete: {
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  pending: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  processing: {
    icon: Loader2,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    animate: 'animate-spin',
  },
  failed: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  manual: {
    icon: Pencil,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  stale: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  missing: {
    icon: Circle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
} as const;
```

**Preview Text Truncation Helper:**
```typescript
function truncatePreview(text: string, maxLength: number = 30): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
```

### Step 3: Implement Action Button Availability Logic
- **Description**: Create helper function to determine which action buttons to show based on status
- **Rationale**: Centralize complex button visibility rules from specification
- **Estimated Effort**: 30 minutes

Per specification, button availability by status:
- **Edit**: Show for 'complete', 'failed', 'manual', 'stale'
- **Re-translate**: Show for 'complete', 'manual', 'stale'
- **Retry**: Show for 'failed' only
- **Translate**: Show for 'missing' only
- **None**: 'pending' and 'processing' show no action buttons

```typescript
interface ActionButtonConfig {
  showEdit: boolean;
  showRetranslate: boolean;
  showRetry: boolean;
  showTranslate: boolean;
}

function getActionButtons(status: DisplayTranslationStatus): ActionButtonConfig {
  switch (status) {
    case 'complete':
      return { showEdit: true, showRetranslate: true, showRetry: false, showTranslate: false };
    case 'manual':
      return { showEdit: true, showRetranslate: true, showRetry: false, showTranslate: false };
    case 'stale':
      return { showEdit: true, showRetranslate: true, showRetry: false, showTranslate: false };
    case 'failed':
      return { showEdit: true, showRetranslate: false, showRetry: true, showTranslate: false };
    case 'missing':
      return { showEdit: false, showRetranslate: false, showRetry: false, showTranslate: true };
    case 'pending':
    case 'processing':
    default:
      return { showEdit: false, showRetranslate: false, showRetry: false, showTranslate: false };
  }
}
```

### Step 4: Implement Main Component Structure
- **Description**: Build component skeleton with proper layout structure
- **Rationale**: Establish HTML structure before adding interactive logic
- **Estimated Effort**: 45 minutes

Component structure (following AssetItem.tsx pattern):
```typescript
export function TranslationStatusItem({
  language,
  status,
  previewText,
  lastUpdated,
  isSelected,
  disabled = false,
  onEdit,
  onRetranslate,
  onRetry,
  onPreview,
  onSelectionChange,
  className,
}: TranslationStatusItemProps) {
  // Translations
  const t = useTranslations('translationManagement.statusItem');
  const tLang = useTranslations('languages');

  // Computed values
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;
  const flagEmoji = FLAG_EMOJIS[language] || '🏳️';
  const languageName = tLang(language);
  const actionButtons = useMemo(() => getActionButtons(status), [status]);
  const truncatedPreview = useMemo(
    () => previewText ? truncatePreview(previewText, 30) : null,
    [previewText]
  );
  const isTruncated = previewText && previewText.length > 30;

  // Layout: [Checkbox?] [Flag] [Language] [Status Icon] [Preview] [Spacer] [Action Buttons]
  return (
    <div className={cn(/* row styles */)} role="listitem">
      {/* Checkbox section */}
      {/* Flag and language section */}
      {/* Status icon section */}
      {/* Preview text section */}
      {/* Action buttons section */}
    </div>
  );
}
```

Root element styles (following AssetItem pattern):
- Flex container with `items-center gap-3 p-3 rounded-lg border`
- Hover effect: `hover:bg-gray-50` (when not disabled and onPreview provided)
- Disabled state: `opacity-60 cursor-not-allowed`
- Normal state: `border-gray-200 bg-white`
- Cursor pointer when clickable: `cursor-pointer` (when onPreview and not disabled)
- Transition: `transition-all duration-200`

### Step 5: Implement Checkbox Section
- **Description**: Add optional checkbox for bulk selection
- **Rationale**: Support bulk operations when enabled
- **Estimated Effort**: 20 minutes

Checkbox section (only rendered when `onSelectionChange` is provided):
```typescript
{onSelectionChange && (
  <div className="shrink-0">
    <input
      type="checkbox"
      checked={isSelected}
      onChange={(e) => onSelectionChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()} // Prevent row click
      disabled={disabled}
      className={cn(
        'w-4 h-4 rounded border-gray-300',
        'text-blue-600 focus:ring-2 focus:ring-blue-500',
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
      )}
      aria-label={t('selectLanguage', { language: languageName })}
    />
  </div>
)}
```

### Step 6: Implement Flag, Language, and Status Icon Sections
- **Description**: Render flag emoji, language name, and colored status icon
- **Rationale**: Display core identification and status information
- **Estimated Effort**: 30 minutes

**Flag and Language Section:**
```typescript
<div className="flex items-center gap-2 shrink-0 min-w-[120px]">
  {/* Flag Emoji */}
  <span
    className="text-2xl leading-none"
    role="img"
    aria-label={t('flagFor', { language: languageName })}
  >
    {flagEmoji}
  </span>

  {/* Language Name */}
  <span className="text-sm font-medium text-gray-900">
    {languageName}
  </span>
</div>
```

**Status Icon Section:**
```typescript
<div className={cn(
  'shrink-0 flex items-center justify-center w-8 h-8 rounded-full',
  statusConfig.bgColor,
  statusConfig.borderColor,
  'border'
)}>
  <StatusIcon className={cn('w-4 h-4', statusConfig.color, statusConfig.animate)} />
</div>
```

### Step 7: Implement Preview Text Section with Tooltip
- **Description**: Display truncated preview text with tooltip for full text
- **Rationale**: Show content preview efficiently with access to full text
- **Estimated Effort**: 30 minutes

Preview text section (grows to fill space):
```typescript
<div className="flex-1 min-w-0">
  {truncatedPreview ? (
    <div className="flex items-center gap-2">
      {/* Preview Text - truncated */}
      <span
        className="text-sm text-gray-700 truncate"
        title={isTruncated ? previewText : undefined}
      >
        {truncatedPreview}
      </span>

      {/* Last Updated Timestamp (optional) */}
      {lastUpdated && (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {t('updated', {
            time: new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
              Math.floor((new Date(lastUpdated).getTime() - Date.now()) / 86400000),
              'day'
            )
          })}
        </span>
      )}
    </div>
  ) : (
    <span className="text-sm text-gray-400 italic">
      {status === 'missing' ? t('noTranslation') : t('noPreview')}
    </span>
  )}
</div>
```

Note: If project has Tooltip component (shadcn/ui), use that instead of title attribute for better UX.

### Step 8: Implement Action Buttons Section
- **Description**: Render conditional action buttons based on status
- **Rationale**: Provide appropriate actions for each translation state
- **Estimated Effort**: 45 minutes

Action buttons section:
```typescript
<div className="shrink-0 flex items-center gap-2">
  {/* Edit Button */}
  {actionButtons.showEdit && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit?.();
      }}
      disabled={disabled}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md',
        'text-blue-600 hover:bg-blue-50 hover:text-blue-700',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
      )}
      aria-label={t('editTranslation', { language: languageName })}
    >
      {t('edit')}
    </button>
  )}

  {/* Re-translate Button */}
  {actionButtons.showRetranslate && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRetranslate?.();
      }}
      disabled={disabled}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md',
        'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500'
      )}
      aria-label={t('retranslate', { language: languageName })}
    >
      {t('retranslate')}
    </button>
  )}

  {/* Retry Button (failed only) */}
  {actionButtons.showRetry && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRetry?.();
      }}
      disabled={disabled}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md',
        'text-orange-600 hover:bg-orange-50 hover:text-orange-700',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500'
      )}
      aria-label={t('retryTranslation', { language: languageName })}
    >
      {t('retry')}
    </button>
  )}

  {/* Translate Button (missing only) */}
  {actionButtons.showTranslate && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onEdit?.(); // Translate uses same callback as Edit
      }}
      disabled={disabled}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md',
        'text-green-600 hover:bg-green-50 hover:text-green-700',
        'transition-colors duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500'
      )}
      aria-label={t('translateTo', { language: languageName })}
    >
      {t('translate')}
    </button>
  )}
</div>
```

### Step 9: Add Row Click Handler and Keyboard Navigation
- **Description**: Implement row click for preview and keyboard support
- **Rationale**: Enable preview functionality and accessible keyboard navigation
- **Estimated Effort**: 20 minutes

Row click handler (add to root div):
```typescript
onClick={() => {
  if (!disabled && onPreview) {
    onPreview();
  }
}}
onKeyDown={(e) => {
  if (!disabled && onPreview && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    onPreview();
  }
}}
tabIndex={!disabled && onPreview ? 0 : undefined}
```

ARIA attributes for accessibility:
```typescript
role="listitem"
aria-label={t('translationRow', {
  language: languageName,
  status: t(`status.${status}`)
})}
aria-disabled={disabled}
```

### Step 10: Add i18n Translation Keys
- **Description**: Document required translation keys for component
- **Rationale**: Ensure all UI text is translatable
- **Estimated Effort**: 15 minutes

Required translation keys in `/messages/en.json` under `translationManagement.statusItem`:
```json
{
  "translationManagement": {
    "statusItem": {
      "edit": "Edit",
      "retranslate": "Re-translate",
      "retry": "Retry",
      "translate": "Translate",
      "noTranslation": "No translation available",
      "noPreview": "No preview available",
      "updated": "Updated {time}",
      "selectLanguage": "Select {language}",
      "flagFor": "Flag for {language}",
      "editTranslation": "Edit {language} translation",
      "retranslate": "Re-translate {language}",
      "retryTranslation": "Retry {language} translation",
      "translateTo": "Translate to {language}",
      "translationRow": "{language} translation - {status}",
      "status": {
        "complete": "Complete",
        "pending": "Pending",
        "processing": "Processing",
        "failed": "Failed",
        "manual": "Manually edited",
        "stale": "Outdated",
        "missing": "Not translated"
      }
    }
  },
  "languages": {
    "en": "English",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "nl": "Dutch",
    "it": "Italian"
  }
}
```

### Step 11: Export from Barrel File
- **Description**: Add component export to TranslationPreviewPanel index file
- **Rationale**: Enable clean imports from parent directory
- **Estimated Effort**: 5 minutes

Update `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`:
```typescript
export { TranslationPreviewPanel } from './TranslationPreviewPanel';
export { TranslationStatusItem } from './TranslationStatusItem';
// Future exports: TranslationProgressBar, etc.
```

### Step 12: Manual Testing Checklist
- **Description**: Test component with various status combinations
- **Rationale**: Ensure all status variants and interactions work correctly
- **Estimated Effort**: 30 minutes

Test scenarios:
- [ ] 'complete' status shows Edit + Re-translate buttons
- [ ] 'failed' status shows Edit + Retry buttons
- [ ] 'manual' status shows Edit + Re-translate buttons with purple icon
- [ ] 'stale' status shows Edit + Re-translate buttons with warning icon
- [ ] 'pending' status shows no action buttons
- [ ] 'missing' status shows Translate button
- [ ] Checkbox appears when onSelectionChange is provided
- [ ] Row click triggers onPreview (when not clicking buttons/checkbox)
- [ ] Hover effect works correctly
- [ ] Disabled state grays out row and disables all interactions
- [ ] Preview text truncates at ~30 characters
- [ ] Tooltip shows full text when truncated
- [ ] All buttons trigger correct callbacks
- [ ] Keyboard navigation works (Tab to buttons, Enter/Space to activate)
- [ ] ARIA labels are present and descriptive

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create
| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | — | Create |

### Existing Files to Modify
| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Export statement | Modify - add TranslationStatusItem export |

### Existing Files to Reference (Read-Only)
| File | Purpose |
|------|------------|
| `/src/components/ItemManager/components/AssetPanel/AssetItem.tsx` | Pattern reference for row component structure |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Import TranslationStatusItemProps interface |
| `/src/lib/utils.ts` | Import `cn` utility |
| `/messages/en.json` | Add translation keys |

## Dependencies

### Depends On (Completed First)
- **REQ-E05-006**: TranslationManagement Types File
  - Provides: `TranslationStatusItemProps` interface
  - Provides: `DisplayTranslationStatus` type
  - Reason: Component props and types must be defined first
- **REQ-E05-007**: TranslationPreviewPanel Component
  - Provides: Parent component context
  - Provides: Barrel file for exports
  - Reason: StatusItem is child component used within panel
- **Existing**: lucide-react icon library installed
- **Existing**: next-intl configured for i18n
- **Existing**: Tailwind CSS configured

### Blocks (Requires This First)
- **REQ-E05-009**: TranslationProgressBar Component - sibling component in same panel
- **Integration**: TranslationPreviewPanel cannot render translation list without StatusItem component

### Parallel Safety
- **Files touched**:
  - `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` (new file)
  - `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` (export addition)
- **Conflicts with**:
  - REQ-E05-009 (TranslationProgressBar) - both modify same index.ts, but separate export lines (git merge safe)
- **Safe to parallelize with**:
  - All Epic 5 API endpoint tasks (different files)
  - REQ-E05-009 (TranslationProgressBar) - different component file
  - Epic 5 database/type tasks (different scope)

### External Dependencies
- React 18+ with hooks (useState, useMemo)
- Next.js 15.5.9 with App Router
- next-intl for i18n
- lucide-react for icons
- Tailwind CSS for styling
- TypeScript 5.x with strict mode

## Risks and Considerations

### Potential Side Effects
- **i18n keys missing**: If translation keys not added to all locale files, component shows fallback text
  - Mitigation: Document all required keys in this overview
  - Mitigation: Add keys to all supported locales (en, fr, es, de, nl, it)

- **Icon library version**: If lucide-react icons change API, component may break
  - Mitigation: Icons used are stable (Check, Clock, AlertCircle, etc.)
  - Mitigation: Lock lucide-react version in package.json

- **Tooltip component**: Using title attribute is less accessible than proper Tooltip component
  - Mitigation: Document need for proper Tooltip if available in project
  - Mitigation: Title attribute works as fallback

- **Status color consistency**: Must match TranslationProgressBar color scheme
  - Mitigation: Document exact colors in both component overviews
  - Mitigation: Consider extracting color constants to shared file

### Testing Requirements
- **Unit tests**:
  - Button visibility based on status (all 6 status types)
  - Callback invocation when buttons clicked
  - Disabled state prevents all interactions
  - Checkbox toggles selection state
  - Preview text truncation logic

- **Integration tests**:
  - Component renders within TranslationPreviewPanel
  - Row click triggers preview (when onPreview provided)
  - Keyboard navigation (Tab, Enter, Space) works correctly
  - i18n shows correct language names and status labels

- **Visual regression tests**:
  - All 6 status colors render correctly
  - Flag emojis display for all languages
  - Hover states work as expected
  - Disabled state visual appearance

- **Accessibility tests**:
  - ARIA labels are present and descriptive
  - Keyboard focus visible on all interactive elements
  - Screen reader announces row content correctly
  - Color contrast meets WCAG AA standards

### Open Questions
- [ ] Should row click trigger onPreview or toggle checkbox (when checkbox enabled)?
  - Recommendation: Row click triggers preview, checkbox is independent (matches file manager UX)
- [ ] Should we use native title tooltip or implement custom Tooltip component?
  - Recommendation: Use title for MVP, upgrade to custom Tooltip if available
- [ ] Should last updated timestamp be relative ("2 days ago") or absolute ("Jan 20, 2026")?
  - Recommendation: Relative for recent (< 7 days), absolute otherwise
- [ ] Should we show loading spinner in button during async operations?
  - Recommendation: No, parent component handles loading state via disabled prop
- [ ] Should flag emojis be configurable or hardcoded?
  - Recommendation: Hardcoded for now, extract to config if more languages added

## Out of Scope

The following are explicitly **not** included in this task:
- Implementing the actual preview panel modal/drawer (handled by REQ-E05-007)
- Implementing translation API calls (handled by API endpoint tasks)
- Creating progress bar component (separate task: REQ-E05-009)
- Bulk action functionality (parent component responsibility)
- Translation editor/form (separate component in Epic 5)
- Loading states for async operations (parent component responsibility)
- Error handling for API failures (parent component handles via status prop)
- Sorting or filtering translation rows (parent component responsibility)
- Expanding row to show detailed translation comparison
- Inline editing of translations (uses separate editor component)
- Diff view showing changes between translations
- Translation history/versioning UI
- Undo/redo functionality for edits
- Real-time collaboration indicators
- Translation quality score display
- Character count or length comparison
- Translation provider attribution

## Special Notes

### Component Composition Strategy

This component is designed as a **presentational/dumb component** following React best practices:
- Receives all data via props (no internal state for translation data)
- Emits events via callback props (no direct API calls)
- Parent component (TranslationPreviewPanel) handles:
  - Data fetching and state management
  - Loading and error states
  - API calls for edit/retranslate/retry actions
  - Bulk selection state coordination

This separation enables:
- Easy testing with mock props
- Reusability in different contexts
- Clear data flow and responsibility boundaries

### Status Color Consistency with Other Components

The status colors defined in this component MUST match:
- **TranslationProgressBar** (REQ-E05-009): Progress segments use same colors
- **Translation Status API** (REQ-E05-001): API response status values align with UI statuses
- **Database**: translation_status column values map to UI status types

**Color Reference (authoritative):**
- Complete: Green `#22c55e` (Tailwind: `green-500`)
- Pending/Stale: Orange `#f97316` (Tailwind: `orange-500`)
- Failed: Red `#ef4444` (Tailwind: `red-500`)
- Manual: Purple `#a855f7` (Tailwind: `purple-500`)
- Missing: Gray `#9ca3af` (Tailwind: `gray-400`)

### Flag Emoji Browser Compatibility

Flag emojis (🇺🇸, 🇫🇷, etc.) are composed of two Unicode Regional Indicator Symbols:
- Render correctly on modern browsers and mobile devices
- May show as country codes (e.g., "US", "FR") on older systems
- Windows 10+ supports color flag emojis
- Fallback to neutral flag 🏳️ if language code not recognized

If flag emoji support becomes an issue, consider:
- Using SVG flag icons from library (flagpack, flag-icons)
- Using language code badges (e.g., "FR", "ES")
- Adding configuration option to disable emoji flags

### Accessibility Best Practices

Following WCAG 2.1 Level AA standards:
1. **Color is not the only indicator**: Status icon shape differs (check vs clock vs X vs pencil)
2. **Keyboard navigation**: All interactive elements reachable via Tab, activatable via Enter/Space
3. **Focus indicators**: Custom focus-visible styles with ring for clarity
4. **Screen reader text**: ARIA labels describe action context ("Edit French translation")
5. **Touch targets**: Buttons sized appropriately for mobile (minimum 44x44px recommended)

### Performance Considerations

This component is designed for efficient rendering:
- Uses `useMemo` for computed values to avoid recalculation
- No expensive operations in render path
- Event handlers use `e.stopPropagation()` to prevent unnecessary parent re-renders
- Truncation happens once in useMemo, not on every render

Expected performance:
- Renders ~6 rows (5 target languages + English) per entity
- Fast enough for lists of 50+ entities without virtualization
- Consider react-window/virtualization if rendering 200+ rows simultaneously

### Integration with TranslationPreviewPanel

This component is consumed by TranslationPreviewPanel as a row within a list:
```tsx
// Inside TranslationPreviewPanel.tsx
{translations.map((translation) => (
  <TranslationStatusItem
    key={translation.language}
    language={translation.language}
    status={translation.status}
    previewText={translation.previewText}
    lastUpdated={translation.lastUpdated}
    isSelected={selectedLanguages.includes(translation.language)}
    onEdit={() => handleEdit(translation.language)}
    onRetranslate={() => handleRetranslate(translation.language)}
    onRetry={() => handleRetry(translation.language)}
    onPreview={() => handlePreview(translation.language)}
    onSelectionChange={(selected) => handleSelection(translation.language, selected)}
  />
))}
```

---
*Document generated: 2026-01-22 19:06*
