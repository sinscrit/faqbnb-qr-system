# REQ-E05-025: Create LanguagePreferenceSection Component - Implementation Overview

**Request ID:** REQ-E05-025
**Title:** Language Preference Section Component
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 6 - Language Preference Setting
**Task ID:** 6.1
**Priority:** P2
**Size:** M (Medium)
**Type:** NEW FEATURE

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Overview

This task implements a `LanguagePreferenceSection` component that allows property owners to select and save their preferred interface language within the translation management settings. The component provides a language dropdown selector with all six supported languages, a save button with loading state feedback, and help text explaining that this setting controls the owner's dashboard interface language (not guest-facing content translations).

---

## Dependencies

### Epic Dependencies
| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 - Foundation | Required | Provides i18n framework, language preference columns in database |
| REQ-249 - useLanguagePreference hook | Complete | Hook for managing language preference persistence |
| REQ-251 - User language API endpoint | Complete | `/api/user/language` for saving preference |

### Internal Dependencies
| Component/Module | Location | Purpose |
|------------------|----------|---------|
| `useLanguagePreference` | `/src/hooks/useLanguagePreference.ts` | Hook providing language state, save function, loading states |
| `LANGUAGE_OPTIONS` | `/src/hooks/useLanguagePreference.ts` | Array of supported languages with metadata |
| `SupportedLanguage` | `/src/hooks/useLanguagePreference.ts` | TypeScript type for valid language codes |
| `AuthContext` | `/src/contexts/AuthContext.ts` | For checking authenticated user status |

### External Dependencies
None required - uses existing Tailwind CSS and React patterns.

---

## Technical Approach

### Architecture

The component will be implemented as a self-contained settings section that:

1. **Uses the existing `useLanguagePreference` hook** - This hook already provides:
   - Current language state
   - `setLanguage()` function with API persistence
   - `isLoading` state for initial fetch
   - `isSaving` state for save operation
   - `error` state for error handling
   - `clearError()` function
   - `supportedLanguages` array with metadata

2. **Follows the PropertyForm pattern** for:
   - Select dropdown styling
   - Label and help text structure
   - Error display pattern
   - Loading/disabled states on controls

3. **Provides immediate visual feedback** through:
   - Disabled state during save
   - Loading spinner in save button
   - Success notification on save
   - Error display with clear option

### Component Structure

```
/src/components/TranslationManagement/
└── LanguagePreference/
    ├── index.ts                          # Barrel export
    └── LanguagePreferenceSection.tsx     # Main component
```

### Props Interface

```typescript
export interface LanguagePreferenceSectionProps {
  /** Optional CSS class name for styling customization */
  className?: string;
  /** Optional callback when language preference is successfully saved */
  onSaveSuccess?: (language: SupportedLanguage) => void;
  /** Optional callback when save fails */
  onSaveError?: (error: string) => void;
}
```

### State Management

The component leverages the existing `useLanguagePreference` hook which handles:
- Initial language detection (cookie -> localStorage -> browser -> default)
- Optimistic UI updates
- API persistence for authenticated users
- Cookie synchronization for middleware
- Error handling with rollback

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Language Preference                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Interface Language                                          │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 🇬🇧 English                                    ▼    │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                             │
│ This setting controls the language of your dashboard        │
│ interface. Guest-facing content translations are            │
│ managed separately.                                         │
│                                                             │
│                                        [Save Preference]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### Key Features

1. **Language Dropdown Selector**
   - Displays all 6 supported languages: English, French, Spanish, German, Dutch, Italian
   - Each option shows flag emoji and language name (in English and native)
   - Pre-populated with current saved preference
   - Disabled during save operation

2. **Save Button with Loading State**
   - Disabled when:
     - No changes made (clean state)
     - Save operation in progress
   - Shows spinner and "Saving..." text during save
   - Normal state shows "Save Preference"

3. **Help Text**
   - Explains that setting controls dashboard interface language
   - Clarifies that guest content translations are separate
   - Uses muted/secondary text styling

4. **Error Handling**
   - Displays error message below save button
   - Provides clear/dismiss option
   - Auto-clears on successful save

5. **Success Feedback**
   - Toast notification or inline success message
   - Brief confirmation that preference was saved

### Styling Approach

Following existing patterns from `PropertyForm.tsx`:

```typescript
// Section container
className="bg-white p-6 rounded-lg shadow-sm border"

// Section header
className="text-lg font-semibold text-gray-900 mb-4"

// Label
className="block text-sm font-medium text-gray-700 mb-2"

// Select dropdown
className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
           disabled:bg-gray-50 disabled:text-gray-500"

// Help text
className="mt-2 text-sm text-gray-500"

// Save button
className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
           disabled:opacity-50 disabled:cursor-not-allowed"

// Error message
className="mt-2 text-sm text-red-600"
```

### Accessibility Requirements

