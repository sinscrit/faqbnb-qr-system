# REQ-392: Create Articles Namespace Structure - Detailed Task Breakdown

**Last Modified:** 2026-01-19 09:30 UTC
**Request ID:** REQ-392
**Type:** NEW FEATURE
**Size:** S (Small)
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.1
**Priority:** Eighth (per Epic 2 recommended order)
**Source Overview:** [REQ-392-create-articles-namespace-structure-overview.md](./REQ-392-create-articles-namespace-structure-overview.md)

---

## Executive Summary

This document provides step-by-step implementation tasks for creating the `articles` namespace in all six supported language message files. This namespace will contain ~300 translation keys for article management UI elements including editor strings, media handling, content states, actions, and feedback messages.

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] All six message files exist: `/messages/{en,de,es,fr,it,nl}.json`
- [ ] Familiarity with next-intl translation patterns
- [ ] Access to AI translation service (Claude/OpenAI) for non-English translations

---

## Task Breakdown

### Task 1: Add Articles Namespace to English Message File (Base Implementation)

**File:** `/messages/en.json`
**Estimated Effort:** 15 minutes
**Story Points:** 1

#### 1.1 Objective
Add the complete `articles` namespace with all required translation keys to the English message file. This serves as the source of truth for all other language translations.

#### 1.2 Implementation Steps

1. **Open** `/messages/en.json`

2. **Add** the following `articles` namespace after the existing `language` namespace (before the closing brace):

```json
,
  "articles": {
    "title": "Instructions",
    "subtitle": "Manage content and instructions",
    "editor": {
      "title": "Edit Content",
      "preview": "Preview",
      "edit": "Edit",
      "formatting": {
        "bold": "Bold",
        "italic": "Italic",
        "heading": "Heading",
        "list": "List",
        "link": "Link",
        "image": "Image",
        "quote": "Quote",
        "code": "Code",
        "divider": "Divider"
      },
      "placeholder": "Write your instructions here...",
      "characterCount": "{count} characters",
      "wordCount": "{count} words",
      "autoSaved": "Auto-saved",
      "unsavedChanges": "Unsaved changes"
    },
    "media": {
      "upload": "Upload Media",
      "dragDrop": "Drag and drop files here",
      "or": "or",
      "browse": "Browse files",
      "supportedFormats": "Supported formats: {formats}",
      "maxSize": "Maximum file size: {size}MB",
      "uploading": "Uploading...",
      "uploadComplete": "Upload complete",
      "uploadFailed": "Upload failed",
      "processing": "Processing media...",
      "remove": "Remove media",
      "replace": "Replace media",
      "preview": "Preview media"
    },
    "crop": {
      "title": "Crop Image",
      "aspectRatio": "Aspect Ratio",
      "freeform": "Freeform",
      "square": "Square (1:1)",
      "landscape": "Landscape (16:9)",
      "portrait": "Portrait (9:16)",
      "widescreen": "Widescreen (4:3)",
      "apply": "Apply Crop",
      "reset": "Reset",
      "cancel": "Cancel",
      "rotate": "Rotate",
      "flip": "Flip",
      "zoom": "Zoom"
    },
    "video": {
      "title": "Trim Video",
      "startTime": "Start Time",
      "endTime": "End Time",
      "duration": "Duration: {duration}",
      "apply": "Apply Trim",
      "reset": "Reset",
      "play": "Play",
      "pause": "Pause",
      "mute": "Mute",
      "unmute": "Unmute",
      "fullscreen": "Fullscreen",
      "processing": "Processing video...",
      "thumbnail": "Set Thumbnail"
    },
    "purposes": {
      "howToUse": "How to Use",
      "troubleshooting": "Troubleshooting",
      "maintenance": "Maintenance",
      "safety": "Safety Information",
      "warranty": "Warranty & Support",
      "specifications": "Specifications",
      "setup": "Setup Guide",
      "cleaning": "Cleaning Instructions",
      "other": "Other"
    },
    "list": {
      "title": "Title",
      "item": "Item",
      "room": "Room",
      "property": "Property",
      "purpose": "Purpose",
      "created": "Created",
      "updated": "Updated",
      "actions": "Actions",
      "status": "Status",
      "empty": "No guides available",
      "noResults": "No guides match your filters",
      "searchPlaceholder": "Search guides..."
    },
    "toolbar": {
      "search": "Search guides...",
      "filter": "Filter",
      "clearFilters": "Clear filters",
      "viewGrid": "Grid view",
      "viewList": "List view",
      "showing": "Showing {count} of {total} guides",
      "sortBy": "Sort by",
      "sortNewest": "Newest first",
      "sortOldest": "Oldest first",
      "sortNameAZ": "Name (A-Z)",
      "sortNameZA": "Name (Z-A)"
    },
    "card": {
      "edit": "Edit",
      "viewDetails": "View Details",
      "noContent": "No content yet",
      "contentPieces": "{count} content pieces",
      "lastUpdated": "Last updated {date}"
    },
    "page": {
      "title": "Guides",
      "subtitle": "Manage guide articles for your items",
      "createFirst": "Create Your First Item",
      "learnMore": "Learn More",
      "loading": "Loading guides...",
      "authRequired": "Authentication Required",
      "authMessage": "Please log in to access guides.",
      "goToLogin": "Go to Login",
      "retry": "Retry",
      "errorTitle": "Error Loading Guides",
      "errorMessage": "Unable to load guides. Please try again.",
      "successMessage": "Guide updated successfully",
      "deleteSuccess": "Guide deleted successfully"
    },
    "empty": {
      "title": "No guides yet",
      "description": "Create items and add guide articles to get started. Guides help guests understand how to use items in your property.",
      "action": "Create First Guide"
    },
    "states": {
      "draft": "Draft",
      "published": "Published",
      "archived": "Archived",
      "scheduled": "Scheduled",
      "pending": "Pending Review"
    },
    "actions": {
      "create": "Create Guide",
      "edit": "Edit Guide",
      "delete": "Delete Guide",
      "publish": "Publish",
      "unpublish": "Unpublish",
      "archive": "Archive",
      "restore": "Restore",
      "duplicate": "Duplicate",
      "preview": "Preview",
      "save": "Save Guide",
      "saveAndPublish": "Save & Publish",
      "discardChanges": "Discard Changes"
    },
    "confirmations": {
      "delete": {
        "title": "Delete Guide",
        "message": "Are you sure you want to delete this guide? This action cannot be undone.",
        "confirm": "Delete",
        "cancel": "Cancel"
      },
      "discard": {
        "title": "Discard Changes",
        "message": "You have unsaved changes. Are you sure you want to discard them?",
        "confirm": "Discard",
        "cancel": "Keep Editing"
      },
      "archive": {
        "title": "Archive Guide",
        "message": "This guide will be archived and no longer visible to guests. You can restore it later.",
        "confirm": "Archive",
        "cancel": "Cancel"
      },
      "publish": {
        "title": "Publish Guide",
        "message": "This guide will be visible to all guests. Are you ready to publish?",
        "confirm": "Publish",
        "cancel": "Cancel"
      }
    },
    "errors": {
      "loadFailed": "Failed to fetch articles",
      "saveFailed": "Failed to save article",
      "deleteFailed": "Failed to delete article",
      "notFound": "Article not found",
      "publishFailed": "Failed to publish article",
      "uploadFailed": "Failed to upload media",
      "processingFailed": "Failed to process media",
      "permissionDenied": "You do not have permission to edit this article"
    },
    "loading": {
      "fetching": "Fetching articles...",
      "saving": "Saving...",
      "deleting": "Deleting...",
      "uploading": "Uploading media...",
      "processing": "Processing...",
      "publishing": "Publishing..."
    },
    "validation": {
      "titleRequired": "Article title is required",
      "titleTooLong": "Title must be less than {max} characters",
      "contentRequired": "Article content is required",
      "maxLength": "Content exceeds the maximum character limit. Please shorten your text.",
      "invalidMediaType": "Invalid media type. Please upload a supported format.",
      "mediaTooLarge": "Media file is too large. Maximum size is {max}MB."
    }
  }
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/en.json')"
   ```

