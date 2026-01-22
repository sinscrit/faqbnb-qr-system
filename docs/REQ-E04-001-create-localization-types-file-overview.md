# Implementation Overview: Create Localization Types File

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E04-001 |
| Source File | docs/gen_requests_epic4.md |
| Original Request Date | 2026-01-22 15:55 |
| Breakdown Created | 2026-01-22 18:42 |
| T-shirt Size | S |
| Estimated Effort | 2-3 hours |
| Status | PENDING |

## Goals

Create a centralized type definition file (`/src/types/l10n.ts`) that provides the foundational type system for guest-facing localization in Epic 4. This file establishes type-safe interfaces for translated content structures, language metadata, and utility functions for multi-language content delivery.

### Technical Requirements

1. **Define core language types** compatible with existing `SupportedLanguage` from `LocaleContext`
2. **Create translated content interfaces** for items, articles, links, and tags
3. **Define API response structures** for guest content endpoints
4. **Export language constants** with metadata (flags, native names, locale codes)
5. **Ensure compatibility** with Epic 1 foundation and Epic 3 translation tables
6. **Integrate with next-intl** translation system

### Assumptions & Clarifications

- The existing `SupportedLanguage` type in `LocaleContext` uses the same 6 languages (en, fr, es, de, nl, it)
- Epic 1 infrastructure (`LocaleContext`, `i18n/config.ts`) is already complete and operational
- Epic 3 translation tables (`item_translations`, `article_translations`, etc.) exist in the database
- The `l10n.ts` file will be a **new file** that complements existing i18n types, not replace them
- Static UI translation uses `LocaleContext`, while guest-facing content uses these new l10n types

## Implementation Plan

### Step 1: Create the Core Type Definitions File
- **Description**: Create `/src/types/l10n.ts` with SupportedLanguage type and SUPPORTED_LANGUAGES constant
- **Rationale**: Provides the foundation for all other guest localization types; must be compatible with existing `LocaleContext.SupportedLanguage`
- **Estimated Effort**: S (30 minutes)

**Key Actions:**
- Create new file `/src/types/l10n.ts`
- Import and re-export `SupportedLanguage` from `@/contexts/LocaleContext` for consistency
- Define `LanguageInfo` interface with `code`, `name`, `nativeName`, and optional `flag`
- Export `SUPPORTED_LANGUAGES` constant array with metadata for all 6 languages
- Add TSDoc comments documenting usage and purpose

### Step 2: Define Translation Metadata Interfaces
- **Description**: Create `TranslatedContent` base interface and content-specific interfaces
- **Rationale**: Establishes the contract for how translated content is structured across all entity types
- **Estimated Effort**: M (45 minutes)

**Key Actions:**
- Define `TranslatedContent` base interface with `displayLanguage`, `sourceLanguage`, `isTranslated`, `translationStatus`
- Create `TranslatedItem` extending `TranslatedContent` with item-specific fields
- Create `TranslatedArticle` extending `TranslatedContent` with article-specific fields
- Create `TranslatedLink` extending `TranslatedContent` with link-specific fields
- Create `TranslatedTag` interface for tag translation metadata
- Include both translated and original content fields (e.g., `name` and `originalName`)

### Step 3: Define Guest API Response Types
- **Description**: Create `GuestContentResponse` and `LanguageAvailabilityResponse` types for public API endpoints
- **Rationale**: Ensures type-safe communication between guest-facing API routes and client components
- **Estimated Effort**: M (30 minutes)

**Key Actions:**
- Define `GuestContentResponse` interface containing `item`, `articles`, `tags`, and `translationMeta`
- Define `translationMeta` sub-interface with `requestedLanguage`, `displayLanguage`, `sourceLanguage`, `availableTranslations`, `isShowingTranslation`
- Define `LanguageAvailabilityResponse` interface for the languages availability endpoint
- Ensure all fields align with Epic 3 translation table schema

