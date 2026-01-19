# REQ-343: Extract Loading State Messages - Detailed Task Breakdown

## Document Metadata

| Field | Value |
|-------|-------|
| **Document ID** | REQ-343-detailed |
| **Request ID** | REQ-343 |
| **Title** | Extract Loading State Messages for Internationalization |
| **Epic** | L10N Epic 2 - Static UI Translation |
| **Sub-Epic** | 2H - Common & Shared Components |
| **Task ID** | 2H.7 |
| **Size** | M (Medium) |
| **Overview Document** | REQ-343-extract-loading-state-messages-overview.md |
| **Implementation Plan** | Plan-111-L10N-Epic2-Static-UI-Translation.md |
| **Created** | 2026-01-19 |
| **Last Modified** | 2026-01-19 |

---

## Executive Summary

This document provides granular, implementation-ready tasks for extracting all hardcoded loading state messages from the FAQBNB application and replacing them with translation keys using next-intl. The task covers approximately 30+ components containing loading indicators, skeleton loaders, progress messages, and async operation feedback. Each task is designed to be completable within 1 story point and includes specific file paths, code patterns, and acceptance criteria.

---

## Prerequisites

Before starting implementation, verify the following are complete:

- [ ] Epic 1 Foundation complete (next-intl installed, IntlProvider configured)
- [ ] Translation files exist at `/messages/en.json`, `/messages/fr.json`, etc.
- [ ] `useTranslations` hook working for client components
- [ ] `getTranslations` function working for server components
- [ ] Common namespace structure exists in translation files

---

## Translation Namespace Structure

All loading state messages will be added to the `common` namespace with the following structure:

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

---

## Task Breakdown

### Phase 1: Translation File Updates

#### Task 1.1: Add Loading State Keys to English Translation File

**File:** `/messages/en.json`

**Current State:**
The `common` namespace exists but lacks comprehensive loading state keys. Currently only has `"loading": "Loading..."` as a single key.

**Changes Required:**
1. Restructure `common.loading` to use nested keys
2. Add all context-specific loading messages
3. Add `common.status` namespace for operation status messages

**Implementation Steps:**

1. Open `/messages/en.json`
2. Replace the simple `"loading"` key with a nested object structure
3. Add the following keys under `common.loading`:
   ```json
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
   }
   ```
4. Add `common.status` namespace:
   ```json
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
   ```

**Acceptance Criteria:**
- [ ] All loading keys added to `common.loading` namespace
- [ ] All status keys added to `common.status` namespace
- [ ] JSON is valid and properly formatted
- [ ] No duplicate keys exist

**Estimated Effort:** 0.5 story points

---

#### Task 1.2: Propagate Loading Translations to French

**File:** `/messages/fr.json`

**Implementation Steps:**
1. Add French translations for all `common.loading` keys
2. Add French translations for all `common.status` keys

