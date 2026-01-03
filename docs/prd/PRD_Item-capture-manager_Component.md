# Product Requirements Document: Item Manager Component

## Product Vision

Enable property owners to efficiently organize, edit, and maintain their instructional content library across one or multiple properties—providing a clear overview and streamlined management of all items and their associated assets.

-----

## Success Definition

### Business Outcomes

| Metric | Target | How We'll Know |
|--------|--------|----------------|
| Time to find an item | < 10 seconds | User testing |
| Bulk operation efficiency | 5+ items managed in < 1 minute | User testing |
| Edit initiation | < 2 taps from list to edit mode | UX audit |
| Zero accidental deletions | 100% confirmation on destructive actions | Analytics |

### User Outcome

> "I can see all my items at a glance, quickly find what I need, and make changes—whether updating one item or reorganizing a dozen—without losing track of what belongs where."

-----

## Implementation Context: LLM Builder Instructions

### What You Are Building

A **standalone, self-contained UI component** called `ItemManager`. This component will later be integrated into an existing application that already has authentication, authorization, persistence layers, and a design system.

### Critical Constraints for Implementation

| Constraint | Instruction |
|------------|-------------|
| **No backend calls** | Do NOT implement Supabase, API calls, or any network requests |
| **No auth logic** | Do NOT implement login, tokens, user context, or permission checks |
| **No routing** | Do NOT implement navigation, URL handling, or page transitions |
| **No global state** | Do NOT use Redux, Zustand, or app-level context providers |
| **No hardcoded styles** | Do NOT embed fixed colors, fonts, or spacing that can't be overridden |
| **Props in, callbacks out** | Component receives data and config via props, emits changes via callbacks |

### What TO Build

- Item list display UI (grid/list views)
- Search, filter, and sort UI
- Single item selection and actions
- Multi-select and bulk actions UI
- Item detail/preview panel
- Asset management UI (add, remove, reorder media)
- Confirmation dialogs for destructive actions
- Loading and empty states
- Local component state management

### What NOT TO Build

- User authentication or login screens
- Database queries or mutations
- File upload to cloud storage
- API endpoints or data fetching
- Error reporting to external services
- Analytics tracking
- The actual edit experience (delegates to ItemCapture)
- QR code generation or display

### Integration-Ready Architecture

The component must be structured so a developer can later wrap it like this:

```tsx
// FUTURE integration (do not implement this wrapper—just the inner component)
function ManageItemsPage() {
  const { user } = useAuth();                    // Existing app auth
  const { items, loading } = useItems(propertyId); // Existing app data
  const { deleteItems } = useDatabase();         // Existing app database
  const router = useRouter();                    // Existing app routing

  const handleEditItem = (item: ItemRecord) => {
    router.push(`/items/${item.id}/edit`);       // Opens ItemCapture in edit mode
  };

  const handleDeleteItems = async (ids: string[]) => {
    await deleteItems(ids);
    refetch();
  };

  return (
    <AuthGuard requiredRole="owner">
      <ItemManager
        items={items}
        loading={loading}
        onEditItem={handleEditItem}
        onDeleteItems={handleDeleteItems}
        onUpdateItem={handleUpdateItem}
        config={{ enableBulkActions: true }}
      />
    </AuthGuard>
  );
}
```

### Component Interface (Implement This)

```tsx
interface ItemManagerProps {
  // Data
  items: ItemRecord[];
  properties?: Property[];              // Optional: for multi-property mode
  loading?: boolean;
  
  // Callbacks
  onEditItem: (item: ItemRecord) => void;           // Triggers ItemCapture edit mode
  onDeleteItems: (ids: string[]) => void;           // Single or bulk delete
  onUpdateItem: (item: ItemRecord) => void;         // Metadata/asset changes
  onAddAssets?: (itemId: string, assets: MediaItem[]) => void;  // Quick asset add
  onRemoveAssets?: (itemId: string, assetIds: string[]) => void; // Quick asset remove
  onReorderAssets?: (itemId: string, orderedIds: string[]) => void; // Reorder
  
  // Configuration
  config?: ItemManagerConfig;
  
  // Customization
  renderItem?: (item: ItemRecord, actions: ItemActions) => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
  renderToolbar?: (actions: ToolbarActions) => React.ReactNode;
  classNames?: ItemManagerClassNames;
}

// The component signature
export function ItemManager(props: ItemManagerProps): JSX.Element
```

