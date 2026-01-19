# REQ-379: Update PreviewSaveStep Component for Internationalization - Detailed Task Breakdown

**Document Created**: 2026-01-19 17:30 UTC
**Last Modified**: 2026-01-19 17:30 UTC
**Type**: ENHANCEMENT
**Size**: L (Large)
**Epic**: Epic 2 - Static UI Translation
**Sub-Epic**: 2C - Item Creation Workflow
**Task ID**: 2C.9
**Parent Overview**: [REQ-379-update-previewsavestep-overview.md](./REQ-379-update-previewsavestep-overview.md)

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for internationalizing the PreviewSaveStep component. The PreviewSaveStep is the final step in the item creation workflow (~900 lines) with approximately 50 hardcoded strings across 5 sub-components. All tasks are designed to be 1 story point each for efficient execution by an AI coding agent or junior developer.

---

## Prerequisites Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] `/messages/en.json` exists with `workflow` namespace structure
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] IntlProvider wrapper is configured in app layout
- [ ] Previous workflow step translations (2C.1-2C.8) are in place

---

## File Inventory

### Primary Target File
| File | Path | Lines | Strings |
|------|------|-------|---------|
| PreviewSaveStep.tsx | `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | ~900 | ~50 |

### Sub-Components Within PreviewSaveStep.tsx
| Sub-Component | Line Range | Strings |
|---------------|------------|---------|
| EmptyContentState | 103-121 | 2 |
| ItemDetailsDisplay | 127-203 | 2 |
| ItemDetailsSection | 209-345 | 6 |
| ContentSection | 351-480 | 7 |
| SuccessOverlay | 485-557 | 4 |
| Main PreviewSaveStep | 563-900 | ~29 |

### Related Shared Components (Optional Updates)
| File | Path | Strings |
|------|------|---------|
| ItemNameEditor.tsx | `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx` | 3 |
| TagsEditor.tsx | `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx` | 4 |

### Translation Files
| File | Path |
|------|------|
| English | `/messages/en.json` |
| French | `/messages/fr.json` |
| Spanish | `/messages/es.json` |
| German | `/messages/de.json` |
| Dutch | `/messages/nl.json` |
| Italian | `/messages/it.json` |

---

## Task Breakdown

### Phase 1: Translation Keys Setup

#### Task 1.1: Add previewSaveStep Namespace to English Translations
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Create the complete translation key structure for PreviewSaveStep in `/messages/en.json`.

**File to Modify**: `/messages/en.json`

**Keys to Add** (within the existing `workflow` namespace):

```json
{
  "workflow": {
    "previewSaveStep": {
      "heading": "Preview & Save",
      "itemDetails": {
        "sectionLabel": "Item details form",
        "labels": {
          "itemName": "Item Name",
          "itemDescription": "Item Description",
          "room": "Room",
          "itemType": "Item Type",
          "articleTitle": "Guide/Article Title",
          "tags": "Tags"
        },
        "placeholders": {
          "itemName": "Enter item name",
          "itemDescription": "Enter a brief description of this item (optional)",
          "articleTitle": "Enter guide/article title"
        },
        "hints": {
          "itemNameHint": "This name will appear on the QR code label"
        }
      },
      "content": {
        "heading": "Content",
        "countLabel": "{count, plural, one {# content piece} other {# content pieces}}",
        "maxReached": "Maximum reached",
        "emptyState": "No content added yet",
        "buttons": {
          "addContent": "Add Content",
          "addMore": "Add More"
        }
      },
      "dragDrop": {
        "contentListLabel": "Content pieces - drag to reorder",
        "announcements": {
          "pickedUp": "Picked up {type} content. Current position: {position} of {total}. Use arrow keys to move.",
          "overPosition": "Over position {position}",
          "dropped": "Dropped {type} content. New position: {position} of {total}",
          "unchanged": "Position unchanged.",
          "cancelled": "Drag cancelled. Content returned to original position."
        }
      },
      "buttons": {
        "save": "Save Item",
        "saving": "Saving..."
      },
      "success": {
        "heading": "Item Saved!",
        "description": "Your item has been saved and is ready for your guests!",
        "qrCodeAlt": "QR code for {itemName}",
        "buttons": {
          "continue": "Continue"
        }
      },
      "confirmRemove": {
        "heading": "Remove Last Content?",
        "message": "This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?",
        "buttons": {
          "keep": "Keep",
          "remove": "Remove"
        }
      },
      "errors": {
        "saveFailed": "Failed to save item",
        "noData": "No item data available. Please start a new item."
      },
      "announcements": {
        "saveSuccess": "Item saved successfully",
        "saveError": "Error: {error}"
      },
      "tags": {
        "removeTag": "Remove {label} tag",
        "addTagLabel": "Add tag",
        "addTagButton": "Add Tag",
        "availableTags": "Available tags"
      }
    },
    "buttons": {
      "goBack": "Go Back",
      "dismiss": "Dismiss"
    }
  }
}
```

**Steps**:
1. Open `/messages/en.json`
2. Locate the `workflow` namespace (create if not exists)
3. Add the `previewSaveStep` object with all nested keys
4. Ensure `workflow.buttons` shared keys exist (may be added by previous tasks)
5. Validate JSON syntax

**Verification**:
- [ ] JSON is valid (no syntax errors)
- [ ] All 50 strings are represented
- [ ] ICU format used for pluralization (`{count, plural, ...}`)
- [ ] Interpolation placeholders use `{variableName}` format

---

### Phase 2: Component Updates

#### Task 2.1: Add Import and Initialize useTranslations Hook
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Import `useTranslations` and initialize the translation function in the main component.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Location**: After existing imports (around line 60)

**Code Changes**:

```typescript
// Add import after other imports (around line 28-60)
import { useTranslations } from 'next-intl';
```

```typescript
// Inside PreviewSaveStep function (around line 563-580)
export function PreviewSaveStep({
  // ... existing props
}: PreviewSaveStepProps) {
  // Add at the start of the component, before other state
  const t = useTranslations('workflow');

  // ... rest of component
}
```

**Verification**:
- [ ] Import statement added
- [ ] `t` function initialized with 'workflow' namespace
- [ ] Component compiles without errors

---

#### Task 2.2: Update Main Component Header
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Replace hardcoded header text with translation keys.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Strings to Replace**:

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 771 | `"Go back"` | `t('buttons.goBack')` |
| 776 | `"Preview & Save"` | `t('previewSaveStep.heading')` |

**Code Changes**:

```typescript
// Around line 768-777 - Header section
<button
  type="button"
  onClick={onCancel}
  disabled={isSaving}
  className={cn(/* ... */)}
  aria-label={t('buttons.goBack')}  // Changed from "Go back"
