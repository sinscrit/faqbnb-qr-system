export type ReactionType = 'like' | 'dislike' | 'love' | 'confused';

export interface ReactionEntry {
  id: string;
  itemId: string;
  reactionType: ReactionType;
  ipAddress?: string;
  sessionId?: string;
  createdAt: string;
}

export interface ReactionCounts {
  like: number;
  dislike: number;
  love: number;
  confused: number;
  total: number;
}

export interface ReactionResponse {
  success: boolean;
  data?: ReactionCounts;
  error?: string;
}

export interface ReactionSubmissionRequest {
  itemId: string;
  reactionType: ReactionType;
  sessionId: string;
} 