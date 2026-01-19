# REQ-342: Extract Empty State Messages - Detailed Task Breakdown

**Document Created:** 2026-01-19 18:45:00 UTC
**Last Modified:** 2026-01-19 18:45:00 UTC
**Request Reference:** gen_requests_epic2.md - Request #342
**Overview Document:** REQ-342-extract-empty-state-messages-overview.md
**Implementation Plan Reference:** Plan-111-L10N-Epic2-Static-UI-Translation.md
**Sub-Epic:** 2H - Common & Shared Components
**Task ID:** 2H.6
**Size:** M (Medium)
**Priority:** High (Part of Epic 2 Foundation)

---

## Executive Summary

This document provides granular, actionable tasks for extracting all hardcoded empty state messages across the FAQBNB application to translation files. The work involves updating 14+ components and creating a comprehensive `common.emptyStates` namespace in the translation files for all 6 supported languages.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 i18n foundation is complete (next-intl installed and configured)
- [ ] Translation files exist at `/messages/{en,fr,es,de,nl,it}.json`
- [ ] `useTranslations` hook works in client components
- [ ] Task 2H.1 (Create `common` namespace structure) is complete or can be done as part of this task

---

## Task Breakdown

### Task 1: Create Empty States Translation Namespace in en.json

**File:** `/messages/en.json`
**Estimated Effort:** 1 story point (30 minutes)
**Dependencies:** None

#### 1.1 Add `common.emptyStates` namespace structure

Add the following nested structure under the `common` key in `/messages/en.json`:

```json
{
  "common": {
    "emptyStates": {
      "items": {
        "title": "No items yet",
        "description": "Create your first item to get started",
        "action": "Create Item",
        "noMatching": "No matching items",
        "searchHint": "Try adjusting your search or filters"
      },
      "properties": {
        "title": "Let's add your property",
        "description": "A property is where your items live - like a vacation rental or home.",
        "action": "Add Property",
        "notFound": "No Properties Found",
        "getStarted": "Get started by creating your first property.",
        "noPropertiesYet": "No Properties Yet"
      },
      "guides": {
        "title": "No guides yet",
        "description": "Create items and add guide articles to get started. Guides help guests find what they need.",
        "notFound": "No guides found",
        "searchHint": "Try adjusting your search or filters"
      },
      "dashboard": {
        "welcome": {
          "title": "Welcome to FAQBNB!",
          "description": "Get started by adding your first property. Then you can create QR codes to help guests find what they need."
        },
        "noActivity": "No recent activity",
        "startTracking": "Start adding new QR Code items and create guides/instructions"
      },
      "search": {
        "noResults": "No results found",
        "noResultsFor": "No items match your search for \"{term}\"",
        "tryDifferent": "Try a different search term"
      },
      "media": {
        "noLinks": "No links added yet",
        "addFirst": "Add your first link to get started"
      },
      "analytics": {
        "noData": "No analytics data available",
        "checkBack": "Check back after some activity"
      },
      "selection": {
        "noItemsFound": "No items found",
        "noItemsAvailable": "No items available"
      }
    }
  }
}
```

#### 1.2 Verification Steps

- [ ] JSON syntax is valid (no trailing commas, proper nesting)
- [ ] All keys follow the `emptyStates.[context].[element]` pattern
- [ ] English text matches existing hardcoded strings exactly or with minor improvements

---

### Task 2: Update EmptyState Component (ItemManager)

**File:** `/src/components/ItemManager/components/shared/EmptyState.tsx`
**Estimated Effort:** 1 story point (20 minutes)
**Dependencies:** Task 1

#### 2.1 Add useTranslations import

**Location:** Line 14 (after existing imports)

```typescript
// ADD after line 14
import { useTranslations } from 'next-intl';
```

#### 2.2 Replace hardcoded constants with translation hook

**Location:** Lines 22-24 (remove constants and add hook inside component)

**Before:**
```typescript
const DEFAULT_TITLE = 'No items yet';
const DEFAULT_DESCRIPTION = 'Create your first item to get started';
```

**After:**
```typescript
// Remove the DEFAULT_TITLE and DEFAULT_DESCRIPTION constants entirely
```

#### 2.3 Update component function to use translations

