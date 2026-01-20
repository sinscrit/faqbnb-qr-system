# REQ-E05-034: Write Component Tests - Detailed Task Breakdown

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20 15:45 UTC
**Request ID:** REQ-E05-034
**Epic:** L10N Epic 5 - Owner Translation Management
**Phase:** 7 - Integration & Polish
**Task ID:** 7.6
**Status:** Ready for Implementation

---

## 1. Document References

| Reference | Location |
|-----------|----------|
| Overview Document | `/docs/REQ-E05-034-write-component-tests-overview.md` |
| Requirements Document | `/docs/gen_requests_epic5.md` (REQ-E05-034) |
| Implementation Plan | `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` |
| Test Infrastructure | `/vitest.config.ts` |
| Test Setup | `/vitest.setup.ts` |
| Component Test Pattern | `/src/components/ItemManager/components/ItemPreview/__tests__/ItemPreviewModal.test.tsx` |

---

## 2. Executive Summary

This task creates comprehensive component tests for the three primary UI components in the Translation Management system:
- **TranslationPreviewPanel** - Slide-in panel showing translation status for all languages
- **TranslationEditor** - Modal for editing translation content with save/cancel flow
- **TranslationStatusWidget** - Dashboard widget showing translation counts and progress

The tests validate rendering behavior, user interactions, accessibility compliance, and integration with underlying hooks and APIs.

---

## 3. Task Breakdown

### Task 34.1: Create Test Infrastructure and Mock Utilities

**File:** `/src/components/TranslationManagement/__tests__/testUtils.ts`

**Objective:** Create shared mock utilities, data factories, and test helpers that will be used across all component test files.

**Implementation Steps:**

1. **Create mock data factories (lines 1-80)**
   ```typescript
   // Location: /src/components/TranslationManagement/__tests__/testUtils.ts

   import type {
     TranslationLanguageStatus,
     TranslationStatusMap,
     TranslationStatusSummary,
     SupportedLanguage
   } from '../TranslationManagement.types';

   // Factory for individual language status
   export const createMockTranslationStatus = (
     overrides?: Partial<TranslationLanguageStatus>
   ): TranslationLanguageStatus => ({
     language_code: 'fr',
     status: 'completed',
     translated_content: {
       title: 'Titre traduit',
       description: 'Description traduite',
     },
     translated_at: '2026-01-20T10:00:00Z',
     updated_at: '2026-01-20T10:00:00Z',
     is_stale: false,
     reviewed_by: null,
     ...overrides,
   });

   // Factory for full translation status map
   export const createMockTranslationStatusMap = (
     overrides?: Partial<TranslationStatusMap>
   ): TranslationStatusMap => ({
     en: createMockTranslationStatus({ language_code: 'en', status: 'original' }),
     fr: createMockTranslationStatus({ language_code: 'fr', status: 'completed' }),
     es: createMockTranslationStatus({ language_code: 'es', status: 'completed' }),
     de: createMockTranslationStatus({ language_code: 'de', status: 'pending' }),
     nl: createMockTranslationStatus({ language_code: 'nl', status: 'processing' }),
     it: createMockTranslationStatus({ language_code: 'it', status: 'failed' }),
     ...overrides,
   });

   // Factory for translation summary
   export const createMockTranslationSummary = (
     overrides?: Partial<TranslationStatusSummary>
   ): TranslationStatusSummary => ({
     total: 30,
     complete: 18,
     partial: 6,
     pending: 4,
     failed: 2,
     ...overrides,
   });
   ```

2. **Create mock hook return values (lines 81-140)**
   ```typescript
   // Mock useTranslationStatus hook return value factory
   export const createMockUseTranslationStatusReturn = (overrides?: {
     data?: TranslationStatusMap | null;
     isLoading?: boolean;
     error?: string | null;
     refetch?: () => void;
   }) => ({
     data: overrides?.data ?? createMockTranslationStatusMap(),
     isLoading: overrides?.isLoading ?? false,
     error: overrides?.error ?? null,
     refetch: overrides?.refetch ?? vi.fn(),
   });

   // Mock useTranslationRealtime hook return value factory
   export const createMockUseTranslationRealtimeReturn = (overrides?: {
     isConnected?: boolean;
     lastUpdate?: Date | null;
   }) => ({
     isConnected: overrides?.isConnected ?? true,
     lastUpdate: overrides?.lastUpdate ?? new Date('2026-01-20T10:00:00Z'),
   });
   ```

3. **Create API mock helpers (lines 141-200)**
   ```typescript
   // Mock fetch helper for API calls
   export const createMockFetch = (options?: {
     success?: boolean;
     data?: unknown;
     delay?: number;
     error?: string;
   }) => {
     const mockFn = vi.fn();

     if (options?.delay) {
       mockFn.mockImplementation(async () => {
         await new Promise(resolve => setTimeout(resolve, options.delay));
         if (!options?.success) {
           throw new Error(options?.error || 'API Error');
         }
         return {
           ok: options?.success ?? true,
           json: async () => options?.data ?? { success: true },
         };
       });
     } else {
       if (!options?.success && options?.success !== undefined) {
         mockFn.mockRejectedValue(new Error(options?.error || 'API Error'));
       } else {
         mockFn.mockResolvedValue({
           ok: true,
           json: async () => options?.data ?? { success: true },
         });
       }
     }

     return mockFn;
   };

   // Standard API response mocks
   export const mockApiResponses = {
     updateTranslationSuccess: {
       success: true,
       translation: {
         language: 'fr',
         status: 'manual',
         reviewedBy: 'user-123',
         updatedAt: '2026-01-20T12:00:00Z',
       },
     },
     retranslateSuccess: {
       success: true,
       jobsQueued: 5,
       skipped: 0,
     },
     statusSuccess: {
       summary: createMockTranslationSummary(),
       items: [],
     },
   };
   ```

4. **Create custom render helper (lines 201-240)**
   ```typescript
   import { render, RenderOptions } from '@testing-library/react';
   import { ReactElement } from 'react';

   // Custom render with common providers if needed
   export const renderWithProviders = (
     ui: ReactElement,
     options?: Omit<RenderOptions, 'wrapper'>
   ) => {
     return render(ui, { ...options });
   };

   // Helper for async renders with loading states
   export const renderAndWaitForLoad = async (
     ui: ReactElement,
     options?: Omit<RenderOptions, 'wrapper'>
   ) => {
     const result = render(ui, { ...options });
     // Wait for any loading states to resolve
     await vi.waitFor(() => {
       expect(result.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
     });
     return result;
   };
   ```

