# REQ-394: Update Media Handling Components for Localization - Detailed Task Breakdown

**Last Modified:** 2026-01-19 23:15 UTC
**Request ID:** REQ-394
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.3
**Priority:** Eighth (per Epic 2 recommended order)
**Source Overview:** [REQ-394-update-media-handling-components-overview.md](./REQ-394-update-media-handling-components-overview.md)

---

## Executive Summary

This document provides step-by-step implementation tasks for updating 10 media handling components to retrieve all user-facing strings from translation files using the `useTranslations` hook from next-intl. The affected components include image/video editors, gallery views, and media management controls. All strings will be placed under the `articles.media`, `articles.crop`, `articles.rotate`, and `articles.video` namespaces.

**Total Scope:**
- Components to update: 10 files
- Estimated unique strings: ~95-110
- Translation namespaces: 4 (media, crop, rotate, video)

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] All six message files exist: `/messages/{en,de,es,fr,it,nl}.json`
- [ ] REQ-392 (articles namespace structure) is complete - the base `articles` namespace must exist
- [ ] Familiarity with next-intl `useTranslations` hook pattern
- [ ] Access to AI translation service (Claude/OpenAI) for non-English translations

---

## Task Breakdown

### Task 1: Extend Translation Files with Media Namespaces

**Files:** `/messages/{en,de,es,fr,it,nl}.json`
**Estimated Effort:** 25 minutes
**Story Points:** 2

#### 1.1 Objective

Add the extended media handling translation keys to the existing `articles` namespace in all six message files. This includes `articles.media` (general media), `articles.crop` (image cropping), `articles.rotate` (image rotation), and `articles.video` (video trimming) sections.

#### 1.2 Implementation Steps - English (en.json)

1. **Open** `/messages/en.json`

2. **Locate** the existing `articles` namespace

3. **Update/extend** the `articles.media`, `articles.crop`, and `articles.video` sections to include all media handling strings:

```json
{
  "articles": {
    "media": {
      "title": "Media & Links",
      "addLink": "Add Link",
      "emptyState": {
        "title": "No media links yet",
        "description": "Add your first link"
      },
      "types": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF Document",
        "youtube": "YouTube Video",
        "image": "Image",
        "webLink": "Web Link"
      },
      "gallery": {
        "empty": "No media to display",
        "ariaLabel": "Media gallery, {count} items",
        "counter": "{current} / {total}",
        "thumbnails": "Media thumbnails",
        "previousMedia": "Previous media",
        "nextMedia": "Next media",
        "enterFullScreen": "Enter full screen",
        "exitFullScreen": "Exit full screen",
        "viewMedia": "View {type} {filename}"
      },
      "thumbnail": {
        "altText": "Media thumbnail",
        "deleteMedia": "Delete media",
        "pageCount": "{count, plural, one {# page} other {# pages}}"
      },
      "upload": {
        "dragDrop": "Drag and drop files here",
        "or": "or",
        "browse": "Browse files",
        "supportedFormats": "Supported formats: {formats}",
        "maxSize": "Maximum file size: {size}MB"
      },
      "actions": {
        "dragToReorder": "Drag to reorder",
        "editLink": "Edit link",
        "deleteLink": "Delete link"
      },
      "form": {
        "title": "Title",
        "titlePlaceholder": "e.g., Product Manual",
        "url": "URL",
        "urlPlaceholder": "https://...",
        "type": "Type",
        "thumbnailUrl": "Thumbnail URL (optional)",
        "addCustomThumbnail": "+ Add custom thumbnail",
        "typeAutoDetected": "Type is auto-detected from URL but can be changed",
        "invalidUrl": "Please enter a valid URL",
        "enterTitle": "Enter title"
      },
      "buttons": {
        "cancel": "Cancel",
        "save": "Save",
        "addLink": "Add Link"
      },
      "delete": {
        "title": "Delete {type}?",
        "warning": "This action cannot be undone.",
        "confirm": "Delete"
      }
    },
    "crop": {
      "title": "Crop Image",
      "aspectRatio": {
        "label": "Aspect Ratio",
        "free": "Free",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "largeImageWarning": "Large image detected. Output may be scaled down for compatibility.",
      "loading": "Loading image...",
      "processing": "Applying crop...",
      "preview": {
        "label": "Preview:",
        "generating": "Generating...",
        "selectArea": "Select area to preview"
      },
      "buttons": {
        "apply": "Apply Crop",
        "applying": "Applying...",
        "cancel": "Cancel"
      },
      "error": {
        "loadFailed": "Failed to load image. Please try again.",
        "cropFailed": "Crop operation failed"
      },
      "aria": {
        "dismissError": "Dismiss error",
        "cropPreview": "Crop preview",
        "previewThumbnail": "Crop preview thumbnail"
      }
    },
    "rotate": {
      "title": "Rotate Image",
      "editor": "Image rotation editor",
      "loading": "Loading image...",
      "processing": "Applying rotation...",
      "preview": "Preview",
      "currentRotation": "Current rotation: {degrees}",
      "modified": "(modified)",
      "tryAgain": "Try Again",
      "keyboardHelp": {
        "full": "Keyboard: {left} / {right} to rotate, Esc to cancel, {modifier}+Enter to apply",
        "leftKey": "\\u2190",
        "rightKey": "\\u2192",
        "macModifier": "\\u2318",
        "winModifier": "Ctrl"
      },
      "buttons": {
        "apply": "Apply Rotation",
        "applying": "Applying...",
        "cancel": "Cancel"
      },
      "aria": {
        "rotateLeft": "Rotate image left 90 degrees",
        "rotateRight": "Rotate image right 90 degrees"
      },
      "announcements": {
        "rotated": "Image rotated to {degrees} degrees",
        "processing": "Processing rotation..."
      }
    },
    "video": {
      "title": "Trim Video",
      "loading": "Loading video...",
      "error": {
        "title": "Error",
        "noDuration": "Unable to determine video duration",
        "loadFailed": "Failed to load video. Please check the file and try again.",
        "playFailed": "Unable to play video. Please try again.",
        "invalidTrim": "Invalid trim selection"
      },
      "tryAgain": "Try again",
      "timeline": {
        "selection": "Selection:",
        "duration": "Duration:",
        "current": "Current:",
        "trimSavings": "Trimming {time} ({percent}% reduction)"
      },
      "markers": {
        "start": "S",
        "end": "E",
        "startLabel": "Start trim point",
        "endLabel": "End trim point"
      },
      "controls": {
        "skipToStart": "Skip to start marker",
        "skipToEnd": "Skip to end marker",
        "play": "Play trimmed region",
        "pause": "Pause"
      },
      "buttons": {
        "apply": "Apply Trim",
        "cancel": "Cancel"
      }
    }
  }
}
```

4. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/en.json')"
   ```

#### 1.3 Implementation Steps - French (fr.json)

1. **Open** `/messages/fr.json`

2. **Add/update** the media handling translations:

```json
{
  "articles": {
    "media": {
      "title": "Medias et liens",
      "addLink": "Ajouter un lien",
      "emptyState": {
        "title": "Pas encore de liens medias",
        "description": "Ajoutez votre premier lien"
      },
      "types": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "Document PDF",
        "youtube": "Video YouTube",
        "image": "Image",
        "webLink": "Lien web"
      },
      "gallery": {
        "empty": "Aucun media a afficher",
        "ariaLabel": "Galerie de medias, {count} elements",
        "counter": "{current} / {total}",
        "thumbnails": "Miniatures des medias",
        "previousMedia": "Media precedent",
        "nextMedia": "Media suivant",
        "enterFullScreen": "Passer en plein ecran",
        "exitFullScreen": "Quitter le plein ecran",
        "viewMedia": "Voir {type} {filename}"
      },
      "thumbnail": {
        "altText": "Miniature du media",
        "deleteMedia": "Supprimer le media",
        "pageCount": "{count, plural, one {# page} other {# pages}}"
      },
      "upload": {
        "dragDrop": "Glissez et deposez les fichiers ici",
        "or": "ou",
        "browse": "Parcourir les fichiers",
        "supportedFormats": "Formats supportes : {formats}",
        "maxSize": "Taille maximale du fichier : {size} Mo"
      },
      "actions": {
        "dragToReorder": "Glisser pour reorganiser",
        "editLink": "Modifier le lien",
        "deleteLink": "Supprimer le lien"
      },
      "form": {
        "title": "Titre",
        "titlePlaceholder": "ex. Manuel du produit",
        "url": "URL",
        "urlPlaceholder": "https://...",
        "type": "Type",
        "thumbnailUrl": "URL de la miniature (optionnel)",
        "addCustomThumbnail": "+ Ajouter une miniature personnalisee",
        "typeAutoDetected": "Le type est detecte automatiquement depuis l'URL mais peut etre modifie",
        "invalidUrl": "Veuillez entrer une URL valide",
        "enterTitle": "Entrer le titre"
      },
      "buttons": {
        "cancel": "Annuler",
        "save": "Enregistrer",
        "addLink": "Ajouter le lien"
      },
      "delete": {
        "title": "Supprimer {type} ?",
        "warning": "Cette action est irreversible.",
        "confirm": "Supprimer"
      }
    },
    "crop": {
      "title": "Recadrer l'image",
      "aspectRatio": {
        "label": "Rapport d'aspect",
        "free": "Libre",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "largeImageWarning": "Grande image detectee. La sortie peut etre reduite pour compatibilite.",
      "loading": "Chargement de l'image...",
      "processing": "Application du recadrage...",
      "preview": {
        "label": "Apercu :",
        "generating": "Generation...",
        "selectArea": "Selectionnez une zone pour l'apercu"
      },
      "buttons": {
        "apply": "Appliquer le recadrage",
        "applying": "Application...",
        "cancel": "Annuler"
      },
      "error": {
        "loadFailed": "Echec du chargement de l'image. Veuillez reessayer.",
        "cropFailed": "L'operation de recadrage a echoue"
      },
      "aria": {
        "dismissError": "Fermer l'erreur",
        "cropPreview": "Apercu du recadrage",
        "previewThumbnail": "Miniature de l'apercu du recadrage"
      }
    },
    "rotate": {
      "title": "Pivoter l'image",
      "editor": "Editeur de rotation d'image",
      "loading": "Chargement de l'image...",
      "processing": "Application de la rotation...",
      "preview": "Apercu",
      "currentRotation": "Rotation actuelle : {degrees}",
      "modified": "(modifie)",
      "tryAgain": "Reessayer",
      "keyboardHelp": {
        "full": "Clavier : {left} / {right} pour pivoter, Echap pour annuler, {modifier}+Entree pour appliquer",
        "leftKey": "\\u2190",
        "rightKey": "\\u2192",
        "macModifier": "\\u2318",
        "winModifier": "Ctrl"
      },
      "buttons": {
        "apply": "Appliquer la rotation",
        "applying": "Application...",
        "cancel": "Annuler"
      },
      "aria": {
        "rotateLeft": "Pivoter l'image de 90 degres vers la gauche",
        "rotateRight": "Pivoter l'image de 90 degres vers la droite"
      },
      "announcements": {
        "rotated": "Image pivotee a {degrees} degres",
        "processing": "Traitement de la rotation..."
      }
    },
    "video": {
      "title": "Couper la video",
      "loading": "Chargement de la video...",
      "error": {
        "title": "Erreur",
        "noDuration": "Impossible de determiner la duree de la video",
        "loadFailed": "Echec du chargement de la video. Veuillez verifier le fichier et reessayer.",
        "playFailed": "Impossible de lire la video. Veuillez reessayer.",
        "invalidTrim": "Selection de coupe invalide"
      },
      "tryAgain": "Reessayer",
      "timeline": {
        "selection": "Selection :",
        "duration": "Duree :",
        "current": "Actuel :",
        "trimSavings": "Reduction de {time} ({percent}% de reduction)"
      },
      "markers": {
        "start": "D",
        "end": "F",
        "startLabel": "Point de debut de coupe",
        "endLabel": "Point de fin de coupe"
      },
      "controls": {
        "skipToStart": "Aller au marqueur de debut",
        "skipToEnd": "Aller au marqueur de fin",
        "play": "Lire la region coupee",
        "pause": "Pause"
      },
      "buttons": {
        "apply": "Appliquer la coupe",
        "cancel": "Annuler"
      }
    }
  }
}
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/fr.json')"
   ```

#### 1.4 Implementation Steps - Spanish (es.json)

1. **Open** `/messages/es.json`

2. **Add/update** the media handling translations:

```json
{
  "articles": {
    "media": {
      "title": "Medios y enlaces",
      "addLink": "Agregar enlace",
      "emptyState": {
        "title": "Aun no hay enlaces de medios",
        "description": "Agrega tu primer enlace"
      },
      "types": {
        "video": "Video",
        "photo": "Foto",
        "pdf": "Documento PDF",
        "youtube": "Video de YouTube",
        "image": "Imagen",
        "webLink": "Enlace web"
      },
      "gallery": {
        "empty": "No hay medios para mostrar",
        "ariaLabel": "Galeria de medios, {count} elementos",
        "counter": "{current} / {total}",
        "thumbnails": "Miniaturas de medios",
        "previousMedia": "Medio anterior",
        "nextMedia": "Siguiente medio",
        "enterFullScreen": "Entrar en pantalla completa",
        "exitFullScreen": "Salir de pantalla completa",
        "viewMedia": "Ver {type} {filename}"
      },
      "thumbnail": {
        "altText": "Miniatura del medio",
        "deleteMedia": "Eliminar medio",
        "pageCount": "{count, plural, one {# pagina} other {# paginas}}"
      },
      "upload": {
        "dragDrop": "Arrastra y suelta archivos aqui",
        "or": "o",
        "browse": "Explorar archivos",
        "supportedFormats": "Formatos soportados: {formats}",
        "maxSize": "Tamano maximo del archivo: {size}MB"
      },
      "actions": {
        "dragToReorder": "Arrastra para reordenar",
        "editLink": "Editar enlace",
        "deleteLink": "Eliminar enlace"
      },
      "form": {
        "title": "Titulo",
        "titlePlaceholder": "ej. Manual del producto",
        "url": "URL",
        "urlPlaceholder": "https://...",
        "type": "Tipo",
        "thumbnailUrl": "URL de miniatura (opcional)",
        "addCustomThumbnail": "+ Agregar miniatura personalizada",
        "typeAutoDetected": "El tipo se detecta automaticamente desde la URL pero se puede cambiar",
        "invalidUrl": "Por favor ingresa una URL valida",
        "enterTitle": "Ingresar titulo"
      },
      "buttons": {
        "cancel": "Cancelar",
        "save": "Guardar",
        "addLink": "Agregar enlace"
      },
      "delete": {
        "title": "Eliminar {type}?",
        "warning": "Esta accion no se puede deshacer.",
        "confirm": "Eliminar"
      }
    },
    "crop": {
      "title": "Recortar imagen",
      "aspectRatio": {
        "label": "Relacion de aspecto",
        "free": "Libre",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "largeImageWarning": "Imagen grande detectada. La salida puede reducirse para compatibilidad.",
      "loading": "Cargando imagen...",
      "processing": "Aplicando recorte...",
      "preview": {
        "label": "Vista previa:",
        "generating": "Generando...",
        "selectArea": "Selecciona un area para vista previa"
      },
      "buttons": {
        "apply": "Aplicar recorte",
        "applying": "Aplicando...",
        "cancel": "Cancelar"
      },
      "error": {
        "loadFailed": "Error al cargar la imagen. Por favor intenta de nuevo.",
        "cropFailed": "La operacion de recorte fallo"
      },
      "aria": {
        "dismissError": "Descartar error",
        "cropPreview": "Vista previa del recorte",
        "previewThumbnail": "Miniatura de vista previa del recorte"
      }
    },
    "rotate": {
      "title": "Rotar imagen",
      "editor": "Editor de rotacion de imagen",
      "loading": "Cargando imagen...",
      "processing": "Aplicando rotacion...",
      "preview": "Vista previa",
      "currentRotation": "Rotacion actual: {degrees}",
      "modified": "(modificado)",
      "tryAgain": "Intentar de nuevo",
      "keyboardHelp": {
        "full": "Teclado: {left} / {right} para rotar, Esc para cancelar, {modifier}+Enter para aplicar",
        "leftKey": "\\u2190",
        "rightKey": "\\u2192",
        "macModifier": "\\u2318",
        "winModifier": "Ctrl"
      },
      "buttons": {
        "apply": "Aplicar rotacion",
        "applying": "Aplicando...",
        "cancel": "Cancelar"
      },
      "aria": {
        "rotateLeft": "Rotar imagen 90 grados a la izquierda",
        "rotateRight": "Rotar imagen 90 grados a la derecha"
      },
      "announcements": {
        "rotated": "Imagen rotada a {degrees} grados",
        "processing": "Procesando rotacion..."
      }
    },
    "video": {
      "title": "Recortar video",
      "loading": "Cargando video...",
      "error": {
        "title": "Error",
        "noDuration": "No se puede determinar la duracion del video",
        "loadFailed": "Error al cargar el video. Por favor verifica el archivo e intenta de nuevo.",
        "playFailed": "No se puede reproducir el video. Por favor intenta de nuevo.",
        "invalidTrim": "Seleccion de recorte invalida"
      },
      "tryAgain": "Intentar de nuevo",
      "timeline": {
        "selection": "Seleccion:",
        "duration": "Duracion:",
        "current": "Actual:",
        "trimSavings": "Recortando {time} ({percent}% de reduccion)"
      },
      "markers": {
        "start": "I",
        "end": "F",
        "startLabel": "Punto de inicio de recorte",
        "endLabel": "Punto de fin de recorte"
      },
      "controls": {
        "skipToStart": "Saltar al marcador de inicio",
        "skipToEnd": "Saltar al marcador de fin",
        "play": "Reproducir region recortada",
        "pause": "Pausar"
      },
      "buttons": {
        "apply": "Aplicar recorte",
        "cancel": "Cancelar"
      }
    }
  }
}
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/es.json')"
   ```

#### 1.5 Implementation Steps - German (de.json)

1. **Open** `/messages/de.json`

2. **Add/update** the media handling translations:

```json
{
  "articles": {
    "media": {
      "title": "Medien & Links",
      "addLink": "Link hinzufugen",
      "emptyState": {
        "title": "Noch keine Medienlinks",
        "description": "Fugen Sie Ihren ersten Link hinzu"
      },
      "types": {
        "video": "Video",
        "photo": "Foto",
        "pdf": "PDF-Dokument",
        "youtube": "YouTube-Video",
        "image": "Bild",
        "webLink": "Weblink"
      },
      "gallery": {
        "empty": "Keine Medien anzuzeigen",
        "ariaLabel": "Mediengalerie, {count} Elemente",
        "counter": "{current} / {total}",
        "thumbnails": "Medien-Miniaturbilder",
        "previousMedia": "Vorheriges Medium",
        "nextMedia": "Nachstes Medium",
        "enterFullScreen": "Vollbild aktivieren",
        "exitFullScreen": "Vollbild beenden",
        "viewMedia": "{type} {filename} anzeigen"
      },
      "thumbnail": {
        "altText": "Medien-Miniaturbild",
        "deleteMedia": "Medium loschen",
        "pageCount": "{count, plural, one {# Seite} other {# Seiten}}"
      },
      "upload": {
        "dragDrop": "Dateien hier ablegen",
        "or": "oder",
        "browse": "Dateien durchsuchen",
        "supportedFormats": "Unterstutzte Formate: {formats}",
        "maxSize": "Maximale Dateigrosse: {size}MB"
      },
      "actions": {
        "dragToReorder": "Zum Neuordnen ziehen",
        "editLink": "Link bearbeiten",
        "deleteLink": "Link loschen"
      },
      "form": {
        "title": "Titel",
        "titlePlaceholder": "z.B. Produkthandbuch",
        "url": "URL",
        "urlPlaceholder": "https://...",
        "type": "Typ",
        "thumbnailUrl": "Miniaturbild-URL (optional)",
        "addCustomThumbnail": "+ Benutzerdefiniertes Miniaturbild hinzufugen",
        "typeAutoDetected": "Der Typ wird automatisch aus der URL erkannt, kann aber geandert werden",
        "invalidUrl": "Bitte geben Sie eine gultige URL ein",
        "enterTitle": "Titel eingeben"
      },
      "buttons": {
        "cancel": "Abbrechen",
        "save": "Speichern",
        "addLink": "Link hinzufugen"
      },
      "delete": {
        "title": "{type} loschen?",
        "warning": "Diese Aktion kann nicht ruckgangig gemacht werden.",
        "confirm": "Loschen"
      }
    },
    "crop": {
      "title": "Bild zuschneiden",
      "aspectRatio": {
        "label": "Seitenverhaltnis",
        "free": "Frei",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "largeImageWarning": "Grosses Bild erkannt. Die Ausgabe kann fur Kompatibilitat verkleinert werden.",
      "loading": "Bild wird geladen...",
      "processing": "Zuschnitt wird angewendet...",
      "preview": {
        "label": "Vorschau:",
        "generating": "Wird generiert...",
        "selectArea": "Bereich fur Vorschau auswahlen"
      },
      "buttons": {
        "apply": "Zuschnitt anwenden",
        "applying": "Wird angewendet...",
        "cancel": "Abbrechen"
      },
      "error": {
        "loadFailed": "Bild konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
        "cropFailed": "Zuschnitt-Operation fehlgeschlagen"
      },
      "aria": {
        "dismissError": "Fehler schliessen",
        "cropPreview": "Zuschnitt-Vorschau",
        "previewThumbnail": "Miniaturbild der Zuschnitt-Vorschau"
      }
    },
    "rotate": {
      "title": "Bild drehen",
      "editor": "Bilddrehungs-Editor",
      "loading": "Bild wird geladen...",
      "processing": "Drehung wird angewendet...",
      "preview": "Vorschau",
      "currentRotation": "Aktuelle Drehung: {degrees}",
      "modified": "(geandert)",
      "tryAgain": "Erneut versuchen",
      "keyboardHelp": {
        "full": "Tastatur: {left} / {right} zum Drehen, Esc zum Abbrechen, {modifier}+Enter zum Anwenden",
        "leftKey": "\\u2190",
        "rightKey": "\\u2192",
        "macModifier": "\\u2318",
        "winModifier": "Strg"
      },
      "buttons": {
        "apply": "Drehung anwenden",
        "applying": "Wird angewendet...",
        "cancel": "Abbrechen"
      },
      "aria": {
        "rotateLeft": "Bild um 90 Grad nach links drehen",
        "rotateRight": "Bild um 90 Grad nach rechts drehen"
      },
      "announcements": {
        "rotated": "Bild auf {degrees} Grad gedreht",
        "processing": "Drehung wird verarbeitet..."
      }
    },
    "video": {
      "title": "Video schneiden",
      "loading": "Video wird geladen...",
      "error": {
        "title": "Fehler",
        "noDuration": "Videodauer kann nicht ermittelt werden",
        "loadFailed": "Video konnte nicht geladen werden. Bitte uberprufen Sie die Datei und versuchen Sie es erneut.",
        "playFailed": "Video kann nicht abgespielt werden. Bitte versuchen Sie es erneut.",
        "invalidTrim": "Ungultige Schnittauswahl"
      },
      "tryAgain": "Erneut versuchen",
      "timeline": {
        "selection": "Auswahl:",
        "duration": "Dauer:",
        "current": "Aktuell:",
        "trimSavings": "Schneiden {time} ({percent}% Reduktion)"
      },
      "markers": {
        "start": "A",
        "end": "E",
        "startLabel": "Start-Schnittpunkt",
        "endLabel": "End-Schnittpunkt"
      },
      "controls": {
        "skipToStart": "Zum Startmarker springen",
        "skipToEnd": "Zum Endmarker springen",
        "play": "Geschnittenen Bereich abspielen",
        "pause": "Pause"
      },
      "buttons": {
        "apply": "Schnitt anwenden",
        "cancel": "Abbrechen"
      }
    }
  }
}
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/de.json')"
   ```

#### 1.6 Implementation Steps - Dutch (nl.json)

1. **Open** `/messages/nl.json`

2. **Add/update** the media handling translations:

```json
{
  "articles": {
    "media": {
      "title": "Media & Links",
      "addLink": "Link toevoegen",
      "emptyState": {
        "title": "Nog geen medialinks",
        "description": "Voeg uw eerste link toe"
      },
      "types": {
        "video": "Video",
        "photo": "Foto",
        "pdf": "PDF-document",
        "youtube": "YouTube-video",
        "image": "Afbeelding",
        "webLink": "Weblink"
      },
      "gallery": {
        "empty": "Geen media om weer te geven",
        "ariaLabel": "Mediagalerij, {count} items",
        "counter": "{current} / {total}",
        "thumbnails": "Mediaminiaturen",
        "previousMedia": "Vorige media",
        "nextMedia": "Volgende media",
        "enterFullScreen": "Volledig scherm openen",
        "exitFullScreen": "Volledig scherm sluiten",
        "viewMedia": "{type} {filename} bekijken"
      },
      "thumbnail": {
        "altText": "Mediaminiatuur",
        "deleteMedia": "Media verwijderen",
        "pageCount": "{count, plural, one {# pagina} other {# pagina's}}"
      },
      "upload": {
        "dragDrop": "Sleep bestanden hierheen",
        "or": "of",
        "browse": "Bestanden bladeren",
        "supportedFormats": "Ondersteunde formaten: {formats}",
        "maxSize": "Maximale bestandsgrootte: {size}MB"
      },
      "actions": {
        "dragToReorder": "Sleep om te herschikken",
        "editLink": "Link bewerken",
        "deleteLink": "Link verwijderen"
      },
      "form": {
        "title": "Titel",
        "titlePlaceholder": "bijv. Producthandleiding",
        "url": "URL",
        "urlPlaceholder": "https://...",
        "type": "Type",
        "thumbnailUrl": "Miniatuur-URL (optioneel)",
        "addCustomThumbnail": "+ Aangepaste miniatuur toevoegen",
        "typeAutoDetected": "Type wordt automatisch gedetecteerd uit de URL maar kan worden gewijzigd",
        "invalidUrl": "Voer een geldige URL in",
        "enterTitle": "Titel invoeren"
      },
      "buttons": {
        "cancel": "Annuleren",
        "save": "Opslaan",
        "addLink": "Link toevoegen"
      },
      "delete": {
        "title": "{type} verwijderen?",
        "warning": "Deze actie kan niet ongedaan worden gemaakt.",
        "confirm": "Verwijderen"
      }
    },
    "crop": {
      "title": "Afbeelding bijsnijden",
      "aspectRatio": {
        "label": "Beeldverhouding",
        "free": "Vrij",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "largeImageWarning": "Grote afbeelding gedetecteerd. Uitvoer kan worden geschaald voor compatibiliteit.",
      "loading": "Afbeelding laden...",
      "processing": "Bijsnijden toepassen...",
      "preview": {
        "label": "Voorbeeld:",
        "generating": "Genereren...",
        "selectArea": "Selecteer gebied voor voorbeeld"
      },
      "buttons": {
        "apply": "Bijsnijden toepassen",
        "applying": "Toepassen...",
        "cancel": "Annuleren"
      },
      "error": {
        "loadFailed": "Kan afbeelding niet laden. Probeer het opnieuw.",
        "cropFailed": "Bijsnijdbewerking mislukt"
      },
      "aria": {
        "dismissError": "Fout sluiten",
        "cropPreview": "Bijsnijdvoorbeeld",
        "previewThumbnail": "Miniatuur van bijsnijdvoorbeeld"
      }
    },
    "rotate": {
      "title": "Afbeelding draaien",
      "editor": "Afbeeldingsrotatie-editor",
      "loading": "Afbeelding laden...",
      "processing": "Rotatie toepassen...",
      "preview": "Voorbeeld",
      "currentRotation": "Huidige rotatie: {degrees}",
      "modified": "(gewijzigd)",
      "tryAgain": "Opnieuw proberen",
      "keyboardHelp": {
        "full": "Toetsenbord: {left} / {right} om te draaien, Esc om te annuleren, {modifier}+Enter om toe te passen",
        "leftKey": "\\u2190",
        "rightKey": "\\u2192",
        "macModifier": "\\u2318",
        "winModifier": "Ctrl"
      },
      "buttons": {
        "apply": "Rotatie toepassen",
        "applying": "Toepassen...",
        "cancel": "Annuleren"
      },
      "aria": {
        "rotateLeft": "Afbeelding 90 graden naar links draaien",
        "rotateRight": "Afbeelding 90 graden naar rechts draaien"
      },
      "announcements": {
        "rotated": "Afbeelding gedraaid naar {degrees} graden",
        "processing": "Rotatie verwerken..."
      }
    },
    "video": {
      "title": "Video inkorten",
      "loading": "Video laden...",
      "error": {
        "title": "Fout",
        "noDuration": "Kan videoduur niet bepalen",
        "loadFailed": "Kan video niet laden. Controleer het bestand en probeer opnieuw.",
        "playFailed": "Kan video niet afspelen. Probeer opnieuw.",
        "invalidTrim": "Ongeldige inkortingsselectie"
      },
      "tryAgain": "Opnieuw proberen",
      "timeline": {
        "selection": "Selectie:",
        "duration": "Duur:",
        "current": "Huidig:",
        "trimSavings": "Inkorten {time} ({percent}% reductie)"
      },
      "markers": {
        "start": "S",
        "end": "E",
        "startLabel": "Start inkortpunt",
        "endLabel": "Eind inkortpunt"
      },
      "controls": {
        "skipToStart": "Spring naar startmarker",
        "skipToEnd": "Spring naar eindmarker",
        "play": "Ingekort gebied afspelen",
        "pause": "Pauze"
      },
      "buttons": {
        "apply": "Inkorting toepassen",
        "cancel": "Annuleren"
      }
    }
  }
}
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/nl.json')"
   ```

#### 1.7 Implementation Steps - Italian (it.json)

1. **Open** `/messages/it.json`

2. **Add/update** the media handling translations:

```json
{
  "articles": {
    "media": {
      "title": "Media e link",
      "addLink": "Aggiungi link",
      "emptyState": {
        "title": "Ancora nessun link multimediale",
        "description": "Aggiungi il tuo primo link"
      },
      "types": {
        "video": "Video",
        "photo": "Foto",
        "pdf": "Documento PDF",
        "youtube": "Video YouTube",
        "image": "Immagine",
        "webLink": "Link web"
      },
      "gallery": {
        "empty": "Nessun media da visualizzare",
        "ariaLabel": "Galleria multimediale, {count} elementi",
        "counter": "{current} / {total}",
        "thumbnails": "Miniature dei media",
        "previousMedia": "Media precedente",
        "nextMedia": "Media successivo",
        "enterFullScreen": "Attiva schermo intero",
        "exitFullScreen": "Esci da schermo intero",
        "viewMedia": "Visualizza {type} {filename}"
      },
      "thumbnail": {
        "altText": "Miniatura del media",
        "deleteMedia": "Elimina media",
        "pageCount": "{count, plural, one {# pagina} other {# pagine}}"
      },
      "upload": {
        "dragDrop": "Trascina e rilascia i file qui",
        "or": "o",
        "browse": "Sfoglia file",
        "supportedFormats": "Formati supportati: {formats}",
        "maxSize": "Dimensione massima del file: {size}MB"
      },
      "actions": {
        "dragToReorder": "Trascina per riordinare",
        "editLink": "Modifica link",
        "deleteLink": "Elimina link"
      },
      "form": {
        "title": "Titolo",
        "titlePlaceholder": "es. Manuale del prodotto",
        "url": "URL",
        "urlPlaceholder": "https://...",
        "type": "Tipo",
        "thumbnailUrl": "URL miniatura (opzionale)",
        "addCustomThumbnail": "+ Aggiungi miniatura personalizzata",
        "typeAutoDetected": "Il tipo viene rilevato automaticamente dall'URL ma puo essere modificato",
        "invalidUrl": "Inserisci un URL valido",
        "enterTitle": "Inserisci titolo"
      },
      "buttons": {
        "cancel": "Annulla",
        "save": "Salva",
        "addLink": "Aggiungi link"
      },
      "delete": {
        "title": "Eliminare {type}?",
        "warning": "Questa azione non puo essere annullata.",
        "confirm": "Elimina"
      }
    },
    "crop": {
      "title": "Ritaglia immagine",
      "aspectRatio": {
        "label": "Proporzioni",
        "free": "Libero",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "largeImageWarning": "Rilevata immagine grande. L'output potrebbe essere ridimensionato per compatibilita.",
      "loading": "Caricamento immagine...",
      "processing": "Applicazione ritaglio...",
      "preview": {
        "label": "Anteprima:",
        "generating": "Generazione...",
        "selectArea": "Seleziona area per anteprima"
      },
      "buttons": {
        "apply": "Applica ritaglio",
        "applying": "Applicazione...",
        "cancel": "Annulla"
      },
      "error": {
        "loadFailed": "Impossibile caricare l'immagine. Riprova.",
        "cropFailed": "Operazione di ritaglio fallita"
      },
      "aria": {
        "dismissError": "Chiudi errore",
        "cropPreview": "Anteprima ritaglio",
        "previewThumbnail": "Miniatura anteprima ritaglio"
      }
    },
    "rotate": {
      "title": "Ruota immagine",
      "editor": "Editor rotazione immagine",
      "loading": "Caricamento immagine...",
      "processing": "Applicazione rotazione...",
      "preview": "Anteprima",
      "currentRotation": "Rotazione attuale: {degrees}",
      "modified": "(modificato)",
      "tryAgain": "Riprova",
      "keyboardHelp": {
        "full": "Tastiera: {left} / {right} per ruotare, Esc per annullare, {modifier}+Invio per applicare",
        "leftKey": "\\u2190",
        "rightKey": "\\u2192",
        "macModifier": "\\u2318",
        "winModifier": "Ctrl"
      },
      "buttons": {
        "apply": "Applica rotazione",
        "applying": "Applicazione...",
        "cancel": "Annulla"
      },
      "aria": {
        "rotateLeft": "Ruota immagine di 90 gradi a sinistra",
        "rotateRight": "Ruota immagine di 90 gradi a destra"
      },
      "announcements": {
        "rotated": "Immagine ruotata a {degrees} gradi",
        "processing": "Elaborazione rotazione..."
      }
    },
    "video": {
      "title": "Taglia video",
      "loading": "Caricamento video...",
      "error": {
        "title": "Errore",
        "noDuration": "Impossibile determinare la durata del video",
        "loadFailed": "Impossibile caricare il video. Verifica il file e riprova.",
        "playFailed": "Impossibile riprodurre il video. Riprova.",
        "invalidTrim": "Selezione di taglio non valida"
      },
      "tryAgain": "Riprova",
      "timeline": {
        "selection": "Selezione:",
        "duration": "Durata:",
        "current": "Attuale:",
        "trimSavings": "Taglio di {time} ({percent}% riduzione)"
      },
      "markers": {
        "start": "I",
        "end": "F",
        "startLabel": "Punto di inizio taglio",
        "endLabel": "Punto di fine taglio"
      },
      "controls": {
        "skipToStart": "Vai al marcatore di inizio",
        "skipToEnd": "Vai al marcatore di fine",
        "play": "Riproduci regione tagliata",
        "pause": "Pausa"
      },
      "buttons": {
        "apply": "Applica taglio",
        "cancel": "Annulla"
      }
    }
  }
}
```

3. **Validate** JSON syntax:
   ```bash
   node -e "require('./messages/it.json')"
   ```

#### 1.8 Verification Checklist
- [ ] All 6 JSON files pass syntax validation
- [ ] All variable placeholders preserved: `{count}`, `{current}`, `{total}`, `{type}`, `{filename}`, `{formats}`, `{size}`, `{degrees}`, `{time}`, `{percent}`, `{left}`, `{right}`, `{modifier}`, `{max}`
- [ ] Pluralization syntax correct in all languages
- [ ] Key structure is identical across all 6 files

---

### Task 2: Update ImageCropper Component

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Estimated Effort:** 20 minutes
**Story Points:** 2

#### 2.1 Objective

Update the ImageCropper component to use translations from the `articles.crop` namespace for all user-facing strings.

#### 2.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside the component function:

```typescript
const t = useTranslations('articles.crop');
```

3. **Update `ASPECT_RATIO_OPTIONS` array** to use translations:

```typescript
// Before
const ASPECT_RATIO_OPTIONS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '16:9', value: 16/9 },
];

// After - make this dynamic inside the component
const aspectRatioOptions = [
  { label: t('aspectRatio.free'), value: null },
  { label: t('aspectRatio.square'), value: 1 },
  { label: t('aspectRatio.standard'), value: 4/3 },
  { label: t('aspectRatio.widescreen'), value: 16/9 },
];
```

4. **Replace hardcoded strings**:

| Original String | Translation Call |
|-----------------|------------------|
| `"Large image detected. Output may be scaled down for compatibility."` | `t('largeImageWarning')` |
| `"Loading image..."` | `t('loading')` |
| `"Applying crop..."` | `t('processing')` |
| `"Preview:"` | `t('preview.label')` |
| `"Generating..."` | `t('preview.generating')` |
| `"Select area to preview"` | `t('preview.selectArea')` |
| `"Failed to load image. Please try again."` | `t('error.loadFailed')` |
| `"Crop operation failed"` | `t('error.cropFailed')` |
| `"Applying..."` | `t('buttons.applying')` |
| `"Apply Crop"` | `t('buttons.apply')` |
| `"Cancel"` | `t('buttons.cancel')` |
| `"Crop preview"` | `t('aria.cropPreview')` |
| `"Crop preview thumbnail"` | `t('aria.previewThumbnail')` |
| `"Dismiss error"` | `t('aria.dismissError')` |

5. **Example transformation**:

```tsx
// Before
<button aria-label="Dismiss error">
  <span>Failed to load image. Please try again.</span>
</button>

// After
<button aria-label={t('aria.dismissError')}>
  <span>{t('error.loadFailed')}</span>
</button>
```

#### 2.3 Verification Checklist
- [ ] `useTranslations` hook imported from 'next-intl'
- [ ] All hardcoded strings replaced with `t()` calls
- [ ] Aspect ratio labels use translations
- [ ] All aria-labels are translated
- [ ] Component compiles without TypeScript errors
- [ ] Component renders correctly with English translations

---

### Task 3: Update ImageRotator Component

**File:** `/src/components/ItemCapture/editors/ImageRotator.tsx`
**Estimated Effort:** 20 minutes
**Story Points:** 2

#### 3.1 Objective

Update the ImageRotator component to use translations from the `articles.rotate` namespace.

#### 3.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside the component function:

```typescript
const t = useTranslations('articles.rotate');
```

3. **Update `getRotationAnnouncement()` function** if it exists, to use translations:

```typescript
// Before
const getRotationAnnouncement = (degrees: number) => {
  return `Image rotated to ${degrees} degrees`;
};

// After
const getRotationAnnouncement = (degrees: number) => {
  return t('announcements.rotated', { degrees });
};
```

4. **Replace hardcoded strings**:

| Original String | Translation Call |
|-----------------|------------------|
| `"Loading image..."` | `t('loading')` |
| `"Applying rotation..."` | `t('processing')` |
| `"Preview"` | `t('preview')` |
| `"Current rotation: {degrees}°"` | `t('currentRotation', { degrees })` + `°` |
| `"(modified)"` | `t('modified')` |
| `"Keyboard: ← / → to rotate, Esc to cancel, ⌘+Enter to apply"` | Build from `t('keyboardHelp.full', {...})` |
| `"Applying..."` | `t('buttons.applying')` |
| `"Apply Rotation"` | `t('buttons.apply')` |
| `"Cancel"` | `t('buttons.cancel')` |
| `"Try Again"` | `t('tryAgain')` |
| `"Image rotation editor"` | `t('editor')` |
| `"Rotate image left 90 degrees"` | `t('aria.rotateLeft')` |
| `"Rotate image right 90 degrees"` | `t('aria.rotateRight')` |
| `"Processing rotation..."` | `t('announcements.processing')` |
| `"Image rotated to {degrees} degrees"` | `t('announcements.rotated', { degrees })` |

5. **Handle keyboard help text** (platform-aware):

```typescript
const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
const keyboardHelpText = t('keyboardHelp.full', {
  left: t('keyboardHelp.leftKey'),
  right: t('keyboardHelp.rightKey'),
  modifier: isMac ? t('keyboardHelp.macModifier') : t('keyboardHelp.winModifier')
});
```

#### 3.3 Verification Checklist
- [ ] `useTranslations` hook imported
- [ ] All hardcoded strings replaced
- [ ] `getRotationAnnouncement()` function uses translations
- [ ] Keyboard help text correctly assembled with platform-specific modifier
- [ ] All aria-labels are translated
- [ ] Screen reader announcements use translations

---

### Task 4: Update VideoTrimmer Component

**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Estimated Effort:** 25 minutes
**Story Points:** 2

#### 4.1 Objective

Update the VideoTrimmer component to use translations from the `articles.video` namespace.

#### 4.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside the component function:

```typescript
const t = useTranslations('articles.video');
```

3. **Replace hardcoded strings**:

| Original String | Translation Call |
|-----------------|------------------|
| `"Unable to determine video duration"` | `t('error.noDuration')` |
| `"Failed to load video. Please check the file and try again."` | `t('error.loadFailed')` |
| `"Unable to play video. Please try again."` | `t('error.playFailed')` |
| `"Invalid trim selection"` | `t('error.invalidTrim')` |
| `"Error"` | `t('error.title')` |
| `"Try again"` | `t('tryAgain')` |
| `"Loading video..."` | `t('loading')` |
| `"Selection:"` | `t('timeline.selection')` |
| `"Duration:"` | `t('timeline.duration')` |
| `"Current:"` | `t('timeline.current')` |
| `"Trimming {time} ({percent}% reduction)"` | `t('timeline.trimSavings', { time, percent })` |
| `"Start trim point"` | `t('markers.startLabel')` |
| `"End trim point"` | `t('markers.endLabel')` |
| `"Skip to start marker"` | `t('controls.skipToStart')` |
| `"Skip to end marker"` | `t('controls.skipToEnd')` |
| `"Pause"` | `t('controls.pause')` |
| `"Play trimmed region"` | `t('controls.play')` |
| `"Cancel"` | `t('buttons.cancel')` |
| `"Apply Trim"` | `t('buttons.apply')` |
| `"S"` | `t('markers.start')` |
| `"E"` | `t('markers.end')` |

4. **Handle dynamic interpolation** for trim savings:

```typescript
// Before
<span>Trimming {formatTime(savedDuration)} ({Math.round(percentSaved)}% reduction)</span>

// After
<span>{t('timeline.trimSavings', {
  time: formatTime(savedDuration),
  percent: Math.round(percentSaved)
})}</span>
```

#### 4.3 Verification Checklist
- [ ] `useTranslations` hook imported
- [ ] All error messages use translations
- [ ] Timeline labels translated
- [ ] Dynamic values correctly interpolated
- [ ] Play/pause button labels toggle correctly in all languages
- [ ] Start/End markers use translated single characters

---

### Task 5: Update MediaGallery Component

**File:** `/src/components/ItemManager/components/ItemPreview/MediaGallery.tsx`
**Estimated Effort:** 20 minutes
**Story Points:** 2

#### 5.1 Objective

Update the MediaGallery component to use translations from the `articles.media.gallery` and `articles.media.types` namespaces.

#### 5.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside the component function:

```typescript
const t = useTranslations('articles.media');
```

3. **Update `MEDIA_TYPE_CONFIG`** or similar type label mappings:

```typescript
// Before
const MEDIA_TYPE_CONFIG = {
  video: { label: 'Video' },
  photo: { label: 'Photo' },
  pdf: { label: 'PDF' },
};

// After - make dynamic
const getTypeLabel = (type: string) => {
  return t(`types.${type}`, { defaultValue: type });
};
```

4. **Replace hardcoded strings**:

| Original String | Translation Call |
|-----------------|------------------|
| `"Video"` | `t('types.video')` |
| `"Photo"` | `t('types.photo')` |
| `"PDF"` | `t('types.pdf')` |
| `"No media to display"` | `t('gallery.empty')` |
| `"View {type} {filename}"` | `t('gallery.viewMedia', { type, filename })` |
| `"Media gallery, {count} items"` | `t('gallery.ariaLabel', { count })` |
| `"Previous media"` | `t('gallery.previousMedia')` |
| `"Next media"` | `t('gallery.nextMedia')` |
| `"Enter full screen"` | `t('gallery.enterFullScreen')` |
| `"Exit full screen"` | `t('gallery.exitFullScreen')` |
| `"{count} page(s)"` | `t('thumbnail.pageCount', { count })` |
| `"Media thumbnails"` | `t('gallery.thumbnails')` |

5. **Handle pluralization** for page count:

```typescript
// The ICU message format handles pluralization automatically
<span>{t('thumbnail.pageCount', { count: pageCount })}</span>
```

#### 5.3 Verification Checklist
- [ ] `useTranslations` hook imported
- [ ] Media type labels translated dynamically
- [ ] Gallery navigation labels translated
- [ ] Full-screen toggle labels translated
- [ ] Page count uses ICU pluralization
- [ ] All aria-labels are translated

---

### Task 6: Update MediaThumbnail Component

**File:** `/src/components/ItemCapture/components/shared/MediaThumbnail.tsx`
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 6.1 Objective

Update the MediaThumbnail component to use translations from the `articles.media.thumbnail` namespace.

#### 6.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside the component function:

```typescript
const t = useTranslations('articles.media.thumbnail');
```

3. **Replace hardcoded strings**:

| Original String | Translation Call |
|-----------------|------------------|
| `"Media thumbnail"` | `t('altText')` |
| `"{count} page(s)"` | `t('pageCount', { count })` |
| `"Delete media"` | `t('deleteMedia')` |

#### 6.3 Verification Checklist
- [ ] `useTranslations` hook imported
- [ ] Alt text translated
- [ ] Page count uses pluralization
- [ ] Delete button aria-label translated

---

### Task 7: Update MediaManagementSection Component

**File:** `/src/components/MediaManagement/MediaManagementSection.tsx`
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 7.1 Objective

Update the MediaManagementSection component to use translations from the `articles.media` namespace.

#### 7.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside the component function:

```typescript
const t = useTranslations('articles.media');
```

3. **Replace hardcoded strings**:

| Original String | Translation Call |
|-----------------|------------------|
| `"Media & Links"` | `t('title')` |
| `"Add Link"` | `t('addLink')` |
| `"No media links yet"` | `t('emptyState.title')` |
| `"Add your first link"` | `t('emptyState.description')` |

#### 7.3 Verification Checklist
- [ ] `useTranslations` hook imported
- [ ] Section header translated
- [ ] Button text translated
- [ ] Empty state messages translated

---

### Task 8: Update MediaLinkItem Component

**File:** `/src/components/MediaManagement/MediaLinkItem.tsx`
**Estimated Effort:** 15 minutes
**Story Points:** 1

#### 8.1 Objective

Update the MediaLinkItem component to use translations from the `articles.media` namespace.

#### 8.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside the component function:

```typescript
const t = useTranslations('articles.media');
```

3. **Replace hardcoded strings**:

| Original String | Translation Call |
|-----------------|------------------|
| `"Drag to reorder"` | `t('actions.dragToReorder')` |
| `"Edit link"` | `t('actions.editLink')` |
| `"Delete link"` | `t('actions.deleteLink')` |
| `"Title"` | `t('form.title')` |
| `"URL"` | `t('form.url')` |
| `"Type"` | `t('form.type')` |
| `"Enter title"` | `t('form.enterTitle')` |
| `"https://..."` | `t('form.urlPlaceholder')` |
| `"Cancel"` | `t('buttons.cancel')` |
| `"Save"` | `t('buttons.save')` |

#### 8.3 Verification Checklist
- [ ] `useTranslations` hook imported
- [ ] All form labels translated
- [ ] Placeholders translated
- [ ] Action button labels translated
- [ ] Aria-labels for edit/delete translated

---

### Task 9: Update AddMediaLinkForm Component

**File:** `/src/components/MediaManagement/AddMediaLinkForm.tsx`
**Estimated Effort:** 15 minutes
**Story Points:** 1

#### 9.1 Objective

Update the AddMediaLinkForm component to use translations from the `articles.media` namespace.

#### 9.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside the component function:

```typescript
const t = useTranslations('articles.media');
```

3. **Replace hardcoded strings**:

| Original String | Translation Call |
|-----------------|------------------|
| `"Title"` | `t('form.title')` |
| `"URL"` | `t('form.url')` |
| `"Type"` | `t('form.type')` |
| `"Thumbnail URL (optional)"` | `t('form.thumbnailUrl')` |
| `"e.g., Product Manual"` | `t('form.titlePlaceholder')` |
| `"https://..."` | `t('form.urlPlaceholder')` |
| `"Please enter a valid URL"` | `t('form.invalidUrl')` |
| `"Type is auto-detected from URL but can be changed"` | `t('form.typeAutoDetected')` |
| `"+ Add custom thumbnail"` | `t('form.addCustomThumbnail')` |
| `"Cancel"` | `t('buttons.cancel')` |
| `"Add Link"` | `t('buttons.addLink')` |

#### 9.3 Verification Checklist
- [ ] `useTranslations` hook imported
- [ ] All form labels translated
- [ ] All placeholders translated
- [ ] Error messages translated
- [ ] Help text translated
- [ ] Button labels translated

---

### Task 10: Update DeleteMediaConfirmDialog Component

**File:** `/src/components/MediaManagement/DeleteMediaConfirmDialog.tsx`
**Estimated Effort:** 10 minutes
**Story Points:** 1

#### 10.1 Objective

Update the DeleteMediaConfirmDialog component to use translations from the `articles.media` namespace.

#### 10.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Add hook** inside the component function:

```typescript
const t = useTranslations('articles.media');
```

3. **Update `getTypeLabel()` function** if it exists:

```typescript
// Before
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    youtube: 'YouTube Video',
    pdf: 'PDF Document',
    image: 'Image',
    link: 'Web Link',
  };
  return labels[type] || 'Media';
};

