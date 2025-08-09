import { ReactionCounts } from './reactions';
import { Session } from '@supabase/supabase-js';
import { AccessRequest } from './admin';

// Database types
export interface Item {
  id: string;
  publicId: string;
  name: string;
  description: string | null;
  qrCodeUrl: string | null;
  qrCodeUploadedAt: string | null;
  propertyId: string; // NEW: Association with property
  createdAt: string;
  updatedAt: string;
}

// Multi-tenant account and user management types
export interface Account {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AccountUser {
  account_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_at: string;
  joined_at: string | null;
  created_at: string;
}

export type AccountRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  full_name: string | null;
  role: string | null;
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
  created_at: string | null;
  updated_at: string | null;
  // Populated relationships
  property_types?: PropertyType;
  users?: User;
}

export interface ItemLink {
  id: string;
  item_id: string;
  title: string;
  link_type: LinkType;
  url: string;
  thumbnail_url: string | null;
  display_order: number;
  created_at: string;
}

export type LinkType = 'youtube' | 'pdf' | 'image' | 'text';

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
      title: string;
      linkType: LinkType;
      url: string;
      thumbnailUrl?: string;
      displayOrder: number;
    }[];
  };
  error?: string;
  accountContext?: {
    accountId: string | null;
    accountRole: string;
  };
}

export interface ItemsListResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    qrCodeUrl?: string;
    createdAt: string;
    propertyId: string;
    property: any; // Property object with account info
    linksCount: number;
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

// Form types
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
  propertyId: string; // NEW: Required property association
  qrCodeUrl?: string;
  links: {
    title: string;
    linkType: LinkType;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
  }[];
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