4. **Verify** the file structure is valid and the `articles` namespace is accessible.

#### 1.3 Verification Checklist
- [ ] JSON syntax is valid (no trailing commas, proper nesting)
- [ ] All key paths follow the `namespace.component.element.variant` pattern
- [ ] Variable placeholders use ICU format: `{variableName}`
- [ ] No duplicate keys exist
- [ ] Build passes: `npm run build`

---

### Task 2: Add Articles Namespace to French Message File

**File:** `/messages/fr.json`
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 2.1 Objective
Add the `articles` namespace with French translations to the French message file.

#### 2.2 Implementation Steps

1. **Open** `/messages/fr.json`

2. **Add** the following `articles` namespace (translate from English source):

```json
,
  "articles": {
    "title": "Instructions",
    "subtitle": "Gerer le contenu et les instructions",
    "editor": {
      "title": "Modifier le contenu",
      "preview": "Apercu",
      "edit": "Modifier",
      "formatting": {
        "bold": "Gras",
        "italic": "Italique",
        "heading": "Titre",
        "list": "Liste",
        "link": "Lien",
        "image": "Image",
        "quote": "Citation",
        "code": "Code",
        "divider": "Separateur"
      },
      "placeholder": "Ecrivez vos instructions ici...",
      "characterCount": "{count} caracteres",
      "wordCount": "{count} mots",
      "autoSaved": "Sauvegarde automatique",
      "unsavedChanges": "Modifications non enregistrees"
    },
    "media": {
      "upload": "Telecharger un media",
      "dragDrop": "Glissez et deposez les fichiers ici",
      "or": "ou",
      "browse": "Parcourir les fichiers",
      "supportedFormats": "Formats supportes : {formats}",
      "maxSize": "Taille maximale du fichier : {size} Mo",
      "uploading": "Telechargement en cours...",
      "uploadComplete": "Telechargement termine",
      "uploadFailed": "Echec du telechargement",
      "processing": "Traitement du media...",
      "remove": "Supprimer le media",
      "replace": "Remplacer le media",
      "preview": "Apercu du media"
    },
    "crop": {
      "title": "Recadrer l'image",
      "aspectRatio": "Rapport d'aspect",
      "freeform": "Libre",
      "square": "Carre (1:1)",
      "landscape": "Paysage (16:9)",
      "portrait": "Portrait (9:16)",
      "widescreen": "Ecran large (4:3)",
      "apply": "Appliquer le recadrage",
      "reset": "Reinitialiser",
      "cancel": "Annuler",
      "rotate": "Pivoter",
      "flip": "Retourner",
      "zoom": "Zoom"
    },
    "video": {
      "title": "Couper la video",
      "startTime": "Heure de debut",
      "endTime": "Heure de fin",
      "duration": "Duree : {duration}",
      "apply": "Appliquer la coupe",
      "reset": "Reinitialiser",
      "play": "Lecture",
      "pause": "Pause",
      "mute": "Muet",
      "unmute": "Activer le son",
      "fullscreen": "Plein ecran",
      "processing": "Traitement de la video...",
      "thumbnail": "Definir la miniature"
    },
    "purposes": {
      "howToUse": "Mode d'emploi",
      "troubleshooting": "Depannage",
      "maintenance": "Entretien",
      "safety": "Consignes de securite",
      "warranty": "Garantie et support",
      "specifications": "Specifications",
      "setup": "Guide d'installation",
      "cleaning": "Instructions de nettoyage",
      "other": "Autre"
    },
    "list": {
      "title": "Titre",
      "item": "Article",
      "room": "Piece",
      "property": "Propriete",
      "purpose": "Objectif",
      "created": "Cree",
      "updated": "Mis a jour",
      "actions": "Actions",
      "status": "Statut",
      "empty": "Aucun guide disponible",
      "noResults": "Aucun guide ne correspond a vos filtres",
      "searchPlaceholder": "Rechercher des guides..."
    },
    "toolbar": {
      "search": "Rechercher des guides...",
      "filter": "Filtrer",
      "clearFilters": "Effacer les filtres",
      "viewGrid": "Vue en grille",
      "viewList": "Vue en liste",
      "showing": "Affichage de {count} sur {total} guides",
      "sortBy": "Trier par",
      "sortNewest": "Plus recent d'abord",
      "sortOldest": "Plus ancien d'abord",
      "sortNameAZ": "Nom (A-Z)",
      "sortNameZA": "Nom (Z-A)"
    },
    "card": {
      "edit": "Modifier",
      "viewDetails": "Voir les details",
      "noContent": "Pas encore de contenu",
      "contentPieces": "{count} elements de contenu",
      "lastUpdated": "Derniere mise a jour {date}"
    },
    "page": {
      "title": "Guides",
      "subtitle": "Gerez les articles de guide pour vos articles",
      "createFirst": "Creez votre premier article",
      "learnMore": "En savoir plus",
      "loading": "Chargement des guides...",
      "authRequired": "Authentification requise",
      "authMessage": "Veuillez vous connecter pour acceder aux guides.",
      "goToLogin": "Aller a la connexion",
      "retry": "Reessayer",
      "errorTitle": "Erreur de chargement des guides",
      "errorMessage": "Impossible de charger les guides. Veuillez reessayer.",
      "successMessage": "Guide mis a jour avec succes",
      "deleteSuccess": "Guide supprime avec succes"
    },
    "empty": {
      "title": "Pas encore de guides",
      "description": "Creez des articles et ajoutez des guides pour commencer. Les guides aident les invites a comprendre comment utiliser les articles de votre propriete.",
      "action": "Creer le premier guide"
    },
    "states": {
      "draft": "Brouillon",
      "published": "Publie",
      "archived": "Archive",
      "scheduled": "Programme",
      "pending": "En attente de revision"
    },
    "actions": {
      "create": "Creer un guide",
      "edit": "Modifier le guide",
      "delete": "Supprimer le guide",
      "publish": "Publier",
      "unpublish": "Depublier",
      "archive": "Archiver",
      "restore": "Restaurer",
      "duplicate": "Dupliquer",
      "preview": "Apercu",
      "save": "Enregistrer le guide",
      "saveAndPublish": "Enregistrer et publier",
      "discardChanges": "Annuler les modifications"
    },
    "confirmations": {
      "delete": {
        "title": "Supprimer le guide",
        "message": "Etes-vous sur de vouloir supprimer ce guide ? Cette action est irreversible.",
        "confirm": "Supprimer",
        "cancel": "Annuler"
      },
      "discard": {
        "title": "Annuler les modifications",
        "message": "Vous avez des modifications non enregistrees. Etes-vous sur de vouloir les annuler ?",
        "confirm": "Annuler",
        "cancel": "Continuer l'edition"
      },
      "archive": {
        "title": "Archiver le guide",
        "message": "Ce guide sera archive et ne sera plus visible pour les invites. Vous pourrez le restaurer plus tard.",
        "confirm": "Archiver",
        "cancel": "Annuler"
      },
      "publish": {
        "title": "Publier le guide",
        "message": "Ce guide sera visible par tous les invites. Etes-vous pret a publier ?",
        "confirm": "Publier",
        "cancel": "Annuler"
      }
    },
    "errors": {
      "loadFailed": "Echec du chargement des articles",
      "saveFailed": "Echec de l'enregistrement de l'article",
      "deleteFailed": "Echec de la suppression de l'article",
      "notFound": "Article non trouve",
      "publishFailed": "Echec de la publication de l'article",
      "uploadFailed": "Echec du telechargement du media",
      "processingFailed": "Echec du traitement du media",
      "permissionDenied": "Vous n'avez pas la permission de modifier cet article"
    },
    "loading": {
      "fetching": "Recuperation des articles...",
      "saving": "Enregistrement...",
      "deleting": "Suppression...",
      "uploading": "Telechargement du media...",
      "processing": "Traitement...",
      "publishing": "Publication..."
    },
    "validation": {
      "titleRequired": "Le titre de l'article est requis",
      "titleTooLong": "Le titre doit contenir moins de {max} caracteres",
      "contentRequired": "Le contenu de l'article est requis",
      "maxLength": "Le contenu depasse la limite de caracteres. Veuillez reduire votre texte.",
      "invalidMediaType": "Type de media invalide. Veuillez telecharger un format supporte.",
      "mediaTooLarge": "Le fichier media est trop volumineux. Taille maximale : {max} Mo."
    }
  }
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/fr.json')"
   ```

