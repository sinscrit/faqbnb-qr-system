# REQ-366: Write Component Tests for Translation Management UI - Detailed Task Breakdown

**Last Modified:** 2026-01-19 11:15:00 UTC
**Request ID:** REQ-366
**Epic:** Localization Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.6
**Overview Document:** docs/REQ-366-write-component-tests-overview.md
**Implementation Plan Reference:** docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Estimated Story Points:** 5-8 (Medium complexity)

---

## Executive Summary

This document provides granular, actionable tasks for implementing comprehensive component tests for three critical translation management UI components: TranslationPreviewPanel, TranslationEditor, and TranslationStatusWidget. Each task is designed to be approximately 1 story point and can be executed independently by an AI coding agent or junior developer.

---

## Prerequisites Checklist

Before starting implementation, verify these dependencies exist:

### Components Under Test (Must Exist)
- [ ] `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx`
- [ ] `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`
- [ ] `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx`
- [ ] `/src/components/TranslationManagement/TranslationEditor/TranslationEditor.tsx`
- [ ] `/src/components/TranslationManagement/TranslationStatusWidget/TranslationStatusWidget.tsx`
- [ ] `/src/components/TranslationManagement/TranslationManagement.types.ts`

### Testing Infrastructure (Already Exists - Verified)
| Dependency | Location | Status |
|------------|----------|--------|
| Vitest | `vitest.config.ts` | Verified |
| Testing Library | `@testing-library/react` | Verified |
| User Event | `@testing-library/user-event` | Verified |
| Jest DOM | `@testing-library/jest-dom` | Verified (in vitest.setup.ts) |
| Vitest Axe | `vitest-axe` | Verified (in vitest.setup.ts) |
| Setup File | `vitest.setup.ts` | Verified |

---

## Task Breakdown

### Task 1: Create Shared Test Utilities and Mock Factories

**File to Create:** `/src/components/TranslationManagement/__tests__/test-utils.ts`

**Objective:** Create reusable mock data factories and utility functions for all translation management component tests.

#### Sub-task 1.1: Create Mock Types and Constants

**Actions:**
1. Create the `__tests__` directory at `/src/components/TranslationManagement/__tests__/`
2. Create `test-utils.ts` file with the following content structure:

```typescript
/**
 * Test Utilities for Translation Management Components
 *
 * Provides mock data factories, test helpers, and shared mocks
 * for TranslationPreviewPanel, TranslationEditor, and TranslationStatusWidget tests.
 *
 * @module TranslationManagement/__tests__/test-utils
 * @lastModified 2026-01-19
 * @requestId REQ-366
 */

import type {
  TranslationPreviewPanelProps,
  TranslationEditorProps,
  TranslationStatusWidgetProps,
  TranslationStatus,
  SupportedLanguage,
} from '../TranslationManagement.types';

// =============================================================================
// Constants
// =============================================================================

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'nl', 'it'];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  fr: 'Fran\u00E7ais',
  es: 'Espa\u00F1ol',
  de: 'Deutsch',
  nl: 'Nederlands',
  it: 'Italiano',
};

export const STATUS_TYPES = ['pending', 'processing', 'completed', 'failed', 'manual'] as const;
```

**Acceptance Criteria:**
- [ ] File created at correct location
- [ ] Constants exported for supported languages
- [ ] Language names mapping exported
- [ ] Status types constant exported

---

#### Sub-task 1.2: Create Mock Data Factories

**Actions:**
1. Add mock data factory functions to `test-utils.ts`:

```typescript
// =============================================================================
// Mock Data Factories
// =============================================================================

/**
 * Creates mock translation status for a single language
 */
export const createMockTranslationStatus = (
  overrides?: Partial<TranslationStatus>
): TranslationStatus => ({
  status: 'completed',
  content: {
    title: 'Mock Translated Title',
    description: 'Mock translated description text.',
  },
  translatedAt: new Date().toISOString(),
  isStale: false,
  reviewedBy: undefined,
  ...overrides,
});

/**
 * Creates a complete translation status map for all languages
 */
export const createMockTranslationStatusMap = (
  sourceLanguage: SupportedLanguage = 'en',
  statusOverrides?: Partial<Record<SupportedLanguage, Partial<TranslationStatus>>>
): Record<SupportedLanguage, TranslationStatus> => {
  const map = {} as Record<SupportedLanguage, TranslationStatus>;

  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang === sourceLanguage) {
      map[lang] = createMockTranslationStatus({
        status: 'completed',
        content: { title: 'Original Title', description: 'Original description' },
        ...statusOverrides?.[lang],
      });
    } else {
      map[lang] = createMockTranslationStatus(statusOverrides?.[lang]);
    }
  }

  return map;
};

/**
 * Creates mock source content for entities
 */
export const createMockSourceContent = (overrides?: {
  title?: string;
  description?: string;
  name?: string;
}) => ({
  title: 'How to Use the Dishwasher',
  description: 'Load dishes on the lower and upper racks. Add detergent to the dispenser.',
  ...overrides,
});

/**
 * Creates mock translation summary for widget
 */
export const createMockTranslationSummary = (overrides?: {
  total?: number;
  complete?: number;
  partial?: number;
  pending?: number;
  failed?: number;
}) => ({
  total: 25,
  complete: 15,
  partial: 5,
  pending: 3,
  failed: 2,
  ...overrides,
});
```

**Acceptance Criteria:**
- [ ] `createMockTranslationStatus` factory function implemented
- [ ] `createMockTranslationStatusMap` factory function implemented
- [ ] `createMockSourceContent` factory function implemented
- [ ] `createMockTranslationSummary` factory function implemented
- [ ] All factories accept optional overrides parameter

---

#### Sub-task 1.3: Create Default Props Factories

