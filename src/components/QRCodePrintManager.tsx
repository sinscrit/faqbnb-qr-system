'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Item, QRPrintSettings, QRGenerationState } from '@/types';
import { ItemSelectionList } from './ItemSelectionList';
import { generateBatchQRCodes, clearQRCache } from '@/lib/qrcode-utils';
import { cn } from '@/lib/utils';

/**
 * Props for the QRCodePrintManager component
 */
interface QRCodePrintManagerProps {
  /** Property ID to filter items */
  propertyId: string;
  /** Array of items for the property */
  items?: Item[];
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Optional loading state for external item fetching */
  isLoadingItems?: boolean;
  /** Optional class name for styling */
  className?: string;
}

/**
 * QRCodePrintManager component - Core logic for QR code printing workflow
 */
export function QRCodePrintManager({
  propertyId,
  items = [],
  isOpen,
  onClose,
  isLoadingItems = false,
  className
}: QRCodePrintManagerProps) {
  // State management for QR printing workflow
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQRCodes, setGeneratedQRCodes] = useState<Map<string, string>>(new Map());
  const [printSettings, setPrintSettings] = useState<QRPrintSettings>({
    qrSize: 'medium',
    itemsPerRow: 3,
    showLabels: true
  });
  const [generationState, setGenerationState] = useState<QRGenerationState>({
    isGenerating: false,
    completed: 0,
    total: 0,
    errors: []
  });
  const [currentStep, setCurrentStep] = useState<'select' | 'configure' | 'preview'>('select');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'generate' | 'print' | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryableErrors, setRetryableErrors] = useState<Map<string, number>>(new Map());
  
  // Refs for tracking component state
  const isComponentMountedRef = useRef(true);
  const generationAbortControllerRef = useRef<AbortController | null>(null);
  const previousSelectedItemsRef = useRef<string[]>([]);

  // BUG FIX: Enhanced modal state management with proper cleanup
  useEffect(() => {
    if (isOpen) {
      // Reset all state when modal opens
      setSelectedItems([]);
      setGeneratedQRCodes(new Map());
      setCurrentStep('select');
      setGenerationState({
        isGenerating: false,
        completed: 0,
        total: 0,
        errors: []
      });
      setIsGenerating(false);
      setShowConfirmDialog(false);
      setPendingAction(null);
      setLastError(null);
      // Clear any previous generation operation
      if (generationAbortControllerRef.current) {
        generationAbortControllerRef.current.abort();
        generationAbortControllerRef.current = null;
      }
    } else {
      // BUG FIX: Proper cleanup when modal closes
      if (generationAbortControllerRef.current) {
        generationAbortControllerRef.current.abort();
        generationAbortControllerRef.current = null;
      }
      setIsGenerating(false);
      setShowConfirmDialog(false);
      setPendingAction(null);
      clearQRCache();
    }
  }, [isOpen]);

  // BUG FIX: Enhanced state synchronization for selected items
  useEffect(() => {
    // Sync selected items with available items (remove invalid selections)
    if (items.length > 0) {
      const validItemIds = new Set(items.map(item => item.id));
      setSelectedItems(prev => {
        const filtered = prev.filter(id => validItemIds.has(id));
        // Only update if there's a change to prevent unnecessary re-renders
        if (filtered.length !== prev.length) {
          return filtered;
        }
        return prev;
      });
    }
  }, [items]);

  // BUG FIX: Track previous selected items for change detection
  useEffect(() => {
    const previousSelected = previousSelectedItemsRef.current;
    const currentSelected = selectedItems;
    
    // If selection changed significantly, clear error state
    if (previousSelected.length !== currentSelected.length || 
        !previousSelected.every(id => currentSelected.includes(id))) {
      setLastError(null);
    }
    
    previousSelectedItemsRef.current = currentSelected;
  }, [selectedItems]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;
      if (generationAbortControllerRef.current) {
        generationAbortControllerRef.current.abort();
      }
      clearQRCache();
    };
  }, []);

  // Handle individual item selection changes
  const handleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  // Handle bulk selection - select all items
  const handleSelectAll = useCallback(() => {
    setSelectedItems(items.map(item => item.id));
  }, [items]);

  // Handle bulk deselection - clear all selections
  const handleDeselectAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // BUG FIX: Enhanced print settings change handler with persistence
  const handlePrintSettingsChange = useCallback((settings: Partial<QRPrintSettings>) => {
    setPrintSettings(prev => {
      const newSettings = { ...prev, ...settings };
      // Persist settings in sessionStorage for user convenience
      try {
        sessionStorage.setItem('qr-print-settings', JSON.stringify(newSettings));
      } catch (error) {
        console.warn('Failed to persist print settings:', error);
      }
      return newSettings;
    });
  }, []);

  // BUG FIX: Load persisted print settings on component mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('qr-print-settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setPrintSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.warn('Failed to load persisted print settings:', error);
    }
  }, []);

  // Check if confirmation is needed for large print jobs
  const needsConfirmation = useCallback((action: 'generate' | 'print') => {
    return selectedItems.length > 20;
  }, [selectedItems.length]);

  // Handle confirmation dialog
  const handleConfirmLargeJob = useCallback((action: 'generate' | 'print') => {
    if (needsConfirmation(action)) {
      setPendingAction(action);
      setShowConfirmDialog(true);
      return true; // Confirmation needed
    }
    return false; // No confirmation needed
  }, [needsConfirmation]);

  // BUG FIX: Enhanced progress tracking with proper reset
  const resetGenerationState = useCallback(() => {
    setGenerationState({
      isGenerating: false,
      completed: 0,
      total: 0,
      errors: []
    });
    setIsGenerating(false);
  }, []);

  // BUG FIX: Enhanced QR generation with better error handling and progress tracking
  const performQRGeneration = useCallback(async () => {
    if (selectedItems.length === 0) {
      setLastError('No items selected for QR generation');
      return;
    }

    // Create new abort controller for this generation
    if (generationAbortControllerRef.current) {
      generationAbortControllerRef.current.abort();
    }
    generationAbortControllerRef.current = new AbortController();

    setIsGenerating(true);
    setLastError(null);
    
    // BUG FIX: Reset progress state at the start of generation
    setGenerationState({
      isGenerating: true,
      completed: 0,
      total: selectedItems.length,
      errors: []
    });

    try {
      const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
      const itemsForGeneration = selectedItemsData.map(item => ({
        id: item.id,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://faqbnb.com'}/item/${item.public_id}`
      }));

      // BUG FIX: Enhanced progress callback with error tracking
      const onProgress = (completed: number, total: number) => {
        if (!isComponentMountedRef.current) return;
        
        setGenerationState(prev => ({
          ...prev,
          completed,
          total
        }));
      };

      const result = await generateBatchQRCodes(
        itemsForGeneration,
        onProgress,
        { width: 256, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } }
      );

      if (!isComponentMountedRef.current) return;

      // BUG FIX: Update QR codes Map properly to trigger UI updates
      setGeneratedQRCodes(prevMap => {
        const newMap = new Map(prevMap);
        result.forEach((dataUrl, itemId) => {
          newMap.set(itemId, dataUrl);
        });
        return newMap;
      });

      // BUG FIX: Proper completion state management
      setGenerationState(prev => ({
        ...prev,
        isGenerating: false,
        completed: selectedItems.length
      }));

      // TASK 18 BUG FIX: Success notification for better user feedback
      setSuccessMessage(`Successfully generated ${selectedItems.length} QR code${selectedItems.length > 1 ? 's' : ''}! You can now preview and print them.`);
      setLastError(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        if (isComponentMountedRef.current) {
          setSuccessMessage(null);
        }
      }, 5000);

      setCurrentStep('preview');
      
    } catch (error: any) {
      if (!isComponentMountedRef.current) return;
      
      // TASK 18 BUG FIX: Enhanced error messaging for better user experience
      let errorMessage = '';
      let isRetryable = false;
      
      if (error.name === 'AbortError') {
        errorMessage = 'QR code generation was cancelled by user';
      } else if (error.message?.toLowerCase().includes('network') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
        isRetryable = true;
      } else if (error.message?.toLowerCase().includes('timeout')) {
        errorMessage = 'QR generation timed out. This may be due to a slow connection. Please try again.';
        isRetryable = true;
      } else if (error.message?.toLowerCase().includes('canvas')) {
        errorMessage = 'QR code rendering failed. This may be a browser compatibility issue. Try refreshing the page.';
        isRetryable = false;
      } else if (error.message?.toLowerCase().includes('memory')) {
        errorMessage = 'Not enough memory to generate QR codes. Try selecting fewer items or refresh the page.';
        isRetryable = false;
      } else if (error.status === 500) {
        errorMessage = 'Server error occurred. Please try again in a few moments.';
        isRetryable = true;
      } else if (error.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
        isRetryable = true;
      } else {
        errorMessage = `QR generation failed: ${error.message || 'Unknown error occurred. Please try again.'}`;
        isRetryable = true;
      }
      
      setLastError(errorMessage);
      
      // TASK 18 BUG FIX: Track retryable errors for exponential backoff
      if (isRetryable) {
        setRetryableErrors(prev => {
          const newMap = new Map(prev);
          const currentRetries = newMap.get('batch') || 0;
          newMap.set('batch', currentRetries + 1);
          return newMap;
        });
      }
      
             setGenerationState(prev => ({
         ...prev,
         isGenerating: false,
         errors: [...(prev.errors || []), { itemId: 'batch', error: error.message || 'Generation failed' }]
       }));
    } finally {
      if (isComponentMountedRef.current) {
        setIsGenerating(false);
      }
      generationAbortControllerRef.current = null;
    }
  }, [selectedItems, items]);

  // Handle QR generation with confirmation
  const handleGenerateQRCodes = useCallback(() => {
    if (handleConfirmLargeJob('generate')) {
      return; // Waiting for confirmation
    }
    performQRGeneration();
  }, [handleConfirmLargeJob, performQRGeneration]);

  // Perform print action
  const performPrint = useCallback(() => {
    console.log('Initiating print with Ctrl+P shortcut support...');
    window.print();
  }, []);

  // Execute pending action after confirmation
  const executePendingAction = useCallback(async () => {
    setShowConfirmDialog(false);
    const action = pendingAction;
    setPendingAction(null);
    
    if (action === 'generate') {
      await performQRGeneration();
    } else if (action === 'print') {
      performPrint();
    }
  }, [pendingAction, performQRGeneration, performPrint]);

  // Cancel pending action
  const cancelPendingAction = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  }, []);

  // BUG FIX: Enhanced modal close with proper cleanup
  const handleClose = useCallback(() => {
    // Abort any ongoing generation
    if (generationAbortControllerRef.current) {
      generationAbortControllerRef.current.abort();
      generationAbortControllerRef.current = null;
    }
    
    // Clear all state
    clearQRCache();
    setSelectedItems([]);
    setGeneratedQRCodes(new Map());
    setCurrentStep('select');
    setIsGenerating(false);
    setShowConfirmDialog(false);
    setPendingAction(null);
    setLastError(null);
    resetGenerationState();
    
    onClose();
  }, [onClose, resetGenerationState]);

  // TASK 18 BUG FIX: Enhanced retry mechanism with exponential backoff
  const handleRetryGeneration = useCallback(() => {
    const retryCount = retryableErrors.get('batch') || 0;
    
    if (retryCount >= 3) {
      setLastError('Maximum retry attempts reached. Please refresh the page and try again with fewer items.');
      return;
    }
    
    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, retryCount) * 1000;
    
    setLastError(null);
    setSuccessMessage(`Retrying in ${delay / 1000} second${delay > 1000 ? 's' : ''}...`);
    resetGenerationState();
    
    setTimeout(() => {
      if (isComponentMountedRef.current) {
        setSuccessMessage(null);
        performQRGeneration();
      }
    }, delay);
  }, [retryableErrors, resetGenerationState, performQRGeneration]);

  // Handle step navigation
  const handleNextStep = useCallback(() => {
    if (currentStep === 'select' && selectedItems.length > 0) {
      setCurrentStep('configure');
    } else if (currentStep === 'configure') {
      handleGenerateQRCodes();
    }
  }, [currentStep, selectedItems.length, handleGenerateQRCodes]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep === 'configure') {
      setCurrentStep('select');
    } else if (currentStep === 'preview') {
      setCurrentStep('configure');
    }
  }, [currentStep]);

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'select', label: 'Select Items', icon: '📋' },
      { key: 'configure', label: 'Configure Print', icon: '⚙️' },
      { key: 'preview', label: 'Preview & Print', icon: '🖨️' }
    ];

    return (
      <div className="flex items-center justify-center space-x-4 mb-6">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                isActive ? "border-blue-500 bg-blue-500 text-white" :
                isCompleted ? "border-green-500 bg-green-500 text-white" :
                "border-gray-300 bg-gray-100 text-gray-500"
              )}>
                <span className="text-sm font-medium">
                  {isCompleted ? '✓' : step.icon}
                </span>
              </div>
              <span className={cn(
                "ml-2 text-sm font-medium",
                isActive ? "text-blue-600" : 
                isCompleted ? "text-green-600" : 
                "text-gray-500"
              )}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-4",
                  isCompleted ? "bg-green-500" : "bg-gray-300"
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Select Items for QR Code Printing
              </h3>
              <p className="text-gray-600">
                Choose which items you want to generate QR codes for
              </p>
            </div>
            
            <ItemSelectionList
              items={items}
              selectedItemIds={selectedItems}
              onSelectionChange={setSelectedItems}
              isLoading={isLoadingItems}
              maxHeight="max-h-80"
            />
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configure Print Settings
              </h3>
              <p className="text-gray-600">
                Customize how your QR codes will be printed
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* QR Size Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code Size
                  </label>
                  <select
                    value={printSettings.qrSize}
                    onChange={(e) => handlePrintSettingsChange({ 
                      qrSize: e.target.value as 'small' | 'medium' | 'large' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Small (1")</option>
                    <option value="medium">Medium (1.5")</option>
                    <option value="large">Large (2")</option>
                  </select>
                </div>

                {/* Items per Row Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items per Row
                  </label>
                  <select
                    value={printSettings.itemsPerRow}
                    onChange={(e) => handlePrintSettingsChange({ 
                      itemsPerRow: parseInt(e.target.value) as 2 | 3 | 4 | 6 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={2}>2 per row</option>
                    <option value={3}>3 per row</option>
                    <option value={4}>4 per row</option>
                    <option value={6}>6 per row</option>
                  </select>
                </div>

                {/* Show Labels Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Labels
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={printSettings.showLabels}
                      onChange={(e) => handlePrintSettingsChange({ 
                        showLabels: e.target.checked 
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show item labels</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Print Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• {selectedItems.length} items selected</p>
                <p>• {printSettings.qrSize} QR codes ({printSettings.qrSize === 'small' ? '1"' : printSettings.qrSize === 'large' ? '2"' : '1.5"'})</p>
                <p>• {printSettings.itemsPerRow} items per row</p>
                <p>• Labels {printSettings.showLabels ? 'enabled' : 'disabled'}</p>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                QR Codes Generated Successfully!
              </h3>
              <p className="text-gray-600">
                Your QR codes are ready to print
              </p>
            </div>

            {/* Generation Progress */}
            {generationState.isGenerating && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    Generating QR Codes...
                  </span>
                  <span className="text-sm text-blue-700">
                    {generationState.completed} / {generationState.total}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(generationState.completed / generationState.total) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Generation Results */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Generation Complete</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>• {generatedQRCodes.size} QR codes generated successfully</p>
                <p>• Ready for printing with {printSettings.itemsPerRow} items per row</p>
                {generationState.errors.length > 0 && (
                  <p className="text-red-600">• {generationState.errors.length} errors occurred</p>
                )}
              </div>
            </div>

            {/* Print Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                disabled={generatedQRCodes.size === 0}
              >
                🖨️ Print QR Codes
              </button>
              <button
                onClick={() => setCurrentStep('configure')}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                ⚙️ Adjust Settings
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="qr-print-modal" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className={cn(
          "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full",
          className
        )}>
          {/* Header */}
          <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 id="qr-print-modal" className="text-xl font-semibold text-gray-900">
                QR Code Print Manager
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close QR Print Manager"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {renderStepIndicator()}
          </div>

          {/* TASK 18 BUG FIX: Enhanced notification area for success and error feedback */}
          {(successMessage || lastError) && (
            <div className="px-6 py-3 border-b border-gray-200">
              {successMessage && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setSuccessMessage(null)}
                      className="text-green-400 hover:text-green-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {lastError && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-800">{lastError}</p>
                    {retryableErrors.has('batch') && retryableErrors.get('batch')! < 3 && (
                      <button
                        onClick={handleRetryGeneration}
                        className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors font-medium"
                      >
                        🔄 Retry ({3 - (retryableErrors.get('batch') || 0)} attempts remaining)
                      </button>
                    )}
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setLastError(null)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="bg-white px-6 py-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Property ID: {propertyId} • {items.length} total items
            </div>
            
            <div className="flex space-x-3">
              {currentStep !== 'select' && (
                <button
                  onClick={handlePreviousStep}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  disabled={isGenerating}
                >
                  ← Previous
                </button>
              )}
              
              {currentStep !== 'preview' && (
                <button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 'select' && selectedItems.length === 0) ||
                    isGenerating
                  }
                  className={cn(
                    "px-4 py-2 rounded-md font-medium transition-colors",
                    (currentStep === 'select' && selectedItems.length === 0) || isGenerating
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  {currentStep === 'select' ? 'Configure Print' : 'Generate QR Codes'} →
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Large Print Job Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Large Print Job Confirmation
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  You're about to {pendingAction === 'generate' ? 'generate QR codes for' : 'print'} <strong>{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}</strong>.
                </p>
                
                {/* TASK 18 BUG FIX: Enhanced item count details for better user feedback */}
                <div className="mb-3 p-3 bg-gray-50 rounded-md text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Selected Items:</span>
                    <span className="font-medium text-gray-900">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Total Available:</span>
                    <span className="font-medium text-gray-900">{items.length}</span>
                  </div>
                  {pendingAction === 'generate' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Time:</span>
                      <span className="font-medium text-gray-900">~{Math.ceil(selectedItems.length / 5)} minute{Math.ceil(selectedItems.length / 5) !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-500">
                  {pendingAction === 'generate' 
                    ? selectedItems.length > 10 
                      ? 'This is a large batch that may take some time to process. QR codes will be generated efficiently in smaller batches.'
                      : 'QR codes will be generated quickly and you can preview them before printing.'
                    : 'This will open your browser\'s print dialog. Make sure your printer is ready and configured correctly.'
                  }
                </p>
                
                {pendingAction === 'generate' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Performance Tip:</strong> QR codes will be generated in batches of 5 to ensure optimal performance.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelPendingAction}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={executePendingAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue with {selectedItems.length} items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 