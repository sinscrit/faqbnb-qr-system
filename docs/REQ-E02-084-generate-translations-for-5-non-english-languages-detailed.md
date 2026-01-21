# REQ-E02-084: Generate Translations for Item Management Namespace (5 Non-English Languages)

**Document Type:** Detailed Task Breakdown
**Request ID:** REQ-E02-084
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2D - Item Management
**Task Reference:** 2D.7
**Priority:** High
**Size:** L (Large)

**Created:** 2026-01-20
**Last Modified:** 2026-01-20

---

## Executive Summary

This document provides a granular, step-by-step implementation guide for generating complete translations of the Item Management namespace (`items`) for the 5 non-English languages: French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). Each task is designed to be a single story point or less, enabling autonomous execution by an AI coding agent or junior developer.

**Note:** The original request mentions Portuguese, but the project's supported languages are: English, French, Spanish, German, Dutch, and Italian (per the existing `/messages/*.json` files).

---

## Prerequisites Verification

Before starting implementation, verify the following:

| Prerequisite | Verification Command | Expected Result |
|--------------|---------------------|-----------------|
| Translation files exist | `ls messages/*.json` | 6 files: en, fr, es, de, nl, it |
| English items namespace | Check `messages/en.json` | `items` key exists |
| next-intl configured | Check `src/lib/i18n/config.ts` | Locale configuration present |
| Build passes | `npm run typecheck` | No TypeScript errors |

---

## Current State Analysis

### Existing Items Namespace in English (`/messages/en.json`)

```json
{
  "items": {
    "createNew": "New QR Code Item",
    "noItems": "No items yet",
    "name": "Item Name",
    "description": "Description",
    "property": "Property",
    "qrCode": "QR Code",
    "articles": "Articles",
    "addArticle": "Add Article",
    "editItem": "Edit Item",
    "deleteItem": "Delete Item",
    "viewItem": "View Item",
    "printQrCode": "Print QR Code",
    "downloadQrCode": "Download QR Code",
    "scanCount": "Scan Count",
    "lastScanned": "Last Scanned",
    "createdAt": "Created At",
    "updatedAt": "Updated At",
    "selectProperty": "Select Property",
    "itemDetails": "Item Details",
    "noArticles": "No articles yet",
    "addFirstArticle": "Add your first article",
    "room": "Room",
    "tags": "Tags",
    "addTag": "Add Tag",
    "removeTag": "Remove Tag"
  }
}
```

**Gap Analysis:** The current `items` namespace is minimal (~26 keys). Per the Overview document and Implementation Plan, this needs to be expanded to ~150+ keys to cover:
- List/Grid states
- Card components
- Actions menu
- Filter/Sort options
- Bulk actions
- Detail views
- Status indicators
- Delete confirmations
- Success/Error messages
- Validation messages

---

## Task Breakdown

### Phase 1: Audit and Expand English Source (Task 1)

#### Task 1.1: Expand English `items` Namespace Structure

**File:** `/messages/en.json`
**Action:** UPDATE (expand `items` object)
**Estimated Size:** 1 SP

**Instructions:**
1. Open `/messages/en.json`
2. Replace the existing `items` object with the expanded structure below
3. Ensure JSON is valid (no trailing commas, proper quotes)
4. Save the file

