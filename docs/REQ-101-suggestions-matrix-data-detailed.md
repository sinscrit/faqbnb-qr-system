# REQ-101: Comprehensive Suggestions Matrix Data Population - Detailed Task Breakdown

**Document Created:** 2026-01-05 17:15 UTC
**Last Modified:** 2026-01-05 05:46 UTC
**Request ID:** REQ-101
**Phase:** 2 - Selection Steps (1-3)
**Task ID:** 2.4
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Overview Document:** [REQ-101-suggestions-matrix-data-overview.md](./REQ-101-suggestions-matrix-data-overview.md)
**Status:** COMPLETED

---

## Document Purpose

This document transforms the REQ-101 overview into granular, implementation-ready tasks that an AI coding agent or junior developer can execute step-by-step. Each task is designed to be <= 1 story point (a few hours of focused work) with clear acceptance criteria and verification steps.

---

## Implementation Context

### Current State Analysis

The file `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts` contains:

| Room Type | Appliance Count | Room Item Count | General Info Count |
|-----------|-----------------|-----------------|-------------------|
| Kitchen | 7 | 4 | 1 |
| Laundry | 3 | 3 | 1 |
| Bedroom | 3 | 3 | 2 |
| Bathroom | 3 | 4 | 2 |
| Living Room | 4 | 3 | 2 |
| Garage | 3 | 3 | 2 |
| Outdoor | 4 | 3 | 3 |
| General | 4 | 3 | 5 |
| Other | 0 | 0 | 0 (by design) |

**Target:** 6-12 suggestions per category per room (except "other" which remains empty).

### Authorized Files for Modification

| File | Path | Change Type |
|------|------|-------------|
| suggestionMatrix.ts | `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts` | Expand data arrays |
| suggestionMatrix.test.ts | `src/components/ItemCreationWorkflow/utils/__tests__/suggestionMatrix.test.ts` | Create test file |
| useSuggestions.test.ts | `src/components/ItemCreationWorkflow/hooks/__tests__/useSuggestions.test.ts` | Verify unchanged behavior |

### Files NOT to Modify

- `ItemCreationWorkflow.types.ts` - Types are complete
- `useSuggestions.ts` - Hook logic is complete
- `SpecificItemStep.tsx` - Component is complete
- `constants.ts` - No changes needed
- Any `index.ts` files - Exports unchanged

---

## Detailed Tasks

### Task 1: Expand Kitchen Suggestions [0.25 SP]

**Objective:** Add comprehensive kitchen-related suggestions covering common rental property items guests frequently need instructions for.

**File:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

**Current State:**
```typescript
kitchen: {
  appliance: [
    'Stove/Oven', 'Refrigerator', 'Microwave', 'Dishwasher',
    'Garbage Disposal', 'Coffee Maker', 'Toaster Oven',
  ],  // 7 items
  'room-item': ['Pantry', 'Cabinets', 'Sink/Faucet', 'Ice Maker'],  // 4 items
  'general-info': ['Trash & Recycling'],  // 1 item
}
```

**Implementation Steps:**

1. **Open** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

2. **Add to `kitchen.appliance` array** (after 'Toaster Oven'):
   - `'Blender'`
   - `'Electric Kettle'`
   - `'Air Fryer'`
   - `'Instant Pot'`

3. **Add to `kitchen['room-item']` array** (after 'Ice Maker'):
   - `'Spice Rack'`
   - `'Cutting Boards'`
   - `'Pots & Pans'`
   - `'Utensil Drawer'`

4. **Add to `kitchen['general-info']` array** (after 'Trash & Recycling'):
   - `'Composting'`
   - `'Dish Soap Location'`
   - `'Food Storage'`

5. **Update `@lastModified` comment** at top of file to current date with REQ-101 reference

**Expected Result:**
- Kitchen appliances: 11 items
- Kitchen room-items: 8 items
- Kitchen general-info: 4 items

**Verification Steps:**
- [ ] Open file and confirm new items added with correct Title Case formatting
- [ ] Verify no syntax errors (commas between array items)
- [ ] Confirm "/" used for alternatives (existing pattern preserved)
- [ ] Run `npm run type-check` to verify no TypeScript errors

