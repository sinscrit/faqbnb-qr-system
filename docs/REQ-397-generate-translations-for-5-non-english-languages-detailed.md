# REQ-397: Generate Translations for Article and Content Management (5 Non-English Languages) - Detailed Task Breakdown

**Generated:** 2026-01-19 23:59:00 UTC
**Last Modified:** 2026-01-19 23:59:00 UTC

## Document References

- **Request ID:** REQ-397
- **Overview Document:** docs/REQ-397-generate-translations-for-5-non-english-languages-overview.md
- **Requirements:** docs/gen_requests_epic2.md (Request #397)
- **Implementation Plan:** docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md
- **Epic:** 2 - Static UI Translation
- **Sub-Epic:** 2E - Article & Content Management
- **Task ID:** 2E.6
- **Size:** L (Large)
- **Priority:** Final task of Sub-Epic 2E

---

## Executive Summary

This task completes Sub-Epic 2E by generating translations for all Article & Content Management namespace strings from English to 5 target languages: German (de), Spanish (es), French (fr), Italian (it), and Dutch (nl). The source English strings are defined in `/messages/en.json` under the `articles` namespace (approximately 91+ keys). Each translation must maintain semantic accuracy within content management and media editing domain terminology, apply correct ICU pluralization rules, and preserve variable interpolation patterns.

**Total Translation Entries:** ~91 keys × 5 languages = **~455 translation entries**

---

## Prerequisites

| Prerequisite | Description | Status | Verification |
|--------------|-------------|--------|--------------|
| REQ-392 (2E.1) | Articles namespace structure created in en.json | **REQUIRED** | Verify `articles.*` nested structure exists in `/messages/en.json` |
| REQ-393 (2E.2) | Editor components updated | **REQUIRED** | Components use `articles.editor.*` translation keys |
| REQ-394 (2E.3) | Media handling components updated | **REQUIRED** | Components use `articles.media.*` translation keys |
| REQ-395 (2E.4) | Crop/trim utilities updated | **REQUIRED** | Components use `articles.crop.*` and `articles.video.*` keys |
| REQ-396 (2E.5) | Instructions pages updated | **REQUIRED** | Pages use `articles.list.*`, `articles.toolbar.*`, etc. |
| Epic 1 Foundation | next-intl installed and configured | ✅ Complete | Package installed, i18n config exists |

---

## Source Translation File Analysis

### Articles Namespace Structure (en.json)

The source of truth is `/messages/en.json` with the comprehensive nested `articles` namespace structure. Based on REQ-392 and the overview document, the structure includes:

| Sub-namespace | Key Count | Translation Complexity |
|---------------|-----------|------------------------|
| `articles.title` / `articles.subtitle` | 2 | Simple strings |
| `articles.editor.*` | 10 | Technical terminology (formatting) |
| `articles.media.*` | 6 | Contains interpolation |
| `articles.crop.*` | 8 | Domain-specific terminology |
| `articles.video.*` | 5 | Contains interpolation |
| `articles.purposes.*` | 6 | Domain-specific categories |
| `articles.list.*` | 9 | Table column headers |
| `articles.toolbar.*` | 6 | Contains interpolation |
| `articles.card.*` | 3 | Simple strings |
| `articles.page.*` | 12 | Mixed complexity |
| `articles.empty.*` | 2 | Contextual messaging |
| `articles.states.*` | 4 | Status labels |
| `articles.actions.*` | 7 | Action button labels |
| `articles.errors.*` | 4 | Error messaging |
| `articles.loading.*` | 4 | Status messages |
| `articles.validation.*` | 3 | Contains interpolation |
| **Total** | **~91** | Mixed complexity |

---

## Task Breakdown

### Task 1: Verify Prerequisites and Extract Source Keys
**Estimated Time:** 15 minutes
**Story Points:** 0.5

#### Description
Verify all prerequisite tasks are complete and extract the complete list of `articles.*` keys from `/messages/en.json` as the definitive translation source.

#### Steps
1. Read `/messages/en.json` and verify complete `articles` namespace structure exists
2. Extract all `articles.*` keys into a checklist format
3. Identify keys with special patterns:
   - ICU pluralization (contains `{count, plural, ...}`)
   - Variable interpolation (contains `{formats}`, `{size}`, `{duration}`, etc.)
   - Simple strings (no special syntax)
4. Document the complete key inventory

#### Key Categories to Verify

**Simple Strings (no special syntax):**
- `articles.title`, `articles.subtitle`
- `articles.editor.title`, `articles.editor.preview`, `articles.editor.edit`
- `articles.editor.formatting.*` (bold, italic, heading, list, link, image)
- `articles.editor.placeholder`
- `articles.crop.title`, `articles.crop.aspectRatio`, `articles.crop.freeform`, etc.
- `articles.video.title`, `articles.video.startTime`, `articles.video.endTime`
- `articles.purposes.*` (all purpose category names)
- `articles.list.*` (column headers)
- `articles.states.*` (status labels)
- `articles.actions.*` (action buttons)

**Variable Interpolation Patterns:**
```
articles.media.supportedFormats: "Supported formats: {formats}"
articles.media.maxSize: "Maximum file size: {size}MB"
articles.video.duration: "Duration: {duration}"
articles.toolbar.showing: "Showing {count} of {total} guides"
articles.validation.maxLength: "Maximum {max} characters allowed"
```

#### Verification Checklist
- [ ] `/messages/en.json` contains complete nested `articles` namespace
- [ ] All ~91 keys are present and documented
- [ ] Variable placeholders are identified and documented
- [ ] Key structure matches expected format from REQ-392

---

### Task 2: Translate Articles Namespace to German (de)
**Estimated Time:** 50 minutes
**Story Points:** 1.5

#### Description
Generate complete German translations for all `articles.*` keys in `/messages/de.json`, applying correct German grammar, formal "Sie" form, and content management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Formality | Use formal "Sie" form consistently |
| Pluralization | Two forms: one (1), other (0, 2+) |
| Compound Words | Follow German conventions (e.g., "Seitenverhältnis", "Videotrimmer") |
| Technical Terms | Keep "Markdown" as-is (industry standard) |
| Media Terms | Use established German terms (Hochladen, Herunterladen) |

#### Glossary Reference

| English | German | Notes |
|---------|--------|-------|
| Instructions | Anleitungen | Feminine plural |
| Guide | Anleitung | Feminine |
| Article | Artikel | Masculine |
| Content | Inhalt | Masculine |
| Editor | Editor | Masculine (loan word) |
| Media | Medien | Neutral plural |
| Upload | Hochladen | Verb infinitive |
| Crop | Zuschneiden | Verb infinitive |
| Trim | Schneiden | Verb infinitive |
| Aspect Ratio | Seitenverhältnis | Neutral |
| Duration | Dauer | Feminine |
| Draft | Entwurf | Masculine |
| Published | Veröffentlicht | Past participle |
| Archived | Archiviert | Past participle |
| Freeform | Freiform | Feminine |
| Square | Quadratisch | Adjective |
| Landscape | Querformat | Neutral |
| Portrait | Hochformat | Neutral |

#### Steps
1. Read current `/messages/de.json`
2. Replace/update entire `articles` namespace with German translations
3. Apply nested structure matching en.json exactly
4. Translate all simple strings
5. Adapt variable interpolation for German word order
6. Preserve all variable placeholders exactly (`{formats}`, `{size}`, etc.)
7. Validate JSON syntax

#### Complete Translation Template

```json
{
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
        "heading": "Überschrift",
        "list": "Liste",
        "link": "Link",
        "image": "Bild"
      },
      "placeholder": "Schreiben Sie hier Ihre Anleitungen..."
    },

    "media": {
      "upload": "Medien hochladen",
      "dragDrop": "Dateien hierher ziehen und ablegen",
      "or": "oder",
      "browse": "Dateien durchsuchen",
      "supportedFormats": "Unterstützte Formate: {formats}",
      "maxSize": "Maximale Dateigröße: {size}MB"
    },

    "crop": {
      "title": "Bild zuschneiden",
      "aspectRatio": "Seitenverhältnis",
      "freeform": "Freiform",
      "square": "Quadrat",
      "landscape": "Querformat",
      "portrait": "Hochformat",
      "apply": "Zuschnitt anwenden",
      "reset": "Zurücksetzen"
    },

    "video": {
      "title": "Video schneiden",
      "startTime": "Startzeit",
      "endTime": "Endzeit",
      "duration": "Dauer: {duration}",
      "apply": "Schnitt anwenden"
    },

    "purposes": {
      "howToUse": "Bedienung",
      "troubleshooting": "Fehlerbehebung",
      "maintenance": "Wartung",
      "safety": "Sicherheitshinweise",
      "warranty": "Garantie & Support",
      "other": "Sonstiges"
    },

    "list": {
      "title": "Titel",
      "item": "Artikel",
      "room": "Raum",
      "property": "Immobilie",
      "purpose": "Zweck",
      "created": "Erstellt",
      "actions": "Aktionen",
      "empty": "Keine Anleitungen verfügbar",
      "noResults": "Keine Ergebnisse gefunden"
    },

    "toolbar": {
      "search": "Suchen",
      "filter": "Filtern",
      "clearFilters": "Filter löschen",
      "viewGrid": "Rasteransicht",
      "viewList": "Listenansicht",
      "showing": "Zeigt {count} von {total} Anleitungen"
    },

    "card": {
      "edit": "Bearbeiten",
      "viewDetails": "Details anzeigen",
      "noContent": "Noch kein Inhalt"
    },

    "page": {
      "title": "Anleitungen",
      "subtitle": "Anleitungen für Ihre Artikel verwalten",
      "createFirst": "Erstellen Sie Ihre erste Anleitung",
      "learnMore": "Mehr erfahren",
      "loading": "Lädt...",
      "authRequired": "Anmeldung erforderlich",
      "authMessage": "Bitte melden Sie sich an, um fortzufahren",
      "goToLogin": "Zur Anmeldung",
      "retry": "Erneut versuchen",
      "errorTitle": "Etwas ist schiefgelaufen",
      "successMessage": "Erfolgreich gespeichert"
    },

    "empty": {
      "title": "Noch keine Anleitungen",
      "description": "Erstellen Sie Ihre erste Anleitung, um zu beginnen"
    },

    "states": {
      "draft": "Entwurf",
      "published": "Veröffentlicht",
      "archived": "Archiviert",
      "scheduled": "Geplant"
    },

    "actions": {
      "create": "Erstellen",
      "edit": "Bearbeiten",
      "delete": "Löschen",
      "publish": "Veröffentlichen",
      "archive": "Archivieren",
      "duplicate": "Duplizieren",
      "preview": "Vorschau"
    },

    "errors": {
      "loadFailed": "Laden fehlgeschlagen",
      "saveFailed": "Speichern fehlgeschlagen",
      "deleteFailed": "Löschen fehlgeschlagen",
      "notFound": "Nicht gefunden"
    },

    "loading": {
      "fetching": "Wird geladen...",
      "saving": "Wird gespeichert...",
      "deleting": "Wird gelöscht...",
      "uploading": "Wird hochgeladen..."
    },

    "validation": {
      "titleRequired": "Titel ist erforderlich",
      "contentRequired": "Mindestens ein Inhalt ist erforderlich",
      "maxLength": "Maximal {max} Zeichen erlaubt"
    }
  }
}
```

#### File to Modify
`/messages/de.json`

#### Verification Checklist
- [ ] All ~91 keys present in `articles` namespace
- [ ] Structure matches en.json exactly
- [ ] Variable placeholders preserved exactly
- [ ] Formal "Sie" form used consistently
- [ ] Technical terms appropriately handled (Markdown preserved)
- [ ] JSON syntax valid

---

### Task 3: Translate Articles Namespace to Spanish (es)
**Estimated Time:** 50 minutes
**Story Points:** 1.5

#### Description
Generate complete Spanish translations for all `articles.*` keys in `/messages/es.json`, using neutral/Latin American Spanish and content management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Variant | Neutral/Latin American Spanish |
| Pluralization | Two forms: one (1), other (0, 2+) |
| Technical Terms | Keep "Markdown" as-is |
| Gender Agreement | Maintain masculine/feminine consistency |
| Accents | Use proper accent marks (á, é, í, ó, ú, ñ) |

#### Glossary Reference

| English | Spanish | Notes |
|---------|---------|-------|
| Instructions | Instrucciones | Feminine plural |
| Guide | Guía | Feminine |
| Article | Artículo | Masculine |
| Content | Contenido | Masculine |
| Editor | Editor | Masculine |
| Media | Medios | Masculine plural |
| Upload | Subir | Verb infinitive |
| Crop | Recortar | Verb infinitive |
| Trim | Recortar | Verb infinitive (same as crop) |
| Aspect Ratio | Proporción | Feminine |
| Duration | Duración | Feminine |
| Draft | Borrador | Masculine |
| Published | Publicado | Past participle |
| Archived | Archivado | Past participle |

#### Steps
1. Read current `/messages/es.json`
2. Replace/update entire `articles` namespace with Spanish translations
3. Apply nested structure matching en.json exactly
4. Use neutral Spanish (avoid region-specific terms)
5. Preserve all variable placeholders exactly
6. Validate JSON syntax

#### Complete Translation Template

```json
{
  "articles": {
    "title": "Instrucciones",
    "subtitle": "Administrar contenido e instrucciones",

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
        "image": "Imagen"
      },
      "placeholder": "Escribe tus instrucciones aquí..."
    },

    "media": {
      "upload": "Subir medios",
      "dragDrop": "Arrastra y suelta archivos aquí",
      "or": "o",
      "browse": "Examinar archivos",
      "supportedFormats": "Formatos compatibles: {formats}",
      "maxSize": "Tamaño máximo de archivo: {size}MB"
    },

    "crop": {
      "title": "Recortar imagen",
      "aspectRatio": "Proporción",
      "freeform": "Libre",
      "square": "Cuadrado",
      "landscape": "Horizontal",
      "portrait": "Vertical",
      "apply": "Aplicar recorte",
      "reset": "Restablecer"
    },

    "video": {
      "title": "Recortar video",
      "startTime": "Tiempo de inicio",
      "endTime": "Tiempo de fin",
      "duration": "Duración: {duration}",
      "apply": "Aplicar recorte"
    },

    "purposes": {
      "howToUse": "Cómo usar",
      "troubleshooting": "Solución de problemas",
      "maintenance": "Mantenimiento",
      "safety": "Información de seguridad",
      "warranty": "Garantía y soporte",
      "other": "Otro"
    },

    "list": {
      "title": "Título",
      "item": "Artículo",
      "room": "Habitación",
      "property": "Propiedad",
      "purpose": "Propósito",
      "created": "Creado",
      "actions": "Acciones",
      "empty": "No hay guías disponibles",
      "noResults": "No se encontraron resultados"
    },

    "toolbar": {
      "search": "Buscar",
      "filter": "Filtrar",
      "clearFilters": "Limpiar filtros",
      "viewGrid": "Vista de cuadrícula",
      "viewList": "Vista de lista",
      "showing": "Mostrando {count} de {total} guías"
    },

    "card": {
      "edit": "Editar",
      "viewDetails": "Ver detalles",
      "noContent": "Sin contenido aún"
    },

    "page": {
      "title": "Instrucciones",
      "subtitle": "Administra las instrucciones de tus artículos",
      "createFirst": "Crea tu primera instrucción",
      "learnMore": "Más información",
      "loading": "Cargando...",
      "authRequired": "Inicio de sesión requerido",
      "authMessage": "Por favor inicia sesión para continuar",
      "goToLogin": "Ir a inicio de sesión",
      "retry": "Reintentar",
      "errorTitle": "Algo salió mal",
      "successMessage": "Guardado exitosamente"
    },

    "empty": {
      "title": "Aún no hay instrucciones",
      "description": "Crea tu primera instrucción para comenzar"
    },

    "states": {
      "draft": "Borrador",
      "published": "Publicado",
      "archived": "Archivado",
      "scheduled": "Programado"
    },

    "actions": {
      "create": "Crear",
      "edit": "Editar",
      "delete": "Eliminar",
      "publish": "Publicar",
      "archive": "Archivar",
      "duplicate": "Duplicar",
      "preview": "Vista previa"
    },

    "errors": {
      "loadFailed": "Error al cargar",
      "saveFailed": "Error al guardar",
      "deleteFailed": "Error al eliminar",
      "notFound": "No encontrado"
    },

    "loading": {
      "fetching": "Cargando...",
      "saving": "Guardando...",
      "deleting": "Eliminando...",
      "uploading": "Subiendo..."
    },

    "validation": {
      "titleRequired": "El título es obligatorio",
      "contentRequired": "Se requiere al menos un contenido",
      "maxLength": "Máximo {max} caracteres permitidos"
    }
  }
}
```

#### File to Modify
`/messages/es.json`

#### Verification Checklist
- [ ] All ~91 keys present in `articles` namespace
- [ ] Structure matches en.json exactly
- [ ] Variable placeholders preserved exactly
- [ ] Neutral Spanish terminology used
- [ ] Proper accent marks applied
- [ ] JSON syntax valid

---

### Task 4: Translate Articles Namespace to French (fr)
**Estimated Time:** 50 minutes
**Story Points:** 1.5

#### Description
Generate complete French translations for all `articles.*` keys in `/messages/fr.json`, using formal "vous" form and content management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Formality | Use formal "vous" form consistently |
| Pluralization | Two forms: one (0, 1), other (2+) - Note: French treats 0 and 1 as singular |
| Technical Terms | Keep "Markdown" as-is |
| Gender Agreement | Maintain masculine/feminine consistency |
| Accents | Use proper French accents (é, è, ê, à, ç, etc.) |

#### French Pluralization Note
French has a special rule where 0 and 1 are both considered singular. This affects ICU patterns.

#### Glossary Reference

| English | French | Notes |
|---------|--------|-------|
| Instructions | Instructions | Feminine plural |
| Guide | Guide | Masculine |
| Article | Article | Masculine |
| Content | Contenu | Masculine |
| Editor | Éditeur | Masculine |
| Media | Médias | Masculine plural |
| Upload | Télécharger | Verb infinitive |
| Crop | Rogner | Verb infinitive |
| Trim | Couper | Verb infinitive |
| Aspect Ratio | Format d'image | Masculine |
| Duration | Durée | Feminine |
| Draft | Brouillon | Masculine |
| Published | Publié | Past participle |
| Archived | Archivé | Past participle |

#### Steps
1. Read current `/messages/fr.json`
2. Replace/update entire `articles` namespace with French translations
3. Apply nested structure matching en.json exactly
4. Use formal "vous" form
5. Preserve all variable placeholders exactly
6. Validate JSON syntax

#### Complete Translation Template

```json
{
  "articles": {
    "title": "Instructions",
    "subtitle": "Gérer le contenu et les instructions",

    "editor": {
      "title": "Modifier le contenu",
      "preview": "Aperçu",
      "edit": "Modifier",
      "formatting": {
        "bold": "Gras",
        "italic": "Italique",
        "heading": "Titre",
        "list": "Liste",
        "link": "Lien",
        "image": "Image"
      },
      "placeholder": "Rédigez vos instructions ici..."
    },

    "media": {
      "upload": "Télécharger des médias",
      "dragDrop": "Glissez et déposez les fichiers ici",
      "or": "ou",
      "browse": "Parcourir les fichiers",
      "supportedFormats": "Formats pris en charge : {formats}",
      "maxSize": "Taille maximale du fichier : {size} Mo"
    },

    "crop": {
      "title": "Rogner l'image",
      "aspectRatio": "Format d'image",
      "freeform": "Libre",
      "square": "Carré",
      "landscape": "Paysage",
      "portrait": "Portrait",
      "apply": "Appliquer le rognage",
      "reset": "Réinitialiser"
    },

    "video": {
      "title": "Couper la vidéo",
      "startTime": "Heure de début",
      "endTime": "Heure de fin",
      "duration": "Durée : {duration}",
      "apply": "Appliquer la coupe"
    },

    "purposes": {
      "howToUse": "Mode d'emploi",
      "troubleshooting": "Dépannage",
      "maintenance": "Entretien",
      "safety": "Informations de sécurité",
      "warranty": "Garantie et assistance",
      "other": "Autre"
    },

    "list": {
      "title": "Titre",
      "item": "Article",
      "room": "Pièce",
      "property": "Propriété",
      "purpose": "Objectif",
      "created": "Créé",
      "actions": "Actions",
      "empty": "Aucun guide disponible",
      "noResults": "Aucun résultat trouvé"
    },

    "toolbar": {
      "search": "Rechercher",
      "filter": "Filtrer",
      "clearFilters": "Effacer les filtres",
      "viewGrid": "Vue en grille",
      "viewList": "Vue en liste",
      "showing": "Affichage de {count} sur {total} guides"
    },

    "card": {
      "edit": "Modifier",
      "viewDetails": "Voir les détails",
      "noContent": "Pas encore de contenu"
    },

    "page": {
      "title": "Instructions",
      "subtitle": "Gérer les instructions de vos articles",
      "createFirst": "Créez votre première instruction",
      "learnMore": "En savoir plus",
      "loading": "Chargement...",
      "authRequired": "Connexion requise",
      "authMessage": "Veuillez vous connecter pour continuer",
      "goToLogin": "Aller à la connexion",
      "retry": "Réessayer",
      "errorTitle": "Une erreur s'est produite",
      "successMessage": "Enregistré avec succès"
    },

    "empty": {
      "title": "Pas encore d'instructions",
      "description": "Créez votre première instruction pour commencer"
    },

    "states": {
      "draft": "Brouillon",
      "published": "Publié",
      "archived": "Archivé",
      "scheduled": "Planifié"
    },

    "actions": {
      "create": "Créer",
      "edit": "Modifier",
      "delete": "Supprimer",
      "publish": "Publier",
      "archive": "Archiver",
      "duplicate": "Dupliquer",
      "preview": "Aperçu"
    },

    "errors": {
      "loadFailed": "Échec du chargement",
      "saveFailed": "Échec de l'enregistrement",
      "deleteFailed": "Échec de la suppression",
      "notFound": "Non trouvé"
    },

    "loading": {
      "fetching": "Chargement...",
      "saving": "Enregistrement...",
      "deleting": "Suppression...",
      "uploading": "Téléchargement..."
    },

    "validation": {
      "titleRequired": "Le titre est obligatoire",
      "contentRequired": "Au moins un contenu est requis",
      "maxLength": "Maximum {max} caractères autorisés"
    }
  }
}
```

#### File to Modify
`/messages/fr.json`

#### Verification Checklist
- [ ] All ~91 keys present in `articles` namespace
- [ ] Structure matches en.json exactly
- [ ] Variable placeholders preserved exactly
- [ ] Formal "vous" form used consistently
- [ ] Proper French accents applied
- [ ] JSON syntax valid

---

### Task 5: Translate Articles Namespace to Italian (it)
**Estimated Time:** 50 minutes
**Story Points:** 1.5

#### Description
Generate complete Italian translations for all `articles.*` keys in `/messages/it.json`, using formal "Lei" form and content management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Formality | Use formal "Lei" form where appropriate |
| Pluralization | Two forms: one (1), other (0, 2+) |
| Technical Terms | Keep "Markdown" as-is |
| Gender Agreement | Italian has complex gender agreement |
| Accents | Use proper Italian accents (à, è, é, ì, ò, ù) |

#### Glossary Reference

| English | Italian | Notes |
|---------|---------|-------|
| Instructions | Istruzioni | Feminine plural |
| Guide | Guida | Feminine |
| Article | Articolo | Masculine |
| Content | Contenuto | Masculine |
| Editor | Editor | Masculine (loan word) |
| Media | Media | Feminine plural |
| Upload | Caricare | Verb infinitive |
| Crop | Ritagliare | Verb infinitive |
| Trim | Tagliare | Verb infinitive |
| Aspect Ratio | Proporzioni | Feminine plural |
| Duration | Durata | Feminine |
| Draft | Bozza | Feminine |
| Published | Pubblicato | Past participle |
| Archived | Archiviato | Past participle |

#### Steps
1. Read current `/messages/it.json`
2. Replace/update entire `articles` namespace with Italian translations
3. Apply nested structure matching en.json exactly
4. Use formal "Lei" form where appropriate
5. Preserve all variable placeholders exactly
6. Validate JSON syntax

#### Complete Translation Template

```json
{
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
        "image": "Immagine"
      },
      "placeholder": "Scrivi le tue istruzioni qui..."
    },

    "media": {
      "upload": "Carica media",
      "dragDrop": "Trascina e rilascia i file qui",
      "or": "oppure",
      "browse": "Sfoglia file",
      "supportedFormats": "Formati supportati: {formats}",
      "maxSize": "Dimensione massima del file: {size}MB"
    },

    "crop": {
      "title": "Ritaglia immagine",
      "aspectRatio": "Proporzioni",
      "freeform": "Libero",
      "square": "Quadrato",
      "landscape": "Orizzontale",
      "portrait": "Verticale",
      "apply": "Applica ritaglio",
      "reset": "Reimposta"
    },

    "video": {
      "title": "Taglia video",
      "startTime": "Ora di inizio",
      "endTime": "Ora di fine",
      "duration": "Durata: {duration}",
      "apply": "Applica taglio"
    },

    "purposes": {
      "howToUse": "Come usare",
      "troubleshooting": "Risoluzione problemi",
      "maintenance": "Manutenzione",
      "safety": "Informazioni sulla sicurezza",
      "warranty": "Garanzia e supporto",
      "other": "Altro"
    },

    "list": {
      "title": "Titolo",
      "item": "Articolo",
      "room": "Stanza",
      "property": "Proprietà",
      "purpose": "Scopo",
      "created": "Creato",
      "actions": "Azioni",
      "empty": "Nessuna guida disponibile",
      "noResults": "Nessun risultato trovato"
    },

    "toolbar": {
      "search": "Cerca",
      "filter": "Filtra",
      "clearFilters": "Cancella filtri",
      "viewGrid": "Vista griglia",
      "viewList": "Vista elenco",
      "showing": "Visualizzazione di {count} su {total} guide"
    },

    "card": {
      "edit": "Modifica",
      "viewDetails": "Visualizza dettagli",
      "noContent": "Nessun contenuto ancora"
    },

    "page": {
      "title": "Istruzioni",
      "subtitle": "Gestisci le istruzioni dei tuoi articoli",
      "createFirst": "Crea la tua prima istruzione",
      "learnMore": "Scopri di più",
      "loading": "Caricamento...",
      "authRequired": "Accesso richiesto",
      "authMessage": "Effettua l'accesso per continuare",
      "goToLogin": "Vai all'accesso",
      "retry": "Riprova",
      "errorTitle": "Qualcosa è andato storto",
      "successMessage": "Salvato con successo"
    },

    "empty": {
      "title": "Nessuna istruzione ancora",
      "description": "Crea la tua prima istruzione per iniziare"
    },

    "states": {
      "draft": "Bozza",
      "published": "Pubblicato",
      "archived": "Archiviato",
      "scheduled": "Programmato"
    },

    "actions": {
      "create": "Crea",
      "edit": "Modifica",
      "delete": "Elimina",
      "publish": "Pubblica",
      "archive": "Archivia",
      "duplicate": "Duplica",
      "preview": "Anteprima"
    },

    "errors": {
      "loadFailed": "Caricamento non riuscito",
      "saveFailed": "Salvataggio non riuscito",
      "deleteFailed": "Eliminazione non riuscita",
      "notFound": "Non trovato"
    },

    "loading": {
      "fetching": "Caricamento...",
      "saving": "Salvataggio...",
      "deleting": "Eliminazione...",
      "uploading": "Caricamento..."
    },

    "validation": {
      "titleRequired": "Il titolo è obbligatorio",
      "contentRequired": "È richiesto almeno un contenuto",
      "maxLength": "Massimo {max} caratteri consentiti"
    }
  }
}
```

#### File to Modify
`/messages/it.json`

#### Verification Checklist
- [ ] All ~91 keys present in `articles` namespace
- [ ] Structure matches en.json exactly
- [ ] Variable placeholders preserved exactly
- [ ] Formal "Lei" form used where appropriate
- [ ] Proper Italian accents applied
- [ ] JSON syntax valid

---

### Task 6: Translate Articles Namespace to Dutch (nl)
**Estimated Time:** 50 minutes
**Story Points:** 1.5

#### Description
Generate complete Dutch translations for all `articles.*` keys in `/messages/nl.json`, using formal "u" form and content management domain terminology.

#### Language-Specific Guidelines

| Aspect | Guideline |
|--------|-----------|
| Formality | Use formal "u" form consistently |
| Pluralization | Two forms: one (1), other (0, 2+) |
| Compound Words | Dutch uses many compound words similar to German |
| Technical Terms | Keep "Markdown" as-is |
| Word Order | Follow Dutch conventions |

#### Glossary Reference

| English | Dutch | Notes |
|---------|-------|-------|
| Instructions | Instructies | Common plural |
| Guide | Handleiding | Common |
| Article | Artikel | Common |
| Content | Inhoud | Common |
| Editor | Editor | Common (loan word) |
| Media | Media | Common plural |
| Upload | Uploaden | Verb infinitive |
| Crop | Bijsnijden | Verb infinitive |
| Trim | Trimmen | Verb infinitive |
| Aspect Ratio | Beeldverhouding | Common |
| Duration | Duur | Common |
| Draft | Concept | Common |
| Published | Gepubliceerd | Past participle |
| Archived | Gearchiveerd | Past participle |

#### Steps
1. Read current `/messages/nl.json`
2. Replace/update entire `articles` namespace with Dutch translations
3. Apply nested structure matching en.json exactly
4. Use formal "u" form
5. Preserve all variable placeholders exactly
6. Validate JSON syntax

#### Complete Translation Template

```json
{
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
        "image": "Afbeelding"
      },
      "placeholder": "Schrijf hier uw instructies..."
    },

    "media": {
      "upload": "Media uploaden",
      "dragDrop": "Sleep bestanden hierheen",
      "or": "of",
      "browse": "Bestanden zoeken",
      "supportedFormats": "Ondersteunde formaten: {formats}",
      "maxSize": "Maximale bestandsgrootte: {size}MB"
    },

    "crop": {
      "title": "Afbeelding bijsnijden",
      "aspectRatio": "Beeldverhouding",
      "freeform": "Vrije vorm",
      "square": "Vierkant",
      "landscape": "Liggend",
      "portrait": "Staand",
      "apply": "Bijsnijden toepassen",
      "reset": "Herstellen"
    },

    "video": {
      "title": "Video trimmen",
      "startTime": "Starttijd",
      "endTime": "Eindtijd",
      "duration": "Duur: {duration}",
      "apply": "Trimmen toepassen"
    },

    "purposes": {
      "howToUse": "Gebruiksaanwijzing",
      "troubleshooting": "Probleemoplossing",
      "maintenance": "Onderhoud",
      "safety": "Veiligheidsinformatie",
      "warranty": "Garantie en ondersteuning",
      "other": "Overig"
    },

    "list": {
      "title": "Titel",
      "item": "Artikel",
      "room": "Kamer",
      "property": "Eigendom",
      "purpose": "Doel",
      "created": "Aangemaakt",
      "actions": "Acties",
      "empty": "Geen handleidingen beschikbaar",
      "noResults": "Geen resultaten gevonden"
    },

    "toolbar": {
      "search": "Zoeken",
      "filter": "Filteren",
      "clearFilters": "Filters wissen",
      "viewGrid": "Rasterweergave",
      "viewList": "Lijstweergave",
      "showing": "Toont {count} van {total} handleidingen"
    },

    "card": {
      "edit": "Bewerken",
      "viewDetails": "Details bekijken",
      "noContent": "Nog geen inhoud"
    },

    "page": {
      "title": "Instructies",
      "subtitle": "Beheer instructies voor uw artikelen",
      "createFirst": "Maak uw eerste instructie aan",
      "learnMore": "Meer informatie",
      "loading": "Laden...",
      "authRequired": "Inloggen vereist",
      "authMessage": "Log in om door te gaan",
      "goToLogin": "Naar inloggen",
      "retry": "Opnieuw proberen",
      "errorTitle": "Er is iets misgegaan",
      "successMessage": "Succesvol opgeslagen"
    },

    "empty": {
      "title": "Nog geen instructies",
      "description": "Maak uw eerste instructie om te beginnen"
    },

    "states": {
      "draft": "Concept",
      "published": "Gepubliceerd",
      "archived": "Gearchiveerd",
      "scheduled": "Gepland"
    },

    "actions": {
      "create": "Aanmaken",
      "edit": "Bewerken",
      "delete": "Verwijderen",
      "publish": "Publiceren",
      "archive": "Archiveren",
      "duplicate": "Dupliceren",
      "preview": "Voorbeeld"
    },

    "errors": {
      "loadFailed": "Laden mislukt",
      "saveFailed": "Opslaan mislukt",
      "deleteFailed": "Verwijderen mislukt",
      "notFound": "Niet gevonden"
    },

    "loading": {
      "fetching": "Laden...",
      "saving": "Opslaan...",
      "deleting": "Verwijderen...",
      "uploading": "Uploaden..."
    },

    "validation": {
      "titleRequired": "Titel is verplicht",
      "contentRequired": "Minimaal één inhoud is vereist",
      "maxLength": "Maximaal {max} tekens toegestaan"
    }
  }
}
```

#### File to Modify
`/messages/nl.json`

#### Verification Checklist
- [ ] All ~91 keys present in `articles` namespace
- [ ] Structure matches en.json exactly
- [ ] Variable placeholders preserved exactly
- [ ] Formal "u" form used consistently
- [ ] Dutch compound word conventions followed
- [ ] JSON syntax valid

---

### Task 7: JSON Syntax Validation
**Estimated Time:** 10 minutes
**Story Points:** 0.5

#### Description
Validate JSON syntax in all 5 modified translation files to ensure no parsing errors.

#### Steps
1. Run JSON linter on each modified file
2. Fix any syntax errors found
3. Verify no trailing commas
4. Verify all strings are properly escaped

#### Commands
```bash
# Validate JSON syntax for all translation files
npx jsonlint messages/de.json
npx jsonlint messages/es.json
npx jsonlint messages/fr.json
npx jsonlint messages/it.json
npx jsonlint messages/nl.json

# Or use Node.js to validate
node -e "require('./messages/de.json')"
node -e "require('./messages/es.json')"
node -e "require('./messages/fr.json')"
node -e "require('./messages/it.json')"
node -e "require('./messages/nl.json')"
```

#### Common JSON Errors to Check
- Missing commas between properties
- Trailing commas after last property
- Unescaped quotes within strings
- Incorrect nesting/bracket matching

#### Verification Checklist
- [ ] `/messages/de.json` passes JSON validation
- [ ] `/messages/es.json` passes JSON validation
- [ ] `/messages/fr.json` passes JSON validation
- [ ] `/messages/it.json` passes JSON validation
- [ ] `/messages/nl.json` passes JSON validation

---

### Task 8: Application Runtime Testing
**Estimated Time:** 20 minutes
**Story Points:** 0.5

#### Description
Start the development server and verify translations load without runtime errors in all 5 languages.

#### Steps
1. Start development server (`npm run dev`)
2. Navigate to instructions/articles management pages
3. Switch language to German and verify:
   - No console errors for missing translations
   - All `articles.*` keys render properly
   - Variable interpolation displays correctly
4. Repeat for Spanish, French, Italian, Dutch
5. Test variable interpolation with sample data

#### Test Scenarios

**Variable Interpolation Test Cases:**
| Test | Variable | Expected |
|------|----------|----------|
| Supported formats | `{formats}` = "JPG, PNG, GIF" | Formats appear correctly |
| Max file size | `{size}` = 10 | Number displays correctly |
| Duration | `{duration}` = "2:30" | Duration displays correctly |
| Showing guides | `{count}` = 5, `{total}` = 20 | Numbers display correctly |
| Max length | `{max}` = 100 | Number appears correctly |

#### Commands
```bash
# Start development server
npm run dev

# Navigate to instructions page
# URL: http://localhost:3000/dashboard2/instructions
```

#### Verification Checklist
- [ ] No console errors for missing translations
- [ ] German (de) - All articles.* keys render
- [ ] Spanish (es) - All articles.* keys render
- [ ] French (fr) - All articles.* keys render
- [ ] Italian (it) - All articles.* keys render
- [ ] Dutch (nl) - All articles.* keys render
- [ ] Variable interpolation works correctly

---

### Task 9: Visual QA and Layout Verification
**Estimated Time:** 30 minutes
**Story Points:** 1

#### Description
Perform visual inspection of key Article & Content Management screens in all 5 languages to identify layout issues caused by longer translated text.

#### Screens to Test

1. **Instructions List/Table View**
   - Column headers display (truncation, overflow)
   - Toolbar labels and buttons
   - Empty state messages
   - Filter/sort options

2. **Editor View**
   - Formatting toolbar labels
   - Preview/Edit tabs
   - Placeholder text

3. **Media Upload**
   - Upload button labels
   - Drag-drop zone text
   - Format/size constraints

4. **Image Crop Dialog**
   - Aspect ratio labels
   - Control buttons (Apply, Reset)
   - Title display

5. **Video Trim Dialog**
   - Time labels (Start, End, Duration)
   - Control buttons
   - Title display

#### Expected Text Expansion

| Language | Expected Expansion | Risk Level |
|----------|-------------------|------------|
| German | +30-40% | High (compound words) |
| Spanish | +15-25% | Medium |
| French | +15-25% | Medium |
| Italian | +15-25% | Medium |
| Dutch | +20-30% | Medium |

#### Issues to Watch For
- Button text overflow or truncation
- Column header misalignment in table view
- Modal/dialog content cramping
- Toolbar button truncation
- Dropdown text cutoff

#### Verification Checklist
- [ ] German - No layout breaks on key screens
- [ ] Spanish - No layout breaks on key screens
- [ ] French - No layout breaks on key screens
- [ ] Italian - No layout breaks on key screens
- [ ] Dutch - No layout breaks on key screens
- [ ] Buttons accommodate longer text
- [ ] Dialogs display properly
- [ ] Table columns handle text gracefully

---

### Task 10: Final Documentation and Cleanup
**Estimated Time:** 10 minutes
**Story Points:** 0.5

#### Description
Document any translation decisions, flag strings for native speaker review, and update task status.

#### Steps
1. Document any difficult translation decisions made
2. List strings flagged for native speaker review (if any)
3. Update task status in gen_requests_epic2.md
4. Add completion note to overview document

#### Strings to Flag for Review (if applicable)
- Technical terminology (aspect ratio, crop, trim)
- Editor formatting labels
- Error messages
- Validation messages

#### Translation Decisions Documentation
| Decision | Rationale |
|----------|-----------|
| "Markdown" preserved | Industry standard, recognized globally |
| "Aspect Ratio" translated | Common term with good equivalents |
| Purpose categories localized | Domain-specific, need cultural adaptation |
| Editor terms localized | Standard text formatting terminology |

#### Files to Update
- `docs/REQ-397-generate-translations-for-5-non-english-languages-overview.md` - Add completion status
- `docs/gen_requests_epic2.md` - Mark acceptance criteria complete

#### Verification Checklist
- [ ] Translation decisions documented
- [ ] Critical strings flagged for review (if needed)
- [ ] Overview document updated with completion status
- [ ] All acceptance criteria verified

---

## Task Summary

| Task | Description | Time (min) | Story Points |
|------|-------------|------------|--------------|
| 1 | Verify prerequisites and extract source keys | 15 | 0.5 |
| 2 | Translate to German (de) | 50 | 1.5 |
| 3 | Translate to Spanish (es) | 50 | 1.5 |
| 4 | Translate to French (fr) | 50 | 1.5 |
| 5 | Translate to Italian (it) | 50 | 1.5 |
| 6 | Translate to Dutch (nl) | 50 | 1.5 |
| 7 | JSON syntax validation | 10 | 0.5 |
| 8 | Application runtime testing | 20 | 0.5 |
| 9 | Visual QA and layout verification | 30 | 1.0 |
| 10 | Final documentation and cleanup | 10 | 0.5 |
| **Total** | | **335 min (~5.6 hrs)** | **10.5** |

---

## Acceptance Criteria Verification

From REQ-397, verify each criterion upon completion:

| # | Criterion | Task(s) | Verified |
|---|-----------|---------|----------|
| 1 | German (de) translation file contains complete articles namespace with all keys from English version | Task 2 | [ ] |
| 2 | Spanish (es) translation file contains complete articles namespace with all keys from English version | Task 3 | [ ] |
| 3 | French (fr) translation file contains complete articles namespace with all keys from English version | Task 4 | [ ] |
| 4 | Italian (it) translation file contains complete articles namespace with all keys from English version | Task 5 | [ ] |
| 5 | Dutch (nl) translation file contains complete articles namespace with all keys from English version | Task 6 | [ ] |
| 6 | Editor component translations accurately convey text formatting, styling, and content editing concepts | Tasks 2-6 | [ ] |
| 7 | Media handling translations properly localize file type terminology, size limits, and upload status messages | Tasks 2-6 | [ ] |
| 8 | Crop utility translations include culturally appropriate aspect ratio and dimension terminology | Tasks 2-6 | [ ] |
| 9 | Trim utility translations correctly format time durations according to locale conventions | Tasks 2-6 | [ ] |
| 10 | Instructions page translations provide clear table headers, column labels, and purpose category names | Tasks 2-6 | [ ] |
| 11 | Technical terms including markdown, embed, aspect ratio, and timeline are appropriately localized or preserved | Tasks 2-6 | [ ] |
| 12 | All translation files maintain valid JSON structure without syntax errors | Task 7 | [ ] |
| 13 | Character encoding properly handles special characters, accents, and diacritics for each language | Tasks 2-7 | [ ] |
| 14 | Translated strings maintain reasonable length to avoid breaking component layouts in UI | Task 9 | [ ] |
| 15 | Terminology consistency is maintained with existing common, dashboard, and workflow namespaces | Tasks 2-6 | [ ] |
| 16 | Validation and error messages use clear, actionable language appropriate to each culture | Tasks 2-6 | [ ] |
| 17 | Date and time formatting in instructions tables adapts to locale-specific conventions | Tasks 2-6 | [ ] |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Variable placeholder mismatch | Low | High | Systematic verification, preserve exactly |
| Inconsistent terminology | Medium | Medium | Use glossary, reference common namespace |
| Layout breaks from text expansion | Medium | Low | Visual QA, design accommodates 40% expansion |
| Missing keys in target files | Low | High | Structure copy from en.json, key-by-key verification |
| Technical term confusion | Medium | Medium | Balance between preserving industry terms and localization |

---

## Domain-Specific Terminology Reference

The following terms should be translated consistently across all Article & Content Management strings:

| English | German | Spanish | French | Italian | Dutch |
|---------|--------|---------|--------|---------|-------|
| Guide | Anleitung | Guía | Guide | Guida | Handleiding |
| Article | Artikel | Artículo | Article | Articolo | Artikel |
| Instructions | Anleitungen | Instrucciones | Instructions | Istruzioni | Instructies |
| Content | Inhalt | Contenido | Contenu | Contenuto | Inhoud |
| Editor | Editor | Editor | Éditeur | Editor | Editor |
| Media | Medien | Medios | Médias | Media | Media |
| Upload | Hochladen | Subir | Télécharger | Caricare | Uploaden |
| Crop | Zuschneiden | Recortar | Rogner | Ritagliare | Bijsnijden |
| Trim | Schneiden | Recortar | Couper | Tagliare | Trimmen |
| Aspect Ratio | Seitenverhältnis | Proporción | Format d'image | Proporzioni | Beeldverhouding |
| Duration | Dauer | Duración | Durée | Durata | Duur |
| Draft | Entwurf | Borrador | Brouillon | Bozza | Concept |
| Published | Veröffentlicht | Publicado | Publié | Pubblicato | Gepubliceerd |
| Archived | Archiviert | Archivado | Archivé | Archiviato | Gearchiveerd |

---

## Completion Checklist

Before marking REQ-397 complete:

- [ ] All 5 language files contain complete `articles` namespace
- [ ] Structure identical across all 6 language files (en + 5 targets)
- [ ] All variable placeholders preserved exactly
- [ ] JSON syntax valid for all files
- [ ] No runtime translation errors
- [ ] Visual QA passed for all languages
- [ ] Acceptance criteria verified
- [ ] Documentation updated

---

*Document created for FAQBNB Localization Epic 2 - Static UI Translation*
*Sub-Epic 2E - Article & Content Management - Task 2E.6 (Final)*
