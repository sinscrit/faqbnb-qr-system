import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { headers, cookies } from 'next/headers';
import ItemDisplay from '@/components/ItemDisplay';
import { Metadata } from 'next';
import { getItemByPublicId } from '@/data/demo-data';
import { getTranslations, getLocale } from 'next-intl/server';
import type { SupportedLanguage } from '@/types/l10n';
import { mapToSupportedLanguage } from '@/lib/i18n/guest-language';

interface PageProps {
  params: Promise<{ publicId: string }>;
  /** URL search parameters for language detection */
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// =============================================================================
// Language Detection Helper
// =============================================================================

/**
 * Detects guest language preference with priority cascade.
 *
 * Priority order:
 * 1. URL parameter (?lang=xx) - highest priority, enables shareable links
 * 2. Cookie (FAQBNB_GUEST_LANG) - persisted preference from previous visit
 * 3. Accept-Language header - browser/OS language preference
 * 4. Default 'en' - fallback for all other cases
 *
 * @param searchParams - The resolved URL search parameters
 * @returns The detected SupportedLanguage
 */
async function detectGuestLanguagePreference(
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<SupportedLanguage> {
  try {
    // Priority 1: Check URL parameter ?lang=
    const langParam = searchParams.lang;
    if (typeof langParam === 'string' && langParam) {
      const detected = mapToSupportedLanguage(langParam);
      if (detected) {
        console.log('[item-page] Language from URL param:', detected);
        return detected;
      }
    }

    // Priority 2: Check cookie for persisted preference
    const cookieStore = await cookies();
    const langCookie = cookieStore.get('FAQBNB_GUEST_LANG')?.value;
    if (langCookie) {
      const detected = mapToSupportedLanguage(langCookie);
      if (detected) {
        console.log('[item-page] Language from cookie:', detected);
        return detected;
      }
    }

    // Priority 3: Check Accept-Language header
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      // Parse Accept-Language header - take first supported language
      const locales = acceptLanguage.split(',').map(lang => {
        const [code] = lang.trim().split(';');
        return code.split('-')[0].toLowerCase();
      });

      for (const locale of locales) {
        const detected = mapToSupportedLanguage(locale);
        if (detected) {
          console.log('[item-page] Language from header:', detected);
          return detected;
        }
      }
    }

    // Priority 4: Default fallback
    console.log('[item-page] Using default language: en');
    return 'en';
  } catch (error) {
    console.error('[item-page] Language detection error:', error);
    return 'en';
  }
}

// =============================================================================
// Metadata Generation
// =============================================================================

// Generate metadata for SEO with i18n support and translation support
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const t = await getTranslations('metadata.item');
  const locale = await getLocale();

