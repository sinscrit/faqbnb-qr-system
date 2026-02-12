# REQ-257: Item Edit Flow Usability Improvements - Detailed Tasks

**Last Modified**: 2026-02-10 16:30
**Status**: Implementation Complete
**Request**: REQ-257
**Overview Document**: `/docs/req-257-item-edit-flow-overview.md`

---

## Issue 1: Direct Media Capture in AddContentModal

The "Add Content" modal currently only supports uploading existing files. This issue adds options to take photos and record videos directly using the device camera via HTML5 `capture` attribute.

### Subtask 1.1: Add Translation Keys for Media Capture Options
- [x] Add translation keys for "Take Photo" and "Record Video" options to all 6 locale files
- Target files:
  - `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/messages/en.json`
  - `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/messages/fr.json`
  - `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/messages/es.json`
  - `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/messages/de.json`
  - `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/messages/nl.json`
  - `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/messages/it.json`
- Implementation: Add the following keys under `content.addModal.types`:
  ```json
  "takePhoto": "Take Photo",
  "takePhotoHint": "Use device camera",
  "recordVideo": "Record Video",
  "recordVideoHint": "Use device camera"
  ```
- Verification: Run `npm run build` to verify JSON is valid

### Subtask 1.2: Add Content Type for Photo Capture
- [x] Add "Take Photo" button to the content type selection grid in AddContentModal
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/InstructionEditor/components/AddContentModal.tsx`
- Implementation:
  1. Add `'photo-capture'` to `ContentTypeSelection` type (line 25)
  2. Add new button in the selection grid (after the Link button, around line 194):
     ```tsx
     {/* Take Photo */}
     <button
       type="button"
       onClick={() => handleSelectType('photo-capture')}
       className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#222222] hover:bg-gray-50 transition-colors"
     >
       <Camera className="w-8 h-8 text-[#222222]" />
       <span className="font-medium text-[#222222]">{tContent('types.takePhoto')}</span>
       <span className="text-sm text-[#717171]">{tContent('types.takePhotoHint')}</span>
     </button>
     ```
- Verification: Modal displays 4 options in a 2x2 grid with "Take Photo" option visible

### Subtask 1.3: Add Content Type for Video Capture
- [x] Add "Record Video" button to the content type selection grid in AddContentModal
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/InstructionEditor/components/AddContentModal.tsx`
- Implementation:
  1. Add `'video-capture'` to `ContentTypeSelection` type (line 25)
  2. Add new button in the selection grid:
     ```tsx
     {/* Record Video */}
     <button
       type="button"
       onClick={() => handleSelectType('video-capture')}
       className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#222222] hover:bg-gray-50 transition-colors"
     >
       <Video className="w-8 h-8 text-[#222222]" />
       <span className="font-medium text-[#222222]">{tContent('types.recordVideo')}</span>
       <span className="text-sm text-[#717171]">{tContent('types.recordVideoHint')}</span>
     </button>
     ```
- Verification: Modal displays 5 options with "Record Video" option visible

### Subtask 1.4: Update Grid Layout for 5 Content Types
- [x] Adjust the selection grid layout to accommodate 5 content types properly
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/InstructionEditor/components/AddContentModal.tsx`
- Implementation:
  1. Change grid from `grid-cols-2` to a responsive layout
  2. Update layout so Take Photo and Record Video are in a 2-column layout
  3. Remove `col-span-2` from the Upload File button (line 200)
  4. Final order: Text, Link, Take Photo, Record Video, Upload File (spans full width)
- Verification: All 5 buttons display in an aesthetically pleasing grid

### Subtask 1.5: Add Photo Capture Create Step UI
- [x] Add the create step for photo capture using HTML5 capture attribute
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/InstructionEditor/components/AddContentModal.tsx`
- Implementation: Add new condition block after the file create step (around line 296):
  ```tsx
  {step === 'create' && selectedType === 'photo-capture' && (
    <div className="space-y-4">
      <div>
        <label htmlFor="photo-capture" className="block text-sm font-medium text-[#717171] mb-2">
          {tContent('form.photoLabel')}
        </label>
        <input
          id="photo-capture"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-[#222222] hover:file:bg-gray-200"
        />
        {selectedFile && (
          <p className="text-sm text-[#717171] mt-2">
            {tContent('form.selectedFile', { fileName: selectedFile.name, fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) })}
          </p>
        )}
      </div>
    </div>
  )}
  ```
- Add translation key `form.photoLabel`: "Capture Photo *"
- Verification: Clicking "Take Photo" shows file input with camera capture on mobile

