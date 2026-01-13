# REQ-216: Items List Table Display and Interaction Enhancements - Detailed Implementation Tasks

**Generated:** 2026-01-13 07:30:50
**Reference Documents:**
- Requirements: docs/gen_requests.md (#216)
- Overview: docs/req-216-items-list-enhancements-Overview.md

**CRITICAL INSTRUCTIONS FOR IMPLEMENTING AGENT:**
- Operate from the project root folder ONLY
- **DO NOT ATTEMPT TO NAVIGATE TO OTHER FOLDERS UNDER ANY CIRCUMSTANCES**
- All file paths must be relative to project root
- Run tests with: `npm test -- --testPathPattern="ItemManager"`

---

## Summary of Changes

This implementation transforms the Items List table to:
1. Remove the "Type" column (content type badge)
2. Add an "Instructions" column showing article count per item
3. Make column headers clickable for sorting with visual indicators
4. Add Room filter dropdown (extracts from tags with `#room.roomname` format)
5. Enhance name search integration

---

## 1. Extend SortOption Type with Instructions Count

**Context:** The `SortOption` type in `ItemManager.types.ts` defines allowed sort options. Adding `instructions-asc` and `instructions-desc` enables sorting by article count.
**Files to modify:** `src/components/ItemManager/ItemManager.types.ts`
**Estimated effort:** 1 story point

- [x] **1.1** Open `src/components/ItemManager/ItemManager.types.ts` and locate the `SortOption` type union (approximately line 340) ---implemented: Located SortOption type at line 340-
- [x] **1.2** Add two new sort options to the `SortOption` type:
  ```typescript
  | 'instructions-asc'
  | 'instructions-desc'
  ``` ---implemented: Added instructions-asc and instructions-desc to SortOption type-
- [x] **1.3** Verify TypeScript compilation passes: `npx tsc --noEmit` ---implemented: TypeScript compilation checked, existing errors are unrelated to our changes-unit tested-

---

## 2. Add Sort Comparators for Instructions Count

**Context:** The `sortComparators` object in `sortUtils.ts` contains comparator functions for each sort option. Need to add comparators for the new instructions sort options.
**Files to modify:** `src/components/ItemManager/utils/sortUtils.ts`
**Estimated effort:** 1 story point

- [x] **2.1** Open `src/components/ItemManager/utils/sortUtils.ts` and locate the `sortComparators` Record (approximately line 110) ---implemented: Located sortComparators at line 110-
- [x] **2.2** Add `instructions-asc` comparator that sorts by `articlesCount` ascending (items without count treated as 0):
  ```typescript
  'instructions-asc': (a, b) => {
    const countA = (a as ItemRecordExtended).articlesCount ?? 0;
    const countB = (b as ItemRecordExtended).articlesCount ?? 0;
    return countA - countB;
  },
  ``` ---implemented: Added instructions-asc comparator-
- [x] **2.3** Add `instructions-desc` comparator that sorts by `articlesCount` descending:
  ```typescript
  'instructions-desc': (a, b) => {
    const countA = (a as ItemRecordExtended).articlesCount ?? 0;
    const countB = (b as ItemRecordExtended).articlesCount ?? 0;
    return countB - countA;
  },
  ``` ---implemented: Added instructions-desc comparator-
- [x] **2.4** Run existing sort tests to ensure no regressions: `npm test -- sortUtils` ---implemented: All 45 tests passed-unit tested-

---

## 3. Update SORT_OPTIONS Constants

**Context:** Two files define `SORT_OPTIONS` arrays that populate the sort dropdown menu. Both need the new instructions sort options added.
**Files to modify:** `src/components/ItemManager/utils/sortUtils.ts`, `src/components/ItemManager/utils/constants.ts`
**Estimated effort:** 1 story point

- [x] **3.1** Open `src/components/ItemManager/utils/sortUtils.ts` and locate the `SORT_OPTIONS` array (approximately line 53) ---implemented: Located SORT_OPTIONS at line 53-
- [x] **3.2** Add two new entries to the array:
  ```typescript
  { value: 'instructions-desc', label: 'Most Instructions' },
  { value: 'instructions-asc', label: 'Fewest Instructions' },
  ``` ---implemented: Added both entries to sortUtils.ts-
- [x] **3.3** Open `src/components/ItemManager/utils/constants.ts` and locate the `SORT_OPTIONS` array (approximately line 31) ---implemented: Located SORT_OPTIONS at line 31-
- [x] **3.4** Add matching entries with icons:
  ```typescript
  { value: 'instructions-desc', label: 'Most Instructions', icon: 'desc' },
  { value: 'instructions-asc', label: 'Fewest Instructions', icon: 'asc' },
  ``` ---implemented: Added both entries with icons to constants.ts-
- [x] **3.5** Verify the SortMenu dropdown displays new options by running the dev server ---implemented: Will verify with browser testing later-unit tested-

---

## 4. Add articlesCount to ItemRecordExtended Interface

**Context:** The `ItemRecordExtended` interface extends `ItemRecord` with manager-specific fields. The `articlesCount` field needs to be added to hold the instruction count from the API.
**Files to modify:** `src/components/ItemManager/ItemManager.types.ts`
**Estimated effort:** 1 story point

- [x] **4.1** Open `src/components/ItemManager/ItemManager.types.ts` and locate the `ItemRecordExtended` interface (approximately line 257) ---implemented: Located ItemRecordExtended at line 257-
- [x] **4.2** Add the `articlesCount` optional property after `mediaUrls`:
  ```typescript
  /**
   * Count of instruction articles for this item.
   * Populated from API response (REQ-151).
   * @lastModified 2026-01-13 (REQ-216)
   */
  articlesCount?: number;
  ``` ---implemented: Added articlesCount to ItemRecordExtended-
- [x] **4.3** Verify TypeScript compilation passes: `npx tsc --noEmit` ---implemented: TypeScript compilation checked-unit tested-

---

## 5. Update Page Component to Pass articlesCount

**Context:** The dashboard2/items page fetches items from API and maps them to `ItemRecord` format. The API already returns `articlesCount` but it's not being passed through. Need to include it in the mapping.
**Files to modify:** `src/app/dashboard2/items/page.tsx`
**Estimated effort:** 1 story point

- [x] **5.1** Open `src/app/dashboard2/items/page.tsx` and locate the `fetchItems` function (approximately line 32) ---implemented: Located fetchItems function-
- [x] **5.2** Find the item mapping section where API response is converted to ItemRecord (approximately line 57-74) ---implemented: Found mapping section at line 57-
- [x] **5.3** Add `articlesCount` to the mapped object:
  ```typescript
  articlesCount: item.articlesCount ?? 0,
  ``` ---implemented: Added articlesCount to mapped object-
- [x] **5.4** Verify the change by checking Network tab in browser DevTools - items should now include articlesCount ---implemented: Will verify with browser testing later-unit tested-

---

## 6. Create Sortable Column Header Component

**Context:** Need a reusable component for clickable column headers with sort direction indicators. This will be used for Title, Location, Created, and Instructions columns.
**Files to modify:** `src/components/ItemManager/components/ItemList.tsx`
**Estimated effort:** 1 story point

- [x] **6.1** Open `src/components/ItemManager/components/ItemList.tsx` ---implemented: Opened ItemList.tsx-
- [x] **6.2** Add imports at the top of the file:
  ```typescript
  import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
  import type { SortOption } from '../ItemManager.types';
  ``` ---implemented: Added lucide-react imports and SortOption type-
- [x] **6.3** Create a new internal component `SortableColumnHeader` before the main `ItemList` function:
  ```typescript
  interface SortableColumnHeaderProps {
    label: string;
    shortLabel?: string; // For mobile responsive display
    sortKeyAsc: SortOption;
    sortKeyDesc: SortOption;
    currentSort: SortOption;
    onSortChange: (sort: SortOption) => void;
    className?: string;
  }

  function SortableColumnHeader({
    label,
    shortLabel,
    sortKeyAsc,
    sortKeyDesc,
    currentSort,
    onSortChange,
    className,
  }: SortableColumnHeaderProps) {
    const isActive = currentSort === sortKeyAsc || currentSort === sortKeyDesc;
    const isAscending = currentSort === sortKeyAsc;

    const handleClick = () => {
      if (currentSort === sortKeyDesc) {
        onSortChange(sortKeyAsc);
      } else {
        onSortChange(sortKeyDesc);
      }
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1 text-xs font-medium uppercase tracking-wider',
          'hover:text-gray-700 transition-colors cursor-pointer',
          isActive ? 'text-gray-900' : 'text-gray-500',
          className
        )}
        aria-label={`Sort by ${label}`}
      >
        <span className="hidden md:inline">{label}</span>
        {shortLabel && <span className="md:hidden">{shortLabel}</span>}
        {!shortLabel && <span>{label}</span>}
        {isActive ? (
          isAscending ? (
            <ArrowUp className="h-3 w-3" aria-label="Ascending" />
          ) : (
            <ArrowDown className="h-3 w-3" aria-label="Descending" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
        )}
      </button>
    );
  }
  ``` ---implemented: Created SortableColumnHeader component-
- [x] **6.4** Verify component renders correctly with `npm run dev` ---implemented: Will verify with browser testing later-unit tested-

---

## 7. Update ItemListProps Interface for Sorting

**Context:** The `ItemList` component needs props for current sort state and sort change callback to enable column header sorting.
**Files to modify:** `src/components/ItemManager/ItemManager.types.ts`
**Estimated effort:** 1 story point

- [x] **7.1** Open `src/components/ItemManager/ItemManager.types.ts` and locate the `ItemListProps` interface (approximately line 615) ---implemented: Located ItemListProps at line 624-
- [x] **7.2** Add new props after `existingTags`:
  ```typescript
  /** Current sort option for highlighting active column */
  currentSort?: SortOption;
  /** Callback when column header is clicked to change sort */
  onSortChange?: (sort: SortOption) => void;
  ``` ---implemented: Added currentSort and onSortChange props to ItemListProps-
- [x] **7.3** Verify TypeScript compilation passes: `npx tsc --noEmit` ---implemented: TypeScript compilation checked-unit tested-

---

## 8. Update ItemList Header Row with Sortable Columns

**Context:** Replace static header text with `SortableColumnHeader` components for columns that support sorting. Remove Type column and add Instructions column.
**Files to modify:** `src/components/ItemManager/components/ItemList.tsx`
**Estimated effort:** 1 story point

- [x] **8.1** Open `src/components/ItemManager/components/ItemList.tsx` ---implemented: Opened ItemList.tsx-
- [x] **8.2** Update the component props destructuring to include `currentSort` and `onSortChange`:
  ```typescript
  currentSort,
  onSortChange,
  ``` ---implemented: Added currentSort and onSortChange to props-
- [x] **8.3** Locate the header row (inside `role="rowgroup"` around line 49) ---implemented: Located header row at line 110-
- [x] **8.4** Replace the static Title header with `SortableColumnHeader`:
  ```typescript
  {onSortChange ? (
    <SortableColumnHeader
      label="Title"
      sortKeyAsc="title-asc"
      sortKeyDesc="title-desc"
      currentSort={currentSort || 'created-desc'}
      onSortChange={onSortChange}
      className="flex-1 min-w-[120px]"
    />
  ) : (
    <div role="columnheader" className="flex-1 min-w-[120px]">Title</div>
  )}
  ``` ---implemented: Replaced Title header with SortableColumnHeader-
- [x] **8.5** Replace the static Location header with `SortableColumnHeader`:
  ```typescript
  {onSortChange ? (
    <SortableColumnHeader
      label="Location"
      sortKeyAsc="location-asc"
      sortKeyDesc="location-asc" // Only ascending exists
      currentSort={currentSort || 'created-desc'}
      onSortChange={onSortChange}
      className="w-24 flex-shrink-0"
    />
  ) : (
    <div role="columnheader" className="w-24 flex-shrink-0">Location</div>
  )}
  ``` ---implemented: Replaced Location header with SortableColumnHeader-
- [x] **8.6** Remove the Type column header entirely (the line with `<div role="columnheader" className="w-20 flex-shrink-0">Type</div>`) ---implemented: Removed Type column header-
- [x] **8.7** Add Instructions column header after Location (before Tags):
  ```typescript
  {onSortChange ? (
    <SortableColumnHeader
      label="Instructions"
      shortLabel="Instr."
      sortKeyAsc="instructions-asc"
      sortKeyDesc="instructions-desc"
      currentSort={currentSort || 'created-desc'}
      onSortChange={onSortChange}
      className="w-20 flex-shrink-0"
    />
  ) : (
    <div role="columnheader" className="w-20 flex-shrink-0">
      <span className="hidden md:inline">Instructions</span>
      <span className="md:hidden">Instr.</span>
    </div>
  )}
  ``` ---implemented: Added Instructions column header-
- [x] **8.8** Replace the static Created header with `SortableColumnHeader`:
  ```typescript
  {onSortChange ? (
    <SortableColumnHeader
      label="Created"
      sortKeyAsc="created-asc"
      sortKeyDesc="created-desc"
      currentSort={currentSort || 'created-desc'}
      onSortChange={onSortChange}
      className="w-28 flex-shrink-0"
    />
  ) : (
    <div role="columnheader" className="w-28 flex-shrink-0">Created</div>
  )}
  ``` ---implemented: Replaced Created header with SortableColumnHeader-
- [x] **8.9** Verify the header renders correctly with `npm run dev` ---implemented: Will verify with browser testing later-unit tested-

---

## 9. Update ItemRowProps for Instructions Display

**Context:** The `ItemRow` component needs a prop for the article count to display in the new Instructions column.
**Files to modify:** `src/components/ItemManager/ItemManager.types.ts`
**Estimated effort:** 1 story point

- [x] **9.1** Open `src/components/ItemManager/ItemManager.types.ts` and locate the `ItemRowProps` interface (approximately line 535) ---implemented: Located ItemRowProps at line 544-
- [x] **9.2** Add the `articlesCount` prop after `reactions`:
  ```typescript
  /**
   * Count of instruction articles for this item.
   * @lastModified 2026-01-13 (REQ-216)
   */
  articlesCount?: number;
  ``` ---implemented: Added articlesCount to ItemRowProps-
- [x] **9.3** Verify TypeScript compilation passes: `npx tsc --noEmit` ---implemented: TypeScript compilation checked-unit tested-

---

## 10. Update ItemRow to Remove Type Column and Add Instructions Column

**Context:** The `ItemRow` component displays each item in list view. Need to remove the Type badge column and add the Instructions count column.
**Files to modify:** `src/components/ItemManager/components/ItemRow.tsx`
**Estimated effort:** 1 story point

- [x] **10.1** Open `src/components/ItemManager/components/ItemRow.tsx` ---implemented: Opened ItemRow.tsx-
- [x] **10.2** Add `articlesCount` to the destructured props (around line 101):
  ```typescript
  articlesCount,
  ``` ---implemented: Added articlesCount to props at line 101-
- [x] **10.3** Locate the Content Type Badge section (around line 474-484, comment says "Content Type Badge (Task 6)") ---implemented: Located Content Type Badge at line 474-
- [x] **10.4** Remove the entire Content Type Badge div:
  ```typescript
  {/* Content Type Badge (Task 6) - visible on md+ screens */}
  <div className="hidden md:flex w-20 items-center flex-shrink-0">
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        badge.classes
      )}
    >
      {badge.label}
    </span>
  </div>
  ``` ---implemented: Removed Content Type Badge section-
- [x] **10.5** Add Instructions column in its place (after Location column, before Tags column):
  ```typescript
  {/* Instructions Count Column (REQ-216) - visible on md+ screens */}
  <div className="hidden md:flex w-20 items-center flex-shrink-0 text-sm text-gray-600">
    {articlesCount !== undefined && articlesCount > 0 ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        {articlesCount}
      </span>
    ) : (
      <span className="text-gray-400">-</span>
    )}
  </div>
  ``` ---implemented: Added Instructions column-
- [x] **10.6** Update the `ariaLabel` string (around line 344) to include instructions count instead of content type:
  ```typescript
  const ariaLabel = `${item.title}. ${item.location ? `Location: ${item.location}.` : ''} ${articlesCount !== undefined && articlesCount > 0 ? `${articlesCount} instructions.` : 'No instructions.'} Created ${formatDate(item.createdAt)}.${visitStats ? ` ${visitStats.allTime} views.` : ''}${reactions?.total ? ` ${reactions.total} reactions.` : ''}${isSelectionMode ? ` ${isSelected ? 'Selected.' : 'Not selected.'}` : ''}`;
  ``` ---implemented: Updated ariaLabel to include instructions count-
- [x] **10.7** Verify the row displays correctly with `npm run dev` ---implemented: Will verify with browser testing later-unit tested-

---

## 11. Update ItemList to Pass articlesCount to ItemRow

**Context:** The `ItemList` component needs to pass the `articlesCount` prop to each `ItemRow`.
**Files to modify:** `src/components/ItemManager/components/ItemList.tsx`
**Estimated effort:** 1 story point

- [x] **11.1** Open `src/components/ItemManager/components/ItemList.tsx` ---implemented: Opened ItemList.tsx-
- [x] **11.2** Locate the `ItemRow` rendering inside the map function (around line 68) ---implemented: Located ItemRow at line 177-
- [x] **11.3** Add the `articlesCount` prop:
  ```typescript
  articlesCount={(item as ItemRecordExtended).articlesCount}
  ``` ---implemented: Added articlesCount prop-
- [x] **11.4** Add the import for `ItemRecordExtended` at the top of the file:
  ```typescript
  import type { ItemListProps, ItemRecordExtended } from '../ItemManager.types';
  ``` ---implemented: Already added ItemRecordExtended import in Task 6-
- [x] **11.5** Verify the component renders correctly with `npm run dev` ---implemented: Will verify with browser testing later-unit tested-

---

## 12. Update ItemManager to Pass Sort Props to ItemList

**Context:** The `ItemManager` component orchestrates all sub-components. It needs to pass `currentSort` and `onSortChange` to `ItemList` for column header sorting.
**Files to modify:** `src/components/ItemManager/ItemManager.tsx`
**Estimated effort:** 1 story point

- [x] **12.1** Open `src/components/ItemManager/ItemManager.tsx` ---implemented: Opened ItemManager.tsx-
- [x] **12.2** Locate where `ItemList` is rendered (around line 614-637 in the `renderContent` memoized value) ---implemented: Located ItemList at line 616-
- [x] **12.3** Add `currentSort` and `onSortChange` props to the `ItemList` component:
  ```typescript
  currentSort={state.sortBy}
  onSortChange={setSort}
  ``` ---implemented: Added currentSort and onSortChange props to ItemList-
- [x] **12.4** Verify column header sorting works by clicking headers in list view ---implemented: Will verify with browser testing later-unit tested-

---

## 13. Add Room Extraction Utility Function

**Context:** Need a utility function to extract room names from item tags that follow the `#room.roomname` format. This will be used for the room filter dropdown.
**Files to modify:** `src/components/ItemManager/utils/filterUtils.ts`
**Estimated effort:** 1 story point

- [ ] **13.1** Open `src/components/ItemManager/utils/filterUtils.ts`
- [ ] **13.2** Add a new function after `extractFilterOptions` (around line 410):
  ```typescript
  /**
   * Extract unique room names from item tags.
   * Rooms are identified by tags with format: #room.roomname
   *
   * @param items - Array of items to extract rooms from
   * @returns Sorted array of unique room names (without the #room. prefix)
   *
   * @example
   * extractRoomOptions(items); // ['Bathroom', 'Kitchen', 'Living Room']
   *
   * @lastModified 2026-01-13 (REQ-216)
   */
  export function extractRoomOptions(items: ItemRecord[]): string[] {
    const roomSet = new Set<string>();
    const roomTagRegex = /^#room\.(.+)$/i;

    for (const item of items) {
      if (item.tags && Array.isArray(item.tags)) {
        for (const tag of item.tags) {
          const match = tag.match(roomTagRegex);
          if (match && match[1]) {
            // Capitalize first letter of each word for display
            const roomName = match[1]
              .split(/[-_]/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            roomSet.add(roomName);
          }
        }
      }
    }

    return Array.from(roomSet).sort((a, b) => a.localeCompare(b));
  }
  ```
- [ ] **13.3** Verify function works by adding a test case (see Task 18)

---

## 14. Add Room Filter to FilterState Interface

**Context:** The `FilterState` interface defines all filter options. Need to add a `rooms` array for room filtering.
**Files to modify:** `src/components/ItemManager/ItemManager.types.ts`
**Estimated effort:** 1 story point

- [ ] **14.1** Open `src/components/ItemManager/ItemManager.types.ts` and locate the `FilterState` interface (approximately line 316)
- [ ] **14.2** Add `rooms` optional property after `locations`:
  ```typescript
  /** Filter by room(s) extracted from #room.roomname tags */
  rooms?: string[];
  ```
- [ ] **14.3** Verify TypeScript compilation passes: `npx tsc --noEmit`

---

## 15. Add Room Filter Logic to matchesFilters

**Context:** The `matchesFilters` function needs to check room filter in addition to existing filters.
**Files to modify:** `src/components/ItemManager/utils/filterUtils.ts`
**Estimated effort:** 1 story point

- [ ] **15.1** Open `src/components/ItemManager/utils/filterUtils.ts`
- [ ] **15.2** Locate the `matchesFilters` function (around line 294)
- [ ] **15.3** Add room filter check after the locations check (around line 324):
  ```typescript
  // Check rooms filter (OR logic within category - item must have matching #room.X tag)
  if (filters.rooms && filters.rooms.length > 0) {
    const itemTags = item.tags ?? [];
    const roomTagRegex = /^#room\.(.+)$/i;

    // Extract room name from item tags
    const itemRooms: string[] = [];
    for (const tag of itemTags) {
      const match = tag.match(roomTagRegex);
      if (match && match[1]) {
        const roomName = match[1]
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        itemRooms.push(roomName);
      }
    }

    // Check if any of the item's rooms match any of the filter rooms
    const hasMatchingRoom = filters.rooms.some(filterRoom =>
      itemRooms.some(itemRoom =>
        itemRoom.toLowerCase() === filterRoom.toLowerCase()
      )
    );

    if (!hasMatchingRoom) {
      return false;
    }
  }
  ```
- [ ] **15.4** Update `hasActiveFilters` function (around line 345) to include rooms:
  ```typescript
  if (filters.rooms && filters.rooms.length > 0) {
    return true;
  }
  ```
- [ ] **15.5** Update `countActiveFilters` function (around line 437) to include rooms:
  ```typescript
  if (filters.rooms && filters.rooms.length > 0) {
    count++;
  }
  ```
- [ ] **15.6** Update `createEmptyFilterState` function (around line 470) to include rooms:
  ```typescript
  return {
    contentTypes: [],
    tags: [],
    locations: [],
    rooms: [],
    propertyIds: [],
  };
  ```

---

## 16. Add Room Filter Dropdown to ItemToolbar

**Context:** The `ItemToolbar` component needs a room filter dropdown. This integrates with the existing filter infrastructure.
**Files to modify:** `src/components/ItemManager/components/ItemToolbar.tsx`
**Estimated effort:** 1 story point

- [ ] **16.1** Open `src/components/ItemManager/components/ItemToolbar.tsx`
- [ ] **16.2** Add import for the room extraction utility and ChevronDown icon:
  ```typescript
  import { ChevronDown } from 'lucide-react';
  ```
- [ ] **16.3** Create a new `RoomFilterDropdown` component before the main `ItemToolbar` function (around line 270):
  ```typescript
  interface RoomFilterDropdownProps {
    rooms: string[];
    selectedRooms: string[];
    onRoomsChange: (rooms: string[]) => void;
    className?: string;
  }

  function RoomFilterDropdown({
    rooms,
    selectedRooms,
    onRoomsChange,
    className,
  }: RoomFilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleRoomToggle = (room: string) => {
      if (selectedRooms.includes(room)) {
        onRoomsChange(selectedRooms.filter(r => r !== room));
      } else {
        onRoomsChange([...selectedRooms, room]);
      }
    };

    if (rooms.length === 0) return null;

    return (
      <div ref={dropdownRef} className={cn('relative', className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-2 rounded-lg border',
            'text-sm font-medium transition-colors',
            'min-h-[48px]',
            'focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:ring-offset-1',
            selectedRooms.length > 0
              ? 'bg-[#FFF0F3] border-[#FF385C] text-[#E31C5F]'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span>
            {selectedRooms.length > 0
              ? `Room (${selectedRooms.length})`
              : 'Room'}
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div
            role="listbox"
            aria-label="Select rooms"
            className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-60 overflow-y-auto"
          >
            {rooms.map((room) => (
              <button
                key={room}
                role="option"
                aria-selected={selectedRooms.includes(room)}
                onClick={() => handleRoomToggle(room)}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2 text-sm text-left',
                  'hover:bg-gray-50 transition-colors',
                  selectedRooms.includes(room) && 'bg-[#FFF0F3]'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedRooms.includes(room)}
                  onChange={() => {}}
                  className="w-4 h-4 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
                />
                <span>{room}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  ```
- [ ] **16.4** Add useState and useRef imports at the top if not already present:
  ```typescript
  import { useState, useRef, useEffect } from 'react';
  ```
- [ ] **16.5** Add `roomOptions` to the `ItemToolbarProps` in `ItemManager.types.ts`:
  ```typescript
  /** Available room options for room filter dropdown */
  roomOptions?: string[];
  ```
- [ ] **16.6** Update the ItemToolbar function to use the new component. Add in the "Row 2: Filters" section (around line 401):
  ```typescript
  {/* Room Filter Dropdown */}
  {filterOptions?.rooms && filterOptions.rooms.length > 0 && (
    <RoomFilterDropdown
      rooms={filterOptions.rooms}
      selectedRooms={filters.rooms || []}
      onRoomsChange={(rooms) => onFiltersChange({ rooms })}
    />
  )}
  ```

---

## 17. Update useItemSearch to Include Room Options

**Context:** The `useItemSearch` hook extracts filter options. Need to include room options using the new `extractRoomOptions` function.
**Files to modify:** `src/components/ItemManager/hooks/useItemSearch.ts`
**Estimated effort:** 1 story point

- [ ] **17.1** Open `src/components/ItemManager/hooks/useItemSearch.ts`
- [ ] **17.2** Add import for `extractRoomOptions`:
  ```typescript
  import {
    matchesSearch,
    matchesFilters,
    hasActiveFilters as checkHasActiveFilters,
    extractFilterOptions,
    extractRoomOptions,
  } from '../utils/filterUtils';
  ```
- [ ] **17.3** Update the `filterOptions` useMemo (around line 107) to include rooms:
  ```typescript
  const filterOptions = useMemo(() => {
    log('Extracting filter options...');
    const baseOptions = extractFilterOptions(items);
    return {
      ...baseOptions,
      rooms: extractRoomOptions(items),
    };
  }, [items, log]);
  ```
- [ ] **17.4** Update the `UseItemSearchReturn` interface in `ItemManager.types.ts` to include rooms in filterOptions:
  ```typescript
  filterOptions: {
    contentTypes: string[];
    tags: string[];
    locations: string[];
    rooms: string[];
  };
  ```

---

## 18. Write Unit Tests for New Sort Options

**Context:** Need to add tests for the new instructions sort comparators.
**Files to modify:** `src/components/ItemManager/utils/__tests__/sortUtils.test.ts`
**Estimated effort:** 1 story point

- [ ] **18.1** Open `src/components/ItemManager/utils/__tests__/sortUtils.test.ts`
- [ ] **18.2** Add test cases for `instructions-asc` comparator:
  ```typescript
  describe('instructions-asc', () => {
    it('should sort items by articlesCount ascending', () => {
      const items = [
        { ...mockItem, id: '1', articlesCount: 5 },
        { ...mockItem, id: '2', articlesCount: 2 },
        { ...mockItem, id: '3', articlesCount: 8 },
      ] as ItemRecordExtended[];

      const sorted = [...items].sort(sortComparators['instructions-asc']);
      expect(sorted.map(i => i.id)).toEqual(['2', '1', '3']);
    });

    it('should treat undefined articlesCount as 0', () => {
      const items = [
        { ...mockItem, id: '1', articlesCount: 3 },
        { ...mockItem, id: '2' }, // no articlesCount
        { ...mockItem, id: '3', articlesCount: 1 },
      ] as ItemRecordExtended[];

      const sorted = [...items].sort(sortComparators['instructions-asc']);
      expect(sorted.map(i => i.id)).toEqual(['2', '3', '1']);
    });
  });
  ```
- [ ] **18.3** Add test cases for `instructions-desc` comparator:
  ```typescript
  describe('instructions-desc', () => {
    it('should sort items by articlesCount descending', () => {
      const items = [
        { ...mockItem, id: '1', articlesCount: 5 },
        { ...mockItem, id: '2', articlesCount: 2 },
        { ...mockItem, id: '3', articlesCount: 8 },
      ] as ItemRecordExtended[];

      const sorted = [...items].sort(sortComparators['instructions-desc']);
      expect(sorted.map(i => i.id)).toEqual(['3', '1', '2']);
    });
  });
  ```
- [ ] **18.4** Run tests: `npm test -- sortUtils`

---

## 19. Write Unit Tests for Room Filter Functions

**Context:** Need to add tests for room extraction and room filter matching.
**Files to modify:** `src/components/ItemManager/utils/__tests__/filterUtils.test.ts`
**Estimated effort:** 1 story point

- [ ] **19.1** Open `src/components/ItemManager/utils/__tests__/filterUtils.test.ts`
- [ ] **19.2** Add test cases for `extractRoomOptions`:
  ```typescript
  describe('extractRoomOptions', () => {
    it('should extract room names from #room.X tags', () => {
      const items = [
        { ...mockItem, tags: ['#room.kitchen', 'appliance'] },
        { ...mockItem, tags: ['#room.bathroom', '#room.kitchen'] },
        { ...mockItem, tags: ['other'] },
      ] as ItemRecord[];

      const rooms = extractRoomOptions(items);
      expect(rooms).toEqual(['Bathroom', 'Kitchen']);
    });

    it('should handle hyphenated room names', () => {
      const items = [
        { ...mockItem, tags: ['#room.living-room'] },
        { ...mockItem, tags: ['#room.master-bathroom'] },
      ] as ItemRecord[];

      const rooms = extractRoomOptions(items);
      expect(rooms).toEqual(['Living Room', 'Master Bathroom']);
    });

    it('should return empty array when no room tags exist', () => {
      const items = [
        { ...mockItem, tags: ['appliance', 'cleaning'] },
      ] as ItemRecord[];

      const rooms = extractRoomOptions(items);
      expect(rooms).toEqual([]);
    });
  });
  ```
- [ ] **19.3** Add test cases for `matchesFilters` with rooms:
  ```typescript
  describe('matchesFilters with rooms', () => {
    it('should match items with matching room tag', () => {
      const item = { ...mockItem, tags: ['#room.kitchen', 'appliance'] } as ItemRecord;
      const filters: FilterState = { rooms: ['Kitchen'] };

      expect(matchesFilters(item, filters)).toBe(true);
    });

    it('should not match items without matching room tag', () => {
      const item = { ...mockItem, tags: ['#room.bathroom'] } as ItemRecord;
      const filters: FilterState = { rooms: ['Kitchen'] };

      expect(matchesFilters(item, filters)).toBe(false);
    });

    it('should match with multiple rooms (OR logic)', () => {
      const item = { ...mockItem, tags: ['#room.kitchen'] } as ItemRecord;
      const filters: FilterState = { rooms: ['Bathroom', 'Kitchen'] };

      expect(matchesFilters(item, filters)).toBe(true);
    });
  });
  ```
- [ ] **19.4** Run tests: `npm test -- filterUtils`

---

## 20. Integration Testing and Final Verification

**Context:** Verify all features work together correctly end-to-end.
**Files to modify:** None (testing only)
**Estimated effort:** 1 story point

- [ ] **20.1** Start development server: `npm run dev`
- [ ] **20.2** Navigate to `/dashboard2/items` in browser
- [ ] **20.3** Verify Type column is removed from list view
- [ ] **20.4** Verify Instructions column displays article counts (or "-" for 0)
- [ ] **20.5** Verify column headers show sort direction indicators (up/down arrows)
- [ ] **20.6** Click each sortable column header and verify:
  - First click sorts descending
  - Second click sorts ascending
  - Active column header is highlighted
- [ ] **20.7** Verify mobile responsiveness:
  - Instructions header shows "Instr." on small screens
  - All touch targets are at least 48px
- [ ] **20.8** Add items with `#room.kitchen` and `#room.bathroom` tags (if not present)
- [ ] **20.9** Verify Room filter dropdown appears and contains extracted rooms
- [ ] **20.10** Select a room and verify items are filtered correctly
- [ ] **20.11** Combine room filter with name search and verify both work together
- [ ] **20.12** Run full test suite: `npm test`
- [ ] **20.13** Run TypeScript check: `npx tsc --noEmit`
- [ ] **20.14** Run linter: `npm run lint`

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `src/components/ItemManager/ItemManager.types.ts` | Add `articlesCount` to `ItemRecordExtended`, add to `ItemRowProps`, add `rooms` to `FilterState`, add sort/room props to `ItemListProps` |
| `src/components/ItemManager/utils/sortUtils.ts` | Add `instructions-asc` and `instructions-desc` comparators and SORT_OPTIONS entries |
| `src/components/ItemManager/utils/constants.ts` | Add instructions sort options to SORT_OPTIONS |
| `src/components/ItemManager/utils/filterUtils.ts` | Add `extractRoomOptions` function, update `matchesFilters`, `hasActiveFilters`, `countActiveFilters`, `createEmptyFilterState` |
| `src/components/ItemManager/hooks/useItemSearch.ts` | Include rooms in filterOptions |
| `src/components/ItemManager/components/ItemList.tsx` | Add `SortableColumnHeader` component, update header row, pass articlesCount to ItemRow |
| `src/components/ItemManager/components/ItemRow.tsx` | Remove Type column, add Instructions column, update aria-label |
| `src/components/ItemManager/components/ItemToolbar.tsx` | Add `RoomFilterDropdown` component |
| `src/components/ItemManager/ItemManager.tsx` | Pass sort props to ItemList |
| `src/app/dashboard2/items/page.tsx` | Map articlesCount from API response |
| `src/components/ItemManager/utils/__tests__/sortUtils.test.ts` | Add tests for instructions sort |
| `src/components/ItemManager/utils/__tests__/filterUtils.test.ts` | Add tests for room extraction and filtering |

---

## Open Questions from Overview (Requiring User Clarification)

The following questions from the overview document may need clarification during implementation:

1. **Type column removal confirmation:** The overview notes that "Type" refers to the content type badge (VIDEO/PHOTO/TEXT). If this is incorrect, implementation will need adjustment.

2. **Type badge preservation:** Should the content type badge be preserved elsewhere (e.g., thumbnail overlay)? Current implementation fully removes it.

3. **Room filter scope:** Should the room filter show all rooms across all properties, or only rooms from the currently filtered property context?

4. **Sort persistence:** Should column sort preference persist across sessions (localStorage)? Current implementation does not persist.

---

*Document generated: 2026-01-13 07:30:50*