**Translations to Add:**
```json
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
  "savingPropertyChanges": "Enregistrement des modifications...",
  "submitting": "Soumission...",
  "processing": "Traitement...",
  "fetching": "Recuperation des donnees...",
  "uploading": "Telechargement...",
  "completingAuth": "Finalisation de l'authentification..."
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json have corresponding fr.json entries
- [ ] Translations are grammatically correct French
- [ ] JSON is valid and properly formatted

**Estimated Effort:** 0.5 story points

---

#### Task 1.3: Propagate Loading Translations to Spanish

**File:** `/messages/es.json`

**Translations to Add:**
```json
"loading": {
  "default": "Cargando...",
  "pleaseWait": "Por favor espere...",
  "content": "Cargando contenido",
  "items": "Cargando articulos",
  "properties": "Cargando propiedades",
  "statistics": "Cargando estadisticas",
  "guides": "Cargando guias",
  "portfolioSummary": "Cargando resumen del portafolio",
  "engagementIndicator": "Cargando indicador de interaccion",
  "viewCount": "Cargando contador de vistas",
  "reactions": "Cargando reacciones",
  "contentPreview": "Cargando vista previa del contenido",
  "preview": "Cargando vista previa...",
  "editor": "Cargando editor",
  "pdfPreview": "Cargando vista previa del PDF",
  "pdf": "Cargando PDF...",
  "authentication": "Cargando autenticacion...",
  "dashboard": "Cargando panel de control...",
  "permissions": "Cargando permisos...",
  "item": "Cargando articulo...",
  "screenReaderWait": "{context}, por favor espere..."
},
"status": {
  "saving": "Guardando...",
  "savingProperty": "Guardando propiedad",
  "savingPropertyChanges": "Guardando cambios de la propiedad...",
  "submitting": "Enviando...",
  "processing": "Procesando...",
  "fetching": "Obteniendo datos...",
  "uploading": "Subiendo...",
  "completingAuth": "Completando autenticacion..."
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json have corresponding es.json entries
- [ ] Translations are grammatically correct Spanish
- [ ] JSON is valid and properly formatted

**Estimated Effort:** 0.5 story points

---

#### Task 1.4: Propagate Loading Translations to German

**File:** `/messages/de.json`

**Translations to Add:**
```json
"loading": {
  "default": "Laden...",
  "pleaseWait": "Bitte warten...",
  "content": "Inhalt wird geladen",
  "items": "Artikel werden geladen",
  "properties": "Eigenschaften werden geladen",
  "statistics": "Statistiken werden geladen",
  "guides": "Anleitungen werden geladen",
  "portfolioSummary": "Portfolio-Zusammenfassung wird geladen",
  "engagementIndicator": "Engagement-Anzeige wird geladen",
  "viewCount": "Anzahl der Aufrufe wird geladen",
  "reactions": "Reaktionen werden geladen",
  "contentPreview": "Inhaltsvorschau wird geladen",
  "preview": "Vorschau wird geladen...",
  "editor": "Editor wird geladen",
  "pdfPreview": "PDF-Vorschau wird geladen",
  "pdf": "PDF wird geladen...",
  "authentication": "Authentifizierung wird geladen...",
  "dashboard": "Dashboard wird geladen...",
  "permissions": "Berechtigungen werden geladen...",
  "item": "Artikel wird geladen...",
  "screenReaderWait": "{context}, bitte warten..."
},
"status": {
  "saving": "Speichern...",
  "savingProperty": "Eigenschaft wird gespeichert",
  "savingPropertyChanges": "Eigenschaftsanderungen werden gespeichert...",
  "submitting": "Wird gesendet...",
  "processing": "Verarbeitung...",
  "fetching": "Daten werden abgerufen...",
  "uploading": "Wird hochgeladen...",
  "completingAuth": "Authentifizierung wird abgeschlossen..."
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json have corresponding de.json entries
- [ ] Translations are grammatically correct German
- [ ] JSON is valid and properly formatted

**Estimated Effort:** 0.5 story points

---

#### Task 1.5: Propagate Loading Translations to Dutch

**File:** `/messages/nl.json`

**Translations to Add:**
```json
"loading": {
  "default": "Laden...",
  "pleaseWait": "Even geduld...",
  "content": "Inhoud laden",
  "items": "Artikelen laden",
  "properties": "Eigenschappen laden",
  "statistics": "Statistieken laden",
  "guides": "Handleidingen laden",
  "portfolioSummary": "Portfoliosamenvatting laden",
  "engagementIndicator": "Betrokkenheidsindicator laden",
  "viewCount": "Weergavetelling laden",
  "reactions": "Reacties laden",
  "contentPreview": "Inhoudsvoorbeeld laden",
  "preview": "Voorbeeld laden...",
  "editor": "Editor laden",
  "pdfPreview": "PDF-voorbeeld laden",
  "pdf": "PDF laden...",
  "authentication": "Authenticatie laden...",
  "dashboard": "Dashboard laden...",
  "permissions": "Machtigingen laden...",
  "item": "Artikel laden...",
  "screenReaderWait": "{context}, even geduld..."
},
"status": {
  "saving": "Opslaan...",
  "savingProperty": "Eigenschap opslaan",
  "savingPropertyChanges": "Eigenschap wijzigingen opslaan...",
  "submitting": "Verzenden...",
  "processing": "Verwerken...",
  "fetching": "Gegevens ophalen...",
  "uploading": "Uploaden...",
  "completingAuth": "Authenticatie voltooien..."
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json have corresponding nl.json entries
- [ ] Translations are grammatically correct Dutch
- [ ] JSON is valid and properly formatted

**Estimated Effort:** 0.5 story points

---

#### Task 1.6: Propagate Loading Translations to Italian

**File:** `/messages/it.json`

**Translations to Add:**
```json
"loading": {
  "default": "Caricamento...",
  "pleaseWait": "Attendere prego...",
  "content": "Caricamento contenuto",
  "items": "Caricamento articoli",
  "properties": "Caricamento proprieta",
  "statistics": "Caricamento statistiche",
  "guides": "Caricamento guide",
  "portfolioSummary": "Caricamento riepilogo portfolio",
  "engagementIndicator": "Caricamento indicatore di coinvolgimento",
  "viewCount": "Caricamento conteggio visualizzazioni",
  "reactions": "Caricamento reazioni",
  "contentPreview": "Caricamento anteprima contenuto",
  "preview": "Caricamento anteprima...",
  "editor": "Caricamento editor",
  "pdfPreview": "Caricamento anteprima PDF",
  "pdf": "Caricamento PDF...",
  "authentication": "Caricamento autenticazione...",
  "dashboard": "Caricamento dashboard...",
  "permissions": "Caricamento permessi...",
  "item": "Caricamento articolo...",
  "screenReaderWait": "{context}, attendere prego..."
},
"status": {
  "saving": "Salvataggio...",
  "savingProperty": "Salvataggio proprieta",
  "savingPropertyChanges": "Salvataggio modifiche proprieta...",
  "submitting": "Invio...",
  "processing": "Elaborazione...",
  "fetching": "Recupero dati...",
  "uploading": "Caricamento...",
  "completingAuth": "Completamento autenticazione..."
}
```

**Acceptance Criteria:**
- [ ] All keys from en.json have corresponding it.json entries
- [ ] Translations are grammatically correct Italian
- [ ] JSON is valid and properly formatted

**Estimated Effort:** 0.5 story points

---

### Phase 2: Core Loading Components

#### Task 2.1: Update LoadingIndicator Component

**File:** `/src/components/SimpleDashboard/LoadingIndicator.tsx`

**Current State (lines 60-86):**
```typescript
export function LoadingIndicator({
  size = 'md',
  label = 'Loading',  // Hardcoded default
  color = 'brand',
  className,
}: LoadingIndicatorProps) {
  // ...
  return (
    <span ...>
      <Loader2 ... />
      <span className="sr-only">{label}</span>  // Uses prop
    </span>
  );
}
```

**Changes Required:**
1. The component accepts a `label` prop, so callers will pass translated labels
2. Update JSDoc to document that label should be translated by caller
3. Component itself doesn't need `useTranslations` as it receives translated label via props

**Implementation Steps:**
1. Update the JSDoc comment to indicate `label` should be pre-translated
2. Keep existing implementation - it's already i18n-ready via props
3. Verify all callers of this component pass translated labels

**Code Pattern for Callers:**
```typescript
// Callers should use:
import { useTranslations } from 'next-intl';
const t = useTranslations('common.loading');
<LoadingIndicator label={t('default')} />
```

**Acceptance Criteria:**
- [ ] JSDoc updated to document translation requirements
- [ ] Default label value remains for backwards compatibility
- [ ] All callers identified for subsequent tasks

**Estimated Effort:** 0.25 story points

---

#### Task 2.2: Update SkeletonBase Component

**File:** `/src/components/SimpleDashboard/skeletons/SkeletonBase.tsx`

**Current State (to be verified):**
Component likely has hardcoded `aria-label` or label prop default.

**Implementation Steps:**
1. Read the file to identify hardcoded strings
2. If component has default label, document that callers must provide translated labels
3. Update any hardcoded aria-labels

**Acceptance Criteria:**
- [ ] All hardcoded loading text replaced with translation keys or prop-based
- [ ] Accessibility labels are translatable
- [ ] Component documentation updated

**Estimated Effort:** 0.5 story points

---

#### Task 2.3: Update ItemManager LoadingState Component

**File:** `/src/components/ItemManager/components/shared/LoadingState.tsx`

**Current State (lines 109-145):**
```typescript
// List view
<div
  role="status"
  aria-label="Loading items"  // Hardcoded
  aria-busy="true"
  ...
>
  <span className="sr-only">Loading items, please wait...</span>  // Hardcoded

// Grid view
<div
  role="status"
  aria-label="Loading items"  // Hardcoded
  aria-busy="true"
  ...
>
  <span className="sr-only">Loading items, please wait...</span>  // Hardcoded
```

**Changes Required:**
1. Import `useTranslations` from next-intl
2. Add translations hook for `common.loading`
3. Replace hardcoded `aria-label` with translated value
4. Replace hardcoded sr-only text with translated value using interpolation

**Implementation Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hook inside component: `const t = useTranslations('common.loading');`
3. Replace `aria-label="Loading items"` with `aria-label={t('items')}`
4. Replace `<span className="sr-only">Loading items, please wait...</span>` with `<span className="sr-only">{t('screenReaderWait', { context: t('items') })}</span>`

**After Code (list view example):**
```typescript
'use client';

import { useTranslations } from 'next-intl';
// ... other imports

export function LoadingState({
  viewMode = 'grid',
  itemCount,
  className,
}: LoadingStateProps) {
  const t = useTranslations('common.loading');
  const count = itemCount ?? (viewMode === 'grid' ? DEFAULT_GRID_COUNT : DEFAULT_LIST_COUNT);

  if (viewMode === 'list') {
    return (
      <div
        role="status"
        aria-label={t('items')}
        aria-busy="true"
        className={cn('animate-pulse space-y-2', className)}
      >
        <span className="sr-only">{t('screenReaderWait', { context: t('items') })}</span>
        {Array.from({ length: count }).map((_, index) => (
          <ListSkeletonRow key={index} />
        ))}
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      role="status"
      aria-label={t('items')}
      aria-busy="true"
      className={cn(
        'animate-pulse grid gap-4',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      <span className="sr-only">{t('screenReaderWait', { context: t('items') })}</span>
      {Array.from({ length: count }).map((_, index) => (
        <GridSkeletonCard key={index} />
      ))}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] `useTranslations` hook imported and used
- [ ] Both aria-label values use translation keys
- [ ] Both sr-only text elements use translation keys with interpolation
- [ ] Component renders correctly in all view modes
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

### Phase 3: Dashboard Components

#### Task 3.1: Update DashboardLayout Component

**File:** `/src/components/DashboardLayout.tsx`

**Current State (lines 173-184):**
```typescript
if (authLoading || permissionsLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">
          {permissionsLoading ? 'Loading permissions...' : 'Loading dashboard...'}  // Hardcoded
        </p>
      </div>
    </div>
  );
}
```

**Changes Required:**
1. Import `useTranslations` from next-intl
2. Add translations hook for `common.loading`
3. Replace hardcoded strings with translation keys

**Implementation Steps:**
1. Add import at top: `import { useTranslations } from 'next-intl';`
2. Add hook inside component (before any early returns): `const t = useTranslations('common.loading');`
3. Replace line 179: `{permissionsLoading ? t('permissions') : t('dashboard')}`

**After Code:**
```typescript
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
// ... other imports

export function DashboardLayout({
  children,
  title = 'FAQBNB Dashboard',
  showAccountSelector = true,
  className = ''
}: DashboardLayoutProps) {
  const t = useTranslations('common.loading');
  // ... existing code ...

  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            {permissionsLoading ? t('permissions') : t('dashboard')}
          </p>
        </div>
      </div>
    );
  }
  // ... rest of component
}
```

**Acceptance Criteria:**
- [ ] `useTranslations` hook imported and used
- [ ] "Loading permissions..." replaced with `t('permissions')`
- [ ] "Loading dashboard..." replaced with `t('dashboard')`
- [ ] Component renders correctly during loading states
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

#### Task 3.2: Update StatisticsCards Component

**File:** `/src/components/SimpleDashboard/StatisticsCards.tsx`

**Expected Changes:**
- Replace loading state SkeletonBase labels with translated values
- Update any loading indicator labels

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` from next-intl
3. Add hook: `const t = useTranslations('common.loading');`
4. Replace hardcoded labels with `t('statistics')`