- Proper `label` with `htmlFor` attribute linked to select `id`
- `aria-describedby` linking help text to the select
- Button disabled state properly announced
- Loading state announced via `aria-busy`
- Error messages associated via `aria-describedby`
- Keyboard navigation support (native select behavior)

---

## Acceptance Criteria Mapping

| Acceptance Criteria | Implementation |
|--------------------|----------------|
| Component renders as a self-contained settings section | Container div with border, padding, shadow matching design system |
| Section header displays descriptive title | "Language Preference" header with appropriate styling |
| Dropdown displays all six supported languages | Uses `LANGUAGE_OPTIONS` from hook: EN, FR, ES, DE, NL, IT |
| Each option shows flag icon and language name | Option format: `🇫🇷 French (Français)` |
| Dropdown selection persists until saved | Local state tracks selection, not committed until save |
| Save button shows loading state during save | `isSaving` state controls spinner and "Saving..." text |
| Save button disabled during operation | `disabled={isSaving}` prevents duplicate submissions |
| Save button disabled when no changes | Compare current selection to saved value |
| Success notification on save | Toast or inline message confirming save |
| Error notification on failure | Display error from hook with actionable message |
| Help text explains setting purpose | Static help text below dropdown |
| Component fetches current preference on mount | `useLanguagePreference` hook handles this |
| Loading skeleton during initial fetch | Show skeleton when `isLoading` is true |
| Handles invalid stored preferences | Hook provides fallback to DEFAULT_LANGUAGE |
| Integrates with account preferences API | Hook calls `/api/user/language` PUT endpoint |
| Language change takes effect immediately | Hook dispatches `languageChange` event for app-wide update |
| Fully keyboard accessible | Native select + button keyboard support |
| Includes ARIA labels | Proper `aria-*` attributes for accessibility |
| Responsive for mobile viewports | Tailwind responsive classes |
| Matches design system | Follows PropertyForm styling patterns |
| Works in light/dark themes | Uses color variables or supports both themes |
| Can be integrated into account settings | Exported as standalone component |

---

## Authorized Files and Functions for Modification

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/LanguagePreference/LanguagePreferenceSection.tsx` | Main component implementation |
| `/src/components/TranslationManagement/LanguagePreference/index.ts` | Barrel export for the component |

### Files to Modify

| File Path | Changes | Functions/Exports |
|-----------|---------|-------------------|
| `/src/components/TranslationManagement/index.ts` | Add LanguagePreference export | Add `export * from './LanguagePreference'` |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/hooks/useLanguagePreference.ts` | Hook interface and implementation details |
| `/src/lib/i18n/config.ts` | Language configuration and metadata |
| `/src/components/PropertyForm.tsx` | Select dropdown and form styling patterns |
| `/src/app/api/user/language/route.ts` | API endpoint for language preference |

---

## Testing Considerations

### Unit Tests
- Component renders with correct initial language from hook
- Dropdown displays all 6 supported languages
- Save button disabled when no changes made
- Save button shows loading state during save
- Error message displays on save failure
- Error clears on successful save retry
- Component handles loading state on mount

### Integration Tests
- Language selection persists via API call
- Language cookie is updated after save
- `languageChange` event is dispatched on save
- Component integrates correctly in settings page context

### Accessibility Tests
- Dropdown is keyboard navigable
- Screen reader announces loading state
- Error messages are announced
- Focus management is correct

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hook not yet implemented | Low | High | Hook exists (REQ-249 complete) |
| API endpoint not ready | Low | High | API exists (REQ-251 complete) |
| Styling inconsistency | Low | Low | Follow PropertyForm patterns exactly |
| Browser compatibility | Low | Medium | Use native select element, avoid custom dropdowns |

---

## Implementation Notes

1. **Do not create a custom dropdown** - Use native `<select>` element for maximum accessibility and browser compatibility. The `useLanguagePreference` hook provides the `supportedLanguages` array with all needed metadata.

2. **Leverage existing hook** - The `useLanguagePreference` hook already handles:
   - API calls to `/api/user/language`
   - Cookie synchronization
   - LocalStorage fallback for guests
   - Optimistic updates with rollback
   - Error handling

3. **Track dirty state locally** - Compare `selectedLanguage` (local state) with `language` (from hook) to determine if changes exist and enable/disable save button.

4. **Consider toast notifications** - The codebase may have a toast notification system. If so, use it for success/error feedback. Otherwise, use inline messages.

5. **Folder structure** - Create the `LanguagePreference` subdirectory under `TranslationManagement` even if the parent doesn't exist yet, as the Implementation Plan specifies this structure.

---

## References

- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` (Phase 6, Task 6.1)
- Request Document: `/docs/gen_requests_epic5.md` (REQ-E05-026)
- Hook Implementation: `/src/hooks/useLanguagePreference.ts`
- Language Config: `/src/lib/i18n/config.ts`
- Form Pattern Reference: `/src/components/PropertyForm.tsx`
- API Endpoint: `/src/app/api/user/language/route.ts`
