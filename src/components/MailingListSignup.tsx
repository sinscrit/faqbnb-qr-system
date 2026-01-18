'use client';

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface MailingListSignupProps {
  className?: string;
  placeholder?: string;
  buttonText?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'hero';
  onSuccess?: (email: string) => void;
  onError?: (error: string) => void;
}

interface SubscriptionState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  email?: string;
}

export default function MailingListSignup({
  className = '',
  placeholder = 'Enter your email address',
  buttonText = 'Get Notified',
  title = 'Stay Updated',
  description = 'Be the first to know when FAQBNB opens to the public.',
  variant = 'default',
  onSuccess,
  onError,
}: MailingListSignupProps) {
  const [email, setEmail] = useState('');
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    status: 'idle',
    message: '',
  });

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset state
    setSubscriptionState({ status: 'idle', message: '' });

    // Validate email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setSubscriptionState({
        status: 'error',
        message: 'Please enter your email address.',
      });
      onError?.('Please enter your email address.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setSubscriptionState({
        status: 'error',
        message: 'Please enter a valid email address.',
      });
      onError?.('Please enter a valid email address.');
      return;
    }

    // Start loading
    setSubscriptionState({ status: 'loading', message: 'Subscribing...' });

    try {
      console.log('Submitting mailing list subscription for:', trimmedEmail);

      const response = await fetch('/api/mailing-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Subscription successful:', data);
        setSubscriptionState({
          status: 'success',
          message: data.message || 'Thank you for subscribing!',
          email: trimmedEmail,
        });
        setEmail(''); // Clear the form
        onSuccess?.(trimmedEmail);
      } else {
        console.error('Subscription failed:', data);
        const errorMessage = data.error || 'Unable to subscribe. Please try again.';
        setSubscriptionState({
          status: 'error',
          message: errorMessage,
        });
        onError?.(errorMessage);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      setSubscriptionState({
        status: 'error',
        message: errorMessage,
      });
      onError?.(errorMessage);
    }
  };

  // Styling variants
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'bg-white p-4 rounded-lg border border-gray-200',
          title: 'text-lg font-semibold text-gray-900',
          description: 'text-sm text-gray-600 mt-1',
          form: 'mt-3',
          input: 'text-sm',
          button: 'text-sm px-4 py-2',
        };
      case 'hero':
        return {
          container: 'bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-xl text-white',
          title: 'text-2xl font-bold text-white',
          description: 'text-blue-100 mt-2',
          form: 'mt-6',
          input: 'text-base',
          button: 'text-base px-6 py-3',
        };
      default:
        return {
          container: 'bg-gray-50 p-6 rounded-lg',
          title: 'text-xl font-semibold text-gray-900',
          description: 'text-gray-600 mt-2',
          form: 'mt-4',
          input: 'text-base',
          button: 'text-base px-5 py-2.5',
        };
    }
  };

  const styles = getVariantStyles();

  // Success state
  if (subscriptionState.status === 'success') {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className="text-center">
          <CheckCircle className={`w-12 h-12 mx-auto mb-4 ${variant === 'hero' ? 'text-green-200' : 'text-green-500'}`} />
          <h3 className={styles.title}>Successfully Subscribed!</h3>
          <p className={styles.description}>
            {subscriptionState.message}
          </p>
          {subscriptionState.email && (
            <p className={`text-xs mt-2 ${variant === 'hero' ? 'text-blue-200' : 'text-gray-500'}`}>
              Confirmation sent to: {subscriptionState.email}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className={styles.title}>{title}</h3>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Email Input */}
          <div className="flex-1">
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                variant === 'hero' ? 'text-blue-200' : 'text-gray-400'
              }`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                disabled={subscriptionState.status === 'loading'}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${styles.input} ${
                  variant === 'hero' 
                    ? 'bg-white/90 border-white/20 text-gray-900 placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } ${
                  subscriptionState.status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  subscriptionState.status === 'error' ? 'border-red-300 bg-red-50' : ''
                }`}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={subscriptionState.status === 'loading' || !email.trim()}
            className={`flex items-center justify-center gap-2 ${styles.button} ${
              variant === 'hero'
                ? 'bg-white text-blue-600 hover:bg-blue-50'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {subscriptionState.status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                {buttonText}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {subscriptionState.status === 'error' && (
          <div className="mt-3 flex items-start gap-2">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              variant === 'hero' ? 'text-red-200' : 'text-red-500'
            }`} />
            <p className={`text-sm ${
              variant === 'hero' ? 'text-red-200' : 'text-red-600'
            }`}>
              {subscriptionState.message}
            </p>
          </div>
        )}

        {/* Privacy Note */}
        <p className={`text-xs mt-3 ${
          variant === 'hero' ? 'text-blue-200' : 'text-gray-500'
        } text-center`}>
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
} 