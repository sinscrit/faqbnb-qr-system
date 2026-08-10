'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { inputClass, linkClass, primaryButtonClass } from '@/components/auth/AuthShell';

export default function LoginForm({ showGoogleCompatibility = false }: { showGoogleCompatibility?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || body?.success !== true || body?.next !== '/dashboard2') {
        setError(body?.error?.message || 'Sign in failed. Please try again.');
        return;
      }
      router.push('/dashboard2');
      router.refresh();
    } catch {
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error ? <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="text-sm font-medium text-slate-800">Email</label>
          <input id="login-email" name="email" type="email" autoComplete="email" required disabled={loading} className={inputClass} />
        </div>
        <div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-x-3">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-800">Password</label>
            <input id="login-password" name="password" type="password" autoComplete="current-password" maxLength={128} required disabled={loading} className={`col-span-2 ${inputClass}`} />
            <Link href="/forgot-password" className={`col-start-2 row-start-1 text-sm ${linkClass}`}>Forgot password?</Link>
          </div>
        </div>
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      {showGoogleCompatibility ? (
        <div className="mt-6 border-t border-slate-200 pt-5 text-center">
          <p className="mb-3 text-xs text-slate-500">Already use Google with FAQBNB?</p>
          <a href="/api/auth/google" className={`inline-block text-sm ${linkClass}`}>Continue with Google</a>
        </div>
      ) : null}
    </div>
  );
}
