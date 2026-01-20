# REQ-E02-017: Update Help Page with Localized Strings - Implementation Overview

*Generated: 2026-01-20 02:30:00 UTC*
*Last Modified: 2026-01-20 02:30:00 UTC*

## Reference

- **Request**: REQ-E02-017 (Update Help Page with Localized Strings)
- **Source**: docs/gen_requests_epic2.md
- **Implementation Plan**: docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Type**: Enhancement
- **Phase**: 2G (Settings & Account)
- **Task ID**: 2G.5
- **Size**: M (Medium)
- **Epic**: Localization Epic 2 - Static UI Translation
- **Depends On**:
  - Epic 1 (L10N Foundation - next-intl setup)
  - REQ-E02-013 (Settings namespace structure - Task 2G.1)

## Summary

Update the Help page (`/src/app/dashboard2/help/page.tsx`) to replace all hardcoded English strings with references to localized translation keys from the `settings.help` namespace. This includes page titles, section headings, instructional content, FAQ-style step-by-step guides, tips, action links, and support contact information.

## Goals

1. Replace all hardcoded strings in the Help page with `useTranslations` hook references
2. Ensure all help content sections are translatable (5 main sections with ~100+ strings)
3. Extract the `INSTRUCTION_SECTIONS` constant data structure to use translation keys
4. Maintain proper variable interpolation for dynamic content (tips, action links)
5. Preserve existing accessibility features (aria labels, roles)
6. Ensure layout doesn't break with translated text of varying lengths

## Context from Implementation Plan

### Current Component Analysis

The Help page (`/src/app/dashboard2/help/page.tsx`) contains:

| Content Type | Count | Description |
|--------------|-------|-------------|
| Page title/subtitle | 2 | Main header text |
| Section headings | 5 | Getting Started, Managing Properties, Creating Items, QR Code Generation, Managing Items |
| Section descriptions | 5 | Descriptive text for each section |
| Step titles | 22 | Instruction step headings |
| Step content | 22 | Detailed instruction paragraphs |
| Tips | 8 | Helpful hints prefixed with "Tip:" |
| Action links | 7 | Navigation links with labels |
| Quick links | 5 | Section navigation labels |
| Footer content | 3 | Support section title, description, button |
| UI states | 4 | Loading, auth required, access denied messages |

**Total estimated strings: ~100+**

### Current Implementation Structure

The Help page uses a `INSTRUCTION_SECTIONS` constant array containing hardcoded content:

```typescript
const INSTRUCTION_SECTIONS: InstructionSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: PlusCircle,
    description: 'Learn the basics of setting up your FAQBNB account',
    steps: [
      {
        step: 1,
        title: 'Create Your First Property',
        content: 'After signing in, navigate to Properties...',
        tip: 'You can add multiple properties...',
        link: { href: '/dashboard2/properties', label: 'Go to Properties' },
      },
      // ... more steps
    ],
  },
  // ... 4 more sections
];
```

### Translation Keys (from settings.help namespace)

The `settings.help` namespace structure (created in Task 2G.1) provides:

```json
{
  "settings": {
    "help": {
      "title": "Help & User Guide",
      "subtitle": "Learn how to use FAQBNB to create and manage your property items",
      "quickLinks": "Quick Links",
      "stillNeedHelp": "Still Need Help?",
      "stillNeedHelpDescription": "Can't find what you're looking for? Contact our support team for assistance.",
      "contactSupport": "Contact Support",
      "createItem": "Create Item",
      "tip": "Tip: {tip}",
      "sections": {
        "gettingStarted": { ... },
        "propertyManagement": { ... },
        "itemCreation": { ... },
        "qrCodes": { ... },
        "itemManagement": { ... }
      },
      "links": {
        "goToProperties": "Go to Properties",
        "createItem": "Create an Item",
        "manageProperties": "Manage Properties",
        "viewItems": "View Items"
      }
    }
  }
}
```

## Implementation Order