### Subtask 1.6: Add Video Capture Create Step UI
- [x] Add the create step for video capture using HTML5 capture attribute
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/InstructionEditor/components/AddContentModal.tsx`
- Implementation: Add new condition block:
  ```tsx
  {step === 'create' && selectedType === 'video-capture' && (
    <div className="space-y-4">
      <div>
        <label htmlFor="video-capture" className="block text-sm font-medium text-[#717171] mb-2">
          {tContent('form.videoLabel')}
        </label>
        <input
          id="video-capture"
          type="file"
          onChange={handleFileChange}
          accept="video/*"
          capture="environment"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-[#222222] hover:file:bg-gray-200"
        />
        {selectedFile && (
          <p className="text-sm text-[#717171] mt-2">
            {tContent('form.selectedFile', { fileName: selectedFile.name, fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) })}
          </p>
        )}
      </div>
    </div>
  )}
  ```
- Add translation key `form.videoLabel`: "Record Video *"
- Verification: Clicking "Record Video" shows file input with video capture on mobile

### Subtask 1.7: Update handleSubmit for Photo/Video Capture Types
- [x] Extend handleSubmit to handle photo-capture and video-capture content types
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/InstructionEditor/components/AddContentModal.tsx`
- Implementation: Update the handleSubmit function (around line 117-131) to handle new types:
  ```tsx
  } else if ((selectedType === 'photo-capture' || selectedType === 'video-capture') && selectedFile) {
    const newContent: ContentPieceState = {
      id: crypto.randomUUID(),
      type: selectedType === 'photo-capture' ? 'photo' : 'video',
      title: selectedFile.name,
      url: '', // Will be filled after upload
      thumbnailUrl: null,
      displayOrder: currentContentCount,
      isNew: true,
      file: selectedFile,
    };
    onAddContent(newContent);
    handleClose();
  }
  ```
- Verification: Captured media is properly passed to parent component

### Subtask 1.8: Update isFormValid for New Content Types
- [x] Update form validation to include photo-capture and video-capture types
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/InstructionEditor/components/AddContentModal.tsx`
- Implementation: Update isFormValid function (around line 134-139):
  ```tsx
  const isFormValid = () => {
    if (selectedType === 'text') return textContent.trim().length > 0;
    if (selectedType === 'url') return urlValue.trim().length > 0;
    if (selectedType === 'file') return selectedFile !== null;
    if (selectedType === 'photo-capture') return selectedFile !== null;
    if (selectedType === 'video-capture') return selectedFile !== null;
    return false;
  };
  ```
- Verification: Add button enables when file is selected in capture modes

### Subtask 1.9: Add Translation Keys for Form Labels
- [x] Add form label translation keys for photo and video capture to all 6 locales
- Target files: All 6 message files (`messages/{en,fr,es,de,nl,it}.json`)
- Implementation: Add under `content.addModal.form`:
  ```json
  "photoLabel": "Capture Photo *",
  "videoLabel": "Record Video *"
  ```
- Translations:
  - fr: "Prendre une photo *", "Enregistrer une vidéo *"
  - es: "Capturar foto *", "Grabar video *"
  - de: "Foto aufnehmen *", "Video aufnehmen *"
  - nl: "Foto maken *", "Video opnemen *"
  - it: "Scatta foto *", "Registra video *"
- Verification: Labels display correctly in all languages

---

## Issue 2: Tappable List Item Rows for Editing

Currently, clicking an item row opens a preview. The PRD requires row clicks to navigate to the edit form instead.

### Subtask 2.1: Modify handleRowClick to Trigger Edit
- [x] Change row click behavior from preview to edit in normal (non-selection) mode
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemManager/components/ItemRow.tsx`
- Implementation: Modify handleRowClick function (lines 312-338):
  ```tsx
  // Handle row click (for edit or selection)
  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Ignore clicks on interactive elements
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('[role="menu"]') ||
      target.closest('[data-inline-edit]')
    ) {
      return;
    }

    // Ignore if this was a long-press (prevents click after long-press)
    if (isLongPress()) {
      return;
    }

    // In selection mode, toggle selection instead of edit
    if (isSelectionMode) {
      onSelectionChange(item.id, !isSelected);
      return;
    }

    // Normal mode: open edit form (changed from preview)
    onEdit(item);
  };
  ```
- Verification: Clicking an item row navigates to the edit form

