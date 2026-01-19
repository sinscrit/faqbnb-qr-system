# REQ-340: Export Localization Types from Main Types Index

**Document Created:** 2026-01-19
**Document Modified:** 2026-01-19
**Request Type:** ENHANCEMENT
**Size:** XS
**Phase:** 1 - Types and Utilities
**Task ID:** 1.3
**Epic:** L10N Epic 4 - Guest Experience

---

## Summary

Update the main types index file (`/src/types/index.ts`) to re-export all localization types from the dedicated `l10n.ts` module. This enables clean, consistent imports across the application following the project's established pattern for centralized type exports.

---

## Context

### Current Behavior
Localization types will be defined in `/src/types/l10n.ts` (REQ-338) but are not accessible through the central types entry point. Developers must import localization types using direct file paths like `import { SupportedLanguage } from '@/types/l10n'`, creating inconsistent import patterns compared to other application types that are imported through the main types index.

### Expected Behavior
The main types index file includes an export statement that re-exports all types from the localization types module. Developers can import any localization type from `@/types` alongside other application types:
```typescript
import { SupportedLanguage, LanguageInfo, Item, Property } from '@/types';
```

---

## Dependencies

### Prerequisite Tasks
| Task ID | Request | Description | Status |
|---------|---------|-------------|--------|
| 1.1 | REQ-338 | Create localization types file (`/src/types/l10n.ts`) | **Required Before This Task** |
| 1.2 | REQ-339 | Create guest language utility module | Independent |

### Dependent Tasks
All subsequent Epic 4 tasks that import localization types will benefit from this re-export.

---

## Implementation Details

### File to Modify
| File Path | Action |
|-----------|--------|
| `/src/types/index.ts` | Add export statement for l10n types |

### Code Changes

Add a single export statement to `/src/types/index.ts` following the existing pattern:

```typescript
// Localization types (L10N Epic 4 - REQ-340)
export * from './l10n';
```

### Placement
Insert the export statement near the bottom of the file, following the existing pattern where module exports are grouped together. The current file has exports at lines 533-671:

```typescript
// QR Code types
export * from './qrcode';

// Analytics types
export * from './analytics';

// Reaction types
export * from './reactions';

// ... other code ...

// Admin types
export * from './admin';

// Localization types (L10N Epic 4 - REQ-340) <-- NEW
export * from './l10n';

// Locale/i18n types (REQ-250)
export type { ... } from '@/contexts/LocaleContext';
```

**Note:** The existing `Locale/i18n types (REQ-250)` section re-exports from `LocaleContext`. The new l10n export is for the dedicated localization types file, which is separate from the LocaleContext exports.

---

## Types Expected from l10n.ts

Based on REQ-338 and the implementation plan, the `l10n.ts` file will export:

| Type | Kind | Purpose |
|------|------|---------|
| `SupportedLanguage` | Type Alias | Union of supported language codes ('en' \| 'fr' \| 'es' \| 'de' \| 'nl' \| 'it') |
| `LanguageInfo` | Interface | Language metadata (code, name, nativeName, flag) |
| `TranslatedContent` | Interface | Base translation metadata |
| `TranslatedItem` | Interface | Item with translation fields |
| `TranslatedArticle` | Interface | Article with translation fields |
| `TranslatedLink` | Interface | Link with translation fields |
| `TranslatedTag` | Interface | Tag with translation fields |
| `GuestContentResponse` | Interface | API response format for guest content |
| `LanguageAvailabilityResponse` | Interface | API response for available translations |
| `SUPPORTED_LANGUAGES` | Constant | Array of LanguageInfo objects |

---

## Authorized Files and Functions for Modification

| File | Function/Section | Change Description |
|------|------------------|-------------------|
| `/src/types/index.ts` | Module exports section | Add `export * from './l10n'` statement |

---

## Acceptance Criteria

- [ ] The types index file at `/src/types/index.ts` includes an export statement for localization types
- [ ] The export statement uses the pattern `export * from './l10n'` to re-export all types from the l10n module
- [ ] Localization types can be successfully imported from `@/types` path alias
- [ ] No existing imports or type references are broken by adding the export
- [ ] TypeScript compilation succeeds without errors after adding the re-export
- [ ] The export statement is positioned logically within the index file alongside other type exports

---

## Testing Verification

1. **Compilation Test:** Run `npm run build` to verify TypeScript compiles without errors
2. **Import Test:** Verify imports work from consuming modules:
   ```typescript
   import { SupportedLanguage, LanguageInfo, SUPPORTED_LANGUAGES } from '@/types';
   ```
3. **Existing Imports:** Verify no existing imports are broken by the change

---

## Technical Notes

### Pattern Consistency
This change follows the exact same pattern used for other type re-exports in the index file:
- `export * from './qrcode'` (line 533)
- `export * from './analytics'` (line 536)
- `export * from './reactions'` (line 539)
- `export * from './admin'` (line 671)

### Relationship to LocaleContext Exports
The existing lines 673-681 re-export specific types from `@/contexts/LocaleContext`:
```typescript
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';
```

The new `l10n.ts` module may have a different `SupportedLanguage` type or additional types not in LocaleContext. If there's a naming conflict, consider:
1. Using the l10n.ts types as the canonical source
2. Removing redundant exports from LocaleContext re-exports
3. Or using explicit named re-exports to avoid conflicts

**Recommendation:** Verify with REQ-338 implementation whether `SupportedLanguage` in `l10n.ts` differs from the one in `LocaleContext`. If they're the same, consolidate to a single source.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| l10n.ts doesn't exist yet | High | High | This task depends on REQ-338 completing first |
| Type name conflicts with LocaleContext exports | Medium | Low | Review exports after REQ-338 and consolidate if needed |
| Breaking existing imports | Low | Medium | Run full build verification after change |

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Add export statement | 2 minutes |
| Verify compilation | 2 minutes |
| Test imports | 1 minute |
| **Total** | ~5 minutes |

---

## References

- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic4-Guest-Experience.md`
- **Request Document:** `/docs/gen_requests_epic4.md` (REQ-340)
- **Prerequisite Request:** REQ-338 (Create Localization Types File)
- **Target File:** `/src/types/index.ts`
- **Source Module:** `/src/types/l10n.ts` (created by REQ-338)
