# REQ-111: QR Code Integration for Item Creation Workflow

**Created:** 2026-01-05
**Last Modified:** 2026-01-05
**Request:** REQ-111 - QR Code Generation and Progress Tracking for Item Creation Sessions
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 6, Task 6.3)
**Status:** Implementation Ready

---

## 1. Overview

### 1.1 Summary

This document details the implementation of QR code generation integration within the ItemCreationWorkflow's Session Summary and Print Options flow. The feature enables users to generate QR codes for selected items with real-time progress tracking, error handling with retry capability, and seamless integration with the existing print workflow.

### 1.2 Scope

- Integrate the existing `useQRCodeGeneration` hook into the ItemCreationWorkflow
- Create a new hook `useSessionQRGeneration` that adapts the existing QR generation for SessionItem types
- Add progress tracking UI with visual feedback
- Implement error handling with per-item retry functionality
- Integrate QR generation with PrintOptionsPanel action buttons

### 1.3 Dependencies

| Dependency | Location | Status |
|------------|----------|--------|
| `useQRCodeGeneration` hook | `src/hooks/useQRCodeGeneration.ts` | Existing - Complete |
| QR code utilities | `src/lib/qrcode-utils.ts` | Existing - Complete |
| PrintOptionsPanel | `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | REQ-110 - Complete |
| SessionSummaryStep | `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | REQ-109 - Complete |
| ItemCreationWorkflow types | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Existing |

---

## 2. Technical Context

### 2.1 Existing useQRCodeGeneration Hook Interface

The existing hook at `src/hooks/useQRCodeGeneration.ts` provides:

```typescript
interface UseQRCodeGenerationOptions {
  batchSize?: number;        // Default: 5
  baseUrl?: string;          // Default: window.location.origin
  enableRetry?: boolean;     // Default: true
  maxRetries?: number;       // Default: 2
}

interface UseQRCodeGenerationReturn {
  qrCodes: Map<string, string>;          // itemId -> dataUrl
  isGenerating: boolean;                  // Overall loading state
  progress: number;                       // 0-100 percentage
  error: string | null;                   // Current error message
  failedItems: Set<string>;              // IDs of failed items
  generateQRCodes: (items: Item[]) => Promise<void>;
  retryFailedItems: (items: Item[]) => Promise<void>;
  clearQRCache: () => void;
  getStats: () => { total, completed, failed, remaining };
}
```

**Important:** The hook expects `Item` objects with `id`, `public_id`, and `name` properties. Our `SessionItem` type uses different field names, requiring an adapter.

### 2.2 SessionItem vs Item Type Difference

```typescript
// SessionItem (ItemCreationWorkflow types)
interface SessionItem {
  id: string;              // UUID
  name: string;
  room: RoomType;
  itemType: ItemType;
  content: ContentPiece[];
  createdAt: Date;
  qrCodeUrl?: string;      // Populated after generation
}

// Item (src/types/index.ts)
interface Item {
  id: string;
  public_id: string;       // Used for QR URL generation
  name: string;
  // ... other fields
}
```

### 2.3 QR Code Generation Flow

```
PrintOptionsPanel                     useSessionQRGeneration
       │                                      │
       ├─── onGeneratePDF(scope) ───────────► │
       │                                      │
       │    ◄─── Transform SessionItems ──────┤
       │         to Item-like objects         │
       │                                      │
       │    ◄─── Call useQRCodeGeneration ────┤
       │         generateQRCodes()            │
       │                                      │
       │    ◄─── Progress updates ────────────┤
       │         (0-100%)                     │
       │                                      │
       │    ◄─── On Complete ─────────────────┤
       │         Map<itemId, dataUrl>         │
       │                                      │
       ▼                                      ▼
 PDF Generation with QR codes       Error handling / Retry
```

---

## 3. Implementation Tasks

### 3.1 Task Breakdown

