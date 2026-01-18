# REQ-112: PDF Generation Integration - Detailed Task Breakdown

**Document Created:** 2026-01-05 17:45 UTC
**Last Modified:** 2026-01-05 11:25 UTC
**Status:** ✅ COMPLETED
**Phase:** 6 - Session Summary & QR Generation (9)
**Task ID:** 6.4
**Implementation Plan Reference:** `/docs/prd/Plan-093-Item-Creation-Workflow.md`
**Overview Document:** `/docs/REQ-112-pdf-generation-integration-overview.md`

---

## Executive Summary

This document provides granular, implementation-ready tasks for integrating PDF generation services into the Item Creation Workflow's Session Summary step. Each task is scoped to approximately 1 story point (a few hours of focused work) and follows established patterns from the existing codebase.

---

## Dependencies Verification

| Dependency | Status | Location | Verification |
|------------|--------|----------|--------------|
| REQ-109: Session Summary Step | ✅ Completed | `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx` | File exists |
| REQ-110: Print Options Panel | ✅ Completed | `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | File exists with 872 lines |
| REQ-111: QR Code Integration | ✅ Completed | `src/components/ItemCreationWorkflow/hooks/useSessionQRGeneration.ts` | File exists with 221 lines |

---

## Authorized Files for Modification

### New Files to Create

| # | File Path | Type | Purpose |
|---|-----------|------|---------|
| 1 | `src/components/ItemCreationWorkflow/hooks/usePDFExportSettings.ts` | Hook | PDF settings state management |
| 2 | `src/components/ItemCreationWorkflow/hooks/usePDFGeneration.ts` | Hook | PDF generation orchestration |
| 3 | `src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx` | Component | PDF export configuration modal |
| 4 | `src/components/ItemCreationWorkflow/hooks/__tests__/usePDFExportSettings.test.ts` | Test | Unit tests for settings hook |
| 5 | `src/components/ItemCreationWorkflow/hooks/__tests__/usePDFGeneration.test.ts` | Test | Unit tests for generation hook |
| 6 | `src/components/ItemCreationWorkflow/components/shared/__tests__/PDFExportDialog.test.tsx` | Test | Component tests for dialog |

### Files to Modify

| # | File Path | Sections to Modify |
|---|-----------|-------------------|
| 1 | `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx` | Add PDF dialog state, wire handleGeneratePDF |
| 2 | `src/components/ItemCreationWorkflow/components/shared/index.ts` | Add PDFExportDialog export |
| 3 | `src/components/ItemCreationWorkflow/hooks/index.ts` | Add PDF hooks exports |
| 4 | `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Add usePDFGeneration hook, wire callbacks |

### Read-Only Imports (Do Not Modify)

| File Path | Imports to Use |
|-----------|----------------|
| `src/lib/pdf-generator.ts` | `generatePDFFromQRCodes`, `downloadPDFBlob`, `convertPDFToBlob`, `PDFGenerationResult`, `PDFGenerationProgress`, `PDFPipelineOptions` |
| `src/types/pdf.ts` | `PDFExportSettings`, `PDFPageFormat` |
| `src/components/PDFExportOptions.tsx` | `PDFExportOptions` (component) |
| `@radix-ui/react-dialog` | `Dialog`, `DialogContent`, `DialogTitle`, etc. |

---

## Detailed Task Breakdown

### Task 6.4.1: Create PDF Export Settings State Hook

**Story Points:** 0.5
**Priority:** P0 (Foundation)

**File to Create:** `src/components/ItemCreationWorkflow/hooks/usePDFExportSettings.ts`

**Objective:** Create a state management hook for PDF export settings with sensible defaults.

#### Implementation Steps

1. **Create the hook file with header documentation:**
   ```typescript
   /**
    * usePDFExportSettings Hook
    *
    * Manages PDF export settings state with sensible defaults for the workflow.
    * Settings are session-only (no persistence to localStorage for V1).
    *
    * @module ItemCreationWorkflow/hooks/usePDFExportSettings
    * @see docs/REQ-112-pdf-generation-integration-overview.md
    * @lastModified 2026-01-05 (REQ-112 PDF Generation Integration)
    */
   ```

2. **Define interface types:**
   ```typescript
   import { useState, useCallback } from 'react';
   import type { PDFExportSettings, PDFPageFormat } from '@/types/pdf';

   export interface UsePDFExportSettingsOptions {
     /** Initial settings to override defaults */
     initialSettings?: Partial<PDFExportSettings>;
   }

   export interface UsePDFExportSettingsReturn {
     /** Current PDF export settings */
     settings: PDFExportSettings;
     /** Update one or more settings */
     updateSettings: (updates: Partial<PDFExportSettings>) => void;
     /** Reset all settings to defaults */
     resetToDefaults: () => void;
   }
   ```

