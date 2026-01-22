# Implementation Overview: Add Loading States and Error Handling

## Header
| Field | Value |
|-------|-------|
| Request Reference | #030 (REQ-E05-030) |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 |
| Breakdown Created | 2026-01-22 20:44 |
| T-shirt Size | L (Large) |
| Estimated Effort | 18-24 hours |
| Phase | Phase 7 (Integration & Polish), Task 7.3 |
| Status | PENDING |

## Request Overview

### Original Request Summary
Property owners need consistent and informative feedback when interacting with translation management features, including proper loading indicators during asynchronous operations and clear error messages when operations fail. All translation management components should provide retry mechanisms for failed operations to ensure a resilient user experience.

### Why This Matters
Currently, translation management components may lack consistent loading states, making it unclear when operations are in progress. Error handling may be inconsistent or missing across different components, leaving users uncertain about the status of their operations. Failed operations may not provide clear feedback or recovery options, forcing users to refresh the page or restart their workflow. This creates frustration and reduces confidence in the translation management system.

By implementing consistent loading states and comprehensive error handling across all translation management components, users will have clear visibility into operation status, understand when errors occur, and have self-service recovery options without requiring page refreshes or technical support.

### Expected User Impact
Property owners will experience:
- Clear visual feedback when operations are in progress (loading spinners, skeleton loaders)
- Informative error messages when operations fail with actionable next steps
- Self-service retry capabilities for failed operations
- Graceful degradation when APIs are temporarily unavailable
- Consistent UX patterns across all translation management features
- Reduced frustration and increased confidence in the system

---

## Goals

### Primary Objective
Implement comprehensive loading states and error handling across all translation management components to provide consistent, informative user feedback during asynchronous operations.

### Functional Requirements
1. **Loading States**: Add loading spinners, skeleton loaders, and disabled states to all components during async operations
2. **Error Feedback**: Implement toast notifications and inline error messages for all API failures
3. **Retry Mechanisms**: Provide retry buttons and actions for all failed operations
4. **Hook Updates**: Enhance useTranslationStatus and useTranslationMutations hooks with proper error/loading state management
5. **Component Updates**: Update all 4 translation components (PreviewPanel, EditForm, StatusTable, LanguageSelector)
6. **Toast System**: Implement Radix UI Toast wrapper with success/error/info variants
7. **Internationalization**: Add error message translations for all 6 supported locales

### Success Metrics
- All async operations display loading indicators
- All API failures show user-friendly error messages
- All errors provide retry capabilities
- Loading states prevent duplicate submissions
- Error messages are available in all 6 locales
- Toast notifications appear for all mutation operations (save, re-translate, retry)
- No operations fail silently without user feedback

### Assumptions & Clarifications
- Components REQ-E05-007 through REQ-E05-012 are complete and functional
- Radix UI Toast (@radix-ui/react-toast) is already installed and available
- Existing SkeletonBase component pattern (from SimpleDashboard) can be reused
- Lucide React icons (Loader2, AlertCircle, RefreshCw) are already imported
- Error messages should be user-friendly, avoiding technical jargon
- Toast notifications should auto-dismiss after 5 seconds for success, remain visible for errors
- Retry actions should use the same logic as the original operation (no exponential backoff in this phase)

---

## Implementation Plan

### Step 1: Create Toast System Infrastructure

**Objective**: Implement a reusable toast notification system using Radix UI Toast.

**Files to Create**:
- `/src/components/ui/toast.tsx` - Toast component wrapper
- `/src/components/ui/toaster.tsx` - Toast provider and container
- `/src/hooks/useToast.ts` - Toast hook for programmatic usage

**Implementation**:

1. Create Toast UI component with Radix UI primitives:
```typescript
// /src/components/ui/toast.tsx
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'success' | 'error' | 'info';
}

// Component exports ToastRoot, ToastTitle, ToastDescription, ToastAction, ToastClose
```

2. Create Toaster provider component:
```typescript
// /src/components/ui/toaster.tsx
import { Toaster as ToastProvider } from '@radix-ui/react-toast';
import { useToastStore } from '@/hooks/useToast';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <ToastProvider>
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
```

