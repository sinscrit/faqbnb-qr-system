# REQ-101: Comprehensive Suggestions Matrix Data Population - Implementation Overview

**Document Created:** 2026-01-05 16:45 UTC
**Last Modified:** 2026-01-05 16:45 UTC
**Request ID:** REQ-101
**Phase:** 2 - Selection Steps (1-3)
**Task ID:** 2.4
**Type:** ENHANCEMENT
**Size:** M (Medium)

---

## Executive Summary

This document details the implementation approach for populating the suggestions matrix with comprehensive item data across all room types. The existing infrastructure (`suggestionMatrix.ts`, `useSuggestions` hook, `SpecificItemStep` component) is already in place. This task focuses solely on expanding the data coverage to include additional relevant items for each room type and item category combination.

---

## Context & Background

### Current State

The suggestions matrix infrastructure is complete and functional:
- `SUGGESTION_MATRIX` constant defined in `suggestionMatrix.ts`
- `getSuggestions()` and helper functions working correctly
- `useSuggestions` hook integrated with `SpecificItemStep`
- Basic suggestions exist for all 8 room types + "other"

### Gap Analysis

Current data coverage assessment:

| Room Type | Appliance Count | Room Item Count | General Info Count | Assessment |
|-----------|-----------------|-----------------|-------------------|------------|
| Kitchen | 7 | 4 | 1 | Good, needs expansion |
| Laundry | 3 | 3 | 1 | Minimal, needs expansion |
| Bedroom | 3 | 3 | 2 | Needs furniture items |
| Bathroom | 3 | 4 | 2 | Good, minor additions |
| Living Room | 4 | 3 | 2 | Needs seating/storage |
| Garage | 3 | 3 | 2 | Needs tool items |
| Outdoor | 4 | 3 | 3 | Needs landscaping |
| General | 4 | 3 | 5 | Needs utilities |
| Other | 0 | 0 | 0 | Empty (by design) |

### PRD Reference

From `Plan-093-Item-Creation-Workflow.md` Appendix A:

```typescript
export const SUGGESTION_MATRIX: Record<RoomType, Record<ItemType, string[]>> = {
  kitchen: {
    appliance: ['Stove/Oven', 'Refrigerator', 'Microwave', 'Dishwasher',
                'Garbage Disposal', 'Coffee Maker', 'Toaster Oven'],
    'room-item': ['Pantry', 'Cabinets', 'Sink/Faucet', 'Ice Maker'],
    'general-info': ['Trash & Recycling'],
  },
  // ... additional rooms
};
```

---

## Implementation Approach

### Strategy

This is a **data-only enhancement** - no structural changes to components, hooks, or utility functions. The implementation involves:

1. Analyzing common items in rental property documentation
2. Expanding each room's suggestion arrays with relevant items
3. Ensuring naming consistency across all suggestions
4. Verifying test coverage for expanded data

### Design Principles

1. **Contextual Relevance**: Each suggestion must be commonly found in rental properties
2. **Naming Consistency**: Use Title Case with "/" for alternatives (e.g., "Stove/Oven")
3. **Practical Utility**: Focus on items guests commonly need instructions for
4. **Appropriate Volume**: 6-10 suggestions per category (enough choice without overwhelming)

---

## Detailed Task Breakdown

### Task 1: Expand Kitchen Suggestions [0.25 SP]

**Current State:**
- Appliance: 7 items
- Room Item: 4 items
- General Info: 1 item

**Additions:**
```typescript
kitchen: {
  appliance: [
    // Existing: 'Stove/Oven', 'Refrigerator', 'Microwave', 'Dishwasher',
    //           'Garbage Disposal', 'Coffee Maker', 'Toaster Oven'
    'Blender',           // Common for smoothies/drinks
    'Electric Kettle',   // Popular for tea/coffee guests
    'Air Fryer',         // Increasingly common appliance
    'Instant Pot',       // Multi-cooker popularity
  ],
  'room-item': [
    // Existing: 'Pantry', 'Cabinets', 'Sink/Faucet', 'Ice Maker'
    'Spice Rack',        // Where to find seasonings
    'Cutting Boards',    // Location of prep items
    'Pots & Pans',       // Cookware storage
    'Utensil Drawer',    // Kitchen tool location
  ],
  'general-info': [
    // Existing: 'Trash & Recycling'
    'Composting',        // Eco-conscious properties
    'Dish Soap Location',// Common guest question
    'Food Storage',      // Where to store groceries
  ],
}
```

### Task 2: Expand Laundry Suggestions [0.25 SP]

**Current State:**
- Appliance: 3 items
- Room Item: 3 items
- General Info: 1 item

