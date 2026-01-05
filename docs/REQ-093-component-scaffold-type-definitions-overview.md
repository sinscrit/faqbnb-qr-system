# REQ-093: Component Scaffold & Type Definitions - Implementation Overview

**Created:** 2026-01-05 14:45 UTC
**Last Modified:** 2026-01-05 14:45 UTC
**Request Reference:** REQ-093 (docs/gen_requests.md)
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md
**Phase:** 1 - Foundation & Core Infrastructure
**Task ID:** 1.1

---

## Task Summary

Establish the foundational component structure, type definitions, and configuration constants for the ItemCreationWorkflow component. This task creates the scaffolding that enables subsequent workflow implementation phases.

### Scope

- [ ] Create `ItemCreationWorkflow/` directory structure
- [ ] Define all TypeScript interfaces in `ItemCreationWorkflow.types.ts`
- [ ] Create barrel export files (`index.ts`)
- [ ] Set up constants file with rooms, item types, suggestion matrix

---

## Existing Patterns to Follow

### Component Structure Pattern (from ItemCapture)

The codebase follows a consistent component organization pattern:

```
ComponentName/
├── index.ts                    # Barrel exports (public API)
├── ComponentName.tsx           # Main component
├── ComponentName.types.ts      # All TypeScript definitions
├── hooks/
│   ├── index.ts                # Hooks barrel export
│   └── useXxx.ts               # Custom hooks
├── components/
│   ├── index.ts                # Components barrel export
│   ├── steps/                  # Step components (for wizards)
│   │   └── index.ts
│   └── shared/                 # Reusable sub-components
│       └── index.ts
└── utils/
    ├── index.ts                # Utils barrel export
    └── constants.ts            # Configuration constants
```

**Reference Files:**
- `src/components/ItemCapture/index.ts` - Comprehensive barrel export structure
- `src/components/ItemManager/index.ts` - Multi-level export organization
- `src/components/ItemCapture/hooks/index.ts` - Hooks barrel pattern

### Type Definition Pattern (from ItemCapture.types.ts)

Types are organized in sections with clear documentation:

```typescript
/**
 * ComponentName Type Definitions
 *
 * @module ComponentName/types
 * @see docs/prd/implementation-plan.md
 * @lastModified YYYY-MM-DD (REQ-XXX)
 */

// =============================================================================
// Configuration Types
// =============================================================================

// =============================================================================
// Output Types (Public API)
// =============================================================================

// =============================================================================
// Internal State Types (for component development)
// =============================================================================
```

**Reference Files:**
- `src/components/ItemCapture/ItemCapture.types.ts` - 985 lines of comprehensive type definitions
- `src/components/ItemManager/ItemManager.types.ts` - Extended type patterns

### Constants Pattern (from ItemCapture/utils/constants.ts)

Constants are organized by category with JSDoc documentation:

```typescript
/**
 * Component Constants
 *
 * @module ComponentName/utils/constants
 * @lastModified YYYY-MM-DD (REQ-XXX)
 */

// =============================================================================
// Category Name
// =============================================================================

export const CONSTANT_NAME = [...] as const;
export type ConstantType = typeof CONSTANT_NAME[number];
```

**Reference Files:**
- `src/components/ItemCapture/utils/constants.ts` - 320 lines with URL constraints, capture constraints
- `src/components/ItemManager/utils/constants.ts` - Sort options pattern

### State Management Pattern (from useItemCaptureState.ts)

Reducer-based state with discriminated union actions:

```typescript
// Initial state factory
export const createInitialState = (): ComponentState => ({...});

// Validation functions
export function validateXxx(data: DataType): Record<string, string> {...}

// Reducer with action type switch
function componentReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ACTION_TYPE':
      return {...state, ...updates};
    // ...
  }
}

// Hook interface
export interface UseComponentStateReturn {
  state: ComponentState;
  // Navigation actions
  // Data actions
  // Error actions
  // Computed values
}
```

