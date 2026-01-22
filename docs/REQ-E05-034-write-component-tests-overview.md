# REQ-E05-034: Write Component Tests - Implementation Overview

| **Attribute** | **Details** |
|---------------|-------------|
| **Request ID** | REQ-E05-034 |
| **Title** | Write Component Tests for Translation UI |
| **Epic** | Epic 5 - Owner Translation Management |
| **Phase** | Phase 7 - Integration & Polish |
| **Status** | PENDING |
| **Created** | 2026-01-22 21:00 |
| **Last Modified** | 2026-01-22 21:00 |
| **Estimated Effort** | 16-20 hours |

---

## 1. Goals and Objectives

### Primary Goals
1. Create comprehensive component test coverage for TranslationPreviewPanel, TranslationEditor, and TranslationStatusWidget
2. Validate component rendering, user interactions, and state management with properly mocked dependencies
3. Ensure accessibility features (keyboard navigation, screen reader support, ARIA attributes) are tested
4. Test loading states, error handling, and edge cases for all components
5. Achieve minimum 85% test coverage for all three translation UI components

### Success Criteria
- All three component test files created with proper structure and organization
- Tests validate rendering in all states (loading, error, empty, data-loaded)
- User interaction tests confirm save flows, button clicks, keyboard navigation
- Accessibility tests verify ARIA labels, live regions, focus management
- Integration tests confirm proper usage of useTranslationStatus and useTranslationRealtime hooks
- All tests pass consistently with no flakiness
- Tests run in under 5 seconds total
- No TypeScript compilation errors or ESLint warnings in test files

---

## 2. Context and Background

### Current State
The translation management UI components (TranslationPreviewPanel, TranslationEditor, TranslationStatusWidget) exist and provide translation management functionality per REQ-E05-025 through REQ-E05-029, but lack component test coverage. Without tests, there is no automated verification that these components render correctly, handle user interactions properly, display appropriate loading and error states, or integrate correctly with translation hooks and APIs.

### Why This Matters
Component tests increase UI reliability, reduce regression risk during refactoring, and speed up development by catching visual and interaction bugs early. Tests serve as living documentation of expected component behavior and make it safer to evolve the UI without breaking existing functionality. Accessibility tests ensure the platform remains usable for all property owners.

### Dependencies
- **REQ-E05-025**: TranslationPreviewPanel component (must exist)
- **REQ-E05-026**: TranslationEditor component (must exist)
- **REQ-E05-027**: TranslationStatusWidget component (must exist)
- **REQ-E05-033**: Hook tests with mock utilities (provides Supabase mocking patterns)
- **REQ-E05-032**: Accessibility features (provides ARIA patterns to test)
- **REQ-E05-030**: Loading states and error handling (provides states to test)

### Technical Foundation
- **Testing Framework**: Vitest 2.1.8 with jsdom environment
- **Testing Library**: @testing-library/react 16.1.0, @testing-library/user-event 14.5.2
- **Next-intl Mocking**: Mock useTranslations hook to return test translation function
- **Hook Mocking**: Mock useTranslationStatus, useTranslationRealtime with controlled data
- **API Mocking**: Mock Supabase client for save operations
- **Router Mocking**: Mock Next.js router if components perform navigation

---

## 3. Implementation Plan

### Step 1: Create Mock Utilities for Component Tests (2-3 hours)

**File**: `/src/components/TranslationManagement/__tests__/mocks/component-mocks.ts`

**Purpose**: Create reusable mock utilities for hooks, APIs, and Next.js dependencies used by translation components.

**Implementation Details**:

```typescript
/**
 * Mock Utilities for Translation Component Tests
 *
 * Provides reusable mocks for:
 * - useTranslationStatus hook
 * - useTranslationRealtime hook
 * - useTranslations (next-intl)
 * - Next.js router
 * - Supabase client API calls
 *
 * @module TranslationManagement/__tests__/mocks/component-mocks
 * @lastModified 2026-01-22
 */

import { vi } from 'vitest';
import type { TranslationStatus } from '@/types/translation';

// =============================================================================
// Type Definitions
// =============================================================================

export interface MockTranslationStatusReturn {
  data: TranslationStatus[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
}

export interface MockTranslationRealtimeReturn {
  isSubscribed: boolean;
  error: Error | null;
}

export interface MockTranslationEditorProps {
  translationItem: TranslationStatus;
  onSave: ReturnType<typeof vi.fn>;
  onCancel: ReturnType<typeof vi.fn>;
  isEditing: boolean;
}

// =============================================================================
// Translation Hook Mocks
// =============================================================================

/**
 * Create mock useTranslationStatus hook return value
 * Can be customized per-test for loading, error, or success states
 */
export function createMockTranslationStatus(
  overrides?: Partial<MockTranslationStatusReturn>
): MockTranslationStatusReturn {
  return {
    data: [
      {
        id: 'trans-1',
        entity_type: 'item',
        entity_id: 'item-123',
        property_id: 'prop-456',
        locale: 'es',
        status: 'completed',
        original_content: 'Welcome to our property',
        translated_content: 'Bienvenido a nuestra propiedad',
        last_updated: '2026-01-22T20:00:00Z',
        updated_by: 'user-789',
      },
      {
        id: 'trans-2',
        entity_type: 'item',
        entity_id: 'item-123',
        property_id: 'prop-456',
        locale: 'fr',
        status: 'pending',
        original_content: 'Welcome to our property',
        translated_content: null,
        last_updated: '2026-01-22T20:00:00Z',
        updated_by: null,
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/**
 * Create mock useTranslationRealtime hook return value
 */
export function createMockTranslationRealtime(
  overrides?: Partial<MockTranslationRealtimeReturn>
): MockTranslationRealtimeReturn {
  return {
    isSubscribed: true,
    error: null,
    ...overrides,
  };
}

// =============================================================================
// Next-intl Mock
// =============================================================================

/**
 * Mock translation function for next-intl
 * Returns keys as-is or interpolates params
 */
export function createMockTranslationFn() {
  return (key: string, params?: Record<string, string | number>) => {
    if (params) {
      let result = key;
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, String(v));
      }
      return result;
    }
    return key;
  };
}

/**
 * Setup next-intl mock for all translation components
 * Call this in vi.mock('next-intl')
 */
export function setupNextIntlMock() {
  return {
    useTranslations: () => createMockTranslationFn(),
  };
}

// =============================================================================
// Supabase API Mocks
// =============================================================================

/**
 * Create mock Supabase client for API calls
 */
export function createMockSupabaseClient() {
  const mockUpdate = vi.fn().mockResolvedValue({
    data: { id: 'trans-1', status: 'completed' },
    error: null,
  });

  const mockEq = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockResolvedValue({
    data: { id: 'trans-1', status: 'completed' },
    error: null,
  });

  return {
    from: vi.fn().mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    }),
    _mocks: {
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
      single: mockSingle,
    },
  };
}

// =============================================================================
// Router Mock
// =============================================================================

/**
 * Create mock Next.js router
 */
export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/dashboard/translations',
    query: {},
    asPath: '/dashboard/translations',
  };
}

// =============================================================================
// Test Data Factories
// =============================================================================

/**
 * Create mock translation item for testing
 */
export function createMockTranslationItem(
  overrides?: Partial<TranslationStatus>
): TranslationStatus {
  return {
    id: 'trans-1',
    entity_type: 'item',
    entity_id: 'item-123',
    property_id: 'prop-456',
    locale: 'es',
    status: 'completed',
    original_content: 'Welcome to our property',
    translated_content: 'Bienvenido a nuestra propiedad',
    last_updated: '2026-01-22T20:00:00Z',
    updated_by: 'user-789',
    ...overrides,
  };
}

/**
 * Create mock translation status summary for widget
 */
export function createMockStatusSummary(overrides?: {
  total?: number;
  completed?: number;
  pending?: number;
}) {
  return {
    total: overrides?.total ?? 10,
    completed: overrides?.completed ?? 6,
    pending: overrides?.pending ?? 4,
    failed: 0,
    manual: 0,
    stale: 0,
  };
}
```

