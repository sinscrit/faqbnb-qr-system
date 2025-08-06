'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AccessRequestForm {
  requester_email: string;
  requester_name: string;
  account_identifier: string; // Could be account name, ID, or property code
  message?: string;
}

/**
 * Public Access Request Page
 * Allows users to request access to accounts
 */
export default function RequestAccessPage() {
  const [form, setForm] = useState<AccessRequestForm>({
    requester_email: '',
    requester_name: '',
    account_identifier: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/public/access-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to submit access request');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600 text-4xl">✅</div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Request Submitted!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your access request has been submitted successfully. You'll receive an email notification once it's reviewed.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Request Account Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Submit a request to access a FAQBNB account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Your Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.requester_email}
                onChange={(e) => setForm(prev => ({ ...prev, requester_email: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Your Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.requester_name}
                onChange={(e) => setForm(prev => ({ ...prev, requester_name: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="John Doe"
              />
            </div>

            {/* Account Identifier */}
            <div>
              <label htmlFor="account" className="block text-sm font-medium text-gray-700">
                Account or Property Information *
              </label>
              <input
                id="account"
                name="account"
                type="text"
                required
                value={form.account_identifier}
                onChange={(e) => setForm(prev => ({ ...prev, account_identifier: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Property name, account name, or property code"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the property name, account name, or any identifier you have
              </p>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Additional Information (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Why do you need access to this account? Any additional context..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Access Request'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Already have an access code?{' '}
              <button
                type="button"
                onClick={() => router.push('/redeem-access')}
                className="text-blue-600 hover:text-blue-500"
              >
                Redeem it here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}