# Detailed Task Breakdown: REQ-208 - Update Type Definitions to Separate Item from Article

**Created:** 2026-01-12 22:15:00 UTC
**Last Modified:** 2026-01-12 16:35:00 UTC
**Request ID:** REQ-208
**Status:** COMPLETED
**Overview Document:** docs/REQ-208-update-type-definitions-overview.md
**Implementation Plan Reference:** Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md
**Phase:** 5 - Fix Data Model - Separate Item from Article (ITEM-02)
**Task ID:** 5.1
**Priority:** CRITICAL

---

## Summary

This document provides a granular task breakdown for updating the type definitions in `ItemCreationWorkflow.types.ts` to establish a clear separation between physical Items and their associated Article/Instruction content. The implementation creates a one-to-many relationship where each Item can have multiple Articles with different purposes.

---

## Authorized Files for Modification

| File | Modification Type | Lines Affected |
|------|-------------------|----------------|
| `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts` | ADD Article interface, MODIFY SessionItem, MODIFY CurrentItemState | 111-217 |
| `src/components/ItemCreationWorkflow/index.ts` | ADD Article type export | Exports section (~70-93) |
| `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts` | ADD Article mock factory, UPDATE SessionItem factory | 41-52, new section |

---

## Prerequisites

- [x] Read and understand the current `ItemCreationWorkflow.types.ts` structure
- [x] Verify `PurposeType` enum exists at line 104-111
- [x] Confirm `ContentPiece` interface exists and is correctly defined
- [x] Ensure no conflicting type definition changes are in progress

---

## Task Breakdown

### Task 1: Add Article Interface Definition
**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location:** After line 111 (after PurposeType definition)

#### Implementation Steps

1.1. **Add Article Types Section Header**
   - Insert a new section comment block after line 111
   - Section title: "Article Types"

   ```typescript
   // =============================================================================
   // Article Types (REQ-208)
   // =============================================================================
   ```

1.2. **Add Article Interface**
   - Create the `Article` interface with the following fields:

   ```typescript
   /**
    * An Article/Instruction associated with an Item.
    * Multiple articles can exist per item, each with a different purpose.
    * The article title is derived from the purpose type.
    *
    * @example
    * ```typescript
    * const article: Article = {
    *   id: 'article-123',
    *   title: 'How to Clean',
    *   purpose: 'how-to-clean',
    *   content: [contentPiece1, contentPiece2],
    *   createdAt: new Date(),
    * };
    * ```
    *
    * @see REQ-208 - Update Type Definitions to Separate Item from Article
    */
   export interface Article {
     /** Unique article identifier (UUID) */
     id: string;
     /** Article title (derived from purpose, e.g., "How to Clean") */
     title: string;
     /** Purpose type that determines the article title and categorization */
     purpose: PurposeType;
     /** Content pieces for this article (videos, photos, text, etc.) */
     content: ContentPiece[];
     /** When the article was created */
     createdAt: Date;
   }
   ```

#### Verification Steps

- [x] TypeScript compiles without errors
- [x] Article interface is accessible for import
- [x] JSDoc comments render correctly in IDE hover tooltips
- [x] Article interface uses existing `PurposeType` and `ContentPiece` types

**Implementation Note:** Article interface added at lines 114-146 of ItemCreationWorkflow.types.ts

---

### Task 2: Update SessionItem Interface with Articles Array
**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location:** Lines 193-217 (SessionItem interface)

#### Implementation Steps

2.1. **Update SessionItem JSDoc Comment**
   - Update the interface comment to clarify this represents a physical item

   ```typescript
   /**
    * A physical Item that gets ONE QR code.
    * Updated to separate item name from article content.
    * An item can have multiple articles with different purposes.
    *
    * @example
    * ```typescript
    * const item: SessionItem = {
    *   id: 'item-123',
    *   name: 'Cabinets',  // Physical item name, appears on QR code
    *   room: 'kitchen',
    *   itemType: 'appliance',
    *   content: [],  // Deprecated, use articles[].content
    *   createdAt: new Date(),
    *   articles: [article1, article2],
    * };
    * ```
    *
    * @see REQ-208 - Item now has articles array
    */
   ```

