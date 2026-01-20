# REQ-E02-017: Update Help Page with Localized Strings - Detailed Task Breakdown

*Generated: 2026-01-20 03:00:00 UTC*
*Last Modified: 2026-01-20 03:00:00 UTC*

## Document Context

| Field | Value |
|-------|-------|
| **Request ID** | REQ-E02-017 |
| **Title** | Update Help Page with Localized Strings |
| **Type** | Enhancement |
| **Size** | M (Medium) |
| **Epic** | L10N Epic 2 - Static UI Translation |
| **Sub-Epic** | 2G - Settings & Account |
| **Task ID** | 2G.5 |
| **Overview Document** | docs/REQ-E02-017-update-help-page-overview.md |
| **Requirements Document** | docs/gen_requests_epic2.md (Request #17) |
| **Implementation Plan** | docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md |

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 (L10N Foundation - next-intl setup) | Required | Must be complete before starting |
| REQ-E02-013 (Settings namespace structure - Task 2G.1) | Required | Creates the `settings` namespace with `settings.help` sub-namespace |

---

## Pre-Implementation Checklist

Before starting implementation, verify the following:

- [ ] `next-intl` is installed and configured (Epic 1)
- [ ] IntlProvider is wrapped in `/src/app/layout.tsx`
- [ ] `/messages/en.json` exists with `settings.help` namespace structure
- [ ] All 6 language files exist (`en`, `fr`, `es`, `de`, `nl`, `it`)
- [ ] `useTranslations` hook is importable from `next-intl`

---

## Task Breakdown

### Task 1: Verify Settings Help Namespace Exists

**Priority**: P0 (Blocker)
**Effort**: 0.5 story points
**File**: `/messages/en.json`

#### Description
Verify that the `settings.help` namespace exists and contains all required keys. If missing or incomplete, add the required translation keys.

#### Verification Steps

1. Open `/messages/en.json`
2. Verify the `settings.help` namespace exists with the following structure:

```json
{
  "settings": {
    "help": {
      "title": "Help & User Guide",
      "subtitle": "Learn how to use FAQBNB to create and manage your property items",
      "quickLinks": "Quick Links",
      "createItem": "Create Item",
      "stillNeedHelp": "Still Need Help?",
      "stillNeedHelpDescription": "Can't find what you're looking for? Contact our support team for assistance.",
      "contactSupport": "Contact Support",
      "loading": "Loading...",
      "authRequired": "Authentication Required",
      "authRequiredDescription": "Please log in to access help.",
      "goToLogin": "Go to Login",
      "accessDenied": "Access Denied",
      "accessDeniedDescription": "You do not have permission to view this page.",
      "backToDashboard": "Back to Dashboard",
      "tip": "Tip: {tip}",
      "sections": { ... },
      "links": { ... }
    }
  }
}
```

#### Acceptance Criteria
- [ ] `settings.help` namespace exists in `/messages/en.json`
- [ ] All required top-level keys are present
- [ ] All section keys are present (see Task 2)
- [ ] All link keys are present

---

### Task 2: Add Section Translation Keys

**Priority**: P0 (Blocker)
**Effort**: 1 story point
**File**: `/messages/en.json`

#### Description
Add translation keys for all 5 instruction sections including titles, descriptions, and all step content.

#### Keys to Add

```json
{
  "settings": {
    "help": {
      "sections": {
        "gettingStarted": {
          "title": "Getting Started",
          "description": "Learn the basics of setting up your FAQBNB account",
          "step1Title": "Create Your First Property",
          "step1Content": "After signing in, navigate to Properties and click \"Add Property\" to create your first vacation rental or property.",
          "step1Tip": "You can add multiple properties to manage different locations.",
          "step2Title": "Add Items to Your Property",
          "step2Content": "Items are the appliances, amenities, or features guests interact with. Create items for things like coffee makers, thermostats, or TVs.",
          "step3Title": "Add Instructions for Each Item",
          "step3Content": "Each item can have multiple instruction articles: how to use, how to clean, troubleshooting tips, and more."
        },
        "propertyManagement": {
          "title": "Managing Properties",
          "description": "Set up and organize your rental properties",
          "addingPropertyTitle": "Adding a Property",
          "addingPropertyContent": "Click \"Add Property\" from the Properties page. Enter the property name, address, and optional description.",
          "addingPropertyTip": "Use descriptive names like \"Beach House\" or \"Downtown Apartment\" for easy identification.",
          "editingPropertyTitle": "Editing Property Details",
          "editingPropertyContent": "Click on any property card to edit its details, including name, address, and settings.",
          "propertyItemsTitle": "Property-Specific Items",
          "propertyItemsContent": "Items are automatically associated with the property you're currently viewing. Switch properties using the property selector."
        },
        "itemCreation": {
          "title": "Creating Items",
          "description": "Add and document the items in your property",
          "step1Title": "Start the Item Creation Wizard",
          "step1Content": "From the dashboard, click \"Create New Item\" to launch the step-by-step wizard.",
          "step2Title": "Select Room and Item Type",
          "step2Content": "Choose where the item is located (Kitchen, Living Room, etc.) and what type of item it is (Appliance, Electronics, etc.).",
          "step3Title": "Name Your Item",
          "step3Content": "Enter a clear, descriptive name like \"Keurig Coffee Maker\" or \"Samsung Smart TV\". This name appears on the QR code.",
          "step4Title": "Choose Instruction Purpose",
          "step4Content": "Select what type of instructions you're creating: How to Use, How to Clean, Troubleshooting, or Safety Information.",
          "step5Title": "Add Content",
          "step5Content": "Add photos, videos, text instructions, or links to external resources like YouTube tutorials or PDF manuals.",
          "step5Tip": "Photos work best for step-by-step visual guides. Videos are great for complex procedures.",
          "step6Title": "Review and Save",
          "step6Content": "Preview your item and its instructions, then save to generate the QR code."
        },
        "qrCodes": {
          "title": "QR Code Generation",
          "description": "Generate and print QR codes for your items",
          "automaticGenerationTitle": "Automatic QR Code Generation",
          "automaticGenerationContent": "QR codes are generated automatically when you save an item. Each item gets a unique QR code linked to its instruction page.",
          "printingTitle": "Printing QR Codes",
          "printingContent": "From the Items page, select items and use \"Print QR Codes\" to generate printable labels for multiple items at once.",
          "placementTitle": "QR Code Placement",
          "placementContent": "Place QR codes near the item where guests can easily scan them. Common locations: on the appliance, nearby wall, or inside cabinet doors.",
          "placementTip": "Use waterproof labels in kitchens and bathrooms.",
          "testingTitle": "Testing QR Codes",
          "testingContent": "Always test your QR codes with a smartphone before placing them. Scan the code to verify it links to the correct instruction page."
        },
        "itemManagement": {
          "title": "Managing Items",
          "description": "Edit, organize, and maintain your item library",
          "viewingItemsTitle": "Viewing All Items",
          "viewingItemsContent": "The Items page shows all items across your properties. Use filters to narrow by property, room, or item type.",
          "editingItemsTitle": "Editing Items",
          "editingItemsContent": "Click on any item to edit its details, add new instruction articles, or update existing content.",
          "multipleInstructionsTitle": "Adding Multiple Instructions",
          "multipleInstructionsContent": "A single item can have multiple instruction articles. Add separate articles for cleaning, troubleshooting, or special features.",
          "bulkOperationsTitle": "Bulk Operations",
          "bulkOperationsContent": "Select multiple items to perform bulk actions like printing QR codes, moving to a different property, or deleting."
        }
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

#### String Inventory

| Section | Step Keys | Total Strings |
|---------|-----------|---------------|
| gettingStarted | 3 steps | 10 (3 titles + 3 content + 2 tips + 1 title + 1 description) |
| propertyManagement | 3 steps | 9 (3 titles + 3 content + 1 tip + 1 title + 1 description) |
| itemCreation | 6 steps | 15 (6 titles + 6 content + 1 tip + 1 title + 1 description) |
| qrCodes | 4 steps | 11 (4 titles + 4 content + 1 tip + 1 title + 1 description) |
| itemManagement | 4 steps | 10 (4 titles + 4 content + 1 title + 1 description) |
| **Total Section Strings** | | **~55** |

#### Acceptance Criteria
- [ ] All 5 sections have `title` and `description` keys
- [ ] All step titles are extracted with pattern `{stepKey}Title`
- [ ] All step content is extracted with pattern `{stepKey}Content`
- [ ] All tips are extracted with pattern `{stepKey}Tip`
- [ ] All link labels are in `settings.help.links` namespace

---

### Task 3: Add Missing UI State Translation Keys

**Priority**: P0 (Blocker)
**Effort**: 0.5 story points
**File**: `/messages/en.json`

#### Description
Ensure all UI state messages (loading, auth required, access denied) have translation keys.

#### Keys to Verify/Add

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

#### Acceptance Criteria
- [ ] All 7 UI state keys exist in `/messages/en.json`
- [ ] Keys are placed under `settings.help` namespace

---

### Task 4: Add useTranslations Hook to HelpPage Component

**Priority**: P1 (High)
**Effort**: 0.5 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Import and initialize the `useTranslations` hook in the `HelpPage` component.

#### Code Changes

**Location**: Lines 23-40 (imports section)

```typescript
// Add import
import { useTranslations } from 'next-intl';
```

**Location**: Line 318+ (inside HelpPage component, after hooks)

```typescript
export default function HelpPage() {
  const router = useRouter();
  const { user, loading: authLoading, currentAccount } = useAuth();
  const { useCanAccess, isLoading: permissionsLoading } = usePermissions(user, currentAccount);
  const t = useTranslations('settings.help'); // Add this line

  const canViewItems = useCanAccess('view_items');
  // ...
}
```

#### Acceptance Criteria
- [ ] `useTranslations` is imported from `next-intl`
- [ ] `const t = useTranslations('settings.help')` is declared in component
- [ ] No TypeScript errors after adding hook

---

### Task 5: Update Loading State Section

**Priority**: P1 (High)
**Effort**: 0.5 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Replace hardcoded loading state text with translation references.

#### Code Changes

**Location**: Lines 326-335

**Before:**
```tsx
if (authLoading || permissionsLoading) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

**After:**
```tsx
if (authLoading || permissionsLoading) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF385C] mx-auto mb-4" aria-hidden="true" />
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] Loading text uses `{t('loading')}`
- [ ] No hardcoded "Loading..." string remains

---

### Task 6: Update Authentication Required Section

**Priority**: P1 (High)
**Effort**: 0.5 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Replace hardcoded auth required text with translation references.

#### Code Changes

**Location**: Lines 338-351

**Before:**
```tsx
if (!user) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
      <p className="text-gray-600 mb-6">Please log in to access help.</p>
      <button
        onClick={() => router.push('/login')}
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
      >
        Go to Login
      </button>
    </div>
  );
}
```

**After:**
```tsx
if (!user) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('authRequired')}</h2>
      <p className="text-gray-600 mb-6">{t('authRequiredDescription')}</p>
      <button
        onClick={() => router.push('/login')}
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors"
      >
        {t('goToLogin')}
      </button>
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] Title uses `{t('authRequired')}`
- [ ] Description uses `{t('authRequiredDescription')}`
- [ ] Button uses `{t('goToLogin')}`

