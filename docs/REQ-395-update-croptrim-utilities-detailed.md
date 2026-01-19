# REQ-395: Update Crop/Trim Utilities for Localization - Detailed Task Breakdown

**Last Modified:** 2026-01-19 22:30 UTC
**Request ID:** REQ-395
**Type:** ENHANCEMENT
**Size:** M (Medium)
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.4
**Priority:** P1 - High
**Source Overview:** [REQ-395-update-croptrim-utilities-overview.md](./REQ-395-update-croptrim-utilities-overview.md)

---

## Executive Summary

This document provides granular, step-by-step implementation tasks for updating the ImageCropper, VideoTrimmer, and ImageRotator utility components to support internationalization using the next-intl framework. Each component currently contains hardcoded English strings that must be replaced with translation keys from the `articles` namespace.

**Total Estimated Effort:** ~4 hours
**Story Points:** 3

---

## Prerequisites

Before starting implementation, verify:

- [ ] Epic 1 foundation is complete (next-intl installed and configured)
- [ ] REQ-392 is complete (articles namespace structure created in `/messages/*.json`)
- [ ] All six message files exist: `/messages/{en,de,es,fr,it,nl}.json`
- [ ] `articles.crop`, `articles.trim`, and `articles.rotate` namespaces exist with basic structure
- [ ] `useTranslations` hook is available from next-intl
- [ ] Familiarity with next-intl translation patterns

---

## Task Breakdown

### Task 1: Extend Articles Namespace with Crop/Trim/Rotate Keys (English)

**File:** `/messages/en.json`
**Estimated Effort:** 20 minutes
**Story Points:** 1

#### 1.1 Objective

Add comprehensive translation keys for all three utility components to the `articles` namespace in the English message file.

#### 1.2 Implementation Steps

1. **Open** `/messages/en.json`

2. **Locate** the `articles` namespace

3. **Replace or extend** the `articles.crop` section with the following complete structure:

```json
"crop": {
  "title": "Crop Image",
  "aspectRatio": {
    "label": "Aspect Ratio",
    "free": "Free",
    "square": "1:1",
    "standard": "4:3",
    "widescreen": "16:9"
  },
  "preview": {
    "label": "Preview:",
    "generating": "Generating...",
    "selectArea": "Select area to preview",
    "altText": "Crop preview",
    "thumbnailAlt": "Crop preview thumbnail"
  },
  "actions": {
    "apply": "Apply Crop",
    "applying": "Applying...",
    "cancel": "Cancel"
  },
  "status": {
    "loading": "Loading image...",
    "processing": "Applying crop..."
  },
  "warnings": {
    "largeImage": "Large image detected. Output may be scaled down for compatibility."
  },
  "errors": {
    "loadFailed": "Failed to load image. Please try again.",
    "cropFailed": "Crop operation failed",
    "dismissError": "Dismiss error"
  }
}
```

4. **Replace or extend** the `articles.trim` section (may be named `articles.video`) with:

```json
"trim": {
  "title": "Trim Video",
  "timeline": {
    "startMarker": "Start trim point",
    "endMarker": "End trim point",
    "startLabel": "S",
    "endLabel": "E"
  },
  "duration": {
    "selection": "Selection:",
    "duration": "Duration:",
    "current": "Current:",
    "total": "Total:",
    "trimming": "Trimming {time} ({percent}% reduction)",
    "separator": "/"
  },
  "controls": {
    "skipToStart": "Skip to start marker",
    "skipToEnd": "Skip to end marker",
    "play": "Play trimmed region",
    "pause": "Pause"
  },
  "actions": {
    "apply": "Apply Trim",
    "cancel": "Cancel",
    "tryAgain": "Try again"
  },
  "status": {
    "loading": "Loading video...",
    "error": "Error"
  },
  "errors": {
    "loadFailed": "Failed to load video. Please check the file and try again.",
    "durationFailed": "Unable to determine video duration",
    "playFailed": "Unable to play video. Please try again.",
    "invalidSelection": "Invalid trim selection",
    "startNegative": "Start time cannot be negative",
    "endExceedsDuration": "End time exceeds video duration",
    "startAfterEnd": "Start time must be before end time",
    "belowMinDuration": "Minimum trim duration is {min} {min, plural, one {second} other {seconds}}"
  }
}
```

5. **Add** a new `articles.rotate` section:

```json
"rotate": {
  "title": "Rotate Image",
  "editorLabel": "Image rotation editor",
  "preview": {
    "altText": "Preview"
  },
  "controls": {
    "rotateLeft": "Rotate image left 90 degrees",
    "rotateRight": "Rotate image right 90 degrees"
  },
  "info": {
    "currentRotation": "Current rotation: {degrees}°",
    "modified": "(modified)"
  },
  "keyboard": {
    "label": "Keyboard:",
    "toRotate": "to rotate,",
    "toCancel": "to cancel,",
    "toApply": "to apply"
  },
  "actions": {
    "apply": "Apply Rotation",
    "applying": "Applying...",
    "cancel": "Cancel",
    "tryAgain": "Try Again"
  },
  "status": {
    "loading": "Loading image...",
    "processing": "Applying rotation...",
    "processingAnnouncement": "Processing rotation...",
    "rotatedAnnouncement": "Image rotated to {degrees} degrees"
  },
  "errors": {
    "loadFailed": "Failed to load image. Please try again.",
    "rotationFailed": "Failed to rotate image. Please try again.",
    "canvasUnavailable": "Your browser does not support image editing.",
    "memoryError": "Not enough memory to process image. Try closing other tabs.",
    "blobCreationFailed": "Failed to create image output. Please try again."
  }
}
```

#### 1.3 Verification

- [ ] JSON is valid (no syntax errors)
- [ ] All keys follow the `articles.{component}.{element}.{variant}` convention
- [ ] Keys match the hardcoded strings in the components

#### 1.4 Files Modified

| File | Action |
|------|--------|
| `/messages/en.json` | UPDATE - Add/extend crop, trim, rotate keys |

---

### Task 2: Generate Translations for Non-English Languages

**Files:** `/messages/{de,es,fr,it,nl}.json`
**Estimated Effort:** 30 minutes
**Story Points:** 1

#### 2.1 Objective

Generate translations for all crop, trim, and rotate keys in German, Spanish, French, Italian, and Dutch.

#### 2.2 Implementation Steps

1. **Open** each non-English message file

2. **Add German translations** to `/messages/de.json`:

```json
"crop": {
  "title": "Bild zuschneiden",
  "aspectRatio": {
    "label": "Seitenverhältnis",
    "free": "Frei",
    "square": "1:1",
    "standard": "4:3",
    "widescreen": "16:9"
  },
  "preview": {
    "label": "Vorschau:",
    "generating": "Wird generiert...",
    "selectArea": "Bereich für Vorschau auswählen",
    "altText": "Zuschneide-Vorschau",
    "thumbnailAlt": "Vorschau-Miniatur"
  },
  "actions": {
    "apply": "Zuschneiden anwenden",
    "applying": "Wird angewendet...",
    "cancel": "Abbrechen"
  },
  "status": {
    "loading": "Bild wird geladen...",
    "processing": "Zuschnitt wird angewendet..."
  },
  "warnings": {
    "largeImage": "Großes Bild erkannt. Die Ausgabe wird möglicherweise für die Kompatibilität verkleinert."
  },
  "errors": {
    "loadFailed": "Bild konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
    "cropFailed": "Zuschneide-Vorgang fehlgeschlagen",
    "dismissError": "Fehler ausblenden"
  }
},
"trim": {
  "title": "Video trimmen",
  "timeline": {
    "startMarker": "Startpunkt trimmen",
    "endMarker": "Endpunkt trimmen",
    "startLabel": "A",
    "endLabel": "E"
  },
  "duration": {
    "selection": "Auswahl:",
    "duration": "Dauer:",
    "current": "Aktuell:",
    "total": "Gesamt:",
    "trimming": "Trimmen: {time} ({percent}% Reduzierung)",
    "separator": "/"
  },
  "controls": {
    "skipToStart": "Zum Startmarker springen",
    "skipToEnd": "Zum Endmarker springen",
    "play": "Getrimmten Bereich abspielen",
    "pause": "Pause"
  },
  "actions": {
    "apply": "Trimmen anwenden",
    "cancel": "Abbrechen",
    "tryAgain": "Erneut versuchen"
  },
  "status": {
    "loading": "Video wird geladen...",
    "error": "Fehler"
  },
  "errors": {
    "loadFailed": "Video konnte nicht geladen werden. Bitte überprüfen Sie die Datei und versuchen Sie es erneut.",
    "durationFailed": "Videodauer konnte nicht ermittelt werden",
    "playFailed": "Video kann nicht abgespielt werden. Bitte versuchen Sie es erneut.",
    "invalidSelection": "Ungültige Trimm-Auswahl",
    "startNegative": "Startzeit darf nicht negativ sein",
    "endExceedsDuration": "Endzeit überschreitet Videodauer",
    "startAfterEnd": "Startzeit muss vor Endzeit liegen",
    "belowMinDuration": "Mindest-Trimmdauer beträgt {min} {min, plural, one {Sekunde} other {Sekunden}}"
  }
},
"rotate": {
  "title": "Bild drehen",
  "editorLabel": "Bildrotations-Editor",
  "preview": {
    "altText": "Vorschau"
  },
  "controls": {
    "rotateLeft": "Bild um 90 Grad nach links drehen",
    "rotateRight": "Bild um 90 Grad nach rechts drehen"
  },
  "info": {
    "currentRotation": "Aktuelle Drehung: {degrees}°",
    "modified": "(geändert)"
  },
  "keyboard": {
    "label": "Tastatur:",
    "toRotate": "zum Drehen,",
    "toCancel": "zum Abbrechen,",
    "toApply": "zum Anwenden"
  },
  "actions": {
    "apply": "Drehung anwenden",
    "applying": "Wird angewendet...",
    "cancel": "Abbrechen",
    "tryAgain": "Erneut versuchen"
  },
  "status": {
    "loading": "Bild wird geladen...",
    "processing": "Drehung wird angewendet...",
    "processingAnnouncement": "Drehung wird verarbeitet...",
    "rotatedAnnouncement": "Bild auf {degrees} Grad gedreht"
  },
  "errors": {
    "loadFailed": "Bild konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
    "rotationFailed": "Bild konnte nicht gedreht werden. Bitte versuchen Sie es erneut.",
    "canvasUnavailable": "Ihr Browser unterstützt keine Bildbearbeitung.",
    "memoryError": "Nicht genügend Speicher zum Verarbeiten des Bildes. Versuchen Sie, andere Tabs zu schließen.",
    "blobCreationFailed": "Bildausgabe konnte nicht erstellt werden. Bitte versuchen Sie es erneut."
  }
}
```

3. **Add French translations** to `/messages/fr.json`:

```json
"crop": {
  "title": "Recadrer l'image",
  "aspectRatio": {
    "label": "Format d'image",
    "free": "Libre",
    "square": "1:1",
    "standard": "4:3",
    "widescreen": "16:9"
  },
  "preview": {
    "label": "Aperçu :",
    "generating": "Génération...",
    "selectArea": "Sélectionner une zone pour l'aperçu",
    "altText": "Aperçu du recadrage",
    "thumbnailAlt": "Miniature de l'aperçu"
  },
  "actions": {
    "apply": "Appliquer le recadrage",
    "applying": "Application...",
    "cancel": "Annuler"
  },
  "status": {
    "loading": "Chargement de l'image...",
    "processing": "Application du recadrage..."
  },
  "warnings": {
    "largeImage": "Image volumineuse détectée. La sortie peut être réduite pour des raisons de compatibilité."
  },
  "errors": {
    "loadFailed": "Échec du chargement de l'image. Veuillez réessayer.",
    "cropFailed": "Échec de l'opération de recadrage",
    "dismissError": "Ignorer l'erreur"
  }
},
"trim": {
  "title": "Rogner la vidéo",
  "timeline": {
    "startMarker": "Point de début du rognage",
    "endMarker": "Point de fin du rognage",
    "startLabel": "D",
    "endLabel": "F"
  },
  "duration": {
    "selection": "Sélection :",
    "duration": "Durée :",
    "current": "Actuel :",
    "total": "Total :",
    "trimming": "Rognage de {time} ({percent}% de réduction)",
    "separator": "/"
  },
  "controls": {
    "skipToStart": "Aller au marqueur de début",
    "skipToEnd": "Aller au marqueur de fin",
    "play": "Lire la région rognée",
    "pause": "Pause"
  },
  "actions": {
    "apply": "Appliquer le rognage",
    "cancel": "Annuler",
    "tryAgain": "Réessayer"
  },
  "status": {
    "loading": "Chargement de la vidéo...",
    "error": "Erreur"
  },
  "errors": {
    "loadFailed": "Échec du chargement de la vidéo. Veuillez vérifier le fichier et réessayer.",
    "durationFailed": "Impossible de déterminer la durée de la vidéo",
    "playFailed": "Impossible de lire la vidéo. Veuillez réessayer.",
    "invalidSelection": "Sélection de rognage invalide",
    "startNegative": "L'heure de début ne peut pas être négative",
    "endExceedsDuration": "L'heure de fin dépasse la durée de la vidéo",
    "startAfterEnd": "L'heure de début doit précéder l'heure de fin",
    "belowMinDuration": "La durée minimale de rognage est de {min} {min, plural, one {seconde} other {secondes}}"
  }
},
"rotate": {
  "title": "Faire pivoter l'image",
  "editorLabel": "Éditeur de rotation d'image",
  "preview": {
    "altText": "Aperçu"
  },
  "controls": {
    "rotateLeft": "Faire pivoter l'image de 90 degrés vers la gauche",
    "rotateRight": "Faire pivoter l'image de 90 degrés vers la droite"
  },
  "info": {
    "currentRotation": "Rotation actuelle : {degrees}°",
    "modified": "(modifié)"
  },
  "keyboard": {
    "label": "Clavier :",
    "toRotate": "pour pivoter,",
    "toCancel": "pour annuler,",
    "toApply": "pour appliquer"
  },
  "actions": {
    "apply": "Appliquer la rotation",
    "applying": "Application...",
    "cancel": "Annuler",
    "tryAgain": "Réessayer"
  },
  "status": {
    "loading": "Chargement de l'image...",
    "processing": "Application de la rotation...",
    "processingAnnouncement": "Traitement de la rotation...",
    "rotatedAnnouncement": "Image pivotée à {degrees} degrés"
  },
  "errors": {
    "loadFailed": "Échec du chargement de l'image. Veuillez réessayer.",
    "rotationFailed": "Échec de la rotation de l'image. Veuillez réessayer.",
    "canvasUnavailable": "Votre navigateur ne prend pas en charge l'édition d'images.",
    "memoryError": "Mémoire insuffisante pour traiter l'image. Essayez de fermer d'autres onglets.",
    "blobCreationFailed": "Échec de la création de la sortie d'image. Veuillez réessayer."
  }
}
```

