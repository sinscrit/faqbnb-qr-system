# REQ-338: Create Common Namespace Structure in Translation Files - Detailed Implementation

**Document Created:** 2026-01-19 14:30:00 UTC
**Last Modified:** 2026-01-19 14:30:00 UTC
**Request Reference:** docs/gen_requests_epic2.md - REQ-338
**Overview Document:** docs/REQ-338-create-common-namespace-structure-in-overview.md
**Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md

---

## Document Purpose

This document provides a detailed, step-by-step implementation guide for REQ-338, breaking down the task into actionable items that can be executed by an AI coding agent or junior developer. Each task is designed to be approximately 1 story point and includes specific instructions, code examples, and verification steps.

---

## Context Summary

### Current State
- **File**: `/messages/en.json`
- **Common namespace**: Contains ~35 flat keys (save, cancel, delete, etc.)
- **Structure**: Flat key-value pairs without nested subcategories
- **Other language files**: `/messages/{fr,es,de,nl,it}.json` exist with similar structure

### Target State
- **Common namespace**: Reorganized into nested subcategories:
  - `common.actions` (~30 keys)
  - `common.navigation` (~10 keys)
  - `common.forms` (~15 keys)
  - `common.status` (~12 keys)
  - `common.loading` (~8 keys)
  - `common.time` (~10 keys)
  - `common.validation` (~10 keys)
  - `common.confirmation` (~8 keys)
  - `common.pagination` (~6 keys)
  - `common.accessibility` (~8 keys)
  - `common.labels` (~10 keys)

### Dependencies
- Epic 1 complete (next-intl installed and configured)
- `/src/lib/i18n/config.ts` exists with locale configuration
- All 6 translation files exist

---

## Task Breakdown

### Task 1: Backup and Audit Current Common Namespace

**Objective**: Document current common namespace keys before restructuring

**Steps**:

1. Read `/messages/en.json` and document all existing keys in the `common` namespace

2. Create a mapping table showing each existing key and its target location in the new structure:

   | Current Key | Target Location |
   |-------------|-----------------|
   | `common.save` | `common.actions.save` |
   | `common.cancel` | `common.actions.cancel` |
   | `common.delete` | `common.actions.delete` |
   | `common.edit` | `common.actions.edit` |
   | `common.create` | `common.actions.create` |
   | `common.loading` | `common.status.loading` |
   | `common.error` | `common.status.error` |
   | `common.success` | `common.status.success` |
   | `common.confirm` | `common.actions.confirm` |
   | `common.back` | `common.navigation.back` |
   | `common.next` | `common.navigation.next` |
   | `common.close` | `common.actions.close` |
   | `common.search` | `common.actions.search` |
   | `common.filter` | `common.actions.filter` |
   | `common.sort` | `common.actions.sort` |
   | `common.actions` | `common.labels.actions` |
   | `common.yes` | `common.confirmation.yes` |
   | `common.no` | `common.confirmation.no` |
   | `common.submit` | `common.actions.submit` |
   | `common.reset` | `common.actions.reset` |
   | `common.clear` | `common.actions.clear` |
   | `common.select` | `common.labels.select` |
   | `common.view` | `common.actions.view` |
   | `common.download` | `common.actions.download` |
   | `common.upload` | `common.actions.upload` |
   | `common.copy` | `common.actions.copy` |
   | `common.share` | `common.actions.share` |
   | `common.more` | `common.labels.more` |
   | `common.less` | `common.labels.less` |
   | `common.all` | `common.labels.all` |
   | `common.none` | `common.labels.none` |
   | `common.optional` | `common.labels.optional` |
   | `common.required` | `common.labels.required` |

**Verification**:
- [ ] All 35 existing keys have been mapped to new locations
- [ ] No existing keys will be lost in the restructure

**Estimated Effort**: 15 minutes

---

### Task 2: Restructure Common Namespace in en.json - Actions Subsection

**Objective**: Create the `common.actions` subsection with all action-related keys

**File to Modify**: `/messages/en.json`

**Changes**:

Replace the flat `common` object with a nested structure starting with `actions`:

```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "submit": "Submit",
      "close": "Close",
      "confirm": "Confirm",
      "done": "Done",
      "continue": "Continue",
      "retry": "Retry",
      "refresh": "Refresh",
      "search": "Search",
      "filter": "Filter",
      "sort": "Sort",
      "clear": "Clear",
      "reset": "Reset",
      "apply": "Apply",
      "view": "View",
      "viewAll": "View All",
      "showMore": "Show More",
      "showLess": "Show Less",
      "selectAll": "Select All",
      "deselectAll": "Deselect All",
      "download": "Download",
      "upload": "Upload",
      "copy": "Copy",
      "share": "Share",
      "add": "Add",
      "remove": "Remove"
    }
  }
}
```

**Key Additions** (beyond existing keys):
- `done` - Completion action
- `continue` - Progress action
- `retry` - Error recovery action
- `refresh` - Reload action
- `apply` - Apply changes action
- `viewAll` - View all items action
- `showMore` / `showLess` - Expand/collapse actions
- `selectAll` / `deselectAll` - Bulk selection actions
- `add` / `remove` - Generic add/remove actions

**Verification**:
- [ ] JSON syntax is valid (no trailing commas, proper quoting)
- [ ] All 30 action keys are present
- [ ] Keys are alphabetically ordered for maintainability

**Estimated Effort**: 20 minutes

---

### Task 3: Add Navigation Subsection to en.json

**Objective**: Create the `common.navigation` subsection

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": {
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      "first": "First",
      "last": "Last",
      "home": "Home",
      "goTo": "Go to",
      "jumpTo": "Jump to",
      "skip": "Skip",
      "exit": "Exit"
    }
  }
}
```

**Verification**:
- [ ] All 10 navigation keys are present
- [ ] JSON syntax remains valid

**Estimated Effort**: 10 minutes

---

### Task 4: Add Forms Subsection to en.json

**Objective**: Create the `common.forms` subsection for form-related labels

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": { ... },
    "forms": {
      "email": "Email",
      "emailPlaceholder": "Enter your email",
      "password": "Password",
      "passwordPlaceholder": "Enter your password",
      "name": "Name",
      "namePlaceholder": "Enter your name",
      "description": "Description",
      "descriptionPlaceholder": "Enter a description",
      "phone": "Phone",
      "phonePlaceholder": "Enter phone number",
      "address": "Address",
      "addressPlaceholder": "Enter address",
      "enterValue": "Enter a value",
      "selectOption": "Select an option",
      "typeToSearch": "Type to search..."
    }
  }
}
```

**Verification**:
- [ ] All 15 form keys are present
- [ ] Placeholder text is descriptive and helpful

**Estimated Effort**: 10 minutes

---

### Task 5: Add Status Subsection to en.json

