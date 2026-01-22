# Implementation Overview: Create TranslationManagement Types File

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E05-006 |
| Source File | docs/gen_requests_epic5.md |
| Original Request Date | 2026-01-22 19:30 |
| Breakdown Created | 2026-01-22 18:58 |
| T-shirt Size | M |
| Estimated Effort | 2-3 hours |

## Goals

Create a centralized TypeScript types file at `/src/components/TranslationManagement/TranslationManagement.types.ts` that defines all shared interfaces and types for the TranslationManagement component family. This establishes a strong typing foundation for Epic 5 UI components, hooks, and utilities.

**Technical Requirements:**
- Define component prop interfaces for all TranslationManagement UI components
- Define state and action types for component state management
- Define API response types matching Epic 5 API endpoints
- Define data display types for translation lists, previews, and summaries
- Re-export common types from existing translation modules for convenience
- Follow established patterns from `ItemManager.types.ts` and similar files
- Include comprehensive JSDoc documentation with module header

### Assumptions & Clarifications

- **Discovery**: Existing patterns from `/src/components/ItemManager/ItemManager.types.ts` show well-organized type file structure with:
  - Module JSDoc header with `@module`, `@see`, `@lastModified`
  - Logical section grouping with comment separators
  - Comprehensive inline documentation
  - Re-exports from related modules for convenience
- **Discovery**: Types from `/src/lib/translation-service/translation-service.types.ts` provide:
  - `SupportedLanguage`, `TranslationStatus`, `TranslatableEntityType`
  - Core translation service types to re-export
- **Assumption**: This types file serves as the single source of truth for all TranslationManagement component types
- **Assumption**: Types defined here will be imported by all Epic 5 Phase 2+ tasks
- **Clarification needed**: Should we include React-specific types (e.g., event handlers) or keep them in component files?

## Implementation Plan

### Step 1: Create Directory and File Structure
- **Description**: Set up the TranslationManagement component directory with types file
- **Rationale**: Establish file structure before defining types
- **Estimated Effort**: 5 minutes

Create directory and file:
```bash
mkdir -p src/components/TranslationManagement
touch src/components/TranslationManagement/TranslationManagement.types.ts
touch src/components/TranslationManagement/index.ts
```

File structure:
```
src/components/TranslationManagement/
├── TranslationManagement.types.ts  # NEW - this task
├── index.ts                         # NEW - export types
└── [future components will go here]
```

### Step 2: Write Module Header and Documentation
- **Description**: Add comprehensive module JSDoc header following codebase conventions
- **Rationale**: Establish documentation standards and provide context for future developers
- **Estimated Effort**: 10 minutes

Module header template (following ItemManager pattern):
```typescript
/**
 * TranslationManagement Component Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the TranslationManagement
 * component family. These types define component props, state management, API responses,
 * and data models for translation management features.
 *
 * @module TranslationManagement/types
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-22
 * @requestReference REQ-E05-006
 */
```

### Step 3: Define Core Type Re-exports
- **Description**: Re-export commonly used types from existing translation modules
- **Rationale**: Provide convenience imports and establish single import point for consumers
- **Estimated Effort**: 15 minutes

Re-export section:
```typescript
// =============================================================================
// Core Type Re-exports
// =============================================================================

/**
 * Re-exported types from translation-service module for convenience.
 * Components can import all translation-related types from this single file.
 */
export type {
  SupportedLanguage,
  TranslationStatus,
  TranslatableEntityType,
  TranslationContext,
} from '@/lib/translation-service/translation-service.types';

export type {
  EntityType,
} from '@/lib/job-queue/translation-jobs.types';
```

Verify imports work correctly and types are available.

### Step 4: Define Display and Data Types
- **Description**: Define types for displaying translation data in lists, tables, and widgets
- **Rationale**: These are the core data structures passed between components
- **Estimated Effort**: 30 minutes

Types to define:
1. **TranslationItemDisplay**: Main data structure for list/table rows
2. **LanguageTranslationSummary**: Per-language status for display
3. **TranslationSummary**: Aggregate counts and statistics
4. **LanguageStatusCount**: Per-language count breakdown
5. **TranslationFieldContent**: Individual field data for editing

