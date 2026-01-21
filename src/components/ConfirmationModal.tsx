'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmButtonColor?: 'red' | 'blue' | 'green';
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading = false,
  confirmButtonColor = 'red'
}: ConfirmationModalProps) {
  const tCommon = useTranslations('common');

  // Use translations as fallback for default values
  const resolvedConfirmText = confirmText ?? tCommon('actions.confirm');
  const resolvedCancelText = cancelText ?? tCommon('actions.cancel');
  if (!isOpen) return null;

  const confirmButtonStyles = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {resolvedCancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-md disabled:opacity-50 flex items-center justify-center transition-colors ${confirmButtonStyles[confirmButtonColor]}`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              resolvedConfirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}