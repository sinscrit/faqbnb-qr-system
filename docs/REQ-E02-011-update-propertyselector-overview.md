# Implementation Overview: REQ-E02-011 - Update PropertySelector Component with Localized Strings

**Document Created:** 2026-01-20 20:15:00 UTC
**Last Modified:** 2026-01-20 20:15:00 UTC

**Request ID:** REQ-E02-011
**Epic:** 2 - Static UI Translation
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.5
**Size:** S (Small)
**Priority:** P2

---

## 1. Summary

Update the PropertySelector component to use localized translation references instead of hardcoded English strings. This component provides a dropdown selector for filtering by property and contains approximately 10-15 hardcoded strings including labels, placeholders, empty state messages, loading states, and accessibility text.

---

## 2. Current State Analysis

### 2.1 Component Location
- **File:** `/src/components/PropertySelector.tsx`
- **Type:** Client Component (`'use client'`)
- **Lines:** ~323 lines
- **Last Modified:** 2026-01-06 (REQ-134 Airbnb Design System colors update)

### 2.2 Component Purpose

The PropertySelector component is a reusable dropdown that allows users to:
- Filter content by property selection
- Select "All Properties" to view aggregated data
- View a list of available properties with type and owner information (admin mode)
- Navigate with keyboard accessibility

### 2.3 Props Interface

```typescript
interface PropertySelectorProps {
  properties: Property[];
  selectedPropertyId?: string;
  onPropertyChange: (propertyId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  disabled?: boolean;
  loading?: boolean;
  isAdmin?: boolean;
  placeholder?: string;  // Default: 'All Properties'
}
```

### 2.4 Hardcoded Strings Inventory

| Category | String | Location (Line) | Translation Key |
|----------|--------|-----------------|-----------------|
| **Header** | "Property Filter" | 163 | `properties.selector.title` |
| **Header** | "Filter analytics data by property" | 165-166 | `properties.selector.subtitle` |
| **Loading** | "Loading properties..." | 197 | `properties.selector.loading` |
| **Loading** | "Loading properties..." | 307 | `properties.selector.loading` |
| **Empty State** | "No properties available" | 294-295 | `properties.selector.empty` |
| **Accessibility** | "Select property for analytics filtering" | 192 | `properties.selector.ariaLabel` |
| **Accessibility** | "Property options" | 216 | `properties.selector.optionsAriaLabel` |
| **Default Placeholder** | "All Properties" (prop default) | 44 | `properties.selector.allProperties` |

**Total Estimated Strings:** ~8 unique hardcoded strings + 1 prop default

### 2.5 Dynamic Content

The following dynamic content exists in the component:
1. Property nickname display: `{property.nickname}` - no translation needed (user data)
2. Property type display: `{property.property_types?.display_name}` - no translation needed (database data)
3. User email (admin mode): `{property.users?.email}` - no translation needed (user data)

### 2.6 Existing Props Consideration

The component already has a `placeholder` prop that defaults to `'All Properties'`. This should be maintained for backward compatibility while allowing localized defaults.

---

## 3. Technical Approach

### 3.1 Translation Pattern

Following the established pattern from Epic 1 and other Epic 2 components:

```typescript
// Import at top of file
import { useTranslations } from 'next-intl';

// Inside component function
const t = useTranslations('properties.selector');
```

### 3.2 Namespace Structure

Add to `/messages/en.json` under the `properties.selector` namespace:

```json
{
  "properties": {
    "selector": {
      "title": "Property Filter",
      "subtitle": "Filter analytics data by property",
      "allProperties": "All Properties",
      "loading": "Loading properties...",
      "empty": "No properties available",
      "ariaLabel": "Select property for analytics filtering",
      "optionsAriaLabel": "Property options"
    }
  }
}
```

### 3.3 Backward Compatibility

The `placeholder` prop should continue to work for custom text but default to the translated value:

```typescript
// Current default
placeholder = 'All Properties'

// New approach - use translation as default
const t = useTranslations('properties.selector');
const defaultPlaceholder = t('allProperties');
const displayPlaceholder = placeholder || defaultPlaceholder;
```

**Note:** Since `placeholder` is passed as a prop, callers can still override it. However, the default should come from translations. For existing callers that don't pass `placeholder`, they will automatically get the translated default.

### 3.4 Props Change Consideration

To maintain full backward compatibility while supporting localization:

Option A (Recommended): Remove the prop default and use translation
```typescript
placeholder?: string; // Remove default value from interface
// In component: const displayPlaceholder = placeholder ?? t('allProperties');
```

Option B: Keep string default but document translation usage
```typescript
// Caller should use t('properties.selector.allProperties') if passing custom placeholder
```

**Recommendation:** Option A - this ensures all usages automatically get translations without modification to calling code.

---

## 4. Implementation Tasks

### Task 1: Add Translation Keys to Messages Files
- Add `properties.selector` namespace to `/messages/en.json`
- Ensure all 6 language files are updated with the same structure

### Task 2: Update PropertySelector Component
- Import `useTranslations` from 'next-intl'
- Initialize translation hook: `const t = useTranslations('properties.selector');`
- Replace hardcoded "Property Filter" header text
- Replace hardcoded subtitle text
- Replace loading state text
- Replace empty state text
- Replace aria-label attributes
- Update placeholder default to use translation

### Task 3: Verify Build and Functionality
- Run TypeScript compilation to ensure no type errors
- Run build to verify no missing translation keys
- Test selector in various states (loading, empty, populated)
- Verify accessibility attributes are translated
- Verify backward compatibility with custom placeholder values

---

## 5. Authorized Files and Functions for Modification

### 5.1 Primary Files

| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/src/components/PropertySelector.tsx` | Main component | Add imports, replace hardcoded strings |
| `/messages/en.json` | English translations | Add `properties.selector` namespace |
| `/messages/fr.json` | French translations | Add `properties.selector` namespace |
| `/messages/es.json` | Spanish translations | Add `properties.selector` namespace |
| `/messages/de.json` | German translations | Add `properties.selector` namespace |
| `/messages/nl.json` | Dutch translations | Add `properties.selector` namespace |
| `/messages/it.json` | Italian translations | Add `properties.selector` namespace |

### 5.2 Authorized Functions/Sections in PropertySelector.tsx

| Function/Section | Lines | Modification |
|------------------|-------|--------------|
| Import statements | 1-8 | Add `useTranslations` import |
| Component function start | 34-45 | Add translation hook initialization |
| Props destructuring | 35-45 | Update placeholder default handling |
| Default variant header section | 159-169 | Replace title and subtitle strings |
| Button loading text | 197 | Replace loading string |
| Dropdown aria-label | 215-216 | Replace aria-label string |
| All Properties option | 219-242 | Uses `placeholder` (from translation) |
| Empty state message | 293-296 | Replace empty message string |
| Loading dropdown state | 301-311 | Replace loading string |

### 5.3 Files NOT to Modify

- `/src/types/index.ts` - No type changes needed
- Any components that consume PropertySelector
- API routes
- Database migrations
- Other component files in the same directory

---

## 6. Dependencies

### 6.1 Epic 1 Dependencies (Must be Complete)

| Dependency | Status | Notes |
|------------|--------|-------|
| next-intl package installed | Required | Package must be in `package.json` |
| IntlProvider in layout.tsx | Required | Provider must wrap application |
| Messages files exist | Required | All 6 language files must exist |
| `useTranslations` hook working | Required | Must be functional in client components |

### 6.2 Related Epic 2 Tasks

| Task | Relationship | Notes |
|------|--------------|-------|
| 2F.1: Create properties namespace | Prerequisite | Namespace structure should exist |
| 2F.2: Update PropertyForm | Related | Both in Sub-Epic 2F |
| 2F.3: Update property modals | Related | May use PropertySelector |
| 2F.4: Update property pages | Related | PropertySelector used in pages |

### 6.3 Components That Use PropertySelector

The PropertySelector may be used in these locations (verify before testing):
- Dashboard filter controls
- Analytics filter panels
- Item management views
- Any property-scoped feature

---

## 7. Acceptance Criteria

- [ ] All hardcoded strings in PropertySelector.tsx are replaced with translation function calls
- [ ] Translation keys are added to all 6 language files under `properties.selector` namespace
- [ ] Header title "Property Filter" displays translated text
- [ ] Subtitle description displays translated text
- [ ] "All Properties" default placeholder displays translated text
- [ ] Loading state displays translated text
- [ ] Empty state displays translated text
- [ ] Aria-label attributes use translated text
- [ ] Custom placeholder prop continues to work for override scenarios
- [ ] Component renders correctly in all 6 supported languages without layout issues
- [ ] Dropdown options display correctly with translated elements
- [ ] Keyboard navigation continues to work correctly
- [ ] TypeScript compilation passes with no errors
- [ ] Build completes successfully
- [ ] No hardcoded English text remains in PropertySelector component

---

## 8. Testing Checklist

### 8.1 Functional Testing
- [ ] Dropdown opens and closes correctly
- [ ] "All Properties" option displays translated text and functions
- [ ] Individual property options display correctly
- [ ] Loading state shows translated message
- [ ] Empty state (no properties) shows translated message
- [ ] Selection works correctly and calls onPropertyChange
- [ ] Keyboard navigation (arrow keys, enter, escape) works

### 8.2 Variant Testing
- [ ] Default variant shows header with title and subtitle
- [ ] Compact variant does not show header
- [ ] All three sizes (sm, md, lg) render correctly

### 8.3 Language Testing
- [ ] Test in English (en) - source language
- [ ] Test in French (fr)
- [ ] Test in Spanish (es)
- [ ] Test in German (de)
- [ ] Test in Dutch (nl)
- [ ] Test in Italian (it)

### 8.4 Accessibility Testing
- [ ] Screen reader announces correct aria-label
- [ ] Dropdown options have correct aria-selected state
- [ ] Focus management works correctly

### 8.5 Visual Regression
- [ ] No text overflow in header title
- [ ] No text overflow in subtitle
- [ ] No text overflow in dropdown options
- [ ] Layout remains consistent across languages
- [ ] German text (typically longest) fits within component bounds

---

## 9. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation key at runtime | Low | Medium | Build-time check, fallback to English |
| Text overflow in other languages | Low | Low | Component uses truncation already |
| Breaking placeholder prop functionality | Medium | Medium | Test with custom placeholder values |
| Translation hook not available | Low | High | Verify Epic 1 foundation complete |
| Accessibility regression | Low | Medium | Test with screen reader |

---

## 10. Estimated Effort

| Task | Estimate |
|------|----------|
| Add translation keys to en.json | 10 minutes |
| Update PropertySelector component | 20 minutes |
| Copy translations to other 5 languages | 15 minutes |
| Testing and verification | 20 minutes |
| **Total** | **~1 hour** |

---

## 11. Code Examples

### 11.1 Before (Current State)

```tsx
// Header section
{variant === 'default' && (
  <div className="mb-3">
    <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
      <Building className="w-4 h-4" />
      <span>Property Filter</span>
    </h3>
    <p className="text-xs text-gray-500 mt-1">
      Filter analytics data by property
    </p>
  </div>
)}