Structure (with JSDoc for each interface):
```typescript
// =============================================================================
// Display Types
// =============================================================================

/**
 * Translation item data for display in lists and tables.
 * Combines entity metadata with translation status across all languages.
 */
export interface TranslationItemDisplay {
  entityId: string;
  entityType: TranslatableEntityType;
  entityName: string;
  sourceLanguage: SupportedLanguage;
  propertyId?: string;
  propertyName?: string;
  translations: LanguageTranslationSummary[];
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed' | 'stale';
  sourceUpdatedAt?: string;
  isStale?: boolean;
}

/**
 * Per-language translation status summary.
 */
export interface LanguageTranslationSummary {
  language: SupportedLanguage;
  status: TranslationStatus;
  translatedAt?: string;
  isStale?: boolean;
  canEdit: boolean;
  canRetranslate: boolean;
}

// ... continue with other display types
```

### Step 5: Define Component Props Interfaces
- **Description**: Define props interfaces for all TranslationManagement UI components
- **Rationale**: Establish type contracts for component communication
- **Estimated Effort**: 30 minutes

Component props to define:
1. **TranslationStatusWidgetProps**: Dashboard widget
2. **TranslationPreviewPanelProps**: Slide-out preview panel
3. **TranslationEditorProps**: Inline editor modal
4. **TranslationStatusItemProps**: List/table row component
5. **TranslationProgressBarProps**: Progress visualization
6. **TranslationStatusColumnProps**: Table column component
7. **TranslationStatusFilterProps**: Filter dropdown
8. **BulkTranslationBarProps**: Bulk action bar

Structure with comprehensive JSDoc:
```typescript
// =============================================================================
// Component Props Interfaces
// =============================================================================

/**
 * Props for TranslationStatusWidget component.
 * Dashboard widget showing translation progress summary.
 */
export interface TranslationStatusWidgetProps {
  /** Filter to specific property (optional) */
  propertyId?: string;
  /** Compact mode for sidebar display */
  compact?: boolean;
  /** Callback when user clicks "View All" */
  onViewAll?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ... continue with other component props
```

### Step 6: Define Filter, Sort, and State Types
- **Description**: Define types for filtering, sorting, and component state management
- **Rationale**: Enable type-safe state management in components and hooks
- **Estimated Effort**: 20 minutes

Types to define:
1. **TranslationFilterState**: Filter configuration object
2. **TranslationSortOption**: Sort option union type
3. **TranslationPreviewState**: Preview panel state
4. **TranslationEditorState**: Editor component state

Structure:
```typescript
// =============================================================================
// Filter and Sort Types
// =============================================================================

/**
 * Filter state for translation list views.
 * All fields are optional for flexible filtering.
 */
export interface TranslationFilterState {
  entityTypes?: TranslatableEntityType[];
  propertyIds?: string[];
  languages?: SupportedLanguage[];
  statuses?: ('complete' | 'partial' | 'pending' | 'failed' | 'stale')[];
  searchQuery?: string;
  showStaleOnly?: boolean;
}

/**
 * Sort options for translation lists.
 */
export type TranslationSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'updated-desc'
  | 'updated-asc'
  | 'status-asc'
  | 'status-desc';

// ... continue with state types
```

### Step 7: Define API Request/Response Types
- **Description**: Define types matching Epic 5 API endpoint contracts
- **Rationale**: Ensure type safety when calling translation management APIs
- **Estimated Effort**: 20 minutes

API types to define:
1. **TranslationStatusApiResponse**: GET /api/translations/status
2. **UpdateTranslationRequest**: PUT /api/translations/[entityType]/[entityId]/[language]
3. **RetranslateApiRequest**: POST /api/translations/retranslate
4. **RetranslateApiResponse**: POST /api/translations/retranslate response
5. **BulkTranslationRequest**: Bulk operation request
6. **BulkTranslationResult**: Bulk operation result

Structure:
```typescript
// =============================================================================
// API Types
// =============================================================================

/**
 * Response from GET /api/translations/status endpoint.
 */
export interface TranslationStatusApiResponse {
  items: TranslationItemDisplay[];
  summary: TranslationSummary;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// ... continue with other API types
```

### Step 8: Define Hook Return Types
- **Description**: Define return types for custom hooks in TranslationManagement
- **Rationale**: Enable type-safe hook consumption in components
- **Estimated Effort**: 15 minutes

Hook return types:
1. **UseTranslationStatusReturn**: Translation status hook
2. **UseTranslationPreviewReturn**: Preview panel hook
3. **UseTranslationEditorReturn**: Editor hook
4. **UseTranslationRealtimeReturn**: Realtime updates hook

