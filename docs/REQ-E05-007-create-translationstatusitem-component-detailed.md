# Detailed Task Breakdown: REQ-E05-007 - Create TranslationStatusItem Component

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-007
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.3
**Size:** S (Small)
**Priority:** P2 - Medium
**Predecessor:** REQ-E05-006 (TranslationManagement types file)

---

## Executive Summary

This document provides a step-by-step implementation guide for the `TranslationStatusItem` component - a reusable row component that displays a single language's translation status within the TranslationPreviewPanel. The component renders the language flag, name, colored status indicator, truncated preview text, and contextual action buttons.

---

## Prerequisites

Before starting implementation, ensure the following are in place:

| Prerequisite | Source | Verification |
|--------------|--------|--------------|
| TranslationStatus type | `/src/lib/translation-service/translation-service.types.ts` | `grep "TranslationStatus" src/lib/translation-service/translation-service.types.ts` |
| SupportedLanguage type | `/src/lib/translation-service/translation-service.types.ts` | `grep "SupportedLanguage" src/lib/translation-service/translation-service.types.ts` |
| getLanguageInfo utility | `/src/lib/translation-service/translation-service.types.ts` | `grep "getLanguageInfo" src/lib/translation-service/translation-service.types.ts` |
| cn utility | `/src/lib/utils.ts` | `grep "export function cn" src/lib/utils.ts` |
| TranslationPreviewPanel folder | `/src/components/TranslationManagement/TranslationPreviewPanel/` | Directory may need creation |
| Lucide React icons | `package.json` | `grep "lucide-react" package.json` |

---

## Task Breakdown

### Task 1: Create Directory Structure (if not exists)

**Objective:** Ensure the required directory structure exists for the TranslationManagement component family.

**Files to Create (directories):**
- `/src/components/TranslationManagement/` (if not exists)
- `/src/components/TranslationManagement/TranslationPreviewPanel/` (if not exists)

**Implementation Steps:**

1.1. Check if the TranslationManagement directory exists
```bash
ls -la src/components/TranslationManagement/
```

1.2. If not exists, create the directory structure:
```bash
mkdir -p src/components/TranslationManagement/TranslationPreviewPanel
```

**Acceptance Criteria:**
- [ ] Directory `/src/components/TranslationManagement/` exists
- [ ] Directory `/src/components/TranslationManagement/TranslationPreviewPanel/` exists

**Estimated Effort:** < 5 minutes

---

### Task 2: Create TranslationStatusItem.tsx Component File

**Objective:** Create the main component file with TypeScript interface, imports, and component structure.

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

**Implementation Steps:**

2.1. Create the file with the following structure:

```typescript
'use client';

/**
 * TranslationStatusItem Component
 *
 * A reusable row component that displays a single language's translation status
 * within the TranslationPreviewPanel. Shows flag, language name, status indicator,
 * preview text, and contextual action buttons.
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationStatusItem
 * @created 2026-01-20
 * @see REQ-E05-007
 */

import React from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  Pencil,
  RefreshCw,
  Eye,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type SupportedLanguage,
  type TranslationStatus,
  getLanguageInfo,
} from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the TranslationStatusItem component
 */
export interface TranslationStatusItemProps {
  /** ISO 639-1 language code (required) */
  language: SupportedLanguage;

  /** Current translation status (required) */
  status: TranslationStatus;

  /** Translated content text (optional - shows fallback if empty) */
  translatedText?: string;

  /** Whether this language is the source language */
  isSourceLanguage?: boolean;

  /** Callback for Edit action button */
  onEdit?: () => void;

  /** Callback for Re-translate action button */
  onRetranslate?: () => void;

  /** Callback for Retry action button (failed translations only) */
  onRetry?: () => void;

  /** Callback for View action button */
  onView?: () => void;

  /** Whether actions are disabled (during loading/processing) */
  actionsDisabled?: boolean;

  /** Additional CSS classes */
  className?: string;
}

// Component implementation to follow in subsequent tasks...
```

2.2. Add the status configuration mapping:

```typescript
// =============================================================================
// Constants
// =============================================================================

/**
 * Status configuration mapping for visual display
 * Maps TranslationStatus to icon, colors, and Tailwind classes
 */
const STATUS_CONFIG: Record<
  TranslationStatus,
  {
    icon: React.ElementType;
    label: string;
    bgClass: string;
    textClass: string;
    iconClass: string;
    animate?: boolean;
  }
> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    iconClass: 'text-amber-500',
    animate: false,
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    iconClass: 'text-blue-500',
    animate: true,
  },
  completed: {
    icon: Check,
    label: 'Completed',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    iconClass: 'text-green-500',
    animate: false,
  },
  failed: {
    icon: AlertCircle,
    label: 'Failed',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    iconClass: 'text-red-500',
    animate: false,
  },
  manual: {
    icon: Pencil,
    label: 'Manual',
    bgClass: 'bg-violet-100',
    textClass: 'text-violet-700',
    iconClass: 'text-violet-500',
    animate: false,
  },
};

/**
 * Maximum characters for preview text before truncation
 */
const MAX_PREVIEW_LENGTH = 80;
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] Props interface defined with all required and optional props
- [ ] JSDoc comments added for module and interface
- [ ] STATUS_CONFIG constant defined with all 5 statuses
- [ ] Proper TypeScript types imported from translation-service

**Estimated Effort:** 15 minutes

---

### Task 3: Implement Status Indicator Rendering

**Objective:** Create the status indicator section with proper icon, colors, and animations.

**Implementation Steps:**

3.1. Add helper function for status indicator:

```typescript
// =============================================================================
// Helper Components
// =============================================================================

/**
 * Renders the status indicator badge with icon and label
 */
function StatusIndicator({
  status,
  className,
}: {
  status: TranslationStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.bgClass,
        config.textClass,
        className
      )}
      role="status"
      aria-label={`Translation status: ${config.label}`}
    >
      <IconComponent
        className={cn(
          'w-3 h-3',
          config.iconClass,
          config.animate && 'animate-spin'
        )}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}
```

**Acceptance Criteria:**
- [ ] StatusIndicator renders correct icon per status
- [ ] Color classes match specification (green/orange/red/purple/blue)
- [ ] Spinning animation applied for 'processing' status
- [ ] ARIA role="status" and aria-label included
- [ ] Icon has aria-hidden="true"

**Estimated Effort:** 10 minutes

---

### Task 4: Implement Language Display Section

**Objective:** Implement the language flag emoji and name display section.

**Implementation Steps:**

4.1. Add helper function for language display:

```typescript
/**
 * Renders the language flag and name
 */
