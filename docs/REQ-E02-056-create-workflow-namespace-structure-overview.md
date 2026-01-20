# Implementation Breakdown: REQ-E02-056 - Create Workflow Namespace Structure

**Document Version:** 1.0
**Created:** 2026-01-20
**Last Modified:** 2026-01-20
**Request ID:** REQ-E02-056
**Epic:** L10N Epic 2 - Static UI Translation
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.1
**Estimated Strings:** ~500

---

## Overview

This document provides the implementation breakdown for creating the `workflow` namespace structure in the messages file. The workflow namespace will organize all translation keys for the multi-step item creation workflow, which is the largest component set in the FAQBNB application with 86+ files.

The Item Creation Workflow consists of:
- 8 user-visible step components
- 5 adapter components for media capture
- 25+ shared components
- Multiple dialog components
- Post-workflow screens (next-action, session-summary)

---

## Dependencies

### Prerequisites (Epic 1 Foundation)
| Dependency | Location | Status |
|------------|----------|--------|
| next-intl package | `package.json` | Required |
| i18n config | `/src/lib/i18n/config.ts` | Complete |
| Translation files | `/messages/en.json` | Complete (base structure exists) |
| useTranslations hook | next-intl | Available |
| getTranslations | next-intl/server | Available |

### Existing Patterns to Follow
- Translation file structure in `/messages/en.json` (common, auth, dashboard, items, errors, language namespaces)
- Key naming convention: `{namespace}.{component/area}.{element}.{variant?}`
- ICU message format for pluralization

---

## Technical Context

### Current State Analysis

#### Step Components (8 user-visible steps)
| Step | Component | Location | Estimated Strings |
|------|-----------|----------|-------------------|
| 1 | RoomSelectionStep | `.../steps/RoomSelectionStep.tsx` | ~40 |
| 2 | ItemTypeStep | `.../steps/ItemTypeStep.tsx` | ~35 |
| 3 | SpecificItemStep | `.../steps/SpecificItemStep.tsx` | ~30 |
| 4 | PurposeStep | `.../steps/PurposeStep.tsx` | ~35 |
| 5 | ContentTypeStep | `.../steps/ContentTypeStep.tsx` | ~40 |
| 6 | MediaCaptureStep | `.../steps/MediaCaptureStep.tsx` | ~45 |
| 7 | ContentCreationStep | `.../steps/ContentCreationStep.tsx` | ~35 |
| 8 | PreviewSaveStep | `.../steps/PreviewSaveStep.tsx` | ~50 |

#### Adapter Components
| Adapter | Location | Estimated Strings |
|---------|----------|-------------------|
| VideoCaptureAdapter | `.../steps/adapters/VideoCaptureAdapter.tsx` | ~20 |
| PhotoCaptureAdapter | `.../steps/adapters/PhotoCaptureAdapter.tsx` | ~20 |
| FileUploadAdapter | `.../steps/adapters/FileUploadAdapter.tsx` | ~15 |
| TextEditorAdapter | `.../steps/adapters/TextEditorAdapter.tsx` | ~15 |
| UrlInputAdapter | `.../steps/adapters/UrlInputAdapter.tsx` | ~10 |

#### Shared Components (25+ files)
| Component | Estimated Strings |
|-----------|-------------------|
| WorkflowHeader | ~10 |
| ConfirmExitDialog | ~15 |
| RemoveItemDialog | ~10 |
| EmptySessionDialog | ~10 |
| PrintOptionsPanel | ~25 |
| SessionRecoveryBanner | ~15 |
| SessionSummaryStep | ~40 |
| SessionItemCard | ~10 |
| RoomCard | ~5 |
| ItemTypeCard | ~5 |
| TagsEditor | ~15 |
| ContentPreview | ~10 |
| ContentPieceCard | ~10 |
| QRGenerationProgress | ~10 |
| PDFExportDialog | ~15 |
| CameraPermissionFallback | ~10 |
| NetworkErrorIndicator | ~5 |
| ItemContextDisplay | ~10 |
| ItemNameEditor | ~10 |

