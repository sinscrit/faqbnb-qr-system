'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { buildPublicItemPath } from '@/lib/public-item-url';

const PROPERTY_HINT_KEY = 'faqbnb_publish_property_v1';
const DRAFT_KEY = 'faqbnb_publish_draft_v1';
const SNAPSHOT_KEY = 'faqbnb_publish_snapshot_v1';
const uuid = z.string().uuid().transform((value) => value.toLowerCase());
const property = z.object({ id: uuid, name: z.string().min(1).max(100) }).strict();
const contextResponse = z.object({
  success: z.literal(true),
  context: z.discriminatedUnion('state', [
    z.object({ state: z.literal('needs_property'), propertyCount: z.literal(0), property: z.null() }).strict(),
    z.object({ state: z.literal('ready'), propertyCount: z.literal(1), property }).strict(),
    z.object({ state: z.literal('selection_required'), propertyCount: z.number().int().min(2), property: z.null(), choices: z.array(property).min(2) }).strict().refine(
      (value) => value.choices.length === value.propertyCount &&
        new Set(value.choices.map((choice) => choice.id)).size === value.choices.length
    ),
  ]),
}).strict();
const publishSuccess = z.object({
  success: z.literal(true),
  item: z.object({ publicId: uuid, name: z.string() }).strict(),
  instruction: z.object({ title: z.string(), body: z.string() }).strict(),
}).strict();
const safeFailure = z.object({
  success: z.literal(false),
  error: z.object({ code: z.string(), message: z.string() }).strict(),
}).strict();
const storedDraft = z.object({
  version: z.literal(1), propertyId: uuid, requestId: uuid,
  itemName: z.string(), title: z.string(), body: z.string(),
}).strict();
type Draft = z.infer<typeof storedDraft>;
type Property = z.infer<typeof property>;
type FormError = { message: string; focus: 'field' | 'alert' };
type Screen = { kind: 'loading' } | { kind: 'auth'; message: string } |
  { kind: 'unavailable'; message: string } | { kind: 'needs_property' } |
  { kind: 'choose'; choices: Property[] } | { kind: 'ready'; property: Property };

function readSession(key: string): unknown {
  try { const raw = sessionStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function setSession(key: string, value: unknown) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* recovery is best effort */ }
}
function removeSession(key: string) {
  try { sessionStorage.removeItem(key); } catch { /* recovery is best effort */ }
}
function newRequestId() { return crypto.randomUUID().toLowerCase(); }
async function responseJson(response: Response) { try { return await response.json(); } catch { return null; } }
function normalizeSingleLine(value: string) {
  const normalized = value.normalize('NFKC');
  if (/[\p{Cc}\p{Cf}\p{Cs}]/u.test(normalized)) return null;
  const result = normalized.replace(/\s+/gu, ' ').trim();
  return result && Array.from(result).length <= 120 ? result : null;
}
function normalizeBody(value: string) {
  const normalized = value.normalize('NFKC');
  if (/[\p{Cf}\p{Cs}\u0000-\u0008\u000B\u000C\u000D-\u001F\u007F-\u009F\u2028\u2029]/u.test(normalized)) return null;
  const result = normalized.trim();
  return result && Array.from(result).length <= 8000 ? result : null;
}