#### 2.3 Verification Checklist
- [ ] JSON syntax is valid
- [ ] All keys match English source structure exactly
- [ ] Variable placeholders preserved: `{count}`, `{total}`, `{formats}`, `{size}`, `{duration}`, `{date}`, `{max}`
- [ ] Translations are contextually appropriate

---

### Task 3: Add Articles Namespace to Spanish Message File

**File:** `/messages/es.json`
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 3.1 Objective
Add the `articles` namespace with Spanish translations.

#### 3.2 Implementation Steps

1. **Open** `/messages/es.json`

2. **Add** the following `articles` namespace:

```json
,
  "articles": {
    "title": "Instrucciones",
    "subtitle": "Gestionar contenido e instrucciones",
    "editor": {
      "title": "Editar contenido",
      "preview": "Vista previa",
      "edit": "Editar",
      "formatting": {
        "bold": "Negrita",
        "italic": "Cursiva",
        "heading": "Encabezado",
        "list": "Lista",
        "link": "Enlace",
        "image": "Imagen",
        "quote": "Cita",
        "code": "Codigo",
        "divider": "Separador"
      },
      "placeholder": "Escribe tus instrucciones aqui...",
      "characterCount": "{count} caracteres",
      "wordCount": "{count} palabras",
      "autoSaved": "Guardado automatico",
      "unsavedChanges": "Cambios sin guardar"
    },
    "media": {
      "upload": "Subir medio",
      "dragDrop": "Arrastra y suelta archivos aqui",
      "or": "o",
      "browse": "Explorar archivos",
      "supportedFormats": "Formatos soportados: {formats}",
      "maxSize": "Tamano maximo del archivo: {size}MB",
      "uploading": "Subiendo...",
      "uploadComplete": "Subida completada",
      "uploadFailed": "Error en la subida",
      "processing": "Procesando medio...",
      "remove": "Eliminar medio",
      "replace": "Reemplazar medio",
      "preview": "Vista previa del medio"
    },
    "crop": {
      "title": "Recortar imagen",
      "aspectRatio": "Relacion de aspecto",
      "freeform": "Libre",
      "square": "Cuadrado (1:1)",
      "landscape": "Paisaje (16:9)",
      "portrait": "Retrato (9:16)",
      "widescreen": "Pantalla ancha (4:3)",
      "apply": "Aplicar recorte",
      "reset": "Restablecer",
      "cancel": "Cancelar",
      "rotate": "Rotar",
      "flip": "Voltear",
      "zoom": "Zoom"
    },
    "video": {
      "title": "Recortar video",
      "startTime": "Tiempo de inicio",
      "endTime": "Tiempo de fin",
      "duration": "Duracion: {duration}",
      "apply": "Aplicar recorte",
      "reset": "Restablecer",
      "play": "Reproducir",
      "pause": "Pausar",
      "mute": "Silenciar",
      "unmute": "Activar sonido",
      "fullscreen": "Pantalla completa",
      "processing": "Procesando video...",
      "thumbnail": "Establecer miniatura"
    },
    "purposes": {
      "howToUse": "Como usar",
      "troubleshooting": "Solucion de problemas",
      "maintenance": "Mantenimiento",
      "safety": "Informacion de seguridad",
      "warranty": "Garantia y soporte",
      "specifications": "Especificaciones",
      "setup": "Guia de instalacion",
      "cleaning": "Instrucciones de limpieza",
      "other": "Otro"
    },
    "list": {
      "title": "Titulo",
      "item": "Articulo",
      "room": "Habitacion",
      "property": "Propiedad",
      "purpose": "Proposito",
      "created": "Creado",
      "updated": "Actualizado",
      "actions": "Acciones",
      "status": "Estado",
      "empty": "No hay guias disponibles",
      "noResults": "Ninguna guia coincide con tus filtros",
      "searchPlaceholder": "Buscar guias..."
    },
    "toolbar": {
      "search": "Buscar guias...",
      "filter": "Filtrar",
      "clearFilters": "Limpiar filtros",
      "viewGrid": "Vista de cuadricula",
      "viewList": "Vista de lista",
      "showing": "Mostrando {count} de {total} guias",
      "sortBy": "Ordenar por",
      "sortNewest": "Mas reciente primero",
      "sortOldest": "Mas antiguo primero",
      "sortNameAZ": "Nombre (A-Z)",
      "sortNameZA": "Nombre (Z-A)"
    },
    "card": {
      "edit": "Editar",
      "viewDetails": "Ver detalles",
      "noContent": "Sin contenido aun",
      "contentPieces": "{count} piezas de contenido",
      "lastUpdated": "Ultima actualizacion {date}"
    },
    "page": {
      "title": "Guias",
      "subtitle": "Gestiona articulos de guia para tus items",
      "createFirst": "Crea tu primer articulo",
      "learnMore": "Saber mas",
      "loading": "Cargando guias...",
      "authRequired": "Autenticacion requerida",
      "authMessage": "Por favor inicia sesion para acceder a las guias.",
      "goToLogin": "Ir al inicio de sesion",
      "retry": "Reintentar",
      "errorTitle": "Error al cargar guias",
      "errorMessage": "No se pudieron cargar las guias. Por favor intenta de nuevo.",
      "successMessage": "Guia actualizada con exito",
      "deleteSuccess": "Guia eliminada con exito"
    },
    "empty": {
      "title": "Aun no hay guias",
      "description": "Crea articulos y agrega guias para comenzar. Las guias ayudan a los huespedes a entender como usar los articulos de tu propiedad.",
      "action": "Crear primera guia"
    },
    "states": {
      "draft": "Borrador",
      "published": "Publicado",
      "archived": "Archivado",
      "scheduled": "Programado",
      "pending": "Pendiente de revision"
    },
    "actions": {
      "create": "Crear guia",
      "edit": "Editar guia",
      "delete": "Eliminar guia",
      "publish": "Publicar",
      "unpublish": "Despublicar",
      "archive": "Archivar",
      "restore": "Restaurar",
      "duplicate": "Duplicar",
      "preview": "Vista previa",
      "save": "Guardar guia",
      "saveAndPublish": "Guardar y publicar",
      "discardChanges": "Descartar cambios"
    },
    "confirmations": {
      "delete": {
        "title": "Eliminar guia",
        "message": "Estas seguro de que quieres eliminar esta guia? Esta accion no se puede deshacer.",
        "confirm": "Eliminar",
        "cancel": "Cancelar"
      },
      "discard": {
        "title": "Descartar cambios",
        "message": "Tienes cambios sin guardar. Estas seguro de que quieres descartarlos?",
        "confirm": "Descartar",
        "cancel": "Seguir editando"
      },
      "archive": {
        "title": "Archivar guia",
        "message": "Esta guia sera archivada y ya no sera visible para los huespedes. Puedes restaurarla mas tarde.",
        "confirm": "Archivar",
        "cancel": "Cancelar"
      },
      "publish": {
        "title": "Publicar guia",
        "message": "Esta guia sera visible para todos los huespedes. Estas listo para publicar?",
        "confirm": "Publicar",
        "cancel": "Cancelar"
      }
    },
    "errors": {
      "loadFailed": "Error al cargar articulos",
      "saveFailed": "Error al guardar articulo",
      "deleteFailed": "Error al eliminar articulo",
      "notFound": "Articulo no encontrado",
      "publishFailed": "Error al publicar articulo",
      "uploadFailed": "Error al subir medio",
      "processingFailed": "Error al procesar medio",
      "permissionDenied": "No tienes permiso para editar este articulo"
    },
    "loading": {
      "fetching": "Obteniendo articulos...",
      "saving": "Guardando...",
      "deleting": "Eliminando...",
      "uploading": "Subiendo medio...",
      "processing": "Procesando...",
      "publishing": "Publicando..."
    },
    "validation": {
      "titleRequired": "El titulo del articulo es requerido",
      "titleTooLong": "El titulo debe tener menos de {max} caracteres",
      "contentRequired": "El contenido del articulo es requerido",
      "maxLength": "El contenido excede el limite de caracteres. Por favor acorta tu texto.",
      "invalidMediaType": "Tipo de medio invalido. Por favor sube un formato soportado.",
      "mediaTooLarge": "El archivo de medio es muy grande. Tamano maximo: {max}MB."
    }
  }
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/es.json')"
   ```