**Acceptance Criteria:**
- [ ] All loading state labels use translation keys
- [ ] Component displays correctly during loading
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

#### Task 3.3: Update PropertySection Component

**File:** `/src/components/SimpleDashboard/PropertySection.tsx`

**Expected Changes:**
- Replace loading state labels with translated values

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded labels with `t('properties')`

**Acceptance Criteria:**
- [ ] All loading state labels use translation keys
- [ ] Component displays correctly during loading
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

#### Task 3.4: Update PortfolioSummary Component

**File:** `/src/components/SimpleDashboard/PortfolioSummary.tsx`

**Expected Changes:**
- Replace loading state labels with translated values

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded labels with `t('portfolioSummary')`

**Acceptance Criteria:**
- [ ] All loading state labels use translation keys
- [ ] Component displays correctly during loading
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

#### Task 3.5: Update PropertyEditModal Component

**File:** `/src/components/SimpleDashboard/PropertyEditModal.tsx`

**Expected Changes:**
- Replace "Saving..." button text with translated value
- Replace any LoadingIndicator labels

**Implementation Steps:**
1. Read file to identify hardcoded loading/saving strings
2. Import `useTranslations` and add hook for both `common.loading` and `common.status`
3. Replace "Saving..." with `tStatus('saving')` or `tStatus('savingPropertyChanges')`
4. Replace LoadingIndicator labels with translated values