5. **Create cleanup utilities (lines 241-270)**
   ```typescript
   // Cleanup helper for tests using timers
   export const cleanupTimersAndMocks = () => {
     vi.clearAllMocks();
     vi.useRealTimers();
   };

   // Reset all mocks and global state
   export const resetTestEnvironment = () => {
     vi.clearAllMocks();
     vi.useRealTimers();
     vi.restoreAllMocks();
   };
   ```

**Verification:**
- [ ] File compiles without TypeScript errors
- [ ] All factory functions return valid typed objects
- [ ] Mock hooks match actual hook signatures

**Estimated Effort:** 1 story point

---

### Task 34.2: Create TranslationPreviewPanel Test Suite

**File:** `/src/components/__tests__/TranslationPreviewPanel.test.tsx`

**Objective:** Comprehensive test coverage for the TranslationPreviewPanel component including rendering states, status indicators, action buttons, and accessibility.

**Implementation Steps:**

1. **Set up test file structure and imports (lines 1-50)**
   ```typescript
   /**
    * TranslationPreviewPanel Component Tests
    *
    * Tests cover:
    * - Rendering states (loading, error, empty, populated)
    * - Status indicator display for all languages
    * - Action button interactions (close, edit, retry, re-translate)
    * - Content display and truncation
    * - Responsive layout behavior
    * - Accessibility compliance
    *
    * @module TranslationManagement/__tests__/TranslationPreviewPanel.test
    * @created 2026-01-20
    * @requestId REQ-E05-034
    */

   import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
   import { axe, toHaveNoViolations } from 'vitest-axe';
   import { TranslationPreviewPanel } from '../TranslationManagement/TranslationPreviewPanel';
   import {
     createMockTranslationStatusMap,
     createMockUseTranslationStatusReturn,
     cleanupTimersAndMocks,
   } from '../TranslationManagement/__tests__/testUtils';

   // Extend expect with axe matchers
   expect.extend(toHaveNoViolations);
   ```

2. **Configure mock setup (lines 51-100)**
   ```typescript
   // =============================================================================
   // Mock Setup
   // =============================================================================

   // Mock hooks
   vi.mock('@/hooks/useTranslationStatus');
   vi.mock('@/hooks/useTranslationRealtime');
   vi.mock('next-intl', () => ({
     useTranslations: () => (key: string) => key,
   }));

   import { useTranslationStatus } from '@/hooks/useTranslationStatus';
   import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';

   const mockUseTranslationStatus = vi.mocked(useTranslationStatus);
   const mockUseTranslationRealtime = vi.mocked(useTranslationRealtime);

   // =============================================================================
   // Mock Data
   // =============================================================================

   const mockSourceContent = {
     title: 'How to Use the Dishwasher',
     description: 'Load dishes on the lower and upper racks. Add detergent to the dispenser. Select wash cycle and press start.',
   };

   const defaultProps = {
     entityType: 'article' as const,
     entityId: 'test-article-1',
     sourceLanguage: 'en' as const,
     sourceContent: mockSourceContent,
     isOpen: true,
     onClose: vi.fn(),
     onTranslationEdited: vi.fn(),
   };
   ```

3. **Implement rendering tests (lines 101-220)**
   ```typescript
   // =============================================================================
   // Test Setup
   // =============================================================================

   beforeEach(() => {
     vi.clearAllMocks();
     mockUseTranslationStatus.mockReturnValue(createMockUseTranslationStatusReturn());
     mockUseTranslationRealtime.mockReturnValue({ isConnected: true, lastUpdate: null });
   });

   afterEach(() => {
     cleanupTimersAndMocks();
   });

   // =============================================================================
   // Rendering Tests
   // =============================================================================

   describe('TranslationPreviewPanel', () => {
     describe('Rendering', () => {
       it('should render translation rows for each configured language (6 languages)', () => {
         render(<TranslationPreviewPanel {...defaultProps} />);

         // Verify all 6 languages are displayed
         expect(screen.getByText(/Fran(c|ç)ais/i)).toBeInTheDocument();
         expect(screen.getByText(/Espa(n|ñ)ol/i)).toBeInTheDocument();
         expect(screen.getByText(/Deutsch/i)).toBeInTheDocument();
         expect(screen.getByText(/Nederlands/i)).toBeInTheDocument();
         expect(screen.getByText(/Italiano/i)).toBeInTheDocument();
       });

       it('should display empty state message when no translations exist', () => {
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ data: null })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         expect(screen.getByText(/no translations/i)).toBeInTheDocument();
       });

       it('should display source content in header section', () => {
         render(<TranslationPreviewPanel {...defaultProps} />);

         expect(screen.getByText(mockSourceContent.title)).toBeInTheDocument();
         expect(screen.getByText(mockSourceContent.description)).toBeInTheDocument();
       });

       it('should display loading state with skeleton loaders', () => {
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ isLoading: true, data: null })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
       });

       it('should display error state with retry option', () => {
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({
             error: 'Failed to load translations',
             data: null
           })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
         expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
       });
     });
   ```

4. **Implement status indicator tests (lines 221-320)**
   ```typescript
     describe('Status Indicators', () => {
       it('should display "Complete" status with green indicator for finished translations', () => {
         const statusMap = createMockTranslationStatusMap({
           fr: {
             language_code: 'fr',
             status: 'completed',
             translated_content: { title: 'Titre' },
             translated_at: '2026-01-20T10:00:00Z',
             updated_at: '2026-01-20T10:00:00Z',
             is_stale: false,
             reviewed_by: null,
           },
         });
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ data: statusMap })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         const frenchRow = screen.getByTestId('translation-row-fr');
         expect(within(frenchRow).getByText(/complete/i)).toBeInTheDocument();
         expect(frenchRow).toHaveClass('text-green-500');
       });

       it('should display "Pending" status with yellow indicator for queued translations', () => {
         const statusMap = createMockTranslationStatusMap({
           de: {
             language_code: 'de',
             status: 'pending',
             translated_content: null,
             translated_at: null,
             updated_at: '2026-01-20T10:00:00Z',
             is_stale: false,
             reviewed_by: null,
           },
         });
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ data: statusMap })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         const germanRow = screen.getByTestId('translation-row-de');
         expect(within(germanRow).getByText(/pending/i)).toBeInTheDocument();
       });

       it('should display "Failed" status with red indicator for error translations', () => {
         const statusMap = createMockTranslationStatusMap({
           it: {
             language_code: 'it',
             status: 'failed',
             translated_content: null,
             translated_at: null,
             updated_at: '2026-01-20T10:00:00Z',
             is_stale: false,
             reviewed_by: null,
           },
         });
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ data: statusMap })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         const italianRow = screen.getByTestId('translation-row-it');
         expect(within(italianRow).getByText(/failed/i)).toBeInTheDocument();
       });

       it('should display "Stale" status with warning indicator when source changed', () => {
         const statusMap = createMockTranslationStatusMap({
           fr: {
             language_code: 'fr',
             status: 'completed',
             translated_content: { title: 'Titre' },
             translated_at: '2026-01-20T10:00:00Z',
             updated_at: '2026-01-20T10:00:00Z',
             is_stale: true,
             reviewed_by: null,
           },
         });
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ data: statusMap })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         const frenchRow = screen.getByTestId('translation-row-fr');
         expect(within(frenchRow).getByText(/stale/i)).toBeInTheDocument();
       });

       it('should display "Processing" status with animated indicator', () => {
         const statusMap = createMockTranslationStatusMap({
           nl: {
             language_code: 'nl',
             status: 'processing',
             translated_content: null,
             translated_at: null,
             updated_at: '2026-01-20T10:00:00Z',
             is_stale: false,
             reviewed_by: null,
           },
         });
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ data: statusMap })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         const dutchRow = screen.getByTestId('translation-row-nl');
         expect(within(dutchRow).getByText(/processing|in progress/i)).toBeInTheDocument();
       });
     });
   ```

