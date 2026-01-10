/**
 * Title Generator Utility
 *
 * Generates article titles based on user selections (purpose + item).
 * Creates titles in the format: "[Purpose Label] - [Item Name]"
 *
 * @example
 * ```ts
 * generateArticleTitle({ specificItem: "Fridge", purpose: "how-to-clean" })
 * // Returns: "How to Clean - Fridge"
 *
 * generateArticleTitle({ specificItem: "Oven", purpose: "troubleshooting" })
 * // Returns: "Troubleshooting - Oven"
 * ```
 *
 * Note: This generates the ARTICLE title, not the Item name.
 * - Item name: "Fridge" (physical object, unchanged)
 * - Article title: "How to Clean - Fridge" (content topic)
 *
 * @module ItemCreationWorkflow/utils/titleGenerator
 * @see docs/prd/Plan-094-UI-UX-Workflow-Improvements.md Appendix B
 * @created 2026-01-09 (Plan-094 Phase 1)
 * @lastModified 2026-01-10 (REQ-175 Documentation Sync)
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