---

### Task 7: Update Access Denied Section

**Priority**: P1 (High)
**Effort**: 0.5 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Replace hardcoded access denied text with translation references.

#### Code Changes

**Location**: Lines 354-368

**Before:**
```tsx
if (!canViewItems.granted) {
  return (
    <div className="text-center py-12">
      <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
      <Link
        href="/dashboard2"
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors inline-block"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
```

**After:**
```tsx
if (!canViewItems.granted) {
  return (
    <div className="text-center py-12">
      <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('accessDenied')}</h2>
      <p className="text-gray-600 mb-6">{t('accessDeniedDescription')}</p>
      <Link
        href="/dashboard2"
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors inline-block"
      >
        {t('backToDashboard')}
      </Link>
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] Title uses `{t('accessDenied')}`
- [ ] Description uses `{t('accessDeniedDescription')}`
- [ ] Link text uses `{t('backToDashboard')}`

---

### Task 8: Update Page Header Section

**Priority**: P1 (High)
**Effort**: 0.5 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Replace hardcoded page header text with translation references.

#### Code Changes

**Location**: Lines 373-397

**Before:**
```tsx
<div className="mb-8">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-[#FF385C]" aria-hidden="true" />
        <h1 id="help-title" className="text-2xl font-bold text-gray-900">
          Help & User Guide
        </h1>
      </div>
      <p className="text-gray-600 mt-1">
        Learn how to use FAQBNB to create and manage your property items
      </p>
    </div>
    <div className="flex flex-wrap gap-3">
      <Link
        href="/dashboard2/create"
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors flex items-center gap-2"
      >
        <PlusCircle className="w-4 h-4" aria-hidden="true" />
        Create Item
      </Link>
    </div>
  </div>
</div>
```

**After:**
```tsx
<div className="mb-8">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-[#FF385C]" aria-hidden="true" />
        <h1 id="help-title" className="text-2xl font-bold text-gray-900">
          {t('title')}
        </h1>
      </div>
      <p className="text-gray-600 mt-1">
        {t('subtitle')}
      </p>
    </div>
    <div className="flex flex-wrap gap-3">
      <Link
        href="/dashboard2/create"
        className="px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#E31C5F] transition-colors flex items-center gap-2"
      >
        <PlusCircle className="w-4 h-4" aria-hidden="true" />
        {t('createItem')}
      </Link>
    </div>
  </div>
</div>
```

#### Acceptance Criteria
- [ ] Page title uses `{t('title')}`
- [ ] Page subtitle uses `{t('subtitle')}`
- [ ] Create Item button uses `{t('createItem')}`

---

### Task 9: Update Quick Links Section

**Priority**: P1 (High)
**Effort**: 0.5 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Replace hardcoded quick links text with translation references.

#### Code Changes

**Location**: Lines 399-413

**Before:**
```tsx
<div className="mb-8 p-4 bg-[#FFEEEF] rounded-xl">
  <h2 className="text-sm font-semibold text-[#FF385C] mb-3">Quick Links</h2>
  <div className="flex flex-wrap gap-2">
    {INSTRUCTION_SECTIONS.map((section) => (
      <a
        key={section.id}
        href={`#section-${section.id}`}
        className="px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
      >
        {section.title}
      </a>
    ))}
  </div>
</div>
```

**After:**
```tsx
<div className="mb-8 p-4 bg-[#FFEEEF] rounded-xl">
  <h2 className="text-sm font-semibold text-[#FF385C] mb-3">{t('quickLinks')}</h2>
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

#### Acceptance Criteria
- [ ] "Quick Links" heading uses `{t('quickLinks')}`
- [ ] Section titles in quick links use `{t(\`sections.${sectionId}.title\`)}`

---

### Task 10: Update Footer Support Section

**Priority**: P1 (High)
**Effort**: 0.5 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Replace hardcoded footer text with translation references.

#### Code Changes

**Location**: Lines 422-434

**Before:**
```tsx
<div className="mt-8 p-6 bg-gray-50 rounded-xl text-center">
  <h2 className="text-lg font-semibold text-gray-900 mb-2">Still Need Help?</h2>
  <p className="text-gray-600 mb-4">
    Can&apos;t find what you&apos;re looking for? Contact our support team for assistance.
  </p>
  <a
    href="mailto:support@faqbnb.com"
    className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
  >
    Contact Support
  </a>
</div>
```

**After:**
```tsx
<div className="mt-8 p-6 bg-gray-50 rounded-xl text-center">
  <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('stillNeedHelp')}</h2>
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

#### Acceptance Criteria
- [ ] Title uses `{t('stillNeedHelp')}`
- [ ] Description uses `{t('stillNeedHelpDescription')}`
- [ ] Button text uses `{t('contactSupport')}`

---

### Task 11: Refactor INSTRUCTION_SECTIONS Constant

**Priority**: P1 (High)
**Effort**: 2 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Refactor the `INSTRUCTION_SECTIONS` constant to use section IDs instead of hardcoded content. The actual content will be retrieved via translation keys.

#### Code Changes

**Location**: Lines 75-233 (replace entire constant)

**Add new constants:**

```typescript
// Section IDs for iteration
const SECTION_IDS = [
  'gettingStarted',
  'propertyManagement',
  'itemCreation',
  'qrCodes',
  'itemManagement',
] as const;

type SectionId = (typeof SECTION_IDS)[number];

// Map icons to section IDs
const SECTION_ICONS: Record<SectionId, React.ComponentType<{ className?: string }>> = {
  gettingStarted: PlusCircle,
  propertyManagement: Building2,
  itemCreation: Package,
  qrCodes: QrCode,
  itemManagement: Settings,
};

// Step configurations for each section (keys within the section, not numbered steps)
const SECTION_STEPS: Record<SectionId, { key: string; hasNumber?: boolean }[]> = {
  gettingStarted: [
    { key: 'step1', hasNumber: true },
    { key: 'step2', hasNumber: true },
    { key: 'step3', hasNumber: true },
  ],
  propertyManagement: [
    { key: 'addingProperty' },
    { key: 'editingProperty' },
    { key: 'propertyItems' },
  ],
  itemCreation: [
    { key: 'step1', hasNumber: true },
    { key: 'step2', hasNumber: true },
    { key: 'step3', hasNumber: true },
    { key: 'step4', hasNumber: true },
    { key: 'step5', hasNumber: true },
    { key: 'step6', hasNumber: true },
  ],
  qrCodes: [
    { key: 'automaticGeneration' },
    { key: 'printing' },
    { key: 'placement' },
    { key: 'testing' },
  ],
  itemManagement: [
    { key: 'viewingItems' },
    { key: 'editingItems' },
    { key: 'multipleInstructions' },
    { key: 'bulkOperations' },
  ],
};

// Link configurations for steps that have action links
const STEP_LINKS: Record<string, { href: string; labelKey: string }> = {
  'gettingStarted.step1': { href: '/dashboard2/properties', labelKey: 'goToProperties' },
  'gettingStarted.step2': { href: '/dashboard2/create', labelKey: 'createItem' },
  'propertyManagement.addingProperty': { href: '/dashboard2/properties', labelKey: 'manageProperties' },
  'itemCreation.step1': { href: '/dashboard2/create', labelKey: 'createItem' },
  'qrCodes.printing': { href: '/dashboard2/items', labelKey: 'viewItems' },
  'itemManagement.viewingItems': { href: '/dashboard2/items', labelKey: 'viewItems' },
};
```

**Remove the old `INSTRUCTION_SECTIONS` constant entirely.**

#### Acceptance Criteria
- [ ] `SECTION_IDS` array is defined
- [ ] `SECTION_ICONS` mapping is defined
- [ ] `SECTION_STEPS` mapping is defined with step keys
- [ ] `STEP_LINKS` mapping is defined
- [ ] Old `INSTRUCTION_SECTIONS` constant is removed
- [ ] TypeScript compiles without errors

---

### Task 12: Update InstructionCard Component

**Priority**: P1 (High)
**Effort**: 1.5 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Refactor the `InstructionCard` component to accept section ID and translation function, rendering content from translation keys.

#### Code Changes

**Location**: Lines 239-312 (replace entire component)

**New component signature and implementation:**

```tsx
interface InstructionCardProps {
  sectionId: SectionId;
  t: ReturnType<typeof useTranslations>;
}

function InstructionCard({ sectionId, t }: InstructionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const Icon = SECTION_ICONS[sectionId];
  const steps = SECTION_STEPS[sectionId];

  return (
    <div
      id={`section-${sectionId}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden scroll-mt-6"
    >
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`content-${sectionId}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#FFEEEF]">
            <Icon className="w-5 h-5 text-[#FF385C]" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-gray-900">
              {t(`sections.${sectionId}.title`)}
            </h2>
            <p className="text-sm text-gray-500">
              {t(`sections.${sectionId}.description`)}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div id={`content-${sectionId}`} className="px-6 pb-6 space-y-4">
          {steps.map((step, index) => {
            const stepKey = step.key;
            const linkConfig = STEP_LINKS[`${sectionId}.${stepKey}`];
            const titleKey = `sections.${sectionId}.${stepKey}Title`;
            const contentKey = `sections.${sectionId}.${stepKey}Content`;
            const tipKey = `sections.${sectionId}.${stepKey}Tip`;

            // Check if tip exists using t.has() or try-catch
            let hasTip = false;
            try {
              const tipValue = t.raw(tipKey);
              hasTip = tipValue !== tipKey && tipValue !== undefined;
            } catch {
              hasTip = false;
            }

            return (
              <div
                key={stepKey}
                className="pl-4 border-l-2 border-[#FF385C]/20 hover:border-[#FF385C] transition-colors"
              >
                <div className="flex items-start gap-3">
                  {step.hasNumber && (
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF385C] text-white text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">
                      {t(titleKey)}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {t(contentKey)}
                    </p>
                    {hasTip && (
                      <p className="text-sm text-[#00A699] mt-2 flex items-start gap-1">
                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{t('tip', { tip: t(tipKey) })}</span>
                      </p>
                    )}
                    {linkConfig && (
                      <Link
                        href={linkConfig.href}
                        className="inline-flex items-center gap-1 text-sm text-[#FF385C] hover:text-[#E31C5F] mt-2 font-medium"
                      >
                        {t(`links.${linkConfig.labelKey}`)}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

#### Acceptance Criteria
- [ ] Component accepts `sectionId` and `t` props
- [ ] Section title uses `t(\`sections.${sectionId}.title\`)`
- [ ] Section description uses `t(\`sections.${sectionId}.description\`)`
- [ ] Step titles use `t(\`sections.${sectionId}.${stepKey}Title\`)`
- [ ] Step content uses `t(\`sections.${sectionId}.${stepKey}Content\`)`
- [ ] Tips use `t('tip', { tip: t(tipKey) })` pattern
- [ ] Link labels use `t(\`links.${linkConfig.labelKey}\`)`
- [ ] Step numbers display correctly for numbered sections
- [ ] Component renders without errors

---

### Task 13: Update Main Page Rendering

**Priority**: P1 (High)
**Effort**: 0.5 story points
**File**: `/src/app/dashboard2/help/page.tsx`

#### Description
Update the main page rendering to use the refactored `InstructionCard` component with section IDs.

#### Code Changes

**Location**: Lines 415-420

**Before:**
```tsx
<div className="space-y-6">
  {INSTRUCTION_SECTIONS.map((section) => (
    <InstructionCard key={section.id} section={section} />
  ))}
</div>
```

**After:**
```tsx
<div className="space-y-6">
  {SECTION_IDS.map((sectionId) => (
    <InstructionCard key={sectionId} sectionId={sectionId} t={t} />
  ))}
</div>
```

#### Acceptance Criteria
- [ ] Uses `SECTION_IDS` for iteration
- [ ] Passes `sectionId` and `t` to `InstructionCard`
- [ ] All 5 sections render correctly

---

### Task 14: Add Placeholder Translations to Non-English Files

**Priority**: P2 (Medium)
**Effort**: 0.5 story points
**Files**: `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`

#### Description
Copy the English translation keys to all non-English translation files as placeholders. Actual translations will be generated in Task 2G.6.

#### Code Changes

Copy the entire `settings.help` namespace from `en.json` to each non-English file.

#### Acceptance Criteria
- [ ] All 5 non-English files have `settings.help` namespace
- [ ] All keys match the structure in `en.json`
- [ ] Values are English placeholders (to be translated in 2G.6)

---

### Task 15: Build Verification and Testing

**Priority**: P0 (Blocker)
**Effort**: 1 story point
**File**: N/A (Testing task)

#### Description
Verify the build passes and manually test all help page functionality.

#### Verification Steps

1. Run TypeScript compilation:
   ```bash
   npm run build
   ```

2. Run linting:
   ```bash
   npm run lint
   ```

3. Manual testing checklist:
   - [ ] Page loads without errors
   - [ ] All 5 sections display with correct titles and descriptions
   - [ ] All steps display with correct titles and content
   - [ ] Tips display correctly with lightbulb icon
   - [ ] Action links navigate to correct pages
   - [ ] Quick links scroll to correct sections
   - [ ] Expand/collapse functionality works
   - [ ] Loading state displays correctly
   - [ ] Auth required state displays correctly (test by logging out)
   - [ ] Access denied state displays correctly (if applicable)
   - [ ] Footer support section displays correctly
   - [ ] Create Item button works
   - [ ] Contact Support link works (mailto)

4. Responsive testing:
   - [ ] Mobile layout works correctly
   - [ ] Tablet layout works correctly
   - [ ] Desktop layout works correctly

#### Acceptance Criteria
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes without errors
- [ ] All manual tests pass
- [ ] No console errors in browser
- [ ] All accessibility attributes preserved

---

## Summary

### Total Tasks: 15

| Priority | Count |
|----------|-------|
| P0 (Blocker) | 4 |
| P1 (High) | 9 |
| P2 (Medium) | 2 |

### Total Effort: ~10.5 Story Points

| Task | Effort |
|------|--------|
| Task 1: Verify namespace | 0.5 SP |
| Task 2: Add section keys | 1 SP |
| Task 3: Add UI state keys | 0.5 SP |
| Task 4: Add useTranslations hook | 0.5 SP |
| Task 5: Update loading state | 0.5 SP |
| Task 6: Update auth required | 0.5 SP |
| Task 7: Update access denied | 0.5 SP |
| Task 8: Update page header | 0.5 SP |
| Task 9: Update quick links | 0.5 SP |
| Task 10: Update footer | 0.5 SP |
| Task 11: Refactor constants | 2 SP |
| Task 12: Update InstructionCard | 1.5 SP |
| Task 13: Update main rendering | 0.5 SP |
| Task 14: Add placeholders | 0.5 SP |
| Task 15: Build & testing | 1 SP |

### Estimated Total Strings: ~80-100

| Category | Count |
|----------|-------|
| Page header | 3 |
| UI states | 7 |
| Quick links | 1 |
| Section titles | 5 |
| Section descriptions | 5 |
| Step titles | 22 |
| Step content | 22 |
| Tips | 8 |
| Link labels | 4 |
| Footer | 3 |
| **Total** | **~80** |

---

## Files to Modify Summary

| File | Action | Description |
|------|--------|-------------|
| `/messages/en.json` | Modify | Add/verify `settings.help` namespace with all keys |
| `/messages/fr.json` | Modify | Add `settings.help` namespace placeholder |
| `/messages/es.json` | Modify | Add `settings.help` namespace placeholder |
| `/messages/de.json` | Modify | Add `settings.help` namespace placeholder |
| `/messages/nl.json` | Modify | Add `settings.help` namespace placeholder |
| `/messages/it.json` | Modify | Add `settings.help` namespace placeholder |
| `/src/app/dashboard2/help/page.tsx` | Modify | Replace hardcoded strings with translation references |

---

## Success Criteria

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
- [ ] All 4 action link labels use translation keys
- [ ] Quick links header and labels use translation keys
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

---

*End of Detailed Task Breakdown*
