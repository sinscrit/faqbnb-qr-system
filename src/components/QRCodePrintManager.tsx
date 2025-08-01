'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Item, QRPrintSettings, QRGenerationState } from '@/types';
import { ItemSelectionList } from './ItemSelectionList';
import { QRCodePrintPreview } from './QRCodePrintPreview';
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
  /** Callback when user wants to close/cancel */
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
  const [lastError, setLastError] = useState<{ message: string; isRetryable: boolean } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Refs for component lifecycle management
  const isComponentMountedRef = useRef(true);
  const generationAbortControllerRef = useRef<AbortController | null>(null);
  const previousSelectedItemsRef = useRef<string[]>([]);

  // Component initialization and cleanup
  useEffect(() => {
    // Reset all state when component mounts
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

    // Cleanup on unmount
    return () => {
      if (generationAbortControllerRef.current) {
        generationAbortControllerRef.current.abort();
        generationAbortControllerRef.current = null;
      }
      setIsGenerating(false);
      setShowConfirmDialog(false);
      setPendingAction(null);
      clearQRCache();
    };
  }, []);

  // BUG FIX: Enhanced state synchronization for selected items
  useEffect(() => {
    // Sync selected items with available items (remove invalid selections)
    const currentSelected = selectedItems.filter(id => 
      items.some(item => item.publicId === id)
    );
    
    if (currentSelected.length !== selectedItems.length) {
      setSelectedItems(currentSelected);
    }
    
    // Track previous selections for change detection
    if (JSON.stringify(currentSelected) !== JSON.stringify(previousSelectedItemsRef.current)) {
      console.log('Selected items changed:', {
        previous: previousSelectedItemsRef.current.length,
        current: currentSelected.length,
        total: items.length
      });
      previousSelectedItemsRef.current = currentSelected;
    }
  }, [selectedItems, items]);

  // Handle item selection changes
  const handleItemSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedItems(selectedIds);
  }, []);

  // Handle select all/none functionality
  const handleSelectAll = useCallback(() => {
    const allIds = items.map(item => item.publicId);
    setSelectedItems(allIds);
  }, [items]);

  const handleSelectNone = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Handle close with proper cleanup
  const handleClose = useCallback(() => {
    // Abort any ongoing generation
    if (generationAbortControllerRef.current) {
      generationAbortControllerRef.current.abort();
      generationAbortControllerRef.current = null;
    }
    
    // Clear any ongoing timeout operations
    setIsGenerating(false);
    setShowConfirmDialog(false);
    setPendingAction(null);
    
    // Clear QR cache and state
    clearQRCache();
    setGeneratedQRCodes(new Map());
    
    // Call parent close handler
    onClose();
  }, [onClose]);

  // Handle step navigation
  const handleNextStep = useCallback(() => {
    if (currentStep === 'select' && selectedItems.length > 0) {
      setCurrentStep('configure');
    } else if (currentStep === 'configure') {
      // Start QR generation
      performQRGeneration();
    }
  }, [currentStep, selectedItems.length]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep === 'configure') {
      setCurrentStep('select');
    } else if (currentStep === 'preview') {
      setCurrentStep('configure');
    }
  }, [currentStep]);

  // QR Code generation logic
  const performQRGeneration = useCallback(async () => {
    if (selectedItems.length === 0) return;

    setIsGenerating(true);
    setLastError(null);
    setSuccessMessage(null);
    
    const abortController = new AbortController();
    generationAbortControllerRef.current = abortController;

    try {
      console.log('🚀 Processing', selectedItems.length, 'QR codes in batches of 5 (Browser: Desktop)');
      
      const selectedItemsData = items.filter(item => selectedItems.includes(item.publicId));
      
      const results = await generateBatchQRCodes(
        selectedItemsData.map(item => ({
          id: item.id,
          url: `${window.location.origin}/item/${item.publicId}`
        })),
        (completed: number, total: number) => {
          if (isComponentMountedRef.current) {
            setGenerationState(prev => ({
              ...prev,
              completed,
              total,
              isGenerating: true
            }));
          }
        },
        {
          signal: abortController.signal
        }
      );

      if (isComponentMountedRef.current && !abortController.signal.aborted) {
        console.log('✅ Generated', results.size, 'QR codes successfully');
        setGeneratedQRCodes(results);
        setGenerationState(prev => ({
          ...prev,
          isGenerating: false,
          errors: []
        }));
        
        // Transition to preview step
        console.log('🔄 REQ-012 FIX: Transitioning to preview step with', results.size, 'QR codes');
        setTimeout(() => {
          if (isComponentMountedRef.current) {
            setCurrentStep('preview');
          }
        }, 100);
        
        setSuccessMessage(`Successfully generated ${results.size} QR codes!`);
      }
    } catch (error: any) {
      if (isComponentMountedRef.current && !abortController.signal.aborted) {
        console.error('QR generation error:', error);
        const isRetryable = !error.message?.includes('aborted');
        setLastError({
          message: error.message || 'Failed to generate QR codes',
          isRetryable
        });
      }
    } finally {
      if (isComponentMountedRef.current) {
        setIsGenerating(false);
        generationAbortControllerRef.current = null;
      }
    }
  }, [selectedItems, items]);

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'select', label: 'Select Items', icon: '📋' },
      { key: 'configure', label: 'Configure Print', icon: '⚙️' },
      { key: 'preview', label: 'Preview & Print', icon: '🖨️' }
    ];

    return (
      <div className="flex items-center justify-between max-w-md mx-auto mb-6">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                isActive 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : isCompleted
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
              }`}>
                <span className="text-sm font-medium">
                  {isCompleted ? '✓' : step.icon}
                </span>
              </div>
              <div className="ml-2">
                <p className={`text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <ItemSelectionList
            items={items}
            selectedItemIds={selectedItems}
            onSelectionChange={handleItemSelectionChange}
            isLoading={isLoadingItems}
          />
        );

      case 'configure':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Configure Print Settings</h3>
              <p className="text-gray-600">Customize how your QR codes will be printed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">QR Code Size</label>
                <select
                  value={printSettings.qrSize}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, qrSize: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="small">Small (1")</option>
                  <option value="medium">Medium (1.5")</option>
                  <option value="large">Large (2")</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items per Row</label>
                <select
                  value={printSettings.itemsPerRow}
                  onChange={(e) => setPrintSettings(prev => ({ 
                    ...prev, 
                    itemsPerRow: parseInt(e.target.value) as 2 | 3 | 4 | 6 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value={2}>2 per row</option>
                  <option value={3}>3 per row</option>
                  <option value={4}>4 per row</option>
                  <option value={6}>6 per row</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={printSettings.showLabels}
                    onChange={(e) => setPrintSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show item labels</span>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Print Summary</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• {selectedItems.length} items selected</p>
                <p>• {printSettings.qrSize} QR codes ({printSettings.qrSize === 'small' ? '1"' : printSettings.qrSize === 'medium' ? '1.5"' : '2"'})</p>
                <p>• {printSettings.itemsPerRow} items per row</p>
                <p>• Labels {printSettings.showLabels ? 'enabled' : 'disabled'}</p>
              </div>
            </div>
          </div>
        );

      case 'preview':
        console.log('🖨️ REQ-012 DEBUG: Preview step rendering with:', {
          generatedQRCodesSize: generatedQRCodes.size,
          isGenerating,
          selectedItemsLength: selectedItems.length
        });

        if (generatedQRCodes.size === 0) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-500">No QR codes generated yet</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">QR Codes Generated Successfully!</h3>
              <p className="text-gray-600">Your QR codes are ready to print ({generatedQRCodes.size} codes ready)</p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">QR Code Preview</h4>
                <p className="text-sm text-gray-600">{generatedQRCodes.size} QR codes • {printSettings.itemsPerRow} per row • Labels shown</p>
              </div>

              <QRCodePrintPreview
                qrCodes={generatedQRCodes}
                items={items}
                printSettings={printSettings}
                isGenerating={isGenerating}
              />
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Generation Complete</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>• {generatedQRCodes.size} QR codes generated successfully</p>
                <p>• Ready for printing with {printSettings.itemsPerRow} items per row</p>
              </div>
            </div>

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

  return (
    <div className={cn("w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg", className)}>
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
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

      {/* Notification area */}
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
                <p className="text-sm font-medium text-red-800">{lastError.message}</p>
              </div>
              {lastError.isRetryable && (
                <button
                  onClick={performQRGeneration}
                  className="ml-3 px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              )}
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
  );
} 