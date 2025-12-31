# REQ-031: ItemCapture Component Directory Structure Setup - Implementation Overview
*Generated: 2025-12-31 14:30:00*

## Reference
- **Request**: REQ-031 (ItemCapture Component Directory Structure Setup)
- **Source**: docs/gen_requests.md
- **Implementation Plan**: docs/prd/item-capture-implementation-plan.md
- **Type**: New Feature (Foundation Setup)
- **Phase**: 1 - Foundation
- **Task ID**: 1.1
- **Size**: XS

## Goals
1. Create `/src/components/ItemCapture/` directory structure
2. Set up barrel exports in `index.ts` for clean imports
3. Create `ItemCapture.types.ts` with all TypeScript interfaces
4. Follow existing project component organization patterns
5. Ensure zero compilation errors or TypeScript warnings

## Context from Implementation Plan

### Component Hierarchy (Target Structure)
Per the implementation plan, Task 1.1 establishes the foundation for this hierarchy:

```
ItemCapture/
├── index.ts                          # Public export: ItemCapture, ItemCaptureProps, ItemRecord
├── ItemCapture.tsx                   # Main orchestrator component (Phase 1.2+)
├── ItemCapture.types.ts              # All TypeScript interfaces (THIS TASK)
├── hooks/                            # Custom hooks (Phase 1.2+)
├── components/                       # Sub-components (Phase 1.3+)
│   ├── steps/                        # Wizard step components
│   ├── shared/                       # Shared UI components
│   └── editors/                      # Media editing components
└── utils/                            # Utility functions (Phase 2+)
```

### Task Dependencies
- **This Task (1.1)**: No dependencies - can start immediately
- **Task 1.2** (State Machine Hook): Depends on this task completing
- **Task 1.3** (Wizard Navigation): Depends on Task 1.2

### Existing Patterns to Follow
Per implementation plan analysis of existing codebase:

| Pattern | Example File | Application to This Task |
|---------|--------------|-------------------------|
| Client components | `'use client'` directive | Will be needed in `ItemCapture.tsx` (Task 1.2) |
| Props interface | `src/components/RegistrationForm.tsx` | Interface defined in separate types file |
| Type exports | `src/types/index.ts` | Central type definitions with re-exports |
| UUID generation | `src/components/ItemForm.tsx:9-14` | Custom `generateUUID()` function pattern |

## Implementation Order

### Step 1: Create Directory Structure
Create the base directory and subdirectories for the ItemCapture component.

**Directories to create:**
- `/src/components/ItemCapture/`
- `/src/components/ItemCapture/hooks/`
- `/src/components/ItemCapture/components/`
- `/src/components/ItemCapture/components/steps/`
- `/src/components/ItemCapture/components/shared/`
- `/src/components/ItemCapture/components/editors/`
- `/src/components/ItemCapture/utils/`

### Step 2: Create TypeScript Types File
Create `ItemCapture.types.ts` with all interfaces defined in the implementation plan.

**Interfaces to implement:**
1. `ItemCaptureConfig` - Configuration options for component behavior
2. `ItemCaptureProps` - Main component props
3. `ItemRecord` - Structured output returned via onComplete
4. `MediaItem` - Individual media item within an ItemRecord
5. `MediaMetadata` - Type-specific metadata for media items
6. `ItemMetadata` - Internal metadata state interface
7. `ApplianceType` - Union type for appliance categories
8. `WizardStep` - Union type for wizard step names
9. `ItemCaptureState` - State machine state interface
10. `ItemCaptureAction` - Action types for reducer

### Step 3: Create Barrel Export File
Create `index.ts` with exports for public consumption.

**Exports:**
- All public types from `ItemCapture.types.ts`
- Placeholder export comment for future `ItemCapture` component

### Step 4: Verification
- Run TypeScript compilation to verify no errors
- Verify imports work correctly from barrel export

## Authorized Files and Functions for Modification

### New Files to Create

#### `/src/components/ItemCapture/index.ts`
- **Purpose**: Barrel export file for clean imports
- **Exports**:
  - All public types: `ItemCaptureProps`, `ItemCaptureConfig`, `ItemRecord`, `MediaItem`, `MediaMetadata`, `ApplianceType`
  - Future: `ItemCapture` component (Task 1.2)

#### `/src/components/ItemCapture/ItemCapture.types.ts`
- **Purpose**: Central TypeScript type definitions
- **Interfaces**:
  - `ItemCaptureConfig` - Optional configuration overrides
  - `ItemCaptureProps` - Main component props (onComplete, onCancel, config, className)
  - `ItemRecord` - Output data structure
  - `MediaItem` - Individual media item structure
  - `MediaMetadata` - Media-specific metadata
  - `ItemMetadata` - Internal item metadata (title, location, tags, applianceType)
  - `WizardStep` - Union type for step navigation
  - `ItemCaptureState` - State machine state shape
  - `ItemCaptureAction` - Discriminated union for reducer actions