#### 3.3 Verification Checklist
- [ ] JSON syntax is valid
- [ ] All keys match English source structure exactly
- [ ] Variable placeholders preserved
- [ ] Spanish translations are grammatically correct

---

### Task 4: Add Articles Namespace to German Message File

**File:** `/messages/de.json`
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 4.1 Objective
Add the `articles` namespace with German translations.

#### 4.2 Implementation Steps

1. **Open** `/messages/de.json`

2. **Add** the following `articles` namespace:

```json
,
  "articles": {
    "title": "Anleitungen",
    "subtitle": "Inhalte und Anleitungen verwalten",
    "editor": {
      "title": "Inhalt bearbeiten",
      "preview": "Vorschau",
      "edit": "Bearbeiten",
      "formatting": {
        "bold": "Fett",
        "italic": "Kursiv",
        "heading": "Uberschrift",
        "list": "Liste",
        "link": "Link",
        "image": "Bild",
        "quote": "Zitat",
        "code": "Code",
        "divider": "Trennlinie"
      },
      "placeholder": "Schreiben Sie Ihre Anleitungen hier...",
      "characterCount": "{count} Zeichen",
      "wordCount": "{count} Worter",
      "autoSaved": "Automatisch gespeichert",
      "unsavedChanges": "Nicht gespeicherte Anderungen"
    },
    "media": {
      "upload": "Medien hochladen",
      "dragDrop": "Dateien hier ablegen",
      "or": "oder",
      "browse": "Dateien durchsuchen",
      "supportedFormats": "Unterstutzte Formate: {formats}",
      "maxSize": "Maximale Dateigrosse: {size}MB",
      "uploading": "Wird hochgeladen...",
      "uploadComplete": "Upload abgeschlossen",
      "uploadFailed": "Upload fehlgeschlagen",
      "processing": "Medien werden verarbeitet...",
      "remove": "Medien entfernen",
      "replace": "Medien ersetzen",
      "preview": "Medienvorschau"
    },
    "crop": {
      "title": "Bild zuschneiden",
      "aspectRatio": "Seitenverhaltnis",
      "freeform": "Frei",
      "square": "Quadrat (1:1)",
      "landscape": "Querformat (16:9)",
      "portrait": "Hochformat (9:16)",
      "widescreen": "Breitbild (4:3)",
      "apply": "Zuschnitt anwenden",
      "reset": "Zurucksetzen",
      "cancel": "Abbrechen",
      "rotate": "Drehen",
      "flip": "Spiegeln",
      "zoom": "Zoom"
    },
    "video": {
      "title": "Video schneiden",
      "startTime": "Startzeit",
      "endTime": "Endzeit",
      "duration": "Dauer: {duration}",
      "apply": "Schnitt anwenden",
      "reset": "Zurucksetzen",
      "play": "Abspielen",
      "pause": "Pause",
      "mute": "Stumm",
      "unmute": "Ton aktivieren",
      "fullscreen": "Vollbild",
      "processing": "Video wird verarbeitet...",
      "thumbnail": "Vorschaubild festlegen"
    },
    "purposes": {
      "howToUse": "Bedienungsanleitung",
      "troubleshooting": "Fehlerbehebung",
      "maintenance": "Wartung",
      "safety": "Sicherheitshinweise",
      "warranty": "Garantie und Support",
      "specifications": "Spezifikationen",
      "setup": "Einrichtungsanleitung",
      "cleaning": "Reinigungsanleitung",
      "other": "Sonstiges"
    },
    "list": {
      "title": "Titel",
      "item": "Artikel",
      "room": "Raum",
      "property": "Objekt",
      "purpose": "Zweck",
      "created": "Erstellt",
      "updated": "Aktualisiert",
      "actions": "Aktionen",
      "status": "Status",
      "empty": "Keine Anleitungen verfugbar",
      "noResults": "Keine Anleitungen entsprechen Ihren Filtern",
      "searchPlaceholder": "Anleitungen suchen..."
    },
    "toolbar": {
      "search": "Anleitungen suchen...",
      "filter": "Filtern",
      "clearFilters": "Filter loschen",
      "viewGrid": "Rasteransicht",
      "viewList": "Listenansicht",
      "showing": "Zeige {count} von {total} Anleitungen",
      "sortBy": "Sortieren nach",
      "sortNewest": "Neueste zuerst",
      "sortOldest": "Alteste zuerst",
      "sortNameAZ": "Name (A-Z)",
      "sortNameZA": "Name (Z-A)"
    },
    "card": {
      "edit": "Bearbeiten",
      "viewDetails": "Details anzeigen",
      "noContent": "Noch kein Inhalt",
      "contentPieces": "{count} Inhaltselemente",
      "lastUpdated": "Zuletzt aktualisiert {date}"
    },
    "page": {
      "title": "Anleitungen",
      "subtitle": "Verwalten Sie Anleitungsartikel fur Ihre Artikel",
      "createFirst": "Erstellen Sie Ihren ersten Artikel",
      "learnMore": "Mehr erfahren",
      "loading": "Anleitungen werden geladen...",
      "authRequired": "Authentifizierung erforderlich",
      "authMessage": "Bitte melden Sie sich an, um auf Anleitungen zuzugreifen.",
      "goToLogin": "Zur Anmeldung",
      "retry": "Erneut versuchen",
      "errorTitle": "Fehler beim Laden der Anleitungen",
      "errorMessage": "Anleitungen konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
      "successMessage": "Anleitung erfolgreich aktualisiert",
      "deleteSuccess": "Anleitung erfolgreich geloscht"
    },
    "empty": {
      "title": "Noch keine Anleitungen",
      "description": "Erstellen Sie Artikel und fugen Sie Anleitungen hinzu. Anleitungen helfen Gasten zu verstehen, wie sie die Artikel in Ihrem Objekt nutzen konnen.",
      "action": "Erste Anleitung erstellen"
    },
    "states": {
      "draft": "Entwurf",
      "published": "Veroffentlicht",
      "archived": "Archiviert",
      "scheduled": "Geplant",
      "pending": "Uberprufung ausstehend"
    },
    "actions": {
      "create": "Anleitung erstellen",
      "edit": "Anleitung bearbeiten",
      "delete": "Anleitung loschen",
      "publish": "Veroffentlichen",
      "unpublish": "Veroffentlichung aufheben",
      "archive": "Archivieren",
      "restore": "Wiederherstellen",
      "duplicate": "Duplizieren",
      "preview": "Vorschau",
      "save": "Anleitung speichern",
      "saveAndPublish": "Speichern und veroffentlichen",
      "discardChanges": "Anderungen verwerfen"
    },
    "confirmations": {
      "delete": {
        "title": "Anleitung loschen",
        "message": "Sind Sie sicher, dass Sie diese Anleitung loschen mochten? Diese Aktion kann nicht ruckgangig gemacht werden.",
        "confirm": "Loschen",
        "cancel": "Abbrechen"
      },
      "discard": {
        "title": "Anderungen verwerfen",
        "message": "Sie haben nicht gespeicherte Anderungen. Sind Sie sicher, dass Sie diese verwerfen mochten?",
        "confirm": "Verwerfen",
        "cancel": "Weiter bearbeiten"
      },
      "archive": {
        "title": "Anleitung archivieren",
        "message": "Diese Anleitung wird archiviert und ist fur Gaste nicht mehr sichtbar. Sie konnen sie spater wiederherstellen.",
        "confirm": "Archivieren",
        "cancel": "Abbrechen"
      },
      "publish": {
        "title": "Anleitung veroffentlichen",
        "message": "Diese Anleitung wird fur alle Gaste sichtbar sein. Sind Sie bereit zu veroffentlichen?",
        "confirm": "Veroffentlichen",
        "cancel": "Abbrechen"
      }
    },
    "errors": {
      "loadFailed": "Artikel konnten nicht geladen werden",
      "saveFailed": "Artikel konnte nicht gespeichert werden",
      "deleteFailed": "Artikel konnte nicht geloscht werden",
      "notFound": "Artikel nicht gefunden",
      "publishFailed": "Artikel konnte nicht veroffentlicht werden",
      "uploadFailed": "Medien-Upload fehlgeschlagen",
      "processingFailed": "Medienverarbeitung fehlgeschlagen",
      "permissionDenied": "Sie haben keine Berechtigung, diesen Artikel zu bearbeiten"
    },
    "loading": {
      "fetching": "Artikel werden abgerufen...",
      "saving": "Wird gespeichert...",
      "deleting": "Wird geloscht...",
      "uploading": "Medien werden hochgeladen...",
      "processing": "Wird verarbeitet...",
      "publishing": "Wird veroffentlicht..."
    },
    "validation": {
      "titleRequired": "Artikeltitel ist erforderlich",
      "titleTooLong": "Der Titel muss weniger als {max} Zeichen haben",
      "contentRequired": "Artikelinhalt ist erforderlich",
      "maxLength": "Der Inhalt uberschreitet die maximale Zeichenzahl. Bitte kurzen Sie Ihren Text.",
      "invalidMediaType": "Ungultiger Medientyp. Bitte laden Sie ein unterstutztes Format hoch.",
      "mediaTooLarge": "Die Mediendatei ist zu gross. Maximale Grosse: {max}MB."
    }
  }
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/de.json')"
   ```

