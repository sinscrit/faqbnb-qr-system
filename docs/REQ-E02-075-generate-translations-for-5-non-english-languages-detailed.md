# REQ-E02-075: Generate Translations for Articles Namespace (5 Non-English Languages) - Detailed Task Breakdown

**Generated:** 2026-01-20 23:15:00 UTC
**Last Modified:** 2026-01-20 23:15:00 UTC
**Request ID:** REQ-E02-075
**Epic:** Localization Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.6
**Type:** NEW FEATURE
**Size:** L (Large)
**Estimated Strings:** ~300 (articles namespace)

---

## Executive Summary

This document provides granular, actionable implementation tasks for generating complete translations of the `articles` namespace strings into five non-English languages: Spanish (es), French (fr), German (de), Dutch (nl), and Italian (it).

**Important Note:** The original request mentions Portuguese, but per the project's i18n configuration (`/src/lib/i18n/config.ts`), the supported non-English languages are French (fr), Spanish (es), German (de), Dutch (nl), and Italian (it). This document follows the established project configuration.

---

## Prerequisites

Before starting any task in this document, verify:

- [ ] Epic 1 Foundation is complete (next-intl installed and configured)
- [ ] Tasks 2E.1-2E.5 are complete (English `articles` namespace exists in `/messages/en.json`)
- [ ] Translation files exist for all target languages: `/messages/{fr,es,de,nl,it}.json`
- [ ] Build passes: `npm run build` completes without errors

---

## Task List

### Task 1: Verify English Articles Namespace Completeness

**Story Points:** 1
**Type:** Verification/Analysis
**Files:** `/messages/en.json` (READ ONLY)

#### Description
Before generating translations, verify that the English `articles` namespace is complete and contains all expected strings from components updated in Tasks 2E.1-2E.5.

#### Acceptance Criteria
- [ ] `/messages/en.json` contains an `articles` namespace at root level
- [ ] All expected sub-namespaces are present (see Expected Structure below)
- [ ] Total string count is documented (expected ~300 strings)
- [ ] Any missing strings are identified and documented

#### Implementation Steps

1. **Read the English translation file:**
   ```bash
   cat /messages/en.json | grep -A 500 '"articles"'
   ```

2. **Verify namespace structure exists:**
   The `articles` namespace should contain these sub-namespaces:
   - `title` - Page title
   - `subtitle` - Page subtitle
   - `list` - List/table view (~15 strings)
   - `grid` - Grid view (~5 strings)
   - `card` - Article card (~12 strings)
   - `toolbar` - Toolbar UI (~10 strings)
   - `columns` - Table columns (~8 strings)
   - `sort` - Sort options (~10 strings)
   - `filters` - Filter options (~12 strings)
   - `editor` - Markdown editor (~35 strings)
   - `media` - Media upload (~18 strings)
   - `crop` - Image cropper (~22 strings)
   - `video` - Video trimmer (~14 strings)
   - `rotate` - Image rotator (~10 strings)
   - `assets` - Asset panel (~25 strings)
   - `viewer` - Content viewers (~35 strings)
   - `purposes` - Purpose types (~8 strings)
   - `status` - Status indicators (~5 strings)
   - `actions` - Action buttons (~18 strings)
   - `empty` - Empty states (~8 strings)
   - `loading` - Loading states (~6 strings)
   - `validation` - Validation messages (~6 strings)
   - `errors` - Error messages (~8 strings)
   - `success` - Success messages (~6 strings)
   - `auth` - Auth messages (~4 strings)

3. **Count total keys:**
   ```bash
   grep -c '"articles\.' /messages/en.json
   ```

4. **Document findings:**
   - Record actual string count
   - Note any missing sub-namespaces
   - If namespace is incomplete, STOP and complete Tasks 2E.1-2E.5 first

#### Dependencies
- Tasks 2E.1-2E.5 must be complete

---

### Task 2: Generate French (fr) Translations

**Story Points:** 3
**Type:** Translation Generation
**File:** `/messages/fr.json`

#### Description
Add the complete `articles` namespace with accurate French translations to the French translation file.

