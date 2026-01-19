# REQ-365: Update Dashboard2 Page for Internationalization

**Created:** 2026-01-19 18:30 UTC
**Last Modified:** 2026-01-19 18:30 UTC
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2B - Dashboard & Navigation
**Task ID:** 2B.2
**Request Type:** ENHANCEMENT
**Size:** M (Medium)
**Priority:** P1 - High

---

## Overview

This document provides the implementation breakdown for internationalizing the `Dashboard2Page` component (`/src/app/dashboard2/page.tsx`). This is Task 2B.2 in the L10N Epic 2 implementation plan, which focuses on replacing all hardcoded English text strings with translation keys from the `dashboard` namespace using the next-intl framework.

The Dashboard2Page is the main landing page for authenticated users and contains approximately 15-20 user-facing strings that need to be extracted and translated, including welcome messages, success notifications, empty states, and action descriptions.

---

## Current State Analysis

### Component Location
`/src/app/dashboard2/page.tsx`

### Component Type
- **Client Component** (`'use client'` directive)
- Uses `useTranslations` hook from `next-intl` (not `getTranslations`)

### Existing Dependencies
```typescript
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Home } from 'lucide-react';
import {
  ActionButtons,
  PropertyEditModal,
  AddPropertyModal,
  ProgressiveStatisticsSection,
  AdvancedDashboardTools,
  DashboardSettingsPopover,
  EmptyStateCard,
} from '@/components/SimpleDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardTier } from '@/hooks/useDashboardTier';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { Property } from '@/types';
import { GroupingOption } from '@/components/SimpleDashboard/PropertyGroupingControl';
import { usePropertyContext } from '@/hooks/usePropertyContext';
```

### Hardcoded Strings Inventory

| Line(s) | Current String | Proposed Translation Key | Notes |
|---------|----------------|-------------------------|-------|
| 121 | `'Property created successfully'` | `dashboard.messages.propertyCreated` | Success message shown after property creation |
| 174 | `'Welcome to FAQBNB!'` | `dashboard.empty.newUserWelcome` | Title for new user empty state |
| 175-176 | `'Get started by adding your first property...'` | `dashboard.empty.newUserDescription` | Description for new user empty state |
| 177 | `'Add Your First Property'` | `dashboard.empty.addFirstProperty` | CTA button for new user state |
| 192 | `'Welcome back, {firstName}!'` | `dashboard.welcomeBack` | Welcome message with interpolated name |
| 193 | `'Create and manage your QR code items'` | `dashboard.subtitle` | Subtitle under welcome message |

---

## Implementation Approach

### Pattern Reference
Follow the pattern established in `LogoutButton.tsx`:
```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  return <h1>{t('title')}</h1>;
}
```

### Translation Namespace Structure
The `dashboard` namespace in `/messages/en.json` needs to be expanded with the following structure:

```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcomeBack": "Welcome back, {name}!",
    "subtitle": "Create and manage your QR code items",
    "messages": {
      "propertyCreated": "Property created successfully"
    },
    "empty": {
      "newUserWelcome": "Welcome to FAQBNB!",
      "newUserDescription": "Get started by adding your first property. Then you can create QR codes to help guests find what they need.",
      "addFirstProperty": "Add Your First Property"
    }
  }
}
```

---

## Authorized Files and Functions for Modification

### Primary File
| File Path | Modification Scope |
|-----------|-------------------|
| `/src/app/dashboard2/page.tsx` | Add import, replace all hardcoded strings with `t()` calls |

### Translation Files
| File Path | Modification Scope |
|-----------|-------------------|
| `/messages/en.json` | Add/update `dashboard` namespace entries |
| `/messages/fr.json` | Add French translations for `dashboard` |
| `/messages/es.json` | Add Spanish translations for `dashboard` |
| `/messages/de.json` | Add German translations for `dashboard` |
| `/messages/nl.json` | Add Dutch translations for `dashboard` |
| `/messages/it.json` | Add Italian translations for `dashboard` |

### Functions to Modify
| Function/Component | Location | Changes |
|-------------------|----------|---------|
| `Dashboard2Page` | Lines 41-243 | Add `useTranslations` hook, replace strings |
| `handlePropertyAdded` | Lines 113-124 | Replace hardcoded success message |
| New user welcome state render | Lines 170-180 | Replace hardcoded welcome text |
| Welcome section render | Lines 182-194 | Replace hardcoded welcome back text |

