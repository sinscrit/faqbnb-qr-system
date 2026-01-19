# REQ-341: Create TranslationManagement Types File - Implementation Overview

**Date Created:** 2026-01-19
**Last Modified:** 2026-01-19
**Request Reference:** REQ-341 (Epic 5 - Owner Translation Management)
**Implementation Plan:** Plan-111-L10N-Epic5-Owner-Translation-Management.md
**Phase:** 2 - Core UI Components
**Task ID:** 2.1
**Size:** S (Small)

---

## 1. Summary

Create a centralized TypeScript type definitions file for the TranslationManagement component system at `/src/components/TranslationManagement/TranslationManagement.types.ts`. This file will export all shared interfaces and types used across translation management UI components, providing a single source of truth for type contracts.

---

## 2. Background & Context

### 2.1 Current State
- No TranslationManagement component directory or types file exists yet
- Translation-related types are already defined in:
  - `/src/lib/translation-service/translation-service.types.ts` - Backend service types
  - `/src/lib/supabase.ts` - Database table types
  - `/src/lib/i18n/config.ts` - Locale configuration types
  - `/src/contexts/LocaleContext.tsx` - UI locale context types

### 2.2 Dependencies
This task depends on types from:
- **Epic 1 (Foundation):** Translation tables schema (`article_translations`, `item_translations`, `link_translations`, `tag_translations`), translation status enum
- **Epic 3 (Dynamic Content Translation):** Translation job types, status tracking patterns

### 2.3 Purpose
This types file serves as the foundation for all Phase 2-7 UI components in Epic 5, including:
- TranslationPreviewPanel
- TranslationEditor
- TranslationStatusWidget
- TranslationStatusColumn
- TranslationStatusFilter
- BulkTranslationBar

---

## 3. Requirements

### 3.1 Acceptance Criteria (from REQ-341)
- [x] Types file is created at `/src/components/TranslationManagement/TranslationManagement.types.ts`
- [x] File exports interface for translation record data structures including entity ID, entity type, language code, content, status, and timestamps
- [x] File exports enum or string literal union type for translation status values covering pending, completed, failed, and manually edited states
- [x] File exports interface for filter parameters including entity type filter, language filter, and status filter
- [x] File exports interface for sort parameters including sort field and sort direction
- [x] File exports prop type interfaces for translation status indicator components
- [x] File exports prop type interfaces for translation preview panel components
- [x] File exports prop type interfaces for translation editor components
- [x] File exports callback function type signatures for re-translation operations
- [x] File exports callback function type signatures for save operations
- [x] File exports callback function type signatures for status change handlers
- [x] All exported types include JSDoc comments describing their purpose and usage
- [x] TypeScript compiler validates the types file without errors or warnings
- [x] Types can be successfully imported and used in at least one component file
- [x] Types align with database type definitions for translation tables where applicable
- [x] File follows project TypeScript conventions and naming patterns

---

## 4. Technical Design

### 4.1 Type Categories

The types file will be organized into the following sections:

#### 4.1.1 Core Language & Status Types
Re-export and extend from existing translation-service types:
- `SupportedLanguage` - 'en' | 'fr' | 'es' | 'de' | 'nl' | 'it'
- `TranslationStatus` - 'pending' | 'processing' | 'completed' | 'failed' | 'manual'
- `TranslatableEntityType` - 'article' | 'item' | 'link' | 'tag'

#### 4.1.2 Translation Record Types (UI-focused)
Interfaces for translation data as consumed by UI components:
```typescript
interface TranslationRecord {
  entityType: TranslatableEntityType;
  entityId: string;
  language: SupportedLanguage;
  content: TranslationContent;
  status: TranslationStatus;
  translatedAt?: string;
  reviewedBy?: string;
  isStale?: boolean;
  sourceVersionAt?: string;
}

interface TranslationContent {
  title?: string;
  description?: string;
  name?: string;
}
```

#### 4.1.3 Filter & Sort Parameter Types
```typescript
interface TranslationFilterParams {
  entityType?: TranslatableEntityType | TranslatableEntityType[];
  language?: SupportedLanguage | SupportedLanguage[];
  status?: TranslationStatus | TranslationStatus[];
  propertyId?: string;
  isStale?: boolean;
}

type TranslationSortField = 'entityName' | 'language' | 'status' | 'translatedAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

interface TranslationSortParams {
  field: TranslationSortField;
  direction: SortDirection;
}
```

