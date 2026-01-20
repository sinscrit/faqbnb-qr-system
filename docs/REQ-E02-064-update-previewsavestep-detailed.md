# Detailed Task Breakdown: REQ-E02-064 - Update PreviewSaveStep

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-064
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.9
**Estimated Size:** L (Large)
**Overview Document:** [REQ-E02-064-update-previewsavestep-overview.md](./REQ-E02-064-update-previewsavestep-overview.md)

---

## Executive Summary

This document provides granular, actionable tasks for localizing the PreviewSaveStep component, which is Step 7 (final user-visible step) of the ItemCreationWorkflow. The component contains approximately 50+ hardcoded English strings across 6 inline sub-components that must be extracted to translation keys.

**Primary File:** `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` (901 lines)

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation complete (next-intl installed and configured)
- [ ] `/messages/en.json` exists with base structure
- [ ] `workflow` namespace exists in translation files (REQ-E02-056)
- [ ] Understand the pattern used in other workflow steps (e.g., RoomSelectionStep, MediaCaptureStep)

---

## Task Breakdown

### Task 1: Add Translation Hook Import and Setup

**File:** `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
**Lines:** 28-61 (imports section)
**Estimate:** 0.25 SP
**Priority:** Critical - Must complete first

#### 1.1 Add import statement

**Location:** After line 28 (after `'use client';` and existing imports)

**Action:** Add the useTranslations import from next-intl

```typescript
// Add after line 49: import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
```

#### 1.2 Initialize translation hooks in main component

**Location:** Line 580-583 (inside PreviewSaveStep function, after props destructuring)

**Action:** Add translation hook initialization

```typescript
// Add after line 583 (after const [saveError, setSaveError] = useState...)
const t = useTranslations('workflow.steps.preview');
const tCommon = useTranslations('common');
```

**Verification:**
- [ ] Import statement added
- [ ] Hook initialized in main component
- [ ] No TypeScript errors

---

### Task 2: Update EmptyContentState Sub-Component

**Location:** Lines 103-121
**Estimate:** 0.25 SP
**Strings to extract:** 2

#### 2.1 Modify interface to accept translation function

**Current (line 103-105):**
```typescript
interface EmptyContentStateProps {
  onAddContent: () => void;
}
```

**Updated:**
```typescript
interface EmptyContentStateProps {
  onAddContent: () => void;
  t: ReturnType<typeof useTranslations<'workflow.steps.preview'>>;
}
```

#### 2.2 Update component to use translations

**Current (lines 107-121):**
```typescript
function EmptyContentState({ onAddContent }: EmptyContentStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <Plus className="w-12 h-12 text-gray-400 mb-3" aria-hidden="true" />
      <p className="text-[#717171] mb-4">No content added yet</p>
      <button
        type="button"
        onClick={onAddContent}
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
      >
        Add Content
      </button>
    </div>
  );
}
```

**Updated:**
```typescript
function EmptyContentState({ onAddContent, t }: EmptyContentStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <Plus className="w-12 h-12 text-gray-400 mb-3" aria-hidden="true" />
      <p className="text-[#717171] mb-4">{t('empty.message')}</p>
      <button
        type="button"
        onClick={onAddContent}
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
      >
        {t('empty.addButton')}
      </button>
    </div>
  );
}
```

#### 2.3 Update EmptyContentState call site

**Location:** Line 415 (inside ContentSection)

**Current:**
```typescript
<EmptyContentState onAddContent={onAddMore} />
```

**Updated:**
```typescript
<EmptyContentState onAddContent={onAddMore} t={t} />
```

**Note:** ContentSection will need to receive `t` from main component (see Task 5).

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.empty.message` | `"No content added yet"` |
| `workflow.steps.preview.empty.addButton` | `"Add Content"` |

**Verification:**
- [ ] Interface updated with `t` prop
- [ ] Both strings replaced with translation keys
- [ ] Call site updated to pass `t`

---

### Task 3: Update ItemDetailsDisplay Sub-Component

**Location:** Lines 138-203
**Estimate:** 0.25 SP
**Strings to extract:** 2 (labels)

#### 3.1 Modify interface to accept translation function

**Current (lines 138-144):**
```typescript
interface ItemDetailsDisplayProps {
  room: string;
  itemType: string;
  onUpdateRoom?: (room: RoomType) => void;
  onUpdateItemType?: (itemType: ItemType) => void;
  disabled?: boolean;
}
```

