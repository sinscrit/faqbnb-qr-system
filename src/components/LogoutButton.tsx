'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LogoutButtonProps {
  variant?: 'button' | 'text' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  showConfirmation?: boolean;
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
  className?: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmationModal({ isOpen, onConfirm, onCancel, loading }: ConfirmationModalProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('confirmLogout')}</h3>
        <p className="text-gray-600 mb-6">{t('confirmSignOutMessage')}</p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t('signOut')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LogoutButton({
  variant = 'button',
  size = 'md',
  showConfirmation = false,
  onLogoutStart,
  onLogoutComplete,
  className = '',
}: LogoutButtonProps) {
  const t = useTranslations('auth');
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Don't render if no user
  if (!user) return null;

  const handleLogout = async () => {
    try {
      setLoading(true);
      onLogoutStart?.();

      console.log('Initiating logout...');
      await signOut();
      
      console.log('Logout successful, redirecting to login');
      onLogoutComplete?.();
      
      // Redirect to login page
      router.push('/login?message=logged_out');
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (showConfirmation) {
      setShowModal(true);
    } else {
      handleLogout();
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    handleLogout();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Icon size
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 ${className}`}
          title={t('signOut')}
        >
          {loading ? (
            <Loader2 className={`${iconSizes[size]} animate-spin`} />
          ) : (
            <LogOut className={iconSizes[size]} />
          )}
        </button>
        <ConfirmationModal
          isOpen={showModal}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={loading}
        />
      </>
    );
  }

  if (variant === 'text') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center ${className}`}
        >
          {loading ? (
            <Loader2 className={`${iconSizes[size]} animate-spin mr-1`} />
          ) : (
            <LogOut className={`${iconSizes[size]} mr-1`} />
          )}
          {t('signOut')}
        </button>
        <ConfirmationModal
          isOpen={showModal}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={loading}
        />
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`${sizeStyles[size]} bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center ${className}`}
      >
        {loading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin mr-2`} />
        ) : (
          <LogOut className={`${iconSizes[size]} mr-2`} />
        )}
        {t('signOut')}
      </button>
      <ConfirmationModal
        isOpen={showModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        loading={loading}
      />
    </>
  );
} 