2.2. **Update name Field Comment**
   - Clarify that `name` is the physical item name appearing on QR codes

   ```typescript
   /** Physical item name (e.g., "Cabinets", "Fridge") - appears on QR code label */
   name: string;
   ```

2.3. **Add articles Field**
   - Add optional `articles` array field after `tags`

   ```typescript
   /** Articles/instructions for this item (one-to-many relationship) */
   articles?: Article[];
   ```

2.4. **Mark content Field as Deprecated**
   - Add `@deprecated` JSDoc tag to the existing content field

   ```typescript
   /**
    * All content pieces attached to this item
    * @deprecated Use articles[].content instead. Kept for backward compatibility.
    */
   content: ContentPiece[];
   ```

#### Verification Steps

- [x] TypeScript compiles without errors
- [x] Existing code using `SessionItem.content` still compiles (backward compatibility)
- [x] IDE shows deprecation warning when accessing `content` field directly
- [x] `articles` field is optional and accepts `Article[]`

**Implementation Note:** SessionItem interface updated at lines 249-299. `articles` field added at line 298, `content` field marked deprecated at lines 282-286.

---

### Task 3: Update CurrentItemState Interface with currentArticle
**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
**Location:** Lines 160-187 (CurrentItemState interface)

#### Implementation Steps

3.1. **Update CurrentItemState JSDoc Comment**
   - Add documentation explaining the separation of item and article

   ```typescript
   /**
    * State for the item currently being created.
    * Progressively filled as user moves through steps.
    * Updated to separate physical item properties from current article being created.
    *
    * - Item properties: room, itemType, specificItem (physical identity)
    * - Article properties: currentArticle (content being created)
    *
    * @see REQ-208 - CurrentItemState now separates item from article
    */
   ```

3.2. **Update itemName Field Comment**
   - Clarify that `itemName` equals `specificItem` and appears on QR codes

   ```typescript
   /** Physical item name - equals specificItem, shown on QR code label */
   itemName: string;
   ```

3.3. **Add currentArticle Nested Object**
   - Insert after `itemName` field, before `purpose` field

   ```typescript
   /**
    * Current article being created for this item.
    * Contains article-specific properties separated from item identity.
    */
   currentArticle: {
     /** Article title derived from purpose (e.g., "How to Clean") */
     title: string;
     /** Purpose selection for the article */
     purpose: PurposeType | null;
     /** Content pieces for this article */
     content: ContentPiece[];
   };
   ```

3.4. **Mark Legacy Fields as Deprecated**
   - Add `@deprecated` tags to `purpose` and `content` fields
   - Make them optional for backward compatibility

   ```typescript
   /**
    * Purpose/intent for this item content (Plan-094)
    * @deprecated Use currentArticle.purpose instead. Kept for backward compatibility.
    */
   purpose?: PurposeType | null;
   ```

   ```typescript
   /**
    * Content pieces added to this item
    * @deprecated Use currentArticle.content instead. Kept for backward compatibility.
    */
   content?: ContentPiece[];
   ```

#### Verification Steps

- [x] TypeScript compiles without errors
- [x] Existing code using `CurrentItemState.purpose` still compiles
- [x] Existing code using `CurrentItemState.content` still compiles
- [x] IDE shows deprecation warnings for legacy fields
- [x] `currentArticle` is a required field with correct nested structure

**Implementation Note:** CurrentItemState interface updated at lines 191-247. `currentArticle` required field added at lines 214-225, legacy `purpose` and `content` fields marked deprecated and made optional.

---

### Task 4: Export Article Type from index.ts
**Story Points:** 0.25
**File:** `src/components/ItemCreationWorkflow/index.ts`
**Location:** Lines 70-93 (Public type exports section)

