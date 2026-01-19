# REQ-343: Extract Loading State Messages for Internationalization

## Implementation Overview Document

**Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request ID:** REQ-343
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.7
**Size:** M (Medium)
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## 1. Summary

Extract all hardcoded loading state messages from components throughout the application and replace them with translation keys using next-intl's `useTranslations` hook (client components) or `getTranslations` (server components). This task ensures loading indicators, progress messages, skeleton loader accessibility labels, and async operation feedback display in the user's selected language.

---

## 2. Background

### Current State
Loading state messages are hardcoded in English across approximately 30+ components. These messages include:
- Generic loading indicators: "Loading...", "Please wait..."
- Context-specific states: "Loading items", "Loading properties", "Loading statistics"
- Operation feedback: "Saving...", "Submitting...", "Fetching data..."
- Skeleton loader accessibility labels using `aria-label` attributes
- Screen reader announcements in `sr-only` spans

### Problem
Users with non-English language preferences see English-only loading messages during all async operations, creating an inconsistent experience and reducing perceived application quality for international users.

### Dependencies
- Epic 1 Foundation (Complete): next-intl installed, IntlProvider configured
- Messages files exist: `/messages/en.json`, `/messages/fr.json`, etc.
- Translation hook infrastructure: `useTranslations`, `getTranslations`

---

## 3. Technical Approach

### 3.1 Translation Namespace Structure

Add loading state messages to the `common` namespace following established patterns:

```json
{
  "common": {
    "loading": {
      "default": "Loading...",
      "pleaseWait": "Please wait...",
      "content": "Loading content",
      "items": "Loading items",
      "properties": "Loading properties",
      "statistics": "Loading statistics",
      "guides": "Loading guides",
      "portfolioSummary": "Loading portfolio summary",
      "engagementIndicator": "Loading engagement indicator",
      "viewCount": "Loading view count",
      "reactions": "Loading reactions",
      "contentPreview": "Loading content preview",
      "preview": "Loading preview...",
      "editor": "Loading editor",
      "pdfPreview": "Loading PDF preview",
      "pdf": "Loading PDF...",
      "authentication": "Loading authentication...",
      "dashboard": "Loading dashboard...",
      "permissions": "Loading permissions...",
      "itemData": "Loading item...",
      "screenReaderWait": "{context}, please wait..."
    },
    "status": {
      "saving": "Saving...",
      "savingProperty": "Saving property",
      "savingPropertyChanges": "Saving property changes...",
      "submitting": "Submitting...",
      "processing": "Processing...",
      "fetching": "Fetching data...",
      "uploading": "Uploading...",
      "completingAuth": "Completing authentication..."
    }
  }
}
```

### 3.2 Component Update Pattern

**Client Components:**
```typescript
// Before
<LoadingIndicator label="Loading" />

// After
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common.loading');
  return <LoadingIndicator label={t('default')} />;
}
```

**Server Components:**
```typescript
// Before
<SkeletonBase label="Loading content">

// After
import { getTranslations } from 'next-intl/server';

async function MyServerComponent() {
  const t = await getTranslations('common.loading');
  return <SkeletonBase label={t('content')} />;
}
```

**Screen Reader Announcements:**
```typescript
// Before
<span className="sr-only">Loading items, please wait...</span>

// After
<span className="sr-only">{t('screenReaderWait', { context: t('items') })}</span>
```

---

## 4. Scope Analysis

### 4.1 Components with Loading States (30+ files)

