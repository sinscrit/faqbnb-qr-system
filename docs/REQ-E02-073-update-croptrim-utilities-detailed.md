# REQ-E02-073: Update Crop and Trim Utilities - Detailed Task Breakdown

**Document Created:** 2026-01-20 23:45:00 UTC
**Last Modified:** 2026-01-20 23:45:00 UTC
**Request ID:** REQ-E02-073
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2E - Article & Content Management
**Task ID:** 2E.4
**Overview Document:** [REQ-E02-073-update-croptrim-utilities-overview.md](./REQ-E02-073-update-croptrim-utilities-overview.md)
**Implementation Plan:** [Plan-111-L10N-Epic2-Static-UI-Translation.md](./prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)

---

## Table of Contents

1. [Task Summary](#1-task-summary)
2. [Pre-Implementation Checklist](#2-pre-implementation-checklist)
3. [Detailed Tasks](#3-detailed-tasks)
4. [Translation Keys Reference](#4-translation-keys-reference)
5. [Testing Checklist](#5-testing-checklist)
6. [Acceptance Criteria](#6-acceptance-criteria)

---

## 1. Task Summary

| Attribute | Value |
|-----------|-------|
| **Total Estimated Tasks** | 15 |
| **Size** | M (Medium) |
| **Files to Modify** | 10 (4 source + 6 translation files) |
| **Estimated Strings** | ~56 |
| **Dependencies** | Epic 1 Foundation, REQ-E02-070 (articles namespace) |

### Files Overview

| File | Type | Strings | Complexity |
|------|------|---------|------------|
| `/messages/en.json` | Translation | ~56 new keys | Low |
| `/messages/{fr,es,de,nl,it}.json` | Translation | ~56 keys each | Low |
| `/src/components/ItemCapture/editors/ImageCropper.tsx` | Component | ~20 | Medium |
| `/src/components/ItemCapture/editors/VideoTrimmer.tsx` | Component | ~28 | Medium |
| `/src/components/ItemCapture/editors/cropUtils.ts` | Utility | ~3 | Low |
| `/src/components/ItemCapture/editors/trimUtils.ts` | Utility | ~5 | Low |

---

## 2. Pre-Implementation Checklist

Before starting implementation, verify these prerequisites:

- [ ] Epic 1 Foundation is complete (next-intl installed and configured)
- [ ] `useTranslations` hook is working in client components
- [ ] `/messages/en.json` file exists and is accessible
- [ ] The `articles` namespace exists (from REQ-E02-070)
- [ ] Coordinate with REQ-E02-071 if implemented first (avoid duplication)

---

## 3. Detailed Tasks

### Task 1: Add Translation Keys to `/messages/en.json`

**File:** `/messages/en.json`
**Estimated Time:** 30 minutes
**Complexity:** Low

#### Description
Add the `articles.crop` and `articles.trim` namespaces with all identified strings for image cropping and video trimming functionality.

#### Steps

1. Open `/messages/en.json`
2. Locate the `articles` namespace (create if doesn't exist)
3. Add the following structure under `articles`:

```json
{
  "articles": {
    "crop": {
      "aspectRatios": {
        "free": "Free",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "loading": "Loading image...",
      "processing": "Applying crop...",
      "preview": {
        "label": "Preview:",
        "generating": "Generating...",
        "selectArea": "Select area to preview",
        "alt": "Crop preview",
        "thumbnailAlt": "Crop preview thumbnail"
      },
      "actions": {
        "applyCrop": "Apply Crop",
        "applying": "Applying...",
        "cancel": "Cancel",
        "dismissError": "Dismiss error"
      },
      "errors": {
        "loadFailed": "Failed to load image. Please try again.",
        "canvasContext": "Failed to get canvas 2D context. Your browser may not support this operation.",
        "blobCreation": "Failed to create image blob. The {format} format may not be supported by your browser."
      },
      "warnings": {
        "largeImage": "Large image detected. Output may be scaled down for compatibility."
      }
    },
    "trim": {
      "loading": "Loading video...",
      "markers": {
        "start": "Start trim point",
        "startLabel": "S",
        "end": "End trim point",
        "endLabel": "E"
      },
      "display": {
        "selection": "Selection:",
        "duration": "Duration:",
        "current": "Current:",
        "trimSavings": "Trimming {time} ({percent}% reduction)"
      },
      "playback": {
        "skipToStart": "Skip to start marker",
        "skipToEnd": "Skip to end marker",
        "play": "Play trimmed region",
        "pause": "Pause"
      },
      "actions": {
        "applyTrim": "Apply Trim",
        "cancel": "Cancel",
        "tryAgain": "Try again"
      },
      "errors": {
        "heading": "Error",
        "loadFailed": "Failed to load video. Please check the file and try again.",
        "playbackFailed": "Unable to play video. Please try again.",
        "durationUnknown": "Unable to determine video duration",
        "invalidSelection": "Invalid trim selection"
      },
      "validation": {
        "startNegative": "Start time cannot be negative",
        "endExceedsDuration": "End time exceeds video duration",
        "startAfterEnd": "Start time must be before end time",
        "minDuration": "Minimum trim duration is {min} {min, plural, one {second} other {seconds}}"
      }
    }
  }
}
```

#### Verification
- [ ] JSON is valid (no syntax errors)
- [ ] All keys follow naming convention `namespace.component.element.variant`
- [ ] Pluralization uses ICU format for `minDuration`
- [ ] Interpolation variables are properly formatted with `{}`

---

### Task 2: Update ImageCropper.tsx - Import and Hook Setup

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Lines:** 1-30 (imports section)
**Estimated Time:** 10 minutes
**Complexity:** Low

#### Description
Add the next-intl import and initialize the useTranslations hook.

#### Code Changes

**Add import at top of file (after line 26):**
```tsx
import { useTranslations } from 'next-intl';
```

**Add hook inside component (after line 106):**
```tsx
const t = useTranslations('articles.crop');
```

#### Verification
- [ ] Import statement added
- [ ] Hook initialized at component level
- [ ] No TypeScript errors

---

### Task 3: Update ImageCropper.tsx - Aspect Ratio Options

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Lines:** 80-85
**Estimated Time:** 15 minutes
**Complexity:** Medium

#### Description
Move the `ASPECT_RATIO_OPTIONS` constant inside the component and replace hardcoded labels with translation calls.

#### Current Code (Lines 80-85)
```tsx
const ASPECT_RATIO_OPTIONS: { value: AspectRatioPreset; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
];
```

#### Updated Code
Remove the constant from module level and add inside component after the `t` hook initialization:

```tsx
const aspectRatioOptions = [
  { value: 'free' as AspectRatioPreset, label: t('aspectRatios.free') },
  { value: '1:1' as AspectRatioPreset, label: t('aspectRatios.square') },
  { value: '4:3' as AspectRatioPreset, label: t('aspectRatios.standard') },
  { value: '16:9' as AspectRatioPreset, label: t('aspectRatios.widescreen') },
];
```

**Also update the map reference (around line 373):**
```tsx
// Change from:
{ASPECT_RATIO_OPTIONS.map((option) => (
// To:
{aspectRatioOptions.map((option) => (
```

#### Verification
- [ ] Constant moved inside component
- [ ] All labels use `t()` function
- [ ] Map reference updated
- [ ] TypeScript types preserved

---

### Task 4: Update ImageCropper.tsx - Error Message

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Lines:** 163-166
**Estimated Time:** 5 minutes
**Complexity:** Low

#### Description
Replace hardcoded image load error message with translation.

#### Current Code (Line 165)
```tsx
setError('Failed to load image. Please try again.');
```

#### Updated Code
```tsx
setError(t('errors.loadFailed'));
```

#### Verification
- [ ] Error message uses translation key
- [ ] Error displays correctly in UI

---

### Task 5: Update ImageCropper.tsx - Large Image Warning

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Lines:** 364-369
**Estimated Time:** 5 minutes
**Complexity:** Low

#### Description
Replace hardcoded warning message for large images.

#### Current Code (Lines 366-368)
```tsx
<div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded mb-2">
  Large image detected. Output may be scaled down for compatibility.
</div>
```

#### Updated Code
```tsx
<div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded mb-2">
  {t('warnings.largeImage')}
</div>
```

#### Verification
- [ ] Warning text uses translation key
- [ ] Warning displays when large image detected

---

### Task 6: Update ImageCropper.tsx - Loading and Processing States

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Lines:** 395-413
**Estimated Time:** 10 minutes
**Complexity:** Low

#### Description
Replace hardcoded loading and processing state messages.

#### Current Code (Lines 400, 410)
```tsx
<span className="text-sm text-gray-500">Loading image...</span>
// ...
<span className="text-sm text-gray-600">Applying crop...</span>
```

#### Updated Code
```tsx
<span className="text-sm text-gray-500">{t('loading')}</span>
// ...
<span className="text-sm text-gray-600">{t('processing')}</span>
```

#### Verification
- [ ] Loading state text translated
- [ ] Processing state text translated

---

### Task 7: Update ImageCropper.tsx - Preview Section

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Lines:** 439-456
**Estimated Time:** 10 minutes
**Complexity:** Low

#### Description
Replace hardcoded preview section labels and messages.

#### Current Code (Lines 442, 447, 451-452)
```tsx
<span className="text-xs text-gray-500 font-medium">Preview:</span>
// ...
alt="Crop preview thumbnail"
// ...
{completedCrop ? 'Generating...' : 'Select area to preview'}
```

#### Updated Code
```tsx
<span className="text-xs text-gray-500 font-medium">{t('preview.label')}</span>
// ...
alt={t('preview.thumbnailAlt')}
// ...
{completedCrop ? t('preview.generating') : t('preview.selectArea')}
```

**Also update the main image alt text (Line 431):**
```tsx
// Current:
alt="Crop preview"
// Updated:
alt={t('preview.alt')}
```

#### Verification
- [ ] Preview label translated
- [ ] Preview placeholder messages translated
- [ ] Alt texts translated

---

### Task 8: Update ImageCropper.tsx - Action Buttons and Error Dismiss

**File:** `/src/components/ItemCapture/editors/ImageCropper.tsx`
**Lines:** 459-501
**Estimated Time:** 10 minutes
**Complexity:** Low

#### Description
Replace hardcoded button labels and aria-labels.

#### Current Code (Lines 466, 486, 499)
```tsx
aria-label="Dismiss error"
// ...
{isProcessing ? 'Applying...' : 'Apply Crop'}
// ...
Cancel
```

#### Updated Code
```tsx
aria-label={t('actions.dismissError')}
// ...
{isProcessing ? t('actions.applying') : t('actions.applyCrop')}
// ...
{t('actions.cancel')}
```

#### Verification
- [ ] Dismiss error aria-label translated
- [ ] Apply button text (both states) translated
- [ ] Cancel button text translated

---

### Task 9: Update VideoTrimmer.tsx - Import and Hook Setup

**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Lines:** 1-36 (imports section)
**Estimated Time:** 10 minutes
**Complexity:** Low

#### Description
Add the next-intl import and initialize the useTranslations hook.

#### Code Changes

**Add import (after line 27):**
```tsx
import { useTranslations } from 'next-intl';
```

**Add hook inside component (after line 111):**
```tsx
const t = useTranslations('articles.trim');
```

#### Verification
- [ ] Import statement added
- [ ] Hook initialized at component level
- [ ] No TypeScript errors

---

### Task 10: Update VideoTrimmer.tsx - Error Messages and States

**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Lines:** 144-198, 225-230, 440-447, 503-520, 539-544
**Estimated Time:** 20 minutes
**Complexity:** Medium

#### Description
Replace all hardcoded error messages and loading state text.

#### Code Changes

**Line 150 (duration error):**
```tsx
// Current:
setError('Unable to determine video duration');
// Updated:
setError(t('errors.durationUnknown'));
```

**Line 196 (load error):**
```tsx
// Current:
setError('Failed to load video. Please check the file and try again.');
// Updated:
setError(t('errors.loadFailed'));
```

**Line 229 (playback error):**
```tsx
// Current:
setError('Unable to play video. Please try again.');
// Updated:
setError(t('errors.playbackFailed'));
```

**Lines 444-445 (validation error - requires special handling):**
```tsx
// Current:
setError(validation.error || 'Invalid trim selection');
// Updated - see Task 13 for trimUtils changes:
setError(validation.errorCode
  ? t(`validation.${validation.errorCode}`, validation.errorParams || {})
  : t('errors.invalidSelection'));
```

**Line 506 (error heading):**
```tsx
// Current:
<p className="text-sm font-medium">Error</p>
// Updated:
<p className="text-sm font-medium">{t('errors.heading')}</p>
```

**Line 517 (try again button):**
```tsx
// Current:
Try again
// Updated:
{t('actions.tryAgain')}
```

**Line 543 (loading state):**
```tsx
// Current:
<span className="text-sm text-gray-600">Loading video...</span>
// Updated:
<span className="text-sm text-gray-600">{t('loading')}</span>
```

#### Verification
- [ ] All error messages use translation keys
- [ ] Loading state translated
- [ ] Try again button translated
- [ ] Error heading translated

---

### Task 11: Update VideoTrimmer.tsx - Timeline Markers and Display

**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Lines:** 600-686
**Estimated Time:** 20 minutes
**Complexity:** Medium

#### Description
Replace hardcoded timeline marker labels, aria-labels, and duration display text.

#### Code Changes

**Line 601 (start marker aria-label):**
```tsx
// Current:
aria-label="Start trim point"
// Updated:
aria-label={t('markers.start')}
```

**Line 611 (start marker label - optional, keep "S" or translate):**
```tsx
// Current:
<span className="text-white text-xs font-bold">S</span>
// Updated (optional - single char is usually kept):
<span className="text-white text-xs font-bold">{t('markers.startLabel')}</span>
```

**Line 627 (end marker aria-label):**
```tsx
// Current:
aria-label="End trim point"
// Updated:
aria-label={t('markers.end')}
```

**Line 638 (end marker label - optional):**
```tsx
// Current:
<span className="text-white text-xs font-bold">E</span>
// Updated (optional):
<span className="text-white text-xs font-bold">{t('markers.endLabel')}</span>
```

**Line 664 (selection label):**
```tsx
// Current:
<span className="hidden sm:inline font-medium">Selection: </span>
// Updated:
<span className="hidden sm:inline font-medium">{t('display.selection')} </span>
```

**Line 669 (duration label):**
```tsx
// Current:
<span className="hidden sm:inline font-medium">Duration: </span>
// Updated:
<span className="hidden sm:inline font-medium">{t('display.duration')} </span>
```

**Line 676 (current label):**
```tsx
// Current:
Current: <span className="font-mono">{formatTime(currentTime)}</span>
// Updated:
{t('display.current')} <span className="font-mono">{formatTime(currentTime)}</span>
```

**Lines 682-683 (trim savings):**
```tsx
// Current:
Trimming {formatTime(duration - (endMarker - startMarker))} (
{Math.round((1 - (endMarker - startMarker) / duration) * 100)}% reduction)
// Updated:
{t('display.trimSavings', {
  time: formatTime(duration - (endMarker - startMarker)),
  percent: Math.round((1 - (endMarker - startMarker) / duration) * 100)
})}
```

#### Verification
- [ ] Start marker aria-label translated
- [ ] End marker aria-label translated
- [ ] Selection/Duration/Current labels translated
- [ ] Trim savings message translated with interpolation

---

### Task 12: Update VideoTrimmer.tsx - Playback Controls and Actions

**File:** `/src/components/ItemCapture/editors/VideoTrimmer.tsx`
**Lines:** 689-767
**Estimated Time:** 15 minutes
**Complexity:** Low

#### Description
Replace hardcoded playback control aria-labels and action button text.

#### Code Changes

**Line 700 (skip to start):**
```tsx
// Current:
aria-label="Skip to start marker"
// Updated:
aria-label={t('playback.skipToStart')}
```

**Line 714 (play/pause):**
```tsx
// Current:
aria-label={isPlaying ? 'Pause' : 'Play trimmed region'}
// Updated:
aria-label={isPlaying ? t('playback.pause') : t('playback.play')}
```

**Line 728 (skip to end):**
```tsx
// Current:
aria-label="Skip to end marker"
// Updated:
aria-label={t('playback.skipToEnd')}
```

**Line 750 (cancel button):**
```tsx
// Current:
Cancel
// Updated:
{t('actions.cancel')}
```

**Line 766 (apply trim button):**
```tsx
// Current:
Apply Trim
// Updated:
{t('actions.applyTrim')}
```

#### Verification
- [ ] All playback control aria-labels translated
- [ ] Cancel button translated
- [ ] Apply Trim button translated

---

### Task 13: Update trimUtils.ts - Return Error Codes

**File:** `/src/components/ItemCapture/editors/trimUtils.ts`
**Lines:** 58-93
**Estimated Time:** 15 minutes
**Complexity:** Medium

#### Description
Update the `TrimValidation` interface to include error codes for translation, and modify `validateTrim` to return error codes instead of hardcoded messages.

#### Code Changes

**Update interface (Lines 58-61):**
```typescript
// Current:
export interface TrimValidation {
  isValid: boolean;
  error?: string;
}

// Updated:
export interface TrimValidation {
  isValid: boolean;
  error?: string; // Kept for backwards compatibility
  errorCode?: 'startNegative' | 'endExceedsDuration' | 'startAfterEnd' | 'minDuration';
  errorParams?: Record<string, unknown>;
}
```

**Update validateTrim function (Lines 71-93):**
```typescript
export function validateTrim(
  startTime: number,
  endTime: number,
  duration: number,
  minDuration: number = 1
): TrimValidation {
  if (startTime < 0) {
    return {
      isValid: false,
      errorCode: 'startNegative',
      error: 'Start time cannot be negative' // Fallback
    };
  }
  if (endTime > duration) {
    return {
      isValid: false,
      errorCode: 'endExceedsDuration',
      error: 'End time exceeds video duration' // Fallback
    };
  }
  if (startTime >= endTime) {
    return {
      isValid: false,
      errorCode: 'startAfterEnd',
      error: 'Start time must be before end time' // Fallback
    };
  }
  if (endTime - startTime < minDuration) {
    return {
      isValid: false,
      errorCode: 'minDuration',
      errorParams: { min: minDuration },
      error: `Minimum trim duration is ${minDuration} second${minDuration !== 1 ? 's' : ''}` // Fallback
    };
  }
  return { isValid: true };
}
```

#### Verification
- [ ] Interface updated with new properties
- [ ] All validation paths return error codes
- [ ] Backwards compatibility maintained with `error` field
- [ ] `errorParams` included for interpolation values

---

### Task 14: Update cropUtils.ts - Structured Errors

**File:** `/src/components/ItemCapture/editors/cropUtils.ts`
**Lines:** 82-119
**Estimated Time:** 15 minutes
**Complexity:** Medium

#### Description
Create a custom error class for crop operations that includes error codes, and update error throwing to use structured errors.

#### Code Changes

**Add custom error class (after imports, around line 12):**
```typescript
/**
 * Custom error class for crop operations with translatable error codes
 */
export class CropError extends Error {
  constructor(
    public code: 'canvasContextFailed' | 'blobCreationFailed',
    public params?: Record<string, string>
  ) {
    super(code);
    this.name = 'CropError';
  }
}
```

**Update error throwing in executeCrop (Lines 82-86):**
```typescript
// Current:
if (!ctx) {
  throw new Error(
    'Failed to get canvas 2D context. Your browser may not support this operation.'
  );
}

// Updated:
if (!ctx) {
  throw new CropError('canvasContextFailed');
}
```

**Update error throwing for blob creation (Lines 116-119):**
```typescript
// Current:
if (!blob) {
  throw new Error(
    `Failed to create image blob. The ${outputFormat} format may not be supported by your browser.`
  );
}

// Updated:
if (!blob) {
  throw new CropError('blobCreationFailed', { format: outputFormat });
}
```

**Update ImageCropper.tsx to handle CropError (Task 8 continuation):**
In the `handleApply` function (around lines 298-304):
```tsx
// Current:
} catch (err) {
  const message = err instanceof Error ? err.message : 'Crop operation failed';
  setError(message);

// Updated:
} catch (err) {
  if (err instanceof CropError) {
    const message = err.params
      ? t(`errors.${err.code === 'canvasContextFailed' ? 'canvasContext' : 'blobCreation'}`, err.params)
      : t(`errors.${err.code === 'canvasContextFailed' ? 'canvasContext' : 'blobCreation'}`);
    setError(message);
  } else {
    const message = err instanceof Error ? err.message : t('errors.loadFailed');
    setError(message);
  }
```

#### Verification
- [ ] CropError class exported
- [ ] Error throwing uses CropError
- [ ] ImageCropper handles CropError and translates
- [ ] Error parameters passed correctly for interpolation

---

### Task 15: Generate Translations for Non-English Languages

**Files:** `/messages/{fr,es,de,nl,it}.json`
**Estimated Time:** 1 hour
**Complexity:** Low

#### Description
Add translations for all crop and trim keys in the 5 non-English language files.

#### French (`/messages/fr.json`)
```json
{
  "articles": {
    "crop": {
      "aspectRatios": {
        "free": "Libre",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "loading": "Chargement de l'image...",
      "processing": "Application du recadrage...",
      "preview": {
        "label": "Apercu :",
        "generating": "Generation...",
        "selectArea": "Selectionnez une zone pour l'apercu",
        "alt": "Apercu du recadrage",
        "thumbnailAlt": "Miniature de l'apercu du recadrage"
      },
      "actions": {
        "applyCrop": "Appliquer le recadrage",
        "applying": "Application...",
        "cancel": "Annuler",
        "dismissError": "Fermer l'erreur"
      },
      "errors": {
        "loadFailed": "Echec du chargement de l'image. Veuillez reessayer.",
        "canvasContext": "Echec de l'obtention du contexte canvas 2D. Votre navigateur ne prend peut-etre pas en charge cette operation.",
        "blobCreation": "Echec de la creation du blob image. Le format {format} n'est peut-etre pas pris en charge par votre navigateur."
      },
      "warnings": {
        "largeImage": "Grande image detectee. La sortie peut etre reduite pour des raisons de compatibilite."
      }
    },
    "trim": {
      "loading": "Chargement de la video...",
      "markers": {
        "start": "Point de debut du decoupage",
        "startLabel": "D",
        "end": "Point de fin du decoupage",
        "endLabel": "F"
      },
      "display": {
        "selection": "Selection :",
        "duration": "Duree :",
        "current": "Actuel :",
        "trimSavings": "Reduction de {time} ({percent}% de reduction)"
      },
      "playback": {
        "skipToStart": "Aller au marqueur de debut",
        "skipToEnd": "Aller au marqueur de fin",
        "play": "Lire la region decoupee",
        "pause": "Pause"
      },
      "actions": {
        "applyTrim": "Appliquer le decoupage",
        "cancel": "Annuler",
        "tryAgain": "Reessayer"
      },
      "errors": {
        "heading": "Erreur",
        "loadFailed": "Echec du chargement de la video. Veuillez verifier le fichier et reessayer.",
        "playbackFailed": "Impossible de lire la video. Veuillez reessayer.",
        "durationUnknown": "Impossible de determiner la duree de la video",
        "invalidSelection": "Selection de decoupage invalide"
      },
      "validation": {
        "startNegative": "L'heure de debut ne peut pas etre negative",
        "endExceedsDuration": "L'heure de fin depasse la duree de la video",
        "startAfterEnd": "L'heure de debut doit etre avant l'heure de fin",
        "minDuration": "La duree minimale de decoupage est de {min} {min, plural, one {seconde} other {secondes}}"
      }
    }
  }
}
```

#### Spanish (`/messages/es.json`)
```json
{
  "articles": {
    "crop": {
      "aspectRatios": {
        "free": "Libre",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "loading": "Cargando imagen...",
      "processing": "Aplicando recorte...",
      "preview": {
        "label": "Vista previa:",
        "generating": "Generando...",
        "selectArea": "Selecciona un area para vista previa",
        "alt": "Vista previa del recorte",
        "thumbnailAlt": "Miniatura de vista previa del recorte"
      },
      "actions": {
        "applyCrop": "Aplicar recorte",
        "applying": "Aplicando...",
        "cancel": "Cancelar",
        "dismissError": "Descartar error"
      },
      "errors": {
        "loadFailed": "Error al cargar la imagen. Por favor, intentalo de nuevo.",
        "canvasContext": "Error al obtener el contexto 2D del canvas. Tu navegador puede no soportar esta operacion.",
        "blobCreation": "Error al crear el blob de imagen. El formato {format} puede no ser soportado por tu navegador."
      },
      "warnings": {
        "largeImage": "Imagen grande detectada. La salida puede ser reducida por compatibilidad."
      }
    },
    "trim": {
      "loading": "Cargando video...",
      "markers": {
        "start": "Punto de inicio de recorte",
        "startLabel": "I",
        "end": "Punto de fin de recorte",
        "endLabel": "F"
      },
      "display": {
        "selection": "Seleccion:",
        "duration": "Duracion:",
        "current": "Actual:",
        "trimSavings": "Recortando {time} ({percent}% de reduccion)"
      },
      "playback": {
        "skipToStart": "Saltar al marcador de inicio",
        "skipToEnd": "Saltar al marcador de fin",
        "play": "Reproducir region recortada",
        "pause": "Pausar"
      },
      "actions": {
        "applyTrim": "Aplicar recorte",
        "cancel": "Cancelar",
        "tryAgain": "Intentar de nuevo"
      },
      "errors": {
        "heading": "Error",
        "loadFailed": "Error al cargar el video. Por favor, verifica el archivo e intentalo de nuevo.",
        "playbackFailed": "No se puede reproducir el video. Por favor, intentalo de nuevo.",
        "durationUnknown": "No se puede determinar la duracion del video",
        "invalidSelection": "Seleccion de recorte invalida"
      },
      "validation": {
        "startNegative": "El tiempo de inicio no puede ser negativo",
        "endExceedsDuration": "El tiempo de fin excede la duracion del video",
        "startAfterEnd": "El tiempo de inicio debe ser anterior al tiempo de fin",
        "minDuration": "La duracion minima de recorte es {min} {min, plural, one {segundo} other {segundos}}"
      }
    }
  }
}
```

#### German (`/messages/de.json`)
```json
{
  "articles": {
    "crop": {
      "aspectRatios": {
        "free": "Frei",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "loading": "Bild wird geladen...",
      "processing": "Zuschnitt wird angewendet...",
      "preview": {
        "label": "Vorschau:",
        "generating": "Wird generiert...",
        "selectArea": "Bereich fur Vorschau auswahlen",
        "alt": "Zuschnittsvorschau",
        "thumbnailAlt": "Miniaturansicht der Zuschnittsvorschau"
      },
      "actions": {
        "applyCrop": "Zuschnitt anwenden",
        "applying": "Wird angewendet...",
        "cancel": "Abbrechen",
        "dismissError": "Fehler schliessen"
      },
      "errors": {
        "loadFailed": "Bild konnte nicht geladen werden. Bitte erneut versuchen.",
        "canvasContext": "Canvas 2D-Kontext konnte nicht abgerufen werden. Ihr Browser unterstutzt diese Operation moglicherweise nicht.",
        "blobCreation": "Bild-Blob konnte nicht erstellt werden. Das Format {format} wird von Ihrem Browser moglicherweise nicht unterstutzt."
      },
      "warnings": {
        "largeImage": "Grosses Bild erkannt. Die Ausgabe wird moglicherweise aus Kompatibilitatsgrunden verkleinert."
      }
    },
    "trim": {
      "loading": "Video wird geladen...",
      "markers": {
        "start": "Startpunkt des Zuschnitts",
        "startLabel": "S",
        "end": "Endpunkt des Zuschnitts",
        "endLabel": "E"
      },
      "display": {
        "selection": "Auswahl:",
        "duration": "Dauer:",
        "current": "Aktuell:",
        "trimSavings": "Kurrze um {time} ({percent}% Reduktion)"
      },
      "playback": {
        "skipToStart": "Zum Startmarker springen",
        "skipToEnd": "Zum Endmarker springen",
        "play": "Zugeschnittenen Bereich abspielen",
        "pause": "Pause"
      },
      "actions": {
        "applyTrim": "Zuschnitt anwenden",
        "cancel": "Abbrechen",
        "tryAgain": "Erneut versuchen"
      },
      "errors": {
        "heading": "Fehler",
        "loadFailed": "Video konnte nicht geladen werden. Bitte Datei uberprufen und erneut versuchen.",
        "playbackFailed": "Video kann nicht abgespielt werden. Bitte erneut versuchen.",
        "durationUnknown": "Videodauer konnte nicht ermittelt werden",
        "invalidSelection": "Ungultige Zuschnittsauswahl"
      },
      "validation": {
        "startNegative": "Startzeit darf nicht negativ sein",
        "endExceedsDuration": "Endzeit uberschreitet Videodauer",
        "startAfterEnd": "Startzeit muss vor Endzeit liegen",
        "minDuration": "Minimale Zuschnittsdauer betragt {min} {min, plural, one {Sekunde} other {Sekunden}}"
      }
    }
  }
}
```

#### Dutch (`/messages/nl.json`)
```json
{
  "articles": {
    "crop": {
      "aspectRatios": {
        "free": "Vrij",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "loading": "Afbeelding laden...",
      "processing": "Bijsnijden toepassen...",
      "preview": {
        "label": "Voorbeeld:",
        "generating": "Genereren...",
        "selectArea": "Selecteer een gebied voor voorbeeld",
        "alt": "Bijsnijdvoorbeeld",
        "thumbnailAlt": "Miniatuur van bijsnijdvoorbeeld"
      },
      "actions": {
        "applyCrop": "Bijsnijden toepassen",
        "applying": "Toepassen...",
        "cancel": "Annuleren",
        "dismissError": "Fout sluiten"
      },
      "errors": {
        "loadFailed": "Afbeelding laden mislukt. Probeer het opnieuw.",
        "canvasContext": "Kan canvas 2D-context niet verkrijgen. Uw browser ondersteunt deze bewerking mogelijk niet.",
        "blobCreation": "Kan afbeeldingsblob niet maken. Het {format} formaat wordt mogelijk niet ondersteund door uw browser."
      },
      "warnings": {
        "largeImage": "Grote afbeelding gedetecteerd. De uitvoer kan worden verkleind voor compatibiliteit."
      }
    },
    "trim": {
      "loading": "Video laden...",
      "markers": {
        "start": "Startpunt van bijsnijden",
        "startLabel": "S",
        "end": "Eindpunt van bijsnijden",
        "endLabel": "E"
      },
      "display": {
        "selection": "Selectie:",
        "duration": "Duur:",
        "current": "Huidig:",
        "trimSavings": "Inkorten met {time} ({percent}% reductie)"
      },
      "playback": {
        "skipToStart": "Naar startmarkering springen",
        "skipToEnd": "Naar eindmarkering springen",
        "play": "Bijgesneden gebied afspelen",
        "pause": "Pauzeren"
      },
      "actions": {
        "applyTrim": "Bijsnijden toepassen",
        "cancel": "Annuleren",
        "tryAgain": "Opnieuw proberen"
      },
      "errors": {
        "heading": "Fout",
        "loadFailed": "Video laden mislukt. Controleer het bestand en probeer het opnieuw.",
        "playbackFailed": "Kan video niet afspelen. Probeer het opnieuw.",
        "durationUnknown": "Kan videoduur niet bepalen",
        "invalidSelection": "Ongeldige bijsnijdselectie"
      },
      "validation": {
        "startNegative": "Starttijd mag niet negatief zijn",
        "endExceedsDuration": "Eindtijd overschrijdt videoduur",
        "startAfterEnd": "Starttijd moet voor eindtijd liggen",
        "minDuration": "Minimale bijsnijdduur is {min} {min, plural, one {seconde} other {seconden}}"
      }
    }
  }
}
```

#### Italian (`/messages/it.json`)
```json
{
  "articles": {
    "crop": {
      "aspectRatios": {
        "free": "Libero",
        "square": "1:1",
        "standard": "4:3",
        "widescreen": "16:9"
      },
      "loading": "Caricamento immagine...",
      "processing": "Applicazione ritaglio...",
      "preview": {
        "label": "Anteprima:",
        "generating": "Generazione...",
        "selectArea": "Seleziona un'area per l'anteprima",
        "alt": "Anteprima ritaglio",
        "thumbnailAlt": "Miniatura anteprima ritaglio"
      },
      "actions": {
        "applyCrop": "Applica ritaglio",
        "applying": "Applicazione...",
        "cancel": "Annulla",
        "dismissError": "Chiudi errore"
      },
      "errors": {
        "loadFailed": "Caricamento immagine fallito. Riprova.",
        "canvasContext": "Impossibile ottenere il contesto canvas 2D. Il tuo browser potrebbe non supportare questa operazione.",
        "blobCreation": "Impossibile creare il blob immagine. Il formato {format} potrebbe non essere supportato dal tuo browser."
      },
      "warnings": {
        "largeImage": "Immagine grande rilevata. L'output potrebbe essere ridimensionato per compatibilita."
      }
    },
    "trim": {
      "loading": "Caricamento video...",
      "markers": {
        "start": "Punto di inizio taglio",
        "startLabel": "I",
        "end": "Punto di fine taglio",
        "endLabel": "F"
      },
      "display": {
        "selection": "Selezione:",
        "duration": "Durata:",
        "current": "Attuale:",
        "trimSavings": "Taglio di {time} ({percent}% di riduzione)"
      },
      "playback": {
        "skipToStart": "Vai al marcatore di inizio",
        "skipToEnd": "Vai al marcatore di fine",
        "play": "Riproduci regione tagliata",
        "pause": "Pausa"
      },
      "actions": {
        "applyTrim": "Applica taglio",
        "cancel": "Annulla",
        "tryAgain": "Riprova"
      },
      "errors": {
        "heading": "Errore",
        "loadFailed": "Caricamento video fallito. Verifica il file e riprova.",
        "playbackFailed": "Impossibile riprodurre il video. Riprova.",
        "durationUnknown": "Impossibile determinare la durata del video",
        "invalidSelection": "Selezione di taglio non valida"
      },
      "validation": {
        "startNegative": "L'ora di inizio non puo essere negativa",
        "endExceedsDuration": "L'ora di fine supera la durata del video",
        "startAfterEnd": "L'ora di inizio deve essere prima dell'ora di fine",
        "minDuration": "La durata minima del taglio e {min} {min, plural, one {secondo} other {secondi}}"
      }
    }
  }
}
```

#### Verification
- [ ] All 5 language files updated
- [ ] JSON is valid in each file
- [ ] Pluralization syntax correct for each language
- [ ] No English fallback strings remain
- [ ] All keys present in all files

---

## 4. Translation Keys Reference

### Articles.crop Namespace

| Key | English | Description |
|-----|---------|-------------|
| `aspectRatios.free` | Free | Free-form aspect ratio |
| `aspectRatios.square` | 1:1 | Square ratio |
| `aspectRatios.standard` | 4:3 | Standard photo ratio |
| `aspectRatios.widescreen` | 16:9 | Widescreen ratio |
| `loading` | Loading image... | Image loading state |
| `processing` | Applying crop... | Crop processing state |
| `preview.label` | Preview: | Preview section label |
| `preview.generating` | Generating... | Preview generation state |
| `preview.selectArea` | Select area to preview | Initial preview prompt |
| `preview.alt` | Crop preview | Main image alt text |
| `preview.thumbnailAlt` | Crop preview thumbnail | Thumbnail alt text |
| `actions.applyCrop` | Apply Crop | Apply button label |
| `actions.applying` | Applying... | Apply in-progress |
| `actions.cancel` | Cancel | Cancel button label |
| `actions.dismissError` | Dismiss error | Error dismiss aria-label |
| `errors.loadFailed` | Failed to load image... | Image load error |
| `errors.canvasContext` | Failed to get canvas 2D context... | Canvas error |
| `errors.blobCreation` | Failed to create image blob... | Blob creation error |
| `warnings.largeImage` | Large image detected... | Large image warning |

### Articles.trim Namespace

| Key | English | Description |
|-----|---------|-------------|
| `loading` | Loading video... | Video loading state |
| `markers.start` | Start trim point | Start marker aria-label |
| `markers.startLabel` | S | Start marker visual label |
| `markers.end` | End trim point | End marker aria-label |
| `markers.endLabel` | E | End marker visual label |
| `display.selection` | Selection: | Selection label |
| `display.duration` | Duration: | Duration label |
| `display.current` | Current: | Current time label |
| `display.trimSavings` | Trimming {time} ({percent}% reduction) | Trim savings indicator |
| `playback.skipToStart` | Skip to start marker | Skip-to-start aria-label |
| `playback.skipToEnd` | Skip to end marker | Skip-to-end aria-label |
| `playback.play` | Play trimmed region | Play button aria-label |
| `playback.pause` | Pause | Pause button aria-label |
| `actions.applyTrim` | Apply Trim | Apply button label |
| `actions.cancel` | Cancel | Cancel button label |
| `actions.tryAgain` | Try again | Retry button label |
| `errors.heading` | Error | Error heading |
| `errors.loadFailed` | Failed to load video... | Video load error |
| `errors.playbackFailed` | Unable to play video... | Playback error |
| `errors.durationUnknown` | Unable to determine video duration | Duration detection error |
| `errors.invalidSelection` | Invalid trim selection | Fallback validation error |
| `validation.startNegative` | Start time cannot be negative | Validation error |
| `validation.endExceedsDuration` | End time exceeds video duration | Validation error |
| `validation.startAfterEnd` | Start time must be before end time | Validation error |
| `validation.minDuration` | Minimum trim duration is {min} second(s) | Validation error with pluralization |

---

## 5. Testing Checklist

### Unit Tests

- [ ] Verify `useTranslations` hook is properly initialized in both components
- [ ] Test that all translation keys exist and return expected values
- [ ] Test `validateTrim` returns correct error codes for each validation failure
- [ ] Test `CropError` class properly captures error codes and parameters
- [ ] Test interpolation variables are correctly passed (`{min}`, `{time}`, `{percent}`, `{format}`)
- [ ] Test pluralization works correctly for `minDuration` validation message

### Integration Tests

- [ ] Test image cropping workflow in all 6 languages
- [ ] Test video trimming workflow in all 6 languages
- [ ] Verify aspect ratio labels display correctly when switching languages
- [ ] Test validation error messages appear in correct language
- [ ] Verify no English fallback strings appear when using non-English locales
- [ ] Test error handling paths display translated messages

### Visual Testing

- [ ] Check text truncation in aspect ratio buttons (especially German)
- [ ] Verify layout integrity with text expansion in duration display
- [ ] Test mobile responsiveness with translated strings
- [ ] Verify timeline marker labels don't overlap with longer text
- [ ] Check error message display doesn't overflow container

### Accessibility Testing

- [ ] Verify screen reader announces correct translated text for timeline markers
- [ ] Test keyboard navigation with translated aria-labels
- [ ] Confirm all interactive elements have translated accessible names
- [ ] Test play/pause aria-label changes correctly based on state
- [ ] Verify error dismiss button has correct translated aria-label

### Language Switching Tests

- [ ] Verify crop/trim components handle language switching without breaking edit state
- [ ] Test that current crop selection is preserved when language changes
- [ ] Test that video playback state is preserved when language changes
- [ ] Verify no component remounts occur on language change

---

## 6. Acceptance Criteria

Based on the request acceptance criteria, verify the following:

- [ ] Image cropping tool labels and instructions are replaced with translation hooks from the articles namespace
- [ ] Aspect ratio preset buttons (Free, 1:1, 4:3, 16:9) display translated labels
- [ ] Crop area reset and cancel options use localized strings
- [ ] Apply/save confirmation buttons display in the correct language
- [ ] Error messages related to invalid crop dimensions appear in the selected language
- [ ] Video trimming timeline markers and labels display translated text
- [ ] Start/end time displays use localized formatting (via translated labels)
- [ ] Trim apply/reset/cancel buttons display in the correct language
- [ ] Validation messages for invalid trim timeframes appear in the correct language
- [ ] Loading and processing state messages are fully translated
- [ ] All crop/trim error messages display in the selected language with clear guidance
- [ ] No hardcoded English strings remain in crop/trim utility components
- [ ] Translation keys follow established naming conventions in the articles namespace
- [ ] Crop/trim components properly handle language switching without breaking edit state

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-20 | Claude | Initial detailed task breakdown |
