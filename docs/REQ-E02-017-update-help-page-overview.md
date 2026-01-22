# Implementation Overview: Update Help Page

## Header
| Field | Value |
|-------|-------|
| Request Reference | REQ-E02-017 |
| Source File | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |
| Original Request Date | Not specified |
| Breakdown Created | 2026-01-22 22:09 |
| Sub-Epic | 2G - Settings & Account |
| Task | 2G.5 |
| T-shirt Size | Medium |
| Estimated Effort | 6-8 hours |
| Status | PENDING |

---

## Executive Summary

This task implements internationalization for the Help & User Guide page in the FAQBNB application. The work involves replacing approximately 50+ hardcoded English strings in the help page with translations from the `settings.help.*` namespace established in Task 2G.1 (REQ-E02-013). The help page contains extensive instructional content organized into 5 major sections with multiple steps each.

**Current State:**
- Help page exists at `/src/app/dashboard2/help/page.tsx` (439 lines, REQ-207)
- Contains 5 instruction sections with ~50+ hardcoded strings
- Sections: Getting Started, Property Management, Item Creation, QR Code Generation, Item Management
- Already imports `useTranslations` from next-intl but only uses 1 key (`common.loading.pages.help`)
- All instruction content is hardcoded in English in `INSTRUCTION_SECTIONS` constant array
- Page-level strings (title, subtitle, buttons, footer) are hardcoded
- Translation namespace `settings.help.*` with ~50-60 keys ready to use (created in Task 2G.1)

**Target State:**
- All hardcoded strings replaced with translations from `settings.help.*`
- Page-level strings use `settings.help.page.*`
- Section metadata uses `settings.help.sections.*`
- Instruction content uses section-specific namespaces (e.g., `settings.help.gettingStarted.*`)
- Maintain existing component structure and styling
- Use `useTranslations` hook properly for all text

**Scope:**
- ~50-60 translation keys from `settings.help.*` namespace
- Update 1 existing file (help page)
- Replace hardcoded strings in INSTRUCTION_SECTIONS constant
- Replace hardcoded strings in page component
- No new files to create
- No component restructuring needed

**Out of Scope:**
- Creating new help sections or content (content is finalized)
- Changing help page layout or design
- Adding interactive features (search, feedback)
- Backend help content management system

---

## Goals

### Primary Objectives

1. **Replace Page-Level Hardcoded Strings**
   - Title: "Help & User Guide" → `t('page.title')`
   - Subtitle: "Learn how to use FAQBNB..." → `t('page.subtitle')`
   - Create Item button: "Create Item" → `t('page.createItemButton')`
   - Quick Links title: "Quick Links" → `t('page.quickLinksTitle')`
   - Footer title: "Still Need Help?" → `t('page.footerTitle')`
   - Footer text → `t('page.footerText')`
   - Contact button: "Contact Support" → `t('page.contactButton')`

2. **Replace Section Titles and Descriptions**
   - Use `settings.help.sections.*` for section navigation labels
   - Use section-specific `.title` and `.description` keys for section headers
   - Example: `settings.help.gettingStarted.title` instead of hardcoded "Getting Started"

3. **Replace Instruction Step Content**
   - Each section has 3-6 steps with title, content, tip (optional), linkLabel (optional)
   - Map to translation keys: `settings.help.{sectionName}.step{N}.{field}`
   - Example: `settings.help.gettingStarted.step1.title`

4. **Maintain Component Structure**
   - Keep existing `INSTRUCTION_SECTIONS` array structure
   - Keep `InstructionSection` and `InstructionStep` TypeScript interfaces
   - Keep `InstructionCard` component unchanged
   - Only change string values to translation function calls

5. **Use Translation Hooks Properly**
   - Single `useTranslations('settings.help')` hook at top of component
   - Access nested keys with dot notation: `t('page.title')`, `t('gettingStarted.step1.title')`

### Success Criteria

- ✅ All visible strings use translations from `settings.help.*`
- ✅ No hardcoded English strings remain in help page
- ✅ Page displays correctly with translated content
- ✅ All 5 instruction sections work properly
- ✅ Links still navigate correctly
- ✅ Expand/collapse functionality maintained
- ✅ TypeScript compilation succeeds with no errors
- ✅ Page styling and layout unchanged

---

## Technical Context

### Translation Namespace: `settings.help`

Available keys (from `/messages/en.json` lines 3509-3621):