**Code Pattern:**
```typescript
const tLoading = useTranslations('common.loading');
const tStatus = useTranslations('common.status');

// In JSX:
<button disabled={saving}>
  {saving ? tStatus('savingPropertyChanges') : t('save')}
</button>
```

**Acceptance Criteria:**
- [ ] Submit button loading text uses translation keys
- [ ] LoadingIndicator labels use translation keys
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

### Phase 4: Auth & Login Components

#### Task 4.1: Update LoginPageContent Component

**File:** `/src/app/login/LoginPageContent.tsx`

**Current State (lines 160-173):**
```typescript
if (shouldShowLoading || (authState === 'LOADING' && !!user)) {
  // ...
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {authState === 'LOADING' ? 'Completing authentication...' : 'Loading authentication...'}  // Hardcoded
        </p>
        // ...
      </div>
    </div>
  );
}
```

**Also line 132-135:**
```typescript
setLoginMessage({
  type: 'info',
  message: 'Completing Google sign-in...',  // Hardcoded
});
```

**Changes Required:**
1. Import `useTranslations` from next-intl
2. Add translations hooks for `common.loading` and `common.status`
3. Replace hardcoded strings with translation keys

**Implementation Steps:**
1. Add import: `import { useTranslations } from 'next-intl';`
2. Add hooks inside component:
   ```typescript
   const tLoading = useTranslations('common.loading');
   const tStatus = useTranslations('common.status');
   ```
