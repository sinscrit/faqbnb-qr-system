# REQ-112: PDF Generation Integration for Item Creation Workflow

**Document Created:** 2026-01-05 17:15 UTC
**Last Modified:** 2026-01-05 17:15 UTC
**Phase:** 6 - Session Summary & QR Generation (9)
**Task ID:** 6.4
**Implementation Plan Reference:** `/docs/prd/Plan-093-Item-Creation-Workflow.md`

---

## Overview

This implementation breakdown covers the integration of existing PDF generation services into the Item Creation Workflow's Session Summary step. The integration enables users to generate and download professionally formatted PDFs containing QR codes for items created during their session, with configurable paper sizes (Letter, A4) and item name labels below each QR code.

### Dependencies

| Dependency | Status | Reference |
|------------|--------|-----------|
| REQ-109: Session Summary Step | Completed | `SessionSummaryStep.tsx` |
| REQ-110: Print Options Panel | Completed | `PrintOptionsPanel.tsx` |
| REQ-111: QR Code Integration | Completed | `useSessionQRGeneration.ts` |

### Scope

This task integrates existing PDF generation infrastructure into the workflow. It does NOT create new PDF generation logic but rather:
1. Connects the `PrintOptionsPanel` to existing PDF services
2. Adds PDF export settings UI (paper size, options)
3. Orchestrates QR code data → PDF generation → download

---

## Existing Infrastructure Analysis

### PDF Generation Services (Available)

| Service | Location | Purpose |
|---------|----------|---------|
| `pdf-generator.ts` | `src/lib/pdf-generator.ts` | Core PDF generation using `pdf-lib` with vector cutlines, QR embedding, and labels |
| `pdf-generator-pdfkit.ts` | `src/lib/pdf-generator-pdfkit.ts` | Alternative PDFKit-based generator for simpler layouts |
| `pdf-generator-qr-module.ts` | `src/lib/pdf-generator-qr-module.ts` | TypeScript wrapper for PDF module with QR support |

### Key Functions to Use

From `src/lib/pdf-generator.ts`:
```typescript
// Main generation pipeline
generatePDFFromQRCodes(
  qrCodes: Map<string, string>,  // itemId → QR data URL
  settings: PDFExportSettings,
  options?: PDFPipelineOptions
): Promise<PDFGenerationResult>

// Download helpers
downloadPDFBlob(blob: Blob, filename: string): void
convertPDFToBlob(pdfBytes: Uint8Array, filename: string): Blob
```

### PDFExportSettings Interface (from `src/types/pdf.ts`)

```typescript
interface PDFExportSettings {
  pageFormat: 'A4' | 'Letter';     // Paper size selection
  margins: number;                  // Margin in mm
  qrSize: number;                   // QR code size in mm
  includeCutlines: boolean;         // Vector cutlines for cutting
  includeLabels: boolean;           // Item names below QR codes
  itemsPerRow?: number;             // Optional column count
}
```

### Existing UI Component

`PDFExportOptions.tsx` at `src/components/PDFExportOptions.tsx` provides:
- Page format selector (A4 / US Letter with dimensions display)
- Margin slider (5-25mm)
- QR size slider (20-60mm)
- Cutlines toggle
- Labels toggle
- Export button with loading state

---

## Implementation Tasks

### Task 6.4.1: Create PDF Settings State Hook

**File:** `src/components/ItemCreationWorkflow/hooks/usePDFExportSettings.ts`

**Purpose:** Manage PDF export settings state with sensible defaults for the workflow.

```typescript
interface UsePDFExportSettingsReturn {
  settings: PDFExportSettings;
  updateSettings: (updates: Partial<PDFExportSettings>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: PDFExportSettings = {
  pageFormat: 'Letter',      // US default
  margins: 10,               // 10mm margins
  qrSize: 40,                // 40mm QR codes
  includeCutlines: true,
  includeLabels: true,
  itemsPerRow: 4
};
```

**Acceptance Criteria:**
- [ ] Hook initializes with sensible defaults for typical home printing
- [ ] Settings can be partially updated without losing other values
- [ ] Settings persist during session (no localStorage needed for V1)

---

### Task 6.4.2: Create PDF Generation Service Hook

**File:** `src/components/ItemCreationWorkflow/hooks/usePDFGeneration.ts`

**Purpose:** Orchestrate QR codes → PDF generation with progress tracking.

```typescript
interface UsePDFGenerationOptions {
  settings: PDFExportSettings;
  onProgress?: (progress: PDFGenerationProgress) => void;
}

interface UsePDFGenerationReturn {
  isGenerating: boolean;
  progress: PDFGenerationProgress | null;
  error: string | null;
  generatePDF: (items: SessionItem[], qrCodes: Map<string, string>) => Promise<Blob | null>;
  downloadPDF: (blob: Blob, filename?: string) => void;
  clearError: () => void;
}
```