3. **Define DEFAULT_SETTINGS constant:**
   - `pageFormat`: `'Letter'` (US default)
   - `margins`: `10` (10mm margins)
   - `qrSize`: `40` (40mm QR codes - optimal for scanning)
   - `includeCutlines`: `true`
   - `includeLabels`: `true`
   - `itemsPerRow`: `4`

4. **Implement hook with useState and useCallback:**
   - Initialize state from `initialSettings` merged with defaults
   - `updateSettings`: Merge partial updates with current state
   - `resetToDefaults`: Reset to DEFAULT_SETTINGS

5. **Export the hook as default and named export**

#### Verification Steps

- [ ] Hook initializes with default values when no options provided
- [ ] Hook respects `initialSettings` for partial overrides
- [ ] `updateSettings({ qrSize: 50 })` updates only qrSize, keeps other values
- [ ] `resetToDefaults()` restores all settings to defaults
- [ ] TypeScript compiles without errors
- [ ] No React warning about state updates

#### Acceptance Criteria

- [ ] Hook follows `useSessionQRGeneration.ts` pattern for structure
- [ ] All types are properly exported
- [ ] Settings can be partially updated without losing other values
- [ ] Default values match the specification (Letter, 10mm, 40mm, true, true, 4)

---

### Task 6.4.2: Create PDF Generation Service Hook

**Story Points:** 1.0
**Priority:** P0 (Core Logic)

**File to Create:** `src/components/ItemCreationWorkflow/hooks/usePDFGeneration.ts`

**Objective:** Create a hook that orchestrates QR codes → PDF generation with progress tracking and error handling.

#### Implementation Steps

1. **Create the hook file with header documentation** (follow `useSessionQRGeneration.ts` pattern)

2. **Define types section:**
   ```typescript
   import { useState, useCallback, useRef } from 'react';
   import {
     generatePDFFromQRCodes,
     downloadPDFBlob,
     convertPDFToBlob,
     PDFGenerationProgress,
     PDFGenerationResult,
     PDFPipelineOptions,
   } from '@/lib/pdf-generator';
   import type { PDFExportSettings } from '@/types/pdf';
   import type { SessionItem } from '../ItemCreationWorkflow.types';

   export interface UsePDFGenerationOptions {
     /** PDF export settings */
     settings: PDFExportSettings;
     /** Progress callback during generation */
     onProgress?: (progress: PDFGenerationProgress) => void;
   }

   export interface UsePDFGenerationReturn {
     /** Whether PDF generation is in progress */
     isGenerating: boolean;
     /** Current generation progress (0-100) */
     progress: PDFGenerationProgress | null;
     /** Error message if generation failed */
     error: string | null;
     /** Generate PDF from items and their QR codes */
     generatePDF: (
       items: SessionItem[],
       qrCodes: Map<string, string>
     ) => Promise<Blob | null>;
     /** Download a PDF blob with auto-generated filename */
     downloadPDF: (blob: Blob, filename?: string) => void;
     /** Clear error state */
     clearError: () => void;
   }
   ```

3. **Implement the hook:**
   - Track `isGenerating`, `progress`, and `error` state
   - Use `useRef` to track cancellation signal

4. **Implement `generatePDF` function:**
   - Set `isGenerating: true`
   - Clear previous error
   - Build URL map from items: `itemId → qrCode data URL`
   - Call `generatePDFFromQRCodes(qrCodes, settings, { onProgress })`
   - On success: Convert result to Blob using `convertPDFToBlob`
   - On failure: Set error state
   - Set `isGenerating: false`
   - Return Blob or null

5. **Implement `downloadPDF` function:**
   - Generate filename: `qr-codes-${formatDate(new Date())}.pdf` (YYYY-MM-DD format)
   - Call `downloadPDFBlob(blob, filename)`

6. **Implement `clearError` function:**
   - Set error to null

7. **Export hook as default and named export**

#### Verification Steps

- [ ] Hook initializes with `isGenerating: false`, `progress: null`, `error: null`
- [ ] `isGenerating` becomes `true` during generation
- [ ] Progress callback receives updates during generation
- [ ] Successful generation returns a valid Blob
- [ ] Failed generation sets error message
- [ ] `downloadPDF` triggers browser download
- [ ] `clearError` clears the error state

#### Acceptance Criteria

- [ ] Hook follows patterns from `useSessionQRGeneration.ts`
- [ ] Uses existing `generatePDFFromQRCodes` from `src/lib/pdf-generator.ts`
- [ ] Progress updates are exposed during generation
- [ ] Errors are captured and can be cleared
- [ ] Download uses descriptive filename with date

---

### Task 6.4.3: Create PDF Export Dialog Component

