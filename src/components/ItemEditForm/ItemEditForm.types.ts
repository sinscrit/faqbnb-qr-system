/**
 * ItemEditForm Types
 * Created: 2026-01-13
 * REQ-215: Simplified Item Edit Page
 *
 * TypeScript interfaces for ItemEditForm component and subcomponents
 */

// Import from existing types
import { ItemWithDetails, ItemArticle } from '@/types';
import { RoomTypeConst, ItemTypeConst } from '@/components/ItemCreationWorkflow/utils/constants';

// Props for main form component
export interface ItemEditFormProps {
  item: ItemWithDetails;
  onSave: (data: ItemEditFormData) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
}

// Form data submitted on save
export interface ItemEditFormData {
  name: string;
  description: string;
  tags: string[];
}

// Props for RoomSelector
export interface RoomSelectorProps {
  value: RoomTypeConst | null;
  onChange: (room: RoomTypeConst | null) => void;
  disabled?: boolean;
}

// Props for ItemTypeSelector
export interface ItemTypeSelectorProps {
  value: ItemTypeConst | null;
  onChange: (type: ItemTypeConst | null) => void;
  disabled?: boolean;
}

// Props for ItemInstructionsList
export interface ItemInstructionsListProps {
  articles: ItemArticle[];
  itemName: string;
  onEditInstruction: (articleId: string) => void;
  loading?: boolean;
}

// Instruction row for simplified list display
export interface InstructionListItem {
  id: string;
  title: string;
  purpose: string;
}
