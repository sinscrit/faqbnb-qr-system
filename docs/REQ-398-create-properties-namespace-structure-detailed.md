# REQ-398: Create Properties Namespace Structure - Detailed Task Breakdown

**Last Modified:** 2026-01-19 23:59 UTC
**Request ID:** REQ-398
**Type:** NEW FEATURE
**Size:** S (Small)
**Sub-Epic:** 2F - Property Management
**Task ID:** 2F.1
**Priority:** Sixth (per Epic 2 recommended order)
**Source Overview:** REQ-398-create-properties-namespace-structure-overview.md

---

## Executive Summary

This document breaks down REQ-398 into granular, actionable tasks for creating the `properties` namespace in all six translation files (en, de, es, fr, it, nl). Each task is scoped to approximately 1 story point and includes specific acceptance criteria, file paths, and verification steps.

---

## Prerequisites

Before starting implementation, verify:
- [x] Epic 1 foundation complete (next-intl installed and configured)
- [x] Message files exist for all 6 languages (`/messages/*.json`)
- [x] Existing namespace patterns established (common, auth, dashboard, items, errors, language)
- [x] Overview document reviewed (REQ-398-create-properties-namespace-structure-overview.md)

---

## Task List

### Task 1: Add Properties Namespace to English Message File (en.json)

**Task ID:** 2F.1.1
**Estimated Effort:** 1 story point
**File:** `/messages/en.json`

#### Description
Add the complete `properties` namespace structure with all English translations. This serves as the source of truth for all other language files.

#### Implementation Steps

1. Open `/messages/en.json`
2. Add the `properties` namespace object after the `language` namespace (maintain alphabetical order or add at end)
3. Include all sub-sections:
   - `title` and `subtitle` (root level strings)
   - `list` - Property listing strings with empty state
   - `form` - Form field labels, placeholders, and hints
   - `types` - Property type labels
   - `actions` - Action button labels
   - `modal` - Modal dialog strings
   - `status` - Status indicators and loading states
   - `delete` - Delete confirmation strings
   - `selector` - Property selector/filter strings
   - `empty` - Empty state messages
   - `validation` - Form validation error messages
   - `errors` - API/operation error messages
   - `aria` - Accessibility labels

#### Properties Namespace Structure (English)

```json
"properties": {
  "title": "Properties",
  "subtitle": "Manage your properties",
  "list": {
    "empty": {
      "title": "No properties yet",
      "description": "Add your first property to organize your items",
      "action": "Add Property"
    },
    "myProperty": "My Property",
    "myProperties": "My Properties",
    "itemCount": "{count} {count, plural, one {item} other {items}}",
    "roomCount": "{count} {count, plural, one {room} other {rooms}}",
    "loading": "Loading properties"
  },
  "form": {
    "name": "Property Name",
    "namePlaceholder": "e.g., Beach House, Downtown Apartment",
    "nameHint": "A friendly name to identify this property",
    "nickname": "Property Nickname",
    "nicknamePlaceholder": "e.g., Main Office, Home, Vacation House",
    "address": "Address",
    "addressPlaceholder": "Enter property address",
    "addressHint": "Physical address or location description",
    "addressLine1": "Address Line 1",
    "addressLine1Placeholder": "Street address",
    "addressLine2": "Address Line 2",
    "addressLine2Placeholder": "Apt, suite, unit, etc. (optional)",
    "city": "City",
    "cityPlaceholder": "City",
    "state": "State/Province",
    "statePlaceholder": "State or Province",
    "postalCode": "Postal Code",
    "postalCodePlaceholder": "ZIP / Postal code",
    "country": "Country",
    "countryPlaceholder": "Select country...",
    "type": "Property Type",
    "typePlaceholder": "Select property type...",
    "owner": "Property Owner",
    "ownerPlaceholder": "Select property owner...",
    "ownerCannotChange": "Property owner cannot be changed after creation",
    "optional": "(Optional)",
    "required": "(Required)",
    "characterCount": "{current}/{max}"
  },
  "types": {
    "apartment": "Apartment",
    "house": "House",
    "condo": "Condo",
    "townhouse": "Townhouse",
    "cabin": "Cabin",
    "villa": "Villa",
    "other": "Other"
  },
  "actions": {
    "add": "Add Property",
    "addNew": "Add New Property",
    "edit": "Edit Property",
    "delete": "Delete Property",
    "view": "View Property",
    "create": "Create Property",
    "update": "Update Property",
    "saveChanges": "Save Changes",
    "cancel": "Cancel"
  },
  "modal": {
    "addTitle": "Add New Property",
    "addDescription": "Create a new property by entering the name and address information.",
    "editTitle": "Edit Property",
    "editDescription": "Edit the details of your property including name and address information.",
    "closeLabel": "Close modal"
  },
  "status": {
    "saving": "Saving...",
    "creating": "Creating...",
    "updating": "Updating...",
    "deleting": "Deleting...",
    "savingProperty": "Saving property",
    "creatingProperty": "Creating property"
  },
  "delete": {
    "title": "Delete Property",
    "message": "Are you sure you want to delete \"{name}\"? All items in this property will be moved to \"Unassigned\".",
    "confirm": "Delete Property"
  },
  "selector": {
    "title": "Property Filter",
    "description": "Filter analytics data by property",
    "selectProperty": "Select Property",
    "allProperties": "All Properties",
    "unassigned": "Unassigned",
    "noProperties": "No properties available",
    "loading": "Loading properties...",
    "ariaLabel": "Select property for analytics filtering"
  },
  "empty": {
    "title": "Let's add your property",
    "description": "A property is where your items live - like a vacation rental or home.",
    "noPropertiesYet": "No properties yet",
    "addFirst": "Add your first property to organize your items"
  },
  "validation": {
    "nameRequired": "Property name is required",
    "nameMaxLength": "Property name must be {max} characters or less",
    "nicknameRequired": "Property nickname is required",
    "nicknameMaxLength": "Property nickname must be {max} characters or less",
    "typeRequired": "Property type is required",
    "addressMaxLength": "Address must be {max} characters or less",
    "cityMaxLength": "City must be {max} characters or less",
    "stateMaxLength": "State/Province must be {max} characters or less",
    "postalCodeMaxLength": "Postal code must be {max} characters or less",
    "countryInvalid": "Please select a valid country"
  },
  "errors": {
    "loadFailed": "Failed to load properties",
    "saveFailed": "Failed to save property",
    "createFailed": "Failed to create property",
    "updateFailed": "Failed to update property",
    "deleteFailed": "Failed to delete property",
    "notFound": "Property not found",
    "generic": "Failed to save property. Please try again."
  },
  "aria": {
    "editProperty": "Edit property: {name}",
    "addNewProperty": "Add a new property",
    "propertyOptions": "Property options"
  }
}
```