#### Translation Guidelines for French
- Use formal "vous" form consistently
- Maintain consistent terminology with existing `fr.json` translations
- Use proper French typography (space before `:`, `?`, `!`, `;`)
- Handle pluralization using ICU format with French rules
- Preserve variable placeholders exactly as in English (`{variable}`)

#### Acceptance Criteria
- [ ] `articles` namespace added to `/messages/fr.json`
- [ ] All keys from English `articles` namespace are present
- [ ] No untranslated English strings remain
- [ ] Terminology is consistent with existing French translations
- [ ] Variable placeholders `{variable}` are preserved exactly
- [ ] ICU pluralization format is correct for French
- [ ] JSON syntax is valid (no trailing commas, proper escaping)

#### Implementation Steps

1. **Read the current French translation file:**
   ```bash
   cat /messages/fr.json
   ```

2. **Copy the English `articles` namespace structure**

3. **Translate each string following these guidelines:**

   **Page-level strings:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.title | Guides |
   | articles.subtitle | Gérer les articles de guide pour vos articles |

   **List/Table view:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.list.title | Guides |
   | articles.list.noGuides | Aucun guide disponible |
   | articles.list.noResults | Aucun guide ne correspond à votre recherche |
   | articles.list.searchPlaceholder | Rechercher des guides... |
   | articles.list.allGuides | Tous les guides |
   | articles.list.viewAs | Afficher comme |
   | articles.list.listView | Liste |
   | articles.list.gridView | Grille |

   **Editor strings:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.editor.title | Modifier le contenu |
   | articles.editor.tabs.editor | Éditeur |
   | articles.editor.tabs.preview | Aperçu |
   | articles.editor.toolbar.bold | Gras |
   | articles.editor.toolbar.italic | Italique |
   | articles.editor.toolbar.heading | Titre |
   | articles.editor.toolbar.heading1 | Titre 1 |
   | articles.editor.toolbar.heading2 | Titre 2 |
   | articles.editor.toolbar.heading3 | Titre 3 |
   | articles.editor.toolbar.bulletList | Liste à puces |
   | articles.editor.toolbar.numberedList | Liste numérotée |
   | articles.editor.toolbar.link | Lien |
   | articles.editor.toolbar.image | Image |
   | articles.editor.toolbar.code | Code |
   | articles.editor.toolbar.quote | Citation |
   | articles.editor.toolbar.undo | Annuler |
   | articles.editor.toolbar.redo | Rétablir |
   | articles.editor.placeholder | Rédigez votre contenu ici en utilisant le format markdown... |
   | articles.editor.characterCount | {current} / {max} caractères |
   | articles.editor.unsavedChanges | Modifications non enregistrées |
   | articles.editor.autoSaved | Enregistrement automatique activé |

   **Media upload strings:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.media.upload | Téléverser des médias |
   | articles.media.dragDrop | Glissez et déposez les fichiers ici |
   | articles.media.or | ou |
   | articles.media.browse | Parcourir les fichiers |
   | articles.media.supportedFormats | Formats pris en charge : {formats} |
   | articles.media.maxSize | Taille maximale du fichier : {size} Mo |
   | articles.media.uploading | Téléversement en cours... |
   | articles.media.uploadSuccess | Téléversement réussi |
   | articles.media.uploadFailed | Échec du téléversement |
   | articles.media.remove | Supprimer |
   | articles.media.preview | Aperçu |
   | articles.media.alt | Texte alternatif |
   | articles.media.caption | Légende |

   **Crop tool strings:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.crop.title | Recadrer l'image |
   | articles.crop.aspectRatio | Rapport d'aspect |
   | articles.crop.freeform | Libre |
   | articles.crop.square | Carré |
   | articles.crop.landscape | Paysage |
   | articles.crop.portrait | Portrait |
   | articles.crop.original | Original |
   | articles.crop.custom | Personnalisé |
   | articles.crop.applyCrop | Appliquer le recadrage |
   | articles.crop.reset | Réinitialiser |
   | articles.crop.cancel | Annuler |
   | articles.crop.zoomIn | Zoom avant |
   | articles.crop.zoomOut | Zoom arrière |
   | articles.crop.rotateLeft | Rotation gauche |
   | articles.crop.rotateRight | Rotation droite |
   | articles.crop.flipHorizontal | Retourner horizontalement |
   | articles.crop.flipVertical | Retourner verticalement |

   **Video trimmer strings:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.video.title | Découper la vidéo |
   | articles.video.startTime | Heure de début |
   | articles.video.endTime | Heure de fin |
   | articles.video.duration | Durée : {duration} |
   | articles.video.applyTrim | Appliquer le découpage |
   | articles.video.reset | Réinitialiser |
   | articles.video.preview | Aperçu |
   | articles.video.play | Lecture |
   | articles.video.pause | Pause |
   | articles.video.mute | Couper le son |
   | articles.video.unmute | Activer le son |

   **Asset panel strings:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.assets.title | Ressources |
   | articles.assets.addAsset | Ajouter une ressource |
   | articles.assets.removeAsset | Supprimer la ressource |
   | articles.assets.confirmRemove | Êtes-vous sûr de vouloir supprimer cette ressource ? |
   | articles.assets.reorder | Réorganiser |
   | articles.assets.dragToReorder | Glissez pour réorganiser |
   | articles.assets.noAssets | Aucune ressource |
   | articles.assets.addFirst | Ajoutez votre première ressource |

   **Viewer strings:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.viewer.gallery.title | Galerie |
   | articles.viewer.gallery.previous | Précédent |
   | articles.viewer.gallery.next | Suivant |
   | articles.viewer.gallery.close | Fermer |
   | articles.viewer.gallery.fullscreen | Plein écran |
   | articles.viewer.gallery.exitFullscreen | Quitter le plein écran |
   | articles.viewer.gallery.of | sur |
   | articles.viewer.document.download | Télécharger |
   | articles.viewer.document.print | Imprimer |
   | articles.viewer.document.zoom | Zoom |

   **Purpose types:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.purposes.howToUse | Comment utiliser |
   | articles.purposes.troubleshooting | Dépannage |
   | articles.purposes.maintenance | Entretien |
   | articles.purposes.safety | Informations de sécurité |
   | articles.purposes.warranty | Garantie et support |
   | articles.purposes.other | Autre |

   **Status indicators:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.status.draft | Brouillon |
   | articles.status.published | Publié |
   | articles.status.archived | Archivé |
   | articles.status.pending | En attente |

   **Action buttons:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.actions.create | Créer un guide |
   | articles.actions.edit | Modifier |
   | articles.actions.delete | Supprimer |
   | articles.actions.duplicate | Dupliquer |
   | articles.actions.preview | Aperçu |
   | articles.actions.publish | Publier |
   | articles.actions.unpublish | Dépublier |
   | articles.actions.archive | Archiver |
   | articles.actions.restore | Restaurer |
   | articles.actions.save | Enregistrer |
   | articles.actions.saveAndClose | Enregistrer et fermer |
   | articles.actions.saveChanges | Enregistrer les modifications |
   | articles.actions.discardChanges | Annuler les modifications |

   **Empty states:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.empty.title | Pas encore de guides |
   | articles.empty.description | Créez votre premier guide pour commencer |
   | articles.empty.action | Créer un guide |
   | articles.empty.noResults | Aucun résultat trouvé |
   | articles.empty.tryDifferentFilters | Essayez avec des filtres différents |

   **Loading states:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.loading.guides | Chargement des guides... |
   | articles.loading.content | Chargement du contenu... |
   | articles.loading.saving | Enregistrement en cours... |
   | articles.loading.deleting | Suppression en cours... |

   **Validation messages:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.validation.titleRequired | Le titre du guide est requis |
   | articles.validation.contentRequired | Le contenu est requis |
   | articles.validation.titleTooLong | Le titre ne peut pas dépasser {max} caractères |
   | articles.validation.invalidFormat | Format invalide |

   **Error messages:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.errors.loadFailed | Échec du chargement du guide |
   | articles.errors.saveFailed | Échec de l'enregistrement du guide |
   | articles.errors.deleteFailed | Échec de la suppression du guide |
   | articles.errors.notFound | Guide non trouvé |
   | articles.errors.unauthorized | Vous n'avez pas la permission de modifier ce guide |

   **Success messages:**
   | English Key | French Translation |
   |-------------|-------------------|
   | articles.success.saved | Guide enregistré avec succès |
   | articles.success.deleted | Guide supprimé avec succès |
   | articles.success.published | Guide publié avec succès |
   | articles.success.duplicated | Guide dupliqué avec succès |