**Objective**: Create the `common.status` subsection for state indicators

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": { ... },
    "forms": { ... },
    "status": {
      "loading": "Loading...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "processing": "Processing...",
      "success": "Success",
      "error": "Error",
      "pending": "Pending",
      "completed": "Completed",
      "failed": "Failed",
      "active": "Active",
      "inactive": "Inactive",
      "enabled": "Enabled",
      "disabled": "Disabled",
      "online": "Online",
      "offline": "Offline"
    }
  }
}
```

**Verification**:
- [ ] All 15 status keys are present
- [ ] Status strings use consistent capitalization

**Estimated Effort**: 10 minutes

---

### Task 6: Add Loading Subsection to en.json

**Objective**: Create the `common.loading` subsection for detailed loading states

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": { ... },
    "forms": { ... },
    "status": { ... },
    "loading": {
      "default": "Loading...",
      "pleaseWait": "Please wait...",
      "loadingData": "Loading data...",
      "loadingItems": "Loading items...",
      "loadingContent": "Loading content...",
      "preparingData": "Preparing data...",
      "almostDone": "Almost done...",
      "thisMayTakeMoment": "This may take a moment..."
    }
  }
}
```

**Verification**:
- [ ] All 8 loading keys are present
- [ ] Messages are user-friendly and informative

**Estimated Effort**: 10 minutes

---

### Task 7: Add Time Subsection to en.json with ICU Pluralization

**Objective**: Create the `common.time` subsection with relative time expressions

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": { ... },
    "forms": { ... },
    "status": { ... },
    "loading": { ... },
    "time": {
      "justNow": "Just now",
      "minutesAgo": "{count} {count, plural, one {minute} other {minutes}} ago",
      "hoursAgo": "{count} {count, plural, one {hour} other {hours}} ago",
      "daysAgo": "{count} {count, plural, one {day} other {days}} ago",
      "weeksAgo": "{count} {count, plural, one {week} other {weeks}} ago",
      "monthsAgo": "{count} {count, plural, one {month} other {months}} ago",
      "today": "Today",
      "yesterday": "Yesterday",
      "tomorrow": "Tomorrow",
      "thisWeek": "This week"
    }
  }
}
```

**ICU Format Notes**:
- `{count}` is the variable placeholder
- `{count, plural, one {singular} other {plural}}` handles pluralization
- Example usage: `t('time.minutesAgo', { count: 5 })` → "5 minutes ago"

**Verification**:
- [ ] All 10 time keys are present
- [ ] ICU pluralization syntax is correct (test with next-intl)
- [ ] Singular/plural forms are grammatically correct

**Estimated Effort**: 15 minutes

---

### Task 8: Add Validation Subsection to en.json

**Objective**: Create the `common.validation` subsection for form validation messages

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": { ... },
    "forms": { ... },
    "status": { ... },
    "loading": { ... },
    "time": { ... },
    "validation": {
      "required": "This field is required",
      "invalidEmail": "Please enter a valid email address",
      "invalidPhone": "Please enter a valid phone number",
      "invalidUrl": "Please enter a valid URL",
      "tooShort": "Must be at least {min} characters",
      "tooLong": "Must be less than {max} characters",
      "minValue": "Must be at least {min}",
      "maxValue": "Must be no more than {max}",
      "invalidFormat": "Invalid format",
      "passwordMismatch": "Passwords do not match"
    }
  }
}
```

**Variable Interpolation Notes**:
- `{min}` and `{max}` are variables passed at runtime
- Example usage: `t('validation.tooShort', { min: 8 })` → "Must be at least 8 characters"

**Verification**:
- [ ] All 10 validation keys are present
- [ ] Variable placeholders use proper ICU syntax `{varName}`
- [ ] Messages are clear and actionable

**Estimated Effort**: 10 minutes

---

### Task 9: Add Confirmation Subsection to en.json

**Objective**: Create the `common.confirmation` subsection for dialog prompts

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": { ... },
    "forms": { ... },
    "status": { ... },
    "loading": { ... },
    "time": { ... },
    "validation": { ... },
    "confirmation": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Delete",
      "deleteMessage": "Are you sure you want to delete this? This action cannot be undone.",
      "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?",
      "yes": "Yes",
      "no": "No",
      "areYouSure": "Are you sure?",
      "cannotBeUndone": "This action cannot be undone."
    }
  }
}
```

**Verification**:
- [ ] All 8 confirmation keys are present
- [ ] Messages clearly communicate consequences of actions

**Estimated Effort**: 10 minutes

---

### Task 10: Add Pagination Subsection to en.json

**Objective**: Create the `common.pagination` subsection for list navigation

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": { ... },
    "forms": { ... },
    "status": { ... },
    "loading": { ... },
    "time": { ... },
    "validation": { ... },
    "confirmation": { ... },
    "pagination": {
      "previous": "Previous",
      "next": "Next",
      "page": "Page {current} of {total}",
      "showing": "Showing {start} to {end} of {total}",
      "itemsPerPage": "Items per page",
      "goToPage": "Go to page"
    }
  }
}
```

**Variable Interpolation Notes**:
- `{current}`, `{total}`, `{start}`, `{end}` are variables
- Example: `t('pagination.page', { current: 1, total: 10 })` → "Page 1 of 10"

**Verification**:
- [ ] All 6 pagination keys are present
- [ ] Variable placeholders are correctly positioned

**Estimated Effort**: 10 minutes

---

### Task 11: Add Accessibility Subsection to en.json

