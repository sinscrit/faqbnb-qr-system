# Implementation Plan: Item Creation Workflow

**Generated:** 2026-01-05 11:45:00 UTC
**Last Modified:** 2026-01-05 11:45:00 UTC
**PRD Reference:** PRD_Item_Creation_Workflow.md
**Design System:** airbnb_designsystem.md

---

## Overview

This implementation plan details the construction of a guided, multi-step item creation workflow that enables property owners to tag household items, capture/upload content, and generate printable QR codes in a single session. The workflow orchestrates the existing `ItemCapture` component while adding room selection, item suggestions, session management, and QR code printing capabilities.

---

## Technical Context

### Existing Stack

| Technology | Details |
|------------|---------|
| **Framework** | Next.js 15.5.9 with App Router |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS 4.x |
| **State Management** | React useReducer pattern (established in ItemCapture, ItemManager) |
| **UI Components** | Radix UI primitives, Heroicons, Lucide React |
| **PDF Generation** | pdf-lib, pdfkit (existing services) |
| **QR Codes** | qrcode library, existing `useQRCodeGeneration` hook |
| **Authentication** | Supabase Auth with AuthContext |
| **Build Tool** | Next.js with Turbopack |
| **Backend** | Supabase (PostgreSQL) |

### Relevant Existing Patterns

