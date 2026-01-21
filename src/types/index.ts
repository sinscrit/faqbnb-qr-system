import { ReactionCounts } from './reactions';
import { Session } from '@supabase/supabase-js';
import { AccessRequest } from './admin';
import type { SupportedLanguage } from '@/contexts/LocaleContext';

// Database types
export interface Item {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  qrCodeUrl: string | null;
  qrCodeUploadedAt: string | null;
  propertyId: string; // NEW: Association with property
  tags: string[]; // Tags for categorization, room tags use format #room.roomname
  createdAt: string;
  updatedAt: string;
}

// Multi-tenant account and user management types
export interface Account {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  settings: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
  // Enhanced: User's role in this account (REQ-024)
  userRole?: AccountRole | null;
}

export interface AccountUser {
  account_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_at: string | null;
  joined_at: string | null;
  created_at: string | null;
}

export type AccountRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name: string | null;
  role: string | null;
  is_admin?: boolean | null;
  profilePicture?: string;
  authProvider?: string;
  created_at: string | null;
  updated_at: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyType {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  created_at: string | null;
}

export interface Property {
  id: string;
  user_id: string;
  property_type_id: string;
  account_id: string | null; // NEW: Account association
  nickname: string;
  address: string | null;
  thumbnail_url?: string | null; // REQ-135: Optional property image
  created_at: string | null;
  updated_at: string | null;
  // Populated relationships
  property_types?: PropertyType;
  users?: User;
}

export interface ItemLink {
  id: string;
  item_id: string;
  /** Optional reference to parent article (FK → item_articles.id) */
  article_id?: string | null;
  title: string;
  link_type: LinkType;
  url: string;
  thumbnail_url: string | null;
  display_order: number;
  created_at: string;
}

export type LinkType = 'youtube' | 'pdf' | 'image' | 'text';

// Purpose categories for item articles (REQ-151)
export type PurposeType =
  | 'how-to-use'
  | 'how-to-clean'
  | 'troubleshooting'
  | 'safety-info'
  | 'maintenance'
  | 'features'
  | 'other';

// Article representing grouped content by purpose (REQ-151)
export interface ItemArticle {
  id: string;
  itemId: string;
  purpose: PurposeType;
  title: string;
  description?: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  links?: ItemLink[];
  // REQ-212: Item data included when listing articles by property_id
  item?: {
    id: string;
    name: string;
    tags: string[];
  };
}

// API Response types
export interface ItemResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description: string;
    qrCodeUrl?: string;
    qrCodeUploadedAt?: string;
    links: {
      id: string;
      /** Reference to parent article (optional for backward compatibility) */
      articleId?: string;
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
    /** Grouped content organized by article/purpose */
    articles?: {
      id: string;
      purpose: PurposeType;
      title: string;
      description?: string;
      displayOrder: number;
      links: {
        id: string;
        title: string;
        linkType: LinkType;
        url: string;
        thumbnailUrl?: string;
        displayOrder: number;
      }[];
    }[];
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  /**
   * Array of translation job IDs for status tracking.
   * Populated when translation jobs are queued during item creation or updates.
   * Empty array if translation queuing was skipped or failed.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationJobIds?: string[];
  /**
   * Translation error message if queuing failed.
   * Item creation/update succeeds even if translation fails.
   * Only present when there was an error during translation queuing.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationError?: string;
  /**
   * Languages queued for translation.
   * Contains the target languages (excludes source language).
   * @since Epic 3 - Dynamic Content Translation
   */
  queuedLanguages?: SupportedLanguage[];
}

export interface ItemsListResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    description?: string;
    qrCodeUrl?: string;
    createdAt: string;
    updatedAt?: string;
    propertyId: string;
    property: any; // Property object with account info
    linksCount: number;
    articlesCount: number; // REQ-151: Article count
    links?: Array<{ title: string; url: string; linkType: string }>;
    analytics: {
      visits: {
        last24Hours: number;
        last7Days: number;
        allTime: number;
      };
      reactions: {
        total: number;
        byType: {
          like: number;
          dislike: number;
          love: number;
          confused: number;
          total: number;
        };
      };
    };
  }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  error?: string;
}

