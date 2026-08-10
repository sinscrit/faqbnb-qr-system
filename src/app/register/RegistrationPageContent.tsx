'use client';

import Link from 'next/link';
import { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import { AuthShell, linkClass } from '@/components/auth/AuthShell';

export default function RegistrationPageContent() {
  const [complete, setComplete] = useState(false);
  return (
    <AuthShell
      title={complete ? 'Check your email' : 'Create your account'}
      description={complete ? 'Use the confirmation link we sent to finish setting up your account.' : 'One short form, then confirm your email.'}
    >
      {complete ? (
        <div className="text-center">
          <p role="status" className="mb-6 rounded-lg bg-green-50 p-3 text-sm text-green-900">
            If an account can be created, a confirmation email is on its way.
          </p>
          <Link href="/login" className={linkClass}>Back to sign in</Link>
        </div>
      ) : (
        <>
          <RegistrationForm onComplete={() => setComplete(true)} />
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <Link className={linkClass} href="/login">Sign in</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