**Location:** Lines 47-53 (inside the component function)

**Before:**
```typescript
export function EmptyState({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  icon,
  action,
  className,
}: EmptyStateProps) {
```

**After:**
```typescript
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const t = useTranslations('common.emptyStates.items');

  // Use translations as defaults when props are not provided
  const displayTitle = title ?? t('title');
  const displayDescription = description ?? t('description');
```

#### 2.4 Update JSX to use display variables

**Location:** Lines 66-72

**Before:**
```tsx
<h3 className="text-lg font-medium text-gray-900 mb-2">
  {title}
</h3>
<p className="text-gray-600 mb-6 max-w-md mx-auto">
  {description}
</p>
```

**After:**
```tsx
<h3 className="text-lg font-medium text-gray-900 mb-2">
  {displayTitle}
</h3>
<p className="text-gray-600 mb-6 max-w-md mx-auto">
  {displayDescription}
</p>
```

#### 2.5 Update aria-label to use display variables

**Location:** Line 57

**Before:**
```tsx
aria-label={`${title}. ${description}`}
```

**After:**
```tsx
aria-label={`${displayTitle}. ${displayDescription}`}
```

#### 2.6 Verification Steps

- [ ] Component renders without errors
- [ ] Default translations display when no props provided
- [ ] Props still override translations when provided (backward compatibility)
- [ ] aria-label correctly reflects displayed text

---

### Task 3: Update ItemManager Default Labels

**File:** `/src/components/ItemManager/ItemManager.tsx`
**Estimated Effort:** 1 story point (15 minutes)
**Dependencies:** Task 1

#### 3.1 Add useTranslations import

**Location:** Top of file with other imports

```typescript
import { useTranslations } from 'next-intl';
```

#### 3.2 Add translation hook inside component

**Location:** Inside the ItemManager component, near the top

```typescript
const tEmpty = useTranslations('common.emptyStates');
```

#### 3.3 Update default labels config

**Location:** Lines 57-58 (approximate - the labels default config)

**Before:**
```typescript
labels: {
  empty: {
    title: 'No items yet',
    description: 'Create your first item to get started'
  },
  ...
}
```

**After:**
```typescript
labels: {
  empty: {
    title: tEmpty('items.title'),
    description: tEmpty('items.description')
  },
  ...
}
```

#### 3.4 Update search empty state

**Location:** Lines 590-591 (approximate - search results empty state)

**Before:**
```typescript
title: 'No matching items',
description: 'Try adjusting your search or filters'
```

**After:**
```typescript
title: tEmpty('items.noMatching'),
description: tEmpty('items.searchHint')
```

#### 3.5 Verification Steps

- [ ] Empty state shows translated text in ItemManager list view
- [ ] Search with no results shows translated empty state
- [ ] Language switching updates the empty state text

---

### Task 4: Update StatisticsCards Empty State

**File:** `/src/components/SimpleDashboard/StatisticsCards.tsx`
**Estimated Effort:** 0.5 story points (10 minutes)
**Dependencies:** Task 1

#### 4.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 4.2 Add translation hook inside component

```typescript
const t = useTranslations('common.emptyStates.dashboard');
```

#### 4.3 Update empty state text

**Location:** Line 218 (approximate)

**Before:**
```typescript
"Start adding new QR Code items and create guides/instructions"
```

**After:**
```typescript
{t('startTracking')}
```

#### 4.4 Verification Steps

- [ ] Statistics cards empty state displays translated text
- [ ] Language switching updates the text

---

### Task 5: Update PropertySection Empty State

**File:** `/src/components/SimpleDashboard/PropertySection.tsx`
**Estimated Effort:** 0.5 story points (10 minutes)
**Dependencies:** Task 1

#### 5.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 5.2 Update PropertyEmptyState function

**Location:** Lines 125-136 (PropertyEmptyState function or inline JSX)

Add translation hook and update text:

```typescript
const t = useTranslations('common.emptyStates.properties');

// Update the JSX
<EmptyStateCard
  title={t('title')}
  description={t('description')}
  actionLabel={t('action')}
  ...
/>
```

**Before:**
```typescript
title="Let's add your property"
description="A property is where your items live - like a vacation rental or home."
```

