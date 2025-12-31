# REQ-052: Create Validation Layer - Technical Overview

**Document Created:** 2025-12-31T16:00:00
**Last Modified:** 2025-12-31T16:00:00
**Request Reference:** `/docs/gen_requests.md` - Request #052
**Implementation Plan:** `/docs/prd/item-capture-implementation-plan.md`
**Phase:** 5 - Review & Polish
**Task ID:** 5.3
**Status:** Ready for Implementation

---

## 1. Summary

Implement a comprehensive validation layer for the ItemCapture component that validates all user-provided content before allowing submission. This includes required field validation, content requirement enforcement (at least one media or text item), individual file size limit enforcement, and total size calculation across all uploads.

**Key Responsibility:** The validation layer acts as the gatekeeper for submission, ensuring data completeness, content requirements, and size constraints are met before the `ItemRecord` is assembled and emitted via `onComplete`.

---

## 2. Context from Implementation Plan

### Phase 5 Position

```
5.1 ReviewStep ◄────► 5.2 MediaThumbnail
       │                 (can develop together)
       ▼
5.3 Validation Layer   ◄── THIS TASK
       │
       ▼
5.4 onComplete Assembly
       │
  ┌────┴────┐
  ▼         ▼
5.5       5.6
Perf     Test
Opt.    Harness
```

### Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Phase 1 (Foundation) | Required | Types, state machine, wizard navigation |
| Task 5.1 (ReviewStep) | Required | Provides the UI that calls validation before submit |
| Task 5.2 (MediaThumbnail) | Parallel | Independent utility component |

### This Task Enables

Upon completion of the validation layer:
- ReviewStep can validate before allowing submission
- Users receive clear, actionable feedback about missing or invalid data
- File size limits are enforced at both individual and total levels
- Content requirements are enforced (at least one media item or text)
- Phase 5 continues with onComplete assembly (5.4)

---

## 3. Technical Approach

### 3.1 Validation Architecture

The validation layer will be implemented as a set of pure functions and a validation hook that can be used by ReviewStep and other components:

```
src/components/ItemCapture/
└── utils/
    └── validation.ts              # Pure validation functions
└── hooks/
    └── useItemValidation.ts       # React hook for validation state
```

### 3.2 Validation Categories

| Category | Validation Type | Description |
|----------|-----------------|-------------|
| **Metadata** | Required fields | Title must be non-empty |
| **Content** | Presence check | At least one media item OR text instructions required |
| **File Size** | Per-file limit | Each file must be under its type-specific limit |
| **Total Size** | Aggregate limit | Sum of all file sizes must not exceed total limit |
| **File Type** | MIME validation | Files must match allowed types |

### 3.3 Size Limits from Constants

Based on the implementation plan (`/docs/prd/item-capture-implementation-plan.md`), the validation layer will use these constants:

```typescript
// From Appendix B: Constants Reference
export const CAPTURE_CONSTRAINTS = {
  video: {
    maxDuration: 120,        // 2 minutes in seconds
    maxFileSize: 104857600,  // 100 MB
  },
  image: {
    maxFileSize: 20971520,   // 20 MB
    maxCount: 10,
  },
  pdf: {
    maxFileSize: 52428800,   // 50 MB
    maxPages: 50,
  },
  text: {
    maxLength: 5000,         // characters
  },
  total: {
    maxSize: 209715200,      // 200 MB total per item
  },
};
```

---

## 4. Validation Functions Interface

### 4.1 Core Validation Result Types

```typescript
/**
 * Result of a single validation check
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Result of a field validation with field identifier
 */
export interface FieldValidationResult {
  field: string;
  isValid: boolean;
  error?: string;
}

/**
 * Result of validating a media item's size
 */
export interface FileSizeValidationResult {
  mediaId: string;
  isValid: boolean;
  fileSize: number;
  maxAllowed: number;
  error?: string;
}

/**
 * Complete validation state for the ItemCapture form
 */
export interface ItemCaptureValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  metadata: {
    title: ValidationResult;
    location: ValidationResult;
    tags: ValidationResult;
    applianceType: ValidationResult;
  };
  content: {
    hasMedia: boolean;
    hasText: boolean;
    hasContent: boolean;
    error?: string;
  };
  fileSize: {
    individual: FileSizeValidationResult[];
    total: {
      currentSize: number;
      maxAllowed: number;
      isValid: boolean;
      error?: string;
    };
  };
}
```