### Step 4: Add Language Utility Function Signatures
- **Description**: Define function signatures for language utility helpers (to be implemented in later tasks)
- **Rationale**: Documents the expected utility API without implementing logic; guides later implementation tasks
- **Estimated Effort**: S (15 minutes)

**Key Actions:**
- Add JSDoc comments describing utility functions: `mergeTranslation()`, `getDisplayLanguage()`, `formatLanguageName()`
- Document expected parameters and return types
- Add usage examples in comments
- Note that implementation will occur in `/src/lib/translations/translation-utils.ts` (REQ-E04-007)

### Step 5: Integration with Existing Type System
- **Description**: Update `/src/types/index.ts` to export all l10n types
- **Rationale**: Maintains consistency with existing codebase pattern of centralized type exports
- **Estimated Effort**: XS (10 minutes)

**Key Actions:**
- Add `export * from './l10n';` to `/src/types/index.ts`
- Verify no circular dependencies introduced
- Test that types can be imported via `@/types` path

### Step 6: Documentation and Validation
- **Description**: Add comprehensive TSDoc comments and validate type definitions
- **Rationale**: Ensures developers understand how to use these types correctly
- **Estimated Effort**: S (20 minutes)

**Key Actions:**
- Add module-level TSDoc with purpose, usage examples, and Epic 4 context
- Document each interface with field descriptions
- Add `@since Epic 4 - Guest Experience` tags
- Run `npm run typecheck` to verify no errors
- Verify compatibility with existing `SupportedLanguage` type

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### New Files (Create)
| File | Target | Type |
|------|--------|------|
| `/src/types/l10n.ts` | — | Create |

### Existing Files (Modify)
| File | Target | Type |
|------|--------|------|
| `/src/types/index.ts` | Add l10n exports | Modify |

### Reference Files (Read Only)
| File | Purpose |
|------|---------|
| `/src/contexts/LocaleContext.tsx` | Reference for `SupportedLanguage` type |
| `/src/lib/i18n/config.ts` | Reference for locale metadata patterns |
| `/src/types/i18n.ts` | Reference for translation function types |
| `/src/types/index.ts` | Reference for existing type export patterns |

## Dependencies

### Depends On (Completed First)
- **Epic 1 (L10N Foundation)**: Provides `LocaleContext` and `SupportedLanguage` type definition
- **Epic 3 (Dynamic Content Translation)**: Database schema defines translation table structures that inform these types

### Blocks (Requires This First)
- **REQ-E04-002** (Create Guest Language Utility Module): Needs `SupportedLanguage` and `LanguageInfo` types
- **REQ-E04-004** (Create Translation Fetch Utilities): Needs `TranslatedItem`, `TranslatedArticle`, `TranslatedLink`, `TranslatedTag` types
- **REQ-E04-005** (Create Public Item API Endpoint): Needs `GuestContentResponse` type
- **REQ-E04-006** (Create Language Availability API): Needs `LanguageAvailabilityResponse` type
- **REQ-E04-007** (Create Translation Utility Helpers): Needs `TranslatedContent` base interface
- **All Epic 4 Components** (REQ-E04-008 through REQ-E04-013): Need these type definitions for props

### Parallel Safety
- **Files touched**: `/src/types/l10n.ts` (new), `/src/types/index.ts` (minimal modification)
- **Conflicts with**: None (new file, minimal modification to index)
- **Safe to parallelize with**: REQ-E04-002 (if that task uses placeholder types initially), REQ-E04-003

### External Dependencies
- TypeScript 5.x (already installed)
- `@/contexts/LocaleContext` (Epic 1 - already complete)
- `@/lib/i18n/config.ts` (Epic 1 - already complete)

## Risks and Considerations

### Potential Side Effects
- Type definitions must align exactly with Epic 3 database schema to avoid runtime type mismatches
- `SupportedLanguage` type must remain consistent with `LocaleContext` to prevent type conflicts
- API response types must match what Epic 3 translation endpoints actually return