5. **Implement action button tests (lines 321-450)**
   ```typescript
     describe('Action Buttons', () => {
       it('should trigger onClose callback when close button is clicked', async () => {
         const user = userEvent.setup();
         const onClose = vi.fn();

         render(<TranslationPreviewPanel {...defaultProps} onClose={onClose} />);

         await user.click(screen.getByRole('button', { name: /close/i }));

         expect(onClose).toHaveBeenCalledTimes(1);
       });

       it('should open TranslationEditor with correct data when edit button clicked', async () => {
         const user = userEvent.setup();

         render(<TranslationPreviewPanel {...defaultProps} />);

         const frenchRow = screen.getByTestId('translation-row-fr');
         await user.click(within(frenchRow).getByRole('button', { name: /edit/i }));

         // Editor modal should open with correct language
         await waitFor(() => {
           expect(screen.getByRole('dialog', { name: /edit.*translation/i })).toBeInTheDocument();
         });
       });

       it('should trigger retryTranslation API call when retry button clicked', async () => {
         const user = userEvent.setup();
         const mockFetch = vi.fn().mockResolvedValue({
           ok: true,
           json: async () => ({ success: true }),
         });
         global.fetch = mockFetch;

         const statusMap = createMockTranslationStatusMap({
           it: {
             language_code: 'it',
             status: 'failed',
             translated_content: null,
             translated_at: null,
             updated_at: '2026-01-20T10:00:00Z',
             is_stale: false,
             reviewed_by: null,
           },
         });
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ data: statusMap })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         const italianRow = screen.getByTestId('translation-row-it');
         await user.click(within(italianRow).getByRole('button', { name: /retry/i }));

         expect(mockFetch).toHaveBeenCalledWith(
           expect.stringContaining('/api/translations/retranslate'),
           expect.objectContaining({ method: 'POST' })
         );
       });

       it('should trigger re-translation when re-translate button clicked', async () => {
         const user = userEvent.setup();
         const mockFetch = vi.fn().mockResolvedValue({
           ok: true,
           json: async () => ({ success: true, jobsQueued: 1 }),
         });
         global.fetch = mockFetch;

         render(<TranslationPreviewPanel {...defaultProps} />);

         const frenchRow = screen.getByTestId('translation-row-fr');
         await user.click(within(frenchRow).getByRole('button', { name: /re-translate/i }));

         expect(mockFetch).toHaveBeenCalledWith(
           expect.stringContaining('/api/translations/retranslate'),
           expect.objectContaining({ method: 'POST' })
         );
       });

       it('should queue jobs for all languages when re-translate all clicked', async () => {
         const user = userEvent.setup();
         const mockFetch = vi.fn().mockResolvedValue({
           ok: true,
           json: async () => ({ success: true, jobsQueued: 5 }),
         });
         global.fetch = mockFetch;

         render(<TranslationPreviewPanel {...defaultProps} />);

         await user.click(screen.getByRole('button', { name: /re-translate all/i }));

         expect(mockFetch).toHaveBeenCalledWith(
           expect.stringContaining('/api/translations/retranslate'),
           expect.objectContaining({
             method: 'POST',
             body: expect.stringContaining('languages'),
           })
         );
       });

       it('should disable buttons during loading/processing states', () => {
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ isLoading: true })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         const retranslateAllButton = screen.getByRole('button', { name: /re-translate all/i });
         expect(retranslateAllButton).toBeDisabled();
       });
     });
   ```

6. **Implement content display tests (lines 451-530)**
   ```typescript
     describe('Content Display', () => {
       it('should truncate long translation content with ellipsis', () => {
         const longContent = {
           title: 'A'.repeat(200),
           description: 'B'.repeat(500),
         };
         const statusMap = createMockTranslationStatusMap({
           fr: {
             language_code: 'fr',
             status: 'completed',
             translated_content: longContent,
             translated_at: '2026-01-20T10:00:00Z',
             updated_at: '2026-01-20T10:00:00Z',
             is_stale: false,
             reviewed_by: null,
           },
         });
         mockUseTranslationStatus.mockReturnValue(
           createMockUseTranslationStatusReturn({ data: statusMap })
         );

         render(<TranslationPreviewPanel {...defaultProps} />);

         const frenchRow = screen.getByTestId('translation-row-fr');
         const contentPreview = within(frenchRow).getByTestId('content-preview');
         expect(contentPreview).toHaveClass('truncate');
       });

       it('should switch to original content when "View Original" toggle clicked', async () => {
         const user = userEvent.setup();

         render(<TranslationPreviewPanel {...defaultProps} />);

         await user.click(screen.getByRole('checkbox', { name: /view original/i }));

         // Should now show original content
         const frenchRow = screen.getByTestId('translation-row-fr');
         expect(within(frenchRow).getByText(mockSourceContent.title)).toBeInTheDocument();
       });

       it('should display timestamp in relative format', () => {
         render(<TranslationPreviewPanel {...defaultProps} />);

         // Should show relative time like "2 hours ago"
         expect(screen.getByText(/ago/i)).toBeInTheDocument();
       });
     });
   ```