#### Acceptance Criteria
- [ ] `properties` namespace added to `/messages/en.json`
- [ ] All sub-sections present (list, form, types, actions, modal, status, delete, selector, empty, validation, errors, aria)
- [ ] Pluralization strings use correct ICU format (`{count, plural, one {...} other {...}}`)
- [ ] Variable interpolation strings include proper placeholders (`{name}`, `{max}`, `{current}`)
- [ ] JSON syntax is valid (no trailing commas, proper nesting)

#### Verification Steps
```bash
# Validate JSON syntax
node -e "require('./messages/en.json')"

# Verify namespace exists
node -e "const m = require('./messages/en.json'); console.log(Object.keys(m.properties))"
```

---

### Task 2: Add Properties Namespace to German Message File (de.json)

**Task ID:** 2F.1.2
**Estimated Effort:** 1 story point
**File:** `/messages/de.json`

#### Description
Add the `properties` namespace with German translations matching the English structure exactly.

#### Implementation Steps

1. Open `/messages/de.json`
2. Add the `properties` namespace with identical key structure to English
3. Translate all string values to German
4. Preserve all variable placeholders exactly (`{name}`, `{count}`, `{max}`, etc.)
5. Maintain ICU plural format syntax

#### German Translations

```json
"properties": {
  "title": "Immobilien",
  "subtitle": "Verwalten Sie Ihre Immobilien",
  "list": {
    "empty": {
      "title": "Noch keine Immobilien",
      "description": "Fugen Sie Ihre erste Immobilie hinzu, um Ihre Artikel zu organisieren",
      "action": "Immobilie hinzufugen"
    },
    "myProperty": "Meine Immobilie",
    "myProperties": "Meine Immobilien",
    "itemCount": "{count} {count, plural, one {Artikel} other {Artikel}}",
    "roomCount": "{count} {count, plural, one {Raum} other {Raume}}",
    "loading": "Immobilien werden geladen"
  },
  "form": {
    "name": "Immobilienname",
    "namePlaceholder": "z.B. Strandhaus, Stadtwohnung",
    "nameHint": "Ein freundlicher Name zur Identifizierung dieser Immobilie",
    "nickname": "Immobilien-Spitzname",
    "nicknamePlaceholder": "z.B. Hauptburo, Zuhause, Ferienhaus",
    "address": "Adresse",
    "addressPlaceholder": "Immobilienadresse eingeben",
    "addressHint": "Physische Adresse oder Standortbeschreibung",
    "addressLine1": "Adresszeile 1",
    "addressLine1Placeholder": "StraBe und Hausnummer",
    "addressLine2": "Adresszeile 2",
    "addressLine2Placeholder": "Wohnung, Suite, Einheit usw. (optional)",
    "city": "Stadt",
    "cityPlaceholder": "Stadt",
    "state": "Bundesland/Kanton",
    "statePlaceholder": "Bundesland oder Kanton",
    "postalCode": "Postleitzahl",
    "postalCodePlaceholder": "PLZ",
    "country": "Land",
    "countryPlaceholder": "Land auswahlen...",
    "type": "Immobilientyp",
    "typePlaceholder": "Immobilientyp auswahlen...",
    "owner": "Immobilieneigentumer",
    "ownerPlaceholder": "Immobilieneigentumer auswahlen...",
    "ownerCannotChange": "Der Immobilieneigentumer kann nach der Erstellung nicht geandert werden",
    "optional": "(Optional)",
    "required": "(Erforderlich)",
    "characterCount": "{current}/{max}"
  },
  "types": {
    "apartment": "Wohnung",
    "house": "Haus",
    "condo": "Eigentumswohnung",
    "townhouse": "Reihenhaus",
    "cabin": "Hutte",
    "villa": "Villa",
    "other": "Sonstige"
  },
  "actions": {
    "add": "Immobilie hinzufugen",
    "addNew": "Neue Immobilie hinzufugen",
    "edit": "Immobilie bearbeiten",
    "delete": "Immobilie loschen",
    "view": "Immobilie anzeigen",
    "create": "Immobilie erstellen",
    "update": "Immobilie aktualisieren",
    "saveChanges": "Anderungen speichern",
    "cancel": "Abbrechen"
  },
  "modal": {
    "addTitle": "Neue Immobilie hinzufugen",
    "addDescription": "Erstellen Sie eine neue Immobilie, indem Sie den Namen und die Adressinformationen eingeben.",
    "editTitle": "Immobilie bearbeiten",
    "editDescription": "Bearbeiten Sie die Details Ihrer Immobilie einschlieBlich Name und Adressinformationen.",
    "closeLabel": "Modal schlieBen"
  },
  "status": {
    "saving": "Speichern...",
    "creating": "Erstellen...",
    "updating": "Aktualisieren...",
    "deleting": "Loschen...",
    "savingProperty": "Immobilie wird gespeichert",
    "creatingProperty": "Immobilie wird erstellt"
  },
  "delete": {
    "title": "Immobilie loschen",
    "message": "Sind Sie sicher, dass Sie \"{name}\" loschen mochten? Alle Artikel in dieser Immobilie werden zu \"Nicht zugewiesen\" verschoben.",
    "confirm": "Immobilie loschen"
  },
  "selector": {
    "title": "Immobilienfilter",
    "description": "Analysedaten nach Immobilie filtern",
    "selectProperty": "Immobilie auswahlen",
    "allProperties": "Alle Immobilien",
    "unassigned": "Nicht zugewiesen",
    "noProperties": "Keine Immobilien verfugbar",
    "loading": "Immobilien werden geladen...",
    "ariaLabel": "Immobilie fur Analysefilterung auswahlen"
  },
  "empty": {
    "title": "Lassen Sie uns Ihre Immobilie hinzufugen",
    "description": "Eine Immobilie ist der Ort, an dem Ihre Artikel leben - wie eine Ferienwohnung oder ein Zuhause.",
    "noPropertiesYet": "Noch keine Immobilien",
    "addFirst": "Fugen Sie Ihre erste Immobilie hinzu, um Ihre Artikel zu organisieren"
  },
  "validation": {
    "nameRequired": "Immobilienname ist erforderlich",
    "nameMaxLength": "Immobilienname darf maximal {max} Zeichen haben",
    "nicknameRequired": "Immobilien-Spitzname ist erforderlich",
    "nicknameMaxLength": "Immobilien-Spitzname darf maximal {max} Zeichen haben",
    "typeRequired": "Immobilientyp ist erforderlich",
    "addressMaxLength": "Adresse darf maximal {max} Zeichen haben",
    "cityMaxLength": "Stadt darf maximal {max} Zeichen haben",
    "stateMaxLength": "Bundesland/Kanton darf maximal {max} Zeichen haben",
    "postalCodeMaxLength": "Postleitzahl darf maximal {max} Zeichen haben",
    "countryInvalid": "Bitte wahlen Sie ein gultiges Land aus"
  },
  "errors": {
    "loadFailed": "Immobilien konnten nicht geladen werden",
    "saveFailed": "Immobilie konnte nicht gespeichert werden",
    "createFailed": "Immobilie konnte nicht erstellt werden",
    "updateFailed": "Immobilie konnte nicht aktualisiert werden",
    "deleteFailed": "Immobilie konnte nicht geloscht werden",
    "notFound": "Immobilie nicht gefunden",
    "generic": "Immobilie konnte nicht gespeichert werden. Bitte versuchen Sie es erneut."
  },
  "aria": {
    "editProperty": "Immobilie bearbeiten: {name}",
    "addNewProperty": "Eine neue Immobilie hinzufugen",
    "propertyOptions": "Immobilienoptionen"
  }
}
```