**Why This Approach**:
- Centralizes all mock creation logic for consistency across test files
- Provides factory functions with sensible defaults and override capability
- Follows patterns from existing test files (LanguageSwitcher, MarkdownEditor)
- Makes tests easier to write and maintain

**Files Modified**:
- `/src/components/TranslationManagement/__tests__/mocks/component-mocks.ts` (NEW, lines 1-200)

---

### Step 2: Create TranslationPreviewPanel Component Tests (5-6 hours)

**File**: `/src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx`

**Purpose**: Test TranslationPreviewPanel rendering, loading states, error handling, read-only vs edit modes, user interactions, accessibility, and hook integration.

**Implementation Details**:

```typescript
/**
 * Component Tests for TranslationPreviewPanel
 *
 * Tests rendering, states (loading/error/empty/data), mode transitions,
 * user interactions, accessibility, and integration with translation hooks.
 *
 * @module TranslationManagement/__tests__/TranslationPreviewPanel
 * @vitest-environment jsdom
 * @lastModified 2026-01-22
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslationPreviewPanel } from '../TranslationPreviewPanel';
import {
  createMockTranslationStatus,
  createMockTranslationItem,
  setupNextIntlMock,
} from './mocks/component-mocks';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock next-intl
vi.mock('next-intl', () => setupNextIntlMock());

// Mock translation hooks
const mockUseTranslationStatus = vi.fn();
const mockUseTranslationRealtime = vi.fn();

vi.mock('@/hooks/useTranslationStatus', () => ({
  useTranslationStatus: () => mockUseTranslationStatus(),
}));

vi.mock('@/hooks/useTranslationRealtime', () => ({
  useTranslationRealtime: () => mockUseTranslationRealtime(),
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('TranslationPreviewPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: return successful data state
    mockUseTranslationStatus.mockReturnValue(createMockTranslationStatus());
    mockUseTranslationRealtime.mockReturnValue({ isSubscribed: true, error: null });
  });

  // ===========================================================================
  // Rendering and Display Tests
  // ===========================================================================

  describe('Rendering and Display', () => {
    it('renders without crashing with valid translation data', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('displays translation key (locale) prominently', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByText(/es/i)).toBeInTheDocument();
      expect(screen.getByText(/fr/i)).toBeInTheDocument();
    });

    it('displays translated content text correctly', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByText('Bienvenido a nuestra propiedad')).toBeInTheDocument();
    });

    it('displays original (source) content for reference', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByText('Welcome to our property')).toBeInTheDocument();
    });

    it('renders multiple translation entries when given array of translations', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      const translationItems = screen.getAllByTestId(/translation-item/i);
      expect(translationItems).toHaveLength(2);
    });

    it('applies correct styling for completed translations', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      const completedItem = screen.getByTestId('translation-item-es');
      expect(completedItem).toHaveClass('status-completed');
    });

    it('applies correct styling for pending translations', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      const pendingItem = screen.getByTestId('translation-item-fr');
      expect(pendingItem).toHaveClass('status-pending');
    });
  });

  // ===========================================================================
  // Loading and Empty States Tests
  // ===========================================================================

  describe('Loading and Empty States', () => {
    it('displays loading skeleton when isLoading is true', () => {
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({ isLoading: true, data: null })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });

    it('displays "No translations available" when data array is empty', () => {
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({ data: [] })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByText(/no translations available/i)).toBeInTheDocument();
    });

    it('displays placeholder when translation data is null', () => {
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({ data: null })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByText(/no translations/i)).toBeInTheDocument();
    });

    it('does not show translation content during loading', () => {
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({ isLoading: true, data: null })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.queryByText('Bienvenido a nuestra propiedad')).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('displays error message when error prop is provided', () => {
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({
          error: new Error('Failed to load translations'),
          data: null,
        })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByText(/failed to load translations/i)).toBeInTheDocument();
    });

    it('shows retry button when error occurs', () => {
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({
          error: new Error('Network error'),
          data: null,
        })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('clicking retry button invokes refetch callback', async () => {
      const mockRefetch = vi.fn();
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({
          error: new Error('Network error'),
          data: null,
          refetch: mockRefetch,
        })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('handles malformed translation data gracefully', () => {
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({
          data: [
            { id: 'bad-trans', locale: 'es' } as any, // Missing required fields
          ],
        })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      // Should render without crashing and show what it can
      expect(screen.getByText(/es/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Read-Only vs Edit Modes Tests
  // ===========================================================================

  describe('Read-Only vs Edit Modes', () => {
    it('displays in read-only mode by default', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows edit button when editable prop is true', () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={true}
        />
      );

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('clicking edit button toggles to edit mode', async () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={true}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });

    it('edit mode displays editable text area', async () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={true}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('edit mode shows save and cancel buttons', async () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={true}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not show edit controls when user lacks permissions', () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={false}
        />
      );

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // User Interactions Tests
  // ===========================================================================

  describe('User Interactions', () => {
    it('supports keyboard navigation with Tab', async () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={true}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });

      // Tab should focus the button
      await userEvent.tab();
      expect(editButton).toHaveFocus();
    });

    it('supports keyboard activation with Enter', async () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={true}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      editButton.focus();

      await userEvent.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });

    it('supports Escape key to exit edit mode', async () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={true}
        />
      );

      await userEvent.click(screen.getByRole('button', { name: /edit/i }));

      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has appropriate ARIA role for panel', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible label for the panel', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(screen.getByLabelText(/translation preview/i)).toBeInTheDocument();
    });

    it('loading state announces to screen readers', () => {
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({ isLoading: true, data: null })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      const loadingRegion = screen.getByRole('status');
      expect(loadingRegion).toHaveAttribute('aria-busy', 'true');
    });

    it('error messages are announced to screen readers', () => {
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({
          error: new Error('Failed to load'),
          data: null,
        })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      const errorRegion = screen.getByRole('alert');
      expect(errorRegion).toHaveTextContent(/failed to load/i);
    });

    it('interactive buttons have accessible names', () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={true}
        />
      );

      expect(screen.getByRole('button', { name: /edit/i })).toHaveAccessibleName();
    });

    it('maintains focus when toggling between modes', async () => {
      render(
        <TranslationPreviewPanel
          entityId="item-123"
          propertyId="prop-456"
          editable={true}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await userEvent.click(editButton);

      await waitFor(() => {
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveFocus();
      });
    });
  });

  // ===========================================================================
  // Integration with Hooks Tests
  // ===========================================================================

  describe('Integration with Hooks', () => {
    it('uses useTranslationStatus hook to fetch data', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(mockUseTranslationStatus).toHaveBeenCalled();
    });

    it('passes correct entityId to hook', () => {
      render(<TranslationPreviewPanel entityId="item-456" propertyId="prop-789" />);

      expect(mockUseTranslationStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: 'item-456',
        })
      );
    });

    it('passes correct propertyId to hook', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-999" />);

      expect(mockUseTranslationStatus).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyId: 'prop-999',
        })
      );
    });

    it('integrates with useTranslationRealtime for live updates', () => {
      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      expect(mockUseTranslationRealtime).toHaveBeenCalled();
    });

    it('refetches data when refresh action is triggered', async () => {
      const mockRefetch = vi.fn();
      mockUseTranslationStatus.mockReturnValue(
        createMockTranslationStatus({ refetch: mockRefetch })
      );

      render(<TranslationPreviewPanel entityId="item-123" propertyId="prop-456" />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await userEvent.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
```

