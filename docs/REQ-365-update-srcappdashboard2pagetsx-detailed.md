# REQ-365: Update Dashboard2 Page for Internationalization - Detailed Task Breakdown

**Created:** 2026-01-19 20:15 UTC
**Last Modified:** 2026-01-19 20:15 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.2
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High
**Overview Document:** [REQ-365-update-srcappdashboard2pagetsx-overview.md](./REQ-365-update-srcappdashboard2pagetsx-overview.md)

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for internationalizing the `Dashboard2Page` component located at `/src/app/dashboard2/page.tsx`. This is Task 2B.2 in the L10N Epic 2 implementation plan. The task involves replacing 6 hardcoded English text strings with translation keys from the `dashboard` namespace using the next-intl framework.

**Total Estimated Tasks:** 8
**Component Type:** Client Component (`'use client'` directive)
**Translation Hook:** `useTranslations` from `next-intl`

---

## Prerequisites

Before starting this task, verify the following:

| Prerequisite | Status | Verification Command |
|--------------|--------|---------------------|
| Epic 1 Foundation complete | Required | Check `next-intl` in `package.json` |
| IntlProvider configured | Required | Verify `/src/app/layout.tsx` wraps app |
| Translation files exist | Required | Check `/messages/en.json` exists |
| Dashboard namespace exists | Optional | Task 2B.1 may have created base structure |

---

## String Inventory

The following hardcoded strings must be extracted and translated:

| ID | Line | Current String | Translation Key | Type |
|----|------|----------------|-----------------|------|
| S1 | 121 | `'Property created successfully'` | `dashboard.messages.propertyCreated` | Success notification |
| S2 | 174 | `'Welcome to FAQBNB!'` | `dashboard.welcome.newUser.title` | Empty state title |
| S3 | 175 | `'Get started by adding your first property...'` | `dashboard.welcome.newUser.description` | Empty state description |
| S4 | 176 | `'Add Your First Property'` | `dashboard.welcome.newUser.actionLabel` | CTA button text |
| S5 | 192 | `'Welcome back, {firstName}!'` | `dashboard.welcomeBack` | Welcome heading (interpolated) |
| S6 | 193 | `'Create and manage your QR code items'` | `dashboard.subtitle` | Welcome subtitle |

---

## Implementation Tasks

### Task 1: Add Dashboard Namespace Keys to English Translation File

**File:** `/messages/en.json`
**Estimate:** 1 story point
**Dependencies:** None

#### Description
Add the required translation keys to the `dashboard` namespace in the English translation file. The existing `dashboard` namespace needs to be expanded with the welcome subsection and messages subsection.

#### Step-by-Step Instructions

1. Open `/messages/en.json`
2. Locate the existing `dashboard` object (around line 57)
3. Add the following keys within the `dashboard` object:

#### Code Changes

**Before (existing dashboard namespace):**
```json
"dashboard": {
  "title": "Dashboard",
  "welcome": "Welcome back",
  "properties": "Properties",
  "items": "Items",
  "analytics": "Analytics",
  "settings": "Settings",
  "recentActivity": "Recent Activity",
  "quickActions": "Quick Actions",
  "totalProperties": "Total Properties",
  "totalItems": "Total Items",
  "totalScans": "Total Scans",
  "activeUsers": "Active Users",
  "overview": "Overview",
  "createProperty": "Create Property",
  "createItem": "Create Item",
  "viewAll": "View All",
  "noActivity": "No recent activity"
}
```

**After (expanded dashboard namespace):**
```json
"dashboard": {
  "title": "Dashboard",
  "welcomeBack": "Welcome back, {name}!",
  "subtitle": "Create and manage your QR code items",
  "welcome": "Welcome back",
  "properties": "Properties",
  "items": "Items",
  "analytics": "Analytics",
  "settings": "Settings",
  "recentActivity": "Recent Activity",
  "quickActions": "Quick Actions",
  "totalProperties": "Total Properties",
  "totalItems": "Total Items",
  "totalScans": "Total Scans",
  "activeUsers": "Active Users",
  "overview": "Overview",
  "createProperty": "Create Property",
  "createItem": "Create Item",
  "viewAll": "View All",
  "noActivity": "No recent activity",
  "messages": {
    "propertyCreated": "Property created successfully"
  },
  "welcome": {
    "newUser": {
      "title": "Welcome to FAQBNB!",
      "description": "Get started by adding your first property. Then you can create QR codes to help guests find what they need.",
      "actionLabel": "Add Your First Property"
    }
  }
}
```

