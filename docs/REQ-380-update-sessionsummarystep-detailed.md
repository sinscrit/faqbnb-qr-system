# REQ-380: Update SessionSummaryStep Component - Detailed Task Breakdown

**Document Created**: 2026-01-19 17:30 UTC
**Last Modified**: 2026-01-19 17:30 UTC
**Type**: ENHANCEMENT
**Size**: S (Small)
**Epic**: Epic 2 - Static UI Translation
**Sub-Epic**: 2C - Item Creation Workflow
**Task ID**: 2C.10
**Parent Document**: [REQ-380-update-sessionsummarystep-overview.md](./REQ-380-update-sessionsummarystep-overview.md)
**Implementation Plan**: [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)

---

## Executive Summary

This document provides granular, implementation-ready tasks for internationalizing the SessionSummaryStep component and its related shared components. The scope includes:
- **SessionSummaryStep.tsx** - Main component (~12 strings)
- **SessionProgressBar.tsx** - Progress indicator (~2 strings)
- **SessionItemCard.tsx** - Item display cards (~8 strings)
- **RemoveItemDialog.tsx** - Confirmation dialog (~4 strings)

**Total Strings**: ~26 unique strings across 4 files
**Target Languages**: en, fr, es, de, nl, it

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] `/messages/en.json` exists and contains the `workflow` namespace (or is ready for extension)
- [ ] `useTranslations` hook is available from `next-intl`
- [ ] IntlProvider is configured in the app layout
- [ ] Previous workflow step components (PreviewSaveStep, etc.) have been internationalized following the same pattern

---

## Task 1: Add Translation Keys to English Message File

**Priority**: Required - Must complete first
**File**: `/messages/en.json`
**Story Points**: 1

### 1.1 Add `workflow.sessionSummary` Namespace

Add the following structure under the `workflow` key in `/messages/en.json`:

```json
{
  "workflow": {
    "sessionSummary": {
      "heading": "Session Summary",
      "subtitle": "Review your items before printing",
      "emptyState": {
        "heading": "No items yet",
        "description": "You haven't created any items in this session yet. Start by adding your first item.",
        "button": "Add First Item"
      },
      "sections": {
        "newItems": "New Items in This Session ({count})",
        "existingItems": "Previously Created Items ({count})"
      },
      "buttons": {
        "addMore": "Add More Items",
        "printQrCodes": "Print QR Codes",
        "skipFinish": "Skip & Finish"
      },
      "announcements": {
        "stepSummary": "Step: Session Summary - {count, plural, =0 {no items} one {# item} other {# items}} created in this session."
      }
    }
  }
}
```

### 1.2 Add `workflow.sessionProgress` Namespace

```json
{
  "workflow": {
    "sessionProgress": {
      "ariaLabel": "Session progress: {count, plural, =0 {no items} one {# item} other {# items}} created",
      "countText": "{count, plural, =0 {0 items} one {# item} other {# items}} created"
    }
  }
}
```

### 1.3 Add `workflow.sessionItemCard` Namespace

```json
{
  "workflow": {
    "sessionItemCard": {
      "contentCount": {
        "none": "No content",
        "singular": "1 content piece",
        "plural": "{count} content pieces"
      },
      "photoAlt": "Item photo",
      "ariaLabel": "{name} - {contentLabel}",
      "roomLabel": "Room: {room}",
      "editButton": "Edit {name}",
      "removeButton": "Remove {name}"
    }
  }
}
```

### 1.4 Add `workflow.removeItemDialog` Namespace

```json
{
  "workflow": {
    "removeItemDialog": {
      "heading": "Remove Item?",
      "message": "Are you sure you want to remove \"{name}\"? This action cannot be undone.",
      "buttons": {
        "cancel": "Cancel",
        "remove": "Remove"
      }
    }
  }
}
```

### Acceptance Criteria for Task 1
- [ ] All keys are added to `/messages/en.json` under the `workflow` namespace
- [ ] JSON is valid (no syntax errors)
- [ ] ICU pluralization format is used where applicable
- [ ] Variable interpolation uses `{variableName}` syntax
- [ ] Build completes without errors

---

## Task 2: Update SessionSummaryStep Main Component

**Priority**: Required
**File**: `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`
**Story Points**: 1

### 2.1 Import useTranslations Hook

**Location**: Line ~32 (imports section)

```typescript
// ADD this import
import { useTranslations } from 'next-intl';
```

### 2.2 Initialize Translation Hook in Main Component

