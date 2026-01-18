# REQ-312: Create TranslationProgressBar Component

**Overview Document**

**Last Modified:** 2026-01-18 05:15 UTC
**Request ID:** REQ-312
**Type:** NEW FEATURE
**Size:** S (Small)
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.4
**Implementation Plan Reference:** [Plan-111-L10N-Epic5-Owner-Translation-Management.md](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)

---

## Summary

Create a visual progress bar component that displays translation completion status within the TranslationPreviewPanel. The component shows the count of completed translations versus total supported languages (e.g., "3/5 translations complete") with a proportionally filled bar and animated state during active processing.

---

## Dependencies

### Epic Dependencies
| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Epic 1 - Foundation | Required | Pending | Translation tables, i18n framework |
| Epic 3 - Dynamic Content | Required | Pending | Translation trigger system, status tracking |
| REQ-309 | Required | Pending | TranslationManagement type definitions |
| REQ-310 | Required | Pending | TranslationPreviewPanel parent component |

### Codebase Dependencies
| File/Pattern | Purpose |
|--------------|---------|
| `/src/lib/utils.ts` | `cn()` helper for conditional class names |
| `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx` | Reference pattern for simple progress bar |
| `/src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx` | Reference pattern for animated processing state |
| `tailwind.config.js` | Animation configurations |

---

## Technical Context

### Existing Patterns to Follow