**After:**
```typescript
title={t('title')}
description={t('description')}
```

#### 5.3 Verification Steps

- [ ] Property section empty state displays translated text
- [ ] Add property button label is translated
- [ ] Language switching updates all text

---

### Task 6: Update GuideGrid Empty State

**File:** `/src/components/InstructionsTable/GuideGrid.tsx`
**Estimated Effort:** 0.5 story points (10 minutes)
**Dependencies:** Task 1

#### 6.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 6.2 Add translation hook inside component

```typescript
const t = useTranslations('common.emptyStates.guides');
```

#### 6.3 Update empty state section

**Location:** Lines 88-103 (approximate)

**Before:**
```typescript
<EmptyState
  title="No guides found"
  description="Try adjusting your search or filters"
/>
```

**After:**
```typescript
<EmptyState
  title={t('notFound')}
  description={t('searchHint')}
/>
```

#### 6.4 Verification Steps

- [ ] Guide grid empty state displays translated text
- [ ] Search with no results shows translated message
- [ ] Language switching updates the text

---

### Task 7: Update PropertiesManagement Empty State

**File:** `/src/components/PropertiesManagement.tsx`
**Estimated Effort:** 0.5 story points (15 minutes)
**Dependencies:** Task 1

#### 7.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 7.2 Add translation hook inside component

```typescript
const t = useTranslations('common.emptyStates.properties');
```

#### 7.3 Update empty state section

**Location:** Lines 314-328 (approximate)

**Before:**
```typescript
<h3>No Properties Found</h3>
<p>Get started by creating your first property.</p>
```

**After:**
```typescript
<h3>{t('notFound')}</h3>
<p>{t('getStarted')}</p>
```

#### 7.4 Verification Steps

- [ ] Properties management empty state displays translated text
- [ ] Language switching updates the text

---

### Task 8: Update ItemSelectionList Empty States

**File:** `/src/components/ItemSelectionList.tsx`
**Estimated Effort:** 1 story point (20 minutes)
**Dependencies:** Task 1

#### 8.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 8.2 Add translation hook inside component

```typescript
const tEmpty = useTranslations('common.emptyStates');
```

#### 8.3 Update multiple empty state sections

**Location:** Lines 203-231 (approximate - multiple occurrences)

**Before:**
```typescript
"No items found"
"No items available"
```

**After:**
```typescript
{tEmpty('selection.noItemsFound')}
{tEmpty('selection.noItemsAvailable')}
```

#### 8.4 Handle search term interpolation (if applicable)

If there's a search-specific empty state with the search term:

```typescript
{tEmpty('search.noResultsFor', { term: searchQuery })}
```

#### 8.5 Verification Steps

- [ ] Item selection list shows translated empty states
- [ ] Different empty state scenarios show appropriate messages
- [ ] Search term interpolation works correctly
- [ ] Language switching updates all text

---

### Task 9: Update ItemInstructionsList Empty State

**File:** `/src/components/ItemEditForm/ItemInstructionsList.tsx`
**Estimated Effort:** 0.5 story points (10 minutes)
**Dependencies:** Task 1

#### 9.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 9.2 Add translation hook inside component

```typescript
const t = useTranslations('common.emptyStates.guides');
```

#### 9.3 Update empty state

**Location:** Line 87 (approximate)

**Before:**
```typescript
"No guides yet"
```

**After:**
```typescript
{t('title')}
```

#### 9.4 Verification Steps

- [ ] Instructions list empty state displays translated text
- [ ] Language switching updates the text

---

### Task 10: Update Dashboard2 Page Empty States

**File:** `/src/app/dashboard2/page.tsx`
**Estimated Effort:** 0.5 story points (10 minutes)
**Dependencies:** Task 1

#### 10.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 10.2 Add translation hook inside component

```typescript
const tEmpty = useTranslations('common.emptyStates.dashboard');
```

#### 10.3 Update EmptyStateCard props

**Location:** Lines 172-175 (approximate)

**Before:**
```typescript
<EmptyStateCard
  title="Welcome to FAQBNB!"
  description="Get started by adding your first property. Then you can create QR codes to help guests find what they need."
/>
```