| Category | Component/File | Loading Strings |
|----------|---------------|-----------------|
| **Core Loading Components** | | |
| LoadingIndicator | `/src/components/SimpleDashboard/LoadingIndicator.tsx` | 2 |
| SkeletonBase | `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | 2 |
| LoadingState | `/src/components/ItemManager/components/shared/LoadingState.tsx` | 4 |
| **Dashboard** | | |
| StatisticsCards | `/src/components/SimpleDashboard/StatisticsCards.tsx` | 1 |
| PropertySection | `/src/components/SimpleDashboard/PropertySection.tsx` | 1 |
| PortfolioSummary | `/src/components/SimpleDashboard/PortfolioSummary.tsx` | 1 |
| PropertyEditModal | `/src/components/SimpleDashboard/PropertyEditModal.tsx` | 2 |
| **Item Manager** | | |
| VisitCountBadge | `/src/components/ItemManager/components/shared/VisitCountBadge.tsx` | 1 |
| ReactionSummary | `/src/components/ItemManager/components/shared/ReactionSummary.tsx` | 1 |
| EngagementIndicator | `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | 1 |
| PDFViewer | `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx` | 1 |
| **Item Capture** | | |
| MediaEditorStep | `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | 1 |
| PDFPlaceholder | `/src/components/ItemCapture/components/shared/PDFPlaceholder.tsx` | 1 |
| TextEditorStep | `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` | 1 |
| **Item Creation Workflow** | | |
| ContentPreview | `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | 2 |
| **Auth & Layout** | | |
| DashboardLayout | `/src/components/DashboardLayout.tsx` | 2 |
| LoginPageContent | `/src/app/login/LoginPageContent.tsx` | 2 |
| **Pages** | | |
| PrintPage | `/src/app/dashboard2/print/[propertyId]/page.tsx` | 2 |
| PrintIndex | `/src/app/dashboard2/print/page.tsx` | 1 |
| PropertyPage | `/src/app/dashboard/properties/[propertyId]/page.tsx` | 1 |
| AdminPropertyPage | `/src/app/admin/properties/[propertyId]/page.tsx` | 1 |
| AdminItemEdit | `/src/app/admin/items/[publicId]/edit/page.tsx` | 1 |
| **Other Components** | | |
| PropertySelector | `/src/components/PropertySelector.tsx` | 1 |
| ItemsManagement | `/src/components/ItemsManagement.tsx` | 1 |
| GuideGrid | `/src/components/InstructionsTable/GuideGrid.tsx` | 1 |
| ItemForm | `/src/components/ItemForm.tsx` | 1 |
| InstructionEditor | `/src/components/InstructionEditor/InstructionEditor.tsx` | 1 |

### 4.2 String Categories

1. **Generic Loading (~8 strings):** Default spinner labels, please wait messages
2. **Context-Specific (~15 strings):** Loading items, properties, statistics, etc.
3. **Operation Status (~8 strings):** Saving, submitting, processing, fetching
4. **Screen Reader (~4 strings):** Accessible announcements with context

**Total Estimated Strings:** ~30-35

---

## 5. Implementation Tasks

### Task 1: Update Translation Files
- Add loading state keys to `common.loading` namespace in `/messages/en.json`
- Add operation status keys to `common.status` namespace
- Propagate translations to all 5 non-English language files

### Task 2: Update Core Loading Components
- Update `LoadingIndicator.tsx` to accept translated label via prop (keep default fallback)
- Update `SkeletonBase.tsx` to use translated label
- Update `LoadingState.tsx` to use translated aria-labels and sr-only text

### Task 3: Update Dashboard Components
- Update `StatisticsCards.tsx`
- Update `PropertySection.tsx`
- Update `PortfolioSummary.tsx`
- Update `PropertyEditModal.tsx`

### Task 4: Update ItemManager Components
- Update `VisitCountBadge.tsx`
- Update `ReactionSummary.tsx`
- Update `EngagementIndicator.tsx`
- Update `PDFViewer.tsx`
- Update `LoadingState.tsx`

### Task 5: Update ItemCapture Components
- Update `MediaEditorStep.tsx`
- Update `PDFPlaceholder.tsx`
- Update `TextEditorStep.tsx`

### Task 6: Update ItemCreationWorkflow Components
- Update `ContentPreview.tsx`

### Task 7: Update Auth & Layout Components
- Update `DashboardLayout.tsx`
- Update `LoginPageContent.tsx`

### Task 8: Update Page Components
- Update print pages
- Update property pages
- Update admin pages

### Task 9: Update Other Components
- Update `PropertySelector.tsx`
- Update `ItemsManagement.tsx`
- Update `GuideGrid.tsx`
- Update `ItemForm.tsx`
- Update `InstructionEditor.tsx`

### Task 10: Test & Validate
- Verify all loading states display correctly
- Test language switching during loading states
- Verify screen reader announcements in each language

---

## 6. Authorized Files and Functions for Modification

### 6.1 Translation Files
| File | Modification |
|------|-------------|
| `/messages/en.json` | Add `common.loading.*` and `common.status.*` keys |
| `/messages/fr.json` | Add French translations |
| `/messages/es.json` | Add Spanish translations |
| `/messages/de.json` | Add German translations |
| `/messages/nl.json` | Add Dutch translations |
| `/messages/it.json` | Add Italian translations |

