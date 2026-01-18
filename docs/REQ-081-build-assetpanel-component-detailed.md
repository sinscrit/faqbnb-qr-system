# REQ-081: Build AssetPanel Component - Detailed Task Breakdown

**Document Created:** 2026-01-03 05:57:20
**Last Modified:** 2026-01-03 11:42:00
**Request Reference:** REQ-081 in `/docs/gen_requests.md`
**Overview Document:** `/docs/REQ-081-build-assetpanel-component-overview.md`
**Implementation Plan:** `/docs/prd/item-capture-manager-implementation-plan.md`
**Phase:** 5 - Asset Management
**Task ID:** 5.2
**Estimated Total Effort:** 2-3 story points (broken into sub-1-point tasks below)

---

## Executive Summary

This document breaks down REQ-081 (Build AssetPanel Component) into granular, actionable tasks suitable for an AI coding agent or junior developer. Each task is scoped to approximately 1 story point or less (a few hours of focused work).

The AssetPanel is a slide-in drawer component that enables users to view, add, and manage media assets for an item without navigating away from the current context. It consumes the `useAssetManagement` hook (Task 5.1/REQ-080) and serves as the container for child components AssetItem (Task 5.3) and AssetDropZone (Task 5.4).

---

## Prerequisites

Before starting these tasks, ensure:

1. **Task 5.1 (REQ-080) is complete:** The `useAssetManagement` hook must exist at `src/components/ItemManager/hooks/useAssetManagement.ts`
2. **ItemManager directory structure exists:** `src/components/ItemManager/` with types and hooks subdirectories
3. **ItemManager.types.ts contains required types:** `AssetPanelProps`, `PendingAsset`, `UseAssetManagementReturn`

---

## Authorized Files for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` | Main panel component |
| `src/components/ItemManager/components/AssetPanel/index.ts` | Barrel export for AssetPanel |

### Files to Modify

| File Path | Change |
|-----------|--------|
| `src/components/ItemManager/components/index.ts` | Add export for AssetPanel |
| `src/components/ItemManager/index.ts` | Re-export AssetPanel for external use |
| `src/components/ItemManager/ItemManager.types.ts` | Add/verify `AssetPanelProps` interface |
| `src/app/test/item-manager/page.tsx` | Add AssetPanel test section |

---

## Task Breakdown

### Task 5.2.1: Create AssetPanel Directory Structure and Type Definitions

**Estimated Effort:** 0.25 story points (~1 hour)

**Description:**
Set up the directory structure for the AssetPanel component and ensure all required type definitions are in place.

**Steps:**

1. Create directory `src/components/ItemManager/components/AssetPanel/`

2. Create `src/components/ItemManager/components/AssetPanel/index.ts` with placeholder export:
   ```typescript
   export { AssetPanel, default } from './AssetPanel';
   export type { AssetPanelProps } from '../../ItemManager.types';
   ```

3. Verify/add `AssetPanelProps` interface in `src/components/ItemManager/ItemManager.types.ts`:
   ```typescript
   export interface AssetPanelProps {
     /** Whether the panel is visible */
     isOpen: boolean;
     /** The item whose assets are being managed */
     item: ItemRecord | null;
     /** Callback when panel requests to close */
     onClose: () => void;
     /** Callback when assets are added */
     onAddAssets?: (itemId: string, assets: File[]) => Promise<void>;
     /** Callback when assets are removed */
     onRemoveAssets?: (itemId: string, assetIds: string[]) => Promise<void>;
     /** Callback when assets are reordered */
     onReorderAssets?: (itemId: string, orderedIds: string[]) => Promise<void>;
     /** Optional class names for customization */
     className?: string;
     /** Configuration for allowed media types */
     allowedMediaTypes?: ('video' | 'image' | 'pdf')[];
     /** Maximum file size in bytes */
     maxFileSize?: number;
   }
   ```

4. Update `src/components/ItemManager/components/index.ts` to export AssetPanel (placeholder for now)

**Verification:**
- [x] Directory `src/components/ItemManager/components/AssetPanel/` exists
- [x] `index.ts` barrel export file exists
- [x] `AssetPanelProps` type is defined in `ItemManager.types.ts`
- [x] TypeScript compilation passes with no errors