Structure:
```typescript
// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * Return type for useTranslationStatus hook.
 * Provides translation data, state, and actions.
 */
export interface UseTranslationStatusReturn {
  items: TranslationItemDisplay[];
  summary: TranslationSummary;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  filters: TranslationFilterState;
  setFilters: (filters: Partial<TranslationFilterState>) => void;
  sortBy: TranslationSortOption;
  setSortBy: (sort: TranslationSortOption) => void;
}

// ... continue with other hook types
```

### Step 9: Create Index Export File
- **Description**: Create index.ts to export all types from the module
- **Rationale**: Enable clean imports like `import { TypeName } from '@/components/TranslationManagement'`
- **Estimated Effort**: 5 minutes

Index file:
```typescript
/**
 * TranslationManagement Module Exports
 */

// Export all types
export * from './TranslationManagement.types';

// Future: Export components
// export { TranslationStatusWidget } from './TranslationStatusWidget';
// export { TranslationPreviewPanel } from './TranslationPreviewPanel';
// ... etc
```

### Step 10: Validate Types and Documentation
- **Description**: Run type checker and verify all types are valid and well-documented
- **Rationale**: Catch type errors and ensure quality before downstream use
- **Estimated Effort**: 10 minutes

Validation steps:
1. Run TypeScript compiler: `npm run typecheck`
2. Verify no type errors in TranslationManagement.types.ts
3. Check that re-exports work correctly (import test)
4. Verify JSDoc appears in IDE tooltips
5. Review type complexity (avoid overly complex union/intersection types)

Test import:
```typescript
// In a test file
import {
  TranslationItemDisplay,
  TranslationStatusWidgetProps,
  UseTranslationStatusReturn,
  SupportedLanguage,
} from '@/components/TranslationManagement';

// Verify types are accessible and autocomplete works
```

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files to Create
| File | Target | Type |
|------|--------|------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | — | Create |
| `/src/components/TranslationManagement/index.ts` | — | Create |

### Existing Files to Reference (Read-Only)
| File | Purpose |
|------|---------|
| `/src/components/ItemManager/ItemManager.types.ts` | Pattern reference for type file structure |
| `/src/lib/translation-service/translation-service.types.ts` | Source of types to re-export |
| `/src/lib/job-queue/translation-jobs.types.ts` | Source of EntityType to re-export |
| `/src/lib/content-translation/content-translation.types.ts` | Reference for content translation types |

## Dependencies

### Depends On (Completed First)
- **REQ-E05-001**: Translation Status API endpoint
  - Provides: API response structure for TranslationStatusApiResponse
  - Reason: Types must match actual API contracts
- **REQ-E05-002**: Update Translation API endpoint
  - Provides: API request structure for UpdateTranslationRequest
  - Reason: Types must match endpoint expectations
- **REQ-E05-003**: Re-Translate API endpoint
  - Provides: API request/response structure for retranslate operations
  - Reason: Types must match bulk operation contracts
- **REQ-E05-004**: source_version_at columns migration
  - Provides: Database schema with stale detection capability
  - Reason: isStale field requires source_version_at to exist
- **REQ-E05-005**: TypeScript database types update
  - Provides: Updated database types with new columns
  - Reason: May need to reference updated database types

### Blocks (Requires This First)
- **All Epic 5 Phase 2+ UI Components**: Cannot develop without shared types
  - REQ-E05-007: TranslationPreviewPanel component
  - REQ-E05-008: TranslationStatusItem component
  - REQ-E05-009: TranslationProgressBar component
  - REQ-E05-010: TranslationEditor component
  - REQ-E05-011: TranslationStatusWidget component
  - REQ-E05-012+: All other TranslationManagement components
- **Epic 5 Hooks**: Custom hooks need these types
  - useTranslationStatus hook
  - useTranslationPreview hook
  - useTranslationRealtime hook

### Parallel Safety
- **Files touched**:
  - `/src/components/TranslationManagement/TranslationManagement.types.ts` (new file)
  - `/src/components/TranslationManagement/index.ts` (new file)
- **Conflicts with**:
  - None - new files in new directory
- **Safe to parallelize with**:
  - All Epic 5 API endpoint tasks (different scope)
  - Epic 5 database tasks (different scope)
  - Planning for Epic 5 UI components (will use these types once available)

### External Dependencies
- TypeScript 5.x compiler
- Existing translation service modules
- React types (for component props)
- Next.js types (if using Next-specific props)

## Risks and Considerations