**After:**
```typescript
<EmptyStateCard
  title={tEmpty('welcome.title')}
  description={tEmpty('welcome.description')}
/>
```

#### 10.4 Verification Steps

- [ ] Dashboard welcome empty state displays translated text
- [ ] Language switching updates all text

---

### Task 11: Update Print Page Empty State

**File:** `/src/app/dashboard2/print/page.tsx`
**Estimated Effort:** 0.5 story points (10 minutes)
**Dependencies:** Task 1

#### 11.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 11.2 Add translation hook

```typescript
const t = useTranslations('common.emptyStates.properties');
```

#### 11.3 Update EmptyState component

**Location:** Lines 36-52 (approximate)

**Before:**
```typescript
"No Properties Yet"
```

**After:**
```typescript
{t('noPropertiesYet')}
```

#### 11.4 Verification Steps

- [ ] Print page empty state displays translated text
- [ ] Language switching updates the text

---

### Task 12: Update Instructions Page Empty State

**File:** `/src/app/dashboard2/instructions/page.tsx`
**Estimated Effort:** 0.5 story points (15 minutes)
**Dependencies:** Task 1

#### 12.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 12.2 Add translation hook

```typescript
const t = useTranslations('common.emptyStates.guides');
```

#### 12.3 Update empty state section

**Location:** Lines 283-299 (approximate)

**Before:**
```typescript
title="No guides yet"
description="Create items and add guide articles to get started. Guides help guests find what they need."
```

**After:**
```typescript
title={t('title')}
description={t('description')}
```

#### 12.4 Verification Steps

- [ ] Instructions page empty state displays translated text
- [ ] Language switching updates all text

---

### Task 13: Update MediaManagementSection Empty State

**File:** `/src/components/MediaManagement/MediaManagementSection.tsx`
**Estimated Effort:** 0.5 story points (10 minutes)
**Dependencies:** Task 1

#### 13.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 13.2 Add translation hook

```typescript
const t = useTranslations('common.emptyStates.media');
```

#### 13.3 Update empty state rendering

**Location:** Lines 147-148 (approximate)

**Before:**
```typescript
"No links added yet"
"Add your first link to get started"
```

**After:**
```typescript
{t('noLinks')}
{t('addFirst')}
```

#### 13.4 Verification Steps

- [ ] Media section empty state displays translated text
- [ ] Language switching updates the text

---

### Task 14: Update ReactionAnalytics Empty State

**File:** `/src/components/ReactionAnalytics.tsx`
**Estimated Effort:** 0.5 story points (10 minutes)
**Dependencies:** Task 1

#### 14.1 Add useTranslations import

```typescript
import { useTranslations } from 'next-intl';
```

#### 14.2 Add translation hook

```typescript
const t = useTranslations('common.emptyStates.analytics');
```

#### 14.3 Update EmptyState function

**Location:** Line 88 (approximate)

**Before:**
```typescript
"No analytics data available"
```

**After:**
```typescript
{t('noData')}
```

#### 14.4 Verification Steps

- [ ] Analytics empty state displays translated text
- [ ] Language switching updates the text

---

### Task 15: Propagate Translations to Other Languages

**Files:** `/messages/{fr,es,de,nl,it}.json`
**Estimated Effort:** 2 story points (45 minutes)
**Dependencies:** Task 1

#### 15.1 French Translations (fr.json)

Add the following under `common.emptyStates`:

```json
{
  "common": {
    "emptyStates": {
      "items": {
        "title": "Aucun article",
        "description": "Creez votre premier article pour commencer",
        "action": "Creer un article",
        "noMatching": "Aucun article correspondant",
        "searchHint": "Essayez d'ajuster votre recherche ou vos filtres"
      },
      "properties": {
        "title": "Ajoutons votre propriete",
        "description": "Une propriete est l'endroit ou vivent vos articles - comme une location de vacances ou une maison.",
        "action": "Ajouter une propriete",
        "notFound": "Aucune propriete trouvee",
        "getStarted": "Commencez par creer votre premiere propriete.",
        "noPropertiesYet": "Pas encore de proprietes"
      },
      "guides": {
        "title": "Pas encore de guides",
        "description": "Creez des articles et ajoutez des guides pour commencer. Les guides aident les invites a trouver ce dont ils ont besoin.",
        "notFound": "Aucun guide trouve",
        "searchHint": "Essayez d'ajuster votre recherche ou vos filtres"
      },
      "dashboard": {
        "welcome": {
          "title": "Bienvenue sur FAQBNB !",
          "description": "Commencez par ajouter votre premiere propriete. Ensuite, vous pouvez creer des codes QR pour aider les invites a trouver ce dont ils ont besoin."
        },
        "noActivity": "Aucune activite recente",
        "startTracking": "Commencez a ajouter de nouveaux articles QR Code et creez des guides/instructions"
      },
      "search": {
        "noResults": "Aucun resultat trouve",
        "noResultsFor": "Aucun article ne correspond a votre recherche \"{term}\"",
        "tryDifferent": "Essayez un terme de recherche different"
      },
      "media": {
        "noLinks": "Aucun lien ajoute",
        "addFirst": "Ajoutez votre premier lien pour commencer"
      },
      "analytics": {
        "noData": "Aucune donnee analytique disponible",
        "checkBack": "Revenez apres un peu d'activite"
      },
      "selection": {
        "noItemsFound": "Aucun article trouve",
        "noItemsAvailable": "Aucun article disponible"
      }
    }
  }
}
```

#### 15.2 Spanish Translations (es.json)

```json
{
  "common": {
    "emptyStates": {
      "items": {
        "title": "Sin articulos aun",
        "description": "Crea tu primer articulo para comenzar",
        "action": "Crear articulo",
        "noMatching": "No hay articulos coincidentes",
        "searchHint": "Intenta ajustar tu busqueda o filtros"
      },
      "properties": {
        "title": "Agreguemos tu propiedad",
        "description": "Una propiedad es donde viven tus articulos - como un alquiler vacacional o una casa.",
        "action": "Agregar propiedad",
        "notFound": "No se encontraron propiedades",
        "getStarted": "Comienza creando tu primera propiedad.",
        "noPropertiesYet": "Sin propiedades aun"
      },
      "guides": {
        "title": "Sin guias aun",
        "description": "Crea articulos y agrega guias para comenzar. Las guias ayudan a los huespedes a encontrar lo que necesitan.",
        "notFound": "No se encontraron guias",
        "searchHint": "Intenta ajustar tu busqueda o filtros"
      },
      "dashboard": {
        "welcome": {
          "title": "Bienvenido a FAQBNB!",
          "description": "Comienza agregando tu primera propiedad. Luego puedes crear codigos QR para ayudar a los huespedes a encontrar lo que necesitan."
        },
        "noActivity": "Sin actividad reciente",
        "startTracking": "Comienza agregando nuevos articulos de codigo QR y crea guias/instrucciones"
      },
      "search": {
        "noResults": "No se encontraron resultados",
        "noResultsFor": "Ningun articulo coincide con tu busqueda de \"{term}\"",
        "tryDifferent": "Intenta con un termino de busqueda diferente"
      },
      "media": {
        "noLinks": "Sin enlaces agregados",
        "addFirst": "Agrega tu primer enlace para comenzar"
      },
      "analytics": {
        "noData": "No hay datos analiticos disponibles",
        "checkBack": "Vuelve despues de alguna actividad"
      },
      "selection": {
        "noItemsFound": "No se encontraron articulos",
        "noItemsAvailable": "No hay articulos disponibles"
      }
    }
  }
}
```

#### 15.3 German Translations (de.json)

