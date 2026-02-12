# REQ-259: Mixed Language Display in Item Creation Recap Screen - Detailed Task Breakdown

**Last Modified:** 2026-02-12
**Type:** BUG FIX
**Size:** S
**Status:** COMPLETED

## Task Breakdown

### Task 1: Add Translation Hooks to PreviewSaveStep Component
**Status:** [x] Completed

Add translation hooks for workflow constants at the component level:

```typescript
// Add these hooks alongside existing translation hooks
const tRooms = useTranslations('workflow.constants.rooms');
const tItemTypes = useTranslations('workflow.constants.itemTypes');
const tPurposes = useTranslations('workflow.constants.purposes');
```

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Location:** Inside `PreviewSaveStep` function, around line 623-631

---

### Task 2: Create Key Conversion Helper Function
**Status:** [x] Completed

Create a helper function to convert hyphenated constant keys to camelCase translation keys:

```typescript
/**
 * Convert hyphenated key to camelCase for translation lookup
 * e.g., 'living-room' -> 'livingRoom', 'how-to-use' -> 'howToUse'
 */
function toCamelCase(key: string): string {
  return key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
```

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Location:** After imports, before component definition (around line 63-73)

---

### Task 3: Update ItemDetailsDisplayProps Interface
**Status:** [x] Completed

Add translation function props to the `ItemDetailsDisplayProps` interface:

```typescript
interface ItemDetailsDisplayProps {
  room: string;
  itemType: string;
  onUpdateRoom?: (room: RoomType) => void;
  onUpdateItemType?: (itemType: ItemType) => void;
  disabled?: boolean;
  t: TranslationFn;
  tRooms: TranslationFn;      // Added
  tItemTypes: TranslationFn;  // Added
}
```

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Location:** Lines 154-165

---

### Task 4: Update ItemDetailsDisplay to Use Translated Room Labels
**Status:** [x] Completed

Replace hardcoded `ROOM_LABELS` with translated labels in the Room dropdown:

**Before:**
```typescript
{Object.entries(ROOM_LABELS).map(([key, label]) => (
  <option key={key} value={key}>{label}</option>
))}
```

**After:**
```typescript
{ROOM_TYPES.map((key) => (
  <option key={key} value={key}>{tRooms(toCamelCase(key))}</option>
))}
```

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Location:** Lines 188-191

---

### Task 5: Update ItemDetailsDisplay to Use Translated Item Type Labels
**Status:** [x] Completed

Replace hardcoded `ITEM_TYPE_LABELS` with translated labels in the Item Type dropdown:

**Before:**
```typescript
{Object.entries(ITEM_TYPE_LABELS).map(([key, label]) => (
  <option key={key} value={key}>{label}</option>
))}
```

**After:**
```typescript
{ITEM_TYPES.map((key) => (
  <option key={key} value={key}>{tItemTypes(`${toCamelCase(key)}.label`)}</option>
))}
```

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Location:** Lines 214-217

---

### Task 6: Update ItemDetailsSectionProps Interface
**Status:** [x] Completed

Add translation function props to the `ItemDetailsSectionProps` interface:

```typescript
interface ItemDetailsSectionProps {
  currentItem: CurrentItemState;
  onUpdateItemName: (name: string) => void;
  onUpdateItemDescription?: (description: string) => void;
  onUpdateArticleTitle?: (title: string) => void;
  onUpdateRoom?: (room: RoomType) => void;
  onUpdateItemType?: (itemType: ItemType) => void;
  onUpdateTags: (tags: string[]) => void;
  disabled?: boolean;
  t: TranslationFn;
  tRooms: TranslationFn;      // Added
  tItemTypes: TranslationFn;  // Added
  tPurposes: TranslationFn;   // Added
}
```

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Location:** Lines 231-254

---

### Task 7: Update Purpose Label to Use Translation
**Status:** [x] Completed

Replace hardcoded `PURPOSE_LABELS` with translated labels in `ItemDetailsSection`:

**Before:**
```typescript
const purposeLabel = currentItem.purpose
  ? PURPOSE_LABELS[currentItem.purpose as PurposeTypeConst]
  : '';
```