| Task | Description | Estimate | Priority |
|------|-------------|----------|----------|
| 3.1.1 | Create `useSessionQRGeneration` adapter hook | 2 hours | P0 |
| 3.1.2 | Add QR generation progress UI component | 1.5 hours | P0 |
| 3.1.3 | Integrate with PrintOptionsPanel | 1.5 hours | P0 |
| 3.1.4 | Implement error display with retry | 1 hour | P0 |
| 3.1.5 | Add cancellation support | 0.5 hours | P1 |
| 3.1.6 | Write unit tests | 1.5 hours | P1 |

**Total Estimate:** 8 hours (1 day)

---

### 3.2 Task 3.1.1: Create useSessionQRGeneration Adapter Hook

**File:** `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts`

**Purpose:** Bridges SessionItem type to the existing useQRCodeGeneration hook by:
1. Converting SessionItem[] to Item-compatible format
2. Managing QR URL construction with proper public_id generation
3. Exposing a simplified API for the workflow context

**Interface:**

```typescript
interface UseSessionQRGenerationOptions {
  /** Batch size for processing (default: 5) */
  batchSize?: number;
  /** Base URL for QR codes (default: window.location.origin) */
  baseUrl?: string;
}

interface UseSessionQRGenerationReturn {
  /** Map of item ID to generated QR code data URL */
  qrCodes: Map<string, string>;
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Generation statistics */
  stats: {
    total: number;
    completed: number;
    failed: number;
    remaining: number;
  };
  /** Error message if any */
  error: string | null;
  /** Set of item IDs that failed generation */
  failedItemIds: Set<string>;
  /** Generate QR codes for session items */
  generateForItems: (items: SessionItem[]) => Promise<void>;
  /** Retry failed items */
  retryFailed: (items: SessionItem[]) => Promise<void>;
  /** Cancel ongoing generation */
  cancel: () => void;
  /** Clear all generated QR codes */
  clear: () => void;
}
```

**Implementation Notes:**
- Use `onSaveItem` callback result to obtain `public_id` for items
- If `qrCodeUrl` already exists on SessionItem, skip generation for that item
- Transform SessionItem to Item-like object: `{ id, public_id: item.id, name }`

---

### 3.3 Task 3.1.2: QR Generation Progress UI Component

**File:** `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx`

**Purpose:** Visual feedback component showing generation progress, status per item, and error states.

**Interface:**

```typescript
interface QRGenerationProgressProps {
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Generation statistics */
  stats: {
    total: number;
    completed: number;
    failed: number;
    remaining: number;
  };
  /** Items being generated with their status */
  items: Array<{
    id: string;
    name: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    qrCodeUrl?: string;
  }>;
  /** Error message if any */
  error?: string | null;
  /** Callback to retry failed items */
  onRetry?: () => void;
  /** Callback to cancel generation */
  onCancel?: () => void;
  /** Optional CSS class */
  className?: string;
}
```

**Visual Design:**
- Progress bar with percentage label (Airbnb pink: `#FF385C`)
- Status message: "Generating QR code 3 of 12..."
- Item list with status indicators:
  - Pending: Gray circle
  - Generating: Spinner (animated)
  - Completed: Green checkmark
  - Failed: Red X with retry button
- Error banner with retry action (uses existing error styling)
- Cancel button during generation

---

### 3.4 Task 3.1.3: Integrate with PrintOptionsPanel

**File:** `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`

**Modifications:**

1. Add QR generation state and hook integration
2. Modify `onGeneratePDF` and `onPrintDirect` to trigger QR generation first
3. Show progress UI during generation
4. Pass generated QR codes to PDF generation callbacks

**Updated Flow:**

```
User clicks "Generate PDF"
         │
         ▼
┌────────────────────────┐
│ Determine items to     │
│ generate based on      │
│ PrintScope selection   │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Filter items that need │
│ QR code generation     │
│ (missing qrCodeUrl)    │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Show progress UI       │
│ Generate QR codes      │
└───────────┬────────────┘
            │
            ▼ (on complete or partial)
┌────────────────────────┐
│ Call onGeneratePDF     │
│ with items + QR codes  │
└────────────────────────┘
```