### Test Harness (For Validation)

Build the component so it works in this minimal harness:

```tsx
const mockItems: ItemRecord[] = [
  {
    id: '1',
    title: 'Coffee Maker',
    location: 'Kitchen',
    tags: ['appliances', 'morning'],
    contentType: 'media',
    media: [{ id: 'm1', type: 'video', order: 0, /* ... */ }],
    instructions: 'Press the power button...',
    createdAt: new Date(),
  },
  // ... more mock items
];

function TestHarness() {
  const [items, setItems] = useState(mockItems);

  return (
    <ItemManager
      items={items}
      onEditItem={(item) => console.log('EDIT:', item.id)}
      onDeleteItems={(ids) => {
        console.log('DELETE:', ids);
        setItems(items.filter(i => !ids.includes(i.id)));
      }}
      onUpdateItem={(item) => {
        console.log('UPDATE:', item);
        setItems(items.map(i => i.id === item.id ? item : i));
      }}
    />
  );
}
```

**If the component works in this harness with no errors and no network calls, it is correctly implemented.**

### Done Checklist

- [ ] Renders with mock data, no providers or wrappers required
- [ ] All UI flows functional (list, search, filter, select, delete, asset manage)
- [ ] `onEditItem(item)` fires when user initiates edit
- [ ] `onDeleteItems(ids)` fires for single and bulk delete with confirmation
- [ ] `onUpdateItem(item)` fires for metadata and asset changes
- [ ] Zero network requests (check browser DevTools)
- [ ] Zero auth dependencies
- [ ] Styling can be fully overridden via classNames prop
- [ ] Works on mobile browsers (iOS Safari 15+, Chrome Android 90+)

-----

## Relationship to ItemCapture Component

| Responsibility | ItemCapture | ItemManager |
|----------------|-------------|-------------|
| Create new items | ✓ | — |
| Full item editing (media + metadata) | ✓ (edit mode) | — (delegates) |
| List/browse items | — | ✓ |
| Search/filter/sort | — | ✓ |
| Bulk operations | — | ✓ |
| Quick asset add/remove | — | ✓ |
| Delete items | — | ✓ |

**Handoff Pattern:**
```
ItemManager                         ItemCapture
     │                                   │
     │──── onEditItem(item) ────────────►│
     │                                   │
     │◄─── onComplete(updatedItem) ──────│
     │                                   │
     ▼                                   ▼
Parent app orchestrates the transition and data flow
```

-----

## Features & Acceptance Criteria

### Feature 1: Item List Display

**User Story:** As a property owner, I want to see all my items in a clear, organized view so I can quickly find what I'm looking for.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 1.1 | Items displayed in scrollable list or grid | Core functionality |
| 1.2 | Each item shows: thumbnail, title, location, content type indicator | Quick identification |
| 1.3 | Grid view shows visual-first layout (larger thumbnails) | Visual scanning |
| 1.4 | List view shows detail-first layout (more metadata visible) | Information density |
| 1.5 | User can toggle between grid and list views | Preference flexibility |
| 1.6 | View preference persists within session | Convenience |
| 1.7 | Responsive layout adapts to screen size | Mobile support |
| 1.8 | Empty state shown when no items exist | Clear feedback |
| 1.9 | Loading state shown while data is being fetched | Feedback during async |

**Thumbnail Logic:**
- Video: First frame or generated thumbnail
- Photo: The image itself (scaled)
- PDF: First page render
- Text-only: Icon or text preview snippet
- Mixed: Primary media item's thumbnail

-----

### Feature 2: Search & Filter