**Implementation Notes:**
- Transform `SessionItem[]` and `Map<string, string>` to format expected by `generatePDFFromQRCodes`
- Use item names as labels when `includeLabels` is true
- Generate appropriate filename: `qr-codes-{date}.pdf`

**Acceptance Criteria:**
- [ ] Hook calls `generatePDFFromQRCodes` from `src/lib/pdf-generator.ts`
- [ ] Progress callback receives updates during generation
- [ ] Error states are captured and exposed
- [ ] Generated PDF blob can be downloaded via `downloadPDFBlob`

---

### Task 6.4.3: Add PDF Export Dialog Component

**File:** `src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`

**Purpose:** Modal dialog that embeds `PDFExportOptions` for configuring PDF settings before generation.

```typescript
interface PDFExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: PDFExportSettings) => Promise<void>;
  itemCount: number;
  isGenerating?: boolean;
  error?: string | null;
  onClearError?: () => void;
}
```

**UI Components:**
- Use Radix UI `Dialog` for accessible modal
- Embed `PDFExportOptions` component
- Show item count ("Exporting 12 QR codes")
- Progress indicator during generation
- Error display with dismiss

**Acceptance Criteria:**
- [ ] Dialog uses Radix UI Dialog primitive
- [ ] PDFExportOptions settings are passed to onExport
- [ ] Loading state disables controls and shows spinner
- [ ] Error state shows message with dismiss option
- [ ] Accessible with proper focus management

---

### Task 6.4.4: Integrate PDF Generation into PrintOptionsPanel

**File:** `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`

**Changes Required:**
1. Add state for PDF export dialog visibility
2. Wire "Generate PDF" button to open dialog
3. Handle PDF generation on dialog export
4. Pass generated QR codes from `useSessionQRGeneration` to PDF generation

**Updated Handler Flow:**
```typescript
const handleGeneratePDF = async () => {
  // 1. Ensure QR codes are generated for items in scope
  await startQRGeneration('pdf');
  // 2. Open PDF export dialog with settings
};

const handlePDFExportConfirm = async (settings: PDFExportSettings) => {
  // 1. Call usePDFGeneration.generatePDF with items and QR codes
  // 2. Trigger download on success
  // 3. Close dialog and call onGeneratePDF callback
};
```

**Acceptance Criteria:**
- [ ] "Generate PDF" button opens PDF export dialog
- [ ] QR codes are generated before PDF dialog opens (if needed)
- [ ] PDF is generated with selected settings
- [ ] PDF downloads automatically on success
- [ ] Dialog closes and session completes on success
- [ ] Errors are shown in dialog with retry option

---

### Task 6.4.5: Wire PDF Callbacks in Main Workflow Component

**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Purpose:** Implement the `onGeneratePDF` prop handler that gets passed to `PrintOptionsPanel`.

**Implementation:**
```typescript
const handleGeneratePDF = useCallback(async (
  items: SessionItem[],
  scope: PrintScope
): Promise<Blob> => {
  // Items and scope are already filtered by PrintOptionsPanel
  // Generate PDF using the internal usePDFGeneration hook
  const blob = await pdfGeneration.generatePDF(items, qrCodes);
  return blob;
}, [qrCodes, pdfGeneration]);
```

**Acceptance Criteria:**
- [ ] Main component passes valid handler to PrintOptionsPanel
- [ ] Handler receives filtered items based on scope
- [ ] Handler returns Blob for session completion tracking

---

### Task 6.4.6: Update Hooks Barrel Export

**File:** `src/components/ItemCreationWorkflow/hooks/index.ts`

**Changes:**
```typescript
export { usePDFExportSettings } from './usePDFExportSettings';
export { usePDFGeneration } from './usePDFGeneration';
export type {
  UsePDFExportSettingsReturn,
  UsePDFGenerationReturn,
  PDFGenerationProgress
} from './usePDFGeneration';
```

---

### Task 6.4.7: Update Shared Components Barrel Export

**File:** `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Changes:**
```typescript
export { PDFExportDialog } from './PDFExportDialog';
export type { PDFExportDialogProps } from './PDFExportDialog';
```

---

### Task 6.4.8: Add Unit Tests for PDF Hooks

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/usePDFExportSettings.test.ts`

