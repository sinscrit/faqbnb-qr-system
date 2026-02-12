# REQ-258: Mixed Localization in Item Suggestion Selection - Technical Overview

**Last Modified**: 2026-02-12 12:38
**Type**: Bug Fix
**Size**: S (Small)
**Status**: Complete (pending manual verification)

## Summary

Item suggestions in the SpecificItemStep component display in English regardless of the selected locale. This creates a mixed-language UI where labels are translated but suggestion buttons remain in English.

## Problem Statement

When a user navigates to Step 3 (Specific Item Selection) of the item creation workflow:
- UI chrome displays correctly in the selected language (e.g., French: "Quel article specifique?")
- Item suggestion buttons display hardcoded English strings (e.g., "Shower", "Bathtub", "Toilet")

This inconsistency creates a confusing user experience and undermines the localization effort.

## Root Cause Analysis

The item suggestions are defined as hardcoded English strings in:
- **File**: `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts`
- **Data Structure**: `SUGGESTION_MATRIX` - a nested object mapping rooms and item types to arrays of English item names

The suggestions are consumed by:
1. `useSuggestions` hook - returns raw strings from the matrix
2. `SpecificItemStep` component - displays suggestions via `SuggestionButton` components

Neither layer applies translations to the suggestion strings.

## Solution Approach

### Option Selected: Translation Key Approach

Add an `itemSuggestions` namespace to `workflow.constants` in all locale files, with keys matching the suggestion matrix structure. Modify the `useSuggestions` hook to return translation keys, and have `SpecificItemStep` translate them at render time.

### Why This Approach

1. **Minimal code changes** - Only needs hook and component updates
2. **Consistent with existing patterns** - Follows the same structure as `workflow.constants.rooms`
3. **Type-safe** - Can leverage TypeScript for translation key validation
4. **Maintainable** - All suggestions centralized in locale files

## Affected Components

| Component | File | Change Required |
|-----------|------|----------------|
| Suggestion Matrix | `src/components/ItemCreationWorkflow/utils/suggestionMatrix.ts` | None - keeps English keys as identifiers |
| useSuggestions Hook | `src/components/ItemCreationWorkflow/hooks/useSuggestions.ts` | May need to expose translation keys |
| SpecificItemStep | `src/components/ItemCreationWorkflow/components/steps/SpecificItemStep.tsx` | Use `t()` for suggestion labels |
| SuggestionButton | `src/components/ItemCreationWorkflow/components/shared/SuggestionButton.tsx` | Accept translated label |
| Locale Files | `messages/{en,fr,es,de,nl,it}.json` | Add `workflow.constants.itemSuggestions` |

## Translation Keys Structure

The `itemSuggestions` namespace will be organized by room, then by item type:

```json
{
  "workflow": {
    "constants": {
      "itemSuggestions": {
        "kitchen": {
          "appliance": {
            "stoveOven": "Stove/Oven",
            "refrigerator": "Refrigerator",
            ...
          },
          "roomItem": {
            "pantry": "Pantry",
            ...
          },
          "generalInfo": {
            "trashRecycling": "Trash & Recycling",
            ...
          }
        },
        "bathroom": {
          "appliance": { ... },
          "roomItem": {
            "shower": "Shower",
            "bathtub": "Bathtub",
            ...
          },
          ...
        }
        ...
      }
    }
  }
}
```

## Key Mapping Strategy

Convert English suggestion strings to camelCase keys:
- "Stove/Oven" -> "stoveOven"
- "Trash & Recycling" -> "trashRecycling"
- "TV/Smart TV" -> "tvSmartTv"
- "Hair Dryer" -> "hairDryer"

## Locale Files to Update

1. `messages/en.json` - English (base)
2. `messages/fr.json` - French
3. `messages/es.json` - Spanish
4. `messages/de.json` - German
5. `messages/nl.json` - Dutch
6. `messages/it.json` - Italian

## Acceptance Criteria

- [x] Item suggestion labels display in the selected locale language
- [x] All 6 supported locales have translations for all item suggestions
- [x] Language consistency is maintained throughout the item creation flow
- [x] No hardcoded English strings remain in item suggestion display
- [x] TypeScript compilation passes
- [x] Build completes successfully

## Dependencies

- next-intl translation system (already configured)
- Existing `workflow.constants` namespace structure

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing translations | Medium | Use English fallback, verify all keys present |
| Key mismatch | High | TypeScript validation, thorough testing |
| Performance | Low | Translations are static, no runtime overhead |

## Related Requirements

- REQ-259: Mixed Language Display in Item Creation Recap Screen (similar issue)
