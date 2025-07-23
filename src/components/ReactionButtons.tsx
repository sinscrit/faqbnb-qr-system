'use client';

import { useState, useEffect } from 'react';
import { ReactionCounts, ReactionType } from '@/types/reactions';
import { getSessionId } from '@/lib/session';
import { reactionsApi } from '@/lib/api';

interface ReactionButtonsProps {
  itemId: string;
  initialCounts?: ReactionCounts;
  onReactionChange?: (counts: ReactionCounts) => void;
}

interface ReactionButton {
  type: ReactionType;
  icon: string;
  label: string;
  hoverColor: string;
  activeColor: string;
}

const REACTION_BUTTONS: ReactionButton[] = [
  {
    type: 'like',
    icon: '👍',
    label: 'Like',
    hoverColor: 'hover:bg-green-50 hover:text-green-600',
    activeColor: 'bg-green-100 text-green-600 border-green-300'
  },
  {
    type: 'love',
    icon: '❤️',
    label: 'Love',
    hoverColor: 'hover:bg-red-50 hover:text-red-600',
    activeColor: 'bg-red-100 text-red-600 border-red-300'
  },
  {
    type: 'confused',
    icon: '😕',
    label: 'Confused',
    hoverColor: 'hover:bg-yellow-50 hover:text-yellow-600',
    activeColor: 'bg-yellow-100 text-yellow-600 border-yellow-300'
  },
  {
    type: 'dislike',
    icon: '👎',
    label: 'Dislike',
    hoverColor: 'hover:bg-gray-50 hover:text-gray-600',
    activeColor: 'bg-gray-100 text-gray-600 border-gray-300'
  }
];

export default function ReactionButtons({ itemId, initialCounts, onReactionChange }: ReactionButtonsProps) {
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts || {
    like: 0,
    dislike: 0,
    love: 0,
    confused: 0,
    total: 0
  });
  
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<ReactionType, boolean>>({
    like: false,
    dislike: false,
    love: false,
    confused: false
  });
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session ID
  useEffect(() => {
    try {
      const id = getSessionId();
      setSessionId(id);
    } catch (error) {
      console.error('Failed to get session ID:', error);
      setError('Failed to initialize session');
    }
  }, []);

  // Load initial reaction counts
  useEffect(() => {
    const loadReactionCounts = async () => {
      if (!itemId) return;

      try {
        // Get item's public ID for the API call
        // Note: This assumes itemId is actually publicId, or we need to convert it
        const response = await reactionsApi.getReactionCounts(itemId);
        
        if (response.success && response.data) {
          setCounts(response.data);
          if (onReactionChange) {
            onReactionChange(response.data);
          }
        }
      } catch (error) {
        console.error('Failed to load reaction counts:', error);
        // Don't show error to user for initial load failure
      }
    };

    if (!initialCounts) {
      loadReactionCounts();
    }
  }, [itemId, initialCounts, onReactionChange]);

  // Check if user has an existing reaction stored locally
  useEffect(() => {
    if (!sessionId || !itemId) return;

    const reactionKey = `faqbnb_reaction_${itemId}_${sessionId}`;
    const storedReaction = localStorage.getItem(reactionKey);
    
    if (storedReaction && ['like', 'dislike', 'love', 'confused'].includes(storedReaction)) {
      setUserReaction(storedReaction as ReactionType);
    }
  }, [sessionId, itemId]);

  const setLoading = (type: ReactionType, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [type]: loading }));
  };

  const updateLocalReaction = (reactionType: ReactionType | null) => {
    if (!sessionId || !itemId) return;

    const reactionKey = `faqbnb_reaction_${itemId}_${sessionId}`;
    
    if (reactionType) {
      localStorage.setItem(reactionKey, reactionType);
    } else {
      localStorage.removeItem(reactionKey);
    }
    
    setUserReaction(reactionType);
  };

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!sessionId) {
      setError('Session not initialized');
      return;
    }

    setError(null);
    setLoading(reactionType, true);

    try {
      let response;

      if (userReaction === reactionType) {
        // Remove existing reaction
        response = await reactionsApi.removeReaction(itemId, reactionType, sessionId);
        updateLocalReaction(null);
      } else {
        // Add new reaction (will automatically remove old one if exists)
        response = await reactionsApi.submitReaction({
          itemId,
          reactionType,
          sessionId
        });
        updateLocalReaction(reactionType);
      }

      if (response.success && response.data) {
        setCounts(response.data);
        if (onReactionChange) {
          onReactionChange(response.data);
        }
      } else {
        throw new Error(response.error || 'Failed to update reaction');
      }
    } catch (error) {
      console.error('Reaction update failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to update reaction');
      
      // Reset local state on error
      const reactionKey = `faqbnb_reaction_${itemId}_${sessionId}`;
      const storedReaction = localStorage.getItem(reactionKey);
      setUserReaction(storedReaction as ReactionType || null);
    } finally {
      setLoading(reactionType, false);
    }
  };

  return (
    <div className="reaction-buttons">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">How was this helpful?</h3>
        {counts.total > 0 && (
          <span className="text-xs text-gray-500">
            {counts.total} reaction{counts.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Reaction Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {REACTION_BUTTONS.map((button) => {
          const isActive = userReaction === button.type;
          const isLoading = loadingStates[button.type];
          const count = counts[button.type] || 0;

          return (
            <button
              key={button.type}
              onClick={() => handleReactionClick(button.type)}
              disabled={isLoading || !sessionId}
              className={`
                group relative flex flex-col items-center justify-center
                min-h-[60px] p-3 rounded-lg border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isActive 
                  ? button.activeColor
                  : `bg-white border-gray-200 ${button.hoverColor} hover:border-gray-300 hover:scale-105`
                }
                ${!sessionId ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={`${isActive ? 'Remove' : 'Add'} ${button.label} reaction`}
            >
              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {/* Reaction Icon */}
              <span className="text-xl mb-1 group-hover:scale-110 transition-transform duration-200">
                {button.icon}
              </span>

              {/* Reaction Label */}
              <span className="text-xs font-medium text-gray-600 group-hover:text-current transition-colors">
                {button.label}
              </span>

              {/* Count Badge */}
              {count > 0 && (
                <span className={`
                  absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center
                  text-xs font-semibold rounded-full
                  ${isActive 
                    ? 'bg-white text-gray-700 border border-current' 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {count}
                </span>
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-opacity-50 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">
          Your reaction helps improve our content
        </p>
      </div>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 p-2 bg-gray-50 rounded text-xs">
          <summary className="cursor-pointer font-mono text-gray-600">Debug Info</summary>
          <div className="mt-2 space-y-1 font-mono text-gray-600">
            <div>Item ID: {itemId}</div>
            <div>Session ID: {sessionId}</div>
            <div>User Reaction: {userReaction || 'none'}</div>
            <div>Counts: {JSON.stringify(counts)}</div>
            <div>Loading: {JSON.stringify(loadingStates)}</div>
          </div>
        </details>
      )}
    </div>
  );
} 