**New `items` namespace content to add:**

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Manage your QR code items",
    "createNew": "New QR Code Item",

    "list": {
      "empty": {
        "title": "No items yet",
        "description": "Create your first QR code item to get started",
        "action": "Create Item"
      },
      "noResults": "No items match your filters"
    },

    "grid": {
      "ariaLabel": "{count, plural, =0 {No items} one {# item} other {# items}}",
      "loading": "Loading items"
    },

    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TEXT",
        "pdf": "PDF",
        "mixed": "MIXED",
        "video": "VIDEO",
        "photo": "PHOTO",
        "media": "MEDIA"
      },
      "placeholder": {
        "title": "Enter title...",
        "location": "Add location...",
        "tags": "Add tags..."
      },
      "aria": {
        "location": "Location: {location}.",
        "selected": "Selected",
        "notSelected": "Not selected",
        "pressEnterToSelect": "Press Enter to select",
        "pressEnterToDeselect": "Press Enter to deselect",
        "pressEnterToPreview": "Press Enter to preview",
        "selectItem": "Select {title}",
        "thumbnail": "{title} thumbnail",
        "editTitle": "Edit title for {title}",
        "editLocation": "Edit location for {title}",
        "editTags": "Edit tags for {title}"
      },
      "tags": {
        "more": "+{count} more"
      },
      "views": "{count, plural, one {# view} other {# views}}",
      "pieces": "{count, plural, one {# piece} other {# pieces}} of content",
      "noContent": "No content yet"
    },

    "actions": {
      "create": "New Item",
      "edit": "Edit",
      "delete": "Delete",
      "duplicate": "Duplicate",
      "viewQR": "View QR Code",
      "print": "Print",
      "share": "Share",
      "export": "Export"
    },

    "filters": {
      "title": "Filters",
      "property": "Property",
      "room": "Room",
      "tag": "Tag",
      "contentType": "Content Type",
      "status": "Status",
      "dateRange": "Date Range",
      "clearAll": "Clear All",
      "apply": "Apply Filters"
    },

    "sort": {
      "title": "Sort By",
      "newest": "Newest First",
      "oldest": "Oldest First",
      "nameAZ": "Name (A-Z)",
      "nameZA": "Name (Z-A)",
      "mostViewed": "Most Viewed",
      "recentlyUpdated": "Recently Updated"
    },

    "bulk": {
      "selected": "{count} selected",
      "selectAll": "Select All",
      "deselectAll": "Deselect All",
      "delete": "Delete Selected",
      "move": "Move to Property",
      "addTags": "Add Tags",
      "removeTags": "Remove Tags",
      "print": "Print Selected",
      "export": "Export Selected"
    },

    "detail": {
      "title": "Item Details",
      "qrCode": "QR Code",
      "analytics": "Analytics",
      "content": "Content",
      "settings": "Settings",
      "history": "History"
    },

    "status": {
      "active": "Active",
      "archived": "Archived",
      "draft": "Draft",
      "pending": "Pending"
    },

    "delete": {
      "title": "Delete Item",
      "message": "Are you sure you want to delete \"{name}\"? This action cannot be undone.",
      "confirm": "Delete Item",
      "success": "Item deleted successfully",
      "bulkTitle": "Delete {count} Items",
      "bulkMessage": "Are you sure you want to delete {count} items? This action cannot be undone."
    },

    "move": {
      "title": "Move Items",
      "selectProperty": "Select destination property",
      "success": "Items moved successfully"
    },

    "messages": {
      "created": "Item created successfully",
      "updated": "Item updated successfully",
      "duplicated": "Item duplicated successfully",
      "exported": "Items exported successfully"
    },

    "validation": {
      "nameRequired": "Item name is required",
      "nameTooLong": "Item name must be less than {max} characters",
      "descriptionTooLong": "Description must be less than {max} characters"
    },

    "name": "Item Name",
    "description": "Description",
    "property": "Property",
    "qrCode": "QR Code",
    "articles": "Articles",
    "addArticle": "Add Article",
    "editItem": "Edit Item",
    "deleteItem": "Delete Item",
    "viewItem": "View Item",
    "printQrCode": "Print QR Code",
    "downloadQrCode": "Download QR Code",
    "scanCount": "Scan Count",
    "lastScanned": "Last Scanned",
    "createdAt": "Created At",
    "updatedAt": "Updated At",
    "selectProperty": "Select Property",
    "itemDetails": "Item Details",
    "noArticles": "No articles yet",
    "noItems": "No items yet",
    "addFirstArticle": "Add your first article",
    "room": "Room",
    "tags": "Tags",
    "addTag": "Add Tag",
    "removeTag": "Remove Tag"
  }
}
```

**Verification:**
- [ ] JSON is valid (no syntax errors)
- [ ] File saves without error
- [ ] `npm run typecheck` passes

---

### Phase 2: Generate French (fr) Translations (Tasks 2.1-2.4)

**File:** `/messages/fr.json`

#### Task 2.1: Update French - Core Items Strings

**Action:** UPDATE `items` object with core translations
**Estimated Size:** 1 SP

Replace the existing `items` object in `/messages/fr.json` with:

```json
{
  "items": {
    "title": "Articles",
    "subtitle": "Gérez vos articles avec code QR",
    "createNew": "Nouvel article QR",

    "list": {
      "empty": {
        "title": "Aucun article",
        "description": "Créez votre premier article avec code QR pour commencer",
        "action": "Créer un article"
      },
      "noResults": "Aucun article ne correspond à vos filtres"
    },

    "grid": {
      "ariaLabel": "{count, plural, =0 {Aucun article} one {# article} other {# articles}}",
      "loading": "Chargement des articles"
    },

    "name": "Nom de l'article",
    "description": "Description",
    "property": "Propriété",
    "qrCode": "Code QR",
    "articles": "Articles",
    "addArticle": "Ajouter un article",
    "editItem": "Modifier l'article",
    "deleteItem": "Supprimer l'article",
    "viewItem": "Voir l'article",
    "printQrCode": "Imprimer le code QR",
    "downloadQrCode": "Télécharger le code QR",
    "scanCount": "Nombre de scans",
    "lastScanned": "Dernier scan",
    "createdAt": "Créé le",
    "updatedAt": "Mis à jour le",
    "selectProperty": "Sélectionner une propriété",
    "itemDetails": "Détails de l'article",
    "noArticles": "Aucun article",
    "noItems": "Aucun article",
    "addFirstArticle": "Ajoutez votre premier article",
    "room": "Pièce",
    "tags": "Étiquettes",
    "addTag": "Ajouter une étiquette",
    "removeTag": "Supprimer l'étiquette"
  }
}
```

**Note:** This is a partial update. Continue with Task 2.2.

#### Task 2.2: Update French - Card and Content Type Strings

**Action:** ADD nested objects to `items` in `/messages/fr.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "card": {
      "contentType": {
        "link": "LIEN",
        "text": "TEXTE",
        "pdf": "PDF",
        "mixed": "MIXTE",
        "video": "VIDÉO",
        "photo": "PHOTO",
        "media": "MÉDIA"
      },
      "placeholder": {
        "title": "Entrez le titre...",
        "location": "Ajouter un emplacement...",
        "tags": "Ajouter des étiquettes..."
      },
      "aria": {
        "location": "Emplacement : {location}.",
        "selected": "Sélectionné",
        "notSelected": "Non sélectionné",
        "pressEnterToSelect": "Appuyez sur Entrée pour sélectionner",
        "pressEnterToDeselect": "Appuyez sur Entrée pour désélectionner",
        "pressEnterToPreview": "Appuyez sur Entrée pour prévisualiser",
        "selectItem": "Sélectionner {title}",
        "thumbnail": "Miniature de {title}",
        "editTitle": "Modifier le titre de {title}",
        "editLocation": "Modifier l'emplacement de {title}",
        "editTags": "Modifier les étiquettes de {title}"
      },
      "tags": {
        "more": "+{count} autres"
      },
      "views": "{count, plural, one {# vue} other {# vues}}",
      "pieces": "{count, plural, one {# élément} other {# éléments}} de contenu",
      "noContent": "Pas encore de contenu"
    }
```

#### Task 2.3: Update French - Actions, Filters, Sort, and Bulk Strings

**Action:** ADD nested objects to `items` in `/messages/fr.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "actions": {
      "create": "Nouvel article",
      "edit": "Modifier",
      "delete": "Supprimer",
      "duplicate": "Dupliquer",
      "viewQR": "Voir le code QR",
      "print": "Imprimer",
      "share": "Partager",
      "export": "Exporter"
    },

    "filters": {
      "title": "Filtres",
      "property": "Propriété",
      "room": "Pièce",
      "tag": "Étiquette",
      "contentType": "Type de contenu",
      "status": "Statut",
      "dateRange": "Plage de dates",
      "clearAll": "Tout effacer",
      "apply": "Appliquer les filtres"
    },

    "sort": {
      "title": "Trier par",
      "newest": "Plus récent",
      "oldest": "Plus ancien",
      "nameAZ": "Nom (A-Z)",
      "nameZA": "Nom (Z-A)",
      "mostViewed": "Plus consulté",
      "recentlyUpdated": "Récemment mis à jour"
    },

    "bulk": {
      "selected": "{count} sélectionné(s)",
      "selectAll": "Tout sélectionner",
      "deselectAll": "Tout désélectionner",
      "delete": "Supprimer la sélection",
      "move": "Déplacer vers une propriété",
      "addTags": "Ajouter des étiquettes",
      "removeTags": "Supprimer des étiquettes",
      "print": "Imprimer la sélection",
      "export": "Exporter la sélection"
    }