#### Acceptance Criteria
- [ ] `properties` namespace added to `/messages/de.json`
- [ ] Key structure matches English exactly
- [ ] All placeholders preserved (`{name}`, `{count}`, `{max}`, `{current}`)
- [ ] ICU plural syntax preserved correctly
- [ ] JSON syntax is valid

#### Verification Steps
```bash
# Validate JSON syntax
node -e "require('./messages/de.json')"

# Compare key structure with English
node -e "const en = require('./messages/en.json'); const de = require('./messages/de.json'); console.log(JSON.stringify(Object.keys(en.properties)) === JSON.stringify(Object.keys(de.properties)))"
```

---

### Task 3: Add Properties Namespace to Spanish Message File (es.json)

**Task ID:** 2F.1.3
**Estimated Effort:** 1 story point
**File:** `/messages/es.json`

#### Description
Add the `properties` namespace with Spanish translations matching the English structure exactly.

#### Spanish Translations

```json
"properties": {
  "title": "Propiedades",
  "subtitle": "Gestiona tus propiedades",
  "list": {
    "empty": {
      "title": "Aun no hay propiedades",
      "description": "Anade tu primera propiedad para organizar tus articulos",
      "action": "Anadir Propiedad"
    },
    "myProperty": "Mi Propiedad",
    "myProperties": "Mis Propiedades",
    "itemCount": "{count} {count, plural, one {articulo} other {articulos}}",
    "roomCount": "{count} {count, plural, one {habitacion} other {habitaciones}}",
    "loading": "Cargando propiedades"
  },
  "form": {
    "name": "Nombre de la Propiedad",
    "namePlaceholder": "ej., Casa de Playa, Apartamento Centro",
    "nameHint": "Un nombre amigable para identificar esta propiedad",
    "nickname": "Apodo de la Propiedad",
    "nicknamePlaceholder": "ej., Oficina Principal, Casa, Casa de Vacaciones",
    "address": "Direccion",
    "addressPlaceholder": "Introduce la direccion de la propiedad",
    "addressHint": "Direccion fisica o descripcion de ubicacion",
    "addressLine1": "Linea de Direccion 1",
    "addressLine1Placeholder": "Direccion de la calle",
    "addressLine2": "Linea de Direccion 2",
    "addressLine2Placeholder": "Apt, suite, unidad, etc. (opcional)",
    "city": "Ciudad",
    "cityPlaceholder": "Ciudad",
    "state": "Estado/Provincia",
    "statePlaceholder": "Estado o Provincia",
    "postalCode": "Codigo Postal",
    "postalCodePlaceholder": "Codigo postal",
    "country": "Pais",
    "countryPlaceholder": "Seleccionar pais...",
    "type": "Tipo de Propiedad",
    "typePlaceholder": "Seleccionar tipo de propiedad...",
    "owner": "Propietario",
    "ownerPlaceholder": "Seleccionar propietario...",
    "ownerCannotChange": "El propietario no puede cambiarse despues de la creacion",
    "optional": "(Opcional)",
    "required": "(Obligatorio)",
    "characterCount": "{current}/{max}"
  },
  "types": {
    "apartment": "Apartamento",
    "house": "Casa",
    "condo": "Condominio",
    "townhouse": "Casa Adosada",
    "cabin": "Cabana",
    "villa": "Villa",
    "other": "Otro"
  },
  "actions": {
    "add": "Anadir Propiedad",
    "addNew": "Anadir Nueva Propiedad",
    "edit": "Editar Propiedad",
    "delete": "Eliminar Propiedad",
    "view": "Ver Propiedad",
    "create": "Crear Propiedad",
    "update": "Actualizar Propiedad",
    "saveChanges": "Guardar Cambios",
    "cancel": "Cancelar"
  },
  "modal": {
    "addTitle": "Anadir Nueva Propiedad",
    "addDescription": "Crea una nueva propiedad introduciendo el nombre y la informacion de direccion.",
    "editTitle": "Editar Propiedad",
    "editDescription": "Edita los detalles de tu propiedad incluyendo nombre e informacion de direccion.",
    "closeLabel": "Cerrar modal"
  },
  "status": {
    "saving": "Guardando...",
    "creating": "Creando...",
    "updating": "Actualizando...",
    "deleting": "Eliminando...",
    "savingProperty": "Guardando propiedad",
    "creatingProperty": "Creando propiedad"
  },
  "delete": {
    "title": "Eliminar Propiedad",
    "message": "Estas seguro de que quieres eliminar \"{name}\"? Todos los articulos en esta propiedad se moveran a \"Sin asignar\".",
    "confirm": "Eliminar Propiedad"
  },
  "selector": {
    "title": "Filtro de Propiedad",
    "description": "Filtrar datos de analisis por propiedad",
    "selectProperty": "Seleccionar Propiedad",
    "allProperties": "Todas las Propiedades",
    "unassigned": "Sin asignar",
    "noProperties": "No hay propiedades disponibles",
    "loading": "Cargando propiedades...",
    "ariaLabel": "Seleccionar propiedad para filtrado de analisis"
  },
  "empty": {
    "title": "Anadamos tu propiedad",
    "description": "Una propiedad es donde viven tus articulos - como un alquiler vacacional o una casa.",
    "noPropertiesYet": "Aun no hay propiedades",
    "addFirst": "Anade tu primera propiedad para organizar tus articulos"
  },
  "validation": {
    "nameRequired": "El nombre de la propiedad es obligatorio",
    "nameMaxLength": "El nombre de la propiedad debe tener {max} caracteres o menos",
    "nicknameRequired": "El apodo de la propiedad es obligatorio",
    "nicknameMaxLength": "El apodo de la propiedad debe tener {max} caracteres o menos",
    "typeRequired": "El tipo de propiedad es obligatorio",
    "addressMaxLength": "La direccion debe tener {max} caracteres o menos",
    "cityMaxLength": "La ciudad debe tener {max} caracteres o menos",
    "stateMaxLength": "El estado/provincia debe tener {max} caracteres o menos",
    "postalCodeMaxLength": "El codigo postal debe tener {max} caracteres o menos",
    "countryInvalid": "Por favor selecciona un pais valido"
  },
  "errors": {
    "loadFailed": "Error al cargar propiedades",
    "saveFailed": "Error al guardar propiedad",
    "createFailed": "Error al crear propiedad",
    "updateFailed": "Error al actualizar propiedad",
    "deleteFailed": "Error al eliminar propiedad",
    "notFound": "Propiedad no encontrada",
    "generic": "Error al guardar propiedad. Por favor intenta de nuevo."
  },
  "aria": {
    "editProperty": "Editar propiedad: {name}",
    "addNewProperty": "Anadir una nueva propiedad",
    "propertyOptions": "Opciones de propiedad"
  }
}
```