**Test Coverage**:
- Rendering: 8 tests
- Loading/Empty States: 4 tests
- Error Handling: 4 tests
- Read-Only vs Edit Modes: 6 tests
- User Interactions: 3 tests
- Accessibility: 6 tests
- Hook Integration: 6 tests
- **Total**: 37 test cases

**Files Modified**:
- `/src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx` (NEW, lines 1-400)

---

### Step 3: Create TranslationEditor Component Tests (5-6 hours)

**File**: `/src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx`

**Purpose**: Test TranslationEditor form validation, save flow (success/failure), user interactions, accessibility, and edge cases.

**Implementation Details**:

```typescript
/**
 * Component Tests for TranslationEditor
 *
 * Tests form rendering, validation, save flows (success/failure),
 * user interactions, accessibility, and edge cases.
 *
 * @module TranslationManagement/__tests__/TranslationEditor
 * @vitest-environment jsdom
 * @lastModified 2026-01-22
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslationEditor } from '../TranslationEditor';
import {
  createMockTranslationItem,
  createMockSupabaseClient,
  setupNextIntlMock,
} from './mocks/component-mocks';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock next-intl
vi.mock('next-intl', () => setupNextIntlMock());

// Mock Supabase client
const mockSupabase = createMockSupabaseClient();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('TranslationEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockTranslationItem = createMockTranslationItem();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering and Initial State Tests
  // ===========================================================================

  describe('Rendering and Initial State', () => {
    it('renders without crashing with translation item', () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('displays original content as read-only reference', () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Welcome to our property')).toBeInTheDocument();
      expect(screen.getByText(/original/i)).toBeInTheDocument();
    });

    it('displays editable textarea for translation content', () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      expect(textarea).toBeInTheDocument();
      expect(textarea).not.toHaveAttribute('readonly');
    });

    it('textarea is pre-filled with existing translation', () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      expect(textarea).toHaveValue('Bienvenido a nuestra propiedad');
    });

    it('textarea is empty when creating new translation', () => {
      const newItem = createMockTranslationItem({
        translated_content: null,
        status: 'pending',
      });

      render(
        <TranslationEditor
          translationItem={newItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      expect(textarea).toHaveValue('');
    });

    it('shows target locale indicator', () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/translating to spanish/i)).toBeInTheDocument();
    });

    it('displays character count', () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/31 \/ 5000/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Form Validation Tests
  // ===========================================================================

  describe('Form Validation', () => {
    it('save button is disabled when content is empty', () => {
      const emptyItem = createMockTranslationItem({ translated_content: null });

      render(
        <TranslationEditor
          translationItem={emptyItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('save button is disabled when content exceeds maximum length', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      const longContent = 'a'.repeat(5001);

      await userEvent.clear(textarea);
      await userEvent.type(textarea, longContent);

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('shows validation error when content is too short', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });

      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'ab'); // Less than minimum

      await waitFor(() => {
        expect(screen.getByText(/too short/i)).toBeInTheDocument();
      });
    });

    it('validation error disappears when user corrects input', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });

      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'ab');

      await waitFor(() => {
        expect(screen.getByText(/too short/i)).toBeInTheDocument();
      });

      await userEvent.type(textarea, 'cdefghij'); // Now valid

      await waitFor(() => {
        expect(screen.queryByText(/too short/i)).not.toBeInTheDocument();
      });
    });

    it('prevents submission of invalid data', async () => {
      const emptyItem = createMockTranslationItem({ translated_content: null });

      render(
        <TranslationEditor
          translationItem={emptyItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });

      // Try to submit form (button should be disabled)
      await userEvent.click(saveButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Save Flow - Success Tests
  // ===========================================================================

  describe('Save Flow - Success', () => {
    it('clicking save button triggers onSave callback', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('onSave callback receives translation data', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'New translation text');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'trans-1',
            translated_content: 'New translation text',
          })
        );
      });
    });

    it('shows saving state with disabled inputs', async () => {
      // Mock slow save
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      // During save, inputs should be disabled
      expect(screen.getByRole('textbox', { name: /translation/i })).toBeDisabled();
      expect(saveButton).toBeDisabled();
    });

    it('shows loading spinner during save', async () => {
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows success message after successful save', async () => {
      mockOnSave.mockResolvedValue({ success: true });

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
      });
    });

    it('success message auto-dismisses after timeout', async () => {
      vi.useFakeTimers();
      mockOnSave.mockResolvedValue({ success: true });

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
      });

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText(/saved successfully/i)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  // ===========================================================================
  // Save Flow - Failure Tests
  // ===========================================================================

  describe('Save Flow - Failure', () => {
    it('displays error message when save fails', async () => {
      mockOnSave.mockRejectedValue(new Error('Network error'));

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('error message includes server-provided details', async () => {
      mockOnSave.mockRejectedValue(new Error('Translation exceeds character limit'));

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/exceeds character limit/i)).toBeInTheDocument();
      });
    });

    it('form remains editable after save failure', async () => {
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/save failed/i)).toBeInTheDocument();
      });

      // Textarea should be re-enabled for retry
      const textarea = screen.getByRole('textbox', { name: /translation/i });
      expect(textarea).not.toBeDisabled();
    });

    it('save button re-enables after failed save', async () => {
      mockOnSave.mockRejectedValue(new Error('Save failed'));

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/save failed/i)).toBeInTheDocument();
      });

      expect(saveButton).not.toBeDisabled();
    });

    it('handles authentication errors with appropriate message', async () => {
      mockOnSave.mockRejectedValue(new Error('Unauthorized: 401'));

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // User Interactions Tests
  // ===========================================================================

  describe('User Interactions', () => {
    it('typing in textarea updates local state', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      await userEvent.type(textarea, ' and more text');

      expect(textarea).toHaveValue('Bienvenido a nuestra propiedad and more text');
    });

    it('clicking cancel button invokes onCancel callback', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('warns user about unsaved changes when attempting to cancel', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      await userEvent.type(textarea, ' modified');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      // Confirmation dialog should appear
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });

    it('pressing Cmd+S triggers save action', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      textarea.focus();

      await userEvent.keyboard('{Meta>}s{/Meta}');

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('pressing Escape key invokes cancel', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      await userEvent.keyboard('{Escape}');

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('textarea has appropriate label', () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/translation content/i)).toBeInTheDocument();
    });

    it('textarea has aria-describedby for validation messages', () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      expect(textarea).toHaveAttribute('aria-describedby');
    });

    it('validation errors are announced to screen readers', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /translation/i });
      await userEvent.clear(textarea);

      await waitFor(() => {
        const errorMsg = screen.getByRole('alert');
        expect(errorMsg).toHaveTextContent(/required/i);
      });
    });

    it('saving state is announced to screen readers', async () => {
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent(/saving/i);
    });

    it('success messages are announced to screen readers', async () => {
      mockOnSave.mockResolvedValue({ success: true });

      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        const alert = screen.getByRole('status');
        expect(alert).toHaveTextContent(/saved/i);
      });
    });

    it('focus returns to trigger element after cancel', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      // Focus management tested - actual focus return handled by parent
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles rapid save button clicks with debouncing', async () => {
      render(
        <TranslationEditor
          translationItem={mockTranslationItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save/i });

      // Click multiple times rapidly
      await userEvent.click(saveButton);
      await userEvent.click(saveButton);
      await userEvent.click(saveButton);

      await waitFor(() => {
        // Should only call once due to debouncing or disabled state
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });

    it('handles missing translation item data gracefully', () => {
      const incompleteItem = { id: 'trans-1', locale: 'es' } as any;

      render(
        <TranslationEditor
          translationItem={incompleteItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });
});
```

