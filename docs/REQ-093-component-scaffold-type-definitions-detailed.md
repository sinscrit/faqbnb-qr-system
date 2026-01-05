# REQ-093: Component Scaffold & Type Definitions - Detailed Task Breakdown

**Created:** 2026-01-05 01:34:31 UTC
**Last Modified:** 2026-01-05 01:34:31 UTC
**Request Reference:** REQ-093 (docs/gen_requests.md)
**Overview Document:** docs/REQ-093-component-scaffold-type-definitions-overview.md
**Implementation Plan Reference:** docs/prd/Plan-093-Item-Creation-Workflow.md
**Phase:** 1 - Foundation & Core Infrastructure
**Task ID:** 1.1

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for Task 1.1: Component Scaffold & Type Definitions. Each task is sized to approximately 1 story point (a few hours of focused work) and includes verification steps, file paths, and acceptance criteria.

The overall goal is to establish the foundational component structure, TypeScript interfaces, and configuration constants for the ItemCreationWorkflow component, enabling subsequent workflow implementation phases.

---

## Prerequisites

Before starting implementation, ensure:

- [ ] Git branch `fix-qr-code-generation` or dedicated feature branch is checked out
- [ ] Node.js and npm are available
- [ ] TypeScript compilation works (`npx tsc --noEmit`)
- [ ] Familiarity with existing patterns in:
  - `src/components/ItemCapture/index.ts`
  - `src/components/ItemCapture/ItemCapture.types.ts`
  - `src/components/ItemCapture/utils/constants.ts`

---

## Task List

### Task 1.1.1: Create Directory Structure

**Effort:** 0.25 story points (~15 minutes)
**Priority:** 1 (Must be done first)
**Dependencies:** None

#### Description

Create the complete directory structure for the ItemCreationWorkflow component following the established project patterns.

#### Implementation Steps

1. Create the main component directory and all subdirectories:
   ```bash
   mkdir -p src/components/ItemCreationWorkflow/{hooks,components/{steps,shared},utils}
   ```

2. Verify the structure was created correctly:
   ```bash
   find src/components/ItemCreationWorkflow -type d
   ```

#### Files to Create (Directories Only)

| Path | Purpose |
|------|---------|
| `src/components/ItemCreationWorkflow/` | Main component directory |
| `src/components/ItemCreationWorkflow/hooks/` | Custom hooks directory |
| `src/components/ItemCreationWorkflow/components/` | Sub-components directory |
| `src/components/ItemCreationWorkflow/components/steps/` | Workflow step components |
| `src/components/ItemCreationWorkflow/components/shared/` | Reusable shared components |
| `src/components/ItemCreationWorkflow/utils/` | Utility functions and constants |

#### Verification Steps

- [ ] Run `ls -la src/components/ItemCreationWorkflow/` and confirm all subdirectories exist
- [ ] Run `tree src/components/ItemCreationWorkflow/` (if available) to visualize structure
- [ ] Confirm no files exist yet (only directories)

#### Acceptance Criteria

- All 6 directories exist under `src/components/ItemCreationWorkflow/`
- Directory names match the specified naming convention exactly
- No files have been created yet

---

### Task 1.1.2: Create Type Definitions - Configuration Types

**Effort:** 0.5 story points (~1-2 hours)
**Priority:** 2
**Dependencies:** Task 1.1.1

#### Description

Create the first section of type definitions containing configuration interfaces and domain types. This establishes the component's public API contract.

#### Implementation Steps

1. Create the types file with the module header:
   ```typescript
   // File: src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts
   ```

2. Add the module documentation header following the ItemCapture pattern

3. Define Configuration Types section:
   - `ItemCreationWorkflowProps` - Main component props
   - `WorkflowConfig` - Optional configuration overrides

4. Define Domain Types section:
   - `RoomType` - Union type for room categories
   - `ItemType` - Union type for item categories
   - `ContentType` - Union type for content types

#### File to Create

**Path:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`

```typescript
/**
 * ItemCreationWorkflow Component Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the ItemCreationWorkflow
 * component. These types define the component's props, configuration options,
 * output data structures, and internal state management.
 *
 * @module ItemCreationWorkflow/types
 * @see docs/prd/Plan-093-Item-Creation-Workflow.md
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Configuration options for ItemCreationWorkflow behavior.
 * All properties are optional with sensible defaults.
 */
export interface WorkflowConfig {
  /** Maximum items allowed per session (default: 50) */
  maxItemsPerSession?: number;

  /** Enable URL preview with metadata fetching (default: true) */
  enableUrlPreview?: boolean;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Main component props for ItemCreationWorkflow.
 */
export interface ItemCreationWorkflowProps {
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