```

#### Task 2.4: Update French - Detail, Status, Delete, Move, Messages, and Validation Strings

**Action:** ADD remaining nested objects to `items` in `/messages/fr.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "detail": {
      "title": "Détails de l'article",
      "qrCode": "Code QR",
      "analytics": "Analytique",
      "content": "Contenu",
      "settings": "Paramètres",
      "history": "Historique"
    },

    "status": {
      "active": "Actif",
      "archived": "Archivé",
      "draft": "Brouillon",
      "pending": "En attente"
    },

    "delete": {
      "title": "Supprimer l'article",
      "message": "Êtes-vous sûr de vouloir supprimer « {name} » ? Cette action est irréversible.",
      "confirm": "Supprimer l'article",
      "success": "Article supprimé avec succès",
      "bulkTitle": "Supprimer {count} articles",
      "bulkMessage": "Êtes-vous sûr de vouloir supprimer {count} articles ? Cette action est irréversible."
    },

    "move": {
      "title": "Déplacer les articles",
      "selectProperty": "Sélectionner la propriété de destination",
      "success": "Articles déplacés avec succès"
    },

    "messages": {
      "created": "Article créé avec succès",
      "updated": "Article mis à jour avec succès",
      "duplicated": "Article dupliqué avec succès",
      "exported": "Articles exportés avec succès"
    },

    "validation": {
      "nameRequired": "Le nom de l'article est requis",
      "nameTooLong": "Le nom de l'article doit contenir moins de {max} caractères",
      "descriptionTooLong": "La description doit contenir moins de {max} caractères"
    }
```

**Verification for Phase 2:**
- [ ] JSON is valid
- [ ] All keys from English exist in French
- [ ] Gender agreement correct (le/la, un/une)
- [ ] Accented characters properly encoded (é, è, ê, à, ù, ç)

---

### Phase 3: Generate Spanish (es) Translations (Tasks 3.1-3.4)

**File:** `/messages/es.json`

#### Task 3.1: Update Spanish - Core Items Strings

**Action:** UPDATE `items` object with core translations
**Estimated Size:** 1 SP

Replace the existing `items` object in `/messages/es.json` with:

```json
{
  "items": {
    "title": "Artículos",
    "subtitle": "Gestiona tus artículos con código QR",
    "createNew": "Nuevo artículo QR",

    "list": {
      "empty": {
        "title": "No hay artículos",
        "description": "Crea tu primer artículo con código QR para empezar",
        "action": "Crear artículo"
      },
      "noResults": "Ningún artículo coincide con tus filtros"
    },

    "grid": {
      "ariaLabel": "{count, plural, =0 {Sin artículos} one {# artículo} other {# artículos}}",
      "loading": "Cargando artículos"
    },

    "name": "Nombre del artículo",
    "description": "Descripción",
    "property": "Propiedad",
    "qrCode": "Código QR",
    "articles": "Artículos",
    "addArticle": "Añadir artículo",
    "editItem": "Editar artículo",
    "deleteItem": "Eliminar artículo",
    "viewItem": "Ver artículo",
    "printQrCode": "Imprimir código QR",
    "downloadQrCode": "Descargar código QR",
    "scanCount": "Número de escaneos",
    "lastScanned": "Último escaneo",
    "createdAt": "Creado el",
    "updatedAt": "Actualizado el",
    "selectProperty": "Seleccionar propiedad",
    "itemDetails": "Detalles del artículo",
    "noArticles": "No hay artículos",
    "noItems": "No hay artículos",
    "addFirstArticle": "Añade tu primer artículo",
    "room": "Habitación",
    "tags": "Etiquetas",
    "addTag": "Añadir etiqueta",
    "removeTag": "Eliminar etiqueta"
  }
}
```

#### Task 3.2: Update Spanish - Card and Content Type Strings

**Action:** ADD nested objects to `items` in `/messages/es.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "card": {
      "contentType": {
        "link": "ENLACE",
        "text": "TEXTO",
        "pdf": "PDF",
        "mixed": "MIXTO",
        "video": "VÍDEO",
        "photo": "FOTO",
        "media": "MULTIMEDIA"
      },
      "placeholder": {
        "title": "Introduce el título...",
        "location": "Añadir ubicación...",
        "tags": "Añadir etiquetas..."
      },
      "aria": {
        "location": "Ubicación: {location}.",
        "selected": "Seleccionado",
        "notSelected": "No seleccionado",
        "pressEnterToSelect": "Pulsa Enter para seleccionar",
        "pressEnterToDeselect": "Pulsa Enter para deseleccionar",
        "pressEnterToPreview": "Pulsa Enter para previsualizar",
        "selectItem": "Seleccionar {title}",
        "thumbnail": "Miniatura de {title}",
        "editTitle": "Editar título de {title}",
        "editLocation": "Editar ubicación de {title}",
        "editTags": "Editar etiquetas de {title}"
      },
      "tags": {
        "more": "+{count} más"
      },
      "views": "{count, plural, one {# vista} other {# vistas}}",
      "pieces": "{count, plural, one {# elemento} other {# elementos}} de contenido",
      "noContent": "Sin contenido aún"
    }
```

#### Task 3.3: Update Spanish - Actions, Filters, Sort, and Bulk Strings

**Action:** ADD nested objects to `items` in `/messages/es.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "actions": {
      "create": "Nuevo artículo",
      "edit": "Editar",
      "delete": "Eliminar",
      "duplicate": "Duplicar",
      "viewQR": "Ver código QR",
      "print": "Imprimir",
      "share": "Compartir",
      "export": "Exportar"
    },

    "filters": {
      "title": "Filtros",
      "property": "Propiedad",
      "room": "Habitación",
      "tag": "Etiqueta",
      "contentType": "Tipo de contenido",
      "status": "Estado",
      "dateRange": "Rango de fechas",
      "clearAll": "Borrar todo",
      "apply": "Aplicar filtros"
    },

    "sort": {
      "title": "Ordenar por",
      "newest": "Más reciente",
      "oldest": "Más antiguo",
      "nameAZ": "Nombre (A-Z)",
      "nameZA": "Nombre (Z-A)",
      "mostViewed": "Más visto",
      "recentlyUpdated": "Actualizado recientemente"
    },

    "bulk": {
      "selected": "{count} seleccionado(s)",
      "selectAll": "Seleccionar todo",
      "deselectAll": "Deseleccionar todo",
      "delete": "Eliminar selección",
      "move": "Mover a propiedad",
      "addTags": "Añadir etiquetas",
      "removeTags": "Eliminar etiquetas",
      "print": "Imprimir selección",
      "export": "Exportar selección"
    }
