# REQ-111: QR Code Integration - Detailed Task Breakdown

**Created:** 2026-01-05 14:32:00 UTC
**Last Modified:** 2026-01-05 10:55:00 UTC
**Request:** REQ-111 - QR Code Generation and Progress Tracking for Item Creation Sessions
**Overview Document:** docs/REQ-111-qr-code-integration-overview.md
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 6, Task 6.3)
**Status:** COMPLETE

---

## Table of Contents

1. [Summary](#1-summary)
2. [Prerequisites](#2-prerequisites)
3. [Authorized Files for Modification](#3-authorized-files-for-modification)
4. [Task Breakdown](#4-task-breakdown)
5. [Testing Requirements](#5-testing-requirements)
6. [Acceptance Criteria Checklist](#6-acceptance-criteria-checklist)

---

## 1. Summary

This document provides a granular, step-by-step implementation guide for integrating QR code generation into the ItemCreationWorkflow. Each task is designed to be completable within a few hours of focused work (<=1 story point).

**Key Deliverables:**
- `useSessionQRGeneration` adapter hook
- `QRGenerationProgress` UI component
- Integration with `PrintOptionsPanel`
- Error handling with per-item retry capability
- Unit and integration tests

---

## 2. Prerequisites

Before starting implementation, verify:

- [x] REQ-109 (Session Summary Step) is complete
- [x] REQ-110 (Print Options Panel) is complete
- [x] `src/hooks/useQRCodeGeneration.ts` exists and exports the hook
- [x] `src/lib/qrcode-utils.ts` exists with batch generation utilities
- [x] All ItemCreationWorkflow types are defined in `ItemCreationWorkflow.types.ts`

---

## 3. Authorized Files for Modification

### 3.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` | Adapter hook bridging SessionItem to useQRCodeGeneration |
| `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | Progress UI component |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useSessionQRGeneration.test.ts` | Unit tests for adapter hook |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/QRGenerationProgress.test.tsx` | Unit tests for progress component |

### 3.2 Files to Modify

| File Path | Modifications |
|-----------|---------------|
| `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | Integrate QR generation flow, add progress state |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Export QRGenerationProgress component |
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Export useSessionQRGeneration hook |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Wire up QR generation callbacks |

### 3.3 Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|------------------|
| `src/hooks/useQRCodeGeneration.ts` | Existing hook API and patterns |
| `src/lib/qrcode-utils.ts` | QR code utility functions |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions (SessionItem, PrintScope) |
| `src/types/index.ts` | Item type definition for adapter |

---

## 4. Task Breakdown

### Task 4.1: Create useSessionQRGeneration Hook - Type Definitions

**File:** `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts`

**Description:** Define TypeScript interfaces for the adapter hook.

**Steps:**

1. Create the file `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts`
2. Add module header with JSDoc documentation:
   ```typescript
   /**
    * useSessionQRGeneration Hook
    *
    * Adapter hook that bridges SessionItem type to the existing useQRCodeGeneration hook.
    * Transforms SessionItem[] to Item-compatible format and manages QR generation state.
    *
    * @module ItemCreationWorkflow/hooks/useSessionQRGeneration
    * @see docs/REQ-111-qr-code-integration-overview.md
    * @lastModified 2026-01-05 (REQ-111 QR Code Integration)
    */
   ```
3. Import required types:
   - `SessionItem` from `../../ItemCreationWorkflow.types`
   - Types from `@/hooks/useQRCodeGeneration` (if exported)
4. Define `UseSessionQRGenerationOptions` interface with:
   - `batchSize?: number` (default: 5)
   - `baseUrl?: string` (default: window.location.origin)
5. Define `QRItemStatus` type: `'pending' | 'generating' | 'completed' | 'failed'`
6. Define `QRGenerationStats` interface with: `total`, `completed`, `failed`, `remaining`
7. Define `UseSessionQRGenerationReturn` interface with:
   - `qrCodes: Map<string, string>`
   - `isGenerating: boolean`
   - `progress: number`
   - `stats: QRGenerationStats`
   - `error: string | null`
   - `failedItemIds: Set<string>`
   - `itemStatuses: Map<string, QRItemStatus>`
   - `generateForItems: (items: SessionItem[]) => Promise<void>`
   - `retryFailed: (items: SessionItem[]) => Promise<void>`
   - `cancel: () => void`
   - `clear: () => void`

**Verification:**
- [ ] TypeScript compilation passes with no errors
- [ ] All interfaces are exported

**Estimated Time:** 30 minutes

---

### Task 4.2: Create useSessionQRGeneration Hook - Core Implementation

**File:** `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts`

**Description:** Implement the core hook logic that wraps `useQRCodeGeneration`.

**Steps:**

1. Import `useQRCodeGeneration` from `@/hooks/useQRCodeGeneration`
2. Import React hooks: `useCallback`, `useMemo`, `useRef`
3. Create `useSessionQRGeneration` function that accepts `UseSessionQRGenerationOptions`
4. Initialize the underlying `useQRCodeGeneration` hook:
   ```typescript
   const qrHook = useQRCodeGeneration({
     batchSize: options?.batchSize ?? 5,
     baseUrl: options?.baseUrl,
     enableRetry: true,
     maxRetries: 2,
   });
   ```
5. Create `transformSessionItems` helper function:
   - Input: `SessionItem[]`
   - Output: `Array<{ id: string; public_id: string; name: string }>`
   - Logic: Map each SessionItem to Item-like object using `item.id` as both `id` and `public_id`
6. Implement `generateForItems` callback:
   - Filter out items that already have `qrCodeUrl` defined
   - Transform remaining items using `transformSessionItems`
   - Call `qrHook.generateQRCodes(transformedItems)`
7. Implement `retryFailed` callback:
   - Filter session items to those in `qrHook.failedItems`
   - Transform and call `qrHook.retryFailedItems`
8. Implement `cancel` callback using `qrHook.clearQRCache` (abort via AbortController is handled internally)
9. Implement `clear` callback wrapping `qrHook.clearQRCache`
10. Create `itemStatuses` derived state from `qrHook` internal states
11. Return the complete `UseSessionQRGenerationReturn` object

**Verification:**
- [ ] Hook can be imported and instantiated without errors
- [ ] `generateForItems` correctly transforms SessionItem to Item format
- [ ] Items with existing `qrCodeUrl` are skipped

**Estimated Time:** 1.5 hours

---

### Task 4.3: Export useSessionQRGeneration Hook

**File:** `src/components/ItemCreationWorkflow/hooks/index.ts`

**Description:** Add the new hook to the barrel export file.

**Steps:**

1. Open `src/components/ItemCreationWorkflow/hooks/index.ts`
2. Add section comment for QR Generation:
   ```typescript
   // =============================================================================
   // QR Generation Hooks
   // =============================================================================
   ```
3. Add export statement:
   ```typescript
   // Task 6.3: useSessionQRGeneration - QR code generation adapter for session items
   export { useSessionQRGeneration } from './useSessionQRGeneration';
   export type {
     UseSessionQRGenerationOptions,
     UseSessionQRGenerationReturn,
     QRItemStatus,
     QRGenerationStats,
   } from './useSessionQRGeneration';
   ```

**Verification:**
- [ ] Hook can be imported from `@/components/ItemCreationWorkflow/hooks`
- [ ] All types are accessible via the barrel export

**Estimated Time:** 15 minutes

---

### Task 4.4: Create QRGenerationProgress Component - Type Definitions

**File:** `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Description:** Define the component props interface and supporting types.

**Steps:**

1. Create the file `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`
2. Add module header with JSDoc documentation:
   ```typescript
   /**
    * QRGenerationProgress Component
    *
    * Visual feedback component showing QR code generation progress,
    * status per item, and error states with retry capability.
    *
    * @module ItemCreationWorkflow/components/shared/QRGenerationProgress
    * @see docs/REQ-111-qr-code-integration-overview.md
    * @lastModified 2026-01-05 (REQ-111 QR Code Integration)
    */
   ```
3. Add `'use client';` directive
4. Import required dependencies:
   - React
   - Lucide icons: `Loader2`, `Check`, `X`, `RefreshCw`, `XCircle`, `AlertCircle`
   - `cn` from `@/lib/utils`
5. Define `QRProgressItemStatus` type: `'pending' | 'generating' | 'completed' | 'failed'`
6. Define `QRProgressItem` interface:
   ```typescript
   interface QRProgressItem {
     id: string;
     name: string;
     status: QRProgressItemStatus;
     qrCodeUrl?: string;
   }
   ```
7. Define `QRGenerationProgressProps` interface:
   ```typescript
   interface QRGenerationProgressProps {
     isGenerating: boolean;
     progress: number;
     stats: {
       total: number;
       completed: number;
       failed: number;
       remaining: number;
     };
     items: QRProgressItem[];
     error?: string | null;
     onRetry?: () => void;
     onRetryItem?: (itemId: string) => void;
     onCancel?: () => void;
     onContinue?: () => void;
     className?: string;
   }
   ```

**Verification:**
- [ ] All types are properly defined
- [ ] TypeScript compilation passes

**Estimated Time:** 30 minutes

---

### Task 4.5: Create QRGenerationProgress Component - Progress Bar

**File:** `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Description:** Implement the progress bar section of the component.

**Steps:**

1. Create `ProgressBar` sub-component (internal, not exported):
   ```typescript
   interface ProgressBarProps {
     progress: number;
     stats: { total: number; completed: number; failed: number; remaining: number };
   }
   ```
2. Implement progress bar layout:
   - Container with `bg-gray-200` track, height `8px`, rounded corners
   - Inner fill with `bg-[#FF385C]` (Airbnb pink), width based on `progress`
   - Smooth transition: `transition-all duration-300`
3. Add progress text below bar:
   - Format: "Generating QR code X of Y..."
   - Use `stats.completed + 1` for current (when generating)
   - Use `stats.total` for total
4. Handle edge cases:
   - When `progress === 100`: show "Complete!"
   - When all failed: show "Generation failed"
5. Add ARIA attributes:
   - `role="progressbar"`
   - `aria-valuenow={progress}`
   - `aria-valuemin={0}`
   - `aria-valuemax={100}`
   - `aria-label="QR code generation progress"`

**Verification:**
- [ ] Progress bar fills correctly based on percentage
- [ ] Text updates reflect current progress
- [ ] Accessibility attributes are present

**Estimated Time:** 45 minutes

---

### Task 4.6: Create QRGenerationProgress Component - Item Status List

**File:** `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Description:** Implement the scrollable list showing per-item status.

**Steps:**

1. Create `ItemStatusRow` sub-component:
   ```typescript
   interface ItemStatusRowProps {
     item: QRProgressItem;
     onRetry?: (itemId: string) => void;
   }
   ```
2. Implement status indicator icons:
   - `pending`: Gray circle (`bg-gray-300`, empty)
   - `generating`: Animated spinner (`Loader2` with `animate-spin`, `text-[#FF385C]`)
   - `completed`: Green checkmark (`Check` with `text-[#00A699]`)
   - `failed`: Red X (`X` with `text-[#FF5A5F]`)
3. Implement row layout:
   - Status icon (20px width, flex-shrink-0)
   - Item name (flex-1, truncate if needed, `text-[#222222]`)
   - For failed items: retry button with `RefreshCw` icon
4. Add retry button for failed items:
   - Small, text-only style
   - Icon + "Retry" text
   - Calls `onRetry(item.id)` on click
5. Wrap list in scrollable container:
   - Max height: `200px` on mobile, `280px` on desktop
   - `overflow-y-auto`
   - Spacing: `space-y-2`

**Verification:**
- [ ] Each status shows correct icon
- [ ] Spinner animates for generating items
- [ ] Failed items show retry button
- [ ] List scrolls when content exceeds max height

**Estimated Time:** 1 hour

---

### Task 4.7: Create QRGenerationProgress Component - Error Banner

**File:** `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Description:** Implement the error banner with batch retry and skip options.

**Steps:**

1. Create `ErrorBanner` sub-component:
   ```typescript
   interface ErrorBannerProps {
     error: string | null;
     failedCount: number;
     onRetryAll?: () => void;
     onContinue?: () => void;
   }
   ```
2. Implement error banner layout (matching PrintOptionsPanel pattern):
   - Red left border (`border-l-4 border-[#FF5A5F]`)
   - Light red background (`bg-red-50`)
   - Alert icon with error message
   - Count of failed items: "X items failed to generate"
3. Add action buttons:
   - "Retry Failed" button (outline style)
   - "Skip & Continue" button (text style)
4. Handle visibility:
   - Show when `error` is truthy OR `failedCount > 0`
   - Hide when no errors and all items succeeded
5. Add ARIA attributes:
   - `role="alert"`
   - `aria-live="polite"`

**Verification:**
- [ ] Error banner appears when errors exist
- [ ] Failed count is accurate
- [ ] Retry and Skip buttons are functional
- [ ] Screen readers announce errors

**Estimated Time:** 45 minutes

---

### Task 4.8: Create QRGenerationProgress Component - Cancel Button

**File:** `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Description:** Implement the cancel button shown during generation.

**Steps:**

1. Add cancel button within main component:
   - Position: Below progress bar, above item list
   - Visibility: Only when `isGenerating === true`
   - Style: Text button with `XCircle` icon
   - Text: "Cancel"
   - Color: `text-[#717171]` hover `text-[#222222]`
2. Wire up `onCancel` callback
3. Add keyboard accessibility:
   - Focusable with proper focus ring
   - Space/Enter triggers cancel
4. Ensure button is accessible:
   - `aria-label="Cancel QR code generation"`

**Verification:**
- [ ] Cancel button only visible during generation
- [ ] Clicking cancel calls onCancel callback
- [ ] Button is keyboard accessible

**Estimated Time:** 20 minutes

---

### Task 4.9: Assemble QRGenerationProgress Component

**File:** `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Description:** Assemble all sub-components into the final exported component.

**Steps:**

1. Create main `QRGenerationProgress` component function
2. Compose layout:
   ```tsx
   <div className={cn('space-y-4', className)}>
     <ProgressBar progress={progress} stats={stats} />
     {isGenerating && <CancelButton onCancel={onCancel} />}
     <ItemStatusList items={items} onRetryItem={onRetryItem} />
     <ErrorBanner
       error={error}
       failedCount={stats.failed}
       onRetryAll={onRetry}
       onContinue={onContinue}
     />
   </div>
   ```
3. Handle empty state:
   - If `items.length === 0`, show nothing (component shouldn't render)
4. Add conditional rendering:
   - Error banner only when errors exist
   - Cancel only during generation
5. Export component as named export and default export

**Verification:**
- [ ] Component renders correctly with all sub-components
- [ ] Layout matches design specifications
- [ ] All callbacks are wired correctly

**Estimated Time:** 30 minutes

---

### Task 4.10: Export QRGenerationProgress Component

**File:** `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Description:** Add the new component to the barrel export file.

**Steps:**

1. Open `src/components/ItemCreationWorkflow/components/shared/index.ts`
2. Add export statement:
   ```typescript
   // Task 6.3: QRGenerationProgress - QR generation progress UI
   export { QRGenerationProgress } from './QRGenerationProgress';
   export type { QRGenerationProgressProps } from './QRGenerationProgress';
   ```

**Verification:**
- [ ] Component can be imported from shared barrel export
- [ ] Props type is accessible

**Estimated Time:** 10 minutes

---

### Task 4.11: Integrate QR Generation into PrintOptionsPanel - State Setup

**File:** `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`

**Description:** Add QR generation state management to PrintOptionsPanel.

**Steps:**

1. Add new imports:
   ```typescript
   import { QRGenerationProgress } from './QRGenerationProgress';
   import { useSessionQRGeneration } from '../../hooks';
   ```
2. Update `PrintOptionsPanelProps` interface:
   ```typescript
   interface PrintOptionsPanelProps {
     // ... existing props ...
     /** All session items for QR generation */
     allSessionItems?: SessionItem[];
     /** Callback when QR generation completes */
     onQRGenerationComplete?: (qrCodes: Map<string, string>) => void;
   }
   ```
3. Add QR generation hook inside component:
   ```typescript
   const qrGeneration = useSessionQRGeneration({
     batchSize: 5,
   });
   ```
4. Add local state for QR generation UI:
   ```typescript
   const [showQRProgress, setShowQRProgress] = useState(false);
   const [qrItems, setQrItems] = useState<QRProgressItem[]>([]);
   ```

**Verification:**
- [ ] Props interface updated correctly
- [ ] Hook initializes without errors
- [ ] State variables are defined

**Estimated Time:** 30 minutes

---

### Task 4.12: Integrate QR Generation into PrintOptionsPanel - Flow Logic

**File:** `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`

**Description:** Modify PDF/Print button handlers to trigger QR generation first.

**Steps:**

1. Create helper function `getItemsForScope`:
   ```typescript
   const getItemsForScope = useCallback((scope: PrintScope): SessionItem[] => {
     switch (scope.type) {
       case 'all':
         return [...sessionItems, ...existingItems];
       case 'new-only':
         return sessionItems;
       case 'selected':
         const allItems = [...sessionItems, ...existingItems];
         return allItems.filter(item => scope.itemIds.includes(item.id));
     }
   }, [sessionItems, existingItems]);
   ```
2. Create `prepareQRGeneration` function:
   - Get items for current scope
   - Filter items missing `qrCodeUrl`
   - Build `QRProgressItem[]` array with initial 'pending' status
   - Set `showQRProgress(true)`
   - Set `qrItems` state
3. Modify `handleGeneratePDF`:
   - Call `prepareQRGeneration` if items need QR codes
   - Show progress UI
   - On completion, call original `onGeneratePDF` with QR codes attached
4. Modify `handlePrintDirect` similarly
5. Add effect to sync QR generation state to `qrItems`:
   ```typescript
   useEffect(() => {
     if (qrGeneration.isGenerating || qrGeneration.progress > 0) {
       setQrItems(prev => prev.map(item => ({
         ...item,
         status: qrGeneration.qrCodes.has(item.id) ? 'completed'
           : qrGeneration.failedItemIds.has(item.id) ? 'failed'
           : qrGeneration.isGenerating ? 'generating'
           : 'pending',
         qrCodeUrl: qrGeneration.qrCodes.get(item.id),
       })));
     }
   }, [qrGeneration.qrCodes, qrGeneration.failedItemIds, qrGeneration.isGenerating, qrGeneration.progress]);
   ```

**Verification:**
- [ ] Clicking Generate PDF triggers QR generation for items without QR codes
- [ ] Progress UI appears during generation
- [ ] Items with existing QR codes are skipped

**Estimated Time:** 1.5 hours

---

### Task 4.13: Integrate QR Generation into PrintOptionsPanel - UI Rendering

**File:** `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`

**Description:** Render the QRGenerationProgress component in PrintOptionsPanel.

**Steps:**

1. Add QRGenerationProgress rendering between scope selection and action buttons:
   ```tsx
   {showQRProgress && (
     <div className="border-t border-gray-200 pt-4">
       <QRGenerationProgress
         isGenerating={qrGeneration.isGenerating}
         progress={qrGeneration.progress}
         stats={qrGeneration.getStats()}
         items={qrItems}
         error={qrGeneration.error}
         onRetry={() => qrGeneration.retryFailed(getItemsForScope(buildPrintScope()))}
         onRetryItem={(itemId) => {
           const item = getItemsForScope(buildPrintScope()).find(i => i.id === itemId);
           if (item) qrGeneration.retryFailed([item]);
         }}
         onCancel={() => {
           qrGeneration.cancel();
           setShowQRProgress(false);
         }}
         onContinue={() => {
           // Proceed with partial QR codes
           handleProceedWithQRCodes();
         }}
       />
     </div>
   )}
   ```
2. Create `handleProceedWithQRCodes` function:
   - Attach generated QR codes to session items
   - Call the original `onGeneratePDF` or `onPrintDirect`
   - Hide progress UI
3. Disable action buttons during generation:
   - Add `qrGeneration.isGenerating` to disabled condition
4. Update button text during QR generation:
   - Change "Generate PDF" to "Generating QR Codes..."

**Verification:**
- [ ] Progress component renders in correct position
- [ ] Buttons are disabled during generation
- [ ] Continue after partial failure works

**Estimated Time:** 1 hour

---

### Task 4.14: Wire Up QR Generation in ItemCreationWorkflow

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Description:** Connect QR generation callbacks from PrintOptionsPanel to main workflow.

**Steps:**

1. Read current `ItemCreationWorkflow.tsx` to understand existing structure
2. Add handler for QR generation completion:
   ```typescript
   const handleQRGenerationComplete = useCallback((qrCodes: Map<string, string>) => {
     // Update session items with generated QR codes
     dispatch({
       type: 'UPDATE_ITEMS_QR_CODES',
       payload: qrCodes,
     });
   }, [dispatch]);
   ```
3. If `UPDATE_ITEMS_QR_CODES` action doesn't exist, it may need to be added to the reducer
4. Pass the callback to PrintOptionsPanel:
   ```tsx
   <PrintOptionsPanel
     // ... existing props ...
     allSessionItems={[...state.session.items, ...existingItems]}
     onQRGenerationComplete={handleQRGenerationComplete}
   />
   ```
5. Ensure session items flow correctly to print callbacks

**Verification:**
- [ ] QR codes are attached to items after generation
- [ ] PDF generation receives items with QR code URLs
- [ ] Session state updates correctly

**Estimated Time:** 45 minutes

---

### Task 4.15: Add UPDATE_ITEMS_QR_CODES Action to Workflow Reducer

**File:** `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`

**Description:** Add reducer action to update items with generated QR code URLs.

**Steps:**

1. Open `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
2. Add new action type to `WorkflowAction` union in types file:
   ```typescript
   | { type: 'UPDATE_ITEMS_QR_CODES'; payload: Map<string, string> }
   ```
3. Add case in reducer:
   ```typescript
   case 'UPDATE_ITEMS_QR_CODES': {
     const qrCodes = action.payload;
     return {
       ...state,
       session: {
         ...state.session,
         items: state.session.items.map(item => ({
           ...item,
           qrCodeUrl: qrCodes.get(item.id) ?? item.qrCodeUrl,
         })),
       },
     };
   }
   ```

**Verification:**
- [ ] Action type is recognized by reducer
- [ ] Items are updated with QR code URLs
- [ ] Existing QR codes are preserved if not in map

**Estimated Time:** 30 minutes

---

### Task 4.16: Write Unit Tests for useSessionQRGeneration Hook

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useSessionQRGeneration.test.ts`

**Description:** Create unit tests for the adapter hook.

**Steps:**

1. Create test file with proper imports
2. Mock `useQRCodeGeneration` hook:
   ```typescript
   jest.mock('@/hooks/useQRCodeGeneration');
   ```
3. Write test cases:
   - [ ] "transforms SessionItem[] to Item[] format correctly"
   - [ ] "skips items that already have qrCodeUrl"
   - [ ] "handles empty item array"
   - [ ] "reports progress correctly"
   - [ ] "handles retry with failed items only"
   - [ ] "cancel clears generation state"
   - [ ] "clear resets all state"
4. Use `@testing-library/react-hooks` or `@testing-library/react` for hook testing
5. Verify all public methods work as expected

**Verification:**
- [ ] All test cases pass
- [ ] Coverage > 80% for the hook

**Estimated Time:** 1.5 hours

---

### Task 4.17: Write Unit Tests for QRGenerationProgress Component

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/QRGenerationProgress.test.tsx`

**Description:** Create unit tests for the progress UI component.

**Steps:**

1. Create test file with proper imports
2. Write test cases:
   - [ ] "renders progress bar with correct percentage"
   - [ ] "shows correct status icon for each item state"
   - [ ] "displays error banner when error prop is set"
   - [ ] "calls onRetry when retry button is clicked"
   - [ ] "calls onCancel when cancel button is clicked"
   - [ ] "calls onRetryItem with correct itemId"
   - [ ] "hides cancel button when not generating"
   - [ ] "has correct ARIA attributes for accessibility"
3. Use `@testing-library/react` for component testing
4. Test keyboard interactions (Space/Enter on buttons)
5. Test screen reader announcements with ARIA

**Verification:**
- [ ] All test cases pass
- [ ] Coverage > 80% for the component
- [ ] Accessibility tests pass

**Estimated Time:** 1.5 hours

---

### Task 4.18: Write Integration Tests for PrintOptionsPanel with QR Generation

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/PrintOptionsPanel.test.tsx` (update existing)

**Description:** Add integration tests for QR generation flow.

**Steps:**

1. Open existing test file or create new test cases
2. Mock `useSessionQRGeneration` hook
3. Write integration test cases:
   - [ ] "triggers QR generation when Generate PDF clicked with items missing QR codes"
   - [ ] "shows progress UI during QR generation"
   - [ ] "skips QR generation when all items have QR codes"
   - [ ] "handles partial failure with retry option"
   - [ ] "allows proceeding with partial QR codes"
   - [ ] "cancel stops generation and hides progress"
4. Test scope selection affects which items generate QR codes
5. Verify correct callbacks are invoked with proper data

**Verification:**
- [ ] All integration tests pass
- [ ] Edge cases are covered

**Estimated Time:** 1 hour

---

### Task 4.19: Final Integration Testing and Cleanup

**Description:** End-to-end verification of the complete feature.

**Steps:**

1. Run full test suite: `npm test`
2. Verify no TypeScript errors: `npm run type-check`
3. Run linter: `npm run lint`
4. Manual testing checklist:
   - [ ] Create 3+ items in a session
   - [ ] Navigate to Session Summary
   - [ ] Click "Generate PDF" with "All Items" scope
   - [ ] Verify progress bar animates
   - [ ] Verify item status icons update
   - [ ] Test cancel mid-generation
   - [ ] Test retry after simulated failure
   - [ ] Verify PDF generates with QR codes
5. Check browser console for errors/warnings
6. Test on mobile viewport

**Verification:**
- [ ] All automated tests pass
- [ ] Manual testing complete
- [ ] No console errors in browser
- [ ] Mobile layout works correctly

**Estimated Time:** 1 hour

---

## 5. Testing Requirements

### 5.1 Unit Test Coverage

| File | Minimum Coverage |
|------|------------------|
| `useSessionQRGeneration.ts` | 80% |
| `QRGenerationProgress.tsx` | 80% |

### 5.2 Test Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- useSessionQRGeneration.test.ts

# Run with coverage
npm test -- --coverage

# Type check
npm run type-check
```

---

## 6. Acceptance Criteria Checklist

From REQ-111:

- [ ] Users can select one or more items from their session for QR code generation
- [ ] Progress indicator shows current generation status (e.g., "Generating 3 of 12")
- [ ] Successfully generated QR codes are visually distinguished from pending or failed items
- [ ] When generation fails for an item, an error message appears with a retry action
- [ ] Retrying a failed item does not regenerate already-successful QR codes
- [ ] Generation process can be cancelled by the user mid-operation
- [ ] Users can proceed with the workflow even if some QR codes failed to generate

---

## Task Summary

| Task | Description | Estimated Time |
|------|-------------|----------------|
| 4.1 | useSessionQRGeneration - Type Definitions | 30 min |
| 4.2 | useSessionQRGeneration - Core Implementation | 1.5 hrs |
| 4.3 | Export useSessionQRGeneration Hook | 15 min |
| 4.4 | QRGenerationProgress - Type Definitions | 30 min |
| 4.5 | QRGenerationProgress - Progress Bar | 45 min |
| 4.6 | QRGenerationProgress - Item Status List | 1 hr |
| 4.7 | QRGenerationProgress - Error Banner | 45 min |
| 4.8 | QRGenerationProgress - Cancel Button | 20 min |
| 4.9 | Assemble QRGenerationProgress Component | 30 min |
| 4.10 | Export QRGenerationProgress Component | 10 min |
| 4.11 | PrintOptionsPanel - State Setup | 30 min |
| 4.12 | PrintOptionsPanel - Flow Logic | 1.5 hrs |
| 4.13 | PrintOptionsPanel - UI Rendering | 1 hr |
| 4.14 | Wire Up in ItemCreationWorkflow | 45 min |
| 4.15 | Add Reducer Action | 30 min |
| 4.16 | Unit Tests - useSessionQRGeneration | 1.5 hrs |
| 4.17 | Unit Tests - QRGenerationProgress | 1.5 hrs |
| 4.18 | Integration Tests | 1 hr |
| 4.19 | Final Integration & Cleanup | 1 hr |
| **Total** | | **~14.5 hours** |

---

*Document generated on 2026-01-05 for REQ-111: QR Code Integration*
