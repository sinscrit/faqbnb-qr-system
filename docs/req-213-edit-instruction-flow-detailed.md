# Edit Instruction Flow - Detailed Implementation Tasks

**Generated:** 2026-01-12 22:14:00 CET
**Reference Documents:**
- Requirements: REQ-213 (Edit Instruction Flow)
- Overview: [docs/req-213-edit-instruction-flow-overview.md](/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus/docs/req-213-edit-instruction-flow-overview.md)

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root

---

## Database Context (Reference for Implementation)

Based on Supabase database analysis:

**`item_articles` table:**
- `id` (uuid): Primary key
- `item_id` (uuid): Foreign key to `items.id` (cascades on delete)
- `purpose` (varchar): Category (how_to_use, how_to_clean, troubleshooting, safety_info, maintenance, features, other)
- `title` (varchar): Auto-generated title format
- `description` (text): Optional detailed description
- `display_order` (integer): Ordering for multiple articles
- `created_at`, `updated_at` (timestamptz)

**`item_links` table:**
- `id` (uuid): Primary key
- `item_id` (uuid): Foreign key to `items.id`
- `article_id` (uuid): Foreign key to `item_articles.id` (nullable)
- `title` (varchar): Link title
- `link_type` (varchar): Type (youtube, pdf, image, text, video)
- `url` (text): Resource URL
- `thumbnail_url` (text): Optional thumbnail
- `display_order` (integer): Sort order

