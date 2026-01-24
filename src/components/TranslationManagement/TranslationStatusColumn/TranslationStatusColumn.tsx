'use client';

/**
 * TranslationStatusColumn Component
 *
 * Displays translation status as colored dots representing each supported language.
 * Provides at-a-glance visibility into translation coverage for table columns.
 *
 * Features:
 * - Color-coded dots for each translation status (complete, pending, failed, etc.)
 * - Tooltip with detailed status breakdown by language
 * - Clickable with keyboard accessibility (Enter/Space)
 * - Size variants for different table densities
 * - Motion-reduced animation support
 *
 * @module TranslationManagement/TranslationStatusColumn
 * @see /docs/REQ-E05-014-create-translationstatuscolumn-component-overview.md
 * @lastModified 2026-01-24
 */

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import type { SupportedLanguage } from '@/contexts/LocaleContext';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Translation status summary for a single language
 */
export interface LanguageTranslationSummary {
  /** Language code */
  language: SupportedLanguage;
  /** Translation status */
  status: 'complete' | 'pending' | 'failed' | 'stale' | 'missing' | 'manual';
  /** Optional timestamp of translation */
  translatedAt?: string;
}

/**
 * Props for the TranslationStatusColumn component
 */
export interface TranslationStatusColumnProps {
  /** Entity identifier */
  entityId: string;
  /** Entity type */
  entityType: 'item' | 'article' | 'link' | 'tag';
  /** Translation status for each language */
  translations: LanguageTranslationSummary[];
  /** Dot size variant (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Callback when clicked (opens preview panel) */
  onClick?: () => void;
  /** Show tooltip on hover (default: true) */
  showTooltip?: boolean;
  /** Disable click interaction */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Display order for translation status dots (exclude 'en' source language)
 * Total: 5 languages (es, fr, de, it, nl)
 * NOTE: 'pt' is not in LocaleContext's SupportedLanguage, so it's excluded
 */
const LANGUAGE_ORDER: readonly SupportedLanguage[] = ['es', 'fr', 'de', 'it', 'nl'] as const;

/**
 * Flag emojis for tooltip display
 */
const FLAG_EMOJIS: Record<SupportedLanguage, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  nl: '🇳🇱',
};

/**
 * Status colors matching REQ-E05-008 for consistency across translation UI
 */