#### 4.3 Verification Checklist
- [ ] JSON syntax is valid
- [ ] All keys match English source structure exactly
- [ ] Variable placeholders preserved
- [ ] German translations use formal "Sie" form consistently

---

### Task 5: Add Articles Namespace to Dutch Message File

**File:** `/messages/nl.json`
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 5.1 Objective
Add the `articles` namespace with Dutch translations.

#### 5.2 Implementation Steps

1. **Open** `/messages/nl.json`

2. **Add** the following `articles` namespace:

```json
,
  "articles": {
    "title": "Instructies",
    "subtitle": "Beheer inhoud en instructies",
    "editor": {
      "title": "Inhoud bewerken",
      "preview": "Voorbeeld",
      "edit": "Bewerken",
      "formatting": {
        "bold": "Vet",
        "italic": "Cursief",
        "heading": "Kop",
        "list": "Lijst",
        "link": "Link",
        "image": "Afbeelding",
        "quote": "Citaat",
        "code": "Code",
        "divider": "Scheidingslijn"
      },
      "placeholder": "Schrijf hier uw instructies...",
      "characterCount": "{count} tekens",
      "wordCount": "{count} woorden",
      "autoSaved": "Automatisch opgeslagen",
      "unsavedChanges": "Niet-opgeslagen wijzigingen"
    },
    "media": {
      "upload": "Media uploaden",
      "dragDrop": "Sleep bestanden hierheen",
      "or": "of",
      "browse": "Bestanden bladeren",
      "supportedFormats": "Ondersteunde formaten: {formats}",
      "maxSize": "Maximale bestandsgrootte: {size}MB",
      "uploading": "Uploaden...",
      "uploadComplete": "Upload voltooid",
      "uploadFailed": "Upload mislukt",
      "processing": "Media verwerken...",
      "remove": "Media verwijderen",
      "replace": "Media vervangen",
      "preview": "Mediavoorbeeld"
    },
    "crop": {
      "title": "Afbeelding bijsnijden",
      "aspectRatio": "Beeldverhouding",
      "freeform": "Vrij",
      "square": "Vierkant (1:1)",
      "landscape": "Liggend (16:9)",
      "portrait": "Staand (9:16)",
      "widescreen": "Breedbeeld (4:3)",
      "apply": "Bijsnijden toepassen",
      "reset": "Herstellen",
      "cancel": "Annuleren",
      "rotate": "Draaien",
      "flip": "Spiegelen",
      "zoom": "Zoom"
    },
    "video": {
      "title": "Video inkorten",
      "startTime": "Starttijd",
      "endTime": "Eindtijd",
      "duration": "Duur: {duration}",
      "apply": "Inkorten toepassen",
      "reset": "Herstellen",
      "play": "Afspelen",
      "pause": "Pauze",
      "mute": "Dempen",
      "unmute": "Geluid aan",
      "fullscreen": "Volledig scherm",
      "processing": "Video verwerken...",
      "thumbnail": "Miniatuur instellen"
    },
    "purposes": {
      "howToUse": "Gebruiksaanwijzing",
      "troubleshooting": "Probleemoplossing",
      "maintenance": "Onderhoud",
      "safety": "Veiligheidsinformatie",
      "warranty": "Garantie en ondersteuning",
      "specifications": "Specificaties",
      "setup": "Installatiehandleiding",
      "cleaning": "Schoonmaakinstructies",
      "other": "Overig"
    },
    "list": {
      "title": "Titel",
      "item": "Item",
      "room": "Kamer",
      "property": "Accommodatie",
      "purpose": "Doel",
      "created": "Aangemaakt",
      "updated": "Bijgewerkt",
      "actions": "Acties",
      "status": "Status",
      "empty": "Geen handleidingen beschikbaar",
      "noResults": "Geen handleidingen komen overeen met uw filters",
      "searchPlaceholder": "Handleidingen zoeken..."
    },
    "toolbar": {
      "search": "Handleidingen zoeken...",
      "filter": "Filteren",
      "clearFilters": "Filters wissen",
      "viewGrid": "Rasterweergave",
      "viewList": "Lijstweergave",
      "showing": "Toont {count} van {total} handleidingen",
      "sortBy": "Sorteren op",
      "sortNewest": "Nieuwste eerst",
      "sortOldest": "Oudste eerst",
      "sortNameAZ": "Naam (A-Z)",
      "sortNameZA": "Naam (Z-A)"
    },
    "card": {
      "edit": "Bewerken",
      "viewDetails": "Details bekijken",
      "noContent": "Nog geen inhoud",
      "contentPieces": "{count} inhoudselementen",
      "lastUpdated": "Laatst bijgewerkt {date}"
    },
    "page": {
      "title": "Handleidingen",
      "subtitle": "Beheer handleidingsartikelen voor uw items",
      "createFirst": "Maak uw eerste item aan",
      "learnMore": "Meer informatie",
      "loading": "Handleidingen laden...",
      "authRequired": "Authenticatie vereist",
      "authMessage": "Log in om toegang te krijgen tot handleidingen.",
      "goToLogin": "Naar inloggen",
      "retry": "Opnieuw proberen",
      "errorTitle": "Fout bij laden van handleidingen",
      "errorMessage": "Kan handleidingen niet laden. Probeer het opnieuw.",
      "successMessage": "Handleiding succesvol bijgewerkt",
      "deleteSuccess": "Handleiding succesvol verwijderd"
    },
    "empty": {
      "title": "Nog geen handleidingen",
      "description": "Maak items aan en voeg handleidingsartikelen toe om te beginnen. Handleidingen helpen gasten te begrijpen hoe ze items in uw accommodatie kunnen gebruiken.",
      "action": "Eerste handleiding maken"
    },
    "states": {
      "draft": "Concept",
      "published": "Gepubliceerd",
      "archived": "Gearchiveerd",
      "scheduled": "Gepland",
      "pending": "In afwachting van beoordeling"
    },
    "actions": {
      "create": "Handleiding maken",
      "edit": "Handleiding bewerken",
      "delete": "Handleiding verwijderen",
      "publish": "Publiceren",
      "unpublish": "Publicatie ongedaan maken",
      "archive": "Archiveren",
      "restore": "Herstellen",
      "duplicate": "Dupliceren",
      "preview": "Voorbeeld",
      "save": "Handleiding opslaan",
      "saveAndPublish": "Opslaan en publiceren",
      "discardChanges": "Wijzigingen verwerpen"
    },
    "confirmations": {
      "delete": {
        "title": "Handleiding verwijderen",
        "message": "Weet u zeker dat u deze handleiding wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
        "confirm": "Verwijderen",
        "cancel": "Annuleren"
      },
      "discard": {
        "title": "Wijzigingen verwerpen",
        "message": "U heeft niet-opgeslagen wijzigingen. Weet u zeker dat u deze wilt verwerpen?",
        "confirm": "Verwerpen",
        "cancel": "Doorgaan met bewerken"
      },
      "archive": {
        "title": "Handleiding archiveren",
        "message": "Deze handleiding wordt gearchiveerd en is niet langer zichtbaar voor gasten. U kunt deze later herstellen.",
        "confirm": "Archiveren",
        "cancel": "Annuleren"
      },
      "publish": {
        "title": "Handleiding publiceren",
        "message": "Deze handleiding wordt zichtbaar voor alle gasten. Bent u klaar om te publiceren?",
        "confirm": "Publiceren",
        "cancel": "Annuleren"
      }
    },
    "errors": {
      "loadFailed": "Kan artikelen niet laden",
      "saveFailed": "Kan artikel niet opslaan",
      "deleteFailed": "Kan artikel niet verwijderen",
      "notFound": "Artikel niet gevonden",
      "publishFailed": "Kan artikel niet publiceren",
      "uploadFailed": "Media-upload mislukt",
      "processingFailed": "Mediaverwerking mislukt",
      "permissionDenied": "U heeft geen toestemming om dit artikel te bewerken"
    },
    "loading": {
      "fetching": "Artikelen ophalen...",
      "saving": "Opslaan...",
      "deleting": "Verwijderen...",
      "uploading": "Media uploaden...",
      "processing": "Verwerken...",
      "publishing": "Publiceren..."
    },
    "validation": {
      "titleRequired": "Artikeltitel is vereist",
      "titleTooLong": "Titel moet minder dan {max} tekens bevatten",
      "contentRequired": "Artikelinhoud is vereist",
      "maxLength": "Inhoud overschrijdt de maximale tekenlimiet. Kort uw tekst in.",
      "invalidMediaType": "Ongeldig mediatype. Upload een ondersteund formaat.",
      "mediaTooLarge": "Mediabestand is te groot. Maximale grootte: {max}MB."
    }
  }
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/nl.json')"
   ```