**Reference Files:**
- `src/components/ItemCapture/hooks/useItemCaptureState.ts` - 615 lines

---

## Authorized Files and Functions for Modification

### Files to Create

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCreationWorkflow/index.ts` | Main barrel export file |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | All TypeScript interfaces |
| `src/components/ItemCreationWorkflow/hooks/index.ts` | Hooks barrel export |
| `src/components/ItemCreationWorkflow/components/index.ts` | Components barrel export |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | Steps barrel export |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | Shared components barrel export |
| `src/components/ItemCreationWorkflow/utils/index.ts` | Utils barrel export |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | Rooms, item types, UI constants |
| `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts` | Room + ItemType -> Suggestions mapping |

### Directories to Create

```
src/components/ItemCreationWorkflow/
├── hooks/
├── components/
│   ├── steps/
│   └── shared/
└── utils/
```

### Files NOT to Modify

- Any existing ItemCapture files
- Any existing ItemManager files
- Database schema files
- API route files

---

## Implementation Tasks

### Task 1.1.1: Create Directory Structure

**Effort:** 5 minutes

Create the component directory structure:

```bash
mkdir -p src/components/ItemCreationWorkflow/{hooks,components/{steps,shared},utils}
```

**Acceptance Criteria:**
- All directories exist
- No files created yet

---

### Task 1.1.2: Create Type Definitions

**Effort:** 45 minutes

Create `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` with:

#### Configuration Types

```typescript
interface ItemCreationWorkflowProps {
  onSessionComplete: (session: CompletedSession) => void;
  onSessionExit: (session: PartialSession) => void;
  onGeneratePDF: (items: SessionItem[], scope: PrintScope) => Promise<Blob>;
  onPrintDirect: (items: SessionItem[], scope: PrintScope) => Promise<void>;
  onFetchExistingItems: () => Promise<SessionItem[]>;
  onSaveItem: (item: SessionItem) => Promise<{ id: string; qrCodeUrl: string }>;
  initialSession?: WorkflowSession;
  config?: WorkflowConfig;
  className?: string;
}

interface WorkflowConfig {
  maxItemsPerSession?: number; // default: 50
  enableUrlPreview?: boolean;  // default: true
  debug?: boolean;             // default: false
}
```

#### Domain Types

```typescript
type RoomType =
  | 'kitchen' | 'laundry' | 'bedroom' | 'bathroom'
  | 'living-room' | 'garage' | 'outdoor' | 'general' | 'other';

type ItemType = 'appliance' | 'room-item' | 'general-info';

type ContentType = 'video' | 'photo' | 'pdf' | 'text' | 'url';
```

#### Session Types

```typescript
interface WorkflowSession {
  id: string;
  startedAt: Date;
  currentStep: WorkflowStep;
  items: SessionItem[];
  currentItem: CurrentItemState | null;
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
```

#### Output Types

```typescript
interface CompletedSession {
  id: string;
  newItems: SessionItem[];
  existingItems: SessionItem[];
  completedAt: Date;
  printAction: 'pdf' | 'direct' | 'skipped';
  printScope?: PrintScope;
}

interface PartialSession {
  id: string;
  startedAt: Date;
  currentStep: WorkflowStep;
  items: SessionItem[];
  exitedAt: Date;
}

type PrintScope =
  | { type: 'all' }
  | { type: 'new-only' }
  | { type: 'selected'; itemIds: string[] };
```

#### State Management Types

```typescript
interface WorkflowState {
  // Navigation
  currentStep: WorkflowStep;
  stepHistory: WorkflowStep[];
  canGoBack: boolean;

  // Session data
  session: WorkflowSession;
  currentItem: CurrentItemState | null;

  // UI state
  isSubmitting: boolean;
  isDirty: boolean;

  // Error state
  errors: Record<string, string>;
  submitError: string | null;
}

type WorkflowAction =
  // Navigation
  | { type: 'GO_TO_STEP'; payload: WorkflowStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }

  // Room/Item selection
  | { type: 'SELECT_ROOM'; payload: RoomType }
  | { type: 'SELECT_ITEM_TYPE'; payload: ItemType }
  | { type: 'SELECT_SPECIFIC_ITEM'; payload: string }
  | { type: 'SET_ITEM_NAME'; payload: string }

  // Content
  | { type: 'SELECT_CONTENT_SOURCE'; payload: 'existing' | 'create-new' }
  | { type: 'SELECT_CONTENT_TYPE'; payload: ContentType }
  | { type: 'ADD_CONTENT_PIECE'; payload: ContentPiece }
  | { type: 'REMOVE_CONTENT_PIECE'; payload: string }
  | { type: 'REORDER_CONTENT'; payload: { fromIndex: number; toIndex: number } }

  // Session management
  | { type: 'SAVE_ITEM'; payload: SessionItem }
  | { type: 'START_NEW_ITEM' }
  | { type: 'COMPLETE_SESSION' }

  // Error handling
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }

  // Submission
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' };
```

**Acceptance Criteria:**
- All types from Implementation Plan Section "Integration Contract" defined
- JSDoc comments on all public interfaces
- Module header with @module and @lastModified
- Section dividers matching ItemCapture pattern

---

### Task 1.1.3: Create Constants File

**Effort:** 30 minutes

Create `src/components/ItemCreationWorkflow/utils/constants.ts` with:

#### Room Configuration

```typescript
export const ROOM_TYPES = [
  'kitchen', 'laundry', 'bedroom', 'bathroom',
  'living-room', 'garage', 'outdoor', 'general', 'other'
] as const;

export type RoomTypeConst = typeof ROOM_TYPES[number];

export const ROOM_LABELS: Record<RoomTypeConst, string> = {
  kitchen: 'Kitchen',
  laundry: 'Laundry Room',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  'living-room': 'Living Room',
  garage: 'Garage',
  outdoor: 'Outdoor/Patio',
  general: 'General/Whole Property',
  other: 'Other',
};

export const ROOM_ICONS: Record<RoomTypeConst, string> = {
  kitchen: 'chef-hat',
  laundry: 'shirt',
  bedroom: 'bed',
  bathroom: 'shower-head',
  'living-room': 'sofa',
  garage: 'car',
  outdoor: 'tree',
  general: 'info',
  other: 'map-pin',
};
```

#### Item Type Configuration

```typescript
export const ITEM_TYPES = ['appliance', 'room-item', 'general-info'] as const;

export type ItemTypeConst = typeof ITEM_TYPES[number];

export const ITEM_TYPE_LABELS: Record<ItemTypeConst, string> = {
  appliance: 'Appliance',
  'room-item': 'Room Item',
  'general-info': 'General Info',
};

export const ITEM_TYPE_DESCRIPTIONS: Record<ItemTypeConst, string> = {
  appliance: 'Washer, dryer, stove, refrigerator, etc.',
  'room-item': 'Pantry, cabinets, closet, sink, etc.',
  'general-info': 'Trash schedule, WiFi info, house rules, etc.',
};
```

#### Content Type Configuration

```typescript
export const CONTENT_TYPES = ['video', 'photo', 'pdf', 'text', 'url'] as const;

export type ContentTypeConst = typeof CONTENT_TYPES[number];

export const CONTENT_TYPE_LABELS: Record<ContentTypeConst, string> = {
  video: 'Video',
  photo: 'Photo',
  pdf: 'PDF Document',
  text: 'Text Instructions',
  url: 'Link/URL',
};

export const CONTENT_SOURCE_OPTIONS = {
  existing: {
    video: 'Upload Video',
    photo: 'Upload Photo',
    pdf: 'Upload PDF',
    text: 'Paste Text',
    url: 'Paste URL',
  },
  'create-new': {
    video: 'Record Video',
    photo: 'Take Photo',
    text: 'Write Text',
  },
} as const;
```

#### Workflow Configuration

```typescript
export const WORKFLOW_CONFIG_DEFAULTS = {
  maxItemsPerSession: 50,
  enableUrlPreview: true,
  debug: false,
} as const;