**Note:** The `welcome` key appears twice in the example above for illustration. Since the existing file has `"welcome": "Welcome back"` as a string, you need to either:
- Rename the existing `welcome` to `welcomeLabel` if it's used elsewhere, OR
- Convert `welcome` to an object with the `newUser` sub-object

**Recommended approach:** Keep backward compatibility by adding a new nested structure:

```json
"dashboard": {
  "title": "Dashboard",
  "welcomeBack": "Welcome back, {name}!",
  "subtitle": "Create and manage your QR code items",
  "welcomeLabel": "Welcome back",
  "properties": "Properties",
  "items": "Items",
  "analytics": "Analytics",
  "settings": "Settings",
  "recentActivity": "Recent Activity",
  "quickActions": "Quick Actions",
  "totalProperties": "Total Properties",
  "totalItems": "Total Items",
  "totalScans": "Total Scans",
  "activeUsers": "Active Users",
  "overview": "Overview",
  "createProperty": "Create Property",
  "createItem": "Create Item",
  "viewAll": "View All",
  "noActivity": "No recent activity",
  "messages": {
    "propertyCreated": "Property created successfully"
  },
  "newUser": {
    "title": "Welcome to FAQBNB!",
    "description": "Get started by adding your first property. Then you can create QR codes to help guests find what they need.",
    "actionLabel": "Add Your First Property"
  }
}
```

#### Acceptance Criteria for Task 1
- [ ] `dashboard.welcomeBack` key exists with `{name}` placeholder
- [ ] `dashboard.subtitle` key exists
- [ ] `dashboard.messages.propertyCreated` key exists
- [ ] `dashboard.newUser.title` key exists
- [ ] `dashboard.newUser.description` key exists
- [ ] `dashboard.newUser.actionLabel` key exists
- [ ] JSON syntax is valid (no parsing errors)

---

### Task 2: Add Translations to Non-English Language Files

**Files:** `/messages/fr.json`, `/messages/es.json`, `/messages/de.json`, `/messages/nl.json`, `/messages/it.json`
**Estimate:** 1 story point
**Dependencies:** Task 1

#### Description
Add the corresponding translations for the new dashboard keys to all 5 non-English language files.

#### Step-by-Step Instructions

For each non-English language file, add the same key structure with translated values:

#### French (`/messages/fr.json`)
```json
"dashboard": {
  "welcomeBack": "Bon retour, {name} !",
  "subtitle": "Créez et gérez vos éléments QR code",
  "messages": {
    "propertyCreated": "Propriété créée avec succès"
  },
  "newUser": {
    "title": "Bienvenue sur FAQBNB !",
    "description": "Commencez par ajouter votre première propriété. Ensuite, vous pourrez créer des codes QR pour aider vos invités à trouver ce dont ils ont besoin.",
    "actionLabel": "Ajoutez votre première propriété"
  }
}
```

#### Spanish (`/messages/es.json`)
```json
"dashboard": {
  "welcomeBack": "¡Bienvenido de nuevo, {name}!",
  "subtitle": "Crea y administra tus elementos de código QR",
  "messages": {
    "propertyCreated": "Propiedad creada exitosamente"
  },
  "newUser": {
    "title": "¡Bienvenido a FAQBNB!",
    "description": "Comienza agregando tu primera propiedad. Luego podrás crear códigos QR para ayudar a los huéspedes a encontrar lo que necesitan.",
    "actionLabel": "Agrega tu primera propiedad"
  }
}
```