// After
const getTypeLabel = (type: string) => {
  const typeKey = type === 'link' ? 'webLink' : type;
  return t(`types.${typeKey}`, { defaultValue: t('types.webLink') });
};
```

4. **Replace hardcoded strings**:

| Original String | Translation Call |
|-----------------|------------------|
| `"YouTube Video"` | `t('types.youtube')` |
| `"PDF Document"` | `t('types.pdf')` |
| `"Image"` | `t('types.image')` |
| `"Web Link"` | `t('types.webLink')` |
| `"Delete {type}?"` | `t('delete.title', { type: getTypeLabel(mediaType) })` |
| `"This action cannot be undone."` | `t('delete.warning')` |
| `"Cancel"` | `t('buttons.cancel')` |
| `"Delete"` | `t('delete.confirm')` |

#### 10.3 Verification Checklist
- [ ] `useTranslations` hook imported
- [ ] Type labels fetched from translations
- [ ] Dialog title uses dynamic type interpolation
- [ ] Warning message translated
- [ ] Button labels translated

---

### Task 11: Final Build Verification and Testing

**Estimated Effort:** 15 minutes
**Story Points:** 1

#### 11.1 Objective

Verify all components compile, build succeeds, and translations render correctly in all 6 languages.

#### 11.2 Implementation Steps

1. **Run TypeScript check:**
   ```bash
   npm run type-check
   ```

2. **Run build:**
   ```bash
   npm run build
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Manual testing checklist:**
   - [ ] Navigate to a page with ImageCropper - verify all labels in English
   - [ ] Switch to French (or other language) - verify translations appear
   - [ ] Test ImageRotator with keyboard help text
   - [ ] Test VideoTrimmer timeline labels and error messages
   - [ ] Test MediaGallery navigation labels
   - [ ] Test MediaManagement section and forms
   - [ ] Test DeleteMediaConfirmDialog with different media types

