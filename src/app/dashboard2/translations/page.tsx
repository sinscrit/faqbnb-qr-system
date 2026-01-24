'use client';

/**
 * Translation Management Page
 *
 * Full-width table showing all translatable content (items and articles)
 * with per-language translation status indicators. Provides filtering,
 * search, bulk selection, pagination, and integrates with BulkTranslationBar.
 *
 * @module Dashboard2/Translations
 * @route /dashboard2/translations
 * @created 2026-01-24
 * @requestReference REQ-E05-020
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Package,
  FileText,
  AlertCircle,
  MoreVertical,
  Loader2,
  Languages,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { usePropertyContext } from '@/hooks/usePropertyContext';
import { BulkTranslationBar } from '@/components/TranslationManagement/BulkTranslationBar';
import { LanguageSelectorDialog } from '@/components/TranslationManagement/BulkTranslationBar/LanguageSelectorDialog';
import { supabase } from '@/lib/supabase';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// ============================================================================
// Database Types
// ============================================================================

interface DbItem {
  id: string;
  public_id: string;
  name: string | null;
  property_id: string;
  updated_at: string;
}

interface DbArticle {
  id: string;
  title: string | null;
  item_id: string;
  updated_at: string;
  items: {
    id: string;
    name: string | null;
    property_id: string;
  };
}

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Filter state for the translation management page.
 */
interface TranslationPageFilters {
  /** Filter by content type: all, item, article */
  contentType: 'all' | 'item' | 'article';
  /** Filter by specific language or all */
  language: 'all' | SupportedLanguage;
  /** Filter by translation status */
  status: 'all' | 'complete' | 'pending' | 'missing' | 'stale' | 'manual';
  /** Search term for name filtering */
  search: string;
}

/**
 * Translation status data for a single language.
 */
interface TranslationStatusData {
  /** Current translation status */
  status: 'complete' | 'pending' | 'failed' | 'stale' | 'manual' | 'missing';
  /** When the translation was last updated */
  updatedAt?: string;
}

/**
 * A row in the translation table.
 */
interface TranslationRow {
  /** Unique identifier: "{entityType}:{entityId}" */
  id: string;
  /** Type of entity */
  entityType: 'item' | 'article';
  /** Entity's database ID */
  entityId: string;
  /** Entity's public ID (for items) or article ID */
  publicId?: string;
  /** Display name */
  name: string;
  /** Parent item name (for articles only) */
  parentName?: string;
  /** Property ID this entity belongs to */
  propertyId: string;
  /** Translation status by language */
  translations: Partial<Record<SupportedLanguage, TranslationStatusData>>;
  /** When the source content was last updated */
  sourceUpdatedAt?: string;
}

/**
 * Sort options for the translation table.
 */
type TranslationSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'type-asc'
  | 'type-desc'
  | 'updated-asc'
  | 'updated-desc';

/**
 * Pagination state.
 */
interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Target languages to display (excluding source language 'en') */
const TARGET_LANGUAGES: readonly SupportedLanguage[] = ['es', 'fr', 'de', 'it', 'nl'] as const;

/** Language display info */
const LANGUAGE_INFO: Record<SupportedLanguage, { flag: string; labelKey: string }> = {
  en: { flag: '🇬🇧', labelKey: 'english' },
  es: { flag: '🇪🇸', labelKey: 'spanish' },
  fr: { flag: '🇫🇷', labelKey: 'french' },
  de: { flag: '🇩🇪', labelKey: 'german' },
  it: { flag: '🇮🇹', labelKey: 'italian' },
  nl: { flag: '🇳🇱', labelKey: 'dutch' },
};

/** Status colors for badges */
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  complete: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  pending: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  stale: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  manual: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  missing: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
};

// ============================================================================
// Custom Hook: useTranslationData
// ============================================================================

/**
 * Hook to fetch and manage translation data for the current property.
 */