### 4.2 Pure Validation Functions

```typescript
/**
 * Validate that title is provided and within limits
 */
export function validateTitle(title: string): ValidationResult {
  if (!title || !title.trim()) {
    return { isValid: false, error: 'Title is required' };
  }
  if (title.trim().length > 200) {
    return { isValid: false, error: 'Title must be 200 characters or less' };
  }
  return { isValid: true };
}

/**
 * Validate content requirement (media OR text required)
 */
export function validateContentRequirement(
  mediaItems: MediaItem[],
  instructions: string
): ValidationResult {
  const hasMedia = mediaItems.length > 0;
  const hasText = instructions && instructions.trim().length > 0;

  if (!hasMedia && !hasText) {
    return {
      isValid: false,
      error: 'At least one media item or text instructions must be provided'
    };
  }
  return { isValid: true };
}

/**
 * Validate individual file size against type-specific limit
 */
export function validateFileSize(
  file: File | Blob,
  mediaType: 'video' | 'image' | 'pdf'
): FileSizeValidationResult {
  const limits = {
    video: CAPTURE_CONSTRAINTS.video.maxFileSize,
    image: CAPTURE_CONSTRAINTS.image.maxFileSize,
    pdf: CAPTURE_CONSTRAINTS.pdf.maxFileSize,
  };

  const maxAllowed = limits[mediaType];
  const fileSize = file.size;

  if (fileSize > maxAllowed) {
    return {
      mediaId: '', // Caller should set this
      isValid: false,
      fileSize,
      maxAllowed,
      error: `File exceeds ${formatFileSize(maxAllowed)} limit (current: ${formatFileSize(fileSize)})`
    };
  }

  return {
    mediaId: '',
    isValid: true,
    fileSize,
    maxAllowed
  };
}

/**
 * Validate total size of all media items
 */
export function validateTotalSize(mediaItems: MediaItem[]): ValidationResult {
  const totalSize = mediaItems.reduce((sum, item) => {
    return sum + (item.file?.size || 0);
  }, 0);

  const maxAllowed = CAPTURE_CONSTRAINTS.total.maxSize;

  if (totalSize > maxAllowed) {
    return {
      isValid: false,
      error: `Total upload size (${formatFileSize(totalSize)}) exceeds ${formatFileSize(maxAllowed)} limit`
    };
  }

  return { isValid: true };
}

/**
 * Validate text/instructions length
 */
export function validateTextLength(text: string): ValidationResult {
  if (text.length > CAPTURE_CONSTRAINTS.text.maxLength) {
    return {
      isValid: false,
      error: `Instructions exceed ${CAPTURE_CONSTRAINTS.text.maxLength} character limit (current: ${text.length})`
    };
  }
  return { isValid: true };
}

/**
 * Validate image count limit
 */
export function validateImageCount(mediaItems: MediaItem[]): ValidationResult {
  const imageCount = mediaItems.filter(item => item.type === 'image').length;
  const maxAllowed = CAPTURE_CONSTRAINTS.image.maxCount;

  if (imageCount > maxAllowed) {
    return {
      isValid: false,
      error: `Maximum ${maxAllowed} photos allowed (current: ${imageCount})`
    };
  }
  return { isValid: true };
}
```

### 4.3 Complete Validation Function

