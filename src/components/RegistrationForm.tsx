'use client';

import { useState } from 'react';
import { PASSWORD_RULE_MESSAGE, passwordSchema } from '@/lib/auth-flow';
import { inputClass, primaryButtonClass } from '@/components/auth/AuthShell';

export default function RegistrationForm({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');
    if (!passwordSchema.safeParse(password).success) {
      setError(PASSWORD_RULE_MESSAGE);
      return;
    }
    if (password !== form.get('confirmPassword')) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.get('displayName'),
          email: form.get('email'),
          password,
          confirmPassword: form.get('confirmPassword'),
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || body?.success !== true) {
        setError(body?.error?.message || 'Registration failed. Please try again.');
        return;
      }
      onComplete();
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <div>
        <label htmlFor="register-name" className="text-sm font-medium text-slate-800">Display name <span className="font-normal text-slate-500">(optional)</span></label>
        <input id="register-name" name="displayName" type="text" autoComplete="name" maxLength={120} disabled={loading} className={inputClass} />
      </div>
      <div>
        <label htmlFor="register-email" className="text-sm font-medium text-slate-800">Email</label>
        <input id="register-email" name="email" type="email" autoComplete="email" required disabled={loading} className={inputClass} />
      </div>
      <div>
        <label htmlFor="register-password" className="text-sm font-medium text-slate-800">Password</label>
        <input id="register-password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required disabled={loading} aria-describedby="password-help" className={inputClass} />
        <p id="password-help" className="mt-1.5 text-xs leading-5 text-slate-500">{PASSWORD_RULE_MESSAGE}</p>
      </div>
      <div>
        <label htmlFor="register-confirm" className="text-sm font-medium text-slate-800">Confirm password</label>
        <input id="register-confirm" name="confirmPassword" type="password" autoComplete="new-password" maxLength={128} required disabled={loading} className={inputClass} />
      </div>
      <button type="submit" disabled={loading} className={primaryButtonClass}>{loading ? 'Creating account…' : 'Create account'}</button>
    </form>
  );
}