#### Acceptance Criteria
- [ ] `properties` namespace added to `/messages/es.json`
- [ ] Key structure matches English exactly
- [ ] All placeholders preserved
- [ ] ICU plural syntax preserved correctly
- [ ] JSON syntax is valid

#### Verification Steps
```bash
node -e "require('./messages/es.json')"
node -e "const en = require('./messages/en.json'); const es = require('./messages/es.json'); console.log(JSON.stringify(Object.keys(en.properties)) === JSON.stringify(Object.keys(es.properties)))"
```

---

### Task 4: Add Properties Namespace to French Message File (fr.json)

**Task ID:** 2F.1.4
**Estimated Effort:** 1 story point
**File:** `/messages/fr.json`

#### Description
Add the `properties` namespace with French translations matching the English structure exactly.

#### French Translations

```json
"properties": {
  "title": "Proprietes",
  "subtitle": "Gerez vos proprietes",
  "list": {
    "empty": {
      "title": "Pas encore de proprietes",
      "description": "Ajoutez votre premiere propriete pour organiser vos articles",
      "action": "Ajouter une Propriete"
    },
    "myProperty": "Ma Propriete",
    "myProperties": "Mes Proprietes",
    "itemCount": "{count} {count, plural, one {article} other {articles}}",
    "roomCount": "{count} {count, plural, one {piece} other {pieces}}",
    "loading": "Chargement des proprietes"
  },
  "form": {
    "name": "Nom de la Propriete",
    "namePlaceholder": "ex., Maison de Plage, Appartement Centre-Ville",
    "nameHint": "Un nom convivial pour identifier cette propriete",
    "nickname": "Surnom de la Propriete",
    "nicknamePlaceholder": "ex., Bureau Principal, Maison, Maison de Vacances",
    "address": "Adresse",
    "addressPlaceholder": "Entrez l'adresse de la propriete",
    "addressHint": "Adresse physique ou description de l'emplacement",
    "addressLine1": "Ligne d'Adresse 1",
    "addressLine1Placeholder": "Adresse de rue",
    "addressLine2": "Ligne d'Adresse 2",
    "addressLine2Placeholder": "Apt, suite, unite, etc. (optionnel)",
    "city": "Ville",
    "cityPlaceholder": "Ville",
    "state": "Etat/Province",
    "statePlaceholder": "Etat ou Province",
    "postalCode": "Code Postal",
    "postalCodePlaceholder": "Code postal",
    "country": "Pays",
    "countryPlaceholder": "Selectionner le pays...",
    "type": "Type de Propriete",
    "typePlaceholder": "Selectionner le type de propriete...",
    "owner": "Proprietaire",
    "ownerPlaceholder": "Selectionner le proprietaire...",
    "ownerCannotChange": "Le proprietaire ne peut pas etre modifie apres la creation",
    "optional": "(Optionnel)",
    "required": "(Obligatoire)",
    "characterCount": "{current}/{max}"
  },
  "types": {
    "apartment": "Appartement",
    "house": "Maison",
    "condo": "Copropriete",
    "townhouse": "Maison de Ville",
    "cabin": "Chalet",
    "villa": "Villa",
    "other": "Autre"
  },
  "actions": {
    "add": "Ajouter une Propriete",
    "addNew": "Ajouter une Nouvelle Propriete",
    "edit": "Modifier la Propriete",
    "delete": "Supprimer la Propriete",
    "view": "Voir la Propriete",
    "create": "Creer la Propriete",
    "update": "Mettre a Jour la Propriete",
    "saveChanges": "Enregistrer les Modifications",
    "cancel": "Annuler"
  },
  "modal": {
    "addTitle": "Ajouter une Nouvelle Propriete",
    "addDescription": "Creez une nouvelle propriete en entrant le nom et les informations d'adresse.",
    "editTitle": "Modifier la Propriete",
    "editDescription": "Modifiez les details de votre propriete y compris le nom et les informations d'adresse.",
    "closeLabel": "Fermer le modal"
  },
  "status": {
    "saving": "Enregistrement...",
    "creating": "Creation...",
    "updating": "Mise a jour...",
    "deleting": "Suppression...",
    "savingProperty": "Enregistrement de la propriete",
    "creatingProperty": "Creation de la propriete"
  },
  "delete": {
    "title": "Supprimer la Propriete",
    "message": "Etes-vous sur de vouloir supprimer \"{name}\" ? Tous les articles de cette propriete seront deplaces vers \"Non assigne\".",
    "confirm": "Supprimer la Propriete"
  },
  "selector": {
    "title": "Filtre de Propriete",
    "description": "Filtrer les donnees analytiques par propriete",
    "selectProperty": "Selectionner une Propriete",
    "allProperties": "Toutes les Proprietes",
    "unassigned": "Non assigne",
    "noProperties": "Aucune propriete disponible",
    "loading": "Chargement des proprietes...",
    "ariaLabel": "Selectionner une propriete pour le filtrage analytique"
  },
  "empty": {
    "title": "Ajoutons votre propriete",
    "description": "Une propriete est l'endroit ou vivent vos articles - comme une location de vacances ou une maison.",
    "noPropertiesYet": "Pas encore de proprietes",
    "addFirst": "Ajoutez votre premiere propriete pour organiser vos articles"
  },
  "validation": {
    "nameRequired": "Le nom de la propriete est obligatoire",
    "nameMaxLength": "Le nom de la propriete doit comporter {max} caracteres ou moins",
    "nicknameRequired": "Le surnom de la propriete est obligatoire",
    "nicknameMaxLength": "Le surnom de la propriete doit comporter {max} caracteres ou moins",
    "typeRequired": "Le type de propriete est obligatoire",
    "addressMaxLength": "L'adresse doit comporter {max} caracteres ou moins",
    "cityMaxLength": "La ville doit comporter {max} caracteres ou moins",
    "stateMaxLength": "L'etat/province doit comporter {max} caracteres ou moins",
    "postalCodeMaxLength": "Le code postal doit comporter {max} caracteres ou moins",
    "countryInvalid": "Veuillez selectionner un pays valide"
  },
  "errors": {
    "loadFailed": "Echec du chargement des proprietes",
    "saveFailed": "Echec de l'enregistrement de la propriete",
    "createFailed": "Echec de la creation de la propriete",
    "updateFailed": "Echec de la mise a jour de la propriete",
    "deleteFailed": "Echec de la suppression de la propriete",
    "notFound": "Propriete non trouvee",
    "generic": "Echec de l'enregistrement de la propriete. Veuillez reessayer."
  },
  "aria": {
    "editProperty": "Modifier la propriete : {name}",
    "addNewProperty": "Ajouter une nouvelle propriete",
    "propertyOptions": "Options de propriete"
  }
}
```

