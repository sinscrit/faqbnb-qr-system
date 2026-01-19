// /src/components/LanguageSwitcher/LanguageSwitcher.tsx
// REQ-248: Language Switcher Component
// Last Modified: 2026-01-18

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { LanguageSwitcherProps, SupportedLanguage, LocalePersistenceResult } from './LanguageSwitcher.types';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  LANGUAGE_PREFERENCE_API,
  getLocaleByCode,
  isSupportedLanguage
} from './constants';

/**
 * LanguageSwitcher - Dropdown component for selecting display language
 *
 * Features:
 * - Displays all 6 supported languages with native names
 * - Persists preference to database for authenticated users
 * - Persists preference to cookie for all users (immediate effect)
 * - Full keyboard navigation support
 * - Accessible with proper ARIA attributes
 * - Follows Airbnb DLS styling patterns
 */
export function LanguageSwitcher({
  currentLocale: propLocale,
  onLocaleChange,
  variant = 'dropdown',
  size = 'md',
  showNativeNames = true,
  showFlags = true,
  className = '',
  disabled = false,
  loading: externalLoading = false
}: LanguageSwitcherProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [internalLoading, setInternalLoading] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<SupportedLanguage>(
    propLocale || getLocaleFromCookie() || DEFAULT_LOCALE
  );

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Context
  const { user } = useAuth();

  // Combined loading state
  const isLoading = externalLoading || internalLoading;

  // Sync with prop changes
  useEffect(() => {
    if (propLocale && propLocale !== currentLocale) {
      setCurrentLocale(propLocale);
    }
  }, [propLocale, currentLocale]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      optionsRef.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex]);

  /**
   * Get locale from browser cookie
   */
  function getLocaleFromCookie(): SupportedLanguage | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === LOCALE_COOKIE_NAME && isSupportedLanguage(value)) {
        return value;
      }
    }
    return null;
  }

  /**
   * Set locale cookie
   */
  const setLocaleCookie = useCallback((locale: SupportedLanguage) => {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  }, []);

  /**
   * Persist locale preference to database for authenticated users
   */
  const persistToDatabase = useCallback(async (locale: SupportedLanguage): Promise<boolean> => {
    try {
      const response = await fetch(LANGUAGE_PREFERENCE_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: locale }),
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn('Failed to persist language to database:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error persisting language preference:', error);
      return false;
    }
  }, []);

  /**
   * Handle locale change
   */
  const handleLocaleChange = useCallback(async (locale: SupportedLanguage) => {
    if (locale === currentLocale || isLoading) return;

    setInternalLoading(true);
    setIsOpen(false);
    setFocusedIndex(-1);

    try {
      // Always set cookie for immediate persistence
      setLocaleCookie(locale);

      // If user is authenticated, also save to database
      const persistenceResult: LocalePersistenceResult = {
        success: true,
        persistedTo: 'cookie'
      };

      if (user) {
        const dbSuccess = await persistToDatabase(locale);
        persistenceResult.persistedTo = dbSuccess ? 'both' : 'cookie';
      }

      // Update local state
      setCurrentLocale(locale);

      // Notify parent component
      if (onLocaleChange) {
        onLocaleChange(locale);
      }

      // Reload the page to apply new locale
      // Note: Once next-intl is fully configured, this can be replaced with router navigation
      window.location.reload();

    } catch (error) {
      console.error('Error changing locale:', error);
    } finally {
      setInternalLoading(false);
    }
  }, [currentLocale, isLoading, user, setLocaleCookie, persistToDatabase, onLocaleChange]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const totalOptions = SUPPORTED_LOCALES.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev + 1) % totalOptions);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(totalOptions - 1);
        } else {
          setFocusedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else if (focusedIndex >= 0) {
          const selectedLocale = SUPPORTED_LOCALES[focusedIndex];
          if (selectedLocale) {
            handleLocaleChange(selectedLocale.code);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;

      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;

      case 'Home':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(0);
        }
        break;

      case 'End':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(totalOptions - 1);
        }
        break;
    }
  }, [isOpen, focusedIndex, handleLocaleChange]);

  /**
   * Get size-specific CSS classes (matching PropertySelector pattern)
   */
  const getSizeClasses = () => {
    const sizeMap = {
      sm: {
        button: 'px-3 py-1.5 text-xs',
        dropdown: 'py-1',
        option: 'px-3 py-1.5 text-xs',
        icon: 'w-3 h-3',
        flag: 'text-sm'
      },
      md: {
        button: 'px-4 py-2 text-sm',
        dropdown: 'py-2',
        option: 'px-4 py-2 text-sm',
        icon: 'w-4 h-4',
        flag: 'text-base'
      },
      lg: {
        button: 'px-6 py-3 text-base',
        dropdown: 'py-3',
        option: 'px-6 py-3 text-base',
        icon: 'w-5 h-5',
        flag: 'text-lg'
      }
    };
    return sizeMap[size];
  };

  const sizeClasses = getSizeClasses();
  const currentLocaleData = getLocaleByCode(currentLocale);

  /**
   * Get display text for current locale
   */
  const getDisplayText = () => {
    if (!currentLocaleData) return 'Select Language';

    if (variant === 'compact') {
      return showFlags && currentLocaleData.flag
        ? `${currentLocaleData.flag} ${currentLocaleData.code.toUpperCase()}`
        : currentLocaleData.code.toUpperCase();
    }

    return showNativeNames
      ? currentLocaleData.nativeName
      : currentLocaleData.name;
  };

  return (
    <div
      className={`language-switcher relative ${className}`}
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        className={`
          ${sizeClasses.button}
          w-full bg-white border border-gray-300 rounded-lg
          flex items-center justify-between
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${isOpen ? 'ring-2 ring-[#FF385C] border-transparent' : ''}
        `}
        onClick={() => {
          if (!disabled && !isLoading) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              // Set initial focus to current locale
              const currentIndex = SUPPORTED_LOCALES.findIndex(l => l.code === currentLocale);
              setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled || isLoading}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select language. Current language: ${currentLocaleData?.name || 'English'}`}
        aria-controls="language-listbox"
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <Globe className={`${sizeClasses.icon} text-gray-400 flex-shrink-0`} />
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF385C]"></div>
              <span>Switching...</span>
            </span>
          ) : (
            <span className="truncate text-left flex items-center space-x-2">
              {showFlags && currentLocaleData?.flag && variant !== 'compact' && (
                <span className={sizeClasses.flag}>{currentLocaleData.flag}</span>
              )}
              <span>{getDisplayText()}</span>
            </span>
          )}
        </div>
        <ChevronDown
          className={`${sizeClasses.icon} text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && !isLoading && (
        <div
          id="language-listbox"
          className={`
            absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg
            max-h-60 overflow-y-auto
            ${sizeClasses.dropdown}
          `}
          role="listbox"
          aria-label="Language options"
          aria-activedescendant={focusedIndex >= 0 ? `language-option-${SUPPORTED_LOCALES[focusedIndex]?.code}` : undefined}
        >
          {SUPPORTED_LOCALES.map((locale, index) => {
            const isSelected = currentLocale === locale.code;
            const isFocused = focusedIndex === index;

            return (
              <div
                key={locale.code}
                id={`language-option-${locale.code}`}
                ref={el => { optionsRef.current[index] = el; }}
                className={`
                  ${sizeClasses.option}
                  cursor-pointer transition-colors duration-150
                  ${isFocused ? 'bg-[#FFEEEF] text-[#222222]' : ''}
                  ${isSelected && !isFocused ? 'bg-gray-50' : ''}
                  ${!isFocused && !isSelected ? 'hover:bg-gray-50' : ''}
                  flex items-center justify-between
                `}
                onClick={() => handleLocaleChange(locale.code)}
                onMouseEnter={() => setFocusedIndex(index)}
                role="option"
                aria-selected={isSelected}
                aria-label={`${locale.name}, ${locale.nativeName}`}
              >
                <div className="flex items-center space-x-3">
                  {showFlags && locale.flag && (
                    <span className={`${sizeClasses.flag} flex-shrink-0`}>{locale.flag}</span>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {showNativeNames ? locale.nativeName : locale.name}
                    </span>
                    {showNativeNames && variant !== 'compact' && (
                      <span className="text-xs text-gray-500">{locale.name}</span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <Check className={`${sizeClasses.icon} text-[#FF385C] flex-shrink-0`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
