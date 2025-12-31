# REQ-035: Implement ContentTypeStep - Technical Overview

**Created:** 2025-12-31T12:30:00
**Last Modified:** 2025-12-31T12:30:00
**Request Reference:** `/docs/gen_requests.md` - Request #035
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.5

---

## Summary

Implement the `ContentTypeStep` component for the ItemCapture wizard. This step presents users with four large, accessible buttons to select their content creation method: Video, Photo, Text, or Upload. The component must be mobile-first with touch-friendly targets (minimum 48x48px) and use Lucide React icons for visual clarity.

---

## Task Context

### Phase Dependencies

```
1.1 Directory Structure    ✓ (Completed - REQ-031)
         │
         ▼
1.2 State Machine Hook     ✓ (Completed - REQ-032)
         │
         ▼
1.3 Wizard Navigation      ✓ (Completed - REQ-033)
         │
    ┌────┴────┐
    ▼         ▼
  1.4       1.5
Metadata  ContentType
  Step      Step
            (THIS)
```

**Hard Dependencies:**
- Task 1.3 (Wizard Navigation) must be complete
- `useItemCaptureState` hook must provide step transition actions
- `ItemCapture.types.ts` must export `WizardStep` type including content type steps

**Can Parallelize With:** Task 1.4 (MetadataStep)

---

## Requirements Analysis

### Functional Requirements

From Request #035 and Implementation Plan:

| Content Type | Icon | Description | Navigates To |
|--------------|------|-------------|--------------|
| Record Video | Video | Capture video with device camera | `capture-video` step |
| Take Photo | Camera | Capture photo with device camera | `capture-photo` step |
| Write Text | FileText | Create markdown instructions | `write-text` step |
| Upload File | Upload | Upload existing media/documents | `upload-file` step |

### Accessibility Requirements

1. **Touch Targets:**
   - Minimum 48x48px on mobile (WCAG 2.5.5 AAA)
   - Recommended 60x60px on desktop for comfort
   - Adequate spacing between targets (minimum 8px)

2. **Visual Design:**
   - Clear icon + text label combination
   - High contrast for readability
   - Visual selection indicator before proceeding
   - Responsive grid layout (2 cols mobile, 4 cols desktop)

3. **Keyboard Support:**
   - Tab navigation between options
   - Enter/Space to select
   - Focus indicators visible

4. **Screen Reader Support:**
   - Descriptive aria-labels
   - Role="radiogroup" for the option set
   - Role="radio" for each option
   - aria-checked for selection state

---

## Technical Approach

### Component Structure

```tsx
// ContentTypeStep.tsx
interface ContentTypeStepProps {
  selectedType: ContentType | null;
  onSelect: (type: ContentType) => void;
  onProceed: () => void;
}

type ContentType = 'video' | 'photo' | 'text' | 'upload';
```

### State Integration

The component interacts with `useItemCaptureState`:

```tsx
// From parent (CaptureWizard or ItemCapture)
const { state, dispatch } = useItemCaptureState();

// ContentTypeStep dispatches based on selection:
dispatch({ type: 'GO_TO_STEP', payload: 'capture-video' });  // Video selected
dispatch({ type: 'GO_TO_STEP', payload: 'capture-photo' });  // Photo selected
dispatch({ type: 'GO_TO_STEP', payload: 'write-text' });     // Text selected
dispatch({ type: 'GO_TO_STEP', payload: 'upload-file' });    // Upload selected
```

### Patterns to Follow

Based on codebase exploration, follow these established patterns:

#### 1. Button with Icon Pattern (from ReactionButtons.tsx)

```tsx
<button
  className={cn(
    "group relative flex flex-col items-center justify-center",
    "min-h-[44px] min-w-[44px] p-4 rounded-lg border-2",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    "touch-manipulation select-none",
    "sm:min-h-[80px] sm:min-w-[80px] sm:p-6",
    isSelected
      ? "border-blue-500 bg-blue-50 text-blue-600"
      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
  )}
>
  <Video className="w-8 h-8 mb-2" />
  <span className="text-sm font-medium">Record Video</span>
</button>
```

#### 2. Grid Layout Pattern (from ReactionButtons.tsx)

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  {CONTENT_OPTIONS.map((option) => (
    <ContentTypeButton key={option.type} {...option} />
  ))}
</div>
```

#### 3. Selection State Pattern (from PDFExportOptions.tsx)

```tsx
// Hidden radio for accessibility
<input
  type="radio"
  name="contentType"
  value={option.type}
  checked={selectedType === option.type}
  onChange={() => onSelect(option.type)}
  className="sr-only"
/>
```

---

## Implementation Details

### Content Type Options Configuration

```typescript
// /src/components/ItemCapture/components/steps/ContentTypeStep.tsx

