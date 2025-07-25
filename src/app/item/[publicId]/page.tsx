import { notFound } from 'next/navigation';
import ItemDisplay from '@/components/ItemDisplay';
import { Metadata } from 'next';
import { getItemByPublicId } from '@/data/demo-data';

interface PageProps {
  params: Promise<{ publicId: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
        title: `${item.name} - FAQBNB`,
        description: item.description || `View instructions and resources for ${item.name}`,
        openGraph: {
          title: item.name,
          description: item.description || `View instructions and resources for ${item.name}`,
          type: 'website',
        },
      };
    }
    
    // Fallback to demo data
    const demoItem = getItemByPublicId(publicId);
    if (demoItem) {
      return {
        metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000'),
        title: `${demoItem.name} - FAQBNB`,
        description: demoItem.description || `View instructions and resources for ${demoItem.name}`,
        openGraph: {
          title: demoItem.name,
          description: demoItem.description || `View instructions and resources for ${demoItem.name}`,
          type: 'website',
        },
      };
    }

    return {
      title: 'Item Not Found',
      description: 'The requested item could not be found.',
    };
  } catch (error) {
    return {
      title: 'FAQBNB',
      description: 'View item instructions and resources',
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

