'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthShell, inputClass, linkClass, primaryButtonClass } from '@/components/auth/AuthShell';
import { PASSWORD_RULE_MESSAGE, passwordSchema } from '@/lib/auth-flow';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');
    const confirmPassword = String(form.get('confirmPassword') || '');
    if (!passwordSchema.safeParse(password).success) return setError(PASSWORD_RULE_MESSAGE);
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/recovery/update', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password, confirmPassword }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || body?.success !== true || body?.next !== '/dashboard2') {
        if (response.status === 401) setExpired(true);
        else setError(body?.error?.message || 'Could not update your password. Please try again.');
        return;
      }
      router.push('/dashboard2');
      router.refresh();
    } catch {
      setError('Could not update your password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Choose a new password" description="Your new password will be used the next time you sign in.">
      {expired ? (
        <div className="text-center">
          <p role="alert" className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">This recovery link is invalid or has expired.</p>
          <Link href="/forgot-password" className={linkClass}>Request another link</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
          <div>
            <label htmlFor="new-password" className="text-sm font-medium text-slate-800">New password</label>
            <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required disabled={loading} aria-describedby="reset-password-help" className={inputClass} />
            <p id="reset-password-help" className="mt-1.5 text-xs leading-5 text-slate-500">{PASSWORD_RULE_MESSAGE}</p>
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="text-sm font-medium text-slate-800">Confirm new password</label>
            <input id="confirm-new-password" name="confirmPassword" type="password" autoComplete="new-password" maxLength={128} required disabled={loading} className={inputClass} />
          </div>
          <button type="submit" disabled={loading} className={primaryButtonClass}>{loading ? 'Updating password…' : 'Update password'}</button>
        </form>
      )}
    </AuthShell>
  );
}