### Potential Side Effects
- **Type changes impact all consumers**: Once components start using these types, changes require coordination
  - Mitigation: Design types carefully upfront
  - Mitigation: Use optional fields where flexibility needed
  - Mitigation: Version types if breaking changes required

- **Re-exported types may change upstream**: If translation-service types change, this file breaks
  - Mitigation: Use `export type` (type-only exports) to avoid runtime dependencies
  - Mitigation: Document which types are re-exported vs owned
  - Mitigation: Pin to stable versions of upstream modules

- **Type complexity**: Overly complex types can slow TypeScript compiler
  - Mitigation: Keep types simple and flat where possible
  - Mitigation: Avoid deeply nested conditional types
  - Mitigation: Use union types sparingly

### Testing Requirements
- **Type checking**:
  - Run `npm run typecheck` to verify no errors
  - Verify re-exports work correctly
  - Test that types can be imported by consumers

- **IDE testing**:
  - Verify autocomplete shows types from this module
  - Check that JSDoc comments appear in tooltips
  - Test that import suggestions include this module

- **Documentation review**:
  - Every exported type has JSDoc comment
  - Complex types have usage examples
  - Module header is complete and accurate

### Open Questions
- [ ] Should we include React-specific types (event handlers, refs) or keep those in component files? (Recommendation: Keep in component files for separation of concerns)
- [ ] Should we version these types or maintain backward compatibility? (Recommendation: Maintain compatibility, use new types for breaking changes)
- [ ] Should we export utility types (Pick, Omit variations)? (Recommendation: Only if widely used across components)
- [ ] Should we add Zod schemas alongside TypeScript types for runtime validation? (Recommendation: Defer to future enhancement, not needed for Phase 2)

## Out of Scope

The following are explicitly **not** included in this task:
- Implementing any UI components that use these types
- Creating custom hooks that use these types
- Implementing API endpoint logic (types match existing endpoints)
- Adding runtime validation (Zod, Yup, etc.)
- Creating test utilities or mock data generators
- Writing unit tests for types (types are compile-time only)
- Creating type guards or type assertion functions
- Adding branded types or nominal typing
- Creating React Context types (those go in context files)
- Defining form validation schemas
- Creating CSS type definitions
- Adding internationalization (i18n) type helpers
- Performance optimization (types have no runtime cost)
- Creating migration guides for type changes

## Special Notes

### Relationship to Existing Type Files

This types file follows established patterns from other component families:
- **ItemManager.types.ts**: Configuration, props, display types
- **MediaManagement.types.ts**: Media-specific types
- **InstructionEditor.types.ts**: Editor component types

Key pattern elements to follow:
1. Module JSDoc header with metadata
2. Logical section grouping with comment separators
3. Comprehensive inline JSDoc for interfaces
4. Re-exports from related modules
5. Clear separation of concerns (display vs API vs state)

### Type Organization Strategy

Types are organized into logical sections:
1. **Core Type Re-exports**: Common types from other modules
2. **Display Types**: Data structures for UI rendering
3. **Component Props**: Interface contracts for components
4. **Filter and Sort Types**: UI interaction types
5. **State Management Types**: Component state structures
6. **API Types**: Request/response contracts
7. **Hook Return Types**: Custom hook interfaces

This organization makes it easy to find types and understand relationships.

### Re-export Strategy

Re-exporting types from upstream modules provides:
- **Convenience**: Single import point for consumers
- **Abstraction**: Hide internal module structure
- **Flexibility**: Can swap implementations without breaking consumers

Use `export type` for type-only exports to avoid runtime dependencies.

### Documentation Standards

Every exported type should have:
- JSDoc comment block
- Description of purpose
- Field descriptions for interfaces
- Usage examples for complex types
- Cross-references to related types

Example:
```typescript
/**
 * Translation item display data.
 * Used in lists, tables, and detail views.
 *
 * @example
 * const item: TranslationItemDisplay = {
 *   entityId: '123',
 *   entityType: 'article',
 *   entityName: 'How to Use Dishwasher',
 *   sourceLanguage: 'en',
 *   translations: [...],
 *   overallStatus: 'partial'
 * };
 */
export interface TranslationItemDisplay { ... }
```

### Future Extensibility

This types file is designed for extension:
- Add new component props as components are created
- Add new display types as UI evolves
- Add new API types as endpoints are added
- Maintain backward compatibility when adding fields

Breaking changes should be rare and coordinated across the team.

---
*Document generated: 2026-01-22 18:58*
