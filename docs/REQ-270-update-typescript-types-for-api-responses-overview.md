# Implementation Overview: Update TypeScript Types for Translation API Responses

## Header
| Field | Value |
|-------|-------|
| Request Reference | #270 |
| Source File | docs/gen_requests_epic3.md |
| Implementation Plan | docs/prd/Plan-111-L10N-Epic3-Dynamic-Content-Translation.md |
| Original Request Date | 2026-01-18 |
| Breakdown Created | 2026-01-18 23:45:00 UTC |
| Phase | 2 - Modify Existing Content APIs |
| Task ID | 2.6 |
| T-shirt Size | XS |
| Estimated Effort | 1-2 hours |

## Goals
Extend the TypeScript type definitions in `/src/types/index.ts` to include translation-related fields in API request and response interfaces. This enables:

1. API responses to return translation job tracking identifiers when content is created/updated
2. API requests to accept an optional source language parameter for translation operations
3. Proper TypeScript compilation enforcement for translation-related data throughout the application

### Assumptions & Clarifications
- This task assumes Epic 1 (Foundation) infrastructure will provide the base translation types (e.g., `SupportedLanguage`)
- The `translationJobIds` field is optional to maintain backward compatibility with existing code
- The `sourceLanguage` field is optional - when not provided, the system will use source language detection (user preferences, account preferences, or default to 'en')
- Types from the content translation module (`/src/lib/content-translation/`) will be re-exported from the main types index for convenience
- Existing code consuming `ItemResponse`, `ArticleResponse`, `CreateItemRequest`, and `CreateArticleRequest` must continue to compile without changes

## Implementation Plan

### Step 1: Add `translationJobIds` to `ItemResponse` interface
- **Description**: Add optional `translationJobIds?: string[]` field to the `ItemResponse` interface data object
- **Rationale**: Allows API responses to return identifiers of queued translation jobs when items are created or updated
- **Estimated Effort**: XS (5 minutes)

### Step 2: Add `translationJobIds` to `ArticleResponse` interface
- **Description**: Add optional `translationJobIds?: string[]` field to the `ArticleResponse` interface
- **Rationale**: Allows API responses to return identifiers of queued translation jobs when articles are created or updated
- **Estimated Effort**: XS (5 minutes)

### Step 3: Add `sourceLanguage` to `CreateItemRequest` interface
- **Description**: Add optional `sourceLanguage?: string` field to the `CreateItemRequest` interface
- **Rationale**: Enables callers to explicitly specify the source language of item content, overriding automatic detection
- **Estimated Effort**: XS (5 minutes)

### Step 4: Add `sourceLanguage` to `CreateArticleRequest` interface
- **Description**: Add optional `sourceLanguage?: string` field to the `CreateArticleRequest` interface
- **Rationale**: Enables callers to explicitly specify the source language of article content, overriding automatic detection
- **Estimated Effort**: XS (5 minutes)

### Step 5: Export translation-related types from index
- **Description**: Add re-export statement for types from the content translation module (when available)
- **Rationale**: Centralizes type imports and follows existing pattern of re-exporting related types (e.g., `qrcode`, `analytics`, `reactions`)
- **Estimated Effort**: XS (5 minutes)

### Step 6: Verify TypeScript Compilation
- **Description**: Run `npm run build` or `tsc --noEmit` to ensure no breaking changes
- **Rationale**: Confirms backward compatibility and proper type integration
- **Estimated Effort**: XS (10 minutes)

## Authorized Files and Functions for Modification

> Warning: **APPROVED SCOPE**: Changes outside this list require review

### Primary Type Definition File
| File | Target | Type |
|------|--------|------|
| `src/types/index.ts` | `ItemResponse` interface | Extend |
| `src/types/index.ts` | `ArticleResponse` interface | Extend |
| `src/types/index.ts` | `CreateItemRequest` interface | Extend |
| `src/types/index.ts` | `CreateArticleRequest` interface | Extend |
| `src/types/index.ts` | Export statements section | Extend |

### Detailed Changes

#### `ItemResponse` Interface (lines ~125-166)
```typescript
export interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    qrCodeUploadedAt?: string;
    links: { /* existing fields */ }[];
    articles?: { /* existing fields */ }[];
  };
  error?: string;
  accountContext?: { /* existing fields */ };
  translationJobIds?: string[]; // NEW: IDs of queued translation jobs
}
```

#### `ArticleResponse` Interface (lines ~289-297)
```typescript
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  translationJobIds?: string[]; // NEW: IDs of queued translation jobs
}
```

#### `CreateItemRequest` Interface (lines ~310-342)
```typescript
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: { /* existing fields */ }[];
  articles?: { /* existing fields */ }[];
  sourceLanguage?: string; // NEW: Optional source language override
}
```

#### `CreateArticleRequest` Interface (lines ~243-262)
```typescript
export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
  links?: { /* existing fields */ }[];
  sourceLanguage?: string; // NEW: Optional source language override
}
```

#### Export Statement Addition
```typescript
// Content Translation types (Epic 3)
// Note: Uncomment when content-translation module is implemented
// export * from '@/lib/content-translation/content-translation.types';
```

## Dependencies