```typescript
/**
 * Perform complete validation of ItemCapture state
 * Returns comprehensive validation result with all errors and warnings
 */
export function validateItemCapture(
  metadata: ItemMetadata,
  mediaItems: MediaItem[],
  instructions: string
): ItemCaptureValidation {
  // Validate metadata
  const titleValidation = validateTitle(metadata.title);
  const locationValidation = { isValid: true }; // Location is optional
  const tagsValidation = { isValid: true }; // Tags are optional
  const applianceTypeValidation = { isValid: true }; // Appliance type is optional

  // Validate content requirement
  const contentValidation = validateContentRequirement(mediaItems, instructions);

  // Validate individual file sizes
  const fileSizeResults: FileSizeValidationResult[] = mediaItems.map(item => {
    const result = validateFileSize(item.file, item.type);
    return { ...result, mediaId: item.id };
  });

  // Validate total size
  const totalSizeValidation = validateTotalSize(mediaItems);

  // Validate text length
  const textValidation = validateTextLength(instructions || '');

  // Validate image count
  const imageCountValidation = validateImageCount(mediaItems);

  // Calculate total size
  const totalSize = mediaItems.reduce((sum, item) => sum + (item.file?.size || 0), 0);

  // Compile errors
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!titleValidation.isValid) {
    errors.title = titleValidation.error!;
  }

  if (!contentValidation.isValid) {
    errors.content = contentValidation.error!;
  }

  fileSizeResults.forEach(result => {
    if (!result.isValid) {
      errors[`fileSize_${result.mediaId}`] = result.error!;
    }
  });

  if (!totalSizeValidation.isValid) {
    errors.totalSize = totalSizeValidation.error!;
  }

  if (!textValidation.isValid) {
    warnings.textLength = textValidation.error!;
  }

  if (!imageCountValidation.isValid) {
    errors.imageCount = imageCountValidation.error!;
  }

  // Determine overall validity
  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    warnings,
    metadata: {
      title: titleValidation,
      location: locationValidation,
      tags: tagsValidation,
      applianceType: applianceTypeValidation,
    },
    content: {
      hasMedia: mediaItems.length > 0,
      hasText: (instructions?.trim().length || 0) > 0,
      hasContent: contentValidation.isValid,
      error: contentValidation.error,
    },
    fileSize: {
      individual: fileSizeResults,
      total: {
        currentSize: totalSize,
        maxAllowed: CAPTURE_CONSTRAINTS.total.maxSize,
        isValid: totalSizeValidation.isValid,
        error: totalSizeValidation.error,
      },
    },
  };
}
```

---

## 5. React Hook: useItemValidation

```typescript
/**
 * Hook for managing validation state in ItemCapture
 * Provides real-time validation updates as state changes
 */
export function useItemValidation(
  metadata: ItemMetadata,
  mediaItems: MediaItem[],
  instructions: string
): {
  validation: ItemCaptureValidation;
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  validateField: (field: keyof ItemMetadata, value: string) => ValidationResult;
  validateAll: () => ItemCaptureValidation;
  calculateTotalSize: () => number;
  getRemainingSize: () => number;
  formatSize: (bytes: number) => string;
} {
  const [validation, setValidation] = useState<ItemCaptureValidation>(() =>
    validateItemCapture(metadata, mediaItems, instructions)
  );

  // Re-validate when inputs change
  useEffect(() => {
    const newValidation = validateItemCapture(metadata, mediaItems, instructions);
    setValidation(newValidation);
  }, [metadata, mediaItems, instructions]);

  // Validate a single field
  const validateField = useCallback((field: keyof ItemMetadata, value: string): ValidationResult => {
    switch (field) {
      case 'title':
        return validateTitle(value);
      default:
        return { isValid: true };
    }
  }, []);

  // Force full validation
  const validateAll = useCallback(() => {
    const newValidation = validateItemCapture(metadata, mediaItems, instructions);
    setValidation(newValidation);
    return newValidation;
  }, [metadata, mediaItems, instructions]);

  // Calculate current total size
  const calculateTotalSize = useCallback(() => {
    return mediaItems.reduce((sum, item) => sum + (item.file?.size || 0), 0);
  }, [mediaItems]);

  // Calculate remaining size before limit
  const getRemainingSize = useCallback(() => {
    const currentSize = calculateTotalSize();
    return Math.max(0, CAPTURE_CONSTRAINTS.total.maxSize - currentSize);
  }, [calculateTotalSize]);

  return {
    validation,
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    validateField,
    validateAll,
    calculateTotalSize,
    getRemainingSize,
    formatSize: formatFileSize,
  };
}
```

---

## 6. Utility Functions

### 6.1 File Size Formatting

```typescript
/**
 * Format bytes as human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Parse file size string to bytes
 * Supports: "100MB", "1.5GB", "500KB"
 */
export function parseFileSize(sizeStr: string): number {
  const match = sizeStr.match(/^([\d.]+)\s*(B|KB|MB|GB)$/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
  };

  return value * (multipliers[unit] || 1);
}
```

### 6.2 MIME Type Validation

