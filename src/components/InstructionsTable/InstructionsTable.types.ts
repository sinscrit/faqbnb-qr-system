/**
 * InstructionsTable Types
 * Created: 2026-01-12
 * REQ-212: Instructions List Page
 *
 * Type definitions for the instructions table component.
 */

/**
 * Instruction row data for table display
 */
export interface InstructionRow {
  id: string;
  articleId: string;
  articleTitle: string;
  itemName: string;
  itemId: string;
  room: string | null;
  purpose: string;
  createdAt: string;
}

/**
 * Props for InstructionsTable component
 */
export interface InstructionsTableProps {
  instructions: InstructionRow[];
  onEdit?: (articleId: string) => void;
  loading?: boolean;
}