```json
{
  "common": {
    "emptyStates": {
      "items": {
        "title": "Noch keine Artikel",
        "description": "Erstellen Sie Ihren ersten Artikel, um zu beginnen",
        "action": "Artikel erstellen",
        "noMatching": "Keine passenden Artikel",
        "searchHint": "Versuchen Sie, Ihre Suche oder Filter anzupassen"
      },
      "properties": {
        "title": "Fugen wir Ihre Immobilie hinzu",
        "description": "Eine Immobilie ist der Ort, an dem Ihre Artikel leben - wie eine Ferienwohnung oder ein Haus.",
        "action": "Immobilie hinzufugen",
        "notFound": "Keine Immobilien gefunden",
        "getStarted": "Beginnen Sie mit der Erstellung Ihrer ersten Immobilie.",
        "noPropertiesYet": "Noch keine Immobilien"
      },
      "guides": {
        "title": "Noch keine Anleitungen",
        "description": "Erstellen Sie Artikel und fugen Sie Anleitungen hinzu, um zu beginnen. Anleitungen helfen Gasten zu finden, was sie brauchen.",
        "notFound": "Keine Anleitungen gefunden",
        "searchHint": "Versuchen Sie, Ihre Suche oder Filter anzupassen"
      },
      "dashboard": {
        "welcome": {
          "title": "Willkommen bei FAQBNB!",
          "description": "Beginnen Sie mit dem Hinzufugen Ihrer ersten Immobilie. Dann konnen Sie QR-Codes erstellen, um Gasten zu helfen, das zu finden, was sie brauchen."
        },
        "noActivity": "Keine kurzliche Aktivitat",
        "startTracking": "Beginnen Sie mit dem Hinzufugen neuer QR-Code-Artikel und erstellen Sie Anleitungen/Anweisungen"
      },
      "search": {
        "noResults": "Keine Ergebnisse gefunden",
        "noResultsFor": "Keine Artikel entsprechen Ihrer Suche nach \"{term}\"",
        "tryDifferent": "Versuchen Sie einen anderen Suchbegriff"
      },
      "media": {
        "noLinks": "Noch keine Links hinzugefugt",
        "addFirst": "Fugen Sie Ihren ersten Link hinzu, um zu beginnen"
      },
      "analytics": {
        "noData": "Keine Analysedaten verfugbar",
        "checkBack": "Schauen Sie nach einiger Aktivitat noch einmal vorbei"
      },
      "selection": {
        "noItemsFound": "Keine Artikel gefunden",
        "noItemsAvailable": "Keine Artikel verfugbar"
      }
    }
  }
}
```

#### 15.4 Dutch Translations (nl.json)

```json
{
  "common": {
    "emptyStates": {
      "items": {
        "title": "Nog geen items",
        "description": "Maak je eerste item om te beginnen",
        "action": "Item aanmaken",
        "noMatching": "Geen overeenkomende items",
        "searchHint": "Probeer je zoekopdracht of filters aan te passen"
      },
      "properties": {
        "title": "Laten we je accommodatie toevoegen",
        "description": "Een accommodatie is waar je items leven - zoals een vakantiewoning of huis.",
        "action": "Accommodatie toevoegen",
        "notFound": "Geen accommodaties gevonden",
        "getStarted": "Begin met het aanmaken van je eerste accommodatie.",
        "noPropertiesYet": "Nog geen accommodaties"
      },
      "guides": {
        "title": "Nog geen handleidingen",
        "description": "Maak items en voeg handleidingen toe om te beginnen. Handleidingen helpen gasten te vinden wat ze nodig hebben.",
        "notFound": "Geen handleidingen gevonden",
        "searchHint": "Probeer je zoekopdracht of filters aan te passen"
      },
      "dashboard": {
        "welcome": {
          "title": "Welkom bij FAQBNB!",
          "description": "Begin met het toevoegen van je eerste accommodatie. Daarna kun je QR-codes maken om gasten te helpen vinden wat ze nodig hebben."
        },
        "noActivity": "Geen recente activiteit",
        "startTracking": "Begin met het toevoegen van nieuwe QR-code items en maak handleidingen/instructies"
      },
      "search": {
        "noResults": "Geen resultaten gevonden",
        "noResultsFor": "Geen items komen overeen met je zoekopdracht voor \"{term}\"",
        "tryDifferent": "Probeer een andere zoekterm"
      },
      "media": {
        "noLinks": "Nog geen links toegevoegd",
        "addFirst": "Voeg je eerste link toe om te beginnen"
      },
      "analytics": {
        "noData": "Geen analysegegevens beschikbaar",
        "checkBack": "Kom terug na enige activiteit"
      },
      "selection": {
        "noItemsFound": "Geen items gevonden",
        "noItemsAvailable": "Geen items beschikbaar"
      }
    }
  }
}
```

#### 15.5 Italian Translations (it.json)

