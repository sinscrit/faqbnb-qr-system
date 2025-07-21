import { notFound } from 'next/navigation';
import ItemDisplay from '@/components/ItemDisplay-static';
import { Metadata } from 'next';
import { getItemByPublicId, getAllItems } from '@/data/demo-data';

interface PageProps {
  params: Promise<{ publicId: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const item = getItemByPublicId(publicId);
  
  if (!item) {
    return {
      title: 'Item Not Found',
      description: 'The requested item could not be found.',
    };
  }

  return {
    title: `${item.name} - FAQBNB`,
    description: item.description || `Information and resources for ${item.name}`,
    openGraph: {
      title: item.name,
      description: item.description || `Information and resources for ${item.name}`,
      type: 'website',
    },
  };
}

export default async function ItemPage({ params }: PageProps) {
  const { publicId } = await params;
  const item = getItemByPublicId(publicId);

  if (!item) {
    notFound();
  }

  // Transform demo data to match expected format
  const itemData = {
    id: item.id,
    publicId: item.publicId,
    name: item.name,
    description: item.description,
    links: item.links.map(link => ({
      id: link.id,
      title: link.title,
      linkType: link.linkType,
      url: link.url,
      thumbnailUrl: link.thumbnailUrl,
      displayOrder: link.displayOrder,
    })),
  };

  return <ItemDisplay item={itemData} />;
}

// Generate static params for all demo items
export async function generateStaticParams() {
  const items = getAllItems();
  return items.map((item) => ({
    publicId: item.publicId,
  }));
}