### 6.2 Core Loading Components
| File | Functions/Elements to Modify |
|------|---------------------------|
| `/src/components/SimpleDashboard/LoadingIndicator.tsx` | `LoadingIndicator` - Update default label handling |
| `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx` | `SkeletonBase` - Add i18n for label prop |
| `/src/components/ItemManager/components/shared/LoadingState.tsx` | `LoadingState`, `GridSkeletonCard`, `ListSkeletonRow` - Add i18n for aria-labels and sr-only |

### 6.3 SimpleDashboard Components
| File | Functions/Elements to Modify |
|------|---------------------------|
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Loading state SkeletonBase label |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Loading state SkeletonBase label |
| `/src/components/SimpleDashboard/PortfolioSummary.tsx` | Loading state SkeletonBase label |
| `/src/components/SimpleDashboard/PropertyEditModal.tsx` | Submit button loading text, LoadingIndicator label |

### 6.4 ItemManager Components
| File | Functions/Elements to Modify |
|------|---------------------------|
| `/src/components/ItemManager/components/shared/VisitCountBadge.tsx` | aria-label for loading state |
| `/src/components/ItemManager/components/shared/ReactionSummary.tsx` | aria-label for loading state |
| `/src/components/ItemManager/components/shared/EngagementIndicator.tsx` | aria-label for loading state |
| `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx` | "Loading PDF..." text |

### 6.5 ItemCapture Components
| File | Functions/Elements to Modify |
|------|---------------------------|
| `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx` | aria-label for loading editor |
| `/src/components/ItemCapture/components/shared/PDFPlaceholder.tsx` | "Loading PDF preview" text |
| `/src/components/ItemCapture/components/steps/TextEditorStep.tsx` | aria-label for loading preview |

### 6.6 ItemCreationWorkflow Components
| File | Functions/Elements to Modify |
|------|---------------------------|
| `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx` | aria-label, sr-only text |

### 6.7 Auth & Layout Components
| File | Functions/Elements to Modify |
|------|---------------------------|
| `/src/components/DashboardLayout.tsx` | "Loading permissions...", "Loading dashboard..." text |
| `/src/app/login/LoginPageContent.tsx` | "Completing authentication...", "Loading authentication..." text |

### 6.8 Page Components
| File | Functions/Elements to Modify |
|------|---------------------------|
| `/src/app/dashboard2/print/[propertyId]/page.tsx` | `LoadingState` component, default message prop |
| `/src/app/dashboard2/print/page.tsx` | aria-label for loading properties |
| `/src/app/dashboard/properties/[propertyId]/page.tsx` | "Loading..." button text |
| `/src/app/admin/properties/[propertyId]/page.tsx` | "Loading..." button text |
| `/src/app/admin/items/[publicId]/edit/page.tsx` | "Loading item...", "Loading properties..." text |

### 6.9 Other Components
| File | Functions/Elements to Modify |
|------|---------------------------|
| `/src/components/PropertySelector.tsx` | "Loading properties..." text |
| `/src/components/ItemsManagement.tsx` | "Loading properties..." text |
| `/src/components/InstructionsTable/GuideGrid.tsx` | aria-label for loading guides |
| `/src/components/ItemForm.tsx` | "Saving..." button text |
| `/src/components/InstructionEditor/InstructionEditor.tsx` | "Saving..." button text |

---

## 7. Translation Keys Reference

### 7.1 English Source (`/messages/en.json`)

```json
{
  "common": {
    "loading": {
      "default": "Loading...",
      "pleaseWait": "Please wait...",
      "content": "Loading content",
      "items": "Loading items",
      "properties": "Loading properties",
      "statistics": "Loading statistics",
      "guides": "Loading guides",
      "portfolioSummary": "Loading portfolio summary",
      "engagementIndicator": "Loading engagement indicator",
      "viewCount": "Loading view count",
      "reactions": "Loading reactions",
      "contentPreview": "Loading content preview",
      "preview": "Loading preview...",
      "editor": "Loading editor",
      "pdfPreview": "Loading PDF preview",
      "pdf": "Loading PDF...",
      "authentication": "Loading authentication...",
      "dashboard": "Loading dashboard...",
      "permissions": "Loading permissions...",
      "item": "Loading item...",
      "screenReaderWait": "{context}, please wait..."
    },
    "status": {
      "saving": "Saving...",
      "savingProperty": "Saving property",
      "savingPropertyChanges": "Saving property changes...",
      "submitting": "Submitting...",
      "processing": "Processing...",
      "fetching": "Fetching data...",
      "uploading": "Uploading...",
      "completingAuth": "Completing authentication..."
    }
  }
}
```