### Internal Dependencies
- **REQ-266**: Modify Items API to Trigger Content Translations (consumer of these types)
- **REQ-267**: Modify Articles API to Trigger Content Translations (consumer of these types)
- **REQ-268**: Modify Links API to Trigger Content Translations (consumer of these types)
- **REQ-259**: Content Translation Module Structure and Type Definitions (provides types to re-export)
- **Epic 1 (Plan-110)**: Foundation infrastructure provides `SupportedLanguage` type

### External Dependencies
- TypeScript 5.x compiler
- No new npm packages required

### API Endpoints Affected
- `POST /api/admin/items` - will use `CreateItemRequest` with `sourceLanguage`
- `PUT /api/admin/items/[id]` - will use `UpdateItemRequest` (extends `CreateItemRequest`)
- `POST /api/admin/articles` - will use `CreateArticleRequest` with `sourceLanguage`
- `PUT /api/admin/articles/[id]` - will use `UpdateArticleRequest`

## Technical Architecture

### Type Hierarchy
```
CreateItemRequest
├── sourceLanguage?: string  (NEW)
└── extends to UpdateItemRequest

CreateArticleRequest
├── sourceLanguage?: string  (NEW)
└── UpdateArticleRequest references this

ItemResponse
├── data?: { ... }
└── translationJobIds?: string[]  (NEW)

ArticleResponse
├── data?: ItemArticle
└── translationJobIds?: string[]  (NEW)
```

### Type Alignment with Implementation Plan
| Implementation Plan Type | Types Index Type | Field Added |
|-------------------------|------------------|-------------|
| `CreateItemResponse.translationJobIds` | `ItemResponse.translationJobIds` | `string[]` |
| `CreateItemRequest.sourceLanguage` | `CreateItemRequest.sourceLanguage` | `string` |
| Article equivalent types | `ArticleResponse`, `CreateArticleRequest` | Same pattern |

## Risks and Considerations

### Potential Side Effects
- **None expected**: All new fields are optional, ensuring backward compatibility
- Existing code consuming these interfaces will continue to function without modification

### Testing Requirements
- Run TypeScript compilation (`tsc --noEmit`) to verify no type errors
- Verify existing tests still pass
- No functional tests required as this is a type-only change

### Performance Considerations
- No runtime performance impact - types are compile-time only
- No bundle size impact beyond negligible declaration file changes

### Open Questions
- [x] Should `sourceLanguage` use `SupportedLanguage` type instead of `string`?
  - **Decision**: Use `string` initially for flexibility; Epic 1 types can provide stricter typing when available
- [x] Should `translationJobIds` be at the response root or inside `data`?
  - **Decision**: At response root level (aligns with Implementation Plan contract)

## Out of Scope
- Implementation of translation triggering logic in API routes (REQ-266, REQ-267)
- Creation of content translation module types (REQ-259)
- Database schema changes
- UI components for translation status display
- Link-specific types (handled via entity-specific trigger functions)
- Tag translation types (handled separately with system tag logic)

## Implementation Code Snippets

### Complete Diff Preview
```typescript
// === ItemResponse (add at end of interface, before closing brace) ===
export interface ItemResponse {
  success: boolean;
  data?: {
    // ... existing fields ...
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
+ translationJobIds?: string[]; // IDs of queued translation jobs (REQ-270)
}

// === ArticleResponse (add at end of interface) ===
export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
+ translationJobIds?: string[]; // IDs of queued translation jobs (REQ-270)
}

// === CreateItemRequest (add after articles field) ===
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string;
  tags?: string[];
  qrCodeUrl?: string;
  links: { ... }[];
  articles?: { ... }[];
+ /**
+  * Optional source language override for translation.
+  * If not provided, uses user/account preferences or defaults to 'en'.
+  * @see REQ-270, Plan-111 Phase 2
+  */
+ sourceLanguage?: string;
}

// === CreateArticleRequest (add after links field) ===
export interface CreateArticleRequest {
  itemId: string;
  purpose: PurposeType;
  title?: string;
  description?: string;
  displayOrder?: number;
  links?: { ... }[];
+ /**
+  * Optional source language override for translation.
+  * If not provided, uses user/account preferences or defaults to 'en'.
+  * @see REQ-270, Plan-111 Phase 2
+  */
+ sourceLanguage?: string;
}

// === Export Section (add near other export statements) ===
// Content Translation types (Epic 3)
// Uncomment when /src/lib/content-translation/ module is implemented (REQ-259)
// export * from './content-translation.types';
```

## Acceptance Criteria Verification

| Acceptance Criteria | Implementation |
|---------------------|----------------|
| ItemResponse includes optional translationJobIds field of type string array | Step 1 |
| ArticleResponse includes optional translationJobIds field of type string array | Step 2 |
| CreateItemRequest includes optional sourceLanguage field of type string | Step 3 |
| CreateArticleRequest includes optional sourceLanguage field of type string | Step 4 |
| All translation-related types from content translation module are exported | Step 5 (when module exists) |
| Type definitions align with API implementation changes in REQ-266, REQ-267, REQ-268 | All steps |
| TypeScript compilation succeeds without errors after type additions | Step 6 |
| Existing code consuming these types continues to compile without breaking changes | Optional fields ensure this |

---
*Document generated: 2026-01-18 23:45:00 UTC*
*Last modified: 2026-01-18 23:45:00 UTC*