#### 5.3 Verification Checklist
- [ ] JSON syntax is valid
- [ ] All keys match English source structure exactly
- [ ] Variable placeholders preserved
- [ ] Dutch translations use formal "u" form consistently

---

### Task 6: Add Articles Namespace to Italian Message File

**File:** `/messages/it.json`
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 6.1 Objective
Add the `articles` namespace with Italian translations.

#### 6.2 Implementation Steps

1. **Open** `/messages/it.json`

2. **Add** the following `articles` namespace:

```json
,
  "articles": {
    "title": "Istruzioni",
    "subtitle": "Gestisci contenuti e istruzioni",
    "editor": {
      "title": "Modifica contenuto",
      "preview": "Anteprima",
      "edit": "Modifica",
      "formatting": {
        "bold": "Grassetto",
        "italic": "Corsivo",
        "heading": "Intestazione",
        "list": "Elenco",
        "link": "Link",
        "image": "Immagine",
        "quote": "Citazione",
        "code": "Codice",
        "divider": "Separatore"
      },
      "placeholder": "Scrivi qui le tue istruzioni...",
      "characterCount": "{count} caratteri",
      "wordCount": "{count} parole",
      "autoSaved": "Salvato automaticamente",
      "unsavedChanges": "Modifiche non salvate"
    },
    "media": {
      "upload": "Carica media",
      "dragDrop": "Trascina e rilascia i file qui",
      "or": "o",
      "browse": "Sfoglia file",
      "supportedFormats": "Formati supportati: {formats}",
      "maxSize": "Dimensione massima del file: {size}MB",
      "uploading": "Caricamento in corso...",
      "uploadComplete": "Caricamento completato",
      "uploadFailed": "Caricamento fallito",
      "processing": "Elaborazione media...",
      "remove": "Rimuovi media",
      "replace": "Sostituisci media",
      "preview": "Anteprima media"
    },
    "crop": {
      "title": "Ritaglia immagine",
      "aspectRatio": "Proporzioni",
      "freeform": "Libero",
      "square": "Quadrato (1:1)",
      "landscape": "Orizzontale (16:9)",
      "portrait": "Verticale (9:16)",
      "widescreen": "Panoramico (4:3)",
      "apply": "Applica ritaglio",
      "reset": "Reimposta",
      "cancel": "Annulla",
      "rotate": "Ruota",
      "flip": "Capovolgi",
      "zoom": "Zoom"
    },
    "video": {
      "title": "Taglia video",
      "startTime": "Tempo di inizio",
      "endTime": "Tempo di fine",
      "duration": "Durata: {duration}",
      "apply": "Applica taglio",
      "reset": "Reimposta",
      "play": "Riproduci",
      "pause": "Pausa",
      "mute": "Silenzia",
      "unmute": "Attiva audio",
      "fullscreen": "Schermo intero",
      "processing": "Elaborazione video...",
      "thumbnail": "Imposta miniatura"
    },
    "purposes": {
      "howToUse": "Come usare",
      "troubleshooting": "Risoluzione problemi",
      "maintenance": "Manutenzione",
      "safety": "Informazioni di sicurezza",
      "warranty": "Garanzia e supporto",
      "specifications": "Specifiche",
      "setup": "Guida all'installazione",
      "cleaning": "Istruzioni per la pulizia",
      "other": "Altro"
    },
    "list": {
      "title": "Titolo",
      "item": "Articolo",
      "room": "Stanza",
      "property": "Proprieta",
      "purpose": "Scopo",
      "created": "Creato",
      "updated": "Aggiornato",
      "actions": "Azioni",
      "status": "Stato",
      "empty": "Nessuna guida disponibile",
      "noResults": "Nessuna guida corrisponde ai tuoi filtri",
      "searchPlaceholder": "Cerca guide..."
    },
    "toolbar": {
      "search": "Cerca guide...",
      "filter": "Filtra",
      "clearFilters": "Cancella filtri",
      "viewGrid": "Vista griglia",
      "viewList": "Vista elenco",
      "showing": "Mostrando {count} di {total} guide",
      "sortBy": "Ordina per",
      "sortNewest": "Piu recenti prima",
      "sortOldest": "Piu vecchi prima",
      "sortNameAZ": "Nome (A-Z)",
      "sortNameZA": "Nome (Z-A)"
    },
    "card": {
      "edit": "Modifica",
      "viewDetails": "Visualizza dettagli",
      "noContent": "Nessun contenuto ancora",
      "contentPieces": "{count} elementi di contenuto",
      "lastUpdated": "Ultimo aggiornamento {date}"
    },
    "page": {
      "title": "Guide",
      "subtitle": "Gestisci articoli guida per i tuoi articoli",
      "createFirst": "Crea il tuo primo articolo",
      "learnMore": "Scopri di piu",
      "loading": "Caricamento guide...",
      "authRequired": "Autenticazione richiesta",
      "authMessage": "Accedi per accedere alle guide.",
      "goToLogin": "Vai al login",
      "retry": "Riprova",
      "errorTitle": "Errore nel caricamento delle guide",
      "errorMessage": "Impossibile caricare le guide. Riprova.",
      "successMessage": "Guida aggiornata con successo",
      "deleteSuccess": "Guida eliminata con successo"
    },
    "empty": {
      "title": "Ancora nessuna guida",
      "description": "Crea articoli e aggiungi guide per iniziare. Le guide aiutano gli ospiti a capire come usare gli articoli nella tua proprieta.",
      "action": "Crea prima guida"
    },
    "states": {
      "draft": "Bozza",
      "published": "Pubblicato",
      "archived": "Archiviato",
      "scheduled": "Programmato",
      "pending": "In attesa di revisione"
    },
    "actions": {
      "create": "Crea guida",
      "edit": "Modifica guida",
      "delete": "Elimina guida",
      "publish": "Pubblica",
      "unpublish": "Rimuovi pubblicazione",
      "archive": "Archivia",
      "restore": "Ripristina",
      "duplicate": "Duplica",
      "preview": "Anteprima",
      "save": "Salva guida",
      "saveAndPublish": "Salva e pubblica",
      "discardChanges": "Scarta modifiche"
    },
    "confirmations": {
      "delete": {
        "title": "Elimina guida",
        "message": "Sei sicuro di voler eliminare questa guida? Questa azione non puo essere annullata.",
        "confirm": "Elimina",
        "cancel": "Annulla"
      },
      "discard": {
        "title": "Scarta modifiche",
        "message": "Hai modifiche non salvate. Sei sicuro di volerle scartare?",
        "confirm": "Scarta",
        "cancel": "Continua a modificare"
      },
      "archive": {
        "title": "Archivia guida",
        "message": "Questa guida sara archiviata e non sara piu visibile agli ospiti. Potrai ripristinarla in seguito.",
        "confirm": "Archivia",
        "cancel": "Annulla"
      },
      "publish": {
        "title": "Pubblica guida",
        "message": "Questa guida sara visibile a tutti gli ospiti. Sei pronto a pubblicare?",
        "confirm": "Pubblica",
        "cancel": "Annulla"
      }
    },
    "errors": {
      "loadFailed": "Impossibile caricare gli articoli",
      "saveFailed": "Impossibile salvare l'articolo",
      "deleteFailed": "Impossibile eliminare l'articolo",
      "notFound": "Articolo non trovato",
      "publishFailed": "Impossibile pubblicare l'articolo",
      "uploadFailed": "Caricamento media fallito",
      "processingFailed": "Elaborazione media fallita",
      "permissionDenied": "Non hai il permesso di modificare questo articolo"
    },
    "loading": {
      "fetching": "Recupero articoli...",
      "saving": "Salvataggio...",
      "deleting": "Eliminazione...",
      "uploading": "Caricamento media...",
      "processing": "Elaborazione...",
      "publishing": "Pubblicazione..."
    },
    "validation": {
      "titleRequired": "Il titolo dell'articolo e obbligatorio",
      "titleTooLong": "Il titolo deve essere inferiore a {max} caratteri",
      "contentRequired": "Il contenuto dell'articolo e obbligatorio",
      "maxLength": "Il contenuto supera il limite massimo di caratteri. Accorcia il tuo testo.",
      "invalidMediaType": "Tipo di media non valido. Carica un formato supportato.",
      "mediaTooLarge": "Il file media e troppo grande. Dimensione massima: {max}MB."
    }
  }
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/it.json')"
   ```