import { Video, Camera, FileText, Upload } from 'lucide-react';

const CONTENT_OPTIONS = [
  {
    type: 'video' as const,
    icon: Video,
    label: 'Record Video',
    description: 'Capture video instructions',
    targetStep: 'capture-video' as WizardStep,
  },
  {
    type: 'photo' as const,
    icon: Camera,
    label: 'Take Photo',
    description: 'Capture photos',
    targetStep: 'capture-photo' as WizardStep,
  },
  {
    type: 'text' as const,
    icon: FileText,
    label: 'Write Text',
    description: 'Create written instructions',
    targetStep: 'write-text' as WizardStep,
  },
  {
    type: 'upload' as const,
    icon: Upload,
    label: 'Upload File',
    description: 'Upload existing media',
    targetStep: 'upload-file' as WizardStep,
  },
] as const;
```

### Component Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Step 2 of 5: Choose Content Type                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │     📹              │  │     📷              │          │
│  │  Record Video       │  │   Take Photo        │          │
│  │                     │  │                     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │     📝              │  │     📤              │          │
│  │  Write Text         │  │  Upload File        │          │
│  │                     │  │                     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  Tip: You can add more content after your first selection  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile vs Desktop Layout

| Breakpoint | Grid Columns | Button Size | Icon Size | Spacing |
|------------|--------------|-------------|-----------|---------|
| Mobile (default) | 2 | 44px min-height, full width | 32x32px | gap-3 |
| Tablet (sm: 640px) | 2 | 80px min-height | 40x40px | gap-4 |
| Desktop (md: 768px) | 4 | 100px min-height | 48x48px | gap-4 |

### Styling Classes

```tsx
// Button styling
const buttonClasses = cn(
  // Base layout
  "flex flex-col items-center justify-center",
  "w-full aspect-square rounded-xl border-2",

  // Touch targets (WCAG 2.5.5)
  "min-h-[100px] p-4",
  "sm:min-h-[120px] sm:p-6",

  // Touch optimization
  "touch-manipulation select-none",

  // Transitions
  "transition-all duration-200 ease-in-out",

  // Focus states
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",

  // Hover/active states (non-selected)
  "hover:border-gray-300 hover:bg-gray-50",
  "active:scale-95",

  // Selection states
  isSelected && "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500",
  !isSelected && "border-gray-200 bg-white text-gray-700"
);

// Icon styling
const iconClasses = cn(
  "w-8 h-8 mb-2",
  "sm:w-10 sm:h-10 sm:mb-3",
  "md:w-12 md:h-12 md:mb-4",
  isSelected ? "text-blue-600" : "text-gray-500"
);

// Label styling
const labelClasses = cn(
  "text-sm font-medium text-center",
  "sm:text-base",
  isSelected ? "text-blue-700" : "text-gray-700"
);
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/ContentTypeStep.tsx` | Main step component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Import and render ContentTypeStep |
| `src/components/ItemCapture/index.ts` | Export ContentTypeStep if needed externally |

### Files to Reference (Read-Only)

| File Path | Pattern to Follow |
|-----------|-------------------|
| `src/components/ReactionButtons.tsx` | Touch-friendly button grid with icons |
| `src/components/PDFExportOptions.tsx` | Radio selection pattern with visual cards |
| `src/components/TimeRangeSelector.tsx` | Size variant pattern, radiogroup accessibility |
| `src/components/PropertySelector.tsx` | Focus states, keyboard navigation |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | State machine actions |
| `src/lib/utils.ts` | `cn()` utility for class merging |

### Functions to Implement

```typescript
// ContentTypeStep.tsx
export function ContentTypeStep(props: ContentTypeStepProps): JSX.Element

// Internal - Button component
function ContentTypeButton(props: ContentTypeButtonProps): JSX.Element

// Internal - Selection handler
function handleSelect(type: ContentType): void

// Internal - Keyboard navigation
function handleKeyDown(event: KeyboardEvent): void
```

---

## Lucide React Icons to Use

The following icons from `lucide-react` (v0.525.0) should be used:

| Content Type | Icon Component | Import |
|--------------|----------------|--------|
| Video | `Video` | `import { Video } from 'lucide-react'` |
| Photo | `Camera` | `import { Camera } from 'lucide-react'` |
| Text | `FileText` | `import { FileText } from 'lucide-react'` |
| Upload | `Upload` | `import { Upload } from 'lucide-react'` |

**Combined Import:**
```tsx
import { Video, Camera, FileText, Upload } from 'lucide-react';
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Touch targets too small on mobile | Low | High | Explicitly set min-height/width, test on devices |
| Icons not loading from Lucide | Low | Medium | Verify lucide-react is installed (already in package.json) |
| Grid layout breaking on edge cases | Low | Low | Use CSS Grid with auto-fill, test various screen sizes |
| Selection state not visible enough | Medium | Medium | Use strong color contrast, add ring indicator |
| Step transition not working | Low | High | Verify useItemCaptureState exports GO_TO_STEP action |