#### German (`/messages/de.json`)
```json
"dashboard": {
  "welcomeBack": "Willkommen zurück, {name}!",
  "subtitle": "Erstellen und verwalten Sie Ihre QR-Code-Elemente",
  "messages": {
    "propertyCreated": "Immobilie erfolgreich erstellt"
  },
  "newUser": {
    "title": "Willkommen bei FAQBNB!",
    "description": "Beginnen Sie mit dem Hinzufügen Ihrer ersten Immobilie. Dann können Sie QR-Codes erstellen, um Gästen zu helfen, das zu finden, was sie brauchen.",
    "actionLabel": "Fügen Sie Ihre erste Immobilie hinzu"
  }
}
```

#### Dutch (`/messages/nl.json`)
```json
"dashboard": {
  "welcomeBack": "Welkom terug, {name}!",
  "subtitle": "Maak en beheer uw QR-code items",
  "messages": {
    "propertyCreated": "Accommodatie succesvol aangemaakt"
  },
  "newUser": {
    "title": "Welkom bij FAQBNB!",
    "description": "Begin met het toevoegen van uw eerste accommodatie. Daarna kunt u QR-codes maken om gasten te helpen vinden wat ze nodig hebben.",
    "actionLabel": "Voeg uw eerste accommodatie toe"
  }
}
```

#### Italian (`/messages/it.json`)
```json
"dashboard": {
  "welcomeBack": "Bentornato, {name}!",
  "subtitle": "Crea e gestisci i tuoi elementi codice QR",
  "messages": {
    "propertyCreated": "Proprietà creata con successo"
  },
  "newUser": {
    "title": "Benvenuto su FAQBNB!",
    "description": "Inizia aggiungendo la tua prima proprietà. Poi potrai creare codici QR per aiutare gli ospiti a trovare ciò di cui hanno bisogno.",
    "actionLabel": "Aggiungi la tua prima proprietà"
  }
}
```

#### Acceptance Criteria for Task 2
- [ ] All 5 non-English files contain the new dashboard keys
- [ ] All placeholder `{name}` is preserved in all languages
- [ ] JSON syntax is valid in all files
- [ ] Key structure matches exactly across all 6 language files

---

### Task 3: Add useTranslations Import to Dashboard2Page

**File:** `/src/app/dashboard2/page.tsx`
**Estimate:** 0.5 story points
**Dependencies:** None

#### Description
Add the `useTranslations` import from `next-intl` to the component imports.

#### Step-by-Step Instructions

1. Open `/src/app/dashboard2/page.tsx`
2. Locate the imports section (lines 21-39)
3. Add the `useTranslations` import after the React imports

#### Code Changes

**Location:** After line 22 (after `import { useRouter } from 'next/navigation';`)

**Add this line:**
```typescript
import { useTranslations } from 'next-intl';
```

**Result (lines 21-24):**
```typescript
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
```

#### Acceptance Criteria for Task 3
- [ ] `useTranslations` is imported from `next-intl`
- [ ] Import is placed with other React/Next.js imports
- [ ] No TypeScript errors on the import statement
- [ ] No duplicate imports

---

### Task 4: Initialize Translation Hook in Component

**File:** `/src/app/dashboard2/page.tsx`
**Estimate:** 0.5 story points
**Dependencies:** Task 3

#### Description
Initialize the `useTranslations` hook with the `dashboard` namespace inside the `Dashboard2Page` component.

#### Step-by-Step Instructions

1. Open `/src/app/dashboard2/page.tsx`
2. Locate the beginning of the `Dashboard2Page` function (line 41)
3. Add the translation hook initialization after the router hook

#### Code Changes

**Location:** After line 42 (after `const router = useRouter();`)

**Add this line:**
```typescript
const t = useTranslations('dashboard');
```

**Result (lines 41-45):**
```typescript
export default function Dashboard2Page() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const { user, getUserProperties, userProperties } = useAuth();
```

#### Acceptance Criteria for Task 4
- [ ] `useTranslations` hook is initialized with `'dashboard'` namespace
- [ ] Hook is placed near the top of the component with other hooks
- [ ] `t` variable is available throughout the component
- [ ] No TypeScript errors

---