**Actions:**
1. Add default props factory functions for each component:

```typescript
// =============================================================================
// Default Props Factories
// =============================================================================

/**
 * Creates default props for TranslationPreviewPanel
 */
export const createPreviewPanelProps = (
  overrides?: Partial<TranslationPreviewPanelProps>
): TranslationPreviewPanelProps => ({
  entityType: 'article',
  entityId: 'test-article-123',
  sourceLanguage: 'en',
  sourceContent: createMockSourceContent(),
  isOpen: true,
  onClose: vi.fn(),
  onTranslationEdited: vi.fn(),
  ...overrides,
});

/**
 * Creates default props for TranslationEditor
 */
export const createEditorProps = (
  overrides?: Partial<TranslationEditorProps>
): TranslationEditorProps => ({
  translation: {
    language: 'fr',
    content: {
      title: 'Comment utiliser le lave-vaisselle',
      description: 'Chargez la vaisselle sur les supports...',
    },
    status: 'completed',
  },
  sourceContent: createMockSourceContent(),
  sourceLanguage: 'en',
  isOpen: true,
  onSave: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
  ...overrides,
});

/**
 * Creates default props for TranslationStatusWidget
 */
export const createWidgetProps = (
  overrides?: Partial<TranslationStatusWidgetProps>
): TranslationStatusWidgetProps => ({
  propertyId: 'test-property-456',
  onViewDetails: vi.fn(),
  ...overrides,
});
```

**Acceptance Criteria:**
- [ ] `createPreviewPanelProps` factory function implemented
- [ ] `createEditorProps` factory function implemented
- [ ] `createWidgetProps` factory function implemented
- [ ] Mock functions use `vi.fn()` for callbacks
- [ ] All factories accept optional overrides parameter

---

#### Sub-task 1.4: Create Hook and API Mocks

**Actions:**
1. Add mock setup functions for hooks and APIs:

```typescript
// =============================================================================
// Hook and API Mocks
// =============================================================================

/**
 * Mock implementation for useTranslationStatus hook
 */
export const mockUseTranslationStatus = (options?: {
  isLoading?: boolean;
  error?: string | null;
  data?: Record<SupportedLanguage, TranslationStatus>;
}) => ({
  isLoading: options?.isLoading ?? false,
  error: options?.error ?? null,
  data: options?.data ?? createMockTranslationStatusMap(),
  refetch: vi.fn(),
});

/**
 * Creates mock Supabase channel for realtime subscriptions
 */
export const createMockSupabaseChannel = () => ({
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockResolvedValue({ status: 'SUBSCRIBED' }),
  unsubscribe: vi.fn().mockResolvedValue(undefined),
});

/**
 * Sets up mock for useTranslationStatus hook
 * Call in beforeEach or at module level
 */
export const setupUseTranslationStatusMock = (options?: Parameters<typeof mockUseTranslationStatus>[0]) => {
  const { useTranslationStatus } = vi.hoisted(() => ({
    useTranslationStatus: vi.fn(),
  }));

  vi.mock('@/hooks/useTranslationStatus', () => ({
    useTranslationStatus,
  }));

  useTranslationStatus.mockReturnValue(mockUseTranslationStatus(options));

  return useTranslationStatus;
};

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Waits for async operations in tests
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Helper to get status icon test id
 */
export const getStatusIconTestId = (language: SupportedLanguage, status: string) =>
  `status-icon-${language}-${status}`;

/**
 * Helper to get action button test id
 */
export const getActionButtonTestId = (language: SupportedLanguage, action: string) =>
  `action-btn-${language}-${action}`;
```

**Acceptance Criteria:**
- [ ] `mockUseTranslationStatus` function implemented
- [ ] `createMockSupabaseChannel` function implemented
- [ ] `setupUseTranslationStatusMock` helper function implemented
- [ ] Test helper functions exported
- [ ] All exports properly typed

---

### Task 2: Create TranslationPreviewPanel Test Suite

**File to Create:** `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationPreviewPanel.test.tsx`

**Objective:** Comprehensive test suite for the TranslationPreviewPanel component covering rendering, status indicators, action buttons, and panel behavior.

#### Sub-task 2.1: Set Up Test File Structure

**Actions:**
1. Create the `__tests__` directory at `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/`
2. Create `TranslationPreviewPanel.test.tsx` with test setup:

```typescript
/**
 * Unit Tests for TranslationPreviewPanel Component
 *
 * Tests cover:
 * - Panel rendering and visibility
 * - Source content display
 * - Translation status indicators for all languages
 * - Action buttons (Edit, Re-translate, Retry)
 * - Progress bar display
 * - Panel close behavior
 * - Keyboard accessibility
 *
 * @module TranslationManagement/TranslationPreviewPanel/__tests__
 * @lastModified 2026-01-19
 * @requestId REQ-366
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationPreviewPanel } from '../TranslationPreviewPanel';
import {
  createPreviewPanelProps,
  createMockTranslationStatusMap,
  createMockSourceContent,
  SUPPORTED_LANGUAGES,
  LANGUAGE_NAMES,
} from '../../__tests__/test-utils';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock the useTranslationStatus hook
const mockTranslationData = createMockTranslationStatusMap();
const mockRefetch = vi.fn();

vi.mock('@/hooks/useTranslationStatus', () => ({
  useTranslationStatus: vi.fn(() => ({
    isLoading: false,
    error: null,
    data: mockTranslationData,
    refetch: mockRefetch,
  })),
}));

// Mock Supabase realtime
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
  },
}));

// =============================================================================
// Test Setup
// =============================================================================

const defaultProps = createPreviewPanelProps();
const mockOnClose = vi.fn();
const mockOnTranslationEdited = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  defaultProps.onClose = mockOnClose;
  defaultProps.onTranslationEdited = mockOnTranslationEdited;
});
```