function LanguageDisplay({
  language,
  isSourceLanguage,
  className,
}: {
  language: SupportedLanguage;
  isSourceLanguage?: boolean;
  className?: string;
}) {
  const languageInfo = getLanguageInfo(language);

  // Graceful fallback for unknown language codes
  const flag = languageInfo?.flag ?? '';
  const name = languageInfo?.name ?? language.toUpperCase();

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
      <span className="text-lg flex-shrink-0" role="img" aria-label={`${name} flag`}>
        {flag}
      </span>
      <span className="font-medium text-gray-900 truncate">
        {name}
      </span>
      {isSourceLanguage && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
          Source
        </span>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Flag emoji displays from SUPPORTED_LANGUAGES constant
- [ ] Language name displays in medium font weight
- [ ] Unknown language codes fallback to uppercase code
- [ ] Source language badge displays when isSourceLanguage is true
- [ ] Flag has proper ARIA role="img" and label

**Estimated Effort:** 10 minutes

---

### Task 5: Implement Preview Text Truncation

**Objective:** Implement the preview text section with proper truncation and fallback messages.

**Implementation Steps:**

5.1. Add helper function for preview text:

```typescript
/**
 * Truncates text to specified length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
}

/**
 * Gets fallback message based on translation status
 */
function getPreviewFallback(status: TranslationStatus): string {
  switch (status) {
    case 'pending':
    case 'processing':
      return 'Translating...';
    case 'failed':
      return 'Translation failed. Click to retry.';
    case 'completed':
    case 'manual':
    default:
      return 'No translation available';
  }
}

/**
 * Renders the preview text section
 */
function PreviewText({
  text,
  status,
  className,
}: {
  text?: string;
  status: TranslationStatus;
  className?: string;
}) {
  const hasContent = text && text.trim().length > 0;
  const displayText = hasContent
    ? truncateText(text.trim(), MAX_PREVIEW_LENGTH)
    : getPreviewFallback(status);

  return (
    <p
      className={cn(
        'text-sm truncate',
        hasContent ? 'text-gray-600' : 'text-gray-400 italic',
        className
      )}
      title={hasContent ? text : undefined}
    >
      {displayText}
    </p>
  );
}
```

**Acceptance Criteria:**
- [ ] Text truncates at 80 characters with ellipsis
- [ ] Full text shows on hover (title attribute)
- [ ] Fallback "Translating..." for pending/processing
- [ ] Fallback "Translation failed..." for failed
- [ ] Fallback "No translation available" for empty completed/manual
- [ ] Placeholder text styled in gray and italic

**Estimated Effort:** 10 minutes

---

### Task 6: Implement Action Buttons Section

**Objective:** Implement the action buttons with proper enable/disable logic and hover reveal pattern.

**Implementation Steps:**

6.1. Add helper function for action buttons:

```typescript
/**
 * Props for individual action button
 */
interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

/**
 * Renders a single action button
 */
function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant = 'default',
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center',
        // Touch target: 44px on mobile, 32px on desktop
        'min-w-[44px] min-h-[44px] md:min-w-[32px] md:min-h-[32px]',
        'p-1.5 md:p-1',
        'rounded-md',
        'text-sm font-medium',
        'transition-colors',
        'touch-manipulation [-webkit-tap-highlight-color:transparent]',
        // Variant styles
        variant === 'default' && [
          'text-gray-600 hover:text-gray-900',
          'hover:bg-gray-100 active:bg-gray-200',
        ],
        variant === 'danger' && [
          'text-red-600 hover:text-red-700',
          'hover:bg-red-50 active:bg-red-100',
        ],
        // Focus styles
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        variant === 'default' && 'focus:ring-blue-500',
        variant === 'danger' && 'focus:ring-red-500',
        // Disabled styles
        (disabled || !onClick) && 'opacity-50 cursor-not-allowed pointer-events-none'
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}

/**
 * Determines which action buttons should be enabled based on status
 */
function getEnabledActions(status: TranslationStatus): {
  canEdit: boolean;
  canRetranslate: boolean;
  canRetry: boolean;
  canView: boolean;
} {
  return {
    canEdit: status === 'completed' || status === 'manual',
    canRetranslate: status === 'completed' || status === 'failed' || status === 'manual',
    canRetry: status === 'failed',
    canView: status === 'completed' || status === 'manual',
  };
}
```

6.2. Add ActionButtonGroup component:

```typescript
/**
 * Renders the group of action buttons for a translation row
 */
function ActionButtonGroup({
  status,
  onEdit,
  onRetranslate,
  onRetry,
  onView,
  disabled,
  className,
}: {
  status: TranslationStatus;
  onEdit?: () => void;
  onRetranslate?: () => void;
  onRetry?: () => void;
  onView?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const actions = getEnabledActions(status);

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        // Hidden by default, shown on hover/focus-within
        'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        'transition-opacity duration-150',
        className
      )}
    >
      {actions.canView && onView && (
        <ActionButton
          icon={Eye}
          label="View translation"
          onClick={onView}
          disabled={disabled}
        />
      )}
      {actions.canEdit && onEdit && (
        <ActionButton
          icon={Pencil}
          label="Edit translation"
          onClick={onEdit}
          disabled={disabled}
        />
      )}
      {actions.canRetry && onRetry && (
        <ActionButton
          icon={RefreshCw}
          label="Retry translation"
          onClick={onRetry}
          disabled={disabled}
          variant="danger"
        />
      )}
      {actions.canRetranslate && onRetranslate && (
        <ActionButton
          icon={RefreshCw}
          label="Re-translate"
          onClick={onRetranslate}
          disabled={disabled}
        />
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Edit button enabled for completed/manual status
- [ ] Re-translate button enabled for completed/failed/manual status
- [ ] Retry button enabled only for failed status
- [ ] All buttons have 44px touch target on mobile
- [ ] Buttons appear on row hover/focus (opacity transition)
- [ ] ARIA labels on all buttons
- [ ] Disabled state when actionsDisabled prop is true

**Estimated Effort:** 20 minutes

---

### Task 7: Implement Main Component

**Objective:** Assemble all helper components into the main TranslationStatusItem component.

**Implementation Steps:**

7.1. Add the main component implementation:

```typescript
// =============================================================================
// Main Component
// =============================================================================

/**
 * TranslationStatusItem displays a single language's translation status as a row.
 *
 * @example
 * ```tsx
 * <TranslationStatusItem
 *   language="fr"
 *   status="completed"
 *   translatedText="Comment utiliser le lave-vaisselle"
 *   onEdit={() => openEditor('fr')}
 *   onRetranslate={() => triggerRetranslate('fr')}
 * />
 * ```
 */
export function TranslationStatusItem({
  language,
  status,
  translatedText,
  isSourceLanguage = false,
  onEdit,
  onRetranslate,
  onRetry,
  onView,
  actionsDisabled = false,
  className,
}: TranslationStatusItemProps) {
  // Skip action buttons for source language
  const showActions = !isSourceLanguage;

  return (
    <div
      className={cn(
        // Base row styles
        'group relative',
        'flex items-center gap-3',
        'px-3 py-2.5',
        'rounded-lg',
        'transition-colors duration-150',
        // Hover/focus background
        'hover:bg-gray-50 focus-within:bg-gray-50',
        // Border for visual separation
        'border border-transparent hover:border-gray-200',
        className
      )}
      role="listitem"
      aria-label={`${getLanguageInfo(language)?.name ?? language} translation: ${STATUS_CONFIG[status].label}`}
    >
      {/* Language Flag and Name */}
      <LanguageDisplay
        language={language}
        isSourceLanguage={isSourceLanguage}
        className="flex-shrink-0 w-32 md:w-36"
      />

      {/* Status Indicator */}
      <StatusIndicator
        status={status}
        className="flex-shrink-0"
      />

      {/* Preview Text */}
      <PreviewText
        text={translatedText}
        status={status}
        className="flex-1 min-w-0"
      />

      {/* Action Buttons */}
      {showActions && (
        <ActionButtonGroup
          status={status}
          onEdit={onEdit}
          onRetranslate={onRetranslate}
          onRetry={onRetry}
          onView={onView}
          disabled={actionsDisabled}
          className="flex-shrink-0"
        />
      )}
    </div>
  );
}

export default TranslationStatusItem;
```

**Acceptance Criteria:**
- [ ] Component renders as single horizontal row with flex layout
- [ ] All sections properly aligned and spaced
- [ ] Row has hover/focus background change
- [ ] Source language rows don't show action buttons
- [ ] role="listitem" for semantic meaning
- [ ] ARIA label includes language name and status
- [ ] Component maintains consistent height regardless of content

**Estimated Effort:** 15 minutes

---

### Task 8: Add Accessibility Features

**Objective:** Ensure full accessibility compliance with keyboard navigation, screen reader support, and focus management.

**Implementation Steps:**

8.1. Review and enhance keyboard navigation:

```typescript
// Add keyboard handler to the row for additional navigation support
const handleKeyDown = (e: React.KeyboardEvent) => {
  // Allow Enter/Space to trigger primary action if available
  if (e.key === 'Enter' || e.key === ' ') {
    if (status === 'failed' && onRetry) {
      e.preventDefault();
      onRetry();
    } else if ((status === 'completed' || status === 'manual') && onView) {
      e.preventDefault();
      onView();
    }
  }
};
```

8.2. Add to the main component div:

```typescript
<div
  // ... existing props
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
```

8.3. Ensure focus indicators are visible:
- Action buttons already have `focus:ring-2` styles
- Row has `focus-within:bg-gray-50` for visual feedback

**Acceptance Criteria:**
- [ ] Tab navigates through the row and action buttons
- [ ] Enter/Space activates primary action on row focus
- [ ] All action buttons activatable via Enter/Space
- [ ] Focus visible indicators present on all interactive elements
- [ ] Screen reader announces language, status correctly
- [ ] Color contrast meets WCAG 2.1 AA standards

**Estimated Effort:** 10 minutes

---

### Task 9: Create Index Export File

**Objective:** Create the barrel export file for the TranslationPreviewPanel folder.

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

**Implementation Steps:**

9.1. Create the index.ts file:

```typescript
/**
 * TranslationPreviewPanel Component Exports
 *
 * @module TranslationManagement/TranslationPreviewPanel
 * @created 2026-01-20
 */

export { TranslationStatusItem } from './TranslationStatusItem';
export type { TranslationStatusItemProps } from './TranslationStatusItem';

// Future exports (as components are added):
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export type { TranslationPreviewPanelProps } from './TranslationPreviewPanel';
// export { TranslationProgressBar } from './TranslationProgressBar';
// export type { TranslationProgressBarProps } from './TranslationProgressBar';
```

**Acceptance Criteria:**
- [ ] index.ts created in TranslationPreviewPanel folder
- [ ] TranslationStatusItem component exported
- [ ] TranslationStatusItemProps type exported
- [ ] No circular dependencies

**Estimated Effort:** 5 minutes

---

### Task 10: Update TranslationManagement Root Index (if exists)

**Objective:** Ensure TranslationStatusItem is accessible from the TranslationManagement root.

**File:** `/src/components/TranslationManagement/index.ts`

**Implementation Steps:**

10.1. Create or update the root index.ts:

```typescript
/**
 * TranslationManagement Component Family Exports
 *
 * @module TranslationManagement
 * @created 2026-01-20
 */

// TranslationPreviewPanel components
export {
  TranslationStatusItem,
  type TranslationStatusItemProps,
} from './TranslationPreviewPanel';

// Future exports (as components are added):
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// export { TranslationEditor } from './TranslationEditor';
// export { TranslationStatusWidget } from './TranslationStatusWidget';
```

**Acceptance Criteria:**
- [ ] Root index.ts exists in TranslationManagement folder
- [ ] Re-exports TranslationStatusItem from TranslationPreviewPanel
- [ ] Types properly re-exported

**Estimated Effort:** 5 minutes

---

## Complete File: TranslationStatusItem.tsx

For reference, here is the complete assembled component file:

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

```typescript
'use client';

/**
 * TranslationStatusItem Component
 *
 * A reusable row component that displays a single language's translation status
 * within the TranslationPreviewPanel. Shows flag, language name, status indicator,
 * preview text, and contextual action buttons.
 *
 * @module TranslationManagement/TranslationPreviewPanel/TranslationStatusItem
 * @created 2026-01-20
 * @lastModified 2026-01-20
 * @see REQ-E05-007
 */

import React from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  Pencil,
  RefreshCw,
  Eye,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type SupportedLanguage,
  type TranslationStatus,
  getLanguageInfo,
} from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Props for the TranslationStatusItem component
 */
export interface TranslationStatusItemProps {
  /** ISO 639-1 language code (required) */
  language: SupportedLanguage;

  /** Current translation status (required) */
  status: TranslationStatus;

  /** Translated content text (optional - shows fallback if empty) */
  translatedText?: string;

  /** Whether this language is the source language */
  isSourceLanguage?: boolean;

  /** Callback for Edit action button */
  onEdit?: () => void;

  /** Callback for Re-translate action button */
  onRetranslate?: () => void;

  /** Callback for Retry action button (failed translations only) */
  onRetry?: () => void;

  /** Callback for View action button */
  onView?: () => void;

  /** Whether actions are disabled (during loading/processing) */
  actionsDisabled?: boolean;

  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Status configuration mapping for visual display
 */
const STATUS_CONFIG: Record<
  TranslationStatus,
  {
    icon: React.ElementType;
    label: string;
    bgClass: string;
    textClass: string;
    iconClass: string;
    animate?: boolean;
  }
> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    iconClass: 'text-amber-500',
    animate: false,
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
    iconClass: 'text-blue-500',
    animate: true,
  },
  completed: {
    icon: Check,
    label: 'Completed',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    iconClass: 'text-green-500',
    animate: false,
  },
  failed: {
    icon: AlertCircle,
    label: 'Failed',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    iconClass: 'text-red-500',
    animate: false,
  },
  manual: {
    icon: Pencil,
    label: 'Manual',
    bgClass: 'bg-violet-100',
    textClass: 'text-violet-700',
    iconClass: 'text-violet-500',
    animate: false,
  },
};