**Page-Level Keys (8 keys):**
```json
{
  "settings": {
    "help": {
      "page": {
        "title": "Help & User Guide",
        "subtitle": "Learn how to use FAQBNB to create and manage your property items",
        "createItemButton": "Create Item",
        "quickLinksTitle": "Quick Links",
        "footerTitle": "Still Need Help?",
        "footerText": "Can't find what you're looking for? Contact our support team for assistance.",
        "contactButton": "Contact Support",
        "loadingAriaLabel": "Loading help content"
      }
    }
  }
}
```

**Section Labels (5 keys):**
```json
{
  "sections": {
    "gettingStarted": "Getting Started",
    "propertyManagement": "Managing Properties",
    "itemCreation": "Creating Items",
    "qrCodes": "QR Code Generation",
    "itemManagement": "Managing Items"
  }
}
```

**Getting Started Section (3 steps, ~9 keys):**
```json
{
  "gettingStarted": {
    "title": "Getting Started",
    "description": "Learn the basics of setting up your FAQBNB account",
    "step1": { "title": "...", "content": "...", "tip": "...", "linkLabel": "..." },
    "step2": { "title": "...", "content": "...", "linkLabel": "..." },
    "step3": { "title": "...", "content": "..." }
  }
}
```

**Property Management Section (3 steps, ~8 keys)**
**Item Creation Section (6 steps, ~16 keys)**
**QR Codes Section (4 steps, ~11 keys)**
**Item Management Section (4 steps, ~8 keys)**

**Total Keys:** ~60 across all sections

### Current Help Page Structure

**File:** `/src/app/dashboard2/help/page.tsx` (439 lines)

**Key Components:**
1. **Type Definitions (lines 49-69):**
   - `InstructionSection` interface
   - `InstructionStep` interface

2. **INSTRUCTION_SECTIONS Constant (lines 75-234):**
   - Array of 5 sections
   - Each section has: id, title, icon, description, steps array
   - All strings are hardcoded English

3. **InstructionCard Component (lines 240-338):**
   - Displays individual instruction section
   - Expand/collapse functionality
   - Renders steps with titles, content, tips, links

4. **Main HelpPage Component (lines 340-439):**
   - Uses `useAuth()` and `usePermissions()` hooks
   - Page header with title, subtitle, Create Item button
   - Quick Links navigation
   - Maps INSTRUCTION_SECTIONS to InstructionCard components
   - Footer with "Still Need Help?" section

**Current Translation Usage:**
- Line 25: `import { useTranslations } from 'next-intl';`
- Line 332: `const t = useTranslations('common.loading');`
- Line 333: `<Loader2 aria-label={t('pages.help')} />`
- **Only 1 translation key currently used!**

### Translation Access Pattern

**Current Code (Line 332):**
```tsx
const t = useTranslations('common.loading');
// Later: t('pages.help')
```

**Target Pattern:**
```tsx
const t = useTranslations('settings.help');
// Access nested keys with dot notation:
// t('page.title')
// t('gettingStarted.step1.title')
// t('gettingStarted.step1.content')
```

**Note:** The `t()` function from next-intl supports nested key access, so `t('page.title')` accesses `settings.help.page.title` in the translation file.

### Component Restructuring NOT Required

**Important:** The component structure should remain largely unchanged. Only string values need to be replaced:

**Before (Hardcoded):**
```tsx
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
      // ...
    ],
  },
  // ...
];
```

**After (Translated):**
```tsx
function HelpPage() {
  const t = useTranslations('settings.help');

  const INSTRUCTION_SECTIONS: InstructionSection[] = [
    {
      id: 'getting-started',
      title: t('gettingStarted.title'),
      icon: PlusCircle,
      description: t('gettingStarted.description'),
      steps: [
        {
          step: 1,
          title: t('gettingStarted.step1.title'),
          content: t('gettingStarted.step1.content'),
          tip: t('gettingStarted.step1.tip'),
          link: { href: '/dashboard2/properties', label: t('gettingStarted.step1.linkLabel') },
        },
        // ...
      ],
    },
    // ...
  ];

  // Rest of component...
}
```

**Critical Change:** Move `INSTRUCTION_SECTIONS` constant **inside** the component so it can access the `t()` function. It currently lives outside the component (lines 75-234) where translation hooks aren't available.

---

## Implementation Plan

### Step 1: Move INSTRUCTION_SECTIONS Inside Component
**Description:** Move the INSTRUCTION_SECTIONS constant array from outside to inside the HelpPage component
**Rationale:** Translation hooks can only be used inside React components
**Estimated Effort:** Small (30 minutes)

