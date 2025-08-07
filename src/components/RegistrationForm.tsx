'use client';

import { RegistrationResult } from '@/types';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus, Loader2, AlertCircle, Check, Shield } from 'lucide-react';
import { useRegistration } from '@/hooks/useRegistration';
import GoogleOAuthButton from './GoogleOAuthButton';

interface RegistrationFormProps {
  email: string; // Pre-filled from URL parameter
  accessCode: string; // Access code from URL parameter
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  agreeToTerms?: string;
  general?: string;
}

interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  color: string;
  label: string;
}

export default function RegistrationForm({ 
  email, 
  accessCode, 
  onSuccess, 
  onError, 
  className = '' 
}: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: email || '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeToTerms: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Use the registration hook
  const {
    isLoading,
    error: hookError,
    isValidating,
    validationResult,
    validateAccessCodeAsync,
    submitRegistration,
    clearError
  } = useRegistration();

  // Debug logging for registration form
  const DEBUG_PREFIX = "🔒 REGISTRATION_FORM_DEBUG:";

  // Update email when prop changes
  useEffect(() => {
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
  }, [email]);

  // Validate access code on component mount
  useEffect(() => {
    if (accessCode && email && !validationResult) {
      console.log(`${DEBUG_PREFIX} AUTO_VALIDATING_ACCESS_CODE`, {
        timestamp: new Date().toISOString(),
        accessCode: `${accessCode.substring(0, 4)}...`,
        email
      });
      
      validateAccessCodeAsync(accessCode, email).catch(error => {
        console.error(`${DEBUG_PREFIX} AUTO_VALIDATION_FAILED:`, error);
        onError?.(`Access code validation failed: ${error.message}`);
      });
    }
  }, [accessCode, email, validationResult, validateAccessCodeAsync, onError]);

  // Handle hook errors
  useEffect(() => {
    if (hookError) {
      setErrors(prev => ({ ...prev, general: hookError }));
      onError?.(hookError);
    }
  }, [hookError, onError]);

  // Clear hook error when form data changes
  useEffect(() => {
    if (hookError) {
      clearError();
    }
  }, [formData, hookError, clearError]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, feedback: [], color: 'gray-300', label: 'Enter password' };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    // Special character check
    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    const colors = ['red-300', 'red-400', 'yellow-400', 'blue-400', 'green-400'];
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

    return {
      score: Math.min(score, 4),
      feedback,
      color: colors[Math.min(score, 4)],
      label: labels[Math.min(score, 4)]
    };
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

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
        const password = value as string;
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/\d/.test(password)) return 'Password must contain at least one number';
        return undefined;
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return undefined;
      
      case 'fullName':
        if (value && (value as string).length < 2) return 'Name must be at least 2 characters';
        return undefined;
      
      case 'agreeToTerms':
        if (!value) return 'You must agree to the terms and conditions';
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
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    const fullNameError = validateField('fullName', formData.fullName);
    const agreeToTermsError = validateField('agreeToTerms', formData.agreeToTerms);
    
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    if (fullNameError) newErrors.fullName = fullNameError;
    if (agreeToTermsError) newErrors.agreeToTerms = agreeToTermsError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes with real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    console.log(`${DEBUG_PREFIX} FIELD_CHANGE`, {
      timestamp: new Date().toISOString(),
      field: name,
      value: type === 'password' ? '[HIDDEN]' : fieldValue
    });
    
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

  // Handle OAuth authentication start
  const handleOAuthStart = () => {
    console.log(`${DEBUG_PREFIX} OAUTH_START`, {
      timestamp: new Date().toISOString(),
      accessCode: accessCode.substring(0, 4) + '...',
      email: formData.email
    });
    
    setOauthLoading(true);
    setErrors({}); // Clear any previous errors
  };

  // Handle OAuth authentication error
  const handleOAuthError = (error: string) => {
    console.error(`${DEBUG_PREFIX} OAUTH_ERROR`, {
      timestamp: new Date().toISOString(),
      error
    });
    
    setOauthLoading(false);
    setErrors({ general: error });
    onError?.(error);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log(`${DEBUG_PREFIX} FORM_SUBMIT_ATTEMPT`, {
      timestamp: new Date().toISOString(),
      accessCode: accessCode ? `${accessCode.substring(0, 4)}...` : null,
      email: formData.email
    });
    
    if (!validateForm()) {
      console.log(`${DEBUG_PREFIX} FORM_VALIDATION_FAILED`, {
        timestamp: new Date().toISOString(),
        errors: Object.keys(errors)
      });
      return;
    }

    // Clear any existing errors
    setErrors({});

    try {
      console.log(`${DEBUG_PREFIX} SUBMITTING_REGISTRATION`, {
        timestamp: new Date().toISOString(),
        email: formData.email,
        fullName: formData.fullName,
        accessCode: accessCode ? `${accessCode.substring(0, 4)}...` : null
      });

      const result = await submitRegistration({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        accessCode: accessCode
      });

      if (result.success) {
        console.log(`${DEBUG_PREFIX} REGISTRATION_SUCCESS`, {
          timestamp: new Date().toISOString(),
          userId: result.user?.id
        });
        
        onSuccess?.(result);
      } else {
        console.log(`${DEBUG_PREFIX} REGISTRATION_FAILED`, {
          timestamp: new Date().toISOString(),
          error: result.error
        });
        
        setErrors({ general: result.error || 'Registration failed' });
        onError?.(result.error || 'Registration failed');
      }
      
    } catch (error) {
      console.error(`${DEBUG_PREFIX} REGISTRATION_ERROR:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during registration';
      setErrors({ general: errorMessage });
      onError?.(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* General Error */}
      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
              <p className="mt-1 text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Access Code Info */}
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
          <div className="ml-2">
            <p className="text-sm text-green-800">
              Access code: <span className="font-mono font-semibold">{accessCode.substring(0, 4)}...</span>
            </p>
          </div>
        </div>
      </div>

      {/* Email Field (read-only) */}
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
          disabled={true} // Pre-filled from URL, read-only
          className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg text-gray-700 cursor-not-allowed"
          placeholder="email@example.com"
          autoComplete="email"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          This email is linked to your access code and cannot be changed.
        </p>
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Full Name Field */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="John Doe"
          autoComplete="name"
        />
        {errors.fullName && (
          <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
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
            disabled={isLoading}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
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
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Password strength:</span>
              <span className={`font-medium text-${passwordStrength.color.replace('-300', '-600').replace('-400', '-600')}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className={`bg-${passwordStrength.color} h-1.5 rounded-full transition-all duration-300`}
                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
              ></div>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <div className="mt-1">
                <p className="text-xs text-gray-600">Requirements:</p>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  {passwordStrength.feedback.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.confirmPassword ? 'border-red-300 bg-red-50' : 
              formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-300 bg-green-50' : 'border-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {/* Password Match Indicator */}
        {formData.confirmPassword && (
          <div className="mt-1 flex items-center">
            {formData.password === formData.confirmPassword ? (
              <>
                <Check className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">Passwords match</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
                <span className="text-xs text-red-600">Passwords do not match</span>
              </>
            )}
          </div>
        )}
        
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div>
        <div className="flex items-start">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            disabled={isLoading}
            className={`mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
              errors.agreeToTerms ? 'border-red-300' : ''
            }`}
            required
          />
          <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
            I agree to the{' '}
            <button 
              type="button" 
              className="text-blue-600 hover:text-blue-700 underline"
              onClick={() => {
                // TODO: Open terms modal or navigate to terms page
                console.log('Terms of Service clicked');
              }}
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button 
              type="button" 
              className="text-blue-600 hover:text-blue-700 underline"
              onClick={() => {
                // TODO: Open privacy modal or navigate to privacy page
                console.log('Privacy Policy clicked');
              }}
            >
              Privacy Policy
            </button>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-600 text-sm mt-1 ml-7">{errors.agreeToTerms}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !formData.agreeToTerms}
        className="w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </>
        )}
      </button>

      {/* OAuth Divider - Will be used in future tasks */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <GoogleOAuthButton
        accessCode={accessCode}
        email={formData.email}
        onAuthStart={handleOAuthStart}
        onAuthError={handleOAuthError}
        disabled={oauthLoading || isLoading || !formData.agreeToTerms}
      />

      {/* Helper Text */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Your account will be linked to your verified access code
        </p>
      </div>
    </form>
  );
}