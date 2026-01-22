# Implementation Overview: Add Accessibility Features

## Header
| Field | Value |
|-------|-------|
| Request Reference | #032 (REQ-E05-032) |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 |
| Breakdown Created | 2026-01-22 20:49 |
| T-shirt Size | M (Medium) |
| Estimated Effort | 12-16 hours |
| Phase | Phase 7 (Integration & Polish), Task 7.4 |
| Status | PENDING |

## Request Overview

### Original Request Summary
Translation management components need comprehensive accessibility features including ARIA labels for status icons, keyboard navigation in preview panels, screen reader announcements for status changes, and proper focus management in modals. These enhancements will ensure all translation management features are fully accessible to users with disabilities, including those using screen readers, keyboard-only navigation, and other assistive technologies.

### Why This Matters
Currently, translation management components may lack proper accessibility features that prevent users with disabilities from effectively managing translations. Status icons without ARIA labels leave screen reader users unaware of translation status. Preview panels without keyboard navigation force keyboard-only users to rely on mouse interaction. Status changes without announcements leave users uncertain about operation outcomes. Modals without proper focus management cause keyboard focus issues. These accessibility gaps create barriers that exclude users with disabilities and may violate WCAG 2.1 Level AA compliance requirements.

By implementing comprehensive accessibility features, all users—regardless of ability or assistive technology—can effectively use translation management features with equal independence and efficiency.

### Expected User Impact
Users with disabilities will experience:
- **Screen Reader Users**: Clear announcements of all status changes, descriptive labels for all icons and controls
- **Keyboard-Only Users**: Full keyboard navigation support, visible focus indicators, logical tab order
- **Mobility-Impaired Users**: Large touch targets, no precision-dependent interactions
- **Cognitive Disability Users**: Clear, consistent labeling and predictable interaction patterns
- **All Users**: Better overall usability through improved focus management and keyboard shortcuts

---

## Goals

### Primary Objective
Implement comprehensive accessibility features across all translation management components to achieve WCAG 2.1 Level AA compliance and ensure equal access for users with disabilities.

### Functional Requirements
1. **ARIA Labels**: Add descriptive aria-label attributes to all status icons, badges, and icon-only buttons
2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible with logical tab order
3. **Screen Reader Announcements**: Implement ARIA live regions for status change announcements
4. **Focus Management**: Properly manage focus in modals (trap focus, return focus, first element focus)
5. **Focus Indicators**: Ensure all focusable elements have visible focus indicators
6. **Semantic HTML**: Use proper semantic HTML roles (region, list, listitem, etc.)
7. **Internationalization**: Ensure all ARIA labels are translated in all 6 supported locales

### Success Metrics
- All status icons and badges have descriptive aria-label attributes
- All interactive elements are keyboard accessible (no mouse-only interactions)
- Tab order follows logical reading order throughout all components
- Focus indicators are visible on all focusable elements (2px outline minimum)
- ARIA live regions announce all critical status changes to screen readers
- Modals properly trap focus and return focus to trigger element on close
- ESC key closes all modals and panels appropriately
- WCAG 2.1 Level AA automated testing passes (axe-core, WAVE)
- Manual screen reader testing (NVDA, JAWS, VoiceOver) confirms usability

