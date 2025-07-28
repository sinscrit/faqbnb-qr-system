'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedItems([]);
      setGeneratedQRCodes(new Map());
      setCurrentStep('select');
      setGenerationState({
        isGenerating: false,
        completed: 0,
        total: 0,
        errors: []
      });
    }
  }, [isOpen]);

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
  });

  // Handle print settings changes
  const handlePrintSettingsChange = useCallback((settings: Partial<QRPrintSettings>) => {
    setPrintSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // Generate QR codes for selected items
  const handleGenerateQRCodes = useCallback(async () => {
    if (selectedItems.length === 0) return;

    setIsGenerating(true);
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

      // Progress callback for batch generation
      const onProgress = (completed: number, total: number) => {
        setGenerationState(prev => ({
          ...prev,
          completed,
          total
        }));
      };

      const results = await generateBatchQRCodes(itemsForGeneration, onProgress, {
        width: printSettings.qrSize === 'small' ? 144 : 
               printSettings.qrSize === 'large' ? 288 : 216,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' }
      });

      setGeneratedQRCodes(results);
      setCurrentStep('preview');

    } catch (error) {
      console.error('QR code generation failed:', error);
      setGenerationState(prev => ({
        ...prev,
        errors: [{ itemId: 'batch', error: error instanceof Error ? error.message : 'Unknown error' }]
      }));
    } finally {
      setIsGenerating(false);
      setGenerationState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [selectedItems, items, printSettings]);

  // Handle modal close with cleanup
  const handleClose = useCallback(() => {
    // Clear cache when closing
    clearQRCache();
    setSelectedItems([]);
    setGeneratedQRCodes(new Map());
    setCurrentStep('select');
    onClose();
  }, [onClose]);

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
    </div>
  );
} 