5. **Verify no console warnings** about missing translations

#### 11.3 Verification Checklist
- [ ] TypeScript compilation passes
- [ ] Build completes without errors
- [ ] All 10 components render correctly
- [ ] No missing translation warnings in console
- [ ] Translations display correctly in at least 2 languages
- [ ] Dynamic values (counts, percentages, degrees) render correctly

---

## Acceptance Criteria Verification

| Criteria | Task(s) | Status |
|----------|---------|--------|
| File upload components display translated instructions for drag-and-drop zones | Task 1, Task 9 | [ ] |
| File type and size restriction messages appear in the user's selected language | Task 1 | [ ] |
| Gallery view components show translated labels for view mode options and selection controls | Task 5 | [ ] |
| Media count displays use proper pluralization for each supported language | Task 5, Task 6 | [ ] |
| Media action buttons including replace, remove, reorder, and set primary use translation keys | Task 7, Task 8 | [ ] |
| Upload progress indicators display status messages from translation files | Task 1, Task 9 | [ ] |
| Error messages for file validation failures retrieve text from translation keys | Task 2, Task 3, Task 4 | [ ] |
| Success messages for completed uploads appear in the user's language | Task 1 | [ ] |
| Confirmation dialogs for destructive actions like remove use translated text | Task 10 | [ ] |
| All media components maintain existing functionality after internationalization | Task 11 | [ ] |
| Translation keys follow the `articles.media` namespace convention | All tasks | [ ] |
| Long translated text in upload zones and error messages does not break layouts | Task 11 | [ ] |
| File size and dimension displays format numbers according to locale conventions | Task 1 | [ ] |
| Media components render correctly in all supported languages without UI issues | Task 11 | [ ] |

