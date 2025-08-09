'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Home, LogIn } from 'lucide-react';

export default function RegistrationSuccess() {
  const router = useRouter();

  // Auto-redirect to login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <Image
                src="/faqbnb_logoshort.png"
                alt="FAQBNB Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">FAQBNB</h1>
                <p className="text-sm text-gray-600">Registration Complete</p>
              </div>
            </div>
          </div>

          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been created successfully with Google OAuth. 
            You can now access all FAQBNB features.
          </p>

          {/* What was created */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Account Setup Complete:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ User account created</li>
              <li>✅ Default account established</li>
              <li>✅ Admin privileges configured</li>
              <li>✅ Access code validated</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <LogIn className="w-5 h-5" />
              <span>Continue to Login</span>
            </Link>
            
            <Link
              href="/"
              className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Auto-redirect notice */}
          <p className="text-xs text-gray-500 mt-4">
            You will be automatically redirected to the login page in 5 seconds.
          </p>
        </div>
      </div>
    </div>
  );
}