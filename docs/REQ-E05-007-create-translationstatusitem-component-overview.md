# Implementation Overview: REQ-E05-007 - Create TranslationStatusItem Component

**Document Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E05-007
**Epic:** Epic 5 - Owner Translation Management
**Phase:** 2 - Core UI Components
**Task ID:** 2.3
**Size:** S (Small)
**Priority:** P2 - Medium

---

## Summary

Create a reusable `TranslationStatusItem` component that displays a single language's translation status within the TranslationPreviewPanel. The component renders as a horizontal row showing the language flag, language name, status indicator with color coding, truncated preview text, and contextual action buttons. This component is the building block for displaying translation status across all six supported languages.

---

## Request Details

### Original Request (REQ-E05-008)

Property owners need a reusable row component that displays a single language's translation status within the preview panel, showing the flag, language name, status indicator, preview text snippet, and available actions.

### Expected Behavior

A single-row component renders with:
- Language flag icon (emoji) on the left
- Language name immediately after the flag
- Colored status indicator matching specification:
  - **Green** (#22C55E / `text-green-500`): Completed
  - **Orange** (#F59E0B / `text-amber-500`): Pending
  - **Red** (#EF4444 / `text-red-500`): Failed
  - **Purple** (#8B5CF6 / `text-violet-500`): Manual
- Truncated preview of translated text (max 80 characters with ellipsis)
- Contextual action buttons appearing on hover/focus

### User Impact

Property owners can quickly scan translation status across all languages in a consistent visual format, identify translations needing attention through color-coded indicators, preview translation quality without opening a full editor, and take immediate action on individual translations.

### Business Value

Provides a consistent, reusable building block for all translation status views, reducing development time for future features while maintaining a cohesive user experience across the translation management interface.

---

## Technical Context

### Dependencies

| Dependency | Source | Status |
|------------|--------|--------|
| TranslationStatus type | `/src/lib/translation-service/translation-service.types.ts` | Exists |
| SupportedLanguage type | `/src/lib/translation-service/translation-service.types.ts` | Exists |
| SUPPORTED_LANGUAGES constant | `/src/lib/translation-service/translation-service.types.ts` | Exists |
| getLanguageInfo utility | `/src/lib/translation-service/translation-service.types.ts` | Exists |
| cn utility | `/src/lib/utils` | Exists |
| Lucide React icons | `lucide-react` | Exists |
| TranslationManagement.types.ts | `/src/components/TranslationManagement/TranslationManagement.types.ts` | REQ-E05-006 (predecessor) |
| TranslationPreviewPanel folder | `/src/components/TranslationManagement/TranslationPreviewPanel/` | REQ-E05-006 creates structure |

### Existing Patterns to Follow

| Pattern | Source File | Usage |
|---------|-------------|-------|
| Status chip styling | `/src/components/ItemManager/components/shared/TagChip.tsx` | Color-coded badge styling, variant patterns |
| Inline flex row | `/src/components/ItemManager/components/ItemRow.tsx` | Flex layout with responsive columns |
| Engagement indicator | `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Color-coded status with icons |
| Touch targets | Various | 48px mobile / 40px desktop minimum |
| Action button pattern | `/src/components/ItemManager/components/ItemRow.tsx` | Hover-reveal action buttons |

### Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18+ | Component framework |
| TypeScript 5.x | Type safety |
| Tailwind CSS 4.x | Styling |
| Lucide React | Icons (Check, Clock, AlertCircle, Pencil, RefreshCw, Eye) |
| cn utility | Class name composition |

---

## Component Specification

### Props Interface

```typescript
interface TranslationStatusItemProps {
  /** ISO 639-1 language code (required) */
  language: SupportedLanguage;

  /** Current translation status (required) */
  status: TranslationStatus;

  /** Translated content text (optional - shows fallback if empty) */
  translatedText?: string;

  /** Whether this language is the source language */
  isSourceLanguage?: boolean;

  /** Callback for Edit action button */
  onEdit?: () => void;

  /** Callback for Re-translate action button */
  onRetranslate?: () => void;

  /** Callback for Retry action button (failed translations only) */
  onRetry?: () => void;

  /** Callback for View action button */
  onView?: () => void;

  /** Whether actions are disabled (during loading/processing) */
  actionsDisabled?: boolean;

  /** Additional CSS classes */
  className?: string;
}
```

### Visual States

| Status | Icon | Color | Tailwind Classes | Actions Available |
|--------|------|-------|------------------|-------------------|
| `pending` | Clock | Orange | `text-amber-500 bg-amber-100` | None (processing) |
| `processing` | Loader2 (spinning) | Blue | `text-blue-500 bg-blue-100` | None (processing) |
| `completed` | Check | Green | `text-green-500 bg-green-100` | Edit, Re-translate |
| `failed` | AlertCircle | Red | `text-red-500 bg-red-100` | Retry, Re-translate |
| `manual` | Pencil | Purple | `text-violet-500 bg-violet-100` | Edit, Re-translate |

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🇫🇷  Français     ✓ Completed      Comment utiliser le...   [Edit] [↻]     │
│ ▲    ▲            ▲  ▲             ▲                         ▲              │
│ │    │            │  │             │                         │              │
│ Flag Language    Icon Status      Preview (max 80 chars)   Action buttons  │
│      Name        (colored)        with ellipsis             (hover/focus)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

| Viewport | Behavior |
|----------|----------|
| Desktop (≥1024px) | Full row with preview text and action buttons on hover |
| Tablet (768-1023px) | Preview text truncated further, actions always visible |
| Mobile (<768px) | Stacked layout: flag+name+status on top, preview below, actions as icons |

---

## Implementation Tasks

### Task 1: Create component file structure

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx`

Create the TranslationStatusItem React component with:
- Props interface as specified above
- Import dependencies (Lucide icons, cn utility, translation types)
- Status-to-style mapping object for colors and icons
- Main component implementation with flex layout

### Task 2: Implement status indicator rendering

Implement the status indicator section:
- Map TranslationStatus to appropriate icon component
- Map TranslationStatus to color classes
- Add spinning animation for 'processing' status
- Include ARIA attributes for accessibility

### Task 3: Implement language display

Implement the language flag and name section:
- Use `getLanguageInfo()` to retrieve flag emoji and name
- Display flag emoji followed by language name
- Handle unknown language codes gracefully
- Support for source language indicator (optional badge)

### Task 4: Implement preview text truncation

Implement the preview text section:
- Truncate text to 80 characters maximum
- Add ellipsis (...) for truncated content
- Show fallback message when no translation exists:
  - "Translating..." for pending/processing
  - "Translation failed. Click to retry." for failed
  - "No translation available" for empty completed
- Apply appropriate text styling (gray for placeholder, normal for content)

### Task 5: Implement action buttons

Implement the action button section:
- Edit button: enabled for completed, manual
- Re-translate button: enabled for completed, failed, manual
- Retry button: enabled only for failed
- Apply hover/focus reveal pattern
- Ensure 44px minimum touch targets on mobile
- Add ARIA labels for accessibility

### Task 6: Add accessibility features

Ensure full accessibility compliance:
- ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Enter, Space)
- Focus visible indicators
- Screen reader announcements for status
- Role="listitem" for semantic meaning within parent list

### Task 7: Export from index file

**File:** `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts`

Add export for TranslationStatusItem:
```typescript
export { TranslationStatusItem } from './TranslationStatusItem';
export type { TranslationStatusItemProps } from './TranslationStatusItem';
```

---

## Authorized Files and Functions for Modification

### New Files (Create)

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/TranslationStatusItem.tsx` | Main component file |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationPreviewPanel/index.ts` | Add TranslationStatusItem export |

### Files to Reference (Read-Only)

| File Path | Purpose |
|-----------|---------|
| `/src/lib/translation-service/translation-service.types.ts` | TranslationStatus, SupportedLanguage, SUPPORTED_LANGUAGES, getLanguageInfo |
| `/src/lib/utils.ts` | cn utility function |
| `/src/components/ItemManager/components/shared/TagChip.tsx` | Color/styling patterns |
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | Status indicator patterns |
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Shared type definitions (if exists from REQ-E05-006) |

---

## Acceptance Criteria Checklist

- [ ] Component renders as a single horizontal row with flex layout
- [ ] Flag icon displays at left edge using emoji from SUPPORTED_LANGUAGES
- [ ] Language name displays immediately after flag in medium font weight
- [ ] Status indicator displays using specified colors: green (complete), orange (pending), red (failed), purple (manual)
- [ ] Status indicator includes appropriate icon (checkmark, clock, error, pencil) matching status type
- [ ] Preview text displays truncated translation content (maximum 80 characters with ellipsis)
- [ ] Preview text shows fallback message when no translation exists
- [ ] Action buttons display on row hover or keyboard focus
- [ ] Edit action button is enabled for completed or manual translations
- [ ] Re-translate action button is enabled for completed, failed, or manual translations
- [ ] Retry action button is enabled only for failed translations
- [ ] All action buttons include accessible labels and ARIA attributes
- [ ] Component accepts language code (ISO 639-1) as required prop
- [ ] Component accepts translation status enum as required prop
- [ ] Component accepts translated content text as optional prop
- [ ] Component accepts callback functions for each action button
- [ ] Component is fully keyboard accessible with focus management
- [ ] Component maintains consistent height regardless of content length
- [ ] Component visual design matches specified color palette and typography
- [ ] Component works within both light and dark theme contexts

---

## Testing Requirements

### Unit Tests

- [ ] Renders correctly for each translation status (pending, processing, completed, failed, manual)
- [ ] Displays correct flag emoji for each supported language
- [ ] Truncates preview text at 80 characters with ellipsis
- [ ] Shows fallback message when translatedText is undefined/empty
- [ ] Enables/disables action buttons based on status
- [ ] Calls appropriate callback when action buttons clicked
- [ ] Handles unknown language codes gracefully

### Accessibility Tests

- [ ] Component is navigable via keyboard (Tab)
- [ ] Action buttons are activatable via Enter/Space
- [ ] Screen reader announces status correctly
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG 2.1 AA standards

### Visual Tests

- [ ] Matches design specification for all status states
- [ ] Responsive layout works on mobile, tablet, desktop
- [ ] Hover states display correctly
- [ ] Loading/processing animation works smoothly

---

## Code Example

```tsx
// Usage within TranslationPreviewPanel
<div className="space-y-2" role="list" aria-label="Translation status by language">
  {SUPPORTED_LANGUAGES.map((lang) => (
    <TranslationStatusItem
      key={lang.code}
      language={lang.code}
      status={translations[lang.code]?.status ?? 'pending'}
      translatedText={translations[lang.code]?.content?.title}
      isSourceLanguage={lang.code === sourceLanguage}
      onEdit={() => handleEdit(lang.code)}
      onRetranslate={() => handleRetranslate(lang.code)}
      onRetry={() => handleRetry(lang.code)}
      actionsDisabled={isProcessing}
    />
  ))}
</div>
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Status color accessibility | Low | Medium | Ensure icons accompany colors for colorblind users |
| Text truncation edge cases | Low | Low | Test with various content lengths, RTL languages |
| Action button overlap on mobile | Medium | Low | Use responsive design with stacked layout |
| Missing language info | Low | Low | Graceful fallback to language code display |

---

## References

- **PRD:** `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- **Request File:** `/docs/gen_requests_epic5.md` (REQ-E05-008)
- **Translation Types:** `/src/lib/translation-service/translation-service.types.ts`
- **TagChip Pattern:** `/src/components/ItemManager/components/shared/TagChip.tsx`
- **PRD Status Colors Spec:** UI Visual Specifications section

---

*Document generated for FAQBNB L10N Epic 5 - Task 2.3: TranslationStatusItem Component*