**Implementation Notes:** Created directory structure, added AssetPanelProps interface to ItemManager.types.ts, created barrel export file.

**Dependencies:** None (first task)

---

### Task 5.2.2: Implement Basic AssetPanel Shell with Backdrop and Drawer

**Estimated Effort:** 0.5 story points (~2 hours)

**Description:**
Create the basic AssetPanel component with backdrop overlay, slide-in drawer animation, and header/footer structure. No functional logic yet.

**Steps:**

1. Create `src/components/ItemManager/components/AssetPanel/AssetPanel.tsx` with:
   - `'use client'` directive
   - Import statements for React, Lucide icons (X, Loader2), and cn utility
   - Basic component signature accepting `AssetPanelProps`

2. Implement backdrop overlay:
   ```typescript
   <div
     className={cn(
       'fixed inset-0 bg-black/50 z-40 transition-opacity duration-200',
       isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
     )}
     onClick={onClose}
     aria-hidden="true"
   />
   ```

3. Implement drawer container with slide animation:
   ```typescript
   <div
     role="dialog"
     aria-modal="true"
     aria-labelledby="asset-panel-title"
     className={cn(
       'fixed inset-y-0 right-0 z-50 flex flex-col',
       'w-full sm:w-[400px] bg-white shadow-xl',
       'transform transition-transform duration-300 ease-out',
       isOpen ? 'translate-x-0' : 'translate-x-full',
       className
     )}
   >
   ```

4. Add header section with title and close button:
   ```typescript
   <div className="flex items-center justify-between p-4 border-b shrink-0">
     <h2 id="asset-panel-title" className="text-lg font-semibold text-gray-900">
       Manage Assets
     </h2>
     <button
       onClick={onClose}
       className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
       aria-label="Close panel"
     >
       <X className="w-5 h-5" />
     </button>
   </div>
   ```

5. Add scrollable content area placeholder:
   ```typescript
   <div className="flex-1 overflow-y-auto p-4">
     {/* Content placeholder */}
   </div>
   ```

6. Add footer with Cancel and Done buttons:
   ```typescript
   <div className="border-t p-4 flex gap-3 shrink-0">
     <button className="flex-1 py-2.5 px-4 text-gray-700 bg-gray-100 rounded-lg">
       Cancel
     </button>
     <button className="flex-1 py-2.5 px-4 text-white bg-gray-300 rounded-lg">
       Done
     </button>
   </div>
   ```

7. Export component as default and named export

**Verification:**
- [x] Component renders when `isOpen={true}`
- [x] Component is hidden when `isOpen={false}`
- [x] Backdrop appears with semi-transparent black overlay
- [x] Drawer slides in from right with smooth animation
- [x] Close button is visible in header
- [x] Cancel and Done buttons are visible in footer
- [x] TypeScript compilation passes

**Implementation Notes:** Created AssetPanel.tsx with full backdrop overlay, slide-in drawer animation, header with title and close button, footer with Cancel and Done buttons.

**Dependencies:** Task 5.2.1

---

### Task 5.2.3: Integrate useAssetManagement Hook and Session Management

**Estimated Effort:** 0.5 story points (~2 hours)

**Description:**
Wire up the useAssetManagement hook for state management and implement session start/end lifecycle.

**Steps:**

1. Import `useAssetManagement` hook:
   ```typescript
   import { useAssetManagement } from '../../hooks/useAssetManagement';
   ```

2. Add hook initialization inside component:
   ```typescript
   const {
     isActive,
     currentAssets,
     pendingAdditions,
     pendingRemovalIds,
     isDirty,
     isCommitting,
     error,
     startSession,
     endSession,
     addAsset,
     addAssets,
     removeAsset,
     undoRemoval,
     reorderAssets,
     commit,
     discard,
     isPendingAddition,
     isPendingRemoval,
     clearError,
   } = useAssetManagement({
     onAddAssets: props.onAddAssets,
     onRemoveAssets: props.onRemoveAssets,
     onReorderAssets: props.onReorderAssets,
     allowedMediaTypes: props.allowedMediaTypes,
     maxFileSize: props.maxFileSize,
   });
   ```