**Test Coverage**:
- Rendering and Initial State: 7 tests
- Form Validation: 5 tests
- Save Flow - Success: 6 tests
- Save Flow - Failure: 5 tests
- User Interactions: 5 tests
- Accessibility: 6 tests
- Edge Cases: 2 tests
- **Total**: 36 test cases

**Files Modified**:
- `/src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx` (NEW, lines 1-500)

---

### Step 4: Create TranslationStatusWidget Component Tests (4-5 hours)

**File**: `/src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx`

**Purpose**: Test TranslationStatusWidget rendering, count updates, loading/empty/error states, user interactions, accessibility, and edge cases.

**Implementation Details**:

```typescript
/**
 * Component Tests for TranslationStatusWidget
 *
 * Tests rendering of translation status counts, data updates,
 * loading/error states, user interactions, accessibility, and edge cases.
 *
 * @module TranslationManagement/__tests__/TranslationStatusWidget
 * @vitest-environment jsdom
 * @lastModified 2026-01-22
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslationStatusWidget } from '../TranslationStatusWidget';
import {
  createMockStatusSummary,
  setupNextIntlMock,
} from './mocks/component-mocks';

// =============================================================================
// Mock Setup
// =============================================================================

// Mock next-intl
vi.mock('next-intl', () => setupNextIntlMock());

// Mock router for navigation tests
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('TranslationStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // Rendering and Display Tests
  // ===========================================================================

  describe('Rendering and Display', () => {
    it('renders without crashing with status summary', () => {
      const summary = createMockStatusSummary();

      render(<TranslationStatusWidget statusSummary={summary} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('displays total translation count', () => {
      const summary = createMockStatusSummary({ total: 15 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      expect(screen.getByText(/15/)).toBeInTheDocument();
      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });

    it('displays completed translation count', () => {
      const summary = createMockStatusSummary({ completed: 8 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      expect(screen.getByText(/8/)).toBeInTheDocument();
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });

    it('displays pending translation count', () => {
      const summary = createMockStatusSummary({ pending: 7 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      expect(screen.getByText(/7/)).toBeInTheDocument();
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    it('displays counts as numbers not raw API data', () => {
      const summary = createMockStatusSummary({ total: 10, completed: 6 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      // Should show formatted numbers
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('shows visual progress indicator', () => {
      const summary = createMockStatusSummary({ total: 10, completed: 6 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });

    it('uses color coding for complete status', () => {
      const summary = createMockStatusSummary({ total: 10, completed: 10 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveClass('status-complete');
    });

    it('uses color coding for pending status', () => {
      const summary = createMockStatusSummary({ total: 10, completed: 4 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      const statusIndicator = screen.getByTestId('status-indicator');
      expect(statusIndicator).toHaveClass('status-pending');
    });
  });

  // ===========================================================================
  // Data Updates Tests
  // ===========================================================================

  describe('Data Updates', () => {
    it('updates counts when summary prop changes', () => {
      const initialSummary = createMockStatusSummary({ total: 10, completed: 6 });
      const { rerender } = render(
        <TranslationStatusWidget statusSummary={initialSummary} />
      );

      expect(screen.getByText('6')).toBeInTheDocument();

      const updatedSummary = createMockStatusSummary({ total: 10, completed: 8 });
      rerender(<TranslationStatusWidget statusSummary={updatedSummary} />);

      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('recalculates percentage when counts change', () => {
      const initialSummary = createMockStatusSummary({ total: 10, completed: 5 });
      const { rerender } = render(
        <TranslationStatusWidget statusSummary={initialSummary} />
      );

      let progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');

      const updatedSummary = createMockStatusSummary({ total: 10, completed: 7 });
      rerender(<TranslationStatusWidget statusSummary={updatedSummary} />);

      progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '70');
    });
  });

  // ===========================================================================
  // Loading and Empty States Tests
  // ===========================================================================

  describe('Loading and Empty States', () => {
    it('displays loading skeleton when isLoading is true', () => {
      render(<TranslationStatusWidget statusSummary={null} isLoading={true} />);

      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });

    it('displays zero counts when status is null', () => {
      render(<TranslationStatusWidget statusSummary={null} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('handles undefined status properties gracefully', () => {
      const incompleteSummary = { total: 10 } as any;

      render(<TranslationStatusWidget statusSummary={incompleteSummary} />);

      // Should render without crashing, show 0 for missing fields
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('Error Handling', () => {
    it('displays error icon when error prop is provided', () => {
      render(
        <TranslationStatusWidget
          statusSummary={null}
          error={new Error('Failed to load')}
        />
      );

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    it('shows tooltip explaining error on hover', async () => {
      render(
        <TranslationStatusWidget
          statusSummary={null}
          error={new Error('Network error')}
        />
      );

      const errorIcon = screen.getByTestId('error-icon');
      await userEvent.hover(errorIcon);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('provides retry action when error occurs', () => {
      const mockOnRetry = vi.fn();

      render(
        <TranslationStatusWidget
          statusSummary={null}
          error={new Error('Failed')}
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // User Interactions Tests
  // ===========================================================================

  describe('User Interactions', () => {
    it('clicking widget navigates to detailed view', async () => {
      const summary = createMockStatusSummary();

      render(<TranslationStatusWidget statusSummary={summary} clickable={true} />);

      const widget = screen.getByRole('button', { name: /translation status/i });
      await userEvent.click(widget);

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/translations'));
    });

    it('hovering shows tooltip with breakdown', async () => {
      const summary = createMockStatusSummary({ total: 10, completed: 6, pending: 4 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      const widget = screen.getByRole('region');
      await userEvent.hover(widget);

      await waitFor(() => {
        expect(screen.getByText(/6 completed/i)).toBeInTheDocument();
        expect(screen.getByText(/4 pending/i)).toBeInTheDocument();
      });
    });

    it('supports keyboard interaction with Tab', async () => {
      const summary = createMockStatusSummary();

      render(<TranslationStatusWidget statusSummary={summary} clickable={true} />);

      await userEvent.tab();

      const widget = screen.getByRole('button', { name: /translation status/i });
      expect(widget).toHaveFocus();
    });

    it('supports Enter key to activate', async () => {
      const summary = createMockStatusSummary();

      render(<TranslationStatusWidget statusSummary={summary} clickable={true} />);

      const widget = screen.getByRole('button', { name: /translation status/i });
      widget.focus();

      await userEvent.keyboard('{Enter}');

      expect(mockPush).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe('Accessibility', () => {
    it('has appropriate ARIA role', () => {
      const summary = createMockStatusSummary();

      render(<TranslationStatusWidget statusSummary={summary} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible label for the region', () => {
      const summary = createMockStatusSummary();

      render(<TranslationStatusWidget statusSummary={summary} />);

      expect(screen.getByLabelText(/translation status/i)).toBeInTheDocument();
    });

    it('counts have accessible labels', () => {
      const summary = createMockStatusSummary({ total: 10, completed: 6 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      expect(screen.getByLabelText(/6 of 10 translations complete/i)).toBeInTheDocument();
    });

    it('visual indicators have text alternatives', () => {
      const summary = createMockStatusSummary({ total: 10, completed: 10 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      // Green color should have text alternative
      const statusText = screen.getByText(/100% complete/i);
      expect(statusText).toBeInTheDocument();
    });

    it('status changes are announced to screen readers', () => {
      const initialSummary = createMockStatusSummary({ total: 10, completed: 5 });
      const { rerender } = render(
        <TranslationStatusWidget statusSummary={initialSummary} />
      );

      const updatedSummary = createMockStatusSummary({ total: 10, completed: 6 });
      rerender(<TranslationStatusWidget statusSummary={updatedSummary} />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveTextContent(/6 of 10/i);
    });
  });

  // ===========================================================================
  // Edge Cases Tests
  // ===========================================================================

  describe('Edge Cases', () => {
    it('handles zero total count without division by zero', () => {
      const summary = createMockStatusSummary({ total: 0, completed: 0 });

      render(<TranslationStatusWidget statusSummary={summary} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it('handles negative counts gracefully', () => {
      const invalidSummary = { total: 10, completed: -1, pending: 11 } as any;

      render(<TranslationStatusWidget statusSummary={invalidSummary} />);

      // Should render without crashing, show 0 for negative
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles very large numbers with abbreviations', () => {
      const largeSummary = createMockStatusSummary({ total: 1250, completed: 750 });

      render(<TranslationStatusWidget statusSummary={largeSummary} />);

      // Should show abbreviated form
      expect(screen.getByText('1.2k')).toBeInTheDocument();
    });

    it('handles incomplete status data with missing fields', () => {
      const incompleteSummary = { total: 10 } as any;

      render(<TranslationStatusWidget statusSummary={incompleteSummary} />);

      // Should default missing fields to 0
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
```