// Button loading text
<span className="truncate text-left">
  {loading ? 'Loading properties...' : getSelectedPropertyDisplay()}
</span>

// Empty state
{properties.length === 0 && (
  <div className={`${sizeClasses.option} text-gray-500 text-center`}>
    No properties available
  </div>
)}
```

### 11.2 After (Translated)

```tsx
// Import
import { useTranslations } from 'next-intl';

// Inside component
const t = useTranslations('properties.selector');

// Header section
{variant === 'default' && (
  <div className="mb-3">
    <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
      <Building className="w-4 h-4" />
      <span>{t('title')}</span>
    </h3>
    <p className="text-xs text-gray-500 mt-1">
      {t('subtitle')}
    </p>
  </div>
)}

// Button loading text
<span className="truncate text-left">
  {loading ? t('loading') : getSelectedPropertyDisplay()}
</span>

// Empty state
{properties.length === 0 && (
  <div className={`${sizeClasses.option} text-gray-500 text-center`}>
    {t('empty')}
  </div>
)}

// Placeholder handling
const displayPlaceholder = placeholder ?? t('allProperties');
```

### 11.3 Translation File Addition

```json
// In /messages/en.json, add under "properties":
{
  "properties": {
    "selector": {
      "title": "Property Filter",
      "subtitle": "Filter analytics data by property",
      "allProperties": "All Properties",
      "loading": "Loading properties...",
      "empty": "No properties available",
      "ariaLabel": "Select property for analytics filtering",
      "optionsAriaLabel": "Property options"
    }
  }
}
```

---

## 12. References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-E02-011
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [PropertyForm Overview](/docs/REQ-E02-008-update-propertyform-overview.md) - Related Sub-Epic 2F task
- [i18n Config](/src/lib/i18n/config.ts) - Locale configuration

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2F - Property Management*