#### Constants File Strings
Location: `/src/components/ItemCreationWorkflow/utils/constants.ts`
| Category | Count |
|----------|-------|
| ROOM_LABELS | 9 |
| ITEM_TYPE_LABELS | 3 |
| ITEM_TYPE_DESCRIPTIONS | 3 |
| CONTENT_TYPE_LABELS | 5 |
| UNIFIED_CONTENT_OPTIONS labels | 5 |
| PURPOSE_LABELS | 7 |
| PURPOSE_DESCRIPTIONS | 7 |
| TAG_LABELS | 17 |

---

## Namespace Structure Design

The `workflow` namespace will be organized into logical sub-sections:

```json
{
  "workflow": {
    "header": { },           // WorkflowHeader UI
    "navigation": { },       // Back, Next, Exit, Continue buttons
    "steps": {
      "roomSelection": { },  // Step 1
      "itemType": { },       // Step 2
      "specificItem": { },   // Step 3
      "purpose": { },        // Step 4
      "contentType": { },    // Step 5
      "mediaCapture": { },   // Step 6
      "contentCreation": { },// Step 7
      "previewSave": { }     // Step 8
    },
    "postWorkflow": {
      "nextAction": { },     // What's Next screen
      "sessionSummary": { }  // Session summary screen
    },
    "dialogs": {
      "confirmExit": { },    // Exit confirmation
      "removeItem": { },     // Remove item confirmation
      "emptySession": { },   // Empty session warning
      "pdfExport": { }       // PDF export options
    },
    "shared": {
      "sessionRecovery": { },// Recovery banner
      "printOptions": { },   // Print panel
      "qrGeneration": { },   // QR code generation
      "camera": { },         // Camera permissions
      "network": { },        // Network errors
      "tags": { },           // Tags editor
      "content": { }         // Content preview/cards
    },
    "constants": {
      "rooms": { },          // Room type labels
      "itemTypes": { },      // Item type labels/descriptions
      "purposes": { },       // Purpose labels/descriptions
      "contentTypes": { },   // Content type labels
      "tags": { }            // Tag labels
    },
    "validation": { },       // Workflow-specific validation messages
    "accessibility": { }     // Screen reader announcements
  }
}
```

---

## Implementation Tasks

### Task 1: Create Base Namespace Structure
**Priority:** Critical
**Estimate:** 1 story point

Create the `workflow` namespace skeleton in `/messages/en.json` with all required sub-sections.

**Acceptance Criteria:**
- [ ] Workflow namespace added to en.json at root level
- [ ] All sub-sections created (header, navigation, steps, postWorkflow, dialogs, shared, constants, validation, accessibility)
- [ ] Structure follows existing patterns in the messages file
- [ ] JSON validates without syntax errors

### Task 2: Add Navigation Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for workflow navigation elements.

**Keys to add:**
```json
{
  "workflow": {
    "header": {
      "stepOf": "Step {current} of {total}",
      "progressLabel": "Step {current} of {total}"
    },
    "navigation": {
      "back": "Back",
      "next": "Next",
      "continue": "Continue",
      "exit": "Exit",
      "skip": "Skip",
      "done": "Done",
      "save": "Save",
      "cancel": "Cancel",
      "goBackLabel": "Go back to previous step",
      "exitWorkflowLabel": "Exit workflow"
    }
  }
}
```

### Task 3: Add Room Selection Step Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for RoomSelectionStep component.

**Keys to add:**
```json
{
  "workflow": {
    "steps": {
      "roomSelection": {
        "title": "Select a Room",
        "subtitle": "Choose where this item is located in your property",
        "searchPlaceholder": "Search rooms...",
        "customRoomLabel": "Enter room name",
        "customRoomPlaceholder": "e.g., Home Office, Wine Cellar, Mudroom",
        "customRoomHint": "Maximum 50 characters",
        "ariaLabel": "Select a room for your item",
        "ariaHelp": "Use arrow keys to navigate between rooms. Press Enter or Space to select."
      }
    }
  }
}
```

### Task 4: Add Item Type Step Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for ItemTypeStep component.

**Keys to add:**
```json
{
  "workflow": {
    "steps": {
      "itemType": {
        "title": "What type of item?",
        "subtitle": "Select the category that best describes your item",
        "ariaLabel": "Select item type",
        "ariaHelp": "Use arrow keys to navigate. Press Enter or Space to select."
      }
    }
  }
}
```