function useTranslationData(propertyId: string | null) {
  const [rows, setRows] = useState<TranslationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!propertyId) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result: TranslationRow[] = [];

      // Fetch items for this property
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, public_id, name, property_id, updated_at')
        .eq('property_id', propertyId);

      if (itemsError) throw itemsError;

      // Fetch articles for items in this property
      const { data: articles, error: articlesError } = await supabase
        .from('item_articles')
        .select('id, title, item_id, updated_at, items!inner(id, name, property_id)')
        .eq('items.property_id', propertyId);

      if (articlesError) throw articlesError;

      // Cast to proper types
      const typedItems = (items || []) as unknown as DbItem[];
      const typedArticles = (articles || []) as unknown as DbArticle[];

      // Build entity list for batch status call
      const entities: Array<{ entityType: string; entityId: string }> = [];

      typedItems.forEach((item: DbItem) => {
        entities.push({ entityType: 'item', entityId: item.id });
      });

      typedArticles.forEach((article: DbArticle) => {
        entities.push({ entityType: 'article', entityId: article.id });
      });

      // Fetch translation status from batch API
      let translationStatus: Record<string, Partial<Record<SupportedLanguage, TranslationStatusData>>> = {};

      if (entities.length > 0) {
        try {
          const response = await fetch('/api/translations/status/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entities }),
          });

          if (response.ok) {
            const data = await response.json();
            translationStatus = data.statuses || {};
          }
        } catch {
          // Continue without translation status if API fails
          console.warn('Failed to fetch translation status');
        }
      }

      // Transform items to rows
      typedItems.forEach((item: DbItem) => {
        const key = `item:${item.id}`;
        result.push({
          id: key,
          entityType: 'item',
          entityId: item.id,
          publicId: item.public_id,
          name: item.name || 'Untitled Item',
          propertyId: item.property_id,
          translations: translationStatus[key] || {},
          sourceUpdatedAt: item.updated_at,
        });
      });

      // Transform articles to rows
      typedArticles.forEach((article: DbArticle) => {
        const key = `article:${article.id}`;
        result.push({
          id: key,
          entityType: 'article',
          entityId: article.id,
          name: article.title || 'Untitled Guide',
          parentName: article.items?.name || undefined,
          propertyId: propertyId,
          translations: translationStatus[key] || {},
          sourceUpdatedAt: article.updated_at,
        });
      });

      setRows(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { rows, isLoading, error, refetch: fetchData };
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Status badge for a single translation.
 * REQ-E05-032: Added ARIA labels for accessibility
 */
function TranslationStatusBadge({
  status,
  updatedAt,
  compact = false,
  language,
}: {
  status: string;
  updatedAt?: string;
  compact?: boolean;
  /** Language context for ARIA label */
  language?: string;
}) {
  const t = useTranslations('translationManagement.statuses');
  const tAria = useTranslations('translationManagement.status.ariaLabels');
  const colors = STATUS_COLORS[status] || STATUS_COLORS.missing;

  // Generate accessible label with language context
  const getAriaLabel = () => {
    const statusKey = status as 'complete' | 'pending' | 'failed' | 'stale' | 'manual' | 'missing';
    if (language) {
      return tAria(statusKey, { language });
    }
    return t(statusKey);
  };

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full',
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        colors.bg,
        colors.text
      )}
      role="status"
      aria-label={getAriaLabel()}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} aria-hidden="true" />
      {!compact && <span aria-hidden="true">{t(status as 'complete' | 'pending' | 'failed' | 'stale' | 'manual' | 'missing')}</span>}
    </span>
  );

  if (!updatedAt) return badge;

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{badge}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-md"
            sideOffset={5}
          >
            {new Date(updatedAt).toLocaleDateString()}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

/**
 * Sortable column header.
 */
