/**
 * TranslationManagement Types
 *
 * This file contains all TypeScript interfaces and types for the TranslationManagement
 * component family. It defines component props, state management, API responses, and
 * data models for translation management features in Epic 5.
 *
 * The types here enable type-safe development of translation management UI including:
 * - Translation status dashboard and widgets
 * - Translation preview panels
 * - Translation editor components
 * - Translation list views with filtering and sorting
 *
 * @module TranslationManagement/types
 * @see docs/prd/Plan-111-L10N-Epic5-Owner-Translation-Management.md
 * @created 2026-01-22
 * @requestReference REQ-E05-006
 */

// =============================================================================
// Core Type Re-exports
// =============================================================================

/**
 * Re-exported types from translation-service module for convenience.
 * These are the foundational types used across all translation management components.
 */
export type {
  SupportedLanguage,
  TranslationStatus,
  TranslatableEntityType,
  TranslationContext,
} from '@/lib/translation-service/translation-service.types';

// =============================================================================
// Display Types
// =============================================================================

/**
 * These types define data structures for UI rendering.
 * They format translation data for display in lists, tables, and widgets.
 */

/**
 * Per-language translation status summary with action capabilities.
 * Used in translation item displays to show status for each target language.
 */
export interface LanguageTranslationSummary {
  /** The target language code */
  language: import('@/lib/translation-service/translation-service.types').SupportedLanguage;
  /** Current status of this translation */
  status: import('@/lib/translation-service/translation-service.types').TranslationStatus;
  /** Timestamp when this translation was last completed */
  translatedAt?: string;
  /** Whether this translation is outdated relative to source content */
  isStale?: boolean;
  /** Whether the current user can edit this translation */
  canEdit: boolean;
  /** Whether the current user can trigger retranslation */
  canRetranslate: boolean;
}

/**
 * Translation item data for display in lists and tables.
 * Combines entity metadata with translation status across all languages.
 */
export interface TranslationItemDisplay {
  /** Unique identifier of the entity */
  entityId: string;
  /** Type of entity (article, item, link) */
  entityType: import('@/lib/translation-service/translation-service.types').TranslatableEntityType;
  /** Display name of the entity */
  entityName: string;
  /** Source language of the entity content */
  sourceLanguage: import('@/lib/translation-service/translation-service.types').SupportedLanguage;
  /** Property ID this entity belongs to (if applicable) */
  propertyId?: string;
  /** Property name for display (if applicable) */
  propertyName?: string;
  /** Translation status for each target language */
  translations: LanguageTranslationSummary[];
  /** Overall translation status across all languages */
  overallStatus: 'complete' | 'partial' | 'pending' | 'failed' | 'stale';
  /** Timestamp when source content was last updated */
  sourceUpdatedAt?: string;
  /** Whether any translations are stale */
  isStale?: boolean;
}

/**
 * Aggregate translation statistics for dashboard widgets and summaries.
 * Provides counts by status for progress indicators.
 */
export interface TranslationSummary {
  /** Total number of translations tracked */
  total: number;
  /** Number of complete translations */
  complete: number;
  /** Number of partially complete items */
  partial: number;
  /** Number of pending translations */
  pending: number;
  /** Number of failed translations */
  failed: number;
  /** Number of stale translations (optional, may not be tracked) */
  stale?: number;
}

/**
 * Individual translatable field content.
 * Fields vary by entity type:
 * - Articles have title/description
 * - Items have name/description
 * - Links have title
 */
export interface TranslationFieldContent {
  /** Title field (used by articles and links) */
  title?: string;
  /** Description field (used by articles and items) */
  description?: string;
  /** Name field (used by items) */
  name?: string;
}

// =============================================================================
// Component Props Interfaces
// =============================================================================

/**
 * These define interface contracts for React components.
 * Each interface corresponds to a TranslationManagement UI component.
 */

/**
 * Props for TranslationPreviewPanel component.
 * Slide-out panel showing translation status after content save.
 */
