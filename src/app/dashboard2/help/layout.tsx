import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dashboard.help');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