3. Replace line 165: `{authState === 'LOADING' ? tStatus('completingAuth') : tLoading('authentication')}`
4. Replace line 133: `message: tStatus('completingAuth'),`

**Acceptance Criteria:**
- [ ] `useTranslations` hooks imported and used
- [ ] Loading state message uses translation keys
- [ ] Google sign-in message uses translation keys
- [ ] Component renders correctly during all auth states
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

### Phase 5: ItemManager & ItemCapture Components

#### Task 5.1: Update VisitCountBadge Component

**File:** `/src/components/ItemManager/components/shared/VisitCountBadge.tsx`

**Expected Changes:**
- Replace loading state aria-label with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded aria-label with `t('viewCount')`

**Acceptance Criteria:**
- [ ] Loading aria-label uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 5.2: Update ReactionSummary Component

**File:** `/src/components/ItemManager/components/shared/ReactionSummary.tsx`

**Expected Changes:**
- Replace loading state aria-label with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded aria-label with `t('reactions')`

**Acceptance Criteria:**
- [ ] Loading aria-label uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 5.3: Update EngagementIndicator Component

**File:** `/src/components/ItemManager/components/shared/EngagementIndicator.tsx`

**Expected Changes:**
- Replace loading state aria-label with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded aria-label with `t('engagementIndicator')`

**Acceptance Criteria:**
- [ ] Loading aria-label uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 5.4: Update PDFViewer Component

**File:** `/src/components/ItemManager/components/ItemPreview/viewers/PDFViewer.tsx`

**Expected Changes:**
- Replace "Loading PDF..." text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace "Loading PDF..." with `t('pdf')`