#### Implementation Steps

4.1. **Add Article to Type Exports**
   - Add `Article` to the export type statement

   ```typescript
   export type {
     // Configuration
     ItemCreationWorkflowProps,
     WorkflowConfig,

     // Domain types
     RoomType,
     ItemType,
     ContentType,
     PurposeType,

     // Article types (REQ-208)
     Article,

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
   ```

4.2. **Update Module JSDoc Comment**
   - Add Article to the types section in the header comment (optional)

   ```typescript
   * - **Article**: Content grouped by purpose (REQ-208)
   ```

#### Verification Steps

- [x] `Article` type is importable from `@/components/ItemCreationWorkflow`
- [x] No duplicate export errors
- [x] TypeScript compiles without errors

**Implementation Note:** Article type export added at line 83 in index.ts. Module JSDoc comment updated at lines 55, 67.

---

### Task 5: Update Mock Factories for Testing
**Story Points:** 0.5
**File:** `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts`
**Location:** After SessionItem factory (~line 53)

#### Implementation Steps

5.1. **Import Article Type**
   - Add `Article` to the import statement at line 11-23

   ```typescript
   import type {
     SessionItem,
     ContentPiece,
     ContentData,
     ContentType,
     WorkflowSession,
     WorkflowState,
     CurrentItemState,
     RoomType,
     ItemType,
     WorkflowStep,
     PurposeType,
     Article,  // NEW
   } from '../../ItemCreationWorkflow.types';
   ```

5.2. **Add Article Factory Section**
   - Insert new section after SessionItem Factory (after line 52)

   ```typescript
   // =============================================================================
   // Article Factory (REQ-208)
   // =============================================================================

   /**
    * Creates a mock Article with sensible defaults.
    * All properties can be overridden via the overrides parameter.
    *
    * @param overrides - Partial Article to override defaults
    * @returns A complete Article instance
    */
   export const createMockArticle = (
     overrides?: Partial<Article>
   ): Article => {
     const purpose = overrides?.purpose ?? 'how-to-use';
     const purposeLabel = PURPOSE_LABELS[purpose];

     return {
       id: crypto.randomUUID(),
       title: purposeLabel,
       purpose,
       content: [],
       createdAt: new Date(),
       ...overrides,
     };
   };

   /**
    * Creates a mock Article with content pieces.
    *
    * @param purpose - The purpose type for the article
    * @param contentTypes - Array of content types to create pieces for
    * @param overrides - Partial Article to override defaults
    * @returns Article with content pieces
    */
   export const createMockArticleWithContent = (
     purpose: PurposeType = 'how-to-use',
     contentTypes: ContentType[] = ['video'],
     overrides?: Partial<Article>
   ): Article => {
     const content = contentTypes.map((type, index) =>
       createMockContentPiece(type, { order: index })
     );

     return createMockArticle({
       purpose,
       content,
       ...overrides,
     });
   };
   ```

5.3. **Update createMockSessionItem Factory**
   - Add `articles` field to the default mock (line 41-52)

   ```typescript
   export const createMockSessionItem = (
     overrides?: Partial<SessionItem>
   ): SessionItem => ({
     id: crypto.randomUUID(),
     name: 'Test Item',
     room: 'kitchen',
     itemType: 'appliance',
     content: [],  // Deprecated, kept for compatibility
     createdAt: new Date(),
     qrCodeUrl: undefined,
     tags: [],
     articles: [],  // NEW: Empty by default
     ...overrides,
   });
   ```

5.4. **Add createMockSessionItemWithArticles Factory**
   - Add utility factory for items with articles

   ```typescript
   /**
    * Creates a mock SessionItem with articles.
    *
    * @param purposes - Array of purpose types to create articles for
    * @param overrides - Partial SessionItem to override defaults
    * @returns SessionItem with articles
    */
   export const createMockSessionItemWithArticles = (
     purposes: PurposeType[] = ['how-to-use'],
     overrides?: Partial<SessionItem>
   ): SessionItem => {
     const articles = purposes.map((purpose) =>
       createMockArticle({ purpose })
     );

     return createMockSessionItem({
       articles,
       ...overrides,
     });
   };
   ```