**Story Points:** 1.5
**Priority:** P0 (UI)

**File to Create:** `src/components/ItemCreationWorkflow/components/shared/PDFExportDialog.tsx`

**Objective:** Create a modal dialog that allows users to configure PDF settings before generation.

#### Implementation Steps

1. **Create the component file with header documentation:**
   ```typescript
   /**
    * PDFExportDialog Component
    *
    * Modal dialog for configuring PDF export settings before generation.
    * Embeds PDFExportOptions component for settings UI.
    *
    * @module ItemCreationWorkflow/components/shared/PDFExportDialog
    * @see docs/REQ-112-pdf-generation-integration-overview.md
    * @lastModified 2026-01-05 (REQ-112 PDF Generation Integration)
    */
   ```

2. **Define props interface:**
   ```typescript
   import * as Dialog from '@radix-ui/react-dialog';
   import { X, FileDown, AlertCircle, Loader2 } from 'lucide-react';
   import { cn } from '@/lib/utils';
   import { PDFExportOptions } from '@/components/PDFExportOptions';
   import type { PDFExportSettings } from '@/types/pdf';

   export interface PDFExportDialogProps {
     /** Whether the dialog is open */
     isOpen: boolean;
     /** Callback when dialog should close */
     onClose: () => void;
     /** Callback when user confirms export */
     onExport: (settings: PDFExportSettings) => Promise<void>;
     /** Number of items being exported */
     itemCount: number;
     /** Current PDF settings */
     settings: PDFExportSettings;
     /** Callback to update settings */
     onSettingsChange: (settings: Partial<PDFExportSettings>) => void;
     /** Whether PDF is being generated */
     isGenerating?: boolean;
     /** Error message to display */
     error?: string | null;
     /** Callback to clear error */
     onClearError?: () => void;
   }
   ```

3. **Create dialog structure using Radix UI Dialog:**
   - `Dialog.Root` with `open={isOpen}` and `onOpenChange`
   - `Dialog.Portal` for portal rendering
   - `Dialog.Overlay` with backdrop blur and fade animation
   - `Dialog.Content` with slide-up animation
   - `Dialog.Title` with item count
   - `Dialog.Description` (visually hidden for accessibility)

4. **Dialog content layout:**
   - Header: "Export QR Codes as PDF" with item count badge
   - Body: Embed `<PDFExportOptions />` component
   - Error banner (if error exists) with dismiss button
   - Footer: Cancel and Export buttons

5. **Implement handlers:**
   - `handleExport`: Call `onExport(settings)`
   - `handleClose`: Call `onClose()` if not generating
   - Close button disabled during generation

6. **Styling:**
   - Follow Airbnb design system colors (#FF385C primary, #222222 text)
   - Max width: 480px
   - Padding: 24px
   - Minimum touch targets: 48px for buttons

7. **Export component and types**

#### Verification Steps

- [ ] Dialog opens and closes correctly
- [ ] PDFExportOptions controls are functional
- [ ] Settings changes are reflected in state
- [ ] Export button triggers onExport with current settings
- [ ] Loading state shows spinner and disables controls
- [ ] Error state shows message with dismiss option
- [ ] Focus is trapped within dialog when open
- [ ] Escape key closes dialog (when not generating)

#### Acceptance Criteria

- [ ] Uses Radix UI Dialog for accessibility
- [ ] Embeds existing PDFExportOptions component
- [ ] Shows item count prominently
- [ ] Loading and error states handled properly
- [ ] Follows established component patterns (ConfirmExitDialog, RemoveItemDialog)
- [ ] Keyboard accessible

---

### Task 6.4.4: Update Hooks Barrel Export

**Story Points:** 0.25
**Priority:** P1 (Integration)

**File to Modify:** `src/components/ItemCreationWorkflow/hooks/index.ts`

**Objective:** Add exports for the new PDF hooks.

#### Implementation Steps

1. **Add new section header after QR Generation Hooks:**
   ```typescript
   // =============================================================================
   // PDF Generation Hooks (Task 6.4)
   // =============================================================================
   ```

2. **Add usePDFExportSettings exports:**
   ```typescript
   // Task 6.4.1: usePDFExportSettings - PDF settings state management
   export { usePDFExportSettings, DEFAULT_PDF_EXPORT_SETTINGS } from './usePDFExportSettings';
   export type {
     UsePDFExportSettingsOptions,
     UsePDFExportSettingsReturn,
   } from './usePDFExportSettings';
   ```

3. **Add usePDFGeneration exports:**
   ```typescript
   // Task 6.4.2: usePDFGeneration - PDF generation orchestration
   export { usePDFGeneration } from './usePDFGeneration';
   export type {
     UsePDFGenerationOptions,
     UsePDFGenerationReturn,
   } from './usePDFGeneration';
   ```

4. **Update lastModified comment in file header**

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] Exports are accessible from `'../../hooks'` import
- [ ] No circular dependency issues