  try {
    const { publicId } = await params;
    const resolvedSearchParams = await searchParams;

    // Detect guest language for metadata
    const requestedLanguage = await detectGuestLanguagePreference(resolvedSearchParams);
    console.log('[item-page] Metadata language:', requestedLanguage);

    // Try public API with translation support first
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/items/${publicId}`;
    const url = new URL(apiUrl);
    url.searchParams.set('lang', requestedLanguage);

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (response.ok) {
      const itemData = await response.json();
      // API returns translated content in item fields
      const item = itemData;
      const translationMeta = itemData.translationMeta;

      // Use translated name and description directly from API response
      const displayName = item.name;
      const displayDescription = item.description;

      // Generate alternate language links for SEO (hreflang)
      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000';
      const availableLanguages = translationMeta?.availableTranslations || ['en'];
      const alternateLanguages = availableLanguages.reduce(
        (acc: Record<string, string>, lang: SupportedLanguage) => {
          acc[lang] = `${baseUrl}/item/${publicId}?lang=${lang}`;
          return acc;
        },
        {} as Record<string, string>
      );

      return {
        metadataBase: new URL(baseUrl),
        title: displayName,
        description: displayDescription || t('view.description', { itemName: displayName }),
        openGraph: {
          title: displayName,
          description: displayDescription || t('view.ogDescription', { itemName: displayName }),
          type: 'website',
          locale: translationMeta?.displayLanguage || locale,
        },
        // SEO: Canonical URL without language parameter prevents duplicate content issues
        // hreflang alternate links tell search engines about language variants
        alternates: {
          canonical: `${baseUrl}/item/${publicId}`,
          languages: alternateLanguages,
        },
      };
    }

    // Fallback to demo data (no translations available)
    const demoItem = getItemByPublicId(publicId);
    if (demoItem) {
      const demoBaseUrl = process.env.NODE_ENV === 'production' ? 'https://faqbnb.com' : 'http://localhost:3000';
      return {
        metadataBase: new URL(demoBaseUrl),
        title: t('view.title', { itemName: demoItem.name }),
        description: demoItem.description || t('view.description', { itemName: demoItem.name }),
        openGraph: {
          title: t('view.ogTitle', { itemName: demoItem.name }),
          description: demoItem.description || t('view.ogDescription', { itemName: demoItem.name }),
          type: 'website',
          locale: locale,
        },
        // SEO: Canonical URL without language parameter
        alternates: {
          canonical: `${demoBaseUrl}/item/${publicId}`,
        },
      };
    }

    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  } catch {
    const tError = await getTranslations('metadata.item');
    return {
      title: tError('notFound.title'),
      description: tError('notFound.description'),
    };
  }
}

// =============================================================================
// Main Page Component
// =============================================================================

export default async function ItemPage({ params, searchParams }: PageProps) {
  try {
    const { publicId } = await params;
    const resolvedSearchParams = await searchParams;

    // Detect guest language preference
    const requestedLanguage = await detectGuestLanguagePreference(resolvedSearchParams);
    console.log('[item-page] Detected language:', requestedLanguage);

    // Try public API with translation support first
    const apiUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/public/items/${publicId}`;
    const url = new URL(apiUrl);
    url.searchParams.set('lang', requestedLanguage);
    console.log('[item-page] Fetching with URL:', url.toString());

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (response.ok) {
      const itemData = await response.json();
      console.log('[item-page] Translation metadata:', itemData.translationMeta);

      // Extract translation metadata from API response
      // Expected structure: { item fields..., translationMeta: { requestedLanguage, displayLanguage, sourceLanguage, isTranslated } }
      const translationMeta = itemData.translationMeta;

      // Pass translation metadata to ItemDisplay for rendering
      // Suspense required for useSearchParams in useGuestLanguage hook (REQ-E04-019)
      return (
        <Suspense fallback={<ItemDisplaySkeleton />}>
          <ItemDisplay
            item={itemData}
            translationMeta={{
              requestedLanguage: translationMeta?.requestedLanguage || requestedLanguage,
              displayLanguage: translationMeta?.displayLanguage || 'en',
              availableLanguages: translationMeta?.availableTranslations || ['en'],
              isTranslated: translationMeta?.isTranslated || false,
              originalLanguage: translationMeta?.sourceLanguage || 'en',
            }}
          />
        </Suspense>
      );
    }

    // Fallback to demo data if API fails
    console.log(`[item-page] API failed for ${publicId}, falling back to demo data`);
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

    // Demo data has no translations - provide default metadata
    // Suspense required for useSearchParams in useGuestLanguage hook (REQ-E04-019)
    return (
      <Suspense fallback={<ItemDisplaySkeleton />}>
        <ItemDisplay
          item={itemData}
          translationMeta={{
            requestedLanguage: 'en',
            displayLanguage: 'en',
            availableLanguages: ['en'],
            isTranslated: false,
            originalLanguage: 'en',
          }}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('[item-page] Error in ItemPage:', error);
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

// =============================================================================
// Skeleton Loading Component
// =============================================================================

/**
 * Loading skeleton for ItemDisplay during Suspense fallback.
 * Shown while useSearchParams is being resolved in client components.
 */
function ItemDisplaySkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Description Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>

        {/* Links Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="aspect-video bg-gray-100 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