#### Acceptance Criteria
- [ ] `properties` namespace added to `/messages/fr.json`
- [ ] Key structure matches English exactly
- [ ] All placeholders preserved
- [ ] ICU plural syntax preserved correctly
- [ ] JSON syntax is valid

#### Verification Steps
```bash
node -e "require('./messages/fr.json')"
node -e "const en = require('./messages/en.json'); const fr = require('./messages/fr.json'); console.log(JSON.stringify(Object.keys(en.properties)) === JSON.stringify(Object.keys(fr.properties)))"
```

---

### Task 5: Add Properties Namespace to Dutch Message File (nl.json)

**Task ID:** 2F.1.5
**Estimated Effort:** 1 story point
**File:** `/messages/nl.json`

#### Description
Add the `properties` namespace with Dutch translations matching the English structure exactly.

#### Dutch Translations

```json
"properties": {
  "title": "Eigendommen",
  "subtitle": "Beheer uw eigendommen",
  "list": {
    "empty": {
      "title": "Nog geen eigendommen",
      "description": "Voeg uw eerste eigendom toe om uw artikelen te organiseren",
      "action": "Eigendom Toevoegen"
    },
    "myProperty": "Mijn Eigendom",
    "myProperties": "Mijn Eigendommen",
    "itemCount": "{count} {count, plural, one {artikel} other {artikelen}}",
    "roomCount": "{count} {count, plural, one {kamer} other {kamers}}",
    "loading": "Eigendommen laden"
  },
  "form": {
    "name": "Naam van Eigendom",
    "namePlaceholder": "bijv., Strandhuis, Stadsappartement",
    "nameHint": "Een vriendelijke naam om dit eigendom te identificeren",
    "nickname": "Bijnaam van Eigendom",
    "nicknamePlaceholder": "bijv., Hoofdkantoor, Thuis, Vakantiehuis",
    "address": "Adres",
    "addressPlaceholder": "Voer het adres van het eigendom in",
    "addressHint": "Fysiek adres of locatiebeschrijving",
    "addressLine1": "Adresregel 1",
    "addressLine1Placeholder": "Straatnaam en huisnummer",
    "addressLine2": "Adresregel 2",
    "addressLine2Placeholder": "Apt, suite, unit, enz. (optioneel)",
    "city": "Stad",
    "cityPlaceholder": "Stad",
    "state": "Provincie/Staat",
    "statePlaceholder": "Provincie of Staat",
    "postalCode": "Postcode",
    "postalCodePlaceholder": "Postcode",
    "country": "Land",
    "countryPlaceholder": "Selecteer land...",
    "type": "Type Eigendom",
    "typePlaceholder": "Selecteer type eigendom...",
    "owner": "Eigenaar",
    "ownerPlaceholder": "Selecteer eigenaar...",
    "ownerCannotChange": "De eigenaar kan niet worden gewijzigd na aanmaak",
    "optional": "(Optioneel)",
    "required": "(Verplicht)",
    "characterCount": "{current}/{max}"
  },
  "types": {
    "apartment": "Appartement",
    "house": "Huis",
    "condo": "Condominium",
    "townhouse": "Rijtjeshuis",
    "cabin": "Hut",
    "villa": "Villa",
    "other": "Overig"
  },
  "actions": {
    "add": "Eigendom Toevoegen",
    "addNew": "Nieuw Eigendom Toevoegen",
    "edit": "Eigendom Bewerken",
    "delete": "Eigendom Verwijderen",
    "view": "Eigendom Bekijken",
    "create": "Eigendom Aanmaken",
    "update": "Eigendom Bijwerken",
    "saveChanges": "Wijzigingen Opslaan",
    "cancel": "Annuleren"
  },
  "modal": {
    "addTitle": "Nieuw Eigendom Toevoegen",
    "addDescription": "Maak een nieuw eigendom aan door de naam en adresgegevens in te voeren.",
    "editTitle": "Eigendom Bewerken",
    "editDescription": "Bewerk de details van uw eigendom inclusief naam en adresgegevens.",
    "closeLabel": "Modal sluiten"
  },
  "status": {
    "saving": "Opslaan...",
    "creating": "Aanmaken...",
    "updating": "Bijwerken...",
    "deleting": "Verwijderen...",
    "savingProperty": "Eigendom opslaan",
    "creatingProperty": "Eigendom aanmaken"
  },
  "delete": {
    "title": "Eigendom Verwijderen",
    "message": "Weet u zeker dat u \"{name}\" wilt verwijderen? Alle artikelen in dit eigendom worden verplaatst naar \"Niet toegewezen\".",
    "confirm": "Eigendom Verwijderen"
  },
  "selector": {
    "title": "Eigendomsfilter",
    "description": "Filter analysegegevens per eigendom",
    "selectProperty": "Selecteer Eigendom",
    "allProperties": "Alle Eigendommen",
    "unassigned": "Niet toegewezen",
    "noProperties": "Geen eigendommen beschikbaar",
    "loading": "Eigendommen laden...",
    "ariaLabel": "Selecteer eigendom voor analysefiltering"
  },
  "empty": {
    "title": "Laten we uw eigendom toevoegen",
    "description": "Een eigendom is waar uw artikelen wonen - zoals een vakantiewoning of huis.",
    "noPropertiesYet": "Nog geen eigendommen",
    "addFirst": "Voeg uw eerste eigendom toe om uw artikelen te organiseren"
  },
  "validation": {
    "nameRequired": "Naam van eigendom is verplicht",
    "nameMaxLength": "Naam van eigendom moet {max} tekens of minder zijn",
    "nicknameRequired": "Bijnaam van eigendom is verplicht",
    "nicknameMaxLength": "Bijnaam van eigendom moet {max} tekens of minder zijn",
    "typeRequired": "Type eigendom is verplicht",
    "addressMaxLength": "Adres moet {max} tekens of minder zijn",
    "cityMaxLength": "Stad moet {max} tekens of minder zijn",
    "stateMaxLength": "Provincie/Staat moet {max} tekens of minder zijn",
    "postalCodeMaxLength": "Postcode moet {max} tekens of minder zijn",
    "countryInvalid": "Selecteer een geldig land"
  },
  "errors": {
    "loadFailed": "Laden van eigendommen mislukt",
    "saveFailed": "Opslaan van eigendom mislukt",
    "createFailed": "Aanmaken van eigendom mislukt",
    "updateFailed": "Bijwerken van eigendom mislukt",
    "deleteFailed": "Verwijderen van eigendom mislukt",
    "notFound": "Eigendom niet gevonden",
    "generic": "Opslaan van eigendom mislukt. Probeer het opnieuw."
  },
  "aria": {
    "editProperty": "Eigendom bewerken: {name}",
    "addNewProperty": "Een nieuw eigendom toevoegen",
    "propertyOptions": "Eigendomsopties"
  }
}
```