export const WORKFLOW_STEPS = [
  'room-selection',
  'item-type-selection',
  'specific-item-selection',
  'content-source-selection',
  'content-type-selection',
  'content-creation',
  'preview-save',
  'next-action',
  'session-summary',
] as const;

export type WorkflowStepConst = typeof WORKFLOW_STEPS[number];
```

#### UI Constants

```typescript
export const TOUCH_TARGET_MIN_SIZE = 48; // pixels, per PRD accessibility requirement

export const PROGRESS_WEIGHTS: Record<WorkflowStepConst, number> = {
  'room-selection': 10,
  'item-type-selection': 20,
  'specific-item-selection': 30,
  'content-source-selection': 40,
  'content-type-selection': 50,
  'content-creation': 70,
  'preview-save': 85,
  'next-action': 90,
  'session-summary': 100,
};
```

**Acceptance Criteria:**
- All room types from Implementation Plan Appendix A
- All item types defined
- All content types defined
- Labels and icons for each type
- Follows const export pattern from existing constants files

---

### Task 1.1.4: Create Suggestion Matrix

**Effort:** 25 minutes

Create `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts` with:

```typescript
/**
 * Suggestion Matrix for ItemCreationWorkflow
 *
 * Maps Room + ItemType combinations to suggested specific items.
 * Based on PRD Appendix A specifications.
 *
 * @module ItemCreationWorkflow/utils/suggestionMatrix
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

import type { RoomType, ItemType } from '../ItemCreationWorkflow.types';

export const SUGGESTION_MATRIX: Record<RoomType, Record<ItemType, string[]>> = {
  kitchen: {
    appliance: [
      'Stove/Oven',
      'Refrigerator',
      'Microwave',
      'Dishwasher',
      'Garbage Disposal',
      'Coffee Maker',
      'Toaster Oven',
    ],
    'room-item': [
      'Pantry',
      'Cabinets',
      'Sink/Faucet',
      'Ice Maker',
    ],
    'general-info': [
      'Trash & Recycling',
    ],
  },
  laundry: {
    appliance: [
      'Washer',
      'Dryer',
      'Washer/Dryer Combo',
    ],
    'room-item': [
      'Ironing Board',
      'Drying Rack',
      'Laundry Supplies',
    ],
    'general-info': [
      'Detergent Instructions',
    ],
  },
  bedroom: {
    appliance: [
      'TV/Entertainment',
      'Ceiling Fan',
      'Space Heater',
    ],
    'room-item': [
      'Closet',
      'Safe/Lock Box',
      'Window Treatments',
    ],
    'general-info': [
      'Bedding Info',
      'Extra Blankets Location',
    ],
  },
  bathroom: {
    appliance: [
      'Hair Dryer',
      'Exhaust Fan',
      'Heated Towel Rack',
    ],
    'room-item': [
      'Shower',
      'Bathtub',
      'Toilet',
      'Medicine Cabinet',
    ],
    'general-info': [
      'Toiletries Location',
      'Towel Storage',
    ],
  },
  'living-room': {
    appliance: [
      'TV/Smart TV',
      'Sound System',
      'Fireplace',
      'Ceiling Fan',
    ],
    'room-item': [
      'Entertainment Center',
      'Window Treatments',
      'Thermostat',
    ],
    'general-info': [
      'Remote Controls',
      'Streaming Services',
    ],
  },
  garage: {
    appliance: [
      'Garage Door Opener',
      'EV Charger',
      'Freezer',
    ],
    'room-item': [
      'Tool Storage',
      'Bike Storage',
      'Recycling Bins',
    ],
    'general-info': [
      'Parking Instructions',
      'Storage Areas',
    ],
  },
  outdoor: {
    appliance: [
      'Grill/BBQ',
      'Pool Equipment',
      'Hot Tub',
      'Sprinkler System',
    ],
    'room-item': [
      'Patio Furniture',
      'Outdoor Lighting',
      'Garden Tools',
    ],
    'general-info': [
      'Gate Access',
      'Pool Rules',
      'Trash Pickup Days',
    ],
  },
  general: {
    appliance: [
      'HVAC/Thermostat',
      'Water Heater',
      'Security System',
      'Smart Home Hub',
    ],
    'room-item': [
      'Circuit Breaker',
      'Water Shutoff',
      'Fire Extinguisher',
    ],
    'general-info': [
      'WiFi Password',
      'Emergency Contacts',
      'House Rules',
      'Check-out Instructions',
      'Local Recommendations',
    ],
  },
  other: {
    appliance: [],
    'room-item': [],
    'general-info': [],
  },
};

/**
 * Get suggestions for a room and item type combination.
 * Returns empty array for invalid combinations.
 */