---

## Implementation Tasks

### Task 1: Update Translation Files
**Estimate:** Small
**Description:** Add the required translation keys to all 6 language files.

**Steps:**
1. Open `/messages/en.json`
2. Expand the `dashboard` namespace with all identified strings
3. Use ICU format for the welcome message: `{name}`
4. Copy structure to other language files and translate

**English Translations:**
```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcomeBack": "Welcome back, {name}!",
    "subtitle": "Create and manage your QR code items",
    "messages": {
      "propertyCreated": "Property created successfully"
    },
    "empty": {
      "newUserWelcome": "Welcome to FAQBNB!",
      "newUserDescription": "Get started by adding your first property. Then you can create QR codes to help guests find what they need.",
      "addFirstProperty": "Add Your First Property"
    }
  }
}
```

### Task 2: Add useTranslations Import
**Estimate:** Trivial
**Description:** Add the next-intl import to Dashboard2Page.

**Code Change:**
```typescript
// Add to existing imports (around line 7)
import { useTranslations } from 'next-intl';
```

### Task 3: Initialize Translation Hook
**Estimate:** Trivial
**Description:** Add translation hook initialization inside the component.

**Code Change (after line 43):**
```typescript
const t = useTranslations('dashboard');
```

### Task 4: Update Success Message in handlePropertyAdded
**Estimate:** Trivial
**Description:** Replace hardcoded success message with translation call.

**Location:** Lines 113-124

**Before:**
```typescript
// Show success message
setSuccessMessage('Property created successfully');
```

**After:**
```typescript
// Show success message
setSuccessMessage(t('messages.propertyCreated'));
```

### Task 5: Update New User Welcome State
**Estimate:** Small
**Description:** Replace hardcoded new user welcome text with translations.

**Location:** Lines 170-180

**Before:**
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
  title={t('empty.newUserWelcome')}
  description={t('empty.newUserDescription')}
  actionLabel={t('empty.addFirstProperty')}
  onAction={handleAddProperty}
  variant="welcome"
/>
```

### Task 6: Update Welcome Back Section
**Estimate:** Small
**Description:** Replace hardcoded welcome back text with translations.

**Location:** Lines 184-194

**Before:**
```tsx
<h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}!</h1>
<p className="text-white/80 text-lg">Create and manage your QR code items</p>
```

**After:**
```tsx
<h1 className="text-3xl font-bold mb-2">{t('welcomeBack', { name: firstName })}</h1>
<p className="text-white/80 text-lg">{t('subtitle')}</p>
```

---

## Dependencies

### Required Before Implementation
- [x] Epic 1 Foundation complete (next-intl installed, IntlProvider configured)
- [ ] Task 2B.1: Create `dashboard` namespace structure (should be complete or done in parallel)

### Components This Affects
- None directly - Dashboard2Page passes translated strings as props to child components

### Components That Depend on This
- None - Dashboard2Page is a page component

### Child Components That Should Also Be Updated
The following components receive text props from Dashboard2Page and may need their own i18n updates in separate tasks:
- `EmptyStateCard` - Receives translated `title`, `description`, `actionLabel` as props
- `ProgressiveStatisticsSection` - May have its own internal strings
- `AdvancedDashboardTools` - May have its own internal strings
- `ActionButtons` - May have its own internal strings
- `DashboardSettingsPopover` - May have its own internal strings

---

## Testing Requirements

### Manual Testing Checklist
- [ ] Page loads without errors in English (default)
- [ ] All text displays correctly in each of the 6 languages
- [ ] Welcome message displays the user's name correctly with interpolation
- [ ] New user empty state shows translated content
- [ ] Property creation success message appears translated
- [ ] No console errors related to missing translations
- [ ] Text does not overflow or break layout in longer languages (German, French)

### Accessibility Verification
- [ ] Success message maintains `role="status"` and `aria-live="polite"`
- [ ] Screen reader announces translated content correctly
- [ ] All interactive elements maintain proper ARIA labels

### Language Switch Testing
- [ ] Switching language updates all translated strings immediately
- [ ] Welcome message interpolation works in all languages
- [ ] Success message shows in the correct language after property creation

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys | Low | Medium | Build-time check with next-intl |
| Text overflow in other languages | Medium | Low | German text is ~30% longer - verify layout |
| Welcome name interpolation failure | Low | Medium | Test with various name formats |
| Success message timing issues | Low | Low | Message uses existing state mechanism |

---

## Acceptance Criteria Verification

| Criterion | Implementation Task |
|-----------|---------------------|
| All hardcoded text strings identified and catalogued | String Inventory table above |
| Welcome message uses translation with name interpolation | Task 6 |
| Subtitle text uses translation key | Task 6 |
| Success message uses translation key | Task 4 |
| New user empty state title translated | Task 5 |
| New user empty state description translated | Task 5 |
| New user CTA button text translated | Task 5 |
| Component imports useTranslations | Task 2 |
| Dashboard functions correctly | Testing Requirements |
| Existing styling maintained | No CSS changes required |
| Accessibility attributes maintained | Existing `role` and `aria` attributes preserved |

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Existing Pattern: LogoutButton.tsx](/src/components/LogoutButton.tsx)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [Translation Files](/messages/en.json)

---

## Appendix: Complete String Extraction Map

```
Dashboard2Page.tsx String Extraction