### Subtask 2.2: Update handleKeyDown for Edit Behavior
- [x] Update keyboard navigation (Enter/Space) to trigger edit instead of preview
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemManager/components/ItemRow.tsx`
- Implementation: Modify handleKeyDown function (lines 341-355):
  ```tsx
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // In selection mode, toggle selection
      if (isSelectionMode) {
        onSelectionChange(item.id, !isSelected);
        return;
      }
      // Normal mode: open edit form (changed from preview)
      onEdit(item);
    }
    if (e.key === 'Escape' && menuOpen) {
      setMenuOpen(false);
    }
  };
  ```
- Verification: Pressing Enter on a focused row navigates to edit form

### Subtask 2.3: Verify Visual Feedback States
- [x] Confirm hover and tap visual feedback is properly styled for edit action (verified: cursor-pointer, hover:bg-gray-50, focus-visible:ring-2 already present)
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemManager/components/ItemRow.tsx`
- Implementation: Verify existing classes are adequate (lines 379-390):
  - `cursor-pointer` - indicates clickability
  - `hover:bg-gray-50` - hover state
  - `focus-visible:ring-2` - focus state for accessibility
- Verification: Visual feedback is consistent and clear on hover/focus

### Subtask 2.4: Update ARIA Label for Edit Action
- [x] Update ARIA label to indicate row click leads to edit, not preview (verified: ARIA label already comprehensive - includes title, location, guides, dates, views, reactions, selection state)
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemManager/components/ItemRow.tsx`
- Implementation: The current aria-label is comprehensive. Consider adding an edit hint. No change required if aria-label is descriptive enough.
- Verification: Screen readers properly announce edit capability

---

## Issue 3: Add Guide Button in Empty Guides Section

When no guides exist for an item, the empty state should show an "Add Guide" button to initiate guide creation.

### Subtask 3.1: Add Translation Keys for Add Guide Button
- [x] Add translation keys for the "Add Guide" button and related UI text
- Target files: All 6 message files (`messages/{en,fr,es,de,nl,it}.json`)
- Implementation: Add under `items.edit.guides`:
  ```json
  "addGuide": "Add Guide",
  "addGuideAriaLabel": "Create a new guide for this item"
  ```
- Translations:
  - fr: "Ajouter un guide", "Créer un nouveau guide pour cet article"
  - es: "Agregar guía", "Crear una nueva guía para este artículo"
  - de: "Anleitung hinzufügen", "Eine neue Anleitung für diesen Artikel erstellen"
  - nl: "Gids toevoegen", "Maak een nieuwe gids voor dit item"
  - it: "Aggiungi guida", "Crea una nuova guida per questo articolo"
- Verification: Translations load without errors

### Subtask 3.2: Update ItemInstructionsListProps Interface
- [x] Add `onAddGuide` callback prop to the ItemInstructionsListProps interface
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemEditForm/ItemEditForm.types.ts`
- Implementation: Update interface (lines 44-49):
  ```typescript
  // Props for ItemInstructionsList
  export interface ItemInstructionsListProps {
    articles: ItemArticle[];
    itemName: string;
    onEditInstruction: (articleId: string) => void;
    onAddGuide?: () => void;  // NEW: Callback to add a guide
    loading?: boolean;
  }
  ```
- Verification: TypeScript compiles without errors