#### 6.3 Verification Checklist
- [ ] JSON syntax is valid
- [ ] All keys match English source structure exactly
- [ ] Variable placeholders preserved
- [ ] Italian translations are grammatically correct

---

### Task 7: Final Validation and Build Verification

**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 7.1 Objective
Verify all six message files have consistent structure and the application builds successfully.

#### 7.2 Implementation Steps

1. **Validate all JSON files:**
   ```bash
   node -e "require('./messages/en.json')"
   node -e "require('./messages/fr.json')"
   node -e "require('./messages/es.json')"
   node -e "require('./messages/de.json')"
   node -e "require('./messages/nl.json')"
   node -e "require('./messages/it.json')"
   ```

2. **Verify key structure consistency:**
   Create a temporary script or manually verify that the `articles` namespace has identical key paths across all files.

3. **Run build:**
   ```bash
   npm run build
   ```

4. **Start development server and verify:**
   ```bash
   npm run dev
   ```
   Navigate to any page and verify no translation errors appear in console.

#### 7.3 Verification Checklist
- [ ] All 6 JSON files pass syntax validation
- [ ] All 6 files have identical `articles` namespace structure
- [ ] Build completes without errors
- [ ] Development server starts successfully
- [ ] No translation-related warnings in console

---

## Acceptance Criteria Verification