**Acceptance Criteria:**
- [ ] Kitchen appliance array contains 11 items
- [ ] Kitchen room-item array contains 8 items
- [ ] Kitchen general-info array contains 4 items
- [ ] All items use Title Case (e.g., "Electric Kettle" not "electric kettle")
- [ ] File compiles without errors

---

### Task 2: Expand Laundry Suggestions [0.25 SP]

**Objective:** Add laundry-related suggestions covering garment care and laundry room items.

**File:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

**Current State:**
```typescript
laundry: {
  appliance: ['Washer', 'Dryer', 'Washer/Dryer Combo'],  // 3 items
  'room-item': ['Ironing Board', 'Drying Rack', 'Laundry Supplies'],  // 3 items
  'general-info': ['Detergent Instructions'],  // 1 item
}
```

**Implementation Steps:**

1. **Add to `laundry.appliance` array** (after 'Washer/Dryer Combo'):
   - `'Steamer'`
   - `'Iron'`

2. **Add to `laundry['room-item']` array** (after 'Laundry Supplies'):
   - `'Laundry Basket'`
   - `'Hangers'`
   - `'Stain Remover'`
   - `'Lint Roller'`

3. **Add to `laundry['general-info']` array** (after 'Detergent Instructions'):
   - `'Cycle Settings'`
   - `'Laundry Schedule'`
   - `'Dryer Lint Trap'`

**Expected Result:**
- Laundry appliances: 5 items
- Laundry room-items: 7 items
- Laundry general-info: 4 items

**Verification Steps:**
- [ ] Confirm new items added with correct formatting
- [ ] No duplicate items within the category
- [ ] Run `npm run type-check`

**Acceptance Criteria:**
- [ ] Laundry appliance array contains 5 items
- [ ] Laundry room-item array contains 7 items
- [ ] Laundry general-info array contains 4 items
- [ ] All items use Title Case formatting

---

### Task 3: Expand Bedroom Suggestions [0.25 SP]

**Objective:** Add bedroom-related suggestions covering furniture and sleep amenities.

**File:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

**Current State:**
```typescript
bedroom: {
  appliance: ['TV/Entertainment', 'Ceiling Fan', 'Space Heater'],  // 3 items
  'room-item': ['Closet', 'Safe/Lock Box', 'Window Treatments'],  // 3 items
  'general-info': ['Bedding Info', 'Extra Blankets Location'],  // 2 items
}
```

**Implementation Steps:**

1. **Add to `bedroom.appliance` array** (after 'Space Heater'):
   - `'Air Conditioner'`
   - `'Air Purifier'`
   - `'Sound Machine'`
   - `'Alarm Clock'`

2. **Add to `bedroom['room-item']` array** (after 'Window Treatments'):
   - `'Dresser'`
   - `'Nightstand'`
   - `'Bed Frame'`
   - `'Mirror'`
   - `'Desk/Workspace'`
   - `'Luggage Rack'`

3. **Add to `bedroom['general-info']` array** (after 'Extra Blankets Location'):
   - `'Pillow Options'`
   - `'Light Switches'`
   - `'Outlet Locations'`

**Expected Result:**
- Bedroom appliances: 7 items
- Bedroom room-items: 9 items
- Bedroom general-info: 5 items

**Verification Steps:**
- [ ] Confirm new items added with correct formatting
- [ ] Verify "/" pattern used correctly for "Desk/Workspace"
- [ ] Run `npm run type-check`

**Acceptance Criteria:**
- [ ] Bedroom appliance array contains 7 items
- [ ] Bedroom room-item array contains 9 items
- [ ] Bedroom general-info array contains 5 items

---

### Task 4: Expand Bathroom Suggestions [0.25 SP]

**Objective:** Add bathroom-related suggestions covering fixtures and guest amenities.

**File:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

**Current State:**
```typescript
bathroom: {
  appliance: ['Hair Dryer', 'Exhaust Fan', 'Heated Towel Rack'],  // 3 items
  'room-item': ['Shower', 'Bathtub', 'Toilet', 'Medicine Cabinet'],  // 4 items
  'general-info': ['Toiletries Location', 'Towel Storage'],  // 2 items
}
```

**Implementation Steps:**

1. **Add to `bathroom.appliance` array** (after 'Heated Towel Rack'):
   - `'Electric Razor'`
   - `'Curling Iron'`
   - `'Heated Floor'`