- **Types**:
  - `ApplianceType` - String literal union for appliance categories

### Directories to Create
- `/src/components/ItemCapture/` - Root directory
- `/src/components/ItemCapture/hooks/` - Custom React hooks
- `/src/components/ItemCapture/components/` - Sub-components root
- `/src/components/ItemCapture/components/steps/` - Wizard step components
- `/src/components/ItemCapture/components/shared/` - Shared UI components
- `/src/components/ItemCapture/components/editors/` - Media editing components
- `/src/components/ItemCapture/utils/` - Utility functions

### Existing Files (No Modification Required)
This task does not require modification of any existing files. All changes are additive.

**Note**: The existing files at `/src/components/ItemCapture/editors/ImageCropper.tsx` and `/src/components/ItemCapture/utils/pdfThumbnailGenerator.ts` should be preserved - they were created as part of earlier spike work (REQ-028).

## Technical Specifications

### TypeScript Interfaces (From Implementation Plan)

```typescript
// Configuration options
interface ItemCaptureConfig {
  maxVideoDuration?: number;        // default: 120 seconds
  maxFileSize?: number;             // default: 100MB
  maxTotalSize?: number;            // default: 200MB
  allowedMediaTypes?: ('video' | 'image' | 'pdf')[];
  maxPhotos?: number;               // default: 10
  maxTextLength?: number;           // default: 5000 chars
  videoResolution?: { width: number; height: number };
  debug?: boolean;
}

// Main props
interface ItemCaptureProps {
  onComplete: (record: ItemRecord) => void;
  onCancel: () => void;
  config?: ItemCaptureConfig;
  className?: string;
}

// Output structure
interface ItemRecord {
  id: string;
  title: string;
  location?: string;
  tags?: string[];
  applianceType?: ApplianceType;
  contentType: 'media' | 'text-only' | 'pdf-only' | 'mixed';
  media: MediaItem[];
  instructions?: string;
  createdAt: Date;
}
```

### Appliance Types (From Implementation Plan Appendix A)
```typescript
type ApplianceType =
  | 'washer' | 'dryer' | 'dishwasher' | 'oven' | 'microwave'
  | 'refrigerator' | 'hvac' | 'water_heater' | 'garbage_disposal'
  | 'security_system' | 'smart_home' | 'entertainment'
  | 'pool_spa' | 'garage' | 'other';
```

## Success Validation Checklist

### Directory Structure
- [ ] `/src/components/ItemCapture/` directory exists
- [ ] `/src/components/ItemCapture/hooks/` directory exists
- [ ] `/src/components/ItemCapture/components/` directory exists
- [ ] `/src/components/ItemCapture/components/steps/` directory exists
- [ ] `/src/components/ItemCapture/components/shared/` directory exists
- [ ] `/src/components/ItemCapture/components/editors/` directory exists
- [ ] `/src/components/ItemCapture/utils/` directory exists

### Type Definitions
- [ ] `ItemCapture.types.ts` contains all required interfaces
- [ ] `ItemCaptureConfig` interface is complete
- [ ] `ItemCaptureProps` interface is complete
- [ ] `ItemRecord` interface is complete
- [ ] `MediaItem` interface is complete
- [ ] `MediaMetadata` interface is complete
- [ ] `ApplianceType` type is defined
- [ ] Internal state types (`WizardStep`, `ItemCaptureState`, `ItemCaptureAction`) are defined

### Barrel Export
- [ ] `index.ts` exports all public types
- [ ] Import `@/components/ItemCapture` resolves correctly
- [ ] Named imports work: `import { ItemCaptureProps, ItemRecord } from '@/components/ItemCapture'`

### Compilation
- [ ] `npm run build` completes without TypeScript errors
- [ ] No unused export warnings
- [ ] No type conflicts with existing codebase

## Notes

### Pattern Alignment
- Follow existing project conventions observed in `src/types/index.ts`
- Use JSDoc comments for interface properties (matches implementation plan documentation style)
- Export types using ES module syntax

### Future Integration Points
- Types will be consumed by state machine hook (Task 1.2)
- `ItemRecord` output structure will be used by parent components
- `ApplianceType` will be used by MetadataStep component (Task 1.4)

### Preserving Existing Work
Two files already exist from REQ-028 bundle analysis spike:
- `editors/ImageCropper.tsx` - Image cropping component
- `utils/pdfThumbnailGenerator.ts` - PDF thumbnail utility

These should be preserved during directory structure creation.

## Dependencies
- TypeScript 5.x (existing in project)
- No new npm packages required
- No runtime dependencies

## Risk Assessment
- **Risk Level**: Very Low
- **Rationale**:
  - Purely additive changes (no modifications to existing code)
  - Type-only files have no runtime impact
  - Standard directory creation operations
  - No external dependencies