#### Acceptance Criteria

- [ ] Follows existing barrel export pattern
- [ ] All types are properly exported
- [ ] Section comments match existing style

---

### Task 6.4.5: Update Shared Components Barrel Export

**Story Points:** 0.25
**Priority:** P1 (Integration)

**File to Modify:** `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Objective:** Add exports for PDFExportDialog component.

#### Implementation Steps

1. **Add new section before closing of Summary Components or create new section:**
   ```typescript
   // =============================================================================
   // PDF Export Components (Task 6.4)
   // =============================================================================

   // Task 6.4.3: PDFExportDialog
   export { PDFExportDialog } from './PDFExportDialog';
   export type { PDFExportDialogProps } from './PDFExportDialog';
   ```

2. **Update lastModified comment in file header**

#### Verification Steps

- [ ] File compiles without TypeScript errors
- [ ] Export is accessible from `'./shared'` import
- [ ] No circular dependency issues

#### Acceptance Criteria

- [ ] Follows existing barrel export pattern
- [ ] Type export included

---

### Task 6.4.6: Integrate PDF Generation into PrintOptionsPanel

**Story Points:** 1.0
**Priority:** P0 (Critical Integration)

**File to Modify:** `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`

**Objective:** Wire the "Generate PDF" button to open PDFExportDialog and handle PDF generation.

#### Implementation Steps

1. **Add new imports at top of file:**
   ```typescript
   import { PDFExportDialog } from './PDFExportDialog';
   import { usePDFExportSettings, usePDFGeneration } from '../../hooks';
   import type { PDFExportSettings } from '@/types/pdf';
   ```

2. **Add state for PDF dialog visibility (after existing state declarations around line 378):**
   ```typescript
   // PDF Export Dialog state (Task 6.4.6)
   const [showPDFDialog, setShowPDFDialog] = useState(false);
   ```

3. **Initialize PDF hooks:**
   ```typescript
   // PDF settings and generation hooks (Task 6.4.6)
   const pdfSettings = usePDFExportSettings();
   const pdfGeneration = usePDFGeneration({ settings: pdfSettings.settings });
   ```

4. **Add props to PrintOptionsPanelProps for PDF callback:**
   ```typescript
   /** Callback when PDF is generated with items, scope, and blob */
   onPDFGenerated?: (items: SessionItem[], scope: PrintScope, blob: Blob) => void;
   ```

5. **Update handleGeneratePDF function (around line 590-592):**
   ```typescript
   const handleGeneratePDF = useCallback(async () => {
     // Generate QR codes first if needed
     const scope = buildPrintScope();
     const itemsInScope = getItemsForScope(scope);
     const itemsNeedingQR = itemsInScope.filter(item =>
       !item.qrCodeUrl && !qrGeneration.qrCodes.has(item.id)
     );

     if (itemsNeedingQR.length > 0) {
       await qrGeneration.generateForItems(itemsNeedingQR);
     }

     // Open PDF dialog for configuration
     setShowPDFDialog(true);
   }, [buildPrintScope, getItemsForScope, qrGeneration]);
   ```

6. **Add PDF export confirmation handler:**
   ```typescript
   const handlePDFExportConfirm = useCallback(async (settings: PDFExportSettings) => {
     try {
       const scope = buildPrintScope();
       const itemsInScope = getItemsForScope(scope);

       // Merge QR codes from generation and existing items
       const allQRCodes = new Map<string, string>();
       for (const item of itemsInScope) {
         const qrCode = qrGeneration.qrCodes.get(item.id) || item.qrCodeUrl;
         if (qrCode) {
           allQRCodes.set(item.id, qrCode);
         }
       }

       // Generate PDF
       const blob = await pdfGeneration.generatePDF(itemsInScope, allQRCodes);

       if (blob) {
         // Download automatically
         pdfGeneration.downloadPDF(blob);

         // Close dialog
         setShowPDFDialog(false);

         // Notify parent
         onPDFGenerated?.(itemsInScope, scope, blob);

         // Complete session via existing callback
         await onGeneratePDF(scope);
       }
     } catch (error) {
       // Error handled by pdfGeneration hook
     }
   }, [buildPrintScope, getItemsForScope, qrGeneration, pdfGeneration, onPDFGenerated, onGeneratePDF]);
   ```

7. **Add PDFExportDialog to component return (after the main content, before closing div):**
   ```typescript
   {/* PDF Export Dialog (Task 6.4.6) */}
   <PDFExportDialog
     isOpen={showPDFDialog}
     onClose={() => setShowPDFDialog(false)}
     onExport={handlePDFExportConfirm}
     itemCount={getItemsForScope(buildPrintScope()).length}
     settings={pdfSettings.settings}
     onSettingsChange={pdfSettings.updateSettings}
     isGenerating={pdfGeneration.isGenerating}
     error={pdfGeneration.error}
     onClearError={pdfGeneration.clearError}
   />
   ```

#### Verification Steps

- [ ] "Generate PDF" button opens the PDFExportDialog
- [ ] QR codes are generated before dialog opens (if needed)
- [ ] Settings changes in dialog are reflected
- [ ] Export button generates PDF with selected settings
- [ ] PDF downloads automatically on success
- [ ] Dialog closes after successful export
- [ ] Errors are displayed in dialog with retry option
- [ ] Loading state is shown during generation

#### Acceptance Criteria

- [ ] Existing functionality preserved (scope selection, QR progress)
- [ ] PDF dialog integrates seamlessly
- [ ] Error states handled gracefully
- [ ] Props extended without breaking existing usage

---

### Task 6.4.7: Wire PDF Callbacks in Main Workflow Component

**Story Points:** 0.5
**Priority:** P1 (Integration)

**File to Modify:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Objective:** Ensure main workflow component passes valid handlers to PrintOptionsPanel.

#### Implementation Steps

1. **Read current file to understand existing structure**

2. **Add import for PDF hooks if not using via PrintOptionsPanel:**
   ```typescript
   // PDF hooks may already be handled internally by PrintOptionsPanel
   // Only add if main component needs direct access
   ```

3. **Add handler for PDF generation completion (if needed for session tracking):**
   ```typescript
   const handlePDFGenerated = useCallback((
     items: SessionItem[],
     scope: PrintScope,
     blob: Blob
   ) => {
     // Track that PDF was generated in session state if needed
     // This can be used for analytics or session completion tracking
     console.log(`PDF generated with ${items.length} items`);
   }, []);
   ```

4. **Pass handler to PrintOptionsPanel (if adding new prop):**
   ```typescript
   <PrintOptionsPanel
     // ... existing props
     onPDFGenerated={handlePDFGenerated}
   />
   ```

5. **Update session completion to include PDF action:**
   - Ensure `printAction: 'pdf'` is set when PDF is generated

#### Verification Steps

- [ ] Main component passes valid handler to PrintOptionsPanel
- [ ] Session completion tracking includes PDF action
- [ ] No TypeScript errors
- [ ] Existing workflow behavior unchanged

#### Acceptance Criteria

- [ ] Handler receives filtered items based on scope
- [ ] Session tracks that PDF was generated

---

### Task 6.4.8: Add Unit Tests for usePDFExportSettings Hook

**Story Points:** 0.5
**Priority:** P2 (Quality)

**File to Create:** `src/components/ItemCreationWorkflow/hooks/__tests__/usePDFExportSettings.test.ts`

**Objective:** Comprehensive unit tests for PDF settings hook.

#### Implementation Steps

1. **Create test file with header:**
   ```typescript
   /**
    * @jest-environment jsdom
    */
   import { renderHook, act } from '@testing-library/react';
   import { usePDFExportSettings, DEFAULT_PDF_EXPORT_SETTINGS } from '../usePDFExportSettings';
   ```

2. **Test: initializes with default settings:**
   ```typescript
   it('should initialize with default settings', () => {
     const { result } = renderHook(() => usePDFExportSettings());

     expect(result.current.settings.pageFormat).toBe('Letter');
     expect(result.current.settings.margins).toBe(10);
     expect(result.current.settings.qrSize).toBe(40);
     expect(result.current.settings.includeCutlines).toBe(true);
     expect(result.current.settings.includeLabels).toBe(true);
   });
   ```

3. **Test: respects initial settings override:**
   ```typescript
   it('should respect initial settings', () => {
     const { result } = renderHook(() =>
       usePDFExportSettings({ initialSettings: { pageFormat: 'A4', qrSize: 50 } })
     );

     expect(result.current.settings.pageFormat).toBe('A4');
     expect(result.current.settings.qrSize).toBe(50);
     expect(result.current.settings.margins).toBe(10); // Default preserved
   });
   ```

4. **Test: updates individual settings:**
   ```typescript
   it('should update individual settings without resetting others', () => {
     const { result } = renderHook(() => usePDFExportSettings());

     act(() => {
       result.current.updateSettings({ qrSize: 60 });
     });

     expect(result.current.settings.qrSize).toBe(60);
     expect(result.current.settings.pageFormat).toBe('Letter');
     expect(result.current.settings.margins).toBe(10);
   });
   ```

5. **Test: resets to defaults:**
   ```typescript
   it('should reset all settings to defaults', () => {
     const { result } = renderHook(() => usePDFExportSettings());

     act(() => {
       result.current.updateSettings({ pageFormat: 'A4', qrSize: 60, margins: 20 });
     });

     act(() => {
       result.current.resetToDefaults();
     });

     expect(result.current.settings).toEqual(DEFAULT_PDF_EXPORT_SETTINGS);
   });
   ```

6. **Test: handles multiple partial updates:**
   ```typescript
   it('should handle multiple sequential updates', () => {
     const { result } = renderHook(() => usePDFExportSettings());

     act(() => {
       result.current.updateSettings({ qrSize: 50 });
       result.current.updateSettings({ includeCutlines: false });
     });

     expect(result.current.settings.qrSize).toBe(50);
     expect(result.current.settings.includeCutlines).toBe(false);
   });
   ```

#### Verification Steps

- [ ] All tests pass with `npm test -- usePDFExportSettings`
- [ ] Coverage > 90% for the hook file
- [ ] No flaky tests

#### Acceptance Criteria

- [ ] Tests cover initialization, updates, and reset
- [ ] Tests follow patterns from `useWorkflowState.test.ts`
- [ ] All edge cases handled

---

### Task 6.4.9: Add Unit Tests for usePDFGeneration Hook

**Story Points:** 0.75
**Priority:** P2 (Quality)

**File to Create:** `src/components/ItemCreationWorkflow/hooks/__tests__/usePDFGeneration.test.ts`

**Objective:** Comprehensive unit tests for PDF generation hook.

#### Implementation Steps

1. **Create test file with mocks:**
   ```typescript
   /**
    * @jest-environment jsdom
    */
   import { renderHook, act, waitFor } from '@testing-library/react';
   import { usePDFGeneration } from '../usePDFGeneration';

   // Mock the pdf-generator module
   jest.mock('@/lib/pdf-generator', () => ({
     generatePDFFromQRCodes: jest.fn(),
     downloadPDFBlob: jest.fn(),
     convertPDFToBlob: jest.fn(),
   }));

   import {
     generatePDFFromQRCodes,
     downloadPDFBlob,
     convertPDFToBlob,
   } from '@/lib/pdf-generator';
   ```

2. **Test: initializes in idle state:**
   ```typescript
   it('should initialize with isGenerating=false and no error', () => {
     const { result } = renderHook(() =>
       usePDFGeneration({ settings: mockSettings })
     );

     expect(result.current.isGenerating).toBe(false);
     expect(result.current.progress).toBeNull();
     expect(result.current.error).toBeNull();
   });
   ```

3. **Test: sets isGenerating during generation:**
   ```typescript
   it('should set isGenerating=true during generation', async () => {
     (generatePDFFromQRCodes as jest.Mock).mockResolvedValue({
       success: true,
       pdfBytes: new Uint8Array([1, 2, 3]),
     });

     const { result } = renderHook(() =>
       usePDFGeneration({ settings: mockSettings })
     );

     let generatingDuringCall = false;

     const promise = act(async () => {
       const generatePromise = result.current.generatePDF(mockItems, mockQRCodes);
       // Check state during generation
       generatingDuringCall = result.current.isGenerating;
       await generatePromise;
     });

     await promise;

     expect(generatingDuringCall).toBe(true);
     expect(result.current.isGenerating).toBe(false);
   });
   ```

4. **Test: calls generatePDFFromQRCodes with correct parameters:**
   ```typescript
   it('should call generatePDFFromQRCodes with correct parameters', async () => {
     (generatePDFFromQRCodes as jest.Mock).mockResolvedValue({
       success: true,
       pdfBytes: new Uint8Array([1, 2, 3]),
     });

     const { result } = renderHook(() =>
       usePDFGeneration({ settings: mockSettings })
     );

     await act(async () => {
       await result.current.generatePDF(mockItems, mockQRCodes);
     });

     expect(generatePDFFromQRCodes).toHaveBeenCalledWith(
       mockQRCodes,
       mockSettings,
       expect.objectContaining({ onProgress: expect.any(Function) })
     );
   });
   ```

5. **Test: handles generation errors:**
   ```typescript
   it('should set error on generation failure', async () => {
     (generatePDFFromQRCodes as jest.Mock).mockResolvedValue({
       success: false,
       error: 'Generation failed',
     });

     const { result } = renderHook(() =>
       usePDFGeneration({ settings: mockSettings })
     );

     await act(async () => {
       await result.current.generatePDF(mockItems, mockQRCodes);
     });

     expect(result.current.error).toBe('Generation failed');
     expect(result.current.isGenerating).toBe(false);
   });
   ```

6. **Test: downloads PDF with correct filename:**
   ```typescript
   it('should download PDF with date-based filename', () => {
     const mockBlob = new Blob(['test'], { type: 'application/pdf' });

     const { result } = renderHook(() =>
       usePDFGeneration({ settings: mockSettings })
     );

     act(() => {
       result.current.downloadPDF(mockBlob);
     });

     expect(downloadPDFBlob).toHaveBeenCalledWith(
       mockBlob,
       expect.stringMatching(/qr-codes-\d{4}-\d{2}-\d{2}\.pdf/)
     );
   });
   ```

7. **Test: clearError clears error state:**
   ```typescript
   it('should clear error when clearError is called', async () => {
     (generatePDFFromQRCodes as jest.Mock).mockResolvedValue({
       success: false,
       error: 'Test error',
     });

     const { result } = renderHook(() =>
       usePDFGeneration({ settings: mockSettings })
     );

     await act(async () => {
       await result.current.generatePDF(mockItems, mockQRCodes);
     });

     expect(result.current.error).toBe('Test error');

     act(() => {
       result.current.clearError();
     });

     expect(result.current.error).toBeNull();
   });
   ```

#### Verification Steps

- [ ] All tests pass with `npm test -- usePDFGeneration`
- [ ] Mocks correctly isolate the hook from dependencies
- [ ] No flaky async tests

#### Acceptance Criteria

- [ ] Tests cover success, failure, and edge cases
- [ ] Tests follow patterns from `useSessionQRGeneration.test.ts`
- [ ] Coverage > 90%

---

### Task 6.4.10: Add Component Tests for PDFExportDialog

**Story Points:** 0.75
**Priority:** P2 (Quality)

**File to Create:** `src/components/ItemCreationWorkflow/components/shared/__tests__/PDFExportDialog.test.tsx`

**Objective:** Component tests for the PDF export dialog.

#### Implementation Steps

1. **Create test file with setup:**
   ```typescript
   /**
    * @jest-environment jsdom
    */
   import React from 'react';
   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   import userEvent from '@testing-library/user-event';
   import { PDFExportDialog } from '../PDFExportDialog';

   // Mock PDFExportOptions component
   jest.mock('@/components/PDFExportOptions', () => ({
     PDFExportOptions: jest.fn(({ onSettingsChange }) => (
       <div data-testid="pdf-export-options">
         <button onClick={() => onSettingsChange({ qrSize: 50 })}>
           Change QR Size
         </button>
       </div>
     )),
   }));
   ```

2. **Test: renders with correct item count:**
   ```typescript
   it('should display correct item count', () => {
     render(
       <PDFExportDialog
         isOpen={true}
         onClose={jest.fn()}
         onExport={jest.fn()}
         itemCount={12}
         settings={mockSettings}
         onSettingsChange={jest.fn()}
       />
     );

     expect(screen.getByText(/12/)).toBeInTheDocument();
   });
   ```

3. **Test: triggers onExport with settings:**
   ```typescript
   it('should trigger onExport when export button is clicked', async () => {
     const onExport = jest.fn().mockResolvedValue(undefined);

     render(
       <PDFExportDialog
         isOpen={true}
         onClose={jest.fn()}
         onExport={onExport}
         itemCount={5}
         settings={mockSettings}
         onSettingsChange={jest.fn()}
       />
     );

     const exportButton = screen.getByRole('button', { name: /export/i });
     await userEvent.click(exportButton);

     expect(onExport).toHaveBeenCalledWith(mockSettings);
   });
   ```

4. **Test: disables controls during loading:**
   ```typescript
   it('should disable controls when isGenerating is true', () => {
     render(
       <PDFExportDialog
         isOpen={true}
         onClose={jest.fn()}
         onExport={jest.fn()}
         itemCount={5}
         settings={mockSettings}
         onSettingsChange={jest.fn()}
         isGenerating={true}
       />
     );

     const exportButton = screen.getByRole('button', { name: /generating/i });
     expect(exportButton).toBeDisabled();
   });
   ```

5. **Test: displays error with dismiss:**
   ```typescript
   it('should display error message with dismiss option', () => {
     const onClearError = jest.fn();

     render(
       <PDFExportDialog
         isOpen={true}
         onClose={jest.fn()}
         onExport={jest.fn()}
         itemCount={5}
         settings={mockSettings}
         onSettingsChange={jest.fn()}
         error="PDF generation failed"
         onClearError={onClearError}
       />
     );

     expect(screen.getByText('PDF generation failed')).toBeInTheDocument();

     const dismissButton = screen.getByLabelText(/dismiss/i);
     fireEvent.click(dismissButton);

     expect(onClearError).toHaveBeenCalled();
   });
   ```

6. **Test: closes on cancel:**
   ```typescript
   it('should call onClose when cancel is clicked', async () => {
     const onClose = jest.fn();

     render(
       <PDFExportDialog
         isOpen={true}
         onClose={onClose}
         onExport={jest.fn()}
         itemCount={5}
         settings={mockSettings}
         onSettingsChange={jest.fn()}
       />
     );

     const cancelButton = screen.getByRole('button', { name: /cancel/i });
     await userEvent.click(cancelButton);

     expect(onClose).toHaveBeenCalled();
   });
   ```

#### Verification Steps

- [ ] All tests pass with `npm test -- PDFExportDialog`
- [ ] Tests cover all user interactions
- [ ] Accessibility attributes tested

#### Acceptance Criteria

- [ ] Tests cover rendering, interactions, and states
- [ ] Tests follow patterns from `PrintOptionsPanel.test.tsx`
- [ ] Dialog accessibility tested (focus, keyboard)

---

## Implementation Order

Execute tasks in this order to minimize dependencies and enable incremental testing:

```
1. Task 6.4.1 - Create usePDFExportSettings hook [Foundation]
     ↓