```typescript
/**
 * Validate MIME type against allowed types for media category
 */
export function validateMimeType(
  mimeType: string,
  mediaType: 'video' | 'image' | 'pdf'
): ValidationResult {
  const allowedTypes = SUPPORTED_FORMATS[mediaType === 'image' ? 'image' : mediaType];

  if (!allowedTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `File type "${mimeType}" is not supported for ${mediaType}`
    };
  }

  return { isValid: true };
}
```

---

## 7. Integration with ReviewStep

### 7.1 Usage in ReviewStep

```typescript
import { useItemValidation } from '../../hooks/useItemValidation';
import { ValidationMessage } from '../shared/ValidationMessage';

function ReviewStep({
  metadata,
  mediaItems,
  instructions,
  onSubmit,
  // ... other props
}: ReviewStepProps) {
  const {
    validation,
    isValid,
    errors,
    warnings,
    calculateTotalSize,
    getRemainingSize,
    formatSize,
  } = useItemValidation(metadata, mediaItems, instructions);

  // Show validation errors
  const handleSubmit = () => {
    if (isValid) {
      onSubmit();
    }
    // Errors are already displayed via validation state
  };

  return (
    <div>
      {/* Size indicator */}
      <div className="text-sm text-gray-600 mb-4">
        Total size: {formatSize(calculateTotalSize())} / {formatSize(CAPTURE_CONSTRAINTS.total.maxSize)}
        <span className="text-gray-400 ml-2">
          ({formatSize(getRemainingSize())} remaining)
        </span>
      </div>

      {/* Validation errors */}
      {Object.entries(errors).map(([field, error]) => (
        <ValidationMessage key={field} type="error" message={error} />
      ))}

      {/* Validation warnings */}
      {Object.entries(warnings).map(([field, warning]) => (
        <ValidationMessage key={field} type="warning" message={warning} />
      ))}

      {/* Submit button disabled when invalid */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        className={cn(
          'px-6 py-2 rounded-lg',
          isValid ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
        )}
      >
        Submit Item
      </button>
    </div>
  );
}
```

### 7.2 ValidationMessage Component

```typescript
interface ValidationMessageProps {
  type: 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

export function ValidationMessage({ type, message, className }: ValidationMessageProps) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-3 rounded border',
      styles[type],
      className
    )}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
```

---

## 8. State Machine Integration

### 8.1 Validation Action Types

```typescript
// Add to ItemCaptureAction type
type ItemCaptureAction =
  | // ... existing actions
  | { type: 'VALIDATE' }
  | { type: 'SET_VALIDATION_ERROR'; payload: { field: string; message: string } }
  | { type: 'CLEAR_VALIDATION_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_VALIDATION_ERRORS' };
```

### 8.2 Reducer Integration

```typescript
function itemCaptureReducer(state: ItemCaptureState, action: ItemCaptureAction): ItemCaptureState {
  switch (action.type) {
    // ... existing cases

    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message,
        },
      };

    case 'CLEAR_VALIDATION_ERROR':
      const { [action.payload]: _, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors,
      };

    case 'CLEAR_ALL_VALIDATION_ERRORS':
      return {
        ...state,
        errors: {},
      };

    default:
      return state;
  }
}
```

---

## 9. Real-Time Validation Updates

### 9.1 Validation on Media Add

When a media item is added, validate immediately:

```typescript
// In useFileUpload or useMediaCapture
const handleFileSelected = (file: File, mediaType: 'video' | 'image' | 'pdf') => {
  // Validate file size before adding
  const sizeValidation = validateFileSize(file, mediaType);
  if (!sizeValidation.isValid) {
    dispatch({
      type: 'SET_VALIDATION_ERROR',
      payload: { field: 'newFile', message: sizeValidation.error! }
    });
    return;
  }

  // Validate total size before adding
  const currentTotal = state.mediaItems.reduce((sum, item) => sum + (item.file?.size || 0), 0);
  if (currentTotal + file.size > CAPTURE_CONSTRAINTS.total.maxSize) {
    dispatch({
      type: 'SET_VALIDATION_ERROR',
      payload: {
        field: 'totalSize',
        message: `Adding this file would exceed the ${formatFileSize(CAPTURE_CONSTRAINTS.total.maxSize)} total limit`
      }
    });
    return;
  }

  // Clear error and add file
  dispatch({ type: 'CLEAR_VALIDATION_ERROR', payload: 'newFile' });
  dispatch({ type: 'ADD_MEDIA', payload: createMediaItem(file, mediaType) });
};
```