>
  <ArrowLeft className="w-5 h-5 text-[#222222]" aria-hidden="true" />
</button>
<h2 className="text-xl font-semibold text-[#222222]">
  {t('previewSaveStep.heading')}  {/* Changed from "Preview & Save" */}
</h2>
```

**Verification**:
- [ ] Back button aria-label uses translation
- [ ] Heading uses translation
- [ ] Component renders correctly

---

#### Task 2.3: Update EmptyContentState Sub-Component
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Pass translation function to EmptyContentState and replace hardcoded strings.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Approach**: Since EmptyContentState is defined in the same file, pass `t` as a prop.

**Code Changes**:

```typescript
// Update interface (around line 103-106)
interface EmptyContentStateProps {
  onAddContent: () => void;
  t: ReturnType<typeof useTranslations>;  // Add translation prop
}

// Update component (around line 107-121)
function EmptyContentState({ onAddContent, t }: EmptyContentStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <Plus className="w-12 h-12 text-gray-400 mb-3" aria-hidden="true" />
      <p className="text-[#717171] mb-4">
        {t('previewSaveStep.content.emptyState')}  {/* Changed from "No content added yet" */}
      </p>
      <button
        type="button"
        onClick={onAddContent}
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
      >
        {t('previewSaveStep.content.buttons.addContent')}  {/* Changed from "Add Content" */}
      </button>
    </div>
  );
}
```

**Note**: Update the usage in ContentSection to pass `t` prop (see Task 2.5).

**Verification**:
- [ ] EmptyContentState interface updated
- [ ] Both strings replaced with translation keys
- [ ] Component renders empty state correctly

---

#### Task 2.4: Update ItemDetailsDisplay Sub-Component
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Add translation function and replace form labels.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Code Changes**:

```typescript
// Update interface (around line 138-144)
interface ItemDetailsDisplayProps {
  room: string;
  itemType: string;
  onUpdateRoom?: (room: RoomType) => void;
  onUpdateItemType?: (itemType: ItemType) => void;
  disabled?: boolean;
  t: ReturnType<typeof useTranslations>;  // Add translation prop
}

// Update component (around line 146-203)
function ItemDetailsDisplay({ room, itemType, onUpdateRoom, onUpdateItemType, disabled, t }: ItemDetailsDisplayProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Room Dropdown */}
      <div className="space-y-2">
        <label htmlFor="room-select" className="block text-sm font-medium text-[#222222]">
          {t('previewSaveStep.itemDetails.labels.room')}  {/* Changed from "Room" */}
        </label>
        {/* ... rest of dropdown ... */}
      </div>
      {/* Item Type Dropdown */}
      <div className="space-y-2">
        <label htmlFor="item-type-select" className="block text-sm font-medium text-[#222222]">
          {t('previewSaveStep.itemDetails.labels.itemType')}  {/* Changed from "Item Type" */}
        </label>
        {/* ... rest of dropdown ... */}
      </div>
    </div>
  );
}
```

**Verification**:
- [ ] Interface updated with translation prop
- [ ] "Room" label replaced
- [ ] "Item Type" label replaced

---

#### Task 2.5: Update ItemDetailsSection Sub-Component
**Priority**: Required | **Complexity**: Medium | **Story Points**: 1

**Objective**: Add translation function and replace all form labels and placeholders.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Strings to Replace**:

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 249 | `"Item details form"` | `t('previewSaveStep.itemDetails.sectionLabel')` |
| 258 | `"Enter item name"` | `t('previewSaveStep.itemDetails.placeholders.itemName')` |
| 267 | `"Item Description"` | `t('previewSaveStep.itemDetails.labels.itemDescription')` |
| 277 | `"Enter a brief description..."` | `t('previewSaveStep.itemDetails.placeholders.itemDescription')` |
| 307 | `"Guide/Article Title"` | `t('previewSaveStep.itemDetails.labels.articleTitle')` |
| 317 | `"Enter guide/article title"` | `t('previewSaveStep.itemDetails.placeholders.articleTitle')` |
| 333 | `"Tags"` | `t('previewSaveStep.itemDetails.labels.tags')` |

**Code Changes**:

```typescript
// Update interface (around line 209-224)
interface ItemDetailsSectionProps {
  currentItem: CurrentItemState;
  onUpdateItemName: (name: string) => void;
  onUpdateItemDescription?: (description: string) => void;
  onUpdateArticleTitle?: (title: string) => void;
  onUpdateRoom?: (room: RoomType) => void;
  onUpdateItemType?: (itemType: ItemType) => void;
  onUpdateTags: (tags: string[]) => void;
  disabled?: boolean;
  t: ReturnType<typeof useTranslations>;  // Add translation prop
}