const STATUS_COLORS = {
  complete: { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500' },
  pending: { bg: 'bg-orange-500', text: 'text-orange-500', ring: 'ring-orange-500' },
  failed: { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500' },
  manual: { bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-500' },
  stale: { bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500' },
  // Missing status uses hollow/outline style
  missing: { bg: 'bg-gray-300', text: 'text-gray-300', ring: 'ring-gray-300' },
} as const;

/**
 * Size configurations for dot dimensions and spacing
 * - sm: 6px dots, 2px gap - for compact tables
 * - md: 8px dots, 4px gap - default
 * - lg: 10px dots, 6px gap - for spacious tables
 * Approximate total widths: sm (~35px), md (~52px), lg (~68px)
 */
const SIZE_CONFIG = {
  sm: { dot: 'w-1.5 h-1.5', gap: 'gap-0.5' },
  md: { dot: 'w-2 h-2', gap: 'gap-1' },
  lg: { dot: 'w-2.5 h-2.5', gap: 'gap-1.5' },
} as const;

// =============================================================================
// Component
// =============================================================================

/**
 * TranslationStatusColumn Component
 *
 * Displays translation status as 5 colored dots representing each supported language.
 * Provides at-a-glance visibility into translation coverage for table columns.
 *
 * @param props - Component props
 * @returns JSX element
 *
 * @example
 * // Usage in table cell
 * <TranslationStatusColumn
 *   entityId="item-123"
 *   entityType="item"
 *   translations={[
 *     { language: 'es', status: 'complete' },
 *     { language: 'fr', status: 'pending' },
 *   ]}
 *   onClick={() => openPreviewPanel()}
 * />
 *
 * @example
 * // Compact size for dense tables
 * <TranslationStatusColumn
 *   entityId="item-123"
 *   entityType="item"
 *   translations={translations}
 *   size="sm"
 * />
 *
 * @example
 * // Read-only display (no click handler)
 * <TranslationStatusColumn
 *   entityId="item-123"
 *   entityType="item"
 *   translations={translations}
 *   showTooltip={true}
 * />
 */
export function TranslationStatusColumn({
  entityId,
  entityType,
  translations,
  size = 'md',
  onClick,
  showTooltip = true,
  disabled = false,
  className,
}: TranslationStatusColumnProps) {
  // Multiple translation namespaces for component text, language names, and status labels
  const t = useTranslations('translationManagement.statusColumn');
  const tLang = useTranslations('languages');
  const tStatus = useTranslations('translationManagement.statuses');

  // Transform translations array into Map for efficient language lookup
  const translationMap = useMemo(() => {
    const map = new Map<SupportedLanguage, LanguageTranslationSummary>();
    translations.forEach(trans => {
      map.set(trans.language, trans);
    });
    return map;
  }, [translations]);

  // Build ordered dots data, defaulting to 'missing' for languages not in translations array
  const dotsData = useMemo(() => {
    return LANGUAGE_ORDER.map(lang => {
      const translation = translationMap.get(lang);
      return {
        language: lang,
        status: translation?.status || 'missing',
        translatedAt: translation?.translatedAt,
      };
    });
  }, [translationMap]);

  // Count complete translations for ARIA label and tooltip summary
  const completionSummary = useMemo(() => {
    const completeCount = dotsData.filter(d => d.status === 'complete').length;
    const totalCount = dotsData.length;
    return { completeCount, totalCount };
  }, [dotsData]);

  // Build ARIA label with different text for clickable vs read-only
  const ariaLabel = useMemo(() => {
    const { completeCount, totalCount } = completionSummary;
    const translationKey = onClick ? 'ariaLabelClickable' : 'ariaLabel';
    return t(translationKey, { complete: completeCount, total: totalCount });
  }, [completionSummary, onClick, t]);

  // Handle Enter and Space keys for keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onClick?.();
    } else if (e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // Render dots container with proper semantic attributes
  const containerElement = (
    <div
      className={cn(
        'inline-flex items-center',
        SIZE_CONFIG[size].gap,
        onClick && !disabled && 'cursor-pointer',
        onClick && !disabled && 'hover:opacity-80 transition-opacity',
        disabled && 'opacity-50 cursor-not-allowed',
        onClick && !disabled && 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm',
        className
      )}
      role={onClick && !disabled ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onClick={onClick && !disabled ? onClick : undefined}
      onKeyDown={onClick && !disabled ? handleKeyDown : undefined}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
    >
      {dotsData.map((dot) => (
        <div
          key={dot.language}
          className={cn(
            'rounded-full',
            SIZE_CONFIG[size].dot,
            dot.status === 'missing'
              ? 'border-2 border-current'
              : STATUS_COLORS[dot.status]?.bg || STATUS_COLORS.missing.bg,
            dot.status === 'missing' && STATUS_COLORS.missing.text,
            dot.status === 'pending' && 'animate-pulse motion-reduce:animate-none'
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );

  // Build tooltip content with all language statuses
  const tooltipContent = (
    <div className="space-y-1">
      <div className="font-semibold text-xs mb-2">{t('tooltipTitle')}</div>
      <div className="space-y-0.5">
        {dotsData.map(dot => (
          <div key={dot.language} className="flex items-center gap-2 text-xs">
            <span>{FLAG_EMOJIS[dot.language]}</span>
            <span className="font-medium">{tLang(dot.language)}:</span>
            <span className={STATUS_COLORS[dot.status]?.text || STATUS_COLORS.missing.text}>
              {tStatus(dot.status)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-700 pt-1 mt-2 text-xs text-gray-300">
        {t('tooltipSummary', {
          completeCount: completionSummary.completeCount,
          totalCount: completionSummary.totalCount,
        })}
      </div>
    </div>
  );

  // Return container without tooltip if disabled
  if (!showTooltip) {
    return containerElement;
  }

  // Wrap with Radix Tooltip following TruncatedText pattern
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {containerElement}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={cn(
              'z-50 overflow-hidden rounded-md',
              'bg-gray-900 px-3 py-2',
              'text-sm text-white',
              'shadow-md',
              'max-w-xs',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2',
              'data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2',
              'data-[side=top]:slide-in-from-bottom-2'
            )}
            sideOffset={5}
          >
            {tooltipContent}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
