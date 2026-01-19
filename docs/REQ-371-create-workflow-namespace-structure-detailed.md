# REQ-371: Create Workflow Namespace Structure - Detailed Task Breakdown

**Document Type:** Detailed Implementation Tasks
**Created:** 2026-01-19 17:30 UTC
**Last Modified:** 2026-01-19 17:30 UTC
**Request ID:** REQ-371
**Epic:** Epic 2: Static UI Localization
**Sub-Epic:** 2C - Item Creation Workflow
**Task ID:** 2C.1
**Size:** M (Medium)
**Priority:** P1 - High (Foundation for entire Sub-Epic 2C)

---

## Overview

This document breaks down the implementation of the `workflow` namespace structure into granular, actionable tasks suitable for execution by a junior developer or AI coding agent. Each task is designed to be approximately 1 story point and includes explicit file paths, code snippets, and acceptance criteria.

**Source Documents:**
- Overview: `/docs/REQ-371-create-workflow-namespace-structure-overview.md`
- Requirements: `/docs/gen_requests_epic2.md` (Request #371)
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic2-Static-UI-Translation.md`

---

## Pre-Implementation Checklist

Before starting implementation, verify:

- [ ] `messages/en.json` exists and contains existing namespaces (common, auth, dashboard, items, errors, language)
- [ ] All 6 translation files exist: `en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `nl.json`
- [ ] next-intl package is installed (verify in `package.json`)
- [ ] Constants file exists at `/src/components/ItemCreationWorkflow/utils/constants.ts`

---

## Task 1: Add Workflow Header Subsection to en.json

**Objective:** Add the `workflow.header` subsection with WorkflowHeader component strings.

**File to Modify:** `/messages/en.json`

**Action:** Add the following JSON structure after the existing `language` namespace (before the closing `}`):

```json
,
  "workflow": {
    "header": {
      "step": "Step {current} of {total}",
      "exit": "Exit",
      "back": "Back",
      "skipToContent": "Skip to main content"
    }
  }
```

**Acceptance Criteria:**
- [ ] `en.json` remains valid JSON (no syntax errors)
- [ ] Key `workflow.header.step` supports `{current}` and `{total}` variable interpolation
- [ ] All 4 header keys are present: `step`, `exit`, `back`, `skipToContent`

---

## Task 2: Add Steps Subsection to workflow namespace

**Objective:** Add the `workflow.steps` subsection with all step component strings.

**File to Modify:** `/messages/en.json`

**Action:** Add the following inside the `workflow` object after `header`:

```json
    "steps": {
      "roomSelection": {
        "title": "Select a Room",
        "subtitle": "Choose where this item is located in your property",
        "searchPlaceholder": "Search rooms...",
        "ariaLabel": "Select a room for your item",
        "helpText": "Use arrow keys to navigate between rooms. Press Enter or Space to select."
      },
      "itemType": {
        "title": "What type of item?",
        "subtitle": "Select the category that best describes your item",
        "ariaLabel": "Select the type of item"
      },
      "specificItem": {
        "title": "Name your item",
        "subtitle": "Enter a specific name for this item",
        "searchPlaceholder": "Search or type item name...",
        "suggestions": "Suggestions",
        "customName": "Use custom name"
      },
      "purpose": {
        "title": "What's the purpose?",
        "subtitle": "Select the main purpose for this content",
        "ariaLabel": "Select the purpose of this content"
      },
      "contentType": {
        "title": "How do you want to add content?",
        "subtitle": "Choose how to provide instructions"
      },
      "mediaCapture": {
        "title": "Capture Content",
        "takePhoto": "Take Photo",
        "recordVideo": "Record Video",
        "retake": "Retake",
        "useThis": "Use This",
        "cameraPermission": "Camera access is required",
        "cameraPermissionDescription": "Please allow camera access to capture photos or videos."
      },
      "contentCreation": {
        "title": "Add Content",
        "uploadingFile": "Uploading file...",
        "processingContent": "Processing content..."
      },
      "preview": {
        "title": "Preview & Save",
        "itemDetails": "Item Details",
        "content": "Content",
        "contentCount": "{count} content pieces",
        "maximumReached": "Maximum reached",
        "addMore": "Add More",
        "saving": "Saving...",
        "saveItem": "Save Item"
      },
      "nextAction": {
        "title": "What would you like to do next?",
        "subtitle": "You've just saved \"{itemName}\"",
        "editInstructions": "Edit Instructions",
        "addNewInstructions": "Add More Instructions",
        "createNewItem": "Create New Item",
        "done": "Done"
      },
      "sessionSummary": {
        "title": "Session Complete!",
        "subtitle": "You created {count, plural, =0 {no items} one {# item} other {# items}}",
        "newItems": "New Items",
        "existingItems": "Existing Items",
        "loadingExisting": "Loading existing items...",
        "noExistingItems": "No existing items",
        "printQRCodes": "Print QR Codes",
        "finishWithoutPrint": "Finish Without Printing"
      }
    }
```

**Acceptance Criteria:**
- [ ] All 10 step subsections present: roomSelection, itemType, specificItem, purpose, contentType, mediaCapture, contentCreation, preview, nextAction, sessionSummary
- [ ] Pluralization in `sessionSummary.subtitle` uses valid ICU format
- [ ] Variable interpolation present in `nextAction.subtitle` for `{itemName}`

---

## Task 3: Add Rooms Subsection

**Objective:** Add the `workflow.rooms` subsection matching `ROOM_LABELS` from constants.ts.

**File to Modify:** `/messages/en.json`

**Reference:** `/src/components/ItemCreationWorkflow/utils/constants.ts` lines 63-73 (ROOM_LABELS)

**Action:** Add inside `workflow` object after `steps`:

```json
    "rooms": {
      "kitchen": "Kitchen",
      "laundry": "Laundry Room",
      "bedroom": "Bedroom",
      "bathroom": "Bathroom",
      "livingRoom": "Living Room",
      "garage": "Garage",
      "outdoor": "Outdoor/Patio",
      "general": "General/Whole Property",
      "other": "Other",
      "customInput": {
        "label": "Enter room name",
        "placeholder": "e.g., Home Office, Wine Cellar, Mudroom",
        "hint": "Maximum 50 characters"
      }
    }
```

**Note:** Key names use camelCase (`livingRoom`) while constants.ts uses kebab-case (`living-room`). The component code will need to handle this mapping.

**Acceptance Criteria:**
- [ ] All 9 room type keys present matching ROOM_TYPES constant
- [ ] `customInput` subsection includes label, placeholder, and hint

---

## Task 4: Add Item Types Subsection

**Objective:** Add the `workflow.itemTypes` subsection matching `ITEM_TYPE_LABELS` and `ITEM_TYPE_DESCRIPTIONS`.

**File to Modify:** `/messages/en.json`

**Reference:** `/src/components/ItemCreationWorkflow/utils/constants.ts` lines 108-122

**Action:** Add inside `workflow` object:

```json
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
    }
```

**Acceptance Criteria:**
- [ ] All 3 item types present: appliance, roomItem, generalInfo
- [ ] Each item type has both `label` and `description` keys

---

## Task 5: Add Purposes Subsection

**Objective:** Add the `workflow.purposes` subsection matching `PURPOSE_LABELS` and `PURPOSE_DESCRIPTIONS`.

**File to Modify:** `/messages/en.json`

**Reference:** `/src/components/ItemCreationWorkflow/utils/constants.ts` lines 287-311

**Action:** Add inside `workflow` object:

```json
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
    }
```

**Acceptance Criteria:**
- [ ] All 7 purpose types present
- [ ] Each purpose has `label` and `description` keys

---

## Task 6: Add Content Types Subsection

**Objective:** Add the `workflow.contentTypes` subsection matching `UNIFIED_CONTENT_OPTIONS`.

**File to Modify:** `/messages/en.json`

**Reference:** `/src/components/ItemCreationWorkflow/utils/constants.ts` lines 204-241

**Action:** Add inside `workflow` object:

```json
    "contentTypes": {
      "recordVideo": {
        "label": "Record Video",
        "subtitle": null
      },
      "takePhoto": {
        "label": "Take Photo",
        "subtitle": null
      },
      "writeText": {
        "label": "Write Text",
        "subtitle": null
      },
      "uploadFile": {
        "label": "Upload File",
        "subtitle": "Video, Image, PDF, Text"
      },
      "addLink": {
        "label": "Add Link",
        "subtitle": null
      },
      "labels": {
        "video": "Video",
        "photo": "Photo",
        "pdf": "PDF Document",
        "text": "Text Instructions",
        "url": "Link/URL"
      }
    }
```

**Note:** `subtitle: null` indicates no subtitle for that option. The component should handle null values gracefully.

**Acceptance Criteria:**
- [ ] All 5 unified content options present
- [ ] `labels` subsection for content type display names present

---

## Task 7: Add Tags Subsection

**Objective:** Add the `workflow.tags` subsection matching `TAG_LABELS`.

**File to Modify:** `/messages/en.json`

**Reference:** `/src/components/ItemCreationWorkflow/utils/constants.ts` lines 381-399

**Action:** Add inside `workflow` object:

```json
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
      "info": "Info",
      "editor": {
        "label": "Tags",
        "placeholder": "Add a tag...",
        "addTag": "Add tag",
        "removeTag": "Remove {tag}",
        "maxTagsReached": "Maximum {max} tags allowed"
      }
    }
```

**Acceptance Criteria:**
- [ ] All 17 tag keys present matching AVAILABLE_TAGS
- [ ] `editor` subsection for TagsEditor component strings present
- [ ] `removeTag` supports `{tag}` interpolation
- [ ] `maxTagsReached` supports `{max}` interpolation

---

## Task 8: Add Forms Subsection

**Objective:** Add the `workflow.forms` subsection for all form field labels and placeholders.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object:

```json
    "forms": {
      "itemName": {
        "label": "Item Name",
        "placeholder": "Enter item name",
        "ariaLabel": "Item name input",
        "characterCount": "{count}/{max} characters"
      },
      "itemDescription": {
        "label": "Item Description",
        "placeholder": "Enter a brief description of this item (optional)",
        "hint": "Optional"
      },
      "articleTitle": {
        "label": "Guide/Article Title",
        "placeholder": "Enter guide/article title"
      },
      "room": {
        "label": "Room",
        "placeholder": "Select a room"
      },
      "itemType": {
        "label": "Item Type",
        "placeholder": "Select item type"
      },
      "url": {
        "label": "URL",
        "placeholder": "Enter URL (https://...)",
        "hint": "Enter a valid URL starting with http:// or https://"
      },
      "text": {
        "label": "Text Content",
        "placeholder": "Enter your instructions here..."
      }
    }
```

**Acceptance Criteria:**
- [ ] All 7 form field groups present
- [ ] `characterCount` supports `{count}` and `{max}` interpolation

---

## Task 9: Add Validation Subsection

**Objective:** Add the `workflow.validation` subsection for workflow-specific validation messages.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object:

```json
    "validation": {
      "itemNameRequired": "Item name is required",
      "itemNameTooShort": "Item name must be at least {min} characters",
      "itemNameTooLong": "Item name must be less than {max} characters",
      "contentRequired": "At least one content piece is required",
      "roomRequired": "Please select a room",
      "itemTypeRequired": "Please select an item type",
      "purposeRequired": "Please select a purpose",
      "urlInvalid": "Please enter a valid URL",
      "fileTooLarge": "File size exceeds {max}MB limit",
      "invalidFileType": "Invalid file type. Allowed: {types}",
      "duplicateName": "An item with this name already exists in this session"
    }
```

**Acceptance Criteria:**
- [ ] All 11 validation message keys present
- [ ] Variable interpolation for `{min}`, `{max}`, `{types}` parameters

---

## Task 10: Add Dialogs Subsection

**Objective:** Add the `workflow.dialogs` subsection for all dialog component strings.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object:

```json
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
        "message": "Are you sure you want to remove \"{itemName}\" from the session?"
      },
      "emptySession": {
        "title": "No Items Added",
        "message": "You haven't added any items yet. Add at least one item to continue."
      },
      "removeLastContent": {
        "title": "Remove Last Content?",
        "message": "This is the only piece of content. Removing it will leave this item empty. Are you sure you want to remove it?",
        "keep": "Keep",
        "remove": "Remove"
      }
    }
```

**Acceptance Criteria:**
- [ ] All 4 dialog types present: confirmExit, removeItem, emptySession, removeLastContent
- [ ] ICU pluralization format used in confirmExit messages
- [ ] Variable interpolation for `{itemName}` in removeItem.message

---

## Task 11: Add Buttons Subsection

**Objective:** Add the `workflow.buttons` subsection for all button labels.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object:

```json
    "buttons": {
      "continue": "Continue",
      "back": "Back",
      "next": "Next",
      "save": "Save",
      "saveItem": "Save Item",
      "cancel": "Cancel",
      "done": "Done",
      "finish": "Finish",
      "addMore": "Add More",
      "addContent": "Add Content",
      "retake": "Retake",
      "useThis": "Use This",
      "print": "Print",
      "generatePDF": "Generate PDF",
      "skip": "Skip",
      "goBack": "Go Back",
      "createAnother": "Create Another Item",
      "viewItems": "View Items",
      "dismiss": "Dismiss"
    }
```

**Acceptance Criteria:**
- [ ] All 19 button labels present
- [ ] No variable interpolation needed in button labels

---

## Task 12: Add Messages Subsection

**Objective:** Add the `workflow.messages` subsection for success/error/status messages.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object:

```json
    "messages": {
      "success": {
        "itemSaved": "Item Saved!",
        "itemSavedDescription": "Your item has been saved and is ready for your guests!",
        "qrCodeGenerated": "QR code generated successfully",
        "sessionComplete": "Session complete"
      },
      "error": {
        "saveFailed": "Failed to save item",
        "uploadFailed": "File upload failed. Please try again.",
        "cameraError": "Camera error. Please try again.",
        "networkError": "Network error. Please check your connection.",
        "generic": "Something went wrong. Please try again."
      },
      "status": {
        "loading": "Loading...",
        "saving": "Saving...",
        "uploading": "Uploading...",
        "processing": "Processing...",
        "generatingQR": "Generating QR code...",
        "preparingPrint": "Preparing for print..."
      }
    }
```

**Acceptance Criteria:**
- [ ] Three categories present: success, error, status
- [ ] All message strings are complete sentences

---

## Task 13: Add Empty States Subsection

**Objective:** Add the `workflow.emptyStates` subsection for empty state messages.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object:

```json
    "emptyStates": {
      "noContent": {
        "title": "No content added yet",
        "action": "Add Content"
      },
      "noItems": {
        "title": "No items in session",
        "description": "Start by selecting a room to create your first item."
      },
      "noItemData": {
        "title": "No item data available",
        "description": "Please start a new item."
      }
    }
```

**Acceptance Criteria:**
- [ ] All 3 empty state types present
- [ ] Each has appropriate title and either description or action

---

## Task 14: Add Print Options Subsection

**Objective:** Add the `workflow.printOptions` subsection for PrintOptionsPanel strings.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object:

```json
    "printOptions": {
      "title": "Print Options",
      "selectItems": "Select items to print",
      "allItems": "All Items",
      "newOnly": "New Items Only",
      "selected": "Selected Items",
      "generatePDF": "Generate PDF",
      "printDirect": "Print Directly",
      "skipPrint": "Skip Printing",
      "processing": "Processing...",
      "qrCodesGenerated": "QR codes generated",
      "pdfReady": "PDF ready for download"
    }
```

**Acceptance Criteria:**
- [ ] All 11 print option keys present

---

## Task 15: Add Recovery Subsection

**Objective:** Add the `workflow.recovery` subsection for SessionRecoveryBanner strings.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object:

```json
    "recovery": {
      "title": "Resume Previous Session?",
      "message": "We found {count, plural, one {# item} other {# items}} from a previous session.",
      "contentWarning": "{count, plural, one {# content piece needs} other {# content pieces need}} to be re-uploaded.",
      "continue": "Continue",
      "startFresh": "Start Fresh",
      "dismiss": "Dismiss"
    }
```

**Acceptance Criteria:**
- [ ] All 6 recovery keys present
- [ ] ICU pluralization format used in message and contentWarning

---

## Task 16: Add Accessibility Subsection

**Objective:** Add the `workflow.accessibility` subsection for screen reader announcements.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object:

```json
    "accessibility": {
      "stepAnnouncement": "Step {current} of {total}: {stepName}",
      "itemSelected": "{item} selected",
      "contentAdded": "Content added",
      "contentRemoved": "Content removed",
      "dragStart": "Picked up {type} content. Current position: {position} of {total}. Use arrow keys to move.",
      "dragOver": "Over position {position}",
      "dragEnd": "Dropped {type} content. New position: {position} of {total}",
      "dragCancel": "Drag cancelled. Content returned to original position.",
      "positionUnchanged": "Position unchanged."
    }
```

**Acceptance Criteria:**
- [ ] All 9 accessibility announcement keys present
- [ ] Variable interpolation for screen reader context

---

## Task 17: Add Progress Subsection

**Objective:** Add the `workflow.progress` subsection for progress indicator strings.

**File to Modify:** `/messages/en.json`

**Action:** Add inside `workflow` object (this should be the last subsection before closing the workflow object):

```json
    "progress": {
      "step": "Step {current} of {total}",
      "percentage": "{percent}% complete",
      "itemsCreated": "{count, plural, =0 {No items} one {# item} other {# items}} created"
    }
```

**Acceptance Criteria:**
- [ ] All 3 progress keys present
- [ ] ICU pluralization format in itemsCreated

---

## Task 18: Validate Complete en.json Structure

**Objective:** Verify the complete workflow namespace in en.json is valid JSON with all required subsections.

**File to Validate:** `/messages/en.json`

**Validation Steps:**

1. Run JSON lint/validation:
   ```bash
   cat messages/en.json | python -m json.tool > /dev/null && echo "Valid JSON" || echo "Invalid JSON"
   ```

2. Verify all 17 subsections exist in workflow namespace:
   - header
   - steps
   - rooms
   - itemTypes
   - purposes
   - contentTypes
   - tags
   - forms
   - validation
   - dialogs
   - buttons
   - messages
   - emptyStates
   - printOptions
   - recovery
   - accessibility
   - progress

3. Count total keys (should be ~200+ keys in workflow namespace)

**Acceptance Criteria:**
- [ ] JSON is valid (no syntax errors)
- [ ] All 17 subsections present
- [ ] No duplicate keys
- [ ] All ICU format pluralizations are syntactically valid

---

## Task 19: Copy Workflow Namespace to de.json

**Objective:** Copy the complete workflow namespace structure to German translation file with English placeholders.

**File to Modify:** `/messages/de.json`

**Action:**
1. Read the workflow namespace from `/messages/en.json`
2. Add the identical structure to `/messages/de.json`
3. All values remain in English (will be translated in Task 2C.13)

**Acceptance Criteria:**
- [ ] `de.json` contains complete workflow namespace
- [ ] Key structure is identical to en.json
- [ ] JSON is valid

---

## Task 20: Copy Workflow Namespace to es.json

**Objective:** Copy the complete workflow namespace structure to Spanish translation file.

**File to Modify:** `/messages/es.json`

**Action:** Same as Task 19, but for Spanish file.

**Acceptance Criteria:**
- [ ] `es.json` contains complete workflow namespace
- [ ] Key structure is identical to en.json
- [ ] JSON is valid

---

## Task 21: Copy Workflow Namespace to fr.json

**Objective:** Copy the complete workflow namespace structure to French translation file.

**File to Modify:** `/messages/fr.json`

**Action:** Same as Task 19, but for French file.

**Acceptance Criteria:**
- [ ] `fr.json` contains complete workflow namespace
- [ ] Key structure is identical to en.json
- [ ] JSON is valid

---

## Task 22: Copy Workflow Namespace to it.json

**Objective:** Copy the complete workflow namespace structure to Italian translation file.

**File to Modify:** `/messages/it.json`

**Action:** Same as Task 19, but for Italian file.

**Acceptance Criteria:**
- [ ] `it.json` contains complete workflow namespace
- [ ] Key structure is identical to en.json
- [ ] JSON is valid

---

## Task 23: Copy Workflow Namespace to nl.json

**Objective:** Copy the complete workflow namespace structure to Dutch translation file.

**File to Modify:** `/messages/nl.json`

**Action:** Same as Task 19, but for Dutch file.

**Acceptance Criteria:**
- [ ] `nl.json` contains complete workflow namespace
- [ ] Key structure is identical to en.json
- [ ] JSON is valid

---

## Task 24: Verify Key Consistency Across All Files

**Objective:** Ensure all 6 translation files have identical key structures.

**Files to Verify:**
- `/messages/en.json`
- `/messages/de.json`
- `/messages/es.json`
- `/messages/fr.json`
- `/messages/it.json`
- `/messages/nl.json`

**Verification Script:**
```bash
# Extract all workflow keys from each file and compare
for lang in en de es fr it nl; do
  echo "=== $lang.json workflow keys ===" >> /tmp/keys_check.txt
  cat messages/$lang.json | python -c "
import json, sys
data = json.load(sys.stdin)
def get_keys(obj, prefix=''):
    keys = []
    for k, v in obj.items():
        key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            keys.extend(get_keys(v, key))
        else:
            keys.append(key)
    return keys
workflow = data.get('workflow', {})
for key in sorted(get_keys(workflow, 'workflow')):
    print(key)
" >> /tmp/keys_check.txt
done
```

**Acceptance Criteria:**
- [ ] All 6 files produce identical key lists
- [ ] No missing keys in any file
- [ ] No extra keys in any file

---

## Task 25: Final Validation and Documentation

**Objective:** Final verification and documentation update.

**Actions:**

1. Verify all translation files are valid JSON
2. Verify browser console shows no missing translation warnings when workflow namespace is accessed
3. Document the namespace structure in code comments if needed

**Final Checklist:**
- [ ] All 6 translation files valid JSON
- [ ] workflow namespace contains all 17 subsections
- [ ] ICU pluralization patterns validated
- [ ] Variable interpolation placeholders consistent
- [ ] No duplicate keys
- [ ] Ready for component localization (Tasks 2C.2-2C.12)

---

## Complete Workflow Namespace Reference

For reference, here is the complete workflow namespace structure that should exist in `en.json` after completing all tasks:

```json
{
  "workflow": {
    "header": { ... },
    "steps": {
      "roomSelection": { ... },
      "itemType": { ... },
      "specificItem": { ... },
      "purpose": { ... },
      "contentType": { ... },
      "mediaCapture": { ... },
      "contentCreation": { ... },
      "preview": { ... },
      "nextAction": { ... },
      "sessionSummary": { ... }
    },
    "rooms": { ... },
    "itemTypes": { ... },
    "purposes": { ... },
    "contentTypes": { ... },
    "tags": { ... },
    "forms": { ... },
    "validation": { ... },
    "dialogs": {
      "confirmExit": { ... },
      "removeItem": { ... },
      "emptySession": { ... },
      "removeLastContent": { ... }
    },
    "buttons": { ... },
    "messages": {
      "success": { ... },
      "error": { ... },
      "status": { ... }
    },
    "emptyStates": { ... },
    "printOptions": { ... },
    "recovery": { ... },
    "accessibility": { ... },
    "progress": { ... }
  }
}
```

---

## Dependencies

### Upstream (Required Before Starting)
- Epic 1 Foundation complete (next-intl installed, i18n config ready)
- Translation files exist in `/messages/` directory

### Downstream (Blocked By This Task)
- Task 2C.2: Update main ItemCreationWorkflow component
- Task 2C.3: Update RoomSelectionStep
- Task 2C.4: Update ItemTypeStep
- Task 2C.5: Update SpecificItemStep
- Task 2C.6: Update PurposeStep
- Task 2C.7: Update ContentTypeStep
- Task 2C.8: Update MediaCaptureStep
- Task 2C.9: Update PreviewSaveStep
- Task 2C.10: Update SessionSummaryStep
- Task 2C.11: Update shared components
- Task 2C.12: Update dialog components
- Task 2C.13: Generate non-English translations

---

## Estimated Effort

| Task Range | Description | Estimate |
|------------|-------------|----------|
| Tasks 1-17 | Add all subsections to en.json | 2 hours |
| Task 18 | Validate en.json | 15 min |
| Tasks 19-23 | Copy to 5 other language files | 30 min |
| Tasks 24-25 | Verify consistency and document | 30 min |
| **Total** | | **~3.5 hours** |

---

*Document generated for FAQBNB Localization Epic 2 - Sub-Epic 2C Task 2C.1*
*Last Modified: 2026-01-19 17:30 UTC*
