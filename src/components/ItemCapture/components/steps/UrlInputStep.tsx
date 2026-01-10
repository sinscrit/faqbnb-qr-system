'use client';

/**
 * UrlInputStep Component
 *
 * Wizard step for adding URL/Link items. Allows users to paste a URL,
 * fetches metadata preview via API, and adds to item state.
 *
 * @module ItemCapture/components/steps/UrlInputStep
 * @see docs/REQ-113-error-handling-edge-cases-overview.md
 * @lastModified 2026-01-05 (REQ-113)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, Loader2, ExternalLink, AlertCircle, Check, ArrowLeft, Plus, X, WifiOff, RefreshCw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UrlItem, UrlMetadata, ItemCaptureState, WizardStep } from '../../ItemCapture.types';
import { validateUrlFormat, normalizeUrl, isYouTubeUrl } from '../../utils/urlHelpers';
import { generateUUID } from '../../utils/generateUUID';

export interface UrlInputStepProps {
  state: ItemCaptureState;
  addUrl: (urlItem: UrlItem) => void;
  goToStep: (step: WizardStep) => void;
  prevStep: () => void;
  config?: { debug?: boolean };
}

export default function UrlInputStep({
  state,
  addUrl,
  goToStep,
  prevStep,
  config,
}: UrlInputStepProps) {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<UrlMetadata | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [proceedWithoutPreview, setProceedWithoutPreview] = useState(false);
  const lastUrlRef = useRef<string>('');

  const handleFetchMetadata = useCallback(async () => {
    // Validate URL format
    const validation = validateUrlFormat(urlInput.trim());
    if (!validation.isValid) {
      setError(validation.error || 'Invalid URL');
      setIsNetworkError(false);
      return;
    }

    // Normalize URL (add https:// if needed)
    const normalizedUrl = normalizeUrl(urlInput.trim());
    lastUrlRef.current = normalizedUrl;

    setIsLoading(true);
    setError(null);
    setPreview(null);
    setIsNetworkError(false);
    setProceedWithoutPreview(false);

    try {
      const response = await fetch('/api/url-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch URL metadata');
      }

      if (data.success && data.data) {
        setPreview(data.data);
        setIsNetworkError(false);
      } else {
        throw new Error(data.error || 'No metadata returned');
      }
    } catch (err) {
      // Detect network errors
      const isNetwork = !navigator.onLine ||
        (err instanceof TypeError && err.message === 'Failed to fetch') ||
        (err instanceof Error && err.message.includes('network'));

      setIsNetworkError(isNetwork);
      setError(isNetwork
        ? 'Preview unavailable - Network issue'
        : (err instanceof Error ? err.message : 'Failed to fetch URL metadata')
      );
    } finally {
      setIsLoading(false);
    }
  }, [urlInput]);

  const handleAddUrl = useCallback(() => {
    if (!preview && !proceedWithoutPreview) return;

    // Create metadata - use preview if available, otherwise create minimal metadata
    const metadata: UrlMetadata = preview || {
      url: lastUrlRef.current,
      title: '',
      domain: '',
      linkType: 'generic',
    };

    const urlItem: UrlItem = {
      id: generateUUID(),
      metadata,
      order: state.urlItems.length,
      addedAt: new Date(),
    };

    addUrl(urlItem);
    goToStep('add-more');
  }, [preview, proceedWithoutPreview, state.urlItems.length, addUrl, goToStep]);

  const handleProceedWithoutPreview = useCallback(() => {
    setProceedWithoutPreview(true);
    setIsNetworkError(false);
    setError(null);
  }, []);

  const handleRetry = useCallback(() => {
    if (lastUrlRef.current) {
      setUrlInput(lastUrlRef.current);
      handleFetchMetadata();
    }
  }, [handleFetchMetadata]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrlInput(text);
    } catch (err) {
      setError('Unable to read clipboard. Please paste manually.');
    }
  }, []);

  const handleClear = useCallback(() => {
    setUrlInput('');
    setPreview(null);
    setError(null);
    setIsNetworkError(false);
    setProceedWithoutPreview(false);
    lastUrlRef.current = '';
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && urlInput.trim() && !isLoading && !preview) {
      e.preventDefault();
      handleFetchMetadata();
    }
  }, [urlInput, isLoading, preview, handleFetchMetadata]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Link className="w-6 h-6 text-cyan-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Add Link</h2>
        </div>
        <p className="text-gray-600 ml-15">
          Add a URL to your item. We'll fetch the title and preview automatically.
        </p>
      </div>

      {/* URL Input Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
          URL
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              id="url-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://www.youtube.com/watch?v=..."
              className={cn(
                "w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500",
                error ? "border-red-300" : "border-gray-300"
              )}
              disabled={isLoading || !!preview}
              aria-describedby={error ? "url-error" : undefined}
            />
            {urlInput && !preview && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                aria-label="Clear URL"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {!preview && (
            <button
              type="button"
              onClick={handlePaste}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
              disabled={isLoading}
            >
              Paste
            </button>
          )}
        </div>

        {/* Network Error Indicator */}
        {error && isNetworkError && !proceedWithoutPreview && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
                <WifiOff className="w-5 h-5 text-amber-600" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-amber-800">
                  Preview unavailable
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Unable to load preview due to network connectivity issues.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleRetry}
                disabled={isLoading}
                className={cn(
                  'inline-flex items-center justify-center gap-2',
                  'px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-0',
                  'text-sm font-medium rounded-lg',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
                  isLoading
                    ? 'bg-amber-200 text-amber-600 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                )}
              >
                <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} aria-hidden="true" />
                {isLoading ? 'Retrying...' : 'Try Again'}
              </button>
              <button
                type="button"
                onClick={handleProceedWithoutPreview}
                disabled={isLoading}
                className={cn(
                  'inline-flex items-center justify-center gap-2',
                  'px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-0',
                  'text-sm font-medium rounded-lg',
                  'border border-amber-300',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500',
                  isLoading
                    ? 'bg-amber-50 text-amber-400 cursor-not-allowed'
                    : 'bg-white text-amber-700 hover:bg-amber-50'
                )}
              >
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                Proceed Without Preview
              </button>
            </div>
          </div>
        )}

        {/* Standard Error Message (non-network errors) */}
        {error && !isNetworkError && !proceedWithoutPreview && (
          <div id="url-error" className="mt-2 flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Fetch Button */}
        {!preview && !proceedWithoutPreview && urlInput && !isNetworkError && (
          <div className="mt-4">
            <button
              type="button"
              onClick={handleFetchMetadata}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Fetching preview...</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" aria-hidden="true" />
                  <span>Fetch Preview</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Proceed Without Preview Card */}
      {proceedWithoutPreview && !preview && lastUrlRef.current && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-2 mb-4 text-amber-600">
            <WifiOff className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">Proceeding without preview</span>
          </div>

          <div className="flex gap-4">
            {/* Placeholder Thumbnail */}
            <div className="flex-shrink-0">
              <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <Link className="w-8 h-8 text-gray-400" aria-hidden="true" />
              </div>
            </div>

            {/* URL Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 mb-2">
                The link will be added without a preview. You can edit the title later.
              </p>
              <span className="text-xs text-gray-500 truncate block">
                {lastUrlRef.current}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleAddUrl}
              className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              <span>Add Link Anyway</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview Card */}
      {preview && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-2 mb-4 text-green-600">
            <Check className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">Preview loaded</span>
          </div>

          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              {preview.thumbnailUrl ? (
                <div className="relative w-32 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={preview.thumbnailUrl}
                    alt={preview.title}
                    className="w-full h-full object-cover"
                  />
                  {preview.linkType === 'youtube' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Link className="w-8 h-8 text-gray-400" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                {preview.title}
              </h3>
              {preview.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {preview.description}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full",
                  preview.linkType === 'youtube' ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                )}>
                  {preview.faviconUrl && (
                    <img src={preview.faviconUrl} alt="" className="w-3 h-3" />
                  )}
                  {preview.domain}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {preview.url}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleAddUrl}
              className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              <span>Add Link</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Try Another
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="mt-6">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {config?.debug && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs font-mono">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>URL Items: {state.urlItems.length}</div>
          <div>Input: {urlInput}</div>
          <div>Loading: {isLoading.toString()}</div>
          <div>Has Preview: {(!!preview).toString()}</div>
          {preview && <div>Link Type: {preview.linkType}</div>}
        </div>
      )}
    </div>
  );
}

// Named export for testing
export { UrlInputStep };