**Acceptance Criteria:**
- [ ] PDF loading text uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 5.5: Update MediaEditorStep Component

**File:** `/src/components/ItemCapture/components/steps/MediaEditorStep.tsx`

**Expected Changes:**
- Replace loading editor aria-label with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded aria-label with `t('editor')`

**Acceptance Criteria:**
- [ ] Loading aria-label uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 5.6: Update PDFPlaceholder Component

**File:** `/src/components/ItemCapture/components/shared/PDFPlaceholder.tsx`

**Expected Changes:**
- Replace "Loading PDF preview" text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded text with `t('pdfPreview')`

**Acceptance Criteria:**
- [ ] PDF preview loading text uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 5.7: Update TextEditorStep Component

**File:** `/src/components/ItemCapture/components/steps/TextEditorStep.tsx`

**Expected Changes:**
- Replace loading preview aria-label with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded aria-label with `t('preview')`

**Acceptance Criteria:**
- [ ] Loading aria-label uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 5.8: Update ContentPreview Component

**File:** `/src/components/ItemCreationWorkflow/components/shared/ContentPreview.tsx`

**Expected Changes:**
- Replace loading aria-label with translated value
- Replace sr-only text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded aria-label with `t('contentPreview')`
4. Replace sr-only text with `t('screenReaderWait', { context: t('contentPreview') })`

**Acceptance Criteria:**
- [ ] Loading aria-label uses translation key
- [ ] sr-only text uses translation key with interpolation
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

### Phase 6: Page Components

#### Task 6.1: Update Print Property Page

**File:** `/src/app/dashboard2/print/[propertyId]/page.tsx`

**Expected Changes:**
- Update LoadingState component default message prop
- Replace any hardcoded loading text

**Implementation Steps:**
1. Read file to identify loading components and hardcoded strings
2. For server component: use `getTranslations` from 'next-intl/server'
3. Pass translated label to LoadingState or LoadingIndicator components

**Code Pattern (Server Component):**
```typescript
import { getTranslations } from 'next-intl/server';

export default async function PrintPage({ params }: Props) {
  const t = await getTranslations('common.loading');

  // If using LoadingState:
  // <LoadingState ariaLabel={t('properties')} />
}
```

**Acceptance Criteria:**
- [ ] Loading state uses translated label
- [ ] Server component uses `getTranslations`
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

#### Task 6.2: Update Print Index Page

**File:** `/src/app/dashboard2/print/page.tsx`

**Expected Changes:**
- Replace loading properties aria-label with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Use appropriate translations hook/function
3. Replace hardcoded labels with `t('properties')`

**Acceptance Criteria:**
- [ ] Loading aria-label uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 6.3: Update Property Page

**File:** `/src/app/dashboard/properties/[propertyId]/page.tsx`

**Expected Changes:**
- Replace "Loading..." button text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Use appropriate translations hook/function
3. Replace "Loading..." with `t('default')`

**Acceptance Criteria:**
- [ ] Button loading text uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 6.4: Update Admin Property Page

**File:** `/src/app/admin/properties/[propertyId]/page.tsx`

**Expected Changes:**
- Replace "Loading..." button text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Use appropriate translations hook/function
3. Replace "Loading..." with `t('default')`

**Acceptance Criteria:**
- [ ] Button loading text uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 6.5: Update Admin Item Edit Page

**File:** `/src/app/admin/items/[publicId]/edit/page.tsx`

**Expected Changes:**
- Replace "Loading item..." text with translated value
- Replace "Loading properties..." text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Use appropriate translations hook/function
3. Replace "Loading item..." with `t('item')`
4. Replace "Loading properties..." with `t('properties')`

**Acceptance Criteria:**
- [ ] Item loading text uses translation key
- [ ] Properties loading text uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.5 story points

---

### Phase 7: Other Components

#### Task 7.1: Update PropertySelector Component

**File:** `/src/components/PropertySelector.tsx`

**Expected Changes:**
- Replace "Loading properties..." text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace "Loading properties..." with `t('properties')`

**Acceptance Criteria:**
- [ ] Loading text uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 7.2: Update ItemsManagement Component

**File:** `/src/components/ItemsManagement.tsx`

**Expected Changes:**
- Replace "Loading properties..." text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace "Loading properties..." with `t('properties')`