**Location**: Inside `SessionSummaryStep` function, after state declarations (around line 145)

```typescript
export function SessionSummaryStep({
  // ... props
}: SessionSummaryStepProps) {
  // ADD: Initialize translations
  const t = useTranslations('workflow.sessionSummary');

  // Existing state declarations...
  const [isExistingExpanded, setIsExistingExpanded] = useState(false);
  // ...
}
```

### 2.3 Replace Main Heading

**Location**: Line 176

**Before**:
```tsx
<h2 className="text-2xl font-bold text-[#222222]">Session Summary</h2>
```

**After**:
```tsx
<h2 className="text-2xl font-bold text-[#222222]">{t('heading')}</h2>
```

### 2.4 Replace Subtitle

**Location**: Lines 177-179

**Before**:
```tsx
<p className="text-base text-[#717171] mt-2">
  Review your items before printing
</p>
```

**After**:
```tsx
<p className="text-base text-[#717171] mt-2">
  {t('subtitle')}
</p>
```

### 2.5 Replace New Items Section Heading

**Location**: Lines 191-193

**Before**:
```tsx
<h3
  id="new-items-heading"
  className="text-lg font-semibold text-[#222222] mb-3"
>
  New Items in This Session ({sessionItems.length})
</h3>
```

**After**:
```tsx
<h3
  id="new-items-heading"
  className="text-lg font-semibold text-[#222222] mb-3"
>
  {t('sections.newItems', { count: sessionItems.length })}
</h3>
```

### 2.6 Replace "Add More Items" Button Label

**Location**: Lines 228-229

**Before**:
```tsx
<Plus className="w-5 h-5" aria-hidden="true" />
Add More Items
```

**After**:
```tsx
<Plus className="w-5 h-5" aria-hidden="true" />
{t('buttons.addMore')}
```

### 2.7 Replace Existing Items Section Heading

**Location**: Lines 255-259

**Before**:
```tsx
<h3
  id="existing-items-heading"
  className="text-lg font-semibold text-[#222222]"
>
  Previously Created Items ({existingItems.length})
</h3>
```

**After**:
```tsx
<h3
  id="existing-items-heading"
  className="text-lg font-semibold text-[#222222]"
>
  {t('sections.existingItems', { count: existingItems.length })}
</h3>
```

### 2.8 Replace Print QR Codes Button Label

**Location**: Lines 309-310

**Before**:
```tsx
<Printer className="w-5 h-5" aria-hidden="true" />
Print QR Codes
```

**After**:
```tsx
<Printer className="w-5 h-5" aria-hidden="true" />
{t('buttons.printQrCodes')}
```

### 2.9 Replace Skip & Finish Button Label

**Location**: Lines 329-330

**Before**:
```tsx
<SkipForward className="w-5 h-5" aria-hidden="true" />
Skip & Finish
```

**After**:
```tsx
<SkipForward className="w-5 h-5" aria-hidden="true" />
{t('buttons.skipFinish')}
```

### 2.10 Replace Screen Reader Announcement

**Location**: Lines 343-345

**Before**:
```tsx
<div aria-live="polite" className="sr-only">
  Step: Session Summary - {sessionItems.length} items created in this session.
</div>
```

**After**:
```tsx
<div aria-live="polite" className="sr-only">
  {t('announcements.stepSummary', { count: sessionItems.length })}
</div>
```

### Acceptance Criteria for Task 2
- [ ] `useTranslations` is imported from `next-intl`
- [ ] Translation hook is initialized with `workflow.sessionSummary` namespace
- [ ] Main heading uses `t('heading')`
- [ ] Subtitle uses `t('subtitle')`
- [ ] Section headings use translation keys with count interpolation
- [ ] All button labels use translation keys
- [ ] Screen reader announcement uses translation key with pluralization
- [ ] No hardcoded English strings remain in the main component JSX
- [ ] Component renders correctly in development

---

## Task 3: Update EmptySessionState Sub-Component

**Priority**: Required
**File**: `/src/components/ItemCreationWorkflow/components/steps/SessionSummaryStep.tsx`
**Story Points**: 0.5

### 3.1 Modify EmptySessionState to Accept Translation Function

**Location**: Lines 70-103

**Option A (Recommended)**: Pass translation function via props

**Before**:
```typescript
interface EmptySessionStateProps {
  onAddItem: () => void;
}

function EmptySessionState({ onAddItem }: EmptySessionStateProps) {
```