**Updated:**
```typescript
interface ItemDetailsDisplayProps {
  room: string;
  itemType: string;
  onUpdateRoom?: (room: RoomType) => void;
  onUpdateItemType?: (itemType: ItemType) => void;
  disabled?: boolean;
  t: ReturnType<typeof useTranslations<'workflow.steps.preview'>>;
}
```

#### 3.2 Update function signature and labels

**Location:** Line 146

**Current:**
```typescript
function ItemDetailsDisplay({ room, itemType, onUpdateRoom, onUpdateItemType, disabled }: ItemDetailsDisplayProps) {
```

**Updated:**
```typescript
function ItemDetailsDisplay({ room, itemType, onUpdateRoom, onUpdateItemType, disabled, t }: ItemDetailsDisplayProps) {
```

#### 3.3 Replace "Room" label (line 152)

**Current:**
```typescript
<label htmlFor="room-select" className="block text-sm font-medium text-[#222222]">
  Room
</label>
```

**Updated:**
```typescript
<label htmlFor="room-select" className="block text-sm font-medium text-[#222222]">
  {t('details.roomLabel')}
</label>
```

#### 3.4 Replace "Item Type" label (line 177-178)

**Current:**
```typescript
<label htmlFor="item-type-select" className="block text-sm font-medium text-[#222222]">
  Item Type
</label>
```

**Updated:**
```typescript
<label htmlFor="item-type-select" className="block text-sm font-medium text-[#222222]">
  {t('details.itemTypeLabel')}
</label>
```

#### 3.5 Update ItemDetailsDisplay call site

**Location:** Lines 293-299 (inside ItemDetailsSection)

**Current:**
```typescript
<ItemDetailsDisplay
  room={currentItem.room}
  itemType={currentItem.itemType}
  onUpdateRoom={onUpdateRoom}
  onUpdateItemType={onUpdateItemType}
  disabled={disabled}
/>
```

**Updated:**
```typescript
<ItemDetailsDisplay
  room={currentItem.room}
  itemType={currentItem.itemType}
  onUpdateRoom={onUpdateRoom}
  onUpdateItemType={onUpdateItemType}
  disabled={disabled}
  t={t}
/>
```

**Note:** ItemDetailsSection will need to receive `t` (see Task 4).

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.details.roomLabel` | `"Room"` |
| `workflow.steps.preview.details.itemTypeLabel` | `"Item Type"` |

**Verification:**
- [ ] Interface updated with `t` prop
- [ ] Both label strings replaced
- [ ] Call site updated

---

### Task 4: Update ItemDetailsSection Sub-Component

**Location:** Lines 209-345
**Estimate:** 0.5 SP
**Strings to extract:** 6

#### 4.1 Modify interface to accept translation function

**Current (lines 209-224):**
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
}
```