**SessionProgressBar Pattern:**
- Simple linear progress bar with Airbnb brand color (#FF385C)
- Uses `transition-all duration-300 ease-out` for smooth animation
- Full ARIA support (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`)
- Height: `h-1.5` or `h-2`, background: `bg-gray-200`, rounded: `rounded-full`

**QRGenerationProgress Pattern:**
- Animated spinner using `animate-spin` class with `Loader2` icon
- Color changes based on status (pink for normal, amber for partial failures, red for all failed)
- Status-based messaging

**Translation Status Color Scheme (from Plan-111):**
| Status | Color | Tailwind Class |
|--------|-------|----------------|
| Completed | Green | `text-green-500` / `bg-green-500` |
| Manual | Purple | `text-violet-500` / `bg-violet-500` |
| Pending | Orange | `text-amber-500` / `bg-amber-500` |
| Processing | Pink (animated) | `text-[#FF385C]` with animation |
| Failed | Red | `text-red-500` / `bg-red-500` |

### Component Location
```
/src/components/TranslationManagement/
└── TranslationPreviewPanel/
    ├── TranslationPreviewPanel.tsx      # Parent component (REQ-310)
    ├── TranslationStatusItem.tsx        # Sibling component (REQ-311)
    └── TranslationProgressBar.tsx       # THIS COMPONENT
```

---

## Functional Requirements

### FR-1: Display Completion Count
- Show text in format "X/Y translations complete" where:
  - X = count of translations with status `completed` or `manual`
  - Y = total number of supported languages (6)
- Text positioned above or beside the progress bar

### FR-2: Visual Progress Bar
- Horizontal bar filling left-to-right proportional to completion ratio
- Calculate percentage: `(completedCount / totalLanguages) * 100`
- Bar height should be visually prominent (~`h-2` or `h-2.5`)
- Background: `bg-gray-200`
- Fill color: Airbnb brand `#FF385C` or green `#22C55E` when all complete

### FR-3: Animated Processing State
- When one or more translations have status `processing`, show animated state
- Use either:
  - Moving gradient effect (shimmer animation), OR
  - Pulsing effect using `animate-pulse`, OR
  - Striped bar pattern with CSS animation
- Animation should be smooth and not cause performance issues

### FR-4: Real-time Updates
- Component re-renders when `translations` prop changes
- Progress bar width transitions smoothly using CSS transitions

### FR-5: Status Differentiation
- Distinguish between:
  - `completed` - machine translation complete
  - `manual` - manually edited (counts as complete)
  - `pending` - not yet started
  - `processing` - currently being translated
  - `failed` - translation failed (does not count as complete)

### FR-6: Edge Cases
- Handle 0 translations gracefully (show empty bar)
- Handle all translations complete (100%, potentially different color)
- Handle all translations failed (show red state)

---

## Non-Functional Requirements

### NFR-1: Performance
- Animation should run at 60fps
- No memory leaks from animation frames
- Lightweight CSS-based animation preferred

### NFR-2: Accessibility
- Include `role="progressbar"` for semantic meaning
- Include `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax` attributes
- Include descriptive `aria-label` (e.g., "Translation progress: 3 of 5 complete")
- Respect `prefers-reduced-motion` media query for animations

### NFR-3: Design Consistency
- Match existing progress bar styling in codebase
- Use Tailwind CSS classes
- Follow Airbnb design system colors
- Consistent with TranslationPreviewPanel visual design

---

## Acceptance Criteria

| ID | Criterion | Test Method |
|----|-----------|-------------|
| AC-1 | Component displays in a prominent position within the TranslationPreviewPanel | Visual verification |
| AC-2 | Text shows completion count in the format "X/Y translations complete" | Unit test |
| AC-3 | Visual bar fills proportionally from 0% to 100% based on completion ratio | Unit test + visual |
| AC-4 | Component correctly counts `completed` and `manual` statuses as complete | Unit test |
| AC-5 | Component displays animated state when one or more translations are `processing` | Visual verification |
| AC-6 | Animation is smooth and does not cause performance issues | Performance test |
| AC-7 | Progress bar updates automatically when translation statuses change | Integration test |
| AC-8 | Component is accessible with appropriate ARIA labels | A11y audit |
| AC-9 | Component styling is consistent with the overall design system | Visual review |
| AC-10 | Component handles zero translations gracefully | Unit test |
| AC-11 | Component handles all-failed state gracefully | Unit test |

---

## Implementation Approach

### Step 1: Create Type Definitions
Define the props interface extending from the shared types (REQ-309):

```typescript
// TranslationProgressBarProps
interface TranslationProgressBarProps {
  /** Translation status for each language */
  translations: TranslationStatusMap;
  /** Total number of supported languages (default: 6) */
  totalLanguages?: number;
  /** Whether to show processing animation */
  isProcessing?: boolean;
  /** Optional CSS class */
  className?: string;
}

// TranslationStatusMap (from shared types)
type TranslationStatusMap = Record<SupportedLanguage, TranslationStatus>;

interface TranslationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual';
  // ... other fields
}
```

### Step 2: Implement Progress Calculation Logic
```typescript
const calculateProgress = (translations: TranslationStatusMap) => {
  const entries = Object.values(translations);
  const completed = entries.filter(t =>
    t.status === 'completed' || t.status === 'manual'
  ).length;
  const processing = entries.some(t => t.status === 'processing');
  const allFailed = entries.every(t => t.status === 'failed');

  return {
    completed,
    total: entries.length,
    percentage: (completed / entries.length) * 100,
    isProcessing: processing,
    allFailed,
  };
};
```

### Step 3: Build Component Structure
1. Container div with optional className
2. Progress bar track (gray background)
3. Progress bar fill (animated width)
4. Text label showing "X/Y translations complete"
5. Conditional animated overlay for processing state

### Step 4: Add Animation for Processing
Consider using CSS-based animation:
```css
/* Shimmer effect via Tailwind */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

Or use Tailwind's built-in `animate-pulse` class conditionally.

### Step 5: Add ARIA Attributes
```typescript
<div
  role="progressbar"
  aria-valuenow={completed}
  aria-valuemin={0}
  aria-valuemax={total}
  aria-label={`Translation progress: ${completed} of ${total} complete`}
>
```

### Step 6: Respect Reduced Motion
```typescript
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

---

## UI Mockup Reference

From Plan-111 Panel Layout:
```
┌─────────────────────────────────────────────────────────────────┐
│ Translations:    [3/5 Complete] ████████░░                     │
│                                                                 │
│ FR Francais ✓ Completed                          [Edit] [↻]    │
│ ...                                                             │
└─────────────────────────────────────────────────────────────────┘
```

Visual specifications:
- Progress bar appears at top of translations section
- Bar fills proportionally based on completion
- Text label appears inline with bar or directly above
- When processing: bar shows animated effect (gradient/pulse)

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationProgressBar.tsx` | Main component implementation |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Export TranslationProgressBar |
| `/src/components/TranslationManagement/index.ts` | Re-export from TranslationPreviewPanel |

### Dependencies on Other REQs

| File Path | Dependency |
|-----------|------------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Import shared types (REQ-309) |
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationPreviewPanel.tsx` | Parent component uses this (REQ-310) |

### Optional: Tailwind Config Update

If adding custom shimmer animation:
```javascript
// tailwind.config.js - theme.extend
keyframes: {
  'shimmer': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
},
animation: {
  'shimmer': 'shimmer 2s linear infinite',
}
```

---

## Testing Strategy

### Unit Tests
1. Test progress calculation with various status combinations
2. Test correct count of completed/manual vs total
3. Test percentage calculation
4. Test edge cases: empty translations, all failed, all complete
5. Test ARIA attributes are correctly set

### Visual Tests
1. Verify bar fills proportionally
2. Verify animation triggers during processing
3. Verify color scheme matches design spec

### Accessibility Tests
1. Screen reader announces progress correctly
2. Reduced motion preference is respected
3. Color contrast meets WCAG AA standards

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Animation performance on low-end devices | Low | Medium | Use CSS-only animation, test on older devices |
| Type definition not available from REQ-309 | Medium | Medium | Define local types, refactor when REQ-309 complete |
| Parent component (REQ-310) not ready | Medium | Low | Can develop and test independently |
| Color scheme conflicts with other statuses | Low | Low | Follow established design system colors |

---

## Estimated Effort

| Task | Estimate |
|------|----------|
| Type definitions | 15 min |
| Core component implementation | 1 hour |
| Animation implementation | 30 min |
| ARIA and accessibility | 20 min |
| Unit tests | 45 min |
| Integration with parent | 30 min |
| **Total** | **~3 hours** |

---

## References

- [Plan-111: L10N Epic 5 Implementation Plan](./prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md)
- [REQ-309: TranslationManagement Types](./gen_requests_epic5.md)
- [REQ-310: TranslationPreviewPanel](./gen_requests_epic5.md)
- [SessionProgressBar.tsx](../src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx) - Reference implementation
- [QRGenerationProgress.tsx](../src/components/ItemCreationWorkflow/components/shared/QRGenerationProgress.tsx) - Reference for animation patterns