**Objective**: Create the `common.accessibility` subsection for screen reader text

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": { ... },
    "forms": { ... },
    "status": { ... },
    "loading": { ... },
    "time": { ... },
    "validation": { ... },
    "confirmation": { ... },
    "pagination": { ... },
    "accessibility": {
      "loading": "Loading, please wait",
      "menuOpen": "Menu is open",
      "menuClosed": "Menu is closed",
      "expandedSection": "Section expanded",
      "collapsedSection": "Section collapsed",
      "selectedItem": "Selected: {item}",
      "requiredField": "Required field",
      "closeDialog": "Close dialog"
    }
  }
}
```

**Accessibility Notes**:
- These strings are for ARIA labels and screen reader announcements
- They should be concise but descriptive

**Verification**:
- [ ] All 8 accessibility keys are present
- [ ] Strings are appropriate for screen reader users

**Estimated Effort**: 10 minutes

---

### Task 12: Add Labels Subsection to en.json

**Objective**: Create the `common.labels` subsection for general-purpose labels

**File to Modify**: `/messages/en.json`

**Add the following under `common`**:

```json
{
  "common": {
    "actions": { ... },
    "navigation": { ... },
    "forms": { ... },
    "status": { ... },
    "loading": { ... },
    "time": { ... },
    "validation": { ... },
    "confirmation": { ... },
    "pagination": { ... },
    "accessibility": { ... },
    "labels": {
      "actions": "Actions",
      "select": "Select",
      "optional": "Optional",
      "required": "Required",
      "all": "All",
      "none": "None",
      "more": "More",
      "less": "Less",
      "other": "Other",
      "total": "Total"
    }
  }
}
```

**Verification**:
- [ ] All 10 label keys are present
- [ ] Keys that were moved from flat structure are properly placed

**Estimated Effort**: 10 minutes

---

### Task 13: Finalize and Validate en.json Structure

**Objective**: Ensure the complete en.json file is valid and properly structured

**File to Modify**: `/messages/en.json`

**Complete Target Structure**:

```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "edit": "Edit",
      "create": "Create",
      "submit": "Submit",
      "close": "Close",
      "confirm": "Confirm",
      "done": "Done",
      "continue": "Continue",
      "retry": "Retry",
      "refresh": "Refresh",
      "search": "Search",
      "filter": "Filter",
      "sort": "Sort",
      "clear": "Clear",
      "reset": "Reset",
      "apply": "Apply",
      "view": "View",
      "viewAll": "View All",
      "showMore": "Show More",
      "showLess": "Show Less",
      "selectAll": "Select All",
      "deselectAll": "Deselect All",
      "download": "Download",
      "upload": "Upload",
      "copy": "Copy",
      "share": "Share",
      "add": "Add",
      "remove": "Remove"
    },
    "navigation": {
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      "first": "First",
      "last": "Last",
      "home": "Home",
      "goTo": "Go to",
      "jumpTo": "Jump to",
      "skip": "Skip",
      "exit": "Exit"
    },
    "forms": {
      "email": "Email",
      "emailPlaceholder": "Enter your email",
      "password": "Password",
      "passwordPlaceholder": "Enter your password",
      "name": "Name",
      "namePlaceholder": "Enter your name",
      "description": "Description",
      "descriptionPlaceholder": "Enter a description",
      "phone": "Phone",
      "phonePlaceholder": "Enter phone number",
      "address": "Address",
      "addressPlaceholder": "Enter address",
      "enterValue": "Enter a value",
      "selectOption": "Select an option",
      "typeToSearch": "Type to search..."
    },
    "status": {
      "loading": "Loading...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "processing": "Processing...",
      "success": "Success",
      "error": "Error",
      "pending": "Pending",
      "completed": "Completed",
      "failed": "Failed",
      "active": "Active",
      "inactive": "Inactive",
      "enabled": "Enabled",
      "disabled": "Disabled",
      "online": "Online",
      "offline": "Offline"
    },
    "loading": {
      "default": "Loading...",
      "pleaseWait": "Please wait...",
      "loadingData": "Loading data...",
      "loadingItems": "Loading items...",
      "loadingContent": "Loading content...",
      "preparingData": "Preparing data...",
      "almostDone": "Almost done...",
      "thisMayTakeMoment": "This may take a moment..."
    },
    "time": {
      "justNow": "Just now",
      "minutesAgo": "{count} {count, plural, one {minute} other {minutes}} ago",
      "hoursAgo": "{count} {count, plural, one {hour} other {hours}} ago",
      "daysAgo": "{count} {count, plural, one {day} other {days}} ago",
      "weeksAgo": "{count} {count, plural, one {week} other {weeks}} ago",
      "monthsAgo": "{count} {count, plural, one {month} other {months}} ago",
      "today": "Today",
      "yesterday": "Yesterday",
      "tomorrow": "Tomorrow",
      "thisWeek": "This week"
    },
    "validation": {
      "required": "This field is required",
      "invalidEmail": "Please enter a valid email address",
      "invalidPhone": "Please enter a valid phone number",
      "invalidUrl": "Please enter a valid URL",
      "tooShort": "Must be at least {min} characters",
      "tooLong": "Must be less than {max} characters",
      "minValue": "Must be at least {min}",
      "maxValue": "Must be no more than {max}",
      "invalidFormat": "Invalid format",
      "passwordMismatch": "Passwords do not match"
    },
    "confirmation": {
      "title": "Confirm Action",
      "deleteTitle": "Confirm Delete",
      "deleteMessage": "Are you sure you want to delete this? This action cannot be undone.",
      "unsavedChanges": "You have unsaved changes. Are you sure you want to leave?",
      "yes": "Yes",
      "no": "No",
      "areYouSure": "Are you sure?",
      "cannotBeUndone": "This action cannot be undone."
    },
    "pagination": {
      "previous": "Previous",
      "next": "Next",
      "page": "Page {current} of {total}",
      "showing": "Showing {start} to {end} of {total}",
      "itemsPerPage": "Items per page",
      "goToPage": "Go to page"
    },
    "accessibility": {
      "loading": "Loading, please wait",
      "menuOpen": "Menu is open",
      "menuClosed": "Menu is closed",
      "expandedSection": "Section expanded",
      "collapsedSection": "Section collapsed",
      "selectedItem": "Selected: {item}",
      "requiredField": "Required field",
      "closeDialog": "Close dialog"
    },
    "labels": {
      "actions": "Actions",
      "select": "Select",
      "optional": "Optional",
      "required": "Required",
      "all": "All",
      "none": "None",
      "more": "More",
      "less": "Less",
      "other": "Other",
      "total": "Total"
    }
  },
  "auth": { ... },
  "dashboard": { ... },
  "items": { ... },
  "errors": { ... },
  "language": { ... }
}
```

**Validation Steps**:
1. Run JSON validator: `cat messages/en.json | jq .` (should succeed without errors)
2. Start development server: `npm run dev`
3. Check console for i18n errors

**Verification**:
- [ ] JSON is syntactically valid
- [ ] All 11 subsections are present under `common`
- [ ] Total of ~117 keys in the common namespace
- [ ] No orphaned or duplicate keys
- [ ] Application starts without i18n errors

**Estimated Effort**: 20 minutes

---

### Task 14: Update French Translation File (fr.json)

**Objective**: Apply same nested structure to French translations

**File to Modify**: `/messages/fr.json`

**Full Common Namespace (French)**:

```json
{
  "common": {
    "actions": {
      "save": "Enregistrer",
      "cancel": "Annuler",
      "delete": "Supprimer",
      "edit": "Modifier",
      "create": "Créer",
      "submit": "Soumettre",
      "close": "Fermer",
      "confirm": "Confirmer",
      "done": "Terminé",
      "continue": "Continuer",
      "retry": "Réessayer",
      "refresh": "Actualiser",
      "search": "Rechercher",
      "filter": "Filtrer",
      "sort": "Trier",
      "clear": "Effacer",
      "reset": "Réinitialiser",
      "apply": "Appliquer",
      "view": "Voir",
      "viewAll": "Voir tout",
      "showMore": "Afficher plus",
      "showLess": "Afficher moins",
      "selectAll": "Tout sélectionner",
      "deselectAll": "Tout désélectionner",
      "download": "Télécharger",
      "upload": "Téléverser",
      "copy": "Copier",
      "share": "Partager",
      "add": "Ajouter",
      "remove": "Supprimer"
    },
    "navigation": {
      "back": "Retour",
      "next": "Suivant",
      "previous": "Précédent",
      "first": "Premier",
      "last": "Dernier",
      "home": "Accueil",
      "goTo": "Aller à",
      "jumpTo": "Aller à",
      "skip": "Passer",
      "exit": "Quitter"
    },
    "forms": {
      "email": "E-mail",
      "emailPlaceholder": "Entrez votre e-mail",
      "password": "Mot de passe",
      "passwordPlaceholder": "Entrez votre mot de passe",
      "name": "Nom",
      "namePlaceholder": "Entrez votre nom",
      "description": "Description",
      "descriptionPlaceholder": "Entrez une description",
      "phone": "Téléphone",
      "phonePlaceholder": "Entrez le numéro de téléphone",
      "address": "Adresse",
      "addressPlaceholder": "Entrez l'adresse",
      "enterValue": "Entrez une valeur",
      "selectOption": "Sélectionnez une option",
      "typeToSearch": "Tapez pour rechercher..."
    },
    "status": {
      "loading": "Chargement...",
      "saving": "Enregistrement...",
      "deleting": "Suppression...",
      "processing": "Traitement...",
      "success": "Succès",
      "error": "Erreur",
      "pending": "En attente",
      "completed": "Terminé",
      "failed": "Échoué",
      "active": "Actif",
      "inactive": "Inactif",
      "enabled": "Activé",
      "disabled": "Désactivé",
      "online": "En ligne",
      "offline": "Hors ligne"
    },
    "loading": {
      "default": "Chargement...",
      "pleaseWait": "Veuillez patienter...",
      "loadingData": "Chargement des données...",
      "loadingItems": "Chargement des éléments...",
      "loadingContent": "Chargement du contenu...",
      "preparingData": "Préparation des données...",
      "almostDone": "Presque terminé...",
      "thisMayTakeMoment": "Cela peut prendre un moment..."
    },
    "time": {
      "justNow": "À l'instant",
      "minutesAgo": "Il y a {count} {count, plural, one {minute} other {minutes}}",
      "hoursAgo": "Il y a {count} {count, plural, one {heure} other {heures}}",
      "daysAgo": "Il y a {count} {count, plural, one {jour} other {jours}}",
      "weeksAgo": "Il y a {count} {count, plural, one {semaine} other {semaines}}",
      "monthsAgo": "Il y a {count} {count, plural, one {mois} other {mois}}",
      "today": "Aujourd'hui",
      "yesterday": "Hier",
      "tomorrow": "Demain",
      "thisWeek": "Cette semaine"
    },
    "validation": {
      "required": "Ce champ est requis",
      "invalidEmail": "Veuillez entrer une adresse e-mail valide",
      "invalidPhone": "Veuillez entrer un numéro de téléphone valide",
      "invalidUrl": "Veuillez entrer une URL valide",
      "tooShort": "Doit contenir au moins {min} caractères",
      "tooLong": "Doit contenir moins de {max} caractères",
      "minValue": "Doit être au moins {min}",
      "maxValue": "Doit être au maximum {max}",
      "invalidFormat": "Format invalide",
      "passwordMismatch": "Les mots de passe ne correspondent pas"
    },
    "confirmation": {
      "title": "Confirmer l'action",
      "deleteTitle": "Confirmer la suppression",
      "deleteMessage": "Êtes-vous sûr de vouloir supprimer ceci ? Cette action est irréversible.",
      "unsavedChanges": "Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?",
      "yes": "Oui",
      "no": "Non",
      "areYouSure": "Êtes-vous sûr ?",
      "cannotBeUndone": "Cette action est irréversible."
    },
    "pagination": {
      "previous": "Précédent",
      "next": "Suivant",
      "page": "Page {current} sur {total}",
      "showing": "Affichage de {start} à {end} sur {total}",
      "itemsPerPage": "Éléments par page",
      "goToPage": "Aller à la page"
    },
    "accessibility": {
      "loading": "Chargement, veuillez patienter",
      "menuOpen": "Le menu est ouvert",
      "menuClosed": "Le menu est fermé",
      "expandedSection": "Section développée",
      "collapsedSection": "Section réduite",
      "selectedItem": "Sélectionné : {item}",
      "requiredField": "Champ requis",
      "closeDialog": "Fermer la boîte de dialogue"
    },
    "labels": {
      "actions": "Actions",
      "select": "Sélectionner",
      "optional": "Facultatif",
      "required": "Requis",
      "all": "Tous",
      "none": "Aucun",
      "more": "Plus",
      "less": "Moins",
      "other": "Autre",
      "total": "Total"
    }
  }
}
```

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Structure matches en.json exactly
- [ ] All translations are in proper French

**Estimated Effort**: 30 minutes

---

### Task 15: Update Spanish Translation File (es.json)

**Objective**: Apply same nested structure to Spanish translations

**File to Modify**: `/messages/es.json`

**Full Common Namespace (Spanish)**:

```json
{
  "common": {
    "actions": {
      "save": "Guardar",
      "cancel": "Cancelar",
      "delete": "Eliminar",
      "edit": "Editar",
      "create": "Crear",
      "submit": "Enviar",
      "close": "Cerrar",
      "confirm": "Confirmar",
      "done": "Listo",
      "continue": "Continuar",
      "retry": "Reintentar",
      "refresh": "Actualizar",
      "search": "Buscar",
      "filter": "Filtrar",
      "sort": "Ordenar",
      "clear": "Borrar",
      "reset": "Restablecer",
      "apply": "Aplicar",
      "view": "Ver",
      "viewAll": "Ver todo",
      "showMore": "Mostrar más",
      "showLess": "Mostrar menos",
      "selectAll": "Seleccionar todo",
      "deselectAll": "Deseleccionar todo",
      "download": "Descargar",
      "upload": "Subir",
      "copy": "Copiar",
      "share": "Compartir",
      "add": "Agregar",
      "remove": "Eliminar"
    },
    "navigation": {
      "back": "Atrás",
      "next": "Siguiente",
      "previous": "Anterior",
      "first": "Primero",
      "last": "Último",
      "home": "Inicio",
      "goTo": "Ir a",
      "jumpTo": "Saltar a",
      "skip": "Omitir",
      "exit": "Salir"
    },
    "forms": {
      "email": "Correo electrónico",
      "emailPlaceholder": "Ingrese su correo electrónico",
      "password": "Contraseña",
      "passwordPlaceholder": "Ingrese su contraseña",
      "name": "Nombre",
      "namePlaceholder": "Ingrese su nombre",
      "description": "Descripción",
      "descriptionPlaceholder": "Ingrese una descripción",
      "phone": "Teléfono",
      "phonePlaceholder": "Ingrese el número de teléfono",
      "address": "Dirección",
      "addressPlaceholder": "Ingrese la dirección",
      "enterValue": "Ingrese un valor",
      "selectOption": "Seleccione una opción",
      "typeToSearch": "Escriba para buscar..."
    },
    "status": {
      "loading": "Cargando...",
      "saving": "Guardando...",
      "deleting": "Eliminando...",
      "processing": "Procesando...",
      "success": "Éxito",
      "error": "Error",
      "pending": "Pendiente",
      "completed": "Completado",
      "failed": "Fallido",
      "active": "Activo",
      "inactive": "Inactivo",
      "enabled": "Habilitado",
      "disabled": "Deshabilitado",
      "online": "En línea",
      "offline": "Sin conexión"
    },
    "loading": {
      "default": "Cargando...",
      "pleaseWait": "Por favor espere...",
      "loadingData": "Cargando datos...",
      "loadingItems": "Cargando elementos...",
      "loadingContent": "Cargando contenido...",
      "preparingData": "Preparando datos...",
      "almostDone": "Casi listo...",
      "thisMayTakeMoment": "Esto puede tardar un momento..."
    },
    "time": {
      "justNow": "Ahora mismo",
      "minutesAgo": "Hace {count} {count, plural, one {minuto} other {minutos}}",
      "hoursAgo": "Hace {count} {count, plural, one {hora} other {horas}}",
      "daysAgo": "Hace {count} {count, plural, one {día} other {días}}",
      "weeksAgo": "Hace {count} {count, plural, one {semana} other {semanas}}",
      "monthsAgo": "Hace {count} {count, plural, one {mes} other {meses}}",
      "today": "Hoy",
      "yesterday": "Ayer",
      "tomorrow": "Mañana",
      "thisWeek": "Esta semana"
    },
    "validation": {
      "required": "Este campo es obligatorio",
      "invalidEmail": "Por favor ingrese una dirección de correo válida",
      "invalidPhone": "Por favor ingrese un número de teléfono válido",
      "invalidUrl": "Por favor ingrese una URL válida",
      "tooShort": "Debe tener al menos {min} caracteres",
      "tooLong": "Debe tener menos de {max} caracteres",
      "minValue": "Debe ser al menos {min}",
      "maxValue": "Debe ser como máximo {max}",
      "invalidFormat": "Formato inválido",
      "passwordMismatch": "Las contraseñas no coinciden"
    },
    "confirmation": {
      "title": "Confirmar acción",
      "deleteTitle": "Confirmar eliminación",
      "deleteMessage": "¿Está seguro de que desea eliminar esto? Esta acción no se puede deshacer.",
      "unsavedChanges": "Tiene cambios sin guardar. ¿Está seguro de que desea salir?",
      "yes": "Sí",
      "no": "No",
      "areYouSure": "¿Está seguro?",
      "cannotBeUndone": "Esta acción no se puede deshacer."
    },
    "pagination": {
      "previous": "Anterior",
      "next": "Siguiente",
      "page": "Página {current} de {total}",
      "showing": "Mostrando {start} a {end} de {total}",
      "itemsPerPage": "Elementos por página",
      "goToPage": "Ir a la página"
    },
    "accessibility": {
      "loading": "Cargando, por favor espere",
      "menuOpen": "El menú está abierto",
      "menuClosed": "El menú está cerrado",
      "expandedSection": "Sección expandida",
      "collapsedSection": "Sección colapsada",
      "selectedItem": "Seleccionado: {item}",
      "requiredField": "Campo obligatorio",
      "closeDialog": "Cerrar diálogo"
    },
    "labels": {
      "actions": "Acciones",
      "select": "Seleccionar",
      "optional": "Opcional",
      "required": "Obligatorio",
      "all": "Todos",
      "none": "Ninguno",
      "more": "Más",
      "less": "Menos",
      "other": "Otro",
      "total": "Total"
    }
  }
}
```

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Structure matches en.json exactly
- [ ] All translations are in proper Spanish

**Estimated Effort**: 30 minutes

---

### Task 16: Update German Translation File (de.json)

**Objective**: Apply same nested structure to German translations

**File to Modify**: `/messages/de.json`

**Full Common Namespace (German)**:

```json
{
  "common": {
    "actions": {
      "save": "Speichern",
      "cancel": "Abbrechen",
      "delete": "Löschen",
      "edit": "Bearbeiten",
      "create": "Erstellen",
      "submit": "Absenden",
      "close": "Schließen",
      "confirm": "Bestätigen",
      "done": "Fertig",
      "continue": "Fortfahren",
      "retry": "Erneut versuchen",
      "refresh": "Aktualisieren",
      "search": "Suchen",
      "filter": "Filtern",
      "sort": "Sortieren",
      "clear": "Löschen",
      "reset": "Zurücksetzen",
      "apply": "Anwenden",
      "view": "Ansehen",
      "viewAll": "Alle anzeigen",
      "showMore": "Mehr anzeigen",
      "showLess": "Weniger anzeigen",
      "selectAll": "Alle auswählen",
      "deselectAll": "Auswahl aufheben",
      "download": "Herunterladen",
      "upload": "Hochladen",
      "copy": "Kopieren",
      "share": "Teilen",
      "add": "Hinzufügen",
      "remove": "Entfernen"
    },
    "navigation": {
      "back": "Zurück",
      "next": "Weiter",
      "previous": "Vorherige",
      "first": "Erste",
      "last": "Letzte",
      "home": "Startseite",
      "goTo": "Gehe zu",
      "jumpTo": "Springe zu",
      "skip": "Überspringen",
      "exit": "Beenden"
    },
    "forms": {
      "email": "E-Mail",
      "emailPlaceholder": "Geben Sie Ihre E-Mail ein",
      "password": "Passwort",
      "passwordPlaceholder": "Geben Sie Ihr Passwort ein",
      "name": "Name",
      "namePlaceholder": "Geben Sie Ihren Namen ein",
      "description": "Beschreibung",
      "descriptionPlaceholder": "Geben Sie eine Beschreibung ein",
      "phone": "Telefon",
      "phonePlaceholder": "Geben Sie die Telefonnummer ein",
      "address": "Adresse",
      "addressPlaceholder": "Geben Sie die Adresse ein",
      "enterValue": "Geben Sie einen Wert ein",
      "selectOption": "Wählen Sie eine Option",
      "typeToSearch": "Tippen Sie zum Suchen..."
    },
    "status": {
      "loading": "Wird geladen...",
      "saving": "Wird gespeichert...",
      "deleting": "Wird gelöscht...",
      "processing": "Wird verarbeitet...",
      "success": "Erfolg",
      "error": "Fehler",
      "pending": "Ausstehend",
      "completed": "Abgeschlossen",
      "failed": "Fehlgeschlagen",
      "active": "Aktiv",
      "inactive": "Inaktiv",
      "enabled": "Aktiviert",
      "disabled": "Deaktiviert",
      "online": "Online",
      "offline": "Offline"
    },
    "loading": {
      "default": "Wird geladen...",
      "pleaseWait": "Bitte warten...",
      "loadingData": "Daten werden geladen...",
      "loadingItems": "Elemente werden geladen...",
      "loadingContent": "Inhalt wird geladen...",
      "preparingData": "Daten werden vorbereitet...",
      "almostDone": "Fast fertig...",
      "thisMayTakeMoment": "Dies kann einen Moment dauern..."
    },
    "time": {
      "justNow": "Gerade eben",
      "minutesAgo": "Vor {count} {count, plural, one {Minute} other {Minuten}}",
      "hoursAgo": "Vor {count} {count, plural, one {Stunde} other {Stunden}}",
      "daysAgo": "Vor {count} {count, plural, one {Tag} other {Tagen}}",
      "weeksAgo": "Vor {count} {count, plural, one {Woche} other {Wochen}}",
      "monthsAgo": "Vor {count} {count, plural, one {Monat} other {Monaten}}",
      "today": "Heute",
      "yesterday": "Gestern",
      "tomorrow": "Morgen",
      "thisWeek": "Diese Woche"
    },
    "validation": {
      "required": "Dieses Feld ist erforderlich",
      "invalidEmail": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
      "invalidPhone": "Bitte geben Sie eine gültige Telefonnummer ein",
      "invalidUrl": "Bitte geben Sie eine gültige URL ein",
      "tooShort": "Muss mindestens {min} Zeichen haben",
      "tooLong": "Darf höchstens {max} Zeichen haben",
      "minValue": "Muss mindestens {min} sein",
      "maxValue": "Darf höchstens {max} sein",
      "invalidFormat": "Ungültiges Format",
      "passwordMismatch": "Die Passwörter stimmen nicht überein"
    },
    "confirmation": {
      "title": "Aktion bestätigen",
      "deleteTitle": "Löschen bestätigen",
      "deleteMessage": "Sind Sie sicher, dass Sie dies löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      "unsavedChanges": "Sie haben ungespeicherte Änderungen. Sind Sie sicher, dass Sie die Seite verlassen möchten?",
      "yes": "Ja",
      "no": "Nein",
      "areYouSure": "Sind Sie sicher?",
      "cannotBeUndone": "Diese Aktion kann nicht rückgängig gemacht werden."
    },
    "pagination": {
      "previous": "Vorherige",
      "next": "Nächste",
      "page": "Seite {current} von {total}",
      "showing": "Zeige {start} bis {end} von {total}",
      "itemsPerPage": "Elemente pro Seite",
      "goToPage": "Gehe zu Seite"
    },
    "accessibility": {
      "loading": "Wird geladen, bitte warten",
      "menuOpen": "Menü ist geöffnet",
      "menuClosed": "Menü ist geschlossen",
      "expandedSection": "Abschnitt erweitert",
      "collapsedSection": "Abschnitt eingeklappt",
      "selectedItem": "Ausgewählt: {item}",
      "requiredField": "Pflichtfeld",
      "closeDialog": "Dialog schließen"
    },
    "labels": {
      "actions": "Aktionen",
      "select": "Auswählen",
      "optional": "Optional",
      "required": "Erforderlich",
      "all": "Alle",
      "none": "Keine",
      "more": "Mehr",
      "less": "Weniger",
      "other": "Andere",
      "total": "Gesamt"
    }
  }
}
```

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Structure matches en.json exactly
- [ ] All translations are in proper German

**Estimated Effort**: 30 minutes

---

### Task 17: Update Dutch Translation File (nl.json)

**Objective**: Apply same nested structure to Dutch translations

**File to Modify**: `/messages/nl.json`

**Full Common Namespace (Dutch)**:

```json
{
  "common": {
    "actions": {
      "save": "Opslaan",
      "cancel": "Annuleren",
      "delete": "Verwijderen",
      "edit": "Bewerken",
      "create": "Maken",
      "submit": "Verzenden",
      "close": "Sluiten",
      "confirm": "Bevestigen",
      "done": "Klaar",
      "continue": "Doorgaan",
      "retry": "Opnieuw proberen",
      "refresh": "Vernieuwen",
      "search": "Zoeken",
      "filter": "Filteren",
      "sort": "Sorteren",
      "clear": "Wissen",
      "reset": "Resetten",
      "apply": "Toepassen",
      "view": "Bekijken",
      "viewAll": "Alles bekijken",
      "showMore": "Meer tonen",
      "showLess": "Minder tonen",
      "selectAll": "Alles selecteren",
      "deselectAll": "Selectie opheffen",
      "download": "Downloaden",
      "upload": "Uploaden",
      "copy": "Kopiëren",
      "share": "Delen",
      "add": "Toevoegen",
      "remove": "Verwijderen"
    },
    "navigation": {
      "back": "Terug",
      "next": "Volgende",
      "previous": "Vorige",
      "first": "Eerste",
      "last": "Laatste",
      "home": "Home",
      "goTo": "Ga naar",
      "jumpTo": "Spring naar",
      "skip": "Overslaan",
      "exit": "Afsluiten"
    },
    "forms": {
      "email": "E-mail",
      "emailPlaceholder": "Voer uw e-mailadres in",
      "password": "Wachtwoord",
      "passwordPlaceholder": "Voer uw wachtwoord in",
      "name": "Naam",
      "namePlaceholder": "Voer uw naam in",
      "description": "Beschrijving",
      "descriptionPlaceholder": "Voer een beschrijving in",
      "phone": "Telefoon",
      "phonePlaceholder": "Voer telefoonnummer in",
      "address": "Adres",
      "addressPlaceholder": "Voer adres in",
      "enterValue": "Voer een waarde in",
      "selectOption": "Selecteer een optie",
      "typeToSearch": "Typ om te zoeken..."
    },
    "status": {
      "loading": "Laden...",
      "saving": "Opslaan...",
      "deleting": "Verwijderen...",
      "processing": "Verwerken...",
      "success": "Succes",
      "error": "Fout",
      "pending": "In behandeling",
      "completed": "Voltooid",
      "failed": "Mislukt",
      "active": "Actief",
      "inactive": "Inactief",
      "enabled": "Ingeschakeld",
      "disabled": "Uitgeschakeld",
      "online": "Online",
      "offline": "Offline"
    },
    "loading": {
      "default": "Laden...",
      "pleaseWait": "Even geduld...",
      "loadingData": "Gegevens laden...",
      "loadingItems": "Items laden...",
      "loadingContent": "Inhoud laden...",
      "preparingData": "Gegevens voorbereiden...",
      "almostDone": "Bijna klaar...",
      "thisMayTakeMoment": "Dit kan even duren..."
    },
    "time": {
      "justNow": "Zojuist",
      "minutesAgo": "{count} {count, plural, one {minuut} other {minuten}} geleden",
      "hoursAgo": "{count} {count, plural, one {uur} other {uur}} geleden",
      "daysAgo": "{count} {count, plural, one {dag} other {dagen}} geleden",
      "weeksAgo": "{count} {count, plural, one {week} other {weken}} geleden",
      "monthsAgo": "{count} {count, plural, one {maand} other {maanden}} geleden",
      "today": "Vandaag",
      "yesterday": "Gisteren",
      "tomorrow": "Morgen",
      "thisWeek": "Deze week"
    },
    "validation": {
      "required": "Dit veld is verplicht",
      "invalidEmail": "Voer een geldig e-mailadres in",
      "invalidPhone": "Voer een geldig telefoonnummer in",
      "invalidUrl": "Voer een geldige URL in",
      "tooShort": "Moet minimaal {min} tekens bevatten",
      "tooLong": "Mag maximaal {max} tekens bevatten",
      "minValue": "Moet minimaal {min} zijn",
      "maxValue": "Mag maximaal {max} zijn",
      "invalidFormat": "Ongeldig formaat",
      "passwordMismatch": "De wachtwoorden komen niet overeen"
    },
    "confirmation": {
      "title": "Actie bevestigen",
      "deleteTitle": "Verwijderen bevestigen",
      "deleteMessage": "Weet u zeker dat u dit wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      "unsavedChanges": "U heeft niet-opgeslagen wijzigingen. Weet u zeker dat u wilt vertrekken?",
      "yes": "Ja",
      "no": "Nee",
      "areYouSure": "Weet u het zeker?",
      "cannotBeUndone": "Deze actie kan niet ongedaan worden gemaakt."
    },
    "pagination": {
      "previous": "Vorige",
      "next": "Volgende",
      "page": "Pagina {current} van {total}",
      "showing": "Toont {start} tot {end} van {total}",
      "itemsPerPage": "Items per pagina",
      "goToPage": "Ga naar pagina"
    },
    "accessibility": {
      "loading": "Laden, even geduld",
      "menuOpen": "Menu is geopend",
      "menuClosed": "Menu is gesloten",
      "expandedSection": "Sectie uitgevouwen",
      "collapsedSection": "Sectie ingeklapt",
      "selectedItem": "Geselecteerd: {item}",
      "requiredField": "Verplicht veld",
      "closeDialog": "Dialoog sluiten"
    },
    "labels": {
      "actions": "Acties",
      "select": "Selecteren",
      "optional": "Optioneel",
      "required": "Verplicht",
      "all": "Alle",
      "none": "Geen",
      "more": "Meer",
      "less": "Minder",
      "other": "Overig",
      "total": "Totaal"
    }
  }
}
```

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Structure matches en.json exactly
- [ ] All translations are in proper Dutch

**Estimated Effort**: 30 minutes

---

### Task 18: Update Italian Translation File (it.json)

**Objective**: Apply same nested structure to Italian translations

**File to Modify**: `/messages/it.json`

**Full Common Namespace (Italian)**:

```json
{
  "common": {
    "actions": {
      "save": "Salva",
      "cancel": "Annulla",
      "delete": "Elimina",
      "edit": "Modifica",
      "create": "Crea",
      "submit": "Invia",
      "close": "Chiudi",
      "confirm": "Conferma",
      "done": "Fatto",
      "continue": "Continua",
      "retry": "Riprova",
      "refresh": "Aggiorna",
      "search": "Cerca",
      "filter": "Filtra",
      "sort": "Ordina",
      "clear": "Cancella",
      "reset": "Ripristina",
      "apply": "Applica",
      "view": "Visualizza",
      "viewAll": "Visualizza tutto",
      "showMore": "Mostra di più",
      "showLess": "Mostra meno",
      "selectAll": "Seleziona tutto",
      "deselectAll": "Deseleziona tutto",
      "download": "Scarica",
      "upload": "Carica",
      "copy": "Copia",
      "share": "Condividi",
      "add": "Aggiungi",
      "remove": "Rimuovi"
    },
    "navigation": {
      "back": "Indietro",
      "next": "Avanti",
      "previous": "Precedente",
      "first": "Primo",
      "last": "Ultimo",
      "home": "Home",
      "goTo": "Vai a",
      "jumpTo": "Salta a",
      "skip": "Salta",
      "exit": "Esci"
    },
    "forms": {
      "email": "Email",
      "emailPlaceholder": "Inserisci la tua email",
      "password": "Password",
      "passwordPlaceholder": "Inserisci la tua password",
      "name": "Nome",
      "namePlaceholder": "Inserisci il tuo nome",
      "description": "Descrizione",
      "descriptionPlaceholder": "Inserisci una descrizione",
      "phone": "Telefono",
      "phonePlaceholder": "Inserisci il numero di telefono",
      "address": "Indirizzo",
      "addressPlaceholder": "Inserisci l'indirizzo",
      "enterValue": "Inserisci un valore",
      "selectOption": "Seleziona un'opzione",
      "typeToSearch": "Digita per cercare..."
    },
    "status": {
      "loading": "Caricamento...",
      "saving": "Salvataggio...",
      "deleting": "Eliminazione...",
      "processing": "Elaborazione...",
      "success": "Successo",
      "error": "Errore",
      "pending": "In sospeso",
      "completed": "Completato",
      "failed": "Fallito",
      "active": "Attivo",
      "inactive": "Inattivo",
      "enabled": "Abilitato",
      "disabled": "Disabilitato",
      "online": "Online",
      "offline": "Offline"
    },
    "loading": {
      "default": "Caricamento...",
      "pleaseWait": "Attendere prego...",
      "loadingData": "Caricamento dati...",
      "loadingItems": "Caricamento elementi...",
      "loadingContent": "Caricamento contenuto...",
      "preparingData": "Preparazione dati...",
      "almostDone": "Quasi finito...",
      "thisMayTakeMoment": "Questa operazione potrebbe richiedere un momento..."
    },
    "time": {
      "justNow": "Proprio ora",
      "minutesAgo": "{count} {count, plural, one {minuto} other {minuti}} fa",
      "hoursAgo": "{count} {count, plural, one {ora} other {ore}} fa",
      "daysAgo": "{count} {count, plural, one {giorno} other {giorni}} fa",
      "weeksAgo": "{count} {count, plural, one {settimana} other {settimane}} fa",
      "monthsAgo": "{count} {count, plural, one {mese} other {mesi}} fa",
      "today": "Oggi",
      "yesterday": "Ieri",
      "tomorrow": "Domani",
      "thisWeek": "Questa settimana"
    },
    "validation": {
      "required": "Questo campo è obbligatorio",
      "invalidEmail": "Inserisci un indirizzo email valido",
      "invalidPhone": "Inserisci un numero di telefono valido",
      "invalidUrl": "Inserisci un URL valido",
      "tooShort": "Deve contenere almeno {min} caratteri",
      "tooLong": "Deve contenere meno di {max} caratteri",
      "minValue": "Deve essere almeno {min}",
      "maxValue": "Deve essere al massimo {max}",
      "invalidFormat": "Formato non valido",
      "passwordMismatch": "Le password non corrispondono"
    },
    "confirmation": {
      "title": "Conferma azione",
      "deleteTitle": "Conferma eliminazione",
      "deleteMessage": "Sei sicuro di voler eliminare questo elemento? Questa azione non può essere annullata.",
      "unsavedChanges": "Hai modifiche non salvate. Sei sicuro di voler uscire?",
      "yes": "Sì",
      "no": "No",
      "areYouSure": "Sei sicuro?",
      "cannotBeUndone": "Questa azione non può essere annullata."
    },
    "pagination": {
      "previous": "Precedente",
      "next": "Successivo",
      "page": "Pagina {current} di {total}",
      "showing": "Visualizzazione da {start} a {end} di {total}",
      "itemsPerPage": "Elementi per pagina",
      "goToPage": "Vai alla pagina"
    },
    "accessibility": {
      "loading": "Caricamento in corso, attendere",
      "menuOpen": "Il menu è aperto",
      "menuClosed": "Il menu è chiuso",
      "expandedSection": "Sezione espansa",
      "collapsedSection": "Sezione compressa",
      "selectedItem": "Selezionato: {item}",
      "requiredField": "Campo obbligatorio",
      "closeDialog": "Chiudi finestra di dialogo"
    },
    "labels": {
      "actions": "Azioni",
      "select": "Seleziona",
      "optional": "Facoltativo",
      "required": "Obbligatorio",
      "all": "Tutti",
      "none": "Nessuno",
      "more": "Di più",
      "less": "Meno",
      "other": "Altro",
      "total": "Totale"
    }
  }
}
```

**Verification**:
- [ ] JSON is syntactically valid
- [ ] Structure matches en.json exactly
- [ ] All translations are in proper Italian

**Estimated Effort**: 30 minutes

---

### Task 19: Validate All Translation Files

**Objective**: Ensure all 6 translation files have valid JSON and identical structures

**Steps**:

1. **JSON Validation** - Run for each file:
   ```bash
   cat messages/en.json | jq . > /dev/null && echo "en.json: VALID" || echo "en.json: INVALID"
   cat messages/fr.json | jq . > /dev/null && echo "fr.json: VALID" || echo "fr.json: INVALID"
   cat messages/es.json | jq . > /dev/null && echo "es.json: VALID" || echo "es.json: INVALID"
   cat messages/de.json | jq . > /dev/null && echo "de.json: VALID" || echo "de.json: INVALID"
   cat messages/nl.json | jq . > /dev/null && echo "nl.json: VALID" || echo "nl.json: INVALID"
   cat messages/it.json | jq . > /dev/null && echo "it.json: VALID" || echo "it.json: INVALID"
   ```

2. **Structure Comparison** - Verify all files have the same keys:
   ```bash
   # Extract common namespace keys from each file and compare
   jq -r '.common | paths | join(".")' messages/en.json | sort > /tmp/keys-en.txt
   jq -r '.common | paths | join(".")' messages/fr.json | sort > /tmp/keys-fr.txt
   diff /tmp/keys-en.txt /tmp/keys-fr.txt
   # Repeat for other languages
   ```

3. **Count Keys** - Verify key counts match:
   ```bash
   echo "English: $(jq '.common | [paths] | length' messages/en.json) keys"
   echo "French: $(jq '.common | [paths] | length' messages/fr.json) keys"
   # ... repeat for other languages
   ```

**Verification**:
- [ ] All 6 JSON files pass validation
- [ ] All 6 files have identical key structures
- [ ] Key counts match across all languages

**Estimated Effort**: 15 minutes

---

### Task 20: Application Startup Verification

**Objective**: Verify the application starts without i18n errors

**Steps**:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser console and check for errors:
   - No "missing translation" warnings
   - No "invalid message format" errors
   - No JSON parsing errors

3. Navigate to a page that uses common translations:
   - Verify buttons display translated text
   - Verify status indicators work
   - Test language switching (if implemented)

4. Test ICU pluralization:
   - Find a component using `time.minutesAgo` or similar
   - Verify singular (1 minute ago) vs plural (5 minutes ago)

**Verification**:
- [ ] `npm run dev` starts without errors
- [ ] No i18n-related console errors
- [ ] Translated strings appear correctly in UI
- [ ] ICU pluralization works as expected

**Estimated Effort**: 20 minutes

---

### Task 21: Document Common Namespace Usage

**Objective**: Add inline documentation explaining how to use the common namespace

**File to Modify**: Add comment block to `/messages/en.json`

Since JSON doesn't support comments, create a documentation note in the implementation or add a `_meta` key:

```json
{
  "_meta": {
    "namespace": "common",
    "description": "Shared translation strings used across multiple components",
    "usage": "Import with useTranslations('common') or useTranslations('common.actions')",
    "lastUpdated": "2026-01-19"
  },
  "common": { ... }
}
```

Alternatively, add usage notes to the overview document.

**Verification**:
- [ ] Documentation exists explaining common namespace purpose
- [ ] Usage examples are provided

**Estimated Effort**: 10 minutes

---

## Implementation Summary

### Total Tasks: 21

### Effort Breakdown by Category

| Category | Tasks | Estimated Time |
|----------|-------|----------------|
| Audit & Planning | Task 1 | 15 min |
| en.json Subsections | Tasks 2-12 | 2 hours |
| en.json Finalization | Task 13 | 20 min |
| Other Language Files | Tasks 14-18 | 2.5 hours |
| Validation & Testing | Tasks 19-20 | 35 min |
| Documentation | Task 21 | 10 min |
| **Total** | **21 tasks** | **~5.5 hours** |

### Key Deliverables

1. **Restructured `/messages/en.json`** with nested common namespace containing ~117 keys across 11 subsections
2. **Updated language files** (`fr.json`, `es.json`, `de.json`, `nl.json`, `it.json`) with identical structure
3. **Validated JSON** across all files
4. **Working application** with no i18n errors

---

## Acceptance Criteria Checklist

From REQ-338 requirements:

- [ ] The common namespace in `/messages/en.json` contains an actions subsection
- [ ] The common namespace contains a navigation subsection
- [ ] The common namespace contains a forms subsection
- [ ] The common namespace contains a status subsection
- [ ] The common namespace contains a loading subsection
- [ ] The common namespace contains a time subsection
- [ ] The common namespace contains a validation subsection
- [ ] The common namespace contains a confirmation subsection
- [ ] The common namespace contains a pagination subsection
- [ ] The common namespace contains an accessibility subsection
- [ ] Each subsection is organized with clear, semantic key names
- [ ] All keys represent truly shared content used across multiple components
- [ ] The common namespace structure is mirrored across all 6 language files
- [ ] Translations for all new common keys are provided in English
- [ ] Placeholder translations are provided in all other language files
- [ ] TypeScript compilation succeeds
- [ ] Existing components continue to function
- [ ] Documentation indicates the purpose of the common namespace

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| JSON syntax errors | Validate with `jq` after each file edit |
| ICU format errors | Test pluralization in browser before committing |
| Missing keys in other languages | Use structure comparison script |
| Breaking existing components | No component changes in this task - structure only |

---

## References

- **Overview Document**: `docs/REQ-338-create-common-namespace-structure-in-overview.md`
- **Request**: `docs/gen_requests_epic2.md` (REQ-338)
- **Implementation Plan**: `docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **i18n Config**: `/src/lib/i18n/config.ts`
- **next-intl Documentation**: https://next-intl-docs.vercel.app/

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2H.1: Create Common Namespace Structure in Translation Files*