#### 4.1.4 API Response Types
Types matching the API contract from Plan-111:
```typescript
interface TranslationStatusResponse {
  summary: TranslationSummary;
  items: TranslationStatusItem[];
}

interface TranslationSummary {
  total: number;
  complete: number;
  partial: number;
  pending: number;
  failed: number;
}

interface TranslationStatusItem {
  entityType: TranslatableEntityType;
  entityId: string;
  name: string;
  sourceLanguage: SupportedLanguage;
  translations: TranslationStatusMap;
}

type TranslationStatusMap = Partial<Record<SupportedLanguage, TranslationStatusEntry>>;

interface TranslationStatusEntry {
  status: TranslationStatus;
  isStale?: boolean;
  translatedAt?: string;
  reviewedBy?: string;
}
```

#### 4.1.5 Component Props Interfaces
Props for all translation management components from Plan-111:

**TranslationStatusIndicatorProps** (for compact status display):
```typescript
interface TranslationStatusIndicatorProps {
  status: TranslationStatus;
  isStale?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**TranslationPreviewPanelProps** (slide-in panel):
```typescript
interface TranslationPreviewPanelProps {
  entityType: TranslatableEntityType;
  entityId: string;
  sourceLanguage: SupportedLanguage;
  sourceContent: TranslationContent;
  isOpen: boolean;
  onClose: () => void;
  onTranslationEdited?: (language: SupportedLanguage) => void;
}
```

**TranslationEditorProps** (modal dialog):
```typescript
interface TranslationEditorProps {
  translation: {
    language: SupportedLanguage;
    content: TranslationContent;
    status: TranslationStatus;
  };
  sourceContent: TranslationContent;
  sourceLanguage: SupportedLanguage;
  isOpen: boolean;
  onSave: (updated: TranslationContent) => Promise<void>;
  onCancel: () => void;
}
```

#### 4.1.6 Callback Function Types
```typescript
/** Callback for triggering re-translation of content */
type OnRetranslateCallback = (
  entities: { type: TranslatableEntityType; id: string }[],
  languages?: SupportedLanguage[],
  overwriteManual?: boolean
) => Promise<RetranslateResult>;

/** Callback for saving translation edits */
type OnSaveTranslationCallback = (
  entityType: TranslatableEntityType,
  entityId: string,
  language: SupportedLanguage,
  content: TranslationContent
) => Promise<SaveTranslationResult>;

/** Callback for status change events */
type OnStatusChangeCallback = (
  entityType: TranslatableEntityType,
  entityId: string,
  language: SupportedLanguage,
  newStatus: TranslationStatus
) => void;

interface RetranslateResult {
  success: boolean;
  jobsQueued: number;
  skipped: number;
  skippedReason?: string;
}

interface SaveTranslationResult {
  success: boolean;
  translation?: {
    language: SupportedLanguage;
    status: 'manual';
    reviewedBy: string;
    updatedAt: string;
  };
  error?: string;
}
```

### 4.2 Patterns to Follow

Based on codebase analysis:

1. **File Header Documentation** (from ItemManager.types.ts):
   - Module-level JSDoc with @module, @see, @lastModified
   - Section separators using `// =============================================================================`

2. **JSDoc Comments** (from ItemManager.types.ts):
   - Each interface/type has descriptive JSDoc
   - Properties have inline documentation
   - @default tags for optional properties with defaults

3. **Type Organization** (from ItemManager.types.ts):
   - Logical groupings with section headers
   - Related types clustered together
   - Re-exports of relevant external types

4. **Naming Conventions**:
   - Props interfaces: `ComponentNameProps`
   - State interfaces: `ComponentNameState`
   - Callback types: `OnActionCallback`

---

## 5. Implementation Tasks

### Task 1: Create Directory Structure
- Create `/src/components/TranslationManagement/` directory
- Create `TranslationManagement.types.ts` file

### Task 2: Add Core Types
- Re-export `SupportedLanguage`, `TranslationStatus`, `TranslatableEntityType` from translation-service
- Define `TranslationContent` interface
- Define `TranslationRecord` interface

### Task 3: Add Filter & Sort Types
- Define `TranslationFilterParams` interface
- Define `TranslationSortField` type
- Define `TranslationSortParams` interface

### Task 4: Add API Response Types
- Define `TranslationStatusResponse` interface
- Define `TranslationSummary` interface
- Define `TranslationStatusItem` interface
- Define `TranslationStatusMap` type
- Define `TranslationStatusEntry` interface

### Task 5: Add Component Props Types
- Define `TranslationStatusIndicatorProps`
- Define `TranslationPreviewPanelProps`
- Define `TranslationEditorProps`
- Define `TranslationStatusWidgetProps`
- Define `TranslationStatusColumnProps`
- Define `TranslationStatusFilterProps`
- Define `BulkTranslationBarProps`

### Task 6: Add Callback Types
- Define `OnRetranslateCallback` type
- Define `OnSaveTranslationCallback` type
- Define `OnStatusChangeCallback` type
- Define result interfaces for callbacks