### Task 5: Add Specific Item Step Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for SpecificItemStep component.

**Keys to add:**
```json
{
  "workflow": {
    "steps": {
      "specificItem": {
        "title": "Which specific item?",
        "subtitle": "Choose or enter the exact item name",
        "searchPlaceholder": "Search or type item name...",
        "suggestions": "Suggestions",
        "customLabel": "Use custom name",
        "itemNameLabel": "Item Name",
        "duplicateWarning": "An item with this name already exists in your session"
      }
    }
  }
}
```

### Task 6: Add Purpose Step Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for PurposeStep component.

**Keys to add:**
```json
{
  "workflow": {
    "steps": {
      "purpose": {
        "title": "What's the purpose of this content?",
        "subtitle": "Choose what you want to help guests with",
        "ariaLabel": "Select content purpose",
        "ariaHelp": "Use up and down arrow keys to navigate. Press Enter or Space to select."
      }
    }
  }
}
```

### Task 7: Add Content Type Step Keys
**Priority:** High
**Estimate:** 0.5 story points

Add keys for ContentTypeStep component.

**Keys to add:**
```json
{
  "workflow": {
    "steps": {
      "contentType": {
        "title": "How do you want to add content?",
        "subtitle": "Choose how to provide instructions",
        "ariaLabel": "Select content type",
        "ariaHelp": "Use arrow keys to navigate. Press Enter or Space to select."
      }
    }
  }
}
```

### Task 8: Add Media Capture Step Keys
**Priority:** High
**Estimate:** 1 story point

Add keys for MediaCaptureStep and adapter components.

**Keys to add:**
```json
{
  "workflow": {
    "steps": {
      "mediaCapture": {
        "title": "Capture Content",
        "takePhoto": "Take Photo",
        "recordVideo": "Record Video",
        "startRecording": "Start Recording",
        "stopRecording": "Stop Recording",
        "retake": "Retake",
        "useThis": "Use This",
        "uploading": "Uploading...",
        "processing": "Processing...",
        "video": {
          "title": "Record Video",
          "instructions": "Position your camera and press record",
          "recording": "Recording...",
          "duration": "Duration: {duration}"
        },
        "photo": {
          "title": "Take Photo",
          "instructions": "Position your camera and press capture"
        },
        "upload": {
          "title": "Upload File",
          "dragDrop": "Drag and drop files here",
          "or": "or",
          "browse": "Browse files",
          "supportedFormats": "Supported formats: {formats}",
          "maxSize": "Maximum file size: {size}MB"
        },
        "text": {
          "title": "Write Instructions",
          "placeholder": "Write your instructions here..."
        },
        "url": {
          "title": "Add Link",
          "placeholder": "Paste URL here...",
          "invalidUrl": "Please enter a valid URL"
        }
      }
    }
  }
}
```

### Task 9: Add Preview/Save Step Keys
**Priority:** High
**Estimate:** 1 story point

Add keys for PreviewSaveStep component.

**Keys to add:**
```json
{
  "workflow": {
    "steps": {
      "previewSave": {
        "title": "Review & Save",
        "subtitle": "Review your item before saving",
        "itemNameLabel": "Item Name",
        "itemNamePlaceholder": "Enter item name",
        "descriptionLabel": "Description",
        "descriptionPlaceholder": "Add an optional description",
        "tagsLabel": "Tags",
        "contentLabel": "Content",
        "contentPieces": "{count, plural, one {# piece} other {# pieces}} of content",
        "addMoreContent": "Add More Content",
        "reorderContent": "Reorder Content",
        "dragToReorder": "Drag to reorder",
        "removeContent": "Remove",
        "saveItem": "Save Item",
        "saving": "Saving...",
        "editRoom": "Edit Room",
        "editItemType": "Edit Item Type"
      }
    }
  }
}
```

### Task 10: Add Post-Workflow Screen Keys
**Priority:** High
**Estimate:** 1 story point

Add keys for next-action and session-summary screens.

