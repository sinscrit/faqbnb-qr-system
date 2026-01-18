'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import GoogleOAuthButton from './GoogleOAuthButton';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm({ onSuccess, onError, className = '' }: LoginFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Get redirect URL from search params
  const redirectTo = searchParams.get('redirect') || '/admin';

  // Validate individual fields
  const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value as string)) return 'Please enter a valid email address';
        return undefined;
      
      case 'password':
        if (!value) return 'Password is required';
        if ((value as string).length < 6) return 'Password must be at least 6 characters';
        return undefined;
      
      default:
        return undefined;
    }
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear general error on any input change
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined,
      }));
    }
  };

  // Handle form submission using AuthContext's sequential state machine
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔐 LOGIN_FORM: Starting AuthContext authentication for:', formData.email);

      // Use AuthContext's signIn which integrates with the sequential state machine
      const result = await signIn(formData.email, formData.password);

      console.log('🔐 LOGIN_FORM: AuthContext authentication result:', {
        success: result.success,
        user: result.data?.user?.id,
        error: result.error
      });

      if (!result.success || result.error) {
        console.error('🔐 LOGIN_FORM: Authentication failed:', result.error);

        // Set specific error based on error message
        const errorMessage = result.error || 'Authentication failed';
        if (errorMessage.includes('Invalid login credentials') ||
            errorMessage.includes('Email not confirmed') ||
            errorMessage.includes('Invalid email or password')) {
          setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
        } else if (errorMessage.includes('admin privileges') ||
                   errorMessage.includes('Access denied')) {
          setErrors({ general: 'Access denied. Admin privileges are required.' });
        } else {
          setErrors({ general: errorMessage });
        }

        onError?.(errorMessage);
        return;
      }

      if (result.success && result.data?.user) {
        console.log('🔐 LOGIN_FORM: Authentication successful - AuthContext will handle redirect');
        
        // Reset authentication attempted flag so AuthContext can trigger authentication
        // The AuthContext's sequential state machine will handle the redirect to dashboard
        // No manual redirect needed - let the LoginPageContent's useEffect handle it
        
        // Call success callback
        onSuccess?.();
      } else {
        console.error('🔐 LOGIN_FORM: Authentication failed: No user returned');
        setErrors({ general: 'Login failed: No user returned' });
        onError?.('Login failed: No user returned');
      }

    } catch (error) {
      console.error('🔐 LOGIN_FORM: Authentication error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth authentication start
  const handleOAuthStart = () => {
    setOauthLoading(true);
    setErrors({});
  };

  // Handle OAuth authentication error
  const handleOAuthError = (error: string) => {
    setOauthLoading(false);
    setErrors({ general: error });
    onError?.(error);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* General Error */}
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Authentication Failed</h3>
              <p className="mt-1 text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* OAuth Login Section */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 mb-4">Sign in with your account</p>
        </div>
        
        <GoogleOAuthButton
          onAuthStart={handleOAuthStart}
          onAuthError={handleOAuthError}
          disabled={loading || oauthLoading}
        />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={loading}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="admin@faqbnb.com"
          autoComplete="email"
          required
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="rememberMe"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleInputChange}
          disabled={loading}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
          Remember me for 30 days
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || oauthLoading}
        className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Signing In...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In with Email
          </>
        )}
      </button>

      {/* Helper Text */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Access restricted to authorized administrators only
        </p>
      </div>
      </form>
    </div>
  );
} 