const MAX_PREVIEW_LENGTH = 80;

// =============================================================================
// Helper Functions
// =============================================================================

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
}

function getPreviewFallback(status: TranslationStatus): string {
  switch (status) {
    case 'pending':
    case 'processing':
      return 'Translating...';
    case 'failed':
      return 'Translation failed. Click to retry.';
    case 'completed':
    case 'manual':
    default:
      return 'No translation available';
  }
}

function getEnabledActions(status: TranslationStatus) {
  return {
    canEdit: status === 'completed' || status === 'manual',
    canRetranslate: status === 'completed' || status === 'failed' || status === 'manual',
    canRetry: status === 'failed',
    canView: status === 'completed' || status === 'manual',
  };
}

// =============================================================================
// Helper Components
// =============================================================================

function StatusIndicator({
  status,
  className,
}: {
  status: TranslationStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        config.bgClass,
        config.textClass,
        className
      )}
      role="status"
      aria-label={`Translation status: ${config.label}`}
    >
      <IconComponent
        className={cn(
          'w-3 h-3',
          config.iconClass,
          config.animate && 'animate-spin'
        )}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}

function LanguageDisplay({
  language,
  isSourceLanguage,
  className,
}: {
  language: SupportedLanguage;
  isSourceLanguage?: boolean;
  className?: string;
}) {
  const languageInfo = getLanguageInfo(language);
  const flag = languageInfo?.flag ?? '';
  const name = languageInfo?.name ?? language.toUpperCase();

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
      <span className="text-lg flex-shrink-0" role="img" aria-label={`${name} flag`}>
        {flag}
      </span>
      <span className="font-medium text-gray-900 truncate">
        {name}
      </span>
      {isSourceLanguage && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
          Source
        </span>
      )}
    </div>
  );
}