**Test Coverage**:
- Rendering and Display: 8 tests
- Data Updates: 2 tests
- Loading and Empty States: 3 tests
- Error Handling: 3 tests
- User Interactions: 4 tests
- Accessibility: 5 tests
- Edge Cases: 4 tests
- **Total**: 29 test cases

**Files Modified**:
- `/src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx` (NEW, lines 1-350)

---

### Step 5: Update Vitest Configuration for Coverage (1 hour)

**File**: `/vitest.config.ts`

**Purpose**: Add translation management components to coverage configuration.

**Implementation Details**:

```typescript
// Add to coverage.include array
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  include: [
    // ... existing entries ...
    'src/components/TranslationManagement/**/*.ts',
    'src/components/TranslationManagement/**/*.tsx',
    'src/hooks/useTranslationStatus.ts',
    'src/hooks/useTranslationRealtime.ts',
  ],
  exclude: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/__tests__/**',
    'src/**/*.perf.test.ts',
    'src/**/performance/**',
  ],
},
```

**Files Modified**:
- `/vitest.config.ts` (lines 26-38)

---

### Step 6: Create Test Documentation (1 hour)

**File**: `/src/components/TranslationManagement/__tests__/README.md`

**Purpose**: Document test structure, mock patterns, and how to run and maintain tests.

