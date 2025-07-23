// Database types
export interface Item {
  id: string;
  public_id: string;
  name: string;
  description: string | null;
  qr_code_url: string | null;
  qr_code_uploaded_at: string | null;
  created_at: string;
  updated_at: string;
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
}

export interface ItemsListResponse {
  success: boolean;
  data?: {
    id: string;
    publicId: string;
    name: string;
    linksCount: number;
    qrCodeUrl?: string;
    createdAt: string;
  }[];
  error?: string;
}

// Form types
export interface CreateItemRequest {
  publicId: string;
  name: string;
  description: string;
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
  onSave: (item: CreateItemRequest | UpdateItemRequest) => Promise<void>;
  onCancel: () => void;
}

// Analytics types
export * from './analytics';