### Task 5: Replace Success Message String

**File:** `/src/app/dashboard2/page.tsx`
**Estimate:** 0.5 story points
**Dependencies:** Task 4

#### Description
Replace the hardcoded success message in the `handlePropertyAdded` function with the translation function call.

#### Step-by-Step Instructions

1. Locate the `handlePropertyAdded` function (around line 113)
2. Find the `setSuccessMessage` call (line 121)
3. Replace the hardcoded string with the translation function call

#### Code Changes

**Before (line 121):**
```typescript
setSuccessMessage('Property created successfully');
```

**After:**
```typescript
setSuccessMessage(t('messages.propertyCreated'));
```

#### Full Context (lines 113-124):**
```typescript
// REQ-132: Handler for property creation success
const handlePropertyAdded = async (newProperty: Property) => {
  // Refresh user properties via AuthContext
  await getUserProperties?.();
  // Refresh stats to reflect new property
  refresh();
  // Close the modal
  setAddModalOpen(false);
  // Show success message
  setSuccessMessage(t('messages.propertyCreated'));
  // Clear after 3 seconds
  setTimeout(() => setSuccessMessage(null), 3000);
};
```

#### Acceptance Criteria for Task 5
- [ ] Success message uses `t('messages.propertyCreated')`
- [ ] No hardcoded English string remains
- [ ] Success message displays correctly when property is created
- [ ] TypeScript compiles without errors

---

### Task 6: Replace New User Welcome State Strings

**File:** `/src/app/dashboard2/page.tsx`
**Estimate:** 1 story point
**Dependencies:** Task 4

#### Description
Replace the hardcoded strings in the new user welcome `EmptyStateCard` component with translation function calls.

#### Step-by-Step Instructions

1. Locate the new user welcome state section (around lines 170-180)
2. Replace all three hardcoded props with translation calls

#### Code Changes

**Before (lines 172-179):**
```tsx
<EmptyStateCard
  icon={Home}
  title="Welcome to FAQBNB!"
  description="Get started by adding your first property. Then you can create QR codes to help guests find what they need."
  actionLabel="Add Your First Property"
  onAction={handleAddProperty}
  variant="welcome"
/>
```

**After:**
```tsx
<EmptyStateCard
  icon={Home}
  title={t('newUser.title')}
  description={t('newUser.description')}
  actionLabel={t('newUser.actionLabel')}
  onAction={handleAddProperty}
  variant="welcome"
/>
```

#### Acceptance Criteria for Task 6
- [ ] `title` prop uses `t('newUser.title')`
- [ ] `description` prop uses `t('newUser.description')`
- [ ] `actionLabel` prop uses `t('newUser.actionLabel')`
- [ ] Empty state card renders correctly for new users
- [ ] All text displays in the selected language

---

### Task 7: Replace Welcome Back Section Strings

**File:** `/src/app/dashboard2/page.tsx`
**Estimate:** 1 story point
**Dependencies:** Task 4

#### Description
Replace the hardcoded welcome heading and subtitle with translation function calls, using parameter substitution for the user's first name.

#### Step-by-Step Instructions

1. Locate the welcome section (around lines 184-194)
2. Replace the `h1` content with interpolated translation
3. Replace the `p` content with translation call

#### Code Changes

**Before (lines 192-193):**
```tsx
<h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
<p className="text-white/80 text-lg">Create and manage your QR code items</p>
```

**After:**
```tsx
<h1 className="text-3xl font-bold mb-2">{t('welcomeBack', { name: firstName })}</h1>
<p className="text-white/80 text-lg">{t('subtitle')}</p>
```

#### Full Context (lines 183-194):**
```tsx
{/* Welcome Section with Settings - REQ-140: Responsive padding */}
<div className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative">
  {/* REQ-136: Settings Popover */}
  <div className="absolute top-4 right-4">
    <DashboardSettingsPopover
      preferences={preferences}
      onPreferenceChange={setPreference}
    />
  </div>
  <h1 className="text-3xl font-bold mb-2">{t('welcomeBack', { name: firstName })}</h1>
  <p className="text-white/80 text-lg">{t('subtitle')}</p>
</div>
```