**Acceptance Criteria:**
- [ ] Loading text uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 7.3: Update GuideGrid Component

**File:** `/src/components/InstructionsTable/GuideGrid.tsx`

**Expected Changes:**
- Replace loading guides aria-label with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hook
3. Replace hardcoded aria-label with `t('guides')`

**Acceptance Criteria:**
- [ ] Loading aria-label uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 7.4: Update ItemForm Component

**File:** `/src/components/ItemForm.tsx`

**Expected Changes:**
- Replace "Saving..." button text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hooks for both `common.loading` and `common.status`
3. Replace "Saving..." with `tStatus('saving')`

**Acceptance Criteria:**
- [ ] Saving button text uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

#### Task 7.5: Update InstructionEditor Component

**File:** `/src/components/InstructionEditor/InstructionEditor.tsx`

**Expected Changes:**
- Replace "Saving..." button text with translated value

**Implementation Steps:**
1. Read file to identify hardcoded loading strings
2. Import `useTranslations` and add hooks for both `common.loading` and `common.status`
3. Replace "Saving..." with `tStatus('saving')`

**Acceptance Criteria:**
- [ ] Saving button text uses translation key
- [ ] No TypeScript errors

**Estimated Effort:** 0.25 story points

---

### Phase 8: Testing & Validation

#### Task 8.1: Verify Build Passes

**Implementation Steps:**
1. Run `npm run build`
2. Fix any TypeScript errors
3. Verify no runtime errors in console

**Acceptance Criteria:**
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No missing translation key warnings

**Estimated Effort:** 0.5 story points

---

#### Task 8.2: Test Loading States in All Languages

**Implementation Steps:**
1. Start development server: `npm run dev`
2. Navigate to pages with loading states
3. For each supported language (en, fr, es, de, nl, it):
   - Switch language using LanguageSwitcher
   - Trigger loading states (refresh pages, submit forms, etc.)
   - Verify loading text appears in correct language
   - Verify no layout overflow issues

**Test Scenarios:**
- [ ] Dashboard loading state
- [ ] Item list loading state
- [ ] Property selector loading state
- [ ] Form submission (saving) state
- [ ] Authentication loading state
- [ ] PDF loading state

**Acceptance Criteria:**
- [ ] All loading states display in correct language
- [ ] No layout overflow issues with longer translations (German, French)
- [ ] Screen reader announces correct translated text

**Estimated Effort:** 1 story point

---

#### Task 8.3: Accessibility Verification

**Implementation Steps:**
1. Use screen reader (VoiceOver, NVDA) to test loading states
2. Verify aria-labels are announced correctly
3. Verify sr-only text is readable
4. Test with keyboard navigation

**Acceptance Criteria:**
- [ ] Screen reader announces translated loading states
- [ ] aria-labels properly localized
- [ ] No accessibility regressions

**Estimated Effort:** 0.5 story points

---

## Task Summary Table