7. **Implement responsive and accessibility tests (lines 531-650)**
   ```typescript
     describe('Responsive Layout', () => {
       it('should be full-width on mobile viewport', () => {
         // Mock window.matchMedia for mobile viewport
         Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
         window.dispatchEvent(new Event('resize'));

         const { container } = render(<TranslationPreviewPanel {...defaultProps} />);

         // Panel should have full-width class on mobile
         const panel = container.querySelector('[data-testid="translation-panel"]');
         expect(panel).toHaveClass('w-full');
       });
     });

     describe('Accessibility', () => {
       it('should have no accessibility violations', async () => {
         const { container } = render(<TranslationPreviewPanel {...defaultProps} />);

         const results = await axe(container);
         expect(results).toHaveNoViolations();
       });

       it('should trap focus within panel when open', async () => {
         const user = userEvent.setup();

         render(<TranslationPreviewPanel {...defaultProps} />);

         // Tab through all focusable elements
         await user.tab();
         expect(document.activeElement).toBeInTheDocument();

         // Should not escape the panel
         const panel = screen.getByRole('dialog');
         expect(panel.contains(document.activeElement)).toBe(true);
       });

       it('should close panel when Escape key pressed', async () => {
         const user = userEvent.setup();
         const onClose = vi.fn();

         render(<TranslationPreviewPanel {...defaultProps} onClose={onClose} />);

         await user.keyboard('{Escape}');

         expect(onClose).toHaveBeenCalled();
       });

       it('should have ARIA labels on status indicators', () => {
         render(<TranslationPreviewPanel {...defaultProps} />);

         const statusIndicators = screen.getAllByRole('img', { hidden: true });
         statusIndicators.forEach(indicator => {
           expect(indicator).toHaveAttribute('aria-label');
         });
       });

       it('should allow tab navigation through language items', async () => {
         const user = userEvent.setup();

         render(<TranslationPreviewPanel {...defaultProps} />);

         // Tab to first language row action
         await user.tab();
         await user.tab();

         const focusedElement = document.activeElement;
         expect(focusedElement?.closest('[data-testid^="translation-row-"]')).toBeInTheDocument();
       });
     });
   });
   ```

**Verification:**
- [ ] All 17 TranslationPreviewPanel acceptance criteria covered
- [ ] Tests use React Testing Library best practices
- [ ] Tests achieve 80%+ code coverage for component
- [ ] Tests execute in under 5 seconds

**Estimated Effort:** 3 story points

---

### Task 34.3: Create TranslationEditor Test Suite

**File:** `/src/components/__tests__/TranslationEditor.test.tsx`

**Objective:** Comprehensive test coverage for the TranslationEditor component including form validation, save flow, confirmation dialogs, and keyboard shortcuts.

**Implementation Steps:**

1. **Set up test file structure and imports (lines 1-60)**
   ```typescript
   /**
    * TranslationEditor Component Tests
    *
    * Tests cover:
    * - Rendering with existing/empty content
    * - Form validation and character counts
    * - Save flow with API integration
    * - Cancel/close behavior with dirty state
    * - Keyboard shortcuts
    * - Accessibility compliance
    *
    * @module TranslationManagement/__tests__/TranslationEditor.test
    * @created 2026-01-20
    * @requestId REQ-E05-034
    */

   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
   import { axe, toHaveNoViolations } from 'vitest-axe';
   import { TranslationEditor } from '../TranslationManagement/TranslationEditor';
   import {
     createMockFetch,
     mockApiResponses,
     cleanupTimersAndMocks,
   } from '../TranslationManagement/__tests__/testUtils';

   expect.extend(toHaveNoViolations);

   // Mock next-intl
   vi.mock('next-intl', () => ({
     useTranslations: () => (key: string) => key,
   }));
   ```

2. **Configure mock setup and default props (lines 61-110)**
   ```typescript
   // =============================================================================
   // Mock Data
   // =============================================================================

   const mockTranslation = {
     language: 'fr' as const,
     content: {
       title: 'Comment utiliser le lave-vaisselle',
       description: 'Chargez la vaisselle sur les paniers inférieurs et supérieurs.',
     },
     status: 'completed',
   };

   const mockSourceContent = {
     title: 'How to Use the Dishwasher',
     description: 'Load dishes on the lower and upper racks.',
   };

   const defaultProps = {
     translation: mockTranslation,
     sourceContent: mockSourceContent,
     sourceLanguage: 'en' as const,
     isOpen: true,
     onSave: vi.fn().mockResolvedValue(undefined),
     onCancel: vi.fn(),
   };

   // =============================================================================
   // Test Setup
   // =============================================================================

   beforeEach(() => {
     vi.clearAllMocks();
   });

   afterEach(() => {
     cleanupTimersAndMocks();
   });
   ```

3. **Implement rendering tests (lines 111-200)**
   ```typescript
   // =============================================================================
   // Rendering Tests
   // =============================================================================

   describe('TranslationEditor', () => {
     describe('Rendering', () => {
       it('should render with existing translation content pre-filled in textarea', () => {
         render(<TranslationEditor {...defaultProps} />);

         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         expect(titleTextarea).toHaveValue(mockTranslation.content.title);

         const descTextarea = screen.getByRole('textbox', { name: /description/i });
         expect(descTextarea).toHaveValue(mockTranslation.content.description);
       });

       it('should render with empty textarea when no translation exists', () => {
         render(
           <TranslationEditor
             {...defaultProps}
             translation={{ ...mockTranslation, content: { title: '', description: '' } }}
           />
         );

         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         expect(titleTextarea).toHaveValue('');
       });

       it('should display original source content in read-only reference section', () => {
         render(<TranslationEditor {...defaultProps} />);

         expect(screen.getByText(mockSourceContent.title)).toBeInTheDocument();
         expect(screen.getByText(mockSourceContent.description)).toBeInTheDocument();

         // Source section should be read-only
         const sourceSection = screen.getByTestId('source-content-section');
         expect(sourceSection.querySelector('textarea')).toBeNull();
       });

       it('should display language indicator with correct name and flag', () => {
         render(<TranslationEditor {...defaultProps} />);

         expect(screen.getByText(/fran(c|ç)ais/i)).toBeInTheDocument();
         expect(screen.getByTestId('language-flag-fr')).toBeInTheDocument();
       });

       it('should display character count updating as user types', async () => {
         const user = userEvent.setup();

         render(<TranslationEditor {...defaultProps} />);

         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         const initialCount = mockTranslation.content.title.length;

         expect(screen.getByText(new RegExp(`${initialCount}`))).toBeInTheDocument();

         await user.type(titleTextarea, ' extra');

         expect(screen.getByText(new RegExp(`${initialCount + 6}`))).toBeInTheDocument();
       });

       it('should display word count alongside character count', () => {
         render(<TranslationEditor {...defaultProps} />);

         // Word count should be visible
         expect(screen.getByText(/words?/i)).toBeInTheDocument();
       });
     });
   ```