2. **Add to `bathroom['room-item']` array** (after 'Medicine Cabinet'):
   - `'Vanity'`
   - `'Towel Hooks'`
   - `'Shower Caddy'`
   - `'Scale'`
   - `'Trash Can'`

3. **Add to `bathroom['general-info']` array** (after 'Towel Storage'):
   - `'Water Pressure'`
   - `'Hot Water'`
   - `'Cleaning Supplies'`

**Expected Result:**
- Bathroom appliances: 6 items
- Bathroom room-items: 9 items
- Bathroom general-info: 5 items

**Verification Steps:**
- [ ] Confirm new items added with correct formatting
- [ ] Run `npm run type-check`

**Acceptance Criteria:**
- [ ] Bathroom appliance array contains 6 items
- [ ] Bathroom room-item array contains 9 items
- [ ] Bathroom general-info array contains 5 items

---

### Task 5: Expand Living Room Suggestions [0.25 SP]

**Objective:** Add living room suggestions covering entertainment and seating areas.

**File:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

**Current State:**
```typescript
'living-room': {
  appliance: ['TV/Smart TV', 'Sound System', 'Fireplace', 'Ceiling Fan'],  // 4 items
  'room-item': ['Entertainment Center', 'Window Treatments', 'Thermostat'],  // 3 items
  'general-info': ['Remote Controls', 'Streaming Services'],  // 2 items
}
```

**Implementation Steps:**

1. **Add to `'living-room'.appliance` array** (after 'Ceiling Fan'):
   - `'Gaming Console'`
   - `'DVD/Blu-ray Player'`
   - `'Air Conditioner'`
   - `'Humidifier'`

2. **Add to `'living-room'['room-item']` array** (after 'Thermostat'):
   - `'Sofa/Couch'`
   - `'Coffee Table'`
   - `'Bookshelf'`
   - `'Area Rug'`
   - `'Lamps'`
   - `'Charging Station'`

3. **Add to `'living-room'['general-info']` array** (after 'Streaming Services'):
   - `'TV Channels'`
   - `'Speaker Instructions'`
   - `'Board Games'`

**Expected Result:**
- Living Room appliances: 8 items
- Living Room room-items: 9 items
- Living Room general-info: 5 items

**Verification Steps:**
- [ ] Confirm correct use of quoted key `'living-room'`
- [ ] Verify "/" pattern used correctly for "Sofa/Couch" and "DVD/Blu-ray Player"
- [ ] Run `npm run type-check`

**Acceptance Criteria:**
- [ ] Living Room appliance array contains 8 items
- [ ] Living Room room-item array contains 9 items
- [ ] Living Room general-info array contains 5 items

---

### Task 6: Expand Garage Suggestions [0.25 SP]

**Objective:** Add garage suggestions covering tools, equipment, and storage.

**File:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

**Current State:**
```typescript
garage: {
  appliance: ['Garage Door Opener', 'EV Charger', 'Freezer'],  // 3 items
  'room-item': ['Tool Storage', 'Bike Storage', 'Recycling Bins'],  // 3 items
  'general-info': ['Parking Instructions', 'Storage Areas'],  // 2 items
}
```

**Implementation Steps:**

1. **Add to `garage.appliance` array** (after 'Freezer'):
   - `'Shop Vac'`
   - `'Workbench Light'`
   - `'Air Compressor'`

2. **Add to `garage['room-item']` array** (after 'Recycling Bins'):
   - `'Lawn Mower'`
   - `'Snow Blower'`
   - `'Ladder'`
   - `'Sports Equipment'`
   - `'Beach Gear'`
   - `'Camping Gear'`

3. **Add to `garage['general-info']` array** (after 'Storage Areas'):
   - `'Car Washing'`
   - `'Emergency Kit'`
   - `'Trash Bins'`

**Expected Result:**
- Garage appliances: 6 items
- Garage room-items: 9 items
- Garage general-info: 5 items

**Verification Steps:**
- [ ] Confirm new items added with correct formatting
- [ ] Run `npm run type-check`

**Acceptance Criteria:**
- [ ] Garage appliance array contains 6 items
- [ ] Garage room-item array contains 9 items
- [ ] Garage general-info array contains 5 items

