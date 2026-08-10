import { cache } from 'react';
import { readPublicItem, type PublicItemClient, type PublicItemResult } from '@/lib/item-boundary';
import { createPublicSupabaseServer } from '@/lib/supabase-public-server';

/** Request-cache shared by guest metadata and page rendering; never performs an HTTP self-fetch. */
export const loadPublicItem = cache(async (publicId: string): Promise<PublicItemResult> => {
  try {
    return await readPublicItem(createPublicSupabaseServer() as unknown as PublicItemClient, publicId);
  } catch {
    return {
      success: false,
      error: {
        code: 'PUBLIC_ITEM_UNAVAILABLE',
        message: 'This guest page is temporarily unavailable.',
        status: 503,
      },
    };
  }
});
