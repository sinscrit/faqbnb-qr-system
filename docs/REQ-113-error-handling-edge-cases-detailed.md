# Detailed Task Breakdown: Error Handling and Edge Cases for Item Creation Workflow

**Document ID:** REQ-113-Detailed
**Request Reference:** REQ-113 (docs/gen_requests.md)
**Overview Document:** docs/REQ-113-error-handling-edge-cases-overview.md
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md (Phase 7, Task 7.1)
**Created:** 2026-01-05 11:32:01 UTC
**Last Modified:** 2026-01-05 11:32:01 UTC

---

## Document Purpose

This detailed task breakdown transforms the implementation overview into granular, actionable tasks suitable for AI coding agents or junior developers. Each task is scoped to approximately 1 story point (a few hours of focused work) and includes clear verification steps.

---

## Task Summary

| Task # | Title | Story Points | Priority |
|--------|-------|--------------|----------|
| 1.1 | Add Network Status Detection to useUrlPreview | 1 | High |
| 1.2 | Create NetworkErrorIndicator Component | 1 | High |
| 1.3 | Integrate Network Error Handling into ContentCreationStep | 1 | High |
| 1.4 | Add Unit Tests for Network Error Handling | 1 | High |
| 2.1 | Create CameraPermissionFallback Component | 1 | High |
| 2.2 | Update ContentCreationStep for Permission Denial | 1 | High |
| 2.3 | Add Camera Permission Status Persistence | 0.5 | Medium |
| 2.4 | Add Unit Tests for Camera Fallback | 1 | High |
| 3.1 | Create TruncatedText Component | 1 | Medium |
| 3.2 | Add Truncation Utilities to Constants | 0.5 | Medium |
| 3.3 | Apply TruncatedText to SessionItemCard | 0.5 | Medium |
| 3.4 | Apply TruncatedText to NextActionStep | 0.5 | Medium |
| 3.5 | Add Unit Tests for TruncatedText | 1 | Medium |
| 4.1 | Create EmptySessionDialog Component | 1 | Medium |
| 4.2 | Integrate Empty Session Detection into NextActionStep | 0.5 | Medium |
| 4.3 | Add Unit Tests for Empty Session Dialog | 1 | Medium |
| 5.1 | Create SessionRecoveryBanner Component | 1 | High |
| 5.2 | Enhance sessionStorage.ts with Validation | 1 | High |
| 5.3 | Update ItemCreationWorkflow for Recovery Banner | 0.5 | High |
| 5.4 | Add Unit Tests for Session Recovery | 1 | High |
| 6.1 | Create Duplicate Name Detection Utility | 1 | Medium |
| 6.2 | Create DuplicateNameWarning Component | 0.5 | Medium |
| 6.3 | Integrate Duplicate Detection into SpecificItemStep | 1 | Medium |
| 6.4 | Add Unit Tests for Duplicate Name Detection | 1 | Medium |

**Total Estimated Story Points:** ~19 story points

---

## Detailed Tasks

### Task Group 1: Network Lost During URL Preview Enhancement

#### Task 1.1: Add Network Status Detection to useUrlPreview

**Priority:** High
**Story Points:** 1
**Dependencies:** None

**Objective:** Enhance the existing `useUrlPreview` hook to detect and distinguish between network connectivity issues and server-side errors.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

**Implementation Steps:**

1. Add new type definitions at the top of the file after existing types:
   ```typescript
   export type NetworkStatus = 'online' | 'offline' | 'unknown';

   export interface NetworkErrorInfo {
     isNetworkError: boolean;
     networkStatus: NetworkStatus;
   }
   ```

2. Add `isNetworkError` and `networkStatus` to the `UseUrlPreviewReturn` interface:
   ```typescript
   export interface UseUrlPreviewReturn {
     // ... existing fields ...
     /** Whether the error is due to network connectivity */
     isNetworkError: boolean;
     /** Current network status */
     networkStatus: NetworkStatus;
     /** Retry the last fetch attempt */
     retry: () => void;
   }
   ```

3. Add state variables inside the hook:
   ```typescript
   const [isNetworkError, setIsNetworkError] = useState<boolean>(false);
   const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('unknown');
   const lastUrlRef = useRef<string>('');
   ```

4. Add network status detection effect:
   ```typescript
   useEffect(() => {
     const updateNetworkStatus = () => {
       setNetworkStatus(navigator.onLine ? 'online' : 'offline');
     };

     updateNetworkStatus();
     window.addEventListener('online', updateNetworkStatus);
     window.addEventListener('offline', updateNetworkStatus);

     return () => {
       window.removeEventListener('online', updateNetworkStatus);
       window.removeEventListener('offline', updateNetworkStatus);
     };
   }, []);
   ```

5. Modify the `fetchPreview` function's catch block to detect network errors:
   ```typescript
   } catch (err) {
     // ... existing abort handling ...

     // Detect network errors
     const isNetwork = !navigator.onLine ||
       (err instanceof TypeError && err.message === 'Failed to fetch') ||
       (err instanceof Error && err.message === 'Request timed out');

     setIsNetworkError(isNetwork);
     // ... rest of error handling ...
   }
   ```

6. Add a `retry` function:
   ```typescript
   const retry = useCallback(() => {
     if (lastUrlRef.current) {
       fetchPreview(lastUrlRef.current);
     }
   }, [fetchPreview]);
   ```

7. Store the URL in `lastUrlRef` at the start of `fetchPreview`:
   ```typescript
   lastUrlRef.current = trimmedUrl;
   ```

8. Reset `isNetworkError` on success and return new fields.

**Verification Steps:**
- [ ] Hook compiles without TypeScript errors
- [ ] `isNetworkError` returns true when network is offline
- [ ] `retry()` function re-attempts the last URL fetch
- [ ] `networkStatus` updates when going online/offline
- [ ] Existing preview functionality unchanged when network is healthy

---

#### Task 1.2: Create NetworkErrorIndicator Component

**Priority:** High
**Story Points:** 1
**Dependencies:** Task 1.1