| Criteria | Task | Status |
|----------|------|--------|
| Articles namespace exists in all six message files | Tasks 1-6 | [ ] |
| Includes keys for article titles, descriptions, metadata labels | Task 1 (editor, list, page sections) | [ ] |
| Includes article list view labels (column headers, filters, sorting) | Task 1 (list, toolbar sections) | [ ] |
| Includes article creation/editing form labels and placeholders | Task 1 (editor, media, crop, video sections) | [ ] |
| Includes article state indicators (draft, published, archived, scheduled) | Task 1 (states section) | [ ] |
| Includes article action labels (create, edit, delete, publish, archive, duplicate) | Task 1 (actions section) | [ ] |
| Includes empty state messages | Task 1 (empty section) | [ ] |
| Includes loading state messages | Task 1 (loading section) | [ ] |
| Includes error messages specific to article operations | Task 1 (errors section) | [ ] |
| English translations complete as source | Task 1 | [ ] |
| Namespace structure consistent across all files | Task 7 | [ ] |
| Keys follow established naming conventions | All tasks | [ ] |

---

## Technical Notes

### Variable Interpolation Usage

The following keys use variable interpolation that must be preserved exactly in all translations:

| Key | Variables | Example Usage |
|-----|-----------|---------------|
| `articles.editor.characterCount` | `{count}` | `t('editor.characterCount', { count: 150 })` |
| `articles.editor.wordCount` | `{count}` | `t('editor.wordCount', { count: 25 })` |
| `articles.media.supportedFormats` | `{formats}` | `t('media.supportedFormats', { formats: 'JPG, PNG, GIF' })` |
| `articles.media.maxSize` | `{size}` | `t('media.maxSize', { size: 10 })` |
| `articles.video.duration` | `{duration}` | `t('video.duration', { duration: '2:30' })` |
| `articles.toolbar.showing` | `{count}`, `{total}` | `t('toolbar.showing', { count: 5, total: 20 })` |
| `articles.card.contentPieces` | `{count}` | `t('card.contentPieces', { count: 3 })` |
| `articles.card.lastUpdated` | `{date}` | `t('card.lastUpdated', { date: '2 hours ago' })` |
| `articles.validation.titleTooLong` | `{max}` | `t('validation.titleTooLong', { max: 100 })` |
| `articles.validation.mediaTooLarge` | `{max}` | `t('validation.mediaTooLarge', { max: 50 })` |

### Component Usage Reference

After this namespace is created, components will consume translations like this:

```typescript
// Client component example
import { useTranslations } from 'next-intl';

function ArticleEditor() {
  const t = useTranslations('articles');

  return (
    <div>
      <h1>{t('editor.title')}</h1>
      <textarea placeholder={t('editor.placeholder')} />
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

```typescript
// Server component example
import { getTranslations } from 'next-intl/server';

async function ArticlesPage() {
  const t = await getTranslations('articles');

  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.subtitle')}</p>
    </div>
  );
}
```

---

## Dependencies

### This Task Requires
- Epic 1 complete (next-intl installed)
- All six message files exist

### Tasks That Depend on This
- REQ-393: Update MarkdownEditor component
- REQ-394: Update ImageCropper component
- REQ-395: Update VideoTrimmer component
- REQ-396: Update InstructionsTable components
- REQ-397: Update Instructions pages

---

## Rollback Plan

If issues arise, the `articles` namespace can be removed from each message file by:
1. Opening each `/messages/*.json` file
2. Removing the entire `"articles": { ... }` block
3. Removing the preceding comma
4. Re-validating JSON syntax

---

## References

- [Overview Document](./REQ-392-create-articles-namespace-structure-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management*