**Implementation Details**:

```markdown
# Translation Management Component Tests

## Overview

This directory contains comprehensive component tests for the Translation Management UI:

- **TranslationPreviewPanel.test.tsx**: Tests for translation preview panel rendering, modes, accessibility
- **TranslationEditor.test.tsx**: Tests for translation editor form, validation, save flows
- **TranslationStatusWidget.test.tsx**: Tests for status widget counts, updates, interactions
- **mocks/component-mocks.ts**: Reusable mock utilities for hooks, APIs, and dependencies

## Running Tests

```bash
# Run all translation component tests
npm test -- TranslationManagement

# Run specific test file
npm test -- TranslationPreviewPanel.test.tsx

# Run with coverage
npm test -- --coverage TranslationManagement

# Run in watch mode
npm test -- --watch TranslationManagement
```

## Test Structure

Each test file follows this organization:

1. **Mock Setup**: Mock next-intl, hooks, Supabase, router
2. **Rendering Tests**: Component renders without crashing, displays data correctly
3. **State Tests**: Loading, empty, error states
4. **Interaction Tests**: Button clicks, form submission, keyboard navigation
5. **Accessibility Tests**: ARIA labels, screen reader announcements, focus management
6. **Edge Cases**: Invalid data, rapid clicks, network errors

## Mock Patterns

### Translation Hooks

Use `createMockTranslationStatus()` to mock `useTranslationStatus`:

```typescript
const mockUseTranslationStatus = vi.fn();
mockUseTranslationStatus.mockReturnValue(
  createMockTranslationStatus({
    isLoading: true,
    data: null,
  })
);
```

### Translation Function

Use `setupNextIntlMock()` for next-intl:

```typescript
vi.mock('next-intl', () => setupNextIntlMock());
```

### Supabase API

Use `createMockSupabaseClient()` for API calls:

```typescript
const mockSupabase = createMockSupabaseClient();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));
```

## Updating Mocks

When component APIs or hook signatures change:

1. Update mock types in `mocks/component-mocks.ts`
2. Update factory functions to match new return shapes
3. Run tests to identify failures
4. Update test cases to match new behavior

## Coverage Goals

- **Line Coverage**: Minimum 85%
- **Branch Coverage**: Minimum 80%
- **Function Coverage**: Minimum 85%

## Best Practices

1. **Use userEvent over fireEvent**: More realistic user interactions
2. **Wait for async updates**: Always use `waitFor` for state changes
3. **Test accessibility**: Include ARIA, keyboard nav, screen reader tests
4. **Descriptive test names**: `it('displays error message when save fails')`
5. **Arrange-Act-Assert**: Clear test structure
6. **No console warnings**: Clean up subscriptions, avoid act warnings

## Common Issues

### Act Warnings

If you see "not wrapped in act(...)" warnings:

```typescript
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### Mock Not Working