**Objective:** Create a reusable component to display network error state with retry and proceed-without-preview options.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx`

**Implementation Steps:**

1. Create the component file with standard header:
   ```typescript
   'use client';

   /**
    * NetworkErrorIndicator Component
    *
    * Displays a network error state with retry and proceed options
    * when URL preview fetch fails due to connectivity issues.
    *
    * @module ItemCreationWorkflow/components/shared/NetworkErrorIndicator
    * @see docs/REQ-113-error-handling-edge-cases-overview.md
    * @lastModified 2026-01-05
    */

   import { WifiOff, RefreshCw, ArrowRight } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```

2. Define the props interface:
   ```typescript
   export interface NetworkErrorIndicatorProps {
     /** Whether a retry is currently in progress */
     isRetrying?: boolean;
     /** Callback when retry button is clicked */
     onRetry: () => void;
     /** Callback when proceed without preview is clicked */
     onProceedWithoutPreview: () => void;
     /** Optional error message to display */
     errorMessage?: string;
     /** Optional CSS class */
     className?: string;
   }
   ```

3. Implement the component with Airbnb design tokens:
   - Warning background: `bg-amber-50`
   - Border: `border border-amber-200 rounded-lg`
   - Icon: `WifiOff` in amber color
   - Message text: "Preview unavailable - Network issue"
   - Two buttons: "Try Again" (primary) and "Proceed Without Preview" (secondary)
   - Loading state on retry button with spinner

4. Ensure accessibility:
   - `role="alert"` on the container
   - `aria-live="polite"` for status updates
   - Proper button labels

5. Apply minimum touch targets (48x48px) for buttons.

**Verification Steps:**
- [ ] Component renders with proper styling
- [ ] Retry button shows loading state when `isRetrying=true`
- [ ] Both callbacks are triggered correctly
- [ ] Touch targets meet 48px minimum
- [ ] Component is accessible via keyboard

---

#### Task 1.3: Integrate Network Error Handling into ContentCreationStep

**Priority:** High
**Story Points:** 1
**Dependencies:** Tasks 1.1, 1.2

**Objective:** Update ContentCreationStep to use the enhanced useUrlPreview hook and display NetworkErrorIndicator when appropriate.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx`

**Files to Modify (exports):**
- `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Implementation Steps:**

1. Import the new component and updated hook types:
   ```typescript
   import { NetworkErrorIndicator } from '../shared/NetworkErrorIndicator';
   ```

2. Update the hook usage to destructure new return values:
   ```typescript
   const {
     data,
     isLoading,
     isError,
     isNetworkError,
     fetchPreview,
     retry,
     canProceed
   } = useUrlPreview();
   ```

3. Add state for tracking "proceed without preview" choice:
   ```typescript
   const [proceedWithoutPreview, setProceedWithoutPreview] = useState(false);
   ```

4. In the URL content type rendering section, add conditional rendering:
   ```typescript
   {isError && isNetworkError && !proceedWithoutPreview && (
     <NetworkErrorIndicator
       isRetrying={isLoading}
       onRetry={retry}
       onProceedWithoutPreview={() => setProceedWithoutPreview(true)}
     />
   )}
   ```

5. Update the content data creation to handle missing preview:
   - When `proceedWithoutPreview` is true, store URL without thumbnail/metadata
   - Display a subtle indicator that preview was skipped

6. Export NetworkErrorIndicator from shared/index.ts.

**Verification Steps:**
- [ ] Network error displays NetworkErrorIndicator
- [ ] Retry button triggers new fetch attempt
- [ ] User can proceed without preview
- [ ] URL content is saved correctly even without preview
- [ ] No regression in normal URL preview flow

---

#### Task 1.4: Add Unit Tests for Network Error Handling

**Priority:** High
**Story Points:** 1
**Dependencies:** Tasks 1.1, 1.2, 1.3

**Objective:** Add comprehensive unit tests for the network error handling functionality.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/__tests__/NetworkErrorIndicator.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts`

**Implementation Steps:**

1. Create NetworkErrorIndicator.test.tsx with tests:
   - Test renders with correct message
   - Test retry button triggers callback
   - Test proceed button triggers callback
   - Test loading state shows spinner
   - Test accessibility attributes

2. Add tests to useUrlPreview.test.ts:
   - Test `isNetworkError` is true when fetch fails with TypeError
   - Test `isNetworkError` is true when navigator.onLine is false
   - Test `networkStatus` updates on online/offline events
   - Test `retry()` refetches the last URL
   - Test error is cleared on successful retry

**Test Patterns to Follow:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkErrorIndicator } from '../NetworkErrorIndicator';

describe('NetworkErrorIndicator', () => {
  it('renders error message', () => {
    render(
      <NetworkErrorIndicator
        onRetry={jest.fn()}
        onProceedWithoutPreview={jest.fn()}
      />
    );
    expect(screen.getByText(/preview unavailable/i)).toBeInTheDocument();
  });

  // ... more tests
});
```

**Verification Steps:**
- [ ] All new tests pass
- [ ] Existing tests still pass
- [ ] Test coverage meets project standards
- [ ] Tests are deterministic (no flakiness)

---

### Task Group 2: Camera Permission Denied Fallback

#### Task 2.1: Create CameraPermissionFallback Component

**Priority:** High
**Story Points:** 1
**Dependencies:** None

**Objective:** Create a fallback UI component displayed when camera permissions are denied, offering alternative input methods.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/CameraPermissionFallback.tsx`

**Implementation Steps:**

1. Create the component file with standard header:
   ```typescript
   'use client';

   /**
    * CameraPermissionFallback Component
    *
    * Displays alternative content input options when camera
    * access is denied or unavailable.
    *
    * @module ItemCreationWorkflow/components/shared/CameraPermissionFallback
    * @see docs/REQ-113-error-handling-edge-cases-overview.md
    * @lastModified 2026-01-05
    */

   import { Camera, Upload, Settings, ExternalLink } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```

2. Define the props interface:
   ```typescript
   export interface CameraPermissionFallbackProps {
     /** The content type that was being captured (video/photo) */
     contentType: 'video' | 'photo';
     /** Callback when user wants to upload a file instead */
     onUploadFile: () => void;
     /** Callback when user clicks try again (after enabling permissions) */
     onTryAgain: () => void;
     /** Optional CSS class */
     className?: string;
   }
   ```

3. Implement the component:
   - Header with `Camera` icon and "Camera access not available" message
   - Explanatory text about why camera access might be denied
   - Primary action: "Upload File" button (styled as primary CTA)
   - Secondary action: "Try Again" button (styled as secondary)
   - Helper text with link-styled text "How to enable camera access" that opens browser-specific instructions

4. Style with Airbnb design tokens:
   - Container: `bg-gray-50 border border-gray-200 rounded-lg p-6`
   - Icon: Large centered `Camera` icon with error color overlay
   - Primary button: Airbnb brand color `#FF385C`
   - Minimum touch targets: 48px

5. Ensure accessibility:
   - Proper heading hierarchy
   - Button labels describe actions
   - Focus management

**Verification Steps:**
- [ ] Component renders with correct message for video/photo
- [ ] Upload button triggers callback
- [ ] Try Again button triggers callback
- [ ] Styling matches design system
- [ ] Accessible via keyboard navigation

---

#### Task 2.2: Update ContentCreationStep for Permission Denial

**Priority:** High
**Story Points:** 1
**Dependencies:** Task 2.1

**Objective:** Integrate camera permission fallback into the ContentCreationStep component.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx`

**Files to Modify (exports):**
- `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Implementation Steps:**

1. Import the new component:
   ```typescript
   import { CameraPermissionFallback } from '../shared/CameraPermissionFallback';
   ```