// Update component (around line 226-345)
function ItemDetailsSection({
  currentItem,
  onUpdateItemName,
  onUpdateItemDescription,
  onUpdateArticleTitle,
  onUpdateRoom,
  onUpdateItemType,
  onUpdateTags,
  disabled,
  t,  // Add to destructuring
}: ItemDetailsSectionProps) {
  // ... existing logic ...

  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6"
      aria-label={t('previewSaveStep.itemDetails.sectionLabel')}  // Changed
    >
      {/* Item Name field */}
      <div className="mb-4">
        <ItemNameEditor
          value={currentItem.specificItem}
          onChange={onUpdateItemName}
          disabled={disabled}
          maxLength={50}
          placeholder={t('previewSaveStep.itemDetails.placeholders.itemName')}  // Changed
        />
      </div>

      {/* Item Description field */}
      <div className="mb-4">
        <label
          htmlFor="item-description-editor"
          className="block text-sm font-medium text-[#222222] mb-2"
        >
          {t('previewSaveStep.itemDetails.labels.itemDescription')}  {/* Changed */}
        </label>
        <textarea
          id="item-description-editor"
          value={currentItem.itemDescription || ''}
          onChange={(e) => onUpdateItemDescription?.(e.target.value)}
          disabled={disabled}
          maxLength={500}
          rows={3}
          placeholder={t('previewSaveStep.itemDetails.placeholders.itemDescription')}  // Changed
          className={cn(/* ... */)}
        />
      </div>

      {/* Room and Item Type dropdowns - pass t */}
      <div className="mb-4">
        <ItemDetailsDisplay
          room={currentItem.room}
          itemType={currentItem.itemType}
          onUpdateRoom={onUpdateRoom}
          onUpdateItemType={onUpdateItemType}
          disabled={disabled}
          t={t}  // Pass translation function
        />
      </div>

      {/* Guide/Article Title field */}
      <div className="mb-4">
        <label
          htmlFor="article-title-editor"
          className="block text-sm font-medium text-[#222222] mb-2"
        >
          {t('previewSaveStep.itemDetails.labels.articleTitle')}  {/* Changed */}
        </label>
        <input
          id="article-title-editor"
          type="text"
          value={articleTitle}
          onChange={(e) => onUpdateArticleTitle?.(e.target.value)}
          disabled={disabled}
          maxLength={100}
          placeholder={t('previewSaveStep.itemDetails.placeholders.articleTitle')}  // Changed
          className={cn(/* ... */)}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-[#717171] mb-2">
          {t('previewSaveStep.itemDetails.labels.tags')}  {/* Changed */}
        </label>
        <TagsEditor
          selectedTags={currentItem.tags || []}
          onTagsChange={onUpdateTags}
          disabled={disabled}
          maxTags={10}
        />
      </div>
    </section>
  );
}
```

**Verification**:
- [ ] Interface updated with translation prop
- [ ] All 7 strings replaced
- [ ] ItemDetailsDisplay receives `t` prop

---

#### Task 2.6: Update ContentSection Sub-Component
**Priority**: Required | **Complexity**: Medium | **Story Points**: 1

**Objective**: Add translation function and replace all content section strings.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Strings to Replace**:

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 397 | `"Content"` | `t('previewSaveStep.content.heading')` |
| 401 | `"{count} content pieces"` | `t('previewSaveStep.content.countLabel', { count })` |
| 408 | `"Maximum reached"` | `t('previewSaveStep.content.maxReached')` |
| 433 | `"Content pieces - drag to reorder"` | `t('previewSaveStep.dragDrop.contentListLabel')` |
| 475 | `"Add More"` | `t('previewSaveStep.content.buttons.addMore')` |

**Code Changes**:

```typescript
// Update interface (around line 351-365)
interface ContentSectionProps {
  content: ContentPiece[];
  sensors: ReturnType<typeof useSensors>;
  activeId: string | null;
  activeContent: ContentPiece | null;
  announcements: Announcements;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  onRemoveContent: (contentId: string) => void;
  onRetake: () => void;
  onAddMore: () => void;
  maxContentPieces: number;
  disabled?: boolean;
  t: ReturnType<typeof useTranslations>;  // Add translation prop
}