#### Acceptance Criteria
- [ ] `properties` namespace added to `/messages/nl.json`
- [ ] Key structure matches English exactly
- [ ] All placeholders preserved
- [ ] ICU plural syntax preserved correctly
- [ ] JSON syntax is valid

#### Verification Steps
```bash
node -e "require('./messages/nl.json')"
node -e "const en = require('./messages/en.json'); const nl = require('./messages/nl.json'); console.log(JSON.stringify(Object.keys(en.properties)) === JSON.stringify(Object.keys(nl.properties)))"
```

---

### Task 6: Add Properties Namespace to Italian Message File (it.json)

**Task ID:** 2F.1.6
**Estimated Effort:** 1 story point
**File:** `/messages/it.json`

#### Description
Add the `properties` namespace with Italian translations matching the English structure exactly.

#### Italian Translations

```json
"properties": {
  "title": "Proprieta",
  "subtitle": "Gestisci le tue proprieta",
  "list": {
    "empty": {
      "title": "Nessuna proprieta ancora",
      "description": "Aggiungi la tua prima proprieta per organizzare i tuoi articoli",
      "action": "Aggiungi Proprieta"
    },
    "myProperty": "La Mia Proprieta",
    "myProperties": "Le Mie Proprieta",
    "itemCount": "{count} {count, plural, one {articolo} other {articoli}}",
    "roomCount": "{count} {count, plural, one {stanza} other {stanze}}",
    "loading": "Caricamento proprieta"
  },
  "form": {
    "name": "Nome della Proprieta",
    "namePlaceholder": "es., Casa al Mare, Appartamento in Centro",
    "nameHint": "Un nome amichevole per identificare questa proprieta",
    "nickname": "Soprannome della Proprieta",
    "nicknamePlaceholder": "es., Ufficio Principale, Casa, Casa Vacanze",
    "address": "Indirizzo",
    "addressPlaceholder": "Inserisci l'indirizzo della proprieta",
    "addressHint": "Indirizzo fisico o descrizione della posizione",
    "addressLine1": "Riga Indirizzo 1",
    "addressLine1Placeholder": "Indirizzo stradale",
    "addressLine2": "Riga Indirizzo 2",
    "addressLine2Placeholder": "Apt, suite, unita, ecc. (opzionale)",
    "city": "Citta",
    "cityPlaceholder": "Citta",
    "state": "Stato/Provincia",
    "statePlaceholder": "Stato o Provincia",
    "postalCode": "Codice Postale",
    "postalCodePlaceholder": "CAP / Codice postale",
    "country": "Paese",
    "countryPlaceholder": "Seleziona paese...",
    "type": "Tipo di Proprieta",
    "typePlaceholder": "Seleziona tipo di proprieta...",
    "owner": "Proprietario",
    "ownerPlaceholder": "Seleziona proprietario...",
    "ownerCannotChange": "Il proprietario non puo essere modificato dopo la creazione",
    "optional": "(Opzionale)",
    "required": "(Obbligatorio)",
    "characterCount": "{current}/{max}"
  },
  "types": {
    "apartment": "Appartamento",
    "house": "Casa",
    "condo": "Condominio",
    "townhouse": "Villetta a Schiera",
    "cabin": "Baita",
    "villa": "Villa",
    "other": "Altro"
  },
  "actions": {
    "add": "Aggiungi Proprieta",
    "addNew": "Aggiungi Nuova Proprieta",
    "edit": "Modifica Proprieta",
    "delete": "Elimina Proprieta",
    "view": "Visualizza Proprieta",
    "create": "Crea Proprieta",
    "update": "Aggiorna Proprieta",
    "saveChanges": "Salva Modifiche",
    "cancel": "Annulla"
  },
  "modal": {
    "addTitle": "Aggiungi Nuova Proprieta",
    "addDescription": "Crea una nuova proprieta inserendo il nome e le informazioni sull'indirizzo.",
    "editTitle": "Modifica Proprieta",
    "editDescription": "Modifica i dettagli della tua proprieta inclusi nome e informazioni sull'indirizzo.",
    "closeLabel": "Chiudi modale"
  },
  "status": {
    "saving": "Salvataggio...",
    "creating": "Creazione...",
    "updating": "Aggiornamento...",
    "deleting": "Eliminazione...",
    "savingProperty": "Salvataggio proprieta",
    "creatingProperty": "Creazione proprieta"
  },
  "delete": {
    "title": "Elimina Proprieta",
    "message": "Sei sicuro di voler eliminare \"{name}\"? Tutti gli articoli in questa proprieta verranno spostati in \"Non assegnato\".",
    "confirm": "Elimina Proprieta"
  },
  "selector": {
    "title": "Filtro Proprieta",
    "description": "Filtra i dati analitici per proprieta",
    "selectProperty": "Seleziona Proprieta",
    "allProperties": "Tutte le Proprieta",
    "unassigned": "Non assegnato",
    "noProperties": "Nessuna proprieta disponibile",
    "loading": "Caricamento proprieta...",
    "ariaLabel": "Seleziona proprieta per il filtraggio analitico"
  },
  "empty": {
    "title": "Aggiungiamo la tua proprieta",
    "description": "Una proprieta e dove vivono i tuoi articoli - come un affitto vacanze o una casa.",
    "noPropertiesYet": "Nessuna proprieta ancora",
    "addFirst": "Aggiungi la tua prima proprieta per organizzare i tuoi articoli"
  },
  "validation": {
    "nameRequired": "Il nome della proprieta e obbligatorio",
    "nameMaxLength": "Il nome della proprieta deve essere di {max} caratteri o meno",
    "nicknameRequired": "Il soprannome della proprieta e obbligatorio",
    "nicknameMaxLength": "Il soprannome della proprieta deve essere di {max} caratteri o meno",
    "typeRequired": "Il tipo di proprieta e obbligatorio",
    "addressMaxLength": "L'indirizzo deve essere di {max} caratteri o meno",
    "cityMaxLength": "La citta deve essere di {max} caratteri o meno",
    "stateMaxLength": "Lo stato/provincia deve essere di {max} caratteri o meno",
    "postalCodeMaxLength": "Il codice postale deve essere di {max} caratteri o meno",
    "countryInvalid": "Seleziona un paese valido"
  },
  "errors": {
    "loadFailed": "Caricamento proprieta non riuscito",
    "saveFailed": "Salvataggio proprieta non riuscito",
    "createFailed": "Creazione proprieta non riuscita",
    "updateFailed": "Aggiornamento proprieta non riuscito",
    "deleteFailed": "Eliminazione proprieta non riuscita",
    "notFound": "Proprieta non trovata",
    "generic": "Salvataggio proprieta non riuscito. Riprova."
  },
  "aria": {
    "editProperty": "Modifica proprieta: {name}",
    "addNewProperty": "Aggiungi una nuova proprieta",
    "propertyOptions": "Opzioni proprieta"
  }
}
```