3. Add useEffect for session lifecycle:
   ```typescript
   useEffect(() => {
     if (isOpen && item) {
       startSession(item.id, item.media);
     }
   }, [isOpen, item?.id, startSession]);
   ```

4. Add early return if item is null:
   ```typescript
   if (!item) return null;
   ```

5. Update Cancel button to call discard and close:
   ```typescript
   const handleCancel = useCallback(() => {
     discard();
     endSession();
     onClose();
   }, [discard, endSession, onClose]);
   ```

6. Update Done button to call commit and close on success:
   ```typescript
   const handleDone = useCallback(async () => {
     const success = await commit();
     if (success) {
       endSession();
       onClose();
     }
   }, [commit, endSession, onClose]);
   ```

**Verification:**
- [x] Hook is initialized with correct options from props
- [x] Session starts when panel opens with valid item
- [x] Session does not start if item is null
- [x] Cancel calls discard, endSession, and onClose
- [x] Done calls commit and closes on success
- [x] TypeScript compilation passes

**Implementation Notes:** Integrated useAssetManagement hook with session lifecycle management. handleCancel and handleDone callbacks implemented.

**Dependencies:** Task 5.2.2, REQ-080 (useAssetManagement hook)

---

### Task 5.2.4: Implement Footer Button States and Loading Indicator

**Estimated Effort:** 0.25 story points (~1 hour)

**Description:**
Connect footer buttons to hook state for proper enabled/disabled states and loading indication.

**Steps:**

1. Update Cancel button with disabled state during commit:
   ```typescript
   <button
     onClick={handleCancel}
     disabled={isCommitting}
     className="flex-1 py-2.5 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
   >
     Cancel
   </button>
   ```

2. Update Done button with isDirty and isCommitting states:
   ```typescript
   <button
     onClick={handleDone}
     disabled={!isDirty || isCommitting}
     className={cn(
       'flex-1 py-2.5 px-4 text-white rounded-lg transition-colors flex items-center justify-center',
       isDirty
         ? 'bg-blue-600 hover:bg-blue-700'
         : 'bg-gray-300 cursor-not-allowed',
       isCommitting && 'opacity-75'
     )}
   >
     {isCommitting ? (
       <Loader2 className="w-5 h-5 animate-spin" />
     ) : (
       'Done'
     )}
   </button>
   ```

3. Import Loader2 icon from lucide-react

**Verification:**
- [x] Done button is disabled and gray when `isDirty` is false
- [x] Done button is enabled and blue when `isDirty` is true
- [x] Both buttons are disabled during commit
- [x] Loader spinner shows on Done button during commit
- [x] Visual transition is smooth

**Implementation Notes:** Footer buttons have proper state management with isDirty and isCommitting states. Loader2 spinner displays during commit.

**Dependencies:** Task 5.2.3

---

### Task 5.2.5: Implement Add Media Button and File Input

**Estimated Effort:** 0.5 story points (~2 hours)

**Description:**
Add the "Add Media" button that triggers file selection and handles file additions.

**Steps:**

1. Add useRef for hidden file input:
   ```typescript
   const fileInputRef = useRef<HTMLInputElement>(null);
   ```

2. Create handleAddMedia callback:
   ```typescript
   const handleAddMedia = useCallback(() => {
     fileInputRef.current?.click();
   }, []);
   ```

3. Create handleFileSelect callback:
   ```typescript
   const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
     const files = Array.from(e.target.files || []);
     if (files.length > 0) {
       await addAssets(files);
     }
     // Reset input to allow selecting same file again
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   }, [addAssets]);
   ```

4. Compute accept attribute from allowedMediaTypes:
   ```typescript
   const acceptAttribute = useMemo(() => {
     const types = allowedMediaTypes || ['video', 'image', 'pdf'];
     const mimeMap: Record<string, string> = {
       video: 'video/*',
       image: 'image/*',
       pdf: 'application/pdf',
     };
     return types.map(t => mimeMap[t]).join(',');
   }, [allowedMediaTypes]);
   ```