**After**:
```typescript
interface EmptySessionStateProps {
  onAddItem: () => void;
  t: ReturnType<typeof useTranslations<'workflow.sessionSummary'>>;
}

function EmptySessionState({ onAddItem, t }: EmptySessionStateProps) {
```

### 3.2 Replace Empty State Heading

**Location**: Lines 80-82

**Before**:
```tsx
<h3 className="text-lg font-medium text-[#222222] mb-2">
  No items yet
</h3>
```

**After**:
```tsx
<h3 className="text-lg font-medium text-[#222222] mb-2">
  {t('emptyState.heading')}
</h3>
```

### 3.3 Replace Empty State Description

**Location**: Lines 83-85

**Before**:
```tsx
<p className="text-[#717171] mb-6 max-w-sm">
  You haven&apos;t created any items in this session yet. Start by adding your first item.
</p>
```

**After**:
```tsx
<p className="text-[#717171] mb-6 max-w-sm">
  {t('emptyState.description')}
</p>
```

### 3.4 Replace "Add First Item" Button Label

**Location**: Lines 98-99

**Before**:
```tsx
<Plus className="w-5 h-5" aria-hidden="true" />
Add First Item
```

**After**:
```tsx
<Plus className="w-5 h-5" aria-hidden="true" />
{t('emptyState.button')}
```

### 3.5 Update EmptySessionState Usage

**Location**: Line 209

**Before**:
```tsx
<EmptySessionState onAddItem={onAddMoreItems} />
```

**After**:
```tsx
<EmptySessionState onAddItem={onAddMoreItems} t={t} />
```

### Acceptance Criteria for Task 3
- [ ] EmptySessionState accepts translation function as prop
- [ ] Empty state heading uses translation key
- [ ] Empty state description uses translation key
- [ ] "Add First Item" button uses translation key
- [ ] EmptySessionState is invoked with `t` prop
- [ ] Component renders correctly when no items exist

---

## Task 4: Update SessionProgressBar Component

**Priority**: Required
**File**: `/src/components/ItemCreationWorkflow/components/shared/SessionProgressBar.tsx`
**Story Points**: 0.5

### 4.1 Import useTranslations Hook

**Location**: Line ~25 (imports section)

```typescript
// ADD this import
import { useTranslations } from 'next-intl';
```

### 4.2 Initialize Translation Hook

**Location**: Inside `SessionProgressBar` function, after destructuring props (around line 52)

```typescript
export function SessionProgressBar({
  itemsCreated,
  maxItems = WORKFLOW_CONFIG_DEFAULTS.maxItemsPerSession,
  showCount = true,
  className,
}: SessionProgressBarProps) {
  // ADD: Initialize translations
  const t = useTranslations('workflow.sessionProgress');

  // Calculate progress percentage, clamped at 100%
  const progressPercent = Math.min((itemsCreated / maxItems) * 100, 100);
  // ...
}
```

### 4.3 Replace Progress Bar aria-label

**Location**: Line 65

**Before**:
```tsx
aria-label={`Session progress: ${itemsCreated} items created`}
```

**After**:
```tsx
aria-label={t('ariaLabel', { count: itemsCreated })}
```

### 4.4 Replace Count Text Display

**Location**: Lines 79-81

**Before**:
```tsx
<p className="mt-1.5 text-sm text-gray-600">
  {itemsCreated} items created
</p>
```

**After**:
```tsx
<p className="mt-1.5 text-sm text-gray-600">
  {t('countText', { count: itemsCreated })}
</p>
```

### Acceptance Criteria for Task 4
- [ ] `useTranslations` is imported from `next-intl`
- [ ] Translation hook is initialized with `workflow.sessionProgress` namespace
- [ ] aria-label uses translation key with count interpolation and pluralization
- [ ] Count text display uses translation key with count interpolation and pluralization
- [ ] Progress bar renders correctly with 0, 1, and multiple items

---

## Task 5: Update SessionItemCard Component

**Priority**: Required
**File**: `/src/components/ItemCreationWorkflow/components/shared/SessionItemCard.tsx`
**Story Points**: 1

### 5.1 Import useTranslations Hook

**Location**: Line ~25 (imports section)

```typescript
// ADD this import
import { useTranslations } from 'next-intl';
```

### 5.2 Initialize Translation Hook

**Location**: Inside `SessionItemCard` function, after ref declaration (around line 218)

