/**
 * Database Transform Utilities
 *
 * Converts between database snake_case format and TypeScript camelCase format.
 * Use these utilities at the boundary between database queries and application code
 * to maintain consistent naming conventions.
 *
 * Last Modified: 2026-01-20
 */

import type { Database } from './supabase';
import type { Item, ItemArticle, ItemLink, Property, Account, User } from '@/types';

// Database row types
type DbItem = Database['public']['Tables']['items']['Row'];
type DbArticle = Database['public']['Tables']['item_articles']['Row'];
type DbLink = Database['public']['Tables']['item_links']['Row'];
type DbProperty = Database['public']['Tables']['properties']['Row'];
type DbAccount = Database['public']['Tables']['accounts']['Row'];
type DbUser = Database['public']['Tables']['users']['Row'];

/**
 * Generic utility to convert snake_case keys to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Generic utility to convert camelCase keys to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert an object's keys from snake_case to camelCase
 */
export function transformKeys<T extends Record<string, unknown>>(
  obj: T,
  transformer: (key: string) => string
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = transformer(key);
    result[newKey] = value;
  }
  return result;
}

// =============================================================================
// Item Transforms
// =============================================================================

/**
 * Convert database item row to TypeScript Item type
 */
export function dbItemToItem(dbItem: DbItem): Item {
  return {
    id: dbItem.id,
    publicId: dbItem.public_id,
    name: dbItem.name,
    description: dbItem.description,
    qrCodeUrl: dbItem.qr_code_url,
    qrCodeUploadedAt: dbItem.qr_code_uploaded_at,
    propertyId: dbItem.property_id,
    tags: dbItem.tags || [],
    createdAt: dbItem.created_at || '',
    updatedAt: dbItem.updated_at || '',
  };
}

/**
 * Convert TypeScript Item to database insert format
 */
export function itemToDbItem(item: Partial<Item>): Partial<DbItem> {
  const result: Partial<DbItem> = {};

  if (item.id !== undefined) result.id = item.id;
  if (item.publicId !== undefined) result.public_id = item.publicId;
  if (item.name !== undefined) result.name = item.name;
  if (item.description !== undefined) result.description = item.description;
  if (item.qrCodeUrl !== undefined) result.qr_code_url = item.qrCodeUrl;
  if (item.qrCodeUploadedAt !== undefined) result.qr_code_uploaded_at = item.qrCodeUploadedAt;
  if (item.propertyId !== undefined) result.property_id = item.propertyId;
  if (item.tags !== undefined) result.tags = item.tags;

  return result;
}

// =============================================================================
// Article Transforms
// =============================================================================

/**
 * Convert database article row to TypeScript ItemArticle type
 */
export function dbArticleToArticle(dbArticle: DbArticle): ItemArticle {
  return {
    id: dbArticle.id,
    itemId: dbArticle.item_id,
    purpose: dbArticle.purpose as ItemArticle['purpose'],
    title: dbArticle.title,
    description: dbArticle.description,
    displayOrder: dbArticle.display_order || 0,
    createdAt: dbArticle.created_at || '',
    updatedAt: dbArticle.updated_at || '',
  };
}

/**
 * Convert TypeScript ItemArticle to database insert format
 */
export function articleToDbArticle(article: Partial<ItemArticle>): Partial<DbArticle> {
  const result: Partial<DbArticle> = {};

  if (article.id !== undefined) result.id = article.id;
  if (article.itemId !== undefined) result.item_id = article.itemId;
  if (article.purpose !== undefined) result.purpose = article.purpose;
  if (article.title !== undefined) result.title = article.title;
  if (article.description !== undefined) result.description = article.description;
  if (article.displayOrder !== undefined) result.display_order = article.displayOrder;

  return result;
}

// =============================================================================
// Link Transforms
// =============================================================================

/**
 * Convert database link row to TypeScript ItemLink type
 */
export function dbLinkToLink(dbLink: DbLink): ItemLink {
  return {
    id: dbLink.id,
    item_id: dbLink.item_id || '',
    article_id: dbLink.article_id,
    title: dbLink.title,
    link_type: dbLink.link_type as ItemLink['link_type'],
    url: dbLink.url,
    thumbnail_url: dbLink.thumbnail_url,
    display_order: dbLink.display_order || 0,
    created_at: dbLink.created_at || '',
  };
}

// =============================================================================
// Property Transforms
// =============================================================================

/**
 * Convert database property row to TypeScript Property type
 */
export function dbPropertyToProperty(dbProperty: DbProperty): Property {
  return {
    id: dbProperty.id,
    user_id: dbProperty.user_id,
    property_type_id: dbProperty.property_type_id,
    nickname: dbProperty.nickname,
    address: dbProperty.address,
    created_at: dbProperty.created_at || '',
    updated_at: dbProperty.updated_at || '',
    account_id: dbProperty.account_id,
  };
}

// =============================================================================
// Account Transforms
// =============================================================================

/**
 * Convert database account row to TypeScript Account type
 */
export function dbAccountToAccount(dbAccount: DbAccount): Account {
  return {
    id: dbAccount.id,
    owner_id: dbAccount.owner_id,
    name: dbAccount.name,
    description: dbAccount.description,
    settings: (dbAccount.settings as Record<string, unknown>) || {},
    created_at: dbAccount.created_at || '',
    updated_at: dbAccount.updated_at || '',
  };
}

// =============================================================================
// User Transforms
// =============================================================================

/**
 * Convert database user row to TypeScript User type
 */
export function dbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    full_name: dbUser.full_name,
    role: dbUser.role,
    created_at: dbUser.created_at || '',
    updated_at: dbUser.updated_at || '',
    is_admin: dbUser.is_admin,
    profile_picture: dbUser.profile_picture,
    auth_provider: dbUser.auth_provider,
  };
}

// =============================================================================
// Batch Transform Utilities
// =============================================================================

/**
 * Transform an array of database items to TypeScript Items
 */
export function dbItemsToItems(dbItems: DbItem[]): Item[] {
  return dbItems.map(dbItemToItem);
}

/**
 * Transform an array of database articles to TypeScript ItemArticles
 */
export function dbArticlesToArticles(dbArticles: DbArticle[]): ItemArticle[] {
  return dbArticles.map(dbArticleToArticle);
}

/**
 * Transform an array of database links to TypeScript ItemLinks
 */
export function dbLinksToLinks(dbLinks: DbLink[]): ItemLink[] {
  return dbLinks.map(dbLinkToLink);
}

/**
 * Safe property accessor that handles both snake_case and camelCase
 * Useful during migration period when data may come in either format
 */
export function getProperty<T>(
  obj: Record<string, unknown>,
  camelKey: string,
  snakeKey: string,
  defaultValue: T
): T {
  const value = obj[camelKey] ?? obj[snakeKey];
  return (value as T) ?? defaultValue;
}