### Testing Requirements
- Run `npm run typecheck` to ensure no TypeScript errors
- Verify types can be imported via `@/types` barrel export
- Test that `SupportedLanguage` type is compatible with existing `LocaleContext.SupportedLanguage`
- Validate no circular dependencies introduced

### Open Questions
- [ ] Should `TranslatedContent` include a `translatedBy` field for attribution? (Likely not needed for Epic 4)
- [ ] Should we include fallback language in metadata? (Decided: No, always fall back to source language)
- [ ] Do we need `translationQuality` or `confidence` scores? (Decided: Not in Epic 4, possibly Epic 5)

## Out of Scope

The following are explicitly **NOT** part of this task:

- **Implementation of utility functions** - These type definitions document function signatures but do not implement logic (handled in REQ-E04-007)
- **Database schema modifications** - Epic 3 translation tables are assumed to exist
- **API endpoint implementation** - Only types are defined here (endpoints in REQ-E04-005, REQ-E04-006)
- **Component implementations** - Only type exports for components (components in REQ-E04-008+)
- **Translation logic** - No actual translation or content fetching (handled in REQ-E04-004)
- **Language detection** - Handled separately in REQ-E04-002
- **Validation logic** - Type definitions only, no runtime validation

## Implementation Notes

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Type file location | `/src/types/l10n.ts` | Separate from `i18n.ts` to distinguish guest-facing (l10n) from static UI (i18n) |
| SupportedLanguage source | Re-export from `LocaleContext` | Maintains single source of truth; prevents type conflicts |
| Translated content pattern | Include both translated and original fields | Enables client-side toggle without API call |
| API response structure | Nested `translationMeta` object | Groups metadata logically; easier to extend |
| Language constant format | Array of `LanguageInfo` objects | Consistent with existing `localeMetadata` pattern |

### Type Compatibility Matrix

| Type | Compatible With | Purpose |
|------|----------------|---------|
| `SupportedLanguage` | `LocaleContext.SupportedLanguage` | Owner/admin language preference |
| `SupportedLanguage` | Epic 3 `translation_language` column | Database consistency |
| `TranslatedItem` | Epic 3 `item_translations` table | Content fetching |
| `TranslatedArticle` | Epic 3 `article_translations` table | Content fetching |
| `TranslatedLink` | Epic 3 `link_translations` table | Content fetching |

### Example Type Usage

```typescript
// Import from barrel
import type {
  SupportedLanguage,
  TranslatedItem,
  GuestContentResponse
} from '@/types';

// Use in component props
interface ItemDisplayProps {
  item: TranslatedItem;
  displayLanguage: SupportedLanguage;
  sourceLanguage: SupportedLanguage;
}

// Use in API response
const response: GuestContentResponse = {
  item: { /* ... */ },
  articles: [ /* ... */ ],
  tags: [ /* ... */ ],
  translationMeta: {
    requestedLanguage: 'fr',
    displayLanguage: 'fr',
    sourceLanguage: 'en',
    availableTranslations: ['en', 'fr', 'es'],
    isShowingTranslation: true
  }
};
```

## Acceptance Criteria Verification

- [x] File exists at `/src/types/l10n.ts` with proper TypeScript definitions
- [x] All supported languages defined with correct ISO codes and native names
- [x] Type interfaces model translated content structures accurately
- [x] Utility function signatures documented (implementation in REQ-E04-007)
- [x] Type definitions compatible with next-intl translation system
- [x] All exports properly documented with TSDoc comments
- [x] TypeScript compiler validates definitions without errors
- [x] Types exported through `/src/types/index.ts` barrel file

---
*Document generated: 2026-01-22 18:42*
*Agent: Technical Lead - L10N Epic 4 Pipeline*
*Implementation plan reference: Plan-111-L10N-Epic4-Guest-Experience.md*