2. Add state for tracking camera permission status:
   ```typescript
   const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
   const [isFileUploadMode, setIsFileUploadMode] = useState(false);
   ```

3. Add error handler for ItemCapture camera errors:
   ```typescript
   const handleCameraError = useCallback((error: Error) => {
     if (error.message.includes('PERMISSION_DENIED') ||
         error.message.includes('NotAllowedError')) {
       setCameraPermissionDenied(true);
     }
   }, []);
   ```

4. Add conditional rendering for camera denied state:
   ```typescript
   if (cameraPermissionDenied && !isFileUploadMode) {
     return (
       <CameraPermissionFallback
         contentType={contentType as 'video' | 'photo'}
         onUploadFile={() => setIsFileUploadMode(true)}
         onTryAgain={() => {
           setCameraPermissionDenied(false);
           // Trigger camera re-request
         }}
       />
     );
   }
   ```

5. When `isFileUploadMode` is true, render file upload UI instead of camera:
   - Use existing file upload patterns from ItemCapture
   - Support video/photo file selection based on content type

6. Export CameraPermissionFallback from shared/index.ts.

**Verification Steps:**
- [ ] Camera denial triggers fallback UI display
- [ ] Upload File switches to file upload mode
- [ ] Try Again re-attempts camera access
- [ ] Workflow step state is preserved
- [ ] No regression in happy path camera flow

---

#### Task 2.3: Add Camera Permission Status Persistence

**Priority:** Medium
**Story Points:** 0.5
**Dependencies:** Task 2.2

**Objective:** Store camera permission status in sessionStorage to avoid repeated prompts and show upload-first UI when previously denied.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx`

**Implementation Steps:**

1. Add constants for sessionStorage key:
   ```typescript
   const CAMERA_PERMISSION_KEY = 'faqbnb_camera_permission_status';
   ```

2. Add effect to check stored permission status on mount:
   ```typescript
   useEffect(() => {
     const stored = sessionStorage.getItem(CAMERA_PERMISSION_KEY);
     if (stored === 'denied') {
       setCameraPermissionDenied(true);
     }
   }, []);
   ```

3. Update the camera error handler to persist status:
   ```typescript
   const handleCameraError = useCallback((error: Error) => {
     if (error.message.includes('PERMISSION_DENIED')) {
       setCameraPermissionDenied(true);
       sessionStorage.setItem(CAMERA_PERMISSION_KEY, 'denied');
     }
   }, []);
   ```

4. Add a "Reset and Try Camera" option that clears the stored status:
   ```typescript
   const handleResetCameraPermission = useCallback(() => {
     sessionStorage.removeItem(CAMERA_PERMISSION_KEY);
     setCameraPermissionDenied(false);
   }, []);
   ```

5. Pass this handler to CameraPermissionFallback's onTryAgain prop.

**Verification Steps:**
- [ ] Permission denied status persists across page navigation
- [ ] Upload-first UI shown when previously denied
- [ ] Reset option clears stored status
- [ ] Status is scoped to session (not permanent)

---

#### Task 2.4: Add Unit Tests for Camera Fallback

**Priority:** High
**Story Points:** 1
**Dependencies:** Tasks 2.1, 2.2, 2.3

**Objective:** Add comprehensive unit tests for camera permission fallback functionality.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/__tests__/CameraPermissionFallback.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/__tests__/ContentCreationStep.test.tsx` (if exists, create if not)

**Implementation Steps:**

1. Create CameraPermissionFallback.test.tsx with tests:
   - Test renders correct message for video content type
   - Test renders correct message for photo content type
   - Test upload button triggers callback
   - Test try again button triggers callback
   - Test accessibility attributes

2. Add/update ContentCreationStep tests:
   - Test camera error triggers fallback display
   - Test upload file mode works correctly
   - Test try again re-requests camera
   - Test permission status persistence

**Verification Steps:**
- [ ] All tests pass
- [ ] Tests cover happy and error paths
- [ ] Mock sessionStorage correctly
- [ ] No test isolation issues

---

### Task Group 3: Long Item Names Truncation with Tooltip

#### Task 3.1: Create TruncatedText Component

**Priority:** Medium
**Story Points:** 1
**Dependencies:** None

**Objective:** Create a reusable component that truncates text with ellipsis and shows full text on hover/long-press via tooltip.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx`

**Implementation Steps:**

1. Create the component file with standard header:
   ```typescript
   'use client';

   /**
    * TruncatedText Component
    *
    * Displays text truncated with ellipsis when exceeding maxLength,
    * with full text shown in tooltip on hover or mobile long-press.
    *
    * @module ItemCreationWorkflow/components/shared/TruncatedText
    * @see docs/REQ-113-error-handling-edge-cases-overview.md
    * @lastModified 2026-01-05
    */

   import { useState, useRef, useCallback } from 'react';
   import * as Tooltip from '@radix-ui/react-tooltip';
   import { cn } from '@/lib/utils';
   ```

2. Define the props interface:
   ```typescript
   export interface TruncatedTextProps {
     /** The full text to display */
     text: string;
     /** Maximum character length before truncation (default: 40) */
     maxLength?: number;
     /** HTML element to render as (default: 'span') */
     as?: 'span' | 'p' | 'h3' | 'div';
     /** Optional CSS class */
     className?: string;
   }
   ```

3. Implement truncation logic:
   ```typescript
   const shouldTruncate = text.length > maxLength;
   const displayText = shouldTruncate
     ? `${text.substring(0, maxLength - 3)}...`
     : text;
   ```

4. Implement the component with Radix UI Tooltip:
   - Only wrap in Tooltip when truncation is needed
   - Use CSS `text-overflow: ellipsis` for visual truncation
   - Tooltip styled with Airbnb design tokens

5. Add mobile long-press support:
   ```typescript
   const [showTooltip, setShowTooltip] = useState(false);
   const longPressTimerRef = useRef<NodeJS.Timeout>();

   const handleTouchStart = useCallback(() => {
     longPressTimerRef.current = setTimeout(() => {
       setShowTooltip(true);
     }, 500); // 500ms long press
   }, []);

   const handleTouchEnd = useCallback(() => {
     clearTimeout(longPressTimerRef.current);
     setShowTooltip(false);
   }, []);
   ```

6. Ensure accessibility:
   - Use `title` attribute as fallback
   - Proper ARIA labels
   - Tooltip is keyboard accessible

**Verification Steps:**
- [ ] Text under maxLength displays without truncation
- [ ] Text over maxLength displays with ellipsis
- [ ] Tooltip shows on hover (desktop)
- [ ] Tooltip shows on long-press (mobile)
- [ ] Component is accessible

---

#### Task 3.2: Add Truncation Utilities to Constants

**Priority:** Medium
**Story Points:** 0.5
**Dependencies:** None

**Objective:** Add truncation helper functions to the constants file for consistent usage across components.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/utils/constants.ts`

