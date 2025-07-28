'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Item } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Props for the ItemSelectionList component
 */
interface ItemSelectionListProps {
  /** Array of items to display */
  items: Item[];
  /** Array of currently selected item IDs */
  selectedItemIds: string[];
  /** Callback when item selection changes */
  onSelectionChange: (selectedIds: string[]) => void;
  /** Loading state for when items are being fetched */
  isLoading?: boolean;
  /** Optional class name for styling */
  className?: string;
  /** Maximum height for the list container */
  maxHeight?: string;
}

/**
 * ItemSelectionList component for selecting multiple items with search functionality
 */
export function ItemSelectionList({
  items,
  selectedItemIds,
  onSelectionChange,
  isLoading = false,
  className,
  maxHeight = 'max-h-96'
}: ItemSelectionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.public_id.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  }, [items, debouncedSearchTerm]);

  // Check if all filtered items are selected
  const allFilteredSelected = filteredItems.length > 0 && 
    filteredItems.every(item => selectedItemIds.includes(item.id));

  // Check if some filtered items are selected
  const someFilteredSelected = filteredItems.some(item => 
    selectedItemIds.includes(item.id)
  );

  // Handle individual item selection toggle
  const handleItemToggle = (itemId: string) => {
    const isSelected = selectedItemIds.includes(itemId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedItemIds.filter(id => id !== itemId);
    } else {
      newSelection = [...selectedItemIds, itemId];
    }

    onSelectionChange(newSelection);
  };

  // Handle select all filtered items
  const handleSelectAll = () => {
    const filteredItemIds = filteredItems.map(item => item.id);
    const otherSelectedIds = selectedItemIds.filter(id => 
      !filteredItemIds.includes(id)
    );
    
    onSelectionChange([...otherSelectedIds, ...filteredItemIds]);
  };

  // Handle deselect all filtered items
  const handleDeselectAll = () => {
    const filteredItemIds = filteredItems.map(item => item.id);
    const newSelection = selectedItemIds.filter(id => 
      !filteredItemIds.includes(id)
    );
    
    onSelectionChange(newSelection);
  };

  // Handle clear all selections
  const handleClearAll = () => {
    onSelectionChange([]);
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search items by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={allFilteredSelected ? handleDeselectAll : handleSelectAll}
            disabled={filteredItems.length === 0}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
              filteredItems.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : allFilteredSelected
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            )}
          >
            {allFilteredSelected ? 'Deselect All' : 'Select All'}
          </button>
          
          {selectedItemIds.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All ({selectedItemIds.length})
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {selectedItemIds.length} of {items.length} selected
          {debouncedSearchTerm && ` · ${filteredItems.length} filtered`}
        </div>
      </div>

      {/* Items List */}
      <div className={cn('border border-gray-200 rounded-lg overflow-hidden', maxHeight)}>
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {debouncedSearchTerm ? (
              <>
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg font-medium mb-2">No items found</p>
                <p>No items match your search for "{debouncedSearchTerm}"</p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-medium mb-2">No items available</p>
                <p>There are no items to display for this property.</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-full overflow-y-auto">
            {filteredItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              
              return (
                <label
                  key={item.id}
                  className={cn(
                    "flex items-center p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50",
                    isSelected && "bg-blue-50 border-l-4 border-l-blue-500"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleItemToggle(item.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                  />
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "text-sm font-medium truncate",
                        isSelected ? "text-blue-900" : "text-gray-900"
                      )}>
                        {item.name}
                      </h3>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isSelected 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {item.public_id}
                      </span>
                    </div>
                    
                    {item.description && (
                      <p className={cn(
                        "text-sm mt-1 truncate",
                        isSelected ? "text-blue-700" : "text-gray-600"
                      )}>
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>Created {new Date(item.created_at).toLocaleDateString()}</span>
                      {item.qr_code_url && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-green-600">QR Available</span>
                        </>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 