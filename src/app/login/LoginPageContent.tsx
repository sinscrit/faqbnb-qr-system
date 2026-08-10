'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { AuthShell, linkClass } from '@/components/auth/AuthShell';

const notices: Record<string, string> = {
  confirmation_failed: 'That confirmation link is invalid or has expired. Please sign in or register again.',
  google_unavailable: 'Google sign-in is not available. Use email and password instead.',
  google_failed: 'Google sign-in could not be completed. Use email and password or try again.',
  session_invalid: 'Your session could not be used. Sign in again to continue.',
};

export default function LoginPageContent({ showGoogleCompatibility = false }: { showGoogleCompatibility?: boolean }) {
  const notice = useSearchParams().get('notice');
  return (
    <AuthShell title="Welcome back" description="Sign in to manage your guest instructions.">
      {notice && notices[notice] ? (
        <p role="status" className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{notices[notice]}</p>
      ) : null}
      <LoginForm showGoogleCompatibility={showGoogleCompatibility} />
      <p className="mt-6 text-center text-sm text-slate-600">
        New to FAQBNB? <Link className={linkClass} href="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}