function PreviewText({
  text,
  status,
  className,
}: {
  text?: string;
  status: TranslationStatus;
  className?: string;
}) {
  const hasContent = text && text.trim().length > 0;
  const displayText = hasContent
    ? truncateText(text.trim(), MAX_PREVIEW_LENGTH)
    : getPreviewFallback(status);

  return (
    <p
      className={cn(
        'text-sm truncate',
        hasContent ? 'text-gray-600' : 'text-gray-400 italic',
        className
      )}
      title={hasContent ? text : undefined}
    >
      {displayText}
    </p>
  );
}

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant = 'default',
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[44px] min-h-[44px] md:min-w-[32px] md:min-h-[32px]',
        'p-1.5 md:p-1',
        'rounded-md',
        'text-sm font-medium',
        'transition-colors',
        'touch-manipulation [-webkit-tap-highlight-color:transparent]',
        variant === 'default' && [
          'text-gray-600 hover:text-gray-900',
          'hover:bg-gray-100 active:bg-gray-200',
        ],
        variant === 'danger' && [
          'text-red-600 hover:text-red-700',
          'hover:bg-red-50 active:bg-red-100',
        ],
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        variant === 'default' && 'focus:ring-blue-500',
        variant === 'danger' && 'focus:ring-red-500',
        (disabled || !onClick) && 'opacity-50 cursor-not-allowed pointer-events-none'
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}