5. Add hidden file input:
   ```typescript
   <input
     ref={fileInputRef}
     type="file"
     multiple
     accept={acceptAttribute}
     onChange={handleFileSelect}
     className="hidden"
     aria-hidden="true"
   />
   ```

6. Add "Add Media" button in content area (Plus icon from lucide-react):
   ```typescript
   <button
     onClick={handleAddMedia}
     className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
   >
     <Plus className="w-5 h-5" />
     Add Media
   </button>
   ```

**Verification:**
- [x] Add Media button is visible in content area
- [x] Clicking button opens file picker
- [x] Selected files are passed to addAssets
- [x] Multiple file selection works
- [x] File type filtering matches allowedMediaTypes
- [x] Same file can be selected again after first selection

**Implementation Notes:** Hidden file input with ref, handleAddMedia and handleFileSelect callbacks, acceptAttribute computed from allowedMediaTypes.

**Dependencies:** Task 5.2.3

---

### Task 5.2.6: Implement Asset List Display with Placeholder Items

**Estimated Effort:** 0.5 story points (~2 hours)

**Description:**
Display the list of current assets (committed + pending) using placeholder item cards until AssetItem (Task 5.3) is implemented.

**Steps:**

1. Import ImageIcon from lucide-react for empty state

2. Map over currentAssets to render placeholder items:
   ```typescript
   {currentAssets.map((asset, index) => (
     <div
       key={asset.id}
       className={cn(
         'p-3 border rounded-lg',
         isPendingAddition(asset.id) && 'border-green-300 bg-green-50',
         isPendingRemoval(asset.id) && 'opacity-50 border-red-300 bg-red-50'
       )}
     >
       <div className="flex items-center gap-3">
         {/* Placeholder thumbnail */}
         <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
           <ImageIcon className="w-6 h-6 text-gray-400" />
         </div>
         {/* Asset info */}
         <div className="flex-1 min-w-0">
           <p className="text-sm font-medium text-gray-900 truncate">
             Asset {index + 1}
           </p>
           <p className="text-xs text-gray-500">
             {'type' in asset ? asset.type : 'pending'}
           </p>
         </div>
         {/* Action button */}
         {isPendingRemoval(asset.id) ? (
           <button
             onClick={() => undoRemoval(asset.id)}
             className="text-xs text-blue-600 hover:text-blue-800 underline"
           >
             Restore
           </button>
         ) : (
           <button
             onClick={() => removeAsset(asset.id)}
             className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
             aria-label="Remove asset"
           >
             <X className="w-4 h-4" />
           </button>
         )}
       </div>
     </div>
   ))}
   ```

3. Add visual indicators for pending states:
   - Green border/background for pending additions
   - Red border/background with reduced opacity for pending removals

**Verification:**
- [x] All currentAssets are displayed in the list
- [x] Pending additions show green visual indicator
- [x] Pending removals show red visual indicator with reduced opacity
- [x] Remove button appears on non-removed assets
- [x] Restore button appears on removed assets
- [x] Clicking Remove marks asset for removal
- [x] Clicking Restore undoes removal

**Implementation Notes:** Asset list with placeholder thumbnails using ImageIcon. Green/red visual indicators for pending states. Remove/Restore buttons implemented.

**Dependencies:** Task 5.2.5

---

### Task 5.2.7: Implement Empty State Display

**Estimated Effort:** 0.25 story points (~1 hour)

**Description:**
Display an appropriate empty state when no assets exist.

**Steps:**

1. Add conditional empty state after asset list:
   ```typescript
   {currentAssets.length === 0 && (
     <div className="text-center py-12 text-gray-500">
       <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
       <p className="font-medium">No assets yet</p>
       <p className="text-sm">Add media to get started</p>
     </div>
   )}
   ```

2. Ensure empty state is within the scrollable content area

3. Style empty state with centered content and muted colors

**Verification:**
- [x] Empty state shows when currentAssets is empty
- [x] Empty state hides when assets exist
- [x] Empty state displays icon, title, and description
- [x] Visual styling is consistent with design system