```json
{
  "common": {
    "emptyStates": {
      "items": {
        "title": "Nessun articolo ancora",
        "description": "Crea il tuo primo articolo per iniziare",
        "action": "Crea articolo",
        "noMatching": "Nessun articolo corrispondente",
        "searchHint": "Prova a modificare la ricerca o i filtri"
      },
      "properties": {
        "title": "Aggiungiamo la tua proprieta",
        "description": "Una proprieta e dove vivono i tuoi articoli - come un affitto vacanze o una casa.",
        "action": "Aggiungi proprieta",
        "notFound": "Nessuna proprieta trovata",
        "getStarted": "Inizia creando la tua prima proprieta.",
        "noPropertiesYet": "Nessuna proprieta ancora"
      },
      "guides": {
        "title": "Nessuna guida ancora",
        "description": "Crea articoli e aggiungi guide per iniziare. Le guide aiutano gli ospiti a trovare cio di cui hanno bisogno.",
        "notFound": "Nessuna guida trovata",
        "searchHint": "Prova a modificare la ricerca o i filtri"
      },
      "dashboard": {
        "welcome": {
          "title": "Benvenuto su FAQBNB!",
          "description": "Inizia aggiungendo la tua prima proprieta. Poi puoi creare codici QR per aiutare gli ospiti a trovare cio di cui hanno bisogno."
        },
        "noActivity": "Nessuna attivita recente",
        "startTracking": "Inizia ad aggiungere nuovi articoli QR Code e crea guide/istruzioni"
      },
      "search": {
        "noResults": "Nessun risultato trovato",
        "noResultsFor": "Nessun articolo corrisponde alla tua ricerca di \"{term}\"",
        "tryDifferent": "Prova con un termine di ricerca diverso"
      },
      "media": {
        "noLinks": "Nessun link aggiunto",
        "addFirst": "Aggiungi il tuo primo link per iniziare"
      },
      "analytics": {
        "noData": "Nessun dato analitico disponibile",
        "checkBack": "Torna dopo un po' di attivita"
      },
      "selection": {
        "noItemsFound": "Nessun articolo trovato",
        "noItemsAvailable": "Nessun articolo disponibile"
      }
    }
  }
}
```

#### 15.6 Verification Steps

- [ ] All 6 language files have identical key structures
- [ ] JSON syntax is valid in all files
- [ ] No missing keys in any language file
- [ ] Translations maintain appropriate tone and context

---

### Task 16: Testing and Verification

**Estimated Effort:** 1 story point (30 minutes)
**Dependencies:** Tasks 1-15

#### 16.1 Unit Testing

- [ ] Add/verify test for EmptyState component using mocked useTranslations
- [ ] Test that props override translations when provided
- [ ] Test default translation fallback behavior

#### 16.2 Integration Testing

- [ ] Verify empty states render correctly in each supported locale
- [ ] Test dynamic interpolation (search term in `noResultsFor`)
- [ ] Verify no console errors or warnings

#### 16.3 Manual Verification Checklist

| Scenario | en | fr | es | de | nl | it |
|----------|----|----|----|----|----|----|
| Dashboard new user welcome | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Dashboard no activity | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Items list empty | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Items search no results | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Properties list empty | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Guides list empty | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Guides search no results | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Analytics no data | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Print page no properties | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Item selection empty | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Media section empty | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

#### 16.4 Backward Compatibility Testing

- [ ] Verify components still accept custom title/description props
- [ ] Verify props take precedence over translations
- [ ] Verify no breaking changes to component APIs

#### 16.5 Verification Steps

- [ ] All empty state scenarios verified in at least 2 languages
- [ ] Language switching dynamically updates all empty states
- [ ] No TypeScript errors
- [ ] Build completes successfully

---

## Implementation Order

Execute tasks in this recommended order:

1. **Task 1** - Create translation namespace (foundation for all other tasks)
2. **Task 2** - Update EmptyState component (most reused component)
3. **Tasks 3-14** - Update individual components (can be parallelized)
4. **Task 15** - Propagate translations (after en.json is finalized)
5. **Task 16** - Testing and verification (final step)

---

## Files Modified Summary

### Translation Files (6 files)