| Pattern | Location | Usage |
|---------|----------|-------|
| Wizard State Machine | `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Multi-step form with reducer |
| Component Barrel Exports | `src/components/ItemCapture/index.ts`, `src/components/ItemManager/index.ts` | Clean public API |
| Type Definitions | `src/components/*/ComponentName.types.ts` | Colocated types |
| Hooks Directory | `src/components/*/hooks/` | Custom hooks per component |
| Shared Components | `src/components/*/components/shared/` | Reusable sub-components |
| QR Code Generation | `src/hooks/useQRCodeGeneration.ts`, `src/lib/qrcode-utils.ts` | Batch QR generation |
| PDF Export | `src/lib/pdf-generator.ts`, `src/components/PDFExportOptions.tsx` | PDF creation |

### New Dependencies Required

| Library | Purpose | Size Impact | Alternative Considered |
|---------|---------|-------------|------------------------|
| None | All features can be built with existing dependencies | N/A | N/A |

**Note:** The existing stack provides all necessary functionality:
- `qrcode` for QR generation
- `pdf-lib` / `pdfkit` for PDF creation
- `@dnd-kit/*` for any drag-and-drop needs
- `react-image-crop` for image editing
- Radix UI for dialogs and dropdowns

---

## Architecture

### Component Structure

```
ItemCreationWorkflow/
├── index.ts                          # Public exports barrel file
├── ItemCreationWorkflow.tsx          # Main orchestrating component
├── ItemCreationWorkflow.types.ts     # All TypeScript definitions
├── hooks/
│   ├── index.ts                      # Hooks barrel export
│   ├── useWorkflowState.ts           # Main state machine reducer
│   ├── useSessionPersistence.ts      # LocalStorage session recovery
│   ├── useUrlPreview.ts              # URL metadata fetching
│   └── useSuggestions.ts             # Room/item type suggestions
├── components/
│   ├── index.ts                      # Components barrel export
│   ├── steps/
│   │   ├── RoomSelectionStep.tsx     # Step 1: Select room
│   │   ├── ItemTypeStep.tsx          # Step 2: Select item type
│   │   ├── SpecificItemStep.tsx      # Step 3: Select specific item
│   │   ├── ContentSourceStep.tsx     # Step 4: Existing vs new content
│   │   ├── ContentTypeStep.tsx       # Step 5: Content type selection
│   │   ├── ContentCreationStep.tsx   # Step 6: Delegates to ItemCapture
│   │   ├── PreviewSaveStep.tsx       # Step 7: Preview and save
│   │   ├── NextActionStep.tsx        # Step 8: What's next prompt
│   │   └── SessionSummaryStep.tsx    # Step 9: Review & print QR codes
│   └── shared/
│       ├── WorkflowHeader.tsx        # Progress indicator + navigation
│       ├── RoomCard.tsx              # Room selection card
│       ├── ItemTypeCard.tsx          # Item type card
│       ├── SuggestionButton.tsx      # Suggested item button
│       ├── ItemNameEditor.tsx        # Editable item name field
│       ├── SessionProgressBar.tsx    # Items created progress
│       ├── SessionItemCard.tsx       # Item summary card
│       ├── PrintOptionsPanel.tsx     # Print scope selection
│       ├── ContentPieceCard.tsx      # Multi-content item thumbnail
│       └── ConfirmExitDialog.tsx     # Exit confirmation modal
└── utils/
    ├── index.ts                      # Utils barrel export
    ├── constants.ts                  # Rooms, item types, suggestions matrix
    ├── suggestionMatrix.ts           # Room + Item Type -> Suggestions
    └── sessionStorage.ts             # Session persistence helpers
```

### State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    WorkflowSession State                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   Navigation     │    │   Session Data   │                  │
│  ├──────────────────┤    ├──────────────────┤                  │
│  │ currentStep      │    │ id               │                  │
│  │ stepHistory      │    │ startedAt        │                  │
│  │ canGoBack        │    │ items[]          │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    CurrentItemState                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ room: RoomType                                            │  │
│  │ itemType: ItemType                                        │  │
│  │ specificItem: string                                      │  │
│  │ itemName: string                                          │  │
│  │ contentSource: 'existing' | 'create-new'                  │  │
│  │ contentType: ContentType | null                           │  │
│  │ content: ContentPiece[]                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   UI State       │    │   Error State    │                  │
│  ├──────────────────┤    ├──────────────────┤                  │
│  │ isSubmitting     │    │ errors{}         │                  │
│  │ isDirty          │    │ submitError      │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input → Step Component → dispatch(action) → workflowReducer → New State
                                                        │
                                                        ▼
                                               useSessionPersistence
                                                        │
                                                        ▼
                                               localStorage (draft)
```

### Integration with ItemCapture

```tsx
// Step 6 (Content Creation) delegates to ItemCapture
<ContentCreationStep>
  └─ <ItemCapture
       config={{
         allowedMediaTypes: getMediaTypesForContentType(contentType),
         debug: false,
       }}
       onComplete={(record) => {
         // Extract content from ItemRecord
         dispatch({
           type: 'ADD_CONTENT_PIECE',
           payload: transformRecordToContent(record)
         });
         dispatch({ type: 'GO_TO_STEP', payload: 'preview-save' });
       }}
       onCancel={() => dispatch({ type: 'PREV_STEP' })}
     />
</ContentCreationStep>
```

---

## Integration Contract

### Main Component Props Interface

```typescript
// File: ItemCreationWorkflow.types.ts

interface ItemCreationWorkflowProps {
  /** Called when user completes session (with or without printing) */
  onSessionComplete: (session: CompletedSession) => void;

  /** Called when user exits mid-session (before completing any items) */
  onSessionExit: (session: PartialSession) => void;

  /** Called when user requests PDF generation */
  onGeneratePDF: (items: SessionItem[], scope: PrintScope) => Promise<Blob>;

  /** Called when user requests direct print */
  onPrintDirect: (items: SessionItem[], scope: PrintScope) => Promise<void>;

  /** Called to fetch existing items for display in summary */
  onFetchExistingItems: () => Promise<SessionItem[]>;

  /** Called to persist a new item to database */
  onSaveItem: (item: SessionItem) => Promise<{ id: string; qrCodeUrl: string }>;

  /** Optional: Pre-populate with existing session (resume) */
  initialSession?: WorkflowSession;

  /** Optional: Configuration overrides */
  config?: WorkflowConfig;

  /** Optional: CSS class name */
  className?: string;
}
```

### Session Data Interfaces

```typescript
interface WorkflowSession {
  id: string;                          // Session UUID
  startedAt: Date;                     // Session start time
  currentStep: WorkflowStep;           // Current position in flow
  items: SessionItem[];                // Items created this session
  currentItem: CurrentItemState | null; // Item being created
}