  /** Optional: CSS class name for the root element */
  className?: string;
}

// =============================================================================
// Domain Types
// =============================================================================

/**
 * Room categories for item organization.
 * Based on PRD Appendix A specifications.
 */
export type RoomType =
  | 'kitchen'
  | 'laundry'
  | 'bedroom'
  | 'bathroom'
  | 'living-room'
  | 'garage'
  | 'outdoor'
  | 'general'
  | 'other';

/**
 * Item type categories within a room.
 */
export type ItemType = 'appliance' | 'room-item' | 'general-info';

/**
 * Content type categories for item content.
 */
export type ContentType = 'video' | 'photo' | 'pdf' | 'text' | 'url';
```

#### Verification Steps

- [ ] File exists at the correct path
- [ ] Module header matches the established pattern
- [ ] All configuration types are defined with JSDoc comments
- [ ] All domain types are defined as union types
- [ ] Run `npx tsc --noEmit` - no TypeScript errors related to this file

#### Acceptance Criteria

- File contains proper module documentation header
- `WorkflowConfig` interface is defined with all optional properties
- `ItemCreationWorkflowProps` interface is defined with required callbacks
- `RoomType`, `ItemType`, `ContentType` union types are defined
- All types have JSDoc documentation
- TypeScript compiles without errors

---

### Task 1.1.3: Create Type Definitions - Session Types

**Effort:** 0.75 story points (~2-3 hours)
**Priority:** 3
**Dependencies:** Task 1.1.2

#### Description

Add session-related type definitions including workflow session, current item state, session items, and content pieces.

#### Implementation Steps

1. Add Session Types section to `ItemCreationWorkflow.types.ts`

2. Define the following interfaces:
   - `WorkflowSession` - Complete session state
   - `WorkflowStep` - Step identifiers union type
   - `CurrentItemState` - Item being created
   - `SessionItem` - Completed item in session
   - `ContentPiece` - Individual content piece
   - `ContentData` - Content data union type

#### Code to Add

```typescript
// =============================================================================
// Session Types
// =============================================================================

/**
 * Workflow step identifiers for navigation state machine.
 */
export type WorkflowStep =
  | 'room-selection'
  | 'item-type-selection'
  | 'specific-item-selection'
  | 'content-source-selection'
  | 'content-type-selection'
  | 'content-creation'
  | 'preview-save'
  | 'next-action'
  | 'session-summary';

/**
 * Complete workflow session state.
 * Tracks the entire session including all items created.
 */
export interface WorkflowSession {
  /** Unique session identifier (UUID) */
  id: string;

  /** When the session was started */
  startedAt: Date;

  /** Current position in the workflow */
  currentStep: WorkflowStep;

  /** Items created during this session */
  items: SessionItem[];

  /** Item currently being created (null when not in item creation flow) */
  currentItem: CurrentItemState | null;
}

/**
 * State for the item currently being created.
 * Progressively filled as user moves through steps.
 */
export interface CurrentItemState {
  /** Selected room for this item */
  room: RoomType;

  /** Selected item type category */
  itemType: ItemType;

  /** Specific item name from suggestions or custom input */
  specificItem: string;

  /** Display name for the item (auto-generated or user-edited) */
  itemName: string;

  /** Content source choice: existing upload or create new */
  contentSource: 'existing' | 'create-new';

  /** Selected content type (null until chosen) */
  contentType: ContentType | null;

  /** Content pieces added to this item */
  content: ContentPiece[];
}

/**
 * A completed item within the session.
 * Contains all data needed for display and persistence.
 */
export interface SessionItem {
  /** Unique item identifier (UUID) */
  id: string;

  /** Display name for the item */
  name: string;

  /** Room where the item is located */
  room: RoomType;

  /** Item type category */
  itemType: ItemType;

  /** All content pieces attached to this item */
  content: ContentPiece[];

  /** When the item was created */
  createdAt: Date;

  /** Generated QR code URL (populated after save) */
  qrCodeUrl?: string;
}

/**
 * Content data varies by content type.
 * This union type handles all possible content payloads.
 */
export type ContentData =
  | { type: 'video'; file: File | Blob; duration?: number }
  | { type: 'photo'; file: File | Blob }
  | { type: 'pdf'; file: File | Blob; pageCount?: number }
  | { type: 'text'; text: string }
  | { type: 'url'; url: string; title?: string; thumbnailUrl?: string; faviconUrl?: string };

/**
 * Individual content piece within an item.
 * Items can have multiple content pieces of different types.
 */
export interface ContentPiece {
  /** Unique identifier for this content piece (UUID) */
  id: string;

  /** Type of content */
  type: ContentType;

  /** Type-specific content data */
  data: ContentData;

  /** Display order within the item (0-indexed) */
  order: number;

