import { notFound } from 'next/navigation';
import ItemDisplay from '@/components/ItemDisplay';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ publicId: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { publicId } = await params;
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/items/${publicId}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      return {
        title: 'Item Not Found',
        description: 'The requested item could not be found.',
      };
    }

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
    // Fetch item data server-side
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/items/${publicId}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('Failed to fetch item');
    }

    const itemResponse = await response.json();

    if (!itemResponse.success || !itemResponse.data) {
      notFound();
    }

    return <ItemDisplay item={itemResponse.data} />;
  } catch (error) {
    console.error('Error fetching item:', error);
    notFound();
  }
}

// Generate static params for known items (optional optimization)
export async function generateStaticParams() {
  try {
    // In a real app, you might want to pre-generate pages for known items
    // For now, we'll return an empty array to use dynamic rendering
    return [];
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