---

### Task 7: Expand Outdoor Suggestions [0.25 SP]

**Objective:** Add outdoor suggestions covering patio, pool, and landscaping items.

**File:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

**Current State:**
```typescript
outdoor: {
  appliance: ['Grill/BBQ', 'Pool Equipment', 'Hot Tub', 'Sprinkler System'],  // 4 items
  'room-item': ['Patio Furniture', 'Outdoor Lighting', 'Garden Tools'],  // 3 items
  'general-info': ['Gate Access', 'Pool Rules', 'Trash Pickup Days'],  // 3 items
}
```

**Implementation Steps:**

1. **Add to `outdoor.appliance` array** (after 'Sprinkler System'):
   - `'Outdoor Heater'`
   - `'Fire Pit'`
   - `'Pressure Washer'`
   - `'Electric Bug Zapper'`

2. **Add to `outdoor['room-item']` array** (after 'Garden Tools'):
   - `'Umbrella/Shade'`
   - `'Outdoor Cushions'`
   - `'Hose & Nozzle'`
   - `'Fire Pit Tools'`
   - `'Outdoor Speakers'`
   - `'Bird Feeder'`

3. **Add to `outdoor['general-info']` array** (after 'Trash Pickup Days'):
   - `'Outdoor Dining'`
   - `'Wildlife Info'`
   - `'Quiet Hours'`
   - `'Garden Care'`

**Expected Result:**
- Outdoor appliances: 8 items
- Outdoor room-items: 9 items
- Outdoor general-info: 7 items

**Verification Steps:**
- [ ] Verify "/" pattern used correctly for "Umbrella/Shade" and "Hose & Nozzle"
- [ ] Confirm "&" used consistently (as in existing "Hose & Nozzle")
- [ ] Run `npm run type-check`

**Acceptance Criteria:**
- [ ] Outdoor appliance array contains 8 items
- [ ] Outdoor room-item array contains 9 items
- [ ] Outdoor general-info array contains 7 items

---

### Task 8: Expand General Suggestions [0.25 SP]

**Objective:** Add property-wide suggestions covering utilities, safety, and house-wide information.

**File:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

**Current State:**
```typescript
general: {
  appliance: ['HVAC/Thermostat', 'Water Heater', 'Security System', 'Smart Home Hub'],  // 4 items
  'room-item': ['Circuit Breaker', 'Water Shutoff', 'Fire Extinguisher'],  // 3 items
  'general-info': [
    'WiFi Password', 'Emergency Contacts', 'House Rules',
    'Check-out Instructions', 'Local Recommendations'
  ],  // 5 items
}
```

**Implementation Steps:**

1. **Add to `general.appliance` array** (after 'Smart Home Hub'):
   - `'Doorbell Camera'`
   - `'Smart Locks'`
   - `'Smoke Detectors'`
   - `'CO Detectors'`
   - `'Intercom'`

2. **Add to `general['room-item']` array** (after 'Fire Extinguisher'):
   - `'Fuse Box'`
   - `'Gas Shutoff'`
   - `'First Aid Kit'`
   - `'Flashlights'`
   - `'Batteries'`

3. **Add to `general['general-info']` array** (after 'Local Recommendations'):
   - `'Key Access'`
   - `'Alarm Code'`
   - `'Guest Manual'`
   - `'Parking Pass'`
   - `'Neighborhood Info'`

**Expected Result:**
- General appliances: 9 items
- General room-items: 8 items
- General general-info: 10 items

**Verification Steps:**
- [ ] Confirm WiFi spelling (not "Wifi" or "WIFI")
- [ ] Run `npm run type-check`

**Acceptance Criteria:**
- [ ] General appliance array contains 9 items
- [ ] General room-item array contains 8 items
- [ ] General general-info array contains 10 items

---

### Task 9: Naming Consistency Review [0.25 SP]

**Objective:** Review all suggestions for consistent naming conventions and correct any inconsistencies.

**File:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

**Implementation Steps:**

1. **Verify Title Case Formatting**
   - Review every item in SUGGESTION_MATRIX
   - Ensure format: "Electric Kettle" (not "electric kettle" or "ELECTRIC KETTLE")
   - Exception: Acronyms like "HVAC", "TV", "WiFi", "EV", "CO" stay uppercase

