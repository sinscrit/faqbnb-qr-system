# REQ-034: Implement MetadataStep - Technical Overview

**Created:** 2025-12-31T11:00:00
**Last Modified:** 2025-12-31T11:00:00
**Request Reference:** `/docs/gen_requests.md` - Request #034
**Implementation Plan Reference:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 1 - Foundation
**Task ID:** 1.4

---

## Summary

Implement the `MetadataStep` component for the ItemCapture wizard. This step collects essential metadata about items including title, location, tags, and appliance type. The component must follow established form patterns from `ItemForm.tsx` and integrate with the reducer-based state machine from `useItemCaptureState`.

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
- `useItemCaptureState` hook must provide `SET_METADATA` action
- `ItemCapture.types.ts` must export `ItemMetadata` interface

**Can Parallelize With:** Task 1.5 (ContentTypeStep)

---

## Requirements Analysis

### Functional Requirements

From Request #034 and Implementation Plan:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | Text input | **Yes** | Item name/title (1-100 chars) |
| Location | Dropdown + freetext | No | Room/area within property |
| Tags | Pill-based multi-select | No | Categorization tags |
| Appliance Type | Dropdown | No | Predefined appliance categories |

### Validation Rules

1. **Title:**
   - Required field
   - Minimum 1 character
   - Maximum 100 characters
   - Trim whitespace before validation

2. **Location:**
   - Optional
   - If provided, max 50 characters
   - Support both preset values and custom text

3. **Tags:**
   - Optional
   - Array of strings
   - Each tag: 1-30 characters
   - Maximum 10 tags
   - No duplicates (case-insensitive)

4. **Appliance Type:**
   - Optional
   - Must be valid `ApplianceType` value if provided

### User Experience Requirements

- Real-time validation feedback as user types
- Clear visual distinction between required/optional fields
- Mobile-first touch targets (min 48x48px)
- Keyboard navigation support
- ARIA labels for accessibility

---

## Technical Approach

### Component Structure

```tsx
// MetadataStep.tsx
interface MetadataStepProps {
  metadata: ItemMetadata;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<ItemMetadata>) => void;
  onValidate: () => boolean;
}
```

### State Integration

The component receives state from and dispatches to `useItemCaptureState`:

```tsx
// From parent (CaptureWizard or ItemCapture)
const { state, dispatch } = useItemCaptureState();

// MetadataStep dispatches:
dispatch({ type: 'SET_METADATA', payload: { title: 'New Title' } });
dispatch({ type: 'SET_ERROR', payload: { field: 'title', message: 'Required' } });
dispatch({ type: 'CLEAR_ERRORS' });
```

### Patterns to Follow

Based on codebase exploration, follow these established patterns:

#### 1. Form State Pattern (from ItemForm.tsx)

```tsx
// Validation pattern
const validateField = (field: string, value: string): string | null => {
  if (field === 'title' && !value.trim()) {
    return 'Title is required';
  }
  return null;
};

// Error display pattern
{errors.title && (
  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
)}
```

#### 2. Dropdown Pattern (from PropertySelector.tsx)

Custom dropdown with:
- `useState` for open/close state
- Keyboard navigation (Arrow keys, Enter, Escape)
- Click-outside detection
- ARIA attributes for accessibility

#### 3. Multi-Select Pattern (from ItemSelectionList.tsx)

For tags:
- Array-based state
- Add/remove by value
- Visual pill representation with X to remove
- Input for adding new tags

---

## Implementation Details

### Sub-Components Required

1. **TitleInput** - Required text input with validation
2. **LocationPicker** - Dropdown with preset locations + custom option
3. **TagInput** - Pill-based multi-select with add/remove
4. **ApplianceTypeSelect** - Simple dropdown for appliance types

### Constants Definitions

```typescript
// /src/components/ItemCapture/utils/constants.ts

export const PRESET_LOCATIONS = [
  'Kitchen',
  'Living Room',
  'Master Bedroom',
  'Guest Bedroom',
  'Master Bathroom',
  'Guest Bathroom',
  'Garage',
  'Laundry Room',
  'Basement',
  'Attic',
  'Outdoor/Patio',
  'Office/Study',
  'Dining Room',
  'Entryway',
  'Other',
] as const;

export const APPLIANCE_TYPES: { value: ApplianceType; label: string }[] = [
  { value: 'washer', label: 'Washing Machine' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'oven', label: 'Oven / Stove' },
  { value: 'microwave', label: 'Microwave' },
  { value: 'refrigerator', label: 'Refrigerator / Freezer' },
  { value: 'hvac', label: 'HVAC / Thermostat' },
  { value: 'water_heater', label: 'Water Heater' },
  { value: 'garbage_disposal', label: 'Garbage Disposal' },
  { value: 'security_system', label: 'Security System' },
  { value: 'smart_home', label: 'Smart Home Device' },
  { value: 'entertainment', label: 'TV / Entertainment' },
  { value: 'pool_spa', label: 'Pool / Spa / Hot Tub' },
  { value: 'garage', label: 'Garage Door / Opener' },
  { value: 'other', label: 'Other' },
];

export const SUGGESTED_TAGS = [
  'Instructions',
  'Maintenance',
  'Troubleshooting',
  'Settings',
  'Cleaning',
  'Safety',
  'Warranty',
  'Quick Start',
  'Tips',
  'Emergency',
] as const;

export const METADATA_CONSTRAINTS = {
  title: { minLength: 1, maxLength: 100 },
  location: { maxLength: 50 },
  tag: { minLength: 1, maxLength: 30 },
  maxTags: 10,
};
```

