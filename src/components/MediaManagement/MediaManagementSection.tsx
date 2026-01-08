'use client';

/**
 * MediaManagementSection Component
 *
 * Container component that orchestrates media link management.
 * Handles state, conversions, and exposes changes for form submission.
 *
 * @module MediaManagement/MediaManagementSection
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaLinkList } from './MediaLinkList';
import { AddMediaLinkForm } from './AddMediaLinkForm';
import { DeleteMediaConfirmDialog } from './DeleteMediaConfirmDialog';
import type { MediaManagementSectionProps, EditableMediaLink } from './MediaManagement.types';
import type { ItemLink } from '@/types';

/**
 * Converts ItemLink (from API) to EditableMediaLink (for editing)
 */
function itemLinkToEditable(link: ItemLink): EditableMediaLink {
  return {
    id: link.id,
    title: link.title,
    linkType: link.link_type,
    url: link.url,
    thumbnailUrl: link.thumbnail_url || undefined,
    displayOrder: link.display_order,
  };
}

/**
 * Generates a unique temporary ID for new links
 */
function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function MediaManagementSection({
  initialLinks,
  onLinksChange,
  readOnly = false,
}: MediaManagementSectionProps) {
  // Convert initial links to editable format
  const [links, setLinks] = useState<EditableMediaLink[]>(() =>
    initialLinks.map(itemLinkToEditable).sort((a, b) => a.displayOrder - b.displayOrder)
  );

  // UI state
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<EditableMediaLink | null>(null);

  // Notify parent of changes
  useEffect(() => {
    onLinksChange(links);
  }, [links, onLinksChange]);

  // Handle adding a new link
  const handleAdd = useCallback((newLink: Omit<EditableMediaLink, 'displayOrder' | 'tempId'>) => {
    const maxOrder = links.length > 0
      ? Math.max(...links.map(l => l.displayOrder))
      : -1;

    const linkWithOrder: EditableMediaLink = {
      ...newLink,
      tempId: generateTempId(),
      displayOrder: maxOrder + 1,
    };

    setLinks(prev => [...prev, linkWithOrder]);
    setIsAddFormExpanded(false);
  }, [links]);

  // Handle editing a link
  const handleEdit = useCallback((link: EditableMediaLink) => {
    setEditingLinkId(link.id || link.tempId || null);
  }, []);

  // Handle saving link edits
  const handleSave = useCallback((updatedLink: EditableMediaLink) => {
    setLinks(prev =>
      prev.map(l => {
        const linkId = l.id || l.tempId;
        const updatedId = updatedLink.id || updatedLink.tempId;
        return linkId === updatedId ? updatedLink : l;
      })
    );
    setEditingLinkId(null);
  }, []);

  // Handle delete request (show confirmation)
  const handleDeleteRequest = useCallback((link: EditableMediaLink) => {
    setLinkToDelete(link);
  }, []);

  // Handle confirmed deletion
  const handleConfirmDelete = useCallback(() => {
    if (!linkToDelete) return;

    setLinks(prev => {
      const filtered = prev.filter(l => {
        const linkId = l.id || l.tempId;
        const deleteId = linkToDelete.id || linkToDelete.tempId;
        return linkId !== deleteId;
      });
      // Recalculate display orders
      return filtered.map((l, index) => ({ ...l, displayOrder: index }));
    });

    setLinkToDelete(null);
  }, [linkToDelete]);

  // Handle reorder
  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setLinks(prev => {
      const newLinks = [...prev];
      const [movedItem] = newLinks.splice(fromIndex, 1);
      newLinks.splice(toIndex, 0, movedItem);
      // Update display orders
      return newLinks.map((l, index) => ({ ...l, displayOrder: index }));
    });
  }, []);

  // Empty state
  const isEmpty = links.length === 0;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Media & Links</h3>
        {!readOnly && !isAddFormExpanded && (
          <button
            onClick={() => setIsAddFormExpanded(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#FF385C] hover:bg-red-50 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        )}
      </div>

      {/* Empty State */}
      {isEmpty && !isAddFormExpanded && (
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No media links yet</p>
          {!readOnly && (
            <button
              onClick={() => setIsAddFormExpanded(true)}
              className="text-sm text-[#FF385C] hover:underline"
            >
              Add your first link
            </button>
          )}
        </div>
      )}

      {/* Add Form */}
      {!readOnly && (
        <AddMediaLinkForm
          onAdd={handleAdd}
          onCancel={() => setIsAddFormExpanded(false)}
          isExpanded={isAddFormExpanded}
        />
      )}

      {/* Links List */}
      {!isEmpty && (
        <MediaLinkList
          links={links}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onSave={handleSave}
          editingLinkId={editingLinkId}
          setEditingLinkId={setEditingLinkId}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteMediaConfirmDialog
        isOpen={linkToDelete !== null}
        link={linkToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLinkToDelete(null)}
      />
    </div>
  );
}

export default MediaManagementSection;