**Keys to add:**
```json
{
  "workflow": {
    "postWorkflow": {
      "nextAction": {
        "title": "What's Next?",
        "subtitle": "Item saved successfully!",
        "editInstructions": "Edit Instructions",
        "editDescription": "Review and modify the content you just added",
        "addNewInstructions": "Add New Instructions",
        "addNewDescription": "Add more content to this item",
        "createNewItem": "Create New Item",
        "createNewDescription": "Start fresh with a different item",
        "done": "Done",
        "doneDescription": "Return to your dashboard"
      },
      "sessionSummary": {
        "title": "Session Complete!",
        "subtitle": "You created {count, plural, =0 {no items} one {# item} other {# items}}",
        "newItems": "New Items",
        "existingItems": "Existing Items",
        "loadingExisting": "Loading existing items...",
        "noItems": "No items in this session",
        "printQRCodes": "Print QR Codes",
        "createAnother": "Create Another Item",
        "viewAllItems": "View All Items",
        "finishWithoutPrint": "Finish Without Printing"
      }
    }
  }
}
```

### Task 11: Add Dialog Keys
**Priority:** High
**Estimate:** 1 story point

Add keys for all workflow dialogs.

**Keys to add:**
```json
{
  "workflow": {
    "dialogs": {
      "confirmExit": {
        "title": "Exit Workflow?",
        "messageUnsavedAndItems": "You have unsaved changes and {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "messageUnsaved": "You have unsaved changes. Are you sure you want to exit?",
        "messageItems": "You have created {count, plural, one {# item} other {# items}} in this session. Are you sure you want to exit?",
        "messageDefault": "Are you sure you want to exit the workflow?",
        "cancel": "Cancel",
        "exit": "Exit Workflow"
      },
      "removeItem": {
        "title": "Remove Item?",
        "message": "Are you sure you want to remove \"{name}\" from this session?",
        "cancel": "Cancel",
        "remove": "Remove"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "You haven't added any items yet. Add at least one item to continue.",
        "ok": "OK"
      },
      "pdfExport": {
        "title": "Export to PDF",
        "selectItems": "Select items to include",
        "allItems": "All Items",
        "newOnly": "New Items Only",
        "selected": "Selected Items",
        "generating": "Generating PDF...",
        "download": "Download PDF",
        "cancel": "Cancel"
      }
    }
  }
}
```

### Task 12: Add Shared Component Keys
**Priority:** High
**Estimate:** 1 story point

Add keys for shared workflow components.

**Keys to add:**
```json
{
  "workflow": {
    "shared": {
      "sessionRecovery": {
        "title": "Resume Previous Session?",
        "message": "We found {count, plural, one {# item} other {# items}} from your last session.",
        "contentWarning": "{count, plural, one {# piece of content needs} other {# pieces of content need}} to be re-uploaded.",
        "continue": "Continue",
        "startFresh": "Start Fresh",
        "dismiss": "Dismiss"
      },
      "printOptions": {
        "title": "Print QR Codes",
        "scope": "Select items to print",
        "allItems": "All Items ({count})",
        "newOnly": "New Items Only ({count})",
        "selectItems": "Select Items",
        "generatePDF": "Generate PDF",
        "printDirect": "Print Directly",
        "skip": "Skip Printing",
        "generating": "Generating...",
        "sending": "Sending to printer..."
      },
      "qrGeneration": {
        "title": "Generating QR Codes",
        "progress": "Processing {current} of {total}",
        "complete": "QR codes generated successfully"
      },
      "camera": {
        "permissionRequired": "Camera Access Required",
        "permissionDescription": "Please allow camera access to capture photos or videos.",
        "grantPermission": "Grant Permission",
        "permissionDenied": "Camera permission denied. Please enable it in your browser settings."
      },
      "network": {
        "offline": "You appear to be offline",
        "retryConnection": "Please check your connection and try again.",
        "retry": "Retry"
      },
      "tags": {
        "label": "Tags",
        "addTag": "Add tag",
        "removeTag": "Remove tag",
        "placeholder": "Type to add tags...",
        "suggestions": "Suggestions"
      },
      "content": {
        "preview": "Preview",
        "edit": "Edit",
        "remove": "Remove",
        "reorder": "Reorder",
        "contentPiece": "Content piece {index}",
        "videoContent": "Video",
        "photoContent": "Photo",
        "pdfContent": "PDF Document",
        "textContent": "Text",
        "urlContent": "Link"
      },
      "itemContext": {
        "room": "Room",
        "itemType": "Item Type",
        "itemName": "Item Name",
        "purpose": "Purpose"
      }
    }
  }
}
```