```typescript
export function SessionItemCard({
  item,
  isNew = false,
  onEdit,
  onRemove,
  disabled = false,
  className,
}: SessionItemCardProps) {
  // ADD: Initialize translations
  const t = useTranslations('workflow.sessionItemCard');

  // Ref for tracking object URLs for cleanup
  const urlsRef = useRef<string[]>([]);
  // ...
}
```

### 5.3 Refactor getContentCountLabel Function

**Location**: Lines 199-204

**Option A (Component-level)**: Move logic inside component using translation

**Before**:
```typescript
function getContentCountLabel(count: number): string {
  if (count === 0) return 'No content';
  if (count === 1) return '1 content piece';
  return `${count} content pieces`;
}
```

**After**: Create a helper inside the component or use translations directly:

```typescript
// Inside SessionItemCard component, after initializing t:
const getContentCountLabel = (count: number): string => {
  if (count === 0) return t('contentCount.none');
  if (count === 1) return t('contentCount.singular');
  return t('contentCount.plural', { count });
};
```

### 5.4 Replace Photo Alt Text

**Location**: Lines 124-125

**Before**:
```tsx
<img
  src={url}
  alt="Item photo"
  className="w-full h-full object-cover"
/>
```

**After**:
```tsx
<img
  src={url}
  alt={t('photoAlt')}
  className="w-full h-full object-cover"
/>
```

### 5.5 Replace Item Card aria-label

**Location**: Line 247

**Before**:
```tsx
aria-label={`${item.name} - ${getContentCountLabel(item.content.length)}`}
```

**After**:
```tsx
aria-label={t('ariaLabel', { name: item.name, contentLabel: getContentCountLabel(item.content.length) })}
```

### 5.6 Replace Room Badge aria-label

**Location**: Line 280

**Before**:
```tsx
aria-label={`Room: ${roomLabel}`}
```

**After**:
```tsx
aria-label={t('roomLabel', { room: roomLabel })}
```

### 5.7 Replace Edit Button aria-label

**Location**: Line 303

**Before**:
```tsx
aria-label={`Edit ${item.name}`}
```

**After**:
```tsx
aria-label={t('editButton', { name: item.name })}
```

### 5.8 Replace Remove Button aria-label

**Location**: Line 323

**Before**:
```tsx
aria-label={`Remove ${item.name}`}
```

**After**:
```tsx
aria-label={t('removeButton', { name: item.name })}
```

### Acceptance Criteria for Task 5
- [ ] `useTranslations` is imported from `next-intl`
- [ ] Translation hook is initialized with `workflow.sessionItemCard` namespace
- [ ] Content count label function uses translation keys
- [ ] Photo alt text uses translation key
- [ ] Item card aria-label uses translation key with interpolation
- [ ] Room badge aria-label uses translation key with interpolation
- [ ] Edit button aria-label uses translation key with interpolation
- [ ] Remove button aria-label uses translation key with interpolation
- [ ] No hardcoded English strings remain in the component

---

## Task 6: Update RemoveItemDialog Component

**Priority**: Required
**File**: `/src/components/ItemCreationWorkflow/components/shared/RemoveItemDialog.tsx`
**Story Points**: 0.5

### 6.1 Import useTranslations Hook

**Location**: Line ~15 (imports section)

```typescript
// ADD this import
import { useTranslations } from 'next-intl';
```

### 6.2 Initialize Translation Hook

**Location**: Inside `RemoveItemDialog` function, after ref declarations (around line 50)

```typescript
export function RemoveItemDialog({
  isOpen,
  itemName,
  onClose,
  onConfirmRemove,
  className,
}: RemoveItemDialogProps) {
  // ADD: Initialize translations
  const t = useTranslations('workflow.removeItemDialog');

  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  // ...
}
```

### 6.3 Replace Dialog Heading

**Location**: Lines 119-123

**Before**:
```tsx
<h3
  id="remove-dialog-title"
  className="text-lg font-semibold text-[#222222]"
>
  Remove Item?
</h3>
```

**After**:
```tsx
<h3
  id="remove-dialog-title"
  className="text-lg font-semibold text-[#222222]"
>
  {t('heading')}
</h3>
```

### 6.4 Replace Dialog Message

**Location**: Lines 125-129

**Before**:
```tsx
<p
  id="remove-dialog-description"
  className="mt-2 text-sm text-[#717171]"
>
  Are you sure you want to remove &ldquo;{displayName}&rdquo;? This action cannot be undone.
</p>
```

**After**:
```tsx
<p
  id="remove-dialog-description"
  className="mt-2 text-sm text-[#717171]"
>
  {t('message', { name: displayName })}
</p>
```