### 9.2 Validation on Text Change

```typescript
// In TextEditorStep
const handleTextChange = (text: string) => {
  const validation = validateTextLength(text);

  if (!validation.isValid) {
    dispatch({
      type: 'SET_VALIDATION_ERROR',
      payload: { field: 'instructions', message: validation.error! }
    });
  } else {
    dispatch({ type: 'CLEAR_VALIDATION_ERROR', payload: 'instructions' });
  }

  dispatch({ type: 'SET_INSTRUCTIONS', payload: text });
};
```

---

## 10. Acceptance Criteria Mapping

Based on Request #052:

| Acceptance Criterion | Implementation |
|----------------------|----------------|
| Submission cannot proceed when required metadata is empty/invalid | `validateTitle()` function + submit button disabled state |
| Submission cannot proceed without media or text content | `validateContentRequirement()` function |
| Warning for single file exceeding max size | `validateFileSize()` with type-specific limits |
| Warning for total size exceeding max upload size | `validateTotalSize()` with aggregate limit |
| Specific, user-friendly error messages | `ValidationMessage` component with clear, actionable text |
| Accurate total size calculation | `calculateTotalSize()` method in hook |
| Real-time validation state updates | `useItemValidation` hook with `useEffect` on state changes |

---

## 11. Error Message Guidelines

### 11.1 Message Principles

Following the existing codebase pattern from `/src/lib/error-utils.ts`:

1. **Be specific** - Tell users exactly what's wrong
2. **Be actionable** - Tell users how to fix it
3. **Use friendly language** - Avoid technical jargon
4. **Show limits** - Include current value vs. allowed limit

### 11.2 Standard Error Messages

| Error Type | Message Template | Example |
|------------|------------------|---------|
| Required field | `{Field} is required` | "Title is required" |
| Over character limit | `{Field} must be {limit} characters or less (current: {count})` | "Title must be 200 characters or less (current: 215)" |
| No content | `At least one media item or text instructions must be provided` | - |
| File too large | `File exceeds {limit} limit (current: {size})` | "File exceeds 100 MB limit (current: 125 MB)" |
| Total too large | `Total upload size ({size}) exceeds {limit} limit` | "Total upload size (220 MB) exceeds 200 MB limit" |
| Too many images | `Maximum {limit} photos allowed (current: {count})` | "Maximum 10 photos allowed (current: 12)" |
| Invalid file type | `File type "{type}" is not supported for {category}` | "File type 'audio/mp3' is not supported for video" |

---

## 12. Component Structure

```
src/components/ItemCapture/
├── utils/
│   ├── validation.ts              # Pure validation functions (NEW)
│   ├── fileValidation.ts          # MIME type validation (NEW or merge into validation.ts)
│   └── constants.ts               # Size limits (may need creation if not exists)
├── hooks/
│   └── useItemValidation.ts       # Validation hook (NEW)
└── components/
    └── shared/
        └── ValidationMessage.tsx  # Error/warning display component (NEW)
```

---

## 13. Authorized Files and Functions for Modification

### Files to CREATE

| File Path | Purpose |
|-----------|---------|
| `src/components/ItemCapture/utils/validation.ts` | Pure validation functions |
| `src/components/ItemCapture/hooks/useItemValidation.ts` | React validation hook |
| `src/components/ItemCapture/components/shared/ValidationMessage.tsx` | Error/warning display component |
| `src/components/ItemCapture/utils/constants.ts` | Capture constraints constants (if not exists) |

### Files to MODIFY

| File Path | Modification |
|-----------|--------------|
| `src/components/ItemCapture/components/steps/ReviewStep.tsx` | Integrate useItemValidation hook, display validation errors, disable submit when invalid |
| `src/components/ItemCapture/hooks/useItemCaptureState.ts` | Add validation-related action types if needed |
| `src/components/ItemCapture/hooks/useFileUpload.ts` | Add pre-add validation for file size |
| `src/components/ItemCapture/hooks/useMediaCapture.ts` | Add validation for captured media size |
| `src/components/ItemCapture/index.ts` | Export validation utilities if needed externally |

