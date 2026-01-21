/**
 * Internationalization (i18n) Type Definitions
 *
 * Shared types for translation functions compatible with next-intl.
 * Use these types when creating helper functions that accept translator functions.
 *
 * @module types/i18n
 * @since Epic 2 - Static UI Translation
 * @lastModified 2026-01-21
 */

/**
 * Generic translation function type compatible with next-intl's Translator.
 *
 * Use this type when defining helper functions that accept a translation function
 * as a parameter. This type is intentionally permissive to work with next-intl's
 * Translator type which has a more complex signature.
 *
 * @example
 * ```typescript
 * import type { TranslationFn } from '@/types/i18n';
 *
 * function getWelcomeMessage(t: TranslationFn, userName: string): string {
 *   return t('welcome', { name: userName });
 * }
 *
 * // Usage with useTranslations
 * const t = useTranslations('common');
 * const message = getWelcomeMessage(t, 'John');
 * ```
 *
 * @param key - Translation key within the current namespace
 * @param params - Optional interpolation parameters
 * @returns The translated string (or ReactNode in some contexts)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TranslationFn = (key: string, params?: any) => any;

/**
 * Stricter translation function type that returns string.
 *
 * Use this when you need to ensure the translation returns a string
 * (not a ReactNode). Cast the result if needed.
 *
 * @example
 * ```typescript
 * function formatTitle(t: StringTranslationFn, count: number): string {
 *   return t('title', { count });
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StringTranslationFn = (key: string, params?: any) => string;

/**
 * Translation function with specific namespace typing.
 *
 * This is a generic type that can be used to create namespace-specific
 * translation function types for better IDE autocomplete.
 *
 * @example
 * ```typescript
 * type CommonTranslationFn = NamespacedTranslationFn<'common'>;
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NamespacedTranslationFn<_Namespace extends string> = (key: string, params?: any) => any;

/**
 * Props interface for components that receive a translation function.
 *
 * Use this as a base interface or mixin for component props that need
 * a translator passed in.
 *
 * @example
 * ```typescript
 * interface MyDialogProps extends WithTranslation {
 *   isOpen: boolean;
 *   onClose: () => void;
 * }
 *
 * function MyDialog({ t, isOpen, onClose }: MyDialogProps) {
 *   return <div>{t('title')}</div>;
 * }
 * ```
 */
export interface WithTranslation {
  /** Translation function for the component's namespace */
  t: TranslationFn;
}

/**
 * Props interface for components with optional translation.
 *
 * Use when a component can work with or without translations
 * (e.g., has sensible defaults).
 */
export interface WithOptionalTranslation {
  /** Optional translation function */
  t?: TranslationFn;
}