### Step 1: Add useTranslations Hook

Import and initialize the translation hook at the component level:

```typescript
import { useTranslations } from 'next-intl';

export default function HelpPage() {
  const t = useTranslations('settings.help');
  // ...
}
```

### Step 2: Update Page Header

Replace hardcoded header text:

```typescript
// Before
<h1 id="help-title" className="text-2xl font-bold text-gray-900">
  Help & User Guide
</h1>
<p className="text-gray-600 mt-1">
  Learn how to use FAQBNB to create and manage your property items
</p>

// After
<h1 id="help-title" className="text-2xl font-bold text-gray-900">
  {t('title')}
</h1>
<p className="text-gray-600 mt-1">
  {t('subtitle')}
</p>
```

### Step 3: Update Loading and Auth States

Replace UI state messages:

```typescript
// Loading state
<p className="text-gray-600">{t('loading')}</p>

// Auth required
<h2>{t('authRequired')}</h2>
<p>{t('authRequiredDescription')}</p>
<button>{t('goToLogin')}</button>

// Access denied
<h2>{t('accessDenied')}</h2>
<p>{t('accessDeniedDescription')}</p>
```

### Step 4: Refactor INSTRUCTION_SECTIONS to Use Translation Keys

Transform the constant to reference translation keys instead of hardcoded strings:

```typescript
// Define section IDs for iteration
const SECTION_IDS = [
  'gettingStarted',
  'propertyManagement',
  'itemCreation',
  'qrCodes',
  'itemManagement'
] as const;

// Map icons to section IDs
const SECTION_ICONS = {
  gettingStarted: PlusCircle,
  propertyManagement: Building2,
  itemCreation: Package,
  qrCodes: QrCode,
  itemManagement: Settings,
};

// Step configurations for each section
const SECTION_STEPS = {
  gettingStarted: ['step1', 'step2', 'step3'],
  propertyManagement: ['addingProperty', 'editingProperty', 'propertyItems'],
  itemCreation: ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'],
  qrCodes: ['automaticGeneration', 'printing', 'placement', 'testing'],
  itemManagement: ['viewingItems', 'editingItems', 'multipleInstructions', 'bulkOperations'],
};
```

### Step 5: Update InstructionCard Component

Pass translation function and use translated content:

```typescript
function InstructionCard({
  sectionId,
  t
}: {
  sectionId: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = SECTION_ICONS[sectionId];
  const sectionT = (key: string) => t(`sections.${sectionId}.${key}`);

  return (
    <div className="...">
      <button onClick={() => setIsExpanded(!isExpanded)} className="...">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#FFEEEF]">
            <Icon className="w-5 h-5 text-[#FF385C]" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-gray-900">
              {sectionT('title')}
            </h2>
            <p className="text-sm text-gray-500">
              {sectionT('description')}
            </p>
          </div>
        </div>
        {/* ... chevron */}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          {SECTION_STEPS[sectionId].map((stepKey, index) => (
            <InstructionStep
              key={stepKey}
              sectionId={sectionId}
              stepKey={stepKey}
              stepNumber={sectionId === 'itemCreation' || sectionId === 'gettingStarted' ? index + 1 : undefined}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 6: Create InstructionStep Component

Extract step rendering for cleaner translation access:

```typescript
function InstructionStep({
  sectionId,
  stepKey,
  stepNumber,
  t
}: {
  sectionId: string;
  stepKey: string;
  stepNumber?: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const stepT = (key: string) => t(`sections.${sectionId}.${stepKey}${key}`);
  const hasTitle = t.has(`sections.${sectionId}.${stepKey}Title`);
  const hasTip = t.has(`sections.${sectionId}.${stepKey}Tip`);
  const hasLink = STEP_LINKS[`${sectionId}.${stepKey}`];

  return (
    <div className="pl-4 border-l-2 border-[#FF385C]/20 hover:border-[#FF385C] transition-colors">
      <div className="flex items-start gap-3">
        {stepNumber !== undefined && (
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF385C] text-white text-sm font-medium flex items-center justify-center">
            {stepNumber}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">
            {hasTitle ? stepT('Title') : t(`sections.${sectionId}.${stepKey}`)}
          </h3>
          <p className="text-gray-600 mt-1">
            {stepT('Content')}
          </p>
          {hasTip && (
            <p className="text-sm text-[#00A699] mt-2 flex items-start gap-1">
              <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t('tip', { tip: stepT('Tip') })}</span>
            </p>
          )}
          {hasLink && (
            <Link
              href={hasLink.href}
              className="inline-flex items-center gap-1 text-sm text-[#FF385C] hover:text-[#E31C5F] mt-2 font-medium"
            >
              {t(`links.${hasLink.labelKey}`)}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Step 7: Update Quick Links Section

```typescript
<div className="mb-8 p-4 bg-[#FFEEEF] rounded-xl">
  <h2 className="text-sm font-semibold text-[#FF385C] mb-3">
    {t('quickLinks')}
  </h2>
  <div className="flex flex-wrap gap-2">
    {SECTION_IDS.map((sectionId) => (
      <a
        key={sectionId}
        href={`#section-${sectionId}`}
        className="px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
      >
        {t(`sections.${sectionId}.title`)}
      </a>
    ))}
  </div>
</div>
```

### Step 8: Update Footer Section

```typescript
<div className="mt-8 p-6 bg-gray-50 rounded-xl text-center">
  <h2 className="text-lg font-semibold text-gray-900 mb-2">
    {t('stillNeedHelp')}
  </h2>
  <p className="text-gray-600 mb-4">
    {t('stillNeedHelpDescription')}
  </p>
  <a
    href="mailto:support@faqbnb.com"
    className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
  >
    {t('contactSupport')}
  </a>
</div>
```

### Step 9: Add Missing Translation Keys

Ensure the following keys exist in `settings.help` namespace for UI states:

```json
{
  "settings": {
    "help": {
      "loading": "Loading...",
      "authRequired": "Authentication Required",
      "authRequiredDescription": "Please log in to access help.",
      "goToLogin": "Go to Login",
      "accessDenied": "Access Denied",
      "accessDeniedDescription": "You do not have permission to view this page.",
      "backToDashboard": "Back to Dashboard"
    }
  }
}
```

## Authorized Files and Functions for Modification

### Files to Modify

#### `/src/app/dashboard2/help/page.tsx`

- **Purpose**: Help and User Guide page component
- **Current State**: Contains ~100+ hardcoded English strings across page header, 5 instruction sections, 22 steps, tips, links, and UI states
- **Modification Required**: Replace all hardcoded strings with `useTranslations('settings.help')` hook references
- **Changes**:
  - Add `useTranslations` import from `next-intl`
  - Refactor `INSTRUCTION_SECTIONS` constant to use translation key references
  - Update `InstructionCard` component to accept translation function
  - Create new `InstructionStep` component for cleaner translation access
  - Update page header section with translation keys
  - Update quick links section with translation keys
  - Update footer support section with translation keys
  - Update loading, auth required, and access denied states

**Lines to Modify:**

| Line Range | Current Content | Change Description |
|------------|----------------|-------------------|
| 1-26 | File header and imports | Add `useTranslations` import |
| 75-233 | `INSTRUCTION_SECTIONS` constant | Refactor to use translation key references |
| 239-312 | `InstructionCard` component | Accept `t` prop, use translation keys |
| 318-436 | `HelpPage` component | Add hook, update all text references |

**Functions to Modify:**

| Function | Line | Change |
|----------|------|--------|
| `InstructionCard` | 239 | Accept `t` prop, translate section title, description, steps |
| `HelpPage` | 318 | Initialize `useTranslations`, update all inline text |

#### `/messages/en.json`

- **Purpose**: English translation source file
- **Current State**: Contains `settings.help` namespace from Task 2G.1
- **Modification Required**: Verify and add any missing keys for UI states
- **Changes**:
  - Add `loading`, `authRequired`, `authRequiredDescription`, `goToLogin`, `accessDenied`, `accessDeniedDescription`, `backToDashboard` keys if missing

**Target Additions:**

```json
{
  "settings": {
    "help": {
      "loading": "Loading...",
      "authRequired": "Authentication Required",
      "authRequiredDescription": "Please log in to access help.",
      "goToLogin": "Go to Login",
      "accessDenied": "Access Denied",
      "accessDeniedDescription": "You do not have permission to view this page.",
      "backToDashboard": "Back to Dashboard"
    }
  }
}
```

#### `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

- **Purpose**: Non-English translation files
- **Modification Required**: Add same new keys (English placeholder values initially)
- **Note**: Actual translations will be generated in Task 2G.6

### Files NOT to Modify

- `/src/lib/i18n/config.ts` - No changes needed
- `/src/lib/i18n/index.ts` - No changes needed
- `/src/app/layout.tsx` - IntlProvider already configured
- Other dashboard components - Out of scope for this task
- TypeScript type definitions - Interface definitions remain unchanged

## Technical Specifications

### Translation Hook Setup

```typescript
import { useTranslations } from 'next-intl';

export default function HelpPage() {
  const t = useTranslations('settings.help');

  // Access nested keys
  const sectionTitle = t('sections.gettingStarted.title');

  // Variable interpolation
  const tipText = t('tip', { tip: 'Some helpful tip' });
}
```

### Preserving Accessibility

All `aria-label`, `aria-expanded`, `aria-controls`, and `role` attributes must be preserved:

```typescript
<button
  onClick={() => setIsExpanded(!isExpanded)}
  aria-expanded={isExpanded}
  aria-controls={`content-${sectionId}`}
>
```

For translatable aria-labels:

```typescript
<div role="main" aria-labelledby="help-title">
  <h1 id="help-title">{t('title')}</h1>
</div>
```

### Link Configuration Mapping

Map step links to translation key references:

```typescript
const STEP_LINKS: Record<string, { href: string; labelKey: string }> = {
  'gettingStarted.step1': { href: '/dashboard2/properties', labelKey: 'goToProperties' },
  'gettingStarted.step2': { href: '/dashboard2/create', labelKey: 'createItem' },
  'propertyManagement.addingProperty': { href: '/dashboard2/properties', labelKey: 'manageProperties' },
  'itemCreation.step1': { href: '/dashboard2/create', labelKey: 'createItem' },
  'qrCodes.printing': { href: '/dashboard2/items', labelKey: 'viewItems' },
  'itemManagement.viewingItems': { href: '/dashboard2/items', labelKey: 'viewItems' },
};
```

## Success Validation Checklist

### Code Quality
- [ ] No hardcoded English strings remain in `/src/app/dashboard2/help/page.tsx`
- [ ] All text references use `t()` or `t('key', { variable })` syntax
- [ ] `useTranslations` hook is properly imported and initialized
- [ ] TypeScript compilation succeeds without errors
- [ ] No lint errors or warnings

### Translation Coverage
- [ ] Page title and subtitle use translation keys
- [ ] All 5 section titles use translation keys
- [ ] All 5 section descriptions use translation keys
- [ ] All 22 step titles use translation keys
- [ ] All 22 step content paragraphs use translation keys
- [ ] All 8 tips use translation keys with variable interpolation
- [ ] All 7 action link labels use translation keys
- [ ] All 5 quick link labels use translation keys
- [ ] Footer section (title, description, button) uses translation keys
- [ ] Loading state message uses translation key
- [ ] Auth required state (title, description, button) uses translation keys
- [ ] Access denied state (title, description, link) uses translation keys

### Functionality
- [ ] Page renders correctly in English
- [ ] All sections expand and collapse properly
- [ ] Quick links navigate to correct sections
- [ ] Action links navigate to correct pages
- [ ] Support email link works correctly
- [ ] Loading, auth required, and access denied states display correctly

### Visual Integrity
- [ ] No layout breaks with English text
- [ ] Responsive behavior maintained on mobile/tablet
- [ ] Icons render correctly alongside translated text
- [ ] Step numbers display correctly for numbered sections

### Build Validation
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes
- [ ] Application renders without runtime errors

## Dependencies

### Required (Already Installed)
- `next-intl` - i18n framework (installed in Epic 1)
- `react` - React framework
- `next` - Next.js framework
- `lucide-react` - Icon library

### No New Dependencies Required

This task only modifies existing component code to use the translation system.

## Risk Assessment

- **Risk Level**: Low-Medium
- **Rationale**:
  - Component refactoring required (moderate complexity)
  - Many strings to extract (~100+)
  - Logic changes for data structure (instruction sections)
  - No database or API changes

### Potential Issues

| Issue | Likelihood | Impact | Mitigation |
|-------|------------|--------|------------|
| Missing translation keys | Medium | Low | Verify all keys exist before updating component |
| Incorrect key path references | Medium | Medium | Test each section thoroughly after changes |
| Layout breaks with translations | Low | Medium | Test with longer text strings |
| Broken accessibility attributes | Low | High | Preserve all existing aria/role attributes |
| Step numbering issues | Low | Low | Maintain mapping between sections and numbered steps |

## Usage Examples

### Before (Hardcoded)

```typescript
<h1 className="text-2xl font-bold text-gray-900">
  Help & User Guide
</h1>
<p className="text-gray-600 mt-1">
  Learn how to use FAQBNB to create and manage your property items
</p>
```

### After (Translated)

```typescript
const t = useTranslations('settings.help');

<h1 className="text-2xl font-bold text-gray-900">
  {t('title')}
</h1>
<p className="text-gray-600 mt-1">
  {t('subtitle')}
</p>
```

### Section Title Translation

```typescript
// Before
title: 'Getting Started',

// After
{t('sections.gettingStarted.title')}
```

### Tip with Variable Interpolation

```typescript
// Before
<span>Tip: {step.tip}</span>

// After
<span>{t('tip', { tip: t(`sections.${sectionId}.${stepKey}Tip`) })}</span>
```

## String Inventory Summary

| Category | Count | Namespace Path |
|----------|-------|----------------|
| Page header | 2 | `settings.help.title`, `settings.help.subtitle` |
| UI states | 7 | `settings.help.loading`, `settings.help.authRequired`, etc. |
| Quick links header | 1 | `settings.help.quickLinks` |
| Section titles | 5 | `settings.help.sections.{id}.title` |
| Section descriptions | 5 | `settings.help.sections.{id}.description` |
| Step titles | 22 | `settings.help.sections.{id}.{step}Title` |
| Step content | 22 | `settings.help.sections.{id}.{step}Content` |
| Tips | 8 | `settings.help.sections.{id}.{step}Tip` |
| Action link labels | 4 | `settings.help.links.{key}` |
| Create item button | 1 | `settings.help.createItem` |
| Footer | 3 | `settings.help.stillNeedHelp`, etc. |
| **Total** | **~80-100** | |

## Notes

### Alignment with Plan-111

This implementation follows the guidance in Plan-111, Section "Sub-Epic 2G: Settings & Account", Task 2G.5:
- Uses `settings.help` namespace as specified
- Follows established translation key conventions
- Maintains component structure while extracting strings

### Refactoring Approach

The `INSTRUCTION_SECTIONS` constant array is transformed from containing hardcoded content to referencing translation keys. This approach:
- Keeps the component logic (expand/collapse, rendering) intact
- Separates content from presentation
- Enables full translation support
- Maintains TypeScript type safety

### Future Considerations

- Task 2G.6 will generate actual translations for all 5 non-English languages
- Help content may expand in future; translation key structure supports adding new sections
- Consider creating a dedicated help namespace if content grows significantly

---

*End of Implementation Overview*