export interface TranslationPreviewPanelProps {
  /** Type of entity being previewed */
  entityType: 'article' | 'item' | 'link';
  /** ID of the entity */
  entityId: string;
  /** Source language of the content */
  sourceLanguage: import('@/lib/translation-service/translation-service.types').SupportedLanguage;
  /** Source content to compare translations against */
  sourceContent: TranslationFieldContent;
  /** Whether the panel is currently open */
  isOpen: boolean;
  /** Callback to close the panel */
  onClose: () => void;
  /** Callback when a translation is edited (optional) */
  onTranslationEdited?: (language: import('@/lib/translation-service/translation-service.types').SupportedLanguage) => void;
}

/**
 * Props for TranslationEditor component.
 * Modal dialog for editing translations with side-by-side comparison.
 */
export interface TranslationEditorProps {
  /** Translation data being edited */
  translation: {
    language: import('@/lib/translation-service/translation-service.types').SupportedLanguage;
    content: TranslationFieldContent;
    status: import('@/lib/translation-service/translation-service.types').TranslationStatus;
  };
  /** Source content for comparison */
  sourceContent: TranslationFieldContent;
  /** Source language for reference */
  sourceLanguage: import('@/lib/translation-service/translation-service.types').SupportedLanguage;
  /** Whether the editor is currently open */
  isOpen: boolean;
  /** Callback to save changes */
  onSave: () => Promise<void>;
  /** Callback to cancel editing */
  onCancel: () => void;
}

/**
 * Props for TranslationStatusWidget component.
 * Dashboard widget showing translation progress summary.
 */