**Additions:**
```typescript
laundry: {
  appliance: [
    // Existing: 'Washer', 'Dryer', 'Washer/Dryer Combo'
    'Steamer',           // Garment care
    'Iron',              // Common need for travelers
  ],
  'room-item': [
    // Existing: 'Ironing Board', 'Drying Rack', 'Laundry Supplies'
    'Laundry Basket',    // Where to put dirty clothes
    'Hangers',           // Closet supplies location
    'Stain Remover',     // Cleaning supplies
    'Lint Roller',       // Guest convenience item
  ],
  'general-info': [
    // Existing: 'Detergent Instructions'
    'Cycle Settings',    // How to use machines
    'Laundry Schedule',  // Shared laundry rules
    'Dryer Lint Trap',   // Maintenance reminder
  ],
}
```

### Task 3: Expand Bedroom Suggestions [0.25 SP]

**Current State:**
- Appliance: 3 items
- Room Item: 3 items
- General Info: 2 items

**Additions:**
```typescript
bedroom: {
  appliance: [
    // Existing: 'TV/Entertainment', 'Ceiling Fan', 'Space Heater'
    'Air Conditioner',   // Window/portable unit
    'Air Purifier',      // Allergy-conscious hosting
    'Sound Machine',     // Sleep aid devices
    'Alarm Clock',       // Wake-up devices
  ],
  'room-item': [
    // Existing: 'Closet', 'Safe/Lock Box', 'Window Treatments'
    'Dresser',           // Clothing storage
    'Nightstand',        // Bedside storage
    'Bed Frame',         // Assembly/adjustment
    'Mirror',            // Vanity area
    'Desk/Workspace',    // Work-from-home setup
    'Luggage Rack',      // Guest convenience
  ],
  'general-info': [
    // Existing: 'Bedding Info', 'Extra Blankets Location'
    'Pillow Options',    // Extra pillow types
    'Light Switches',    // Room lighting controls
    'Outlet Locations',  // Charging devices
  ],
}
```

### Task 4: Expand Bathroom Suggestions [0.25 SP]

**Current State:**
- Appliance: 3 items
- Room Item: 4 items
- General Info: 2 items

**Additions:**
```typescript
bathroom: {
  appliance: [
    // Existing: 'Hair Dryer', 'Exhaust Fan', 'Heated Towel Rack'
    'Electric Razor',    // Guest amenity
    'Curling Iron',      // Hair styling tools
    'Heated Floor',      // Luxury amenity
  ],
  'room-item': [
    // Existing: 'Shower', 'Bathtub', 'Toilet', 'Medicine Cabinet'
    'Vanity',            // Counter/storage area
    'Towel Hooks',       // Where to hang towels
    'Shower Caddy',      // Toiletry organization
    'Scale',             // Fitness-conscious guests
    'Trash Can',         // Waste disposal
  ],
  'general-info': [
    // Existing: 'Toiletries Location', 'Towel Storage'
    'Water Pressure',    // Plumbing notes
    'Hot Water',         // Wait time for hot water
    'Cleaning Supplies', // Restocking info
  ],
}
```

### Task 5: Expand Living Room Suggestions [0.25 SP]

**Current State:**
- Appliance: 4 items
- Room Item: 3 items
- General Info: 2 items

**Additions:**
```typescript
'living-room': {
  appliance: [
    // Existing: 'TV/Smart TV', 'Sound System', 'Fireplace', 'Ceiling Fan'
    'Gaming Console',    // Entertainment system
    'DVD/Blu-ray Player',// Media players
    'Air Conditioner',   // Climate control
    'Humidifier',        // Air quality
  ],
  'room-item': [
    // Existing: 'Entertainment Center', 'Window Treatments', 'Thermostat'
    'Sofa/Couch',        // Furniture care
    'Coffee Table',      // Central furniture
    'Bookshelf',         // Storage/decoration
    'Area Rug',          // Floor covering care
    'Lamps',             // Lighting controls
    'Charging Station',  // Device charging area
  ],
  'general-info': [
    // Existing: 'Remote Controls', 'Streaming Services'
    'TV Channels',       // Cable/antenna info
    'Speaker Instructions',// Audio system guide
    'Board Games',       // Entertainment options
  ],
}
```

### Task 6: Expand Garage Suggestions [0.25 SP]

**Current State:**
- Appliance: 3 items
- Room Item: 3 items
- General Info: 2 items

**Additions:**
```typescript
garage: {
  appliance: [
    // Existing: 'Garage Door Opener', 'EV Charger', 'Freezer'
    'Shop Vac',          // Cleaning equipment
    'Workbench Light',   // Task lighting
    'Air Compressor',    // Tire/tool air
  ],
  'room-item': [
    // Existing: 'Tool Storage', 'Bike Storage', 'Recycling Bins'
    'Lawn Mower',        // Yard equipment
    'Snow Blower',       // Seasonal equipment
    'Ladder',            // Access equipment
    'Sports Equipment',  // Recreation storage
    'Beach Gear',        // Vacation property items
    'Camping Gear',      // Outdoor activity storage
  ],
  'general-info': [
    // Existing: 'Parking Instructions', 'Storage Areas'
    'Car Washing',       // Hose/supplies location
    'Emergency Kit',     // Safety supplies
    'Trash Bins',        // Garbage/recycling location
  ],
}
```