4. **Validate JSON syntax:**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('/messages/fr.json'))"
   ```

5. **Verify key count matches English:**
   ```bash
   grep -c '"articles\.' /messages/fr.json
   ```

#### Dependencies
- Task 1 must be complete (English namespace verified)

---

### Task 3: Generate Spanish (es) Translations

**Story Points:** 3
**Type:** Translation Generation
**File:** `/messages/es.json`

#### Description
Add the complete `articles` namespace with accurate Spanish translations to the Spanish translation file.

#### Translation Guidelines for Spanish
- Use formal "usted" form for user-facing text
- Handle accents and special characters properly (á, é, í, ó, ú, ñ)
- Maintain consistency with existing `es.json` translations
- Use ICU format for pluralization with Spanish rules
- Preserve opening inverted punctuation (¿, ¡) where appropriate

#### Acceptance Criteria
- [ ] `articles` namespace added to `/messages/es.json`
- [ ] All keys from English `articles` namespace are present
- [ ] No untranslated English strings remain
- [ ] Terminology is consistent with existing Spanish translations
- [ ] Variable placeholders `{variable}` are preserved exactly
- [ ] ICU pluralization format is correct for Spanish
- [ ] JSON syntax is valid

#### Implementation Steps

1. **Read the current Spanish translation file**

2. **Copy the English `articles` namespace structure**

3. **Translate each string following Spanish guidelines:**

   **Page-level strings:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.title | Guías |
   | articles.subtitle | Administrar artículos de guía para sus artículos |

   **Editor strings:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.editor.title | Editar contenido |
   | articles.editor.tabs.editor | Editor |
   | articles.editor.tabs.preview | Vista previa |
   | articles.editor.toolbar.bold | Negrita |
   | articles.editor.toolbar.italic | Cursiva |
   | articles.editor.toolbar.heading | Encabezado |
   | articles.editor.toolbar.bulletList | Lista con viñetas |
   | articles.editor.toolbar.numberedList | Lista numerada |
   | articles.editor.toolbar.link | Enlace |
   | articles.editor.placeholder | Escriba su contenido aquí usando formato markdown... |
   | articles.editor.characterCount | {current} / {max} caracteres |

   **Media strings:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.media.upload | Subir medios |
   | articles.media.dragDrop | Arrastre y suelte los archivos aquí |
   | articles.media.browse | Explorar archivos |
   | articles.media.supportedFormats | Formatos admitidos: {formats} |
   | articles.media.maxSize | Tamaño máximo del archivo: {size} MB |

   **Crop tool:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.crop.title | Recortar imagen |
   | articles.crop.aspectRatio | Relación de aspecto |
   | articles.crop.applyCrop | Aplicar recorte |
   | articles.crop.freeform | Libre |
   | articles.crop.square | Cuadrado |
   | articles.crop.landscape | Horizontal |
   | articles.crop.portrait | Vertical |

   **Video trimmer:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.video.title | Recortar video |
   | articles.video.startTime | Hora de inicio |
   | articles.video.endTime | Hora de fin |
   | articles.video.duration | Duración: {duration} |
   | articles.video.applyTrim | Aplicar recorte |

   **Assets:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.assets.title | Recursos |
   | articles.assets.addAsset | Agregar recurso |
   | articles.assets.removeAsset | Eliminar recurso |
   | articles.assets.noAssets | Sin recursos |

   **Viewer:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.viewer.gallery.title | Galería |
   | articles.viewer.gallery.previous | Anterior |
   | articles.viewer.gallery.next | Siguiente |
   | articles.viewer.gallery.fullscreen | Pantalla completa |

   **Purposes:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.purposes.howToUse | Cómo usar |
   | articles.purposes.troubleshooting | Solución de problemas |
   | articles.purposes.maintenance | Mantenimiento |
   | articles.purposes.safety | Información de seguridad |
   | articles.purposes.warranty | Garantía y soporte |

   **Status:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.status.draft | Borrador |
   | articles.status.published | Publicado |
   | articles.status.archived | Archivado |

   **Actions:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.actions.create | Crear guía |
   | articles.actions.edit | Editar |
   | articles.actions.delete | Eliminar |
   | articles.actions.save | Guardar |
   | articles.actions.saveChanges | Guardar cambios |

   **Empty states:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.empty.title | Aún no hay guías |
   | articles.empty.description | Cree su primera guía para comenzar |
   | articles.empty.action | Crear guía |

   **Loading:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.loading.guides | Cargando guías... |
   | articles.loading.saving | Guardando... |

   **Validation:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.validation.titleRequired | El título de la guía es obligatorio |
   | articles.validation.contentRequired | El contenido es obligatorio |

   **Success:**
   | English Key | Spanish Translation |
   |-------------|---------------------|
   | articles.success.saved | Guía guardada exitosamente |
   | articles.success.deleted | Guía eliminada exitosamente |

4. **Validate JSON and verify key count**

#### Dependencies
- Task 1 must be complete

---

### Task 4: Generate German (de) Translations

**Story Points:** 3
**Type:** Translation Generation
**File:** `/messages/de.json`

#### Description
Add the complete `articles` namespace with accurate German translations.

#### Translation Guidelines for German
- Use formal "Sie" form consistently
- Capitalize all nouns
- Handle umlauts properly (ä, ö, ü, ß)
- Note: German text typically expands 30-40% compared to English
- Use ICU format for pluralization with German rules

#### Acceptance Criteria
- [ ] `articles` namespace added to `/messages/de.json`
- [ ] All keys from English `articles` namespace are present
- [ ] All nouns are properly capitalized
- [ ] Terminology is consistent with existing German translations
- [ ] JSON syntax is valid

#### Implementation Steps

1. **Read the current German translation file**

2. **Translate with proper German capitalization:**

   **Key translations:**
   | English Key | German Translation |
   |-------------|-------------------|
   | articles.title | Anleitungen |
   | articles.subtitle | Anleitungsartikel für Ihre Artikel verwalten |
   | articles.editor.title | Inhalt bearbeiten |
   | articles.editor.tabs.editor | Editor |
   | articles.editor.tabs.preview | Vorschau |
   | articles.editor.toolbar.bold | Fett |
   | articles.editor.toolbar.italic | Kursiv |
   | articles.editor.toolbar.heading | Überschrift |
   | articles.editor.placeholder | Schreiben Sie Ihren Inhalt hier im Markdown-Format... |
   | articles.media.upload | Medien hochladen |
   | articles.media.dragDrop | Dateien hierher ziehen und ablegen |
   | articles.media.browse | Dateien durchsuchen |
   | articles.crop.title | Bild zuschneiden |
   | articles.crop.aspectRatio | Seitenverhältnis |
   | articles.crop.applyCrop | Zuschnitt anwenden |
   | articles.video.title | Video trimmen |
   | articles.video.startTime | Startzeit |
   | articles.video.endTime | Endzeit |
   | articles.assets.title | Ressourcen |
   | articles.assets.addAsset | Ressource hinzufügen |
   | articles.viewer.gallery.title | Galerie |
   | articles.viewer.gallery.previous | Vorherige |
   | articles.viewer.gallery.next | Nächste |
   | articles.purposes.howToUse | Bedienungsanleitung |
   | articles.purposes.troubleshooting | Fehlerbehebung |
   | articles.purposes.maintenance | Wartung |
   | articles.purposes.safety | Sicherheitsinformationen |
   | articles.status.draft | Entwurf |
   | articles.status.published | Veröffentlicht |
   | articles.actions.create | Anleitung erstellen |
   | articles.actions.edit | Bearbeiten |
   | articles.actions.delete | Löschen |
   | articles.actions.save | Speichern |
   | articles.empty.title | Noch keine Anleitungen |
   | articles.empty.description | Erstellen Sie Ihre erste Anleitung |
   | articles.loading.guides | Anleitungen werden geladen... |
   | articles.validation.titleRequired | Der Anleitungstitel ist erforderlich |
   | articles.success.saved | Anleitung erfolgreich gespeichert |

3. **Validate JSON and verify key count**

#### Dependencies
- Task 1 must be complete

---

### Task 5: Generate Dutch (nl) Translations

**Story Points:** 3
**Type:** Translation Generation
**File:** `/messages/nl.json`

#### Description
Add the complete `articles` namespace with accurate Dutch translations.

#### Translation Guidelines for Dutch
- Use formal "u" form for professional context
- Handle compound words appropriately
- Maintain consistency with existing `nl.json` translations
- Note: Dutch text length is similar to English

#### Acceptance Criteria
- [ ] `articles` namespace added to `/messages/nl.json`
- [ ] All keys from English `articles` namespace are present
- [ ] Terminology is consistent with existing Dutch translations
- [ ] JSON syntax is valid

#### Implementation Steps

1. **Read the current Dutch translation file**

2. **Translate each string:**

   **Key translations:**
   | English Key | Dutch Translation |
   |-------------|------------------|
   | articles.title | Handleidingen |
   | articles.subtitle | Beheer handleidingsartikelen voor uw items |
   | articles.editor.title | Inhoud bewerken |
   | articles.editor.tabs.editor | Editor |
   | articles.editor.tabs.preview | Voorbeeld |
   | articles.editor.toolbar.bold | Vet |
   | articles.editor.toolbar.italic | Cursief |
   | articles.editor.toolbar.heading | Kop |
   | articles.editor.placeholder | Schrijf uw inhoud hier met markdown-opmaak... |
   | articles.media.upload | Media uploaden |
   | articles.media.dragDrop | Sleep bestanden hierheen |
   | articles.media.browse | Bestanden bladeren |
   | articles.crop.title | Afbeelding bijsnijden |
   | articles.crop.aspectRatio | Beeldverhouding |
   | articles.crop.applyCrop | Bijsnijden toepassen |
   | articles.video.title | Video bijsnijden |
   | articles.video.startTime | Starttijd |
   | articles.video.endTime | Eindtijd |
   | articles.assets.title | Bronnen |
   | articles.assets.addAsset | Bron toevoegen |
   | articles.viewer.gallery.title | Galerij |
   | articles.viewer.gallery.previous | Vorige |
   | articles.viewer.gallery.next | Volgende |
   | articles.purposes.howToUse | Gebruiksaanwijzing |
   | articles.purposes.troubleshooting | Probleemoplossing |
   | articles.purposes.maintenance | Onderhoud |
   | articles.purposes.safety | Veiligheidsinformatie |
   | articles.status.draft | Concept |
   | articles.status.published | Gepubliceerd |
   | articles.actions.create | Handleiding maken |
   | articles.actions.edit | Bewerken |
   | articles.actions.delete | Verwijderen |
   | articles.actions.save | Opslaan |
   | articles.empty.title | Nog geen handleidingen |
   | articles.empty.description | Maak uw eerste handleiding om te beginnen |
   | articles.loading.guides | Handleidingen laden... |
   | articles.validation.titleRequired | Handleidingtitel is vereist |
   | articles.success.saved | Handleiding succesvol opgeslagen |

3. **Validate JSON and verify key count**

#### Dependencies
- Task 1 must be complete

---

### Task 6: Generate Italian (it) Translations

**Story Points:** 3
**Type:** Translation Generation
**File:** `/messages/it.json`

#### Description
Add the complete `articles` namespace with accurate Italian translations.

#### Translation Guidelines for Italian
- Use formal "Lei" form for professional context
- Handle accents properly (à, è, é, ì, ò, ù)
- Note: Italian text typically expands 15-25% compared to English
- Use ICU format for pluralization with Italian rules

#### Acceptance Criteria
- [ ] `articles` namespace added to `/messages/it.json`
- [ ] All keys from English `articles` namespace are present
- [ ] Accents are used correctly
- [ ] Terminology is consistent with existing Italian translations
- [ ] JSON syntax is valid

#### Implementation Steps

1. **Read the current Italian translation file**

2. **Translate each string:**

   **Key translations:**
   | English Key | Italian Translation |
   |-------------|---------------------|
   | articles.title | Guide |
   | articles.subtitle | Gestisci gli articoli guida per i tuoi articoli |
   | articles.editor.title | Modifica contenuto |
   | articles.editor.tabs.editor | Editor |
   | articles.editor.tabs.preview | Anteprima |
   | articles.editor.toolbar.bold | Grassetto |
   | articles.editor.toolbar.italic | Corsivo |
   | articles.editor.toolbar.heading | Intestazione |
   | articles.editor.placeholder | Scrivi il tuo contenuto qui usando la formattazione markdown... |
   | articles.media.upload | Carica media |
   | articles.media.dragDrop | Trascina e rilascia i file qui |
   | articles.media.browse | Sfoglia file |
   | articles.crop.title | Ritaglia immagine |
   | articles.crop.aspectRatio | Rapporto d'aspetto |
   | articles.crop.applyCrop | Applica ritaglio |
   | articles.video.title | Taglia video |
   | articles.video.startTime | Ora di inizio |
   | articles.video.endTime | Ora di fine |
   | articles.assets.title | Risorse |
   | articles.assets.addAsset | Aggiungi risorsa |
   | articles.viewer.gallery.title | Galleria |
   | articles.viewer.gallery.previous | Precedente |
   | articles.viewer.gallery.next | Successivo |
   | articles.purposes.howToUse | Come usare |
   | articles.purposes.troubleshooting | Risoluzione dei problemi |
   | articles.purposes.maintenance | Manutenzione |
   | articles.purposes.safety | Informazioni sulla sicurezza |
   | articles.status.draft | Bozza |
   | articles.status.published | Pubblicato |
   | articles.actions.create | Crea guida |
   | articles.actions.edit | Modifica |
   | articles.actions.delete | Elimina |
   | articles.actions.save | Salva |
   | articles.empty.title | Ancora nessuna guida |
   | articles.empty.description | Crea la tua prima guida per iniziare |
   | articles.loading.guides | Caricamento guide... |
   | articles.validation.titleRequired | Il titolo della guida è obbligatorio |
   | articles.success.saved | Guida salvata con successo |

3. **Validate JSON and verify key count**

#### Dependencies
- Task 1 must be complete

---

### Task 7: Verify Translation Completeness and Consistency

**Story Points:** 2
**Type:** Verification/QA
**Files:** All `/messages/*.json` files

#### Description
Verify that all translation files have complete and consistent `articles` namespace translations.

#### Acceptance Criteria
- [ ] All 5 non-English files have identical key structure to English
- [ ] No missing keys in any language
- [ ] No extra keys in any language
- [ ] All `{variable}` placeholders are preserved
- [ ] ICU pluralization format is correct in all languages
- [ ] JSON syntax is valid in all files
- [ ] Build passes without translation warnings

#### Implementation Steps

1. **Count keys in each language file:**
   ```bash
   for lang in en fr es de nl it; do
     echo "$lang: $(grep -c '"articles' messages/$lang.json) articles keys"
   done
   ```

2. **Compare key structure:**
   - Extract all `articles.*` keys from each file
   - Ensure identical key sets across all languages

3. **Verify placeholder preservation:**
   - Search for `{` in English strings
   - Verify corresponding translated strings contain same placeholders

4. **Validate ICU format:**
   - Search for `plural` in translations
   - Verify ICU MessageFormat syntax is correct

5. **Run build verification:**
   ```bash
   npm run build
   ```
   - Check for any translation-related warnings or errors

6. **Run i18n check (if available):**
   ```bash
   npm run i18n:check
   ```

7. **Create verification report:**
   Document:
   - Total keys per language
   - Any discrepancies found
   - Any warnings from build

#### Dependencies
- Tasks 2-6 must be complete

---

### Task 8: Visual and Functional Testing

**Story Points:** 2
**Type:** Testing/QA
**Files:** None (browser testing)

#### Description
Test the articles feature in the application with each language to verify translations display correctly.

#### Acceptance Criteria
- [ ] Article list page displays correctly in all 6 languages
- [ ] Markdown editor toolbar labels display correctly
- [ ] Image cropper dialog renders properly in all languages
- [ ] Video trimmer dialog renders properly in all languages
- [ ] Asset panel displays correctly
- [ ] Content viewers show correct translations
- [ ] No text overflow or truncation issues
- [ ] No layout breaks in any language

#### Implementation Steps

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test each language systematically:**

   For each language (en, fr, es, de, nl, it):

   a. **Switch to language** via language switcher

   b. **Navigate to articles/guides section**
      - Verify page title and subtitle
      - Verify navigation labels

   c. **Test list view:**
      - Verify column headers
      - Verify filter labels
      - Verify sort options
      - Verify empty state message (if applicable)

   d. **Test editor:**
      - Verify toolbar button labels
      - Verify placeholder text
      - Verify tab labels (Editor/Preview)
      - Verify save/cancel buttons

   e. **Test media upload:**
      - Verify upload button text
      - Verify drag-and-drop instructions
      - Verify format/size messages

   f. **Test image cropper:**
      - Verify dialog title
      - Verify aspect ratio options
      - Verify action buttons

   g. **Test video trimmer:**
      - Verify dialog title
      - Verify time labels
      - Verify action buttons

   h. **Test error states:**
      - Verify validation messages appear correctly
      - Verify error messages display in correct language

   i. **Test success states:**
      - Verify success messages display in correct language

3. **Check for UI issues:**
   - Text overflow
   - Button truncation (especially German)
   - Layout breaks
   - Alignment issues

4. **Document any issues found**

#### Dependencies
- Task 7 must be complete

---

## Summary

| Task | Description | Story Points | Dependencies |
|------|-------------|--------------|--------------|
| 1 | Verify English Articles Namespace | 1 | 2E.1-2E.5 |
| 2 | Generate French (fr) Translations | 3 | Task 1 |
| 3 | Generate Spanish (es) Translations | 3 | Task 1 |
| 4 | Generate German (de) Translations | 3 | Task 1 |
| 5 | Generate Dutch (nl) Translations | 3 | Task 1 |
| 6 | Generate Italian (it) Translations | 3 | Task 1 |
| 7 | Verify Translation Completeness | 2 | Tasks 2-6 |
| 8 | Visual and Functional Testing | 2 | Task 7 |
| **Total** | | **20** | |

---

## Files Modified Summary

| File | Action | Description |
|------|--------|-------------|
| `/messages/en.json` | READ ONLY | Reference for `articles` namespace |
| `/messages/fr.json` | MODIFY | Add `articles` namespace (~300 keys) |
| `/messages/es.json` | MODIFY | Add `articles` namespace (~300 keys) |
| `/messages/de.json` | MODIFY | Add `articles` namespace (~300 keys) |
| `/messages/nl.json` | MODIFY | Add `articles` namespace (~300 keys) |
| `/messages/it.json` | MODIFY | Add `articles` namespace (~300 keys) |

---

## Terminology Glossary

Maintain consistent terminology across all languages:

| English | French | Spanish | German | Dutch | Italian |
|---------|--------|---------|--------|-------|---------|
| Guide | Guide | Guía | Anleitung | Handleiding | Guida |
| Article | Article | Artículo | Artikel | Artikel | Articolo |
| Asset | Ressource | Recurso | Ressource | Bron | Risorsa |
| Crop | Recadrer | Recortar | Zuschneiden | Bijsnijden | Ritagliare |
| Trim | Découper | Recortar | Trimmen | Bijsnijden | Tagliare |
| Editor | Éditeur | Editor | Editor | Editor | Editor |
| Preview | Aperçu | Vista previa | Vorschau | Voorbeeld | Anteprima |
| Draft | Brouillon | Borrador | Entwurf | Concept | Bozza |
| Published | Publié | Publicado | Veröffentlicht | Gepubliceerd | Pubblicato |
| Save | Enregistrer | Guardar | Speichern | Opslaan | Salva |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| English namespace incomplete | Task 1 blocks all translation tasks |
| Translation quality issues | Use AI with domain context, verify critical strings |
| Missing keys | Task 7 automated comparison |
| Layout breaks from text expansion | Task 8 visual testing, especially German (30-40% expansion) |
| Inconsistent terminology | Use glossary above, reference existing translations |

---

## Related Documentation

- **Overview Document:** `/docs/REQ-E02-075-generate-translations-for-5-non-english-languages-overview.md`
- **Request Documentation:** `/docs/gen_requests_epic2.md#REQ-E02-075`
- **Implementation Plan:** `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`
- **i18n Configuration:** `/src/lib/i18n/config.ts`

---

*Document generated for FAQBNB Localization Epic 2 - Task 2E.6*
*Last Modified: 2026-01-20 23:15:00 UTC*