**User Story:** As a property owner with many items, I want to search and filter my items so I can quickly find specific content.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 2.1 | Text search filters items by title | Primary lookup |
| 2.2 | Search also matches location, tags, instructions content | Comprehensive search |
| 2.3 | Filter by content type (video, photo, PDF, text-only, mixed) | Type-based browsing |
| 2.4 | Filter by tag (multi-select) | Category browsing |
| 2.5 | Filter by location | Room-based organization |
| 2.6 | Filter by property (when multi-property mode enabled) | Property scoping |
| 2.7 | Filters can be combined (AND logic) | Precise filtering |
| 2.8 | Active filters clearly displayed with remove option | Filter awareness |
| 2.9 | "Clear all filters" option available | Quick reset |
| 2.10 | Result count displayed | Feedback |
| 2.11 | Search/filter state managed locally (not persisted) | Component isolation |

**Filter UI Options:**
- Dropdown/select for structured filters (content type, property)
- Tag chips for tags
- Text input for search
- Collapsible filter panel on mobile

-----

### Feature 3: Sort & Order

**User Story:** As a property owner, I want to sort my items by different criteria so I can organize my view according to my current task.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 3.1 | Sort by title (A-Z, Z-A) | Alphabetical lookup |
| 3.2 | Sort by date created (newest, oldest) | Recency |
| 3.3 | Sort by date modified (newest, oldest) | Recent activity |
| 3.4 | Sort by location (A-Z) | Room-based grouping |
| 3.5 | Current sort clearly indicated | Awareness |
| 3.6 | Sort persists within session | Convenience |

-----

### Feature 4: Single Item Actions

**User Story:** As a property owner, I want to perform actions on individual items so I can manage my content.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 4.1 | Tap/click item opens detail preview | Quick review |
| 4.2 | "Edit" action available (triggers onEditItem) | Full editing |
| 4.3 | "Delete" action available with confirmation | Destructive action safety |
| 4.4 | "Duplicate" action available (optional, via config) | Quick copy |
| 4.5 | "Manage Assets" action opens asset panel | Quick media changes |
| 4.6 | Actions accessible via menu (three-dot/kebab) | Clean UI |
| 4.7 | Actions accessible via swipe on mobile (optional) | Mobile convenience |
| 4.8 | Keyboard shortcuts for power users (optional) | Efficiency |

**Confirmation Dialog Requirements:**
- Clear statement of what will be deleted
- Item title displayed
- "Cancel" and "Delete" buttons
- Delete button visually distinct (destructive styling)

-----

### Feature 5: Multi-Select & Bulk Actions

**User Story:** As a property owner with many items, I want to select multiple items and perform actions on them at once so I can work efficiently.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 5.1 | Selection mode can be entered (long-press on mobile, checkbox on desktop) | Initiate multi-select |
| 5.2 | "Select All" option available | Efficiency |
| 5.3 | "Select None" / "Clear Selection" available | Quick deselect |
| 5.4 | Selected count displayed | Awareness |
| 5.5 | Bulk delete with confirmation | Batch cleanup |
| 5.6 | Bulk add tag | Batch organization |
| 5.7 | Bulk remove tag | Batch cleanup |
| 5.8 | Bulk move to property (multi-property mode) | Reorganization |
| 5.9 | Bulk change location | Reorganization |
| 5.10 | Exit selection mode clears selection | Clean state |
| 5.11 | Confirmation shows count of affected items | Safety |

**Bulk Delete Confirmation:**
- "Delete X items?"
- List of item titles (up to 5, then "and X more")
- Clear warning that action cannot be undone
- "Cancel" and "Delete All" buttons

-----

### Feature 6: Item Detail Preview

**User Story:** As a property owner, I want to preview an item's full content without entering edit mode so I can review what guests will see.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 6.1 | Preview shows all media (scrollable/swipeable) | Full content review |
| 6.2 | Video playback available in preview | Content verification |
| 6.3 | Photo zoom available in preview | Detail inspection |
| 6.4 | PDF page navigation available | Document review |
| 6.5 | Instructions text displayed (rendered markdown) | Text review |
| 6.6 | All metadata displayed (title, location, tags, etc.) | Full context |
| 6.7 | "Edit" action accessible from preview | Quick transition |
| 6.8 | "Close" returns to list | Navigation |
| 6.9 | Preview works as modal/drawer (not page navigation) | Component isolation |

-----

### Feature 7: Asset Management (Quick Edit)