4. **Add Spanish translations** to `/messages/es.json`:

```json
"crop": {
  "title": "Recortar imagen",
  "aspectRatio": {
    "label": "Relación de aspecto",
    "free": "Libre",
    "square": "1:1",
    "standard": "4:3",
    "widescreen": "16:9"
  },
  "preview": {
    "label": "Vista previa:",
    "generating": "Generando...",
    "selectArea": "Seleccionar área para vista previa",
    "altText": "Vista previa del recorte",
    "thumbnailAlt": "Miniatura de vista previa"
  },
  "actions": {
    "apply": "Aplicar recorte",
    "applying": "Aplicando...",
    "cancel": "Cancelar"
  },
  "status": {
    "loading": "Cargando imagen...",
    "processing": "Aplicando recorte..."
  },
  "warnings": {
    "largeImage": "Imagen grande detectada. La salida puede reducirse por compatibilidad."
  },
  "errors": {
    "loadFailed": "Error al cargar la imagen. Por favor, inténtelo de nuevo.",
    "cropFailed": "Error en la operación de recorte",
    "dismissError": "Descartar error"
  }
},
"trim": {
  "title": "Recortar vídeo",
  "timeline": {
    "startMarker": "Punto de inicio del recorte",
    "endMarker": "Punto de fin del recorte",
    "startLabel": "I",
    "endLabel": "F"
  },
  "duration": {
    "selection": "Selección:",
    "duration": "Duración:",
    "current": "Actual:",
    "total": "Total:",
    "trimming": "Recortando {time} ({percent}% de reducción)",
    "separator": "/"
  },
  "controls": {
    "skipToStart": "Ir al marcador de inicio",
    "skipToEnd": "Ir al marcador de fin",
    "play": "Reproducir región recortada",
    "pause": "Pausa"
  },
  "actions": {
    "apply": "Aplicar recorte",
    "cancel": "Cancelar",
    "tryAgain": "Intentar de nuevo"
  },
  "status": {
    "loading": "Cargando vídeo...",
    "error": "Error"
  },
  "errors": {
    "loadFailed": "Error al cargar el vídeo. Por favor, verifique el archivo e inténtelo de nuevo.",
    "durationFailed": "No se puede determinar la duración del vídeo",
    "playFailed": "No se puede reproducir el vídeo. Por favor, inténtelo de nuevo.",
    "invalidSelection": "Selección de recorte no válida",
    "startNegative": "El tiempo de inicio no puede ser negativo",
    "endExceedsDuration": "El tiempo de fin excede la duración del vídeo",
    "startAfterEnd": "El tiempo de inicio debe ser anterior al tiempo de fin",
    "belowMinDuration": "La duración mínima de recorte es de {min} {min, plural, one {segundo} other {segundos}}"
  }
},
"rotate": {
  "title": "Rotar imagen",
  "editorLabel": "Editor de rotación de imagen",
  "preview": {
    "altText": "Vista previa"
  },
  "controls": {
    "rotateLeft": "Rotar imagen 90 grados a la izquierda",
    "rotateRight": "Rotar imagen 90 grados a la derecha"
  },
  "info": {
    "currentRotation": "Rotación actual: {degrees}°",
    "modified": "(modificado)"
  },
  "keyboard": {
    "label": "Teclado:",
    "toRotate": "para rotar,",
    "toCancel": "para cancelar,",
    "toApply": "para aplicar"
  },
  "actions": {
    "apply": "Aplicar rotación",
    "applying": "Aplicando...",
    "cancel": "Cancelar",
    "tryAgain": "Intentar de nuevo"
  },
  "status": {
    "loading": "Cargando imagen...",
    "processing": "Aplicando rotación...",
    "processingAnnouncement": "Procesando rotación...",
    "rotatedAnnouncement": "Imagen rotada a {degrees} grados"
  },
  "errors": {
    "loadFailed": "Error al cargar la imagen. Por favor, inténtelo de nuevo.",
    "rotationFailed": "Error al rotar la imagen. Por favor, inténtelo de nuevo.",
    "canvasUnavailable": "Su navegador no admite la edición de imágenes.",
    "memoryError": "Memoria insuficiente para procesar la imagen. Intente cerrar otras pestañas.",
    "blobCreationFailed": "Error al crear la salida de imagen. Por favor, inténtelo de nuevo."
  }
}
```

5. **Add Dutch translations** to `/messages/nl.json`:

```json
"crop": {
  "title": "Afbeelding bijsnijden",
  "aspectRatio": {
    "label": "Beeldverhouding",
    "free": "Vrij",
    "square": "1:1",
    "standard": "4:3",
    "widescreen": "16:9"
  },
  "preview": {
    "label": "Voorbeeld:",
    "generating": "Genereren...",
    "selectArea": "Selecteer gebied voor voorbeeld",
    "altText": "Bijsnijvoorbeeld",
    "thumbnailAlt": "Voorbeeld miniatuur"
  },
  "actions": {
    "apply": "Bijsnijden toepassen",
    "applying": "Toepassen...",
    "cancel": "Annuleren"
  },
  "status": {
    "loading": "Afbeelding laden...",
    "processing": "Bijsnijden toepassen..."
  },
  "warnings": {
    "largeImage": "Grote afbeelding gedetecteerd. De uitvoer kan worden verkleind voor compatibiliteit."
  },
  "errors": {
    "loadFailed": "Kan afbeelding niet laden. Probeer het opnieuw.",
    "cropFailed": "Bijsnijden mislukt",
    "dismissError": "Fout sluiten"
  }
},
"trim": {
  "title": "Video trimmen",
  "timeline": {
    "startMarker": "Start trim punt",
    "endMarker": "Eind trim punt",
    "startLabel": "S",
    "endLabel": "E"
  },
  "duration": {
    "selection": "Selectie:",
    "duration": "Duur:",
    "current": "Huidig:",
    "total": "Totaal:",
    "trimming": "Trimmen: {time} ({percent}% reductie)",
    "separator": "/"
  },
  "controls": {
    "skipToStart": "Ga naar startmarker",
    "skipToEnd": "Ga naar eindmarker",
    "play": "Getrimde regio afspelen",
    "pause": "Pauze"
  },
  "actions": {
    "apply": "Trimmen toepassen",
    "cancel": "Annuleren",
    "tryAgain": "Probeer opnieuw"
  },
  "status": {
    "loading": "Video laden...",
    "error": "Fout"
  },
  "errors": {
    "loadFailed": "Kan video niet laden. Controleer het bestand en probeer het opnieuw.",
    "durationFailed": "Kan videoduur niet bepalen",
    "playFailed": "Kan video niet afspelen. Probeer het opnieuw.",
    "invalidSelection": "Ongeldige trimselectie",
    "startNegative": "Starttijd kan niet negatief zijn",
    "endExceedsDuration": "Eindtijd overschrijdt videoduur",
    "startAfterEnd": "Starttijd moet voor eindtijd liggen",
    "belowMinDuration": "Minimale trimduur is {min} {min, plural, one {seconde} other {seconden}}"
  }
},
"rotate": {
  "title": "Afbeelding roteren",
  "editorLabel": "Afbeeldingsrotatie-editor",
  "preview": {
    "altText": "Voorbeeld"
  },
  "controls": {
    "rotateLeft": "Afbeelding 90 graden naar links draaien",
    "rotateRight": "Afbeelding 90 graden naar rechts draaien"
  },
  "info": {
    "currentRotation": "Huidige rotatie: {degrees}°",
    "modified": "(gewijzigd)"
  },
  "keyboard": {
    "label": "Toetsenbord:",
    "toRotate": "om te roteren,",
    "toCancel": "om te annuleren,",
    "toApply": "om toe te passen"
  },
  "actions": {
    "apply": "Rotatie toepassen",
    "applying": "Toepassen...",
    "cancel": "Annuleren",
    "tryAgain": "Probeer opnieuw"
  },
  "status": {
    "loading": "Afbeelding laden...",
    "processing": "Rotatie toepassen...",
    "processingAnnouncement": "Rotatie verwerken...",
    "rotatedAnnouncement": "Afbeelding geroteerd naar {degrees} graden"
  },
  "errors": {
    "loadFailed": "Kan afbeelding niet laden. Probeer het opnieuw.",
    "rotationFailed": "Kan afbeelding niet roteren. Probeer het opnieuw.",
    "canvasUnavailable": "Uw browser ondersteunt geen beeldbewerking.",
    "memoryError": "Onvoldoende geheugen om afbeelding te verwerken. Probeer andere tabbladen te sluiten.",
    "blobCreationFailed": "Kan afbeeldingsuitvoer niet maken. Probeer het opnieuw."
  }
}
```

6. **Add Italian translations** to `/messages/it.json`:

```json
"crop": {
  "title": "Ritaglia immagine",
  "aspectRatio": {
    "label": "Rapporto d'aspetto",
    "free": "Libero",
    "square": "1:1",
    "standard": "4:3",
    "widescreen": "16:9"
  },
  "preview": {
    "label": "Anteprima:",
    "generating": "Generazione...",
    "selectArea": "Seleziona area per anteprima",
    "altText": "Anteprima ritaglio",
    "thumbnailAlt": "Miniatura anteprima"
  },
  "actions": {
    "apply": "Applica ritaglio",
    "applying": "Applicazione...",
    "cancel": "Annulla"
  },
  "status": {
    "loading": "Caricamento immagine...",
    "processing": "Applicazione ritaglio..."
  },
  "warnings": {
    "largeImage": "Immagine grande rilevata. L'output potrebbe essere ridimensionato per compatibilità."
  },
  "errors": {
    "loadFailed": "Impossibile caricare l'immagine. Riprova.",
    "cropFailed": "Operazione di ritaglio non riuscita",
    "dismissError": "Ignora errore"
  }
},
"trim": {
  "title": "Taglia video",
  "timeline": {
    "startMarker": "Punto di inizio taglio",
    "endMarker": "Punto di fine taglio",
    "startLabel": "I",
    "endLabel": "F"
  },
  "duration": {
    "selection": "Selezione:",
    "duration": "Durata:",
    "current": "Corrente:",
    "total": "Totale:",
    "trimming": "Taglio di {time} ({percent}% di riduzione)",
    "separator": "/"
  },
  "controls": {
    "skipToStart": "Vai al marcatore di inizio",
    "skipToEnd": "Vai al marcatore di fine",
    "play": "Riproduci regione tagliata",
    "pause": "Pausa"
  },
  "actions": {
    "apply": "Applica taglio",
    "cancel": "Annulla",
    "tryAgain": "Riprova"
  },
  "status": {
    "loading": "Caricamento video...",
    "error": "Errore"
  },
  "errors": {
    "loadFailed": "Impossibile caricare il video. Verifica il file e riprova.",
    "durationFailed": "Impossibile determinare la durata del video",
    "playFailed": "Impossibile riprodurre il video. Riprova.",
    "invalidSelection": "Selezione di taglio non valida",
    "startNegative": "Il tempo di inizio non può essere negativo",
    "endExceedsDuration": "Il tempo di fine supera la durata del video",
    "startAfterEnd": "Il tempo di inizio deve precedere il tempo di fine",
    "belowMinDuration": "La durata minima di taglio è di {min} {min, plural, one {secondo} other {secondi}}"
  }
},
"rotate": {
  "title": "Ruota immagine",
  "editorLabel": "Editor rotazione immagine",
  "preview": {
    "altText": "Anteprima"
  },
  "controls": {
    "rotateLeft": "Ruota immagine di 90 gradi a sinistra",
    "rotateRight": "Ruota immagine di 90 gradi a destra"
  },
  "info": {
    "currentRotation": "Rotazione corrente: {degrees}°",
    "modified": "(modificato)"
  },
  "keyboard": {
    "label": "Tastiera:",
    "toRotate": "per ruotare,",
    "toCancel": "per annullare,",
    "toApply": "per applicare"
  },
  "actions": {
    "apply": "Applica rotazione",
    "applying": "Applicazione...",
    "cancel": "Annulla",
    "tryAgain": "Riprova"
  },
  "status": {
    "loading": "Caricamento immagine...",
    "processing": "Applicazione rotazione...",
    "processingAnnouncement": "Elaborazione rotazione...",
    "rotatedAnnouncement": "Immagine ruotata a {degrees} gradi"
  },
  "errors": {
    "loadFailed": "Impossibile caricare l'immagine. Riprova.",
    "rotationFailed": "Impossibile ruotare l'immagine. Riprova.",
    "canvasUnavailable": "Il tuo browser non supporta la modifica delle immagini.",
    "memoryError": "Memoria insufficiente per elaborare l'immagine. Prova a chiudere altre schede.",
    "blobCreationFailed": "Impossibile creare l'output dell'immagine. Riprova."
  }
}
```