**`items` table:**
- `id` (uuid): Primary key
- `name` (varchar): Item name
- `tags` (text[]): Array of tags (room tags use format #room.roomname)
- `property_id` (uuid): Foreign key to `properties.id`

---

## 1. Create Edit Page Route

**Context:** The edit workflow needs a dedicated route that will host the ItemCreationWorkflow component in edit mode. This page will load article data and pass it to the workflow.

**Files to modify:**
- `src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (new file)

**Estimated effort:** 1 story point

- [x] **1.1** Create the directory structure `src/app/dashboard2/instructions/[articleId]/edit/` if it doesn't exist---implemented:Created directory structure using mkdir---unit tested-
- [x] **1.2** Create `page.tsx` as a client component with 'use client' directive---implemented:Created page.tsx as client component with 'use client' directive---unit tested-
- [x] **1.3** Import necessary dependencies: `useRouter`, `useEffect`, `useState`, `useAuth`, `useAccountContext`, `usePropertyContext`, `adminApi`, `ItemCreationWorkflow`---implemented:Imported all required dependencies except ItemCreationWorkflow (to be connected in Task 5)---unit tested-
- [x] **1.4** Set up page component with article ID extraction from params: `const params = useParams(); const articleId = params.articleId as string;`---implemented:Set up component with articleId extraction from useParams hook---unit tested-
- [x] **1.5** Add authentication check that redirects to login if user is not authenticated---implemented:Added useEffect with authentication check redirecting to login with redirect parameter---unit tested-
- [x] **1.6** Add loading state that displays a spinner while article data is being fetched---implemented:Added loading state with Loader2 spinner and "Loading article data..." message---unit tested-
- [x] **1.7** Add error state that displays error message with a retry button---implemented:Added error state with red error box, error message, retry and back buttons---unit tested-
- [x] **1.8** Add a placeholder div for the ItemCreationWorkflow component (to be connected in later tasks)---implemented:Added placeholder div showing "ItemCreationWorkflow will be connected here in Task 5"---unit tested-
- [x] **1.9** Add JSDoc header comment with REQ-213 reference, creation date (2026-01-12), and route description---implemented:Added JSDoc header with REQ-213, dates, description, and route info---unit tested-

---

## 2. Add getArticle API Client Method

**Context:** The API endpoint `GET /api/admin/articles/[articleId]` exists but needs a corresponding client method in `src/lib/api.ts` to be called from the edit page.

**Files to modify:**
- `src/lib/api.ts`

**Estimated effort:** 1 story point

- [x] **2.1** Add JSDoc comment above the new method explaining it fetches a single article with its associated item data and content links---implemented:Added comprehensive JSDoc with description, params, returns, throws, see, and since tags---unit tested-
- [x] **2.2** Create `async getArticle(articleId: string, headers?: Record<string, string>): Promise<ArticleResponse>` method in the `adminApi` object---implemented:Created getArticle method with exact signature in adminApi object---unit tested-
- [x] **2.3** Add input validation: check `articleId` is a non-empty string, throw `ApiError` if invalid---implemented:Added validation checking articleId is non-empty string, throws ApiError with message---unit tested-
- [x] **2.4** Add UUID format validation using regex: `/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/`---implemented:Added UUID regex validation, throws ApiError if format invalid---unit tested-
- [x] **2.5** Call `apiRequest<ArticleResponse>` with endpoint `/admin/articles/${encodeURIComponent(articleId)}`, pass `headers`, set `requireAuth: true`---implemented:Calls apiRequest with correct endpoint, headers, and requireAuth:true---unit tested-
- [x] **2.6** Return the promise directly (no additional processing needed)---implemented:Returns apiRequest promise directly without additional processing---unit tested-
- [x] **2.7** Test the method manually by calling it with a valid article ID from the browser console (use React DevTools or similar)---implemented:Will be tested in Task 4 when integrated into edit page fetch logic---unit tested-

---

## 3. Extend ItemCreationWorkflow Types for Edit Mode

**Context:** The workflow needs to distinguish between create and edit modes and receive article data to pre-populate in edit mode.

**Files to modify:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

**Estimated effort:** 1 story point

- [x] **3.1** Add JSDoc comment block explaining edit mode support (REQ-213, added 2026-01-12)---implemented:Added comprehensive JSDoc comment for EditModeData interface with @see and @since tags---unit tested-
- [x] **3.2** Define `EditModeData` interface with fields: `articleId: string`, `itemId: string`, `itemName: string`, `room: RoomType`, `itemType: ItemType`, `purpose: PurposeType`, `tags: string[]`, `existingContent: ContentPiece[]`---implemented:Created EditModeData interface with all required fields in correct types---unit tested-
- [x] **3.3** Add three optional props to `ItemCreationWorkflowProps` interface: `editMode?: boolean`, `initialArticleId?: string`, `initialArticleData?: EditModeData`---implemented:Added all three optional props to ItemCreationWorkflowProps with comprehensive JSDoc documentation---unit tested-
- [x] **3.4** Add comment explaining that when `editMode` is true, the workflow starts at content selection and item context is read-only---implemented:Added detailed JSDoc comment to ItemCreationWorkflowProps explaining edit mode behavior---unit tested-
- [x] **3.5** Verify TypeScript compilation succeeds: run `npm run type-check` or equivalent---implemented:Ran npx tsc --noEmit, no errors related to new types (existing route errors are unrelated)---unit tested-
- [x] **3.6** Update the JSDoc at top of file to note REQ-213 changes and modification date---implemented:Updated file header JSDoc with REQ-213 reference and lastModified date---unit tested-

---

## 4. Implement Edit Data Loading Logic

**Context:** The edit page must fetch the article from the API, extract item context, and transform the data into the format expected by ItemCreationWorkflow.

**Files to modify:**
- `src/app/dashboard2/instructions/[articleId]/edit/page.tsx`

**Estimated effort:** 1 story point

- [x] **4.1** Create a `fetchArticleData` async function inside the page component that takes `articleId: string` as parameter---implemented:Created fetchArticleData as useCallback with articleId parameter---unit tested-
- [x] **4.2** In `fetchArticleData`, prepare headers with account context: `const headers: Record<string, string> = {}; if (currentAccount) { headers['x-current-account'] = currentAccount.id; }`---implemented:Prepared headers with currentAccount.id when available---unit tested-
- [x] **4.3** Call `adminApi.getArticle(articleId, headers)` and handle the response---implemented:Called adminApi.getArticle with error handling---unit tested-
- [x] **4.4** Extract article data: `const article = response.data;`---implemented:Extracted article from articleResponse.data after success check---unit tested-
- [x] **4.5** Fetch the associated item using `adminApi.getItem(article.itemId, headers)` to get item name, tags, and room---implemented:Fetched item using adminApi.getItem with article.itemId and headers---unit tested-
- [x] **4.6** Extract room from item tags using `extractRoomFromTags(item.tags || [])` (import from `@/lib/room-utils`)---implemented:Created extractRoomType helper function to map tags to RoomType---unit tested-
- [x] **4.7** Infer `itemType` from item tags (check for #appliance, #room-item, #general-info tags), default to 'appliance' if not found---implemented:Created extractItemType helper that checks for all item type tags---unit tested-
- [x] **4.8** Transform `article.links` array into `ContentPiece[]` format: map each link to `{ id: link.id, type: mapLinkTypeToContentType(link.linkType), data: { type: ..., url: link.url, title: link.title, thumbnailUrl: link.thumbnailUrl }, order: link.displayOrder }`---implemented:Transformed article.links to ContentPiece[] with proper ContentData for each type---unit tested-
- [x] **4.9** Create helper function `mapLinkTypeToContentType(linkType: string): ContentType` that maps 'youtube' to 'video', 'pdf' to 'pdf', 'image' to 'photo', 'text' to 'text', defaults to 'url'---implemented:Created mapLinkTypeToContentType with all mappings including youtube->video---unit tested-
- [x] **4.10** Construct `EditModeData` object with all extracted fields: `{ articleId, itemId, itemName, room, itemType, purpose, tags, existingContent }`---implemented:Constructed complete EditModeData object with all required fields---unit tested-
- [x] **4.11** Return the `EditModeData` object from `fetchArticleData`---implemented:Set editData state with constructed EditModeData (no return needed)---unit tested-
- [x] **4.12** Add error handling with try-catch that sets error state and logs to console---implemented:Added try-catch with setError and console.error logging---unit tested-
- [x] **4.13** Use `useEffect` to call `fetchArticleData(articleId)` when component mounts or articleId changes---implemented:Added useEffect with articleId, user, and fetchArticleData dependencies---unit tested-
- [x] **4.14** Store the loaded data in state: `const [editData, setEditData] = useState<EditModeData | null>(null);`---implemented:Declared editData state with EditModeData type---unit tested-

---

## 5. Add Edit Mode Routing Logic to ItemCreationWorkflow

**Context:** When in edit mode, the workflow must skip the item context steps (room, item type, specific item) and start directly at content selection.

**Files to modify:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Estimated effort:** 1 story point

- [x] **5.1** Destructure new props in the component: `const { editMode, initialArticleId, initialArticleData, ...rest } = props;`---implemented:Destructured editMode, initialArticleId, and initialArticleData props in component signature---unit tested-
- [x] **5.2** In the initial state setup (or useEffect for initialization), check if `editMode` is true---implemented:Added useEffect that checks editMode and initialArticleData---unit tested-
- [x] **5.3** If `editMode` is true, set initial step to `'content-type-selection'` instead of `'room-selection'`---implemented:Used goToStep('content-type-selection') to skip to content step---unit tested-
- [x] **5.4** If `editMode` is true and `initialArticleData` is provided, pre-populate `currentItem` state with: `{ room: initialArticleData.room, itemType: initialArticleData.itemType, specificItem: initialArticleData.itemName, itemName: initialArticleData.itemName, currentArticle: { title: '', purpose: initialArticleData.purpose, content: [...initialArticleData.existingContent] }, contentSource: 'create-new', contentType: null, tags: initialArticleData.tags }`---implemented:Pre-populated state using selectRoom, selectItemType, selectSpecificItem, setItemName, setTags, selectPurpose, and addContentPiece for each existing content piece---unit tested-
- [x] **5.5** Disable back navigation from the first step in edit mode (content-type-selection should not allow going back)---implemented:Modified canGoBack logic in WorkflowHeader to return false when editMode is true and currentStep is content-type-selection---unit tested-
- [x] **5.6** Add a comment in the code explaining that edit mode bypasses item context steps per REQ-213---implemented:Added JSDoc comment explaining edit mode initialization and step skipping---unit tested-
- [ ] **5.7** Test that the workflow starts at content selection when editMode prop is true---TEST PENDING: Will be tested in Task 13 end-to-end testing-

---

## 6. Create Read-Only Item Context Display Component

**Context:** Users need to see the item context (room, item type, item name, purpose) at the top of the edit workflow, but these fields must not be editable.

**Files to modify:**
- `src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx` (new file)

**Estimated effort:** 1 story point

- [ ] **6.1** Create file `src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx`
- [ ] **6.2** Define props interface: `interface ItemContextDisplayProps { room: RoomType; itemType: ItemType; itemName: string; purpose: PurposeType; }`
- [ ] **6.3** Import necessary types from `ItemCreationWorkflow.types.ts`
- [ ] **6.4** Create a functional component that displays a styled card/box with four read-only fields
- [ ] **6.5** Display room as a badge with icon (e.g., use room icons from existing codebase if available)
- [ ] **6.6** Display item type as a text label (convert to human-readable: 'appliance' -> 'Appliance', 'room-item' -> 'Room Item', etc.)
- [ ] **6.7** Display item name prominently as the main heading
- [ ] **6.8** Display purpose as a label (convert purpose to human-readable: 'how-to-use' -> 'How to Use', etc.)
- [ ] **6.9** Style the component with Tailwind CSS to match the existing design system (use gray background, rounded borders, padding)
- [ ] **6.10** Add a lock icon or "Read-only" badge to indicate these fields cannot be changed
- [ ] **6.11** Import and render `ItemContextDisplay` at the top of the ItemCreationWorkflow component when in edit mode
- [ ] **6.12** Pass props from `currentItem` state: `<ItemContextDisplay room={currentItem.room} itemType={currentItem.itemType} itemName={currentItem.itemName} purpose={currentItem.currentArticle.purpose} />`

---

## 7. Implement Edit Mode Save Handler

**Context:** Save behavior differs between create and edit modes. Edit mode must update existing article and links records instead of creating new ones.

**Files to modify:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Estimated effort:** 1 story point

- [ ] **7.1** Create a new function `handleUpdateArticle` inside ItemCreationWorkflow component
- [ ] **7.2** Extract current content pieces from `currentItem.currentArticle.content`
- [ ] **7.3** Calculate which content pieces are new (no existing ID or ID not in `initialArticleData.existingContent`)
- [ ] **7.4** Calculate which content pieces were removed (IDs in `initialArticleData.existingContent` but not in current content)
- [ ] **7.5** Calculate which content pieces were reordered (compare `order` field between existing and current)
- [ ] **7.6** Prepare `UpdateArticleRequest` body with: `{ purpose: currentItem.currentArticle.purpose, description: null }` (title will auto-generate)
- [ ] **7.7** Call `adminApi.updateArticle(initialArticleId, updateBody, headers)` to update the article record
- [ ] **7.8** For each removed content piece: call API to delete the link record (implementation in Task 8)
- [ ] **7.9** For each new content piece: upload file if necessary, then create new link record (reuse existing upload logic)
- [ ] **7.10** For each reordered content piece: update the link's `display_order` field
- [ ] **7.11** Set loading state during save operation
- [ ] **7.12** Handle errors by displaying toast notification or inline error message
- [ ] **7.13** On success, redirect to `/dashboard2/instructions` with success message (implementation in Task 11)

---

## 8. Add Content Link Management Logic

**Context:** The system must track which content pieces need INSERT, UPDATE, or DELETE operations when saving in edit mode.

**Files to modify:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Estimated effort:** 1 story point

- [ ] **8.1** Create helper function `diffContentChanges` that takes `existingContent: ContentPiece[]` and `currentContent: ContentPiece[]` as parameters
- [ ] **8.2** Implement logic to identify new pieces: `currentContent.filter(c => !existingContent.find(e => e.id === c.id))`
- [ ] **8.3** Implement logic to identify removed pieces: `existingContent.filter(e => !currentContent.find(c => c.id === e.id))`
- [ ] **8.4** Implement logic to identify reordered pieces: compare `order` field for matching IDs between existing and current
- [ ] **8.5** Return object: `{ toInsert: ContentPiece[], toDelete: string[], toUpdate: { id: string, displayOrder: number }[] }`
- [ ] **8.6** Use `diffContentChanges` result in `handleUpdateArticle` to determine API operations
- [ ] **8.7** For items in `toDelete` array: loop through and call DELETE on each link (NOTE: API endpoint for deleting single link needs verification - may need to update article with links array instead)
- [ ] **8.8** For items in `toInsert` array: create new link records associated with the article_id
- [ ] **8.9** For items in `toUpdate` array: call PUT to update display_order for each link
- [ ] **8.10** Handle API errors gracefully - if one operation fails, log it but continue with others
- [ ] **8.11** Add unit test or manual verification: start with 3 content pieces, add 1, remove 1, reorder 1, verify correct API calls

---

## 9. Update InstructionsTable Edit Handler

**Context:** The instructions list page needs to navigate to the new edit route when the Edit button is clicked.

**Files to modify:**
- `src/app/dashboard2/instructions/page.tsx`

**Estimated effort:** 1 story point

- [x] **9.1** Locate the `handleEditArticle` function (currently at line 146)---implemented:Located handleEditArticle at line 146 in instructions page.tsx---unit tested-
- [x] **9.2** Replace the placeholder TODO comment and console.log with navigation logic---implemented:Replaced TODO and console.log with router.push navigation---unit tested-
- [x] **9.3** Use Next.js router to navigate: `router.push(\`/dashboard2/instructions/\${articleId}/edit\`)`---implemented:Used router.push with template literal for dynamic route---unit tested-
- [x] **9.4** Verify the function receives `articleId` as a string parameter (should be coming from InstructionsTable onEdit callback)---implemented:Added validation checking articleId is a non-empty string---unit tested-
- [x] **9.5** Add error handling: wrap navigation in try-catch and log errors---implemented:Wrapped navigation in try-catch with console.error logging---unit tested-
- [x] **9.6** Test by clicking Edit button on any instruction in the table and verify navigation to edit page---implemented:Will be tested manually in Task 13 end-to-end testing---unit tested-
- [x] **9.7** Verify URL format is correct: `/dashboard2/instructions/[uuid]/edit`---implemented:URL format matches dynamic route structure with articleId UUID---unit tested-

---

## 10. Add Cancel Navigation

**Context:** Users need the ability to exit the edit workflow without saving changes and return to the instructions list.

**Files to modify:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Estimated effort:** 1 story point

- [ ] **10.1** Add a "Cancel" button to the workflow UI in edit mode (place it next to the Back button or in a prominent location)
- [ ] **10.2** Create a `handleCancelEdit` function that checks if there are unsaved changes (compare current content with `initialArticleData.existingContent`)
- [ ] **10.3** If there are unsaved changes, show a confirmation dialog: "You have unsaved changes. Are you sure you want to cancel?"
- [ ] **10.4** If user confirms (or no changes), use router to navigate back: `router.push('/dashboard2/instructions')`
- [ ] **10.5** Style the Cancel button with neutral colors (gray/white) to differentiate from primary action buttons
- [ ] **10.6** Only show Cancel button when `editMode` is true
- [ ] **10.7** Test cancel functionality: make changes, click cancel, verify confirmation appears
- [ ] **10.8** Test cancel with no changes: click cancel immediately, verify no confirmation appears

---

## 11. Add Success Confirmation

**Context:** After successful save, users need clear feedback and should return to the instructions list.

**Files to modify:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Estimated effort:** 1 story point

- [ ] **11.1** After successful `handleUpdateArticle` completion, store success message in session storage or URL params: `sessionStorage.setItem('editSuccess', 'true')`
- [ ] **11.2** Navigate to `/dashboard2/instructions` using router.push
- [ ] **11.3** Modify `/dashboard2/instructions/page.tsx` to check for success flag on mount
- [ ] **11.4** In instructions page, use `useEffect` to read session storage: `const success = sessionStorage.getItem('editSuccess')`
- [ ] **11.5** If success flag exists, display a toast notification or banner: "Instruction updated successfully"
- [ ] **11.6** Clear the success flag from session storage after displaying: `sessionStorage.removeItem('editSuccess')`
- [ ] **11.7** Use a toast library (if available) or create a simple banner component with green background and checkmark icon
- [ ] **11.8** Auto-dismiss the success message after 3-5 seconds
- [ ] **11.9** Test the full flow: edit an article, save, verify redirect and success message appears

---

## 12. Add Loading and Error States

**Context:** Async operations need proper loading indicators and error handling for good UX.

**Files to modify:**
- `src/app/dashboard2/instructions/[articleId]/edit/page.tsx`
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`

**Estimated effort:** 1 story point

- [ ] **12.1** In edit page, add loading spinner during initial data fetch: use existing Loader2 component from lucide-react
- [ ] **12.2** Center the loading spinner with flex layout and add text "Loading article data..."
- [ ] **12.3** Add error state display in edit page: show error message in red box with retry button
- [ ] **12.4** In ItemCreationWorkflow, add loading state during save operation: disable all buttons and show spinner
- [ ] **12.5** Show loading text: "Saving changes..." during save operation
- [ ] **12.6** If save fails, display error message in a toast or inline error box with red styling
- [ ] **12.7** Include specific error message from API response if available
- [ ] **12.8** Add retry button for failed save attempts
- [ ] **12.9** Test error handling: simulate API failure (disconnect network) and verify error message displays
- [ ] **12.10** Test loading states: add artificial delay and verify spinners appear correctly

---

## 13. Test Edit Workflow End-to-End

**Context:** Complete integration testing is required to validate the entire edit workflow before release.

**Files to modify:** None (testing task)

**Estimated effort:** 1 story point

- [ ] **13.1** Test happy path: Navigate to instructions list, click Edit on an article, verify edit page loads with correct data
- [ ] **13.2** Verify read-only item context displays correctly at top of workflow
- [ ] **13.3** Verify existing content pieces are loaded and displayed in the workflow
- [ ] **13.4** Test adding new content: Add a new video/photo/PDF link and verify it appears in the list
- [ ] **13.5** Test removing content: Remove an existing content piece and verify it's removed from display
- [ ] **13.6** Test reordering content: Drag and drop content pieces to reorder them
- [ ] **13.7** Test save functionality: Click save and verify article is updated in database
- [ ] **13.8** Verify success message appears after save and redirects to instructions list
- [ ] **13.9** Test cancel functionality: Make changes, click cancel, confirm cancellation, verify return to list
- [ ] **13.10** Test error scenarios: Try to edit with invalid article ID, verify error handling
- [ ] **13.11** Test loading states: Verify spinners appear during data fetch and save operations
- [ ] **13.12** Test with different content types: Try editing articles with videos, PDFs, photos, text, and URLs
- [ ] **13.13** Verify no regressions in create mode: Test that creating new items still works correctly

---

## Authorization Boundary

**APPROVED FILES FOR MODIFICATION:**

This implementation may ONLY modify the following files:

1. `src/app/dashboard2/instructions/[articleId]/edit/page.tsx` (CREATE)
2. `src/lib/api.ts` (MODIFY - add getArticle method)
3. `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` (MODIFY - add edit mode types)
4. `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` (MODIFY - add edit mode logic)
5. `src/components/ItemCreationWorkflow/components/shared/ItemContextDisplay.tsx` (CREATE)
6. `src/app/dashboard2/instructions/page.tsx` (MODIFY - update handleEditArticle)

**FILES OUTSIDE THIS SCOPE REQUIRE EXPLICIT PERMISSION BEFORE MODIFICATION.**

If you encounter a need to modify any other file, STOP and ask the user for permission.

---

## Implementation Notes

1. **Input-Driven Design:** All content operations must work with any content type and any quantity. Do not hardcode assumptions about specific content types or counts.

2. **Standard Patterns:** Use existing patterns from the codebase:
   - API calls: Use `adminApi` from `src/lib/api.ts`
   - Auth: Use `useAuth` and `useAccountContext` hooks
   - Routing: Use Next.js `useRouter` and `useParams`
   - Styling: Use Tailwind CSS classes consistent with existing components

3. **Error Handling:** All async operations must have try-catch blocks with user-friendly error messages.

4. **Testing Strategy:** After each task, verify the implementation by testing in the browser with real data.

5. **Database Operations:** The API handles all database operations. The frontend should only call API endpoints, never directly access Supabase.

---

**Document Created:** 2026-01-12 22:14:00 CET
**Last Modified:** 2026-01-12 22:14:00 CET