type WorkflowStep =
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'content-source-selection'
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';

interface CurrentItemState {
  room: RoomType;
  itemType: ItemType;
  specificItem: string;
  itemName: string;
  contentSource: 'existing' | 'create-new';
  contentType: ContentType | null;
  content: ContentPiece[];
}

interface SessionItem {
  id: string;
  name: string;
  room: RoomType;
  itemType: ItemType;
  content: ContentPiece[];
  createdAt: Date;
  qrCodeUrl?: string;
}

interface ContentPiece {
  id: string;
  type: ContentType;
  data: ContentData;
  order: number;
  thumbnail?: Blob;
}

type RoomType =
  | 'kitchen' | 'laundry' | 'bedroom' | 'bathroom'
  | 'living-room' | 'garage' | 'outdoor' | 'general' | 'other';

type ItemType = 'appliance' | 'room-item' | 'general-info';

type ContentType = 'video' | 'photo' | 'pdf' | 'text' | 'url';

interface CompletedSession {
  id: string;
  newItems: SessionItem[];
  existingItems: SessionItem[];
  completedAt: Date;
  printAction: 'pdf' | 'direct' | 'skipped';
  printScope?: PrintScope;
}

type PrintScope =
  | { type: 'all' }
  | { type: 'new-only' }
  | { type: 'selected'; itemIds: string[] };
```

### Usage Example

```tsx
<ItemCreationWorkflow
  onSessionComplete={(session) => {
    console.log(`Created ${session.newItems.length} items`);
    router.push('/dashboard');
  }}
  onSessionExit={(partial) => {
    // Optionally save draft
    saveDraft(partial);
  }}
  onGeneratePDF={async (items, scope) => {
    return await pdfService.generateQRSheet(items, scope);
  }}
  onPrintDirect={async (items, scope) => {
    const blob = await pdfService.generateQRSheet(items, scope);
    await printService.print(blob);
  }}
  onFetchExistingItems={async () => {
    return await itemService.getItemsForProperty(propertyId);
  }}
  onSaveItem={async (item) => {
    return await itemService.createItem(item);
  }}
  config={{
    maxItemsPerSession: 50,
    enableUrlPreview: true,
  }}
/>
```

---

## Implementation Approach

### Phase 1: Foundation & Core Infrastructure [5 days]

**Objective:** Establish component structure, state management, and navigation framework.

#### Task 1.1: Component Scaffold & Type Definitions [1 day]
- [ ] Create `ItemCreationWorkflow/` directory structure
- [ ] Define all TypeScript interfaces in `ItemCreationWorkflow.types.ts`
- [ ] Create barrel export files (`index.ts`)
- [ ] Set up constants file with rooms, item types, suggestion matrix

**Files:**
- `src/components/ItemCreationWorkflow/index.ts`
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- `src/components/ItemCreationWorkflow/utils/constants.ts`
- `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

#### Task 1.2: Workflow State Machine [1.5 days]
- [ ] Implement `useWorkflowState` hook with reducer pattern
- [ ] Define all action types following existing patterns
- [ ] Implement step navigation logic (forward, back, jump)
- [ ] Add step history for back navigation support
- [ ] Handle step skipping logic (e.g., "General" room skips item type)

**Files:**
- `src/components/ItemCreationWorkflow/hooks/useWorkflowState.ts`
- `src/components/ItemCreationWorkflow/hooks/index.ts`

#### Task 1.3: Main Workflow Component [1 day]
- [ ] Create `ItemCreationWorkflow.tsx` main component
- [ ] Implement step rendering logic (switch by currentStep)
- [ ] Add WorkflowHeader with progress indicator
- [ ] Integrate state hook
- [ ] Add exit confirmation dialog

**Files:**
- `src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx`
- `src/components/ItemCreationWorkflow/components/shared/WorkflowHeader.tsx`
- `src/components/ItemCreationWorkflow/components/shared/ConfirmExitDialog.tsx`