### Files to REFERENCE (read-only patterns)

| File Path | Pattern Reference |
|-----------|-------------------|
| `src/lib/access-validation.ts` | Validation result types, error code patterns |
| `src/components/PropertyForm.tsx` | Form validation, character limits, error display |
| `src/components/RegistrationForm.tsx` | Field-level validation, password strength pattern |
| `src/lib/error-utils.ts` | Error codes, user-friendly error translation |
| `src/components/ItemForm.tsx` | Form state, validation errors object pattern |
| `src/lib/utils.ts` | Utility function patterns |

### Dependencies Required

| Dependency | Version | Notes |
|------------|---------|-------|
| `lucide-react` | ^0.525.0 | Already installed - AlertCircle, AlertTriangle, Info icons |

**No new dependencies required.**

---

## 14. Testing Approach

### Unit Tests

1. **validateTitle()**
   - Returns error for empty string
   - Returns error for whitespace-only string
   - Returns error for string > 200 characters
   - Returns valid for non-empty string ≤ 200 characters

2. **validateContentRequirement()**
   - Returns error when no media and no text
   - Returns valid when media present, no text
   - Returns valid when text present, no media
   - Returns valid when both media and text present

3. **validateFileSize()**
   - Returns error when video > 100 MB
   - Returns error when image > 20 MB
   - Returns error when PDF > 50 MB
   - Returns valid when under respective limits
   - Correctly reports current size and limit in error

4. **validateTotalSize()**
   - Returns error when total > 200 MB
   - Returns valid when total ≤ 200 MB
   - Correctly sums all media item sizes

5. **validateItemCapture()**
   - Returns comprehensive validation result
   - Sets isValid=false when any error present
   - Correctly populates errors object
   - Correctly populates warnings object

### Integration Tests

1. Hook provides real-time validation updates
2. ReviewStep disables submit when invalid
3. Error messages display correctly
4. Validation clears when user fixes issue
5. Pre-add validation prevents oversized files

### Manual Testing Checklist

- [ ] Submit disabled when title empty
- [ ] Submit disabled when no content
- [ ] Error message appears for empty title
- [ ] Error message appears for no content
- [ ] Warning appears for file exceeding size limit
- [ ] Total size indicator updates in real-time
- [ ] Submit enabled when all validations pass
- [ ] Error messages are specific and actionable
- [ ] Works on iPhone Safari
- [ ] Works on Android Chrome
- [ ] Works on desktop browsers

---

## 15. Implementation Order

1. Create `constants.ts` with CAPTURE_CONSTRAINTS and SUPPORTED_FORMATS (if not exists)
2. Create `validation.ts` with pure validation functions
3. Create `formatFileSize()` and other utility functions
4. Create `ValidationMessage.tsx` component
5. Create `useItemValidation.ts` hook
6. Integrate validation hook in ReviewStep
7. Add pre-add validation in useFileUpload/useMediaCapture
8. Add real-time validation in TextEditorStep
9. Test all validation scenarios
10. Test on target browsers/devices

---

## 16. Related Tasks

| Task ID | Title | Relationship |
|---------|-------|--------------|
| 5.1 | ReviewStep | Consumer - uses validation to enable/disable submit |
| 5.4 | onComplete Assembly | Dependent - only assembles if validation passes |
| 3.1 | useFileUpload | Integration - add pre-add validation |
| 2.1 | useMediaCapture | Integration - add captured media validation |
| 3.4 | TextEditorStep | Integration - add text length validation |

---

## 17. Performance Considerations

### 17.1 Memoization

```typescript
// Memoize validation result to avoid recalculating on every render
const validation = useMemo(() =>
  validateItemCapture(metadata, mediaItems, instructions),
  [metadata, mediaItems, instructions]
);
```

### 17.2 Debouncing

```typescript
// Debounce text validation to avoid excessive recalculation
const debouncedInstructions = useDebounce(instructions, 300);

useEffect(() => {
  const validation = validateTextLength(debouncedInstructions);
  // Update validation state
}, [debouncedInstructions]);
```

### 17.3 Lazy Calculation

