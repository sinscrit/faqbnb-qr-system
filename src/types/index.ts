import { ReactionCounts } from './reactions';

// Database types
export interface Item {
  id: string;
  public_id: string;
  name: string;
  description: string | null;
  qr_code_url: string | null;
  qr_code_uploaded_at: string | null;
  property_id: string; // NEW: Association with property
  created_at: string;
  updated_at: string;
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
  full_name: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
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

// Analytics types
export * from './analytics';

// Reaction types
export * from './reactions';