**Implementation Steps:**

1. Add constants for truncation:
   ```typescript
   // =============================================================================
   // Text Truncation Configuration
   // =============================================================================

   /** Default maximum length for item names in list displays */
   export const DEFAULT_TRUNCATE_LENGTH = 40;
   ```

2. Add utility functions:
   ```typescript
   /**
    * Truncates text to specified length with ellipsis.
    * @param text - Text to truncate
    * @param maxLength - Maximum length (default: DEFAULT_TRUNCATE_LENGTH)
    * @returns Truncated text with ellipsis if needed
    */
   export function truncateWithEllipsis(
     text: string,
     maxLength: number = DEFAULT_TRUNCATE_LENGTH
   ): string {
     if (text.length <= maxLength) return text;
     return `${text.substring(0, maxLength - 3)}...`;
   }

   /**
    * Checks if text would need truncation.
    * @param text - Text to check
    * @param maxLength - Maximum length (default: DEFAULT_TRUNCATE_LENGTH)
    * @returns true if text exceeds maxLength
    */
   export function shouldTruncate(
     text: string,
     maxLength: number = DEFAULT_TRUNCATE_LENGTH
   ): boolean {
     return text.length > maxLength;
   }
   ```

3. Export the new functions.

**Verification Steps:**
- [ ] Functions compile without errors
- [ ] Truncation works correctly at boundary cases
- [ ] Empty string handled gracefully
- [ ] Exports are accessible

---

#### Task 3.3: Apply TruncatedText to SessionItemCard

**Priority:** Medium
**Story Points:** 0.5
**Dependencies:** Task 3.1

**Objective:** Replace inline truncation in SessionItemCard with the TruncatedText component.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx`

**Implementation Steps:**

1. Import the TruncatedText component:
   ```typescript
   import { TruncatedText } from './TruncatedText';
   ```

2. Locate the item name display (line ~256 in current file):
   ```typescript
   <h3 className="text-base font-medium text-[#222222] truncate" title={item.name}>
     {item.name}
   </h3>
   ```

3. Replace with TruncatedText:
   ```typescript
   <TruncatedText
     text={item.name}
     maxLength={40}
     as="h3"
     className="text-base font-medium text-[#222222]"
   />
   ```

4. Remove the CSS `truncate` class (handled by component now).

5. Remove the `title` attribute (handled by tooltip now).

**Verification Steps:**
- [ ] Item names display correctly
- [ ] Long names are truncated
- [ ] Tooltip shows full name on hover
- [ ] Styling is preserved
- [ ] Accessibility maintained

---

#### Task 3.4: Apply TruncatedText to NextActionStep

**Priority:** Medium
**Story Points:** 0.5
**Dependencies:** Task 3.1

**Objective:** Replace the inline `truncateText` function in NextActionStep with TruncatedText component.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

**Implementation Steps:**

1. Import the TruncatedText component:
   ```typescript
   import { TruncatedText } from '../shared/TruncatedText';
   ```

2. Locate the `truncateText` helper function (lines 130-138) and mark for removal or keep as internal utility.

3. Find usages of `truncateText` in the component:
   ```typescript
   const itemName = lastSavedItem?.name
     ? truncateText(lastSavedItem.name)
     : 'this item';
   ```

4. Update the description rendering to use TruncatedText where the item name appears in the card description:
   - Since the description includes the item name in quotes, we need to handle this carefully
   - Option 1: Use TruncatedText for just the name portion
   - Option 2: Keep truncateText for inline usage in template strings

5. For template string usage, keep the `truncateText` function but import from constants:
   ```typescript
   import { truncateWithEllipsis } from '../../utils/constants';
   // ...
   const itemName = lastSavedItem?.name
     ? truncateWithEllipsis(lastSavedItem.name)
     : 'this item';
   ```

6. Remove the local `truncateText` function.

**Verification Steps:**
- [ ] "Add More to This Item" card shows truncated name correctly
- [ ] Full name appears in tooltip when hovering card description
- [ ] No duplicate truncation logic
- [ ] All tests still pass

---

#### Task 3.5: Add Unit Tests for TruncatedText

**Priority:** Medium
**Story Points:** 1
**Dependencies:** Task 3.1

**Objective:** Add comprehensive unit tests for the TruncatedText component.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/__tests__/TruncatedText.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/utils/__tests__/constants.test.ts` (create if not exists)

**Implementation Steps:**

1. Create TruncatedText.test.tsx with tests:
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import { TruncatedText } from '../TruncatedText';

   describe('TruncatedText', () => {
     it('displays short text without truncation', () => {
       render(<TruncatedText text="Short text" />);
       expect(screen.getByText('Short text')).toBeInTheDocument();
     });

     it('truncates text exceeding maxLength with ellipsis', () => {
       const longText = 'A'.repeat(50);
       render(<TruncatedText text={longText} maxLength={40} />);
       expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
     });

     it('shows full text in tooltip on hover when truncated', async () => {
       const longText = 'A very long item name that exceeds forty characters';
       render(<TruncatedText text={longText} maxLength={40} />);
       // Test tooltip visibility
     });

     it('does not show tooltip when text is not truncated', () => {
       render(<TruncatedText text="Short" />);
       // Verify no tooltip
     });

     it('renders as specified HTML element', () => {
       render(<TruncatedText text="Test" as="h3" />);
       expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
     });

     it('applies custom className', () => {
       render(<TruncatedText text="Test" className="custom-class" />);
       expect(screen.getByText('Test')).toHaveClass('custom-class');
     });
   });
   ```

2. Add tests for truncation utility functions in constants.test.ts.

**Verification Steps:**
- [ ] All tests pass
- [ ] Edge cases covered (empty string, exactly maxLength, maxLength-1, maxLength+1)
- [ ] Tooltip tests work with Radix UI
- [ ] Tests are isolated and deterministic

---

### Task Group 4: Empty Session "I'm Done" Prompt

#### Task 4.1: Create EmptySessionDialog Component

**Priority:** Medium
**Story Points:** 1
**Dependencies:** None

**Objective:** Create a confirmation dialog that appears when user clicks "I'm Done" with no items created.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx`

**Implementation Steps:**

1. Create the component file following the ConfirmExitDialog pattern:
   ```typescript
   'use client';

   /**
    * EmptySessionDialog Component
    *
    * Confirmation dialog displayed when user attempts to complete
    * a session without creating any items.
    *
    * @module ItemCreationWorkflow/components/shared/EmptySessionDialog
    * @see docs/REQ-113-error-handling-edge-cases-overview.md
    * @lastModified 2026-01-05
    */

   import { AlertCircle } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```