| Task ID | Task Name | File(s) | Effort | Priority |
|---------|-----------|---------|--------|----------|
| 1.1 | Add loading keys to en.json | `/messages/en.json` | 0.5 | P0 |
| 1.2 | Add French translations | `/messages/fr.json` | 0.5 | P0 |
| 1.3 | Add Spanish translations | `/messages/es.json` | 0.5 | P0 |
| 1.4 | Add German translations | `/messages/de.json` | 0.5 | P0 |
| 1.5 | Add Dutch translations | `/messages/nl.json` | 0.5 | P0 |
| 1.6 | Add Italian translations | `/messages/it.json` | 0.5 | P0 |
| 2.1 | Update LoadingIndicator | LoadingIndicator.tsx | 0.25 | P1 |
| 2.2 | Update SkeletonBase | SkeletonBase.tsx | 0.5 | P1 |
| 2.3 | Update ItemManager LoadingState | LoadingState.tsx | 0.5 | P1 |
| 3.1 | Update DashboardLayout | DashboardLayout.tsx | 0.5 | P1 |
| 3.2 | Update StatisticsCards | StatisticsCards.tsx | 0.5 | P2 |
| 3.3 | Update PropertySection | PropertySection.tsx | 0.5 | P2 |
| 3.4 | Update PortfolioSummary | PortfolioSummary.tsx | 0.5 | P2 |
| 3.5 | Update PropertyEditModal | PropertyEditModal.tsx | 0.5 | P2 |
| 4.1 | Update LoginPageContent | LoginPageContent.tsx | 0.5 | P1 |
| 5.1 | Update VisitCountBadge | VisitCountBadge.tsx | 0.25 | P2 |
| 5.2 | Update ReactionSummary | ReactionSummary.tsx | 0.25 | P2 |
| 5.3 | Update EngagementIndicator | EngagementIndicator.tsx | 0.25 | P2 |
| 5.4 | Update PDFViewer | PDFViewer.tsx | 0.25 | P2 |
| 5.5 | Update MediaEditorStep | MediaEditorStep.tsx | 0.25 | P2 |
| 5.6 | Update PDFPlaceholder | PDFPlaceholder.tsx | 0.25 | P2 |
| 5.7 | Update TextEditorStep | TextEditorStep.tsx | 0.25 | P2 |
| 5.8 | Update ContentPreview | ContentPreview.tsx | 0.5 | P2 |
| 6.1 | Update Print Property Page | print/[propertyId]/page.tsx | 0.5 | P2 |
| 6.2 | Update Print Index Page | print/page.tsx | 0.25 | P2 |
| 6.3 | Update Property Page | properties/[propertyId]/page.tsx | 0.25 | P2 |
| 6.4 | Update Admin Property Page | admin/properties/[propertyId]/page.tsx | 0.25 | P2 |
| 6.5 | Update Admin Item Edit Page | admin/items/[publicId]/edit/page.tsx | 0.5 | P2 |
| 7.1 | Update PropertySelector | PropertySelector.tsx | 0.25 | P2 |
| 7.2 | Update ItemsManagement | ItemsManagement.tsx | 0.25 | P2 |
| 7.3 | Update GuideGrid | GuideGrid.tsx | 0.25 | P2 |
| 7.4 | Update ItemForm | ItemForm.tsx | 0.25 | P2 |
| 7.5 | Update InstructionEditor | InstructionEditor.tsx | 0.25 | P2 |
| 8.1 | Verify Build | - | 0.5 | P0 |
| 8.2 | Test All Languages | - | 1.0 | P1 |
| 8.3 | Accessibility Verification | - | 0.5 | P1 |

**Total Estimated Effort:** ~14.25 story points

---

## Acceptance Criteria Summary

- [ ] All 30+ components with loading states identified and updated
- [ ] Generic loading messages use `common.loading.default` or contextual keys
- [ ] Context-specific loading messages use dedicated keys (e.g., `common.loading.items`)
- [ ] Operation status messages use `common.status.*` keys
- [ ] Skeleton loader `aria-label` attributes use translation keys
- [ ] Screen reader `sr-only` text uses translation keys
- [ ] All extracted strings added to `/messages/en.json`
- [ ] All extracted strings propagated to 5 non-English language files (fr, es, de, nl, it)
- [ ] Components correctly display translated loading messages when language is switched
- [ ] Loading messages maintain appropriate brevity and clarity in all languages
- [ ] Build passes with no TypeScript errors
- [ ] Existing tests continue to pass
- [ ] Accessibility tests pass for all loading states

---

## Implementation Notes

### Pattern for Client Components
```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common.loading');

  if (isLoading) {
    return <LoadingIndicator label={t('default')} />;
  }

  return <div>Content</div>;
}
```

### Pattern for Server Components
```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('common.loading');

  return <LoadingIndicator label={t('default')} />;
}
```

### Pattern for Screen Reader Text with Interpolation
```typescript
const t = useTranslations('common.loading');

// Using interpolation for dynamic context
<span className="sr-only">
  {t('screenReaderWait', { context: t('items') })}
</span>
// Output: "Loading items, please wait..."
```

---

## Related Documents

- [REQ-343-extract-loading-state-messages-overview.md](./REQ-343-extract-loading-state-messages-overview.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-138: Unified Loading Indicator Component](./REQ-138-loading-indicator-detailed.md)
- [Epic 1 Foundation: i18n Setup](./prd/Plan-110-L10N-Epic1-Foundation.md)

---

*Document generated for FAQBNB L10N Epic 2 - Task 2H.7*
*Created: 2026-01-19*
