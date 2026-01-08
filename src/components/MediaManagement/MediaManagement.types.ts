import { ItemLink, LinkType } from '@/types';

/**
 * Represents a media link in the editing state.
 * Can be an existing link (with id) or a new link (without id).
 */
export interface EditableMediaLink {
  /** Existing link ID (undefined for new links) */
  id?: string;
  /** Link title */
  title: string;
  /** Link type: youtube, pdf, image, text */
  linkType: LinkType;
  /** Resource URL */
  url: string;
  /** Optional thumbnail URL */
  thumbnailUrl?: string;
  /** Display order for sorting */
  displayOrder: number;
  /** Temporary client-side ID for new items (for React keys) */
  tempId?: string;
  /** Whether this item is marked for deletion */
  isMarkedForDeletion?: boolean;
}

/**
 * Props for MediaLinkItem component
 */
export interface MediaLinkItemProps {
  /** The media link data */
  link: EditableMediaLink;
  /** Index in the list (for display order) */
  index: number;
  /** Whether the item is in edit mode */
  isEditing?: boolean;
  /** Handler for edit button click */
  onEdit: (link: EditableMediaLink) => void;
  /** Handler for delete button click */
  onDelete: (link: EditableMediaLink) => void;
  /** Handler for save after inline edit */
  onSave: (link: EditableMediaLink) => void;
  /** Handler for cancel edit */
  onCancelEdit: () => void;
  /** Whether to show the drag handle */
  showDragHandle?: boolean;
  /** Drag handle props from dnd-kit */
  dragHandleProps?: Record<string, any>;
  /** Whether the item is being dragged */
  isDragging?: boolean;
}

/**
 * Props for MediaLinkList component
 */
export interface MediaLinkListProps {
  /** Array of media links to display */
  links: EditableMediaLink[];
  /** Handler for reorder events */
  onReorder: (fromIndex: number, toIndex: number) => void;
  /** Handler for edit link */
  onEdit: (link: EditableMediaLink) => void;
  /** Handler for delete link */
  onDelete: (link: EditableMediaLink) => void;
  /** Handler for save link changes */
  onSave: (link: EditableMediaLink) => void;
  /** Currently editing link ID (or tempId) */
  editingLinkId?: string | null;
  /** Handler to set editing link */
  setEditingLinkId: (id: string | null) => void;
  /** Optional className */
  className?: string;
}

/**
 * Props for AddMediaLinkForm component
 */
export interface AddMediaLinkFormProps {
  /** Handler when a new link is added */
  onAdd: (link: Omit<EditableMediaLink, 'displayOrder' | 'tempId'>) => void;
  /** Handler to cancel adding */
  onCancel: () => void;
  /** Whether the form is visible/expanded */
  isExpanded?: boolean;
}

/**
 * Props for DeleteMediaConfirmDialog component
 */
export interface DeleteMediaConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** The link being deleted */
  link: EditableMediaLink | null;
  /** Handler when deletion is confirmed */
  onConfirm: () => void;
  /** Handler when deletion is cancelled */
  onCancel: () => void;
  /** Whether deletion is in progress */
  isDeleting?: boolean;
}

/**
 * Props for MediaManagementSection component
 */
export interface MediaManagementSectionProps {
  /** Initial links from the item (converted from ItemLink[]) */
  initialLinks: ItemLink[];
  /** Callback to get the current state of links for form submission */
  onLinksChange: (links: EditableMediaLink[]) => void;
  /** Whether the section is in read-only mode */
  readOnly?: boolean;
}

/**
 * Utility type for link type options in dropdown
 */
export interface LinkTypeOption {
  value: LinkType;
  label: string;
  icon: string;
}

/**
 * Link type options for dropdown selection
 */
export const LINK_TYPE_OPTIONS: LinkTypeOption[] = [
  { value: 'youtube', label: 'YouTube Video', icon: 'youtube' },
  { value: 'pdf', label: 'PDF Document', icon: 'file-text' },
  { value: 'image', label: 'Image', icon: 'image' },
  { value: 'text', label: 'Web Link', icon: 'link' },
];