**Acceptance Criteria:**
- [ ] Test file created at correct location
- [ ] All necessary imports added
- [ ] Hook mocks configured
- [ ] beforeEach cleanup implemented
- [ ] Default props setup complete

---

#### Sub-task 2.2: Implement Rendering Tests

**Actions:**
1. Add rendering test cases:

```typescript
// =============================================================================
// Rendering Tests
// =============================================================================

describe('Rendering', () => {
  it('renders nothing when isOpen is false', () => {
    render(<TranslationPreviewPanel {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Translations')).not.toBeInTheDocument();
  });

  it('renders panel when isOpen is true', () => {
    render(<TranslationPreviewPanel {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Translations')).toBeInTheDocument();
  });

  it('displays source content title correctly', () => {
    const sourceContent = createMockSourceContent({ title: 'Custom Title Test' });
    render(<TranslationPreviewPanel {...defaultProps} sourceContent={sourceContent} />);

    expect(screen.getByText('Custom Title Test')).toBeInTheDocument();
  });

  it('displays source content description correctly', () => {
    const sourceContent = createMockSourceContent({
      description: 'This is the source description text.'
    });
    render(<TranslationPreviewPanel {...defaultProps} sourceContent={sourceContent} />);

    expect(screen.getByText('This is the source description text.')).toBeInTheDocument();
  });

  it('shows source language indicator', () => {
    render(<TranslationPreviewPanel {...defaultProps} sourceLanguage="en" />);

    expect(screen.getByText(/source.*english/i)).toBeInTheDocument();
  });

  it('renders all six language rows', () => {
    render(<TranslationPreviewPanel {...defaultProps} />);

    SUPPORTED_LANGUAGES.forEach((lang) => {
      expect(screen.getByText(LANGUAGE_NAMES[lang])).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValueOnce({
      isLoading: true,
      error: null,
      data: null,
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    // Or check for loading spinner/skeleton
    expect(screen.getByTestId('translation-loading')).toBeInTheDocument();
  });

  it('displays error state when fetch fails', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValueOnce({
      isLoading: false,
      error: 'Failed to load translations',
      data: null,
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- [ ] Test for hidden state when isOpen=false
- [ ] Test for visible state when isOpen=true
- [ ] Test for source content title display
- [ ] Test for source content description display
- [ ] Test for source language indicator
- [ ] Test for all six language rows
- [ ] Test for loading state
- [ ] Test for error state

---

#### Sub-task 2.3: Implement Status Indicator Tests

**Actions:**
1. Add status indicator test cases:

```typescript
// =============================================================================
// Status Indicator Tests
// =============================================================================