  /** Generated thumbnail for preview display */
  thumbnail?: Blob;
}
```

#### Verification Steps

- [ ] All session types are added to the types file
- [ ] `WorkflowStep` union includes all 9 steps from the Implementation Plan
- [ ] `CurrentItemState` includes all progressive fields
- [ ] `ContentData` uses discriminated union pattern
- [ ] Run `npx tsc --noEmit` - no TypeScript errors

#### Acceptance Criteria

- `WorkflowSession` captures complete session state
- `WorkflowStep` includes all 9 workflow steps
- `CurrentItemState` tracks progressive item creation
- `SessionItem` contains all fields for display and persistence
- `ContentPiece` and `ContentData` support all content types
- All interfaces have JSDoc documentation

---

### Task 1.1.4: Create Type Definitions - Output Types

**Effort:** 0.5 story points (~1-2 hours)
**Priority:** 4
**Dependencies:** Task 1.1.3

#### Description

Add output type definitions for completed sessions, partial sessions (exit), and print scope options.

#### Implementation Steps

1. Add Output Types section to `ItemCreationWorkflow.types.ts`

2. Define the following interfaces:
   - `CompletedSession` - Returned when user completes workflow
   - `PartialSession` - Returned when user exits mid-session
   - `PrintScope` - Print selection options

#### Code to Add

```typescript
// =============================================================================
// Output Types (Public API)
// =============================================================================

/**
 * Returned via onSessionComplete callback when workflow finishes successfully.
 * Contains all session data for parent component handling.
 */
export interface CompletedSession {
  /** Session identifier */
  id: string;

  /** Items created during this session */
  newItems: SessionItem[];

  /** Previously existing items (fetched for comparison/printing) */
  existingItems: SessionItem[];

  /** When the session was completed */
  completedAt: Date;

  /** Action taken for printing QR codes */
  printAction: 'pdf' | 'direct' | 'skipped';

  /** Scope of items included in print action */
  printScope?: PrintScope;
}

/**
 * Returned via onSessionExit callback when user exits mid-session.
 * Captures session state for potential resume or analytics.
 */
export interface PartialSession {
  /** Session identifier */
  id: string;

  /** When the session was started */
  startedAt: Date;

  /** Step where user exited */
  currentStep: WorkflowStep;

  /** Items created before exit (may be empty) */
  items: SessionItem[];

  /** When the user exited */
  exitedAt: Date;
}

/**
 * Print scope selection for QR code generation.
 * Determines which items to include in PDF or direct print.
 */
export type PrintScope =
  | { type: 'all' }
  | { type: 'new-only' }
  | { type: 'selected'; itemIds: string[] };
```

#### Verification Steps

- [ ] Output types are added with proper section header
- [ ] `CompletedSession` includes all session data and print info
- [ ] `PartialSession` captures exit state
- [ ] `PrintScope` uses discriminated union pattern
- [ ] Run `npx tsc --noEmit` - no TypeScript errors

#### Acceptance Criteria

- All output types match the Implementation Plan Integration Contract
- `PrintScope` discriminated union allows type-safe scope handling
- All interfaces have JSDoc documentation
- TypeScript compiles without errors

---

### Task 1.1.5: Create Type Definitions - State Management Types

**Effort:** 0.75 story points (~2-3 hours)
**Priority:** 5
**Dependencies:** Task 1.1.4

#### Description

Add internal state management types including the complete workflow state interface and all action types for the reducer.

#### Implementation Steps

1. Add State Management Types section to `ItemCreationWorkflow.types.ts`

2. Define the following:
   - `WorkflowState` - Complete internal state
   - `WorkflowAction` - Discriminated union of all actions

#### Code to Add

```typescript
// =============================================================================
// Internal State Types (for component development)
// =============================================================================

/**
 * Complete internal state for the ItemCreationWorkflow component.
 * Managed by useWorkflowState hook reducer.
 */
export interface WorkflowState {
  // Navigation
  /** Current workflow step */
  currentStep: WorkflowStep;

  /** History of steps for back navigation */
  stepHistory: WorkflowStep[];

  /** Whether user can navigate back */
  canGoBack: boolean;

  // Session data
  /** Complete session state */
  session: WorkflowSession;

  /** Item currently being created */
  currentItem: CurrentItemState | null;

  // UI state
  /** Whether a submission is in progress */
  isSubmitting: boolean;

  /** Whether there are unsaved changes */
  isDirty: boolean;

  // Error state
  /** Field-level validation errors */
  errors: Record<string, string>;

  /** Submission-level error message */
  submitError: string | null;
}

/**
 * All actions that can be dispatched to modify workflow state.
 * Uses discriminated union pattern for type-safe action handling.
 */
export type WorkflowAction =
  // Navigation actions
  | { type: 'GO_TO_STEP'; payload: WorkflowStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }

  // Room/Item selection actions
  | { type: 'SELECT_ROOM'; payload: RoomType }
  | { type: 'SELECT_ITEM_TYPE'; payload: ItemType }
  | { type: 'SELECT_SPECIFIC_ITEM'; payload: string }
  | { type: 'SET_ITEM_NAME'; payload: string }

  // Content actions
  | { type: 'SELECT_CONTENT_SOURCE'; payload: 'existing' | 'create-new' }
  | { type: 'SELECT_CONTENT_TYPE'; payload: ContentType }
  | { type: 'ADD_CONTENT_PIECE'; payload: ContentPiece }
  | { type: 'REMOVE_CONTENT_PIECE'; payload: string }
  | { type: 'REORDER_CONTENT'; payload: { fromIndex: number; toIndex: number } }

