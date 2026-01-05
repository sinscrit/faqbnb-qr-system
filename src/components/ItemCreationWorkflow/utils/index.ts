/**
 * ItemCreationWorkflow Utilities - Barrel Export
 *
 * This module exports utility functions and constants for the
 * ItemCreationWorkflow component.
 *
 * - **Constants**: Room types, item types, content types, workflow configuration
 * - **Suggestion Matrix**: Dynamic item suggestions based on room and type
 * - **Session Storage**: Session persistence and recovery utilities
 * - **Accessibility**: ARIA helpers and focus management
 * - **Duplicate Check**: Item name duplicate detection
 *
 * @example Importing utilities
 * ```tsx
 * import {
 *   ROOM_TYPES,
 *   getSuggestions,
 *   saveSession,
 *   checkDuplicateName,
 * } from '@/components/ItemCreationWorkflow/utils';
 * ```
 *
 * @module ItemCreationWorkflow/utils
 * @see README.md for complete API documentation
 * @lastModified 2026-01-05 (REQ-118 Documentation Updates)
 */

// =============================================================================
// Constants
// =============================================================================
/**
 * Configuration constants for rooms, item types, content types, and workflow.
 */
export * from './constants';

// =============================================================================
// Suggestion Matrix
// =============================================================================
/**
 * Dynamic item suggestions based on room and item type combinations.
 */
export * from './suggestionMatrix';

// =============================================================================
// Session Storage
// =============================================================================
/**
 * Session persistence utilities for auto-save and recovery.
 */
export * from './sessionStorage';

// =============================================================================
// Accessibility
// =============================================================================
/**
 * Accessibility utilities for ARIA labels and focus management.
 */
export * from './accessibility';