### 6.5 Replace Cancel Button Label

**Location**: Line 150

**Before**:
```tsx
>
  Cancel
</button>
```

**After**:
```tsx
>
  {t('buttons.cancel')}
</button>
```

### 6.6 Replace Remove Button Label

**Location**: Line 167

**Before**:
```tsx
>
  Remove
</button>
```

**After**:
```tsx
>
  {t('buttons.remove')}
</button>
```

### Acceptance Criteria for Task 6
- [ ] `useTranslations` is imported from `next-intl`
- [ ] Translation hook is initialized with `workflow.removeItemDialog` namespace
- [ ] Dialog heading uses translation key
- [ ] Dialog message uses translation key with name interpolation
- [ ] Cancel button uses translation key
- [ ] Remove button uses translation key
- [ ] Dialog renders correctly with various item name lengths

---

## Task 7: Generate Non-English Translations

**Priority**: Required
**Files**: 5 translation files
**Story Points**: 1

### 7.1 French Translations (`/messages/fr.json`)

Add the following under the `workflow` namespace:

```json
{
  "workflow": {
    "sessionSummary": {
      "heading": "Resume de la session",
      "subtitle": "Verifiez vos elements avant l'impression",
      "emptyState": {
        "heading": "Aucun element",
        "description": "Vous n'avez pas encore cree d'elements dans cette session. Commencez par ajouter votre premier element.",
        "button": "Ajouter le premier element"
      },
      "sections": {
        "newItems": "Nouveaux elements de cette session ({count})",
        "existingItems": "Elements crees precedemment ({count})"
      },
      "buttons": {
        "addMore": "Ajouter plus d'elements",
        "printQrCodes": "Imprimer les codes QR",
        "skipFinish": "Passer et terminer"
      },
      "announcements": {
        "stepSummary": "Etape : Resume de la session - {count, plural, =0 {aucun element cree} one {# element cree} other {# elements crees}} dans cette session."
      }
    },
    "sessionProgress": {
      "ariaLabel": "Progression de la session : {count, plural, =0 {aucun element cree} one {# element cree} other {# elements crees}}",
      "countText": "{count, plural, =0 {0 element cree} one {# element cree} other {# elements crees}}"
    },
    "sessionItemCard": {
      "contentCount": {
        "none": "Aucun contenu",
        "singular": "1 piece de contenu",
        "plural": "{count} pieces de contenu"
      },
      "photoAlt": "Photo de l'element",
      "ariaLabel": "{name} - {contentLabel}",
      "roomLabel": "Piece : {room}",
      "editButton": "Modifier {name}",
      "removeButton": "Supprimer {name}"
    },
    "removeItemDialog": {
      "heading": "Supprimer l'element ?",
      "message": "Etes-vous sur de vouloir supprimer \"{name}\" ? Cette action est irreversible.",
      "buttons": {
        "cancel": "Annuler",
        "remove": "Supprimer"
      }
    }
  }
}
```

### 7.2 Spanish Translations (`/messages/es.json`)

```json
{
  "workflow": {
    "sessionSummary": {
      "heading": "Resumen de la sesion",
      "subtitle": "Revisa tus elementos antes de imprimir",
      "emptyState": {
        "heading": "Sin elementos",
        "description": "Aun no has creado ningun elemento en esta sesion. Comienza agregando tu primer elemento.",
        "button": "Agregar primer elemento"
      },
      "sections": {
        "newItems": "Nuevos elementos en esta sesion ({count})",
        "existingItems": "Elementos creados anteriormente ({count})"
      },
      "buttons": {
        "addMore": "Agregar mas elementos",
        "printQrCodes": "Imprimir codigos QR",
        "skipFinish": "Omitir y finalizar"
      },
      "announcements": {
        "stepSummary": "Paso: Resumen de la sesion - {count, plural, =0 {ningun elemento creado} one {# elemento creado} other {# elementos creados}} en esta sesion."
      }
    },
    "sessionProgress": {
      "ariaLabel": "Progreso de la sesion: {count, plural, =0 {ningun elemento creado} one {# elemento creado} other {# elementos creados}}",
      "countText": "{count, plural, =0 {0 elementos creados} one {# elemento creado} other {# elementos creados}}"
    },
    "sessionItemCard": {
      "contentCount": {
        "none": "Sin contenido",
        "singular": "1 pieza de contenido",
        "plural": "{count} piezas de contenido"
      },
      "photoAlt": "Foto del elemento",
      "ariaLabel": "{name} - {contentLabel}",
      "roomLabel": "Habitacion: {room}",
      "editButton": "Editar {name}",
      "removeButton": "Eliminar {name}"
    },
    "removeItemDialog": {
      "heading": "Eliminar elemento?",
      "message": "Estas seguro de que quieres eliminar \"{name}\"? Esta accion no se puede deshacer.",
      "buttons": {
        "cancel": "Cancelar",
        "remove": "Eliminar"
      }
    }
  }
}
```