```

#### Task 3.4: Update Spanish - Detail, Status, Delete, Move, Messages, and Validation Strings

**Action:** ADD remaining nested objects to `items` in `/messages/es.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "detail": {
      "title": "Detalles del artículo",
      "qrCode": "Código QR",
      "analytics": "Analíticas",
      "content": "Contenido",
      "settings": "Configuración",
      "history": "Historial"
    },

    "status": {
      "active": "Activo",
      "archived": "Archivado",
      "draft": "Borrador",
      "pending": "Pendiente"
    },

    "delete": {
      "title": "Eliminar artículo",
      "message": "¿Estás seguro de que quieres eliminar «{name}»? Esta acción no se puede deshacer.",
      "confirm": "Eliminar artículo",
      "success": "Artículo eliminado correctamente",
      "bulkTitle": "Eliminar {count} artículos",
      "bulkMessage": "¿Estás seguro de que quieres eliminar {count} artículos? Esta acción no se puede deshacer."
    },

    "move": {
      "title": "Mover artículos",
      "selectProperty": "Seleccionar propiedad de destino",
      "success": "Artículos movidos correctamente"
    },

    "messages": {
      "created": "Artículo creado correctamente",
      "updated": "Artículo actualizado correctamente",
      "duplicated": "Artículo duplicado correctamente",
      "exported": "Artículos exportados correctamente"
    },

    "validation": {
      "nameRequired": "El nombre del artículo es obligatorio",
      "nameTooLong": "El nombre del artículo debe tener menos de {max} caracteres",
      "descriptionTooLong": "La descripción debe tener menos de {max} caracteres"
    }
```

**Verification for Phase 3:**
- [ ] JSON is valid
- [ ] All keys from English exist in Spanish
- [ ] Gender agreement correct (el/la, un/una)
- [ ] Accented characters properly encoded (á, é, í, ó, ú, ñ)

---

### Phase 4: Generate German (de) Translations (Tasks 4.1-4.4)

**File:** `/messages/de.json`

#### Task 4.1: Update German - Core Items Strings

**Action:** UPDATE `items` object with core translations
**Estimated Size:** 1 SP

Replace the existing `items` object in `/messages/de.json` with:

```json
{
  "items": {
    "title": "Artikel",
    "subtitle": "Verwalten Sie Ihre QR-Code-Artikel",
    "createNew": "Neuer QR-Code-Artikel",

    "list": {
      "empty": {
        "title": "Noch keine Artikel",
        "description": "Erstellen Sie Ihren ersten QR-Code-Artikel, um zu beginnen",
        "action": "Artikel erstellen"
      },
      "noResults": "Keine Artikel entsprechen Ihren Filtern"
    },

    "grid": {
      "ariaLabel": "{count, plural, =0 {Keine Artikel} one {# Artikel} other {# Artikel}}",
      "loading": "Artikel werden geladen"
    },

    "name": "Artikelname",
    "description": "Beschreibung",
    "property": "Immobilie",
    "qrCode": "QR-Code",
    "articles": "Artikel",
    "addArticle": "Artikel hinzufügen",
    "editItem": "Artikel bearbeiten",
    "deleteItem": "Artikel löschen",
    "viewItem": "Artikel anzeigen",
    "printQrCode": "QR-Code drucken",
    "downloadQrCode": "QR-Code herunterladen",
    "scanCount": "Anzahl der Scans",
    "lastScanned": "Zuletzt gescannt",
    "createdAt": "Erstellt am",
    "updatedAt": "Aktualisiert am",
    "selectProperty": "Immobilie auswählen",
    "itemDetails": "Artikeldetails",
    "noArticles": "Noch keine Artikel",
    "noItems": "Noch keine Artikel",
    "addFirstArticle": "Fügen Sie Ihren ersten Artikel hinzu",
    "room": "Raum",
    "tags": "Tags",
    "addTag": "Tag hinzufügen",
    "removeTag": "Tag entfernen"
  }
}
```

#### Task 4.2: Update German - Card and Content Type Strings

**Action:** ADD nested objects to `items` in `/messages/de.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TEXT",
        "pdf": "PDF",
        "mixed": "GEMISCHT",
        "video": "VIDEO",
        "photo": "FOTO",
        "media": "MEDIEN"
      },
      "placeholder": {
        "title": "Titel eingeben...",
        "location": "Standort hinzufügen...",
        "tags": "Tags hinzufügen..."
      },
      "aria": {
        "location": "Standort: {location}.",
        "selected": "Ausgewählt",
        "notSelected": "Nicht ausgewählt",
        "pressEnterToSelect": "Drücken Sie die Eingabetaste zum Auswählen",
        "pressEnterToDeselect": "Drücken Sie die Eingabetaste zum Abwählen",
        "pressEnterToPreview": "Drücken Sie die Eingabetaste zur Vorschau",
        "selectItem": "{title} auswählen",
        "thumbnail": "Miniaturansicht von {title}",
        "editTitle": "Titel von {title} bearbeiten",
        "editLocation": "Standort von {title} bearbeiten",
        "editTags": "Tags von {title} bearbeiten"
      },
      "tags": {
        "more": "+{count} weitere"
      },
      "views": "{count, plural, one {# Aufruf} other {# Aufrufe}}",
      "pieces": "{count, plural, one {# Inhaltselement} other {# Inhaltselemente}}",
      "noContent": "Noch kein Inhalt"
    }
```

#### Task 4.3: Update German - Actions, Filters, Sort, and Bulk Strings

**Action:** ADD nested objects to `items` in `/messages/de.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "actions": {
      "create": "Neuer Artikel",
      "edit": "Bearbeiten",
      "delete": "Löschen",
      "duplicate": "Duplizieren",
      "viewQR": "QR-Code anzeigen",
      "print": "Drucken",
      "share": "Teilen",
      "export": "Exportieren"
    },

    "filters": {
      "title": "Filter",
      "property": "Immobilie",
      "room": "Raum",
      "tag": "Tag",
      "contentType": "Inhaltstyp",
      "status": "Status",
      "dateRange": "Datumsbereich",
      "clearAll": "Alle löschen",
      "apply": "Filter anwenden"
    },

    "sort": {
      "title": "Sortieren nach",
      "newest": "Neueste zuerst",
      "oldest": "Älteste zuerst",
      "nameAZ": "Name (A-Z)",
      "nameZA": "Name (Z-A)",
      "mostViewed": "Meistgesehen",
      "recentlyUpdated": "Kürzlich aktualisiert"
    },

    "bulk": {
      "selected": "{count} ausgewählt",
      "selectAll": "Alle auswählen",
      "deselectAll": "Alle abwählen",
      "delete": "Auswahl löschen",
      "move": "Zu Immobilie verschieben",
      "addTags": "Tags hinzufügen",
      "removeTags": "Tags entfernen",
      "print": "Auswahl drucken",
      "export": "Auswahl exportieren"
    }