#### Acceptance Criteria
- [ ] `properties` namespace added to `/messages/it.json`
- [ ] Key structure matches English exactly
- [ ] All placeholders preserved
- [ ] ICU plural syntax preserved correctly
- [ ] JSON syntax is valid

#### Verification Steps
```bash
node -e "require('./messages/it.json')"
node -e "const en = require('./messages/en.json'); const it = require('./messages/it.json'); console.log(JSON.stringify(Object.keys(en.properties)) === JSON.stringify(Object.keys(it.properties)))"
```

---

### Task 7: Final Validation and Build Verification

**Task ID:** 2F.1.7
**Estimated Effort:** 0.5 story points
**Files:** All `/messages/*.json` files

#### Description
Run comprehensive validation to ensure all translation files are correctly structured, syntactically valid, and build successfully.

#### Implementation Steps

1. **JSON Syntax Validation:**
   ```bash
   node -e "require('./messages/en.json')"
   node -e "require('./messages/de.json')"
   node -e "require('./messages/es.json')"
   node -e "require('./messages/fr.json')"
   node -e "require('./messages/nl.json')"
   node -e "require('./messages/it.json')"
   ```

2. **Key Structure Consistency Check:**
   ```bash
   node -e "
   const en = require('./messages/en.json');
   const langs = ['de', 'es', 'fr', 'nl', 'it'];
   const enKeys = JSON.stringify(Object.keys(en.properties).sort());
   langs.forEach(lang => {
     const langFile = require('./messages/' + lang + '.json');
     const langKeys = JSON.stringify(Object.keys(langFile.properties).sort());
     console.log(lang + ': ' + (enKeys === langKeys ? 'PASS' : 'FAIL'));
   });
   "
   ```