function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: {
  label: string;
  sortKey: 'name' | 'type' | 'updated';
  currentSort: TranslationSortOption;
  onSort: (option: TranslationSortOption) => void;
}) {
  const isActive = currentSort.startsWith(sortKey);
  const isAsc = currentSort.endsWith('-asc');

  const handleClick = () => {
    if (isActive) {
      onSort(`${sortKey}-${isAsc ? 'desc' : 'asc'}` as TranslationSortOption);
    } else {
      onSort(`${sortKey}-asc` as TranslationSortOption);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-1 font-medium text-left hover:text-blue-600 dark:hover:text-blue-400',
        isActive && 'text-blue-600 dark:text-blue-400'
      )}
      aria-label={`Sort by ${label} ${isActive ? (isAsc ? 'descending' : 'ascending') : 'ascending'}`}
    >
      {label}
      <span className="flex flex-col">
        <ChevronUp className={cn('h-3 w-3 -mb-1', isActive && isAsc ? 'text-blue-600' : 'text-gray-400')} />
        <ChevronDown className={cn('h-3 w-3', isActive && !isAsc ? 'text-blue-600' : 'text-gray-400')} />
      </span>
    </button>
  );
}

/**
 * Row actions dropdown menu.
 */
function RowActionsMenu({
  row,
  onRetranslateAll,
  onSelectLanguages,
}: {
  row: TranslationRow;
  onRetranslateAll: () => void;
  onSelectLanguages: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('translationManagement');

  const handleViewEdit = () => {
    if (row.entityType === 'item' && row.publicId) {
      router.push(`/dashboard2/items/${row.publicId}/edit`);
    } else if (row.entityType === 'article') {
      router.push(`/dashboard2/instructions/${row.entityId}/edit`);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handleViewEdit}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ExternalLink className="h-4 w-4" />
              {t('actions.view')}
            </button>
            <button
              onClick={() => { onRetranslateAll(); setIsOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RotateCw className="h-4 w-4" />
              {t('actions.retranslateAll')}
            </button>
            <button
              onClick={() => { onSelectLanguages(); setIsOpen(false); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Languages className="h-4 w-4" />
              {t('actions.selectLanguages')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function TranslationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('translationManagement');
  const tLang = useTranslations('languages');
  const { selectedPropertyId } = usePropertyContext();

  // Data fetching
  const { rows, isLoading, error, refetch } = useTranslationData(selectedPropertyId);

  // Filter state
  const [filters, setFilters] = useState<TranslationPageFilters>({
    contentType: 'all',
    language: 'all',
    status: 'all',
    search: '',
  });

  // Sort state
  const [sortOption, setSortOption] = useState<TranslationSortOption>('name-asc');

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 25,
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk operations state
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [singleRowAction, setSingleRowAction] = useState<TranslationRow | null>(null);

  // Search debounce
  const [searchInput, setSearchInput] = useState('');

  // Read URL params on mount
  useEffect(() => {
    const contentType = searchParams.get('contentType');
    const language = searchParams.get('language');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    setFilters(prev => ({
      ...prev,
      contentType: (['all', 'item', 'article'].includes(contentType || '') ? contentType : 'all') as TranslationPageFilters['contentType'],
      language: (['all', ...TARGET_LANGUAGES].includes(language || '') ? language : 'all') as TranslationPageFilters['language'],
      status: (['all', 'complete', 'pending', 'missing', 'stale', 'manual'].includes(status || '') ? status : 'all') as TranslationPageFilters['status'],
      search: search || '',
    }));
    setSearchInput(search || '');
  }, [searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL when filters change
  const updateFilters = useCallback((updates: Partial<TranslationPageFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));

    const params = new URLSearchParams();
    if (newFilters.contentType !== 'all') params.set('contentType', newFilters.contentType);
    if (newFilters.language !== 'all') params.set('language', newFilters.language);
    if (newFilters.status !== 'all') params.set('status', newFilters.status);
    if (newFilters.search) params.set('search', newFilters.search);

    const queryString = params.toString();
    router.push(`/dashboard2/translations${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [filters, router]);

  // Clear selections when filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    let result = [...rows];

    // Content type filter
    if (filters.contentType !== 'all') {
      result = result.filter(row => row.entityType === filters.contentType);
    }

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(row =>
        row.name.toLowerCase().includes(search) ||
        (row.parentName?.toLowerCase().includes(search))
      );
    }

    // Language filter
    if (filters.language !== 'all') {
      const lang = filters.language as SupportedLanguage;
      result = result.filter(row => row.translations[lang] !== undefined);
    }

    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(row => {
        const statuses = Object.values(row.translations).map(t => t?.status);
        switch (filters.status) {
          case 'complete':
            return TARGET_LANGUAGES.every(lang => row.translations[lang]?.status === 'complete');
          case 'pending':
            return statuses.includes('pending');
          case 'missing':
            return TARGET_LANGUAGES.some(lang => !row.translations[lang] || row.translations[lang]?.status === 'missing');
          case 'stale':
            return statuses.includes('stale');
          case 'manual':
            return statuses.includes('manual');
          default:
            return true;
        }
      });
    }

    return result;
  }, [rows, filters]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];

    sorted.sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'type-asc':
          return a.entityType.localeCompare(b.entityType);
        case 'type-desc':
          return b.entityType.localeCompare(a.entityType);
        case 'updated-asc':
          return (a.sourceUpdatedAt || '').localeCompare(b.sourceUpdatedAt || '');
        case 'updated-desc':
          return (b.sourceUpdatedAt || '').localeCompare(a.sourceUpdatedAt || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredRows, sortOption]);

  // Paginated rows
  const totalPages = Math.ceil(sortedRows.length / pagination.itemsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    return sortedRows.slice(start, start + pagination.itemsPerPage);
  }, [sortedRows, pagination]);

  // Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const visibleIds = paginatedRows.map(r => r.id);
    const allSelected = visibleIds.every(id => selectedIds.has(id));

    if (allSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        visibleIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [paginatedRows, selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk operation handlers
  const handleBulkRetranslateAll = useCallback(async (itemIds: string[]) => {
    try {
      const entities = itemIds.map(id => {
        const [entityType, entityId] = id.split(':');
        return { entityType, entityId };
      });

      const response = await fetch('/api/translations/retranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entities, languages: TARGET_LANGUAGES }),
      });

      if (!response.ok) throw new Error('Failed to queue translations');

      const data = await response.json();
      clearSelection();
      refetch();

      return {
        success: true,
        jobCount: data.jobsQueued || 0,
        skippedCount: data.skipped || 0,
      };
    } catch (error) {
      return {
        success: false,
        jobCount: 0,
        skippedCount: 0,
        errors: [(error as Error).message],
      };
    }
  }, [clearSelection, refetch]);

  const handleBulkRetranslateLanguage = useCallback(async (itemIds: string[], language: 'es' | 'fr' | 'de' | 'it' | 'nl' | 'pt') => {
    try {
      const entities = itemIds.map(id => {
        const [entityType, entityId] = id.split(':');
        return { entityType, entityId };
      });

      const response = await fetch('/api/translations/retranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entities, languages: [language] }),
      });

      if (!response.ok) throw new Error('Failed to queue translations');

      const data = await response.json();
      clearSelection();
      refetch();

      return {
        success: true,
        jobCount: data.jobsQueued || 0,
        skippedCount: data.skipped || 0,
      };
    } catch (error) {
      return {
        success: false,
        jobCount: 0,
        skippedCount: 0,
        errors: [(error as Error).message],
      };
    }
  }, [clearSelection, refetch]);

  const handleLanguageSelectorConfirm = useCallback(async (languages: SupportedLanguage[]) => {
    const ids = singleRowAction ? [singleRowAction.id] : Array.from(selectedIds);

    try {
      const entities = ids.map(id => {
        const [entityType, entityId] = id.split(':');
        return { entityType, entityId };
      });

      await fetch('/api/translations/retranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entities, languages }),
      });

      clearSelection();
      refetch();
    } catch (error) {
      console.error('Failed to retranslate:', error);
    }

    setIsLanguageSelectorOpen(false);
    setSingleRowAction(null);
  }, [selectedIds, singleRowAction, clearSelection, refetch]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      contentType: 'all',
      language: 'all',
      status: 'all',
      search: '',
    });
    setSearchInput('');
    router.push('/dashboard2/translations', { scroll: false });
  }, [router]);

  const activeFilterCount = [
    filters.contentType !== 'all',
    filters.language !== 'all',
    filters.status !== 'all',
    filters.search !== '',
  ].filter(Boolean).length;

  // Check all state for header checkbox
  const visibleIds = paginatedRows.map(r => r.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));
  const someSelected = visibleIds.some(id => selectedIds.has(id)) && !allSelected;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            {t('error.title')}
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error.message}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {t('error.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Empty state (no content)
  if (rows.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Languages className="h-6 w-6" />
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{t('subtitle')}</p>

        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <Languages className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('emptyState.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            {t('emptyState.description')}
          </p>
          <button
            onClick={() => router.push('/dashboard2/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('emptyState.createItem')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Languages className="h-6 w-6" />
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        {/* Content Type Filter */}
        <select
          value={filters.contentType}
          onChange={(e) => updateFilters({ contentType: e.target.value as TranslationPageFilters['contentType'] })}
          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
          aria-label={t('filters.contentType')}
        >
          <option value="all">{t('filters.allTypes')}</option>
          <option value="item">{t('filters.items')}</option>
          <option value="article">{t('filters.articles')}</option>
        </select>

        {/* Language Filter */}
        <select
          value={filters.language}
          onChange={(e) => updateFilters({ language: e.target.value as TranslationPageFilters['language'] })}
          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
          aria-label={t('filters.language')}
        >
          <option value="all">{t('filters.allLanguages')}</option>
          {TARGET_LANGUAGES.map(lang => (
            <option key={lang} value={lang}>
              {LANGUAGE_INFO[lang].flag} {tLang(lang)}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value as TranslationPageFilters['status'] })}
          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
          aria-label={t('filters.status')}
        >
          <option value="all">{t('filters.allStatuses')}</option>
          <option value="complete">{t('statuses.complete')}</option>
          <option value="pending">{t('statuses.pending')}</option>
          <option value="missing">{t('statuses.missing')}</option>
          <option value="stale">{t('statuses.stale')}</option>
          <option value="manual">{t('statuses.manual')}</option>
        </select>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
            aria-label={t('filters.search')}
          />
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <X className="h-4 w-4" />
            {t('filters.clearFilters')} ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Results count and selection */}
      <div className="flex items-center justify-between mb-2 text-sm text-gray-600 dark:text-gray-400">
        <span>
          {t('table.showing', {
            start: ((pagination.currentPage - 1) * pagination.itemsPerPage) + 1,
            end: Math.min(pagination.currentPage * pagination.itemsPerPage, sortedRows.length),
            total: sortedRows.length,
          })}
        </span>
        {selectedIds.size > 0 && (
          <span className="text-blue-600 dark:text-blue-400" aria-live="polite">
            {t('table.selected', { count: selectedIds.size })}
          </span>
        )}
      </div>

      {/* No matches state */}
      {filteredRows.length === 0 && rows.length > 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold mb-2">{t('noMatches.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('noMatches.description')}</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {t('filters.clearFilters')}
          </button>
        </div>
      )}

      {/* Table */}
      {filteredRows.length > 0 && (
        <>
          <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
            <table className="w-full" aria-label="Translation management table">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr className="border-b dark:border-gray-700">
                  {/* Checkbox column */}
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected; }}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600"
                      aria-label={t('table.selectAll')}
                    />
                  </th>
                  {/* Type column */}
                  <th className="w-12 px-2 py-3">
                    <SortableHeader
                      label={t('table.type')}
                      sortKey="type"
                      currentSort={sortOption}
                      onSort={setSortOption}
                    />
                  </th>
                  {/* Name column */}
                  <th className="px-4 py-3 text-left min-w-[200px]">
                    <SortableHeader
                      label={t('table.name')}
                      sortKey="name"
                      currentSort={sortOption}
                      onSort={setSortOption}
                    />
                  </th>
                  {/* Parent column */}
                  <th className="px-4 py-3 text-left min-w-[150px] hidden md:table-cell">
                    {t('table.parent')}
                  </th>
                  {/* Language columns */}
                  {TARGET_LANGUAGES.map(lang => (
                    <th key={lang} className="w-20 px-2 py-3 text-center">
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <span className="cursor-help">
                              {LANGUAGE_INFO[lang].flag}
                            </span>
                          </Tooltip.Trigger>
                          <Tooltip.Content
                            className="z-50 rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-md"
                            sideOffset={5}
                          >
                            {tLang(lang)}
                            <Tooltip.Arrow className="fill-gray-900" />
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    </th>
                  ))}
                  {/* Actions column */}
                  <th className="w-12 px-2 py-3">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, index) => {
                  const isSelected = selectedIds.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50',
                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/20',
                        isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                      onClick={() => toggleSelection(row.id)}
                      role="row"
                      aria-selected={isSelected}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(row.id)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      {/* Type icon */}
                      <td className="px-2 py-3 text-center">
                        {row.entityType === 'item' ? (
                          <Package className="h-4 w-4 text-gray-500 mx-auto" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-500 mx-auto" />
                        )}
                      </td>
                      {/* Name */}
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (row.entityType === 'item' && row.publicId) {
                              router.push(`/dashboard2/items/${row.publicId}/edit`);
                            } else if (row.entityType === 'article') {
                              router.push(`/dashboard2/instructions/${row.entityId}/edit`);
                            }
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-left"
                        >
                          {row.name}
                        </button>
                      </td>
                      {/* Parent */}
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                        {row.parentName || '-'}
                      </td>
                      {/* Language status badges */}
                      {TARGET_LANGUAGES.map(lang => {
                        const translation = row.translations[lang];
                        return (
                          <td key={lang} className="px-2 py-3 text-center">
                            <TranslationStatusBadge
                              status={translation?.status || 'missing'}
                              updatedAt={translation?.updatedAt}
                              compact
                              language={lang.toUpperCase()}
                            />
                          </td>
                        );
                      })}
                      {/* Actions */}
                      <td className="px-2 py-3" onClick={e => e.stopPropagation()}>
                        <RowActionsMenu
                          row={row}
                          onRetranslateAll={() => handleBulkRetranslateAll([row.id])}
                          onSelectLanguages={() => {
                            setSingleRowAction(row);
                            setIsLanguageSelectorOpen(true);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('pagination.itemsPerPage')}:
              </span>
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => setPagination({ currentPage: 1, itemsPerPage: Number(e.target.value) })}
                className="px-2 py-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('pagination.previous')}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm">
                {t('pagination.page', { current: pagination.currentPage, total: totalPages || 1 })}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage >= totalPages}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('pagination.next')}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bulk Translation Bar */}
      {selectedIds.size > 0 && (
        <BulkTranslationBar
          selectedIds={Array.from(selectedIds)}
          onRetranslateAll={handleBulkRetranslateAll}
          onRetranslateLanguage={handleBulkRetranslateLanguage}
          onClearSelection={clearSelection}
          className="fixed bottom-0 left-0 right-0"
        />
      )}

      {/* Language Selector Dialog */}
      <LanguageSelectorDialog
        isOpen={isLanguageSelectorOpen}
        onClose={() => {
          setIsLanguageSelectorOpen(false);
          setSingleRowAction(null);
        }}
        onConfirm={handleLanguageSelectorConfirm}
        title={t('actions.selectLanguages')}
      />
    </div>
  );
}