### Task 13: Add Constants Translation Keys
**Priority:** High
**Estimate:** 1 story point

Add keys for constants (rooms, item types, purposes, content types, tags).

**Keys to add:**
```json
{
  "workflow": {
    "constants": {
      "rooms": {
        "kitchen": "Kitchen",
        "laundry": "Laundry Room",
        "bedroom": "Bedroom",
        "bathroom": "Bathroom",
        "livingRoom": "Living Room",
        "garage": "Garage",
        "outdoor": "Outdoor/Patio",
        "general": "General/Whole Property",
        "other": "Other"
      },
      "itemTypes": {
        "appliance": {
          "label": "Appliance",
          "description": "Washer, dryer, stove, refrigerator, etc."
        },
        "roomItem": {
          "label": "Room Item",
          "description": "Pantry, cabinets, closet, sink, etc."
        },
        "generalInfo": {
          "label": "General Info",
          "description": "Trash schedule, WiFi info, house rules, etc."
        }
      },
      "purposes": {
        "howToUse": {
          "label": "How to Use",
          "description": "Operating instructions and controls"
        },
        "howToClean": {
          "label": "How to Clean",
          "description": "Cleaning and care instructions"
        },
        "troubleshooting": {
          "label": "Troubleshooting",
          "description": "Common issues and fixes"
        },
        "safetyInfo": {
          "label": "Safety Information",
          "description": "Safety warnings and precautions"
        },
        "maintenance": {
          "label": "Maintenance",
          "description": "Regular maintenance tasks"
        },
        "features": {
          "label": "Features & Tips",
          "description": "Special features and tips"
        },
        "other": {
          "label": "Other",
          "description": "General information"
        }
      },
      "contentTypes": {
        "recordVideo": "Record Video",
        "takePhoto": "Take Photo",
        "writeText": "Write Text",
        "uploadFile": "Upload File",
        "uploadFileSubtitle": "Video, Image, PDF, Text",
        "addLink": "Add Link",
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF Document",
        "text": "Text Instructions",
        "url": "Link/URL"
      },
      "tags": {
        "kitchen": "Kitchen",
        "laundry": "Laundry",
        "bedroom": "Bedroom",
        "bathroom": "Bathroom",
        "livingRoom": "Living Room",
        "garage": "Garage",
        "outdoor": "Outdoor",
        "general": "General",
        "appliance": "Appliance",
        "roomItem": "Room Item",
        "instructions": "Instructions",
        "cleaning": "Cleaning",
        "troubleshooting": "Troubleshooting",
        "safety": "Safety",
        "maintenance": "Maintenance",
        "features": "Features",
        "info": "Info"
      }
    }
  }
}
```

### Task 14: Add Validation Message Keys
**Priority:** Medium
**Estimate:** 0.5 story points

Add keys for workflow-specific validation messages.

**Keys to add:**
```json
{
  "workflow": {
    "validation": {
      "roomRequired": "Please select a room",
      "itemTypeRequired": "Please select an item type",
      "itemNameRequired": "Item name is required",
      "itemNameTooLong": "Item name must be less than 100 characters",
      "contentRequired": "At least one content piece is required",
      "purposeRequired": "Please select a purpose",
      "contentTypeRequired": "Please select a content type",
      "invalidUrl": "Please enter a valid URL",
      "fileTooLarge": "File size exceeds {max}MB limit",
      "invalidFileType": "Invalid file type. Allowed: {types}",
      "duplicateItemName": "An item with this name already exists"
    }
  }
}
```

### Task 15: Add Accessibility Keys
**Priority:** Medium
**Estimate:** 0.5 story points

Add keys for screen reader announcements.

**Keys to add:**
```json
{
  "workflow": {
    "accessibility": {
      "stepAnnouncement": "Step {current} of {total}: {stepName}",
      "roomSelectionScreen": "Room Selection",
      "itemTypeScreen": "Item Type Selection",
      "specificItemScreen": "Specific Item Selection",
      "purposeScreen": "Purpose Selection",
      "contentTypeScreen": "Content Type Selection",
      "mediaCaptureScreen": "Media Capture",
      "contentCreationScreen": "Content Creation",
      "previewSaveScreen": "Preview and Save",
      "nextActionScreen": "What's Next",
      "sessionSummaryScreen": "Session Summary",
      "skipToContent": "Skip to main content",
      "selectedItem": "{name} selected",
      "itemSaved": "Item saved successfully",
      "contentAdded": "Content added"
    }
  }
}
```