2. **Verify "/" Usage for Alternatives**
   - Pattern: "Option1/Option2" with no spaces around "/"
   - Examples: "Stove/Oven", "TV/Smart TV", "Washer/Dryer Combo"
   - Check all items containing "/" follow this pattern

3. **Verify "&" Usage**
   - Pattern: "Item1 & Item2" with spaces around "&"
   - Examples: "Trash & Recycling", "Pots & Pans", "Hose & Nozzle"

4. **Check for Duplicates**
   - Verify no item appears twice within the same room type
   - Note: Same item in different rooms is acceptable (e.g., "Air Conditioner" in bedroom and living room)

5. **Spelling Consistency Check**
   - WiFi (not Wifi, WIFI, or Wi-Fi)
   - Blu-ray (with hyphen)
   - Check-out (with hyphen when used as noun/adjective)

6. **Update file header comment** to reflect REQ-101 completion date

**Verification Steps:**
- [ ] Read through entire SUGGESTION_MATRIX visually
- [ ] Use text search for common inconsistencies: "wifi", "WIFI", " / ", " & "
- [ ] Run `npm run type-check` to ensure no syntax issues

**Acceptance Criteria:**
- [ ] All items use Title Case (except known acronyms)
- [ ] No spaces around "/" in alternatives
- [ ] Spaces around "&" in compound names
- [ ] No duplicate items within same room
- [ ] Consistent spelling throughout file

---

### Task 10: Create suggestionMatrix Unit Tests [0.5 SP]

**Objective:** Create comprehensive test coverage for the expanded suggestion matrix data.

**File to Create:** `src/components/ItemCreationWorkflow/utils/__tests__/suggestionMatrix.test.ts`

**Implementation Steps:**

1. **Create test file directory if needed** (likely exists based on existing sessionStorage.test.ts)

2. **Create file** with the following structure:

```typescript
/**
 * suggestionMatrix Unit Tests
 *
 * @module ItemCreationWorkflow/utils/__tests__/suggestionMatrix
 * @lastModified 2026-01-05 (REQ-101)
 */

import {
  SUGGESTION_MATRIX,
  getSuggestions,
  hasSuggestions,
  getAllSuggestionsForType,
  getAllSuggestions,
} from '../suggestionMatrix';
import type { RoomType, ItemType } from '../../ItemCreationWorkflow.types';

describe('SUGGESTION_MATRIX', () => {
  // Define required rooms and item types
  const REQUIRED_ROOMS: RoomType[] = [
    'kitchen', 'laundry', 'bedroom', 'bathroom',
    'living-room', 'garage', 'outdoor', 'general'
  ];

  const REQUIRED_TYPES: ItemType[] = ['appliance', 'room-item', 'general-info'];

  // ===========================================================================
  // Coverage Tests
  // ===========================================================================

  describe('data coverage', () => {
    REQUIRED_ROOMS.forEach(room => {
      describe(`${room}`, () => {
        REQUIRED_TYPES.forEach(type => {
          it(`should have at least 4 ${type} suggestions`, () => {
            const suggestions = getSuggestions(room, type);
            expect(suggestions.length).toBeGreaterThanOrEqual(4);
          });
        });
      });
    });

    it('should have "other" room with empty arrays', () => {
      REQUIRED_TYPES.forEach(type => {
        expect(getSuggestions('other', type)).toHaveLength(0);
      });
    });

    it('should have at least 100 total unique suggestions', () => {
      const all = getAllSuggestions();
      expect(all.length).toBeGreaterThanOrEqual(100);
    });
  });

  // ===========================================================================
  // Naming Convention Tests
  // ===========================================================================

  describe('naming conventions', () => {
    it('should use Title Case for all suggestions', () => {
      const all = getAllSuggestions();
      const invalidItems: string[] = [];

      all.forEach(item => {
        // Skip known acronyms
        const acronyms = ['HVAC', 'TV', 'WiFi', 'EV', 'CO', 'DVD', 'BBQ'];
        const hasAcronym = acronyms.some(a => item.includes(a));

        if (!hasAcronym) {
          // Check first letter of each word is uppercase
          const words = item.split(/[\s\/&-]+/);
          words.forEach(word => {
            if (word.length > 0 && word[0] !== word[0].toUpperCase()) {
              invalidItems.push(`"${item}" - word "${word}" not capitalized`);
            }
          });
        }
      });

      expect(invalidItems).toHaveLength(0);
    });

    it('should not have spaces around "/" in alternatives', () => {
      const all = getAllSuggestions();
      const invalid = all.filter(item => item.includes(' / ') || item.includes('/ ') || item.includes(' /'));
      expect(invalid).toHaveLength(0);
    });

    it('should use consistent WiFi spelling', () => {
      const all = getAllSuggestions();
      const hasCorrectWifi = all.some(s => s.includes('WiFi'));
      const hasIncorrectWifi = all.some(s =>
        s.toLowerCase().includes('wifi') && !s.includes('WiFi')
      );

      if (hasCorrectWifi || hasIncorrectWifi) {
        expect(hasIncorrectWifi).toBe(false);
      }
    });
  });

  // ===========================================================================
  // Function Tests
  // ===========================================================================

  describe('getSuggestions', () => {
    it('returns array for valid room + type', () => {
      const result = getSuggestions('kitchen', 'appliance');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for "other" room', () => {
      expect(getSuggestions('other', 'appliance')).toEqual([]);
    });
  });

  describe('hasSuggestions', () => {
    it('returns true for room with suggestions', () => {
      expect(hasSuggestions('kitchen', 'appliance')).toBe(true);
    });

    it('returns false for "other" room', () => {
      expect(hasSuggestions('other', 'appliance')).toBe(false);
    });
  });

  describe('getAllSuggestionsForType', () => {
    it('returns sorted unique suggestions for type', () => {
      const appliances = getAllSuggestionsForType('appliance');
      expect(appliances.length).toBeGreaterThan(0);

      // Check sorted
      const sorted = [...appliances].sort();
      expect(appliances).toEqual(sorted);

      // Check unique
      const unique = new Set(appliances);
      expect(unique.size).toBe(appliances.length);
    });
  });

  describe('getAllSuggestions', () => {
    it('returns sorted unique suggestions across all rooms/types', () => {
      const all = getAllSuggestions();
      expect(all.length).toBeGreaterThan(0);

      // Check sorted
      const sorted = [...all].sort();
      expect(all).toEqual(sorted);

      // Check unique
      const unique = new Set(all);
      expect(unique.size).toBe(all.length);
    });
  });
});
```

3. **Run tests** to verify all pass:
   ```bash
   npm test -- suggestionMatrix.test.ts
   ```

**Verification Steps:**
- [ ] Test file created in correct location
- [ ] All tests pass with `npm test`
- [ ] Coverage includes all 8 required room types
- [ ] Naming convention tests catch any inconsistencies

**Acceptance Criteria:**
- [ ] Test file exists at `src/components/ItemCreationWorkflow/utils/__tests__/suggestionMatrix.test.ts`
- [ ] All tests pass
- [ ] Tests verify minimum 4 suggestions per category per room
- [ ] Tests verify at least 100 total unique suggestions
- [ ] Tests verify naming conventions (Title Case, "/" usage)

---

### Task 11: Verify Existing Hook Tests [0.15 SP]

**Objective:** Run existing useSuggestions hook tests to ensure expanded data doesn't break current functionality.

**File:** `src/components/ItemCreationWorkflow/hooks/__tests__/useSuggestions.test.ts`

**Implementation Steps:**

1. **Run existing tests:**
   ```bash
   npm test -- useSuggestions.test.ts
   ```

2. **Verify all tests pass** - tests reference specific suggestions like 'Refrigerator', 'Washer', 'Closet' which should still exist

3. **If any tests fail:**
   - Check if failure is due to removed suggestions (should not happen, only additions made)
   - Check if failure is due to changed suggestions (should not happen)
   - Document any issues found

**Verification Steps:**
- [ ] Run `npm test -- useSuggestions.test.ts`
- [ ] All 15+ existing tests pass
- [ ] No regressions in created detection or memoization

**Acceptance Criteria:**
- [ ] All existing useSuggestions tests continue to pass
- [ ] No modifications needed to test file

---

### Task 12: Full Test Suite and Build Verification [0.15 SP]

**Objective:** Run full test suite and build to ensure no regressions.