**Code Changes:**

```typescript
// Add to PrintOptionsPanel props
interface PrintOptionsPanelProps {
  // ... existing props ...

  /** Called when QR codes need to be generated for items */
  onGenerateQRCodes?: (items: SessionItem[]) => Promise<Map<string, string>>;
}

// Add internal state
const [qrGenerationState, setQrGenerationState] = useState<{
  isGenerating: boolean;
  progress: number;
  itemStatuses: Map<string, 'pending' | 'generating' | 'completed' | 'failed'>;
  error: string | null;
}>();
```

---

### 3.5 Task 3.1.4: Error Display with Retry

**Location:** Within `QRGenerationProgress.tsx`

**Error Scenarios:**
1. Network timeout during generation
2. Invalid QR code data URL
3. Canvas rendering failure (Safari-specific)
4. Memory constraints (iOS devices)

**Retry Behavior:**
- Failed items are tracked by ID in `failedItemIds` Set
- Retry button triggers `retryFailed()` with only failed items
- Successfully generated QR codes are preserved
- Maximum 2 automatic retries per item (configurable)

**Error Message Display:**
- Uses existing error banner pattern from PrintOptionsPanel
- Shows count of failed items: "3 items failed to generate"
- Includes "Retry Failed" and "Skip & Continue" options

---

### 3.6 Task 3.1.5: Cancellation Support

**Implementation:**
- AbortController integration (already in useQRCodeGeneration)
- Cancel button visible during generation
- On cancel: stops batch processing, preserves completed QR codes
- User can retry remaining items or proceed with partial results

---

## 4. Authorized Files for Modification

### 4.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` | Adapter hook for QR generation |
| `src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | Progress UI component |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useSessionQRGeneration.test.ts` | Unit tests for adapter hook |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/QRGenerationProgress.test.tsx` | Unit tests for progress component |

### 4.2 Files to Modify

| File Path | Modifications |
|-----------|---------------|
| `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | Integrate QR generation flow, add progress state |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Export new components |
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Export new hook |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Wire up QR generation to print flow |

### 4.3 Files to Reference (Read-Only)

| File Path | Reference Purpose |
|-----------|------------------|
| `src/hooks/useQRCodeGeneration.ts` | Existing hook API and patterns |
| `src/lib/qrcode-utils.ts` | QR code utility functions |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | Type definitions |
| `src/types/index.ts` | Item type definition for adapter |

---

## 5. Integration Points

### 5.1 With ItemCreationWorkflow.tsx

The main workflow component needs to:
1. Provide `onSaveItem` results (with `qrCodeUrl`) to PrintOptionsPanel
2. Handle PDF generation callback with QR code data
3. Manage session completion with generated QR codes

```typescript
// In handleProceedToPrint callback
const handleProceedToPrint = useCallback(() => {
  // Navigate to print options view with QR generation capability
  goToStep('print-options'); // or show PrintOptionsPanel
}, [goToStep]);

// In onGeneratePDF callback passed to PrintOptionsPanel
const handleGeneratePDF = useCallback(async (
  items: SessionItem[],
  scope: PrintScope
) => {
  // Items will have qrCodeUrl populated after QR generation
  return await pdfService.generateQRSheet(items, scope);
}, []);
```

### 5.2 With useQRCodeGeneration Hook

The adapter hook wraps the existing hook:

```typescript
import { useQRCodeGeneration } from '@/hooks/useQRCodeGeneration';

export function useSessionQRGeneration(options?: UseSessionQRGenerationOptions) {
  const qrHook = useQRCodeGeneration({
    batchSize: options?.batchSize ?? 5,
    baseUrl: options?.baseUrl,
    enableRetry: true,
    maxRetries: 2,
  });

  const generateForItems = useCallback(async (sessionItems: SessionItem[]) => {
    // Transform SessionItem[] to Item[] format
    const items = sessionItems.map(item => ({
      id: item.id,
      public_id: item.id, // Use item.id as public_id for URL generation
      name: item.name,
    }));

    await qrHook.generateQRCodes(items);
  }, [qrHook]);

  // ... rest of adapter implementation
}
```