**User Story:** As a property owner, I want to quickly add, remove, or reorder media within an item without going through the full edit flow.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 7.1 | Asset panel shows all media for selected item | Overview |
| 7.2 | Each asset shows thumbnail and type indicator | Identification |
| 7.3 | "Add" action opens file picker (photos, videos, PDFs) | Quick addition |
| 7.4 | "Remove" action on individual assets with confirmation | Cleanup |
| 7.5 | Drag-and-drop reordering of assets | Presentation control |
| 7.6 | Order change triggers onReorderAssets callback | Persist changes |
| 7.7 | New assets trigger onAddAssets callback | Persist changes |
| 7.8 | Removed assets trigger onRemoveAssets callback | Persist changes |
| 7.9 | "Done" closes panel and finalizes changes | Explicit completion |
| 7.10 | Changes are batched (not saved until "Done") | Intentional saves |

**Note:** Full editing (crop, trim, etc.) requires launching ItemCapture in edit mode. Asset management is for quick organizational changes only.

-----

### Feature 8: Property Context (Multi-Property Mode)

**User Story:** As a property owner with multiple rentals, I want to view and manage items across properties or scoped to a single property.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 8.1 | Single-property mode: items scoped to one property | Primary use case |
| 8.2 | Multi-property mode: items from all properties shown | Portfolio view |
| 8.3 | Property filter available in multi-property mode | Scoping |
| 8.4 | Property indicator shown on each item (multi-property) | Context |
| 8.5 | Bulk "move to property" action (multi-property) | Reorganization |
| 8.6 | Mode determined by props (properties array presence) | Configuration |

**Configuration:**
```tsx
// Single property (primary use case)
<ItemManager items={itemsForPropertyA} />

// Multi-property
<ItemManager 
  items={allItems} 
  properties={[propertyA, propertyB]} 
  config={{ multiPropertyMode: true }}
/>
```

-----

### Feature 9: Inline Metadata Edit

**User Story:** As a property owner, I want to quickly edit basic metadata (title, location, tags) without launching the full editor.

**Acceptance Criteria:**

| # | Criterion | Rationale |
|---|-----------|-----------|
| 9.1 | Title editable inline (click to edit) | Quick fixes |
| 9.2 | Location editable inline | Quick fixes |
| 9.3 | Tags editable inline (add/remove) | Quick organization |
| 9.4 | Changes trigger onUpdateItem callback | Persist |
| 9.5 | Inline edit can be disabled via config | Flexibility |
| 9.6 | Escape cancels inline edit | Standard UX |
| 9.7 | Enter/blur saves inline edit | Standard UX |

-----

## Technical Requirements

### Component Interface (Full)

```typescript
interface ItemManagerProps {
  // Required data
  items: ItemRecord[];
  
  // Optional data
  properties?: Property[];
  loading?: boolean;
  error?: Error | null;
  
  // Required callbacks
  onEditItem: (item: ItemRecord) => void;
  onDeleteItems: (ids: string[]) => void;
  onUpdateItem: (item: ItemRecord) => void;
  
  // Optional callbacks
  onAddAssets?: (itemId: string, assets: File[]) => void;
  onRemoveAssets?: (itemId: string, assetIds: string[]) => void;
  onReorderAssets?: (itemId: string, orderedIds: string[]) => void;
  onDuplicateItem?: (item: ItemRecord) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  
  // Configuration
  config?: ItemManagerConfig;
  
  // Render customization
  renderItem?: (item: ItemRecord, actions: ItemActions) => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
  renderLoadingState?: () => React.ReactNode;
  renderErrorState?: (error: Error) => React.ReactNode;
  renderToolbar?: (props: ToolbarRenderProps) => React.ReactNode;
  renderItemPreview?: (item: ItemRecord) => React.ReactNode;
  renderConfirmDialog?: (props: ConfirmDialogProps) => React.ReactNode;
  
  // Styling
  classNames?: ItemManagerClassNames;
}

interface ItemManagerConfig {
  // View options
  defaultView?: 'grid' | 'list';
  allowViewToggle?: boolean;
  
  // Feature flags
  enableBulkActions?: boolean;
  enableInlineEdit?: boolean;
  enableAssetManagement?: boolean;
  enableDuplicate?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSort?: boolean;
  
  // Multi-property
  multiPropertyMode?: boolean;
  
  // Constraints
  maxBulkSelection?: number;
  
  // Labels (for i18n)
  labels?: ItemManagerLabels;
}

interface ItemManagerClassNames {
  container?: string;
  toolbar?: string;
  searchInput?: string;
  filterPanel?: string;
  itemGrid?: string;
  itemList?: string;
  itemCard?: string;
  itemRow?: string;
  selectedItem?: string;
  previewModal?: string;
  assetPanel?: string;
  confirmDialog?: string;
  emptyState?: string;
  loadingState?: string;
}

interface ItemActions {
  edit: () => void;
  delete: () => void;
  duplicate: () => void;
  manageAssets: () => void;
  select: () => void;
  deselect: () => void;
  isSelected: boolean;
}

interface ToolbarRenderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  bulkActions: BulkActions;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant: 'danger' | 'warning' | 'info';
}
```