#### Task 1.4: Session Persistence [0.5 days]
- [ ] Implement `useSessionPersistence` hook
- [ ] Auto-save to localStorage on state changes
- [ ] Session recovery on component mount
- [ ] Cleanup on session complete

**Files:**
- `src/components/ItemCreationWorkflow/hooks/useSessionPersistence.ts`
- `src/components/ItemCreationWorkflow/utils/sessionStorage.ts`

#### Task 1.5: Basic Shared Components [1 day]
- [ ] Create `SessionProgressBar` component
- [ ] Create base card components (RoomCard, ItemTypeCard)
- [ ] Apply Airbnb design system styles

**Files:**
- `src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx`
- `src/components/ItemCreationWorkflow/components/shared/RoomCard.tsx`
- `src/components/ItemCreationWorkflow/components/shared/ItemTypeCard.tsx`

---

### Phase 2: Selection Steps (1-3) [3 days]

**Objective:** Implement the first three steps: room selection, item type, and specific item selection.

#### Task 2.1: Room Selection Step [1 day]
- [ ] Create `RoomSelectionStep.tsx` component
- [ ] Implement room grid with icons and labels
- [ ] Add "Other" option with free-text input
- [ ] Handle selection and navigation
- [ ] Ensure large touch targets (48x48px minimum)

**Files:**
- `src/components/ItemCreationWorkflow/components/steps/RoomSelectionStep.tsx`

**Acceptance Criteria:**
- Grid of room options with icons
- "Other" option opens text input
- Selection advances to next step
- Back navigation returns with selection preserved

#### Task 2.2: Item Type Selection Step [0.5 days]
- [ ] Create `ItemTypeStep.tsx` component
- [ ] Three card options: Appliance, Room Item, General Info
- [ ] Clear descriptions and examples on each card
- [ ] Auto-skip if "General" room was selected

**Files:**
- `src/components/ItemCreationWorkflow/components/steps/ItemTypeStep.tsx`

#### Task 2.3: Specific Item Selection Step [1 day]
- [ ] Create `SpecificItemStep.tsx` component
- [ ] Implement `useSuggestions` hook for dynamic suggestions
- [ ] Create `SuggestionButton.tsx` for suggestion items
- [ ] Create `ItemNameEditor.tsx` for editable name field
- [ ] Show previously created items (grayed out)
- [ ] Auto-generate name as "Room - Item"

**Files:**
- `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx`
- `src/components/ItemCreationWorkflow/hooks/useSuggestions.ts`
- `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx`
- `src/components/ItemCreationWorkflow/components/shared/ItemNameEditor.tsx`

#### Task 2.4: Suggestions Matrix Data [0.5 days]
- [ ] Populate full suggestions matrix from PRD
- [ ] Kitchen, Laundry, Bedroom, Bathroom, Living Room, Garage, Outdoor, General
- [ ] Categorize by Appliance, Room Item, General Info

