import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.print');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