---

## Authorized Files and Functions for Modification

### Primary File to Modify
| File | Purpose | Modification Type |
|------|---------|-------------------|
| `/messages/en.json` | Add workflow namespace structure | Add new namespace |

### Files to Reference (Read-Only for Structure Analysis)
| File | Purpose |
|------|---------|
| `/src/components/ItemCreationWorkflow/ItemCreationWorkflow.tsx` | Main component structure |
| `/src/components/ItemCreationWorkflow/utils/constants.ts` | Existing labels to extract |
| `/src/components/ItemCreationWorkflow/components/steps/*.tsx` | Step component strings |
| `/src/components/ItemCreationWorkflow/components/shared/*.tsx` | Shared component strings |

### Files for Future Tasks (Component Updates in 2C.2-2C.14)
These files will be modified in subsequent tasks to use the translation keys:

| Category | Files |
|----------|-------|
| Step Components | `RoomSelectionStep.tsx`, `ItemTypeStep.tsx`, `SpecificItemStep.tsx`, `PurposeStep.tsx`, `ContentTypeStep.tsx`, `MediaCaptureStep.tsx`, `ContentCreationStep.tsx`, `PreviewSaveStep.tsx` |
| Adapter Components | `VideoCaptureAdapter.tsx`, `PhotoCaptureAdapter.tsx`, `FileUploadAdapter.tsx`, `TextEditorAdapter.tsx`, `UrlInputAdapter.tsx` |
| Shared Components | `WorkflowHeader.tsx`, `ConfirmExitDialog.tsx`, `RemoveItemDialog.tsx`, `EmptySessionDialog.tsx`, `PrintOptionsPanel.tsx`, `SessionRecoveryBanner.tsx`, `SessionSummaryStep.tsx`, and 15+ more |
| Constants | `/src/components/ItemCreationWorkflow/utils/constants.ts` |
| Accessibility | `/src/components/ItemCreationWorkflow/utils/accessibility.ts` |

---

## Verification Steps

1. **JSON Validation**
   - Run `cat /messages/en.json | python -m json.tool` to verify valid JSON
   - Ensure no duplicate keys exist

2. **Structure Verification**
   - Verify all sub-namespaces are created
   - Confirm key naming follows `{namespace}.{area}.{element}` convention

3. **Completeness Check**
   - Cross-reference with component strings
   - Ensure all identified strings have corresponding keys

4. **Build Verification**
   - Run `npm run build` to ensure no build errors
   - Verify the application starts without i18n errors

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing strings discovered later | Medium | Low | Iterative addition; namespace structure allows easy extension |
| Key naming inconsistency | Low | Medium | Follow established patterns; review during implementation |
| JSON syntax errors | Low | High | Validate JSON after each change |
| Large file size | Low | Low | Namespace structure allows code-splitting in future |

---

## Notes for Implementation

1. **Key Naming Convention**
   - Use camelCase for keys: `itemType.appliance.label`
   - Group related keys under descriptive parents
   - Use plural form for collections: `rooms`, `purposes`, `tags`

2. **ICU Message Format**
   - Use `{count, plural, one {# item} other {# items}}` for pluralization
   - Use `{name}` for simple interpolation
   - Avoid string concatenation in favor of full sentences

3. **Future-Proofing**
   - Structure allows easy addition of new steps or features
   - Each sub-namespace can be imported separately if needed
   - Comments in JSON (via `_comment` keys) can document sections

4. **Coordination with Other Tasks**
   - Tasks 2C.2-2C.14 will update components to use these keys
   - Task 2C.13 will generate translations for 5 non-English languages
   - Task 2C.14 will test complete workflow in each language

---

## References

- [Implementation Plan: L10N Epic 2](/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md)
- [Request Documentation](/docs/gen_requests_epic2.md#REQ-E02-056)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C: Item Creation Workflow*