describe('Status Indicators', () => {
  it('shows green checkmark for completed status', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'completed' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const frRow = screen.getByTestId('translation-row-fr');
    const statusIcon = within(frRow).getByTestId('status-icon');
    expect(statusIcon).toHaveClass('text-green-500');
    expect(within(frRow).getByText(/completed/i)).toBeInTheDocument();
  });

  it('shows orange hourglass for pending status', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'pending' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const frRow = screen.getByTestId('translation-row-fr');
    const statusIcon = within(frRow).getByTestId('status-icon');
    expect(statusIcon).toHaveClass('text-amber-500');
    expect(within(frRow).getByText(/pending/i)).toBeInTheDocument();
  });

  it('shows animated spinner for processing status', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        de: { status: 'processing' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const deRow = screen.getByTestId('translation-row-de');
    expect(within(deRow).getByTestId('processing-spinner')).toBeInTheDocument();
    expect(within(deRow).getByText(/translating/i)).toBeInTheDocument();
  });

  it('shows red X for failed status', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        it: { status: 'failed' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const itRow = screen.getByTestId('translation-row-it');
    const statusIcon = within(itRow).getByTestId('status-icon');
    expect(statusIcon).toHaveClass('text-red-500');
    expect(within(itRow).getByText(/failed/i)).toBeInTheDocument();
  });

  it('shows purple pencil for manual status', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        es: { status: 'manual', reviewedBy: 'user@example.com' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const esRow = screen.getByTestId('translation-row-es');
    const statusIcon = within(esRow).getByTestId('status-icon');
    expect(statusIcon).toHaveClass('text-violet-500');
    expect(within(esRow).getByText(/manually edited/i)).toBeInTheDocument();
  });

  it('shows yellow warning for stale translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        nl: { status: 'manual', isStale: true },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const nlRow = screen.getByTestId('translation-row-nl');
    expect(within(nlRow).getByTestId('stale-warning')).toBeInTheDocument();
    expect(within(nlRow).getByText(/outdated/i)).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- [ ] Test for completed status (green checkmark)
- [ ] Test for pending status (orange hourglass)
- [ ] Test for processing status (animated spinner)
- [ ] Test for failed status (red X)
- [ ] Test for manual status (purple pencil)
- [ ] Test for stale translation warning (yellow)

---

#### Sub-task 2.4: Implement Action Button Tests

**Actions:**
1. Add action button test cases:

```typescript
// =============================================================================
// Action Button Tests
// =============================================================================

describe('Action Buttons', () => {
  it('shows Edit button for completed translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'completed' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const frRow = screen.getByTestId('translation-row-fr');
    expect(within(frRow).getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('shows Edit button for manual translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'manual' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const frRow = screen.getByTestId('translation-row-fr');
    expect(within(frRow).getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('shows Re-translate button for completed translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'completed' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const frRow = screen.getByTestId('translation-row-fr');
    expect(within(frRow).getByRole('button', { name: /re-?translate/i })).toBeInTheDocument();
  });

  it('shows Retry button only for failed translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'completed' },
        it: { status: 'failed' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    // Failed row should have Retry
    const itRow = screen.getByTestId('translation-row-it');
    expect(within(itRow).getByRole('button', { name: /retry/i })).toBeInTheDocument();

    // Completed row should NOT have Retry
    const frRow = screen.getByTestId('translation-row-fr');
    expect(within(frRow).queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('does not show action buttons for processing translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        de: { status: 'processing' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const deRow = screen.getByTestId('translation-row-de');
    expect(within(deRow).queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(within(deRow).queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('Edit button triggers onTranslationEdited callback', async () => {
    const user = userEvent.setup();
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'completed' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const frRow = screen.getByTestId('translation-row-fr');
    const editButton = within(frRow).getByRole('button', { name: /edit/i });

    await user.click(editButton);

    expect(mockOnTranslationEdited).toHaveBeenCalledWith('fr');
  });

  it('Retry button initiates re-translation for failed language', async () => {
    const user = userEvent.setup();
    const mockRetranslate = vi.fn().mockResolvedValue({ success: true });

    // Mock the retranslate API call
    vi.mock('@/lib/api', () => ({
      retranslateContent: mockRetranslate,
    }));

    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        it: { status: 'failed' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const itRow = screen.getByTestId('translation-row-it');
    const retryButton = within(itRow).getByRole('button', { name: /retry/i });

    await user.click(retryButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test Edit button appears for completed status
- [ ] Test Edit button appears for manual status
- [ ] Test Re-translate button appears for completed status
- [ ] Test Retry button appears only for failed status
- [ ] Test no action buttons for processing status
- [ ] Test Edit button callback triggers correctly
- [ ] Test Retry button initiates re-translation

---

#### Sub-task 2.5: Implement Progress Bar Tests

**Actions:**
1. Add progress bar test cases:

```typescript
// =============================================================================
// Progress Bar Tests
// =============================================================================

describe('Progress Bar', () => {
  it('shows correct completion percentage', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'completed' },
        es: { status: 'completed' },
        de: { status: 'completed' },
        nl: { status: 'pending' },
        it: { status: 'pending' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    // 3 out of 5 non-source languages complete = 60%
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
  });

  it('displays X/6 Complete text format', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'completed' },
        es: { status: 'completed' },
        de: { status: 'completed' },
        nl: { status: 'pending' },
        it: { status: 'failed' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    expect(screen.getByText(/3\/5 complete/i)).toBeInTheDocument();
  });

  it('shows 0% when no translations completed', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'pending' },
        es: { status: 'pending' },
        de: { status: 'pending' },
        nl: { status: 'pending' },
        it: { status: 'pending' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText(/0\/5 complete/i)).toBeInTheDocument();
  });

  it('shows 100% when all translations completed', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'completed' },
        es: { status: 'completed' },
        de: { status: 'completed' },
        nl: { status: 'completed' },
        it: { status: 'completed' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText(/5\/5 complete/i)).toBeInTheDocument();
  });

  it('includes manual status in completed count', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      data: createMockTranslationStatusMap('en', {
        fr: { status: 'completed' },
        es: { status: 'manual' },
        de: { status: 'pending' },
        nl: { status: 'pending' },
        it: { status: 'pending' },
      }),
      refetch: mockRefetch,
    });

    render(<TranslationPreviewPanel {...defaultProps} />);

    // Both completed and manual count toward completion
    expect(screen.getByText(/2\/5 complete/i)).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- [ ] Test correct completion percentage calculation
- [ ] Test "X/6 Complete" text format
- [ ] Test 0% display when no translations completed
- [ ] Test 100% display when all translations completed
- [ ] Test manual status counts toward completed

---

#### Sub-task 2.6: Implement Panel Behavior Tests

**Actions:**
1. Add panel behavior and accessibility test cases:

```typescript
// =============================================================================
// Panel Behavior Tests
// =============================================================================

describe('Panel Behavior', () => {
  it('close button calls onClose', async () => {
    const user = userEvent.setup();
    render(<TranslationPreviewPanel {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('clicking outside panel calls onClose when configured', async () => {
    const user = userEvent.setup();
    render(
      <div data-testid="outside-area">
        <TranslationPreviewPanel {...defaultProps} />
      </div>
    );

    // Click the backdrop/overlay
    const backdrop = screen.getByTestId('panel-backdrop');
    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('Escape key closes panel', async () => {
    const user = userEvent.setup();
    render(<TranslationPreviewPanel {...defaultProps} />);

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('panel has correct ARIA attributes', () => {
    render(<TranslationPreviewPanel {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('progress bar has correct ARIA attributes', () => {
    render(<TranslationPreviewPanel {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow');
    expect(progressBar).toHaveAttribute('aria-label');
  });

  it('status icons have aria-label for screen readers', () => {
    render(<TranslationPreviewPanel {...defaultProps} />);

    const statusIcons = screen.getAllByTestId('status-icon');
    statusIcons.forEach((icon) => {
      expect(icon).toHaveAttribute('aria-label');
    });
  });

  it('Re-translate All button triggers bulk re-translation', async () => {
    const user = userEvent.setup();
    render(<TranslationPreviewPanel {...defaultProps} />);

    const reTranslateAllButton = screen.getByRole('button', { name: /re-?translate all/i });
    await user.click(reTranslateAllButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test close button calls onClose
- [ ] Test clicking outside calls onClose
- [ ] Test Escape key closes panel
- [ ] Test panel has correct ARIA attributes
- [ ] Test progress bar has correct ARIA attributes
- [ ] Test status icons have aria-label
- [ ] Test Re-translate All button functionality

---

### Task 3: Create TranslationEditor Test Suite

**File to Create:** `/src/components/TranslationManagement/TranslationEditor/__tests__/TranslationEditor.test.tsx`

**Objective:** Comprehensive test suite for the TranslationEditor component covering rendering, editing, save flow, and cancel/close behavior.

#### Sub-task 3.1: Set Up TranslationEditor Test File

**Actions:**
1. Create the `__tests__` directory at `/src/components/TranslationManagement/TranslationEditor/__tests__/`
2. Create `TranslationEditor.test.tsx` with test setup:

```typescript
/**
 * Unit Tests for TranslationEditor Component
 *
 * Tests cover:
 * - Modal rendering and visibility
 * - Source content display (read-only)
 * - Translation editing functionality
 * - Save flow with API interaction
 * - Cancel and close behavior with unsaved changes
 * - Accessibility compliance
 *
 * @module TranslationManagement/TranslationEditor/__tests__
 * @lastModified 2026-01-19
 * @requestId REQ-366
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationEditor } from '../TranslationEditor';
import {
  createEditorProps,
  createMockSourceContent,
  LANGUAGE_NAMES,
} from '../../__tests__/test-utils';

// =============================================================================
// Test Setup
// =============================================================================

const mockOnSave = vi.fn().mockResolvedValue(undefined);
const mockOnCancel = vi.fn();

const defaultProps = createEditorProps({
  onSave: mockOnSave,
  onCancel: mockOnCancel,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockOnSave.mockResolvedValue(undefined);
});
```

**Acceptance Criteria:**
- [ ] Test file created at correct location
- [ ] All necessary imports added
- [ ] Mock functions configured
- [ ] beforeEach cleanup implemented

---

#### Sub-task 3.2: Implement Rendering Tests

**Actions:**
1. Add rendering test cases:

```typescript
// =============================================================================
// Rendering Tests
// =============================================================================

describe('Rendering', () => {
  it('renders nothing when isOpen is false', () => {
    render(<TranslationEditor {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(<TranslationEditor {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays language name in header', () => {
    render(<TranslationEditor {...defaultProps} />);

    expect(screen.getByText(/edit french translation/i)).toBeInTheDocument();
  });

  it('displays source language label', () => {
    render(<TranslationEditor {...defaultProps} sourceLanguage="en" />);

    expect(screen.getByText(/source.*english/i)).toBeInTheDocument();
  });

  it('displays source content in read-only section', () => {
    const sourceContent = createMockSourceContent({
      title: 'Original Title Here',
      description: 'Original description text.',
    });
    render(<TranslationEditor {...defaultProps} sourceContent={sourceContent} />);

    const sourceSection = screen.getByTestId('source-content-section');
    expect(within(sourceSection).getByText('Original Title Here')).toBeInTheDocument();
    expect(within(sourceSection).getByText('Original description text.')).toBeInTheDocument();
  });

  it('displays current translation in editable textarea', () => {
    render(<TranslationEditor {...defaultProps} />);

    const textarea = screen.getByRole('textbox', { name: /translation/i });
    expect(textarea).toHaveValue(defaultProps.translation.content.title);
  });
});
```

**Acceptance Criteria:**
- [ ] Test renders nothing when isOpen=false
- [ ] Test renders modal when isOpen=true
- [ ] Test displays language name in header
- [ ] Test displays source language label
- [ ] Test displays source content in read-only section
- [ ] Test displays current translation in editable textarea

---

#### Sub-task 3.3: Implement Content Display Tests

**Actions:**
1. Add content display test cases:

```typescript
// =============================================================================
// Content Display Tests
// =============================================================================

describe('Content Display', () => {
  it('source content section is not editable', () => {
    render(<TranslationEditor {...defaultProps} />);

    const sourceSection = screen.getByTestId('source-content-section');
    const sourceText = within(sourceSection).getByText(defaultProps.sourceContent.title!);

    // Source should not be in an editable field
    expect(sourceText.closest('textarea')).toBeNull();
    expect(sourceText.closest('input')).toBeNull();
  });

  it('translation textarea is editable', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const textarea = screen.getByRole('textbox', { name: /translation/i });

    await user.clear(textarea);
    await user.type(textarea, 'New translation text');

    expect(textarea).toHaveValue('New translation text');
  });

  it('pre-populates textarea with existing translation', () => {
    const translation = {
      language: 'es' as const,
      content: { title: 'Titulo existente', description: 'Descripcion existente' },
      status: 'completed',
    };

    render(<TranslationEditor {...defaultProps} translation={translation} />);

    const titleTextarea = screen.getByLabelText(/title/i);
    expect(titleTextarea).toHaveValue('Titulo existente');
  });

  it('handles multiple content fields (title and description)', () => {
    render(<TranslationEditor {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- [ ] Test source content is not editable
- [ ] Test translation textarea is editable
- [ ] Test pre-populates with existing translation
- [ ] Test handles multiple content fields

---

#### Sub-task 3.4: Implement Edit State Tests

**Actions:**
1. Add edit state test cases:

```typescript
// =============================================================================
// Edit State Tests
// =============================================================================

describe('Edit State', () => {
  it('Save button is disabled when no changes made', () => {
    render(<TranslationEditor {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('Save button is enabled when content changes', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const textarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(textarea);
    await user.type(textarea, 'Changed title');

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeEnabled();
  });

  it('Save button is disabled when content is empty', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('Save button is disabled when content is whitespace only', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, '   ');

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('tracks dirty state correctly when reverting to original', async () => {
    const user = userEvent.setup();
    const originalTitle = 'Original title';
    const translation = {
      language: 'fr' as const,
      content: { title: originalTitle },
      status: 'completed',
    };

    render(<TranslationEditor {...defaultProps} translation={translation} />);

    const textarea = screen.getByRole('textbox', { name: /title/i });

    // Make a change
    await user.clear(textarea);
    await user.type(textarea, 'Changed');
    expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();

    // Revert to original
    await user.clear(textarea);
    await user.type(textarea, originalTitle);
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});
```

**Acceptance Criteria:**
- [ ] Test Save button disabled when no changes
- [ ] Test Save button enabled when content changes
- [ ] Test Save button disabled when content empty
- [ ] Test Save button disabled for whitespace-only content
- [ ] Test dirty state tracking when reverting to original

---

#### Sub-task 3.5: Implement Save Flow Tests

**Actions:**
1. Add save flow test cases:

```typescript
// =============================================================================
// Save Flow Tests
// =============================================================================

describe('Save Flow', () => {
  it('Save button calls onSave with updated content', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'New French Title');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith({
      title: 'New French Title',
      description: defaultProps.translation.content.description,
    });
  });

  it('shows loading state during save', async () => {
    const user = userEvent.setup();
    // Make onSave take some time
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'New Title');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should show loading state
    expect(screen.getByTestId('save-loading')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByTestId('save-loading')).not.toBeInTheDocument();
    });
  });

  it('closes editor on successful save', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'New Title');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalled(); // onCancel is used to close
    });
  });

  it('displays error message on save failure', async () => {
    const user = userEvent.setup();
    mockOnSave.mockRejectedValue(new Error('Failed to save translation'));

    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'New Title');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    });
  });

  it('does not close editor on save failure', async () => {
    const user = userEvent.setup();
    mockOnSave.mockRejectedValue(new Error('Save failed'));

    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'New Title');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
```

**Acceptance Criteria:**
- [ ] Test Save button calls onSave with updated content
- [ ] Test shows loading state during save
- [ ] Test closes editor on successful save
- [ ] Test displays error message on save failure
- [ ] Test does not close editor on save failure

---

#### Sub-task 3.6: Implement Cancel/Close Behavior Tests

**Actions:**
1. Add cancel/close behavior test cases:

```typescript
// =============================================================================
// Cancel/Close Behavior Tests
// =============================================================================

describe('Cancel/Close Behavior', () => {
  it('Cancel button with no changes calls onCancel directly', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('Cancel button with unsaved changes shows confirmation', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    // Make a change
    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'Unsaved change');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Confirmation should appear
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });

  it('Confirmation dialog offers Save, Discard, Cancel options', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    // Make a change
    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'Changed');

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /discard/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('Save in confirmation saves and closes', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'New content');

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('Discard in confirmation discards and closes', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'Unsaved');

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: /discard/i }));

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('Cancel in confirmation returns to editor', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'Unsaved');

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    // Dialog should close, editor should remain
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('Escape key triggers cancel flow', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    await user.keyboard('{Escape}');

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('Escape key with unsaved changes shows confirmation', async () => {
    const user = userEvent.setup();
    render(<TranslationEditor {...defaultProps} />);

    const titleTextarea = screen.getByRole('textbox', { name: /title/i });
    await user.clear(titleTextarea);
    await user.type(titleTextarea, 'Changed');

    await user.keyboard('{Escape}');

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- [ ] Test Cancel with no changes calls onCancel directly
- [ ] Test Cancel with unsaved changes shows confirmation
- [ ] Test confirmation dialog offers Save, Discard, Cancel options
- [ ] Test Save in confirmation saves and closes
- [ ] Test Discard in confirmation discards and closes
- [ ] Test Cancel in confirmation returns to editor
- [ ] Test Escape key triggers cancel flow
- [ ] Test Escape key with unsaved changes shows confirmation

---

#### Sub-task 3.7: Implement Accessibility Tests

**Actions:**
1. Add accessibility test cases:

```typescript
// =============================================================================
// Accessibility Tests
// =============================================================================

describe('Accessibility', () => {
  it('modal has role="dialog" and aria-modal="true"', () => {
    render(<TranslationEditor {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has proper aria-labelledby', () => {
    render(<TranslationEditor {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)).toBeInTheDocument();
  });

  it('has proper aria-describedby', () => {
    render(<TranslationEditor {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    const descId = dialog.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();
    expect(document.getElementById(descId!)).toBeInTheDocument();
  });

  it('textareas have associated labels', () => {
    render(<TranslationEditor {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('buttons have accessible names', () => {
    render(<TranslationEditor {...defaultProps} />);

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- [ ] Test modal has role="dialog" and aria-modal="true"
- [ ] Test has proper aria-labelledby
- [ ] Test has proper aria-describedby
- [ ] Test textareas have associated labels
- [ ] Test buttons have accessible names

---

### Task 4: Create TranslationStatusWidget Test Suite

**File to Create:** `/src/components/TranslationManagement/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx`

**Objective:** Comprehensive test suite for the TranslationStatusWidget component covering summary counts, progress bar, data updates, and navigation.

#### Sub-task 4.1: Set Up TranslationStatusWidget Test File

**Actions:**
1. Create the `__tests__` directory at `/src/components/TranslationManagement/TranslationStatusWidget/__tests__/`
2. Create `TranslationStatusWidget.test.tsx` with test setup:

```typescript
/**
 * Unit Tests for TranslationStatusWidget Component
 *
 * Tests cover:
 * - Summary count display
 * - Progress bar rendering
 * - Data update handling
 * - Navigation functionality
 * - Accessibility compliance
 *
 * @module TranslationManagement/TranslationStatusWidget/__tests__
 * @lastModified 2026-01-19
 * @requestId REQ-366
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationStatusWidget } from '../TranslationStatusWidget';
import {
  createWidgetProps,
  createMockTranslationSummary,
} from '../../__tests__/test-utils';

// =============================================================================
// Mock Setup
// =============================================================================

const mockSummary = createMockTranslationSummary();
const mockRefetch = vi.fn();

vi.mock('@/hooks/useTranslationStatus', () => ({
  useTranslationStatus: vi.fn(() => ({
    isLoading: false,
    error: null,
    summary: mockSummary,
    refetch: mockRefetch,
  })),
}));

// =============================================================================
// Test Setup
// =============================================================================

const mockOnViewDetails = vi.fn();

const defaultProps = createWidgetProps({
  onViewDetails: mockOnViewDetails,
});

beforeEach(() => {
  vi.clearAllMocks();
});
```

**Acceptance Criteria:**
- [ ] Test file created at correct location
- [ ] All necessary imports added
- [ ] Mock setup complete
- [ ] Default props configured

---

#### Sub-task 4.2: Implement Summary Count Tests

**Actions:**
1. Add summary count test cases:

```typescript
// =============================================================================
// Summary Count Tests
// =============================================================================

describe('Summary Counts', () => {
  it('displays count of complete translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ complete: 15 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    expect(screen.getByTestId('complete-count')).toHaveTextContent('15');
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
  });

  it('displays count of partial translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ partial: 8 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    expect(screen.getByTestId('partial-count')).toHaveTextContent('8');
    expect(screen.getByText(/partial/i)).toBeInTheDocument();
  });

  it('displays count of pending translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ pending: 5 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    expect(screen.getByTestId('pending-count')).toHaveTextContent('5');
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it('displays count of failed translations', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ failed: 3 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    expect(screen.getByTestId('failed-count')).toHaveTextContent('3');
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });

  it('shows "0" appropriately when no items in category', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ failed: 0, pending: 0 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    expect(screen.getByTestId('failed-count')).toHaveTextContent('0');
    expect(screen.getByTestId('pending-count')).toHaveTextContent('0');
  });

  it('handles zero total translations gracefully', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({
        total: 0,
        complete: 0,
        partial: 0,
        pending: 0,
        failed: 0,
      }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    // Should render without error
    expect(screen.getByTestId('complete-count')).toHaveTextContent('0');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- [ ] Test displays complete translations count
- [ ] Test displays partial translations count
- [ ] Test displays pending translations count
- [ ] Test displays failed translations count
- [ ] Test shows "0" for empty categories
- [ ] Test handles zero total translations

---

#### Sub-task 4.3: Implement Progress Bar Tests

**Actions:**
1. Add progress bar test cases:

```typescript
// =============================================================================
// Progress Bar Tests
// =============================================================================

describe('Progress Bar', () => {
  it('fills proportionally to completion percentage', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ total: 20, complete: 10 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('shows 0% for empty bar', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ total: 10, complete: 0 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows 100% for full bar', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ total: 15, complete: 15 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows 50% for half-filled bar', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ total: 100, complete: 50 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('has correct ARIA attributes', () => {
    render(<TranslationStatusWidget {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(progressBar).toHaveAttribute('aria-valuenow');
    expect(progressBar).toHaveAttribute('aria-label');
  });
});
```

**Acceptance Criteria:**
- [ ] Test progress bar fills proportionally
- [ ] Test 0% for empty bar
- [ ] Test 100% for full bar
- [ ] Test 50% for half-filled bar
- [ ] Test progress bar has correct ARIA attributes

---

#### Sub-task 4.4: Implement Data Update Tests

**Actions:**
1. Add data update test cases:

```typescript
// =============================================================================
// Data Update Tests
// =============================================================================

describe('Data Updates', () => {
  it('displays loading state while fetching data', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: true,
      error: null,
      summary: null,
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    expect(screen.getByTestId('widget-loading')).toBeInTheDocument();
  });

  it('displays error state on fetch failure', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: 'Failed to fetch translation status',
      summary: null,
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('displays empty state when no content exists', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ total: 0 }),
      refetch: mockRefetch,
    });

    render(<TranslationStatusWidget {...defaultProps} />);

    expect(screen.getByText(/no content/i)).toBeInTheDocument();
  });

  it('re-renders when status counts change', async () => {
    const { useTranslationStatus } = await import('@/hooks/useTranslationStatus');

    // Initial render
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ complete: 5 }),
      refetch: mockRefetch,
    });

    const { rerender } = render(<TranslationStatusWidget {...defaultProps} />);
    expect(screen.getByTestId('complete-count')).toHaveTextContent('5');

    // Update mock and rerender
    vi.mocked(useTranslationStatus).mockReturnValue({
      isLoading: false,
      error: null,
      summary: createMockTranslationSummary({ complete: 10 }),
      refetch: mockRefetch,
    });

    rerender(<TranslationStatusWidget {...defaultProps} />);
    expect(screen.getByTestId('complete-count')).toHaveTextContent('10');
  });
});
```

**Acceptance Criteria:**
- [ ] Test loading state displayed
- [ ] Test error state displayed on failure
- [ ] Test empty state when no content
- [ ] Test UI re-renders when counts change

---

#### Sub-task 4.5: Implement Navigation Tests

**Actions:**
1. Add navigation test cases:

```typescript
// =============================================================================
// Navigation Tests
// =============================================================================

describe('Navigation', () => {
  it('renders View Details link/button', () => {
    render(<TranslationStatusWidget {...defaultProps} />);

    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
  });

  it('clicking View Details calls onViewDetails callback', async () => {
    const user = userEvent.setup();
    render(<TranslationStatusWidget {...defaultProps} />);

    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    await user.click(viewDetailsButton);

    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('View Details button is keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<TranslationStatusWidget {...defaultProps} />);

    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    viewDetailsButton.focus();

    await user.keyboard('{Enter}');

    expect(mockOnViewDetails).toHaveBeenCalled();
  });
});
```

**Acceptance Criteria:**
- [ ] Test View Details button is rendered
- [ ] Test clicking View Details calls callback
- [ ] Test View Details is keyboard accessible

---

#### Sub-task 4.6: Implement Accessibility Tests

**Actions:**
1. Add accessibility test cases:

```typescript
// =============================================================================
// Accessibility Tests
// =============================================================================

describe('Accessibility', () => {
  it('widget has appropriate heading structure', () => {
    render(<TranslationStatusWidget {...defaultProps} />);

    const heading = screen.getByRole('heading', { name: /translation/i });
    expect(heading).toBeInTheDocument();
  });

  it('status counts have clear labels', () => {
    render(<TranslationStatusWidget {...defaultProps} />);

    // Each count should be associated with a label
    expect(screen.getByText(/complete/i)).toBeInTheDocument();
    expect(screen.getByText(/partial/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });

  it('progress bar has descriptive aria-label', () => {
    render(<TranslationStatusWidget {...defaultProps} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-label')).toMatch(/translation.*progress/i);
  });

  it('interactive elements are focusable', () => {
    render(<TranslationStatusWidget {...defaultProps} />);

    const viewDetailsButton = screen.getByRole('button', { name: /view details/i });
    expect(viewDetailsButton).not.toHaveAttribute('tabindex', '-1');
  });
});
```

**Acceptance Criteria:**
- [ ] Test widget has appropriate heading structure
- [ ] Test status counts have clear labels
- [ ] Test progress bar has descriptive aria-label
- [ ] Test interactive elements are focusable

---

### Task 5: Update Vitest Configuration

**File to Modify:** `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/vitest.config.ts`

**Objective:** Add TranslationManagement components to coverage include paths.

#### Sub-task 5.1: Update Coverage Configuration

**Actions:**
1. Add TranslationManagement to the coverage include array:

**Current:**
```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: [
    'src/components/ItemCreationWorkflow/**/*.ts',
    'src/components/ItemCreationWorkflow/**/*.tsx',
    'src/lib/job-queue/**/*.ts',
    'src/lib/translation-service/**/*.ts',
  ],
  exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
},
```

**Updated:**
```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: [
    'src/components/ItemCreationWorkflow/**/*.ts',
    'src/components/ItemCreationWorkflow/**/*.tsx',
    'src/components/TranslationManagement/**/*.ts',   // Added for REQ-366
    'src/components/TranslationManagement/**/*.tsx',  // Added for REQ-366
    'src/lib/job-queue/**/*.ts',
    'src/lib/translation-service/**/*.ts',
  ],
  exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
},
```

**Acceptance Criteria:**
- [ ] TranslationManagement TypeScript files added to coverage
- [ ] TranslationManagement TSX files added to coverage
- [ ] Configuration comment includes request ID

---

## Verification Steps

After completing all tasks, verify the implementation:

### Run Tests
```bash
# Run all TranslationManagement tests
npm test -- --filter="TranslationManagement"