#### Acceptance Criteria for Task 7
- [ ] Welcome heading uses `t('welcomeBack', { name: firstName })`
- [ ] User's first name displays correctly in all languages
- [ ] Subtitle uses `t('subtitle')`
- [ ] Layout and styling remain unchanged
- [ ] Text displays correctly in RTL-friendly manner for future support

---

### Task 8: Verification and Testing

**File:** N/A (Testing)
**Estimate:** 1 story point
**Dependencies:** Tasks 1-7

#### Description
Verify all translations work correctly across all supported languages and ensure no regressions.

#### Testing Checklist

**Functional Testing:**
- [ ] Navigate to `/dashboard2` while logged in
- [ ] Verify welcome message shows user's first name
- [ ] Verify subtitle displays correctly
- [ ] Create a new property and verify success message
- [ ] Log out and create a new user account
- [ ] Verify new user welcome state displays correctly

**Language Testing (repeat for each language):**

| Language | URL Pattern | Expected Behavior |
|----------|-------------|-------------------|
| English | `/en/dashboard2` or default | All text in English |
| French | `/fr/dashboard2` | All text in French |
| Spanish | `/es/dashboard2` | All text in Spanish |
| German | `/de/dashboard2` | All text in German |
| Dutch | `/nl/dashboard2` | All text in Dutch |
| Italian | `/it/dashboard2` | All text in Italian |

**Browser Console Verification:**
- [ ] No missing translation key warnings
- [ ] No React errors or warnings
- [ ] No TypeScript runtime errors

**Visual Regression Testing:**
- [ ] Text fits within containers in all languages
- [ ] German text (longest) doesn't overflow
- [ ] Welcome section maintains layout
- [ ] Empty state card remains centered
- [ ] Success message banner displays correctly

**Accessibility Testing:**
- [ ] Success message `role="status"` is preserved
- [ ] Success message `aria-live="polite"` is preserved
- [ ] Screen reader announces translated content
- [ ] Keyboard navigation still works

#### Acceptance Criteria for Task 8
- [ ] All 6 languages display correct translations
- [ ] No console errors or warnings
- [ ] Layout doesn't break with longer text
- [ ] All interactive elements remain functional
- [ ] Accessibility features are preserved

---

## Files Modified Summary

| File | Changes |
|------|---------|
| `/messages/en.json` | Add 6 new dashboard translation keys |
| `/messages/fr.json` | Add French translations for dashboard keys |
| `/messages/es.json` | Add Spanish translations for dashboard keys |
| `/messages/de.json` | Add German translations for dashboard keys |
| `/messages/nl.json` | Add Dutch translations for dashboard keys |
| `/messages/it.json` | Add Italian translations for dashboard keys |
| `/src/app/dashboard2/page.tsx` | Add import, initialize hook, replace 6 strings |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Translation key typo | Medium | High | Copy-paste keys, TypeScript checking |
| JSON syntax error | Medium | High | Validate JSON after each edit |
| Missing placeholder | Low | Medium | Verify `{name}` in all welcome messages |
| Layout break in German | Medium | Low | Test with longest translations |
| Regression in existing features | Low | Medium | Verify property creation flow end-to-end |

---

## Rollback Plan

If issues are discovered after deployment:

1. Revert translation file changes (restore previous dashboard namespace)
2. Revert component changes (remove import, restore hardcoded strings)
3. The application will fall back to English-only display

---

## Definition of Done

- [ ] All 8 tasks completed
- [ ] All acceptance criteria met
- [ ] Code review passed
- [ ] TypeScript compilation successful
- [ ] All 6 languages tested
- [ ] No console errors or warnings
- [ ] No visual regressions
- [ ] Accessibility preserved
- [ ] Documentation updated (this file marked complete)

---

## References

- [Overview Document](./REQ-365-update-srcappdashboard2pagetsx-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Reference Implementation: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)

---

*Document generated for FAQBNB L10N Epic 2 - Task 2B.2*
*Total Estimated Effort: 6.5 story points*