### 7.2 Sample French Translation (`/messages/fr.json`)

```json
{
  "common": {
    "loading": {
      "default": "Chargement...",
      "pleaseWait": "Veuillez patienter...",
      "content": "Chargement du contenu",
      "items": "Chargement des articles",
      "properties": "Chargement des proprietes",
      "statistics": "Chargement des statistiques",
      "guides": "Chargement des guides",
      "portfolioSummary": "Chargement du resume du portefeuille",
      "engagementIndicator": "Chargement de l'indicateur d'engagement",
      "viewCount": "Chargement du nombre de vues",
      "reactions": "Chargement des reactions",
      "contentPreview": "Chargement de l'apercu du contenu",
      "preview": "Chargement de l'apercu...",
      "editor": "Chargement de l'editeur",
      "pdfPreview": "Chargement de l'apercu PDF",
      "pdf": "Chargement du PDF...",
      "authentication": "Chargement de l'authentification...",
      "dashboard": "Chargement du tableau de bord...",
      "permissions": "Chargement des autorisations...",
      "item": "Chargement de l'article...",
      "screenReaderWait": "{context}, veuillez patienter..."
    },
    "status": {
      "saving": "Enregistrement...",
      "savingProperty": "Enregistrement de la propriete",
      "savingPropertyChanges": "Enregistrement des modifications de la propriete...",
      "submitting": "Soumission...",
      "processing": "Traitement...",
      "fetching": "Recuperation des donnees...",
      "uploading": "Telechargement...",
      "completingAuth": "Finalisation de l'authentification..."
    }
  }
}
```

---

## 8. Acceptance Criteria

- [ ] All components with loading states are identified and updated
- [ ] Generic loading messages use `common.loading.default` or contextual keys
- [ ] Context-specific loading messages use dedicated keys (e.g., `common.loading.items`)
- [ ] Operation status messages use `common.status.*` keys
- [ ] Skeleton loader `aria-label` attributes use translation keys
- [ ] Screen reader `sr-only` text uses translation keys
- [ ] All extracted strings added to `/messages/en.json`
- [ ] All extracted strings propagated to 5 non-English language files
- [ ] Components correctly display translated loading messages when language is switched
- [ ] Loading messages maintain appropriate brevity and clarity in all languages
- [ ] Build passes with no TypeScript errors
- [ ] Existing tests continue to pass

---

## 9. Testing Strategy

### Unit Tests
- Verify loading components accept and display translated labels
- Test that default fallbacks work when translation unavailable

### Integration Tests
- Test language switching during active loading states
- Verify correct translations displayed for each locale

### Accessibility Tests
- Verify screen reader announcements in each language
- Confirm aria-labels are properly translated

### Manual Verification
- Check each loading state in all 6 languages
- Verify text doesn't overflow or break layout

---

## 10. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing loading states | Medium | Low | Grep search for loading patterns, thorough component audit |
| Breaking existing tests | Low | Medium | Update test mocks to include translations |
| Layout issues with longer text | Low | Low | German/French translations tested for text expansion |
| Runtime translation errors | Low | Medium | TypeScript key validation, build-time checks |

---

## 11. Related Documents

- [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-138: Unified Loading Indicator Component](/docs/REQ-138-loading-indicator-detailed.md)
- [Epic 1 Foundation: i18n Setup](/docs/prd/Plan-110-L10N-Epic1-Foundation.md)

---

## 12. Notes

- The `LoadingIndicator` component already accepts a `label` prop, making integration straightforward
- `SkeletonBase` similarly accepts a `label` prop with default value
- Many components already have aria-labels that just need i18n wrapping
- Consider creating a `useLoadingTranslations` convenience hook for common patterns

---

*Document generated for FAQBNB L10N Epic 2 - Task 2H.7*