┌─────────────────────────────────────────────────────────────────┐
│ SUCCESS MESSAGE (line 121)                                       │
├─────────────────────────────────────────────────────────────────┤
│ • "Property created successfully"                               │
│   → t('messages.propertyCreated')                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW USER EMPTY STATE (lines 170-180)                            │
├─────────────────────────────────────────────────────────────────┤
│ • "Welcome to FAQBNB!"                                          │
│   → t('empty.newUserWelcome')                                   │
│ • "Get started by adding your first property..."                │
│   → t('empty.newUserDescription')                               │
│ • "Add Your First Property"                                     │
│   → t('empty.addFirstProperty')                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ WELCOME SECTION (lines 184-194)                                 │
├─────────────────────────────────────────────────────────────────┤
│ • "Welcome back, {firstName}!"                                  │
│   → t('welcomeBack', { name: firstName })                       │
│ • "Create and manage your QR code items"                        │
│   → t('subtitle')                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Appendix: Sample Translations

### French (`/messages/fr.json`)
```json
{
  "dashboard": {
    "welcomeBack": "Bon retour, {name} !",
    "subtitle": "Créez et gérez vos éléments QR code",
    "messages": {
      "propertyCreated": "Propriété créée avec succès"
    },
    "empty": {
      "newUserWelcome": "Bienvenue sur FAQBNB !",
      "newUserDescription": "Commencez par ajouter votre première propriété. Ensuite, vous pourrez créer des codes QR pour aider vos invités à trouver ce dont ils ont besoin.",
      "addFirstProperty": "Ajoutez votre première propriété"
    }
  }
}
```

### German (`/messages/de.json`)
```json
{
  "dashboard": {
    "welcomeBack": "Willkommen zurück, {name}!",
    "subtitle": "Erstellen und verwalten Sie Ihre QR-Code-Elemente",
    "messages": {
      "propertyCreated": "Immobilie erfolgreich erstellt"
    },
    "empty": {
      "newUserWelcome": "Willkommen bei FAQBNB!",
      "newUserDescription": "Beginnen Sie mit dem Hinzufügen Ihrer ersten Immobilie. Dann können Sie QR-Codes erstellen, um Gästen zu helfen, das zu finden, was sie brauchen.",
      "addFirstProperty": "Fügen Sie Ihre erste Immobilie hinzu"
    }
  }
}
```

### Spanish (`/messages/es.json`)
```json
{
  "dashboard": {
    "welcomeBack": "¡Bienvenido de nuevo, {name}!",
    "subtitle": "Crea y administra tus elementos de código QR",
    "messages": {
      "propertyCreated": "Propiedad creada exitosamente"
    },
    "empty": {
      "newUserWelcome": "¡Bienvenido a FAQBNB!",
      "newUserDescription": "Comienza agregando tu primera propiedad. Luego podrás crear códigos QR para ayudar a los huéspedes a encontrar lo que necesitan.",
      "addFirstProperty": "Agrega tu primera propiedad"
    }
  }
}
```

---

*Document generated for FAQBNB L10N Epic 2 - Task 2B.2*