  // Session management actions
  | { type: 'SAVE_ITEM'; payload: SessionItem }
  | { type: 'START_NEW_ITEM' }
  | { type: 'COMPLETE_SESSION' }

  // Error handling actions
  | { type: 'SET_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }

  // Submission actions
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SUBMIT_ERROR'; payload: string }

  // Reset
  | { type: 'RESET' };
```

#### Verification Steps

- [ ] State management types are added with proper section header
- [ ] `WorkflowState` includes all navigation, session, UI, and error state
- [ ] `WorkflowAction` includes all actions from Implementation Plan
- [ ] Action types use discriminated union pattern
- [ ] Run `npx tsc --noEmit` - no TypeScript errors

#### Acceptance Criteria

- `WorkflowState` captures complete internal component state
- `WorkflowAction` union includes all necessary actions for workflow
- Action payloads are properly typed
- Types follow the same pattern as ItemCapture state management
- TypeScript compiles without errors

---

### Task 1.1.6: Create Constants File - Room Configuration

**Effort:** 0.5 story points (~1-2 hours)
**Priority:** 6
**Dependencies:** Task 1.1.1

#### Description

Create the constants file with room type configuration including type constants, labels, and icons.

#### Implementation Steps

1. Create the constants file with module header
2. Add Room Configuration section with:
   - `ROOM_TYPES` const array
   - `RoomTypeConst` type
   - `ROOM_LABELS` record
   - `ROOM_ICONS` record

#### File to Create

**Path:** `src/components/ItemCreationWorkflow/utils/constants.ts`

```typescript
/**
 * ItemCreationWorkflow Constants
 *
 * This file contains all constant values used by the ItemCreationWorkflow component,
 * including room types, item types, content types, and workflow configuration.
 *
 * @module ItemCreationWorkflow/utils/constants
 * @see docs/prd/Plan-093-Item-Creation-Workflow.md
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// =============================================================================
// Room Configuration
// =============================================================================

/**
 * All available room types for item categorization.
 * Order determines display order in UI.
 */
export const ROOM_TYPES = [
  'kitchen',
  'laundry',
  'bedroom',
  'bathroom',
  'living-room',
  'garage',
  'outdoor',
  'general',
  'other',
] as const;

/**
 * Type for room values derived from ROOM_TYPES constant.
 */
export type RoomTypeConst = (typeof ROOM_TYPES)[number];

/**
 * Human-readable labels for each room type.
 * Used for display in UI selection components.
 */
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

/**
 * Icon identifiers for each room type.
 * Uses Lucide React icon names for consistency with project iconography.
 */
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

#### Verification Steps

- [ ] File exists at `src/components/ItemCreationWorkflow/utils/constants.ts`
- [ ] Module header follows established pattern
- [ ] All 9 room types are defined
- [ ] Labels match the Implementation Plan specifications
- [ ] Icons use Lucide React icon names
- [ ] Run `npx tsc --noEmit` - no TypeScript errors

#### Acceptance Criteria

- Constants file created with proper module documentation
- `ROOM_TYPES` includes all 9 room categories
- `ROOM_LABELS` provides user-friendly display names
- `ROOM_ICONS` maps to Lucide icon identifiers
- Type `RoomTypeConst` is exported for type safety

---

### Task 1.1.7: Create Constants File - Item Type & Content Configuration

**Effort:** 0.5 story points (~1-2 hours)
**Priority:** 7
**Dependencies:** Task 1.1.6

#### Description

Add item type and content type configurations to the constants file.

#### Implementation Steps

1. Add Item Type Configuration section
2. Add Content Type Configuration section
3. Add Workflow Configuration section with defaults

#### Code to Add

```typescript
// =============================================================================
// Item Type Configuration
// =============================================================================

/**
 * Available item type categories.
 */
export const ITEM_TYPES = ['appliance', 'room-item', 'general-info'] as const;

/**
 * Type for item type values derived from ITEM_TYPES constant.
 */
export type ItemTypeConst = (typeof ITEM_TYPES)[number];

/**
 * Human-readable labels for each item type.
 */
export const ITEM_TYPE_LABELS: Record<ItemTypeConst, string> = {
  appliance: 'Appliance',
  'room-item': 'Room Item',
  'general-info': 'General Info',
};

/**
 * Descriptive text for each item type.
 * Displayed as helper text in selection UI.
 */
export const ITEM_TYPE_DESCRIPTIONS: Record<ItemTypeConst, string> = {
  appliance: 'Washer, dryer, stove, refrigerator, etc.',
  'room-item': 'Pantry, cabinets, closet, sink, etc.',
  'general-info': 'Trash schedule, WiFi info, house rules, etc.',
};

// =============================================================================
// Content Type Configuration
// =============================================================================

/**
 * Available content types for item documentation.
 */
export const CONTENT_TYPES = ['video', 'photo', 'pdf', 'text', 'url'] as const;

/**
 * Type for content type values derived from CONTENT_TYPES constant.
 */
export type ContentTypeConst = (typeof CONTENT_TYPES)[number];

/**
 * Human-readable labels for each content type.
 */
export const CONTENT_TYPE_LABELS: Record<ContentTypeConst, string> = {
  video: 'Video',
  photo: 'Photo',
  pdf: 'PDF Document',
  text: 'Text Instructions',
  url: 'Link/URL',
};

/**
 * Content source options with type-specific labels.
 * Maps source choice to available content types and their labels.
 */
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

// =============================================================================
// Workflow Configuration
// =============================================================================

/**
 * Default configuration values for the workflow.
 */
export const WORKFLOW_CONFIG_DEFAULTS = {
  /** Maximum number of items per session */
  maxItemsPerSession: 50,
  /** Whether to enable URL preview with metadata fetching */
  enableUrlPreview: true,
  /** Whether to enable debug logging */
  debug: false,
} as const;

/**
 * Ordered list of all workflow steps.
 * Used for navigation logic and progress calculation.
 */
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

/**
 * Type for workflow step values derived from WORKFLOW_STEPS constant.
 */
export type WorkflowStepConst = (typeof WORKFLOW_STEPS)[number];

// =============================================================================
// UI Constants
// =============================================================================

/**
 * Minimum touch target size in pixels.
 * Per PRD accessibility requirement for mobile-first design.
 */
export const TOUCH_TARGET_MIN_SIZE = 48;

/**
 * Progress weights for each step.
 * Used to calculate progress bar percentage.
 */
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

#### Verification Steps

- [ ] All item type constants are defined
- [ ] All content type constants are defined
- [ ] Workflow configuration defaults match Implementation Plan
- [ ] UI constants include accessibility values
- [ ] Run `npx tsc --noEmit` - no TypeScript errors

#### Acceptance Criteria

- Item type configuration complete with labels and descriptions
- Content type configuration complete with source options
- Workflow defaults match Implementation Plan Section "Integration Contract"
- Progress weights provide smooth progress bar animation
- All types are exported for consumer use

---

### Task 1.1.8: Create Suggestion Matrix

**Effort:** 0.75 story points (~2-3 hours)
**Priority:** 8
**Dependencies:** Task 1.1.6, Task 1.1.7

#### Description

Create the suggestion matrix mapping Room + ItemType combinations to suggested specific items, based on PRD Appendix A specifications.

#### Implementation Steps

1. Create suggestion matrix file
2. Implement complete matrix from Implementation Plan Appendix A
3. Add helper functions for querying suggestions

#### File to Create

**Path:** `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`

```typescript
/**
 * Suggestion Matrix for ItemCreationWorkflow
 *
 * Maps Room + ItemType combinations to suggested specific items.
 * Based on PRD Appendix A specifications.
 *
 * @module ItemCreationWorkflow/utils/suggestionMatrix
 * @see docs/prd/Plan-093-Item-Creation-Workflow.md Appendix A
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

import type { RoomType, ItemType } from '../ItemCreationWorkflow.types';

/**
 * Complete suggestion matrix mapping room and item type to suggested items.
 * Each room contains suggestions for each item type category.
 */
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
 * Returns empty array for invalid combinations or 'other' room.
 *
 * @param room - The selected room type
 * @param itemType - The selected item type
 * @returns Array of suggested item names
 */
export function getSuggestions(room: RoomType, itemType: ItemType): string[] {
  return SUGGESTION_MATRIX[room]?.[itemType] ?? [];
}

/**
 * Check if a room has any suggestions for the given item type.
 *
 * @param room - The room type to check
 * @param itemType - The item type to check
 * @returns True if suggestions exist
 */
export function hasSuggestions(room: RoomType, itemType: ItemType): boolean {
  return getSuggestions(room, itemType).length > 0;
}

/**
 * Get all unique suggestions across all rooms for a given item type.
 * Useful for autocomplete or search functionality.
 *
 * @param itemType - The item type to get suggestions for
 * @returns Alphabetically sorted array of unique suggestions
 */
export function getAllSuggestionsForType(itemType: ItemType): string[] {
  const suggestions = new Set<string>();

  Object.values(SUGGESTION_MATRIX).forEach((roomSuggestions) => {
    roomSuggestions[itemType]?.forEach((s) => suggestions.add(s));
  });

  return Array.from(suggestions).sort();
}

/**
 * Get all unique suggestions across all rooms and item types.
 * Useful for global search functionality.
 *
 * @returns Alphabetically sorted array of all unique suggestions
 */
export function getAllSuggestions(): string[] {
  const suggestions = new Set<string>();

  Object.values(SUGGESTION_MATRIX).forEach((roomSuggestions) => {
    Object.values(roomSuggestions).forEach((items) => {
      items.forEach((s) => suggestions.add(s));
    });
  });

  return Array.from(suggestions).sort();
}
```

#### Verification Steps

- [ ] File exists at the correct path
- [ ] All 9 rooms have entries in the matrix
- [ ] All 3 item types have entries for each room
- [ ] Suggestions match Implementation Plan Appendix A
- [ ] Helper functions work correctly
- [ ] Run `npx tsc --noEmit` - no TypeScript errors

#### Acceptance Criteria

- Complete matrix from Implementation Plan Appendix A
- All rooms (including 'other' with empty arrays) are defined
- Helper functions `getSuggestions`, `hasSuggestions`, `getAllSuggestionsForType`, `getAllSuggestions` are implemented
- Types are properly imported from the types file
- TypeScript compiles without errors

---

### Task 1.1.9: Create Barrel Export Files - Main and Utils

**Effort:** 0.5 story points (~1-2 hours)
**Priority:** 9
**Dependencies:** Tasks 1.1.2-1.1.8

#### Description

Create the main barrel export file and utils barrel export file following the established patterns from ItemCapture and ItemManager.

#### Implementation Steps

1. Create main index.ts with comprehensive exports
2. Create utils/index.ts barrel file

#### Files to Create

**Path:** `src/components/ItemCreationWorkflow/index.ts`

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
 *   ROOM_TYPES,
 *   getSuggestions,
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
  ContentData,

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
  // Room configuration
  ROOM_TYPES,
  ROOM_LABELS,
  ROOM_ICONS,

  // Item type configuration
  ITEM_TYPES,
  ITEM_TYPE_LABELS,
  ITEM_TYPE_DESCRIPTIONS,

  // Content type configuration
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  CONTENT_SOURCE_OPTIONS,

  // Workflow configuration
  WORKFLOW_CONFIG_DEFAULTS,
  WORKFLOW_STEPS,

  // UI constants
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
  getAllSuggestions,
} from './utils/suggestionMatrix';

// =============================================================================
// Hooks Export (placeholder for future tasks)
// =============================================================================

// Task 1.2: useWorkflowState
// export { useWorkflowState } from './hooks';
// export type { UseWorkflowStateReturn } from './hooks';

// Task 1.4: useSessionPersistence
// export { useSessionPersistence } from './hooks';

// Task 2.3: useSuggestions
// export { useSuggestions } from './hooks';

// Task 3.3: useUrlPreview
// export { useUrlPreview } from './hooks';

// =============================================================================
// Components Export (placeholder for future tasks)
// =============================================================================

// Task 1.3: Main component
// export { ItemCreationWorkflow } from './ItemCreationWorkflow';

// Task 1.3: WorkflowHeader
// export { WorkflowHeader } from './components/shared/WorkflowHeader';

// Task 1.3: ConfirmExitDialog
// export { ConfirmExitDialog } from './components/shared/ConfirmExitDialog';
```

**Path:** `src/components/ItemCreationWorkflow/utils/index.ts`

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

// Placeholder for Task 1.4: Session storage utilities
// export * from './sessionStorage';
```

#### Verification Steps

- [ ] Main index.ts exists and exports all types and constants
- [ ] Utils index.ts exists and re-exports constants and suggestion matrix
- [ ] Placeholder comments indicate future exports
- [ ] Run `npx tsc --noEmit` - no TypeScript errors
- [ ] Test import: Create temporary file to verify imports work

#### Acceptance Criteria

- Main index.ts follows the ItemCapture/ItemManager pattern
- All public types are exported
- All constants are exported
- Suggestion matrix functions are exported
- Placeholder comments document future additions
- TypeScript compiles without errors

---

### Task 1.1.10: Create Barrel Export Files - Components and Hooks

**Effort:** 0.5 story points (~1-2 hours)
**Priority:** 10
**Dependencies:** Task 1.1.9

#### Description

Create the remaining barrel export files for hooks, components, steps, and shared directories with placeholder comments.

#### Files to Create

**Path:** `src/components/ItemCreationWorkflow/hooks/index.ts`

```typescript
/**
 * ItemCreationWorkflow Hooks - Barrel Export
 *
 * @module ItemCreationWorkflow/hooks
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// =============================================================================
// State Management Hooks
// =============================================================================

// Placeholder for Task 1.2: useWorkflowState
// export { useWorkflowState } from './useWorkflowState';
// export type { UseWorkflowStateReturn } from './useWorkflowState';

// =============================================================================
// Persistence Hooks
// =============================================================================

// Placeholder for Task 1.4: useSessionPersistence
// export { useSessionPersistence } from './useSessionPersistence';

// =============================================================================
// Data Hooks
// =============================================================================

// Placeholder for Task 2.3: useSuggestions
// export { useSuggestions } from './useSuggestions';

// Placeholder for Task 3.3: useUrlPreview
// export { useUrlPreview } from './useUrlPreview';
```

**Path:** `src/components/ItemCreationWorkflow/components/index.ts`

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

**Path:** `src/components/ItemCreationWorkflow/components/steps/index.ts`

```typescript
/**
 * ItemCreationWorkflow Step Components - Barrel Export
 *
 * @module ItemCreationWorkflow/components/steps
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// =============================================================================
// Selection Steps (Phase 2)
// =============================================================================

// Task 2.1: RoomSelectionStep
// export { RoomSelectionStep } from './RoomSelectionStep';
// export type { RoomSelectionStepProps } from './RoomSelectionStep';

// Task 2.2: ItemTypeStep
// export { ItemTypeStep } from './ItemTypeStep';
// export type { ItemTypeStepProps } from './ItemTypeStep';

// Task 2.3: SpecificItemStep
// export { SpecificItemStep } from './SpecificItemStep';
// export type { SpecificItemStepProps } from './SpecificItemStep';

// =============================================================================
// Content Selection Steps (Phase 3)
// =============================================================================

// Task 3.1: ContentSourceStep
// export { ContentSourceStep } from './ContentSourceStep';
// export type { ContentSourceStepProps } from './ContentSourceStep';

// Task 3.2: ContentTypeStep
// export { ContentTypeStep } from './ContentTypeStep';
// export type { ContentTypeStepProps } from './ContentTypeStep';

// =============================================================================
// Content Creation Steps (Phase 4)
// =============================================================================

// Task 4.1: ContentCreationStep
// export { ContentCreationStep } from './ContentCreationStep';
// export type { ContentCreationStepProps } from './ContentCreationStep';

// Task 4.2: PreviewSaveStep
// export { PreviewSaveStep } from './PreviewSaveStep';
// export type { PreviewSaveStepProps } from './PreviewSaveStep';

// =============================================================================
// Session Flow Steps (Phase 5)
// =============================================================================

// Task 5.1: NextActionStep
// export { NextActionStep } from './NextActionStep';
// export type { NextActionStepProps } from './NextActionStep';

// =============================================================================
// Summary Steps (Phase 6)
// =============================================================================

// Task 6.1: SessionSummaryStep
// export { SessionSummaryStep } from './SessionSummaryStep';
// export type { SessionSummaryStepProps } from './SessionSummaryStep';
```

**Path:** `src/components/ItemCreationWorkflow/components/shared/index.ts`

```typescript
/**
 * ItemCreationWorkflow Shared Components - Barrel Export
 *
 * @module ItemCreationWorkflow/components/shared
 * @lastModified 2026-01-05 (REQ-093 Task 1.1)
 */

// =============================================================================
// Layout Components (Phase 1)
// =============================================================================

// Task 1.3: WorkflowHeader
// export { WorkflowHeader } from './WorkflowHeader';
// export type { WorkflowHeaderProps } from './WorkflowHeader';

// Task 1.3: ConfirmExitDialog
// export { ConfirmExitDialog } from './ConfirmExitDialog';
// export type { ConfirmExitDialogProps } from './ConfirmExitDialog';

// Task 1.5: SessionProgressBar
// export { SessionProgressBar } from './SessionProgressBar';
// export type { SessionProgressBarProps } from './SessionProgressBar';

// =============================================================================
// Selection Components (Phase 1 & 2)
// =============================================================================

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

// =============================================================================
// Content Components (Phase 4)
// =============================================================================

// Task 4.2: ContentPieceCard
// export { ContentPieceCard } from './ContentPieceCard';
// export type { ContentPieceCardProps } from './ContentPieceCard';

// =============================================================================
// Summary Components (Phase 6)
// =============================================================================

// Task 6.1: SessionItemCard
// export { SessionItemCard } from './SessionItemCard';
// export type { SessionItemCardProps } from './SessionItemCard';

// Task 6.2: PrintOptionsPanel
// export { PrintOptionsPanel } from './PrintOptionsPanel';
// export type { PrintOptionsPanelProps } from './PrintOptionsPanel';
```

#### Verification Steps

- [ ] All 4 barrel files exist at correct paths
- [ ] Each file has proper module documentation header
- [ ] Placeholder comments reference specific task numbers
- [ ] Run `npx tsc --noEmit` - no TypeScript errors

#### Acceptance Criteria

- All barrel files created with consistent structure
- Placeholder comments clearly indicate future task exports
- File organization matches Implementation Plan architecture
- TypeScript compiles without errors

---

### Task 1.1.11: Verification and Testing

**Effort:** 0.5 story points (~1-2 hours)
**Priority:** 11
**Dependencies:** All previous tasks

#### Description

Verify the complete scaffold by running TypeScript compilation and testing imports work correctly.

#### Implementation Steps

1. Run full TypeScript compilation check
2. Create a temporary test file to verify imports
3. Remove the test file after verification

#### Verification Commands

```bash
# TypeScript compilation check
npx tsc --noEmit

# Verify directory structure
find src/components/ItemCreationWorkflow -type f -name "*.ts" | sort

# Count lines of code
wc -l src/components/ItemCreationWorkflow/**/*.ts
```

#### Test Import File (Create, Test, Delete)

Create temporary file: `src/components/ItemCreationWorkflow/__test_imports__.ts`

```typescript
/**
 * Temporary file to verify imports work correctly.
 * DELETE THIS FILE AFTER VERIFICATION.
 */

import type {
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

  // State types
  WorkflowState,
  WorkflowAction,
} from './index';

import {
  ROOM_TYPES,
  ROOM_LABELS,
  ROOM_ICONS,
  ITEM_TYPES,
  ITEM_TYPE_LABELS,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  WORKFLOW_STEPS,
  SUGGESTION_MATRIX,
  getSuggestions,
  hasSuggestions,
  getAllSuggestionsForType,
} from './index';

// Type checks
const room: RoomType = 'kitchen';
const itemType: ItemType = 'appliance';
const step: WorkflowStep = 'room-selection';

// Function checks
const suggestions = getSuggestions(room, itemType);
const has = hasSuggestions(room, itemType);
const all = getAllSuggestionsForType(itemType);

// Const checks
const roomLabel = ROOM_LABELS[room];
const itemLabel = ITEM_TYPE_LABELS[itemType];

console.log({ suggestions, has, all, roomLabel, itemLabel });
```

#### Verification Steps

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] All files are listed in directory structure
- [ ] Test import file compiles without errors
- [ ] Delete test import file after verification
- [ ] Final `npx tsc --noEmit` passes after cleanup

#### Acceptance Criteria

- TypeScript compiles without errors
- All imports work correctly from `@/components/ItemCreationWorkflow`
- Directory structure matches the Implementation Plan
- No test files left in the codebase

---

## Summary

### Total Tasks: 11

| Task | Description | Effort | Priority |
|------|-------------|--------|----------|
| 1.1.1 | Create Directory Structure | 0.25 SP | 1 |
| 1.1.2 | Type Definitions - Configuration Types | 0.5 SP | 2 |
| 1.1.3 | Type Definitions - Session Types | 0.75 SP | 3 |
| 1.1.4 | Type Definitions - Output Types | 0.5 SP | 4 |
| 1.1.5 | Type Definitions - State Management Types | 0.75 SP | 5 |
| 1.1.6 | Constants File - Room Configuration | 0.5 SP | 6 |
| 1.1.7 | Constants File - Item Type & Content Config | 0.5 SP | 7 |
| 1.1.8 | Create Suggestion Matrix | 0.75 SP | 8 |
| 1.1.9 | Barrel Export Files - Main and Utils | 0.5 SP | 9 |
| 1.1.10 | Barrel Export Files - Components and Hooks | 0.5 SP | 10 |
| 1.1.11 | Verification and Testing | 0.5 SP | 11 |

**Total Estimated Effort:** ~5.5 story points

### Files to Create

| File Path | Task |
|-----------|------|
| `src/components/ItemCreationWorkflow/` (directory) | 1.1.1 |
| `src/components/ItemCreationWorkflow/hooks/` (directory) | 1.1.1 |
| `src/components/ItemCreationWorkflow/components/` (directory) | 1.1.1 |
| `src/components/ItemCreationWorkflow/components/steps/` (directory) | 1.1.1 |
| `src/components/ItemCreationWorkflow/components/shared/` (directory) | 1.1.1 |
| `src/components/ItemCreationWorkflow/utils/` (directory) | 1.1.1 |
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | 1.1.2-1.1.5 |
| `src/components/ItemCreationWorkflow/utils/constants.ts` | 1.1.6-1.1.7 |
| `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts` | 1.1.8 |
| `src/components/ItemCreationWorkflow/index.ts` | 1.1.9 |
| `src/components/ItemCreationWorkflow/utils/index.ts` | 1.1.9 |
| `src/components/ItemCreationWorkflow/hooks/index.ts` | 1.1.10 |
| `src/components/ItemCreationWorkflow/components/index.ts` | 1.1.10 |
| `src/components/ItemCreationWorkflow/components/steps/index.ts` | 1.1.10 |
| `src/components/ItemCreationWorkflow/components/shared/index.ts` | 1.1.10 |

### Definition of Done

- [ ] All directories created
- [ ] `ItemCreationWorkflow.types.ts` complete with all interfaces from Implementation Plan
- [ ] `constants.ts` complete with all room, item, and content type configurations
- [ ] `suggestionMatrix.ts` complete with full matrix from Appendix A
- [ ] All barrel export files created with consistent documentation
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Imports work from `@/components/ItemCreationWorkflow`

---

## Related Documents

- [Overview Document](REQ-093-component-scaffold-type-definitions-overview.md)
- [Implementation Plan: Item Creation Workflow](prd/Plan-093-Item-Creation-Workflow.md)
- [Request #093 in gen_requests.md](gen_requests.md)
- [ItemCapture Types Reference](../src/components/ItemCapture/ItemCapture.types.ts)
- [ItemCapture Constants Reference](../src/components/ItemCapture/utils/constants.ts)
- [ItemManager Index Reference](../src/components/ItemManager/index.ts)

---

*Document generated: 2026-01-05 01:34:31 UTC*
*Task 1.1 of Phase 1 - Foundation & Core Infrastructure*
*Request Reference: REQ-093*