### Task 7: Expand Outdoor Suggestions [0.25 SP]

**Current State:**
- Appliance: 4 items
- Room Item: 3 items
- General Info: 3 items

**Additions:**
```typescript
outdoor: {
  appliance: [
    // Existing: 'Grill/BBQ', 'Pool Equipment', 'Hot Tub', 'Sprinkler System'
    'Outdoor Heater',    // Patio heating
    'Fire Pit',          // Entertainment feature
    'Pressure Washer',   // Cleaning equipment
    'Electric Bug Zapper',// Pest control
  ],
  'room-item': [
    // Existing: 'Patio Furniture', 'Outdoor Lighting', 'Garden Tools'
    'Umbrella/Shade',    // Sun protection
    'Outdoor Cushions',  // Furniture accessories
    'Hose & Nozzle',     // Watering equipment
    'Fire Pit Tools',    // Fire accessories
    'Outdoor Speakers',  // Entertainment
    'Bird Feeder',       // Wildlife attraction
  ],
  'general-info': [
    // Existing: 'Gate Access', 'Pool Rules', 'Trash Pickup Days'
    'Outdoor Dining',    // Eating area info
    'Wildlife Info',     // Local animal awareness
    'Quiet Hours',       // Neighborhood rules
    'Garden Care',       // Plant watering instructions
  ],
}
```

### Task 8: Expand General Suggestions [0.25 SP]

**Current State:**
- Appliance: 4 items
- Room Item: 3 items
- General Info: 5 items

**Additions:**
```typescript
general: {
  appliance: [
    // Existing: 'HVAC/Thermostat', 'Water Heater', 'Security System', 'Smart Home Hub'
    'Doorbell Camera',   // Security feature
    'Smart Locks',       // Entry system
    'Smoke Detectors',   // Safety devices
    'CO Detectors',      // Safety devices
    'Intercom',          // Communication system
  ],
  'room-item': [
    // Existing: 'Circuit Breaker', 'Water Shutoff', 'Fire Extinguisher'
    'Fuse Box',          // Electrical panel
    'Gas Shutoff',       // Safety shutoff
    'First Aid Kit',     // Emergency supplies
    'Flashlights',       // Emergency lighting
    'Batteries',         // Supply location
  ],
  'general-info': [
    // Existing: 'WiFi Password', 'Emergency Contacts', 'House Rules',
    //           'Check-out Instructions', 'Local Recommendations'
    'Key Access',        // Entry instructions
    'Alarm Code',        // Security system code
    'Guest Manual',      // House guide location
    'Parking Pass',      // Vehicle permit info
    'Neighborhood Info', // Area orientation
  ],
}
```

### Task 9: Verify Naming Consistency [0.1 SP]

Review all suggestions to ensure:
- [ ] Title Case formatting (e.g., "Electric Kettle" not "electric kettle")
- [ ] Consistent use of "/" for alternatives (e.g., "Washer/Dryer Combo")
- [ ] No duplicate suggestions across different rooms where inappropriate
- [ ] Spelling consistency (e.g., "WiFi" not "Wifi" or "WIFI")

### Task 10: Update Tests [0.1 SP]

- [ ] Verify existing tests still pass with expanded data
- [ ] Add test cases for new suggestions coverage
- [ ] Verify `getAllSuggestions()` returns all new items

---

## Authorized Files and Functions for Modification

### Primary File (MODIFY)

| File | Functions/Sections | Change Type |
|------|-------------------|-------------|
| `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts` | `SUGGESTION_MATRIX` constant | Expand existing data arrays |

### Test Files (MODIFY)

| File | Functions/Sections | Change Type |
|------|-------------------|-------------|
| `src/components/ItemCreationWorkflow/utils/__tests__/suggestionMatrix.test.ts` | N/A (if exists) | Add coverage tests |
| `src/components/ItemCreationWorkflow/hooks/__tests__/useSuggestions.test.ts` | Existing tests | Verify unchanged behavior |

### Files NOT to Modify

The following files should NOT be modified for this task:

- `ItemCreationWorkflow.types.ts` - Types are complete
- `useSuggestions.ts` - Hook logic is complete
- `SpecificItemStep.tsx` - Component is complete
- `constants.ts` - No changes needed
- `index.ts` files - Exports unchanged

---

## Acceptance Criteria

### Data Coverage Requirements

