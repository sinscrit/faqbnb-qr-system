'use client';

import { useState, useEffect } from 'react';
import { AccessRequest, EmailTemplate } from '@/types/admin';
import { generateAccessApprovalEmail, validateEmailTemplate, renderEmailHTML } from '@/lib/email-templates';

interface EmailPopupProps {
  isOpen: boolean;
  request: AccessRequest;
  onClose: () => void;
  onSend: (emailData: { template: EmailTemplate; accessCode?: string }) => void;
  accessCode?: string;
  accountName?: string;
}

/**
 * Email Composition Popup Component
 * Part of REQ-016: System Admin Back Office
 */
export default function EmailPopup({
  isOpen,
  request,
  onClose,
  onSend,
  accessCode,
  accountName
}: EmailPopupProps) {
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplate>({
    subject: '',
    body: '',
    variables: {}
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize email template when popup opens
  useEffect(() => {
    if (isOpen && request) {
      const template = generateAccessApprovalEmail(
        request,
        accessCode || 'XXXXXXXXXX',
        accountName
      );
      setEmailTemplate(template);
      setErrors([]);
    }
  }, [isOpen, request, accessCode, accountName]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubjectChange = (value: string) => {
    setEmailTemplate(prev => ({
      ...prev,
      subject: value
    }));
  };

  const handleBodyChange = (value: string) => {
    setEmailTemplate(prev => ({
      ...prev,
      body: value
    }));
  };

  const handleSend = async () => {
    // Validate template
    const validation = validateEmailTemplate(emailTemplate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      await onSend({
        template: emailTemplate,
        accessCode
      });
      onClose();
    } catch (error) {
      setErrors(['Failed to send email. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => {
    const htmlContent = renderEmailHTML(emailTemplate);
    return (
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <div className="text-sm text-gray-600 mb-2">Email Preview:</div>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Send Access Email
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Request info */}
            <div className="mt-2 text-sm text-gray-600">
              <div>To: {request.requester_email}</div>
              {request.requester_name && (
                <div>Name: {request.requester_name}</div>
              )}
              {accountName && (
                <div>Account: {accountName}</div>
              )}
              {accessCode && (
                <div>Access Code: <span className="font-mono font-medium">{accessCode}</span></div>
              )}
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following errors:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white px-6 py-4">
            {/* Mode toggle */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setPreviewMode(false)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  !previewMode 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setPreviewMode(true)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  previewMode 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Preview
              </button>
            </div>

            {previewMode ? (
              renderPreview()
            ) : (
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    id="email-subject"
                    type="text"
                    value={emailTemplate.subject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email subject..."
                  />
                </div>

                {/* Body */}
                <div>
                  <label htmlFor="email-body" className="block text-sm font-medium text-gray-700 mb-1">
                    Message Body
                  </label>
                  <textarea
                    id="email-body"
                    value={emailTemplate.body}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email message..."
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {emailTemplate.body.length} / 10,000 characters
                  </div>
                </div>

                {/* Template variables info */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="text-sm font-medium text-blue-800 mb-1">Available Variables:</div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>• Access code is automatically included</div>
                    <div>• Requester name and account info are pre-filled</div>
                    <div>• Registration links are automatically generated</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}