// Update component (around line 367-480)
function ContentSection({
  content,
  sensors,
  activeId,
  activeContent,
  announcements,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onRemoveContent,
  onRetake,
  onAddMore,
  maxContentPieces,
  disabled,
  t,  // Add to destructuring
}: ContentSectionProps) {
  const contentCount = content.length;
  const canAddMore = contentCount < maxContentPieces;

  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6"
      aria-labelledby="content-section-heading"
    >
      {/* Header with count badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3
            id="content-section-heading"
            className="text-lg font-medium text-[#222222]"
          >
            {t('previewSaveStep.content.heading')}  {/* Changed from "Content" */}
          </h3>
          <span
            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
            aria-label={t('previewSaveStep.content.countLabel', { count: contentCount })}  // Changed
          >
            {contentCount}
          </span>
        </div>
        {contentCount >= maxContentPieces && (
          <span className="text-sm text-amber-600 font-medium">
            {t('previewSaveStep.content.maxReached')}  {/* Changed from "Maximum reached" */}
          </span>
        )}
      </div>

      {/* Content grid with previews */}
      {contentCount === 0 ? (
        <EmptyContentState onAddContent={onAddMore} t={t} />  {/* Pass t prop */}
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
          modifiers={[restrictToParentElement]}
          accessibility={{ announcements }}
        >
          <SortableContext
            items={content.map(c => c.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              role="list"
              aria-label={t('previewSaveStep.dragDrop.contentListLabel')}  // Changed
            >
              {/* ... existing map logic ... */}
            </div>
          </SortableContext>
          {/* ... DragOverlay ... */}
        </DndContext>
      )}

      {/* Small "+ Add More" link */}
      {canAddMore && contentCount > 0 && (
        <button
          type="button"
          onClick={onAddMore}
          disabled={disabled}
          className={cn(/* ... */)}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {t('previewSaveStep.content.buttons.addMore')}  {/* Changed from "Add More" */}
        </button>
      )}
    </section>
  );
}
```

**Verification**:
- [ ] Interface updated with translation prop
- [ ] All 5 strings replaced
- [ ] EmptyContentState receives `t` prop
- [ ] Pluralization works correctly for content count

---

#### Task 2.7: Update Drag-and-Drop Announcements
**Priority**: Required | **Complexity**: Medium | **Story Points**: 1

**Objective**: Update the accessibility announcements to use translation keys with interpolation.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Location**: Around lines 634-662

**Code Changes**:

```typescript
// Inside the main PreviewSaveStep component, update announcements useMemo
const announcements: Announcements = useMemo(() => ({
  onDragStart({ active }) {
    const piece = contentArray.find(c => c.id === active.id);
    const position = contentArray.findIndex(c => c.id === active.id) + 1;
    const typeName = piece?.type || 'content';
    return t('previewSaveStep.dragDrop.announcements.pickedUp', {
      type: typeName,
      position: position,
      total: contentArray.length
    });
  },
  onDragOver({ over }) {
    if (over) {
      const position = contentArray.findIndex(c => c.id === over.id) + 1;
      return t('previewSaveStep.dragDrop.announcements.overPosition', { position });
    }
    return undefined;
  },
  onDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      const piece = contentArray.find(c => c.id === active.id);
      const typeName = piece?.type || 'content';
      const newPosition = contentArray.findIndex(c => c.id === over.id) + 1;
      return t('previewSaveStep.dragDrop.announcements.dropped', {
        type: typeName,
        position: newPosition,
        total: contentArray.length
      });
    }
    return t('previewSaveStep.dragDrop.announcements.unchanged');
  },
  onDragCancel() {
    return t('previewSaveStep.dragDrop.announcements.cancelled');
  },
}), [contentArray, t]);  // Add t to dependencies
```

**Verification**:
- [ ] All 5 announcement strings use translation keys
- [ ] Interpolation variables (`type`, `position`, `total`) passed correctly
- [ ] `t` added to useMemo dependencies
- [ ] Screen reader announcements work in different languages

---

#### Task 2.8: Update SuccessOverlay Sub-Component
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Add translation function and replace success overlay strings.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Strings to Replace**:

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 527 | `"Item Saved!"` | `t('previewSaveStep.success.heading')` |
| 533 | `"QR code for ${itemName}"` | `t('previewSaveStep.success.qrCodeAlt', { itemName })` |
| 543 | `"Your item has been saved..."` | `t('previewSaveStep.success.description')` |
| 551 | `"Continue"` | `t('previewSaveStep.success.buttons.continue')` |

**Code Changes**:

```typescript
// Update interface (around line 502-513)
interface SuccessOverlayProps {
  itemName: string;
  qrCodeUrl: string;
  onContinue: () => void;
  t: ReturnType<typeof useTranslations>;  // Add translation prop
}

// Update component (around line 515-557)
function SuccessOverlay({ itemName, qrCodeUrl, onContinue, t }: SuccessOverlayProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-[#00A699] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-white" aria-hidden="true" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-[#222222] mb-4">
          {t('previewSaveStep.success.heading')}  {/* Changed from "Item Saved!" */}
        </h2>

        {/* QR Code */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg inline-block mb-4 shadow-sm">
          <img
            src={qrCodeUrl}
            alt={t('previewSaveStep.success.qrCodeAlt', { itemName })}  // Changed
            className="w-40 h-40"
          />
          <p className="mt-2 text-sm font-medium text-[#222222]">
            {itemName}
          </p>
        </div>

        {/* Description */}
        <p className="text-[#717171] mb-8">
          {t('previewSaveStep.success.description')}  {/* Changed */}
        </p>

        {/* Continue Button */}
        <button
          type="button"
          onClick={onContinue}
          className="px-8 py-3 bg-[#FF385C] text-white rounded-lg font-medium hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
        >
          {t('previewSaveStep.success.buttons.continue')}  {/* Changed from "Continue" */}
        </button>
      </div>
    </div>
  );
}
```

**Verification**:
- [ ] Interface updated with translation prop
- [ ] All 4 strings replaced
- [ ] QR code alt text interpolates itemName correctly

---

#### Task 2.9: Update Save Button States
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Replace save button labels with translations.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Location**: Around lines 838-850

**Code Changes**:

```typescript
{/* Save Button - around line 824-850 */}
<button
  type="button"
  onClick={handleSave}
  disabled={isSaving || !canSave}
  className={cn(/* ... */)}
>
  {isSaving ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
      {t('previewSaveStep.buttons.saving')}  {/* Changed from "Saving..." */}
    </>
  ) : (
    <>
      <Check className="w-5 h-5" aria-hidden="true" />
      {t('previewSaveStep.buttons.save')}  {/* Changed from "Save Item" */}
    </>
  )}
</button>
```

**Verification**:
- [ ] "Saving..." replaced with translation
- [ ] "Save Item" replaced with translation
- [ ] Button renders correctly in both states

---

#### Task 2.10: Update Error Display and Guard State
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Replace error messages and guard state text with translations.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Strings to Replace**:

| Line | Current String | Translation Key |
|------|----------------|-----------------|
| 710 | `"Failed to save item"` | `t('previewSaveStep.errors.saveFailed')` |
| 818 | `"Dismiss"` | `t('buttons.dismiss')` |
| 745 | `"No item data available..."` | `t('previewSaveStep.errors.noData')` |
| 751 | `"Go Back"` | `t('buttons.goBack')` |

**Code Changes**:

```typescript
// Update handleSave error handling (around line 710)
} catch (error) {
  setSaveError(error instanceof Error ? error.message : t('previewSaveStep.errors.saveFailed'));
}