- [ ] All 8 room types have suggestions: Kitchen, Laundry, Bedroom, Bathroom, Living Room, Garage, Outdoor, General
- [ ] Each room type has suggestions in all three categories: Appliance, Room Item, General Info
- [ ] Each category contains 6-12 relevant suggestions
- [ ] Kitchen suggestions include common appliances (microwave, refrigerator, dishwasher)
- [ ] Laundry suggestions include washer, dryer, ironing equipment
- [ ] Bedroom suggestions include furniture (dresser, nightstand, closet)
- [ ] Bathroom suggestions include fixtures and accessories
- [ ] Living Room suggestions include entertainment and seating items
- [ ] Garage suggestions include tools, storage, and utility items
- [ ] Outdoor suggestions include furniture, equipment, and landscaping
- [ ] General suggestions cover property-wide items (WiFi, thermostat, security)

### Quality Requirements

- [ ] All suggestions use consistent naming conventions
- [ ] No spelling errors in suggestion names
- [ ] Suggestions are contextually appropriate for rental properties
- [ ] Existing tests continue to pass
- [ ] New suggestions are accessible via `getSuggestions()` function

---

## Dependencies

### Upstream Dependencies

| Dependency | Status | Required For |
|------------|--------|--------------|
| REQ-093 Task 1.1 | Complete | Base matrix structure |
| REQ-100 SpecificItemStep | Complete | Component that consumes matrix |

### Downstream Dependencies

| Dependent | Impact |
|-----------|--------|
| All workflow tests | Must verify expanded coverage |
| User experience | Enhanced suggestion availability |

---

## Testing Strategy

### Automated Tests

```typescript
// suggestionMatrix.test.ts additions
describe('SUGGESTION_MATRIX coverage', () => {
  const REQUIRED_ROOMS = [
    'kitchen', 'laundry', 'bedroom', 'bathroom',
    'living-room', 'garage', 'outdoor', 'general'
  ];

  const REQUIRED_TYPES = ['appliance', 'room-item', 'general-info'];

  REQUIRED_ROOMS.forEach(room => {
    describe(`${room}`, () => {
      REQUIRED_TYPES.forEach(type => {
        it(`should have ${type} suggestions`, () => {
          const suggestions = getSuggestions(room as RoomType, type as ItemType);
          expect(suggestions.length).toBeGreaterThanOrEqual(3);
        });
      });
    });
  });

  it('should have at least 60 unique suggestions total', () => {
    const all = getAllSuggestions();
    expect(all.length).toBeGreaterThanOrEqual(60);
  });
});
```

### Manual Verification

1. Navigate through item creation workflow
2. Select each room type in sequence
3. Verify suggestions appear for each item type category
4. Confirm suggestions are relevant and well-named

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Task 1: Kitchen Expansion | 0.25 SP |
| Task 2: Laundry Expansion | 0.25 SP |
| Task 3: Bedroom Expansion | 0.25 SP |
| Task 4: Bathroom Expansion | 0.25 SP |
| Task 5: Living Room Expansion | 0.25 SP |
| Task 6: Garage Expansion | 0.25 SP |
| Task 7: Outdoor Expansion | 0.25 SP |
| Task 8: General Expansion | 0.25 SP |
| Task 9: Naming Consistency Review | 0.1 SP |
| Task 10: Test Updates | 0.1 SP |
| **Total** | **2.2 SP (~0.5 days)** |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Suggestions not relevant to guests | Low | Medium | Research common rental documentation items |
| Too many suggestions overwhelm users | Low | Low | Keep 6-12 per category; "Other" option always available |
| Inconsistent naming | Low | Low | Review all names in consistency pass |
| Test failures | Very Low | Low | Run full test suite before committing |

---

## Implementation Notes

### Suggested Item Sources

For comprehensive coverage, consider items from:
1. Airbnb hosting guides and documentation
2. VRBO property management checklists
3. Vacation rental industry best practices
4. Common guest FAQ categories

### Naming Conventions

Follow these patterns:
- **Appliances**: Product-style names ("Coffee Maker", "Air Fryer")
- **Room Items**: Descriptive locations ("Spice Rack", "Utensil Drawer")
- **General Info**: Action-oriented or topic-based ("Trash & Recycling", "WiFi Password")

---

## References

- [Implementation Plan: Plan-093-Item-Creation-Workflow.md](/docs/prd/Plan-093-Item-Creation-Workflow.md)
- [Request Definition: gen_requests.md](/docs/gen_requests.md) (REQ-101)
- [Suggestion Matrix Source: suggestionMatrix.ts](/src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts)
- [Hook Implementation: useSuggestions.ts](/src/components/ItemCreationWorkflow/hooks/useSuggestions.ts)
- [Step Component: SpecificItemStep.tsx](/src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx)

---

*Implementation Overview generated on 2026-01-05 for REQ-101: Comprehensive Suggestions Matrix Data Population*
