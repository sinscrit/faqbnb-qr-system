// src/components/SimpleDashboard/ActionButtons.tsx
// REQ-126: Action Buttons Component for Dashboard Operations
// REQ-127: Print QR Code Navigation Logic Enhancement
// Created: 2026-01-06
// Last Modified: 2026-01-06 (REQ-127 verified)

'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { PlusCircle, Package, QrCode, LucideIcon } from 'lucide-react';

/**
 * Props for the main ActionButtons component
 */
export interface ActionButtonsProps {
  /** Optional callback for Create button (overrides default navigation) */
  onCreateClick?: () => void;
  /** Optional callback for View button (overrides default navigation) */
  onViewClick?: () => void;
  /** Optional callback for Print button (overrides default navigation) */
  onPrintClick?: () => void;
  /** Optional additional CSS classes */
  className?: string;
  /** Disable all buttons */
  disabled?: boolean;
}

/**
 * Configuration for individual action button
 */
interface ActionButtonConfig {
  /** Unique key for the button */
  key: string;
  /** Display label */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Button variant - primary (gradient) or secondary (outline) */
  variant: 'primary' | 'secondary';
  /** Click handler */
  onClick: () => void;
  /** Accessible label for screen readers */
  ariaLabel: string;
}

/**
 * Props for individual ActionButton sub-component
 */
interface ActionButtonProps {
  /** Button configuration */
  config: ActionButtonConfig;
  /** Disable the button */
  disabled?: boolean;
}

/**
 * Individual action button component
 * Supports primary (gradient) and secondary (outline) variants
 * Meets WCAG 2.5.5 touch target requirements (48x48px minimum)
 */
function ActionButton({ config, disabled }: ActionButtonProps) {
  const Icon = config.icon;
  const isPrimary = config.variant === 'primary';

  // Base classes for all buttons
  const baseClasses = `
    flex items-center justify-center gap-2
    min-h-[48px] px-6 py-3.5
    rounded-lg font-medium text-base
    transition-all duration-200 ease-out
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-[#222222] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Variant-specific classes
  const variantClasses = isPrimary
    ? `bg-gradient-to-r from-[#E61E4D] to-[#D70466] text-white
       hover:scale-[1.02] hover:brightness-95 active:scale-[0.98]`
    : `bg-white border border-[#222222] text-[#222222]
       hover:scale-[1.02] hover:bg-[#F7F7F7] active:scale-[0.98]`;

  return (
    <button
      onClick={config.onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses}`}
      aria-label={config.ariaLabel}
    >
      <Icon className="w-5 h-5" />
      <span>{config.label}</span>
    </button>
  );
}

/**
 * Dashboard action buttons for Create, View, and Print QR operations
 *
 * Features:
 * - Three buttons in horizontal row (responsive to 1 column on mobile)
 * - Primary button with Airbnb gradient (#E61E4D → #D70466)
 * - Secondary buttons with outline style
 * - Print QR Code navigates based on property count (PRD Feature 2.3)
 * - WCAG 2.1 AA compliant with 48px touch targets
 * - Full keyboard accessibility
 *
 * @param onCreateClick - Optional callback to override Create navigation
 * @param onViewClick - Optional callback to override View navigation
 * @param onPrintClick - Optional callback to override Print navigation
 * @param className - Optional additional CSS classes
 * @param disabled - Disable all buttons
 */
export function ActionButtons({
  onCreateClick,
  onViewClick,
  onPrintClick,
  className = '',
  disabled = false,
}: ActionButtonsProps) {
  const router = useRouter();
  const { userProperties } = useAuth();
  const t = useTranslations('common.actions');

  /**
   * Handle Print QR Code button click
   * Navigates based on user's property count per PRD Feature 2.3:
   * - Single property: Navigate directly to print flow with property ID
   * - Multiple/zero properties: Show property selector
   * - Undefined properties (loading): Show property selector (safe default)
   *
   * Edge Case Behavior (REQ-127):
   * - userProperties undefined → Routes to /dashboard2/print (selector page handles loading)
   * - userProperties empty array → Routes to /dashboard2/print (selector shows empty state)
   * - userProperties has 1 item → Routes to /dashboard2/print/[id] (direct flow)
   * - userProperties has 2+ items → Routes to /dashboard2/print (selector grid)
   * - onPrintClick callback present → Calls callback instead (overrides navigation)
   */
  const handlePrintQRCode = () => {
    // Allow custom handler to override
    if (onPrintClick) {
      onPrintClick();
      return;
    }

    // Property-based navigation per PRD Feature 2.3
    if (userProperties && userProperties.length === 1) {
      // Single property: Navigate directly to print flow
      router.push(`/dashboard2/print/${userProperties[0].id}`);
    } else {
      // Multiple properties or no properties: Show property selector
      router.push('/dashboard2/print');
    }
  };

  // Button configurations - order matches PRD wireframe
  const buttonConfigs: ActionButtonConfig[] = [
    {
      key: 'create',
      label: t('newQrCodeItem'),
      icon: PlusCircle,
      variant: 'primary',
      onClick: onCreateClick || (() => router.push('/dashboard2/create')),
      ariaLabel: t('newQrCodeItem'),
    },
    {
      key: 'view',
      label: t('viewQrCodeItems'),
      icon: Package,
      variant: 'secondary',
      onClick: onViewClick || (() => router.push('/dashboard2/items')),
      ariaLabel: t('viewQrCodeItems'),
    },
    {
      key: 'print',
      label: t('printQrCode'),
      icon: QrCode,
      variant: 'secondary',
      onClick: handlePrintQRCode,
      ariaLabel: t('printQrCode'),
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {buttonConfigs.map((config) => (
        <ActionButton key={config.key} config={config} disabled={disabled} />
      ))}
    </div>
  );
}
