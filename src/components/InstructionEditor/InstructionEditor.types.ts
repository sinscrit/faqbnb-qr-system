// ArticleEditData - data loaded from API for editing
export interface ArticleEditData {
  articleId: string;
  itemId: string;
  purpose: string;
  title: string;
  description: string | null;
  item: {
    id: string;
    name: string;
    tags: string[];
  };
  links: ArticleLinkData[];
}

// ArticleLinkData - individual content piece from API
export interface ArticleLinkData {
  id: string;
  title: string;
  linkType: 'youtube' | 'pdf' | 'image' | 'text' | 'video' | 'url';
  url: string;
  thumbnailUrl: string | null;
  displayOrder: number;
}

// InstructionEditorProps - component props
export interface InstructionEditorProps {
  articleData: ArticleEditData;
  onSave: (data: UpdateArticlePayload) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

// UpdateArticlePayload - data sent to API on save
export interface UpdateArticlePayload {
  title: string;
  links: {
    id?: string;
    title: string;
    linkType: string;
    url: string;
    thumbnailUrl?: string;
    displayOrder: number;
    file?: File; // Present for newly uploaded files
  }[];
  itemTags?: string[]; // Optional: for updating item tags
}

// ContentPieceState - internal state for content pieces
export interface ContentPieceState {
  id: string;
  type: 'video' | 'photo' | 'pdf' | 'text' | 'url';
  title: string;
  url: string;
  thumbnailUrl: string | null;
  displayOrder: number;
  isNew?: boolean; // True for newly added content
  file?: File; // Present for newly uploaded files
}