export function getSuggestions(room: RoomType, itemType: ItemType): string[] {
  return SUGGESTION_MATRIX[room]?.[itemType] ?? [];
}

/**
 * Check if a room has any suggestions for the given item type.
 */
export function hasSuggestions(room: RoomType, itemType: ItemType): boolean {
  return getSuggestions(room, itemType).length > 0;
}

/**
 * Get all unique suggestions across all rooms for a given item type.
 * Useful for autocomplete or search.
 */
export function getAllSuggestionsForType(itemType: ItemType): string[] {
  const suggestions = new Set<string>();

  Object.values(SUGGESTION_MATRIX).forEach(roomSuggestions => {
    roomSuggestions[itemType]?.forEach(s => suggestions.add(s));
  });

  return Array.from(suggestions).sort();
}
```

**Acceptance Criteria:**
- Complete matrix from Implementation Plan Appendix A
- Helper functions for querying suggestions
- Type-safe with RoomType and ItemType

---

### Task 1.1.5: Create Barrel Export Files

**Effort:** 20 minutes

#### Main Index (src/components/ItemCreationWorkflow/index.ts)

```typescript
/**
 * ItemCreationWorkflow Component - Public Exports
 *
 * This barrel file provides the public API for the ItemCreationWorkflow component.
 * Import from '@/components/ItemCreationWorkflow' for clean, predictable imports.
 *
 * @example
 * import {
 *   ItemCreationWorkflowProps,
 *   WorkflowSession,
 *   RoomType,
 * } from '@/components/ItemCreationWorkflow';
 *
 * @module ItemCreationWorkflow
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// =============================================================================
// Public Types (for consumer use)
// =============================================================================

export type {
  // Configuration
  ItemCreationWorkflowProps,
  WorkflowConfig,

  // Domain types
  RoomType,
  ItemType,
  ContentType,

  // Session types
  WorkflowSession,
  WorkflowStep,
  CurrentItemState,
  SessionItem,
  ContentPiece,

  // Output types
  CompletedSession,
  PartialSession,
  PrintScope,
} from './ItemCreationWorkflow.types';

// =============================================================================
// Internal Types (for component development)
// =============================================================================

export type {
  WorkflowState,
  WorkflowAction,
} from './ItemCreationWorkflow.types';

// =============================================================================
// Constants Export
// =============================================================================

export {
  ROOM_TYPES,
  ROOM_LABELS,
  ROOM_ICONS,
  ITEM_TYPES,
  ITEM_TYPE_LABELS,
  ITEM_TYPE_DESCRIPTIONS,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  CONTENT_SOURCE_OPTIONS,
  WORKFLOW_CONFIG_DEFAULTS,
  WORKFLOW_STEPS,
  TOUCH_TARGET_MIN_SIZE,
  PROGRESS_WEIGHTS,
} from './utils/constants';

export type {
  RoomTypeConst,
  ItemTypeConst,
  ContentTypeConst,
  WorkflowStepConst,
} from './utils/constants';

// =============================================================================
// Suggestion Matrix Export
// =============================================================================

export {
  SUGGESTION_MATRIX,
  getSuggestions,
  hasSuggestions,
  getAllSuggestionsForType,
} from './utils/suggestionMatrix';

// =============================================================================
// Hooks Export (placeholder for future tasks)
// =============================================================================

// export { useWorkflowState } from './hooks';

// =============================================================================
// Main Component Export (placeholder for future tasks)
// =============================================================================

// export { ItemCreationWorkflow } from './ItemCreationWorkflow';
```

#### Hooks Index (src/components/ItemCreationWorkflow/hooks/index.ts)

```typescript
/**
 * ItemCreationWorkflow Hooks - Barrel Export
 *
 * @module ItemCreationWorkflow/hooks
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// Placeholder for Task 1.2: useWorkflowState
// export { useWorkflowState, type UseWorkflowStateReturn } from './useWorkflowState';

// Placeholder for Task 1.4: useSessionPersistence
// export { useSessionPersistence } from './useSessionPersistence';

// Placeholder for Task 2.3: useSuggestions
// export { useSuggestions } from './useSuggestions';

// Placeholder for Task 3.3: useUrlPreview
// export { useUrlPreview } from './useUrlPreview';
```

#### Components Index (src/components/ItemCreationWorkflow/components/index.ts)

```typescript
/**
 * ItemCreationWorkflow Components - Barrel Export
 *
 * @module ItemCreationWorkflow/components
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// Re-export step components
export * from './steps';

// Re-export shared components
export * from './shared';
```

#### Steps Index (src/components/ItemCreationWorkflow/components/steps/index.ts)

```typescript
/**
 * ItemCreationWorkflow Step Components - Barrel Export
 *
 * @module ItemCreationWorkflow/components/steps
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// Placeholder exports for future tasks

// Task 2.1: RoomSelectionStep
// export { RoomSelectionStep } from './RoomSelectionStep';
// export type { RoomSelectionStepProps } from './RoomSelectionStep';

// Task 2.2: ItemTypeStep
// export { ItemTypeStep } from './ItemTypeStep';
// export type { ItemTypeStepProps } from './ItemTypeStep';

// Task 2.3: SpecificItemStep
// export { SpecificItemStep } from './SpecificItemStep';
// export type { SpecificItemStepProps } from './SpecificItemStep';

// Task 3.1: ContentSourceStep
// export { ContentSourceStep } from './ContentSourceStep';
// export type { ContentSourceStepProps } from './ContentSourceStep';

// Task 3.2: ContentTypeStep
// export { ContentTypeStep } from './ContentTypeStep';
// export type { ContentTypeStepProps } from './ContentTypeStep';

// Task 4.1: ContentCreationStep
// export { ContentCreationStep } from './ContentCreationStep';
// export type { ContentCreationStepProps } from './ContentCreationStep';

// Task 4.2: PreviewSaveStep
// export { PreviewSaveStep } from './PreviewSaveStep';
// export type { PreviewSaveStepProps } from './PreviewSaveStep';

// Task 5.1: NextActionStep
// export { NextActionStep } from './NextActionStep';
// export type { NextActionStepProps } from './NextActionStep';

// Task 6.1: SessionSummaryStep
// export { SessionSummaryStep } from './SessionSummaryStep';
// export type { SessionSummaryStepProps } from './SessionSummaryStep';
```

#### Shared Index (src/components/ItemCreationWorkflow/components/shared/index.ts)

```typescript
/**
 * ItemCreationWorkflow Shared Components - Barrel Export
 *
 * @module ItemCreationWorkflow/components/shared
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// Placeholder exports for future tasks

// Task 1.3: WorkflowHeader
// export { WorkflowHeader } from './WorkflowHeader';
// export type { WorkflowHeaderProps } from './WorkflowHeader';

// Task 1.3: ConfirmExitDialog
// export { ConfirmExitDialog } from './ConfirmExitDialog';
// export type { ConfirmExitDialogProps } from './ConfirmExitDialog';

// Task 1.5: SessionProgressBar
// export { SessionProgressBar } from './SessionProgressBar';
// export type { SessionProgressBarProps } from './SessionProgressBar';

// Task 1.5: RoomCard
// export { RoomCard } from './RoomCard';
// export type { RoomCardProps } from './RoomCard';

// Task 1.5: ItemTypeCard
// export { ItemTypeCard } from './ItemTypeCard';
// export type { ItemTypeCardProps } from './ItemTypeCard';

// Task 2.3: SuggestionButton
// export { SuggestionButton } from './SuggestionButton';
// export type { SuggestionButtonProps } from './SuggestionButton';

// Task 2.3: ItemNameEditor
// export { ItemNameEditor } from './ItemNameEditor';
// export type { ItemNameEditorProps } from './ItemNameEditor';

// Task 4.2: ContentPieceCard
// export { ContentPieceCard } from './ContentPieceCard';
// export type { ContentPieceCardProps } from './ContentPieceCard';

// Task 6.1: SessionItemCard
// export { SessionItemCard } from './SessionItemCard';
// export type { SessionItemCardProps } from './SessionItemCard';

// Task 6.2: PrintOptionsPanel
// export { PrintOptionsPanel } from './PrintOptionsPanel';
// export type { PrintOptionsPanelProps } from './PrintOptionsPanel';
```

#### Utils Index (src/components/ItemCreationWorkflow/utils/index.ts)

```typescript
/**
 * ItemCreationWorkflow Utilities - Barrel Export
 *
 * @module ItemCreationWorkflow/utils
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// Constants
export * from './constants';

// Suggestion Matrix
export * from './suggestionMatrix';

// Placeholder for Task 1.4: sessionStorage utilities
// export * from './sessionStorage';
```

**Acceptance Criteria:**
- All barrel files created
- Consistent documentation headers
- Placeholder comments for future task exports
- Clean import paths work: `@/components/ItemCreationWorkflow`

---

## Dependencies

### Internal Dependencies

| Dependency | Purpose | Required By |
|------------|---------|-------------|
| None | This is foundation task | N/A |

### External Dependencies

| Dependency | Already Installed | Purpose |
|------------|------------------|---------|
| TypeScript | Yes | Type definitions |
| React | Yes | Component framework |

---

## Testing Approach

### Type Checking

After completion, verify:
```bash
npx tsc --noEmit
```

### Import Verification

Create a temporary test file to verify imports work:
```typescript
import {
  RoomType,
  ItemType,
  WorkflowSession,
  ROOM_TYPES,
  SUGGESTION_MATRIX,
  getSuggestions,
} from '@/components/ItemCreationWorkflow';

// Type check passes if these compile
const room: RoomType = 'kitchen';
const suggestions = getSuggestions(room, 'appliance');
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type inconsistency with Implementation Plan | Low | Medium | Cross-reference all types with Plan-093 document |
| Missing room/item types | Low | Low | Verify against PRD Appendix A |
| Import path issues | Low | Low | Test barrel imports before task completion |

---

## Definition of Done

- [ ] Directory structure created
- [ ] `ItemCreationWorkflow.types.ts` complete with all interfaces from Implementation Plan
- [ ] `constants.ts` complete with all room, item, and content type configurations
- [ ] `suggestionMatrix.ts` complete with full matrix from Appendix A
- [ ] All barrel export files created with consistent documentation
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Imports work from `@/components/ItemCreationWorkflow`

---

## Related Documents

- [Implementation Plan: Item Creation Workflow](docs/prd/Plan-093-Item-Creation-Workflow.md)
- [PRD: Item Creation Workflow](docs/prd/PRD_Item_Creation_Workflow.md)
- [ItemCapture Types Reference](src/components/ItemCapture/ItemCapture.types.ts)
- [ItemCapture Constants Reference](src/components/ItemCapture/utils/constants.ts)
- [ItemManager Index Reference](src/components/ItemManager/index.ts)

---

*Document generated: 2026-01-05 14:45 UTC*
*Task 1.1 of Phase 1 - Foundation & Core Infrastructure*