```

#### Task 4.4: Update German - Detail, Status, Delete, Move, Messages, and Validation Strings

**Action:** ADD remaining nested objects to `items` in `/messages/de.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "detail": {
      "title": "Artikeldetails",
      "qrCode": "QR-Code",
      "analytics": "Analytik",
      "content": "Inhalt",
      "settings": "Einstellungen",
      "history": "Verlauf"
    },

    "status": {
      "active": "Aktiv",
      "archived": "Archiviert",
      "draft": "Entwurf",
      "pending": "Ausstehend"
    },

    "delete": {
      "title": "Artikel löschen",
      "message": "Sind Sie sicher, dass Sie „{name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
      "confirm": "Artikel löschen",
      "success": "Artikel erfolgreich gelöscht",
      "bulkTitle": "{count} Artikel löschen",
      "bulkMessage": "Sind Sie sicher, dass Sie {count} Artikel löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
    },

    "move": {
      "title": "Artikel verschieben",
      "selectProperty": "Zielimmobilie auswählen",
      "success": "Artikel erfolgreich verschoben"
    },

    "messages": {
      "created": "Artikel erfolgreich erstellt",
      "updated": "Artikel erfolgreich aktualisiert",
      "duplicated": "Artikel erfolgreich dupliziert",
      "exported": "Artikel erfolgreich exportiert"
    },

    "validation": {
      "nameRequired": "Artikelname ist erforderlich",
      "nameTooLong": "Artikelname darf höchstens {max} Zeichen haben",
      "descriptionTooLong": "Beschreibung darf höchstens {max} Zeichen haben"
    }
```

**Verification for Phase 4:**
- [ ] JSON is valid
- [ ] All keys from English exist in German
- [ ] Compound nouns correctly formed (QR-Code-Artikel)
- [ ] Formal "Sie" form used consistently
- [ ] Umlauts properly encoded (ä, ö, ü, ß)

---

### Phase 5: Generate Dutch (nl) Translations (Tasks 5.1-5.4)

**File:** `/messages/nl.json`

#### Task 5.1: Update Dutch - Core Items Strings

**Action:** UPDATE `items` object with core translations
**Estimated Size:** 1 SP

Replace the existing `items` object in `/messages/nl.json` with:

```json
{
  "items": {
    "title": "Items",
    "subtitle": "Beheer je QR-code items",
    "createNew": "Nieuw QR-code item",

    "list": {
      "empty": {
        "title": "Nog geen items",
        "description": "Maak je eerste QR-code item om te beginnen",
        "action": "Item aanmaken"
      },
      "noResults": "Geen items komen overeen met je filters"
    },

    "grid": {
      "ariaLabel": "{count, plural, =0 {Geen items} one {# item} other {# items}}",
      "loading": "Items laden"
    },

    "name": "Itemnaam",
    "description": "Beschrijving",
    "property": "Eigendom",
    "qrCode": "QR-code",
    "articles": "Artikelen",
    "addArticle": "Artikel toevoegen",
    "editItem": "Item bewerken",
    "deleteItem": "Item verwijderen",
    "viewItem": "Item bekijken",
    "printQrCode": "QR-code afdrukken",
    "downloadQrCode": "QR-code downloaden",
    "scanCount": "Aantal scans",
    "lastScanned": "Laatst gescand",
    "createdAt": "Aangemaakt op",
    "updatedAt": "Bijgewerkt op",
    "selectProperty": "Eigendom selecteren",
    "itemDetails": "Itemdetails",
    "noArticles": "Nog geen artikelen",
    "noItems": "Nog geen items",
    "addFirstArticle": "Voeg je eerste artikel toe",
    "room": "Kamer",
    "tags": "Tags",
    "addTag": "Tag toevoegen",
    "removeTag": "Tag verwijderen"
  }
}
```

#### Task 5.2: Update Dutch - Card and Content Type Strings

**Action:** ADD nested objects to `items` in `/messages/nl.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TEKST",
        "pdf": "PDF",
        "mixed": "GEMENGD",
        "video": "VIDEO",
        "photo": "FOTO",
        "media": "MEDIA"
      },
      "placeholder": {
        "title": "Voer titel in...",
        "location": "Locatie toevoegen...",
        "tags": "Tags toevoegen..."
      },
      "aria": {
        "location": "Locatie: {location}.",
        "selected": "Geselecteerd",
        "notSelected": "Niet geselecteerd",
        "pressEnterToSelect": "Druk op Enter om te selecteren",
        "pressEnterToDeselect": "Druk op Enter om te deselecteren",
        "pressEnterToPreview": "Druk op Enter voor voorvertoning",
        "selectItem": "{title} selecteren",
        "thumbnail": "Miniatuur van {title}",
        "editTitle": "Titel van {title} bewerken",
        "editLocation": "Locatie van {title} bewerken",
        "editTags": "Tags van {title} bewerken"
      },
      "tags": {
        "more": "+{count} meer"
      },
      "views": "{count, plural, one {# weergave} other {# weergaven}}",
      "pieces": "{count, plural, one {# stuk} other {# stuks}} content",
      "noContent": "Nog geen content"
    }
```

#### Task 5.3: Update Dutch - Actions, Filters, Sort, and Bulk Strings

**Action:** ADD nested objects to `items` in `/messages/nl.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "actions": {
      "create": "Nieuw item",
      "edit": "Bewerken",
      "delete": "Verwijderen",
      "duplicate": "Dupliceren",
      "viewQR": "QR-code bekijken",
      "print": "Afdrukken",
      "share": "Delen",
      "export": "Exporteren"
    },

    "filters": {
      "title": "Filters",
      "property": "Eigendom",
      "room": "Kamer",
      "tag": "Tag",
      "contentType": "Contenttype",
      "status": "Status",
      "dateRange": "Datumbereik",
      "clearAll": "Alles wissen",
      "apply": "Filters toepassen"
    },

    "sort": {
      "title": "Sorteren op",
      "newest": "Nieuwste eerst",
      "oldest": "Oudste eerst",
      "nameAZ": "Naam (A-Z)",
      "nameZA": "Naam (Z-A)",
      "mostViewed": "Meest bekeken",
      "recentlyUpdated": "Recent bijgewerkt"
    },

    "bulk": {
      "selected": "{count} geselecteerd",
      "selectAll": "Alles selecteren",
      "deselectAll": "Alles deselecteren",
      "delete": "Selectie verwijderen",
      "move": "Verplaatsen naar eigendom",
      "addTags": "Tags toevoegen",
      "removeTags": "Tags verwijderen",
      "print": "Selectie afdrukken",
      "export": "Selectie exporteren"
    }