// Update error display (around line 809-821)
{saveError && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-600 text-sm">{saveError}</p>
    <button
      type="button"
      onClick={() => setSaveError(null)}
      className="mt-2 text-red-700 underline text-sm hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
    >
      {t('buttons.dismiss')}  {/* Changed from "Dismiss" */}
    </button>
  </div>
)}

// Update guard state (around line 741-756)
if (!currentItem) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-6 min-h-[300px]', className)}>
      <p className="text-[#717171] text-center">
        {t('previewSaveStep.errors.noData')}  {/* Changed */}
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
      >
        {t('buttons.goBack')}  {/* Changed from "Go Back" */}
      </button>
    </div>
  );
}
```

**Verification**:
- [ ] Save error fallback uses translation
- [ ] "Dismiss" button uses translation
- [ ] Guard state message uses translation
- [ ] Guard state "Go Back" button uses translation

---

#### Task 2.11: Update Confirmation Dialog
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Replace confirmation dialog strings with translations.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Location**: Around lines 858-895

**Code Changes**:

```typescript
{/* Last Piece Removal Confirmation Dialog */}
{isRemovingLastPiece && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="remove-confirm-title"
  >
    <div className="bg-white rounded-lg shadow-xl max-w-sm mx-4 p-6">
      <h3
        id="remove-confirm-title"
        className="text-lg font-semibold text-[#222222] mb-2"
      >
        {t('previewSaveStep.confirmRemove.heading')}  {/* Changed */}
      </h3>
      <p className="text-[#717171] mb-6">
        {t('previewSaveStep.confirmRemove.message')}  {/* Changed */}
      </p>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={handleCancelRemove}
          className="px-4 py-2 text-[#222222] border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
        >
          {t('previewSaveStep.confirmRemove.buttons.keep')}  {/* Changed from "Keep" */}
        </button>
        <button
          type="button"
          onClick={handleConfirmRemove}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {t('previewSaveStep.confirmRemove.buttons.remove')}  {/* Changed from "Remove" */}
        </button>
      </div>
    </div>
  </div>
)}
```

**Verification**:
- [ ] Dialog heading uses translation
- [ ] Dialog message uses translation
- [ ] "Keep" button uses translation
- [ ] "Remove" button uses translation

---

#### Task 2.12: Update Screen Reader Announcements
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Replace screen reader live region announcements with translations.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Location**: Around lines 852-856

**Code Changes**:

```typescript
{/* Screen Reader Announcements */}
<div aria-live="polite" className="sr-only">
  {showSuccess && t('previewSaveStep.announcements.saveSuccess')}  {/* Changed */}
  {saveError && t('previewSaveStep.announcements.saveError', { error: saveError })}  {/* Changed */}
</div>
```

**Verification**:
- [ ] Save success announcement uses translation
- [ ] Save error announcement uses translation with error interpolation
- [ ] Announcements work with screen readers

---

#### Task 2.13: Pass Translation Function to All Sub-Components
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Objective**: Ensure all sub-component calls in the main render pass the `t` prop.

**File**: `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`

**Code Changes**:

```typescript
// In success overlay render (around line 726-735)
if (showSuccess && savedResult) {
  return (
    <div className={cn('flex flex-col gap-6 p-6', className)}>
      <SuccessOverlay
        itemName={savedResult.itemName}
        qrCodeUrl={savedResult.qrCodeUrl}
        onContinue={handleContinue}
        t={t}  // Add t prop
      />
    </div>
  );
}

// In main render - ItemDetailsSection (around line 781-790)
<ItemDetailsSection
  currentItem={currentItem}
  onUpdateItemName={onUpdateItemName}
  onUpdateItemDescription={onUpdateItemDescription}
  onUpdateArticleTitle={onUpdateArticleTitle}
  onUpdateRoom={onUpdateRoom}
  onUpdateItemType={onUpdateItemType}
  onUpdateTags={onUpdateTags}
  disabled={isSaving}
  t={t}  // Add t prop
/>

// In main render - ContentSection (around line 793-807)
<ContentSection
  content={contentArray}
  sensors={sensors}
  activeId={activeId}
  activeContent={activeContent}
  announcements={announcements}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
  onDragCancel={handleDragCancel}
  onRemoveContent={handleRemoveClick}
  onRetake={onRetake}
  onAddMore={onRetake}
  maxContentPieces={MAX_CONTENT_PIECES}
  disabled={isSaving}
  t={t}  // Add t prop