**After:**
```typescript
const purposeLabel = currentItem.purpose
  ? tPurposes(`${toCamelCase(currentItem.purpose)}.label`)
  : '';
```

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Location:** Lines 272-275

---

### Task 8: Pass Translation Functions to Sub-Components
**Status:** [x] Completed

Update the component calls to pass the new translation functions:

**ItemDetailsDisplay (inside ItemDetailsSection):**
```typescript
<ItemDetailsDisplay
  room={currentItem.room}
  itemType={currentItem.itemType}
  onUpdateRoom={onUpdateRoom}
  onUpdateItemType={onUpdateItemType}
  disabled={disabled}
  t={t}
  tRooms={tRooms}
  tItemTypes={tItemTypes}
/>
```

**ItemDetailsSection call (in main component):**
```typescript
<ItemDetailsSection
  currentItem={currentItem}
  onUpdateItemName={onUpdateItemName}
  onUpdateItemDescription={onUpdateItemDescription}
  onUpdateArticleTitle={onUpdateArticleTitle}
  onUpdateRoom={onUpdateRoom}
  onUpdateItemType={onUpdateItemType}
  onUpdateTags={onUpdateTags}
  disabled={isSaving}
  t={t}
  tRooms={tRooms}
  tItemTypes={tItemTypes}
  tPurposes={tPurposes}
/>
```

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Locations:** Lines 328-336 (ItemDetailsDisplay call), Lines 843-858 (ItemDetailsSection call)

---

### Task 9: Add Import for ROOM_TYPES and ITEM_TYPES Constants
**Status:** [x] Completed

Updated the imports to use the constants arrays instead of label objects:

```typescript
import {
  MAX_CONTENT_PIECES,
  ROOM_TYPES,        // Changed from ROOM_LABELS
  ITEM_TYPES,        // Changed from ITEM_TYPE_LABELS
  type RoomTypeConst,
  type ItemTypeConst,
  type PurposeTypeConst,
} from '../../utils/constants';
```

**File:** `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Location:** Lines 54-62

---

### Task 10: Run TypeScript Check and Build
**Status:** [x] Completed

Verified no TypeScript errors and build completes:

```bash
npm run typecheck  # PASSED
npm run build      # PASSED (BUILD_ID: MD_GGrjL1uTwa2iaaS_Fx)
```

---

### Task 11: Manual Testing Verification
**Status:** [ ] Pending (User verification needed)

Test in the application with different locales:

1. Set locale to French
2. Navigate to item creation flow
3. Complete steps to reach preview/recap screen
4. Verify Room dropdown shows French labels (e.g., "Salle de bain", "Cuisine")
5. Verify Item Type dropdown shows French labels (e.g., "Appareil", "Article de piece")
6. Verify article title shows French purpose label (e.g., "Comment utiliser")
7. Repeat for other locales (es, de, nl, it)

---

## Summary

| Task | Description | Status |
|------|-------------|--------|
| 1 | Add Translation Hooks | [x] Completed |
| 2 | Create Key Conversion Helper | [x] Completed |
| 3 | Update ItemDetailsDisplayProps | [x] Completed |
| 4 | Update Room Dropdown | [x] Completed |
| 5 | Update Item Type Dropdown | [x] Completed |
| 6 | Update ItemDetailsSectionProps | [x] Completed |
| 7 | Update Purpose Label | [x] Completed |
| 8 | Pass Translation Functions | [x] Completed |
| 9 | Add Constant Imports | [x] Completed |
| 10 | Run TypeCheck and Build | [x] Completed |
| 11 | Manual Testing | [ ] Pending |

## Files Modified

- `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

## Implementation Notes

The fix follows the same pattern used in `RoomSelectionStep.tsx` which correctly uses `tRooms(getRoomTranslationKey(room))` to get translated labels. The PreviewSaveStep now uses:

1. `tRooms(toCamelCase(key))` for room names
2. `tItemTypes(\`${toCamelCase(key)}.label\`)` for item type names
3. `tPurposes(\`${toCamelCase(purpose)}.label\`)` for purpose names

All translation keys already exist in the message files under `workflow.constants.rooms`, `workflow.constants.itemTypes`, and `workflow.constants.purposes`.