#### 2.3 Verification

- [ ] All 5 non-English files have identical key structure to English
- [ ] All JSON files are valid (no syntax errors)
- [ ] Pluralization rules are correctly applied for each language
- [ ] Language-specific punctuation is correct (e.g., French colon spacing)

#### 2.4 Files Modified

| File | Action |
|------|--------|
| `/messages/de.json` | UPDATE - Add German translations |
| `/messages/es.json` | UPDATE - Add Spanish translations |
| `/messages/fr.json` | UPDATE - Add French translations |
| `/messages/it.json` | UPDATE - Add Italian translations |
| `/messages/nl.json` | UPDATE - Add Dutch translations |

---

### Task 3: Update ImageCropper Component

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Estimated Effort:** 45 minutes
**Story Points:** 1

#### 3.1 Objective

Replace all hardcoded strings in ImageCropper with translation function calls.

#### 3.2 Implementation Steps

1. **Add import** at the top of the file (after other imports):

```typescript
import { useTranslations } from 'next-intl';
```

2. **Initialize translation hooks** inside the component function (after existing hooks):

```typescript
const t = useTranslations('articles.crop');
const tCommon = useTranslations('common');
```

3. **Update ASPECT_RATIO_OPTIONS** constant (around line 80):

Replace:
```typescript
const ASPECT_RATIO_OPTIONS: { value: AspectRatioPreset; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
];
```

With a function inside the component:
```typescript
// Move inside component to access translations
const getAspectRatioOptions = () => [
  { value: 'free' as AspectRatioPreset, label: t('aspectRatio.free') },
  { value: '1:1' as AspectRatioPreset, label: t('aspectRatio.square') },
  { value: '4:3' as AspectRatioPreset, label: t('aspectRatio.standard') },
  { value: '16:9' as AspectRatioPreset, label: t('aspectRatio.widescreen') },
];
```

4. **Update error handling** (around line 165):

Replace:
```typescript
setError('Failed to load image. Please try again.');
```

With:
```typescript
setError(t('errors.loadFailed'));
```

5. **Update crop error** (around line 299-300):

Replace:
```typescript
const message = err instanceof Error ? err.message : 'Crop operation failed';
```

With:
```typescript
const message = err instanceof Error ? err.message : t('errors.cropFailed');
```

6. **Update large image warning** (around line 367):

Replace:
```typescript
<div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded mb-2">
  Large image detected. Output may be scaled down for compatibility.
</div>
```

With:
```typescript
<div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded mb-2">
  {t('warnings.largeImage')}
</div>
```

7. **Update loading state** (around line 400):

Replace:
```typescript
<span className="text-sm text-gray-500">Loading image...</span>
```

With:
```typescript
<span className="text-sm text-gray-500">{t('status.loading')}</span>
```

8. **Update processing state** (around line 410):

Replace:
```typescript
<span className="text-sm text-gray-600">Applying crop...</span>
```

With:
```typescript
<span className="text-sm text-gray-600">{t('status.processing')}</span>
```

9. **Update image alt text** (around line 431):

Replace:
```typescript
alt="Crop preview"
```

With:
```typescript
alt={t('preview.altText')}
```

10. **Update preview section** (around lines 442-452):

Replace:
```typescript
<span className="text-xs text-gray-500 font-medium">Preview:</span>
```

With:
```typescript
<span className="text-xs text-gray-500 font-medium">{t('preview.label')}</span>
```

Replace:
```typescript
<img
  src={previewUrl}
  alt="Crop preview thumbnail"
```

With:
```typescript
<img
  src={previewUrl}
  alt={t('preview.thumbnailAlt')}
```

Replace:
```typescript
{completedCrop ? 'Generating...' : 'Select area to preview'}
```

With:
```typescript
{completedCrop ? t('preview.generating') : t('preview.selectArea')}
```

11. **Update dismiss error button** (around line 466):

Replace:
```typescript
aria-label="Dismiss error"
```

With:
```typescript
aria-label={t('errors.dismissError')}
```

12. **Update action buttons** (around lines 486-499):

Replace:
```typescript
{isProcessing ? 'Applying...' : 'Apply Crop'}
```

With:
```typescript
{isProcessing ? t('actions.applying') : t('actions.apply')}
```

Replace:
```typescript
>
  Cancel
</button>
```

With:
```typescript
>
  {tCommon('cancel')}
</button>
```

13. **Update aspect ratio button rendering** to use the function:

Replace:
```typescript
{ASPECT_RATIO_OPTIONS.map((option) => (
```

With:
```typescript
{getAspectRatioOptions().map((option) => (
```

#### 3.3 Verification

- [ ] Component compiles without errors
- [ ] All visible text comes from translation functions
- [ ] Aspect ratio labels display correctly
- [ ] Error messages display in user's language
- [ ] Aria-labels use translations

#### 3.4 Files Modified

| File | Action |
|------|--------|
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | UPDATE - Add translations |

---

### Task 4: Update VideoTrimmer Component

**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Estimated Effort:** 45 minutes
**Story Points:** 1

#### 4.1 Objective

Replace all hardcoded strings in VideoTrimmer with translation function calls.

#### 4.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Initialize translation hooks** inside the component function:

```typescript
const t = useTranslations('articles.trim');
const tCommon = useTranslations('common');
```

3. **Update error on duration check** (around line 150-151):

Replace:
```typescript
setError('Unable to determine video duration');
```

With:
```typescript
setError(t('errors.durationFailed'));
```

4. **Update video load error** (around line 196):

Replace:
```typescript
setError('Failed to load video. Please check the file and try again.');
```

With:
```typescript
setError(t('errors.loadFailed'));
```

5. **Update play error** (around line 228-229):

Replace:
```typescript
setError('Unable to play video. Please try again.');
```

With:
```typescript
setError(t('errors.playFailed'));
```

6. **Update validation error** (around line 445):

