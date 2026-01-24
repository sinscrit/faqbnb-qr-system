/**
 * @fileoverview Barrel export for GuestLanguageSwitcher component
 *
 * This file re-exports the GuestLanguageSwitcher component and its types
 * for cleaner imports in consuming modules.
 *
 * @module components/guest/GuestLanguageSwitcher
 * @since Epic 4 - Guest Experience
 *
 * @example
 * ```typescript
 * // Clean import via barrel export
 * import { GuestLanguageSwitcher } from '@/components/guest/GuestLanguageSwitcher';
 * import type { GuestLanguageSwitcherProps } from '@/components/guest/GuestLanguageSwitcher';
 * ```
 *
 * Last Modified: 2026-01-23 14:35
 */

export { GuestLanguageSwitcher } from './GuestLanguageSwitcher';
export type { GuestLanguageSwitcherProps } from './GuestLanguageSwitcher';