### Subtask 3.3: Add onAddGuide Prop to Component Signature
- [x] Update ItemInstructionsList component to accept and destructure onAddGuide prop
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemEditForm/ItemInstructionsList.tsx`
- Implementation: Update component signature (lines 41-46):
  ```tsx
  export function ItemInstructionsList({
    articles,
    itemName,
    onEditInstruction,
    onAddGuide,  // NEW
    loading = false,
  }: ItemInstructionsListProps) {
  ```
- Verification: Component accepts new prop without warnings

### Subtask 3.4: Add Plus Icon Import
- [x] Import Plus icon from lucide-react for the Add Guide button
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemEditForm/ItemInstructionsList.tsx`
- Implementation: Update import (line 12):
  ```tsx
  import { Pencil, FileText, Plus } from 'lucide-react';
  ```
- Verification: No import errors

### Subtask 3.5: Add "Add Guide" Button to Empty State
- [x] Render "Add Guide" button in the empty state section
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/components/ItemEditForm/ItemInstructionsList.tsx`
- Implementation: Update empty state return (lines 86-98):
  ```tsx
  // Empty state
  if (articles.length === 0) {
    return (
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('guides.title')}</h3>
        <p className="text-sm text-gray-500 mb-4">{t('guides.description')}</p>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t('guides.empty')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('guides.emptyDescription')}</p>
          {onAddGuide && (
            <button
              type="button"
              onClick={onAddGuide}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors font-medium"
              aria-label={t('guides.addGuideAriaLabel')}
            >
              <Plus className="w-4 h-4" />
              {t('guides.addGuide')}
            </button>
          )}
        </div>
      </div>
    );
  }
  ```
- Verification: Button displays prominently in empty state with brand styling

### Subtask 3.6: Create handleAddGuide Callback in Edit Page
- [x] Create handler function to navigate to guide creation with item pre-association
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- Implementation: Add callback function after handleEditInstruction (around line 188):
  ```tsx
  // Handle add new guide
  const handleAddGuide = useCallback(() => {
    // Navigate to guide creation with item pre-selected
    router.push(`/dashboard2/instructions/new?itemId=${publicId}`);
  }, [router, publicId]);
  ```
- Verification: Function compiles without errors

### Subtask 3.7: Pass onAddGuide Prop to ItemInstructionsList
- [x] Pass the handleAddGuide callback to ItemInstructionsList component
- Target file: `/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/src/app/dashboard2/items/[publicId]/edit/page.tsx`
- Implementation: Update component usage (lines 400-405):
  ```tsx
  <ItemInstructionsList
    articles={item.articles || []}
    itemName={item.name}
    onEditInstruction={handleEditInstruction}
    onAddGuide={handleAddGuide}
    loading={false}
  />
  ```
- Verification: Button click navigates to guide creation page with item ID

### Subtask 3.8: Verify Guide Creation Accepts Item ID
- [x] Verify the guide creation page can receive and use the itemId query parameter
  - Note: `/dashboard2/instructions/new` page does not exist yet. The URL `/dashboard2/instructions/new?itemId={publicId}` will need to be implemented as a follow-up task. Current implementation navigates to this URL and passes the itemId query parameter.
- Target: Examine `/dashboard2/instructions/new` page (if exists)
- Implementation: If itemId handling doesn't exist, document as follow-up task
- Verification: New guide is auto-associated with the current item

---

## Final Verification

### Pre-Commit Checks
- [x] `npm run typecheck` passes without errors
- [x] `npm run build` passes without errors
- [ ] `npm run lint` passes without critical errors (not run - optional)

### Functional Testing

#### Issue 1: Media Capture
- [ ] "Take Photo" option visible in Add Content modal
- [ ] "Record Video" option visible in Add Content modal
- [ ] Photo capture triggers device camera on mobile (or file picker on desktop)
- [ ] Video capture triggers device camera on mobile (or file picker on desktop)
- [ ] Captured media properly added as content piece
- [ ] Existing "Upload File" option still works

#### Issue 2: Tappable Rows
- [ ] Clicking item row navigates to edit form (not preview)
- [ ] Keyboard Enter/Space navigates to edit form
- [ ] Selection mode toggle still works (checkbox, long-press)
- [ ] Kebab menu edit still works as alternative
- [ ] Visual hover/focus feedback is clear

#### Issue 3: Add Guide Button
- [ ] "Add Guide" button visible when no guides exist
- [ ] Button uses brand styling (coral/pink)
- [ ] Clicking button navigates to guide creation
- [ ] Item is pre-associated when creating guide

### Browser/Device Testing
- [ ] Test media capture on iOS Safari
- [ ] Test media capture on Android Chrome
- [ ] Test row tap behavior on touch devices
- [ ] Verify graceful fallback on desktop browsers

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/components/InstructionEditor/components/AddContentModal.tsx` | Add photo/video capture options, types, UI, handlers |
| `src/components/ItemManager/components/ItemRow.tsx` | Change row click to edit instead of preview |
| `src/components/ItemEditForm/ItemEditForm.types.ts` | Add `onAddGuide` prop type |
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | Add "Add Guide" button in empty state |
| `src/app/dashboard2/items/[publicId]/edit/page.tsx` | Pass `onAddGuide` callback |
| `messages/en.json` | Add new translation keys |
| `messages/fr.json` | Add new translation keys |
| `messages/es.json` | Add new translation keys |
| `messages/de.json` | Add new translation keys |
| `messages/nl.json` | Add new translation keys |
| `messages/it.json` | Add new translation keys |

---

## Estimated Time

| Section | Estimate |
|---------|----------|
| Issue 1 (9 subtasks) | 2-3 hours |
| Issue 2 (4 subtasks) | 30-45 minutes |
| Issue 3 (8 subtasks) | 1-1.5 hours |
| Final Verification | 30-45 minutes |
| **Total** | **4.5-6 hours** |