```

#### Task 5.4: Update Dutch - Detail, Status, Delete, Move, Messages, and Validation Strings

**Action:** ADD remaining nested objects to `items` in `/messages/nl.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "detail": {
      "title": "Itemdetails",
      "qrCode": "QR-code",
      "analytics": "Analyse",
      "content": "Content",
      "settings": "Instellingen",
      "history": "Geschiedenis"
    },

    "status": {
      "active": "Actief",
      "archived": "Gearchiveerd",
      "draft": "Concept",
      "pending": "In behandeling"
    },

    "delete": {
      "title": "Item verwijderen",
      "message": "Weet je zeker dat je \"{name}\" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      "confirm": "Item verwijderen",
      "success": "Item succesvol verwijderd",
      "bulkTitle": "{count} items verwijderen",
      "bulkMessage": "Weet je zeker dat je {count} items wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
    },

    "move": {
      "title": "Items verplaatsen",
      "selectProperty": "Selecteer doeleigendom",
      "success": "Items succesvol verplaatst"
    },

    "messages": {
      "created": "Item succesvol aangemaakt",
      "updated": "Item succesvol bijgewerkt",
      "duplicated": "Item succesvol gedupliceerd",
      "exported": "Items succesvol geëxporteerd"
    },

    "validation": {
      "nameRequired": "Itemnaam is verplicht",
      "nameTooLong": "Itemnaam mag maximaal {max} tekens bevatten",
      "descriptionTooLong": "Beschrijving mag maximaal {max} tekens bevatten"
    }
```

**Verification for Phase 5:**
- [ ] JSON is valid
- [ ] All keys from English exist in Dutch
- [ ] Informal "je/jij" form used for user-friendly tone
- [ ] Correct article usage (de/het) where applicable

---

### Phase 6: Generate Italian (it) Translations (Tasks 6.1-6.4)

**File:** `/messages/it.json`

#### Task 6.1: Update Italian - Core Items Strings

**Action:** UPDATE `items` object with core translations
**Estimated Size:** 1 SP

Replace the existing `items` object in `/messages/it.json` with:

```json
{
  "items": {
    "title": "Elementi",
    "subtitle": "Gestisci i tuoi elementi con codice QR",
    "createNew": "Nuovo elemento QR",

    "list": {
      "empty": {
        "title": "Nessun elemento",
        "description": "Crea il tuo primo elemento con codice QR per iniziare",
        "action": "Crea elemento"
      },
      "noResults": "Nessun elemento corrisponde ai tuoi filtri"
    },

    "grid": {
      "ariaLabel": "{count, plural, =0 {Nessun elemento} one {# elemento} other {# elementi}}",
      "loading": "Caricamento elementi"
    },

    "name": "Nome elemento",
    "description": "Descrizione",
    "property": "Proprietà",
    "qrCode": "Codice QR",
    "articles": "Articoli",
    "addArticle": "Aggiungi articolo",
    "editItem": "Modifica elemento",
    "deleteItem": "Elimina elemento",
    "viewItem": "Visualizza elemento",
    "printQrCode": "Stampa codice QR",
    "downloadQrCode": "Scarica codice QR",
    "scanCount": "Numero di scansioni",
    "lastScanned": "Ultima scansione",
    "createdAt": "Creato il",
    "updatedAt": "Aggiornato il",
    "selectProperty": "Seleziona proprietà",
    "itemDetails": "Dettagli elemento",
    "noArticles": "Nessun articolo",
    "noItems": "Nessun elemento",
    "addFirstArticle": "Aggiungi il tuo primo articolo",
    "room": "Stanza",
    "tags": "Tag",
    "addTag": "Aggiungi tag",
    "removeTag": "Rimuovi tag"
  }
}
```

#### Task 6.2: Update Italian - Card and Content Type Strings

**Action:** ADD nested objects to `items` in `/messages/it.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "card": {
      "contentType": {
        "link": "LINK",
        "text": "TESTO",
        "pdf": "PDF",
        "mixed": "MISTO",
        "video": "VIDEO",
        "photo": "FOTO",
        "media": "MEDIA"
      },
      "placeholder": {
        "title": "Inserisci titolo...",
        "location": "Aggiungi posizione...",
        "tags": "Aggiungi tag..."
      },
      "aria": {
        "location": "Posizione: {location}.",
        "selected": "Selezionato",
        "notSelected": "Non selezionato",
        "pressEnterToSelect": "Premi Invio per selezionare",
        "pressEnterToDeselect": "Premi Invio per deselezionare",
        "pressEnterToPreview": "Premi Invio per l'anteprima",
        "selectItem": "Seleziona {title}",
        "thumbnail": "Miniatura di {title}",
        "editTitle": "Modifica titolo di {title}",
        "editLocation": "Modifica posizione di {title}",
        "editTags": "Modifica tag di {title}"
      },
      "tags": {
        "more": "+{count} altri"
      },
      "views": "{count, plural, one {# visualizzazione} other {# visualizzazioni}}",
      "pieces": "{count, plural, one {# elemento} other {# elementi}} di contenuto",
      "noContent": "Nessun contenuto ancora"
    }
```

#### Task 6.3: Update Italian - Actions, Filters, Sort, and Bulk Strings

**Action:** ADD nested objects to `items` in `/messages/it.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "actions": {
      "create": "Nuovo elemento",
      "edit": "Modifica",
      "delete": "Elimina",
      "duplicate": "Duplica",
      "viewQR": "Visualizza codice QR",
      "print": "Stampa",
      "share": "Condividi",
      "export": "Esporta"
    },

    "filters": {
      "title": "Filtri",
      "property": "Proprietà",
      "room": "Stanza",
      "tag": "Tag",
      "contentType": "Tipo di contenuto",
      "status": "Stato",
      "dateRange": "Intervallo date",
      "clearAll": "Cancella tutto",
      "apply": "Applica filtri"
    },

    "sort": {
      "title": "Ordina per",
      "newest": "Più recente",
      "oldest": "Più vecchio",
      "nameAZ": "Nome (A-Z)",
      "nameZA": "Nome (Z-A)",
      "mostViewed": "Più visualizzato",
      "recentlyUpdated": "Aggiornato di recente"
    },

    "bulk": {
      "selected": "{count} selezionato/i",
      "selectAll": "Seleziona tutto",
      "deselectAll": "Deseleziona tutto",
      "delete": "Elimina selezione",
      "move": "Sposta in proprietà",
      "addTags": "Aggiungi tag",
      "removeTags": "Rimuovi tag",
      "print": "Stampa selezione",
      "export": "Esporta selezione"
    }
