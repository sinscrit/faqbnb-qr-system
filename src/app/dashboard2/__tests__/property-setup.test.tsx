import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPropertySetup } from '@/app/dashboard2/DashboardPropertySetup';

const PROPERTY_ID = '30000000-0000-4000-8000-000000000001';
const OTHER_PROPERTY_ID = '30000000-0000-4000-8000-000000000002';
const needs = { success: true, context: { state: 'needs_property', propertyCount: 0, property: null } };
const ready = { success: true, context: { state: 'ready', propertyCount: 1, property: { id: PROPERTY_ID, name: 'Seaside home' } } };
const many = { success: true, context: {
  state: 'selection_required', propertyCount: 2, property: null,
  choices: [{ id: PROPERTY_ID, name: 'Alpha' }, { id: OTHER_PROPERTY_ID, name: 'Beta' }],
} };

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

describe('canonical dashboard property setup', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('shows one short loading state, then only the first-property decision', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(needs)));
    render(<DashboardPropertySetup />);
    expect(screen.getByRole('status')).toHaveTextContent('Preparing your property');
    expect(await screen.findByRole('heading', { name: 'Welcome—name your first property' })).toBeInTheDocument();
    expect(screen.getByLabelText('Property name')).toBeRequired();
    expect(screen.getByRole('button', { name: 'Create property' })).toBeDisabled();
    expect(screen.queryByLabelText(/address|type|account/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('creates from one field, suppresses duplicate submits, and keeps the name during the request', async () => {
    let finish!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => { finish = resolve; });
    const fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse(needs))
      .mockReturnValueOnce(pending);
    vi.stubGlobal('fetch', fetch);
    const user = userEvent.setup();
    render(<DashboardPropertySetup />);
    const input = await screen.findByLabelText('Property name');
    await user.type(input, 'Seaside home');
    const create = screen.getByRole('button', { name: 'Create property' });
    await user.dblClick(create);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(create).toBeDisabled();
    expect(input).toHaveValue('Seaside home');
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ action: 'create', propertyName: 'Seaside home' });
    finish(jsonResponse(ready));
    expect(await screen.findByRole('heading', { name: 'Seaside home' })).toBeInTheDocument();
  });

  it('preserves entered content and focuses an actionable recoverable error', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse(needs))
      .mockResolvedValueOnce(jsonResponse({ success: false, error: { code: 'PROPERTY_CONTEXT_UNAVAILABLE', message: 'Could not create the property. Try again.' } }, 503));
    vi.stubGlobal('fetch', fetch);
    const user = userEvent.setup();
    render(<DashboardPropertySetup />);
    const input = await screen.findByLabelText('Property name');
    await user.type(input, 'Seaside home');
    await user.click(screen.getByRole('button', { name: 'Create property' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not create the property. Try again.');
    expect(alert).toHaveFocus();
    expect(input).toHaveValue('Seaside home');
    expect(screen.getByRole('button', { name: 'Create property' })).toBeEnabled();
  });

  it('shows one primary item action with only a property-ID hint and subordinate sign out', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(ready)));
    render(<DashboardPropertySetup />);
    expect(await screen.findByRole('heading', { name: 'Seaside home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add your first item' })).toHaveAttribute(
      'href', `/dashboard2/create?propertyId=${PROPERTY_ID}`
    );
    expect(screen.getByRole('button', { name: 'Sign out' })).toHaveClass('text-sm');
    expect(screen.queryByText(/statistics|settings|translations/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('faqbnb_last_property_hint')).toBe(PROPERTY_ID);
    expect(localStorage.length).toBe(1);
    expect(localStorage.key(0)).toBe('faqbnb_last_property_hint');
  });

  it.each([
    [401, 'Sign in to continue.', 'Go to sign in'],
    [403, 'Verify your email address to continue.', 'Go to sign in'],
  ])('offers one sign-in path for HTTP %i', async (status, message, action) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ success: false, error: { code: 'AUTH', message } }, status)));
    render(<DashboardPropertySetup />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(message);
    expect(alert).toHaveFocus();
    const link = screen.getByRole('link', { name: action });
    expect(link).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('offers one retry action for a recoverable unavailable response', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ success: false, error: { code: 'PROPERTY_CONTEXT_UNAVAILABLE', message: 'Please try again.' } }, 503))
      .mockResolvedValueOnce(jsonResponse(needs));
    vi.stubGlobal('fetch', fetch);
    const user = userEvent.setup();
    render(<DashboardPropertySetup />);
    const retry = await screen.findByRole('button', { name: 'Retry' });
    expect(screen.getByRole('alert')).toHaveFocus();
    await user.click(retry);
    expect(await screen.findByLabelText('Property name')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('renders only inline server choices and validates a click through POST', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse(many))
      .mockResolvedValueOnce(jsonResponse({ ...ready, context: { ...ready.context, property: { id: OTHER_PROPERTY_ID, name: 'Beta' } } }));
    vi.stubGlobal('fetch', fetch);
    const user = userEvent.setup();
    render(<DashboardPropertySetup />);
    expect(await screen.findByRole('heading', { name: 'Choose a property' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Choose' })).toHaveLength(2);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Choose' })[1]);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ action: 'select', propertyId: OTHER_PROPERTY_ID });
    expect(await screen.findByRole('heading', { name: 'Beta' })).toBeInTheDocument();
  });

  it('auto-uses a stored hint only when it appears in a fresh validated choice list', async () => {
    localStorage.setItem('faqbnb_last_property_hint', OTHER_PROPERTY_ID);
    const selected = { ...ready, context: { ...ready.context, property: { id: OTHER_PROPERTY_ID, name: 'Beta' } } };
    const fetch = vi.fn().mockResolvedValueOnce(jsonResponse(many)).mockResolvedValueOnce(jsonResponse(selected));
    vi.stubGlobal('fetch', fetch);
    render(<DashboardPropertySetup />);
    expect(await screen.findByRole('heading', { name: 'Beta' })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ action: 'select', propertyId: OTHER_PROPERTY_ID });
  });

  it('clears a stored hint when its fresh auto-selection disappears before POST validation', async () => {
    localStorage.setItem('faqbnb_last_property_hint', OTHER_PROPERTY_ID);
    const fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse(many))
      .mockResolvedValueOnce(jsonResponse({
        success: false,
        error: { code: 'PROPERTY_NOT_FOUND', message: 'That property is no longer available.' },
      }, 404));
    vi.stubGlobal('fetch', fetch);
    render(<DashboardPropertySetup />);
    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(localStorage.getItem('faqbnb_last_property_hint')).toBeNull();
  });

  it('discards an absent stored hint and never sends it to the server', async () => {
    localStorage.setItem('faqbnb_last_property_hint', '30000000-0000-4000-8000-000000000099');
    const fetch = vi.fn().mockResolvedValue(jsonResponse(many));
    vi.stubGlobal('fetch', fetch);
    render(<DashboardPropertySetup />);
    expect(await screen.findByRole('heading', { name: 'Choose a property' })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('faqbnb_last_property_hint')).toBeNull();
  });

  it('fails closed on a malformed server success instead of rendering authority data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      success: true,
      accountId: 'attacker-account',
      context: ready.context,
    })));
    render(<DashboardPropertySetup />);
    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByText('Seaside home')).not.toBeInTheDocument();
  });

  it('fails closed on duplicate IDs in a server choice response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      success: true,
      context: {
        state: 'selection_required',
        propertyCount: 2,
        property: null,
        choices: [
          { id: PROPERTY_ID, name: 'Alpha' },
          { id: PROPERTY_ID, name: 'Duplicate' },
        ],
      },
    })));
    render(<DashboardPropertySetup />);
    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Choose' })).not.toBeInTheDocument();
  });

  it('suppresses same-tick duplicate property selection requests', async () => {
    let finish!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => { finish = resolve; });
    const fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse(many))
      .mockReturnValueOnce(pending);
    vi.stubGlobal('fetch', fetch);
    render(<DashboardPropertySetup />);
    const choose = (await screen.findAllByRole('button', { name: 'Choose' }))[0];
    fireEvent.click(choose);
    fireEvent.click(choose);
    expect(fetch).toHaveBeenCalledTimes(2);
    finish(jsonResponse(ready));
    expect(await screen.findByRole('heading', { name: 'Seaside home' })).toBeInTheDocument();
  });

  it('sends exact empty JSON logout once and redirects only after safe success', async () => {
    let finish!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => { finish = resolve; });
    const fetch = vi.fn()
      .mockResolvedValueOnce(jsonResponse(ready))
      .mockReturnValueOnce(pending);
    vi.stubGlobal('fetch', fetch);
    const navigateToLogin = vi.fn();
    render(<DashboardPropertySetup navigateToLogin={navigateToLogin} />);
    const logout = await screen.findByRole('button', { name: 'Sign out' });
    fireEvent.click(logout);
    fireEvent.click(logout);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1]).toEqual([
      '/api/auth/logout',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
    ]);
    expect(navigateToLogin).not.toHaveBeenCalled();
    finish(jsonResponse({ success: true, next: '/login' }));
    await waitFor(() => expect(navigateToLogin).toHaveBeenCalledTimes(1));
  });

  it('uses a compact responsive container without a competing shell or fixed desktop width', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(needs)));
    const { container } = render(<DashboardPropertySetup />);
    await screen.findByLabelText('Property name');
    expect(container.querySelector('main')).toHaveClass('px-4');
    expect(container.querySelector('section')).toHaveClass('w-full', 'max-w-xl');
    expect(container.querySelector('[class*="min-w-"]')).not.toBeInTheDocument();
  });
});
