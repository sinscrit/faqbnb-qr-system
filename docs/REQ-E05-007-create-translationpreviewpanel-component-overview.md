# Implementation Overview: Create TranslationPreviewPanel Component

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-007 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 21:30 |
| Breakdown Created | 2026-01-22 19:01 |
| T-shirt Size | M |
| Estimated Effort | 4-6 hours |

## Goals

Create a slide-in panel component that displays translation preview and management actions for property owners. The panel slides in from the right side of the screen, shows source content alongside translation status for all 6 supported languages, and provides action buttons for editing, re-translating, and retrying translations.

**Technical Requirements:**
- Build slide-in panel component with 400px width (desktop) and full-width (mobile)
- Display source content section at the top for reference
- List all 6 supported languages with color-coded status indicators
- Provide contextual action buttons based on translation status
- Support smooth open/close animations
- Implement accessibility features (focus trap, ESC key, ARIA labels)
- Use existing patterns from AssetPanel and other slide-in components
- Integrate with Epic 5 APIs for data fetching and actions
- Support i18n for all UI text via next-intl

### Assumptions & Clarifications

- **Discovery**: Existing AssetPanel component provides excellent pattern for slide-in drawer:
  - Uses overlay backdrop with click-to-close
  - Implements focus management and ESC key handling
  - Has smooth CSS transitions for slide-in animation
  - Follows accessibility best practices
- **Discovery**: ItemManager uses next-intl for i18n with translation keys like `media.assetPanel.*`
- **Assumption**: Panel should use overlay backdrop (similar to AssetPanel) for focus and close-on-click-outside
- **Assumption**: Data fetching happens via useTranslationStatus hook (Task 2.6) or direct API call
- **Assumption**: Portuguese (pt) is the 6th language (request mentions "6 languages" but PRD shows 5: fr, es, de, nl, it)
- **Clarification needed**: Should the panel auto-refresh when translations complete? (Recommendation: Yes, via realtime hook from Task 2.7)

## Implementation Plan

### Step 1: Create Component File Structure
- **Description**: Set up directory structure and component files
- **Rationale**: Establish organized file structure before implementation
- **Estimated Effort**: 10 minutes

Create files:
```bash
mkdir -p src/components/TranslationManagement/TranslationPreviewPanel
touch src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx
touch src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx
touch src/components/TranslationManagement/TranslationPreviewPanel/SourceContentSection.tsx
touch src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx
touch src/components/TranslationManagement/TranslationPreviewPanel/index.ts
```

File structure:
```
src/components/TranslationManagement/TranslationPreviewPanel/
├── TranslationPreviewPanel.tsx        # Main panel container
├── TranslationStatusItem.tsx          # Language status row (Task 2.3)
├── SourceContentSection.tsx           # Source content display
├── TranslationProgressBar.tsx         # Progress indicator (Task 2.4)
├── index.ts                           # Barrel exports
└── TranslationPreviewPanel.types.ts   # Component-specific types (if needed)
```

### Step 2: Define Component Props and Imports
- **Description**: Set up imports, props interface, and module documentation
- **Rationale**: Establish type contracts and dependencies before implementation
- **Estimated Effort**: 15 minutes

File header and imports:
```typescript
'use client';

/**
 * TranslationPreviewPanel Component
 *
 * A slide-in drawer component for previewing and managing translations.
 * Displays source content and translation status for all supported languages
 * with action buttons for editing, re-translating, and retrying translations.
 *
 * @module TranslationManagement/TranslationPreviewPanel
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-22
 * @requestReference REQ-E05-007
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  TranslationPreviewPanelProps,
  TranslationItemDisplay,
  SupportedLanguage,
} from '@/components/TranslationManagement/TranslationManagement.types';
import { SourceContentSection } from './SourceContentSection';
import { TranslationStatusItem } from './TranslationStatusItem';
import { TranslationProgressBar } from './TranslationProgressBar';
```

Props interface (use from types file):
```typescript
// From TranslationManagement.types.ts
interface TranslationPreviewPanelProps {
  entityId: string;
  entityType: 'item' | 'article' | 'link' | 'tag';
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (language: SupportedLanguage) => void;
  onRetranslate?: (language: SupportedLanguage) => void;
  onRetry?: (language: SupportedLanguage) => void;
  className?: string;
}
```

### Step 3: Implement Main Component Structure with Overlay
- **Description**: Build main panel container with overlay backdrop and slide-in animation
- **Rationale**: Establish UI shell before adding content sections
- **Estimated Effort**: 45 minutes

