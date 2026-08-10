import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from '@/components/LoginForm';
import RegistrationForm from '@/components/RegistrationForm';
import LoginPageContent from '@/app/login/LoginPageContent';
import ForgotPasswordPage from '@/app/forgot-password/page';
import ResetPasswordPage from '@/app/reset-password/page';
import { AuthPageProviderBoundary } from '@/components/auth/AuthPageProviderBoundary';

const push = vi.fn();
const navigationState = vi.hoisted(() => ({ pathname: '/login' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => navigationState.pathname,
}));
vi.mock('next/dynamic', () => ({
  default: () => ({ children }: { children: React.ReactNode }) => (
    <div data-testid="legacy-application-providers">{children}</div>
  ),
}));
vi.mock('next/image', () => ({ default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} /> }));

describe('canonical auth forms', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    navigationState.pathname = '/login';
  });

  it.each(['/login', '/register', '/forgot-password', '/reset-password', '/dashboard2', '/dashboard2/create', '/item/5abcdef0-0000-4000-8000-000000000001'])(
    'keeps %s outside the legacy application provider stack',
    (pathname) => {
      navigationState.pathname = pathname;
      const { container } = render(
        <AuthPageProviderBoundary><p>provider-free auth page</p></AuthPageProviderBoundary>
      );
      expect(container).toHaveTextContent('provider-free auth page');
      expect(container.querySelector('footer')).not.toBeInTheDocument();
      expect(screen.queryByTestId('legacy-application-providers')).not.toBeInTheDocument();
    }
  );

  it.each(['/dashboard2/items']) (
    'retains the dynamically separated root legacy providers for nested route %s',
    (pathname) => {
      navigationState.pathname = pathname;
      render(<AuthPageProviderBoundary><p>nested dashboard</p></AuthPageProviderBoundary>);
      expect(screen.getByTestId('legacy-application-providers')).toContainElement(
        screen.getByText('nested dashboard')
      );
    }
  );

  it('has explicit labels, autocomplete, recovery and registration links, with Google hidden by default', () => {
    render(<LoginPageContent />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
    const password = screen.getByLabelText('Password');
    const recoveryLink = screen.getByRole('link', { name: 'Forgot password?' });
    expect(recoveryLink).toHaveAttribute('href', '/forgot-password');
    expect(password.compareDocumentPosition(recoveryLink) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('link', { name: 'Continue with Google' })).not.toBeInTheDocument();
  });

  it('shows Google only as a secondary configured compatibility link', () => {
    render(<LoginForm showGoogleCompatibility />);
    expect(screen.getByText('Already use Google with FAQBNB?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute('href', '/api/auth/google');
  });

  it('prevents duplicate login submits and accepts only the canonical server destination', async () => {
    let resolveFetch!: (value: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'host@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'host-guide-2026');
    const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
    resolveFetch(new Response(JSON.stringify({ success: true, next: 'https://evil.test' }), { status: 200 }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sign in failed');
    expect(push).not.toHaveBeenCalled();
  });

  it('uses the shared password rule and exposes complete registration labels/autocomplete', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    const complete = vi.fn();
    render(<RegistrationForm onComplete={complete} />);
    expect(screen.getByLabelText(/Display name/)).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getAllByText(/10 to 128 characters/)).toHaveLength(1);
    await userEvent.type(screen.getByLabelText('Email'), 'host@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'short1');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'short1');
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('10 to 128');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('prevents duplicate registration submissions while preserving the short form', async () => {
    let resolveFetch!: (value: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    render(<RegistrationForm onComplete={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Email'), 'host@example.test');
    await userEvent.type(screen.getByLabelText('Password'), 'host-guide-2026');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'host-guide-2026');
    const form = screen.getByRole('button', { name: 'Create account' }).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Creating account…' })).toBeDisabled();
    resolveFetch(new Response(JSON.stringify({ success: true }), { status: 202 }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it('keeps recovery request accessible, generic, and duplicate-submit safe', async () => {
    let resolveFetch!: (value: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { resolveFetch = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    render(<ForgotPasswordPage />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    await userEvent.type(screen.getByLabelText('Email'), 'host@example.test');
    const form = screen.getByRole('button', { name: 'Send recovery link' }).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFetch(new Response(JSON.stringify({ success: true }), { status: 202 }));
    expect(await screen.findByRole('status')).toHaveTextContent('If an account exists');
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/login');
  });

  it('keeps reset accessible and collapses an invalid proof to one recovery action', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: false,
      error: { code: 'RECOVERY_SESSION_REQUIRED', message: 'This recovery link is invalid or has expired.' },
    }), { status: 401 })));
    render(<ResetPasswordPage />);
    expect(screen.getByLabelText('New password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('New password')).toHaveAttribute('aria-describedby', 'reset-password-help');
    await userEvent.type(screen.getByLabelText('New password'), 'new-password-2026');
    await userEvent.type(screen.getByLabelText('Confirm new password'), 'new-password-2026');
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('invalid or has expired');
    const links = screen.getAllByRole('link');
    expect(links.filter((link) => link.textContent === 'Request another link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Request another link' })).toHaveAttribute('href', '/forgot-password');
  });
});