**Test Cases:**
- [ ] Initializes with default settings
- [ ] Updates individual settings without resetting others
- [ ] Resets to defaults when requested

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/usePDFGeneration.test.ts`

**Test Cases:**
- [ ] Returns isGenerating=true during generation
- [ ] Calls generatePDFFromQRCodes with correct parameters
- [ ] Reports progress during generation
- [ ] Handles generation errors gracefully
- [ ] Downloads PDF blob with correct filename

---

### Task 6.4.9: Add Integration Tests for PDF Export Dialog

**File:** `src/components/ItemCreationWorkflow/components/shared/__tests__/PDFExportDialog.test.tsx`

**Test Cases:**
- [ ] Renders with correct item count
- [ ] Settings controls are interactive
- [ ] Export button triggers onExport with settings
- [ ] Loading state disables controls
- [ ] Error state displays message with dismiss

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Type | Purpose |
|-----------|------|---------|
| `src/components/ItemCreationWorkflow/hooks/usePDFExportSettings.ts` | Hook | PDF settings state management |
| `src/components/ItemCreationWorkflow/hooks/usePDFGeneration.ts` | Hook | PDF generation orchestration |
| `src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | Component | PDF export configuration modal |
| `src/components/ItemCreationWorkflow/hooks/__tests__/usePDFExportSettings.test.ts` | Test | Unit tests for settings hook |
| `src/components/ItemCreationWorkflow/hooks/__tests__/usePDFGeneration.test.ts` | Test | Unit tests for generation hook |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/PDFExportDialog.test.tsx` | Test | Component tests for dialog |

### Files to Modify

| File Path | Functions/Sections to Modify |
|-----------|------------------------------|
| `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | Add PDF dialog state, wire handleGeneratePDF |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add PDFExportDialog export |
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Add PDF hooks exports |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add usePDFGeneration hook, wire callbacks |

### Files to Import From (Read-Only)

| File Path | Imports |
|-----------|---------|
| `src/lib/pdf-generator.ts` | `generatePDFFromQRCodes`, `downloadPDFBlob`, `convertPDFToBlob`, `PDFGenerationResult`, `PDFGenerationProgress`, `PDFPipelineOptions` |
| `src/types/pdf.ts` | `PDFExportSettings`, `PDFPageFormat` |
| `src/components/PDFExportOptions.tsx` | `PDFExportOptions` (component) |
| `@radix-ui/react-dialog` | `Dialog`, `DialogContent`, `DialogTitle`, etc. |

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| PDF Library | Use existing `pdf-lib` via `pdf-generator.ts` | Already integrated, proven in production, supports vector cutlines |
| Settings UI | Embed `PDFExportOptions` component | Existing component with full functionality, avoids duplication |
| Dialog | Radix UI Dialog | Consistent with codebase patterns, accessible by default |
| Settings Persistence | Session-only (in-memory) | Keep V1 simple; localStorage can be added later if needed |
| Default Paper Size | Letter | US-centric default; user can change to A4 |
| Default QR Size | 40mm | Optimal for scanning reliability and space efficiency |
| Filename | `qr-codes-YYYY-MM-DD.pdf` | Descriptive, sortable by date |

---

## Risk Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PDF generation failure | Low | Medium | Error handling with retry option in dialog |
| Large item count causes slow generation | Medium | Medium | Progress indicator, batch processing already in place |
| Memory issues with many QR codes | Low | High | Existing `pdf-lib` handles memory efficiently; test with 50+ items |
| User closes dialog during generation | Medium | Low | Cancel handling, cleanup on unmount |

---

## Testing Checklist

### Unit Tests
- [ ] `usePDFExportSettings` hook state management
- [ ] `usePDFGeneration` hook generation flow
- [ ] Error handling in generation

### Component Tests
- [ ] `PDFExportDialog` renders correctly
- [ ] Settings changes are captured
- [ ] Loading and error states display properly

### Integration Tests
- [ ] End-to-end: Select items → Configure PDF → Download
- [ ] QR codes generated → PDF generated → File downloads
- [ ] Error recovery flow

### Manual Tests
- [ ] Letter paper size produces correct layout
- [ ] A4 paper size produces correct layout
- [ ] Item labels appear below QR codes when enabled
- [ ] Cutlines appear when enabled
- [ ] PDF opens correctly in PDF viewers (Preview, Chrome, Adobe)
- [ ] QR codes in PDF scan correctly

---

## Implementation Order

1. **Task 6.4.1** - Create `usePDFExportSettings` hook (foundation)
2. **Task 6.4.2** - Create `usePDFGeneration` hook (core logic)
3. **Task 6.4.3** - Create `PDFExportDialog` component (UI)
4. **Task 6.4.6** - Update hooks barrel export
5. **Task 6.4.7** - Update shared components barrel export
6. **Task 6.4.4** - Integrate into `PrintOptionsPanel`
7. **Task 6.4.5** - Wire callbacks in main workflow
8. **Task 6.4.8** - Add unit tests
9. **Task 6.4.9** - Add integration tests

---

## Estimated Effort

| Task | Estimate | Confidence |
|------|----------|------------|
| Task 6.4.1 (Settings Hook) | 0.5 hours | High |
| Task 6.4.2 (Generation Hook) | 1 hour | High |
| Task 6.4.3 (Dialog Component) | 1.5 hours | High |
| Task 6.4.4 (PrintOptionsPanel Integration) | 1 hour | Medium |
| Task 6.4.5 (Main Workflow Wiring) | 0.5 hours | High |
| Task 6.4.6-6.4.7 (Exports) | 0.25 hours | High |
| Task 6.4.8-6.4.9 (Tests) | 1.5 hours | Medium |
| **Total** | **~6 hours** | Medium-High |

---

*Document generated for REQ-112: PDF Generation Integration*