Replace:
```typescript
setError(validation.error || 'Invalid trim selection');
```

With:
```typescript
setError(validation.error || t('errors.invalidSelection'));
```

7. **Update error display** (around lines 505-518):

Replace:
```typescript
<p className="text-sm font-medium">Error</p>
<p className="text-sm mt-1">{error}</p>
<button
  onClick={() => { /* ... */ }}
  className="mt-2 text-sm text-red-600 underline hover:text-red-800"
>
  Try again
</button>
```

With:
```typescript
<p className="text-sm font-medium">{t('status.error')}</p>
<p className="text-sm mt-1">{error}</p>
<button
  onClick={() => { /* ... */ }}
  className="mt-2 text-sm text-red-600 underline hover:text-red-800"
>
  {t('actions.tryAgain')}
</button>
```

8. **Update loading state** (around lines 541-543):

Replace:
```typescript
<span className="text-sm text-gray-600">Loading video...</span>
```

With:
```typescript
<span className="text-sm text-gray-600">{t('status.loading')}</span>
```

9. **Update start marker** (around lines 600-611):

Replace:
```typescript
aria-label="Start trim point"
```

With:
```typescript
aria-label={t('timeline.startMarker')}
```

Replace:
```typescript
<span className="text-white text-xs font-bold">S</span>
```

With:
```typescript
<span className="text-white text-xs font-bold">{t('timeline.startLabel')}</span>
```

10. **Update end marker** (around lines 626-638):

Replace:
```typescript
aria-label="End trim point"
```

With:
```typescript
aria-label={t('timeline.endMarker')}
```

Replace:
```typescript
<span className="text-white text-xs font-bold">E</span>
```

With:
```typescript
<span className="text-white text-xs font-bold">{t('timeline.endLabel')}</span>
```

11. **Update duration display labels** (around lines 664-683):

Replace:
```typescript
<span className="hidden sm:inline font-medium">Selection: </span>
```

With:
```typescript
<span className="hidden sm:inline font-medium">{t('duration.selection')} </span>
```

Replace:
```typescript
<span className="hidden sm:inline font-medium">Duration: </span>
```

With:
```typescript
<span className="hidden sm:inline font-medium">{t('duration.duration')} </span>
```

Replace:
```typescript
<span className="mx-1 sm:mx-2 text-gray-400">|</span>
```

With:
```typescript
<span className="mx-1 sm:mx-2 text-gray-400">{t('duration.separator')}</span>
```

12. **Update current time label** (around line 676):

Replace:
```typescript
Current: <span className="font-mono">{formatTime(currentTime)}</span>
```

With:
```typescript
{t('duration.current')} <span className="font-mono">{formatTime(currentTime)}</span>
```

13. **Update trim savings indicator** (around lines 680-684):

Replace:
```typescript
Trimming {formatTime(duration - (endMarker - startMarker))} (
{Math.round((1 - (endMarker - startMarker) / duration) * 100)}% reduction)
```

With:
```typescript
{t('duration.trimming', {
  time: formatTime(duration - (endMarker - startMarker)),
  percent: Math.round((1 - (endMarker - startMarker) / duration) * 100)
})}
```

14. **Update playback control buttons** (around lines 700-729):

Replace:
```typescript
aria-label="Skip to start marker"
```

With:
```typescript
aria-label={t('controls.skipToStart')}
```

Replace:
```typescript
aria-label={isPlaying ? 'Pause' : 'Play trimmed region'}
```

With:
```typescript
aria-label={isPlaying ? t('controls.pause') : t('controls.play')}
```

Replace:
```typescript
aria-label="Skip to end marker"
```

With:
```typescript
aria-label={t('controls.skipToEnd')}
```

15. **Update action buttons** (around lines 750-766):

Replace:
```typescript
>
  Cancel
</button>
```

With:
```typescript
>
  {tCommon('cancel')}
</button>
```

Replace:
```typescript
>
  Apply Trim
</button>
```

With:
```typescript
>
  {t('actions.apply')}
</button>
```

#### 4.3 Verification

- [ ] Component compiles without errors
- [ ] All visible text comes from translation functions
- [ ] Timeline markers display correct labels
- [ ] Duration info displays in user's language
- [ ] Error messages are translated
- [ ] Aria-labels use translations

#### 4.4 Files Modified

| File | Action |
|------|--------|
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | UPDATE - Add translations |

---

### Task 5: Update ImageRotator Component

**File:** `/src/components/ItemCapture/editors/ImageRotator.tsx`
**Estimated Effort:** 30 minutes
**Story Points:** 1

#### 5.1 Objective

Replace all hardcoded strings in ImageRotator with translation function calls.

#### 5.2 Implementation Steps

1. **Add import** at the top of the file:

```typescript
import { useTranslations } from 'next-intl';
```

2. **Initialize translation hooks** inside the component function:

```typescript
const t = useTranslations('articles.rotate');
const tCommon = useTranslations('common');
```

3. **Update rotation announcement function** (around line 328-330):

Replace:
```typescript
const getRotationAnnouncement = () => {
  return `Image rotated to ${currentRotation} degrees`;
};
```

With:
```typescript
const getRotationAnnouncement = () => {
  return t('status.rotatedAnnouncement', { degrees: currentRotation });
};
```

4. **Update editor aria-label** (around line 340):

Replace:
```typescript
aria-label="Image rotation editor"
```

With:
```typescript
aria-label={t('editorLabel')}
```

5. **Update screen reader announcement** (around line 355):

Replace:
```typescript
{isProcessing && 'Processing rotation...'}
```

With:
```typescript
{isProcessing && t('status.processingAnnouncement')}
```

6. **Update loading state** (around line 371):

Replace:
```typescript
<span className="text-sm text-gray-500">Loading image...</span>
```

With:
```typescript
<span className="text-sm text-gray-500">{t('status.loading')}</span>
```

7. **Update processing overlay** (around line 381):

Replace:
```typescript
<span className="text-sm text-gray-600">Applying rotation...</span>
```

With:
```typescript
<span className="text-sm text-gray-600">{t('status.processing')}</span>
```

8. **Update image alt text** (around line 400):

Replace:
```typescript
alt="Preview"
```

With:
```typescript
alt={t('preview.altText')}
```

9. **Update retry button** (around line 422):

Replace:
```typescript
>
  Try Again
</button>
```

With:
```typescript
>
  {t('actions.tryAgain')}
</button>
```

10. **Update rotation control buttons** (around lines 433, 446):

Replace:
```typescript
aria-label="Rotate image left 90 degrees"
```

With:
```typescript
aria-label={t('controls.rotateLeft')}
```

Replace:
```typescript
aria-label="Rotate image right 90 degrees"
```

With:
```typescript
aria-label={t('controls.rotateRight')}
```

11. **Update rotation info** (around lines 463-465):

