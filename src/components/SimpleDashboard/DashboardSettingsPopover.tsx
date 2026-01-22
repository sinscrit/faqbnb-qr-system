// src/components/SimpleDashboard/DashboardSettingsPopover.tsx
// REQ-136: Dashboard Settings Popover Component
// Created: 2026-01-06
// Last Modified: 2026-01-22 08:00:00 UTC - REQ-E02-052: Internationalized all UI strings

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, X } from 'lucide-react';
import { DashboardPreferences } from '@/hooks/useDashboardPreferences';

/**
 * Props for DashboardSettingsPopover component
 */
export interface DashboardSettingsPopoverProps {
  /** Current preferences */
  preferences: DashboardPreferences;
  /** Callback to update a preference */
  onPreferenceChange: <K extends keyof DashboardPreferences>(
    key: K,
    value: DashboardPreferences[K]
  ) => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Toggle switch component for preferences
 */
interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ id, checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#F7F7F7] transition-colors"
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-6 bg-[#DDDDDD] rounded-full peer-checked:bg-[#FF385C] transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
      </div>
      <div className="flex-1">
        <span className="block text-sm font-medium text-[#222222]">{label}</span>
        {description && (
          <span className="block text-xs text-[#717171] mt-0.5">{description}</span>
        )}
      </div>
    </label>
  );
}

/**
 * Settings popover for dashboard preferences
 * Allows users to override tier-based feature visibility
 *
 * Features:
 * - Settings gear icon button
 * - Popover with toggles for preferences
 * - Click outside to close
 * - Escape key to close
 * - Airbnb Design Language System styling
 *
 * @param preferences - Current dashboard preferences
 * @param onPreferenceChange - Callback to update preferences
 * @param className - Optional additional CSS classes
 */
export function DashboardSettingsPopover({
  preferences,
  onPreferenceChange,
  className = '',
}: DashboardSettingsPopoverProps) {
  const t = useTranslations('dashboard');
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleAdvancedToolsChange = useCallback(
    (checked: boolean) => {
      onPreferenceChange('forceAdvancedTools', checked);
    },
    [onPreferenceChange]
  );

  const handlePortfolioViewChange = useCallback(
    (checked: boolean) => {
      onPreferenceChange('forcePortfolioView', checked);
    },
    [onPreferenceChange]
  );

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="p-2 rounded-lg hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label={t('settings.title')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#DDDDDD] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-label={t('settings.title')}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#DDDDDD]">
            <h3 className="text-base font-semibold text-[#222222]">
              {t('settings.title')}
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-[#F7F7F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222]"
              aria-label={t('settings.closeAriaLabel')}
            >
              <X className="w-4 h-4 text-[#717171]" />
            </button>
          </div>

          {/* Settings Content */}
          <div className="p-2">
            <ToggleSwitch
              id="forceAdvancedTools"
              checked={preferences.forceAdvancedTools}
              onChange={handleAdvancedToolsChange}
              label={t('settings.advancedTools.label')}
              description={t('settings.advancedTools.description')}
            />
            <ToggleSwitch
              id="forcePortfolioView"
              checked={preferences.forcePortfolioView}
              onChange={handlePortfolioViewChange}
              label={t('settings.portfolioView.label')}
              description={t('settings.portfolioView.description')}
            />
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-[#DDDDDD] bg-[#F7F7F7] rounded-b-xl">
            <p className="text-xs text-[#717171]">
              {t('settings.footer')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardSettingsPopover;