3. Create useToast hook with Zustand-like state management:
```typescript
// /src/hooks/useToast.ts
export function useToast() {
  const toast = (props: ToastProps) => {
    // Add toast to queue
  };

  return {
    toast,
    success: (message: string, description?: string) => toast({ variant: 'success', ... }),
    error: (message: string, description?: string, action?) => toast({ variant: 'error', ... }),
    info: (message: string, description?: string) => toast({ variant: 'info', ... }),
  };
}
```

**Rationale**: Centralized toast system ensures consistent error/success feedback across all components. Using Radix UI primitives maintains consistency with existing UI patterns. The hook provides a simple programmatic API for showing toasts.

**Estimated Effort**: 3-4 hours

---

### Step 2: Create Skeleton Loader Components

**Objective**: Create reusable skeleton loaders for translation management components.

**Files to Create**:
- `/src/components/TranslationManagement/skeletons/TranslationTableSkeleton.tsx`
- `/src/components/TranslationManagement/skeletons/TranslationFormSkeleton.tsx`
- `/src/components/TranslationManagement/skeletons/TranslationPanelSkeleton.tsx`

**Implementation**:

1. Reuse SkeletonBase from SimpleDashboard:
```typescript
import { SkeletonBase } from '@/components/SimpleDashboard/skeletons/SkeletonBase';

export function TranslationTableSkeleton() {
  return (
    <SkeletonBase label="Loading translation status">
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 border rounded">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </SkeletonBase>
  );
}
```

2. Create form skeleton with field layouts:
```typescript
export function TranslationFormSkeleton() {
  return (
    <SkeletonBase label="Loading translation form">
      <div className="space-y-4">
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-32 w-full bg-gray-200 rounded" />
        <div className="h-10 w-1/3 bg-gray-200 rounded" />
      </div>
    </SkeletonBase>
  );
}
```

**Rationale**: Skeleton loaders provide better perceived performance than simple spinners. Reusing SkeletonBase ensures accessibility (ARIA attributes) and consistency with existing loading patterns.

**Estimated Effort**: 2-3 hours

---

### Step 3: Update useTranslationStatus Hook

**Objective**: Add comprehensive error handling and loading state management to the status fetching hook.

**File**: `/src/hooks/useTranslationStatus.ts`

**Implementation**:

```typescript
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import type { EntityStatusSummary } from '@/app/api/translations/status/batch/types';

export interface UseTranslationStatusOptions {
  entityType: string;
  entityId: string;
  enabled?: boolean;
}

export interface UseTranslationStatusReturn {
  status: EntityStatusSummary | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  retry: () => Promise<void>;
}

export function useTranslationStatus({
  entityType,
  entityId,
  enabled = true,
}: UseTranslationStatusOptions): UseTranslationStatusReturn {
  const [status, setStatus] = useState<EntityStatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { error: showError } = useToast();

  const fetchStatus = async () => {
    if (!enabled || !entityId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/translations/status?entityType=${entityType}&entityId=${entityId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch translation status');
      }

      setStatus(data.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);

      // Show toast notification for errors
      showError(
        'Failed to load translation status',
        error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const retry = async () => {
    await fetchStatus();
  };

  useEffect(() => {
    fetchStatus();
  }, [entityType, entityId, enabled]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
    retry,
  };
}
```

**Rationale**: Exposing error state and retry function allows components to render error UI and provide recovery actions. Toast notifications provide immediate feedback for failures. Setting isLoading prevents UI flickering and enables loading states.

**Estimated Effort**: 2-3 hours

---

### Step 4: Create useTranslationMutations Hook

**Objective**: Create a hook for translation mutation operations (save, re-translate, retry) with loading and error state management.

**File**: `/src/hooks/useTranslationMutations.ts` (create new)

**Implementation**:

```typescript
import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';

export interface TranslationUpdateData {
  entityType: string;
  entityId: string;
  language: string;
  content: Record<string, string>;
}

export interface UseTranslationMutationsReturn {
  saveTranslation: (data: TranslationUpdateData) => Promise<void>;
  retranslate: (entityType: string, entityId: string, languages: string[]) => Promise<void>;
  retryFailed: (entityType: string, entityId: string, language: string) => Promise<void>;
  isSaving: boolean;
  isRetranslating: boolean;
  isRetrying: boolean;
  error: Error | null;
}

export function useTranslationMutations(): UseTranslationMutationsReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [isRetranslating, setIsRetranslating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { success, error: showError } = useToast();
  const t = useTranslations('translationManagement');

  const saveTranslation = async (data: TranslationUpdateData) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/translations/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save translation');
      }

      const result = await response.json();
      success(t('success.saved'));
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);

      showError(
        t('errors.saveFailed'),
        error.message,
        {
          label: t('retry'),
          onClick: () => saveTranslation(data),
        }
      );

      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const retranslate = async (entityType: string, entityId: string, languages: string[]) => {
    setIsRetranslating(true);
    setError(null);

    try {
      const response = await fetch('/api/translations/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId, languages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start re-translation');
      }

      const result = await response.json();
      success(t('success.retranslateStarted'));
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);

      showError(
        t('errors.retranslateFailed'),
        error.message,
        {
          label: t('retry'),
          onClick: () => retranslate(entityType, entityId, languages),
        }
      );

      throw error;
    } finally {
      setIsRetranslating(false);
    }
  };

  const retryFailed = async (entityType: string, entityId: string, language: string) => {
    setIsRetrying(true);
    setError(null);

    try {
      const response = await fetch('/api/translations/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityId, languages: [language] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retry translation');
      }

      const result = await response.json();
      success(t('success.retryStarted'));
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);

      showError(
        t('errors.retryFailed'),
        error.message,
        {
          label: t('retry'),
          onClick: () => retryFailed(entityType, entityId, language),
        }
      );

      throw error;
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    saveTranslation,
    retranslate,
    retryFailed,
    isSaving,
    isRetranslating,
    isRetrying,
    error,
  };
}
```

**Rationale**: Centralizing mutation logic in a hook ensures consistent error handling and loading states across all components. Toast notifications with retry actions provide immediate feedback and self-service recovery.

**Estimated Effort**: 3-4 hours

---

### Step 5: Update TranslationPreviewPanel Component

**Objective**: Add loading states, error handling, and retry mechanisms to the preview panel.

**File**: `/src/components/TranslationManagement/TranslationPreviewPanel.tsx`

**Implementation**:

```typescript
// Add imports
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslationStatus } from '@/hooks/useTranslationStatus';
import { useTranslationMutations } from '@/hooks/useTranslationMutations';
import { TranslationPanelSkeleton } from './skeletons/TranslationPanelSkeleton';

export function TranslationPreviewPanel({ entityType, entityId, isOpen, onClose, ...props }) {
  const { status, isLoading, error, retry } = useTranslationStatus({
    entityType,
    entityId,
    enabled: isOpen,
  });

  const { retranslate, retryFailed, isRetranslating, isRetrying } = useTranslationMutations();

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <TranslationPanelSkeleton />
      </div>
    );
  }

  // Error state with retry
  if (error && !status) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('errors.loadFailed')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={retry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  // Action handlers with loading states
  const handleRetranslate = async (language: string) => {
    try {
      await retranslate(entityType, entityId, [language]);
      // Refresh status after successful retranslate
      await retry();
    } catch (err) {
      // Error already handled by useTranslationMutations
    }
  };

  const handleRetry = async (language: string) => {
    try {
      await retryFailed(entityType, entityId, language);
      // Refresh status after successful retry
      await retry();
    } catch (err) {
      // Error already handled by useTranslationMutations
    }
  };

  // Render status list with loading indicators on action buttons
  return (
    <div>
      {status?.languages.map(lang => (
        <div key={lang.code}>
          {/* ... existing UI ... */}
          <Button
            onClick={() => handleRetranslate(lang.code)}
            disabled={isRetranslating || isRetrying}
          >
            {isRetranslating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {t('retranslate')}
          </Button>
        </div>
      ))}
    </div>
  );
}
```

**Rationale**: Shows skeleton loader during initial fetch, error state with retry button on failure, and loading indicators on action buttons to prevent duplicate submissions.

**Estimated Effort**: 2-3 hours

---

### Step 6: Update TranslationEditForm Component

**Objective**: Add loading states, disabled states during save, and error handling with retry.

**File**: `/src/components/TranslationManagement/TranslationEditForm.tsx`

**Implementation**:

```typescript
import { useTranslationMutations } from '@/hooks/useTranslationMutations';
import { TranslationFormSkeleton } from './skeletons/TranslationFormSkeleton';

export function TranslationEditForm({ entityType, entityId, language, onSave }) {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState(null);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  const { saveTranslation, isSaving } = useTranslationMutations();

  // Fetch translation data
  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/translations/${entityType}/${entityId}/${language}`);
        if (!response.ok) throw new Error('Failed to load translation');
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        setFetchError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, [entityType, entityId, language]);

  // Handle save with loading state
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveTranslation({
        entityType,
        entityId,
        language,
        content: formData,
      });

      onSave?.();
    } catch (err) {
      // Error already handled by useTranslationMutations
    }
  };

  // Loading state
  if (isLoadingData) {
    return <TranslationFormSkeleton />;
  }

  // Error state with retry
  if (fetchError) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('errors.loadFailed')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{fetchError.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      {/* Form fields - disabled during save */}
      <input
        type="text"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        disabled={isSaving}
      />

      <textarea
        value={formData.content}
        onChange={e => setFormData({ ...formData, content: e.target.value })}
        disabled={isSaving}
      />

      {/* Save button with loading indicator */}
      <Button type="submit" disabled={isSaving}>
        {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {isSaving ? t('saving') : t('save')}
      </Button>
    </form>
  );
}
```

**Rationale**: Skeleton loader during data fetch, disabled form fields during save prevent accidental changes, loading spinner on save button provides immediate feedback, error state with retry allows recovery.

**Estimated Effort**: 3-4 hours

---

### Step 7: Update TranslationStatusTable Component

**Objective**: Add skeleton loader for table rows, error handling, and loading states on action buttons.

**File**: `/src/components/TranslationManagement/TranslationStatusTable.tsx`

**Implementation**:

```typescript
import { TranslationTableSkeleton } from './skeletons/TranslationTableSkeleton';
import { useTranslationMutations } from '@/hooks/useTranslationMutations';

