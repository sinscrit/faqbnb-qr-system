'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

const PROPERTY_HINT_KEY = 'faqbnb_last_property_hint';
const propertySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
}).strict();
const successSchema = z.object({
  success: z.literal(true),
  context: z.discriminatedUnion('state', [
    z.object({
      state: z.literal('needs_property'),
      propertyCount: z.literal(0),
      property: z.null(),
    }).strict(),
    z.object({
      state: z.literal('ready'),
      propertyCount: z.literal(1),
      property: propertySchema,
    }).strict(),
    z.object({
      state: z.literal('selection_required'),
      propertyCount: z.number().int().min(2),
      property: z.null(),
      choices: z.array(propertySchema).min(2),
    }).strict().refine(
      (value) =>
        value.choices.length === value.propertyCount &&
        new Set(value.choices.map((choice) => choice.id)).size === value.choices.length
    ),
  ]),
}).strict();
const errorSchema = z.object({
  success: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }).strict(),
}).strict();

type SuccessContext = z.infer<typeof successSchema>['context'];
type ScreenState =
  | { kind: 'loading' }
  | { kind: 'context'; context: SuccessContext }
  | { kind: 'auth'; message: string }
  | { kind: 'unavailable'; message: string };

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function DashboardPropertySetup({
  navigateToLogin = () => window.location.assign('/login'),
}: { navigateToLogin?: () => void } = {}) {
  const [screen, setScreen] = useState<ScreenState>({ kind: 'loading' });
  const [propertyName, setPropertyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const autoSelectionAttempted = useRef<string | null>(null);
  const mutationInFlight = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const screenErrorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (actionError) errorRef.current?.focus();
  }, [actionError]);

  useEffect(() => {
    if (screen.kind === 'auth' || screen.kind === 'unavailable') {
      screenErrorRef.current?.focus();
    }
  }, [screen]);

  const applyResponse = useCallback(async (response: Response, allowStoredHint: boolean) => {
    const payload = await readJson(response);
    const success = successSchema.safeParse(payload);
    if (response.ok && success.success) {
      const context = success.data.context;
      if (context.state === 'ready') {
        try { localStorage.setItem(PROPERTY_HINT_KEY, context.property.id); } catch { /* optional hint */ }
      }

      if (context.state === 'selection_required' && allowStoredHint) {
        let storedHint: string | null = null;
        try { storedHint = localStorage.getItem(PROPERTY_HINT_KEY); } catch { /* optional hint */ }
        const isFreshChoice = storedHint !== null && context.choices.some((choice) => choice.id === storedHint);
        if (storedHint && !isFreshChoice) {
          try { localStorage.removeItem(PROPERTY_HINT_KEY); } catch { /* optional hint */ }
        }
        if (isFreshChoice && autoSelectionAttempted.current !== storedHint) {
          autoSelectionAttempted.current = storedHint;
          const selectionResponse = await fetch('/api/user/property-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'select', propertyId: storedHint }),
          });
          return applyResponse(selectionResponse, false);
        }
      }

      setScreen({ kind: 'context', context });
      return;
    }

    const failure = errorSchema.safeParse(payload);
    const message = failure.success ? failure.data.error.message : 'We could not load your property. Please try again.';
    if (response.status === 404) {
      try { localStorage.removeItem(PROPERTY_HINT_KEY); } catch { /* optional hint */ }
    }
    if (response.status === 401 || response.status === 403) {
      setScreen({ kind: 'auth', message });
    } else {
      setScreen({ kind: 'unavailable', message });
    }
  }, []);

  const load = useCallback(async () => {
    setScreen({ kind: 'loading' });
    setActionError(null);
    try {
      const response = await fetch('/api/user/property-context', {
        method: 'GET',
        cache: 'no-store',
      });
      await applyResponse(response, true);
    } catch {
      setScreen({ kind: 'unavailable', message: 'We could not load your property. Please try again.' });
    }
  }, [applyResponse]);

  useEffect(() => { void load(); }, [load]);

  const mutate = useCallback(async (body: object) => {
    if (mutationInFlight.current) return;
    mutationInFlight.current = true;
    setSubmitting(true);
    setActionError(null);
    try {
      const response = await fetch('/api/user/property-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.status === 404) {
        try { localStorage.removeItem(PROPERTY_HINT_KEY); } catch { /* optional hint */ }
        await load();
        return;
      }
      const payload = await readJson(response);
      const success = successSchema.safeParse(payload);
      if (response.ok && success.success) {
        if (success.data.context.state === 'ready') {
          try { localStorage.setItem(PROPERTY_HINT_KEY, success.data.context.property.id); } catch { /* optional hint */ }
        }
        setScreen({ kind: 'context', context: success.data.context });
        return;
      }
      const failure = errorSchema.safeParse(payload);
      if (response.status === 401 || response.status === 403) {
        setScreen({
          kind: 'auth',
          message: failure.success ? failure.data.error.message : 'Sign in to continue.',
        });
      } else {
        setActionError(failure.success ? failure.data.error.message : 'That change could not be saved. Please try again.');
      }
    } catch {
      setActionError('That change could not be saved. Please try again.');
    } finally {
      mutationInFlight.current = false;
      setSubmitting(false);
    }
  }, [load]);

  const createProperty = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void mutate({ action: 'create', propertyName });
  };

  const signOut = async () => {
    if (mutationInFlight.current) return;
    mutationInFlight.current = true;
    setSubmitting(true);
    setActionError(null);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const payload = await readJson(response);
      if (response.ok && z.object({ success: z.literal(true), next: z.literal('/login') }).strict().safeParse(payload).success) {
        navigateToLogin();
        return;
      }
      setActionError('We could not sign you out. Please try again.');
    } catch {
      setActionError('We could not sign you out. Please try again.');
    } finally {
      mutationInFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-4 py-8 sm:py-14">
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-wide text-[#d70466]">FAQBNB</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Your host workspace</h1>
        </div>

        {screen.kind === 'loading' && (
          <div role="status" aria-live="polite" className="py-8 text-center text-gray-700">
            <span className="mx-auto mb-4 block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#e61e4d]" aria-hidden="true" />
            Preparing your property…
          </div>
        )}

        {screen.kind === 'auth' && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-gray-950">Sign in to continue</h2>
            <p ref={screenErrorRef} tabIndex={-1} role="alert" className="text-gray-700">{screen.message}</p>
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white hover:bg-[#d70466] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2">
              Go to sign in
            </Link>
          </div>
        )}

        {screen.kind === 'unavailable' && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-gray-950">Your workspace is temporarily unavailable</h2>
            <p ref={screenErrorRef} tabIndex={-1} role="alert" className="text-gray-700">{screen.message}</p>
            <button type="button" onClick={() => void load()} className="min-h-11 rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white hover:bg-[#d70466] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2">
              Retry
            </button>
          </div>
        )}

        {screen.kind === 'context' && screen.context.state === 'needs_property' && (
          <form onSubmit={createProperty} className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-gray-950">Welcome—name your first property</h2>
              <p className="mt-2 text-gray-700">This is the only detail needed to get started.</p>
            </div>
            <div>
              <label htmlFor="property-name" className="mb-2 block font-medium text-gray-900">Property name</label>
              <input
                id="property-name"
                name="propertyName"
                value={propertyName}
                onChange={(event) => setPropertyName(event.target.value)}
                required
                maxLength={100}
                autoComplete="organization"
                disabled={submitting}
                aria-describedby={actionError ? 'property-action-error' : undefined}
                className="min-h-11 w-full rounded-lg border border-gray-400 px-3 py-2 text-base text-gray-950 focus:border-[#222] focus:outline-none focus:ring-2 focus:ring-[#222]/20 disabled:bg-gray-100"
              />
            </div>
            {actionError && <div ref={errorRef} tabIndex={-1} id="property-action-error" role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{actionError}</div>}
            <button type="submit" disabled={submitting || propertyName.trim().length === 0} className="min-h-11 w-full rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white hover:bg-[#d70466] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? 'Creating property…' : 'Create property'}
            </button>
          </form>
        )}

        {screen.kind === 'context' && screen.context.state === 'selection_required' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-gray-950">Choose a property</h2>
              <p className="mt-2 text-gray-700">Select the property you want to work on.</p>
            </div>
            {actionError && <div ref={errorRef} tabIndex={-1} id="property-action-error" role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{actionError}</div>}
            <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
              {screen.context.choices.map((property) => (
                <li key={property.id} className="flex items-center justify-between gap-4 p-4">
                  <span className="min-w-0 break-words font-medium text-gray-950">{property.name}</span>
                  <button type="button" disabled={submitting} onClick={() => void mutate({ action: 'select', propertyId: property.id })} className="min-h-11 shrink-0 rounded-lg bg-[#e61e4d] px-4 py-2 font-semibold text-white hover:bg-[#d70466] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2 disabled:opacity-60">
                    Choose
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {screen.kind === 'context' && screen.context.state === 'ready' && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Current property</p>
              <h2 className="mt-1 break-words text-2xl font-semibold text-gray-950">{screen.context.property.name}</h2>
            </div>
            {actionError && <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{actionError}</div>}
            <Link href={`/dashboard2/create?propertyId=${encodeURIComponent(screen.context.property.id)}`} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#e61e4d] px-5 py-3 text-center font-semibold text-white hover:bg-[#d70466] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2">
              Add your first item
            </Link>
            <button type="button" disabled={submitting} onClick={() => void signOut()} className="mx-auto block min-h-11 px-4 py-2 text-sm font-medium text-gray-600 underline-offset-4 hover:text-gray-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222] focus-visible:ring-offset-2 disabled:opacity-60">
              Sign out
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
