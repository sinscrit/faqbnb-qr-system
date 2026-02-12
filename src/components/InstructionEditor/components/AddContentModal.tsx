'use client';

/**
 * AddContentModal Component
 *
 * Modal for adding new content pieces (text, URL, file uploads).
 *
 * @module InstructionEditor/components/AddContentModal
 * @lastModified 2026-01-22 (REQ-E02-071 - L10N)
 */

import { useState, useCallback } from 'react';
import { X, Video, Camera, FileText, Upload, Link } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { ContentPieceState } from '../InstructionEditor.types';

export interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (content: ContentPieceState) => void;
  currentContentCount: number;
}

type ContentTypeSelection = 'text' | 'url' | 'file' | 'photo-capture' | 'video-capture' | null;
type StepType = 'select' | 'create';

/**
 * AddContentModal provides a simple interface for adding new content pieces
 * Offers type selection (Text, URL, File upload) and basic input fields
 */
export function AddContentModal({
  isOpen,
  onClose,
  onAddContent,
  currentContentCount,
}: AddContentModalProps) {
  const tContent = useTranslations('content.addModal');
  const tCommon = useTranslations('common');
  const [selectedType, setSelectedType] = useState<ContentTypeSelection>(null);
  const [step, setStep] = useState<StepType>('select');

  // Form state
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setSelectedType(null);
    setStep('select');
    setTextTitle('');
    setTextContent('');
    setUrlValue('');
    setUrlTitle('');
    setSelectedFile(null);
    onClose();
  }, [onClose]);

  // Handle type selection
  const handleSelectType = useCallback((type: ContentTypeSelection) => {
    setSelectedType(type);
    setStep('create');
  }, []);

  // Handle back to selection
  const handleBack = useCallback(() => {
    setStep('select');
    setSelectedType(null);
  }, []);

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  // Determine file type from file
  // REQ-262: Added debug logging to trace type detection
  const getFileType = (file: File): 'video' | 'photo' | 'pdf' => {
    let result: 'video' | 'photo' | 'pdf';
    if (file.type.startsWith('video/')) {
      result = 'video';
    } else if (file.type.startsWith('image/')) {
      result = 'photo';
    } else if (file.type === 'application/pdf') {
      result = 'pdf';
    } else {
      // Default to photo for other image types
      result = 'photo';
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('[REQ-262] getFileType:', file.type, '->', result);
    }
    return result;
  };

  // Handle content submission
  // REQ-262: Added debug logging to trace content creation
  const handleSubmit = useCallback(() => {
    if (selectedType === 'text' && textContent.trim()) {
      const newContent: ContentPieceState = {
        id: crypto.randomUUID(),
        type: 'text',
        title: textTitle.trim() || 'Text Content',
        url: `data:text/plain;base64,${btoa(textContent)}`, // Encode text as data URL
        thumbnailUrl: null,
        displayOrder: currentContentCount,
        isNew: true,
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('[REQ-262] AddContentModal: Creating text content with type:', newContent.type);
      }
      onAddContent(newContent);
      handleClose();
    } else if (selectedType === 'url' && urlValue.trim()) {
      const newContent: ContentPieceState = {
        id: crypto.randomUUID(),
        type: 'url',
        title: urlTitle.trim() || 'Link',
        url: urlValue.trim(),
        thumbnailUrl: null,
        displayOrder: currentContentCount,
        isNew: true,
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('[REQ-262] AddContentModal: Creating url content with type:', newContent.type);
      }
      onAddContent(newContent);
      handleClose();
    } else if (selectedType === 'file' && selectedFile) {
      const contentType = getFileType(selectedFile);
      const newContent: ContentPieceState = {
        id: crypto.randomUUID(),
        type: contentType,
        title: selectedFile.name,
        url: '', // Will be filled after upload
        thumbnailUrl: null,
        displayOrder: currentContentCount,
        isNew: true,
        file: selectedFile,
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('[REQ-262] AddContentModal: Creating file content with type:', newContent.type);
      }
      onAddContent(newContent);
      handleClose();
    } else if ((selectedType === 'photo-capture' || selectedType === 'video-capture') && selectedFile) {
      const contentType = selectedType === 'photo-capture' ? 'photo' : 'video';
      const newContent: ContentPieceState = {
        id: crypto.randomUUID(),
        type: contentType,
        title: selectedFile.name,
        url: '', // Will be filled after upload
        thumbnailUrl: null,
        displayOrder: currentContentCount,
        isNew: true,
        file: selectedFile,
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('[REQ-262] AddContentModal: Creating', selectedType, 'content with type:', newContent.type);
      }
      onAddContent(newContent);
      handleClose();
    }
  }, [selectedType, textContent, textTitle, urlValue, urlTitle, selectedFile, currentContentCount, onAddContent, handleClose]);

  // Check if form is valid
  const isFormValid = () => {
    if (selectedType === 'text') return textContent.trim().length > 0;
    if (selectedType === 'url') return urlValue.trim().length > 0;
    if (selectedType === 'file') return selectedFile !== null;
    if (selectedType === 'photo-capture') return selectedFile !== null;
    if (selectedType === 'video-capture') return selectedFile !== null;
    return false;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-content-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="add-content-modal-title" className="text-xl font-semibold text-[#222222]">
            {step === 'select' ? tContent('selectTitle') : tContent('createTitle')}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={tCommon('dialog.closeModal')}
          >
            <X className="w-5 h-5 text-[#717171]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Write Text */}
              <button
                type="button"
                onClick={() => handleSelectType('text')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#222222] hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-8 h-8 text-[#222222]" />
                <span className="font-medium text-[#222222]">{tContent('types.text')}</span>
              </button>

              {/* Add Link */}
              <button
                type="button"
                onClick={() => handleSelectType('url')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#222222] hover:bg-gray-50 transition-colors"
              >
                <Link className="w-8 h-8 text-[#222222]" />
                <span className="font-medium text-[#222222]">{tContent('types.link')}</span>
              </button>

              {/* Take Photo */}
              <button
                type="button"
                onClick={() => handleSelectType('photo-capture')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#222222] hover:bg-gray-50 transition-colors"
              >
                <Camera className="w-8 h-8 text-[#222222]" />
                <span className="font-medium text-[#222222]">{tContent('types.takePhoto')}</span>
                <span className="text-sm text-[#717171]">{tContent('types.takePhotoHint')}</span>
              </button>

              {/* Record Video */}
              <button
                type="button"
                onClick={() => handleSelectType('video-capture')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#222222] hover:bg-gray-50 transition-colors"
              >
                <Video className="w-8 h-8 text-[#222222]" />
                <span className="font-medium text-[#222222]">{tContent('types.recordVideo')}</span>
                <span className="text-sm text-[#717171]">{tContent('types.recordVideoHint')}</span>
              </button>

              {/* Upload File */}
              <button
                type="button"
                onClick={() => handleSelectType('file')}
                className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#222222] hover:bg-gray-50 transition-colors col-span-2"
              >
                <Upload className="w-8 h-8 text-[#222222]" />
                <span className="font-medium text-[#222222]">{tContent('types.file')}</span>
                <span className="text-sm text-[#717171]">{tContent('types.fileHint')}</span>
              </button>
            </div>
          )}

          {step === 'create' && selectedType === 'text' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="text-title" className="block text-sm font-medium text-[#717171] mb-2">
                  {tContent('form.titleLabel')}
                </label>
                <input
                  id="text-title"
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder={tContent('form.titlePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222]"
                  maxLength={100}
                />
              </div>
              <div>
                <label htmlFor="text-content" className="block text-sm font-medium text-[#717171] mb-2">
                  {tContent('form.textLabel')}
                </label>
                <textarea
                  id="text-content"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder={tContent('form.textPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222] min-h-[200px] resize-y"
                  maxLength={5000}
                />
                <p className="text-sm text-[#717171] mt-1">
                  {tContent('form.charCount', { count: textContent.length, max: 5000 })}
                </p>
              </div>
            </div>
          )}

          {step === 'create' && selectedType === 'url' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="url-value" className="block text-sm font-medium text-[#717171] mb-2">
                  {tContent('form.urlLabel')}
                </label>
                <input
                  id="url-value"
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder={tContent('form.urlPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222]"
                />
              </div>
              <div>
                <label htmlFor="url-title" className="block text-sm font-medium text-[#717171] mb-2">
                  {tContent('form.linkTitleLabel')}
                </label>
                <input
                  id="url-title"
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder={tContent('form.linkTitlePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222]"
                  maxLength={100}
                />
              </div>
            </div>
          )}

          {step === 'create' && selectedType === 'file' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-[#717171] mb-2">
                  {tContent('form.fileLabel')}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept="video/*,image/*,.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-[#222222] hover:file:bg-gray-200"
                />
                {selectedFile && (
                  <p className="text-sm text-[#717171] mt-2">
                    {tContent('form.selectedFile', { fileName: selectedFile.name, fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) })}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 'create' && selectedType === 'photo-capture' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="photo-capture" className="block text-sm font-medium text-[#717171] mb-2">
                  {tContent('form.photoLabel')}
                </label>
                <input
                  id="photo-capture"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-[#222222] hover:file:bg-gray-200"
                />
                {selectedFile && (
                  <p className="text-sm text-[#717171] mt-2">
                    {tContent('form.selectedFile', { fileName: selectedFile.name, fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) })}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 'create' && selectedType === 'video-capture' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="video-capture" className="block text-sm font-medium text-[#717171] mb-2">
                  {tContent('form.videoLabel')}
                </label>
                <input
                  id="video-capture"
                  type="file"
                  onChange={handleFileChange}
                  accept="video/*"
                  capture="environment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#222222] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-[#222222] hover:file:bg-gray-200"
                />
                {selectedFile && (
                  <p className="text-sm text-[#717171] mt-2">
                    {tContent('form.selectedFile', { fileName: selectedFile.name, fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
          {step === 'create' && (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-lg text-[#222222] hover:bg-gray-50 transition-colors"
            >
              {tContent('actions.back')}
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-[#222222] hover:bg-gray-50 transition-colors"
          >
            {tContent('actions.cancel')}
          </button>
          {step === 'create' && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={cn(
                'px-4 py-2 rounded-lg transition-colors',
                isFormValid()
                  ? 'bg-[#FF385C] text-white hover:bg-[#E31C5F]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              {tContent('actions.add')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
