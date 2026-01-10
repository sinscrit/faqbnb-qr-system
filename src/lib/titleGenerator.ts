/**
 * Title Generator Utility for Item Articles
 * REQ-151: API Endpoint Updates for Article-Based Content Structure
 * Created: 2026-01-10
 */

import { PurposeType } from '@/types';

/**
 * Labels for each purpose type
 */
export const PURPOSE_LABELS: Record<PurposeType, string> = {
  'how-to-use': 'How to Use',
  'how-to-clean': 'How to Clean',
  'troubleshooting': 'Troubleshooting',
  'safety-info': 'Safety Information',
  'maintenance': 'Maintenance',
  'features': 'Features & Tips',
  'other': 'Other',
};

export interface TitleGeneratorInput {
  itemName: string;
  purpose: PurposeType;
}

/**
 * Generates an article title based on purpose and item name.
 * Format: "[Purpose] - [Item Name]"
 * Example: generateArticleTitle({ itemName: "Fridge", purpose: "how-to-clean" })
 *          → "How to Clean - Fridge"
 *
 * @param input - The item name and purpose type
 * @returns The formatted article title
 */
export function generateArticleTitle(input: TitleGeneratorInput): string {
  const { itemName, purpose } = input;
  const purposeLabel = PURPOSE_LABELS[purpose] || PURPOSE_LABELS['other'];
  return `${purposeLabel} - ${itemName}`;
}

/**
 * Validates if a string is a valid PurposeType
 * @param value - The string to validate
 * @returns True if the value is a valid PurposeType
 */
export function isValidPurposeType(value: string): value is PurposeType {
  return Object.keys(PURPOSE_LABELS).includes(value);
}

/**
 * Gets the display label for a purpose type
 * @param purpose - The purpose type
 * @returns The display label or 'Other' if not found
 */
export function getPurposeLabel(purpose: PurposeType): string {
  return PURPOSE_LABELS[purpose] || PURPOSE_LABELS['other'];
}