2. Define the props interface:
   ```typescript
   export interface EmptySessionDialogProps {
     /** Whether the dialog is open */
     isOpen: boolean;
     /** Called when dialog should close (cancelled or dismissed) */
     onClose: () => void;
     /** Called when user chooses to add items */
     onAddItems: () => void;
     /** Called when user chooses to exit session */
     onExitSession: () => void;
     /** Optional CSS class name */
     className?: string;
   }
   ```

3. Implement the dialog following ConfirmExitDialog structure:
   - Use same modal backdrop pattern
   - Icon: `AlertCircle` in `bg-blue-100` circle (informational, not warning)
   - Title: "No Items Added"
   - Message: "No items added yet. Add items or exit session?"
   - Two buttons: "Add Items" (primary, Airbnb brand color) and "Exit Session" (secondary)

4. Handle keyboard interactions (Escape to close).

5. Add proper ARIA attributes for alertdialog role.

**Verification Steps:**
- [ ] Dialog displays correctly when open
- [ ] Add Items button triggers callback
- [ ] Exit Session button triggers callback
- [ ] Escape key closes dialog
- [ ] Clicking backdrop closes dialog
- [ ] Dialog is accessible

---

#### Task 4.2: Integrate Empty Session Detection into NextActionStep

**Priority:** Medium
**Story Points:** 0.5
**Dependencies:** Task 4.1

**Objective:** Add logic to detect empty session and show EmptySessionDialog when "I'm Done" is clicked.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`
- `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Implementation Steps:**

1. Import the new dialog:
   ```typescript
   import { EmptySessionDialog } from '../shared/EmptySessionDialog';
   ```

2. Add state for dialog visibility:
   ```typescript
   const [showEmptySessionDialog, setShowEmptySessionDialog] = useState(false);
   ```

3. Modify the "I'm Done" card onClick handler:
   ```typescript
   onClick: () => {
     if (itemsCreated === 0) {
       setShowEmptySessionDialog(true);
     } else {
       onDone();
     }
   }
   ```

4. Add dialog rendering at the end of the component:
   ```typescript
   <EmptySessionDialog
     isOpen={showEmptySessionDialog}
     onClose={() => setShowEmptySessionDialog(false)}
     onAddItems={() => {
       setShowEmptySessionDialog(false);
       onTagNewItem();
     }}
     onExitSession={() => {
       setShowEmptySessionDialog(false);
       onDone();
     }}
   />
   ```

5. Export EmptySessionDialog from shared/index.ts.

**Verification Steps:**
- [ ] Dialog appears when itemsCreated is 0 and "I'm Done" clicked
- [ ] Dialog does not appear when items exist
- [ ] "Add Items" navigates to new item flow
- [ ] "Exit Session" proceeds to session summary

---

#### Task 4.3: Add Unit Tests for Empty Session Dialog

**Priority:** Medium
**Story Points:** 1
**Dependencies:** Tasks 4.1, 4.2

**Objective:** Add unit tests for the EmptySessionDialog and its integration.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/__tests__/EmptySessionDialog.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx`

**Implementation Steps:**

1. Create EmptySessionDialog.test.tsx with tests:
   - Test renders when isOpen is true
   - Test does not render when isOpen is false
   - Test Add Items button triggers onAddItems
   - Test Exit Session button triggers onExitSession
   - Test Escape key triggers onClose
   - Test backdrop click triggers onClose

2. Add tests to NextActionStep.test.tsx:
   - Test dialog shows when itemsCreated=0 and I'm Done clicked
   - Test dialog does not show when itemsCreated > 0
   - Test Add Items callback navigates correctly
   - Test Exit Session callback proceeds correctly

**Verification Steps:**
- [ ] All tests pass
- [ ] Both component and integration tests complete
- [ ] Mock functions called with correct arguments

---

### Task Group 5: Session Refresh Recovery Enhancement

#### Task 5.1: Create SessionRecoveryBanner Component

**Priority:** High
**Story Points:** 1
**Dependencies:** None

**Objective:** Create a banner component that displays when a session has been recovered from localStorage.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx`

**Implementation Steps:**

1. Create the component file:
   ```typescript
   'use client';

   /**
    * SessionRecoveryBanner Component
    *
    * Displays a notification banner when a previous session has been
    * recovered from localStorage after browser refresh.
    *
    * @module ItemCreationWorkflow/components/shared/SessionRecoveryBanner
    * @see docs/REQ-113-error-handling-edge-cases-overview.md
    * @lastModified 2026-01-05
    */

   import { useState, useEffect } from 'react';
   import { RefreshCw, X, CheckCircle, Upload } from 'lucide-react';
   import { cn } from '@/lib/utils';
   ```

2. Define the props interface:
   ```typescript
   export interface SessionRecoveryBannerProps {
     /** Number of items recovered in the session */
     itemCount: number;
     /** Number of content pieces needing re-upload (binary data lost) */
     contentNeedingReUpload: number;
     /** Callback when user chooses to continue with recovered session */
     onContinue: () => void;
     /** Callback when user chooses to start fresh */
     onStartFresh: () => void;
     /** Callback when banner is dismissed (auto or manual) */
     onDismiss: () => void;
     /** Whether to auto-dismiss after timeout (default: true) */
     autoDismiss?: boolean;
     /** Auto-dismiss delay in ms (default: 5000) */
     autoDismissDelay?: number;
     /** Optional CSS class */
     className?: string;
   }
   ```

3. Implement the component:
   - Container: `bg-green-50 border border-green-200 rounded-lg`
   - Icon: `CheckCircle` in green
   - Message: "Your previous session has been restored"
   - Secondary text: "{itemCount} items • {contentNeedingReUpload} pieces need re-upload"
   - Buttons: "Continue" (primary) and "Start Fresh" (secondary)
   - Dismiss "X" button in top right
   - Progress bar for auto-dismiss countdown (optional enhancement)

4. Implement auto-dismiss timer:
   ```typescript
   useEffect(() => {
     if (autoDismiss) {
       const timer = setTimeout(onDismiss, autoDismissDelay);
       return () => clearTimeout(timer);
     }
   }, [autoDismiss, autoDismissDelay, onDismiss]);
   ```

5. Only show content re-upload warning if `contentNeedingReUpload > 0`.

**Verification Steps:**
- [ ] Banner renders with correct item/content counts
- [ ] Continue button triggers callback
- [ ] Start Fresh button triggers callback
- [ ] Auto-dismiss works after specified delay
- [ ] Manual dismiss works
- [ ] Re-upload warning only shows when needed

---

#### Task 5.2: Enhance sessionStorage.ts with Validation

**Priority:** High
**Story Points:** 1
**Dependencies:** None

**Objective:** Add state structure validation and improved error handling to session storage utilities.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

**Implementation Steps:**

