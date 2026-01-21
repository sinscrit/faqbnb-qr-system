# REQ-E02-083: Update Item Detail and Edit Pages - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Request ID:** REQ-E02-083
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.6
**Priority:** High
**Size:** M (Medium)

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Overview

This document provides a detailed, actionable task breakdown for implementing internationalization support in the item detail/edit pages: Edit Item Page, Items List Page, RoomSelector, ItemTypeSelector, ItemInstructionsList, and TagsInlineEdit. Each task is designed to be approximately 1 story point and can be completed independently where possible.

**Source Documents:**
- Overview: `/docs/REQ-E02-083-update-item-detailedit-pages-overview.md`
- Requirements: `/docs/gen_requests_epic2.md` (Request #83)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

---

## Task Summary

| Task ID | Title | Priority | Estimated SP | Dependencies |
|---------|-------|----------|--------------|--------------|
| T1 | Add `items.edit` translations to English | High | 1 | None |
| T2 | Add `items.list` translations to English | High | 0.5 | None |
| T3 | Add translations to 5 non-English locales | High | 1 | T1, T2 |
| T4 | Update Edit Item Page with i18n | High | 1.5 | T1 |
| T5 | Update RoomSelector component with i18n | High | 1 | T1 |
| T6 | Update ItemTypeSelector component with i18n | High | 1 | T1 |
| T7 | Update ItemInstructionsList component with i18n | High | 1 | T1 |
| T8 | Update TagsInlineEdit component with i18n | High | 1.5 | T1 |
| T9 | Update Items List Page with i18n | Medium | 1 | T2 |
| T10 | Verification and testing | High | 1 | All |

**Total Estimated Story Points:** 10.5

---

## Detailed Tasks

### Task T1: Add `items.edit` Translations to English

**Task ID:** REQ-E02-083-T1
**Priority:** High
**Story Points:** 1
**Dependencies:** None

**Description:**
Add new translation keys for the item edit page and its supporting components to the English translation file (`/messages/en.json`). This includes page titles, navigation, form labels, placeholders, helper text, buttons, guides section, room labels, item type labels, purpose labels, and tags-related strings.

**File to Modify:**
- `/messages/en.json`

**Changes Required:**

Add the following keys under the existing `items` namespace (create `edit` sub-namespace):

```json
{
  "items": {
    "edit": {
      "pageTitle": "Edit Item",
      "backToItems": "Back to Items",
      "loading": "Loading item...",
      "loginRequired": "Please log in to edit items.",
      "returnToItems": "Return to Items",
      "notFound": "Item not found",
      "loadError": "Failed to load item. Please try again.",
      "form": {
        "nameLabel": "Item Name",
        "namePlaceholder": "Enter item name",
        "descriptionLabel": "Description",
        "descriptionPlaceholder": "Enter item description (optional)",
        "roomLabel": "Room",
        "roomPlaceholder": "Select a room...",
        "roomAriaLabel": "Select room for this item",
        "itemTypeLabel": "Item Type",
        "itemTypePlaceholder": "Select item type...",
        "itemTypeAriaLabel": "Select item type",
        "tagsLabel": "Additional Tags",
        "tagsHelper": "Add custom tags for additional categorization",
        "tagsPlaceholder": "Click to add tags..."
      },
      "buttons": {
        "cancel": "Cancel",
        "save": "Save Changes",
        "saving": "Saving..."
      },
      "guides": {
        "title": "Guides",
        "description": "Content associated with this item",
        "empty": "No guides yet",
        "emptyDescription": "Guides for this item will appear here",
        "edit": "Edit"
      },
      "purposes": {
        "howToUse": "How To Use",
        "troubleshooting": "Troubleshooting",
        "howToClean": "How To Clean",
        "safetyInfo": "Safety Info",
        "maintenance": "Maintenance",
        "features": "Features",
        "other": "Other"
      },
      "rooms": {
        "kitchen": "Kitchen",
        "bathroom": "Bathroom",
        "bedroom": "Bedroom",
        "livingRoom": "Living Room",
        "laundry": "Laundry",
        "garage": "Garage",
        "outdoor": "Outdoor",
        "office": "Office",
        "gym": "Gym",
        "pool": "Pool",
        "other": "Other"
      },
      "itemTypes": {
        "appliance": "Appliance",
        "roomItem": "Room Item",
        "generalInfo": "General Info"
      },
      "tags": {
        "addTags": "Add tags...",
        "typeToAdd": "Type to add...",
        "maxReached": "Max tags reached",
        "saving": "Saving...",
        "editTags": "Edit tags",
        "tagsSelected": "{count} tags selected",
        "savingTags": "Saving tags...",
        "moreCount": "+{count} more",
        "suggestions": "Tag suggestions",
        "addNewTag": "Add new tag",
        "removeTag": "Remove tag {tag}",
        "validation": {
          "empty": "Tag cannot be empty",
          "tooLong": "Tag must be {max} characters or less",
          "duplicate": "Tag already exists",
          "maxTags": "Maximum {max} tags allowed"
        }
      }
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `items.edit.pageTitle` and navigation keys added
- [ ] `items.edit.form.*` keys added for all form labels and placeholders
- [ ] `items.edit.buttons.*` keys added for all button labels
- [ ] `items.edit.guides.*` keys added for guides section
- [ ] `items.edit.purposes.*` keys added for all purpose types
- [ ] `items.edit.rooms.*` keys added for all room types
- [ ] `items.edit.itemTypes.*` keys added for all item types
- [ ] `items.edit.tags.*` keys added with validation sub-keys
- [ ] JSON file is valid (no syntax errors)
- [ ] Build completes without errors

**Verification Command:**
```bash
npm run typecheck && cat messages/en.json | jq '.items.edit'
```

---

### Task T2: Add `items.list` Translations to English

**Task ID:** REQ-E02-083-T2
**Priority:** High
**Story Points:** 0.5
**Dependencies:** None

**Description:**
Add translation keys for the Items List Page to the English translation file. This includes page title, item count with pluralization, button labels, and state messages.

**File to Modify:**
- `/messages/en.json`

**Changes Required:**

Add the following keys under `items.list`:

```json
{
  "items": {
    "list": {
      "title": "My Items",
      "count": "{count, plural, one {# item} other {# items}} total",
      "createNew": "New QR Code Item",
      "loginRequired": "Please log in to view items.",
      "loading": "Loading items...",
      "dismiss": "Dismiss",
      "error": "An error occurred",
      "noItems": "No items yet",
      "noItemsDescription": "Create your first QR code item to get started"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] `items.list.title` key added
- [ ] `items.list.count` key added with ICU plural format
- [ ] `items.list.createNew` key added
- [ ] `items.list.loginRequired` key added
- [ ] `items.list.loading` key added
- [ ] `items.list.dismiss` key added
- [ ] Empty state keys added
- [ ] JSON file is valid (no syntax errors)
- [ ] Build completes without errors

**Verification Command:**
```bash
npm run typecheck && cat messages/en.json | jq '.items.list'
```

---

### Task T3: Add Translations to 5 Non-English Locales

**Task ID:** REQ-E02-083-T3
**Priority:** High
**Story Points:** 1
**Dependencies:** T1, T2

**Description:**
Add translations for all new keys to French, Spanish, German, Dutch, and Italian locale files. Ensure consistent key structure across all files.

**Files to Modify:**
- `/messages/fr.json`
- `/messages/es.json`
- `/messages/de.json`
- `/messages/nl.json`
- `/messages/it.json`

**Translation Reference:**

**French (fr.json):**
```json
{
  "items": {
    "edit": {
      "pageTitle": "Modifier l'article",
      "backToItems": "Retour aux articles",
      "loading": "Chargement de l'article...",
      "loginRequired": "Veuillez vous connecter pour modifier les articles.",
      "returnToItems": "Retour aux articles",
      "notFound": "Article non trouve",
      "loadError": "Echec du chargement de l'article. Veuillez reessayer.",
      "form": {
        "nameLabel": "Nom de l'article",
        "namePlaceholder": "Entrez le nom de l'article",
        "descriptionLabel": "Description",
        "descriptionPlaceholder": "Entrez la description de l'article (optionnel)",
        "roomLabel": "Piece",
        "roomPlaceholder": "Selectionnez une piece...",
        "roomAriaLabel": "Selectionnez la piece pour cet article",
        "itemTypeLabel": "Type d'article",
        "itemTypePlaceholder": "Selectionnez le type d'article...",
        "itemTypeAriaLabel": "Selectionnez le type d'article",
        "tagsLabel": "Tags supplementaires",
        "tagsHelper": "Ajoutez des tags personnalises pour une categorisation supplementaire",
        "tagsPlaceholder": "Cliquez pour ajouter des tags..."
      },
      "buttons": {
        "cancel": "Annuler",
        "save": "Enregistrer les modifications",
        "saving": "Enregistrement..."
      },
      "guides": {
        "title": "Guides",
        "description": "Contenu associe a cet article",
        "empty": "Pas encore de guides",
        "emptyDescription": "Les guides pour cet article apparaitront ici",
        "edit": "Modifier"
      },
      "purposes": {
        "howToUse": "Comment utiliser",
        "troubleshooting": "Depannage",
        "howToClean": "Comment nettoyer",
        "safetyInfo": "Informations de securite",
        "maintenance": "Entretien",
        "features": "Fonctionnalites",
        "other": "Autre"
      },
      "rooms": {
        "kitchen": "Cuisine",
        "bathroom": "Salle de bain",
        "bedroom": "Chambre",
        "livingRoom": "Salon",
        "laundry": "Buanderie",
        "garage": "Garage",
        "outdoor": "Exterieur",
        "office": "Bureau",
        "gym": "Salle de sport",
        "pool": "Piscine",
        "other": "Autre"
      },
      "itemTypes": {
        "appliance": "Appareil",
        "roomItem": "Article de piece",
        "generalInfo": "Informations generales"
      },
      "tags": {
        "addTags": "Ajouter des tags...",
        "typeToAdd": "Tapez pour ajouter...",
        "maxReached": "Nombre max de tags atteint",
        "saving": "Enregistrement...",
        "editTags": "Modifier les tags",
        "tagsSelected": "{count} tags selectionnes",
        "savingTags": "Enregistrement des tags...",
        "moreCount": "+{count} de plus",
        "suggestions": "Suggestions de tags",
        "addNewTag": "Ajouter un nouveau tag",
        "removeTag": "Supprimer le tag {tag}",
        "validation": {
          "empty": "Le tag ne peut pas etre vide",
          "tooLong": "Le tag doit faire {max} caracteres ou moins",
          "duplicate": "Le tag existe deja",
          "maxTags": "Maximum {max} tags autorises"
        }
      }
    },
    "list": {
      "title": "Mes articles",
      "count": "{count, plural, one {# article} other {# articles}} au total",
      "createNew": "Nouvel article QR Code",
      "loginRequired": "Veuillez vous connecter pour voir les articles.",
      "loading": "Chargement des articles...",
      "dismiss": "Ignorer",
      "error": "Une erreur s'est produite",
      "noItems": "Pas encore d'articles",
      "noItemsDescription": "Creez votre premier article QR Code pour commencer"
    }
  }
}
```

**Spanish (es.json):**
```json
{
  "items": {
    "edit": {
      "pageTitle": "Editar articulo",
      "backToItems": "Volver a articulos",
      "loading": "Cargando articulo...",
      "loginRequired": "Por favor inicie sesion para editar articulos.",
      "returnToItems": "Volver a articulos",
      "notFound": "Articulo no encontrado",
      "loadError": "Error al cargar el articulo. Por favor intente de nuevo.",
      "form": {
        "nameLabel": "Nombre del articulo",
        "namePlaceholder": "Ingrese el nombre del articulo",
        "descriptionLabel": "Descripcion",
        "descriptionPlaceholder": "Ingrese la descripcion del articulo (opcional)",
        "roomLabel": "Habitacion",
        "roomPlaceholder": "Seleccionar una habitacion...",
        "roomAriaLabel": "Seleccionar habitacion para este articulo",
        "itemTypeLabel": "Tipo de articulo",
        "itemTypePlaceholder": "Seleccionar tipo de articulo...",
        "itemTypeAriaLabel": "Seleccionar tipo de articulo",
        "tagsLabel": "Etiquetas adicionales",
        "tagsHelper": "Agregar etiquetas personalizadas para categorizacion adicional",
        "tagsPlaceholder": "Haga clic para agregar etiquetas..."
      },
      "buttons": {
        "cancel": "Cancelar",
        "save": "Guardar cambios",
        "saving": "Guardando..."
      },
      "guides": {
        "title": "Guias",
        "description": "Contenido asociado a este articulo",
        "empty": "Sin guias todavia",
        "emptyDescription": "Las guias para este articulo apareceran aqui",
        "edit": "Editar"
      },
      "purposes": {
        "howToUse": "Como usar",
        "troubleshooting": "Solucion de problemas",
        "howToClean": "Como limpiar",
        "safetyInfo": "Informacion de seguridad",
        "maintenance": "Mantenimiento",
        "features": "Caracteristicas",
        "other": "Otro"
      },
      "rooms": {
        "kitchen": "Cocina",
        "bathroom": "Bano",
        "bedroom": "Dormitorio",
        "livingRoom": "Sala de estar",
        "laundry": "Lavanderia",
        "garage": "Garaje",
        "outdoor": "Exterior",
        "office": "Oficina",
        "gym": "Gimnasio",
        "pool": "Piscina",
        "other": "Otro"
      },
      "itemTypes": {
        "appliance": "Electrodomestico",
        "roomItem": "Articulo de habitacion",
        "generalInfo": "Informacion general"
      },
      "tags": {
        "addTags": "Agregar etiquetas...",
        "typeToAdd": "Escriba para agregar...",
        "maxReached": "Maximo de etiquetas alcanzado",
        "saving": "Guardando...",
        "editTags": "Editar etiquetas",
        "tagsSelected": "{count} etiquetas seleccionadas",
        "savingTags": "Guardando etiquetas...",
        "moreCount": "+{count} mas",
        "suggestions": "Sugerencias de etiquetas",
        "addNewTag": "Agregar nueva etiqueta",
        "removeTag": "Eliminar etiqueta {tag}",
        "validation": {
          "empty": "La etiqueta no puede estar vacia",
          "tooLong": "La etiqueta debe tener {max} caracteres o menos",
          "duplicate": "La etiqueta ya existe",
          "maxTags": "Maximo {max} etiquetas permitidas"
        }
      }
    },
    "list": {
      "title": "Mis articulos",
      "count": "{count, plural, one {# articulo} other {# articulos}} en total",
      "createNew": "Nuevo articulo QR Code",
      "loginRequired": "Por favor inicie sesion para ver articulos.",
      "loading": "Cargando articulos...",
      "dismiss": "Descartar",
      "error": "Ocurrio un error",
      "noItems": "Sin articulos todavia",
      "noItemsDescription": "Cree su primer articulo QR Code para comenzar"
    }
  }
}
```

**German (de.json):**
```json
{
  "items": {
    "edit": {
      "pageTitle": "Artikel bearbeiten",
      "backToItems": "Zuruck zu Artikeln",
      "loading": "Artikel wird geladen...",
      "loginRequired": "Bitte melden Sie sich an, um Artikel zu bearbeiten.",
      "returnToItems": "Zuruck zu Artikeln",
      "notFound": "Artikel nicht gefunden",
      "loadError": "Artikel konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
      "form": {
        "nameLabel": "Artikelname",
        "namePlaceholder": "Artikelname eingeben",
        "descriptionLabel": "Beschreibung",
        "descriptionPlaceholder": "Artikelbeschreibung eingeben (optional)",
        "roomLabel": "Raum",
        "roomPlaceholder": "Raum auswahlen...",
        "roomAriaLabel": "Raum fur diesen Artikel auswahlen",
        "itemTypeLabel": "Artikeltyp",
        "itemTypePlaceholder": "Artikeltyp auswahlen...",
        "itemTypeAriaLabel": "Artikeltyp auswahlen",
        "tagsLabel": "Zusatzliche Tags",
        "tagsHelper": "Benutzerdefinierte Tags fur zusatzliche Kategorisierung hinzufugen",
        "tagsPlaceholder": "Klicken Sie, um Tags hinzuzufugen..."
      },
      "buttons": {
        "cancel": "Abbrechen",
        "save": "Anderungen speichern",
        "saving": "Speichern..."
      },
      "guides": {
        "title": "Anleitungen",
        "description": "Inhalt, der mit diesem Artikel verknupft ist",
        "empty": "Noch keine Anleitungen",
        "emptyDescription": "Anleitungen fur diesen Artikel werden hier angezeigt",
        "edit": "Bearbeiten"
      },
      "purposes": {
        "howToUse": "Wie zu benutzen",
        "troubleshooting": "Fehlerbehebung",
        "howToClean": "Wie zu reinigen",
        "safetyInfo": "Sicherheitsinformationen",
        "maintenance": "Wartung",
        "features": "Funktionen",
        "other": "Sonstiges"
      },
      "rooms": {
        "kitchen": "Kuche",
        "bathroom": "Badezimmer",
        "bedroom": "Schlafzimmer",
        "livingRoom": "Wohnzimmer",
        "laundry": "Waschkuche",
        "garage": "Garage",
        "outdoor": "Aussen",
        "office": "Buro",
        "gym": "Fitnessstudio",
        "pool": "Pool",
        "other": "Sonstiges"
      },
      "itemTypes": {
        "appliance": "Gerat",
        "roomItem": "Raumartikel",
        "generalInfo": "Allgemeine Informationen"
      },
      "tags": {
        "addTags": "Tags hinzufugen...",
        "typeToAdd": "Tippen zum Hinzufugen...",
        "maxReached": "Maximale Anzahl Tags erreicht",
        "saving": "Speichern...",
        "editTags": "Tags bearbeiten",
        "tagsSelected": "{count} Tags ausgewahlt",
        "savingTags": "Tags werden gespeichert...",
        "moreCount": "+{count} weitere",
        "suggestions": "Tag-Vorschlage",
        "addNewTag": "Neuen Tag hinzufugen",
        "removeTag": "Tag {tag} entfernen",
        "validation": {
          "empty": "Tag darf nicht leer sein",
          "tooLong": "Tag muss {max} Zeichen oder weniger haben",
          "duplicate": "Tag existiert bereits",
          "maxTags": "Maximal {max} Tags erlaubt"
        }
      }
    },
    "list": {
      "title": "Meine Artikel",
      "count": "{count, plural, one {# Artikel} other {# Artikel}} insgesamt",
      "createNew": "Neuer QR-Code-Artikel",
      "loginRequired": "Bitte melden Sie sich an, um Artikel anzuzeigen.",
      "loading": "Artikel werden geladen...",
      "dismiss": "Verwerfen",
      "error": "Ein Fehler ist aufgetreten",
      "noItems": "Noch keine Artikel",
      "noItemsDescription": "Erstellen Sie Ihren ersten QR-Code-Artikel, um zu beginnen"
    }
  }
}
```

**Dutch (nl.json):**
```json
{
  "items": {
    "edit": {
      "pageTitle": "Item bewerken",
      "backToItems": "Terug naar items",
      "loading": "Item laden...",
      "loginRequired": "Log in om items te bewerken.",
      "returnToItems": "Terug naar items",
      "notFound": "Item niet gevonden",
      "loadError": "Item laden mislukt. Probeer het opnieuw.",
      "form": {
        "nameLabel": "Itemnaam",
        "namePlaceholder": "Voer itemnaam in",
        "descriptionLabel": "Beschrijving",
        "descriptionPlaceholder": "Voer itembeschrijving in (optioneel)",
        "roomLabel": "Kamer",
        "roomPlaceholder": "Selecteer een kamer...",
        "roomAriaLabel": "Selecteer kamer voor dit item",
        "itemTypeLabel": "Itemtype",
        "itemTypePlaceholder": "Selecteer itemtype...",
        "itemTypeAriaLabel": "Selecteer itemtype",
        "tagsLabel": "Extra tags",
        "tagsHelper": "Voeg aangepaste tags toe voor extra categorisatie",
        "tagsPlaceholder": "Klik om tags toe te voegen..."
      },
      "buttons": {
        "cancel": "Annuleren",
        "save": "Wijzigingen opslaan",
        "saving": "Opslaan..."
      },
      "guides": {
        "title": "Handleidingen",
        "description": "Inhoud gekoppeld aan dit item",
        "empty": "Nog geen handleidingen",
        "emptyDescription": "Handleidingen voor dit item verschijnen hier",
        "edit": "Bewerken"
      },
      "purposes": {
        "howToUse": "Hoe te gebruiken",
        "troubleshooting": "Probleemoplossing",
        "howToClean": "Hoe schoon te maken",
        "safetyInfo": "Veiligheidsinformatie",
        "maintenance": "Onderhoud",
        "features": "Functies",
        "other": "Overig"
      },
      "rooms": {
        "kitchen": "Keuken",
        "bathroom": "Badkamer",
        "bedroom": "Slaapkamer",
        "livingRoom": "Woonkamer",
        "laundry": "Wasruimte",
        "garage": "Garage",
        "outdoor": "Buiten",
        "office": "Kantoor",
        "gym": "Sportschool",
        "pool": "Zwembad",
        "other": "Overig"
      },
      "itemTypes": {
        "appliance": "Apparaat",
        "roomItem": "Kameritem",
        "generalInfo": "Algemene informatie"
      },
      "tags": {
        "addTags": "Tags toevoegen...",
        "typeToAdd": "Typ om toe te voegen...",
        "maxReached": "Maximum tags bereikt",
        "saving": "Opslaan...",
        "editTags": "Tags bewerken",
        "tagsSelected": "{count} tags geselecteerd",
        "savingTags": "Tags opslaan...",
        "moreCount": "+{count} meer",
        "suggestions": "Tag suggesties",
        "addNewTag": "Nieuwe tag toevoegen",
        "removeTag": "Tag {tag} verwijderen",
        "validation": {
          "empty": "Tag mag niet leeg zijn",
          "tooLong": "Tag moet {max} tekens of minder zijn",
          "duplicate": "Tag bestaat al",
          "maxTags": "Maximaal {max} tags toegestaan"
        }
      }
    },
    "list": {
      "title": "Mijn items",
      "count": "{count, plural, one {# item} other {# items}} totaal",
      "createNew": "Nieuw QR-code item",
      "loginRequired": "Log in om items te bekijken.",
      "loading": "Items laden...",
      "dismiss": "Sluiten",
      "error": "Er is een fout opgetreden",
      "noItems": "Nog geen items",
      "noItemsDescription": "Maak uw eerste QR-code item om te beginnen"
    }
  }
}
```

**Italian (it.json):**
```json
{
  "items": {
    "edit": {
      "pageTitle": "Modifica articolo",
      "backToItems": "Torna agli articoli",
      "loading": "Caricamento articolo...",
      "loginRequired": "Effettua l'accesso per modificare gli articoli.",
      "returnToItems": "Torna agli articoli",
      "notFound": "Articolo non trovato",
      "loadError": "Caricamento articolo fallito. Riprova.",
      "form": {
        "nameLabel": "Nome articolo",
        "namePlaceholder": "Inserisci il nome dell'articolo",
        "descriptionLabel": "Descrizione",
        "descriptionPlaceholder": "Inserisci la descrizione dell'articolo (opzionale)",
        "roomLabel": "Stanza",
        "roomPlaceholder": "Seleziona una stanza...",
        "roomAriaLabel": "Seleziona la stanza per questo articolo",
        "itemTypeLabel": "Tipo di articolo",
        "itemTypePlaceholder": "Seleziona il tipo di articolo...",
        "itemTypeAriaLabel": "Seleziona il tipo di articolo",
        "tagsLabel": "Tag aggiuntivi",
        "tagsHelper": "Aggiungi tag personalizzati per una categorizzazione aggiuntiva",
        "tagsPlaceholder": "Clicca per aggiungere tag..."
      },
      "buttons": {
        "cancel": "Annulla",
        "save": "Salva modifiche",
        "saving": "Salvataggio..."
      },
      "guides": {
        "title": "Guide",
        "description": "Contenuto associato a questo articolo",
        "empty": "Nessuna guida ancora",
        "emptyDescription": "Le guide per questo articolo appariranno qui",
        "edit": "Modifica"
      },
      "purposes": {
        "howToUse": "Come usare",
        "troubleshooting": "Risoluzione problemi",
        "howToClean": "Come pulire",
        "safetyInfo": "Informazioni di sicurezza",
        "maintenance": "Manutenzione",
        "features": "Funzionalita",
        "other": "Altro"
      },
      "rooms": {
        "kitchen": "Cucina",
        "bathroom": "Bagno",
        "bedroom": "Camera da letto",
        "livingRoom": "Soggiorno",
        "laundry": "Lavanderia",
        "garage": "Garage",
        "outdoor": "Esterno",
        "office": "Ufficio",
        "gym": "Palestra",
        "pool": "Piscina",
        "other": "Altro"
      },
      "itemTypes": {
        "appliance": "Elettrodomestico",
        "roomItem": "Articolo della stanza",
        "generalInfo": "Informazioni generali"
      },
      "tags": {
        "addTags": "Aggiungi tag...",
        "typeToAdd": "Digita per aggiungere...",
        "maxReached": "Numero massimo di tag raggiunto",
        "saving": "Salvataggio...",
        "editTags": "Modifica tag",
        "tagsSelected": "{count} tag selezionati",
        "savingTags": "Salvataggio tag...",
        "moreCount": "+{count} altri",
        "suggestions": "Suggerimenti tag",
        "addNewTag": "Aggiungi nuovo tag",
        "removeTag": "Rimuovi tag {tag}",
        "validation": {
          "empty": "Il tag non puo essere vuoto",
          "tooLong": "Il tag deve essere di {max} caratteri o meno",
          "duplicate": "Il tag esiste gia",
          "maxTags": "Massimo {max} tag consentiti"
        }
      }
    },
    "list": {
      "title": "I miei articoli",
      "count": "{count, plural, one {# articolo} other {# articoli}} in totale",
      "createNew": "Nuovo articolo QR Code",
      "loginRequired": "Effettua l'accesso per visualizzare gli articoli.",
      "loading": "Caricamento articoli...",
      "dismiss": "Chiudi",
      "error": "Si e verificato un errore",
      "noItems": "Nessun articolo ancora",
      "noItemsDescription": "Crea il tuo primo articolo QR Code per iniziare"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] All 5 locale files updated with identical key structure
- [ ] ICU plural format used correctly in all languages
- [ ] Variable interpolation syntax consistent (`{variableName}`)
- [ ] All JSON files are valid (no syntax errors)
- [ ] Build completes without errors

**Verification Command:**
```bash
npm run typecheck && for f in messages/*.json; do echo "Checking $f"; cat "$f" | jq '.items.edit' > /dev/null && echo "OK"; done
```

---

### Task T4: Update Edit Item Page with i18n

**Task ID:** REQ-E02-083-T4
**Priority:** High
**Story Points:** 1.5
**Dependencies:** T1

**Description:**
Add the `useTranslations` hook to the Edit Item Page and replace all hardcoded strings with translated versions.

**File to Modify:**
- `src/app/dashboard2/items/[publicId]/edit/page.tsx`

**Current Code Locations (from overview):**
- Line 221: `"Edit Item"` (page title)
- Lines 218-219: `"Back to Items"` (back button)
- Line 188: `"Loading item..."` (loading state)
- Line 178: `"Please log in to edit items."` (login prompt)
- Lines 202-204: `"Return to Items"` (error return link)
- Lines 236-237: `"Item Name"` (form label)
- Lines 247-248: `"Enter item name"` (placeholder)
- Lines 252-253: `"Description"` (form label)
- Lines 263-264: `"Enter item description (optional)"` (placeholder)
- Lines 282-283: `"Additional Tags"` (form label)
- Lines 286-288: `"Add custom tags for additional categorization"` (helper text)
- Line 293: `"Click to add tags..."` (placeholder)
- Lines 315-316: `"Cancel"` (button)
- Lines 327-332: `"Save Changes"`, `"Saving..."` (button states)

**Target Approach:**

1. Add import at the top (after other imports):
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook initialization inside the component function:
```typescript
export default function EditItemPage() {
  const t = useTranslations('items.edit');
  // ... existing state and hooks
```

3. Replace login required state:
```typescript
if (!user) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-600">{t('loginRequired')}</p>
    </div>
  );
}
```

4. Replace loading state:
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      <p className="ml-2 text-gray-600">{t('loading')}</p>
    </div>
  );
}
```

5. Replace error state with return link:
```typescript
if (error || !item) {
  return (
    <div className="text-center py-8">
      <p className="text-red-500 mb-4">{error || t('notFound')}</p>
      <Link href="/dashboard2/items" className="text-blue-500 hover:underline">
        {t('returnToItems')}
      </Link>
    </div>
  );
}
```

6. Replace page header:
```typescript
<div className="mb-6">
  <button onClick={() => router.push('/dashboard2/items')} className="...">
    <ArrowLeft className="w-4 h-4" />
    {t('backToItems')}
  </button>
  <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
</div>
```

7. Replace form labels and placeholders:
```typescript
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Item Name */}
  <div>
    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
      {t('form.nameLabel')}
    </label>
    <input
      id="name"
      name="name"
      type="text"
      value={formData.name}
      onChange={handleChange}
      placeholder={t('form.namePlaceholder')}
      className="..."
    />
  </div>

  {/* Description */}
  <div>
    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
      {t('form.descriptionLabel')}
    </label>
    <textarea
      id="description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder={t('form.descriptionPlaceholder')}
      className="..."
    />
  </div>

  {/* Additional Tags */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {t('form.tagsLabel')}
    </label>
    <p className="text-xs text-gray-500 mb-2">
      {t('form.tagsHelper')}
    </p>
    <TagsInlineEdit
      tags={formData.tags}
      onTagsChange={handleTagsChange}
      placeholder={t('form.tagsPlaceholder')}
      ...
    />
  </div>
</form>
```

8. Replace button labels:
```typescript
<div className="flex gap-3 pt-6 border-t">
  <button type="button" onClick={handleCancel} className="...">
    {t('buttons.cancel')}
  </button>
  <button type="submit" disabled={saving} className="...">
    {saving ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        {t('buttons.saving')}
      </>
    ) : (
      <>
        <Save className="w-4 h-4" />
        {t('buttons.save')}
      </>
    )}
  </button>
</div>
```

**Acceptance Criteria:**
- [ ] `useTranslations` imported from `next-intl`
- [ ] Hook initialized with `items.edit` namespace
- [ ] Page title uses translation
- [ ] Back button text uses translation
- [ ] Loading message uses translation
- [ ] Login required message uses translation
- [ ] Error return link uses translation
- [ ] All form labels use translations
- [ ] All placeholders use translations
- [ ] Helper text uses translation
- [ ] Cancel button uses translation
- [ ] Save button uses translation (both states)
- [ ] TypeScript compiles without errors
- [ ] Component renders correctly

**Verification Commands:**
```bash
npm run typecheck
# Manual: Navigate to edit page, verify all text elements
```

---

### Task T5: Update RoomSelector Component with i18n

**Task ID:** REQ-E02-083-T5
**Priority:** High
**Story Points:** 1
**Dependencies:** T1

**Description:**
Add the `useTranslations` hook to RoomSelector and replace hardcoded strings including room type labels.

**File to Modify:**
- `src/components/ItemEditForm/RoomSelector.tsx`

**Current Code Locations (from overview):**
- Lines 24-25: `"Room"` (label)
- Line 29: `"Select room for this item"` (aria-label)
- Line 35: `"Select a room..."` (placeholder option)
- Lines 37-39: Room type labels from ROOM_LABELS constant

**Target Approach:**

1. Add import at the top:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook and helper function inside component:
```typescript
export function RoomSelector({ value, onChange, disabled = false }: RoomSelectorProps) {
  const t = useTranslations('items.edit');

  // Map room types to translation keys
  const getRoomLabel = (roomType: string): string => {
    const keyMap: Record<string, string> = {
      'kitchen': 'rooms.kitchen',
      'bathroom': 'rooms.bathroom',
      'bedroom': 'rooms.bedroom',
      'living-room': 'rooms.livingRoom',
      'laundry': 'rooms.laundry',
      'garage': 'rooms.garage',
      'outdoor': 'rooms.outdoor',
      'office': 'rooms.office',
      'gym': 'rooms.gym',
      'pool': 'rooms.pool',
      'other': 'rooms.other',
    };
    return t(keyMap[roomType] || 'rooms.other');
  };
```

3. Replace label and select:
```typescript
  return (
    <div>
      <label htmlFor="room-selector" className="block text-sm font-medium text-gray-700 mb-2">
        {t('form.roomLabel')}
      </label>
      <select
        id="room-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={t('form.roomAriaLabel')}
        className="..."
      >
        <option value="">{t('form.roomPlaceholder')}</option>
        {ROOM_TYPES.map((roomType) => (
          <option key={roomType} value={roomType}>
            {getRoomLabel(roomType)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] `useTranslations` imported from `next-intl`
- [ ] Hook initialized with `items.edit` namespace
- [ ] "Room" label uses translation
- [ ] aria-label uses translation
- [ ] "Select a room..." placeholder uses translation
- [ ] All room type labels use translations via helper function
- [ ] Helper function maps all ROOM_TYPES to translation keys
- [ ] TypeScript compiles without errors
- [ ] Dropdown displays correctly with translated options

**Verification Commands:**
```bash
npm run typecheck
# Manual: Open room selector, verify all options are translated
```

---

### Task T6: Update ItemTypeSelector Component with i18n

**Task ID:** REQ-E02-083-T6
**Priority:** High
**Story Points:** 1
**Dependencies:** T1

**Description:**
Add the `useTranslations` hook to ItemTypeSelector and replace hardcoded strings including item type labels.

**File to Modify:**
- `src/components/ItemEditForm/ItemTypeSelector.tsx`

**Current Code Locations (from overview):**
- Lines 24-25: `"Item Type"` (label)
- Line 29: `"Select item type"` (aria-label)
- Line 35: `"Select item type..."` (placeholder option)
- Lines 37-39: Item type labels from ITEM_TYPE_LABELS constant

**Target Approach:**

1. Add import at the top:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook and helper function inside component:
```typescript
export function ItemTypeSelector({ value, onChange, disabled = false }: ItemTypeSelectorProps) {
  const t = useTranslations('items.edit');

  const getItemTypeLabel = (itemType: string): string => {
    const keyMap: Record<string, string> = {
      'appliance': 'itemTypes.appliance',
      'room-item': 'itemTypes.roomItem',
      'general-info': 'itemTypes.generalInfo',
    };
    return t(keyMap[itemType] || 'itemTypes.appliance');
  };
```

3. Replace label and select:
```typescript
  return (
    <div>
      <label htmlFor="item-type-selector" className="block text-sm font-medium text-gray-700 mb-2">
        {t('form.itemTypeLabel')}
      </label>
      <select
        id="item-type-selector"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={t('form.itemTypeAriaLabel')}
        className="..."
      >
        <option value="">{t('form.itemTypePlaceholder')}</option>
        {ITEM_TYPES.map((itemType) => (
          <option key={itemType} value={itemType}>
            {getItemTypeLabel(itemType)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] `useTranslations` imported from `next-intl`
- [ ] Hook initialized with `items.edit` namespace
- [ ] "Item Type" label uses translation
- [ ] aria-label uses translation
- [ ] "Select item type..." placeholder uses translation
- [ ] All item type labels use translations via helper function
- [ ] Helper function maps all ITEM_TYPES to translation keys
- [ ] TypeScript compiles without errors
- [ ] Dropdown displays correctly with translated options

**Verification Commands:**
```bash
npm run typecheck
# Manual: Open item type selector, verify all options are translated
```

---

### Task T7: Update ItemInstructionsList Component with i18n

**Task ID:** REQ-E02-083-T7
**Priority:** High
**Story Points:** 1
**Dependencies:** T1

**Description:**
Add the `useTranslations` hook to ItemInstructionsList and replace hardcoded strings including purpose labels.

**File to Modify:**
- `src/components/ItemEditForm/ItemInstructionsList.tsx`

**Current Code Locations (from overview):**
- Lines 62, 83, 97: `"Guides"` (section title)
- Lines 63, 84, 98: `"Content associated with this item"` (description)
- Lines 87-88: `"No guides yet"`, `"Guides for this item will appear here"` (empty state)
- Line 123: `"Edit"` (button)
- Lines 42-50: `formatPurposeLabel` function - needs translation

**Target Approach:**

1. Add import at the top:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook and purpose translation helper inside component:
```typescript
export function ItemInstructionsList({ articles, onEditArticle }: ItemInstructionsListProps) {
  const t = useTranslations('items.edit');

  const getPurposeLabel = (purpose: string): string => {
    const keyMap: Record<string, string> = {
      'how_to_use': 'purposes.howToUse',
      'how-to-use': 'purposes.howToUse',
      'troubleshooting': 'purposes.troubleshooting',
      'how_to_clean': 'purposes.howToClean',
      'how-to-clean': 'purposes.howToClean',
      'safety_info': 'purposes.safetyInfo',
      'safety-info': 'purposes.safetyInfo',
      'maintenance': 'purposes.maintenance',
      'features': 'purposes.features',
    };
    return t(keyMap[purpose] || 'purposes.other');
  };
```

3. Replace section content:
```typescript
  // Empty state
  if (!articles || articles.length === 0) {
    return (
      <div className="...">
        <h3 className="text-lg font-medium text-gray-900">{t('guides.title')}</h3>
        <p className="text-sm text-gray-500 mb-4">{t('guides.description')}</p>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('guides.empty')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('guides.emptyDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="...">
      <h3 className="text-lg font-medium text-gray-900">{t('guides.title')}</h3>
      <p className="text-sm text-gray-500 mb-4">{t('guides.description')}</p>
      <ul className="space-y-3">
        {articles.map((article) => (
          <li key={article.id} className="...">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{article.title}</span>
                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                  {getPurposeLabel(article.purpose)}
                </span>
              </div>
              <button onClick={() => onEditArticle(article.id)} className="...">
                <span>{t('guides.edit')}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] `useTranslations` imported from `next-intl`
- [ ] Hook initialized with `items.edit` namespace
- [ ] "Guides" section title uses translation
- [ ] Section description uses translation
- [ ] Empty state title uses translation
- [ ] Empty state description uses translation
- [ ] "Edit" button uses translation
- [ ] All purpose labels use translations via helper function
- [ ] Helper function handles both underscore and hyphen formats
- [ ] TypeScript compiles without errors
- [ ] Component renders correctly with empty and populated states

**Verification Commands:**
```bash
npm run typecheck
# Manual: View guides section with and without articles, verify translations
```

---

### Task T8: Update TagsInlineEdit Component with i18n

**Task ID:** REQ-E02-083-T8
**Priority:** High
**Story Points:** 1.5
**Dependencies:** T1

**Description:**
Add the `useTranslations` hook to TagsInlineEdit and replace all hardcoded strings including validation messages, aria-labels, and display text.

**File to Modify:**
- `src/components/ItemManager/components/shared/TagsInlineEdit.tsx`

**Current Code Locations (from overview):**
- Line 85: `"Add tags..."` (default placeholder)
- Lines 197, 201, 210, 215: Validation messages
- Lines 541-543: `"+${displayTags.length - 3} more"` (overflow count)
- Lines 582-583: `"Saving..."` (saving text)
- Lines 532, 585-586, 602, 629, 648, 685-688: Various aria-labels
- Line 625: `"Max tags reached"`, `"Type to add..."` (input placeholders)

**Target Approach:**

1. Add import at the top:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook initialization inside component:
```typescript
export function TagsInlineEdit({
  tags,
  onTagsChange,
  placeholder,
  ariaLabel,
  maxTags = 10,
  maxTagLength = 30,
  ...
}: TagsInlineEditProps) {
  const t = useTranslations('items.edit.tags');
```

3. Update validation function to use translations:
```typescript
  const validateTag = useCallback((tag: string): string | null => {
    const trimmed = tag.trim();
    if (!trimmed) return t('validation.empty');
    if (trimmed.length > maxTagLength) return t('validation.tooLong', { max: maxTagLength });
    if (editTags.some(existingTag => existingTag.toLowerCase() === trimmed.toLowerCase())) {
      return t('validation.duplicate');
    }
    if (editTags.length >= maxTags) return t('validation.maxTags', { max: maxTags });
    return null;
  }, [editTags, maxTagLength, maxTags, t]);
```

4. Update display mode rendering:
```typescript
  // Display mode
  if (status === 'display') {
    const displayTags = tags.slice(0, 3);
    const remainingCount = tags.length - 3;

    return (
      <button
        type="button"
        onClick={handleEditStart}
        aria-label={ariaLabel || t('editTags')}
        className="..."
      >
        {displayTags.length > 0 ? (
          <>
            {displayTags.map((tag) => (
              <span key={tag} className="...">{tag}</span>
            ))}
            {remainingCount > 0 && (
              <span className="text-gray-500 text-sm">
                {t('moreCount', { count: remainingCount })}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-400">{placeholder || t('addTags')}</span>
        )}
      </button>
    );
  }
```

5. Update saving mode rendering:
```typescript
  // Saving mode
  if (status === 'saving') {
    return (
      <div className="..." aria-live="polite">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>{t('saving')}</span>
        <span className="sr-only">{t('savingTags')}</span>
      </div>
    );
  }
```

6. Update editing mode rendering:
```typescript
  // Editing mode
  return (
    <div
      ref={containerRef}
      className="..."
      aria-label={ariaLabel || t('editTags')}
      role="group"
    >
      {/* Tag pills with remove buttons */}
      {editTags.map((tag, index) => (
        <span key={tag} className="...">
          {tag}
          <button
            type="button"
            onClick={() => handleRemoveTag(index)}
            aria-label={t('removeTag', { tag })}
            className="..."
          >
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        </span>
      ))}

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={editTags.length >= maxTags ? t('maxReached') : t('typeToAdd')}
        aria-label={t('addNewTag')}
        className="..."
      />

      {/* Suggestions list */}
      {suggestions.length > 0 && (
        <ul className="..." aria-label={t('suggestions')}>
          {suggestions.map((suggestion) => (
            <li key={suggestion}>...</li>
          ))}
        </ul>
      )}

      {/* Screen reader announcement */}
      <span className="sr-only" aria-live="polite">
        {t('tagsSelected', { count: editTags.length })}
      </span>
    </div>
  );
```

**Acceptance Criteria:**
- [ ] `useTranslations` imported from `next-intl`
- [ ] Hook initialized with `items.edit.tags` namespace
- [ ] Default placeholder uses translation (if not overridden by prop)
- [ ] All validation error messages use translations with interpolation
- [ ] "+X more" text uses translation with count interpolation
- [ ] "Saving..." text uses translation
- [ ] All aria-labels use translations (editTags, removeTag, addNewTag, suggestions)
- [ ] Input placeholders use translations (maxReached, typeToAdd)
- [ ] Screen reader announcement uses translation with count interpolation
- [ ] TypeScript compiles without errors
- [ ] Component renders correctly in all states (display, editing, saving)

**Verification Commands:**
```bash
npm run typecheck
# Manual: Test tags component in all states, verify validation messages
```

---

### Task T9: Update Items List Page with i18n

**Task ID:** REQ-E02-083-T9
**Priority:** Medium
**Story Points:** 1
**Dependencies:** T2

**Description:**
Add the `useTranslations` hook to the Items List Page and replace hardcoded strings.

**File to Modify:**
- `src/app/dashboard2/items/page.tsx`

**Current Code Locations (from overview):**
- Line ~204: `"My Items"` (page title)
- Lines ~214-215: Item count with plural forms
- Lines ~226-228: `"New QR Code Item"` (create button)
- Lines ~233-237: `"Please log in to view items."` (login required)
- Lines ~243-245: `"Loading items..."` (loading state)
- Dismiss button for errors

**Target Approach:**

1. Add import at the top:
```typescript
import { useTranslations } from 'next-intl';
```

2. Add hook initialization inside component:
```typescript
export default function ItemsPage() {
  const t = useTranslations('items.list');
```

3. Replace login required state:
```typescript
if (!user) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-600">{t('loginRequired')}</p>
    </div>
  );
}
```

4. Replace loading state:
```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      <p className="ml-2 text-gray-600">{t('loading')}</p>
    </div>
  );
}
```

5. Replace page header:
```typescript
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
    <p className="text-gray-600 mt-1">
      {t('count', { count: items.length })}
    </p>
  </div>
  <button onClick={handleCreateNew} className="...">
    <PlusCircle className="w-4 h-4 mr-2" />
    {t('createNew')}
  </button>
</div>
```

6. Replace error dismiss button (if exists):
```typescript
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <div className="flex items-center justify-between">
      <p className="text-red-600">{error}</p>
      <button onClick={() => setError(null)} className="...">
        {t('dismiss')}
      </button>
    </div>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] `useTranslations` imported from `next-intl`
- [ ] Hook initialized with `items.list` namespace
- [ ] Page title uses translation
- [ ] Item count uses pluralized translation
- [ ] "New QR Code Item" button uses translation
- [ ] Login required message uses translation
- [ ] Loading message uses translation
- [ ] Dismiss button uses translation
- [ ] TypeScript compiles without errors
- [ ] Page renders correctly with 0, 1, and multiple items

**Verification Commands:**
```bash
npm run typecheck
# Manual: View items page with different item counts, verify pluralization
```

---

### Task T10: Verification and Testing

**Task ID:** REQ-E02-083-T10
**Priority:** High
**Story Points:** 1
**Dependencies:** All previous tasks

**Description:**
Comprehensive verification that all translations work correctly across all 6 supported languages and all edit functionality is preserved.

**Test Scenarios:**

1. **Edit Item Page tests in each of the 6 languages:**
   - Navigate to edit page → verify page title is translated
   - Verify "Back to Items" button is translated
   - Verify loading message is translated (trigger by slow network)
   - Verify login required message is translated (log out and navigate)
   - Verify all form labels are translated (Item Name, Description, Additional Tags)
   - Verify all placeholders are translated
   - Verify helper text "Add custom tags..." is translated
   - Verify Save and Cancel buttons are translated
   - Trigger save → verify "Saving..." state is translated
   - Test error state → verify "Return to Items" is translated

2. **RoomSelector tests in each language:**
   - Click to open dropdown
   - Verify "Room" label is translated
   - Verify "Select a room..." placeholder is translated
   - Verify all room type options are translated (Kitchen, Bathroom, etc.)
   - Verify aria-label is translated (check in browser dev tools)

3. **ItemTypeSelector tests in each language:**
   - Click to open dropdown
   - Verify "Item Type" label is translated
   - Verify "Select item type..." placeholder is translated
   - Verify all item type options are translated (Appliance, Room Item, General Info)
   - Verify aria-label is translated

4. **ItemInstructionsList tests in each language:**
   - View item with no guides → verify empty state is translated
   - View item with guides → verify "Guides" section title is translated
   - Verify description text is translated
   - Verify purpose badges are translated (How To Use, Troubleshooting, etc.)
   - Verify "Edit" button is translated

5. **TagsInlineEdit tests in each language:**
   - Click tags field to enter edit mode
   - Verify placeholder text is translated ("Add tags..." or "Type to add...")
   - Add an empty tag → verify validation message is translated
   - Add a tag that's too long → verify "Tag must be X characters or less" is translated
   - Add a duplicate tag → verify "Tag already exists" is translated
   - Reach max tags → verify "Max tags reached" placeholder is translated
   - Trigger save → verify "Saving..." state is translated
   - Verify "+X more" overflow text is translated
   - Verify all aria-labels are translated (check with screen reader)

6. **Items List Page tests in each language:**
   - Navigate to items list
   - Verify page title "My Items" is translated
   - Verify item count uses correct plural form (1 item vs X items)
   - Verify "New QR Code Item" button is translated
   - Test logged out state → verify "Please log in to view items." is translated
   - Trigger loading → verify "Loading items..." is translated

7. **General tests:**
   - Switch language while on edit page → verify all text updates without page reload
   - Verify no console warnings about missing translation keys
   - Verify TypeScript compiles without errors (`npm run typecheck`)
   - Verify build succeeds (`npm run build`)
   - Verify existing edit functionality still works (save item, change values)
   - Test with screen reader in each language
   - Verify form validation still works correctly
   - Verify all existing keyboard navigation works

**Acceptance Criteria:**
- [ ] All 6 languages display correctly on all pages and components
- [ ] No missing translation warnings in console
- [ ] Pluralization works correctly for item counts
- [ ] Language switching updates UI without page reload
- [ ] TypeScript compiles without errors
- [ ] Build succeeds
- [ ] Existing edit functionality preserved
- [ ] Screen reader announces correctly in all languages
- [ ] All validation messages display in selected language

**Verification Commands:**
```bash
# TypeScript check
npm run typecheck

# Build check
npm run build

# Manual testing checklist:
# 1. Open app in browser
# 2. Navigate to /dashboard2/items
# 3. Click on an item to edit
# 4. Verify all labels, buttons, and messages
# 5. Test RoomSelector and ItemTypeSelector dropdowns
# 6. Test TagsInlineEdit component
# 7. Test ItemInstructionsList section
# 8. Switch language via language selector
# 9. Verify all text updates
# 10. Check browser console for warnings
# 11. Test with screen reader (VoiceOver/NVDA)
```

---

## Implementation Order

**Recommended execution sequence:**

```
T1 (EN edit)  ─┬─────────────────────────> T4 (Update Edit Page)
               │                           T5 (Update RoomSelector)
               │                           T6 (Update ItemTypeSelector)
               │                           T7 (Update ItemInstructionsList)
               │                           T8 (Update TagsInlineEdit)
               │
T2 (EN list)  ─┼─────────────────────────> T9 (Update Items List Page)
               │
               └──> T3 (Non-EN translations)
                                                         │
                                                         v
                                                   T10 (Verification)
```

**Parallel execution opportunities:**
- T1, T2 can be done in parallel (adding EN translations)
- T4, T5, T6, T7, T8 can be done in parallel after T1 completes
- T9 can be done after T2 completes
- T3 can start after T1 and T2 are complete
- T10 requires all other tasks to be complete

---

## Files Modified Summary

| File | Tasks | Changes |
|------|-------|---------|
| `/messages/en.json` | T1, T2 | Add `items.edit.*` and `items.list.*` keys |
| `/messages/fr.json` | T3 | Add French translations for all edit/list keys |
| `/messages/es.json` | T3 | Add Spanish translations for all edit/list keys |
| `/messages/de.json` | T3 | Add German translations for all edit/list keys |
| `/messages/nl.json` | T3 | Add Dutch translations for all edit/list keys |
| `/messages/it.json` | T3 | Add Italian translations for all edit/list keys |
| `src/app/dashboard2/items/[publicId]/edit/page.tsx` | T4 | Add useTranslations, translate all strings |
| `src/app/dashboard2/items/page.tsx` | T9 | Add useTranslations, translate all strings |
| `src/components/ItemEditForm/RoomSelector.tsx` | T5 | Add useTranslations, translate labels and options |
| `src/components/ItemEditForm/ItemTypeSelector.tsx` | T6 | Add useTranslations, translate labels and options |
| `src/components/ItemEditForm/ItemInstructionsList.tsx` | T7 | Add useTranslations, translate section and purpose labels |
| `src/components/ItemManager/components/shared/TagsInlineEdit.tsx` | T8 | Add useTranslations, translate validation and UI strings |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Room/item type constants not aligned with translation keys | Create mapping objects in components to handle all variations |
| TagsInlineEdit used in multiple places with different placeholder props | Keep placeholder prop support, use translation as fallback |
| Long translated labels overflow form fields | Design with 40% text expansion buffer, test all languages visually |
| Missing translation keys at runtime | Build-time JSON validation, console warning checks in T10 |
| Validation messages breaking due to interpolation errors | Test all validation scenarios with max/min values |
| Purpose labels have both underscore and hyphen formats | Handle both formats in mapping object |

---

## Definition of Done

- [ ] All 10 tasks completed
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] All 6 languages tested manually on edit page and components
- [ ] No console warnings for missing translations
- [ ] Screen reader testing passed
- [ ] Code review completed
- [ ] Documentation updated (component docstrings with @lastModified)
- [ ] Existing edit functionality verified working
- [ ] All form validation still works correctly

---

## References

- Overview Document: `/docs/REQ-E02-083-update-item-detailedit-pages-overview.md`
- Requirements: `/docs/gen_requests_epic2.md` (Request #83)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- Similar Implementation: `/docs/REQ-E02-082-update-bulk-action-dialogs-detailed.md`
- next-intl Documentation: https://next-intl-docs.vercel.app/
- ICU Message Format: https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management - Task 2D.6*