### Task 7: Add Index Export File
- Create `/src/components/TranslationManagement/index.ts`
- Export all types from the types file

### Task 8: Verification
- Ensure TypeScript compilation passes
- Verify types can be imported in a test file

---

## 6. Authorized Files and Functions for Modification

### 6.1 New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/components/TranslationManagement/TranslationManagement.types.ts` | Main types file |
| `/src/components/TranslationManagement/index.ts` | Public exports barrel file |

### 6.2 Files to Reference (Read Only)

| File Path | Reference Purpose |
|-----------|-------------------|
| `/src/lib/translation-service/translation-service.types.ts` | Core language/status types to re-export |
| `/src/lib/supabase.ts` | Database table type alignment |
| `/src/lib/i18n/config.ts` | SupportedLocale type reference |
| `/src/contexts/LocaleContext.tsx` | UI locale patterns |
| `/src/components/ItemManager/ItemManager.types.ts` | TypeScript conventions and patterns |
| `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md` | API contracts and component specs |

### 6.3 Scope Boundaries
- **DO NOT** modify any existing files
- **DO NOT** create component implementations (only types)
- **DO NOT** add dependencies or npm packages

---

## 7. Dependencies & Integration

### 7.1 Dependencies (Incoming)
| Dependency | Source | Required For |
|------------|--------|--------------|
| `SupportedLanguage` | `/src/lib/translation-service/translation-service.types.ts` | Language codes |
| `TranslationStatus` | `/src/lib/translation-service/translation-service.types.ts` | Status values |
| `TranslatableEntityType` | `/src/lib/translation-service/translation-service.types.ts` | Entity types |

### 7.2 Dependents (Outgoing)
| Component | Task | Dependency |
|-----------|------|------------|
| TranslationPreviewPanel | 2.2 | `TranslationPreviewPanelProps` |
| TranslationStatusItem | 2.3 | `TranslationStatusEntry`, `TranslationStatusIndicatorProps` |
| TranslationProgressBar | 2.4 | `TranslationSummary` |
| TranslationEditor | 2.5 | `TranslationEditorProps` |
| useTranslationStatus | 2.6 | `TranslationStatusResponse`, `TranslationFilterParams` |
| useTranslationRealtime | 2.7 | `TranslationStatusEntry` |
| TranslationStatusWidget | 3.1 | `TranslationSummary` |
| TranslationStatusColumn | 3.2 | `TranslationStatusColumnProps` |
| TranslationStatusFilter | 3.3 | `TranslationStatusFilterProps` |
| BulkTranslationBar | 4.1 | `BulkTranslationBarProps`, `OnRetranslateCallback` |
| API Routes | 1.1-1.3 | `TranslationStatusResponse`, `RetranslateResult` |

---

## 8. Testing Verification

### 8.1 TypeScript Compilation
- Run `npx tsc --noEmit` to verify types compile without errors
- No type errors should be reported for the new file

### 8.2 Import Verification
Create a simple verification by ensuring types can be imported:
```typescript
// Verification: Types should be importable
import type {
  TranslationRecord,
  TranslationStatus,
  TranslationFilterParams,
  TranslationPreviewPanelProps,
  OnRetranslateCallback
} from '@/components/TranslationManagement';
```

---

## 9. Visual Specifications Reference

From Plan-111 PRD, status icon colors for use in component types:

| Status | Icon | Tailwind Class |
|--------|------|----------------|
| Completed | `✓` | `text-green-500` |
| Manual | `✎` | `text-violet-500` |
| Pending | `⏳` | `text-amber-500` |
| Failed | `❌` | `text-red-500` |
| Stale | `⚠️` | `text-yellow-500` |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type misalignment with database schema | Low | Medium | Reference supabase.ts types directly |
| Breaking changes when components are built | Low | Low | Follow Plan-111 contracts precisely |
| Import path issues | Low | Low | Use standard @/ alias pattern |

---

## 11. Effort Estimate

| Task | Effort |
|------|--------|
| Directory & file creation | 5 min |
| Core types | 15 min |
| Filter/Sort types | 10 min |
| API response types | 15 min |
| Component props types | 20 min |
| Callback types | 10 min |
| Index exports | 5 min |
| Verification | 10 min |
| **Total** | **~90 min** |

---

## 12. References

- PRD: `/docs/prd/PRD_L10N_Epic5_Owner_Translation_Management.md`
- Implementation Plan: `/docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md`
- Request: `/docs/gen_requests_epic5.md` (REQ-341)
- Pattern Reference: `/src/components/ItemManager/ItemManager.types.ts`
- Translation Service Types: `/src/lib/translation-service/translation-service.types.ts`