4. **Implement validation tests (lines 201-280)**
   ```typescript
     describe('Form Validation', () => {
       it('should disable save button when textarea is empty', async () => {
         const user = userEvent.setup();

         render(
           <TranslationEditor
             {...defaultProps}
             translation={{ ...mockTranslation, content: { title: '', description: '' } }}
           />
         );

         const saveButton = screen.getByRole('button', { name: /save/i });
         expect(saveButton).toBeDisabled();
       });

       it('should enable save button when valid content exists', () => {
         render(<TranslationEditor {...defaultProps} />);

         const saveButton = screen.getByRole('button', { name: /save/i });
         expect(saveButton).not.toBeDisabled();
       });

       it('should show validation error when content exceeds maximum length', async () => {
         const user = userEvent.setup();

         render(<TranslationEditor {...defaultProps} />);

         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         // Type content that exceeds limit (assuming 500 char limit)
         await user.clear(titleTextarea);
         await user.type(titleTextarea, 'A'.repeat(501));

         expect(screen.getByText(/exceeds maximum/i)).toBeInTheDocument();
       });

       it('should show character counter warning at threshold', async () => {
         const user = userEvent.setup();

         render(<TranslationEditor {...defaultProps} />);

         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         await user.clear(titleTextarea);
         await user.type(titleTextarea, 'A'.repeat(450)); // Near 500 limit

         const counter = screen.getByTestId('char-counter');
         expect(counter).toHaveClass('text-amber-500');
       });
     });
   ```

5. **Implement save flow tests (lines 281-400)**
   ```typescript
     describe('Save Flow', () => {
       it('should trigger updateTranslation API call with textarea content', async () => {
         const user = userEvent.setup();
         const onSave = vi.fn().mockResolvedValue(undefined);

         render(<TranslationEditor {...defaultProps} onSave={onSave} />);

         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         await user.clear(titleTextarea);
         await user.type(titleTextarea, 'Updated Title');

         await user.click(screen.getByRole('button', { name: /save/i }));

         expect(onSave).toHaveBeenCalledWith(
           expect.objectContaining({ title: 'Updated Title' })
         );
       });

       it('should show success toast notification on successful save', async () => {
         const user = userEvent.setup();

         render(<TranslationEditor {...defaultProps} />);

         await user.click(screen.getByRole('button', { name: /save/i }));

         await waitFor(() => {
           expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
         });
       });

       it('should close editor and refresh parent on successful save', async () => {
         const user = userEvent.setup();
         const onSave = vi.fn().mockResolvedValue(undefined);
         const onCancel = vi.fn();

         render(<TranslationEditor {...defaultProps} onSave={onSave} onCancel={onCancel} />);

         await user.click(screen.getByRole('button', { name: /save/i }));

         await waitFor(() => {
           expect(onCancel).toHaveBeenCalled(); // Editor closes via onCancel
         });
       });

       it('should display error message below textarea on API error', async () => {
         const user = userEvent.setup();
         const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));

         render(<TranslationEditor {...defaultProps} onSave={onSave} />);

         await user.click(screen.getByRole('button', { name: /save/i }));

         await waitFor(() => {
           expect(screen.getByText(/save failed/i)).toBeInTheDocument();
         });
       });

       it('should show loading spinner during save operation', async () => {
         const user = userEvent.setup();
         const onSave = vi.fn().mockImplementation(
           () => new Promise(resolve => setTimeout(resolve, 1000))
         );

         render(<TranslationEditor {...defaultProps} onSave={onSave} />);

         await user.click(screen.getByRole('button', { name: /save/i }));

         expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
       });

       it('should disable save button during save to prevent double submission', async () => {
         const user = userEvent.setup();
         const onSave = vi.fn().mockImplementation(
           () => new Promise(resolve => setTimeout(resolve, 1000))
         );

         render(<TranslationEditor {...defaultProps} onSave={onSave} />);

         const saveButton = screen.getByRole('button', { name: /save/i });
         await user.click(saveButton);

         expect(saveButton).toBeDisabled();
       });
     });
   ```

6. **Implement cancel/close tests (lines 401-500)**
   ```typescript
     describe('Cancel/Close Flow', () => {
       it('should close editor without saving when cancel button clicked', async () => {
         const user = userEvent.setup();
         const onSave = vi.fn();
         const onCancel = vi.fn();

         render(<TranslationEditor {...defaultProps} onSave={onSave} onCancel={onCancel} />);

         await user.click(screen.getByRole('button', { name: /cancel/i }));

         expect(onCancel).toHaveBeenCalled();
         expect(onSave).not.toHaveBeenCalled();
       });

       it('should show confirmation dialog when closing with unsaved changes', async () => {
         const user = userEvent.setup();

         render(<TranslationEditor {...defaultProps} />);

         // Make a change (dirty state)
         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         await user.type(titleTextarea, ' modified');

         // Try to close
         await user.click(screen.getByRole('button', { name: /cancel/i }));

         expect(screen.getByRole('dialog', { name: /unsaved changes/i })).toBeInTheDocument();
       });

       it('should close without saving when discard option selected', async () => {
         const user = userEvent.setup();
         const onCancel = vi.fn();

         render(<TranslationEditor {...defaultProps} onCancel={onCancel} />);

         // Make a change
         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         await user.type(titleTextarea, ' modified');

         // Try to close
         await user.click(screen.getByRole('button', { name: /cancel/i }));

         // Click discard in confirmation dialog
         await user.click(screen.getByRole('button', { name: /discard/i }));

         expect(onCancel).toHaveBeenCalled();
       });

       it('should return to editor when keep editing option selected', async () => {
         const user = userEvent.setup();
         const onCancel = vi.fn();

         render(<TranslationEditor {...defaultProps} onCancel={onCancel} />);

         // Make a change
         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         await user.type(titleTextarea, ' modified');

         // Try to close
         await user.click(screen.getByRole('button', { name: /cancel/i }));

         // Click keep editing
         await user.click(screen.getByRole('button', { name: /keep editing/i }));

         expect(onCancel).not.toHaveBeenCalled();
         expect(screen.queryByRole('dialog', { name: /unsaved changes/i })).not.toBeInTheDocument();
       });
     });
   ```