### 7.3 German Translations (`/messages/de.json`)

```json
{
  "workflow": {
    "sessionSummary": {
      "heading": "Sitzungsubersicht",
      "subtitle": "Uberprufen Sie Ihre Elemente vor dem Drucken",
      "emptyState": {
        "heading": "Noch keine Elemente",
        "description": "Sie haben in dieser Sitzung noch keine Elemente erstellt. Beginnen Sie mit dem Hinzufugen Ihres ersten Elements.",
        "button": "Erstes Element hinzufugen"
      },
      "sections": {
        "newItems": "Neue Elemente in dieser Sitzung ({count})",
        "existingItems": "Zuvor erstellte Elemente ({count})"
      },
      "buttons": {
        "addMore": "Weitere Elemente hinzufugen",
        "printQrCodes": "QR-Codes drucken",
        "skipFinish": "Uberspringen und beenden"
      },
      "announcements": {
        "stepSummary": "Schritt: Sitzungsubersicht - {count, plural, =0 {keine Elemente erstellt} one {# Element erstellt} other {# Elemente erstellt}} in dieser Sitzung."
      }
    },
    "sessionProgress": {
      "ariaLabel": "Sitzungsfortschritt: {count, plural, =0 {keine Elemente erstellt} one {# Element erstellt} other {# Elemente erstellt}}",
      "countText": "{count, plural, =0 {0 Elemente erstellt} one {# Element erstellt} other {# Elemente erstellt}}"
    },
    "sessionItemCard": {
      "contentCount": {
        "none": "Kein Inhalt",
        "singular": "1 Inhaltsstuck",
        "plural": "{count} Inhaltsstucke"
      },
      "photoAlt": "Elementfoto",
      "ariaLabel": "{name} - {contentLabel}",
      "roomLabel": "Raum: {room}",
      "editButton": "{name} bearbeiten",
      "removeButton": "{name} entfernen"
    },
    "removeItemDialog": {
      "heading": "Element entfernen?",
      "message": "Sind Sie sicher, dass Sie \"{name}\" entfernen mochten? Diese Aktion kann nicht ruckgangig gemacht werden.",
      "buttons": {
        "cancel": "Abbrechen",
        "remove": "Entfernen"
      }
    }
  }
}
```

### 7.4 Dutch Translations (`/messages/nl.json`)

```json
{
  "workflow": {
    "sessionSummary": {
      "heading": "Sessieoverzicht",
      "subtitle": "Controleer uw items voordat u ze afdrukt",
      "emptyState": {
        "heading": "Nog geen items",
        "description": "U heeft nog geen items gemaakt in deze sessie. Begin met het toevoegen van uw eerste item.",
        "button": "Eerste item toevoegen"
      },
      "sections": {
        "newItems": "Nieuwe items in deze sessie ({count})",
        "existingItems": "Eerder gemaakte items ({count})"
      },
      "buttons": {
        "addMore": "Meer items toevoegen",
        "printQrCodes": "QR-codes afdrukken",
        "skipFinish": "Overslaan en afronden"
      },
      "announcements": {
        "stepSummary": "Stap: Sessieoverzicht - {count, plural, =0 {geen items gemaakt} one {# item gemaakt} other {# items gemaakt}} in deze sessie."
      }
    },
    "sessionProgress": {
      "ariaLabel": "Sessievoortgang: {count, plural, =0 {geen items gemaakt} one {# item gemaakt} other {# items gemaakt}}",
      "countText": "{count, plural, =0 {0 items gemaakt} one {# item gemaakt} other {# items gemaakt}}"
    },
    "sessionItemCard": {
      "contentCount": {
        "none": "Geen inhoud",
        "singular": "1 inhoudsstuk",
        "plural": "{count} inhoudsstukken"
      },
      "photoAlt": "Itemfoto",
      "ariaLabel": "{name} - {contentLabel}",
      "roomLabel": "Kamer: {room}",
      "editButton": "{name} bewerken",
      "removeButton": "{name} verwijderen"
    },
    "removeItemDialog": {
      "heading": "Item verwijderen?",
      "message": "Weet u zeker dat u \"{name}\" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      "buttons": {
        "cancel": "Annuleren",
        "remove": "Verwijderen"
      }
    }
  }
}
```