| File | Change Type |
|------|-------------|
| `/messages/en.json` | Add `common.emptyStates` namespace |
| `/messages/fr.json` | Add `common.emptyStates` namespace |
| `/messages/es.json` | Add `common.emptyStates` namespace |
| `/messages/de.json` | Add `common.emptyStates` namespace |
| `/messages/nl.json` | Add `common.emptyStates` namespace |
| `/messages/it.json` | Add `common.emptyStates` namespace |

### Component Files (14 files)

| File | Change Type |
|------|-------------|
| `/src/components/ItemManager/components/shared/EmptyState.tsx` | Add useTranslations, remove hardcoded defaults |
| `/src/components/ItemManager/ItemManager.tsx` | Add useTranslations for labels config |
| `/src/components/SimpleDashboard/StatisticsCards.tsx` | Add useTranslations |
| `/src/components/SimpleDashboard/PropertySection.tsx` | Add useTranslations |
| `/src/components/InstructionsTable/GuideGrid.tsx` | Add useTranslations |
| `/src/components/PropertiesManagement.tsx` | Add useTranslations |
| `/src/components/ItemSelectionList.tsx` | Add useTranslations |
| `/src/components/ItemEditForm/ItemInstructionsList.tsx` | Add useTranslations |
| `/src/app/dashboard2/page.tsx` | Add useTranslations |
| `/src/app/dashboard2/print/page.tsx` | Add useTranslations |
| `/src/app/dashboard2/instructions/page.tsx` | Add useTranslations |
| `/src/components/MediaManagement/MediaManagementSection.tsx` | Add useTranslations |
| `/src/components/ReactionAnalytics.tsx` | Add useTranslations |

---

## Acceptance Criteria Checklist

- [ ] All components displaying empty states are identified and updated
- [ ] Empty state titles extracted to translation keys following `emptyStates.[context].title` pattern
- [ ] Empty state descriptions extracted to translation keys following `emptyStates.[context].description` pattern
- [ ] Search-specific empty states use dedicated keys with proper interpolation for search terms
- [ ] First-time user guidance messages use appropriate keys
- [ ] All extracted strings added to `en.json` with complete English translations
- [ ] All extracted strings propagated to other language files (de.json, es.json, fr.json, it.json, nl.json)
- [ ] Components correctly display translated empty state messages when language is switched
- [ ] No hardcoded English empty state text remains in any component
- [ ] Empty state messages maintain helpful and encouraging tone in all languages
- [ ] Props for custom empty state messages (title, description overrides) continue to work
- [ ] Build passes with no TypeScript errors
- [ ] All unit tests pass

---

## Effort Summary

| Task | Story Points | Time Estimate |
|------|--------------|---------------|
| Task 1: Create namespace | 1 | 30 min |
| Task 2: EmptyState component | 1 | 20 min |
| Task 3: ItemManager labels | 1 | 15 min |
| Task 4: StatisticsCards | 0.5 | 10 min |
| Task 5: PropertySection | 0.5 | 10 min |
| Task 6: GuideGrid | 0.5 | 10 min |
| Task 7: PropertiesManagement | 0.5 | 15 min |
| Task 8: ItemSelectionList | 1 | 20 min |
| Task 9: ItemInstructionsList | 0.5 | 10 min |
| Task 10: Dashboard2 page | 0.5 | 10 min |
| Task 11: Print page | 0.5 | 10 min |
| Task 12: Instructions page | 0.5 | 15 min |
| Task 13: MediaManagementSection | 0.5 | 10 min |
| Task 14: ReactionAnalytics | 0.5 | 10 min |
| Task 15: Propagate translations | 2 | 45 min |
| Task 16: Testing | 1 | 30 min |
| **Total** | **~11** | **~4 hours** |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Missing empty state locations | Grep search for "No items", "No results", "empty" patterns before marking complete |
| Broken prop overrides | Test backward compatibility explicitly in Task 16 |
| Translation key mismatches | Use provided JSON snippets exactly; validate with JSON linter |
| Component import errors | Verify `next-intl` is properly configured from Epic 1 |

---

## References

- [REQ-342 Overview Document](/docs/REQ-342-extract-empty-state-messages-overview.md)
- [Plan-111-L10N-Epic2-Static-UI-Translation.md](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [gen_requests_epic2.md](/docs/gen_requests_epic2.md) - Request #342
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
