'use client';

/**
 * AssetPanel Component
 *
 * A slide-in drawer component for managing item assets (add, remove, reorder).
 * Uses the useAssetManagement hook for batched commit/discard operations.
 *
 * @module ItemManager/components/AssetPanel
 * @see docs/REQ-081-build-assetpanel-component-detailed.md
 * @lastModified 2026-01-03 (REQ-082 Task 10 - Integrated AssetItem component)
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { X, Loader2, Plus, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssetManagement } from '../../hooks/useAssetManagement';
import { AssetItem } from './AssetItem';
import type { AssetPanelProps } from '../../ItemManager.types';

/**
 * AssetPanel - Slide-in drawer for managing item assets.
 *
 * Features:
 * - Slide-in animation from right
 * - Backdrop overlay with click-to-close
 * - Add/remove/reorder assets with pending state visualization
 * - Commit/discard workflow
 * - Keyboard accessibility (Escape to close, Tab navigation)
 * - ARIA attributes for screen readers
 *
 * @example
 * ```tsx
 * <AssetPanel
 *   isOpen={isAssetPanelOpen}
 *   item={selectedItem}
 *   onClose={() => setAssetPanelOpen(false)}
 *   onAddAssets={handleAddAssets}
 *   onRemoveAssets={handleRemoveAssets}
 * />
 * ```
 */
export function AssetPanel({
  isOpen,
  item,
  onClose,
  onAddAssets,
  onRemoveAssets,
  onReorderAssets,
  className,
  allowedMediaTypes,
  maxFileSize,
}: AssetPanelProps) {
  // Refs for focus management and file input
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the asset management hook
  const {
    isActive,
    currentAssets,
    pendingAdditions,
    pendingRemovalIds,
    isDirty,
    isCommitting,
    error,
    startSession,
    endSession,
    addAssets,
    removeAsset,
    undoRemoval,
    commit,
    discard,
    isPendingAddition,
    isPendingRemoval,
    clearError,
  } = useAssetManagement({
    onAddAssets,
    onRemoveAssets,
    onReorderAssets,
    allowedMediaTypes,
    maxFileSize,
  });

  // ===========================================================================
  // Session Lifecycle
  // ===========================================================================

  // Start session when panel opens with a valid item
  useEffect(() => {
    if (isOpen && item) {
      startSession(item.id, item.media || []);
    }
  }, [isOpen, item?.id, startSession, item]);

  // ===========================================================================
  // Event Handlers
  // ===========================================================================

  /**
   * Handle Cancel button click - discard changes and close
   */
  const handleCancel = useCallback(() => {
    discard();
    endSession();
    onClose();
  }, [discard, endSession, onClose]);

  /**
   * Handle Done button click - commit changes and close on success
   */
  const handleDone = useCallback(async () => {
    const success = await commit();
    if (success) {
      endSession();
      onClose();
    }
  }, [commit, endSession, onClose]);

  /**
   * Handle Add Media button click - trigger file picker
   */
  const handleAddMedia = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle file selection from the file input
   */
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        await addAssets(files);
      }
      // Reset input to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [addAssets]
  );

  // ===========================================================================
  // Keyboard Handling
  // ===========================================================================

  // Handle Escape key to close panel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel]);

  // ===========================================================================
  // Focus Management
  // ===========================================================================

  // Focus first focusable element when panel opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow transition to start
      const timer = setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ===========================================================================
  // Computed Values
  // ===========================================================================

  /**
   * Compute the accept attribute for file input based on allowedMediaTypes
   */
  const acceptAttribute = useMemo(() => {
    const types = allowedMediaTypes || ['video', 'image', 'pdf'];
    const mimeMap: Record<string, string> = {
      video: 'video/*',
      image: 'image/*',
      pdf: 'application/pdf',
    };
    return types.map((t) => mimeMap[t]).join(',');
  }, [allowedMediaTypes]);

  // ===========================================================================
  // Render
  // ===========================================================================

  // Early return if no item (don't render anything)
  if (!item) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-panel-title"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex flex-col',
          'w-full sm:w-[400px] bg-white shadow-xl',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2
            id="asset-panel-title"
            className="text-lg font-semibold text-gray-900"
          >
            Manage Assets
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={handleCancel}
            disabled={isCommitting}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error.message}</p>
            <button
              onClick={clearError}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptAttribute}
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />

          {/* Add Media button */}
          <button
            onClick={handleAddMedia}
            disabled={isCommitting}
            className="w-full py-3 px-4 mb-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Add Media
          </button>

          {/* Asset list */}
          {currentAssets.length > 0 && (
            <div className="space-y-2" role="list" aria-label="Media assets">
              {currentAssets.map((asset, index) => (
                <AssetItem
                  key={asset.id}
                  asset={asset}
                  index={index}
                  isPending={isPendingAddition(asset.id)}
                  isMarkedForRemoval={isPendingRemoval(asset.id)}
                  onRemove={removeAsset}
                  onRestore={undoRemoval}
                  size="medium"
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {currentAssets.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No assets yet</p>
              <p className="text-sm">Add media to get started</p>
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="border-t p-4 flex gap-3 shrink-0">
          <button
            onClick={handleCancel}
            disabled={isCommitting}
            className="flex-1 py-2.5 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={!isDirty || isCommitting}
            className={cn(
              'flex-1 py-2.5 px-4 text-white rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500',
              isDirty
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed',
              isCommitting && 'opacity-75'
            )}
          >
            {isCommitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Done'
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default AssetPanel;