Replace:
```typescript
Current rotation: {currentRotation}°
{currentRotation !== initialRotation && (
  <span className="text-blue-500 ml-2">(modified)</span>
)}
```

With:
```typescript
{t('info.currentRotation', { degrees: currentRotation })}
{currentRotation !== initialRotation && (
  <span className="text-blue-500 ml-2">{t('info.modified')}</span>
)}
```

12. **Update keyboard help** (around lines 471-479):

Replace:
```typescript
<span>Keyboard: </span>
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">←</kbd>
<span> / </span>
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">→</kbd>
<span> to rotate, </span>
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Esc</kbd>
<span> to cancel, </span>
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">⌘+Enter</kbd>
<span> to apply</span>
```

With:
```typescript
<span>{t('keyboard.label')} </span>
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">←</kbd>
<span> / </span>
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">→</kbd>
<span> {t('keyboard.toRotate')} </span>
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Esc</kbd>
<span> {t('keyboard.toCancel')} </span>
<kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">⌘+Enter</kbd>
<span> {t('keyboard.toApply')}</span>
```

13. **Update action buttons** (around lines 496, 510):

Replace:
```typescript
{isProcessing ? 'Applying...' : 'Apply Rotation'}
```

With:
```typescript
{isProcessing ? t('actions.applying') : t('actions.apply')}
```

Replace:
```typescript
>
  Cancel
</button>
```

With:
```typescript
>
  {tCommon('cancel')}
</button>
```

#### 5.3 Verification

- [ ] Component compiles without errors
- [ ] All visible text comes from translation functions
- [ ] Rotation info displays correctly with interpolation
- [ ] Keyboard help text is translated
- [ ] Screen reader announcements use translations
- [ ] Aria-labels use translations

#### 5.4 Files Modified

| File | Action |
|------|--------|
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | UPDATE - Add translations |

---

### Task 6: Update rotationUtils.ts Error Messages

**File:** `/src/components/ItemCapture/editors/rotationUtils.ts`
**Estimated Effort:** 15 minutes
**Story Points:** 0.5

#### 6.1 Objective

The `ROTATION_ERROR_MESSAGES` constant contains hardcoded error messages. These should be replaced with translation keys, with the actual translation handled in the component.

#### 6.2 Implementation Steps

1. **Update the error message keys** to be translation keys:

Replace:
```typescript
export const ROTATION_ERROR_MESSAGES = {
  IMAGE_LOAD_FAILED: 'Failed to load image. Please try again.',
  ROTATION_FAILED: 'Failed to rotate image. Please try again.',
  CANVAS_UNAVAILABLE: 'Your browser does not support image editing.',
  MEMORY_ERROR: 'Not enough memory to process image. Try closing other tabs.',
  BLOB_CREATION_FAILED: 'Failed to create image output. Please try again.',
} as const;
```

With:
```typescript
/**
 * Translation keys for rotation error messages.
 * Use with t('errors.{key}') from articles.rotate namespace.
 */
export const ROTATION_ERROR_KEYS = {
  IMAGE_LOAD_FAILED: 'loadFailed',
  ROTATION_FAILED: 'rotationFailed',
  CANVAS_UNAVAILABLE: 'canvasUnavailable',
  MEMORY_ERROR: 'memoryError',
  BLOB_CREATION_FAILED: 'blobCreationFailed',
} as const;

/**
 * @deprecated Use ROTATION_ERROR_KEYS with translations instead.
 * Kept for backwards compatibility during migration.
 */
export const ROTATION_ERROR_MESSAGES = {
  IMAGE_LOAD_FAILED: 'Failed to load image. Please try again.',
  ROTATION_FAILED: 'Failed to rotate image. Please try again.',
  CANVAS_UNAVAILABLE: 'Your browser does not support image editing.',
  MEMORY_ERROR: 'Not enough memory to process image. Try closing other tabs.',
  BLOB_CREATION_FAILED: 'Failed to create image output. Please try again.',
} as const;
```

2. **Update ImageRotator component** to use translation for error messages from rotationUtils:

In `ImageRotator.tsx`, update error handling to translate the error:

```typescript
// When catching errors from rotationUtils
const errorKey = ROTATION_ERROR_KEYS[errorType] || 'rotationFailed';
setError(t(`errors.${errorKey}`));
```

#### 6.3 Verification

- [ ] Error keys are exported correctly
- [ ] Backwards compatibility is maintained
- [ ] Component translates errors correctly

#### 6.4 Files Modified

| File | Action |
|------|--------|
| `/src/components/ItemCapture/editors/rotationUtils.ts` | UPDATE - Add translation keys |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | UPDATE - Use translation keys |

---

### Task 7: Update trimUtils.ts Validation Messages

**File:** `/src/components/ItemCapture/editors/trimUtils.ts`
**Estimated Effort:** 15 minutes
**Story Points:** 0.5

#### 7.1 Objective

The `validateTrim` function returns hardcoded error messages. Create a version that returns error keys for translation.

#### 7.2 Implementation Steps

1. **Add translation key interface and function**:

```typescript
/**
 * Translation keys for trim validation errors.
 * Use with t('errors.{key}') from articles.trim namespace.
 */
export const TRIM_ERROR_KEYS = {
  START_NEGATIVE: 'startNegative',
  END_EXCEEDS_DURATION: 'endExceedsDuration',
  START_AFTER_END: 'startAfterEnd',
  BELOW_MIN_DURATION: 'belowMinDuration',
} as const;

export interface TrimValidationWithKey {
  isValid: boolean;
  errorKey?: keyof typeof TRIM_ERROR_KEYS;
  errorParams?: Record<string, number>;
  /** @deprecated Use errorKey with translations instead */
  error?: string;
}

/**
 * Validate trim marker positions with translation keys
 * @param startTime - Start marker position in seconds
 * @param endTime - End marker position in seconds
 * @param duration - Total video duration in seconds
 * @param minDuration - Minimum allowed trim duration (default: 1 second)
 * @returns Validation result with error key for translation
 */
export function validateTrimWithKeys(
  startTime: number,
  endTime: number,
  duration: number,
  minDuration: number = 1
): TrimValidationWithKey {
  if (startTime < 0) {
    return {
      isValid: false,
      errorKey: 'START_NEGATIVE',
      error: 'Start time cannot be negative'
    };
  }
  if (endTime > duration) {
    return {
      isValid: false,
      errorKey: 'END_EXCEEDS_DURATION',
      error: 'End time exceeds video duration'
    };
  }
  if (startTime >= endTime) {
    return {
      isValid: false,
      errorKey: 'START_AFTER_END',
      error: 'Start time must be before end time'
    };
  }
  if (endTime - startTime < minDuration) {
    return {
      isValid: false,
      errorKey: 'BELOW_MIN_DURATION',
      errorParams: { min: minDuration },
      error: `Minimum trim duration is ${minDuration} second${minDuration !== 1 ? 's' : ''}`,
    };
  }
  return { isValid: true };
}
```