**Implementation Details:**
- Cut the `INSTRUCTION_SECTIONS` constant (lines 75-234)
- Paste it inside the `HelpPage` component function, after the hooks
- Ensure it's defined before being used in the JSX
- Keep the TypeScript interfaces outside the component (they don't need translations)

**Before (lines 75-234):**
```tsx
// Outside component - NO ACCESS TO HOOKS
const INSTRUCTION_SECTIONS: InstructionSection[] = [
  // ...
];

// ...

export default function HelpPage() {
  // Component code
}
```

**After:**
```tsx
// Interfaces stay outside
interface InstructionSection { /* ... */ }
interface InstructionStep { /* ... */ }

export default function HelpPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const t = useTranslations('settings.help'); // NEW

  // Move INSTRUCTION_SECTIONS here
  const INSTRUCTION_SECTIONS: InstructionSection[] = [
    // Translation calls now work!
  ];

  // Rest of component...
}
```

---

### Step 2: Update useTranslations Hook
**Description:** Change translation hook from 'common.loading' to 'settings.help'
**Rationale:** Access the correct namespace for help content
**Estimated Effort:** Small (5 minutes)

**Current Code (line 332):**
```tsx
const t = useTranslations('common.loading');
```

**Updated Code:**
```tsx
const t = useTranslations('settings.help');
```

**Also Update Loading Aria-Label (line 333):**
```tsx
// Before
<Loader2 aria-label={t('pages.help')} />

// After
<Loader2 aria-label={t('page.loadingAriaLabel')} />
```

---

### Step 3: Replace Page-Level Hardcoded Strings
**Description:** Replace title, subtitle, buttons, and footer text with translations
**Rationale:** Internationalize the main page UI elements
**Estimated Effort:** Small (30 minutes)

**Implementation Details:**
Update the following lines in the HelpPage component:

**Line 382: Page Title**
```tsx
// Before
<h1 id="help-title" className="text-2xl font-bold text-gray-900">
  Help & User Guide
</h1>

// After
<h1 id="help-title" className="text-2xl font-bold text-gray-900">
  {t('page.title')}
</h1>
```

**Line 386: Subtitle**
```tsx
// Before
<p className="text-gray-600 mt-1">
  Learn how to use FAQBNB to create and manage your property items
</p>

// After
<p className="text-gray-600 mt-1">
  {t('page.subtitle')}
</p>
```

**Line 395: Create Item Button**
```tsx
// Before
<PlusCircle className="w-4 h-4" aria-hidden="true" />
Create Item

// After
<PlusCircle className="w-4 h-4" aria-hidden="true" />
{t('page.createItemButton')}
```

**Line 403: Quick Links Title**
```tsx
// Before
<h2 className="text-sm font-semibold text-[#FF385C] mb-3">Quick Links</h2>

// After
<h2 className="text-sm font-semibold text-[#FF385C] mb-3">{t('page.quickLinksTitle')}</h2>
```

**Line 426: Footer Title**
```tsx
// Before
<h2 className="text-lg font-semibold text-gray-900 mb-2">Still Need Help?</h2>

// After
<h2 className="text-lg font-semibold text-gray-900 mb-2">{t('page.footerTitle')}</h2>
```

**Line 428: Footer Text**
```tsx
// Before
<p className="text-gray-600 mb-4">
  Can&apos;t find what you&apos;re looking for? Contact our support team for assistance.
</p>

// After
<p className="text-gray-600 mb-4">
  {t('page.footerText')}
</p>
```

**Line 434: Contact Button**
```tsx
// Before
Contact Support

// After
{t('page.contactButton')}
```

---

### Step 4: Replace Getting Started Section Content
**Description:** Replace all strings in the Getting Started instruction section
**Rationale:** First of 5 sections to internationalize
**Estimated Effort:** Small (30 minutes)

**Implementation Details:**
Update the first element of INSTRUCTION_SECTIONS array:

```tsx
{
  id: 'getting-started',
  title: t('gettingStarted.title'),
  icon: PlusCircle,
  description: t('gettingStarted.description'),
  steps: [
    {
      step: 1,
      title: t('gettingStarted.step1.title'),
      content: t('gettingStarted.step1.content'),
      tip: t('gettingStarted.step1.tip'),
      link: { href: '/dashboard2/properties', label: t('gettingStarted.step1.linkLabel') },
    },
    {
      step: 2,
      title: t('gettingStarted.step2.title'),
      content: t('gettingStarted.step2.content'),
      link: { href: '/dashboard2/create', label: t('gettingStarted.step2.linkLabel') },
    },
    {
      step: 3,
      title: t('gettingStarted.step3.title'),
      content: t('gettingStarted.step3.content'),
    },
  ],
},
```

**Keys Used:**
- `gettingStarted.title`
- `gettingStarted.description`
- `gettingStarted.step1.title`, `.content`, `.tip`, `.linkLabel`
- `gettingStarted.step2.title`, `.content`, `.linkLabel`
- `gettingStarted.step3.title`, `.content`

**Total:** 11 keys

---

### Step 5: Replace Property Management Section Content
**Description:** Replace all strings in the Property Management section
**Rationale:** Second section to internationalize
**Estimated Effort:** Small (20 minutes)

**Implementation Details:**
```tsx
{
  id: 'property-management',
  title: t('propertyManagement.title'),
  icon: Building2,
  description: t('propertyManagement.description'),
  steps: [
    {
      title: t('propertyManagement.step1.title'),
      content: t('propertyManagement.step1.content'),
      tip: t('propertyManagement.step1.tip'),
      link: { href: '/dashboard2/properties', label: t('propertyManagement.step1.linkLabel') },
    },
    {
      title: t('propertyManagement.step2.title'),
      content: t('propertyManagement.step2.content'),
    },
    {
      title: t('propertyManagement.step3.title'),
      content: t('propertyManagement.step3.content'),
    },
  ],
},
```

**Keys Used:**
- `propertyManagement.title`
- `propertyManagement.description`
- `propertyManagement.step1.title`, `.content`, `.tip`, `.linkLabel`
- `propertyManagement.step2.title`, `.content`
- `propertyManagement.step3.title`, `.content`

**Total:** 10 keys

---

### Step 6: Replace Item Creation Section Content
**Description:** Replace all strings in the Item Creation section (6 steps)
**Rationale:** Largest section with most detailed content
**Estimated Effort:** Medium (30 minutes)

**Implementation Details:**
```tsx
{
  id: 'item-creation',
  title: t('itemCreation.title'),
  icon: Package,
  description: t('itemCreation.description'),
  steps: [
    {
      step: 1,
      title: t('itemCreation.step1.title'),
      content: t('itemCreation.step1.content'),
      link: { href: '/dashboard2/create', label: t('itemCreation.step1.linkLabel') },
    },
    {
      step: 2,
      title: t('itemCreation.step2.title'),
      content: t('itemCreation.step2.content'),
    },
    {
      step: 3,
      title: t('itemCreation.step3.title'),
      content: t('itemCreation.step3.content'),
    },
    {
      step: 4,
      title: t('itemCreation.step4.title'),
      content: t('itemCreation.step4.content'),
    },
    {
      step: 5,
      title: t('itemCreation.step5.title'),
      content: t('itemCreation.step5.content'),
      tip: t('itemCreation.step5.tip'),
    },
    {
      step: 6,
      title: t('itemCreation.step6.title'),
      content: t('itemCreation.step6.content'),
    },
  ],
},
```

**Keys Used:**
- `itemCreation.title`
- `itemCreation.description`
- `itemCreation.step1` through `step6` (title, content, optional tip/linkLabel)

**Total:** 16 keys

---

### Step 7: Replace QR Codes Section Content
**Description:** Replace all strings in the QR Code Generation section
**Rationale:** Fourth section covering QR code features
**Estimated Effort:** Small (20 minutes)

**Implementation Details:**
```tsx
{
  id: 'qr-codes',
  title: t('qrCodes.title'),
  icon: QrCode,
  description: t('qrCodes.description'),
  steps: [
    {
      title: t('qrCodes.step1.title'),
      content: t('qrCodes.step1.content'),
    },
    {
      title: t('qrCodes.step2.title'),
      content: t('qrCodes.step2.content'),
      link: { href: '/dashboard2/items', label: t('qrCodes.step2.linkLabel') },
    },
    {
      title: t('qrCodes.step3.title'),
      content: t('qrCodes.step3.content'),
      tip: t('qrCodes.step3.tip'),
    },
    {
      title: t('qrCodes.step4.title'),
      content: t('qrCodes.step4.content'),
    },
  ],
},
```

**Keys Used:**
- `qrCodes.title`
- `qrCodes.description`
- `qrCodes.step1` through `step4` (title, content, optional tip/linkLabel)

**Total:** 11 keys

---

### Step 8: Replace Item Management Section Content
**Description:** Replace all strings in the Item Management section
**Rationale:** Final section to internationalize
**Estimated Effort:** Small (20 minutes)

**Implementation Details:**
```tsx
{
  id: 'item-management',
  title: t('itemManagement.title'),
  icon: Settings,
  description: t('itemManagement.description'),
  steps: [
    {
      title: t('itemManagement.step1.title'),
      content: t('itemManagement.step1.content'),
      link: { href: '/dashboard2/items', label: t('itemManagement.step1.linkLabel') },
    },
    {
      title: t('itemManagement.step2.title'),
      content: t('itemManagement.step2.content'),
    },
    {
      title: t('itemManagement.step3.title'),
      content: t('itemManagement.step3.content'),
    },
    {
      title: t('itemManagement.step4.title'),
      content: t('itemManagement.step4.content'),
    },
  ],
},
```

**Keys Used:**
- `itemManagement.title`
- `itemManagement.description`
- `itemManagement.step1` through `step4` (title, content, optional linkLabel)

**Total:** 11 keys

---

### Step 9: Testing and Validation
**Description:** Manual testing of help page with translations
**Rationale:** Ensure all translations display correctly
**Estimated Effort:** Medium (1-2 hours)

**Testing Checklist:**
- [ ] Help page loads at `/dashboard2/help`
- [ ] Page title displays translated text
- [ ] Page subtitle displays translated text
- [ ] "Create Item" button displays translated text
- [ ] Quick Links section displays with translated title
- [ ] All 5 section cards display with translated titles
- [ ] Getting Started section displays with all 3 steps translated
- [ ] Property Management section displays with all 3 steps translated
- [ ] Item Creation section displays with all 6 steps translated
- [ ] QR Codes section displays with all 4 steps translated
- [ ] Item Management section displays with all 4 steps translated
- [ ] Tips display correctly where present
- [ ] Link labels display translated text
- [ ] Footer "Still Need Help?" displays translated text
- [ ] Footer description displays translated text
- [ ] "Contact Support" button displays translated text
- [ ] Expand/collapse functionality still works
- [ ] Section navigation (Quick Links) still works
- [ ] No console errors
- [ ] TypeScript compilation succeeds
- [ ] Page styling unchanged

**Translation Validation:**
- [ ] All ~60 keys from `settings.help.*` used
- [ ] No hardcoded English strings remain
- [ ] Verify keys match translation file structure

**Accessibility Testing:**
- [ ] Loading spinner has correct aria-label
- [ ] Headings maintain proper hierarchy
- [ ] Links have descriptive text
- [ ] Page is keyboard navigable

---

## Authorized Files and Functions for Modification

> ⚠️ **APPROVED SCOPE**: Changes outside this list require review

### Existing Files to Modify

| File | Lines | Target | Modification |
|------|-------|--------|--------------|
| `/src/app/dashboard2/help/page.tsx` | 75-234 | `INSTRUCTION_SECTIONS` constant | Move inside component, replace all hardcoded strings with translation calls |
| `/src/app/dashboard2/help/page.tsx` | 332 | `useTranslations` hook call | Change from `'common.loading'` to `'settings.help'` |
| `/src/app/dashboard2/help/page.tsx` | 333 | Loading aria-label | Change to `t('page.loadingAriaLabel')` |
| `/src/app/dashboard2/help/page.tsx` | 382 | Page title (h1) | Replace with `{t('page.title')}` |
| `/src/app/dashboard2/help/page.tsx` | 386 | Page subtitle | Replace with `{t('page.subtitle')}` |
| `/src/app/dashboard2/help/page.tsx` | 395 | Create Item button text | Replace with `{t('page.createItemButton')}` |
| `/src/app/dashboard2/help/page.tsx` | 403 | Quick Links title | Replace with `{t('page.quickLinksTitle')}` |
| `/src/app/dashboard2/help/page.tsx` | 426 | Footer title | Replace with `{t('page.footerTitle')}` |
| `/src/app/dashboard2/help/page.tsx` | 428 | Footer text | Replace with `{t('page.footerText')}` |
| `/src/app/dashboard2/help/page.tsx` | 434 | Contact button text | Replace with `{t('page.contactButton')}` |

### Translation Files (Reference Only)

| File | Lines | Purpose | Modification |
|------|-------|---------|--------------|
| `/messages/en.json` | 3509-3621 | Help page translations | Reference only (already created in Task 2G.1) |
| `/messages/fr.json` | ~3509-3621 | French placeholders | Reference (translations in Task 2G.6) |
| `/messages/es.json` | ~3509-3621 | Spanish placeholders | Reference (translations in Task 2G.6) |
| `/messages/de.json` | ~3509-3621 | German placeholders | Reference (translations in Task 2G.6) |
| `/messages/nl.json` | ~3509-3621 | Dutch placeholders | Reference (translations in Task 2G.6) |
| `/messages/it.json` | ~3509-3621 | Italian placeholders | Reference (translations in Task 2G.6) |

---

## Dependencies

### Depends On (Completed First)

- **REQ-E02-013** (Task 2G.1): Create `settings` namespace structure
  - **Status:** MUST be completed first
  - **Provides:** `settings.help.*` translation keys (~60 keys)
  - **Reason:** Cannot use translations that don't exist yet

- **Epic 1 - L10N Foundation**
  - **Status:** Completed
  - **Provides:** next-intl setup, useTranslations hook, translation file structure
  - **Reason:** Core i18n infrastructure required

### Blocks (Requires This First)

- **REQ-E02-089** (Task 2G.6): Generate translations for 5 non-English languages
  - **Status:** Blocked until this task completes
  - **Reason:** Need to see help page in context before translating
  - **Files:** All non-English translation files

### Parallel Safety

**Files Modified by This Task:**
- `/src/app/dashboard2/help/page.tsx` (existing file)

**Conflicts With:**
- **NONE** - Help page is isolated, no other tasks modify it

**Safe to Parallelize With:**
- Task 2G.2 (Account settings) - Different file
- Task 2G.3 (Profile) - Different file
- Task 2G.4 (Preferences) - Different file
- **All other Sub-Epic 2G tasks** - No file overlap

**Recommendation:** This task can run in parallel with Tasks 2G.2, 2G.3, and 2G.4 safely.

### External Dependencies

- **next-intl library** - Translation hook (`useTranslations`)
- **React** - Component structure
- **Next.js App Router** - Page routing
- **lucide-react** - Icon components (unchanged)

---

## Risks and Considerations

### Potential Side Effects

1. **Moving INSTRUCTION_SECTIONS Inside Component**
   - **Risk:** May cause component re-render issues if not memoized
   - **Mitigation:** The array is created on each render but content is stable (translation keys are static)
   - **Impact:** Low (unlikely to cause performance issues)

2. **Translation Key Typos**
   - **Risk:** Typo in translation key causes missing text
   - **Mitigation:** Careful review, systematic replacement following translation file structure
   - **Impact:** Medium (caught during testing)

3. **Long Translated Text Breaking Layout**
   - **Risk:** Some languages (German) have longer text that may break layout
   - **Mitigation:** Test with longest language, ensure flex layouts handle variable text length
   - **Impact:** Low (current layout is flexible)

4. **Section Navigation Breaking**
   - **Risk:** Quick Links navigation relies on section IDs, not titles
   - **Mitigation:** Section IDs remain unchanged (e.g., 'getting-started'), only titles translate
   - **Impact:** Very Low (IDs unchanged)

### Testing Requirements

1. **Translation Display Testing**
   - Verify all 5 sections display with correct translated content
   - Check all steps within sections (20 steps total)
   - Verify tips and link labels translate correctly
   - Test page-level strings (title, subtitle, buttons, footer)

2. **Functionality Testing**
   - Test expand/collapse for each section
   - Test Quick Links navigation (jumps to sections)
   - Test all "link" buttons navigate correctly
   - Test Create Item button in header

3. **Layout Testing**
   - Verify sections display correctly
   - Check responsive design (mobile, tablet, desktop)
   - Ensure long text doesn't break layout
   - Test with browser zoom (accessibility)

4. **Translation Coverage Testing**
   - Manually verify all ~60 keys used
   - Search for remaining hardcoded strings
   - Check console for missing translation warnings

5. **Accessibility Testing**
   - Verify screen readers announce content correctly
   - Test keyboard navigation
   - Check heading hierarchy (h1, h2)
   - Verify loading spinner aria-label

### Open Questions

1. **Section Icons**
   - [ ] Should icon components remain hardcoded or be configurable?
   - **Recommendation:** Keep icons hardcoded (visual elements, not translatable)

2. **Link URLs**
   - [ ] Should link href values remain hardcoded?
   - **Recommendation:** Yes, URLs don't change based on language (internal routing)

3. **Email Address in Footer**
   - [ ] Should support email address be translatable or hardcoded?
   - **Current:** Hardcoded as `mailto:support@faqbnb.com` in href
   - **Recommendation:** Keep hardcoded (email address doesn't change)

4. **Step Numbers**
   - [ ] Are step numbers (1, 2, 3...) translatable or always numeric?
   - **Current:** Numeric step property in TypeScript
   - **Recommendation:** Keep numeric (universal)

---

## Out of Scope

The following items are explicitly **NOT** included in this task:

### Content Changes
- Adding new help sections or topics
- Removing existing help sections
- Changing the order of sections
- Modifying instruction content (content is finalized)
- Adding images or videos to instructions

### Feature Additions
- Search functionality for help content
- Feedback system ("Was this helpful?")
- Related articles suggestions
- Print-friendly version
- Bookmark/favorite help topics
- Help article versioning

### Layout Changes
- Redesigning help page layout
- Changing section card styling
- Modifying expand/collapse UI
- Adding breadcrumbs or navigation
- Changing responsive breakpoints

### Advanced Features
- Backend help content management system
- Dynamic help content from database
- User-specific help recommendations
- Analytics tracking (which help topics viewed)
- Interactive tutorials or walkthroughs

### Multi-Language Translation
- French translations - Task 2G.6
- Spanish translations - Task 2G.6
- German translations - Task 2G.6
- Dutch translations - Task 2G.6
- Italian translations - Task 2G.6

---

## Success Metrics

### Quantitative Metrics

1. **Translation Coverage**
   - Target: 100% of help page strings use translations
   - Measurement: Manual inspection, no hardcoded English strings

2. **Translation Key Usage**
   - Target: Use all ~60 keys from `settings.help.*`
   - Measurement: Count translation calls vs. available keys

3. **TypeScript Compilation**
   - Target: 0 compilation errors
   - Measurement: `npm run typecheck` exit code

4. **Component Re-renders**
   - Target: < 3 re-renders on page load
   - Measurement: React DevTools profiler

5. **Page Load Performance**
   - Target: No performance regression
   - Measurement: Lighthouse performance score

### Qualitative Metrics

1. **Code Quality**
   - Translation calls follow consistent pattern
   - Proper TypeScript typing maintained
   - Code remains readable and maintainable
   - Comments updated to reflect changes

2. **Content Quality**
   - All instructions display correctly
   - Text flows naturally (no awkward phrasing from translation keys)
   - Tips and link labels make sense in context
   - No missing or truncated content

3. **User Experience**
   - Help page functions identically to before
   - All interactions work (expand/collapse, navigation, links)
   - Page loads quickly
   - Content is easy to read and understand

4. **Accessibility**
   - Screen readers announce content correctly
   - Keyboard navigation works
   - Semantic HTML structure maintained
   - ARIA labels present where needed

---

## Notes and Context

### Design Rationale

1. **Why Move INSTRUCTION_SECTIONS Inside Component?**
   - Translation hooks can only be used inside React components
   - Constant defined outside component can't access `t()` function
   - Alternative would be complex: create separate translation utility or pass `t` as prop
   - Moving inside component is simplest, most maintainable approach

2. **Why Not Restructure Component?**
   - Current structure works well and is well-tested (REQ-207)
   - Only content needs translation, not component architecture
   - Minimizes risk of breaking existing functionality
   - Easier to review (only string replacements)

3. **Why Use Single Translation Namespace?**
   - All help content under one namespace (`settings.help`)
   - Makes it easy to find all help-related translations
   - Follows established pattern from other settings pages
   - Nested structure keeps keys organized (e.g., `gettingStarted.step1.title`)

4. **Why Not Use Component-Level Translation Loading?**
   - Next-intl loads all translations client-side anyway
   - Splitting into separate files wouldn't improve performance
   - Simpler to have all help content in one namespace
   - Easier for translators to work with complete content

### Historical Context

- **REQ-207 (2026-01-12):** Help page created with hardcoded content
- **Page moved** from `/dashboard2/instructions` to `/dashboard2/help` on 2026-01-12
- **Epic 1 (L10N Foundation):** Established next-intl setup
- **Sub-Epics 2A-2F:** Translated 260+ components
- **Task 2G.1 (REQ-E02-013):** Created settings namespace with help content structure
- **Current Task (2G.5):** Replace hardcoded strings with translations

### Future Considerations

1. **Dynamic Help Content**
   - Store help content in database (Supabase)
   - Allow admin users to edit help content
   - Version control for help articles
   - A/B testing different instruction approaches

2. **Enhanced Features**
   - Search functionality (fuzzy search across all help content)
   - "Was this helpful?" feedback system
   - Related articles suggestions
   - Video tutorials embedded in instructions
   - Interactive walkthroughs (step-by-step wizards)

3. **User-Specific Help**
   - Personalized help recommendations based on user actions
   - Context-sensitive help (show relevant help in each page)
   - Progress tracking (which help topics user has viewed)
   - Onboarding checklist integration

4. **Analytics and Optimization**
   - Track which help topics are most viewed
   - Identify where users get stuck (high view count topics)
   - Optimize instruction content based on data
   - Add help content for commonly asked support questions

### Related Documentation

- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md (lines 1099-1171)
- **Sub-Epic 2G Overview:** REQ-E02-013 (Task 2G.1)
- **Original Help Page Request:** REQ-207 (Phase 4, Task 4.3)
- **Help Page Detailed Spec:** docs/REQ-207-create-instructions-page-detailed.md
- **Translation Files:** `/messages/*.json`

---

## Appendix

### A. Complete Key Mapping

**Page-Level Keys (8):**
- `page.title` → "Help & User Guide"
- `page.subtitle` → "Learn how to use FAQBNB..."
- `page.createItemButton` → "Create Item"
- `page.quickLinksTitle` → "Quick Links"
- `page.footerTitle` → "Still Need Help?"
- `page.footerText` → "Can't find what you're looking for?..."
- `page.contactButton` → "Contact Support"
- `page.loadingAriaLabel` → "Loading help content"

**Section Labels (5):**
- `sections.gettingStarted` → "Getting Started"
- `sections.propertyManagement` → "Managing Properties"
- `sections.itemCreation` → "Creating Items"
- `sections.qrCodes` → "QR Code Generation"
- `sections.itemManagement` → "Managing Items"

**Getting Started (11 keys):**
- title, description
- step1: title, content, tip, linkLabel
- step2: title, content, linkLabel
- step3: title, content

**Property Management (10 keys):**
- title, description
- step1: title, content, tip, linkLabel
- step2: title, content
- step3: title, content

**Item Creation (16 keys):**
- title, description
- step1: title, content, linkLabel
- step2-4: title, content
- step5: title, content, tip
- step6: title, content

**QR Codes (11 keys):**
- title, description
- step1: title, content
- step2: title, content, linkLabel
- step3: title, content, tip
- step4: title, content

**Item Management (11 keys):**
- title, description
- step1: title, content, linkLabel
- step2-4: title, content

**Total:** ~60 keys

### B. Translation Call Pattern

**Accessing Nested Keys:**
```tsx
const t = useTranslations('settings.help');

// Page level
t('page.title')            // settings.help.page.title
t('page.subtitle')         // settings.help.page.subtitle

// Section content
t('gettingStarted.title')         // settings.help.gettingStarted.title
t('gettingStarted.step1.title')   // settings.help.gettingStarted.step1.title
t('gettingStarted.step1.content') // settings.help.gettingStarted.step1.content

// Deep nesting with dot notation
t('itemCreation.step5.tip')       // settings.help.itemCreation.step5.tip
```

### C. Example Before/After Comparison

**Before (Hardcoded):**
```tsx
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
        content: 'After signing in, navigate to Properties and click "Add Property" to create your first vacation rental or property.',
        tip: 'You can add multiple properties to manage different locations.',
        link: { href: '/dashboard2/properties', label: 'Go to Properties' },
      },
    ],
  },
];
```

**After (Translated):**
```tsx
export default function HelpPage() {
  const t = useTranslations('settings.help');

  const INSTRUCTION_SECTIONS: InstructionSection[] = [
    {
      id: 'getting-started',
      title: t('gettingStarted.title'),
      icon: PlusCircle,
      description: t('gettingStarted.description'),
      steps: [
        {
          step: 1,
          title: t('gettingStarted.step1.title'),
          content: t('gettingStarted.step1.content'),
          tip: t('gettingStarted.step1.tip'),
          link: { href: '/dashboard2/properties', label: t('gettingStarted.step1.linkLabel') },
        },
      ],
    },
  ];

  // Rest of component...
}
```

---

**End of Document**

---

*Document generated: 2026-01-22 22:09*