### Assumptions & Clarifications
- Translation management components (REQ-E05-007 through REQ-E05-012) are complete
- Radix UI primitives already provide base accessibility features for dialogs
- Focus indicators follow existing codebase patterns (2px outline with outline-offset)
- Keyboard shortcuts are optional enhancements (not required for base accessibility)
- ARIA live regions use "polite" for non-critical updates, "assertive" for errors
- Focus trap should allow ESC key to close modal (don't trap escape)
- Existing BottomSheet component demonstrates proper focus management pattern

---

## Implementation Plan

### Step 1: Create TranslationStatusAnnouncer Component

**Objective**: Create a reusable ARIA live region component for announcing status changes to screen readers.

**File**: `/src/components/TranslationManagement/TranslationStatusAnnouncer.tsx` (create new)

**Implementation**:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface TranslationStatusAnnouncerProps {
  /** Current translation status */
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'manual';
  /** Language being translated */
  language?: string;
  /** Custom announcement message (overrides status-based message) */
  message?: string;
  /** Politeness level for announcement */
  politeness?: 'polite' | 'assertive';
}

/**
 * Invisible component that announces status changes to screen readers
 * via ARIA live regions.
 *
 * Usage:
 * <TranslationStatusAnnouncer
 *   status="completed"
 *   language="French"
 *   politeness="polite"
 * />
 */
export function TranslationStatusAnnouncer({
  status,
  language,
  message,
  politeness = 'polite',
}: TranslationStatusAnnouncerProps) {
  const t = useTranslations('translationManagement.announcements');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
    } else if (status && language) {
      // Generate announcement based on status
      const announcements = {
        pending: t('pending', { language }),
        in_progress: t('inProgress', { language }),
        completed: t('completed', { language }),
        failed: t('failed', { language }),
        manual: t('manual', { language }),
      };
      setAnnouncement(announcements[status] || '');
    }
  }, [status, language, message, t]);

  // Don't render anything if no announcement
  if (!announcement) return null;

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
```

**Rationale**: ARIA live regions are the standard way to announce dynamic content changes to screen readers. Separating this into a component makes it reusable across all translation components. Using sr-only ensures it's invisible but accessible.

**Estimated Effort**: 2 hours

---

### Step 2: Add ARIA Labels to TranslationStatusBadge

**Objective**: Add descriptive aria-label attributes to all status badges and icons.

**File**: `/src/components/TranslationManagement/TranslationStatusBadge.tsx`

**Implementation**:

```typescript
import { CheckCircle2, Clock, Loader2, XCircle, Edit3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';

interface TranslationStatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'manual';
  language?: string;
  showIcon?: boolean;
}