**Updated:**
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
  t: ReturnType<typeof useTranslations<'workflow.steps.preview'>>;
}
```

#### 4.2 Update function signature

**Location:** Line 226-235

**Add `t` to destructuring:**
```typescript
function ItemDetailsSection({
  currentItem,
  onUpdateItemName,
  onUpdateItemDescription,
  onUpdateArticleTitle,
  onUpdateRoom,
  onUpdateItemType,
  onUpdateTags,
  disabled,
  t,
}: ItemDetailsSectionProps) {
```

#### 4.3 Replace ItemNameEditor placeholder (line 258)

**Current:**
```typescript
<ItemNameEditor
  value={currentItem.specificItem}
  onChange={onUpdateItemName}
  disabled={disabled}
  maxLength={50}
  placeholder="Enter item name"
/>
```

**Updated:**
```typescript
<ItemNameEditor
  value={currentItem.specificItem}
  onChange={onUpdateItemName}
  disabled={disabled}
  maxLength={50}
  placeholder={t('details.itemNamePlaceholder')}
/>
```

#### 4.4 Replace "Item Description" label (lines 264-269)

**Current:**
```typescript
<label
  htmlFor="item-description-editor"
  className="block text-sm font-medium text-[#222222] mb-2"
>
  Item Description
</label>
```

**Updated:**
```typescript
<label
  htmlFor="item-description-editor"
  className="block text-sm font-medium text-[#222222] mb-2"
>
  {t('details.itemDescriptionLabel')}
</label>
```

#### 4.5 Replace item description placeholder (line 277)

**Current:**
```typescript
placeholder="Enter a brief description of this item (optional)"
```

**Updated:**
```typescript
placeholder={t('details.itemDescriptionPlaceholder')}
```

#### 4.6 Replace "Guide/Article Title" label (lines 304-308)

**Current:**
```typescript
<label
  htmlFor="article-title-editor"
  className="block text-sm font-medium text-[#222222] mb-2"
>
  Guide/Article Title
</label>
```

**Updated:**
```typescript
<label
  htmlFor="article-title-editor"
  className="block text-sm font-medium text-[#222222] mb-2"
>
  {t('details.articleTitleLabel')}
</label>
```

#### 4.7 Replace article title placeholder (line 317)

**Current:**
```typescript
placeholder="Enter guide/article title"
```

**Updated:**
```typescript
placeholder={t('details.articleTitlePlaceholder')}
```

#### 4.8 Replace "Tags" label (lines 333-334)

**Current:**
```typescript
<label className="block text-sm font-medium text-[#717171] mb-2">
  Tags
</label>
```

**Updated:**
```typescript
<label className="block text-sm font-medium text-[#717171] mb-2">
  {t('details.tagsLabel')}
</label>
```

#### 4.9 Update ItemDetailsSection call site

**Location:** Lines 781-790 (in main component render)

**Current:**
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
/>
```

**Updated:**
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
/>
```

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.details.itemNamePlaceholder` | `"Enter item name"` |
| `workflow.steps.preview.details.itemDescriptionLabel` | `"Item Description"` |
| `workflow.steps.preview.details.itemDescriptionPlaceholder` | `"Enter a brief description of this item (optional)"` |
| `workflow.steps.preview.details.articleTitleLabel` | `"Guide/Article Title"` |
| `workflow.steps.preview.details.articleTitlePlaceholder` | `"Enter guide/article title"` |
| `workflow.steps.preview.details.tagsLabel` | `"Tags"` |

**Verification:**
- [ ] Interface updated with `t` prop
- [ ] All 6 strings replaced
- [ ] Call site updated
- [ ] ItemDetailsDisplay call site updated with `t`

---

### Task 5: Update ContentSection Sub-Component

**Location:** Lines 351-480
**Estimate:** 0.5 SP
**Strings to extract:** 5

#### 5.1 Modify interface to accept translation function

**Current (lines 351-365):**
```typescript
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
}
```

**Updated:**
```typescript
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
  t: ReturnType<typeof useTranslations<'workflow.steps.preview'>>;
}
```

#### 5.2 Update function signature

**Location:** Line 367-381

**Add `t` to destructuring:**
```typescript
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
  t,
}: ContentSectionProps) {
```

#### 5.3 Replace "Content" header (lines 393-398)

**Current:**
```typescript
<h3
  id="content-section-heading"
  className="text-lg font-medium text-[#222222]"
>
  Content
</h3>
```

**Updated:**
```typescript
<h3
  id="content-section-heading"
  className="text-lg font-medium text-[#222222]"
>
  {t('content.title')}
</h3>
```

#### 5.4 Replace aria-label for count badge (lines 399-404)

**Current:**
```typescript
<span
  className="px-2 py-0.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
  aria-label={`${contentCount} content pieces`}
>
  {contentCount}
</span>
```

**Updated:**
```typescript
<span
  className="px-2 py-0.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
  aria-label={t('content.countLabel', { count: contentCount })}
>
  {contentCount}
</span>
```

#### 5.5 Replace "Maximum reached" (lines 406-410)

**Current:**
```typescript
{contentCount >= maxContentPieces && (
  <span className="text-sm text-amber-600 font-medium">
    Maximum reached
  </span>
)}
```

**Updated:**
```typescript
{contentCount >= maxContentPieces && (
  <span className="text-sm text-amber-600 font-medium">
    {t('content.maxReached')}
  </span>
)}
```

#### 5.6 Replace drag hint aria-label (lines 430-434)

**Current:**
```typescript
<div
  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
  role="list"
  aria-label="Content pieces - drag to reorder"
>
```

**Updated:**
```typescript
<div
  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
  role="list"
  aria-label={t('content.dragHint')}
>
```

#### 5.7 Replace "Add More" button (lines 463-476)

**Current:**
```typescript
<button
  type="button"
  onClick={onAddMore}
  disabled={disabled}
  className={cn(
    'mt-4 text-sm text-[#FF385C] hover:text-[#E31C5F]',
    'focus:outline-none focus:underline focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'flex items-center gap-1'
  )}
>
  <Plus className="w-4 h-4" aria-hidden="true" />
  Add More
</button>
```

**Updated:**
```typescript
<button
  type="button"
  onClick={onAddMore}
  disabled={disabled}
  className={cn(
    'mt-4 text-sm text-[#FF385C] hover:text-[#E31C5F]',
    'focus:outline-none focus:underline focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2 rounded',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'flex items-center gap-1'
  )}
>
  <Plus className="w-4 h-4" aria-hidden="true" />
  {t('content.addMore')}
</button>
```

#### 5.8 Update ContentSection call site

**Location:** Lines 793-807 (in main component render)

**Current:**
```typescript
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
/>
```

**Updated:**
```typescript
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
  t={t}
/>
```

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.content.title` | `"Content"` |
| `workflow.steps.preview.content.countLabel` | `"{count, plural, one {# content piece} other {# content pieces}}"` |
| `workflow.steps.preview.content.maxReached` | `"Maximum reached"` |
| `workflow.steps.preview.content.dragHint` | `"Content pieces - drag to reorder"` |
| `workflow.steps.preview.content.addMore` | `"Add More"` |

**Verification:**
- [ ] Interface updated with `t` prop
- [ ] All 5 strings replaced
- [ ] Pluralization works for countLabel (test with 0, 1, 5 content pieces)
- [ ] Call site updated
- [ ] EmptyContentState call inside ContentSection updated with `t`

---

### Task 6: Update SuccessOverlay Sub-Component

**Location:** Lines 486-557
**Estimate:** 0.25 SP
**Strings to extract:** 4

#### 6.1 Modify interface to accept translation function

**Current (lines 502-513):**
```typescript
interface SuccessOverlayProps {
  itemName: string;
  qrCodeUrl: string;
  onContinue: () => void;
}
```

**Updated:**
```typescript
interface SuccessOverlayProps {
  itemName: string;
  qrCodeUrl: string;
  onContinue: () => void;
  t: ReturnType<typeof useTranslations<'workflow.steps.preview'>>;
}
```

#### 6.2 Update function signature

**Location:** Line 515

**Current:**
```typescript
function SuccessOverlay({ itemName, qrCodeUrl, onContinue }: SuccessOverlayProps) {
```

**Updated:**
```typescript
function SuccessOverlay({ itemName, qrCodeUrl, onContinue, t }: SuccessOverlayProps) {
```

#### 6.3 Replace "Item Saved!" title (lines 525-527)

**Current:**
```typescript
<h2 className="text-2xl font-semibold text-[#222222] mb-4">
  Item Saved!
</h2>
```

**Updated:**
```typescript
<h2 className="text-2xl font-semibold text-[#222222] mb-4">
  {t('success.title')}
</h2>
```

#### 6.4 Replace QR code alt text (lines 531-534)

**Current:**
```typescript
<img
  src={qrCodeUrl}
  alt={`QR code for ${itemName}`}
  className="w-40 h-40"
/>
```

**Updated:**
```typescript
<img
  src={qrCodeUrl}
  alt={t('success.qrAlt', { itemName })}
  className="w-40 h-40"
/>
```

#### 6.5 Replace success message (lines 542-544)

**Current:**
```typescript
<p className="text-[#717171] mb-8">
  Your item has been saved and is ready for your guests!
</p>
```

**Updated:**
```typescript
<p className="text-[#717171] mb-8">
  {t('success.message')}
</p>
```

#### 6.6 Replace "Continue" button (lines 547-551)

**Current:**
```typescript
<button
  type="button"
  onClick={onContinue}
  className="px-8 py-3 bg-[#FF385C] text-white rounded-lg font-medium hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
>
  Continue
</button>
```

**Updated:**
```typescript
<button
  type="button"
  onClick={onContinue}
  className="px-8 py-3 bg-[#FF385C] text-white rounded-lg font-medium hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
>
  {t('success.continueButton')}
</button>
```

#### 6.7 Update SuccessOverlay call site

**Location:** Lines 729-733 (inside showSuccess conditional render)

**Current:**
```typescript
<SuccessOverlay
  itemName={savedResult.itemName}
  qrCodeUrl={savedResult.qrCodeUrl}
  onContinue={handleContinue}
/>
```

**Updated:**
```typescript
<SuccessOverlay
  itemName={savedResult.itemName}
  qrCodeUrl={savedResult.qrCodeUrl}
  onContinue={handleContinue}
  t={t}
/>
```

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.success.title` | `"Item Saved!"` |
| `workflow.steps.preview.success.qrAlt` | `"QR code for {itemName}"` |
| `workflow.steps.preview.success.message` | `"Your item has been saved and is ready for your guests!"` |
| `workflow.steps.preview.success.continueButton` | `"Continue"` |

**Verification:**
- [ ] Interface updated with `t` prop
- [ ] All 4 strings replaced
- [ ] QR alt text correctly interpolates itemName
- [ ] Call site updated

---

### Task 7: Update DnD Announcements

**Location:** Lines 635-662
**Estimate:** 0.5 SP
**Strings to extract:** 6

**Note:** The `announcements` object is defined inside the main component before the sub-components are rendered. The `t` function is available here.

#### 7.1 Update the announcements useMemo

**Current (lines 636-662):**
```typescript
const announcements: Announcements = useMemo(() => ({
  onDragStart({ active }) {
    const piece = contentArray.find(c => c.id === active.id);
    const position = contentArray.findIndex(c => c.id === active.id) + 1;
    const typeName = piece ? `${piece.type} content` : 'content piece';
    return `Picked up ${typeName}. Current position: ${position} of ${contentArray.length}. Use arrow keys to move.`;
  },
  onDragOver({ over }) {
    if (over) {
      const position = contentArray.findIndex(c => c.id === over.id) + 1;
      return `Over position ${position}`;
    }
    return undefined;
  },
  onDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      const piece = contentArray.find(c => c.id === active.id);
      const typeName = piece ? `${piece.type} content` : 'content piece';
      const newPosition = contentArray.findIndex(c => c.id === over.id) + 1;
      return `Dropped ${typeName}. New position: ${newPosition} of ${contentArray.length}`;
    }
    return 'Position unchanged.';
  },
  onDragCancel() {
    return 'Drag cancelled. Content returned to original position.';
  },
}), [contentArray]);
```

**Updated:**
```typescript
const announcements: Announcements = useMemo(() => ({
  onDragStart({ active }) {
    const piece = contentArray.find(c => c.id === active.id);
    const position = contentArray.findIndex(c => c.id === active.id) + 1;
    const typeName = piece
      ? t('dnd.contentType', { type: piece.type })
      : t('dnd.contentPiece');
    return t('dnd.pickedUp', { typeName, position, total: contentArray.length });
  },
  onDragOver({ over }) {
    if (over) {
      const position = contentArray.findIndex(c => c.id === over.id) + 1;
      return t('dnd.overPosition', { position });
    }
    return undefined;
  },
  onDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      const piece = contentArray.find(c => c.id === active.id);
      const typeName = piece
        ? t('dnd.contentType', { type: piece.type })
        : t('dnd.contentPiece');
      const newPosition = contentArray.findIndex(c => c.id === over.id) + 1;
      return t('dnd.dropped', { typeName, position: newPosition, total: contentArray.length });
    }
    return t('dnd.unchanged');
  },
  onDragCancel() {
    return t('dnd.cancelled');
  },
}), [contentArray, t]);
```

**Important:** Add `t` to the dependency array.

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.dnd.contentType` | `"{type} content"` |
| `workflow.steps.preview.dnd.contentPiece` | `"content piece"` |
| `workflow.steps.preview.dnd.pickedUp` | `"Picked up {typeName}. Current position: {position} of {total}. Use arrow keys to move."` |
| `workflow.steps.preview.dnd.overPosition` | `"Over position {position}"` |
| `workflow.steps.preview.dnd.dropped` | `"Dropped {typeName}. New position: {position} of {total}"` |
| `workflow.steps.preview.dnd.unchanged` | `"Position unchanged."` |
| `workflow.steps.preview.dnd.cancelled` | `"Drag cancelled. Content returned to original position."` |

**Verification:**
- [ ] All 7 announcement strings use translation keys
- [ ] `t` added to useMemo dependency array
- [ ] Screen reader announces correctly during drag operations

---

### Task 8: Update Header and Navigation

**Location:** Lines 760-778
**Estimate:** 0.25 SP
**Strings to extract:** 2

#### 8.1 Replace "Go back" aria-label (line 771)

**Current:**
```typescript
aria-label="Go back"
```

**Updated:**
```typescript
aria-label={t('header.backAriaLabel')}
```

#### 8.2 Replace "Preview & Save" title (lines 775-777)

**Current:**
```typescript
<h2 className="text-xl font-semibold text-[#222222]">
  Preview & Save
</h2>
```

**Updated:**
```typescript
<h2 className="text-xl font-semibold text-[#222222]">
  {t('header.title')}
</h2>
```

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.header.title` | `"Preview & Save"` |
| `workflow.steps.preview.header.backAriaLabel` | `"Go back"` |

**Verification:**
- [ ] Page title localized
- [ ] Back button aria-label localized

---

### Task 9: Update Save Button States

**Location:** Lines 823-850
**Estimate:** 0.25 SP
**Strings to extract:** 2

#### 9.1 Replace "Saving..." text (lines 839-843)

**Current:**
```typescript
{isSaving ? (
  <>
    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
    Saving...
  </>
```

**Updated:**
```typescript
{isSaving ? (
  <>
    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
    {t('buttons.saving')}
  </>
```

#### 9.2 Replace "Save Item" text (lines 844-848)

**Current:**
```typescript
) : (
  <>
    <Check className="w-5 h-5" aria-hidden="true" />
    Save Item
  </>
)}
```

**Updated:**
```typescript
) : (
  <>
    <Check className="w-5 h-5" aria-hidden="true" />
    {t('buttons.saveItem')}
  </>
)}
```

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.buttons.saveItem` | `"Save Item"` |
| `workflow.steps.preview.buttons.saving` | `"Saving..."` |

**Verification:**
- [ ] Save button shows "Save Item" normally
- [ ] Save button shows "Saving..." during save operation

---

### Task 10: Update Screen Reader Announcements

**Location:** Lines 852-856
**Estimate:** 0.25 SP
**Strings to extract:** 2

#### 10.1 Replace success announcement (line 854)

**Current:**
```typescript
{showSuccess && 'Item saved successfully'}
```

**Updated:**
```typescript
{showSuccess && t('announcements.saved')}
```

#### 10.2 Replace error announcement (line 855)

**Current:**
```typescript
{saveError && `Error: ${saveError}`}
```

**Updated:**
```typescript
{saveError && t('announcements.error', { error: saveError })}
```

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.announcements.saved` | `"Item saved successfully"` |
| `workflow.steps.preview.announcements.error` | `"Error: {error}"` |

**Verification:**
- [ ] Screen readers announce "Item saved successfully" after successful save
- [ ] Screen readers announce error message when save fails

---

### Task 11: Update Error Display

**Location:** Lines 809-821
**Estimate:** 0.25 SP
**Strings to extract:** 1

#### 11.1 Replace "Dismiss" button (lines 813-818)

**Current:**
```typescript
<button
  type="button"
  onClick={() => setSaveError(null)}
  className="mt-2 text-red-700 underline text-sm hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
>
  Dismiss
</button>
```

**Updated:**
```typescript
<button
  type="button"
  onClick={() => setSaveError(null)}
  className="mt-2 text-red-700 underline text-sm hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
>
  {tCommon('actions.dismiss')}
</button>
```

**Note:** Uses `tCommon` for shared action labels.

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `common.actions.dismiss` | `"Dismiss"` |

**Verification:**
- [ ] Dismiss button text localized

---

### Task 12: Update Removal Confirmation Dialog

**Location:** Lines 858-895
**Estimate:** 0.25 SP
**Strings to extract:** 4

#### 12.1 Replace dialog title (lines 867-871)

**Current:**
```typescript
<h3
  id="remove-confirm-title"
  className="text-lg font-semibold text-[#222222] mb-2"
>
  Remove Last Content?
</h3>
```

**Updated:**
```typescript
<h3
  id="remove-confirm-title"
  className="text-lg font-semibold text-[#222222] mb-2"
>
  {t('dialogs.removeLastContent.title')}
</h3>
```

#### 12.2 Replace dialog message (lines 873-876)

**Current:**
```typescript
<p className="text-[#717171] mb-6">
  This is the only piece of content. Removing it will leave this item empty.
  Are you sure you want to remove it?
</p>
```

**Updated:**
```typescript
<p className="text-[#717171] mb-6">
  {t('dialogs.removeLastContent.message')}
</p>
```

#### 12.3 Replace "Keep" button (lines 878-882)

**Current:**
```typescript
<button
  type="button"
  onClick={handleCancelRemove}
  className="px-4 py-2 text-[#222222] border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
>
  Keep
</button>
```

**Updated:**
```typescript
<button
  type="button"
  onClick={handleCancelRemove}
  className="px-4 py-2 text-[#222222] border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
>
  {t('dialogs.removeLastContent.keepButton')}
</button>
```

#### 12.4 Replace "Remove" button (lines 885-889)

**Current:**
```typescript
<button
  type="button"
  onClick={handleConfirmRemove}
  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
>
  Remove
</button>
```

**Updated:**
```typescript
<button
  type="button"
  onClick={handleConfirmRemove}
  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
>
  {t('dialogs.removeLastContent.removeButton')}
</button>
```

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.dialogs.removeLastContent.title` | `"Remove Last Content?"` |
| `workflow.steps.preview.dialogs.removeLastContent.message` | `"This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?"` |
| `workflow.steps.preview.dialogs.removeLastContent.keepButton` | `"Keep"` |
| `workflow.steps.preview.dialogs.removeLastContent.removeButton` | `"Remove"` |

**Verification:**
- [ ] Dialog title localized
- [ ] Dialog message localized
- [ ] Both buttons localized

---

### Task 13: Update No Item Data State

**Location:** Lines 741-756
**Estimate:** 0.25 SP
**Strings to extract:** 2

#### 13.1 Replace empty state message (lines 744-746)

**Current:**
```typescript
<p className="text-[#717171] text-center">
  No item data available. Please start a new item.
</p>
```

**Updated:**
```typescript
<p className="text-[#717171] text-center">
  {t('errors.noItemData')}
</p>
```

#### 13.2 Replace "Go Back" button (lines 747-752)

**Current:**
```typescript
<button
  type="button"
  onClick={onCancel}
  className="px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
>
  Go Back
</button>
```

**Updated:**
```typescript
<button
  type="button"
  onClick={onCancel}
  className="px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-2"
>
  {tCommon('actions.goBack')}
</button>
```

**Translation Keys:**
| Key | English Value |
|-----|---------------|
| `workflow.steps.preview.errors.noItemData` | `"No item data available. Please start a new item."` |
| `common.actions.goBack` | `"Go Back"` |

**Verification:**
- [ ] Empty state message localized
- [ ] Go Back button localized

---

### Task 14: Add All Translation Keys to Messages File

**File:** `/messages/en.json`
**Estimate:** 0.5 SP
**Priority:** Critical

#### 14.1 Add the complete translation structure

Add the following to the `workflow.steps` section of `/messages/en.json`:

```json
{
  "workflow": {
    "steps": {
      "preview": {
        "header": {
          "title": "Preview & Save",
          "backAriaLabel": "Go back"
        },
        "details": {
          "roomLabel": "Room",
          "itemTypeLabel": "Item Type",
          "itemNamePlaceholder": "Enter item name",
          "itemDescriptionLabel": "Item Description",
          "itemDescriptionPlaceholder": "Enter a brief description of this item (optional)",
          "articleTitleLabel": "Guide/Article Title",
          "articleTitlePlaceholder": "Enter guide/article title",
          "tagsLabel": "Tags"
        },
        "empty": {
          "message": "No content added yet",
          "addButton": "Add Content"
        },
        "content": {
          "title": "Content",
          "countLabel": "{count, plural, one {# content piece} other {# content pieces}}",
          "maxReached": "Maximum reached",
          "dragHint": "Content pieces - drag to reorder",
          "addMore": "Add More"
        },
        "buttons": {
          "saveItem": "Save Item",
          "saving": "Saving..."
        },
        "success": {
          "title": "Item Saved!",
          "qrAlt": "QR code for {itemName}",
          "message": "Your item has been saved and is ready for your guests!",
          "continueButton": "Continue"
        },
        "dnd": {
          "contentType": "{type} content",
          "contentPiece": "content piece",
          "pickedUp": "Picked up {typeName}. Current position: {position} of {total}. Use arrow keys to move.",
          "overPosition": "Over position {position}",
          "dropped": "Dropped {typeName}. New position: {position} of {total}",
          "unchanged": "Position unchanged.",
          "cancelled": "Drag cancelled. Content returned to original position."
        },
        "dialogs": {
          "removeLastContent": {
            "title": "Remove Last Content?",
            "message": "This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?",
            "keepButton": "Keep",
            "removeButton": "Remove"
          }
        },
        "errors": {
          "noItemData": "No item data available. Please start a new item."
        },
        "announcements": {
          "saved": "Item saved successfully",
          "error": "Error: {error}"
        }
      }
    }
  }
}
```

#### 14.2 Ensure common namespace keys exist

Verify these keys exist in `common` namespace (or add them):

```json
{
  "common": {
    "actions": {
      "dismiss": "Dismiss",
      "goBack": "Go Back"
    }
  }
}
```

**Verification:**
- [ ] All preview step keys exist in `/messages/en.json`
- [ ] Common actions keys exist
- [ ] JSON validates without syntax errors
- [ ] ICU format used correctly for pluralization
- [ ] All variable interpolations correctly formatted

---

## Implementation Order Summary

Execute tasks in this order:

1. **Task 1:** Add import and hook setup (foundation)
2. **Task 14:** Add translation keys to messages file (needed for testing)
3. **Task 2:** EmptyContentState
4. **Task 3:** ItemDetailsDisplay
5. **Task 4:** ItemDetailsSection (includes updates to ItemDetailsDisplay call site)
6. **Task 5:** ContentSection (includes updates to EmptyContentState call site)
7. **Task 6:** SuccessOverlay
8. **Task 7:** DnD Announcements
9. **Task 8:** Header and Navigation
10. **Task 9:** Save Button States
11. **Task 10:** Screen Reader Announcements
12. **Task 11:** Error Display
13. **Task 12:** Removal Confirmation Dialog
14. **Task 13:** No Item Data State

---

## Verification Checklist

### Build Verification

```bash
npm run build
```

- [ ] No TypeScript errors
- [ ] No missing translation key warnings
- [ ] Build completes successfully

### Runtime Verification

```bash
npm run dev
```

Navigate to item creation workflow, reach PreviewSaveStep:

- [ ] All text displays in English
- [ ] No console errors related to translations
- [ ] No `t(...) is not a function` errors

### Functional Testing

**Empty State:**
- [ ] "No content added yet" text displays
- [ ] "Add Content" button displays and works

**Item Details:**
- [ ] All field labels display correctly
- [ ] All placeholders display correctly
- [ ] Room and Item Type dropdowns work

**Content Section:**
- [ ] "Content" header displays
- [ ] Count badge shows correct number
- [ ] "Maximum reached" appears at limit
- [ ] "Add More" button displays

**Drag and Drop:**
- [ ] Screen reader announces on drag start
- [ ] Screen reader announces position during drag
- [ ] Screen reader announces on drop
- [ ] Screen reader announces on cancel

**Save Flow:**
- [ ] "Save Item" button displays
- [ ] "Saving..." displays during save
- [ ] Success overlay shows "Item Saved!"
- [ ] QR code alt text is correct
- [ ] Success message displays
- [ ] "Continue" button works

**Error States:**
- [ ] Error message displays with "Dismiss" button
- [ ] "No item data" state shows correctly
- [ ] "Go Back" button works

**Dialogs:**
- [ ] Removal confirmation dialog title displays
- [ ] Dialog message displays
- [ ] "Keep" and "Remove" buttons display

### Accessibility Testing

- [ ] All aria-labels announce correctly
- [ ] Screen reader navigation works
- [ ] Drag-and-drop keyboard navigation works
- [ ] Focus management works in dialogs

---

## Translation Key Summary

| Namespace Path | Key Count |
|----------------|-----------|
| `workflow.steps.preview.header` | 2 |
| `workflow.steps.preview.details` | 8 |
| `workflow.steps.preview.empty` | 2 |
| `workflow.steps.preview.content` | 5 |
| `workflow.steps.preview.buttons` | 2 |
| `workflow.steps.preview.success` | 4 |
| `workflow.steps.preview.dnd` | 7 |
| `workflow.steps.preview.dialogs.removeLastContent` | 4 |
| `workflow.steps.preview.errors` | 1 |
| `workflow.steps.preview.announcements` | 2 |
| `common.actions` | 2 (reused) |
| **Total Unique Keys** | **37** |

---

## Files Modified

| File | Type | Description |
|------|------|-------------|
| `/src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx` | Modified | Add translations to all 6 sub-components and main component |
| `/messages/en.json` | Modified | Add 37 new translation keys |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Sub-component prop drilling adds complexity | Clear interface definitions, consistent `t` prop pattern |
| DnD announcements break accessibility | Comprehensive screen reader testing |
| Pluralization doesn't render correctly | Test with 0, 1, and 5+ content pieces |
| TypeScript type errors with useTranslations | Use proper ReturnType typing for `t` prop |

---

## Acceptance Criteria (from REQ-E02-064)

- [x] All hardcoded strings in PreviewSaveStep component are extracted and replaced with translation keys
- [x] useTranslations hook from next-intl is implemented with the 'workflow' namespace
- [x] Preview section headers and field labels render in the selected language
- [x] Save, cancel, and navigation buttons display translated text
- [x] Validation messages and error states show localized content
- [x] Success and error notifications appear in the user's language
- [x] Confirmation dialogs and prompts use translated strings
- [x] Component follows the same translation pattern as other workflow steps
- [x] No English fallback text is visible when viewing in any supported language

---

## References

- [Overview Document](./REQ-E02-064-update-previewsavestep-overview.md)
- [Implementation Plan: L10N Epic 2](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Documentation](./gen_requests_epic2.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
*Task 2C.9: Update PreviewSaveStep*