// Property API Response types
export interface PropertyResponse {
  success: boolean;
  data?: Property;
  error?: string;
  message?: string;
}

export interface PropertiesListResponse {
  success: boolean;
  data?: Property[];
  isAdmin?: boolean;
  error?: string;
}

export interface PropertyTypesResponse {
  success: boolean;
  data?: PropertyType[];
  error?: string;
}

export interface UsersListResponse {
  success: boolean;
  data?: User[];
  error?: string;
}

// Article API Request/Response Types (REQ-151, REQ-152)
/**
 * Request payload for creating an article.
 * @see Plan-094 Phase 0 Task 0.4
 */
export interface CreateArticleRequest {
  /** Item ID this article belongs to */
  itemId: string;
  /** Purpose/intent category */
  purpose: PurposeType;
  /** Article title (typically auto-generated from purpose + item name) */
  title?: string;
  /** Optional description */
  description?: string;
  /** Display order (defaults to end of list if not specified) */
  displayOrder?: number;
  /** Links to include in this article (optional for initial creation) */
  links?: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
  /**
   * Optional source language override for translations.
   * If not provided, source language is detected from user/account preferences.
   * @see detectSourceLanguage() in @/lib/content-translation
   * @since Epic 3 - Dynamic Content Translation
   */
  sourceLanguage?: SupportedLanguage;
}

/**
 * Request payload for updating an existing article.
 */