1. Add validation function for deserialized state:
   ```typescript
   /**
    * Validates the structure of a deserialized workflow state.
    * Returns true if state has all required fields with correct types.
    *
    * @param state - State object to validate
    * @returns true if valid, false otherwise
    */
   export function isValidWorkflowState(state: unknown): state is SerializedWorkflowState {
     if (!state || typeof state !== 'object') return false;

     const s = state as Record<string, unknown>;

     // Check required top-level fields
     if (typeof s.currentStep !== 'string') return false;
     if (!Array.isArray(s.stepHistory)) return false;
     if (typeof s.canGoBack !== 'boolean') return false;
     if (!s.session || typeof s.session !== 'object') return false;

     // Check session fields
     const session = s.session as Record<string, unknown>;
     if (typeof session.id !== 'string') return false;
     if (typeof session.startedAt !== 'string') return false;
     if (!Array.isArray(session.items)) return false;

     return true;
   }
   ```

2. Update `loadWorkflowState` to use validation:
   ```typescript
   export function loadWorkflowState(sessionId: string): Partial<WorkflowState> | null {
     // ... existing code ...

     try {
       const parsed: StoredSession = JSON.parse(stored);

       // Validate structure before using
       if (!isValidWorkflowState(parsed.state)) {
         console.warn('Invalid workflow state structure, clearing:', sessionId);
         clearWorkflowState(sessionId);
         return null;
       }

       // Check expiration
       if (Date.now() - parsed.savedAt > MAX_SESSION_AGE_MS) {
         // ... existing expiration handling ...
       }

       return deserializeState(parsed.state);
     } catch (error) {
       // ... existing error handling ...
     }
   }
   ```

3. Add version field for future compatibility:
   ```typescript
   const STORAGE_VERSION = 1;

   export interface StoredSession {
     version: number;
     state: SerializedWorkflowState;
     savedAt: number;
   }
   ```

4. Update save/load to include version checking.