export function TranslationStatusBadge({
  status,
  language,
  showIcon = true,
}: TranslationStatusBadgeProps) {
  const t = useTranslations('translationManagement.status');

  const config = {
    pending: {
      icon: Clock,
      variant: 'secondary' as const,
      label: t('pending'),
      ariaLabel: language ? t('ariaLabels.pending', { language }) : t('pending'),
    },
    in_progress: {
      icon: Loader2,
      variant: 'default' as const,
      label: t('inProgress'),
      ariaLabel: language ? t('ariaLabels.inProgress', { language }) : t('inProgress'),
    },
    completed: {
      icon: CheckCircle2,
      variant: 'success' as const,
      label: t('completed'),
      ariaLabel: language ? t('ariaLabels.completed', { language }) : t('completed'),
    },
    failed: {
      icon: XCircle,
      variant: 'destructive' as const,
      label: t('failed'),
      ariaLabel: language ? t('ariaLabels.failed', { language }) : t('failed'),
    },
    manual: {
      icon: Edit3,
      variant: 'outline' as const,
      label: t('manual'),
      ariaLabel: language ? t('ariaLabels.manual', { language }) : t('manual'),
    },
  }[status];

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className="gap-1.5"
      aria-label={config.ariaLabel}
    >
      {showIcon && (
        <Icon
          className={cn(
            'w-3 h-3',
            status === 'in_progress' && 'animate-spin'
          )}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </Badge>
  );
}
```

**Rationale**: Status badges are visual indicators that need text alternatives for screen readers. Using contextual language names ("French translation pending") provides better context than generic labels ("Pending"). Setting aria-hidden="true" on icons prevents double-announcement.

**Estimated Effort**: 2 hours

---

### Step 3: Add Keyboard Navigation to TranslationPreviewPanel

**Objective**: Enhance preview panel with keyboard navigation, logical tab order, and optional keyboard shortcuts.

**File**: `/src/components/TranslationManagement/TranslationPreviewPanel.tsx`

**Implementation**:

```typescript
import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function TranslationPreviewPanel({
  entityId,
  entityType,
  isOpen,
  onClose,
}: TranslationPreviewPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('translationManagement.preview');

  // Focus panel when opened
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcuts (optional enhancement)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if focus is within panel
      if (!panelRef.current?.contains(document.activeElement)) return;

      // 'r' key refreshes status (no modifiers)
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleRefresh();
      }

      // ESC key closes panel
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      ref={panelRef}
      className="translation-preview-panel"
      role="region"
      aria-label={t('ariaLabels.panel', { entity: entityType })}
      aria-describedby="panel-description"
      tabIndex={-1}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 id="preview-panel-title" className="text-lg font-semibold">
          {t('title')}
        </h3>

        <div className="flex gap-2">
          {/* Refresh button with aria-label */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            aria-label={t('actions.ariaLabels.refresh')}
            title={t('actions.keyboardHint.refresh')} // Tooltip: "Press 'r' to refresh"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </Button>

          {/* Close button with aria-label */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label={t('actions.ariaLabels.close')}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Panel description for screen readers */}
      <p id="panel-description" className="sr-only">
        {t('description')}
      </p>

      {/* Status list with semantic HTML */}
      <div
        role="list"
        aria-labelledby="preview-panel-title"
        className="space-y-2"
      >
        {languages.map((lang) => (
          <div
            key={lang.code}
            role="listitem"
            className="flex items-center justify-between p-3 border rounded-lg focus-within:ring-2 focus-within:ring-ring"
          >
            {/* Language info */}
            <div className="flex items-center gap-3">
              <span className="font-medium">{lang.name}</span>
              <TranslationStatusBadge
                status={statuses[lang.code]}
                language={lang.name}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {/* Retry button for failed translations */}
              {statuses[lang.code] === 'failed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRetry(lang.code)}
                  aria-label={t('actions.ariaLabels.retry', { language: lang.name })}
                  disabled={isRetrying}
                >
                  <RefreshCw
                    className={cn(
                      'w-4 h-4 mr-2',
                      isRetrying && 'animate-spin'
                    )}
                    aria-hidden="true"
                  />
                  {t('actions.retry')}
                </Button>
              )}

              {/* Edit button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(lang.code)}
                aria-label={t('actions.ariaLabels.edit', {
                  language: lang.name,
                  entity: entityType,
                })}
              >
                <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('actions.edit')}
              </Button>

              {/* Re-translate button */}
              <Button
                variant="default"
                size="sm"
                onClick={() => handleRetranslate(lang.code)}
                aria-label={t('actions.ariaLabels.retranslate', { language: lang.name })}
                disabled={isRetranslating}
              >
                <Languages className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('actions.retranslate')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Status announcer for screen readers */}
      <TranslationStatusAnnouncer
        status={currentStatus}
        language={currentLanguage}
        politeness={currentStatus === 'failed' ? 'assertive' : 'polite'}
      />

      {/* Keyboard shortcuts help (screen reader only) */}
      <div className="sr-only" role="note" aria-label={t('keyboardShortcuts.label')}>
        {t('keyboardShortcuts.description')}
      </div>
    </div>
  );
}
```

**Rationale**: Semantic HTML (role="region", role="list", role="listitem") helps screen readers understand structure. Keyboard shortcuts provide efficiency for power users. Focus management ensures keyboard users can access panel immediately. aria-describedby provides context for screen readers.

**Estimated Effort**: 3-4 hours

---

### Step 4: Add Focus Management to TranslationEditForm Modal

**Objective**: Implement proper focus management when edit form opens as modal.

**File**: `/src/components/TranslationManagement/TranslationEditForm.tsx`

**Implementation**:

```typescript
import { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

export function TranslationEditForm({
  entityType,
  entityId,
  language,
  isOpen,
  onClose,
  onSave,
}: TranslationEditFormProps) {
  const t = useTranslations('translationManagement.editForm');
  const firstInputRef = useRef<HTMLInputElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Store trigger element when modal opens
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element (the button that opened the modal)
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Return focus to trigger element when modal closes
  const handleClose = () => {
    onClose();

    // Return focus to the element that opened the modal
    setTimeout(() => {
      triggerElementRef.current?.focus();
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        aria-labelledby="edit-form-title"
        aria-describedby="edit-form-description"
        onEscapeKeyDown={handleClose}
        onPointerDownOutside={(e) => {
          // Optional: prevent close on outside click if form is dirty
          if (isDirty) {
            e.preventDefault();
            // Show confirmation dialog
          }
        }}
      >
        <DialogHeader>
          <DialogTitle id="edit-form-title">
            {t('title', { language, entity: entityType })}
          </DialogTitle>
        </DialogHeader>

        <p id="edit-form-description" className="sr-only">
          {t('description', { language, entity: entityType })}
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Title field - receives focus on open */}
          <div>
            <label htmlFor="translation-title" className="block text-sm font-medium mb-2">
              {t('fields.title')}
              <span className="sr-only">
                {t('fields.ariaLabels.title', { language })}
              </span>
            </label>
            <input
              ref={firstInputRef}
              id="translation-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isSaving}
              required
              aria-required="true"
              aria-invalid={errors.title ? 'true' : 'false'}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            {errors.title && (
              <p id="title-error" role="alert" className="text-sm text-destructive mt-1">
                {errors.title}
              </p>
            )}
          </div>

          {/* Content field */}
          <div>
            <label htmlFor="translation-content" className="block text-sm font-medium mb-2">
              {t('fields.content')}
              <span className="sr-only">
                {t('fields.ariaLabels.content', { language })}
              </span>
            </label>
            <textarea
              id="translation-content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              disabled={isSaving}
              rows={6}
              required
              aria-required="true"
              aria-invalid={errors.content ? 'true' : 'false'}
              aria-describedby={errors.content ? 'content-error' : undefined}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
            />
            {errors.content && (
              <p id="content-error" role="alert" className="text-sm text-destructive mt-1">
                {errors.content}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              {t('actions.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              aria-label={t('actions.ariaLabels.save', { language })}
            >
              {isSaving && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
              )}
              {isSaving ? t('actions.saving') : t('actions.save')}
            </Button>
          </div>
        </form>

        {/* Status announcer for save operations */}
        <TranslationStatusAnnouncer
          message={saveStatus}
          politeness={saveError ? 'assertive' : 'polite'}
        />
      </DialogContent>
    </Dialog>
  );
}
```

**Rationale**: Radix UI Dialog already provides focus trap and ESC key handling. We add: (1) focus first input on open, (2) return focus to trigger on close, (3) proper ARIA attributes (aria-labelledby, aria-describedby), (4) form field validation announcements, (5) status announcements for save operations.

**Estimated Effort**: 3-4 hours

---

### Step 5: Add Accessibility to TranslationStatusTable

**Objective**: Add ARIA labels to action buttons and ensure keyboard navigation in table.

**File**: `/src/components/TranslationManagement/TranslationStatusTable.tsx`

**Implementation**:

```typescript
import { useTranslations } from 'next-intl';

export function TranslationStatusTable({ items }: TranslationStatusTableProps) {
  const t = useTranslations('translationManagement.statusTable');

  return (
    <div role="region" aria-labelledby="status-table-title">
      <h3 id="status-table-title" className="text-lg font-semibold mb-4">
        {t('title')}
      </h3>

      <table
        className="w-full border-collapse"
        role="table"
        aria-describedby="status-table-description"
      >
        <caption id="status-table-description" className="sr-only">
          {t('description')}
        </caption>

        <thead>
          <tr>
            <th scope="col" className="text-left p-3 border-b">
              {t('columns.item')}
            </th>
            <th scope="col" className="text-left p-3 border-b">
              {t('columns.languages')}
            </th>
            <th scope="col" className="text-left p-3 border-b">
              {t('columns.status')}
            </th>
            <th scope="col" className="text-right p-3 border-b">
              <span className="sr-only">{t('columns.actions')}</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-muted/50">
              <th scope="row" className="p-3 font-medium">
                {item.name}
              </th>

              <td className="p-3">
                <div className="flex gap-2">
                  {item.languages.map((lang) => (
                    <TranslationStatusBadge
                      key={lang.code}
                      status={lang.status}
                      language={lang.name}
                    />
                  ))}
                </div>
              </td>

              <td className="p-3">
                <span className="sr-only">
                  {t('status.summary', {
                    completed: item.completedCount,
                    total: item.totalCount,
                  })}
                </span>
                <span aria-hidden="true">
                  {item.completedCount} / {item.totalCount}
                </span>
              </td>

              <td className="p-3 text-right">
                <div className="flex justify-end gap-2">
                  {/* View translations button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(item.id)}
                    aria-label={t('actions.ariaLabels.view', { item: item.name })}
                  >
                    <Eye className="w-4 h-4 mr-2" aria-hidden="true" />
                    {t('actions.view')}
                  </Button>

                  {/* Re-translate all button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetranslateAll(item.id)}
                    aria-label={t('actions.ariaLabels.retranslateAll', { item: item.name })}
                    disabled={isRetranslating}
                  >
                    <Languages className="w-4 h-4 mr-2" aria-hidden="true" />
                    {t('actions.retranslateAll')}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state with proper semantics */}
      {items.length === 0 && (
        <div
          role="status"
          aria-live="polite"
          className="text-center py-8 text-muted-foreground"
        >
          {t('emptyState')}
        </div>
      )}

      {/* Status announcer for bulk operations */}
      <TranslationStatusAnnouncer
        message={bulkOperationStatus}
        politeness="polite"
      />
    </div>
  );
}
```

**Rationale**: Semantic table markup (th scope="col", th scope="row") helps screen readers navigate tables. Descriptive aria-labels on action buttons provide context. Screen reader text supplements visual status counts.

**Estimated Effort**: 2-3 hours

---

### Step 6: Add Translation Keys for Accessibility Labels

**Objective**: Add all ARIA labels, descriptions, and announcements to translation files for all 6 locales.

**Files**: `/messages/en.json`, `/messages/es.json`, `/messages/fr.json`, `/messages/de.json`, `/messages/it.json`, `/messages/nl.json`

**Implementation**:

**English (`/messages/en.json`)**:
```json
{
  "translationManagement": {
    "status": {
      "ariaLabels": {
        "pending": "Translation pending for {language}",
        "inProgress": "Translation in progress for {language}",
        "completed": "Translation completed for {language}",
        "failed": "Translation failed for {language}",
        "manual": "Manually edited translation for {language}"
      }
    },
    "preview": {
      "ariaLabels": {
        "panel": "Translation preview panel for {entity}",
        "close": "Close translation preview",
        "refresh": "Refresh translation status"
      },
      "description": "Preview and manage translations for all languages",
      "keyboardShortcuts": {
        "label": "Keyboard shortcuts",
        "description": "Press R to refresh status, Escape to close panel"
      }
    },
    "editForm": {
      "ariaLabels": {
        "title": "Edit {language} translation title",
        "content": "Edit {language} translation content"
      },
      "description": "Edit translation content for {language} {entity}",
      "fields": {
        "ariaLabels": {
          "title": "Translation title in {language}",
          "content": "Translation content in {language}",
          "save": "Save {language} translation"
        }
      }
    },
    "actions": {
      "ariaLabels": {
        "retry": "Retry failed translation for {language}",
        "retranslate": "Re-translate content for {language}",
        "edit": "Edit {language} translation for {entity}",
        "view": "View translations for {item}",
        "retranslateAll": "Re-translate all languages for {item}",
        "refresh": "Refresh translation status",
        "close": "Close"
      },
      "keyboardHint": {
        "refresh": "Press 'r' to refresh"
      }
    },
    "statusTable": {
      "ariaLabels": {
        "table": "Translation status table",
        "view": "View translations for {item}",
        "retranslateAll": "Re-translate all languages for {item}"
      },
      "description": "Table showing translation status for all items",
      "status": {
        "summary": "{completed} of {total} translations completed"
      }
    },
    "announcements": {
      "pending": "Translation for {language} is pending",
      "inProgress": "Translation for {language} is in progress",
      "completed": "Translation for {language} has been completed",
      "failed": "Translation for {language} has failed",
      "manual": "Translation for {language} has been manually edited"
    }
  }
}
```

Add equivalent translations for Spanish, French, German, Italian, and Dutch locales following the same structure.

**Rationale**: Comprehensive translation coverage ensures all ARIA labels work in all supported languages. Using interpolation ({language}, {entity}, {item}) provides context-specific labels.

**Estimated Effort**: 2-3 hours

---

### Step 7: Add Focus Indicators and CSS

**Objective**: Ensure all focusable elements have visible focus indicators that meet WCAG 2.1 contrast requirements.

**File**: `/src/styles/accessibility.css` (create new) or update Tailwind config

**Implementation**:

```css
/* Custom focus styles for translation management components */

/* Base focus style for all interactive elements in translation management */
.translation-preview-panel button:focus-visible,
.translation-preview-panel a:focus-visible,
.translation-edit-form input:focus-visible,
.translation-edit-form textarea:focus-visible,
.translation-edit-form button:focus-visible,
.translation-status-table button:focus-visible,
.translation-language-selector button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 4px;
}

/* High contrast focus for status badges */
.translation-status-badge:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  box-shadow: 0 0 0 4px hsl(var(--background));
}

/* Focus within styles for container elements */
.translation-preview-panel [role="listitem"]:focus-within {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 8px;
}

/* Remove default outline for mouse users, preserve for keyboard users */
.translation-preview-panel *:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .translation-preview-panel button:focus-visible,
  .translation-edit-form input:focus-visible,
  .translation-edit-form textarea:focus-visible {
    outline-width: 3px;
    outline-color: currentColor;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .translation-status-badge [aria-hidden="true"].animate-spin {
    animation: none;
  }
}
```

**Rationale**: Visible focus indicators are required by WCAG 2.1 (Success Criterion 2.4.7). Using :focus-visible ensures indicators only show for keyboard navigation, not mouse clicks. High contrast mode support improves accessibility for visually impaired users.

**Estimated Effort**: 1-2 hours

---

### Step 8: Add TranslationLanguageSelector Accessibility

**Objective**: Ensure language selector buttons have proper ARIA labels and keyboard navigation.

**File**: `/src/components/TranslationManagement/TranslationLanguageSelector.tsx`

**Implementation**:

```typescript
import { useTranslations } from 'next-intl';
import { localeMetadata } from '@/lib/i18n/config';

export function TranslationLanguageSelector({
  selectedLanguage,
  onSelect,
  availableLanguages,
}: TranslationLanguageSelectorProps) {
  const t = useTranslations('translationManagement.languageSelector');

  return (
    <div
      role="group"
      aria-labelledby="language-selector-label"
      className="space-y-2"
    >
      <h4 id="language-selector-label" className="text-sm font-medium">
        {t('label')}
      </h4>

      <p id="language-selector-description" className="text-sm text-muted-foreground">
        {t('description')}
      </p>

      <div
        role="radiogroup"
        aria-labelledby="language-selector-label"
        aria-describedby="language-selector-description"
        className="grid grid-cols-3 gap-2"
      >
        {availableLanguages.map((langCode) => {
          const lang = localeMetadata[langCode];
          const isSelected = selectedLanguage === langCode;
          const isDisabled = !lang.available;

          return (
            <button
              key={langCode}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              aria-label={t('ariaLabels.languageOption', {
                language: lang.name,
                status: isSelected ? t('selected') : t('notSelected'),
              })}
              onClick={() => !isDisabled && onSelect(langCode)}
              disabled={isDisabled}
              className={cn(
                'p-3 border rounded-lg transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected && 'border-primary bg-primary/10',
                !isSelected && !isDisabled && 'hover:bg-muted',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {lang.flag}
                </span>
                <div className="text-left">
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {lang.nativeName}
                  </div>
                </div>
              </div>

              {/* Selection indicator for screen readers */}
              {isSelected && (
                <span className="sr-only">{t('selectedIndicator')}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected language announcement */}
      {selectedLanguage && (
        <div role="status" aria-live="polite" className="sr-only">
          {t('announcements.selected', {
            language: localeMetadata[selectedLanguage].name,
          })}
        </div>
      )}
    </div>
  );
}
```

**Rationale**: Using role="radiogroup" and role="radio" with aria-checked provides semantic meaning for screen readers. aria-label provides context for each option. ARIA live region announces selection changes.

**Estimated Effort**: 2 hours

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Accessibility Components

| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/TranslationStatusAnnouncer.tsx` | — | Create |
| `/src/styles/accessibility.css` | — | Create |

### Component Accessibility Enhancements

| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/TranslationStatusBadge.tsx` | Add ARIA labels | Modify |
| `/src/components/TranslationManagement/TranslationPreviewPanel.tsx` | Add keyboard nav, ARIA | Modify |
| `/src/components/TranslationManagement/TranslationEditForm.tsx` | Add focus management | Modify |
| `/src/components/TranslationManagement/TranslationStatusTable.tsx` | Add table semantics, ARIA | Modify |
| `/src/components/TranslationManagement/TranslationLanguageSelector.tsx` | Add radiogroup semantics | Modify |

### Translation Keys - All Locales

| File | Target | Type |
|------|--------|------|
| `/messages/en.json` | `translationManagement` namespace | Extend |
| `/messages/es.json` | `translationManagement` namespace | Extend |
| `/messages/fr.json` | `translationManagement` namespace | Extend |
| `/messages/de.json` | `translationManagement` namespace | Extend |
| `/messages/it.json` | `translationManagement` namespace | Extend |
| `/messages/nl.json` | `translationManagement` namespace | Extend |

### Layout Integration

| File | Target | Type |
|------|--------|------|
| `/src/app/dashboard2/layout.tsx` | Import accessibility.css | Modify |

### Files That Must NOT Be Modified

- Translation API routes - Backend logic is out of scope
- Database schema - No schema changes required
- Radix UI primitives - Already provide base accessibility
- AuthContext - No authentication changes needed
- Any components outside TranslationManagement namespace

---

## Dependencies

### Depends On (Must Be Completed First)
- **REQ-E05-007** (Task 5.1): TranslationPreviewPanel Component - Component must exist before adding accessibility
- **REQ-E05-008** (Task 5.2): TranslationEditForm Component - Component must exist before adding focus management
- **REQ-E05-009** (Task 5.3): TranslationStatusTable Component - Component must exist before adding table semantics
- **REQ-E05-010** (Task 5.4): TranslationLanguageSelector Component - Component must exist before adding radiogroup semantics
- **REQ-E05-030** (Task 7.3): Add Loading States and Error Handling - Loading indicators need ARIA attributes

### Blocks (Tasks That Require This First)
- None - This is a polish/enhancement task that doesn't block other features
- All translation management features benefit from accessibility but don't depend on it

### Parallel Safety
- **Files Touched**:
  - New file: `/src/components/TranslationManagement/TranslationStatusAnnouncer.tsx`
  - New file: `/src/styles/accessibility.css`
  - Modified: 5 TranslationManagement components
  - Modified: All 6 locale JSON files
  - Modified: `/src/app/dashboard2/layout.tsx`
- **Conflicts With**:
  - Any task modifying the same TranslationManagement components
  - Any task modifying dashboard2 layout
  - Any task adding translations to the same namespaces
- **Safe to Parallelize With**:
  - Backend API tasks (no file overlap)
  - Other UI pages (items editor, articles editor, settings)

### External Dependencies
- `@radix-ui/react-dialog` - Already provides base modal accessibility (focus trap, ESC key)
- `lucide-react` - Icons already support aria-hidden attribute
- `next-intl` - Already supports translation interpolation for ARIA labels
- Radix UI primitives - Already provide base WCAG 2.1 compliance

---

## Risks and Considerations

### Potential Side Effects

- **Focus Management Interference**: Custom focus management may interfere with Radix UI's built-in focus handling
- **Screen Reader Verbosity**: Too many ARIA labels/announcements may overwhelm screen reader users
- **Keyboard Shortcut Conflicts**: Custom keyboard shortcuts may conflict with browser/screen reader shortcuts
- **CSS Specificity Issues**: Custom focus styles may be overridden by global styles or utility classes
- **Translation Completeness**: Missing translations in any locale will cause ARIA labels to fall back to English

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Components not yet implemented | HIGH | HIGH | This task MUST wait for REQ-E05-007 through REQ-E05-010 completion |
| Radix UI Dialog focus conflicts | MEDIUM | MEDIUM | Test thoroughly, leverage Radix's built-in focus management, don't override |
| ARIA live region over-announcement | MEDIUM | MEDIUM | Use "polite" for non-critical updates, limit announcement frequency |
| Focus indicator visibility issues | LOW | MEDIUM | Test with multiple themes, ensure 3:1 contrast ratio minimum |
| Keyboard shortcut conflicts | LOW | LOW | Document shortcuts, avoid common browser shortcuts (Ctrl+R, etc.) |
| Screen reader compatibility | MEDIUM | HIGH | Test with NVDA, JAWS, VoiceOver; follow ARIA Authoring Practices Guide |

### User Experience Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Focus indicators too prominent | LOW | LOW | Use :focus-visible to show only for keyboard users |
| ARIA labels too verbose | MEDIUM | MEDIUM | Keep labels concise, context-specific, test with screen readers |
| Keyboard shortcuts confusing | LOW | LOW | Provide help text, use common conventions (R for refresh, ESC for close) |
| Tab order illogical | MEDIUM | HIGH | Follow visual reading order, test keyboard navigation |

### Testing Requirements

- **Automated Testing**:
  - Run axe-core accessibility audit on all translation components
  - Run WAVE browser extension to check for issues
  - Validate ARIA attributes with eslint-plugin-jsx-a11y
  - Check color contrast ratios (4.5:1 for text, 3:1 for UI components)

- **Manual Testing**:
  - **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)
  - **Keyboard Navigation**: Test all interactions with Tab, Shift+Tab, Enter, Space, Escape
  - **Focus Indicators**: Verify visible focus on all interactive elements
  - **ARIA Live Regions**: Verify announcements for all status changes
  - **Modal Focus**: Verify focus trap, return focus, first element focus
  - **High Contrast Mode**: Test in Windows High Contrast Mode
  - **Zoom**: Test at 200% zoom level (WCAG requirement)

---

## Open Questions

### Design Decisions Needed

- [ ] **Keyboard Shortcut Scope**: Should keyboard shortcuts be global (work anywhere) or scoped to specific components?
  - **Recommendation**: Scoped to components (only work when focus is within component)
- [ ] **ARIA Live Region Politeness**: Should translation completion use "polite" or "assertive"?
  - **Recommendation**: "polite" for completion, "assertive" for errors
- [ ] **Focus Indicator Style**: Should focus indicators match brand colors or use standard browser defaults?
  - **Recommendation**: Match brand (use --ring color) for consistency
- [ ] **Keyboard Shortcut Discoverability**: Should keyboard shortcuts be visible in UI or screen-reader-only?
  - **Recommendation**: Show as tooltips on hover/focus for discoverability

### Technical Clarifications

- [ ] **Radix Dialog Override**: Can we safely add custom focus management on top of Radix Dialog?
  - **Answer**: Radix already handles focus trap and return focus - leverage it, don't override
- [ ] **ARIA Label Translation**: Should ARIA labels include entity names (item names, article titles)?
  - **Recommendation**: Yes, for better context ("Edit French translation for Coffee Maker")
- [ ] **Screen Reader Testing**: Which screen readers should be primary testing targets?
  - **Recommendation**: NVDA (Windows), VoiceOver (macOS), JAWS (Windows enterprise)

---

## Out of Scope

The following items are explicitly **OUT OF SCOPE** for this request:

- **Advanced Keyboard Shortcuts**: Complex keyboard shortcut system (Ctrl+S for save, etc.)
- **Voice Control Support**: Dragon NaturallySpeaking, Voice Control optimization
- **High Contrast Mode Specific Styling**: Custom styles for high contrast mode beyond focus indicators
- **Screen Reader Testing Automation**: Automated screen reader testing infrastructure
- **ARIA Authoring Practices Documentation**: Comprehensive documentation of all ARIA patterns used
- **Accessibility Statement**: Public accessibility statement or VPAT (Voluntary Product Accessibility Template)
- **Keyboard Navigation Help Modal**: Dedicated modal showing all keyboard shortcuts
- **Focus Trap Library**: Advanced focus trap library (focus-trap-react) - Radix handles this
- **Skip Links**: "Skip to main content" links for page navigation
- **Landmarks**: ARIA landmark roles beyond what's already in dashboard layout
- **Language Direction Support**: RTL (right-to-left) language support
- **Screen Magnifier Optimization**: Specific optimization for ZoomText, other magnifiers

---

*Document generated: 2026-01-22 20:49*
*Source: docs/gen_requests_epic5.md - Request #032*
*Status: PENDING (Blocked by REQ-E05-007, REQ-E05-008, REQ-E05-009, REQ-E05-010)*