2. Task 6.4.2 - Create usePDFGeneration hook [Core Logic]
     ↓
3. Task 6.4.4 - Update hooks barrel export [Integration]
     ↓
4. Task 6.4.3 - Create PDFExportDialog component [UI]
     ↓
5. Task 6.4.5 - Update shared components barrel export [Integration]
     ↓
6. Task 6.4.6 - Integrate into PrintOptionsPanel [Critical Integration]
     ↓
7. Task 6.4.7 - Wire callbacks in main workflow [Integration]
     ↓
8. Task 6.4.8 - Add unit tests for usePDFExportSettings [Quality]
     ↓
9. Task 6.4.9 - Add unit tests for usePDFGeneration [Quality]
     ↓
10. Task 6.4.10 - Add component tests for PDFExportDialog [Quality]
```

---

## Testing Checklist

### Manual Testing

After all tasks are complete, perform these manual tests:

- [ ] **Happy Path - Letter Paper:**
  1. Create 3+ items in workflow
  2. Reach Session Summary step
  3. Click "Generate PDF" button
  4. Verify PDFExportDialog opens with item count
  5. Keep Letter format selected
  6. Click Export
  7. Verify PDF downloads automatically
  8. Open PDF and verify:
     - QR codes are visible
     - Labels show item names
     - Layout is correct for Letter paper

- [ ] **Happy Path - A4 Paper:**
  1. Repeat above with A4 selected
  2. Verify layout adjusts for A4 dimensions

- [ ] **Settings Changes:**
  1. Open PDF dialog
  2. Change QR size to 60mm
  3. Disable cutlines
  4. Export PDF
  5. Verify changes reflected in output

- [ ] **Error Recovery:**
  1. Simulate network error (browser DevTools)
  2. Attempt PDF generation
  3. Verify error is displayed in dialog
  4. Click dismiss
  5. Retry and verify success

- [ ] **Scope Selection:**
  1. Select "New Items Only" scope
  2. Generate PDF
  3. Verify only new items in PDF
  4. Select specific items
  5. Verify only selected items in PDF

---

## Risk Mitigations Applied

| Risk | Mitigation in Tasks |
|------|---------------------|
| PDF generation failure | Task 6.4.2 includes error handling; Task 6.4.3 shows error in dialog |
| Large item count slow | Progress tracking in usePDFGeneration; existing batch processing in pdf-generator |
| Memory issues | Uses existing pdf-lib which handles memory efficiently |
| User closes during generation | Dialog prevents close during generation; cleanup on unmount |
| Settings not persisting | Documented as V1 behavior (session-only) in Task 6.4.1 |

---

## Estimated Effort Summary

| Task | Estimate | Cumulative |
|------|----------|------------|
| 6.4.1 - Settings Hook | 0.5 hr | 0.5 hr |
| 6.4.2 - Generation Hook | 1.0 hr | 1.5 hr |
| 6.4.3 - Dialog Component | 1.5 hr | 3.0 hr |
| 6.4.4 - Hooks Export | 0.25 hr | 3.25 hr |
| 6.4.5 - Components Export | 0.25 hr | 3.5 hr |
| 6.4.6 - PrintOptionsPanel Integration | 1.0 hr | 4.5 hr |
| 6.4.7 - Main Workflow Wiring | 0.5 hr | 5.0 hr |
| 6.4.8 - Settings Hook Tests | 0.5 hr | 5.5 hr |
| 6.4.9 - Generation Hook Tests | 0.75 hr | 6.25 hr |
| 6.4.10 - Dialog Tests | 0.75 hr | 7.0 hr |
| **Total** | **~7 hours** | |

---

*Document generated for REQ-112: PDF Generation Integration*
*Last Modified: 2026-01-05 17:45 UTC*