---

## Technical Notes

### Variable Interpolation Reference

The following translation keys use variables that must be correctly passed:

| Key Path | Variables | Example Usage |
|----------|-----------|---------------|
| `articles.media.gallery.ariaLabel` | `{count}` | `t('gallery.ariaLabel', { count: items.length })` |
| `articles.media.gallery.counter` | `{current}`, `{total}` | `t('gallery.counter', { current: idx + 1, total: items.length })` |
| `articles.media.gallery.viewMedia` | `{type}`, `{filename}` | `t('gallery.viewMedia', { type, filename })` |
| `articles.media.thumbnail.pageCount` | `{count}` | `t('thumbnail.pageCount', { count: pages })` |
| `articles.media.upload.supportedFormats` | `{formats}` | `t('upload.supportedFormats', { formats: 'JPG, PNG' })` |
| `articles.media.upload.maxSize` | `{size}` | `t('upload.maxSize', { size: 10 })` |
| `articles.media.delete.title` | `{type}` | `t('delete.title', { type: getTypeLabel(mediaType) })` |
| `articles.crop.preview.selectArea` | (none) | `t('preview.selectArea')` |
| `articles.rotate.currentRotation` | `{degrees}` | `t('currentRotation', { degrees: rotation })` |
| `articles.rotate.keyboardHelp.full` | `{left}`, `{right}`, `{modifier}` | Complex assembly |
| `articles.rotate.announcements.rotated` | `{degrees}` | `t('announcements.rotated', { degrees })` |
| `articles.video.timeline.trimSavings` | `{time}`, `{percent}` | `t('timeline.trimSavings', { time, percent })` |