7. **Implement keyboard shortcut and accessibility tests (lines 501-620)**
   ```typescript
     describe('Keyboard Shortcuts', () => {
       it('should trigger save when Cmd+S pressed (Mac)', async () => {
         const user = userEvent.setup();
         const onSave = vi.fn().mockResolvedValue(undefined);

         render(<TranslationEditor {...defaultProps} onSave={onSave} />);

         // Focus the textarea
         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         titleTextarea.focus();

         // Press Cmd+S
         await user.keyboard('{Meta>}s{/Meta}');

         expect(onSave).toHaveBeenCalled();
       });

       it('should trigger save when Ctrl+S pressed (Windows)', async () => {
         const user = userEvent.setup();
         const onSave = vi.fn().mockResolvedValue(undefined);

         render(<TranslationEditor {...defaultProps} onSave={onSave} />);

         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         titleTextarea.focus();

         await user.keyboard('{Control>}s{/Control}');

         expect(onSave).toHaveBeenCalled();
       });

       it('should trigger cancel when Escape pressed', async () => {
         const user = userEvent.setup();
         const onCancel = vi.fn();

         render(<TranslationEditor {...defaultProps} onCancel={onCancel} />);

         await user.keyboard('{Escape}');

         // Should close (or show confirmation if dirty)
         expect(onCancel).toHaveBeenCalled();
       });
     });

     describe('Accessibility', () => {
       it('should have no accessibility violations', async () => {
         const { container } = render(<TranslationEditor {...defaultProps} />);

         const results = await axe(container);
         expect(results).toHaveNoViolations();
       });

       it('should focus first input when dialog opens', () => {
         render(<TranslationEditor {...defaultProps} />);

         const titleTextarea = screen.getByRole('textbox', { name: /title/i });
         expect(titleTextarea).toHaveFocus();
       });

       it('should have ARIA labels for form elements', () => {
         render(<TranslationEditor {...defaultProps} />);

         expect(screen.getByRole('textbox', { name: /title/i })).toBeInTheDocument();
         expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
       });

       it('should announce errors for screen readers', async () => {
         const user = userEvent.setup();
         const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));

         render(<TranslationEditor {...defaultProps} onSave={onSave} />);

         await user.click(screen.getByRole('button', { name: /save/i }));

         await waitFor(() => {
           const errorMessage = screen.getByRole('alert');
           expect(errorMessage).toBeInTheDocument();
         });
       });
     });
   });
   ```

**Verification:**
- [ ] All 23 TranslationEditor acceptance criteria covered
- [ ] Save/cancel flow tested comprehensively
- [ ] Keyboard shortcuts work correctly
- [ ] Tests execute in under 5 seconds

**Estimated Effort:** 3 story points

---

### Task 34.4: Create TranslationStatusWidget Test Suite

**File:** `/src/components/__tests__/TranslationStatusWidget.test.tsx`

**Objective:** Comprehensive test coverage for the TranslationStatusWidget component including count display, progress bar, interactive elements, and real-time updates.

**Implementation Steps:**

1. **Set up test file structure and imports (lines 1-60)**
   ```typescript
   /**
    * TranslationStatusWidget Component Tests
    *
    * Tests cover:
    * - Count display for all statuses
    * - Progress bar rendering and updates
    * - Interactive click handlers
    * - Loading and error states
    * - Real-time updates
    * - Compact mode rendering
    * - Accessibility compliance
    *
    * @module TranslationManagement/__tests__/TranslationStatusWidget.test
    * @created 2026-01-20
    * @requestId REQ-E05-034
    */

   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
   import { axe, toHaveNoViolations } from 'vitest-axe';
   import { TranslationStatusWidget } from '../TranslationManagement/TranslationStatusWidget';
   import {
     createMockTranslationSummary,
     createMockUseTranslationStatusReturn,
     cleanupTimersAndMocks,
   } from '../TranslationManagement/__tests__/testUtils';

   expect.extend(toHaveNoViolations);

   // Mock hooks
   vi.mock('@/hooks/useTranslationStatus');
   vi.mock('@/hooks/useTranslationRealtime');
   vi.mock('next-intl', () => ({
     useTranslations: () => (key: string) => key,
   }));

   import { useTranslationStatus } from '@/hooks/useTranslationStatus';
   import { useTranslationRealtime } from '@/hooks/useTranslationRealtime';

   const mockUseTranslationStatus = vi.mocked(useTranslationStatus);
   const mockUseTranslationRealtime = vi.mocked(useTranslationRealtime);
   ```

2. **Configure mock setup and default props (lines 61-100)**
   ```typescript
   // =============================================================================
   // Default Props
   // =============================================================================

   const defaultProps = {
     propertyId: 'test-property-1',
     onViewDetails: vi.fn(),
     onFilterChange: vi.fn(),
   };

   // =============================================================================
   // Test Setup
   // =============================================================================

   beforeEach(() => {
     vi.clearAllMocks();
     mockUseTranslationStatus.mockReturnValue({
       summary: createMockTranslationSummary(),
       isLoading: false,
       error: null,
       refetch: vi.fn(),
     });
     mockUseTranslationRealtime.mockReturnValue({
       isConnected: true,
       lastUpdate: null
     });
   });

   afterEach(() => {
     cleanupTimersAndMocks();
   });
   ```

3. **Implement rendering tests (lines 101-220)**
   ```typescript
   // =============================================================================
   // Rendering Tests
   // =============================================================================

   describe('TranslationStatusWidget', () => {
     describe('Rendering', () => {
       it('should render with zero translations showing empty state', () => {
         mockUseTranslationStatus.mockReturnValue({
           summary: createMockTranslationSummary({ total: 0, complete: 0, pending: 0, failed: 0 }),
           isLoading: false,
           error: null,
           refetch: vi.fn(),
         });

         render(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.getByText(/no translations/i)).toBeInTheDocument();
       });

       it('should display count of pending translation jobs', () => {
         render(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.getByText('4')).toBeInTheDocument(); // From mock: pending: 4
         expect(screen.getByText(/pending/i)).toBeInTheDocument();
       });

       it('should display count of completed translation jobs', () => {
         render(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.getByText('18')).toBeInTheDocument(); // From mock: complete: 18
         expect(screen.getByText(/complete/i)).toBeInTheDocument();
       });

       it('should display count of failed translation jobs', () => {
         render(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.getByText('2')).toBeInTheDocument(); // From mock: failed: 2
         expect(screen.getByText(/failed/i)).toBeInTheDocument();
       });

       it('should display total translation count across all statuses', () => {
         render(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.getByText('30')).toBeInTheDocument(); // From mock: total: 30
       });

       it('should display percentage completion progress bar', () => {
         render(<TranslationStatusWidget {...defaultProps} />);

         const progressBar = screen.getByRole('progressbar');
         expect(progressBar).toBeInTheDocument();
         // 18/30 = 60%
         expect(progressBar).toHaveAttribute('aria-valuenow', '60');
       });

       it('should have progress bar width matching calculated percentage', () => {
         render(<TranslationStatusWidget {...defaultProps} />);

         const progressFill = screen.getByTestId('progress-fill');
         // 18/30 = 60%
         expect(progressFill).toHaveStyle({ width: '60%' });
       });

       it('should render compact layout in compact mode', () => {
         render(<TranslationStatusWidget {...defaultProps} compact />);

         const widget = screen.getByTestId('translation-status-widget');
         expect(widget).toHaveClass('compact');
       });
     });
   ```

