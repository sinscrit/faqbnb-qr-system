// src/hooks/index.ts
// Barrel exports for hooks
// Created: 2026-01-21
// Last Modified: 2026-01-21

// ============ Localization Hooks ============

// Common translations convenience hook
export { useCommonTranslations } from './useCommonTranslations';
export type {
  CommonActionKey,
  CommonStatusKey,
  CommonConfirmationButtonKey,
  CommonEmptyStateKey,
  CommonFormHintKey,
  UseCommonTranslationsReturn,
} from './useCommonTranslations';

// Language preference hook
export {
  useLanguagePreference,
  isSupportedLanguage,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_COOKIE_NAME,
  COOKIE_MAX_AGE,
  LANGUAGE_OPTIONS,
} from './useLanguagePreference';
export type {
  SupportedLanguage,
  LanguageOption,
  UseLanguagePreferenceReturn,
} from './useLanguagePreference';

// ============ Dashboard Hooks ============

export {
  useDashboardTier,
  getDashboardTier,
  getTierConfig,
  TIER_THRESHOLDS,
} from './useDashboardTier';
export type {
  DashboardTier,
  DashboardTierConfig,
  DashboardTierOverrides,
} from './useDashboardTier';

export { useDashboardStats } from './useDashboardStats';
export { useDashboardPreferences } from './useDashboardPreferences';
export { useTierChangeNotification } from './useTierChangeNotification';

// ============ Property Hooks ============

export { useActiveProperty } from './useActiveProperty';
export { usePropertyContext } from './usePropertyContext';
export { usePropertyItemCounts } from './usePropertyItemCounts';

// ============ Auth Hooks ============

export { usePermissions } from './usePermissions';
export { useRedirectIfAuthenticated } from './useRedirectIfAuthenticated';
export { useRegistration } from './useRegistration';

// ============ Utility Hooks ============

export { usePrintWindow } from './usePrintWindow';
export { useQRCodeGeneration } from './useQRCodeGeneration';
