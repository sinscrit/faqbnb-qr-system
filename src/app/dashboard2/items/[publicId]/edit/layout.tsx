import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ publicId: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { publicId } = await params;
  const t = await getTranslations('metadata.item');

  // For edit page, we could fetch item name, but for simplicity use generic
  // If needed, implement item fetch here
  return {
    title: t('edit.title', { itemName: 'Item' }),
    description: t('edit.description', { itemName: 'Item' }),
  };
}

export default function ItemEditLayout({
  children,
}: LayoutProps) {
  return children;
}