**Implementation Notes:** Empty state with centered ImageIcon, "No assets yet" title, and "Add media to get started" description.

**Dependencies:** Task 5.2.6

---

### Task 5.2.8: Implement Error Display and Dismissal

**Estimated Effort:** 0.25 story points (~1 hour)

**Description:**
Display errors from the hook and allow users to dismiss them.

**Steps:**

1. Add error display after header, before content:
   ```typescript
   {error && (
     <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
       <p className="text-sm text-red-700">{error.message}</p>
       <button
         onClick={clearError}
         className="text-xs text-red-600 hover:text-red-800 underline mt-1"
       >
         Dismiss
       </button>
     </div>
   )}
   ```

2. Ensure error does not push content off screen (fixed position relative to header)

**Verification:**
- [x] Error message displays when error state is set
- [x] Error message shows the error.message text
- [x] Clicking Dismiss calls clearError
- [x] Error disappears after dismissal
- [x] Error styling uses red/warning colors

**Implementation Notes:** Error display with red-50 background, border, and dismiss button that calls clearError.

**Dependencies:** Task 5.2.3

---

### Task 5.2.9: Implement Escape Key and Backdrop Click Handlers

**Estimated Effort:** 0.25 story points (~1 hour)

**Description:**
Add keyboard and mouse handlers for dismissing the panel.

**Steps:**

1. Add useEffect for Escape key handling:
   ```typescript
   useEffect(() => {
     if (!isOpen) return;

     const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'Escape') {
         handleCancel();
       }
     };

     document.addEventListener('keydown', handleKeyDown);
     return () => document.removeEventListener('keydown', handleKeyDown);
   }, [isOpen, handleCancel]);
   ```

2. Ensure backdrop onClick calls handleCancel (already in place from Task 5.2.2)

3. Prevent event bubbling from drawer to backdrop:
   ```typescript
   <div
     role="dialog"
     onClick={(e) => e.stopPropagation()}
     // ... rest of props
   >
   ```

**Verification:**
- [x] Pressing Escape closes the panel
- [x] Clicking backdrop closes the panel
- [x] Clicking inside drawer does not close the panel
- [x] Event listeners are cleaned up when panel closes

**Implementation Notes:** useEffect for Escape key listener with cleanup. Backdrop onClick calls handleCancel. stopPropagation on drawer click.

**Dependencies:** Task 5.2.3

---

### Task 5.2.10: Implement Focus Management and Accessibility

**Estimated Effort:** 0.5 story points (~2 hours)

**Description:**
Implement focus trapping, initial focus, and ARIA attributes for accessibility.

**Steps:**

1. Add refs for panel and first focusable element:
   ```typescript
   const panelRef = useRef<HTMLDivElement>(null);
   const firstFocusableRef = useRef<HTMLButtonElement>(null);
   ```

2. Add focus management on open:
   ```typescript
   useEffect(() => {
     if (isOpen) {
       // Focus first focusable element (close button)
       firstFocusableRef.current?.focus();
     }
   }, [isOpen]);
   ```

3. Apply firstFocusableRef to close button in header:
   ```typescript
   <button
     ref={firstFocusableRef}
     onClick={handleCancel}
     // ... rest
   >
   ```

4. Ensure all ARIA attributes are in place:
   - `role="dialog"` on drawer
   - `aria-modal="true"` on drawer
   - `aria-labelledby="asset-panel-title"` on drawer
   - `aria-label="Close panel"` on close button
   - `aria-label="Remove asset"` on remove buttons

5. Ensure all interactive elements are keyboard accessible:
   - Tab order flows logically through the panel
   - All buttons have visible focus states

**Verification:**
- [x] Focus moves to close button when panel opens
- [x] All interactive elements are focusable via Tab
- [x] Focus states are visible on all buttons
- [x] ARIA attributes are present and correct
- [x] Screen reader announces "Manage Assets" dialog

**Implementation Notes:** firstFocusableRef on close button with useEffect to focus on open. All ARIA attributes implemented (role, aria-modal, aria-labelledby, aria-label). Focus ring styles on all interactive elements.

**Dependencies:** Task 5.2.9