/>
```

**Verification**:
- [ ] SuccessOverlay receives `t` prop
- [ ] ItemDetailsSection receives `t` prop
- [ ] ContentSection receives `t` prop
- [ ] No TypeScript errors about missing props

---

### Phase 3: Non-English Translations

#### Task 3.1: Generate French Translations
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**File**: `/messages/fr.json`

**Add French translations for all previewSaveStep keys** (using professional French for hospitality context):

```json
{
  "workflow": {
    "previewSaveStep": {
      "heading": "Apercu et sauvegarde",
      "itemDetails": {
        "sectionLabel": "Formulaire de details de l'article",
        "labels": {
          "itemName": "Nom de l'article",
          "itemDescription": "Description de l'article",
          "room": "Piece",
          "itemType": "Type d'article",
          "articleTitle": "Titre du guide/article",
          "tags": "Etiquettes"
        },
        "placeholders": {
          "itemName": "Entrez le nom de l'article",
          "itemDescription": "Entrez une breve description de cet article (optionnel)",
          "articleTitle": "Entrez le titre du guide/article"
        },
        "hints": {
          "itemNameHint": "Ce nom apparaitra sur l'etiquette du code QR"
        }
      },
      "content": {
        "heading": "Contenu",
        "countLabel": "{count, plural, one {# element de contenu} other {# elements de contenu}}",
        "maxReached": "Maximum atteint",
        "emptyState": "Aucun contenu ajoute",
        "buttons": {
          "addContent": "Ajouter du contenu",
          "addMore": "Ajouter plus"
        }
      },
      "dragDrop": {
        "contentListLabel": "Elements de contenu - glissez pour reorganiser",
        "announcements": {
          "pickedUp": "Contenu {type} saisi. Position actuelle: {position} sur {total}. Utilisez les fleches pour deplacer.",
          "overPosition": "Au-dessus de la position {position}",
          "dropped": "Contenu {type} depose. Nouvelle position: {position} sur {total}",
          "unchanged": "Position inchangee.",
          "cancelled": "Glissement annule. Contenu remis a sa position d'origine."
        }
      },
      "buttons": {
        "save": "Enregistrer l'article",
        "saving": "Enregistrement..."
      },
      "success": {
        "heading": "Article enregistre !",
        "description": "Votre article a ete enregistre et est pret pour vos invites !",
        "qrCodeAlt": "Code QR pour {itemName}",
        "buttons": {
          "continue": "Continuer"
        }
      },
      "confirmRemove": {
        "heading": "Supprimer le dernier contenu ?",
        "message": "C'est le seul element de contenu. Le supprimer laissera cet article vide. Etes-vous sur de vouloir le supprimer ?",
        "buttons": {
          "keep": "Garder",
          "remove": "Supprimer"
        }
      },
      "errors": {
        "saveFailed": "Echec de l'enregistrement de l'article",
        "noData": "Aucune donnee d'article disponible. Veuillez commencer un nouvel article."
      },
      "announcements": {
        "saveSuccess": "Article enregistre avec succes",
        "saveError": "Erreur: {error}"
      },
      "tags": {
        "removeTag": "Supprimer l'etiquette {label}",
        "addTagLabel": "Ajouter une etiquette",
        "addTagButton": "Ajouter",
        "availableTags": "Etiquettes disponibles"
      }
    },
    "buttons": {
      "goBack": "Retour",
      "dismiss": "Fermer"
    }
  }
}
```

**Verification**:
- [ ] All keys present in fr.json
- [ ] Proper French grammar and hospitality terminology
- [ ] Pluralization format correct

---

#### Task 3.2: Generate Spanish Translations
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**File**: `/messages/es.json`

**Add Spanish translations** (sample provided, follow similar pattern as French):

```json
{
  "workflow": {
    "previewSaveStep": {
      "heading": "Vista previa y guardar",
      "itemDetails": {
        "sectionLabel": "Formulario de detalles del articulo",
        "labels": {
          "itemName": "Nombre del articulo",
          "itemDescription": "Descripcion del articulo",
          "room": "Habitacion",
          "itemType": "Tipo de articulo",
          "articleTitle": "Titulo de la guia/articulo",
          "tags": "Etiquetas"
        },
        "placeholders": {
          "itemName": "Ingrese el nombre del articulo",
          "itemDescription": "Ingrese una breve descripcion de este articulo (opcional)",
          "articleTitle": "Ingrese el titulo de la guia/articulo"
        }
      },
      "content": {
        "heading": "Contenido",
        "countLabel": "{count, plural, one {# pieza de contenido} other {# piezas de contenido}}",
        "maxReached": "Maximo alcanzado",
        "emptyState": "Aun no se ha agregado contenido",
        "buttons": {
          "addContent": "Agregar contenido",
          "addMore": "Agregar mas"
        }
      },
      "buttons": {
        "save": "Guardar articulo",
        "saving": "Guardando..."
      },
      "success": {
        "heading": "!Articulo guardado!",
        "description": "!Tu articulo ha sido guardado y esta listo para tus huespedes!",
        "qrCodeAlt": "Codigo QR para {itemName}",
        "buttons": {
          "continue": "Continuar"
        }
      },
      "confirmRemove": {
        "heading": "?Eliminar el ultimo contenido?",
        "message": "Esta es la unica pieza de contenido. Eliminarla dejara este articulo vacio. ?Estas seguro de que deseas eliminarlo?",
        "buttons": {
          "keep": "Mantener",
          "remove": "Eliminar"
        }
      },
      "errors": {
        "saveFailed": "Error al guardar el articulo",
        "noData": "No hay datos del articulo disponibles. Por favor, comienza un nuevo articulo."
      }
    },
    "buttons": {
      "goBack": "Volver",
      "dismiss": "Descartar"
    }
  }
}
```

---

#### Task 3.3: Generate German Translations
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**File**: `/messages/de.json`

**Add German translations** (note: German text is typically ~40% longer):

```json
{
  "workflow": {
    "previewSaveStep": {
      "heading": "Vorschau & Speichern",
      "itemDetails": {
        "sectionLabel": "Artikeldetails-Formular",
        "labels": {
          "itemName": "Artikelname",
          "itemDescription": "Artikelbeschreibung",
          "room": "Raum",
          "itemType": "Artikeltyp",
          "articleTitle": "Anleitungs-/Artikeltitel",
          "tags": "Schlagworter"
        },
        "placeholders": {
          "itemName": "Artikelnamen eingeben",
          "itemDescription": "Geben Sie eine kurze Beschreibung dieses Artikels ein (optional)",
          "articleTitle": "Anleitungs-/Artikeltitel eingeben"
        }
      },
      "content": {
        "heading": "Inhalt",
        "countLabel": "{count, plural, one {# Inhaltselement} other {# Inhaltselemente}}",
        "maxReached": "Maximum erreicht",
        "emptyState": "Noch kein Inhalt hinzugefugt",
        "buttons": {
          "addContent": "Inhalt hinzufugen",
          "addMore": "Mehr hinzufugen"
        }
      },
      "buttons": {
        "save": "Artikel speichern",
        "saving": "Wird gespeichert..."
      },
      "success": {
        "heading": "Artikel gespeichert!",
        "description": "Ihr Artikel wurde gespeichert und ist bereit fur Ihre Gaste!",
        "qrCodeAlt": "QR-Code fur {itemName}",
        "buttons": {
          "continue": "Weiter"
        }
      },
      "confirmRemove": {
        "heading": "Letzten Inhalt entfernen?",
        "message": "Dies ist das einzige Inhaltselement. Das Entfernen wird diesen Artikel leer lassen. Sind Sie sicher, dass Sie es entfernen mochten?",
        "buttons": {
          "keep": "Behalten",
          "remove": "Entfernen"
        }
      },
      "errors": {
        "saveFailed": "Artikel konnte nicht gespeichert werden",
        "noData": "Keine Artikeldaten verfugbar. Bitte starten Sie einen neuen Artikel."
      }
    },
    "buttons": {
      "goBack": "Zuruck",
      "dismiss": "Schliessen"
    }
  }
}
```

---

#### Task 3.4: Generate Dutch Translations
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**File**: `/messages/nl.json`

**Add Dutch translations**:

```json
{
  "workflow": {
    "previewSaveStep": {
      "heading": "Voorvertoning & Opslaan",
      "itemDetails": {
        "sectionLabel": "Artikeldetails formulier",
        "labels": {
          "itemName": "Artikelnaam",
          "itemDescription": "Artikelbeschrijving",
          "room": "Kamer",
          "itemType": "Artikeltype",
          "articleTitle": "Handleiding/Artikeltitel",
          "tags": "Tags"
        },
        "placeholders": {
          "itemName": "Voer artikelnaam in",
          "itemDescription": "Voer een korte beschrijving van dit artikel in (optioneel)",
          "articleTitle": "Voer handleiding/artikeltitel in"
        }
      },
      "content": {
        "heading": "Inhoud",
        "countLabel": "{count, plural, one {# inhoudsdeel} other {# inhoudsdelen}}",
        "maxReached": "Maximum bereikt",
        "emptyState": "Nog geen inhoud toegevoegd",
        "buttons": {
          "addContent": "Inhoud toevoegen",
          "addMore": "Meer toevoegen"
        }
      },
      "buttons": {
        "save": "Artikel opslaan",
        "saving": "Opslaan..."
      },
      "success": {
        "heading": "Artikel opgeslagen!",
        "description": "Uw artikel is opgeslagen en klaar voor uw gasten!",
        "qrCodeAlt": "QR-code voor {itemName}",
        "buttons": {
          "continue": "Doorgaan"
        }
      },
      "confirmRemove": {
        "heading": "Laatste inhoud verwijderen?",
        "message": "Dit is het enige inhoudsdeel. Verwijderen zal dit artikel leeg achterlaten. Weet u zeker dat u het wilt verwijderen?",
        "buttons": {
          "keep": "Behouden",
          "remove": "Verwijderen"
        }
      },
      "errors": {
        "saveFailed": "Artikel opslaan mislukt",
        "noData": "Geen artikelgegevens beschikbaar. Start een nieuw artikel."
      }
    },
    "buttons": {
      "goBack": "Terug",
      "dismiss": "Sluiten"
    }
  }
}
```

---

#### Task 3.5: Generate Italian Translations
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**File**: `/messages/it.json`

**Add Italian translations**:

```json
{
  "workflow": {
    "previewSaveStep": {
      "heading": "Anteprima e salvataggio",
      "itemDetails": {
        "sectionLabel": "Modulo dettagli articolo",
        "labels": {
          "itemName": "Nome articolo",
          "itemDescription": "Descrizione articolo",
          "room": "Stanza",
          "itemType": "Tipo di articolo",
          "articleTitle": "Titolo guida/articolo",
          "tags": "Tag"
        },
        "placeholders": {
          "itemName": "Inserisci il nome dell'articolo",
          "itemDescription": "Inserisci una breve descrizione di questo articolo (opzionale)",
          "articleTitle": "Inserisci il titolo della guida/articolo"
        }
      },
      "content": {
        "heading": "Contenuto",
        "countLabel": "{count, plural, one {# elemento di contenuto} other {# elementi di contenuto}}",
        "maxReached": "Massimo raggiunto",
        "emptyState": "Nessun contenuto aggiunto",
        "buttons": {
          "addContent": "Aggiungi contenuto",
          "addMore": "Aggiungi altro"
        }
      },
      "buttons": {
        "save": "Salva articolo",
        "saving": "Salvataggio..."
      },
      "success": {
        "heading": "Articolo salvato!",
        "description": "Il tuo articolo e stato salvato ed e pronto per i tuoi ospiti!",
        "qrCodeAlt": "Codice QR per {itemName}",
        "buttons": {
          "continue": "Continua"
        }
      },
      "confirmRemove": {
        "heading": "Rimuovere l'ultimo contenuto?",
        "message": "Questo e l'unico elemento di contenuto. Rimuoverlo lascera questo articolo vuoto. Sei sicuro di volerlo rimuovere?",
        "buttons": {
          "keep": "Mantieni",
          "remove": "Rimuovi"
        }
      },
      "errors": {
        "saveFailed": "Salvataggio articolo fallito",
        "noData": "Nessun dato articolo disponibile. Inizia un nuovo articolo."
      }
    },
    "buttons": {
      "goBack": "Torna indietro",
      "dismiss": "Chiudi"
    }
  }
}
```

---

### Phase 4: Optional Shared Component Updates

#### Task 4.1: Update ItemNameEditor Component (Optional)
**Priority**: Medium | **Complexity**: Low | **Story Points**: 1

**File**: `/src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`

**Note**: This task is optional if placeholder is already being passed from parent. If ItemNameEditor has internal hardcoded strings, update them.

**Strings to Check**:
- "Item Name" label (line ~69)
- Default placeholder (line ~47)
- "This name will appear on the QR code label" hint (line ~108)

**If strings are hardcoded, add translation prop and update**.

---

#### Task 4.2: Update TagsEditor Component (Optional)
**Priority**: Medium | **Complexity**: Low | **Story Points**: 1

**File**: `/src/components/ItemCreationWorkflow/components/shared/TagsEditor.tsx`

**Strings to Check**:
- "Remove {label} tag" aria-label (line ~84)
- "Add tag" button aria-label (line ~184)
- "Add Tag" button label (line ~188)
- "Available tags" dropdown aria-label (line ~209)

**If strings are hardcoded, add translation prop and update**.

---

### Phase 5: Testing and Validation

#### Task 5.1: Update Unit Tests
**Priority**: Required | **Complexity**: Medium | **Story Points**: 1

**Files to Update**:
- `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.test.tsx`
- `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.a11y.test.tsx`
- `/src/components/ItemCreationWorkflow/components/steps/__tests__/PreviewSaveStep.reorder.test.tsx`

**Updates Required**:
1. Add next-intl mock to test setup
2. Update component renders to include NextIntlClientProvider wrapper
3. Update assertions to check for translated strings or translation key calls

**Example Test Setup**:

```typescript
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/../messages/en.json';

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  );
};