export function PublishGuestPageForm({ queryPropertyId }: { queryPropertyId: string | null }) {
  const [screen, setScreen] = useState<Screen>({ kind: 'loading' });
  const [selectedChoice, setSelectedChoice] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [frozen, setFrozen] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<FormError | null>(null);
  const [success, setSuccess] = useState<{ publicId: string; name: string } | null>(null);
  const inFlight = useRef(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const screenAlertRef = useRef<HTMLParagraphElement>(null);
  const itemRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (error?.focus === 'alert') alertRef.current?.focus();
  }, [error]);
  useEffect(() => {
    if (screen.kind === 'auth' || screen.kind === 'unavailable') screenAlertRef.current?.focus();
  }, [screen]);

  const establishProperty = useCallback((selected: Property) => {
    setSession(PROPERTY_HINT_KEY, selected.id);
    const recovered = storedDraft.safeParse(readSession(DRAFT_KEY));
    const snapshot = storedDraft.safeParse(readSession(SNAPSHOT_KEY));
    const base = recovered.success && recovered.data.propertyId === selected.id
      ? recovered.data
      : { version: 1 as const, propertyId: selected.id, requestId: newRequestId(), itemName: '', title: '', body: '' };
    setDraft(base);
    setFrozen(snapshot.success && snapshot.data.propertyId === selected.id ? snapshot.data : null);
    if (!recovered.success || recovered.data.propertyId !== selected.id) setSession(DRAFT_KEY, base);
    if (snapshot.success && snapshot.data.propertyId !== selected.id) removeSession(SNAPSHOT_KEY);
    setScreen({ kind: 'ready', property: selected });
  }, []);

  const applyContext = useCallback(async (response: Response, allowHint: boolean) => {
    const payload = await responseJson(response);
    const parsed = contextResponse.safeParse(payload);
    if (response.ok && parsed.success) {
      const context = parsed.data.context;
      if (context.state === 'ready') { establishProperty(context.property); return; }
      if (context.state === 'needs_property') { setScreen({ kind: 'needs_property' }); return; }
      const queryHint = uuid.safeParse(queryPropertyId);
      const storedHint = uuid.safeParse(readSession(PROPERTY_HINT_KEY));
      if (storedHint.success && !context.choices.some((choice) => choice.id === storedHint.data)) {
        removeSession(PROPERTY_HINT_KEY);
      }
      const hint = allowHint
        ? [queryHint.success ? queryHint.data : null, storedHint.success ? storedHint.data : null]
          .find((candidate) => candidate && context.choices.some((choice) => choice.id === candidate))
        : null;
      if (hint) {
        const revalidated = await fetch('/api/user/property-context', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'select', propertyId: hint }),
        });
        await applyContext(revalidated, false);
        return;
      }
      setSelectedChoice('');
      setScreen({ kind: 'choose', choices: context.choices });
      return;
    }
    const failure = safeFailure.safeParse(payload);
    const message = failure.success ? failure.data.error.message : 'We could not prepare this page. Please try again.';
    if (response.status === 404 && !allowHint) {
      removeSession(PROPERTY_HINT_KEY);
      try {
        await applyContext(await fetch('/api/user/property-context', { cache: 'no-store' }), false);
        return;
      } catch { /* use the unavailable state below */ }
    }
    setScreen(response.status === 401 || response.status === 403
      ? { kind: 'auth', message }
      : { kind: 'unavailable', message });
  }, [establishProperty, queryPropertyId]);

  const load = useCallback(async () => {
    setScreen({ kind: 'loading' }); setError(null);
    try {
      await applyContext(await fetch('/api/user/property-context', { cache: 'no-store' }), true);
    } catch { setScreen({ kind: 'unavailable', message: 'We could not prepare this page. Please try again.' }); }
  }, [applyContext]);
  useEffect(() => { void load(); }, [load]);

  const choose = async () => {
    if (!selectedChoice || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError(null);
    try {
      await applyContext(await fetch('/api/user/property-context', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select', propertyId: selectedChoice }),
      }), false);
    } catch { setError({ message: 'We could not select that property. Please try again.', focus: 'alert' }); }
    finally { inFlight.current = false; setBusy(false); }
  };

  const update = (field: 'itemName' | 'title' | 'body', value: string) => {
    if (!draft || frozen) return;
    const next = { ...draft, [field]: value };
    setDraft(next); setSession(DRAFT_KEY, next); setError(null);
  };

  const normalizeForSubmission = (value: Draft): { value?: Draft; error?: string } => {
    const itemName = normalizeSingleLine(value.itemName);
    if (!itemName) { itemRef.current?.focus(); return { error: 'Enter a valid single-line item name of 120 characters or fewer.' }; }
    const title = normalizeSingleLine(value.title);
    if (!title) { titleRef.current?.focus(); return { error: 'Enter a valid single-line instruction title of 120 characters or fewer.' }; }
    const normalizedBody = normalizeBody(value.body);
    if (!normalizedBody) { bodyRef.current?.focus(); return { error: 'Enter valid instruction text of 8,000 characters or fewer.' }; }
    return { value: { ...value, itemName, title, body: normalizedBody } };
  };

  const publish = async (event: FormEvent) => {
    event.preventDefault();
    const source = frozen ?? draft;
    if (!source || inFlight.current) return;
    const normalized = normalizeForSubmission(source);
    if (!normalized.value) {
      setError({ message: normalized.error ?? 'Check the page details.', focus: 'field' });
      return;
    }
    const submission = normalized.value;
    if (!frozen) {
      setDraft(submission);
      setSession(DRAFT_KEY, submission);
      setFrozen(submission);
      setSession(SNAPSHOT_KEY, submission);
    }
    inFlight.current = true; setBusy(true); setError(null);
    try {
      const response = await fetch('/api/user/items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: submission.propertyId, requestId: submission.requestId,
          itemName: submission.itemName,
          instruction: { title: submission.title, body: submission.body },
        }),
      });
      const payload = await responseJson(response);
      const parsed = publishSuccess.safeParse(payload);
      if (response.ok && parsed.success && parsed.data.item.name === submission.itemName &&
          parsed.data.instruction.title === submission.title && parsed.data.instruction.body === submission.body) {
        removeSession(DRAFT_KEY); removeSession(SNAPSHOT_KEY);
        setSuccess({ publicId: parsed.data.item.publicId, name: parsed.data.item.name });
        return;
      }
      const failure = safeFailure.safeParse(payload);
      if (response.status === 401 || response.status === 403) {
        setScreen({ kind: 'auth', message: failure.success ? failure.data.error.message : 'Sign in to continue.' });
      } else if (response.status === 400) {
        removeSession(SNAPSHOT_KEY); setFrozen(null);
        setError({ message: failure.success ? failure.data.error.message : 'Check the page details and try again.', focus: 'alert' });
      } else {
        setError({ message: failure.success ? failure.data.error.message : 'We could not publish this guest page. Retry the saved request.', focus: 'alert' });
      }
    } catch { setError({ message: 'The result could not be confirmed. Retry the saved request.', focus: 'alert' }); }
    finally { inFlight.current = false; setBusy(false); }
  };

  const discardFrozen = () => {
    if (!draft) return;
    removeSession(SNAPSHOT_KEY);
    const next = { ...draft, requestId: newRequestId() };
    setDraft(next); setSession(DRAFT_KEY, next); setFrozen(null); setError(null);
    itemRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-4 py-8 sm:py-12">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm font-semibold tracking-wide text-[#d70466]">FAQBNB</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Publish a guest page</h1>

        {screen.kind === 'loading' && <p role="status" className="py-12 text-center text-gray-700">Preparing your property…</p>}
        {screen.kind === 'auth' && <div className="mt-8 space-y-5"><p ref={screenAlertRef} tabIndex={-1} role="alert" className="text-gray-700">{screen.message}</p><Link href="/login" className="inline-flex min-h-11 items-center rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white">Sign in</Link></div>}
        {screen.kind === 'unavailable' && <div className="mt-8 space-y-5"><p ref={screenAlertRef} tabIndex={-1} role="alert" className="text-gray-700">{screen.message}</p><button type="button" onClick={() => void load()} className="min-h-11 rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white">Retry</button></div>}
        {screen.kind === 'needs_property' && <div className="mt-8 space-y-5"><h2 className="text-xl font-semibold">Add a property first</h2><p className="text-gray-700">A guest page needs a property.</p><Link href="/dashboard2" className="inline-flex min-h-11 items-center rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white">Back to workspace</Link></div>}
        {screen.kind === 'choose' && <div className="mt-8 space-y-5"><h2 className="text-xl font-semibold">Choose a property</h2><fieldset className="space-y-2"><legend className="sr-only">Property</legend>{screen.choices.map((choice) => <label key={choice.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-gray-300 px-4"><input type="radio" name="property" value={choice.id} checked={selectedChoice === choice.id} onChange={() => setSelectedChoice(choice.id)} /><span>{choice.name}</span></label>)}</fieldset>{error && <div ref={alertRef} tabIndex={-1} role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error.message}</div>}<button type="button" disabled={!selectedChoice || busy} onClick={() => void choose()} className="min-h-11 w-full rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? 'Continuing…' : 'Continue'}</button></div>}

        {screen.kind === 'ready' && draft && !success && <form onSubmit={publish} className="mt-7 space-y-6" noValidate>
          <p className="text-sm text-gray-600">Property: <strong className="text-gray-900">{screen.property.name}</strong></p>
          {frozen && <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><p>The previous result was not confirmed. Retry sends the exact same saved request.</p><button type="button" onClick={discardFrozen} className="mt-2 min-h-11 font-semibold underline">Discard saved request and edit</button></div>}
          <div><label htmlFor="item-name" className="mb-2 block font-medium">Item name</label><input ref={itemRef} id="item-name" value={draft.itemName} onChange={(e) => update('itemName', e.target.value)} disabled={busy || Boolean(frozen)} maxLength={120} required aria-describedby={error ? 'publish-error' : undefined} autoComplete="off" className="min-h-11 w-full rounded-lg border border-gray-400 px-3 py-2 disabled:bg-gray-100" /></div>
          <div><label htmlFor="instruction-title" className="mb-2 block font-medium">Instruction title</label><input ref={titleRef} id="instruction-title" value={draft.title} onChange={(e) => update('title', e.target.value)} disabled={busy || Boolean(frozen)} maxLength={120} required aria-describedby={error ? 'publish-error' : undefined} autoComplete="off" className="min-h-11 w-full rounded-lg border border-gray-400 px-3 py-2 disabled:bg-gray-100" /></div>
          <div><label htmlFor="instruction-body" className="mb-2 block font-medium">Instruction body</label><textarea ref={bodyRef} id="instruction-body" value={draft.body} onChange={(e) => update('body', e.target.value)} disabled={busy || Boolean(frozen)} maxLength={8000} required aria-describedby={error ? 'publish-error' : undefined} rows={7} className="w-full rounded-lg border border-gray-400 px-3 py-2 disabled:bg-gray-100" /></div>
          <aside aria-label="Guest page preview" className="rounded-xl border border-gray-200 bg-gray-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Guest preview</p><h2 className="mt-2 break-words text-2xl font-bold">{draft.itemName.trim() || 'Item name'}</h2><h3 className="mt-5 break-words text-lg font-semibold">{draft.title.trim() || 'Instruction title'}</h3><p className="mt-2 whitespace-pre-wrap break-words text-gray-700">{draft.body.trim() || 'Your instructions will appear here.'}</p></aside>
          {error && <div id="publish-error" ref={alertRef} tabIndex={-1} role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error.message}</div>}
          <button type="submit" disabled={busy} className="min-h-12 w-full rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? 'Publishing…' : frozen ? 'Retry saved request' : 'Publish guest page'}</button>
          <Link href="/dashboard2" className="mx-auto block w-fit min-h-11 py-2 text-sm font-medium text-gray-700 underline">Back to workspace</Link>
        </form>}

        {success && <div className="mt-8 space-y-6"><div><p className="text-sm font-semibold text-green-700">Published</p><h2 className="mt-1 break-words text-2xl font-semibold">{success.name}</h2></div><Link href={buildPublicItemPath(success.publicId)} className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#e61e4d] px-5 py-3 font-semibold text-white">View guest page</Link><Link href="/dashboard2" className="mx-auto block w-fit min-h-11 py-2 text-sm text-gray-700 underline">Back to workspace</Link></div>}
      </section>
    </main>
  );
}