```typescript
// Only calculate total size when needed
const calculateTotalSize = useCallback(() => {
  return mediaItems.reduce((sum, item) => sum + (item.file?.size || 0), 0);
}, [mediaItems]);
```

---

## 18. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Error announcements | Use `aria-live="polite"` for error messages |
| Error association | Use `aria-describedby` linking inputs to errors |
| Error identification | Use `aria-invalid="true"` on invalid fields |
| Color-independent | Icons and text, not just color, indicate errors |
| Focus management | Focus first invalid field on submit attempt |

### Error Announcement Pattern

```tsx
<div role="alert" aria-live="polite">
  {hasErrors && (
    <p className="sr-only">
      There are {Object.keys(errors).length} validation errors.
      Please correct them before submitting.
    </p>
  )}
</div>
```

---

## 19. Open Questions

1. **Soft vs Hard Limits:** Should file size warnings be blocking (errors) or non-blocking (warnings)?
   - **Recommendation:** Blocking - prevents upload failures later

2. **Text Length Warning vs Error:** Should exceeding text length prevent submission?
   - **Recommendation:** Warning at 90% of limit, error at 100%

3. **Validation Timing:** Should validation run on blur, change, or both?
   - **Recommendation:** On change for UX, debounced for performance

4. **Server-Side Validation:** Should this layer be aware of any server-side limits?
   - **Recommendation:** Not in V1 - component is backend-agnostic

---

## 20. Component Implementation Skeleton