describe('PreviewSaveStep', () => {
  it('renders the heading', () => {
    renderWithIntl(<PreviewSaveStep {...defaultProps} />);
    expect(screen.getByText('Preview & Save')).toBeInTheDocument();
  });
});
```

**Verification**:
- [ ] All existing tests pass
- [ ] Tests use proper i18n wrapping
- [ ] No missing translation warnings in test output

---

#### Task 5.2: Manual Testing in All Languages
**Priority**: Required | **Complexity**: Low | **Story Points**: 1

**Testing Checklist**:

**For each language (en, fr, es, de, nl, it):**

1. **Navigation**:
   - [ ] Back button aria-label is translated
   - [ ] "Preview & Save" heading displays correctly

2. **Item Details Section**:
   - [ ] All form labels display in correct language
   - [ ] All placeholders display in correct language
   - [ ] Form editing works (name, description, title changes)
   - [ ] Room and Item Type dropdowns work

3. **Content Section**:
   - [ ] "Content" heading displays correctly
   - [ ] Content count badge shows correct pluralization
   - [ ] "Maximum reached" appears when applicable
   - [ ] Empty state message displays correctly
   - [ ] "Add Content" / "Add More" buttons work

4. **Drag and Drop**:
   - [ ] Screen reader announcements work in selected language
   - [ ] Reordering functions correctly

5. **Save Operation**:
   - [ ] "Save Item" / "Saving..." states display correctly
   - [ ] Success overlay shows translated text
   - [ ] QR code alt text is translated with item name
   - [ ] "Continue" button works

6. **Error Handling**:
   - [ ] Error messages display in correct language
   - [ ] "Dismiss" button works
   - [ ] Guard state (no item data) displays correctly

7. **Confirmation Dialog**:
   - [ ] Dialog heading and message display correctly
   - [ ] "Keep" and "Remove" buttons work

8. **Visual Verification**:
   - [ ] No text overflow or clipping
   - [ ] Consistent button sizing
   - [ ] Layout integrity maintained

---

#### Task 5.3: Accessibility Testing
**Priority**: Required | **Complexity**: Medium | **Story Points**: 1

**Testing with Screen Readers**:

1. **Navigate to PreviewSaveStep in each language**
2. **Test form labels**: Verify labels are announced correctly
3. **Test drag-and-drop**:
   - Pick up content piece - verify announcement
   - Move over positions - verify announcements
   - Drop content - verify announcement
   - Cancel drag - verify announcement
4. **Test save operation**:
   - Verify "Item saved successfully" announced
   - Verify error announcements include error text
5. **Test confirmation dialog**: Verify dialog is announced as modal

---

## Verification Checklist

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Component compiles and renders
- [ ] All imports resolved

### Translations
- [ ] All 50 strings extracted to translation keys
- [ ] English translations complete and accurate
- [ ] French translations complete
- [ ] Spanish translations complete
- [ ] German translations complete
- [ ] Dutch translations complete
- [ ] Italian translations complete
- [ ] ICU pluralization syntax correct
- [ ] Interpolation placeholders correct

### Functionality
- [ ] Form editing works in all languages
- [ ] Dropdown selections work
- [ ] Drag-and-drop reordering works
- [ ] Save operation works
- [ ] Success overlay displays with QR code
- [ ] Error handling works
- [ ] Confirmation dialog works
- [ ] Guard state renders correctly

### Accessibility
- [ ] All aria-labels translated
- [ ] Screen reader announcements work
- [ ] Focus management intact
- [ ] Keyboard navigation works

### Visual
- [ ] No text overflow in any language
- [ ] Consistent spacing and alignment
- [ ] Button sizing consistent
- [ ] Layout integrity in all viewports

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Sub-component prop drilling complexity | All sub-components in same file, share t via props cleanly |
| Drag-drop announcement timing | Maintain existing timing, only change string content |
| Long German translations | CSS already uses flexible layout, test explicitly |
| Missing translations at runtime | Fallback to English configured in next-intl |
| Type safety for t() calls | Use `ReturnType<typeof useTranslations>` type |

---

## Estimated Total Effort

| Phase | Tasks | Story Points |
|-------|-------|--------------|
| Phase 1: Translation Keys | 1 | 1 |
| Phase 2: Component Updates | 13 | 13 |
| Phase 3: Non-English Translations | 5 | 5 |
| Phase 4: Optional Shared Components | 2 | 2 |
| Phase 5: Testing | 3 | 3 |
| **Total** | **24** | **24** |

---

## References

- [Overview Document](./REQ-379-update-previewsavestep-overview.md)
- [Implementation Plan](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](./gen_requests_epic2.md) - REQ-379
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2C - Item Creation Workflow, Task 2C.9*
*Last Modified: 2026-01-19 17:30 UTC*