---

## Testing Checklist

### Unit Tests

- [ ] Renders all four content type options
- [ ] Selection updates state correctly
- [ ] Only one option can be selected at a time
- [ ] Icons render correctly for each option

### Integration Tests

- [ ] Selection triggers correct step transition
- [ ] Back navigation returns to this step with selection preserved
- [ ] Works with wizard state machine

### Accessibility Tests

- [ ] Tab navigates between all options
- [ ] Enter/Space selects focused option
- [ ] Screen reader announces option labels
- [ ] Focus indicators visible
- [ ] `role="radiogroup"` and `role="radio"` present

### Manual Tests

- [ ] Touch targets >= 48x48px on mobile
- [ ] Responsive grid: 2 cols mobile, 4 cols desktop
- [ ] Visual selection indicator visible
- [ ] Hover states work on desktop
- [ ] Active (pressed) state provides feedback
- [ ] Icons display at correct sizes per breakpoint

---

## Effort Estimate

| Sub-task | Estimate |
|----------|----------|
| Component structure and types | 0.5 hours |
| Content option buttons with icons | 1 hour |
| Grid layout (responsive) | 0.5 hours |
| Selection state styling | 0.5 hours |
| Accessibility (ARIA, keyboard) | 1 hour |
| Integration with wizard | 0.5 hours |
| Testing & polish | 1 hour |
| **Total** | **5 hours** |

---

## Definition of Done

1. [ ] ContentTypeStep renders within CaptureWizard
2. [ ] Four content type buttons displayed (Video, Photo, Text, Upload)
3. [ ] Each button has icon + text label from Lucide React
4. [ ] Touch targets meet minimum 48x48px on all devices
5. [ ] Grid is responsive: 2 columns mobile, 4 columns desktop
6. [ ] Selection is visually indicated with border/background change
7. [ ] Clicking an option transitions to the appropriate capture step
8. [ ] Keyboard navigation works (Tab, Enter, Space)
9. [ ] ARIA attributes present (radiogroup, radio, aria-checked)
10. [ ] No console errors or warnings

---

## Implementation Example

```tsx
'use client';

import { Video, Camera, FileText, Upload, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentTypeOption {
  type: 'video' | 'photo' | 'text' | 'upload';
  icon: LucideIcon;
  label: string;
  description: string;
}

const CONTENT_OPTIONS: ContentTypeOption[] = [
  { type: 'video', icon: Video, label: 'Record Video', description: 'Capture video instructions' },
  { type: 'photo', icon: Camera, label: 'Take Photo', description: 'Capture photos' },
  { type: 'text', icon: FileText, label: 'Write Text', description: 'Create written instructions' },
  { type: 'upload', icon: Upload, label: 'Upload File', description: 'Upload existing media' },
];

interface ContentTypeStepProps {
  selectedType: string | null;
  onSelect: (type: string) => void;
}

export function ContentTypeStep({ selectedType, onSelect }: ContentTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Choose Content Type</h2>
        <p className="mt-2 text-sm text-gray-500">
          Select how you want to create content for this item
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Content type selection"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {CONTENT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.type;

          return (
            <button
              key={option.type}
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(option.type)}
              className={cn(
                // Layout
                "flex flex-col items-center justify-center",
                "w-full aspect-square rounded-xl border-2",
                // Touch targets
                "min-h-[100px] p-4 sm:min-h-[120px] sm:p-6",
                // Touch optimization
                "touch-manipulation select-none",
                // Transitions
                "transition-all duration-200",
                // Focus
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                // States
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:scale-95"
              )}
            >
              <Icon
                className={cn(
                  "w-8 h-8 mb-2 sm:w-10 sm:h-10 sm:mb-3",
                  isSelected ? "text-blue-600" : "text-gray-500"
                )}
              />
              <span className="text-sm font-medium text-center sm:text-base">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-gray-500">
        Tip: You can add more content after your first selection
      </p>
    </div>
  );
}
```

---

## References

- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md` (Task 1.5)
- Request: `/docs/gen_requests.md` (REQ-035)
- Button Pattern Reference: `/src/components/ReactionButtons.tsx` (lines 265-289)
- Selection Pattern Reference: `/src/components/PDFExportOptions.tsx` (lines 100-164)
- Size Variants Reference: `/src/components/TimeRangeSelector.tsx` (lines 66-85)
- Lucide Icons: `lucide-react` v0.525.0 in `package.json`
- Utility Functions: `/src/lib/utils.ts` (`cn()` function)