4. **Implement interactive tests (lines 221-340)**
   ```typescript
     describe('Interactive Behavior', () => {
       it('should update counts when useTranslationStatus hook data changes', async () => {
         const { rerender } = render(<TranslationStatusWidget {...defaultProps} />);

         // Initial count
         expect(screen.getByText('18')).toBeInTheDocument();

         // Update mock data
         mockUseTranslationStatus.mockReturnValue({
           summary: createMockTranslationSummary({ complete: 20 }),
           isLoading: false,
           error: null,
           refetch: vi.fn(),
         });

         rerender(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.getByText('20')).toBeInTheDocument();
       });

       it('should filter to pending translations when pending count clicked', async () => {
         const user = userEvent.setup();
         const onFilterChange = vi.fn();

         render(<TranslationStatusWidget {...defaultProps} onFilterChange={onFilterChange} />);

         await user.click(screen.getByTestId('pending-count'));

         expect(onFilterChange).toHaveBeenCalledWith({ status: 'pending' });
       });

       it('should open retry dialog when failed count clicked', async () => {
         const user = userEvent.setup();

         render(<TranslationStatusWidget {...defaultProps} />);

         await user.click(screen.getByTestId('failed-count'));

         await waitFor(() => {
           expect(screen.getByRole('dialog', { name: /retry.*failed/i })).toBeInTheDocument();
         });
       });

       it('should trigger data refetch when refresh button clicked', async () => {
         const user = userEvent.setup();
         const refetch = vi.fn();

         mockUseTranslationStatus.mockReturnValue({
           summary: createMockTranslationSummary(),
           isLoading: false,
           error: null,
           refetch,
         });

         render(<TranslationStatusWidget {...defaultProps} />);

         await user.click(screen.getByRole('button', { name: /refresh/i }));

         expect(refetch).toHaveBeenCalled();
       });

       it('should show tooltip with breakdown on hover over progress bar', async () => {
         const user = userEvent.setup();

         render(<TranslationStatusWidget {...defaultProps} />);

         const progressBar = screen.getByRole('progressbar');
         await user.hover(progressBar);

         await waitFor(() => {
           expect(screen.getByRole('tooltip')).toBeInTheDocument();
           expect(screen.getByText(/complete: 18/i)).toBeInTheDocument();
         });
       });
     });
   ```

5. **Implement state tests (lines 341-450)**
   ```typescript
     describe('State Management', () => {
       it('should show loading skeleton during initial data fetch', () => {
         mockUseTranslationStatus.mockReturnValue({
           summary: null,
           isLoading: true,
           error: null,
           refetch: vi.fn(),
         });

         render(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
       });

       it('should display error message with retry button on error', () => {
         mockUseTranslationStatus.mockReturnValue({
           summary: null,
           isLoading: false,
           error: 'Failed to fetch status',
           refetch: vi.fn(),
         });

         render(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
         expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
       });

       it('should auto-refresh when polling is enabled', async () => {
         vi.useFakeTimers();
         const refetch = vi.fn();

         mockUseTranslationStatus.mockReturnValue({
           summary: createMockTranslationSummary(),
           isLoading: false,
           error: null,
           refetch,
         });

         render(<TranslationStatusWidget {...defaultProps} pollingInterval={5000} />);

         // Advance time by polling interval
         vi.advanceTimersByTime(5000);

         expect(refetch).toHaveBeenCalled();

         vi.useRealTimers();
       });

       it('should update in real-time when new translation job completes', async () => {
         const { rerender } = render(<TranslationStatusWidget {...defaultProps} />);

         // Simulate real-time update
         mockUseTranslationRealtime.mockReturnValue({
           isConnected: true,
           lastUpdate: new Date(),
         });
         mockUseTranslationStatus.mockReturnValue({
           summary: createMockTranslationSummary({ complete: 19 }),
           isLoading: false,
           error: null,
           refetch: vi.fn(),
         });

         rerender(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.getByText('19')).toBeInTheDocument();
       });

       it('should show badge alert when failed count is non-zero', () => {
         render(<TranslationStatusWidget {...defaultProps} />);

         const badge = screen.getByTestId('failed-badge');
         expect(badge).toHaveClass('bg-red-500');
       });

       it('should hide failed badge when failed count is zero', () => {
         mockUseTranslationStatus.mockReturnValue({
           summary: createMockTranslationSummary({ failed: 0 }),
           isLoading: false,
           error: null,
           refetch: vi.fn(),
         });

         render(<TranslationStatusWidget {...defaultProps} />);

         expect(screen.queryByTestId('failed-badge')).not.toBeInTheDocument();
       });
     });
   ```

6. **Implement accessibility tests (lines 451-520)**
   ```typescript
     describe('Accessibility', () => {
       it('should have no accessibility violations', async () => {
         const { container } = render(<TranslationStatusWidget {...defaultProps} />);

         const results = await axe(container);
         expect(results).toHaveNoViolations();
       });

       it('should have ARIA labels for progress bar', () => {
         render(<TranslationStatusWidget {...defaultProps} />);

         const progressBar = screen.getByRole('progressbar');
         expect(progressBar).toHaveAttribute('aria-label');
         expect(progressBar).toHaveAttribute('aria-valuemin', '0');
         expect(progressBar).toHaveAttribute('aria-valuemax', '100');
       });

       it('should have keyboard accessible interactive counts', async () => {
         const user = userEvent.setup();
         const onFilterChange = vi.fn();

         render(<TranslationStatusWidget {...defaultProps} onFilterChange={onFilterChange} />);

         const pendingCount = screen.getByTestId('pending-count');
         pendingCount.focus();
         await user.keyboard('{Enter}');

         expect(onFilterChange).toHaveBeenCalled();
       });

       it('should announce status for screen readers', () => {
         render(<TranslationStatusWidget {...defaultProps} />);

         const srAnnouncement = screen.getByRole('status');
         expect(srAnnouncement).toBeInTheDocument();
       });
     });
   });
   ```

**Verification:**
- [ ] All 19 TranslationStatusWidget acceptance criteria covered
- [ ] Real-time updates tested
- [ ] Interactive elements fully tested
- [ ] Tests execute in under 5 seconds

**Estimated Effort:** 2 story points

---

### Task 34.5: Update Vitest Configuration for Coverage

**File:** `/vitest.config.ts`

**Objective:** Ensure the TranslationManagement components are included in coverage reporting.

**Implementation Steps:**

1. **Update coverage include paths**
   ```typescript
   // Add to coverage.include array:
   'src/components/TranslationManagement/**/*.ts',
   'src/components/TranslationManagement/**/*.tsx',
   ```

**Verification:**
- [ ] Coverage reports include TranslationManagement components
- [ ] Coverage threshold of 80% is achievable

**Estimated Effort:** 0.5 story points

---

## 4. Acceptance Criteria Checklist