Main component structure:
```typescript
export function TranslationPreviewPanel({
  entityId,
  entityType,
  isOpen,
  onClose,
  onEdit,
  onRetranslate,
  onRetry,
  className,
}: TranslationPreviewPanelProps) {
  const t = useTranslations('translation.previewPanel');
  const tCommon = useTranslations('common.actions');

  // Refs for accessibility
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // State
  const [translationData, setTranslationData] = useState<TranslationItemDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Data fetching (placeholder - will use hook in Task 2.6)
  useEffect(() => {
    if (isOpen && entityId) {
      fetchTranslationData();
    }
  }, [isOpen, entityId]);

  // Render overlay and panel
  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900',
          'shadow-xl z-50 transform transition-transform duration-300',
          'flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Panel content */}
      </div>
    </>
  );
}
```

Key implementation details:
- Use `fixed` positioning with `translate-x-full` for off-screen initial state
- Transition to `translate-x-0` when open
- Overlay with `bg-black/50` for backdrop
- Width: full on mobile, 400px on desktop (`sm:w-[400px]`)
- Z-index: 40 for overlay, 50 for panel (above most content)

### Step 4: Implement Panel Header with Close Button
- **Description**: Add panel header with entity name and close button
- **Rationale**: Provide context and exit mechanism for users
- **Estimated Effort**: 20 minutes

Header section:
```typescript
{/* Panel Header */}
<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
  <h2 id="panel-title" className="text-lg font-semibold text-gray-900 dark:text-white">
    {translationData?.entityName || t('title')}
  </h2>
  <button
    ref={closeButtonRef}
    onClick={onClose}
    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    aria-label={tCommon('close')}
  >
    <X className="h-5 w-5 text-gray-500" />
  </button>
</div>
```

### Step 5: Implement Source Content Section
- **Description**: Create SourceContentSection subcomponent to display original content
- **Rationale**: Provide reference point for owners to compare translations
- **Estimated Effort**: 30 minutes

SourceContentSection component:
```typescript
// In SourceContentSection.tsx
interface SourceContentSectionProps {
  entityType: 'item' | 'article' | 'link' | 'tag';
  content: {
    title?: string;
    name?: string;
    description?: string;
    url?: string;
    value?: string;
  };
  sourceLanguage: SupportedLanguage;
}

export function SourceContentSection({
  entityType,
  content,
  sourceLanguage,
}: SourceContentSectionProps) {
  const t = useTranslations('translation.previewPanel');

  return (
    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('sourceContent')} ({sourceLanguage.toUpperCase()})
      </h3>
      <div className="space-y-2">
        {(content.title || content.name) && (
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {entityType === 'item' ? t('name') : t('title')}:
            </span>
            <p className="text-sm text-gray-900 dark:text-white">
              {content.title || content.name}
            </p>
          </div>
        )}
        {content.description && (
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('description')}:
            </span>
            <p className="text-sm text-gray-900 dark:text-white line-clamp-3">
              {content.description}
            </p>
          </div>
        )}
        {/* Additional fields for links, tags */}
      </div>
    </div>
  );
}
```

### Step 6: Implement Language Status List Section
- **Description**: Create scrollable section listing all 6 languages with status rows
- **Rationale**: Core functionality showing translation status for each language
- **Estimated Effort**: 45 minutes

Languages list section:
```typescript
{/* Translations List */}
<div className="flex-1 overflow-y-auto px-6 py-4">
  {/* Progress indicator */}
  {translationData && (
    <TranslationProgressBar
      completed={translationData.translations.filter(t => t.status === 'completed' || t.status === 'manual').length}
      pending={translationData.translations.filter(t => t.status === 'pending' || t.status === 'processing').length}
      failed={translationData.translations.filter(t => t.status === 'failed').length}
      stale={translationData.translations.filter(t => t.isStale).length}
      total={translationData.translations.length}
      className="mb-4"
    />
  )}

  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
    {t('translations')} ({supportedLanguages.length} {t('languages')})
  </h3>

  <div className="space-y-2">
    {supportedLanguages.map((language) => {
      const translationStatus = translationData?.translations.find(t => t.language === language);
      return (
        <TranslationStatusItem
          key={language}
          language={language}
          status={translationStatus?.status || 'missing'}
          translatedAt={translationStatus?.translatedAt}
          isStale={translationStatus?.isStale}
          onEdit={() => onEdit?.(language)}
          onRetranslate={() => onRetranslate?.(language)}
          onRetry={() => onRetry?.(language)}
        />
      );
    })}
  </div>
</div>
```