```

#### Task 6.4: Update Italian - Detail, Status, Delete, Move, Messages, and Validation Strings

**Action:** ADD remaining nested objects to `items` in `/messages/it.json`
**Estimated Size:** 1 SP

Add to the `items` object:

```json
    "detail": {
      "title": "Dettagli elemento",
      "qrCode": "Codice QR",
      "analytics": "Analisi",
      "content": "Contenuto",
      "settings": "Impostazioni",
      "history": "Cronologia"
    },

    "status": {
      "active": "Attivo",
      "archived": "Archiviato",
      "draft": "Bozza",
      "pending": "In sospeso"
    },

    "delete": {
      "title": "Elimina elemento",
      "message": "Sei sicuro di voler eliminare \"{name}\"? Questa azione non può essere annullata.",
      "confirm": "Elimina elemento",
      "success": "Elemento eliminato con successo",
      "bulkTitle": "Elimina {count} elementi",
      "bulkMessage": "Sei sicuro di voler eliminare {count} elementi? Questa azione non può essere annullata."
    },

    "move": {
      "title": "Sposta elementi",
      "selectProperty": "Seleziona proprietà di destinazione",
      "success": "Elementi spostati con successo"
    },

    "messages": {
      "created": "Elemento creato con successo",
      "updated": "Elemento aggiornato con successo",
      "duplicated": "Elemento duplicato con successo",
      "exported": "Elementi esportati con successo"
    },

    "validation": {
      "nameRequired": "Il nome dell'elemento è obbligatorio",
      "nameTooLong": "Il nome dell'elemento deve avere meno di {max} caratteri",
      "descriptionTooLong": "La descrizione deve avere meno di {max} caratteri"
    }