export interface UpdateArticleRequest {
  /** Updated purpose/intent category */
  purpose?: PurposeType;
  /** Updated article title */
  title?: string;
  /** Updated description */
  description?: string | null;
  /** Updated display order */
  displayOrder?: number;
  /** Updated links (replaces existing if provided) */
  links?: {
    id?: string;
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
  /** Optional: Update item's tags (REQ-214) */
  itemTags?: string[];
}

export interface ArticleResponse {
  success: boolean;
  data?: ItemArticle;
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
  /**
   * Array of translation job IDs for status tracking.
   * Populated when translation jobs are queued during article creation or updates.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationJobIds?: string[];
  /**
   * Translation error message if queuing failed.
   * Article creation/update succeeds even if translation fails.
   * @since Epic 3 - Dynamic Content Translation
   */
  translationError?: string;
  /**
   * Languages queued for translation.
   * @since Epic 3 - Dynamic Content Translation
   */
  queuedLanguages?: SupportedLanguage[];
}

export interface ArticlesListResponse {
  success: boolean;
  data?: ItemArticle[];
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

// Form types
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string; // NEW: Required property association
  tags?: string[]; // Optional tags for categorization (REQ-215)
  qrCodeUrl?: string;
  links: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
  /**
   * Optional articles with nested links for article-based creation.
   * When provided, links are organized under articles instead of flat list.
   * @see Plan-094 Article-based content model
   */
  articles?: {
    purpose: PurposeType;
    title: string;
    description?: string;
    displayOrder: number;
    links?: {
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
  }[];
  /**
   * Optional source language override for translations.
   * If not provided, source language is detected from user/account preferences.
   * @see detectSourceLanguage() in @/lib/content-translation
   * @since Epic 3 - Dynamic Content Translation
   */
  sourceLanguage?: SupportedLanguage;
}

export interface UpdateItemRequest extends CreateItemRequest {
  id: string;
  qrCodeUrl?: string;
  links: {
    id?: string;
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
  /**
   * Optional articles with nested links for article-based updates.
   * When provided, replaces existing articles with the new set.
   */
  articles?: {
    id?: string;
    purpose: PurposeType;
    title: string;
    description?: string;
    displayOrder: number;
    links?: {
      id?: string;
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
  }[];
}

// Property Form types
export interface CreatePropertyRequest {
  nickname: string;
  address?: string;
  propertyTypeId: string;
  userId?: string; // Optional for admin creating properties for other users
}

export interface UpdatePropertyRequest extends CreatePropertyRequest {
  id: string;
}

// Property Form validation types
export interface PropertyFormData {
  nickname: string;
  address: string;
  propertyTypeId: string;
}

export interface PropertyValidationErrors {
  nickname?: string;
  address?: string;
  propertyTypeId?: string;
  general?: string;
}

// Component props types
export interface LinkCardProps {
  title: string;
  linkType: LinkType;
  url: string;
  thumbnailUrl?: string;
  onClick: () => void;
}

export interface ItemDisplayProps {
  item: ItemResponse['data'];
}

export interface AdminItemFormProps {
  item?: ItemResponse['data'];
  properties?: Property[]; // NEW: Available properties for selection
  onSave: (item: CreateItemRequest | UpdateItemRequest) => Promise<void>;
  onCancel: () => void;
}

// Property Component props types
export interface PropertyFormProps {
  property?: Property;
  propertyTypes: PropertyType[];
  users?: User[]; // For admin creating properties for other users
  onSave: (property: CreatePropertyRequest | UpdatePropertyRequest) => Promise<void>;
  onCancel: () => void;
}

export interface PropertyListProps {
  properties: Property[];
  isAdmin: boolean;
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => void;
  onCreate: () => void;
}

export interface PropertySelectorProps {
  properties: Property[];
  selectedPropertyId?: string;
  onSelect: (propertyId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// REQ-142: Property Context System Types

/**
 * Property context state for dashboard filtering
 */
export interface PropertyContextState {
  /** Currently selected property ID, null means "All Properties" */
  selectedPropertyId: string | null;
  /** List of available properties for the current user */
  properties: Property[];
  /** Loading state for properties */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Whether the context has been initialized */
  isInitialized: boolean;
}

/**
 * Property context value exposed by the provider
 */
export interface PropertyContextValue extends PropertyContextState {
  /** Set the selected property ID */
  setSelectedPropertyId: (propertyId: string | null) => void;
  /** Refresh the properties list */
  refreshProperties: () => Promise<void>;
  /** Get the currently selected property object */
  selectedProperty: Property | null;
  /** Check if a specific property is selected */
  isPropertySelected: (propertyId: string) => boolean;
}

/**
 * Props for ItemViewModal component
 */
export interface ItemViewModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** The item to display */
  item: ItemWithDetails | null;
  /** Callback when edit is clicked */
  onEdit?: (item: ItemWithDetails) => void;
  /** Callback when delete is clicked */
  onDelete?: (item: ItemWithDetails) => void;
}

/**
 * Extended item type with full details for view modal
 */
export interface ItemWithDetails {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  propertyId: string;
  property?: Property;
  tags: string[]; // Tags for categorization, room tags use format #room.roomname
  qrCodeUrl: string | null;
  createdAt: string;
  updatedAt: string;
  links: ItemLink[];
  /** Grouped content organized by article/purpose (populated when joined) */
  articles?: ItemArticle[];
  /** Count of associated media files for delete warning */
  mediaCount?: number;
}

/**
 * Props for DeleteItemDialog component
 */
export interface DeleteItemDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** The item to delete */
  item: ItemWithDetails | null;
  /** Callback when deletion is confirmed */
  onConfirm: () => void;
  /** Callback when dialog is cancelled */
  onCancel: () => void;
  /** Loading state during deletion */
  isDeleting?: boolean;
}

// QR Code types
export * from './qrcode';

// Analytics types
export * from './analytics';

// Reaction types
export * from './reactions';

// Domain Configuration types
export interface DomainConfig {
  override: string | null;
  fallback: string;
  isValid: boolean;
}

export interface QRCodeConfig {
  domain: string;
  protocol: 'https' | 'http';
  baseUrl: string;
}

// Registration and Access Code types (REQ-018)
export interface RegistrationRequest {
  email: string;
  password: string;
  fullName?: string;
  confirmPassword?: string;
  accessCode: string;
}

export interface AccessCodeValidation {
  isValid: boolean;
  request?: AccessRequest;
  account?: Account;
  error?: string;
  errorCode?: string;
  metadata?: {
    requestType: string;
    hasAccount: boolean;
    accountName?: string;
    isConsumable: boolean;
  };
}

export interface OAuthUserData {
  email: string;
  fullName?: string;
  picture?: string;
  provider: 'google';
  providerId: string;
}

// OAuth Registration types (REQ-020 Task 5.1)
/**
 * OAuth registration request interface for completing registration after OAuth authentication
 * Used with the /api/auth/complete-oauth-registration endpoint
 */
export interface OAuthRegistrationRequest {
  /** Access code from the registration invitation */
  accessCode: string;
  /** Email address from OAuth provider (must match access request) */
  email: string;
}

/**
 * OAuth registration result interface
 * Extends the standard RegistrationResult with OAuth-specific fields
 */
export interface OAuthRegistrationResult extends RegistrationResult {
  /** OAuth provider used for registration */
  provider?: 'google';
  /** OAuth provider user ID */
  providerId?: string;
  /** Indicates this was an OAuth registration */
  registrationMethod: 'oauth';
}

export interface RegistrationResult {
  success: boolean;
  user?: User;
  account?: Account;
  session?: Session;
  error?: string;
  accessCodeUsed?: boolean;
  registrationMethod?: 'access_code' | 'oauth' | 'standard';
}

// Error handling types (REQ-019)
export enum ErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  USER_ALREADY_REGISTERED = 'USER_ALREADY_REGISTERED',
  INVALID_ACCESS_CODE = 'INVALID_ACCESS_CODE',
  EMAIL_MISMATCH = 'EMAIL_MISMATCH',
  NETWORK_ERROR = 'NETWORK_ERROR',
  // OAuth-specific error codes (REQ-020 Task 4.3)
  OAUTH_SESSION_EXPIRED = 'OAUTH_SESSION_EXPIRED',
  OAUTH_REGISTRATION_CONFLICT = 'OAUTH_REGISTRATION_CONFLICT',
  OAUTH_AUTHENTICATION_FAILED = 'OAUTH_AUTHENTICATION_FAILED'
}

export interface UserFriendlyError {
  code: ErrorCode;
  message: string;
  actionable: boolean;
  nextSteps?: string;
}

// HTTP status code to user-friendly error mapping
export const HTTP_ERROR_MAPPING: Record<number, Omit<UserFriendlyError, 'code'>> = {
  409: {
    message: "User already registered - please try logging in instead",
    actionable: true,
    nextSteps: "Click 'Go to Login' to access your account"
  },
  404: {
    message: "Invalid access code or email - please check your invitation",
    actionable: true,
    nextSteps: "Verify your access code and email, or request a new invitation"
  },
  400: {
    message: "Please check that all required fields are filled correctly",
    actionable: true,
    nextSteps: "Review your input and fix any validation errors"
  },
  500: {
    message: "Something went wrong on our end - please try again later",
    actionable: false,
    nextSteps: "If the problem persists, please contact support"
  },
  // OAuth-specific error codes (REQ-020 Task 4.3)
  401: {
    message: "Session expired - please sign in with Google again",
    actionable: true,
    nextSteps: "Click 'Continue with Google' to restart the OAuth process"
  }
};

// Admin types
export * from './admin';

// Locale/i18n types (REQ-250)
export type {
  SupportedLanguage,
  LocaleOption,
  LocaleChangeResult,
  LocaleContextValue,
} from '@/contexts/LocaleContext';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/contexts/LocaleContext';

// Content Translation types (Epic 3 - Dynamic Content Translation)
export type {
  EntityType as ContentEntityType,
  TranslationTrigger,
  ContentToTranslate,
  TranslatableField,
  QueueTranslationOptions,
  QueueTranslationResult,
  LanguageTranslationStatus,
  TranslationStatusResult,
  EntityTranslationStatus,
  TranslationContextKey,
} from '@/lib/content-translation';

export { TRANSLATION_CONTEXTS } from '@/lib/content-translation';