### Shared Types (From ItemCapture)

```typescript
interface ItemRecord {
  id: string;
  title: string;
  location?: string;
  tags?: string[];
  applianceType?: string;
  propertyId?: string;              // Added for multi-property
  contentType: 'media' | 'text-only' | 'pdf-only' | 'mixed';
  media: MediaItem[];
  instructions?: string;
  createdAt: Date;
  updatedAt?: Date;                 // Added for sort by modified
}

interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'pdf';
  file?: File | Blob;               // May not be present in list view
  url?: string;                     // For already-uploaded assets
  thumbnail?: Blob | string;        // Blob or URL
  order: number;
  metadata?: {
    duration?: number;
    dimensions?: { width: number; height: number };
    originalFilename?: string;
    pageCount?: number;
    mimeType?: string;
  };
}

interface Property {
  id: string;
  name: string;
  address?: string;
}

interface FilterState {
  search?: string;
  contentTypes?: Array<'video' | 'image' | 'pdf' | 'text-only' | 'mixed'>;
  tags?: string[];
  locations?: string[];
  propertyIds?: string[];
}

type SortOption = 
  | 'title-asc' 
  | 'title-desc' 
  | 'created-desc' 
  | 'created-asc' 
  | 'updated-desc' 
  | 'updated-asc'
  | 'location-asc';
```

### Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| iOS Safari | 15+ |
| Chrome (Android) | 90+ |
| Chrome (Desktop) | 90+ |
| Firefox | 90+ |
| Edge | 90+ |

### Performance Targets

| Metric | Target |
|--------|--------|
| Initial render (100 items) | < 500ms |
| Search/filter response | < 100ms |
| Scroll performance | 60fps |
| Selection toggle | < 50ms |
| Preview open | < 300ms |

### Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Tab through items, Enter to select/open |
| Screen reader support | ARIA labels, live regions for updates |
| Focus management | Trap focus in modals, return focus on close |
| Color contrast | Meet WCAG AA (via design system) |
| Reduced motion | Respect prefers-reduced-motion |

-----

## User Flows

### Primary Flow: Browse and Edit

```
┌─────────────────────────────────────────────┐
│              Item Manager                   │
│  ┌─────────────────────────────────────┐    │
│  │ 🔍 Search...    [Filters▾] [Grid│List] │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ │       │
│  │ │ 📹  │ │ │ │ 📷  │ │ │ │ 📄  │ │       │
│  │ └─────┘ │ │ └─────┘ │ │ └─────┘ │       │
│  │ Coffee  │ │Thermo-  │ │ WiFi   │       │
│  │ Maker   │ │stat     │ │ Info   │       │
│  │ Kitchen │ │ Hall    │ │ Entry  │       │
│  └────┬────┘ └─────────┘ └─────────┘       │
│       │                                     │
└───────┼─────────────────────────────────────┘
        │ tap
        ▼
┌─────────────────────────────────────────────┐
│           Item Preview (Modal)              │
│  ┌─────────────────────────────────────┐    │
│  │         [Video Player]              │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Coffee Maker                               │
│  📍 Kitchen  🏷️ appliances, morning         │
│                                             │
│  Instructions:                              │
│  Press the power button and wait for...    │
│                                             │
│  [Edit] [Manage Assets] [Delete]    [Close] │
└──────────────┬──────────────────────────────┘
               │ tap Edit
               ▼
        ┌─────────────┐
        │ ItemCapture │
        │ (edit mode) │
        └──────┬──────┘
               │ onComplete
               ▼
        Return to ItemManager
        (item updated)
```