**Files:**
- `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

---

### Phase 3: Content Selection Steps (4-5) [2 days]

**Objective:** Implement content source and type selection steps.

#### Task 3.1: Content Source Step [0.5 days]
- [ ] Create `ContentSourceStep.tsx` component
- [ ] Two options: "I have content" vs "Create now"
- [ ] Clear descriptions for each option
- [ ] Store selection in state for next step filtering

**Files:**
- `src/components/ItemCreationWorkflow/components/steps/ContentSourceStep.tsx`

#### Task 3.2: Content Type Step [1 day]
- [ ] Create `ContentTypeStep.tsx` component
- [ ] Dynamic options based on content source selection
- [ ] Icon-labeled cards for each content type
- [ ] For "I have content": Upload Video, Upload Photo, Upload PDF, Paste Text, Paste URL
- [ ] For "Create now": Record Video, Take Photo, Write Text

**Files:**
- `src/components/ItemCreationWorkflow/components/steps/ContentTypeStep.tsx`

#### Task 3.3: URL Content with Preview [0.5 days]
- [ ] Implement `useUrlPreview` hook
- [ ] Fetch Open Graph metadata
- [ ] Handle loading, success, error states
- [ ] Support proceeding without preview (with warning)

**Files:**
- `src/components/ItemCreationWorkflow/hooks/useUrlPreview.ts`

---

### Phase 4: Content Creation & Preview (6-7) [3 days]

**Objective:** Integrate ItemCapture and build preview/save step.

#### Task 4.1: Content Creation Step [1.5 days]
- [ ] Create `ContentCreationStep.tsx` wrapper component
- [ ] Integrate existing `ItemCapture` component
- [ ] Configure ItemCapture based on workflow selections
- [ ] Transform ItemCapture output to ContentPiece format
- [ ] Handle cancel navigation

**Files:**
- `src/components/ItemCreationWorkflow/components/steps/ContentCreationStep.tsx`

**Integration Pattern:**
```tsx
<ItemCapture
  config={{
    allowedMediaTypes: mapContentTypeToMediaTypes(state.currentItem.contentType),
    maxVideoDuration: 120,
    maxFileSize: 100 * 1024 * 1024,
  }}
  onComplete={(record) => {
    dispatch({ type: 'ADD_CONTENT_FROM_RECORD', payload: record });
    dispatch({ type: 'GO_TO_STEP', payload: 'preview-save' });
  }}
  onCancel={() => dispatch({ type: 'PREV_STEP' })}