### 7.5 Italian Translations (`/messages/it.json`)

```json
{
  "workflow": {
    "sessionSummary": {
      "heading": "Riepilogo sessione",
      "subtitle": "Rivedi i tuoi elementi prima della stampa",
      "emptyState": {
        "heading": "Nessun elemento",
        "description": "Non hai ancora creato elementi in questa sessione. Inizia aggiungendo il tuo primo elemento.",
        "button": "Aggiungi primo elemento"
      },
      "sections": {
        "newItems": "Nuovi elementi in questa sessione ({count})",
        "existingItems": "Elementi creati in precedenza ({count})"
      },
      "buttons": {
        "addMore": "Aggiungi altri elementi",
        "printQrCodes": "Stampa codici QR",
        "skipFinish": "Salta e termina"
      },
      "announcements": {
        "stepSummary": "Passaggio: Riepilogo sessione - {count, plural, =0 {nessun elemento creato} one {# elemento creato} other {# elementi creati}} in questa sessione."
      }
    },
    "sessionProgress": {
      "ariaLabel": "Progresso sessione: {count, plural, =0 {nessun elemento creato} one {# elemento creato} other {# elementi creati}}",
      "countText": "{count, plural, =0 {0 elementi creati} one {# elemento creato} other {# elementi creati}}"
    },
    "sessionItemCard": {
      "contentCount": {
        "none": "Nessun contenuto",
        "singular": "1 pezzo di contenuto",
        "plural": "{count} pezzi di contenuto"
      },
      "photoAlt": "Foto dell'elemento",
      "ariaLabel": "{name} - {contentLabel}",
      "roomLabel": "Stanza: {room}",
      "editButton": "Modifica {name}",
      "removeButton": "Rimuovi {name}"
    },
    "removeItemDialog": {
      "heading": "Rimuovere l'elemento?",
      "message": "Sei sicuro di voler rimuovere \"{name}\"? Questa azione non puo essere annullata.",
      "buttons": {
        "cancel": "Annulla",
        "remove": "Rimuovi"
      }
    }
  }
}
```

### Acceptance Criteria for Task 7
- [ ] French translations added to `/messages/fr.json`
- [ ] Spanish translations added to `/messages/es.json`
- [ ] German translations added to `/messages/de.json`
- [ ] Dutch translations added to `/messages/nl.json`
- [ ] Italian translations added to `/messages/it.json`
- [ ] All JSON files are valid (no syntax errors)
- [ ] ICU pluralization format is correct for each language
- [ ] Variable interpolation placeholders match English keys
- [ ] Build completes without errors

---

## Task 8: Update Unit Tests

**Priority**: Required
**Files**: Test files in `__tests__` directories
**Story Points**: 0.5

### 8.1 Create/Update Test Utilities for Translations

If not already present, create a mock for `next-intl`:

```typescript
// In test setup or individual test files
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    // Return the key or a simple mock for testing
    if (params) {
      let result = key;
      Object.entries(params).forEach(([k, v]) => {
        result = `${result} ${k}=${v}`;
      });
      return result;
    }
    return key;
  },
}));
```

### 8.2 Update SessionSummaryStep Tests

**File**: `/src/components/ItemCreationWorkflow/components/steps/__tests__/SessionSummaryStep.test.tsx`

- Mock `useTranslations` hook
- Update assertions to check for translation keys instead of hardcoded strings
- Test that translation function is called with correct keys

### 8.3 Update SessionProgressBar Tests (if exists)

**File**: `/src/components/ItemCreationWorkflow/components/shared/__tests__/SessionProgressBar.test.tsx`

- Mock `useTranslations` hook
- Verify aria-label uses translation

### 8.4 Update SessionItemCard Tests (if exists)

**File**: `/src/components/ItemCreationWorkflow/components/shared/__tests__/SessionItemCard.test.tsx`

- Mock `useTranslations` hook
- Verify content count labels use translations
- Verify aria-labels use translations

### 8.5 Update RemoveItemDialog Tests (if exists)

**File**: `/src/components/ItemCreationWorkflow/components/shared/__tests__/RemoveItemDialog.test.tsx`