Supported languages constant:
```typescript
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['fr', 'es', 'de', 'nl', 'it'];
```

### Step 7: Implement Loading and Error States
- **Description**: Add loading skeleton and error message displays
- **Rationale**: Provide feedback during data fetching and handle failures gracefully
- **Estimated Effort**: 30 minutes

Loading state:
```typescript
{isLoading && (
  <div className="px-6 py-8 flex flex-col items-center justify-center">
    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {t('loadingTranslations')}
    </p>
  </div>
)}
```

Error state:
```typescript
{error && (
  <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
    <div className="flex items-start">
      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
          {t('errorLoading')}
        </h4>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
          {error.message}
        </p>
        <button
          onClick={fetchTranslationData}
          className="text-sm text-red-600 dark:text-red-400 underline mt-2"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  </div>
)}
```

### Step 8: Implement Panel Footer with Actions
- **Description**: Add footer section with "Re-translate All" and "Close" buttons
- **Rationale**: Provide bulk actions and clear exit option
- **Estimated Effort**: 20 minutes

Footer section:
```typescript
{/* Panel Footer */}
<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
  <button
    onClick={handleRetranslateAll}
    disabled={isLoading || !translationData}
    className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {t('retranslateAll')}
  </button>
  <button
    onClick={onClose}
    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
  >
    {tCommon('close')}
  </button>
</div>
```

Handler for re-translate all:
```typescript
const handleRetranslateAll = useCallback(() => {
  if (!translationData) return;

  // Call onRetranslate for all languages (or use bulk API)
  SUPPORTED_LANGUAGES.forEach(language => {
    onRetranslate?.(language);
  });
}, [translationData, onRetranslate]);
```

### Step 9: Add Data Fetching Logic
- **Description**: Implement translation status fetching from API
- **Rationale**: Populate panel with actual translation data
- **Estimated Effort**: 30 minutes