function ActionButtonGroup({
  status,
  onEdit,
  onRetranslate,
  onRetry,
  onView,
  disabled,
  className,
}: {
  status: TranslationStatus;
  onEdit?: () => void;
  onRetranslate?: () => void;
  onRetry?: () => void;
  onView?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const actions = getEnabledActions(status);

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        'transition-opacity duration-150',
        className
      )}
    >
      {actions.canView && onView && (
        <ActionButton
          icon={Eye}
          label="View translation"
          onClick={onView}
          disabled={disabled}
        />
      )}
      {actions.canEdit && onEdit && (
        <ActionButton
          icon={Pencil}
          label="Edit translation"
          onClick={onEdit}
          disabled={disabled}
        />
      )}
      {actions.canRetry && onRetry && (
        <ActionButton
          icon={RefreshCw}
          label="Retry translation"
          onClick={onRetry}
          disabled={disabled}
          variant="danger"
        />
      )}
      {actions.canRetranslate && onRetranslate && (
        <ActionButton
          icon={RefreshCw}
          label="Re-translate"
          onClick={onRetranslate}
          disabled={disabled}
        />
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function TranslationStatusItem({
  language,
  status,
  translatedText,
  isSourceLanguage = false,
  onEdit,
  onRetranslate,
  onRetry,
  onView,
  actionsDisabled = false,
  className,
}: TranslationStatusItemProps) {
  const showActions = !isSourceLanguage;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (status === 'failed' && onRetry) {
        e.preventDefault();
        onRetry();
      } else if ((status === 'completed' || status === 'manual') && onView) {
        e.preventDefault();
        onView();
      }
    }
  };

  return (
    <div
      className={cn(
        'group relative',
        'flex items-center gap-3',
        'px-3 py-2.5',
        'rounded-lg',
        'transition-colors duration-150',
        'hover:bg-gray-50 focus-within:bg-gray-50',
        'border border-transparent hover:border-gray-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        className
      )}
      role="listitem"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${getLanguageInfo(language)?.name ?? language} translation: ${STATUS_CONFIG[status].label}`}
    >
      <LanguageDisplay
        language={language}
        isSourceLanguage={isSourceLanguage}
        className="flex-shrink-0 w-32 md:w-36"
      />

      <StatusIndicator
        status={status}
        className="flex-shrink-0"
      />

      <PreviewText
        text={translatedText}
        status={status}
        className="flex-1 min-w-0"
      />

      {showActions && (
        <ActionButtonGroup
          status={status}
          onEdit={onEdit}
          onRetranslate={onRetranslate}
          onRetry={onRetry}
          onView={onView}
          disabled={actionsDisabled}
          className="flex-shrink-0"
        />
      )}
    </div>
  );
}

export default TranslationStatusItem;
```

---

## Testing Checklist

### Unit Tests to Write

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationStatusItem.test.tsx`

| Test Case | Description |
|-----------|-------------|
| Renders for each status | Renders correctly for pending, processing, completed, failed, manual |
| Displays correct flag | Shows correct flag emoji for each supported language |
| Truncates long text | Text > 80 chars is truncated with ellipsis |
| Shows fallback text | Shows appropriate fallback when translatedText is empty |
| Action button enable logic | Edit enabled for completed/manual, Retry enabled for failed only |
| Callback invocation | Action buttons call correct callbacks when clicked |
| Unknown language fallback | Handles unknown language codes gracefully |
| Source language display | Shows "Source" badge when isSourceLanguage is true |
| Disabled actions | Action buttons disabled when actionsDisabled is true |

### Accessibility Tests

| Test Case | Description |
|-----------|-------------|
| Keyboard navigation | Tab navigates through component |
| Button activation | Enter/Space activates action buttons |
| Screen reader | Announces language and status correctly |
| Focus indicators | Focus ring visible on interactive elements |
| Color contrast | Status colors meet WCAG 2.1 AA |

### Visual Tests

| Test Case | Description |
|-----------|-------------|
| Status colors | Green, orange, red, purple, blue match spec |
| Responsive layout | Works on mobile (stacked) and desktop (row) |
| Hover states | Buttons appear on hover, row background changes |
| Processing animation | Loader2 icon spins for processing status |

---

## Verification Commands

After implementation, run these commands to verify:

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check for import errors
npx eslint src/components/TranslationManagement/

# Verify file structure
ls -la src/components/TranslationManagement/TranslationPreviewPanel/

# Run tests (when written)
npm test -- --testPathPattern="TranslationStatusItem"
```

---

## Usage Example

```tsx
// In TranslationPreviewPanel.tsx
import { SUPPORTED_LANGUAGES } from '@/lib/translation-service/translation-service.types';
import { TranslationStatusItem } from './TranslationStatusItem';

function TranslationList({ translations, sourceLanguage, onEdit, onRetranslate, onRetry }) {
  return (
    <div className="space-y-2" role="list" aria-label="Translation status by language">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <TranslationStatusItem
          key={lang.code}
          language={lang.code}
          status={translations[lang.code]?.status ?? 'pending'}
          translatedText={translations[lang.code]?.content?.title}
          isSourceLanguage={lang.code === sourceLanguage}
          onEdit={() => onEdit(lang.code)}
          onRetranslate={() => onRetranslate(lang.code)}
          onRetry={() => onRetry(lang.code)}
        />
      ))}
    </div>
  );
}
```

---

## References

- **Overview Document:** `/docs/REQ-E05-007-create-translationstatusitem-component-overview.md`
- **Request:** `/docs/gen_requests_epic5.md` (REQ-E05-008)
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **TagChip Pattern:** `/src/components/ItemManager/components/shared/TagChip.tsx`
- **EngagementIndicator Pattern:** `/src/components/ItemManager/components/shared/EngagementIndicator.tsx`

---

*Document generated for FAQBNB L10N Epic 5 - Task 2.3: TranslationStatusItem Component*
*Last Modified: 2026-01-20*
