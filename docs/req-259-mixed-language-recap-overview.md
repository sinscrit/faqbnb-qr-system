# REQ-259: Mixed Language Display in Item Creation Recap Screen - Technical Overview

**Last Modified:** 2026-02-12
**Type:** BUG FIX
**Size:** S
**Status:** COMPLETED

## Summary

The item creation recap screen (PreviewSaveStep) displays mixed languages - French UI labels but English field values. The dropdown options for Room and Item Type display hardcoded English strings from constants instead of using the translation function to get localized values.

## Root Cause Analysis

### Current Behavior

The `PreviewSaveStep` component at `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` uses hardcoded English labels from:

1. `ROOM_LABELS` constant (e.g., "Bathroom", "Kitchen", "Living Room")
2. `ITEM_TYPE_LABELS` constant (e.g., "Appliance", "Room Item", "General Info")
3. `PURPOSE_LABELS` constant (e.g., "How to Use", "Safety Information")

These constants are defined in `/src/components/ItemCreationWorkflow/utils/constants.ts` with static English strings.

### Problem Location

In `ItemDetailsDisplay` sub-component (lines 152-209):

```typescript
// Lines 176-179: Room dropdown uses hardcoded ROOM_LABELS
{Object.entries(ROOM_LABELS).map(([key, label]) => (
  <option key={key} value={key}>{label}</option>  // ❌ Uses English label
))}

// Lines 202-205: Item Type dropdown uses hardcoded ITEM_TYPE_LABELS
{Object.entries(ITEM_TYPE_LABELS).map(([key, label]) => (
  <option key={key} value={key}>{label}</option>  // ❌ Uses English label
))}
```

In `ItemDetailsSection` sub-component (lines 247-253):
```typescript
// Purpose label derived from PURPOSE_LABELS constant
const purposeLabel = currentItem.purpose
  ? PURPOSE_LABELS[currentItem.purpose as PurposeTypeConst]  // ❌ Uses English label
  : '';
```

### Expected Behavior

All values should use the translation function (`t()`) to display localized strings from the message files:

- Room names: Use `workflow.constants.rooms.{roomKey}` translations
- Item types: Use `workflow.constants.itemTypes.{typeKey}.label` translations
- Purpose types: Use `workflow.constants.purposes.{purposeKey}.label` translations

## Solution Approach

1. Add translation hooks for workflow constants:
   ```typescript
   const tRooms = useTranslations('workflow.constants.rooms');
   const tItemTypes = useTranslations('workflow.constants.itemTypes');
   const tPurposes = useTranslations('workflow.constants.purposes');
   ```

2. Create helper functions to convert constant keys to translation keys:
   - Room: Convert hyphenated names to camelCase (e.g., `living-room` → `livingRoom`)
   - Item Type: Convert hyphenated names to camelCase (e.g., `room-item` → `roomItem`)
   - Purpose: Convert hyphenated names to camelCase (e.g., `how-to-use` → `howToUse`)

3. Update dropdowns to use translated labels instead of constants

4. Pass translation functions to sub-components that need them

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Add translation hooks, update dropdowns to use translations |

## Translation Keys Used

The following translation keys already exist in message files:

### Rooms (`workflow.constants.rooms`)
- `kitchen`, `laundry`, `bedroom`, `bathroom`, `livingRoom`, `garage`, `outdoor`, `general`, `other`

### Item Types (`workflow.constants.itemTypes`)
- `appliance.label`, `roomItem.label`, `generalInfo.label`

### Purposes (`workflow.constants.purposes`)
- `howToUse.label`, `howToClean.label`, `troubleshooting.label`, `safetyInfo.label`, `maintenance.label`, `features.label`, `other.label`

## Testing Checklist

- [x] Room dropdown shows translated labels in French
- [x] Item Type dropdown shows translated labels in French
- [x] Purpose/Article title shows translated labels in French
- [x] All 6 supported locales display correctly (en, fr, es, de, nl, it)
- [x] No TypeScript errors
- [x] Build completes successfully

## Related Requirements

- REQ-258: Mixed Localization in Item Suggestion Selection (similar fix pattern)
- REQ-E02-064: i18n Integration for PreviewSaveStep (original i18n setup)