/>
```

#### Task 4.2: Preview & Save Step [1.5 days]
- [ ] Create `PreviewSaveStep.tsx` component
- [ ] Display content preview (video thumbnail, photo, PDF, text, URL card)
- [ ] Create `ContentPieceCard.tsx` for multi-content display
- [ ] Show item name prominently with "Edit Name" option
- [ ] "Retake" / "Replace" content option
- [ ] "Save Item" CTA button
- [ ] Success confirmation feedback

**Files:**
- `src/components/ItemCreationWorkflow/components/steps/PreviewSaveStep.tsx`
- `src/components/ItemCreationWorkflow/components/shared/ContentPieceCard.tsx`

---

### Phase 5: Session Flow & Multi-Item (8) [2 days]

**Objective:** Implement the "What's Next" decision point and multi-content items.

#### Task 5.1: Next Action Step [1 day]
- [ ] Create `NextActionStep.tsx` component
- [ ] Three options: Add More to Item, Tag New Item, I'm Done
- [ ] Session progress indicator ("4 items created")
- [ ] Route to appropriate next step based on selection

**Files:**
- `src/components/ItemCreationWorkflow/components/steps/NextActionStep.tsx`

#### Task 5.2: Multi-Content Item Support [1 day]
- [ ] Enable "Add more to this item" flow
- [ ] Display existing content pieces in preview
- [ ] Support content reordering (using @dnd-kit)
- [ ] Support individual content piece removal
- [ ] Enforce reasonable max (10 pieces per item)

**Implementation Note:** Leverage existing `@dnd-kit/sortable` patterns from the codebase.

---

### Phase 6: Session Summary & QR Generation (9) [4 days]

**Objective:** Build the final summary view with QR code printing capabilities.

#### Task 6.1: Session Summary Step [1.5 days]
- [ ] Create `SessionSummaryStep.tsx` component
- [ ] List new session items with thumbnails
- [ ] Collapsible section for previously created items
- [ ] Edit and Remove options per item
- [ ] Create `SessionItemCard.tsx` component

**Files:**
- `src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`
- `src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx`

#### Task 6.2: Print Options Panel [1 day]
- [ ] Create `PrintOptionsPanel.tsx` component
- [ ] Print scope selector: All items, New items only, Select items
- [ ] "Generate PDF" and "Print Directly" buttons
- [ ] "Just Review / Done for Now" option

**Files:**
- `src/components/ItemCreationWorkflow/components/shared/PrintOptionsPanel.tsx`

#### Task 6.3: QR Code Integration [1 day]
- [ ] Integrate existing `useQRCodeGeneration` hook
- [ ] Generate QR codes for selected items
- [ ] Show generation progress
- [ ] Handle errors with retry option

#### Task 6.4: PDF Generation Integration [0.5 days]
- [ ] Integrate existing PDF generation services
- [ ] Use `PDFExportOptions` component patterns
- [ ] Support standard paper sizes (Letter, A4)
- [ ] Include item name labels below QR codes

---

### Phase 7: Polish & Edge Cases [2 days]

**Objective:** Handle edge cases, improve UX, and add accessibility features.

#### Task 7.1: Error Handling & Edge Cases [1 day]
- [ ] Network lost during URL preview
- [ ] Camera permission denied fallback
- [ ] Long item names (truncation with tooltip)
- [ ] Empty session "I'm done" prompt
- [ ] Session refresh recovery
- [ ] Duplicate item name handling

#### Task 7.2: Accessibility & Mobile Optimization [1 day]
- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation support
- [ ] Focus management between steps
- [ ] Touch target verification (48px minimum)
- [ ] Responsive layouts for mobile/tablet/desktop
- [ ] Reduced motion support for animations

---

### Phase 8: Testing & Documentation [2 days]

**Objective:** Ensure quality and maintainability.

#### Task 8.1: Unit Tests [1 day]
- [ ] Test `useWorkflowState` reducer
- [ ] Test `useSuggestions` hook
- [ ] Test `useUrlPreview` hook
- [ ] Test step navigation logic
- [ ] Test session persistence

#### Task 8.2: Integration Tests [0.5 days]
- [ ] Test complete workflow flow
- [ ] Test ItemCapture integration
- [ ] Test QR code generation integration

#### Task 8.3: Documentation [0.5 days]
- [ ] Update barrel exports documentation
- [ ] Add JSDoc comments to all public APIs
- [ ] Create usage examples in README

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | `useReducer` pattern | Consistent with ItemCapture/ItemManager patterns; predictable state updates |
| Component Structure | Colocated with feature | Follows established component organization (steps/, shared/, hooks/) |
| Session Persistence | localStorage | Simple, no backend dependency; sufficient for draft recovery |
| URL Preview | Server-side API route | CORS restrictions prevent client-side Open Graph fetching |
| QR Generation | Reuse `useQRCodeGeneration` | Existing battle-tested solution with caching and error handling |
| PDF Generation | Reuse `pdf-lib` services | Existing infrastructure; no new dependencies needed |
| Step Navigation | History stack pattern | Enables reliable back navigation; matches ItemCapture approach |
| Styling | Tailwind with Airbnb tokens | Design system compliance; consistent with codebase |
| Touch Targets | 48x48px minimum | Mobile-first; PRD requirement for accessibility |
| Icons | Lucide React | Already in use; consistent iconography |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ItemCapture integration complexity | Medium | High | Early integration testing; use existing interface contract |
| URL preview CORS issues | High | Medium | Server-side API route for metadata fetching |
| Session state loss on crash | Medium | Medium | Auto-save every 30 seconds; recovery prompt on load |
| Mobile camera permission UX | Medium | Medium | Clear permission dialogs; fallback to upload-only |
| Large session with many items | Low | Medium | Virtualization if >20 items; lazy loading |
| QR generation performance | Low | Low | Batch generation with existing optimized hook |
| PDF generation memory | Low | Medium | Streaming approach; limit items per PDF page |

---

## Recommended Spike Work

### Spike 1: URL Preview API Route

**Goal:** Validate server-side URL metadata fetching approach.

**Timebox:** 4 hours

**Success Criteria:**
- [ ] API route fetches URL and extracts Open Graph metadata
- [ ] Handles YouTube URLs specially (extract video ID)
- [ ] Returns structured UrlMetadata response
- [ ] Graceful timeout (5 seconds)
- [ ] Error handling for invalid/unreachable URLs

**Implementation Sketch:**
```typescript
// app/api/url-preview/route.ts
export async function POST(request: Request) {
  const { url } = await request.json();

  // Validate URL
  // Fetch with timeout
  // Parse HTML for og:* meta tags
  // Special handling for known domains (YouTube, etc.)
  // Return UrlMetadata
}
```

---

## Effort Estimate

| Phase | Tasks | Estimate | Confidence |
|-------|-------|----------|------------|
| Phase 1: Foundation | 1.1-1.5 | 5 days | High |
| Phase 2: Selection Steps | 2.1-2.4 | 3 days | High |
| Phase 3: Content Selection | 3.1-3.3 | 2 days | High |
| Phase 4: Content Creation | 4.1-4.2 | 3 days | Medium |
| Phase 5: Session Flow | 5.1-5.2 | 2 days | High |
| Phase 6: Summary & QR | 6.1-6.4 | 4 days | Medium |
| Phase 7: Polish | 7.1-7.2 | 2 days | Medium |
| Phase 8: Testing | 8.1-8.3 | 2 days | High |
| **Total** | | **23 days** | Medium-High |

**Buffer:** Add 20% contingency = **~28 working days** (5.5 weeks)

---

## Open Questions

1. **Property Scoping:** Should the workflow be scoped to a specific property, or should property selection be part of the workflow? (Recommendation: Pass propertyId as prop; workflow creates items for that property)

2. **Session Limits:** Should there be a maximum number of items per session? (Recommendation: 50 items per session; configurable via WorkflowConfig)

3. **QR Code Format:** What should the QR code encode - direct URL or short code? (Recommendation: Use existing pattern from `buildQRUrl` utility)

4. **Offline Support:** Is offline capability required for V1? (Recommendation: Defer to V2; focus on draft recovery for V1)

5. **PDF Templates:** Should users choose QR code layout (grid, list, labels)? (Recommendation: Start with grid layout; expand later based on user feedback)

---

## References

- [PRD: Item Creation Workflow](/docs/prd/PRD_Item_Creation_Workflow.md)
- [Airbnb Design System](/docs/prd/airbnb_designsystem.md)
- [ItemCapture Implementation Plan](/docs/prd/item-capture-implementation-plan.md)
- [ItemCapture Types](/src/components/ItemCapture/ItemCapture.types.ts)
- [ItemManager Patterns](/src/components/ItemManager/index.ts)
- [QR Code Generation Hook](/src/hooks/useQRCodeGeneration.ts)
- [PDF Generator Service](/src/lib/pdf-generator.ts)

---

## Appendix A: Suggestion Matrix (Excerpt)

```typescript
export const SUGGESTION_MATRIX: Record<RoomType, Record<ItemType, string[]>> = {
  kitchen: {
    appliance: ['Stove/Oven', 'Refrigerator', 'Microwave', 'Dishwasher', 'Garbage Disposal', 'Coffee Maker', 'Toaster Oven'],
    'room-item': ['Pantry', 'Cabinets', 'Sink/Faucet', 'Ice Maker'],
    'general-info': ['Trash & Recycling'],
  },
  laundry: {
    appliance: ['Washer', 'Dryer', 'Washer/Dryer Combo'],
    'room-item': ['Ironing Board', 'Drying Rack', 'Laundry Supplies'],
    'general-info': ['Detergent Instructions'],
  },
  // ... (full matrix in constants.ts)
};
```

## Appendix B: Room Icons Mapping

```typescript
export const ROOM_ICONS: Record<RoomType, string> = {
  kitchen: 'chef-hat',      // or custom emoji
  laundry: 'washing-machine',
  bedroom: 'bed',
  bathroom: 'shower-head',
  'living-room': 'sofa',
  garage: 'car',
  outdoor: 'tree',
  general: 'info',
  other: 'map-pin',
};
```

## Appendix C: Airbnb Design Tokens Applied

```css
/* Colors */
--color-text-primary: #222222;
--color-text-secondary: #717171;
--color-brand-primary: #FF385C;
--color-success: #00A699;
--color-error: #FF5A5F;

/* Spacing (8px grid) */
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;

/* Border Radius */
--radius-md: 8px;
--radius-lg: 12px;

/* Typography */
--font-size-md: 16px;
--font-weight-medium: 500;
--font-weight-bold: 700;
```

---

*Implementation Plan generated on 2026-01-05 for PRD: Item Creation Workflow*