```

**Verification for Phase 6:**
- [ ] JSON is valid
- [ ] All keys from English exist in Italian
- [ ] Gender agreement correct (il/la, un/una)
- [ ] Informal "tu" form used for user-friendly tone
- [ ] Accented characters properly encoded (à, è, é, ì, ò, ù)

---

### Phase 7: Validation and Testing (Tasks 7.1-7.4)

#### Task 7.1: Validate JSON Syntax for All Files

**Action:** Run JSON validation
**Estimated Size:** 0.5 SP

**Commands:**
```bash
# Validate each JSON file
node -e "require('./messages/en.json')"
node -e "require('./messages/fr.json')"
node -e "require('./messages/es.json')"
node -e "require('./messages/de.json')"
node -e "require('./messages/nl.json')"
node -e "require('./messages/it.json')"
```

**Expected Result:** No errors for any file.

#### Task 7.2: Validate Key Parity Across All Languages

**Action:** Verify all language files have identical key structures
**Estimated Size:** 0.5 SP

**Manual Check or Script:**
Count keys in each file's `items` namespace and verify they match.

```bash
# Quick count check (approximate)
grep -c '"' messages/en.json
grep -c '"' messages/fr.json
grep -c '"' messages/es.json
grep -c '"' messages/de.json
grep -c '"' messages/nl.json
grep -c '"' messages/it.json
```

**Expected Result:** Similar counts across all files.

#### Task 7.3: Run TypeScript Check

**Action:** Verify no TypeScript errors introduced
**Estimated Size:** 0.5 SP

**Command:**
```bash
npm run typecheck
```

**Expected Result:** No new TypeScript errors.

#### Task 7.4: Validate ICU Pluralization Strings

**Action:** Verify all plural forms are syntactically correct
**Estimated Size:** 0.5 SP

**Strings to validate in each language file:**
- `items.grid.ariaLabel`
- `items.card.views`
- `items.card.pieces`
- `items.bulk.selected`
- `items.delete.bulkTitle`
- `items.delete.bulkMessage`

**Validation:** Each ICU string should follow the pattern:
```
{count, plural, =0 {...} one {...} other {...}}
```

---

## Complete File Templates

### Complete French `/messages/fr.json` - Items Namespace

For reference, here is the complete `items` namespace for French after all tasks:

```json
{
  "items": {
    "title": "Articles",
    "subtitle": "Gérez vos articles avec code QR",
    "createNew": "Nouvel article QR",
    "list": {
      "empty": {
        "title": "Aucun article",
        "description": "Créez votre premier article avec code QR pour commencer",
        "action": "Créer un article"
      },
      "noResults": "Aucun article ne correspond à vos filtres"
    },
    "grid": {
      "ariaLabel": "{count, plural, =0 {Aucun article} one {# article} other {# articles}}",
      "loading": "Chargement des articles"
    },
    "card": {
      "contentType": {
        "link": "LIEN",
        "text": "TEXTE",
        "pdf": "PDF",
        "mixed": "MIXTE",
        "video": "VIDÉO",
        "photo": "PHOTO",
        "media": "MÉDIA"
      },
      "placeholder": {
        "title": "Entrez le titre...",
        "location": "Ajouter un emplacement...",
        "tags": "Ajouter des étiquettes..."
      },
      "aria": {
        "location": "Emplacement : {location}.",
        "selected": "Sélectionné",
        "notSelected": "Non sélectionné",
        "pressEnterToSelect": "Appuyez sur Entrée pour sélectionner",
        "pressEnterToDeselect": "Appuyez sur Entrée pour désélectionner",
        "pressEnterToPreview": "Appuyez sur Entrée pour prévisualiser",
        "selectItem": "Sélectionner {title}",
        "thumbnail": "Miniature de {title}",
        "editTitle": "Modifier le titre de {title}",
        "editLocation": "Modifier l'emplacement de {title}",
        "editTags": "Modifier les étiquettes de {title}"
      },
      "tags": {
        "more": "+{count} autres"
      },
      "views": "{count, plural, one {# vue} other {# vues}}",
      "pieces": "{count, plural, one {# élément} other {# éléments}} de contenu",
      "noContent": "Pas encore de contenu"
    },
    "actions": {
      "create": "Nouvel article",
      "edit": "Modifier",
      "delete": "Supprimer",
      "duplicate": "Dupliquer",
      "viewQR": "Voir le code QR",
      "print": "Imprimer",
      "share": "Partager",
      "export": "Exporter"
    },
    "filters": {
      "title": "Filtres",
      "property": "Propriété",
      "room": "Pièce",
      "tag": "Étiquette",
      "contentType": "Type de contenu",
      "status": "Statut",
      "dateRange": "Plage de dates",
      "clearAll": "Tout effacer",
      "apply": "Appliquer les filtres"
    },
    "sort": {
      "title": "Trier par",
      "newest": "Plus récent",
      "oldest": "Plus ancien",
      "nameAZ": "Nom (A-Z)",
      "nameZA": "Nom (Z-A)",
      "mostViewed": "Plus consulté",
      "recentlyUpdated": "Récemment mis à jour"
    },
    "bulk": {
      "selected": "{count} sélectionné(s)",
      "selectAll": "Tout sélectionner",
      "deselectAll": "Tout désélectionner",
      "delete": "Supprimer la sélection",
      "move": "Déplacer vers une propriété",
      "addTags": "Ajouter des étiquettes",
      "removeTags": "Supprimer des étiquettes",
      "print": "Imprimer la sélection",
      "export": "Exporter la sélection"
    },
    "detail": {
      "title": "Détails de l'article",
      "qrCode": "Code QR",
      "analytics": "Analytique",
      "content": "Contenu",
      "settings": "Paramètres",
      "history": "Historique"
    },
    "status": {
      "active": "Actif",
      "archived": "Archivé",
      "draft": "Brouillon",
      "pending": "En attente"
    },
    "delete": {
      "title": "Supprimer l'article",
      "message": "Êtes-vous sûr de vouloir supprimer « {name} » ? Cette action est irréversible.",
      "confirm": "Supprimer l'article",
      "success": "Article supprimé avec succès",
      "bulkTitle": "Supprimer {count} articles",
      "bulkMessage": "Êtes-vous sûr de vouloir supprimer {count} articles ? Cette action est irréversible."
    },
    "move": {
      "title": "Déplacer les articles",
      "selectProperty": "Sélectionner la propriété de destination",
      "success": "Articles déplacés avec succès"
    },
    "messages": {
      "created": "Article créé avec succès",
      "updated": "Article mis à jour avec succès",
      "duplicated": "Article dupliqué avec succès",
      "exported": "Articles exportés avec succès"
    },
    "validation": {
      "nameRequired": "Le nom de l'article est requis",
      "nameTooLong": "Le nom de l'article doit contenir moins de {max} caractères",
      "descriptionTooLong": "La description doit contenir moins de {max} caractères"
    },
    "name": "Nom de l'article",
    "description": "Description",
    "property": "Propriété",
    "qrCode": "Code QR",
    "articles": "Articles",
    "addArticle": "Ajouter un article",
    "editItem": "Modifier l'article",
    "deleteItem": "Supprimer l'article",
    "viewItem": "Voir l'article",
    "printQrCode": "Imprimer le code QR",
    "downloadQrCode": "Télécharger le code QR",
    "scanCount": "Nombre de scans",
    "lastScanned": "Dernier scan",
    "createdAt": "Créé le",
    "updatedAt": "Mis à jour le",
    "selectProperty": "Sélectionner une propriété",
    "itemDetails": "Détails de l'article",
    "noArticles": "Aucun article",
    "noItems": "Aucun article",
    "addFirstArticle": "Ajoutez votre premier article",
    "room": "Pièce",
    "tags": "Étiquettes",
    "addTag": "Ajouter une étiquette",
    "removeTag": "Supprimer l'étiquette"
  }
}
```

---

## Translation Quality Glossary

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Item | Article | Artículo | Artikel | Item | Elemento |
| Property | Propriété | Propiedad | Immobilie | Eigendom | Proprietà |
| QR Code | Code QR | Código QR | QR-Code | QR-code | Codice QR |
| Tag | Étiquette | Etiqueta | Tag | Tag | Tag |
| Filter | Filtre | Filtro | Filter | Filter | Filtro |
| Room | Pièce | Habitación | Raum | Kamer | Stanza |
| Content | Contenu | Contenido | Inhalt | Content | Contenuto |
| View | Vue | Vista | Aufruf | Weergave | Visualizzazione |

---

## Verification Checklist

### Translation Completeness
- [ ] en.json items namespace expanded with all required keys (~100+ keys)
- [ ] fr.json items namespace complete with all keys
- [ ] es.json items namespace complete with all keys
- [ ] de.json items namespace complete with all keys
- [ ] nl.json items namespace complete with all keys
- [ ] it.json items namespace complete with all keys
- [ ] Key counts match across all 6 files

### Translation Quality
- [ ] No placeholder text remaining (TODO, TRANSLATE, etc.)
- [ ] Pluralization works correctly in all languages
- [ ] Variable interpolation preserved ({name}, {count}, {max})
- [ ] Gender agreement correct in French, Spanish, Italian, German
- [ ] Formal/informal tone consistent within each language

### Technical Validation
- [ ] All JSON files valid (no syntax errors)
- [ ] ICU format strings valid
- [ ] Special characters properly encoded (UTF-8)
- [ ] `npm run typecheck` passes
- [ ] No console warnings for missing translations

---

## Acceptance Criteria Mapping

| Requirement | Task(s) |
|-------------|---------|
| French translation complete | Tasks 2.1-2.4 |
| Spanish translation complete | Tasks 3.1-3.4 |
| German translation complete | Tasks 4.1-4.4 |
| Dutch translation complete | Tasks 5.1-5.4 |
| Italian translation complete | Tasks 6.1-6.4 |
| All field labels translated | All language tasks |
| Button labels correct | Tasks X.3 (actions section) |
| Filter labels translated | Tasks X.3 (filters section) |
| Sort options translated | Tasks X.3 (sort section) |
| Bulk action dialogs natural | Tasks X.3, X.4 |
| Status indicators appropriate | Tasks X.4 (status section) |
| Empty state messages clear | Tasks X.1 (list.empty) |
| Validation messages correct | Tasks X.4 (validation section) |
| Plural forms handled | All tasks with ICU strings |
| Gender agreement correct | Language-specific verification |
| No missing translation keys | Task 7.2 |
| JSON files valid | Task 7.1 |

---

## References

- **Overview Document:** `/docs/REQ-E02-084-generate-translations-for-5-non-english-languages-overview.md`
- **Request Source:** `/docs/gen_requests_epic2.md` - REQ-E02-084
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **next-intl Documentation:** https://next-intl-docs.vercel.app/
- **ICU Message Format:** https://unicode-org.github.io/icu/userguide/format_parse/messages/

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2D: Item Management*
*Last Modified: 2026-01-20*