---

### Task 5.2.11: Add Test Harness Integration

**Estimated Effort:** 0.25 story points (~1 hour)

**Description:**
Add AssetPanel testing section to the test harness page.

**Steps:**

1. Open `src/app/test/item-manager/page.tsx`

2. Add state for asset panel:
   ```typescript
   const [assetPanelItem, setAssetPanelItem] = useState<ItemRecord | null>(null);
   ```

3. Add button to open asset panel:
   ```typescript
   <button
     onClick={() => setAssetPanelItem(mockItems[0])}
     className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
   >
     Open Asset Panel
   </button>
   ```

4. Import and render AssetPanel:
   ```typescript
   import { AssetPanel } from '@/components/ItemManager';

   // In JSX:
   <AssetPanel
     isOpen={!!assetPanelItem}
     item={assetPanelItem}
     onClose={() => setAssetPanelItem(null)}
     onAddAssets={async (itemId, files) => {
       console.log('=== ADD ASSETS ===', itemId, files);
     }}
     onRemoveAssets={async (itemId, ids) => {
       console.log('=== REMOVE ASSETS ===', itemId, ids);
     }}
     onReorderAssets={async (itemId, orderedIds) => {
       console.log('=== REORDER ASSETS ===', itemId, orderedIds);
     }}
   />
   ```

5. Add section heading and description in test page

**Verification:**
- [x] Button is visible in test harness
- [x] Clicking button opens AssetPanel
- [x] Panel displays with mock item data
- [x] Console logs appear for add/remove/reorder actions
- [x] Panel closes correctly

**Implementation Notes:** Added AssetPanel test section to /test/item-manager with item selection cards and callback logging. Added new 'asset-panel' view tab.

**Dependencies:** Task 5.2.10

---

### Task 5.2.12: Update Barrel Exports

**Estimated Effort:** 0.25 story points (~30 minutes)

**Description:**
Ensure AssetPanel is properly exported from all barrel files.

**Steps:**

1. Verify `src/components/ItemManager/components/AssetPanel/index.ts`:
   ```typescript
   export { AssetPanel, default } from './AssetPanel';
   export type { AssetPanelProps } from '../../ItemManager.types';
   ```

2. Update `src/components/ItemManager/components/index.ts`:
   ```typescript
   export * from './AssetPanel';
   // or
   export { AssetPanel, type AssetPanelProps } from './AssetPanel';
   ```

3. Verify `src/components/ItemManager/index.ts` re-exports from components:
   ```typescript
   export * from './components';
   // or
   export { AssetPanel } from './components';
   ```

**Verification:**
- [x] `import { AssetPanel } from '@/components/ItemManager'` works
- [x] `import { AssetPanelProps } from '@/components/ItemManager'` works
- [x] TypeScript compilation passes
- [x] No circular dependency warnings

**Implementation Notes:** Updated components/index.ts and main index.ts with AssetPanel exports. Build passes successfully.

**Dependencies:** Task 5.2.11

---

### Task 5.2.13: Final Verification and Manual Testing

**Estimated Effort:** 0.25 story points (~1 hour)

**Description:**
Perform comprehensive manual testing of all AssetPanel functionality.

**Steps:**

1. Run the development server: `npm run dev`

2. Navigate to test harness: `/test/item-manager`

3. Complete the following test checklist:

**Desktop Testing (Chrome):**
- [x] Panel slides in from right smoothly
- [x] Backdrop appears with correct opacity
- [x] Close button dismisses panel
- [x] Cancel button dismisses panel
- [x] Clicking backdrop dismisses panel
- [x] Pressing Escape dismisses panel
- [x] Add Media button opens file picker
- [x] Files appear in list after selection
- [x] Pending additions show green indicator
- [x] Remove button marks asset for removal
- [x] Restore button undoes removal
- [x] Done button is disabled when no changes
- [x] Done button is enabled when changes exist
- [x] Loading spinner shows during commit

**Mobile Testing (Chrome DevTools responsive mode):**
- [x] Panel takes full width on mobile
- [x] Touch targets are adequate (48x48px minimum)
- [x] Scrolling works for long asset lists
- [x] Buttons are easily tappable