- Mock `useTranslations` hook
- Verify dialog content uses translations

### Acceptance Criteria for Task 8
- [ ] Test mocks for `useTranslations` are in place
- [ ] All existing tests pass with translation changes
- [ ] Tests verify translation keys are used correctly
- [ ] No test failures related to internationalization

---

## Task 9: Manual Testing and Validation

**Priority**: Required
**Story Points**: 1

### 9.1 Development Environment Testing

1. Start development server: `npm run dev`
2. Navigate to the item creation workflow
3. Complete steps 1-8 to reach SessionSummaryStep
4. Verify:
   - [ ] Main heading displays correctly
   - [ ] Subtitle displays correctly
   - [ ] Section headings display with correct counts
   - [ ] All buttons display correct labels
   - [ ] Empty state displays when no items

### 9.2 Language Switching Tests

For each language (en, fr, es, de, nl, it):

1. Switch to the language using LanguageSwitcher
2. Navigate to SessionSummaryStep
3. Verify:
   - [ ] Main heading is translated
   - [ ] Subtitle is translated
   - [ ] Section headings are translated with correct counts
   - [ ] Button labels are translated
   - [ ] Empty state is fully translated
   - [ ] Remove dialog is translated

### 9.3 Pluralization Tests

1. Test with 0 items created
2. Test with 1 item created
3. Test with 5 items created
4. Verify pluralization works correctly in:
   - [ ] Screen reader announcements
   - [ ] Session progress bar
   - [ ] Content count labels

### 9.4 Accessibility Testing

1. Use screen reader (VoiceOver/NVDA)
2. Verify:
   - [ ] Screen reader announcements are correct
   - [ ] All aria-labels are translated
   - [ ] Progress bar aria-label is correct
   - [ ] Item card aria-labels are correct
   - [ ] Dialog is announced correctly

### 9.5 Layout Testing

Test with German (longest translations, ~40% longer):

1. Verify no text overflow in:
   - [ ] Heading area
   - [ ] Button labels
   - [ ] Section headers
   - [ ] Dialog content
2. Verify layouts don't break
3. Verify buttons remain properly sized

### 9.6 Console Verification

1. Open browser developer console
2. Navigate through SessionSummaryStep in each language
3. Verify:
   - [ ] No "Missing translation" warnings
   - [ ] No console errors related to i18n
   - [ ] No TypeScript errors

### Acceptance Criteria for Task 9
- [ ] All strings render correctly in all 6 languages
- [ ] Pluralization works for 0, 1, and multiple items
- [ ] Layout accommodates longer translations (German)
- [ ] Screen reader announcements work in all languages
- [ ] No missing translation warnings in console
- [ ] All existing functionality works with translations
- [ ] Remove dialog functions correctly with translated buttons

---

## Implementation Summary

### Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `/messages/en.json` | Add workflow namespaces | Required |
| `/messages/fr.json` | Add French translations | Required |
| `/messages/es.json` | Add Spanish translations | Required |
| `/messages/de.json` | Add German translations | Required |
| `/messages/nl.json` | Add Dutch translations | Required |
| `/messages/it.json` | Add Italian translations | Required |
| `SessionSummaryStep.tsx` | Import hook, replace 12 strings | Required |
| `SessionProgressBar.tsx` | Import hook, replace 2 strings | Required |
| `SessionItemCard.tsx` | Import hook, replace 8 strings | Required |
| `RemoveItemDialog.tsx` | Import hook, replace 4 strings | Required |
| Test files | Update mocks | Required |

### Total String Count

| Component | String Count |
|-----------|-------------|
| SessionSummaryStep main | 12 |
| EmptySessionState | Included above |
| SessionProgressBar | 2 |
| SessionItemCard | 8 |
| RemoveItemDialog | 4 |
| **Total Unique Strings** | **~26** |
| **Total Across 6 Languages** | **~156** |

---

## Rollback Plan

If issues are encountered:

1. **Revert Component Changes**: Git revert changes to the 4 component files
2. **Keep Translation Files**: Translation files are additive and won't break existing functionality
3. **Partial Rollback**: Can revert individual components if only specific ones have issues

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Overview Document: REQ-380](/docs/REQ-380-update-sessionsummarystep-overview.md)
- [Request Document](/docs/gen_requests_epic2.md) - REQ-380
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2, Sub-Epic 2C - Item Creation Workflow, Task 2C.10*
*Document created: 2026-01-19 17:30 UTC*