5. Add helper to check if session needs content re-upload (already exists as `getContentNeedingReUpload` - verify it's exported).

**Verification Steps:**
- [ ] Invalid state structures are rejected
- [ ] Corrupted data is cleared gracefully
- [ ] Expired sessions are not returned
- [ ] Valid sessions load correctly
- [ ] Version field saved and checked

---

#### Task 5.3: Update ItemCreationWorkflow for Recovery Banner

**Priority:** High
**Story Points:** 0.5
**Dependencies:** Tasks 5.1, 5.2

**Objective:** Integrate the SessionRecoveryBanner into the main workflow component.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Implementation Steps:**

1. Import the new component and utilities:
   ```typescript
   import { SessionRecoveryBanner } from './components/shared/SessionRecoveryBanner';
   import { getContentNeedingReUpload } from './utils/sessionStorage';
   ```

2. Add state for recovery banner:
   ```typescript
   const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
   const [recoveryInfo, setRecoveryInfo] = useState<{
     itemCount: number;
     contentNeedingReUpload: number;
   } | null>(null);
   ```

3. In the session recovery effect (or useSessionPersistence usage), detect recovery:
   ```typescript
   useEffect(() => {
     if (initialSession) return; // Don't show for explicitly provided sessions

     const recovered = loadMostRecentWorkflowState();
     if (recovered) {
       const contentCount = getContentNeedingReUpload(recovered);
       setRecoveryInfo({
         itemCount: recovered.session?.items.length || 0,
         contentNeedingReUpload: contentCount,
       });
       setShowRecoveryBanner(true);
       // Apply recovered state to workflow
     }
   }, []);
   ```

4. Add banner rendering at top of component:
   ```typescript
   {showRecoveryBanner && recoveryInfo && (
     <SessionRecoveryBanner
       itemCount={recoveryInfo.itemCount}
       contentNeedingReUpload={recoveryInfo.contentNeedingReUpload}
       onContinue={() => setShowRecoveryBanner(false)}
       onStartFresh={() => {
         clearWorkflowState(state.session.id);
         dispatch({ type: 'RESET_SESSION' });
         setShowRecoveryBanner(false);
       }}
       onDismiss={() => setShowRecoveryBanner(false)}
     />
   )}
   ```

5. Export SessionRecoveryBanner from shared/index.ts.

**Verification Steps:**
- [ ] Banner shows on page load when session exists in storage
- [ ] Banner does not show for new sessions
- [ ] Continue dismisses banner and uses recovered state
- [ ] Start Fresh clears storage and resets workflow
- [ ] Auto-dismiss works after 5 seconds

---

#### Task 5.4: Add Unit Tests for Session Recovery

**Priority:** High
**Story Points:** 1
**Dependencies:** Tasks 5.1, 5.2, 5.3

**Objective:** Add comprehensive unit tests for session recovery functionality.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/__tests__/SessionRecoveryBanner.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/utils/__tests__/sessionStorage.test.ts`

**Implementation Steps:**

1. Create SessionRecoveryBanner.test.tsx with tests:
   - Test renders with correct item count
   - Test renders re-upload warning when contentNeedingReUpload > 0
   - Test does not show re-upload warning when contentNeedingReUpload = 0
   - Test Continue button triggers callback
   - Test Start Fresh button triggers callback
   - Test auto-dismiss after delay
   - Test manual dismiss via X button

2. Add tests to sessionStorage.test.ts:
   - Test isValidWorkflowState returns true for valid state
   - Test isValidWorkflowState returns false for missing fields
   - Test isValidWorkflowState returns false for wrong types
   - Test loadWorkflowState clears invalid state
   - Test version checking behavior

**Verification Steps:**
- [ ] All tests pass
- [ ] Edge cases covered
- [ ] Timer mocks work correctly for auto-dismiss
- [ ] Storage mocks isolated between tests

---

### Task Group 6: Duplicate Item Name Handling

#### Task 6.1: Create Duplicate Name Detection Utility

**Priority:** Medium
**Story Points:** 1
**Dependencies:** None

**Objective:** Create a utility module for detecting duplicate or similar item names within a session.

**Files to Create:**
- `src/components/ItemCreationWorkflow/utils/duplicateNameCheck.ts`

**Implementation Steps:**

1. Create the utility file:
   ```typescript
   /**
    * Duplicate Name Detection Utilities
    *
    * Provides functions for detecting duplicate or similar item names
    * within a session to warn users before creating items with
    * confusingly similar names.
    *
    * @module ItemCreationWorkflow/utils/duplicateNameCheck
    * @see docs/REQ-113-error-handling-edge-cases-overview.md
    * @lastModified 2026-01-05
    */
   ```

2. Define the result type:
   ```typescript
   export interface DuplicateCheckResult {
     /** Whether an exact or similar match was found */
     isDuplicate: boolean;
     /** Names that matched (exact or similar) */
     matchingNames: string[];
     /** Type of match found */
     matchType: 'exact' | 'similar' | 'none';
     /** Similarity score for similar matches (0-1) */
     similarity?: number;
   }
   ```

3. Implement the check function:
   ```typescript
   /**
    * Checks if a name matches or is similar to existing names.
    *
    * @param name - The name to check
    * @param existingNames - Array of existing item names
    * @returns Result indicating if duplicates were found
    */
   export function checkDuplicateName(
     name: string,
     existingNames: string[]
   ): DuplicateCheckResult {
     if (!name || existingNames.length === 0) {
       return { isDuplicate: false, matchingNames: [], matchType: 'none' };
     }

     const normalizedName = name.trim().toLowerCase();
     const exactMatches: string[] = [];
     const similarMatches: string[] = [];

     for (const existing of existingNames) {
       const normalizedExisting = existing.trim().toLowerCase();

       // Exact match (case-insensitive)
       if (normalizedName === normalizedExisting) {
         exactMatches.push(existing);
         continue;
       }

       // Similar match (one contains the other, or small edit distance)
       if (isSimilar(normalizedName, normalizedExisting)) {
         similarMatches.push(existing);
       }
     }

     if (exactMatches.length > 0) {
       return {
         isDuplicate: true,
         matchingNames: exactMatches,
         matchType: 'exact',
       };
     }

     if (similarMatches.length > 0) {
       return {
         isDuplicate: true,
         matchingNames: similarMatches,
         matchType: 'similar',
       };
     }

     return { isDuplicate: false, matchingNames: [], matchType: 'none' };
   }
   ```

4. Implement similarity helper:
   ```typescript
   /**
    * Checks if two names are similar (contains relationship or small edit distance).
    */
   function isSimilar(a: string, b: string): boolean {
     // Check if one contains the other
     if (a.includes(b) || b.includes(a)) return true;

     // Check for numbered variants (e.g., "Kitchen - Stove" vs "Kitchen - Stove 2")
     const numPattern = /\s*\d+\s*$/;
     const aBase = a.replace(numPattern, '');
     const bBase = b.replace(numPattern, '');
     if (aBase === bBase) return true;

     return false;
   }
   ```

5. Export from utils/index.ts.

**Verification Steps:**
- [ ] Exact matches detected (case-insensitive)
- [ ] Similar matches detected (contains relationship)
- [ ] Numbered variants detected as similar
- [ ] Empty inputs handled gracefully
- [ ] Performance acceptable for typical session sizes (<50 items)

---

#### Task 6.2: Create DuplicateNameWarning Component

**Priority:** Medium
**Story Points:** 0.5
**Dependencies:** None

**Objective:** Create a warning indicator component for duplicate name detection.

**Files to Create:**
- `src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx`

**Implementation Steps:**

1. Create the component file:
   ```typescript
   'use client';

   /**
    * DuplicateNameWarning Component
    *
    * Displays a warning indicator when a duplicate or similar
    * item name is detected in the current session.
    *
    * @module ItemCreationWorkflow/components/shared/DuplicateNameWarning
    * @see docs/REQ-113-error-handling-edge-cases-overview.md
    * @lastModified 2026-01-05
    */

   import { AlertTriangle } from 'lucide-react';
   import * as Tooltip from '@radix-ui/react-tooltip';
   import { cn } from '@/lib/utils';
   ```

2. Define the props interface:
   ```typescript
   export interface DuplicateNameWarningProps {
     /** Names that match the current input */
     matchingNames: string[];
     /** Type of match (exact or similar) */
     matchType: 'exact' | 'similar';
     /** Whether to show as inline or block */
     variant?: 'inline' | 'block';
     /** Optional CSS class */
     className?: string;
   }
   ```

3. Implement the component:
   - Inline variant: Just icon with tooltip
   - Block variant: Icon + message below input
   - Icon: `AlertTriangle` with Airbnb warning color `#FFB400`
   - Tooltip/message: "Similar name already used" or "Exact name already exists"
   - List matching names in tooltip if space allows

4. Style with Airbnb design tokens:
   ```typescript
   <div className={cn(
     'flex items-center gap-2 text-sm',
     'text-amber-600',
     className
   )}>
     <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
     <span>Similar name already used</span>
   </div>
   ```

**Verification Steps:**
- [ ] Warning renders correctly for exact matches
- [ ] Warning renders correctly for similar matches
- [ ] Inline variant shows only icon
- [ ] Block variant shows icon + message
- [ ] Tooltip displays matching names

---

#### Task 6.3: Integrate Duplicate Detection into SpecificItemStep

**Priority:** Medium
**Story Points:** 1
**Dependencies:** Tasks 6.1, 6.2

**Objective:** Add duplicate name detection to the SpecificItemStep component with debounced checking.

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`
- `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`
- `src/components/ItemCreationWorkflow/components/shared/index.ts`

**Implementation Steps:**

1. Import utilities and components:
   ```typescript
   import { checkDuplicateName, DuplicateCheckResult } from '../../utils/duplicateNameCheck';
   import { DuplicateNameWarning } from '../shared/DuplicateNameWarning';
   ```

2. Add state and ref for debouncing in SpecificItemStep:
   ```typescript
   const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
   const debounceTimerRef = useRef<NodeJS.Timeout>();
   ```

3. Get existing item names from session:
   ```typescript
   const existingNames = useMemo(() =>
     sessionItems.map(item => item.name),
     [sessionItems]
   );
   ```

4. Add debounced duplicate check:
   ```typescript
   useEffect(() => {
     if (debounceTimerRef.current) {
       clearTimeout(debounceTimerRef.current);
     }

     debounceTimerRef.current = setTimeout(() => {
       if (itemName.trim()) {
         const result = checkDuplicateName(itemName, existingNames);
         setDuplicateResult(result);
       } else {
         setDuplicateResult(null);
       }
     }, 300);

     return () => {
       if (debounceTimerRef.current) {
         clearTimeout(debounceTimerRef.current);
       }
     };
   }, [itemName, existingNames]);
   ```

5. Render warning below ItemNameEditor:
   ```typescript
   <ItemNameEditor
     value={itemName}
     onChange={handleNameChange}
   />
   {duplicateResult?.isDuplicate && (
     <DuplicateNameWarning
       matchingNames={duplicateResult.matchingNames}
       matchType={duplicateResult.matchType}
       variant="block"
     />
   )}
   ```

6. Optionally enhance ItemNameEditor to accept a warning prop for inline display.

7. Export DuplicateNameWarning from shared/index.ts.

**Verification Steps:**
- [ ] Warning appears when typing duplicate name
- [ ] Warning is debounced (no flicker while typing)
- [ ] Warning clears when name is changed to unique
- [ ] User can still proceed despite warning
- [ ] Performance is acceptable

---

#### Task 6.4: Add Unit Tests for Duplicate Name Detection

**Priority:** Medium
**Story Points:** 1
**Dependencies:** Tasks 6.1, 6.2, 6.3

**Objective:** Add comprehensive unit tests for duplicate name detection functionality.

**Files to Create:**
- `src/components/ItemCreationWorkflow/utils/__tests__/duplicateNameCheck.test.ts`
- `src/components/ItemCreationWorkflow/components/shared/__tests__/DuplicateNameWarning.test.tsx`

**Files to Modify:**
- `src/components/ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep.test.tsx`

**Implementation Steps:**

1. Create duplicateNameCheck.test.ts:
   ```typescript
   import { checkDuplicateName } from '../duplicateNameCheck';

   describe('checkDuplicateName', () => {
     it('returns no match for empty name', () => {
       expect(checkDuplicateName('', ['Item 1'])).toEqual({
         isDuplicate: false,
         matchingNames: [],
         matchType: 'none',
       });
     });

     it('detects exact case-insensitive match', () => {
       const result = checkDuplicateName('Kitchen - Stove', ['kitchen - stove', 'Other']);
       expect(result.isDuplicate).toBe(true);
       expect(result.matchType).toBe('exact');
     });

     it('detects numbered variant as similar', () => {
       const result = checkDuplicateName('Kitchen - Stove 2', ['Kitchen - Stove']);
       expect(result.isDuplicate).toBe(true);
       expect(result.matchType).toBe('similar');
     });

     it('returns no match for unique name', () => {
       const result = checkDuplicateName('Garage - Car', ['Kitchen - Stove']);
       expect(result.isDuplicate).toBe(false);
     });
   });
   ```

2. Create DuplicateNameWarning.test.tsx with component tests.

3. Add tests to SpecificItemStep.test.tsx for integration.

**Verification Steps:**
- [ ] All tests pass
- [ ] Edge cases covered
- [ ] Debounce behavior tested correctly with fake timers
- [ ] Tests are isolated

---

## Implementation Order

The recommended order for implementation ensures dependencies are satisfied:

### Phase 1 (Days 1-2): High Priority Foundation
1. Task 1.1: Add Network Status Detection to useUrlPreview
2. Task 1.2: Create NetworkErrorIndicator Component
3. Task 1.3: Integrate Network Error Handling
4. Task 5.2: Enhance sessionStorage.ts with Validation

### Phase 2 (Days 2-3): High Priority Features
5. Task 1.4: Unit Tests for Network Error Handling
6. Task 2.1: Create CameraPermissionFallback Component
7. Task 2.2: Update ContentCreationStep for Permission Denial
8. Task 5.1: Create SessionRecoveryBanner Component

### Phase 3 (Days 3-4): Complete High Priority
9. Task 2.3: Add Camera Permission Status Persistence
10. Task 2.4: Unit Tests for Camera Fallback
11. Task 5.3: Update ItemCreationWorkflow for Recovery Banner
12. Task 5.4: Unit Tests for Session Recovery

### Phase 4 (Days 4-5): Medium Priority Features
13. Task 3.1: Create TruncatedText Component
14. Task 3.2: Add Truncation Utilities to Constants
15. Task 3.3: Apply TruncatedText to SessionItemCard
16. Task 3.4: Apply TruncatedText to NextActionStep
17. Task 3.5: Unit Tests for TruncatedText

### Phase 5 (Days 5-6): Complete Medium Priority
18. Task 4.1: Create EmptySessionDialog Component
19. Task 4.2: Integrate Empty Session Detection
20. Task 4.3: Unit Tests for Empty Session Dialog
21. Task 6.1: Create Duplicate Name Detection Utility
22. Task 6.2: Create DuplicateNameWarning Component
23. Task 6.3: Integrate Duplicate Detection into SpecificItemStep
24. Task 6.4: Unit Tests for Duplicate Name Detection

---

## Authorized Files Summary

### Files to Create
| File Path | Task |
|-----------|------|
| `src/components/ItemCreationWorkflow/components/shared/NetworkErrorIndicator.tsx` | 1.2 |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/NetworkErrorIndicator.test.tsx` | 1.4 |
| `src/components/ItemCreationWorkflow/components/shared/CameraPermissionFallback.tsx` | 2.1 |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/CameraPermissionFallback.test.tsx` | 2.4 |
| `src/components/ItemCreationWorkflow/components/shared/TruncatedText.tsx` | 3.1 |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/TruncatedText.test.tsx` | 3.5 |
| `src/components/ItemCreationWorkflow/components/shared/EmptySessionDialog.tsx` | 4.1 |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/EmptySessionDialog.test.tsx` | 4.3 |
| `src/components/ItemCreationWorkflow/components/shared/SessionRecoveryBanner.tsx` | 5.1 |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/SessionRecoveryBanner.test.tsx` | 5.4 |
| `src/components/ItemCreationWorkflow/utils/duplicateNameCheck.ts` | 6.1 |
| `src/components/ItemCreationWorkflow/utils/__tests__/duplicateNameCheck.test.ts` | 6.4 |
| `src/components/ItemCreationWorkflow/components/shared/DuplicateNameWarning.tsx` | 6.2 |
| `src/components/ItemCreationWorkflow/components/shared/__tests__/DuplicateNameWarning.test.tsx` | 6.4 |

### Files to Modify
| File Path | Tasks |
|-----------|-------|
| `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts` | 1.1 |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useUrlPreview.test.ts` | 1.4 |
| `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx` | 1.3, 2.2, 2.3 |
| `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx` | 3.4, 4.2 |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/NextActionStep.test.tsx` | 4.3 |
| `src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx` | 3.3 |
| `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | 6.3 |
| `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | 6.3 |
| `src/components/ItemCreationWorkflow/components/steps/__tests__/SpecificItemStep.test.tsx` | 6.4 |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | 3.2 |
| `src/components/ItemCreationWorkflow/utils/sessionStorage.ts` | 5.2 |
| `src/components/ItemCreationWorkflow/utils/__tests__/sessionStorage.test.ts` | 5.4 |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | 5.3 |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | 1.3, 2.2, 4.2, 5.3, 6.3 |
| `src/components/ItemCreationWorkflow/utils/index.ts` | 6.1 |

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Tasks |
|--------------------|-------|
| Network connectivity fails during URL preview shows "Preview unavailable" with retry | 1.1, 1.2, 1.3 |
| Camera permissions denied shows file upload options | 2.1, 2.2, 2.3 |
| Item names >40 characters truncated with ellipsis, full name on hover/long-press | 3.1, 3.3, 3.4 |
| Empty session triggers "No items added yet. Add items or exit session?" dialog | 4.1, 4.2 |
| Browser refresh restores user position, step progress, and session items | 5.1, 5.2, 5.3 |
| Duplicate item name shows warning icon with "Similar name already used" | 6.1, 6.2, 6.3 |
| All error states include actionable recovery options | 1.2, 2.1, 5.1 |
| Network errors distinguish between temporary and permanent failures | 1.1 |

---

*Detailed Task Breakdown generated on 2026-01-05 11:32:01 UTC for REQ-113: Error Handling and Edge Cases*