export interface TranslationStatusWidgetProps {
  /** Filter to specific property (optional) */
  propertyId?: string;
  /** Use compact display mode */
  compact?: boolean;
  /** Callback when user clicks to view all translations */
  onViewAll?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for TranslationStatusColumn component.
 * Compact status indicator for table columns showing language status dots.
 */
export interface TranslationStatusColumnProps {
  /** Translation item data to display */
  item: TranslationItemDisplay;
  /** Callback when status indicator is clicked */
  onClick?: () => void;
  /** Use compact display mode */
  compact?: boolean;
}

// =============================================================================
// Filter, Sort, and State Types
// =============================================================================

/**
 * These support UI interactions and component state.
 * They define structures for filtering, sorting, and managing component state.
 */

/**
 * Filter state for translation list views.
 * All fields are optional for flexible filtering.
 */
export interface TranslationFilterState {
  /** Filter by entity types */
  entityTypes?: import('@/lib/translation-service/translation-service.types').TranslatableEntityType[];
  /** Filter by property IDs */
  propertyIds?: string[];
  /** Filter by languages */
  languages?: import('@/lib/translation-service/translation-service.types').SupportedLanguage[];
  /** Filter by translation statuses */
  statuses?: ('complete' | 'partial' | 'pending' | 'failed' | 'stale')[];
  /** Text search query */
  searchQuery?: string;
  /** Only show items with stale translations */
  showStaleOnly?: boolean;
}

/**
 * Sort options for translation lists.
 */
export type TranslationSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'updated-desc'
  | 'updated-asc'
  | 'status-asc'
  | 'status-desc';

/**
 * State for TranslationPreviewPanel component.
 * Manages panel visibility and translation data.
 */
export interface TranslationPreviewState {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Type of entity being previewed */
  entityType: import('@/lib/translation-service/translation-service.types').TranslatableEntityType | null;
  /** ID of the entity */
  entityId: string | null;
  /** Source content for the entity */
  sourceContent: TranslationFieldContent | null;
  /** Source language of the content */
  sourceLanguage: import('@/lib/translation-service/translation-service.types').SupportedLanguage;
  /** Translation data by language */
  translations: Record<
    import('@/lib/translation-service/translation-service.types').SupportedLanguage,
    {
      status: import('@/lib/translation-service/translation-service.types').TranslationStatus;
      content: TranslationFieldContent;
      translatedAt: string | null;
      isStale: boolean;
    }
  >;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * State for TranslationEditor component.
 * Tracks editing progress and validation.
 */
export interface TranslationEditorState {
  /** Whether the editor is open */
  isOpen: boolean;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether save operation is in progress */
  isSaving: boolean;
  /** Error message if any */
  error: string | null;
  /** Current edited content */
  editedContent: TranslationFieldContent;
}

// =============================================================================
// API Types
// =============================================================================

/**
 * These match API endpoint request/response structures.
 * They ensure type safety when calling translation management APIs.
 */

/**
 * Response from GET /api/translations/status endpoint.
 */
export interface TranslationStatusApiResponse {
  /** List of translation items */
  items: TranslationItemDisplay[];
  /** Aggregate summary statistics */
  summary: TranslationSummary;
  /** Pagination info (optional) */
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Request body for PUT /api/translations/[entityType]/[entityId]/[language] endpoint.
 */
export interface UpdateTranslationRequest {
  /** Updated title (for articles and links) */
  title?: string;
  /** Updated description (for articles and items) */
  description?: string;
  /** Updated name (for items) */
  name?: string;
}

/**
 * Response from PUT /api/translations/[entityType]/[entityId]/[language] endpoint.
 */
export interface UpdateTranslationResponse {
  /** Whether the update succeeded */
  success: boolean;
  /** Updated translation data */
  translation: {
    language: import('@/lib/translation-service/translation-service.types').SupportedLanguage;
    status: import('@/lib/translation-service/translation-service.types').TranslationStatus;
    reviewedBy: string | null;
    updatedAt: string;
  };
}

/**
 * Request body for POST /api/translations/retranslate endpoint.
 * Languages defaults to all if omitted.
 */
export interface RetranslateRequest {
  /** Entities to retranslate */
  entities: Array<{
    type: import('@/lib/translation-service/translation-service.types').TranslatableEntityType;
    id: string;
  }>;
  /** Target languages (defaults to all non-source languages) */
  languages?: import('@/lib/translation-service/translation-service.types').SupportedLanguage[];
  /** Whether to overwrite manually edited translations */
  overwriteManual?: boolean;
}

/**
 * Response from POST /api/translations/retranslate endpoint.
 */
export interface RetranslateResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Number of translation jobs queued */
  jobsQueued: number;
  /** Number of translations skipped */
  skipped: number;
  /** Reason for skipping (if any) */
  skippedReason?: string;
}

// =============================================================================
// Hook Return Types
// =============================================================================

/**
 * These define custom hook interfaces for consumers.
 * They establish the contract for translation management hooks.
 */

/**
 * Return type for useTranslationStatus hook.
 * Provides translation data, loading state, and filter/sort controls.
 */
export interface UseTranslationStatusReturn {
  /** List of translation items matching current filters */
  items: TranslationItemDisplay[];
  /** Aggregate summary of translations */
  summary: TranslationSummary;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Function to refetch data */
  refetch: () => void;
  /** Current filter state */
  filters: TranslationFilterState;
  /** Function to update filters */
  setFilters: (filters: Partial<TranslationFilterState>) => void;
  /** Current sort option */
  sortBy: TranslationSortOption;
  /** Function to change sort option */
  setSortBy: (option: TranslationSortOption) => void;
}

/**
 * Return type for useTranslationPreview hook.
 * Manages preview panel state and actions.
 */
export interface UseTranslationPreviewReturn {
  /** Current panel state */
  state: TranslationPreviewState;
  /** Function to open the preview panel */
  open: (
    entityType: import('@/lib/translation-service/translation-service.types').TranslatableEntityType,
    entityId: string,
    sourceLanguage: import('@/lib/translation-service/translation-service.types').SupportedLanguage,
    sourceContent: TranslationFieldContent
  ) => void;
  /** Function to close the preview panel */
  close: () => void;
  /** Function to open translation editor for a language */
  editTranslation: (language: import('@/lib/translation-service/translation-service.types').SupportedLanguage) => void;
  /** Function to retranslate a specific language */
  retranslate: (language: import('@/lib/translation-service/translation-service.types').SupportedLanguage) => Promise<void>;
  /** Function to retranslate all languages */
  retranslateAll: () => Promise<void>;
}

/**
 * Return type for useTranslationRealtime hook.
 * Manages Supabase realtime subscriptions for translation updates.
 */
export interface UseTranslationRealtimeReturn {
  /** Whether connected to realtime service */
  isConnected: boolean;
  /** Timestamp of last received update */
  lastUpdate: Date | null;
  /** Function to subscribe to updates for an entity */
  subscribe: (
    entityId: string,
    entityType: import('@/lib/translation-service/translation-service.types').TranslatableEntityType
  ) => void;
  /** Function to unsubscribe from updates */
  unsubscribe: () => void;
}