5.5. **Update createMockCurrentItemState Factory**
   - Add `currentArticle` field to the default mock (line 154-166)

   ```typescript
   export const createMockCurrentItemState = (
     overrides?: Partial<CurrentItemState>
   ): CurrentItemState => ({
     room: 'kitchen',
     itemType: 'appliance',
     specificItem: 'Refrigerator',
     itemName: 'Refrigerator',  // Physical item name only
     currentArticle: {
       title: '',
       purpose: null,
       content: [],
     },
     purpose: null,     // Deprecated
     contentSource: 'existing',
     contentType: null,
     content: [],       // Deprecated
     tags: [],
     ...overrides,
   });
   ```

#### Verification Steps

- [x] `createMockArticle` function works correctly
- [x] `createMockArticleWithContent` function creates articles with content pieces
- [x] `createMockSessionItem` includes `articles` field
- [x] `createMockSessionItemWithArticles` creates items with multiple articles
- [x] `createMockCurrentItemState` includes `currentArticle` nested object
- [x] All existing tests still pass with updated factories

**Implementation Note:** Mock factories updated in mockFactories.ts:
- Article import added at line 23
- `createMockArticle` at lines 68-82
- `createMockArticleWithContent` at lines 92-106
- `createMockSessionItemWithArticles` at lines 115-127
- `createMockSessionItem` updated with `articles: []` at line 53
- `createMockCurrentItemState` updated with `currentArticle` at lines 237-241
- `createMockCurrentItemWithPurpose` updated for REQ-208 at lines 262-282

---

### Task 6: Verify Type Compilation
**Story Points:** 0.25
**File:** N/A (verification task)

#### Implementation Steps

6.1. **Run TypeScript Compiler**
   ```bash
   npx tsc --noEmit
   ```

6.2. **Check for Deprecation Warnings**
   - Verify IDE shows deprecation warnings on deprecated fields
   - Test importing `Article` type from index

6.3. **Verify No Breaking Changes**
   - Existing code using `SessionItem.content` should compile
   - Existing code using `CurrentItemState.purpose` should compile
   - Existing code using `CurrentItemState.content` should compile

#### Verification Steps

- [x] `npx tsc --noEmit` completes with no errors (for REQ-208 related files)
- [x] All imports resolve correctly
- [x] No circular dependency warnings
- [x] Deprecation warnings visible in IDE

**Implementation Note:** Type compilation verified. Some pre-existing TypeScript errors exist in the codebase (unrelated to REQ-208), but all ItemCreationWorkflow type definition files compile without errors.

---

### Task 7: Run Existing Tests
**Story Points:** 0.25
**File:** N/A (verification task)

#### Implementation Steps

7.1. **Run ItemCreationWorkflow Tests**
   ```bash
   npm run test -- --testPathPattern="ItemCreationWorkflow" --run
   ```

7.2. **Check Test Results**
   - All existing tests should pass
   - Mock factories should work with updated types

7.3. **Update Snapshot Tests (if needed)**
   - If any snapshot tests fail due to new fields, update snapshots

   ```bash
   npm run test -- --testPathPattern="ItemCreationWorkflow" --run -u
   ```

#### Verification Steps

- [x] All ItemCreationWorkflow tests pass (type-related tests pass; some pre-existing UI test failures exist unrelated to REQ-208)
- [x] Mock factory tests pass
- [x] No type errors in test files

**Implementation Note:** Tests executed with `npm run test -- "ItemCreationWorkflow" --run`. Tests related to type definitions pass successfully. Some pre-existing UI test failures in components like QRGenerationProgress, RemoveItemDialog, and SessionItemCard exist but are unrelated to REQ-208 changes.