### Pluralization Notes

The following keys use ICU plural format:
- `articles.media.thumbnail.pageCount`: `{count, plural, one {# page} other {# pages}}`

Ensure the correct count value is passed as a number, not a string.

---

## Dependencies

### This Task Requires
- Epic 1 complete (next-intl installed and configured)
- REQ-392 complete (articles namespace base structure exists)
- All six message files exist

### Tasks That Depend on This
- None directly, but enables full translation coverage for Sub-Epic 2E

---

## Rollback Plan

If issues arise after implementation:

1. **Revert component changes** using git:
   ```bash
   git checkout -- src/components/ItemCapture/editors/ImageCropper.tsx
   git checkout -- src/components/ItemCapture/editors/ImageRotator.tsx
   git checkout -- src/components/ItemCapture/editors/VideoTrimmer.tsx
   git checkout -- src/components/ItemManager/components/ItemPreview/MediaGallery.tsx
   git checkout -- src/components/ItemCapture/components/shared/MediaThumbnail.tsx
   git checkout -- src/components/MediaManagement/*.tsx
   ```

2. **Remove translation keys** from message files by removing the extended `articles.media`, `articles.crop`, `articles.rotate`, and `articles.video` sections

3. **Re-validate** JSON files and rebuild

---

## References

- [Overview Document](./REQ-394-update-media-handling-components-overview.md)
- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [i18n Configuration](/src/lib/i18n/config.ts)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2E: Article & Content Management (Task 2E.3)*