**Implementation Steps:**

1. **Run full test suite:**
   ```bash
   npm test
   ```

2. **Run TypeScript type check:**
   ```bash
   npm run type-check
   ```

3. **Run build:**
   ```bash
   npm run build
   ```

4. **Document any failures and address them**

**Verification Steps:**
- [ ] `npm test` passes all tests
- [ ] `npm run type-check` completes without errors
- [ ] `npm run build` completes successfully

**Acceptance Criteria:**
- [ ] All tests pass (100% pass rate)
- [ ] No TypeScript errors
- [ ] Build completes successfully
- [ ] No new warnings introduced

---

## Task Summary

| Task | Description | Estimate | Files Modified |
|------|-------------|----------|----------------|
| 1 | Expand Kitchen Suggestions | 0.25 SP | suggestionMatrix.ts |
| 2 | Expand Laundry Suggestions | 0.25 SP | suggestionMatrix.ts |
| 3 | Expand Bedroom Suggestions | 0.25 SP | suggestionMatrix.ts |
| 4 | Expand Bathroom Suggestions | 0.25 SP | suggestionMatrix.ts |
| 5 | Expand Living Room Suggestions | 0.25 SP | suggestionMatrix.ts |
| 6 | Expand Garage Suggestions | 0.25 SP | suggestionMatrix.ts |
| 7 | Expand Outdoor Suggestions | 0.25 SP | suggestionMatrix.ts |
| 8 | Expand General Suggestions | 0.25 SP | suggestionMatrix.ts |
| 9 | Naming Consistency Review | 0.25 SP | suggestionMatrix.ts |
| 10 | Create suggestionMatrix Tests | 0.50 SP | suggestionMatrix.test.ts (new) |
| 11 | Verify Hook Tests | 0.15 SP | useSuggestions.test.ts (verify only) |
| 12 | Full Test & Build | 0.15 SP | None (verification only) |
| **Total** | | **2.8 SP (~0.7 days)** | |

---

## Recommended Execution Order

1. **Tasks 1-8** (Room expansions) - Can be done in any order or in sequence
2. **Task 9** (Naming consistency) - After all additions complete
3. **Task 10** (Create tests) - After Task 9 complete
4. **Task 11** (Verify hook tests) - After Task 10
5. **Task 12** (Full verification) - Final step

**Alternative Parallel Approach:**
- Tasks 1-4 can run in parallel with Tasks 5-8
- Task 9 must wait for 1-8
- Tasks 10-12 are sequential

---

## Expected Final State

### suggestionMatrix.ts Data Coverage

| Room Type | Appliances | Room Items | General Info | Total |
|-----------|------------|------------|--------------|-------|
| Kitchen | 11 | 8 | 4 | 23 |
| Laundry | 5 | 7 | 4 | 16 |
| Bedroom | 7 | 9 | 5 | 21 |
| Bathroom | 6 | 9 | 5 | 20 |
| Living Room | 8 | 9 | 5 | 22 |
| Garage | 6 | 9 | 5 | 20 |
| Outdoor | 8 | 9 | 7 | 24 |
| General | 9 | 8 | 10 | 27 |
| Other | 0 | 0 | 0 | 0 |
| **Total** | **60** | **68** | **45** | **173** |

**Note:** Some items may appear in multiple rooms (e.g., "Air Conditioner" in bedroom and living room), so unique count will be less than 173.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Typos in new items | Task 9 includes manual review; Task 10 tests naming conventions |
| Breaking existing tests | Task 11 specifically verifies no regression |
| Build failures | Task 12 runs full build before completion |
| Inconsistent naming | Task 9 dedicated to consistency review |

---

## References

- [Overview Document: REQ-101-suggestions-matrix-data-overview.md](./REQ-101-suggestions-matrix-data-overview.md)
- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](./prd/Plan-093-Item-Creation-Workflow.md)
- [Source File: suggestionMatrix.ts](../src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts)
- [Hook Tests: useSuggestions.test.ts](../src/components/ItemCreationWorkflow/hooks/__tests__/useSuggestions.test.ts)

---

*Detailed Task Breakdown generated on 2026-01-05 17:15 UTC for REQ-101: Comprehensive Suggestions Matrix Data Population*