2. **Update VideoTrimmer component** to use the new validation:

```typescript
// In handleApplyTrim function
const validation = validateTrimWithKeys(startMarker, endMarker, duration, minTrimDuration);
if (!validation.isValid) {
  const errorKey = validation.errorKey ? TRIM_ERROR_KEYS[validation.errorKey] : 'invalidSelection';
  const errorMessage = validation.errorParams
    ? t(`errors.${errorKey}`, validation.errorParams)
    : t(`errors.${errorKey}`);
  setError(errorMessage);
  return;
}
```

#### 7.3 Verification

- [ ] New validation function works correctly
- [ ] Error keys map to translation keys
- [ ] Backwards compatibility is maintained
- [ ] Pluralization works for min duration

#### 7.4 Files Modified

| File | Action |
|------|--------|
| `/src/components/ItemCapture/editors/trimUtils.ts` | UPDATE - Add translation key validation |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | UPDATE - Use translation key validation |

---

### Task 8: Testing and Validation

**Estimated Effort:** 45 minutes
**Story Points:** 1

#### 8.1 Objective

Verify all three components work correctly in all supported languages.

#### 8.2 Testing Steps

1. **Build verification**:
   ```bash
   npm run build
   ```
   - [ ] Build completes without errors
   - [ ] No TypeScript errors
   - [ ] No missing translation key warnings

2. **English verification**:
   - [ ] ImageCropper displays all aspect ratio labels correctly
   - [ ] ImageCropper shows loading/processing states
   - [ ] ImageCropper shows errors when triggered
   - [ ] VideoTrimmer displays timeline marker labels
   - [ ] VideoTrimmer shows duration info correctly
   - [ ] VideoTrimmer shows playback control labels
   - [ ] ImageRotator displays rotation info
   - [ ] ImageRotator shows keyboard shortcuts help
   - [ ] All action buttons display correct text

3. **German verification** (typically longest text):
   - [ ] No text overflow in buttons
   - [ ] No layout breaks in any component
   - [ ] Keyboard shortcuts section renders correctly
   - [ ] Duration info displays without wrapping issues

4. **French verification** (includes special punctuation):
   - [ ] Colons have correct spacing
   - [ ] All strings display correctly
   - [ ] No missing translations

5. **Test each other language** (Spanish, Dutch, Italian):
   - [ ] Basic rendering check
   - [ ] No console errors about missing keys

6. **Accessibility verification**:
   - [ ] Screen reader announcements work in non-English
   - [ ] All aria-labels are translated
   - [ ] Focus order is maintained

#### 8.3 Verification Checklist

- [ ] All 6 languages render without missing key warnings
- [ ] No console errors related to translations
- [ ] Layout is stable across all languages
- [ ] Pluralization works correctly (trim duration message)
- [ ] Variable interpolation works (rotation degrees, trim savings)
- [ ] Screen reader experience is localized

---

## Files Summary

### Files to Create

None - all changes are to existing files.

### Files to Modify

| File | Task | Changes |
|------|------|---------|
| `/messages/en.json` | 1 | Add complete crop/trim/rotate keys |
| `/messages/de.json` | 2 | Add German translations |
| `/messages/es.json` | 2 | Add Spanish translations |
| `/messages/fr.json` | 2 | Add French translations |
| `/messages/it.json` | 2 | Add Italian translations |
| `/messages/nl.json` | 2 | Add Dutch translations |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | 3 | Add useTranslations, replace strings |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | 4 | Add useTranslations, replace strings |
| `/src/components/ItemCapture/editors/ImageRotator.tsx` | 5 | Add useTranslations, replace strings |
| `/src/components/ItemCapture/editors/rotationUtils.ts` | 6 | Add translation keys for errors |
| `/src/components/ItemCapture/editors/trimUtils.ts` | 7 | Add translation key validation |

### Files NOT to Modify

- `/src/components/ItemCapture/editors/imageCropper.css` - CSS only
- `/src/components/ItemCapture/editors/cropUtils.ts` - No user-facing strings
- Test files - May need separate updates

---

## Dependencies

### Required Before Starting

| Dependency | Status | Notes |
|------------|--------|-------|
| Epic 1 Foundation | REQUIRED | next-intl must be installed and configured |
| REQ-392 Complete | REQUIRED | Articles namespace must exist in message files |

### Blocked By

- REQ-392: Create articles namespace structure (must have base namespace)

### Blocks

- None identified

---

## Acceptance Criteria Checklist

From the original request (REQ-395):

- [ ] Image crop utility displays translated labels for all aspect ratio preset options
- [ ] Crop control buttons including apply, cancel, reset, and rotate use translation keys
- [ ] Grid overlay toggle and zoom control labels appear in the user's selected language (N/A - not present in current implementation)
- [ ] Video trim utility shows translated labels for timeline markers and playback controls
- [ ] Time duration displays format hours, minutes, and seconds according to locale conventions
- [ ] Trim range indicators display start time, end time, and duration with translated labels
- [ ] Action buttons for trim operations use translation keys for apply, cancel, and preview
- [ ] Validation messages for duration limits and trim range errors retrieve text from translation files
- [ ] Warning messages about file size impacts appear in the user's language (covered by large image warning)
- [ ] Success messages for completed crop or trim operations use translated text (handled by parent components)
- [ ] All utility components maintain existing functionality after internationalization
- [ ] Translation keys follow the articles.crop and articles.trim namespace conventions
- [ ] Long translated text in control labels does not break component layouts
- [ ] Time formatting adapts to locale-specific conventions for each supported language
- [ ] Crop and trim utilities render correctly in all supported languages without UI issues

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Longer German text breaks layouts | Medium | Low | Test with German first, use flexible CSS |
| Missing translations at runtime | Low | Medium | Build-time checks, fallback to English |
| Regression in existing functionality | Low | High | Run existing tests, manual testing |
| Variable interpolation issues | Low | Medium | Test all interpolated strings |
| Pluralization syntax errors | Low | Medium | Validate ICU format in JSON |

---

## Rollback Plan

If issues arise after implementation:

1. **Revert component changes**: Reset ImageCropper, VideoTrimmer, ImageRotator to previous versions
2. **Keep translation keys**: The message file additions don't affect runtime if not used
3. **Git revert**: `git revert <commit-hash>` for the implementation commit

---

## References

- [REQ-395 Overview Document](./REQ-395-update-croptrim-utilities-overview.md)
- [Implementation Plan: L10N Epic 2](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [REQ-392: Create articles namespace structure](./REQ-392-create-articles-namespace-structure-detailed.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Static UI Translation*
*Task 2E.4: Update crop/trim utilities*