### Bulk Delete Flow

```
┌─────────────────────────────────────────────┐
│              Item Manager                   │
│  ┌─────────────────────────────────────┐    │
│  │ ☑️ 3 selected    [Delete] [Tag▾]    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ ☑️      │ │ ☑️      │ │ ☑️      │       │
│  │ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ │       │
│  │ │ 📹  │ │ │ │ 📷  │ │ │ │ 📄  │ │       │
│  │ └─────┘ │ │ └─────┘ │ │ └─────┘ │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
└─────────────────────────────────────────────┘
        │ tap Delete
        ▼
┌─────────────────────────────────────────────┐
│         ⚠️  Delete 3 items?                 │
│                                             │
│  • Coffee Maker                             │
│  • Thermostat                               │
│  • WiFi Info                                │
│                                             │
│  This action cannot be undone.              │
│                                             │
│           [Cancel]  [Delete All]            │
└─────────────────────────────────────────────┘
```

### Asset Management Flow

```
┌─────────────────────────────────────────────┐
│     Manage Assets: Coffee Maker             │
│─────────────────────────────────────────────│
│                                             │
│  Drag to reorder                            │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ ≡  📹 Video - 1:32        [Remove] │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ ≡  📷 Photo - control.jpg [Remove] │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ ≡  📷 Photo - label.jpg   [Remove] │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │         [+ Add Media]               │    │
│  └─────────────────────────────────────┘    │
│                                             │
│                              [Done]         │
└─────────────────────────────────────────────┘
```

-----

## Customization API

### Render Props for Full Control

```tsx
// Custom item rendering
<ItemManager
  items={items}
  renderItem={(item, actions) => (
    <MyCustomItemCard 
      item={item}
      onEdit={actions.edit}
      onSelect={actions.select}
      selected={actions.isSelected}
    />
  )}
/>

// Custom empty state
<ItemManager
  items={[]}
  renderEmptyState={() => (
    <MyEmptyState 
      icon={<CameraIcon />}
      title="No items yet"
      action={<Button onClick={onCreate}>Create your first item</Button>}
    />
  )}
/>

// Custom toolbar
<ItemManager
  items={items}
  renderToolbar={(props) => (
    <MyToolbar>
      <MySearchBox value={props.searchValue} onChange={props.onSearchChange} />
      <MyFilterMenu filters={props.activeFilters} onChange={props.onFilterChange} />
      {props.selectedCount > 0 && (
        <MyBulkActions 
          count={props.selectedCount}
          onDelete={props.bulkActions.delete}
        />
      )}
    </MyToolbar>
  )}
/>
```

### Styling Override

```tsx
// Class name overrides for design system integration
<ItemManager
  items={items}
  classNames={{
    container: 'my-ds-container',
    itemCard: 'my-ds-card my-ds-card--interactive',
    selectedItem: 'my-ds-card--selected',
    confirmDialog: 'my-ds-modal my-ds-modal--danger',
  }}
/>
```

### Feature Toggling

```tsx
// Minimal configuration
<ItemManager
  items={items}
  onEditItem={handleEdit}
  onDeleteItems={handleDelete}
  onUpdateItem={handleUpdate}
  config={{
    enableBulkActions: false,      // No multi-select
    enableAssetManagement: false,  // No quick asset edit
    enableInlineEdit: false,       // No inline metadata edit
    enableFilters: false,          // No filter panel
    allowViewToggle: false,        // Grid only
    defaultView: 'grid',
  }}
/>
```

-----

## Open Questions

1. **Pagination vs. infinite scroll?** For large item counts, which pattern is preferred?
2. **Optimistic updates?** Should UI update before callback confirms success?
3. **Undo support?** Should delete actions be reversible within session?
4. **Offline indicator?** Should component show when items may be stale?
5. **Drag-and-drop items?** Should users be able to reorder items themselves (beyond assets)?
6. **Keyboard shortcuts?** Which shortcuts should be standard vs. configurable?

-----

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-01-XX | — | Initial draft |