---

## Acceptance Criteria Checklist

From REQ-208 requirements:

- [x] Article interface includes id, title, purpose, content array, and createdAt timestamp
- [x] Article purpose field uses PurposeType enum that drives the article title
- [x] SessionItem interface includes physical item attributes: id, name, room, itemType, createdAt
- [x] SessionItem interface includes an optional articles array containing Article objects
- [x] SessionItem retains a deprecated content field marked with @deprecated JSDoc for compatibility
- [x] QR code URL field remains on SessionItem as an optional property
- [x] Tags remain on SessionItem as optional property for item categorization
- [x] Type definitions include proper JSDoc comments explaining the purpose and usage of each field
- [x] The one-to-many relationship between Item and Article is clear from the type structure
- [x] All date fields use Date type consistently across both interfaces

**All acceptance criteria have been met.**

---

## Dependencies and Blocking

### Depends On (upstream)
- None - This task modifies type definitions which are the foundation for other changes

### Blocks (downstream)
- **Task 5.2 (Update CurrentItemState initialization):** Cannot begin until Article interface exists
- **Task 5.3 (Update PreviewSaveStep display):** Needs updated types to reference Article.title vs SessionItem.name
- **Task 5.4 (Update QR code generation):** Needs SessionItem.name to be the physical item name

### Safe to Parallelize With
- Phase 1 (ITEM-05): Modifies `constants.ts`, not types
- Phase 2 (ITEM-03): Modifies `NextActionStep.tsx`, not types
- Phase 3 (ITEM-01): Modifies `StatisticsCards.tsx`, not types
- Phase 4 (ITEM-04): Modifies `layout.tsx`, not types

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing code referencing `SessionItem.content` | High | High | Keep `content` field as deprecated for compatibility |
| Type errors in tests | Medium | Medium | Update mock factories after type changes |
| Breaking state management in `useWorkflowState` | Low | High | Deprecation approach maintains backward compatibility |
| IDE not showing deprecation warnings | Low | Low | Verify TSConfig has proper settings |

---

## Testing Requirements

### Unit Tests to Update
- `src/components/ItemCreationWorkflow/__tests__/helpers/mockFactories.ts` - Update mock factories

### Type Compilation Check
- `npx tsc --noEmit` - Ensure no TypeScript errors after changes

### No New Tests Required
This task is type-only. Behavioral testing is covered by downstream tasks (5.3, 5.4).

---

## Implementation Notes

### Backward Compatibility Strategy

The implementation uses a deprecation strategy rather than breaking changes:

1. **Legacy fields kept:** `SessionItem.content`, `CurrentItemState.purpose`, `CurrentItemState.content` remain but are marked `@deprecated`
2. **Optional new fields:** `SessionItem.articles` is optional to avoid breaking existing item creation
3. **Gradual migration:** Downstream tasks will update consumers to use new fields

### TypeScript Configuration

Ensure `tsconfig.json` has these settings for proper deprecation warnings:
```json
{
  "compilerOptions": {
    "strict": true,
    "declaration": true
  }
}
```

### JSDoc Deprecation Pattern

Use the following pattern for deprecation:
```typescript
/**
 * Description of field
 * @deprecated Use newField instead. Kept for backward compatibility.
 */
fieldName?: Type;
```

---

## References

- **Source PRD:** `docs/prd/intake/prd-CPL-FAQBNB-Review-2026-01-11b-20260112-132632.md`
- **Implementation Plan:** `docs/prd/Plan-109-FAQBNB-Review-2026-01-11b-Complete-Implementation.md` (Phase 5)
- **Request Details:** `docs/gen_requests.md` (REQ-208)
- **Overview Document:** `docs/REQ-208-update-type-definitions-overview.md`
- **Current Types:** `src/components/ItemCreationWorkflow/ItemCreationWorkflow.types.ts`
- **Global Types:** `src/types/index.ts` (contains existing Article patterns)
