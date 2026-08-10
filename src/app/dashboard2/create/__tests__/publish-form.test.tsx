import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublishGuestPageForm } from '@/app/dashboard2/create/PublishGuestPageForm';

const PROPERTY = '3abcdef0-0000-4000-8000-000000000001';
const OTHER = '30000000-0000-4000-8000-000000000002';
const REQUEST = '4abcdef0-0000-4000-8000-000000000001';
const PUBLIC = '5abcdef0-0000-4000-8000-000000000001';
const ready = { success: true, context: { state: 'ready', propertyCount: 1, property: { id: PROPERTY, name: 'Seaside home' } } };
const choices = { success: true, context: { state: 'selection_required', propertyCount: 2, property: null, choices: [{ id: PROPERTY, name: 'Seaside' }, { id: OTHER, name: 'City' }] } };
const json = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

describe('one-route guest-page publication UX', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); sessionStorage.clear();
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(REQUEST);
  });
  it('loads the fresh property before exposing only three content fields and a preview', async () => {
    const fetch = vi.fn().mockImplementation(() => json(ready)); vi.stubGlobal('fetch', fetch);
    render(<PublishGuestPageForm queryPropertyId={PROPERTY} />);
    expect(await screen.findByRole('heading', { name: 'Publish a guest page' })).toBeInTheDocument();
    expect(await screen.findByLabelText('Item name')).toBeInTheDocument();
    expect(screen.getByLabelText('Instruction title')).toBeRequired();
    expect(screen.getByLabelText('Instruction body')).toBeRequired();
    expect(screen.getByRole('button', { name: 'Publish guest page' })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/user/property-context', { cache: 'no-store' });
  });
  it('normalizes the frozen payload exactly once and succeeds without a false retry state', async () => {
    const fetch = vi.fn()
      .mockImplementationOnce(() => json(ready))
      .mockImplementationOnce(() => json({ success: true, item: { publicId: PUBLIC, name: 'Coffee machine' }, instruction: { title: 'Make coffee', body: 'Press Start.\n\tWait.' } }));
    vi.stubGlobal('fetch', fetch); const user = userEvent.setup();
    render(<PublishGuestPageForm queryPropertyId={PROPERTY} />);
    await user.type(await screen.findByLabelText('Item name'), '  Coffee   machine  ');
    await user.type(screen.getByLabelText('Instruction title'), ' Make   coffee ');
    fireEvent.change(screen.getByLabelText('Instruction body'), { target: { value: '  Press Start.\n\tWait.  ' } });
    await user.click(screen.getByRole('button', { name: 'Publish guest page' }));
    expect(await screen.findByRole('link', { name: 'View guest page' })).toHaveAttribute('href', `/item/${PUBLIC}`);
    const request = fetch.mock.calls[1][1] as RequestInit;
    expect(JSON.parse(request.body as string)).toEqual({ propertyId: PROPERTY, requestId: REQUEST, itemName: 'Coffee machine', instruction: { title: 'Make coffee', body: 'Press Start.\n\tWait.' } });
    expect(sessionStorage.getItem('faqbnb_publish_snapshot_v1')).toBeNull();
  });
  it('freezes an ambiguous submission and retries the exact same UUID and body', async () => {
    const fetch = vi.fn().mockImplementationOnce(() => json(ready)).mockRejectedValueOnce(new Error('offline')).mockImplementationOnce(() => json({ success: true, item: { publicId: PUBLIC, name: 'Kettle' }, instruction: { title: 'Boil water', body: 'Press the switch.' } }));
    vi.stubGlobal('fetch', fetch); const user = userEvent.setup();
    render(<PublishGuestPageForm queryPropertyId={PROPERTY} />);
    await user.type(await screen.findByLabelText('Item name'), 'Kettle');
    await user.type(screen.getByLabelText('Instruction title'), 'Boil water');
    await user.type(screen.getByLabelText('Instruction body'), 'Press the switch.');
    await user.click(screen.getByRole('button', { name: 'Publish guest page' }));
    expect(await screen.findByRole('button', { name: 'Retry saved request' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
    expect(screen.getByLabelText('Item name')).toBeDisabled();
    expect(screen.getByLabelText('Item name')).toHaveValue('Kettle');
    await user.click(screen.getByRole('button', { name: 'Retry saved request' }));
    await screen.findByRole('link', { name: 'View guest page' });
    expect((fetch.mock.calls[1][1] as RequestInit).body).toBe((fetch.mock.calls[2][1] as RequestInit).body);
  });
  it('thaws a definitive 400 while retaining the editable fields', async () => {
    const fetch = vi.fn().mockImplementationOnce(() => json(ready)).mockImplementationOnce(() => json({ success: false, error: { code: 'INVALID_REQUEST', message: 'Check the page details and try again.' } }, 400));
    vi.stubGlobal('fetch', fetch); const user = userEvent.setup();
    render(<PublishGuestPageForm queryPropertyId={PROPERTY} />);
    await user.type(await screen.findByLabelText('Item name'), 'Kettle'); await user.type(screen.getByLabelText('Instruction title'), 'Use'); await user.type(screen.getByLabelText('Instruction body'), 'Start.');
    await user.click(screen.getByRole('button', { name: 'Publish guest page' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Check the page details');
    expect(screen.getByLabelText('Item name')).toBeEnabled(); expect(screen.getByLabelText('Item name')).toHaveValue('Kettle');
  });
  it('shows one compact property decision and revalidates it before restoring any form', async () => {
    const fetch = vi.fn().mockImplementationOnce(() => json(choices)).mockImplementationOnce(() => json({ success: true, context: { state: 'ready', propertyCount: 1, property: { id: OTHER, name: 'City' } } }));
    vi.stubGlobal('fetch', fetch); const user = userEvent.setup();
    render(<PublishGuestPageForm queryPropertyId={null} />);
    await user.click(await screen.findByLabelText('City')); await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText(/Property:/)).toHaveTextContent('City');
    expect(JSON.parse((fetch.mock.calls[1][1] as RequestInit).body as string)).toEqual({ action: 'select', propertyId: OTHER });
  });
  it.each([
    [{ success: true, context: { ...choices.context, propertyCount: 3 } }],
    [{ success: true, context: { ...choices.context, choices: [choices.context.choices[0], choices.context.choices[0]] } }],
  ])('fails closed for malformed property choices', async (payload) => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => json(payload)));
    render(<PublishGuestPageForm queryPropertyId={null} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not prepare this page');
  });
  it('focuses the first invalid field before displaying validation recovery', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => json(ready))); const user = userEvent.setup();
    render(<PublishGuestPageForm queryPropertyId={PROPERTY} />);
    await user.click(await screen.findByRole('button', { name: 'Publish guest page' }));
    await waitFor(() => expect(screen.getByLabelText('Item name')).toHaveFocus());
    expect(screen.getByLabelText('Item name')).toHaveAccessibleDescription('Enter a valid single-line item name of 120 characters or fewer.');
  });
  it.each([['CR', 'Bad\rbody'], ['CRLF', 'Bad\r\nbody']])('rejects %s client input and keeps focus on the invalid body', async (_label, body) => {
    const fetch = vi.fn().mockImplementation(() => json(ready));
    vi.stubGlobal('fetch', fetch); const user = userEvent.setup();
    sessionStorage.setItem('faqbnb_publish_draft_v1', JSON.stringify({
      version: 1, propertyId: PROPERTY, requestId: REQUEST,
      itemName: 'Kettle', title: 'Use', body,
    }));
    render(<PublishGuestPageForm queryPropertyId={PROPERTY} />);
    await user.click(await screen.findByRole('button', { name: 'Publish guest page' }));
    await waitFor(() => expect(screen.getByLabelText('Instruction body')).toHaveFocus());
    expect(screen.getByRole('alert')).not.toHaveFocus();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