### Component Layout

```
┌────────────────────────────────────────────┐
│ Step 1 of 5: Item Details                  │
├────────────────────────────────────────────┤
│                                            │
│  Title *                                   │
│  ┌──────────────────────────────────────┐  │
│  │ Enter item title...                  │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  Location (optional)                       │
│  ┌────────────────────────────────┬─────┐  │
│  │ Select or type location...     │  ▼  │  │
│  └────────────────────────────────┴─────┘  │
│                                            │
│  Tags (optional)                           │
│  ┌──────────────────────────────────────┐  │
│  │ [Kitchen ×] [Instructions ×]         │  │
│  │ ┌──────────────────────────────────┐ │  │
│  │ │ Add tag...                       │ │  │
│  │ └──────────────────────────────────┘ │  │
│  │ Suggestions: [Maintenance] [Tips]... │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  Appliance Type (optional)                 │
│  ┌────────────────────────────────┬─────┐  │
│  │ Select appliance type...       │  ▼  │  │
│  └────────────────────────────────┴─────┘  │
│                                            │
└────────────────────────────────────────────┘
```

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/components/steps/MetadataStep.tsx` | Main step component |

### Files to Modify

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/utils/constants.ts` | Add `PRESET_LOCATIONS`, `SUGGESTED_TAGS`, `METADATA_CONSTRAINTS` |
| `src/components/ItemCapture/components/CaptureWizard.tsx` | Import and render MetadataStep |
| `src/components/ItemCapture/index.ts` | Export MetadataStep if needed externally |

### Files to Reference (Read-Only)

| File Path | Pattern to Follow |
|-----------|-------------------|
| `src/components/ItemForm.tsx` | Form state, validation, error display patterns |
| `src/components/PropertySelector.tsx` | Custom dropdown implementation |
| `src/components/ItemSelectionList.tsx` | Multi-select and pill patterns |
| `src/components/ItemCapture/ItemCapture.types.ts` | Type definitions (ItemMetadata) |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | State machine actions |
| `src/lib/utils.ts` | `cn()` utility for class merging |

### Functions to Implement

```typescript
// MetadataStep.tsx
export function MetadataStep(props: MetadataStepProps): JSX.Element

// Internal validation helper
function validateMetadata(metadata: ItemMetadata): Record<string, string>

// Internal handlers
function handleTitleChange(value: string): void
function handleLocationChange(value: string): void
function handleAddTag(tag: string): void
function handleRemoveTag(tag: string): void
function handleApplianceTypeChange(type: ApplianceType | undefined): void
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| State machine integration issues | Low | Medium | Verify useItemCaptureState exports SET_METADATA action |
| Accessibility gaps in custom dropdowns | Medium | Medium | Follow PropertySelector patterns; test with screen readers |
| Tag input UX complexity | Medium | Low | Start simple; suggest common tags; allow freeform entry |
| Mobile keyboard overlap with inputs | Low | Medium | Use proper input modes; test on mobile devices |

---

## Testing Checklist

### Unit Tests

- [ ] Title validation: empty, min, max length
- [ ] Location validation: optional behavior, max length
- [ ] Tags: add, remove, duplicate prevention, max count
- [ ] Appliance type: valid selection, clear selection
- [ ] Form validation: blocks next step when invalid

### Integration Tests

- [ ] State updates dispatch correctly to parent
- [ ] Navigation blocked when title is empty
- [ ] State persists when navigating back from next step
- [ ] Errors clear when field becomes valid

### Manual Tests

- [ ] Keyboard navigation through all fields
- [ ] Mobile touch targets meet 48x48px minimum
- [ ] Screen reader announces field labels and errors
- [ ] Tag pills are visually distinct and removable
- [ ] Location dropdown shows preset options and accepts custom text

---

## Effort Estimate

| Sub-task | Estimate |
|----------|----------|
| TitleInput with validation | 0.5 hours |
| LocationPicker dropdown | 1.5 hours |
| TagInput multi-select | 2 hours |
| ApplianceTypeSelect | 0.5 hours |
| MetadataStep container | 1 hour |
| Integration with wizard | 0.5 hours |
| Testing & polish | 1 hour |
| **Total** | **7 hours** |

---

## Definition of Done

1. [ ] MetadataStep renders within CaptureWizard
2. [ ] Title field validates (required, 1-100 chars)
3. [ ] Location dropdown allows preset selection and custom text
4. [ ] Tags can be added/removed as pills
5. [ ] Appliance type dropdown works with predefined options
6. [ ] Form validation prevents next step when title is empty
7. [ ] State persists when navigating between wizard steps
8. [ ] All fields accessible via keyboard
9. [ ] Mobile-responsive layout
10. [ ] No console errors or warnings

---

## References

- Implementation Plan: `/docs/prd/item-capture-implementation-plan.md` (Task 1.4)
- Request: `/docs/gen_requests.md` (REQ-034)
- Form Pattern Reference: `/src/components/ItemForm.tsx`
- Dropdown Pattern Reference: `/src/components/PropertySelector.tsx`
- Multi-select Pattern Reference: `/src/components/ItemSelectionList.tsx`
- Type Definitions: `/src/components/ItemCapture/ItemCapture.types.ts`