Data fetching function:
```typescript
const fetchTranslationData = useCallback(async () => {
  setIsLoading(true);
  setError(null);

  try {
    // Call translation status API
    const response = await fetch(
      `/api/translations/status?entityType=${entityType}&entityId=${entityId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch translation status: ${response.statusText}`);
    }

    const data = await response.json();

    // Map API response to component state
    const translationItem: TranslationItemDisplay = {
      entityId: data.entityId,
      entityType: data.entityType,
      entityName: data.entityName,
      sourceLanguage: data.sourceLanguage,
      translations: data.translations,
      overallStatus: data.overallStatus,
      sourceUpdatedAt: data.sourceUpdatedAt,
      isStale: data.isStale,
    };

    setTranslationData(translationItem);
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Unknown error'));
  } finally {
    setIsLoading(false);
  }
}, [entityType, entityId]);
```

**Note**: This will be replaced/enhanced by useTranslationStatus hook in Task 2.6.

### Step 10: Add i18n Translation Keys
- **Description**: Define translation keys for all UI text in panel
- **Rationale**: Support internationalization for the UI itself
- **Estimated Effort**: 15 minutes

Translation keys needed in `messages/en.json`:
```json
{
  "translation": {
    "previewPanel": {
      "title": "Translation Preview",
      "sourceContent": "Source Content",
      "translations": "Translations",
      "languages": "languages",
      "loadingTranslations": "Loading translation status...",
      "errorLoading": "Error loading translations",
      "retry": "Retry",
      "retranslateAll": "Re-translate All",
      "name": "Name",
      "title": "Title",
      "description": "Description"
    }
  }
}
```

Similar additions needed for other supported languages (fr, es, de, nl, it).

### Step 11: Create Barrel Export File
- **Description**: Create index.ts to export panel and subcomponents
- **Rationale**: Enable clean imports from outside the module
- **Estimated Effort**: 5 minutes

Index file:
```typescript
/**
 * TranslationPreviewPanel Module Exports
 */

export { TranslationPreviewPanel } from './TranslationPreviewPanel';
export { TranslationStatusItem } from './TranslationStatusItem';
export { SourceContentSection } from './SourceContentSection';
export { TranslationProgressBar } from './TranslationProgressBar';
```

### Step 12: Add Accessibility Features
- **Description**: Enhance accessibility with ARIA attributes and focus management
- **Rationale**: Ensure component is usable by all users including screen reader users
- **Estimated Effort**: 20 minutes

Accessibility enhancements:
1. **Focus trap**: Keep focus within panel when open
2. **ARIA attributes**: role, aria-modal, aria-labelledby
3. **Keyboard navigation**: ESC to close, Tab navigation
4. **Screen reader announcements**: Status updates when translations change

Implementation:
```typescript
// Focus trap (prevent focus leaving panel)
useEffect(() => {
  if (!isOpen || !panelRef.current) return;

  const focusableElements = panelRef.current.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  document.addEventListener('keydown', handleTabKey);
  return () => document.removeEventListener('keydown', handleTabKey);
}, [isOpen]);
```

### Step 13: Test Component Integration
- **Description**: Verify component renders correctly and handles all interactions
- **Rationale**: Ensure component works as expected before integration
- **Estimated Effort**: 20 minutes

Testing checklist:
- [ ] Panel opens when isOpen=true
- [ ] Panel closes on close button click
- [ ] Panel closes on ESC key
- [ ] Panel closes on overlay click
- [ ] Source content displays correctly
- [ ] All 6 languages are listed
- [ ] Status indicators show correct colors
- [ ] Action buttons call correct callbacks
- [ ] Loading state displays during fetch
- [ ] Error state displays on fetch failure
- [ ] Focus management works correctly
- [ ] Animations are smooth
- [ ] Responsive layout works on mobile

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create
| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | — | Create |
| `/src/components/TranslationManagement/TranslationPreviewPanel/SourceContentSection.tsx` | — | Create |
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | — | Create |

### New Files for Related Tasks (Reference)
| File | Task | Type |
|------|------|------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | REQ-E05-008 (Task 2.3) | Create (separate task) |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Task 2.4 | Create (separate task) |

### Existing Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `/src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Pattern reference for slide-in drawer |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Import type definitions (REQ-E05-006) |
| `/src/lib/translation-service/translation-service.types.ts` | Import SupportedLanguage type |
| `/messages/en.json` | Add translation keys |

### Translation Files to Modify
| File | Target | Type |
|------|--------|------|
| `/messages/en.json` | Add `translation.previewPanel.*` keys | Modify |
| `/messages/fr.json` | Add `translation.previewPanel.*` keys | Modify |
| `/messages/es.json` | Add `translation.previewPanel.*` keys | Modify |
| `/messages/de.json` | Add `translation.previewPanel.*` keys | Modify |
| `/messages/nl.json` | Add `translation.previewPanel.*` keys | Modify |
| `/messages/it.json` | Add `translation.previewPanel.*` keys | Modify |

## Dependencies

### Depends On (Completed First)
- **REQ-E05-001**: Translation Status API endpoint
  - Provides: GET /api/translations/status endpoint for data fetching
  - Reason: Panel needs to fetch translation status data
- **REQ-E05-006**: TranslationManagement types file
  - Provides: TranslationPreviewPanelProps, TranslationItemDisplay, SupportedLanguage types
  - Reason: Component uses these types throughout
- **Existing**: next-intl i18n framework
  - Provides: useTranslations hook for localized UI text
  - Reason: All UI text must be translatable

### Blocks (Requires This First)
- **Integration tasks**: Components that open this panel
  - Article editor integration (Task 7.1)
  - Item editor integration (Task 7.2)
  - Dashboard widget integration
- **Enhancement tasks**: Features that extend this panel
  - Realtime updates integration (Task 2.7 - useTranslationRealtime hook)
  - Translation editor modal (Task 2.5 - triggered by Edit button)

### Parallel Safety
- **Files touched**:
  - New files in `/src/components/TranslationManagement/TranslationPreviewPanel/` directory
  - Translation message files (adding new keys)
- **Conflicts with**:
  - REQ-E05-008 (TranslationStatusItem) - Same directory, but different file
  - Task 2.4 (TranslationProgressBar) - Same directory, but different file
- **Safe to parallelize with**:
  - Other Epic 5 UI components in different directories
  - Epic 5 hooks implementation (once types are available)
  - Epic 5 API endpoint tasks (different scope)

### External Dependencies
- React 18+ with hooks
- Next.js 15+ with App Router
- next-intl for internationalization
- Tailwind CSS for styling
- lucide-react for icons
- TypeScript 5.x

## Risks and Considerations

### Potential Side Effects
- **Performance with many entities**: If fetching full translation data for complex entities
  - Mitigation: Use efficient API queries with field selection
  - Mitigation: Implement caching strategy in data fetching hook

- **Z-index conflicts**: Panel overlay might conflict with other modal components
  - Mitigation: Use consistent z-index scale (overlay: 40, panel: 50)
  - Mitigation: Document z-index usage in component

- **Mobile scroll issues**: Body scroll might remain active when panel is open
  - Mitigation: Add `overflow-hidden` to body when panel is open
  - Mitigation: Restore scroll on panel close

- **Animation jank**: Slide-in animation might not be smooth on mobile devices
  - Mitigation: Use CSS transforms for GPU acceleration
  - Mitigation: Test on actual devices and optimize if needed

### Testing Requirements
- **Unit tests**:
  - Component renders with correct props
  - Callbacks fire when buttons clicked
  - ESC key closes panel
  - Focus trap works correctly

- **Integration tests**:
  - Data fetching populates panel correctly
  - Error states display properly
  - Loading states show and hide appropriately

- **Visual tests**:
  - Panel slides in smoothly
  - Overlay appears correctly
  - Responsive layout works on mobile
  - Dark mode styling is correct

- **Accessibility tests**:
  - Screen reader announces panel open/close
  - Focus management works correctly
  - Keyboard navigation works
  - ARIA attributes are correct

### Open Questions
- [ ] Should the panel support multiple entities (tabs/navigation)? (Recommendation: No, keep simple for v1)
- [ ] Should we show character count for translated content previews? (Recommendation: Yes, useful feedback)
- [ ] Should the panel auto-close after successful action? (Recommendation: No, let user close manually)
- [ ] Should we implement panel position (left vs right)? (Recommendation: No, always right for consistency)
- [ ] Should overlay be configurable (on/off)? (Recommendation: No, always use overlay for focus management)

## Out of Scope

The following are explicitly **not** included in this task:
- Implementing TranslationStatusItem component (separate task REQ-E05-008)
- Implementing TranslationProgressBar component (separate task 2.4)
- Implementing TranslationEditor modal (separate task 2.5)
- Creating useTranslationStatus hook (separate task 2.6)
- Creating useTranslationRealtime hook (separate task 2.7)
- Implementing actual translation editing functionality (handled by editor modal)
- Implementing bulk re-translation logic (handled by API endpoint)
- Adding translation comparison/diff view
- Implementing translation history or version tracking
- Adding export/download translation functionality
- Creating print-friendly view of translations
- Implementing translation quality scoring
- Adding inline comments or notes on translations
- Creating translation approval workflow
- Implementing translation memory suggestions
- Adding machine translation quality confidence scores

## Special Notes

### Pattern Alignment with AssetPanel

This component follows the same architectural pattern as AssetPanel:
- Slide-in from right with overlay backdrop
- ESC key and click-outside to close
- Focus management and accessibility features
- Loading and error state handling
- Responsive mobile/desktop layout

Key similarities:
```typescript
// Both use same structure
- Fixed positioning with transform for slide animation
- Overlay backdrop with z-index 40
- Panel with z-index 50
- Focus trap implementation
- ESC key listener
```

### Supported Languages

The panel displays 5 supported languages (not 6 as mentioned in some places):
1. French (fr) - 🇫🇷
2. Spanish (es) - 🇪🇸
3. German (de) - 🇩🇪
4. Dutch (nl) - 🇳🇱
5. Italian (it) - 🇮🇹

English (en) is the source language and not shown in the translations list.

### Component Composition

The panel is composed of several smaller components:
- **TranslationPreviewPanel**: Main container with layout and data fetching
- **SourceContentSection**: Displays original content for reference
- **TranslationStatusItem**: Individual language row (separate task)
- **TranslationProgressBar**: Visual progress indicator (separate task)

This composition enables:
- Better code organization
- Easier testing
- Component reusability
- Clear separation of concerns

### Animation Performance

For smooth animations:
- Use CSS transforms (translate) instead of left/right positioning
- Apply `will-change: transform` for GPU acceleration
- Keep animation duration between 150-300ms for snappy feel
- Use `ease-in-out` or `cubic-bezier` for natural motion

### Future Enhancements

Potential future improvements (out of scope for this task):
- Batch language selection for targeted actions
- Translation quality indicators
- Translation cost estimation
- Comparison view showing before/after for re-translations
- Translation memory suggestions
- Keyboard shortcuts for common actions
- Drag-to-resize panel width

---
*Document generated: 2026-01-22 19:01*