```typescript
// src/components/ItemCapture/utils/validation.ts
'use client';

import type { MediaItem, ItemMetadata } from '../ItemCapture.types';
import { CAPTURE_CONSTRAINTS, SUPPORTED_FORMATS } from './constants';

// Types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileSizeValidationResult {
  mediaId: string;
  isValid: boolean;
  fileSize: number;
  maxAllowed: number;
  error?: string;
}

export interface ItemCaptureValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  metadata: {
    title: ValidationResult;
    location: ValidationResult;
    tags: ValidationResult;
    applianceType: ValidationResult;
  };
  content: {
    hasMedia: boolean;
    hasText: boolean;
    hasContent: boolean;
    error?: string;
  };
  fileSize: {
    individual: FileSizeValidationResult[];
    total: {
      currentSize: number;
      maxAllowed: number;
      isValid: boolean;
      error?: string;
    };
  };
}

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Validation functions
export function validateTitle(title: string): ValidationResult {
  if (!title || !title.trim()) {
    return { isValid: false, error: 'Title is required' };
  }
  if (title.trim().length > 200) {
    return { isValid: false, error: `Title must be 200 characters or less (current: ${title.trim().length})` };
  }
  return { isValid: true };
}

export function validateContentRequirement(
  mediaItems: MediaItem[],
  instructions: string
): ValidationResult {
  const hasMedia = mediaItems.length > 0;
  const hasText = instructions && instructions.trim().length > 0;

  if (!hasMedia && !hasText) {
    return {
      isValid: false,
      error: 'At least one media item or text instructions must be provided'
    };
  }
  return { isValid: true };
}

export function validateFileSize(
  file: File | Blob,
  mediaType: 'video' | 'image' | 'pdf'
): ValidationResult & { fileSize: number; maxAllowed: number } {
  const limits: Record<string, number> = {
    video: CAPTURE_CONSTRAINTS.video.maxFileSize,
    image: CAPTURE_CONSTRAINTS.image.maxFileSize,
    pdf: CAPTURE_CONSTRAINTS.pdf.maxFileSize,
  };

  const maxAllowed = limits[mediaType] || 0;
  const fileSize = file.size;

  if (fileSize > maxAllowed) {
    return {
      isValid: false,
      fileSize,
      maxAllowed,
      error: `File exceeds ${formatFileSize(maxAllowed)} limit (current: ${formatFileSize(fileSize)})`
    };
  }

  return { isValid: true, fileSize, maxAllowed };
}

export function validateTotalSize(mediaItems: MediaItem[]): ValidationResult & { currentSize: number } {
  const currentSize = mediaItems.reduce((sum, item) => sum + (item.file?.size || 0), 0);
  const maxAllowed = CAPTURE_CONSTRAINTS.total.maxSize;

  if (currentSize > maxAllowed) {
    return {
      isValid: false,
      currentSize,
      error: `Total upload size (${formatFileSize(currentSize)}) exceeds ${formatFileSize(maxAllowed)} limit`
    };
  }

  return { isValid: true, currentSize };
}

export function validateTextLength(text: string): ValidationResult {
  const maxLength = CAPTURE_CONSTRAINTS.text.maxLength;
  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `Instructions exceed ${maxLength} character limit (current: ${text.length})`
    };
  }
  return { isValid: true };
}

export function validateImageCount(mediaItems: MediaItem[]): ValidationResult {
  const imageCount = mediaItems.filter(item => item.type === 'image').length;
  const maxAllowed = CAPTURE_CONSTRAINTS.image.maxCount;

  if (imageCount > maxAllowed) {
    return {
      isValid: false,
      error: `Maximum ${maxAllowed} photos allowed (current: ${imageCount})`
    };
  }
  return { isValid: true };
}

export function validateMimeType(
  mimeType: string,
  mediaType: 'video' | 'image' | 'pdf'
): ValidationResult {
  const key = mediaType === 'image' ? 'image' : mediaType;
  const allowedTypes = SUPPORTED_FORMATS[key];

  if (!allowedTypes || !allowedTypes.includes(mimeType)) {
    return {
      isValid: false,
      error: `File type "${mimeType}" is not supported for ${mediaType}`
    };
  }

  return { isValid: true };
}

// Complete validation
export function validateItemCapture(
  metadata: ItemMetadata,
  mediaItems: MediaItem[],
  instructions: string
): ItemCaptureValidation {
  const titleValidation = validateTitle(metadata.title);
  const contentValidation = validateContentRequirement(mediaItems, instructions);
  const totalSizeResult = validateTotalSize(mediaItems);
  const textValidation = validateTextLength(instructions || '');
  const imageCountValidation = validateImageCount(mediaItems);

  const fileSizeResults: FileSizeValidationResult[] = mediaItems.map(item => {
    const result = validateFileSize(item.file, item.type);
    return {
      mediaId: item.id,
      isValid: result.isValid,
      fileSize: result.fileSize,
      maxAllowed: result.maxAllowed,
      error: result.error,
    };
  });

  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!titleValidation.isValid && titleValidation.error) {
    errors.title = titleValidation.error;
  }

  if (!contentValidation.isValid && contentValidation.error) {
    errors.content = contentValidation.error;
  }

  fileSizeResults.forEach(result => {
    if (!result.isValid && result.error) {
      errors[`fileSize_${result.mediaId}`] = result.error;
    }
  });

  if (!totalSizeResult.isValid && totalSizeResult.error) {
    errors.totalSize = totalSizeResult.error;
  }

  if (!textValidation.isValid && textValidation.error) {
    warnings.textLength = textValidation.error;
  }

  if (!imageCountValidation.isValid && imageCountValidation.error) {
    errors.imageCount = imageCountValidation.error;
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    warnings,
    metadata: {
      title: titleValidation,
      location: { isValid: true },
      tags: { isValid: true },
      applianceType: { isValid: true },
    },
    content: {
      hasMedia: mediaItems.length > 0,
      hasText: (instructions?.trim().length || 0) > 0,
      hasContent: contentValidation.isValid,
      error: contentValidation.error,
    },
    fileSize: {
      individual: fileSizeResults,
      total: {
        currentSize: totalSizeResult.currentSize,
        maxAllowed: CAPTURE_CONSTRAINTS.total.maxSize,
        isValid: totalSizeResult.isValid,
        error: totalSizeResult.error,
      },
    },
  };
}
```

---

## 21. References

- [Implementation Plan](/docs/prd/item-capture-implementation-plan.md) - Phase 5, Task 5.3
- [Request #052](/docs/gen_requests.md) - Content Submission Validation Layer
- [ReviewStep Overview](/docs/REQ-050-implement-reviewstep-overview.md) - Consumer of validation
- [access-validation.ts](/src/lib/access-validation.ts) - Validation pattern reference
- [PropertyForm.tsx](/src/components/PropertyForm.tsx) - Form validation patterns
- [error-utils.ts](/src/lib/error-utils.ts) - Error code and message patterns
- [ItemForm.tsx](/src/components/ItemForm.tsx) - Form state and validation patterns

---