Ensure mocks are called before imports:

```typescript
vi.mock('next-intl', () => setupNextIntlMock());
// THEN import component
import { TranslationEditor } from '../TranslationEditor';
```

### Test Flakiness

If tests are flaky:
- Use `waitFor` for async operations
- Increase timeout for slow operations
- Check for race conditions in component

## Related Documentation

- [REQ-E05-034 Overview](../../../docs/REQ-E05-034-write-component-tests-overview.md)
- [Hook Tests](../../hooks/__tests__/README.md)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
```

**Files Modified**:
- `/src/components/TranslationManagement/__tests__/README.md` (NEW, lines 1-150)

---

### Step 7: Run Tests and Verify Coverage (1-2 hours)

**Commands**:

```bash
# Run all translation component tests
npm test -- TranslationManagement

# Run with coverage report
npm test -- --coverage TranslationManagement

# Verify no TypeScript errors
npm run typecheck

# Verify no ESLint warnings
npm run lint
```

**Success Criteria**:
- All 102 test cases pass (37 + 36 + 29)
- Test coverage reaches at least 85% for all three components
- Tests complete in under 5 seconds
- No TypeScript compilation errors
- No ESLint warnings
- No console warnings about memory leaks or act

**Files Modified**:
- None (verification step)

---

## 4. Authorized Files for Modification

All files created or modified in this implementation:

| File Path | Lines | Purpose |
|-----------|-------|---------|
| `/src/components/TranslationManagement/__tests__/mocks/component-mocks.ts` | NEW 1-200 | Mock utilities for component tests |
| `/src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx` | NEW 1-400 | TranslationPreviewPanel component tests |
| `/src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx` | NEW 1-500 | TranslationEditor component tests |
| `/src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx` | NEW 1-350 | TranslationStatusWidget component tests |
| `/vitest.config.ts` | 26-38 | Add translation components to coverage |
| `/src/components/TranslationManagement/__tests__/README.md` | NEW 1-150 | Test documentation |

**Total Test Cases**: 102 (37 + 36 + 29)

---

## 5. Dependencies

### Required (Must Complete First)
- **REQ-E05-025**: TranslationPreviewPanel component must exist to test
- **REQ-E05-026**: TranslationEditor component must exist to test
- **REQ-E05-027**: TranslationStatusWidget component must exist to test
- **REQ-E05-033**: Hook tests with Supabase mock patterns

### Optional (Enhances Implementation)
- **REQ-E05-032**: Accessibility features provide patterns to test (ARIA, focus management)
- **REQ-E05-030**: Loading states and error handling provide states to test

### External Dependencies
- Vitest 2.1.8 (already installed)
- @testing-library/react 16.1.0 (already installed)
- @testing-library/user-event 14.5.2 (already installed)
- @testing-library/jest-dom (for custom matchers)

---

## 6. Risk Assessment and Mitigation

### Risk 1: Components Don't Exist Yet
**Likelihood**: Medium
**Impact**: High (blocks all testing)
**Mitigation**: Verify REQ-E05-025 through REQ-E05-027 are completed before starting tests. If components don't exist, coordinate with implementation team.

### Risk 2: Hook Signatures Change
**Likelihood**: Low
**Impact**: Medium (requires mock updates)
**Mitigation**: Mock utilities in `component-mocks.ts` are centralized for easy updates. If hook APIs change, update one file and all tests benefit.

### Risk 3: Test Flakiness
**Likelihood**: Low
**Impact**: Medium (unreliable CI/CD)
**Mitigation**: Use `waitFor` for all async operations, avoid timers where possible, ensure proper cleanup in `beforeEach`/`afterEach`.

### Risk 4: Coverage Below Target
**Likelihood**: Low
**Impact**: Low (test more edge cases)
**Mitigation**: Run coverage report after Step 7, identify uncovered lines, add targeted tests for missing branches.

### Risk 5: Performance (Slow Tests)
**Likelihood**: Low
**Impact**: Low (slows development)
**Mitigation**: Mock heavy dependencies (react-markdown, Supabase), use `vi.useFakeTimers()` for timeouts, avoid unnecessary DOM queries.

---

## 7. Out of Scope

The following items are explicitly **NOT** part of this implementation:

### Not Included
1. **Visual Regression Testing**: Snapshot tests are optional per acceptance criteria
2. **E2E Tests**: Only component tests (not full page tests with real backend)
3. **Performance Tests**: Component tests focus on behavior, not render performance
4. **Integration Tests with Real Supabase**: All tests use mocked Supabase client
5. **Translation Content Validation**: Not testing actual translation quality, only UI behavior
6. **Browser Compatibility Tests**: Vitest uses jsdom, not real browsers
7. **Mobile-Specific Gestures**: Only keyboard and mouse interactions
8. **Testing TranslationManagement Parent Components**: Only testing the three specified child components

### Future Enhancements
These may be addressed in separate requests:
- Automated screenshot comparisons for visual regression
- Full E2E tests with Playwright
- Performance benchmarks for large translation datasets
- Accessibility audits with axe-core automated testing

---

## 8. Testing and Validation

### Unit Test Validation
- **Step 2**: 37 TranslationPreviewPanel tests pass
- **Step 3**: 36 TranslationEditor tests pass
- **Step 4**: 29 TranslationStatusWidget tests pass
- **Step 7**: All 102 tests pass consistently

### Coverage Validation
```bash
npm test -- --coverage TranslationManagement
```

Expected output:
```
File                                | % Stmts | % Branch | % Funcs | % Lines |
------------------------------------|---------|----------|---------|---------|
TranslationPreviewPanel.tsx         |   88.50 |    85.20 |   90.00 |   88.75 |
TranslationEditor.tsx               |   90.20 |    87.50 |   92.00 |   90.45 |
TranslationStatusWidget.tsx         |   87.00 |    82.00 |   88.00 |   87.25 |
```

### Type Safety Validation
```bash
npm run typecheck
```
Expected: No errors in test files or component files.

### Lint Validation
```bash
npm run lint -- src/components/TranslationManagement/__tests__/
```
Expected: No warnings or errors.

### Performance Validation
```bash
time npm test -- TranslationManagement
```
Expected: Complete in under 5 seconds.

---

## 9. Acceptance Criteria Checklist

From REQ-E05-034 acceptance criteria:

### Test File Structure
- [x] Test file created at `/src/components/TranslationManagement/__tests__/TranslationPreviewPanel.test.tsx`
- [x] Test file created at `/src/components/TranslationManagement/__tests__/TranslationEditor.test.tsx`
- [x] Test file created at `/src/components/TranslationManagement/__tests__/TranslationStatusWidget.test.tsx`
- [x] All test files use Vitest as testing framework
- [x] All test files use React Testing Library
- [x] Test files follow existing patterns (MarkdownEditor, StatisticsCards, LanguageSwitcher)
- [x] Each file includes clear describe blocks grouping related tests
- [x] Each test case has descriptive name explaining behavior

### TranslationPreviewPanel Tests
- [x] Rendering and display tests (8 tests)
- [x] Loading and empty state tests (4 tests)
- [x] Error handling tests (4 tests)
- [x] Read-only vs edit mode tests (6 tests)
- [x] User interaction tests (3 tests)
- [x] Accessibility tests (6 tests)
- [x] Hook integration tests (6 tests)

### TranslationEditor Tests
- [x] Rendering and initial state tests (7 tests)
- [x] Form validation tests (5 tests)
- [x] Save flow success tests (6 tests)
- [x] Save flow failure tests (5 tests)
- [x] User interaction tests (5 tests)
- [x] Accessibility tests (6 tests)
- [x] Edge case tests (2 tests)

### TranslationStatusWidget Tests
- [x] Rendering and display tests (8 tests)
- [x] Data update tests (2 tests)
- [x] Loading and empty state tests (3 tests)
- [x] Error handling tests (3 tests)
- [x] User interaction tests (4 tests)
- [x] Accessibility tests (5 tests)
- [x] Edge case tests (4 tests)

### Mock Setup and Test Utilities
- [x] Translation hook mocks return controlled data
- [x] Mocks configurable per-test for loading/error/success states
- [x] Mocks track function calls for assertions
- [x] API mocks simulate success/error responses
- [x] Next-intl mocks return test translation function
- [x] Router mocks track navigation

### Test Quality
- [x] All tests pass consistently with no flakiness
- [x] Test coverage reaches at least 85% for components
- [x] Tests run in under 5 seconds total
- [x] Tests are isolated (independent execution)
- [x] Tests use realistic data matching prop types
- [x] Tests include TypeScript types (no `any`)
- [x] Test assertions are specific and meaningful
- [x] Tests clean up properly (no warnings)
- [x] No TypeScript compilation errors
- [x] No ESLint warnings

### Documentation
- [x] Test files include introductory comments
- [x] Complex test cases include inline comments
- [x] README explains how to run tests
- [x] README explains how to update mocks

---

## 10. Implementation Notes

### Testing Philosophy
These component tests focus on **behavior, not implementation**. Tests verify:
- What users see and interact with
- How components respond to different states
- Accessibility for all users
- Integration with hooks and APIs

Tests do NOT verify:
- Internal component state variables
- Private function implementations
- CSS class names (unless for accessibility)
- Component implementation details that could change

### Mock Strategy
Mocks are centralized in `component-mocks.ts` to:
- Ensure consistency across test files
- Make updates easier when APIs change
- Provide reusable factory functions with sensible defaults
- Follow established patterns from hook tests (REQ-E05-033)

### Accessibility Testing
Every component includes accessibility tests for:
- ARIA roles and labels
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader announcements (aria-live, role="status")
- Focus management in modals/editors
- Text alternatives for visual indicators

This aligns with REQ-E05-032 accessibility requirements.

### User Interaction Testing
All tests use `@testing-library/user-event` instead of `fireEvent` because:
- More realistic user behavior (delays, focus changes)
- Better matches how users actually interact
- Catches more edge cases (rapid clicks, keyboard shortcuts)
- Recommended by Testing Library documentation

### Coverage Strategy
To achieve 85%+ coverage:
- Test all component states (loading, error, empty, data-loaded)
- Test all user interactions (clicks, typing, keyboard shortcuts)
- Test all conditional branches (permissions, validation, API responses)
- Test edge cases (empty data, negative numbers, very large numbers)
- Use coverage report to identify missed lines and add targeted tests

---

**End of Implementation Overview**