---

## 6. Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| Users can select one or more items for QR generation | PrintOptionsPanel scope selection + item checkboxes |
| Progress indicator shows current generation status | QRGenerationProgress component with stats display |
| Successfully generated QR codes visually distinguished | Checkmark icon + green status in progress list |
| Failed items show error with retry action | Error banner + per-item retry button |
| Retrying does not regenerate successful items | failedItemIds Set tracking, retry only failed |
| Generation can be cancelled mid-operation | Cancel button + AbortController integration |
| Users can proceed even if some QR codes failed | "Skip & Continue" option in error state |

---

## 7. Testing Strategy

### 7.1 Unit Tests

**useSessionQRGeneration.test.ts:**
- Transforms SessionItem[] to Item[] correctly
- Delegates to useQRCodeGeneration properly
- Handles empty item array
- Preserves existing qrCodeUrl (skip generation)
- Reports progress correctly
- Handles retry with failed items only

**QRGenerationProgress.test.tsx:**
- Renders progress bar with correct percentage
- Shows correct status icons per item
- Displays error banner on failure
- Calls onRetry when retry button clicked
- Calls onCancel when cancel button clicked
- Accessible (ARIA labels, roles)

### 7.2 Integration Tests

- Full flow: Select items → Generate QR → PDF creation
- Partial failure: Some items fail → Retry → Complete
- Cancel during generation → Preserve completed
- Print scope changes → Correct items selected

---

## 8. Design Specifications

### 8.1 Colors (Airbnb Design System)

| Element | Color |
|---------|-------|
| Progress bar fill | `#FF385C` (brand primary) |
| Progress bar track | `#E5E7EB` (gray-200) |
| Success icon | `#00A699` (success green) |
| Error icon/text | `#FF5A5F` (error red) |
| Pending status | `#717171` (text secondary) |

### 8.2 Spacing

- Progress section padding: `16px` (`p-4`)
- Item list gap: `12px` (`space-y-3`)
- Icon size: `20px` (`w-5 h-5`)

### 8.3 Typography

- Progress label: `16px` / `font-medium` / `#222222`
- Status message: `14px` / `font-normal` / `#717171`
- Item name: `14px` / `font-medium` / `#222222`
- Error text: `14px` / `font-normal` / `#222222`

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| QR generation timeout on slow networks | Medium | Medium | 10-second timeout per item, auto-retry |
| Memory issues with large batch (50+ items) | Low | High | Batch processing (5 items), progress feedback |
| Safari canvas issues | Medium | Medium | Fallback rendering in qrcode-utils.ts |
| User navigates away during generation | Low | Low | Cleanup on unmount, preserve progress |

---

## 10. Open Questions

1. **Q:** Should QR codes be persisted to database during generation, or only when PDF is created?
   - **Recommendation:** Generate on-demand for PDF, persist URL in SessionItem for session duration only

2. **Q:** Maximum time to wait for QR generation before allowing "Skip & Continue"?
   - **Recommendation:** Show skip option after 5 seconds of generation, always show if any failures

3. **Q:** Should we pre-generate QR codes when items are saved in PreviewSaveStep?
   - **Recommendation:** Defer to print time to avoid unnecessary generation if user doesn't print

---

## 11. References

- [Plan-093-Item-Creation-Workflow.md](./prd/Plan-093-Item-Creation-Workflow.md) - Phase 6, Task 6.3
- [REQ-109 Session Summary Step](./REQ-109-session-summary-step-overview.md)
- [REQ-110 Print Options Panel](./REQ-110-print-options-panel-overview.md)
- [useQRCodeGeneration Hook](../src/hooks/useQRCodeGeneration.ts)
- [QR Code Utilities](../src/lib/qrcode-utils.ts)