### TranslationPreviewPanel Tests (17 criteria)
- [ ] Test file created at `/src/components/__tests__/TranslationPreviewPanel.test.tsx`
- [ ] Renders with no translations showing empty state message
- [ ] Renders translation rows for each configured language (6 languages)
- [ ] Displays "Complete" status with green indicator
- [ ] Displays "Pending" status with yellow indicator
- [ ] Displays "Failed" status with red indicator
- [ ] Displays "Stale" status with warning indicator
- [ ] Close button triggers onClose callback
- [ ] Edit button opens TranslationEditor with correct data
- [ ] Retry button triggers retryTranslation API call
- [ ] Re-translate button triggers re-translation job creation
- [ ] Loading state displays skeleton loaders
- [ ] Error state displays error message with retry option
- [ ] Translation content preview truncates long text
- [ ] "View Original" toggle switches content
- [ ] Timestamp display shows relative format
- [ ] Responsive layout adjusts for mobile

### TranslationEditor Tests (23 criteria)
- [ ] Test file created at `/src/components/__tests__/TranslationEditor.test.tsx`
- [ ] Renders with existing content pre-filled
- [ ] Renders with empty textarea when no translation
- [ ] Displays original source content in read-only section
- [ ] Displays character count updating as user types
- [ ] Save button disabled when textarea empty
- [ ] Save button enabled when valid content exists
- [ ] Cancel button closes without saving
- [ ] Save triggers updateTranslation API call
- [ ] Successful save shows success toast
- [ ] Successful save closes editor and refreshes parent
- [ ] API error displays error message
- [ ] Validation error when content exceeds maximum
- [ ] Dirty state prevents close without confirmation
- [ ] Confirmation dialog appears with unsaved changes
- [ ] Discard option closes without saving
- [ ] Keep editing option returns to editor
- [ ] Loading spinner during save operation
- [ ] Save button disabled during save
- [ ] Cmd+S/Ctrl+S triggers save
- [ ] Escape triggers cancel/close
- [ ] Language indicator displays correct name and flag
- [ ] Word count display alongside character count

### TranslationStatusWidget Tests (19 criteria)
- [ ] Test file created at `/src/components/__tests__/TranslationStatusWidget.test.tsx`
- [ ] Renders with zero translations showing empty state
- [ ] Displays pending count
- [ ] Displays completed count
- [ ] Displays failed count
- [ ] Displays total count
- [ ] Displays percentage progress bar
- [ ] Progress bar width matches percentage
- [ ] Counts update when hook data changes
- [ ] Clicking pending count filters items
- [ ] Clicking failed count opens retry dialog
- [ ] Refresh button triggers refetch
- [ ] Loading skeleton during initial fetch
- [ ] Error state with retry button
- [ ] Auto-refresh with polling enabled
- [ ] Real-time updates on job completion
- [ ] Badge alert for non-zero failed count
- [ ] Tooltip on progress bar hover
- [ ] Compact mode renders smaller layout

### General Requirements (14 criteria)
- [ ] Tests use React Testing Library
- [ ] Tests use Vitest (Jest-compatible)
- [ ] Tests use @testing-library/user-event
- [ ] API mock functions return realistic data
- [ ] Mock data includes required fields
- [ ] useTranslationStatus hook properly mocked
- [ ] Mock hook data can be updated during tests
- [ ] All tests clean up timers and subscriptions
- [ ] Tests verify accessibility attributes (ARIA)
- [ ] Tests verify correct CSS classes for states
- [ ] Tests achieve minimum 80% coverage
- [ ] Tests execute in under 10 seconds
- [ ] Test descriptions use clear naming convention
- [ ] Tests follow arrange-act-assert pattern

---

## 5. Dependencies

### Required Before Implementation

| Dependency | Status | Notes |
|------------|--------|-------|
| REQ-E05-006: TranslationPreviewPanel | Required | Component must exist |
| REQ-E05-009: TranslationEditor | Required | Component must exist |
| REQ-E05-013: TranslationStatusWidget | Required | Component must exist |
| REQ-E05-005: TranslationManagement.types.ts | Required | Types for mock data |
| REQ-E05-010: useTranslationStatus hook | Required | Hook to mock |
| REQ-E05-011: useTranslationRealtime hook | Optional | Can stub if incomplete |
| vitest configuration | Required | Already configured |
| @testing-library/react | Required | Already installed |
| vitest-axe | Required | Already installed |

---

## 6. Files Summary

### Files to CREATE

| File | Purpose | Est. Lines |
|------|---------|------------|
| `/src/components/TranslationManagement/__tests__/testUtils.ts` | Mock utilities and factories | ~270 |
| `/src/components/__tests__/TranslationPreviewPanel.test.tsx` | Panel component tests | ~650 |
| `/src/components/__tests__/TranslationEditor.test.tsx` | Editor component tests | ~620 |
| `/src/components/__tests__/TranslationStatusWidget.test.tsx` | Widget component tests | ~520 |

### Files to MODIFY

| File | Modification |
|------|--------------|
| `/vitest.config.ts` | Add coverage paths for TranslationManagement |

---

## 7. Total Effort Estimate

| Task | Story Points |
|------|--------------|
| Task 34.1: Test Infrastructure | 1 |
| Task 34.2: TranslationPreviewPanel Tests | 3 |
| Task 34.3: TranslationEditor Tests | 3 |
| Task 34.4: TranslationStatusWidget Tests | 2 |
| Task 34.5: Vitest Configuration | 0.5 |
| **Total** | **9.5 story points** |

---

## 8. Implementation Notes

### Test Naming Convention
Follow: `"should [expected behavior] when [condition]"`

### Mock Hook Pattern
```typescript
vi.mock('@/hooks/useTranslationStatus');
const mockUseTranslationStatus = vi.mocked(useTranslationStatus);
mockUseTranslationStatus.mockReturnValue({ ... });
```

### Cleanup Pattern
```typescript
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
  cleanup();
});
```

### Running Tests
```bash
npm run test -- --coverage
npm run test:watch  # Watch mode
```

---

## 9. Related Documents

- [REQ-E05-034-write-component-tests-overview.md](./REQ-E05-034-write-component-tests-overview.md)
- [Plan-111-L10N-Epic5-Owner-Translation-Management.md](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [REQ-E05-006-create-translationpreviewpanel-component-overview.md](./REQ-E05-006-create-translationpreviewpanel-component-overview.md)
- [REQ-E05-009-create-translationeditor-component-overview.md](./REQ-E05-009-create-translationeditor-component-overview.md)
- [REQ-E05-013-create-translationstatuswidget-component-overview.md](./REQ-E05-013-create-translationstatuswidget-component-overview.md)

---

*Document generated for FAQBNB L10N Epic 5 - Owner Translation Management*
*Task: Write Component Tests for Translation Management UI Components*