**Accessibility Testing:**
- [x] Tab navigation works through all elements
- [x] Focus indicators are visible
- [x] Screen reader announces dialog correctly

4. Fix any issues discovered

5. Run TypeScript check: `npm run type-check` (if available) or `npx tsc --noEmit`

**Verification:**
- [x] All test checklist items pass
- [x] No console errors
- [x] No TypeScript errors
- [x] Component is production-ready

**Implementation Notes:** All tests passed. Build succeeds. Test harness accessible at /test/item-manager.

**Dependencies:** Task 5.2.12

---

## Task Summary Table

| Task ID | Description | Effort | Dependencies |
|---------|-------------|--------|--------------|
| 5.2.1 | Create directory structure and types | 0.25 SP | None |
| 5.2.2 | Implement basic shell with backdrop/drawer | 0.5 SP | 5.2.1 |
| 5.2.3 | Integrate useAssetManagement hook | 0.5 SP | 5.2.2, REQ-080 |
| 5.2.4 | Implement footer button states | 0.25 SP | 5.2.3 |
| 5.2.5 | Implement Add Media button | 0.5 SP | 5.2.3 |
| 5.2.6 | Implement asset list display | 0.5 SP | 5.2.5 |
| 5.2.7 | Implement empty state | 0.25 SP | 5.2.6 |
| 5.2.8 | Implement error display | 0.25 SP | 5.2.3 |
| 5.2.9 | Implement Escape key and backdrop click | 0.25 SP | 5.2.3 |
| 5.2.10 | Implement focus management and a11y | 0.5 SP | 5.2.9 |
| 5.2.11 | Add test harness integration | 0.25 SP | 5.2.10 |
| 5.2.12 | Update barrel exports | 0.25 SP | 5.2.11 |
| 5.2.13 | Final verification and testing | 0.25 SP | 5.2.12 |

**Total Estimated Effort:** 4.5 story points (broken into 13 sub-1-point tasks)

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Covered By Task(s) |
|--------------------|-------------------|
| Drawer slides in from right when triggered | 5.2.2 |
| Drawer displays scrollable list of assets | 5.2.6 |
| Each asset shown with thumbnail | 5.2.6 (placeholder) |
| "Add Media" button displayed | 5.2.5 |
| "Done" button commits changes | 5.2.3, 5.2.4 |
| "Cancel" button discards changes | 5.2.3, 5.2.4 |
| No navigation away from page | 5.2.2 |
| Visually distinct overlay | 5.2.2 |
| Keyboard navigation and screen reader accessible | 5.2.10 |
| Responsive mobile experience | 5.2.2 (width), 5.2.13 (testing) |
| Escape key and backdrop click trigger cancel | 5.2.9 |

---

## Technical Notes

### Patterns to Follow

1. **Modal Pattern:** Follow `src/components/ConfirmationModal.tsx` for overlay structure and button styling

2. **Hook Integration:** Follow patterns from `useItemCaptureState.ts` for reducer-based state

3. **Tailwind Classes:** Use `cn()` utility from `src/lib/utils.ts` for conditional class merging

4. **Icons:** Use Lucide React icons consistently (X, Plus, Loader2, ImageIcon)

### Known Limitations (V1)

1. **Placeholder Thumbnails:** Task 5.2.6 uses placeholder thumbnails until AssetItem (Task 5.3) is implemented

2. **No Drag-and-Drop:** Reordering via drag-and-drop is handled by Task 5.5

3. **No Focus Trapping:** Full focus trap implementation may require a library if issues arise

---

## References

- [REQ-081 Overview Document](/docs/REQ-081-build-assetpanel-component-overview.md)
- [REQ-080 useAssetManagement Hook](/docs/REQ-080-create-useassetmanagement-hook-overview.md)
- [Implementation Plan - Phase 5](/docs/prd/item-capture-manager-implementation-plan.md#phase-5-asset-management-estimated-3-4-days)
- [ConfirmationModal Pattern](/src/components/ConfirmationModal.tsx)
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-03 05:57:20 | Senior Dev Agent | Initial document creation |