export function TranslationStatusTable({ entityType, propertyId }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { retranslate, isRetranslating } = useTranslationMutations();

  // Fetch items
  useEffect(() => {
    async function fetchItems() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/translations/batch?propertyId=${propertyId}`);
        if (!response.ok) throw new Error('Failed to load translation status');
        const data = await response.json();
        setItems(data.items);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, [propertyId]);

  // Loading state
  if (isLoading) {
    return <TranslationTableSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('errors.loadFailed')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableBody>
        {items.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <Button
                onClick={() => retranslate(entityType, item.id, ['es', 'fr'])}
                disabled={isRetranslating}
                size="sm"
              >
                {isRetranslating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {t('retranslate')}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Rationale**: Skeleton table rows provide better UX than blank table during load. Error state with retry allows recovery without page refresh. Loading indicators on action buttons prevent duplicate submissions.

**Estimated Effort**: 2-3 hours

---

### Step 8: Update TranslationLanguageSelector Component

**Objective**: Add loading state while checking translation status and disabled states for unavailable languages.

**File**: `/src/components/TranslationManagement/TranslationLanguageSelector.tsx`

**Implementation**:

```typescript
import { useTranslationStatus } from '@/hooks/useTranslationStatus';

export function TranslationLanguageSelector({ entityType, entityId, onSelect }) {
  const { status, isLoading } = useTranslationStatus({ entityType, entityId });

  const availableLanguages = ['es', 'fr', 'de', 'it', 'nl'];

  return (
    <div className="grid grid-cols-3 gap-2">
      {availableLanguages.map(lang => {
        const langStatus = status?.languages?.find(l => l.code === lang);
        const isAvailable = langStatus?.status === 'completed' || langStatus?.status === 'manual';

        return (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            disabled={isLoading || !isAvailable}
            className={cn(
              'p-3 border rounded-lg transition-colors',
              isLoading && 'opacity-50 cursor-wait',
              !isAvailable && !isLoading && 'opacity-30 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{lang.toUpperCase()}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

**Rationale**: Loading state during status check prevents premature selections. Disabled state for unavailable languages prevents invalid selections.

**Estimated Effort**: 1-2 hours

---

### Step 9: Add Translation Keys for All Locales

**Objective**: Add error messages, loading text, and action labels to all 6 locale files.

**Files**: `/messages/en.json`, `/messages/es.json`, `/messages/fr.json`, `/messages/de.json`, `/messages/it.json`, `/messages/nl.json`

**Implementation**:

Add to each locale file:

**English (`/messages/en.json`)**:
```json
{
  "translationManagement": {
    "loading": "Loading translations...",
    "loadingStatus": "Loading translation status...",
    "saving": "Saving...",
    "retranslating": "Re-translating...",
    "retrying": "Retrying...",
    "retry": "Retry",
    "errors": {
      "title": "Error",
      "generic": "An unexpected error occurred. Please try again.",
      "loadFailed": "Failed to load translations",
      "statusFetchFailed": "Failed to fetch translation status",
      "saveFailed": "Failed to save translation",
      "retranslateFailed": "Failed to start re-translation",
      "retryFailed": "Failed to retry translation",
      "networkError": "Network error. Please check your connection.",
      "unauthorized": "You are not authorized to perform this action.",
      "notFound": "The requested translation was not found.",
      "validationError": "Please check your input and try again."
    },
    "success": {
      "saved": "Translation saved successfully",
      "retranslateStarted": "Re-translation started",
      "retryStarted": "Retry initiated"
    }
  }
}
```

**Spanish (`/messages/es.json`)**:
```json
{
  "translationManagement": {
    "loading": "Cargando traducciones...",
    "loadingStatus": "Cargando estado de traducción...",
    "saving": "Guardando...",
    "retranslating": "Re-traduciendo...",
    "retrying": "Reintentando...",
    "retry": "Reintentar",
    "errors": {
      "title": "Error",
      "generic": "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
      "loadFailed": "Error al cargar traducciones",
      "statusFetchFailed": "Error al obtener estado de traducción",
      "saveFailed": "Error al guardar traducción",
      "retranslateFailed": "Error al iniciar re-traducción",
      "retryFailed": "Error al reintentar traducción",
      "networkError": "Error de red. Por favor, verifica tu conexión.",
      "unauthorized": "No tienes autorización para realizar esta acción.",
      "notFound": "La traducción solicitada no fue encontrada.",
      "validationError": "Por favor, verifica tu entrada e inténtalo de nuevo."
    },
    "success": {
      "saved": "Traducción guardada exitosamente",
      "retranslateStarted": "Re-traducción iniciada",
      "retryStarted": "Reintento iniciado"
    }
  }
}
```

**French (`/messages/fr.json`)**:
```json
{
  "translationManagement": {
    "loading": "Chargement des traductions...",
    "loadingStatus": "Chargement du statut de traduction...",
    "saving": "Enregistrement...",
    "retranslating": "Re-traduction...",
    "retrying": "Nouvelle tentative...",
    "retry": "Réessayer",
    "errors": {
      "title": "Erreur",
      "generic": "Une erreur inattendue s'est produite. Veuillez réessayer.",
      "loadFailed": "Échec du chargement des traductions",
      "statusFetchFailed": "Échec de la récupération du statut de traduction",
      "saveFailed": "Échec de l'enregistrement de la traduction",
      "retranslateFailed": "Échec du démarrage de la re-traduction",
      "retryFailed": "Échec de la nouvelle tentative de traduction",
      "networkError": "Erreur réseau. Veuillez vérifier votre connexion.",
      "unauthorized": "Vous n'êtes pas autorisé à effectuer cette action.",
      "notFound": "La traduction demandée n'a pas été trouvée.",
      "validationError": "Veuillez vérifier votre saisie et réessayer."
    },
    "success": {
      "saved": "Traduction enregistrée avec succès",
      "retranslateStarted": "Re-traduction démarrée",
      "retryStarted": "Nouvelle tentative initiée"
    }
  }
}
```

**German (`/messages/de.json`)**:
```json
{
  "translationManagement": {
    "loading": "Übersetzungen werden geladen...",
    "loadingStatus": "Übersetzungsstatus wird geladen...",
    "saving": "Speichern...",
    "retranslating": "Wird neu übersetzt...",
    "retrying": "Wird wiederholt...",
    "retry": "Wiederholen",
    "errors": {
      "title": "Fehler",
      "generic": "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      "loadFailed": "Fehler beim Laden der Übersetzungen",
      "statusFetchFailed": "Fehler beim Abrufen des Übersetzungsstatus",
      "saveFailed": "Fehler beim Speichern der Übersetzung",
      "retranslateFailed": "Fehler beim Starten der Neuübersetzung",
      "retryFailed": "Fehler beim Wiederholen der Übersetzung",
      "networkError": "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
      "unauthorized": "Sie sind nicht berechtigt, diese Aktion auszuführen.",
      "notFound": "Die angeforderte Übersetzung wurde nicht gefunden.",
      "validationError": "Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut."
    },
    "success": {
      "saved": "Übersetzung erfolgreich gespeichert",
      "retranslateStarted": "Neuübersetzung gestartet",
      "retryStarted": "Wiederholung initiiert"
    }
  }
}
```

**Italian (`/messages/it.json`)**:
```json
{
  "translationManagement": {
    "loading": "Caricamento traduzioni...",
    "loadingStatus": "Caricamento stato traduzione...",
    "saving": "Salvataggio...",
    "retranslating": "Ri-traduzione...",
    "retrying": "Nuovo tentativo...",
    "retry": "Riprova",
    "errors": {
      "title": "Errore",
      "generic": "Si è verificato un errore imprevisto. Riprova.",
      "loadFailed": "Impossibile caricare le traduzioni",
      "statusFetchFailed": "Impossibile recuperare lo stato della traduzione",
      "saveFailed": "Impossibile salvare la traduzione",
      "retranslateFailed": "Impossibile avviare la ri-traduzione",
      "retryFailed": "Impossibile riprovare la traduzione",
      "networkError": "Errore di rete. Controlla la tua connessione.",
      "unauthorized": "Non sei autorizzato a eseguire questa azione.",
      "notFound": "La traduzione richiesta non è stata trovata.",
      "validationError": "Controlla il tuo input e riprova."
    },
    "success": {
      "saved": "Traduzione salvata con successo",
      "retranslateStarted": "Ri-traduzione avviata",
      "retryStarted": "Nuovo tentativo avviato"
    }
  }
}
```

**Dutch (`/messages/nl.json`)**:
```json
{
  "translationManagement": {
    "loading": "Vertalingen laden...",
    "loadingStatus": "Vertaalstatus laden...",
    "saving": "Opslaan...",
    "retranslating": "Opnieuw vertalen...",
    "retrying": "Opnieuw proberen...",
    "retry": "Opnieuw proberen",
    "errors": {
      "title": "Fout",
      "generic": "Er is een onverwachte fout opgetreden. Probeer het opnieuw.",
      "loadFailed": "Kan vertalingen niet laden",
      "statusFetchFailed": "Kan vertaalstatus niet ophalen",
      "saveFailed": "Kan vertaling niet opslaan",
      "retranslateFailed": "Kan hervertaling niet starten",
      "retryFailed": "Kan vertaling niet opnieuw proberen",
      "networkError": "Netwerkfout. Controleer uw verbinding.",
      "unauthorized": "U bent niet geautoriseerd om deze actie uit te voeren.",
      "notFound": "De gevraagde vertaling is niet gevonden.",
      "validationError": "Controleer uw invoer en probeer het opnieuw."
    },
    "success": {
      "saved": "Vertaling succesvol opgeslagen",
      "retranslateStarted": "Hervertaling gestart",
      "retryStarted": "Nieuwe poging gestart"
    }
  }
}
```

**Rationale**: Comprehensive error messages in all locales ensure all users receive feedback in their preferred language. Consistent key structure makes maintenance easier.

**Estimated Effort**: 2 hours

---

### Step 10: Integrate Toaster into Layout

**Objective**: Add the Toaster component to the app layout to render toast notifications.

**File**: `/src/app/dashboard2/layout.tsx`

**Implementation**:

```typescript
import { Toaster } from '@/components/ui/toaster';

export default function Dashboard2Layout({ children }) {
  return (
    <div>
      {children}
      <Toaster />
    </div>
  );
}
```

**Rationale**: Toaster must be rendered at the layout level to display toasts from any child component.

**Estimated Effort**: 0.5 hours

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Toast System (New Files)

| File | Target | Type |
|------|--------|------|
| `/src/components/ui/toast.tsx` | — | Create |
| `/src/components/ui/toaster.tsx` | — | Create |
| `/src/hooks/useToast.ts` | — | Create |

### Skeleton Loaders (New Files)

| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/skeletons/TranslationTableSkeleton.tsx` | — | Create |
| `/src/components/TranslationManagement/skeletons/TranslationFormSkeleton.tsx` | — | Create |
| `/src/components/TranslationManagement/skeletons/TranslationPanelSkeleton.tsx` | — | Create |

### Hooks - Error/Loading State Updates

| File | Target | Type |
|------|--------|------|
| `/src/hooks/useTranslationStatus.ts` | Entire file | Modify |
| `/src/hooks/useTranslationMutations.ts` | — | Create |

### Components - Loading/Error Integration

| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/TranslationPreviewPanel.tsx` | Add loading, error states | Modify |
| `/src/components/TranslationManagement/TranslationEditForm.tsx` | Add loading, error states | Modify |
| `/src/components/TranslationManagement/TranslationStatusTable.tsx` | Add loading, error states | Modify |
| `/src/components/TranslationManagement/TranslationLanguageSelector.tsx` | Add loading states | Modify |

### Layout Integration

| File | Target | Type |
|------|--------|------|
| `/src/app/dashboard2/layout.tsx` | Add Toaster component | Modify |

### Translation Keys - All Locales

| File | Target | Type |
|------|--------|------|
| `/messages/en.json` | `translationManagement` namespace | Extend |
| `/messages/es.json` | `translationManagement` namespace | Extend |
| `/messages/fr.json` | `translationManagement` namespace | Extend |
| `/messages/de.json` | `translationManagement` namespace | Extend |
| `/messages/it.json` | `translationManagement` namespace | Extend |
| `/messages/nl.json` | `translationManagement` namespace | Extend |

### Files That Must NOT Be Modified

- Translation API routes (`/src/app/api/translations/*`) - Backend logic is out of scope
- Database schema or migrations - No schema changes required
- SkeletonBase component - Reuse as-is from SimpleDashboard
- AuthContext - No authentication changes needed
- Any components outside TranslationManagement namespace

---

## Dependencies

### Depends On (Must Be Completed First)
- **REQ-E05-007** (Task 5.1): TranslationPreviewPanel Component - Component must exist before adding loading/error states
- **REQ-E05-008** (Task 5.2): TranslationEditForm Component - Component must exist before adding loading/error states
- **REQ-E05-009** (Task 5.3): TranslationStatusTable Component - Component must exist before adding loading/error states
- **REQ-E05-010** (Task 5.4): TranslationLanguageSelector Component - Component must exist before adding loading/error states
- **REQ-E05-011** (Task 5.5): useTranslationStatus Hook - Hook must exist before enhancing with error handling
- **REQ-E05-001** (Task 1.1): Translation Status API Endpoint - Backend must exist to test error scenarios

### Blocks (Tasks That Require This First)
- None - This is a polish/enhancement task that doesn't block other features
- All translation management features will benefit from this enhancement but don't depend on it for core functionality

### Parallel Safety
- **Files Touched**:
  - New files: `/src/components/ui/toast.tsx`, `/src/components/ui/toaster.tsx`, `/src/hooks/useToast.ts`
  - New files: `/src/components/TranslationManagement/skeletons/*.tsx`
  - Modified: `/src/hooks/useTranslationStatus.ts`, `/src/hooks/useTranslationMutations.ts` (new)
  - Modified: All 4 TranslationManagement components
  - Modified: `/src/app/dashboard2/layout.tsx`
  - Modified: All 6 locale JSON files
- **Conflicts With**:
  - Any task modifying the same TranslationManagement components (REQ-E05-007 through REQ-E05-012)
  - Any task modifying dashboard2 layout
  - Any task adding translation keys to the same namespaces
- **Safe to Parallelize With**:
  - REQ-E05-028, REQ-E05-029 (modify different pages)
  - REQ-E05-025, REQ-E05-026, REQ-E05-027 (modify settings pages)
  - Any API or backend tasks

### External Dependencies
- `@radix-ui/react-toast` - Already installed (v1.2.14)
- `lucide-react` - Already in use (Loader2, AlertCircle, RefreshCw icons)
- `next-intl` - Already in use for translations
- SkeletonBase component from SimpleDashboard - Already exists

---

## Risks and Considerations

### Potential Side Effects

- **Toast Notification Overload**: If multiple operations fail simultaneously, users may receive too many toast notifications
- **Performance Impact**: Adding loading states and error boundaries may increase component complexity and rendering time
- **State Management Complexity**: Managing loading/error states across multiple components requires careful state synchronization
- **User Workflow Interruption**: Error modals/messages may interrupt user workflow if not designed carefully
- **Translation Coverage**: Missing translations in any locale will fall back to English, which may confuse non-English users

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Toast queue overflow | MEDIUM | LOW | Limit max toasts to 3, auto-dismiss older ones |
| Components not yet implemented | HIGH | HIGH | This task MUST wait for REQ-E05-007 through REQ-E05-012 completion |
| Radix Toast API changes | LOW | MEDIUM | Version is pinned in package.json, update carefully |
| Loading state flickering | MEDIUM | LOW | Add minimum loading duration (300ms) to prevent flicker |
| Error state loops | LOW | HIGH | Ensure retry logic doesn't infinitely loop on persistent errors |
| Toast accessibility issues | MEDIUM | MEDIUM | Follow Radix UI accessibility guidelines, test with screen readers |

### User Experience Considerations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Too many loading indicators | MEDIUM | MEDIUM | Use skeleton loaders for content, spinners only for actions |
| Error messages too technical | MEDIUM | HIGH | User-friendly messages, hide technical details in description |
| Retry button spam | LOW | MEDIUM | Disable retry button during retry operation |
| Toast notifications dismissed too quickly | MEDIUM | LOW | Success toasts: 5s, Error toasts: remain until dismissed |

### Testing Requirements

- **Unit Tests**: All hooks (useToast, useTranslationStatus, useTranslationMutations) with error scenarios
- **Integration Tests**: Component loading/error states, toast notifications, retry mechanisms
- **Manual Testing**: Test all error scenarios (network failure, 404, 500, timeout), test in all 6 locales, test accessibility with keyboard and screen reader
- **Performance Testing**: Verify loading states don't cause performance degradation
- **Cross-browser Testing**: Ensure toast notifications work in all supported browsers

---

## Open Questions

### Design Decisions Needed

- [ ] **Toast Auto-Dismiss Timing**: Should success toasts auto-dismiss after 5 seconds, or require manual dismissal?
  - **Recommendation**: Auto-dismiss success (5s), manual dismiss errors (with close button)
- [ ] **Error Retry Strategy**: Should retry actions use exponential backoff or immediate retry?
  - **Recommendation**: Immediate retry for manual user action, no automatic retry in this phase
- [ ] **Loading Minimum Duration**: Should loading states have minimum display time to prevent flicker?
  - **Recommendation**: Yes, 300ms minimum for better perceived performance
- [ ] **Toast Notification Position**: Top-right, bottom-right, or bottom-center?
  - **Recommendation**: Bottom-right (common pattern, doesn't block navigation)

### Technical Clarifications

- [ ] **Zustand vs Context**: Should toast state use Zustand, Context API, or module-level state?
  - **Recommendation**: Module-level state with event emitter pattern (simpler for toast use case)
- [ ] **Skeleton Animation**: Should skeleton loaders use pulse animation or shimmer?
  - **Recommendation**: Pulse (already used in SkeletonBase, consistent with existing patterns)
- [ ] **Error Boundary Scope**: Should TranslationManagement components use React Error Boundaries?
  - **Recommendation**: Not in this phase - focus on explicit error handling, Error Boundaries can be added later

---

## Out of Scope

The following items are explicitly **OUT OF SCOPE** for this request:

- **Automatic Retry Logic**: Exponential backoff and automatic retry on transient failures (future enhancement)
- **Error Boundaries**: React Error Boundary components for catastrophic failures (separate task)
- **Optimistic UI Updates**: Immediate UI updates before API confirmation (future enhancement)
- **Error Analytics**: Logging errors to analytics service (separate task)
- **Advanced Toast Features**: Toast notification history, undo actions, notification center (future enhancement)
- **Loading State Orchestration**: Complex loading state coordination across multiple components (current approach is per-component)
- **Network Status Detection**: Offline/online detection and messaging (future enhancement)
- **API Response Caching**: Caching API responses to reduce re-fetches (future enhancement)
- **Skeleton Customization**: Advanced skeleton loader variants beyond basic table/form/panel (can be added as needed)
- **Toast Accessibility Enhancements**: Beyond Radix UI defaults (voice announcements, haptic feedback, etc.)

---

*Document generated: 2026-01-22 20:44*
*Source: docs/gen_requests_epic5.md - Request #030*
*Status: PENDING (Blocked by REQ-E05-007, REQ-E05-008, REQ-E05-009, REQ-E05-010, REQ-E05-011)*
