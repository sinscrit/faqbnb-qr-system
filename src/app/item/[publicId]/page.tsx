import { notFound } from 'next/navigation';
import ItemDisplay from '@/components/ItemDisplay';
import { Metadata } from 'next';
import { getItemByPublicId } from '@/data/demo-data';
import { getTranslations, getLocale } from 'next-intl/server';

interface PageProps {
  params: Promise<{ publicId: string }>;
}

// Generate metadata for SEO with i18n support
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const t = await getTranslations('metadata.item');
  const locale = await getLocale();

  try {
    const { publicId } = await params;

    // Try API first
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/items/${publicId}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (response.ok) {
      const { data: item } = await response.json();
      return {
        metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
        title: t('view.title', { itemName: item.name }),
        description: item.description || t('view.description', { itemName: item.name }),
        openGraph: {
          title: t('view.ogTitle', { itemName: item.name }),
          description: item.description || t('view.ogDescription', { itemName: item.name }),
          type: 'website',
          locale: locale,
        },
      };
    }

    // Fallback to demo data
    const demoItem = getItemByPublicId(publicId);
    if (demoItem) {
      return {
        metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
        title: t('view.title', { itemName: demoItem.name }),
        description: demoItem.description || t('view.description', { itemName: demoItem.name }),
        openGraph: {
          title: t('view.ogTitle', { itemName: demoItem.name }),
          description: demoItem.description || t('view.ogDescription', { itemName: demoItem.name }),
          type: 'website',
          locale: locale,
        },
      };
    }

    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  } catch (error) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  }
}

export default async function ItemPage({ params }: PageProps) {
  try {
    const { publicId } = await params;
    
    // Try to fetch from API first
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/items/${publicId}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (response.ok) {
      const itemResponse = await response.json();
      if (itemResponse.success && itemResponse.data) {
        return <ItemDisplay item={itemResponse.data} />;
      }
    }

    // Fallback to demo data if API fails
    console.log(`API failed for ${publicId}, falling back to demo data`);
    const demoItem = getItemByPublicId(publicId);
    
    if (!demoItem) {
      notFound();
    }

    // Transform demo data to match expected format
    const itemData = {
      id: demoItem.id,
      publicId: demoItem.publicId,
      name: demoItem.name,
      description: demoItem.description,
      links: demoItem.links.map(link => ({
        id: link.id,
        title: link.title,
        linkType: link.linkType,
        url: link.url,
        thumbnailUrl: link.thumbnailUrl,
        displayOrder: link.displayOrder,
      })),
    };

    return <ItemDisplay item={itemData} />;
  } catch (error) {
    console.error('Error in ItemPage:', error);
    notFound();
  }
}

// Generate static params for known items (optional optimization)
export async function generateStaticParams() {
  try {
    // Return empty array to use dynamic rendering
    return [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