# Run with coverage
npm test -- --coverage --filter="TranslationManagement"

# Run specific test file
npm test -- src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationPreviewPanel.test.tsx
```

### Expected Coverage Targets
- **TranslationPreviewPanel:** >80% line coverage
- **TranslationEditor:** >80% line coverage
- **TranslationStatusWidget:** >80% line coverage

### Test Count Expectations
- TranslationPreviewPanel: ~25-30 tests
- TranslationEditor: ~20-25 tests
- TranslationStatusWidget: ~15-20 tests
- Total: ~60-75 tests

---

## Files Summary

### Files to Create

| File Path | Task |
|-----------|------|
| `/src/components/TranslationManagement/__tests__/test-utils.ts` | Task 1 |
| `/src/components/TranslationManagement/TranslationPreviewPanel/__tests__/TranslationPreviewPanel.test.tsx` | Task 2 |
| `/src/components/TranslationManagement/TranslationEditor/__tests__/TranslationEditor.test.tsx` | Task 3 |
| `/src/components/TranslationManagement/TranslationStatusWidget/__tests__/TranslationStatusWidget.test.tsx` | Task 4 |

### Files to Modify

| File Path | Task |
|-----------|------|
| `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/vitest.config.ts` | Task 5 |

---

## Dependency Graph

```
Task 1 (test-utils.ts)
    ├── Task 2 (TranslationPreviewPanel.test.tsx)
    ├── Task 3 (TranslationEditor.test.tsx)
    └── Task 4 (TranslationStatusWidget.test.tsx)

Task 5 (vitest.config.ts) - Independent

Note: Tasks 2, 3, 4 depend on Task 1 completion.
      Task 5 can be completed at any time.
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Components not yet implemented | Verify component files exist before writing tests; use `describe.skip()` for missing components |
| Complex async flows | Use `waitFor`, `findBy*` queries; mock async operations properly |
| Flaky tests due to timing | Avoid `setTimeout` in tests; use Testing Library's async utilities |
| Mock drift from implementation | Keep mocks minimal; test component contracts, not internal implementation |
| Test file organization confusion | Follow established project patterns exactly |

---

## References

- **Overview Document:** `docs/REQ-366-write-component-tests-overview.md`
- **Implementation Plan:** `docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Test Pattern Reference:** `src/components/ItemManager/components/ItemPreview/__tests__/ItemPreviewModal.test.tsx`
- **Dialog Test Pattern:** `src/components/ItemCreationWorkflow/components/shared/__tests__/ConfirmExitDialog.test.tsx`
- **Vitest Configuration:** `vitest.config.ts`
- **Testing Library Docs:** https://testing-library.com/docs/react-testing-library/intro/
- **Vitest Docs:** https://vitest.dev/guide/
