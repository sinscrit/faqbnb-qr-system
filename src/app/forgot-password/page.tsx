'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AuthShell, inputClass, linkClass, primaryButtonClass } from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const invalid = useSearchParams().get('notice') === 'recovery_failed';
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const email = new FormData(event.currentTarget).get('email');
    try {
      const response = await fetch('/api/auth/recovery/request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || body?.success !== true) setError(body?.error?.message || 'Could not request a recovery link. Please try again.');
      else setSent(true);
    } catch {
      setError('Could not request a recovery link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Reset your password" description="Enter your email and we’ll send a recovery link.">
      {invalid ? <p role="alert" className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">That recovery link is invalid or has expired. Request another below.</p> : null}
      {sent ? (
        <div className="text-center">
          <p role="status" className="mb-6 rounded-lg bg-green-50 p-3 text-sm text-green-900">If an account exists, a recovery link is on its way.</p>
          <Link href="/login" className={linkClass}>Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
          <div>
            <label htmlFor="recovery-email" className="text-sm font-medium text-slate-800">Email</label>
            <input id="recovery-email" name="email" type="email" autoComplete="email" required disabled={loading} className={inputClass} />
          </div>
          <button type="submit" disabled={loading} className={primaryButtonClass}>{loading ? 'Sending link…' : 'Send recovery link'}</button>
          <p className="text-center text-sm"><Link href="/login" className={linkClass}>Back to sign in</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
