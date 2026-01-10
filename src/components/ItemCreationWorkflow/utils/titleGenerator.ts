/**
 * Title Generator Utility for ItemCreationWorkflow
 *
 * Generates article titles based on user selections during the
 * item creation workflow. Titles follow the format:
 * "[Purpose Label] - [Item Name]"
 *
 * Examples:
 * - "How to Clean - Fridge"
 * - "Troubleshooting - Dishwasher"
 * - "Safety Information - Oven"
 *
 * @module ItemCreationWorkflow/utils/titleGenerator
 * @see Plan-094-UI-UX-Workflow-Improvements.md
 * @lastModified 2026-01-10 (REQ-155 Create Title Generator Utility)
 */

import { PURPOSE_LABELS } from './constants';
import type { PurposeType } from '../ItemCreationWorkflow.types';

// =============================================================================
// Types
// =============================================================================

/**
 * Input parameters for the title generator function.
 */
export interface TitleGeneratorInput {
  /**
   * The specific item name selected by the user.
   * Examples: "Fridge", "Washing Machine", "WiFi Router"
   */
  specificItem: string;

  /**
   * The purpose/intent category selected by the user.
   * When null, the generator returns just the item name as fallback.
   */
  purpose: PurposeType | null;
}

// =============================================================================
// Title Generator Function
// =============================================================================

/**
 * Generates an article title based on user selections.
 *
 * The generated title follows the format: "[Purpose Label] - [Item Name]"
 * This title represents the article/content topic, not the physical item name.
 *
 * @param input - The input parameters containing specificItem and purpose
 * @returns Generated title string
 *
 * @example
 * // With purpose selected
 * generateArticleTitle({ specificItem: "Fridge", purpose: "how-to-clean" })
 * // Returns: "How to Clean - Fridge"
 *
 * @example
 * // With different purpose
 * generateArticleTitle({ specificItem: "Oven", purpose: "troubleshooting" })
 * // Returns: "Troubleshooting - Oven"
 *
 * @example
 * // Fallback when purpose is null
 * generateArticleTitle({ specificItem: "Dishwasher", purpose: null })
 * // Returns: "Dishwasher"
 *
 * @example
 * // Empty item name edge case
 * generateArticleTitle({ specificItem: "", purpose: "how-to-use" })
 * // Returns: "How to Use"
 */
export function generateArticleTitle(input: TitleGeneratorInput): string {
  const { specificItem, purpose } = input;

  // Get the human-readable purpose label
  const purposeLabel = purpose ? PURPOSE_LABELS[purpose] : null;

  // Build the title based on available components
  if (purposeLabel && specificItem) {
    // Full format: "Purpose Label - Item Name"
    return `${purposeLabel} - ${specificItem}`;
  }

  if (purposeLabel && !specificItem) {
    // Purpose only (edge case)
    return purposeLabel;
  }

  // Fallback: return item name when no purpose selected
  return specificItem || '';
}

// =============================================================================
// Legacy/Alternative Generator (for backwards compatibility)
// =============================================================================

/**
 * Generates an item display name based on room and item.
 * This is used for the Item entity name (the physical object),
 * not the Article title.
 *
 * Format: "[Room Label] - [Item Name]"
 *
 * @param roomLabel - Human-readable room label (e.g., "Kitchen")
 * @param specificItem - The specific item name (e.g., "Fridge")
 * @returns Generated item display name
 *
 * @example
 * generateItemDisplayName("Kitchen", "Fridge")
 * // Returns: "Kitchen - Fridge"
 *
 * @example
 * generateItemDisplayName("", "Fridge")
 * // Returns: "Fridge"
 *
 * @deprecated Use generateArticleTitle for article titles.
 * This function maintains backwards compatibility with existing
 * item naming logic in SELECT_SPECIFIC_ITEM action.
 */
export function generateItemDisplayName(
  roomLabel: string,
  specificItem: string
): string {
  if (roomLabel && specificItem) {
    return `${roomLabel} - ${specificItem}`;
  }
  return specificItem || roomLabel || '';
}
