import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Dashboard2LayoutClient from './Dashboard2LayoutClient';

/**
 * Dashboard2 Layout (Server Component)
 *
 * Server-side layout wrapper that provides metadata generation
 * and wraps the client-side Dashboard2LayoutClient component.
 *
 * @route /dashboard2
 * @created 2026-01-06
 * @modified 2026-01-22 - Refactored to server component for metadata support
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.home');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function Dashboard2Layout({ children }: { children: React.ReactNode }) {
  return <Dashboard2LayoutClient>{children}</Dashboard2LayoutClient>;
}