3. **Build Verification:**
   ```bash
   npm run build
   ```

4. **Namespace Access Test:**
   ```typescript
   // Verify namespace is accessible in code
   import messages from '@/messages/en.json';
   console.log(messages.properties.title); // Should output "Properties"
   ```

#### Acceptance Criteria
- [ ] All 6 message files pass JSON syntax validation
- [ ] All 6 message files have identical `properties` namespace key structure
- [ ] `npm run build` completes successfully without errors
- [ ] Properties namespace can be accessed in code

---

## Summary Checklist

| Task | File | Status |
|------|------|--------|
| 2F.1.1 | `/messages/en.json` | [ ] |
| 2F.1.2 | `/messages/de.json` | [ ] |
| 2F.1.3 | `/messages/es.json` | [ ] |
| 2F.1.4 | `/messages/fr.json` | [ ] |
| 2F.1.5 | `/messages/nl.json` | [ ] |
| 2F.1.6 | `/messages/it.json` | [ ] |
| 2F.1.7 | Validation & Build | [ ] |

---

## Technical Notes

### Key Naming Convention

Following the established pattern from the Implementation Plan:
```
{namespace}.{component/area}.{element}.{variant?}
```

Examples from this namespace:
- `properties.form.name` - Form field label
- `properties.list.empty.title` - Empty state title in list view
- `properties.validation.nameRequired` - Validation error message
- `properties.selector.allProperties` - Selector option

### Variable Interpolation

Keys requiring runtime variables:
- `{count}` - Numeric count for pluralization
- `{name}` - Property name for delete confirmation and aria labels
- `{max}` - Maximum character count for validation messages
- `{current}` - Current character count

### Pluralization

ICU message format for count-dependent strings:
```json
"itemCount": "{count} {count, plural, one {item} other {items}}"
```

Usage in code:
```typescript
t('list.itemCount', { count: 5 })  // "5 items"
t('list.itemCount', { count: 1 })  // "1 item"
```

---

## Dependencies

### Downstream Tasks

The following Sub-Epic 2F tasks depend on this namespace being complete:

| Task | Description | Depends On |
|------|-------------|------------|
| 2F.2 | Update PropertyForm component | 2F.1 |
| 2F.3 | Update property modals (PropertyEditModal, AddPropertyModal) | 2F.1 |
| 2F.4 | Update property pages | 2F.1 |
| 2F.5 | Update PropertySelector | 2F.1 |

---

## Files NOT to Modify

The following files should NOT be modified as part of REQ-398 (they will be updated in subsequent tasks):

- `/src/components/PropertyForm.tsx`
- `/src/components/PropertySelector.tsx`
- `/src/components/SimpleDashboard/PropertyEditModal.tsx`
- `/src/components/SimpleDashboard/AddPropertyModal.tsx`
- `/src/components/SimpleDashboard/PropertySection.tsx`
- `/src/components/SimpleDashboard/PropertySearchBar.tsx`
- `/src/components/SimpleDashboard/PropertyGroupingControl.tsx`
- `/src/components/ItemManager/components/dialogs/PropertyFilter.tsx`
- `/src/components/dashboard/PropertyDropdown.tsx`
- `/src/app/dashboard2/properties/**/*.tsx`

---

## References

- [Overview Document](/docs/REQ-398-create-properties-namespace-structure-overview.md)
- [Implementation Plan](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [PRD: L10N Epic 2](/docs/prd/PRD_L10N_Epic2_Static_UI_Translation.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2F: Property Management*
*Task ID: 2F.1 - Create Properties Namespace Structure*
